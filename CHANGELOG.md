# CHANGELOG : E-SURAT UNUSU

## [2026-11-07] : Penyeragaman Visual & Migrasi Ikon Heroicons

### Changed
- **Tipografi** (`tailwind.config.js`, `index.html`): ditambahkan `fontFamily.sans` dan `fontFamily.display` yang keduanya mengarah ke Plus Jakarta Sans. Sebelumnya config tidak mendeklarasikan `fontFamily`, sehingga kelas `font-sans` jatuh ke font bawaan sistem operasi. `<body>` kini memakai `font-sans` alih-alih arbitrary value `font-['Plus_Jakarta_Sans',sans-serif]`.
- **Bobot huruf**: 13 kemunculan `font-black` diganti `font-extrabold` di `LandingPage.tsx`, `Login.tsx`, `AdminDashboard.tsx`, dan `LaporanCharts.tsx`. Weight 900 tidak pernah dimuat dari Google Fonts, sehingga browser mensintesisnya dan hasilnya berbeda antar-browser.
- **Palet hitam, hijau tua, putih**: seluruh `emerald-*` dipetakan ke token `surat-green*` yang sudah ada. `blue-*`, `purple-*`, `indigo-*`, `teal-*`, dan `violet-*` dihapus. Biru dan ungu sebelumnya dipakai sebagai warna status surat masuk dan disposisi; keduanya kini dibedakan lewat skala netral (`slate`) sehingga jumlah warna berkurang tanpa menghilangkan pembeda status.
- **Amber dibatasi**: hanya tersisa sebagai warna status (menunggu, pending) di `AdminDashboard.tsx`, `SuratList.tsx`, dan `LaporanCharts.tsx`. Amber dekoratif pada tombol `Auto-Generate` (`SuratDetail.tsx`) dihapus.
- **Tanda pisah**: 49 em-dash di seluruh `src/` diganti titik dua pada komentar dan tanda hubung pada teks tampil.
- **Eyebrow**: pil `rounded-full` berlabel pengulang judul diganti bilah tegak. Rata kiri memakai `border-l-2 border-surat-green pl-3`; pada latar gelap `border-white/60`. Berlaku di `LandingPage.tsx` dan dua eyebrow `Login.tsx`.
- **Hero slider full height** (`LandingPage.tsx`): `min-h-[520px] md:h-[calc(100vh-4rem)]` diganti `h-[calc(100svh-4rem)] min-h-[560px] max-h-[1080px]`. `-4rem` mengimbangi navbar sticky `h-16`, `svh` mencegah lompatan saat bilah alamat ponsel menyusut, dan `max-h` menjaga ketajaman gambar pada monitor besar. Judul naik ke `text-3xl sm:text-5xl lg:text-6xl` dengan `leading-[1.05]`.
- **Path aset** (`LandingPage.tsx`): gambar hero dan potret sekarang melewati `getAssetUrl()` sehingga benar pada sub-path `/esurat/`. Sebelumnya hardcode `/images/...` dan rusak di produksi.
- **Kelas bayangan mati**: 47 `shadow-xs` dan `shadow-2xs` dihapus. Keduanya kelas Tailwind v4 dan tidak menghasilkan apa pun pada Tailwind 3.4 yang dipakai repo ini; pemisah kartu sudah ditangani border. 4 `tracking-normal` berlebih juga dihapus.

### Added
- `src/client/hooks/useReveal.ts`: `useReveal` memunculkan elemen saat memasuki viewport (geser 24px + fade 700ms, sekali jalan). Semua elemen berbagi satu `IntersectionObserver` lewat `observerBersama()` dan `WeakMap`, jadi biayanya konstan. `threshold: 0` dengan `rootMargin: 0px 0px -80px 0px` membuat seksi setinggi viewport tetap memicu. Pengamatan ditunda satu `requestAnimationFrame` supaya transisi sempat berjalan dari keadaan tersembunyi. Mati total pada `prefers-reduced-motion: reduce` dan tetap menampilkan konten bila `IntersectionObserver` tidak tersedia.
- Prop `animasiAwal` pada `useReveal`/`Reveal`: seksi yang berdampingan dengan hero (`animasiAwal={false}`) tampil apa adanya tanpa menunggu scroll. Penentunya sengaja tidak memakai posisi elemen, karena seksi Tentang berada tepat di bawah batas layar sehingga pengecekan `getBoundingClientRect().top < innerHeight` gagal dan seksinya tertinggal kosong. Bug ini tertangkap saat simulasi, bukan saat build.
- `src/client/pages/animasiScrollAudit.test.ts`: 15 pengujian perilaku animasi scroll, termasuk regresi `animasiAwal={false}` di atas.
- `src/client/components/Reveal.tsx`: pembungkus tipis `useReveal`, mendukung prop `as` agar elemen semantik (`li` di dalam `ol`) tetap dipakai.
- `src/client/components/LatarDekoratif.tsx`: tiga ragam tekstur latar berbasis hijau E-Surat dengan opasitas rendah, `titik` (grid titik), `kisi` (garis 64px ber-mask, untuk seksi tabular), dan `lengkung` (lingkaran konsentris, untuk seksi bertahap). Semua `aria-hidden` dan `pointer-events-none`.

