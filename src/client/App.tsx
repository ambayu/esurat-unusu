import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SuratList } from './pages/SuratList';
import { AjukanSurat } from './pages/AjukanSurat';
import { SuratDetail } from './pages/SuratDetail';
import { VerifikasiDokumen } from './pages/VerifikasiDokumen';
import { LoginPage } from './pages/Login';
import { SsoCallbackPage } from './pages/SsoCallback';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="p-12 text-center text-slate-500">Memuat sesi...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/sso/callback" element={<SsoCallbackPage />} />

              {/* Verifikasi keaslian dokumen lewat QR tetap publik */}
              <Route path="/verifikasi" element={<VerifikasiDokumen />} />
              <Route path="/verifikasi/:token" element={<VerifikasiDokumen />} />

              <Route path="/" element={<ProtectedRoute><SuratList /></ProtectedRoute>} />
              <Route path="/ajukan" element={<ProtectedRoute><AjukanSurat /></ProtectedRoute>} />
              <Route path="/surat/:id" element={<ProtectedRoute><SuratDetail /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
            <p>Ac {new Date().getFullYear()} E-Surat UNUSU — Tata Naskah & Disposisi Digital Universitas Nahdlatul Ulama Sumatera Utara</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
