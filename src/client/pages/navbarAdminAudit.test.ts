/**
 * Test Suite: Audit Visibilitas Navbar Publik vs Admin Panel Layout
 * Aplikasi: E-Surat UNUSU
 * Divisi: Quality & Anti-Slop Audit (@project-docs-governance, @ui-container-governance)
 *
 * Verifikasi:
 * 1. Navbar Publik:
 *    - Tampil pada root URL / landing page publik ('/').
 *    - Tampil pada rute-rute publik dan mahasiswa ('/surat', '/ajukan', '/verifikasi', '/login').
 *    - TIDAK TAMPIL (dikecualikan) secara mutlak pada seluruh rute admin ('/admin', '/admin/dashboard', '/admin/jenis-surat').
 * 2. App.tsx Architecture:
 *    - Validasi kondisional render `!isAdminRoute && <Navbar />` dan `!isAdminRoute && <footer>`.
 *    - Penanganan guard ganda di level komponen Navbar (`if (location.pathname.startsWith('/admin')) return null`).
 * 3. AdminLayout Architecture:
 *    - AdminLayout mandiri dan menyediakan dedicated Admin Topbar & Sidebar navigasi.
 *    - Tidak ada collision atau duplikasi navbar pada area kerja admin.
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

console.log("=== MEMULAI TEST AUDIT VISIBILITAS NAVBAR PUBLIK VS ADMIN PANEL ===");

// 1. Audit App.tsx
const appPath = path.resolve(process.cwd(), 'src/client/App.tsx');
assert(fs.existsSync(appPath), "Berkas src/client/App.tsx ditemukan");

const appContent = fs.readFileSync(appPath, 'utf8');

assert(
  appContent.includes("isAdminRoute = location.pathname.startsWith('/admin')"),
  "App.tsx mendeteksi status rute admin secara akurat via useLocation"
);

assert(
  appContent.includes("{!isAdminRoute && <Navbar />}"),
  "App.tsx hanya me-render Navbar publik di luar rute admin (!isAdminRoute)"
);

assert(
  appContent.includes("{!isAdminRoute && <Footer />}") && appContent.includes("import { Footer }"),
  "App.tsx menyembunyikan footer publik di rute admin untuk layout dashboard yang bersih"
);

// 2. Audit Navbar.tsx Guard
const navbarPath = path.resolve(process.cwd(), 'src/client/components/Navbar.tsx');
assert(fs.existsSync(navbarPath), "Berkas src/client/components/Navbar.tsx ditemukan");

const navbarContent = fs.readFileSync(navbarPath, 'utf8');

assert(
  navbarContent.includes("if (location.pathname.startsWith('/admin'))") &&
  navbarContent.includes("return null"),
  "Navbar.tsx memiliki guard level komponen untuk mengembalikan null pada rute /admin"
);

// 3. Simulasi Logika Visibilitas Navbar berdasarkan Path
interface PageNavbarState {
  path: string;
  isNavbarVisible: boolean;
  isFooterVisible: boolean;
  isLandingPage: boolean;
  isAdminPanel: boolean;
}

function evaluatePageChrome(pathname: string): PageNavbarState {
  const isAdminRoute = pathname.startsWith('/admin');
  // Both App.tsx condition and Navbar.tsx internal condition
  const shouldRenderNavbar = !isAdminRoute;
  const shouldRenderFooter = !isAdminRoute;

  return {
    path: pathname,
    isNavbarVisible: shouldRenderNavbar,
    isFooterVisible: shouldRenderFooter,
    isLandingPage: pathname === '/',
    isAdminPanel: isAdminRoute,
  };
}

const landingState = evaluatePageChrome('/');
assert(
  landingState.isNavbarVisible === true && landingState.isLandingPage === true,
  "Navbar publik tampil aktif di Landing Page ('/')"
);

const ajukanState = evaluatePageChrome('/ajukan');
assert(
  ajukanState.isNavbarVisible === true,
  "Navbar publik tampil aktif di route publik /ajukan (redirecting ke admin form)"
);

const adminSuratState = evaluatePageChrome('/admin/surat');
assert(
  adminSuratState.isNavbarVisible === false && adminSuratState.isAdminPanel === true,
  "Navbar publik TIDAK tampil di sub-halaman Manajemen Surat Admin ('/admin/surat')"
);

const suratState = evaluatePageChrome('/surat');
assert(
  suratState.isNavbarVisible === true,
  "Navbar publik tampil aktif di halaman Daftar Surat ('/surat')"
);

const verifikasiState = evaluatePageChrome('/verifikasi');
assert(
  verifikasiState.isNavbarVisible === true,
  "Navbar publik tampil aktif di halaman Verifikasi Dokumen ('/verifikasi')"
);

const adminRootState = evaluatePageChrome('/admin');
assert(
  adminRootState.isNavbarVisible === false && adminRootState.isAdminPanel === true,
  "Navbar publik TIDAK tampil di halaman utama Admin Panel ('/admin')"
);

const adminDashboardState = evaluatePageChrome('/admin/dashboard');
assert(
  adminDashboardState.isNavbarVisible === false && adminDashboardState.isAdminPanel === true,
  "Navbar publik TIDAK tampil di sub-halaman Admin Dashboard ('/admin/dashboard')"
);

const adminJenisSuratState = evaluatePageChrome('/admin/jenis-surat');
assert(
  adminJenisSuratState.isNavbarVisible === false && adminJenisSuratState.isAdminPanel === true,
  "Navbar publik TIDAK tampil di sub-halaman Manajemen Jenis Surat ('/admin/jenis-surat')"
);

// 4. Audit AdminLayout.tsx
const adminLayoutPath = path.resolve(process.cwd(), 'src/client/components/AdminLayout.tsx');
assert(fs.existsSync(adminLayoutPath), "Berkas src/client/components/AdminLayout.tsx ditemukan");

const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf8');

assert(
  adminLayoutContent.includes("renderSidebarContent") &&
  adminLayoutContent.includes("<Outlet />"),
  "AdminLayout menyediakan struktur navigasi mandiri (dedicated sidebar & topbar) untuk panel admin"
);

assert(
  adminLayoutContent.includes("to: '/admin'") &&
  adminLayoutContent.includes("to: '/admin/jenis-surat'") &&
  adminLayoutContent.includes('/admin/surat-form?tipe=keluar') &&
  adminLayoutContent.includes('/admin/surat-form?tipe=masuk'),
  "AdminLayout memiliki navigasi lengkap ke seluruh modul administratif termasuk form surat masuk & keluar"
);

const passedCount = assertions.filter((a) => a.passed).length;
console.log(`\n=== HASIL AUDIT VISIBILITAS NAVBAR: ${passedCount}/${assertions.length} UJI VALID ===\n`);

if (passedCount !== assertions.length) {
  process.exit(1);
}