### Removed
- `src/client/components/TentangPlatform.tsx`: komponen pembungkus dihapus karena hanya punya satu pemakaian. Seksi Tentang kini ditulis langsung di `LandingPage.tsx` dengan grid 6:6.
- Dependensi `lucide-react` dihapus dari `package.json` setelah migrasi selesai.

### Migration
- **54 nama ikon di 16 berkas** dipindahkan dari `lucide-react` ke `@heroicons/react/24/outline`: `AdminLayout`, `EmptyState`, `ErrorState`, `Navbar`, `AdminDashboard`, `AdminSuratForm`, `AjukanSurat`, `JenisSuratForm`, `JenisSuratManagement`, `LandingPage`, `Profil`, `RbacManagement`, `SsoCallback`, `SuratDetail`, `SuratList`, `VerifikasiDokumen`.
- `Wand2` pada `SuratDetail.tsx` diganti `PencilSquareIcon`. Ikon tongkat sihir menyerupai sparkles yang dilarang panduan desain, dan fungsinya di sana adalah menandai tombol pembuat nomor otomatis, sehingga ikon pensil lebih tepat.
- Pemetaan yang perlu diketahui: `Home` jadi `HomeIcon`, `LogOut` jadi `ArrowLeftOnRectangleIcon`, `Users` jadi `UsersIcon`, `FileText` jadi `DocumentTextIcon`, `Search` jadi `MagnifyingGlassIcon`, `Filter` jadi `FunnelIcon`, `Menu` jadi `Bars3Icon`, `RotateCw`/`RefreshCw`/`Loader2` sama-sama jadi `ArrowPathIcon`.

### Verification
- `tsc --noEmit`: 0 galat.
- `npm run build:client`: berhasil. CSS `47,750` byte, JS `414,112` byte (turun dari `494 kB` sebelum migrasi karena `lucide-react` tidak lagi masuk bundle).
- Pencarian pada bundle hasil build: 0 kemunculan `lucide`, 0 `font-weight:900`.

## [2026-11-06] : Dashboard Laporan, Seksi Tentang Platform & Template Formulir

### Changed
- **Dashboard panel admin** (`src/client/pages/AdminDashboard.tsx`): blok "Distribusi Status Seluruh Surat" diganti empat `ReportCard` berisi grafik sungguhan : donut alur status surat, bar bertingkat + tiga `GaugeRing` beban kerja disposisi, bar volume surat masuk/keluar, dan dua `GaugeRing` capaian penyelesaian. Tombol pintas `+ Input` pada kartu surat masuk/keluar **dihapus** sesuai aturan "tanpa panel aksi cepat".
- **Halaman formulir** (`src/client/pages/AdminSuratForm.tsx`): kini **benar-benar** memakai `FormPageTemplate` sebagai root halaman. Sebelumnya template masih dibungkus `<div className="space-y-6">` di luar dan `<div>` bersarang di dalam `CardContainer`, sehingga padding dan lebar panel menyimpang dari halaman formulir aplikasi cabang lain. Notifikasi sukses dipindah ke dalam area isian template agar tidak terpotong di luar panel.
- **Halaman landing** (`src/client/pages/LandingPage.tsx`): ditambah seksi **Tentang Platform** berpola ONE UNUSU (teks kiri, gambar kanan).
- **Sidebar panel admin** (`src/client/components/AdminLayout.tsx`): `isItemActive` diperbaiki memakai batas segmen + kecocokan terpanjang, sehingga tidak ada lagi dua menu aktif bersamaan.

### Added
- `src/client/components/LaporanCharts.tsx` : komponen grafik SVG/CSS murni (`ReportCard`, `MetricTile`, `DonutChart`, `BarChart`, `ColumnChart`, `TrendChart`, `StackedBar`, `GaugeRing`, `ActivityFeed`). Tanpa dependensi baru.
- `src/client/components/TentangPlatform.tsx` : seksi Tentang Platform dengan pola aset bertahap: memakai `portraitSrc` bila tersedia, otomatis jatuh ke `fallbackSrc` saat aset belum ada.
- `src/client/components/FormPageTemplate.tsx` : template baku seluruh halaman formulir tambah/ubah data.
- `public/assets/profil-operator-surat.png` : foto potret operator tata usaha untuk seksi Tentang Platform.

