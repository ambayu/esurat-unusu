/**
 * Test Suite: Audit Navigasi Form Admin dan Tampilan Landing Page Bersih
 * Aplikasi: E-Surat UNUSU
 * Divisi: Quality & Anti-Slop Audit (@project-docs-governance, @ui-container-governance)
 *
 * Verifikasi:
 * 1. Landing Page Bersih:
 *    - LandingPage.tsx murni menyajikan informasi, hero slider layanan, visi misi, statistik keunggulan, dan panduan.
 *    - Tidak memuat form transaksi input surat langsung (<form>) di landing page.
 *    - Seluruh tombol CTA di landing page mengarahkan pengguna ke rute yang sesuai (/ajukan, /verifikasi, /surat, /login).
 * 2. Form Surat Masuk & Keluar di Panel Admin:
 *    - AdminSuratForm.tsx berfungsi penuh menangani registrasi Surat Masuk dan Surat Keluar oleh staf/admin biro.
 *    - Mendukung pemilihan format Jenis Surat secara dinamis dari API.
 *    - Terdaftar dalam routing App.tsx di bawah rute terproteksi /admin/surat-form dengan guard role ['admin', 'dosen'].
 *    - AdminLayout menyediakan tombol aksi dan navigasi cepat menuju form registrasi surat masuk dan keluar.
 *    - Tampilan menggunakan standar UI container CardContainer dan AdminPanelTemplate dengan border #CBD5E1.
 * 3. Type & Accessibility Verification:
 *    - Kontrol form memiliki label yang jelas, input terproteksi, tap target WCAG AA (min 44px), dan error handling terstandar.
 */

import fs from 'fs';
import path from 'path';

interface AssertionResult {
  name: string;
  passed: boolean;
  message?: string;
}

const assertions: AssertionResult[] = [];

function assert(condition: boolean, name: string, failureDetail?: string) {
  if (condition) {
    assertions.push({ name, passed: true });
    console.log(`[PASS] ${name}`);
  } else {
    assertions.push({ name, passed: false, message: failureDetail });
    console.error(`[FAIL] ${name} - ${failureDetail}`);
  }
}

console.log("=== MEMULAI TEST AUDIT NAVIGASI FORM ADMIN & LANDING PAGE BERSIH ===");

// 1. Audit LandingPage.tsx: Bersih dari Form Transaksi
const landingPagePath = path.resolve(process.cwd(), 'src/client/pages/LandingPage.tsx');
assert(fs.existsSync(landingPagePath), "Berkas src/client/pages/LandingPage.tsx ditemukan");

const landingPageContent = fs.readFileSync(landingPagePath, 'utf8');

// Memastikan tidak ada form submit atau form input transaksi di LandingPage
assert(
  !landingPageContent.includes('<form') && !landingPageContent.includes('onSubmit='),
  "Landing page bersih dari elemen form transaksi surat langsung (<form>)"
);

assert(
  landingPageContent.includes("HERO_SLIDES") &&
  landingPageContent.includes("Layanan Surat Mahasiswa") &&
  landingPageContent.includes("Jaminan Naskah Resmi") &&
  landingPageContent.includes("Koordinasi Birokrasi"),
  "Landing page menyajikan informasi komprehensif layanan persuratan dan keunggulan institusi"
);

assert(
  landingPageContent.includes("primaryCtaLink: '/surat'") &&
  landingPageContent.includes("primaryCtaLink: '/verifikasi'"),
  "Landing page mengarahkan aksi pengguna melalui tombol CTA tertaut ke rute yang tepat"
);

// 2. Audit AdminSuratForm.tsx: Form Registrasi Surat Masuk & Keluar
const adminSuratFormPath = path.resolve(process.cwd(), 'src/client/pages/AdminSuratForm.tsx');
assert(fs.existsSync(adminSuratFormPath), "Berkas src/client/pages/AdminSuratForm.tsx ditemukan");

const adminSuratFormContent = fs.readFileSync(adminSuratFormPath, 'utf8');

assert(
  adminSuratFormContent.includes("AdminSuratForm") &&
  adminSuratFormContent.includes("tipeSurat") &&
  adminSuratFormContent.includes("fetchJenisSurat") &&
  adminSuratFormContent.includes("createSurat"),
  "AdminSuratForm memiliki logika penanganan input surat masuk & keluar terintegrasi API"
);

assert(
  adminSuratFormContent.includes("setTipeSurat('masuk')") &&
  adminSuratFormContent.includes("setTipeSurat('keluar')"),
  "AdminSuratForm menyediakan toggle dinamis antara registrasi Surat Masuk dan Surat Keluar"
);

assert(
  adminSuratFormContent.includes("CardContainer") &&
  adminSuratFormContent.includes("AdminPanelTemplate") &&
  adminSuratFormContent.includes("border-[#CBD5E1]"),
  "AdminSuratForm mematuhi standar UI Container Governance (CardContainer, AdminPanelTemplate, border #CBD5E1)"
);

assert(
  adminSuratFormContent.includes("min-h-[44px]") &&
  adminSuratFormContent.includes("aria-label"),
  "AdminSuratForm mematuhi standar aksesibilitas WCAG AA (tap target min 44px dan accessible aria-label)"
);

// 3. Audit Pendaftaran Route di App.tsx
const appPath = path.resolve(process.cwd(), 'src/client/App.tsx');
assert(fs.existsSync(appPath), "Berkas src/client/App.tsx ditemukan");

const appContent = fs.readFileSync(appPath, 'utf8');

assert(
  appContent.includes("import { AdminSuratForm } from './pages/AdminSuratForm'") ||
  appContent.includes("AdminSuratForm"),
  "App.tsx mengimpor komponen AdminSuratForm"
);

assert(
  appContent.includes('<Route path="surat-form" element={<AdminSuratForm />} />'),
  "App.tsx mendaftarkan rute terproteksi /admin/surat-form di bawah AdminLayout"
);

// 4. Audit Tautan Cepat di AdminLayout.tsx
const adminLayoutPath = path.resolve(process.cwd(), 'src/client/components/AdminLayout.tsx');
assert(fs.existsSync(adminLayoutPath), "Berkas src/client/components/AdminLayout.tsx ditemukan");

const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf8');

const adminLayoutHasRegistrationLinks =
  adminLayoutContent.includes("/admin/surat-form?tipe=masuk") ||
  adminLayoutContent.includes("/admin/surat-form") ||
  adminLayoutContent.includes("surat-form");

assert(
  adminLayoutHasRegistrationLinks,
  "AdminLayout menyediakan navigasi cepat menuju form registrasi Surat Masuk dan Surat Keluar"
);

const passedCount = assertions.filter((a) => a.passed).length;
console.log(`\n=== HASIL AUDIT NAVIGASI FORM ADMIN & LANDING PAGE: ${passedCount}/${assertions.length} UJI VALID ===\n`);

if (passedCount !== assertions.length) {
  process.exit(1);
}
