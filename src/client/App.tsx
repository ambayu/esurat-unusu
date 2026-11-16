import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { SuratList } from './pages/SuratList';
import { SuratDetail } from './pages/SuratDetail';
import { VerifikasiDokumen } from './pages/VerifikasiDokumen';
import { LoginPage } from './pages/Login';
import { SsoCallbackPage } from './pages/SsoCallback';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { JenisSuratManagement } from './pages/JenisSuratManagement';
import { JenisSuratFormPage } from './pages/JenisSuratForm';
import { AdminSuratForm } from './pages/AdminSuratForm';
import { ManajemenPengguna } from './pages/ManajemenPengguna';
import { Peran } from './pages/Peran';
import { Izin } from './pages/Izin';
import { Profil } from './pages/Profil';
import { ManajemenSliderEsurat } from './pages/ManajemenSliderEsurat';
import { AuthProvider, useAuth } from './context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="p-12 text-center text-slate-500">Memuat sesi...</div>;
  }
  if (!user) {
    // Pengunjung unauthenticated diarahkan ke login, bukan ke admin
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Pengguna tidak memiliki hak akses role tertentu diarahkan ke root '/'
    return <Navigate to="/" replace />;
  }
  return children;
}

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Halaman alur masuk SSO tampil sebagai layar penuh tersendiri: tanpa navbar
  // dan footer. Navbar di sini hanya akan mengganggu (tautannya menuju panel
  // yang belum boleh dibuka sebelum sesi ada) sekaligus menyalahi aturan bahwa
  // navbar publik tidak boleh menautkan ke panel admin.
  const isAuthRoute =
    location.pathname === '/login' || location.pathname === '/sso/callback';

  const showChrome = !isAdminRoute && !isAuthRoute;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {showChrome && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Route Publik: Landing Page publik E-Surat */}
          <Route path="/" element={<LandingPage />} />

          {/* Route Publik: Halaman Login & Verifikasi Dokumen Tanpa Redirect Paksa */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sso/callback" element={<SsoCallbackPage />} />

          {/* Verifikasi keaslian dokumen lewat QR tetap publik */}
          <Route path="/verifikasi" element={<VerifikasiDokumen />} />
          <Route path="/verifikasi/:token" element={<VerifikasiDokumen />} />

          {/* Rute redirect dari sisa tautan lama */}
          <Route path="/surat" element={<Navigate to="/admin/surat" replace />} />
          <Route path="/surat/:id" element={<Navigate to="/admin/surat" replace />} />
          <Route path="/ajukan" element={<Navigate to="/admin/surat-form?tipe=keluar" replace />} />

          {/* Panel Admin: Layout khusus admin/staff dengan sidebar navigasi & proteksi role */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'dosen']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="surat" element={<SuratList />} />
            <Route path="surat/:id" element={<SuratDetail />} />
            <Route path="jenis-surat" element={<JenisSuratManagement />} />
            <Route path="jenis-surat/tambah" element={<JenisSuratFormPage />} />
            <Route path="jenis-surat/edit/:id" element={<JenisSuratFormPage />} />
            <Route path="slider" element={<ManajemenSliderEsurat />} />
            <Route path="surat-form" element={<AdminSuratForm />} />
            {/* Menu grup Tata Kelola: Pengguna → Peran → Izin (masing-masing menu mandiri) */}
            <Route path="pengguna" element={<ManajemenPengguna />} />
            <Route path="peran" element={<Peran />} />
            <Route path="izin" element={<Izin />} />
            {/* Kompatibilitas tautan lama */}
            <Route path="peran-izin" element={<Navigate to="/admin/peran" replace />} />
            <Route path="profil" element={<Profil />} />
            {/* Kompatibilitas tautan lama: diarahkan ke /admin/peran */}
            <Route path="rbac" element={<Navigate to="/admin/peran" replace />} />
          </Route>

          {/* Shortcut dashboard diarahkan ke /admin jika admin/staff atau /surat */}
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showChrome && <Footer />}
    </div>
  );
}

/**
 * Basename router SELALU `BASE_PATH` (mis. `/esurat`), tanpa menebak dari URL.
 *
 * Sebelumnya nilai ini dihitung dari `window.location.pathname`: bila
 * pengunjung membuka `/login` (tanpa awalan `/esurat`), basename menjadi
 * kosong, lalu ketika halaman dimuat ulang pada `/esurat/login` basename
 * berubah menjadi `/esurat`. Satu aplikasi pun berjalan dalam dua mode
 * perutean yang berbeda — akibatnya pengguna yang menekan tombol masuk
 * terlempar dari `/login` ke `/esurat/login`. Semua alamat lama tanpa awalan
 * kini dinormalkan lebih dulu (lihat `normalkanKeBasePath`), sehingga basename
 * cukup satu nilai.
 */
const routerBasename = BASE_PATH;

/**
 * Mengalihkan alamat yang tidak memakai awalan aplikasi ke bentuk berawalan.
 *
 * Contoh: `/login` -> `/esurat/login`, `/sso/callback` ->
 * `/esurat/sso/callback`. Alamat yang sudah benar, berkas statis, dan
 * panggilan API dibiarkan apa adanya agar tidak mengganggu aset maupun
 * permintaan ke server.
 *
 * Dijalankan sekali saat modul dimuat — sebelum React dirender — sehingga
 * router tidak pernah melihat dua bentuk URL yang berbeda.
 */
function normalkanKeBasePath(): void {
  if (!BASE_PATH) return;

  const { pathname, search, hash } = window.location;
  if (pathname === BASE_PATH || pathname.startsWith(`${BASE_PATH}/`)) return;

  // Aset & API dilayani di akar, jadi tidak boleh dialihkan ke bawah /esurat.
  if (pathname.startsWith('/assets/') || pathname.startsWith('/api/')) return;

  window.history.replaceState(null, '', `${BASE_PATH}${pathname}${search}${hash}`);
}

normalkanKeBasePath();

export function App() {
  return (
    <AuthProvider>
      <Router basename={routerBasename}>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