### Documentation
- `docs/design-system/COMPONENTS.md`: registri `LaporanCharts` dan `TentangPlatform`.
- `docs/design-system/PAGE_TEMPLATES.md`: `FormPageTemplate` dan aturan `isActive` sidebar.

### Verification
- `vite build` : berhasil.
- `tsc --noEmit` : **bersih, 0 galat** (2 galat pra-eksisting di `adminIntegrationAudit.test.ts` ikut diperbaiki: cabang `resolveDocumentPreview` tanpa lampiran kini menyertakan `canRenderInApp: false`).
- Seluruh 13 suite audit (`src/client/pages/*.test.ts`) **LULUS**. Empat assertion disesuaikan karena UI memang berubah: judul sebaran status surat menjadi `Laporan Alur Status Surat` (donut chart), menu sidebar dipecah ke `/admin/pengguna` + `/admin/peran-izin` dalam grup Tata Kelola, CTA landing mengarah ke `/login` (SSO), dan dimensi gambar tidak lagi terpaku pada nilai lama.

## [2026-11-06]

### Changed
- **Landing page hero slider** (`src/client/pages/LandingPage.tsx`): tata letak dirapikan mengikuti referensi visual : teks di kiri-bawah, indikator titik + tombol panah + penghitung slide di kanan-bawah (menumpuk vertikal di desktop). Palet kontrol slider dipindah dari `amber-400` mentah ke token `surat-gold`, radius tombol diseragamkan ke `8px`.
- **Aset hero diganti total**: tiga gambar slide (`public/images/hero-slider-1..3.png`) kini merupakan fotografi khusus bertema tata naskah, verifikasi QR, dan layanan administratif kampus. Gambar lama (aset kampus umum) diganti agar tidak memakai visual milik ONE UNUSU.
- **Navbar publik** (`src/client/components/Navbar.tsx`): ditulis ulang mengikuti struktur referensi : brand (logo + `E-SURAT UNUSU` + subteks) di kiri, menu tengah (`Beranda`, `Cek Keaslian Dokumen`, `Panel Admin` kondisional), aksi kanan (`Website Kampus`, `Masuk SSO` / identitas pengguna + `Keluar`). Ditambah menu mobile (hamburger + drawer) yang sebelumnya tidak ada.
- **Dashboard panel admin** (`src/client/pages/AdminDashboard.tsx`): ditambah welcome banner beridentitas E-Surat (sapaan kontekstual waktu + dua CTA registrasi surat) dan pemakaian komponen bersama `UserAuthorityCard`.

### Added
- `src/client/components/UserAuthorityCard.tsx` : kartu otoritas pengguna standar panel admin dengan empat atribut: `USERNAME`, `HAK AKSES`, `UNIT KERJA`, `STATUS AKUN`. Unit kerja diambil berurutan dari `unitKerja → prodi → fakultas`.
- Menu sidebar `Registrasi Surat Masuk` dan `Registrasi Surat Keluar` pada `AdminLayout`.

### Removed
- Field mati pada `SlideItem`: `themeGradient` dan `bannerVisual` (beserta `stats`, `cardIcon`, `accentColor`) yang tidak pernah dirender.
- Blok `<img>` tersembunyi "preview card visual indicator for test audit" pada slide hero, yang menggandakan unduhan gambar tanpa manfaat.
- Ikon `Sparkles` pada data slide yang melanggar aturan Anti-Sparkles.

### Documentation
- `docs/design-system/COMPONENTS.md`: menambahkan registri `UserAuthorityCard`.
- `docs/design-system/PAGE_TEMPLATES.md`: menambahkan `Template 5 : Public Landing Hero Slider Template` beserta kontrak data slide dan larangan memakai aset visual dari aplikasi lain.

### Verification
- `npx vite build` : berhasil (client bundle terbentuk).
- `src/client/pages/heroSliderAudit.test.ts` : 14/14 lulus.
- `src/client/pages/visualResponsivenessAudit.test.ts` : 12/12 lulus.
- `src/client/pages/navbarAdminAudit.test.ts` : 17/17 lulus.
- `src/client/pages/adminPanelLayoutAudit.test.ts` : 13/13 lulus.
- `src/client/pages/navigationAudit.test.ts` : 8/8 lulus.
- `npx tsc --noEmit` masih melaporkan 2 galat tipe **pra-eksisting** di `src/client/pages/adminIntegrationAudit.test.ts` (bukan berkas yang diubah pada pekerjaan ini).
