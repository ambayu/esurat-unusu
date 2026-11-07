import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { AnimatedFlatSsoLogo } from '../components/AnimatedFlatSsoLogo';
import { SsoLoadingScreen } from '../components/SsoLoadingScreen';

const ONE_UNUSU_URL = import.meta.env.VITE_ONE_UNUSU_URL || 'http://localhost:5173';
const SSO_CLIENT_ID = import.meta.env.VITE_SSO_CLIENT_ID || 'esurat-unusu';

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
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#166534] transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Konten Tengah */}
        <div className="max-w-md w-full mx-auto my-auto py-6 space-y-7 text-center sm:text-left">
          {/* Header */}
          <div className="space-y-2">
            <p className="inline-block border-l-2 border-[#166534] pl-3 text-xs font-semibold uppercase tracking-wider text-[#166534]">
              Persuratan &amp; Disposisi Digital
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-normal">
              Masuk ke <span className="text-[#166534]">E-Surat UNUSU</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Kelola surat masuk, surat keluar, disposisi, dan arsip digital melalui gerbang SSO terpadu.
            </p>
          </div>

          {/* Logo ONE UNUSU : Bisa Ditekan, Mengarah ke ONE UNUSU */}
          <div className="flex flex-col items-center space-y-3">
            <AnimatedFlatSsoLogo
              size={210}
              onClick={handleSsoLogin}
            />
            <div className="text-center">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">ONE <span className="text-[#166534]">UNUSU</span></span>
            </div>
          </div>

          {/* Tombol Masuk SSO : Gaya Terpadu SSO */}
          <button
            type="button"
            onClick={handleSsoLogin}
            disabled={redirecting}
            data-testid="login-sso-button"
            aria-label="Masuk dengan ONE UNUSU"
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-full bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-98 cursor-pointer disabled:opacity-50 group"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-white shrink-0" />
            <span className="font-bold">{redirecting ? 'Menghubungkan ke ONE UNUSU...' : 'Masuk dengan ONE UNUSU'}</span>
            {!redirecting && <ChevronRightIcon className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform shrink-0" />}
          </button>

          {/* Wrapper Rapat: Divider 'atau' & Tautan Teks Hijau */}
          <div className="!mt-4 space-y-2">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative bg-white px-3 text-xs text-slate-400">
                atau
              </div>
            </div>

            {/* Tautan Teks Hijau Kunjungi Portal ONE UNUSU */}
            <div className="text-center pt-0.5">
              <a
                href={ONE_UNUSU_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#166534] hover:text-[#14532D] hover:underline transition-colors cursor-pointer"
              >
                <span>Kunjungi Website ONE UNUSU</span>
                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>

          {/* Footer terpusat */}
          <div className="text-xs text-slate-500 text-center font-normal pt-1">
            &copy; {new Date().getFullYear()} E-Surat UNUSU &bull; Universitas Nahdlatul Ulama Sumatera Utara
          </div>
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
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-950/40 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-lg space-y-3">
          {/* Eyebrow di panel gelap: bilah tegak emerald agar tetap terbaca. */}
          <p className="inline-block border-l-2 border-emerald-400 pl-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Tata Kelola Persuratan Digital
          </p>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-normal text-white drop-shadow-md leading-tight">
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
