import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../services/api';
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  Bars3Icon,
  EnvelopeIcon,
  HomeIcon,
  QrCodeIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface NavLinkItem {
  to: string;
  label: string;
  icon?: React.ElementType;
  match: (pathname: string) => boolean;
}

/**
 * Navbar publik E-Surat UNUSU.
 * Struktur: brand (logo + nama + subteks) di kiri, menu di tengah, aksi akun di kanan.
 */
export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Panel admin punya topbar sendiri; navbar publik disembunyikan.
  // Guard ganda: App.tsx juga tidak me-render Navbar pada rute /admin.
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const links: NavLinkItem[] = [
    { to: '/', label: 'Beranda', icon: HomeIcon, match: (p) => p === '/' },
    {
      to: '/verifikasi',
      label: 'Cek Keaslian Dokumen',
      icon: QrCodeIcon,
      match: (p) => p.startsWith('/verifikasi'),
    },
  ];

  const linkClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[8px] text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-surat-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surat-green ${
      active
        ? 'text-white bg-white/15'
        : 'text-surat-green-50/90 hover:text-white hover:bg-white/10'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-surat-green border-b border-surat-green-dark shadow-[0_1px_0_0_rgba(0,0,0,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="E-Surat UNUSU : Beranda">
            <div className="w-9 h-9 rounded-[10px] bg-white/10 border border-white/20 flex items-center justify-center">
              <EnvelopeIcon className="w-4.5 h-4.5 text-surat-gold" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <div className="flex items-baseline gap-1">
                <span className="font-extrabold text-[15px] tracking-tight text-white">E-SURAT</span>
                <span className="font-extrabold text-[15px] tracking-tight text-surat-gold-light">UNUSU</span>
              </div>
              <p className="text-[10px] font-medium text-surat-green-50/80">Persuratan &amp; Disposisi Digital</p>
            </div>
          </Link>

          {/* Menu desktop */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
            {links.map((item) => (
              <Link key={item.to} to={item.to} className={linkClass(item.match(location.pathname))}>
                {item.icon ? <item.icon className="w-4 h-4" aria-hidden="true" /> : null}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Aksi akun */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Identitas pengguna : chip non-klik (bukan tombol panel).
                 *  Navbar publik tidak pernah menautkan panel admin; tombol
                 *  "Panel Admin" sudah dihapus dari menu & aksi. */}
                <div className="group hidden lg:inline-flex items-center gap-2 h-[44px] px-3 text-white/90">
                  {user.foto && !imgError ? (
                    <img
                      src={getAssetUrl(user.foto)}
                      alt={user.nama}
                      width={32}
                      height={32}
                      loading="lazy"
                      decoding="async"
                      onError={() => setImgError(true)}
                      className="w-8 h-8 rounded-full object-cover border border-white/30 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {user.nama?.charAt(0) || <UserIcon className="w-4 h-4" aria-hidden="true" />}
                    </div>
                  )}
                  <div className="flex flex-col leading-tight min-w-0 text-left">
                    <span className="text-xs font-bold text-white max-w-[140px] truncate">{user.nama}</span>
                    <span className="text-[10px] font-semibold uppercase text-surat-gold-light">{user.role}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-[8px] text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 border border-white/25 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-surat-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surat-green"
                >
                  <ArrowLeftOnRectangleIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </>
            ) : (
              <>
                <a
                  href="https://unusu.ac.id"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hidden lg:inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-[8px] text-xs font-semibold text-surat-green-50/90 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Website Kampus</span>
                </a>
                <Link
                  to="/login"
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-4 rounded-[8px] text-xs font-bold bg-white hover:bg-surat-green-50 text-surat-green-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-surat-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surat-green"
                >
                  <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Masuk SSO</span>
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileOpen}
              className="md:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[8px] border border-white/30 text-white hover:bg-white/10"
            >
              {mobileOpen ? <XMarkIcon className="w-5 h-5" aria-hidden="true" /> : <Bars3Icon className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/15 bg-surat-green-dark px-4 py-3 space-y-1">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 min-h-[44px] px-3 rounded-[8px] text-sm font-semibold ${
                item.match(location.pathname)
                  ? 'bg-white/15 text-white'
                  : 'text-surat-green-50/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon ? <item.icon className="w-4 h-4" aria-hidden="true" /> : null}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
