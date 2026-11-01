import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, FileCheck, Send, ShieldCheck, ExternalLink, QrCode, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [imgError, setImgError] = useState(false);

  // Jangan render Navbar publik di halaman panel admin (/admin/*)
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Mail className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-lg text-slate-900">E-SURAT</span>
                <span className="font-extrabold text-lg text-emerald-700">UNUSU</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Persuratan & Disposisi Digital</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-3">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                location.pathname === '/' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Beranda
            </Link>
            <Link
              to="/verifikasi"
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                location.pathname.startsWith('/verifikasi') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cek Keaslian Dokumen
            </Link>

            {/* Link Admin Dashboard untuk role admin / dosen / staf */}
            {user && (user.role === 'admin' || user.role === 'dosen') && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Panel Admin</span>
              </Link>
            )}

            {/* Auth Action */}
            {user ? (
              <div className="flex items-center pl-2 space-x-2 border-l border-slate-200">
                <div className="flex items-center space-x-2">
                  {user.foto && !imgError ? (
                    <img
                      src={getAssetUrl(user.foto)}
                      alt={user.nama}
                      width={32}
                      height={32}
                      loading="lazy"
                      decoding="async"
                      onError={() => setImgError(true)}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase"
                      title={user.nama}
                      aria-label={user.nama}
                    >
                      {user.nama?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                  )}
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">{user.nama}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold uppercase">{user.role}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center space-x-1 min-h-[44px] px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition focus:outline-none focus:ring-2 focus:ring-rose-400"
                  title="Keluar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <div className="pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-1 min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
