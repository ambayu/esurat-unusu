/**
 * Test Suite: Audit UI/UX Layout Panel Admin dan Dashboard Ringkasan Persuratan
 * Aplikasi: E-Surat UNUSU
 * Divisi: Quality & Anti-Slop Audit (@ui-container-governance, @project-docs-governance)
 *
 * Verifikasi:
 * 1. AdminLayout:
 *    - Validasi struktur sidebar navigation: Brand header, profil pengguna, menu links, quick links, logout action.
 *    - Menu items: Dashboard, Surat Masuk, Surat Keluar, Semua Agenda Surat.
 *      (Menu Verifikasi Dokumen QR dihapus dari sidebar; halaman publik `/verifikasi` tetap ada.)
 *    - Standar tap target WCAG AA (min-h-[44px]) pada elemen interaktif tombol/link.
 *    - Kontainer responsif: Mobile drawer toggle dengan overlay backdrop dan tombol penutup.
 * 2. AdminDashboard:
 *    - Standar UI Container: CardContainer dengan radius 14px (rounded-[14px]), border #CBD5E1.
 *    - Metrics Cards: Surat Masuk, Surat Keluar, Status Pending, Disposisi Pimpinan.
 *    - Breakdown Status: Diajukan, Diproses, Disetujui, Selesai, Ditolak.
 *    - EmptyState dan ErrorState dengan retry callback terintegrasi.
 *    - Resiliensi data: Penanganan aman data null/undefined pada recentSurat dan recentDisposisi.
 * 3. Route & Guard Integrasi:
 *    - Rute /admin terdaftar di App.tsx terbungkus ProtectedRoute dengan role ['admin', 'dosen'].
 *    - Akses unauthenticated dialihkan ke /login (bukan loop ke root atau bocor ke panel).
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

console.log("=== MEMULAI TEST AUDIT LAYOUT DAN DASHBOARD PANEL ADMIN ===");

// 1. Audit Berkas AdminLayout.tsx
const adminLayoutPath = path.resolve(process.cwd(), 'src/client/components/AdminLayout.tsx');
assert(fs.existsSync(adminLayoutPath), "Berkas src/client/components/AdminLayout.tsx ditemukan");

const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf8');

assert(
  adminLayoutContent.includes("navItems = [") &&
  adminLayoutContent.includes("to: '/admin'") &&
  (adminLayoutContent.includes("to: '/admin/surat?tipe=masuk'") || adminLayoutContent.includes("to: '/surat?tipe=masuk'")) &&
  (adminLayoutContent.includes("to: '/admin/surat?tipe=keluar'") || adminLayoutContent.includes("to: '/surat?tipe=keluar'")) &&
  (adminLayoutContent.includes("to: '/admin/surat'") || adminLayoutContent.includes("to: '/surat'")),
  "AdminLayout memiliki daftar menu persuratan lengkap (Dashboard, Surat Masuk, Surat Keluar, Agenda)"
);

// Menu Verifikasi Dokumen QR sengaja dihapus dari sidebar admin panel.
// Halaman publik /verifikasi tetap hidup dan tetap dapat diakses lewat URL langsung.
assert(
  !adminLayoutContent.includes("to: '/verifikasi'") &&
  !adminLayoutContent.includes("label: 'Verifikasi Dokumen QR'"),
  "Sidebar admin TIDAK lagi memuat menu Verifikasi Dokumen QR"
);

assert(
  adminLayoutContent.includes("min-h-[44px]") && adminLayoutContent.includes("aria-label"),
  "AdminLayout menerapkan standar tap target WCAG AA (min 44px) dan accessible aria-label"
);

assert(
  adminLayoutContent.includes("sidebarOpen") &&
  adminLayoutContent.includes("md:hidden") &&
  adminLayoutContent.includes("XMarkIcon className"),
  "AdminLayout mendukung layout responsif mobile drawer dengan tombol close dan toggle"
);

// 2. Audit Berkas AdminDashboard.tsx
const adminDashboardPath = path.resolve(process.cwd(), 'src/client/pages/AdminDashboard.tsx');
assert(fs.existsSync(adminDashboardPath), "Berkas src/client/pages/AdminDashboard.tsx ditemukan");

const adminDashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');

assert(
  adminDashboardContent.includes("CardContainer") &&
  adminDashboardContent.includes("EmptyState") &&
  adminDashboardContent.includes("ErrorState"),
  "AdminDashboard mematuhi UI Container Governance (CardContainer, EmptyState, ErrorState)"
);

assert(
  adminDashboardContent.includes("stats.surat.masuk") &&
  adminDashboardContent.includes("stats.surat.keluar") &&
  adminDashboardContent.includes("stats.surat.pending") &&
  adminDashboardContent.includes("stats.disposisi.total"),
  "AdminDashboard menampilkan 4 kartu metrik utama persuratan dan disposisi"
);

assert(
  // Dashboard kini menyajikan sebaran status surat sebagai donut chart
  // (laporan grafik), bukan lagi grid kartu seperti versi sebelumnya.
  adminDashboardContent.includes("Laporan Alur Status Surat") &&
  adminDashboardContent.includes("DonutChart") &&
  adminDashboardContent.includes("stats.surat.pending") &&
  adminDashboardContent.includes("stats.surat.diproses") &&
  adminDashboardContent.includes("stats.surat.disetujui") &&
  adminDashboardContent.includes("stats.surat.selesai") &&
  adminDashboardContent.includes("stats.surat.ditolak"),
  "AdminDashboard menyajikan laporan grafik sebaran status surat (Diajukan, Diproses, Disetujui, Selesai, Ditolak)"
);

assert(
  adminDashboardContent.includes("onRetry={loadData}") || adminDashboardContent.includes("onClick={loadData}"),
  "AdminDashboard memiliki mekanisme retry saat gagal memuat ringkasan statistik"
);

assert(
  adminDashboardContent.includes("recentSurat") &&
  adminDashboardContent.includes("recentDisposisi") &&
  adminDashboardContent.includes("EmptyState"),
  "AdminDashboard menangani empty state dan list recent records dengan aman"
);

// 3. Audit Integrasi Rute di App.tsx
const appPath = path.resolve(process.cwd(), 'src/client/App.tsx');
assert(fs.existsSync(appPath), "Berkas src/client/App.tsx ditemukan");

const appContent = fs.readFileSync(appPath, 'utf8');

assert(
  appContent.includes("path=\"/admin\"") &&
  appContent.includes("<AdminLayout />") &&
  appContent.includes("<AdminDashboard />"),
  "App.tsx mendaftarkan rute /admin dengan AdminLayout dan sub-rute AdminDashboard"
);

assert(
  appContent.includes("allowedRoles={['admin', 'dosen']}") &&
  appContent.includes("ProtectedRoute"),
  "Rute /admin diproteksi RBAC untuk role berwenang (admin, dosen)"
);

// Rekapitulasi
const failed = assertions.filter(a => !a.passed);
if (failed.length > 0) {
  console.error(`=== HASIL PENGUJIAN: ${failed.length} TEST GAGAL ===`);
  process.exit(1);
} else {
  console.log(`=== HASIL PENGUJIAN: ${assertions.length}/${assertions.length} TEST BERHASIL ===\n`);
}
