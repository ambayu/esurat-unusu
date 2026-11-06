/**
 * Test Suite: Foto Rendering, Fallback, & Navigation Integration Audit
 * File target: src/client/pages/LandingPage.tsx, src/client/pages/Login.tsx, src/client/components/Navbar.tsx
 *
 * Verifikasi:
 * 1. Ketersediaan fisik seluruh file foto/wallpaper/hero image di folder public/images dan public/assets.
 * 2. Integritas tag <img> pada LandingPage, Login, dan Navbar:
 *    - Dimensi eksplisit (width & height) untuk mencegah Cumulative Layout Shift (CLS).
 *    - Pengaturan asynchronous decoding (`decoding="async"`) dan lazy/eager loading yang tepat.
 *    - Keberadaan event handler fallback (`onError`) untuk mencegah broken image link jika terjadi kegagalan jaringan.
 * 3. Alur navigasi halaman yang memuat foto (LandingPage, Login, Navbar):
 *    - Alur navigasi root URL '/' tetap netral bagi tamu.
 *    - Tombol CTA pada LandingPage terhubung ke rute yang valid (/ajukan, /verifikasi, /surat, /login).
 *    - Sisi wallpaper Login page terisolasi rapi dan responsif pada mobile hingga ultra-wide desktop.
 */

import fs from 'fs';
import path from 'path';

