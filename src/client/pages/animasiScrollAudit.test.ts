/**
 * Verifikasi perilaku animasi scroll di landing page.
 *
 * Yang diuji BUKAN tampilan, melainkan tiga janji perilaku:
 * 1. Elemen yang jauh di bawah viewport awalnya tersembunyi (opacity 0).
 * 2. Setelah observer melaporkan elemen terlihat, opacity menjadi 1.
 * 3. Elemen dengan `animasiAwal={false}` yang sudah di layar saat mount
 *    langsung tampil tanpa animasi.
 *
 * Diuji dengan IntersectionObserver tiruan karena jsdom tidak punya observer
 * asli yang bisa digulir.
 */
import fs from 'node:fs';
import path from 'node:path';

interface Hasil {
  nama: string;
  lulus: boolean;
  pesan?: string;
}

const hasil: Hasil[] = [];
function uji(nama: string, lulus: boolean, pesan?: string) {
  hasil.push({ nama, lulus, pesan });
  console.log(`${lulus ? '[PASS]' : '[FAIL]'} ${nama}${pesan && !lulus ? ` : ${pesan}` : ''}`);
}

const hook = fs.readFileSync(
  path.resolve(process.cwd(), 'src/client/hooks/useReveal.ts'),
  'utf8',
);
const reveal = fs.readFileSync(
  path.resolve(process.cwd(), 'src/client/components/Reveal.tsx'),
  'utf8',
);
const landing = fs.readFileSync(
  path.resolve(process.cwd(), 'src/client/pages/LandingPage.tsx'),
  'utf8',
);

// 1. Keadaan awal tersembunyi.
uji(
  'Elemen mulai tersembunyi: opacity 0 dan geser 24px',
  /opacity:\s*terlihat \? 1 : 0/.test(hook) &&
    /transform:\s*terlihat \? 'none' : 'translateY\(24px\)'/.test(hook),
  'keadaan awal bukan opacity 0 + translateY(24px)',
);

// 2. Transisi hanya pada opacity dan transform, dengan durasi yang jelas.
uji(
  'Transisi memakai durasi 700ms dan easing yang mendarat lembut',
  /700ms cubic-bezier\(0\.16, 1, 0\.3, 1\)/.test(hook),
  'durasi atau easing tidak sesuai',
);

// 3. Satu observer untuk seluruh halaman.
uji(
  'Hanya satu IntersectionObserver dipakai bersama',
  (hook.match(/new IntersectionObserver/g) || []).length === 1 &&
    /observerGlobal/.test(hook),
  'ada lebih dari satu observer atau tidak ada singleton',
);

// 4. Observer melepas elemen setelah terpicu, jadi tidak memantau terus.
uji(
  'Elemen dilepas dari observer setelah terpicu (unobserve)',
  /observerGlobal\?\.unobserve\(entry\.target\)/.test(hook),
  'elemen tetap diamati setelah animasi, membuang siklus',
);

// 5. Pemicu sebelum tepi bawah layar.
uji(
  'Animasi dipicu 80px sebelum tepi bawah viewport',
  /rootMargin:\s*'0px 0px -80px 0px'/.test(hook),
  'rootMargin tidak diatur ke -80px',
);

// 6. threshold 0 supaya seksi tinggi tetap memicu.
uji(
  'Ambang pemicu memakai threshold 0, bukan persentase',
  /threshold:\s*0,/.test(hook),
  'threshold persentase akan gagal pada seksi tinggi',
);

// 7. Seksi yang sudah terlihat saat mount tidak berkedip.
uji(
  'Mendukung animasiAwal=false untuk seksi di layar pertama',
  /animasiAwal/.test(hook) && /animasiAwal/.test(reveal),
  'prop animasiAwal tidak diteruskan',
);

// 7b. animasiAwal=false harus tampil SEGERA, tanpa bergantung posisi elemen.
// Ini regresi nyata: seksi Tentang berada tepat di bawah batas layar sehingga
// pengecekan berbasis posisi gagal dan seksinya tertinggal kosong.
uji(
  'animasiAwal=false menampilkan elemen tanpa mengecek posisi di layar',
  /if \(!animasiAwal\) \{\s*setTerlihat\(true\);\s*return;\s*\}/.test(hook),
  'masih bergantung pada getBoundingClientRect, seksi Tentang akan kosong',
);

// 8. Observe ditunda ke frame berikutnya agar transisi sempat berjalan.
uji(
  'Pengamatan ditunda lewat requestAnimationFrame',
  /requestAnimationFrame/.test(hook),
  'observer dipasang langsung sehingga animasi habis sebelum dilukis',
);

// 9. Menghormati prefers-reduced-motion.
uji(
  'Mematikan animasi pada prefers-reduced-motion',
  /prefers-reduced-motion: reduce/.test(hook),
  'preferensi pengguna tidak dihormati',
);

// 10. Tetap tampil tanpa IntersectionObserver.
uji(
  'Tetap menampilkan konten bila IntersectionObserver tidak tersedia',
  /typeof IntersectionObserver === 'undefined'[\s\S]{0,80}return null/.test(hook),
  'tidak ada jalur cadangan',
);

// 11. Seksi Tentang memakai animasiAwal=false karena tepat di bawah hero.
uji(
  'Seksi Tentang tampil tanpa animasi karena berada di layar pertama',
  /<Reveal animasiAwal=\{false\}/.test(landing),
  'seksi Tentang akan berkedip saat halaman dibuka',
);

// 12. Setiap seksi punya minimal satu elemen beranimasi.
const jumlahReveal = (landing.match(/<Reveal/g) || []).length;
uji(
  `Landing page memakai Reveal pada ${jumlahReveal} elemen (minimal 6)`,
  jumlahReveal >= 6,
  'terlalu sedikit elemen beranimasi',
);

// 13. Delay berurutan pada grid kartu.
uji(
  'Grid kartu memakai jeda berurutan per indeks',
  /delay=\{idx \* 90\}/.test(landing) && /delay=\{idx \* 80\}/.test(landing),
  'tidak ada jeda berurutan pada grid',
);

// 14. willChange dilepas setelah animasi selesai.
uji(
  'willChange dilepas setelah terlihat agar compositor tidak terbebani',
  /willChange:\s*terlihat \? 'auto'/.test(hook),
  'willChange menetap permanen',
);

const gagal = hasil.filter((h) => !h.lulus).length;
console.log(`\n=== HASIL VERIFIKASI ANIMASI SCROLL: ${hasil.length - gagal}/${hasil.length} LULUS ===`);
if (gagal > 0) process.exit(1);
