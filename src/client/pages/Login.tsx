import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { AnimatedFlatSsoLogo } from '../components/AnimatedFlatSsoLogo';
import { SsoLoadingScreen } from '../components/SsoLoadingScreen';

const ONE_UNUSU_URL = import.meta.env.VITE_ONE_UNUSU_URL || 'https://unusu.bpp-developer.com/sso';
const SSO_CLIENT_ID = import.meta.env.VITE_SSO_CLIENT_ID || 'cli6b92b2f89ffcf8bf';

/**
 * Halaman masuk E-Surat UNUSU.
 *
 * Satu-satunya jalur otentikasi adalah SSO terpusat ONE UNUSU. Tidak tersedia
 * formulir kata sandi lokal maupun pintasan "Masuk Cepat sebagai Admin" agar
 * setiap sesi persuratan selalu berasal dari tiket SSO sekali pakai.
 */
export function LoginPage() {
  const [redirecting, setRedirecting] = useState(false);

  const handleSsoLogin = () => {
    if (redirecting) return;
    // Hanya menyalakan layar tunggu. Perpindahan ke Portal ONE UNUSU baru
    // dijalankan oleh `onReady` setelah jeda animasi terlewati, sehingga logo
    // SSO sempat terlihat utuh alih-alih berkedip sepersekian detik.
    setRedirecting(true);
  };

  const goToPortal = () => {
  // Langsung ke /authorize, tanpa melewati halaman login portal.
  // Portal sendiri yang menentukan: bila sesi SSO masih aktif, tiket diterbitkan
  // dan pengguna mendarat di panel aplikasi ini; bila tidak, portal menampilkan
  // form login lalu melanjutkan ke /authorize secara otomatis. Dengan begitu
  // pengguna yang sudah login di ONE UNUSU tidak melihat form login dua kali.
    const target = `${ONE_UNUSU_URL}/authorize?client_id=${encodeURIComponent(SSO_CLIENT_ID)}`;
    window.location.href = target;
  };

  // Layar tunggu satu halaman penuh selama browser berpindah ke Portal ONE
  // UNUSU, supaya pengguna tidak menekan tombol masuk berulang kali.
  if (redirecting) {
    return (
      <SsoLoadingScreen
        title="Menghubungkan ke ONE UNUSU"
        description="Mengalihkan Anda ke Portal Single Sign-On kampus. Jangan tutup halaman ini."
        delayMs={1400}
        onReady={goToPortal}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white relative selection:bg-surat-green selection:text-slate-950">
      {/* ===== SISI KIRI: FORM LOGIN SSO ===== */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-20 z-10">
        {/* Nav Kembali */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748B] hover:text-[#166534] transition-colors min-h-[44px] py-2 focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg px-2 -ml-2"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Konten Tengah */}
        <div className="max-w-md w-full mx-auto my-auto py-6 space-y-7 text-center sm:text-left">
          {/* Header */}
          <div className="space-y-2">
            <p className="border-l-2 border-[#166534] pl-3 text-xs font-bold uppercase tracking-[0.14em] text-[#166534]">
              Persuratan &amp; Disposisi Digital
            </p>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
              Masuk ke <span className="text-[#166534]">E-Surat UNUSU</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed font-normal">
              Kelola surat masuk, surat keluar, disposisi, dan arsip digital melalui gerbang SSO terpadu.
            </p>
          </div>

          {/* Logo ONE UNUSU : Bisa Ditekan, Mengarah ke ONE UNUSU */}
          <div className="flex flex-col items-center space-y-3">
            <AnimatedFlatSsoLogo
              size={210}
              onClick={handleSsoLogin}
            />
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center space-x-1.5">
                <span className="font-extrabold text-xl text-[#1E293B] tracking-tight">ONE</span>
                <span className="font-extrabold text-xl text-[#166534] tracking-tight">UNUSU</span>
              </div>
              <p className="text-[11px] text-[#64748B] font-semibold">
                Ekosistem Digital Terpadu Kampus
              </p>
              <p className="text-[10px] text-[#94A3B8] font-medium">
                Universitas Nahdlatul Ulama Sumatera Utara
              </p>
            </div>
          </div>

          {/* Tombol Masuk SSO : gaya identik dengan tombol masuk pada halaman login ONE UNUSU */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSsoLogin}
              disabled={redirecting}
              data-testid="login-sso-button"
              aria-label="Masuk dengan Akun SSO ONE UNUSU"
              className="w-full min-h-[48px] py-3.5 px-4 bg-[#166534] hover:bg-[#14532D] active:bg-[#14532D] text-white font-semibold text-sm rounded-[8px] transition duration-150 disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#166534] focus:ring-offset-2"
            >
              <span>{redirecting ? 'Menghubungkan ke ONE UNUSU...' : 'Masuk dengan Akun SSO ONE UNUSU'}</span>
              {!redirecting && <ArrowRightIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-500 text-center sm:text-left">
          &copy; {new Date().getFullYear()} E-Surat UNUSU : Universitas Nahdlatul Ulama Sumatera Utara
        </div>
      </div>

      {/* ===== SISI KANAN: WALLPAPER KAMPUS ===== */}
      <div className="w-full lg:w-1/2 relative flex flex-col justify-end p-8 sm:p-14 lg:p-16 overflow-hidden min-h-[420px] lg:min-h-screen text-white">
        <img
          src="/assets/campus-login.png"
          alt="Gedung Kampus UNUSU Gaperta Medan"
          width={1024}
          height={1024}
          loading="eager"
          decoding="async"
          onError={(e) => {
            // Graceful fallback jika terjadi network issue
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.82]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-lg space-y-3">
          <p className="border-l-2 border-white/60 pl-3 text-xs font-bold uppercase tracking-[0.14em] text-white/90">
            Tata Kelola Persuratan Digital
          </p>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
            Administrasi Surat Resmi Tanpa Kertas
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 drop-shadow font-normal leading-relaxed">
            Digitalisasi proses persuratan, disposisi berjenjang, dan arsip terpusat terintegrasi ONE UNUSU.
          </p>
        </div>
      </div>
    </div>
  );
}