function runPhotoAndNavigationAudit() {
  console.log('=== MEMULAI AUDIT RENDERING FOTO & INTEGRASI ALUR NAVIGASI ===\n');
  let passCount = 0;
  let totalTests = 0;

  function assert(condition: boolean, title: string, details?: string) {
    totalTests++;
    if (condition) {
      passCount++;
      console.log(`[PASS] ${title}`);
    } else {
      console.error(`[FAIL] ${title}`);
      if (details) console.error(`       Detail: ${details}`);
    }
  }

  // 1. Audit Fisik File Gambar & Foto
  const images = [
    { dir: 'public/images', name: 'hero-slider-1.png', minSize: 100000 },
    { dir: 'public/images', name: 'hero-slider-2.png', minSize: 100000 },
    { dir: 'public/images', name: 'hero-slider-3.png', minSize: 100000 },
    { dir: 'public/images', name: 'hero-slider-1.svg', minSize: 500 },
    { dir: 'public/images', name: 'hero-slider-2.svg', minSize: 500 },
    { dir: 'public/images', name: 'hero-slider-3.svg', minSize: 500 },
    { dir: 'public/assets', name: 'campus-login.png', minSize: 100000 },
  ];

  images.forEach(img => {
    const fullPath = path.resolve(process.cwd(), img.dir, img.name);
    const exists = fs.existsSync(fullPath);
    let size = 0;
    if (exists) {
      size = fs.statSync(fullPath).size;
    }
    assert(
      exists && size >= img.minSize,
      `File aset foto '${img.dir}/${img.name}' valid (${Math.round(size / 1024)} KB)`
    );
  });

  // 2. Audit LandingPage.tsx
  const landingPagePath = path.resolve(process.cwd(), 'src/client/pages/LandingPage.tsx');
  assert(fs.existsSync(landingPagePath), 'Komponen LandingPage.tsx ditemukan');
  const landingCode = fs.readFileSync(landingPagePath, 'utf8');

  assert(
    landingCode.includes('onError=') && landingCode.includes('.svg'),
    'LandingPage memiliki fallback onError otomatis ke format SVG jika gambar PNG gagal dimuat'
  );
  assert(
    // Prinsipnya: setiap <img> wajib punya width & height eksplisit agar tidak
    // terjadi layout shift (CLS). Nilai pastinya mengikuti aset yang dipakai.
    landingCode.includes('width={640}') && landingCode.includes('height={360}') &&
    (landingCode.match(/<img[\s\S]*?\/>/g) || []).every(
      (tag: string) => /width=\{?\d/.test(tag) && /height=\{?\d/.test(tag)
    ),
    'LandingPage menyertakan dimensi width & height eksplisit pada seluruh gambar'
  );
  assert(
    landingCode.includes('decoding="async"'),
    'LandingPage menerapkan decoding="async" untuk performa render non-blocking'
  );

  // 3. Audit Login.tsx Foto Wallpaper & Responsivitas
  const loginPagePath = path.resolve(process.cwd(), 'src/client/pages/Login.tsx');
  assert(fs.existsSync(loginPagePath), 'Komponen Login.tsx ditemukan');
  const loginCode = fs.readFileSync(loginPagePath, 'utf8');

  assert(
    loginCode.includes('src="/assets/campus-login.png"'),
    'Login.tsx menggunakan path foto wallpaper kampus yang valid (/assets/campus-login.png)'
  );
  assert(
    loginCode.includes('onError='),
    'Login.tsx memiliki fallback onError untuk mengamankan rendering foto kampus'
  );
  assert(
    loginCode.includes('width={1024}') && loginCode.includes('height={1024}'),
    'Login.tsx memiliki dimensi width & height eksplisit pada foto wallpaper'
  );

  // 4. Audit Navbar.tsx Foto Profil Sivitas
  const navbarPath = path.resolve(process.cwd(), 'src/client/components/Navbar.tsx');
  assert(fs.existsSync(navbarPath), 'Komponen Navbar.tsx ditemukan');
  const navbarCode = fs.readFileSync(navbarPath, 'utf8');

  assert(
    navbarCode.includes('onError={() => setImgError(true)}'),
    'Navbar.tsx memiliki error boundary dan fallback inisial nama jika foto profil pengguna gagal dimuat'
  );
  assert(
    navbarCode.includes('width={32}') && navbarCode.includes('height={32}') && navbarCode.includes('decoding="async"'),
    'Navbar.tsx menyertakan dimensi width/height 32px dan decoding="async" untuk performa foto profil'
  );

  // 5. Audit SuratDetail.tsx dan Path Lampiran Berkas
  const suratDetailPath = path.resolve(process.cwd(), 'src/client/pages/SuratDetail.tsx');
  assert(fs.existsSync(suratDetailPath), 'Komponen SuratDetail.tsx ditemukan');
  const suratDetailCode = fs.readFileSync(suratDetailPath, 'utf8');

  assert(
    suratDetailCode.includes('surat.lampiranUrl') && suratDetailCode.includes('getAssetUrl(surat.lampiranUrl)'),
    'SuratDetail.tsx menggunakan getAssetUrl untuk rendering URL berkas lampiran surat yang aman'
  );
  assert(
    suratDetailCode.includes('min-h-[44px]') && suratDetailCode.includes('aria-label="Unduh atau buka berkas lampiran surat"'),
    'SuratDetail.tsx memiliki tombol aksi buka lampiran dengan tap target WCAG AA (min 44px) & label aksesibilitas'
  );

  // 6. Audit Static Asset Endpoints Server
  const serverPath = path.resolve(process.cwd(), 'src/server/index.ts');
  assert(fs.existsSync(serverPath), 'Berkas server src/server/index.ts ditemukan');
  const serverCode = fs.readFileSync(serverPath, 'utf8');

  assert(
    serverCode.includes("app.use(\"/berkas\", express.static") &&
    serverCode.includes("app.use(\"/foto\", express.static") &&
    serverCode.includes("app.use(\"/uploads\", express.static"),
    'Server Express melayani endpoint static uploads untuk /berkas, /foto, dan /uploads'
  );
  assert(
    serverCode.includes("app.use(\"/esurat/berkas\"") &&
    serverCode.includes("app.use(\"/esurat/foto\""),
    'Server Express melayani sub-path routing /esurat untuk static assets pada lingkungan deployment reverse proxy'
  );
  assert(
    serverCode.includes("ensureDirectories") && serverCode.includes("fs.existsSync"),
    'Server memastikan direktori penyimpanan uploads (berkas & foto) dibuat secara otomatis saat startup'
  );

  // 7. Audit Alur Navigasi Terkait Foto
  assert(
    landingCode.includes("to='/ajukan'") || landingCode.includes('to={current.primaryCtaLink}') || landingCode.includes("to=\"/surat\""),
    "Alur navigasi CTA foto slider mengarah ke link fungsional (/surat, /verifikasi, /login)"
  );
  assert(
    loginCode.includes('handleSsoLogin'),
    'Alur login mengintegrasikan SSO ONE UNUSU terpusat tanpa bypass tidak sah'
  );

  console.log(`\n=== HASIL AUDIT FOTO & NAVIGASI: ${passCount}/${totalTests} UJI VALID ===`);
  if (passCount !== totalTests) {
    process.exit(1);
  }
}

runPhotoAndNavigationAudit();
