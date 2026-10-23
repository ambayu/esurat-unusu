import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, FileCheck, Send, ShieldCheck, ExternalLink, QrCode } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

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
              Daftar Surat
            </Link>
            <Link
              to="/ajukan"
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                location.pathname === '/ajukan' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ajukan Surat
            </Link>
            <Link
              to="/verifikasi"
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                location.pathname === '/verifikasi' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cek Keaslian Dokumen
            </Link>

            {/* Link back to ONE UNUSU */}
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-emerald-700 hover:bg-slate-50 transition"
            >
              <span>ONE UNUSU</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="pl-3 border-l border-slate-200">
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-md border border-emerald-200">
                Layanan Terpadu
              </span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
