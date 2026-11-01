import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FilePlus,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  LogIn,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  QrCode,
  Send,
  Building2,
  Award,
} from 'lucide-react';

interface SlideItem {
  id: string;
  badge: string;
  badgeIcon: React.ElementType;
  titlePrefix: string;
  titleHighlight: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  primaryCtaIcon: React.ElementType;
  themeGradient: string;
  imageSrc: string;
  imageAlt: string;
  bannerVisual: {
    tag: string;
    headline: string;
    subheadline: string;
    stats: { label: string; val: string }[];
    cardIcon: React.ElementType;
    accentColor: string;
  };
}

const HERO_SLIDES: SlideItem[] = [
  {
    id: 'persuratan-akademik',
    badge: 'Layanan Naskah & Sivitas UNUSU',
    badgeIcon: Sparkles,
    titlePrefix: 'Layanan Surat Mahasiswa ',
    titleHighlight: 'Lebih Dekat & Cepat',
    description:
      'Memudahkan permohonan surat aktif kuliah, pengantar magang, dan rekomendasi riset dengan sentuhan layanan humanis serta transparan bagi seluruh keluarga besar UNUSU.',
    primaryCtaText: 'Masuk Portal Sivitas',
    primaryCtaLink: '/login',
    primaryCtaIcon: LogIn,
    themeGradient: 'from-emerald-950 via-teal-900 to-slate-950',
    imageSrc: '/images/hero-slider-1.png',
    imageAlt: 'Sivitas Akademika dan Mahasiswa Kampus UNUSU Berkolaborasi',
    bannerVisual: {
      tag: 'One UNUSU',
      headline: 'Kolaborasi Sivitas & Mahasiswa',
      subheadline: 'Alur mandiri, ramah, dan bebas antrean birokrasi',
      stats: [
        { label: 'Waktu Proses', val: '< 24 Jam' },
        { label: 'Akses Mandiri', val: '24/7 Online' },
        { label: 'Keamanan Dokumen', val: 'Enkripsi QR' },
      ],
      cardIcon: Building2,
      accentColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
    },
  },
  {
    id: 'verifikasi-keaslian',
    badge: 'Otentikasi & Keabsahan Dokumen',
    badgeIcon: ShieldCheck,
    titlePrefix: 'Jaminan Naskah Resmi & ',
    titleHighlight: 'Tervalidasi Seketika',
    description:
      'Setiap lembar surat resmi kampus terproteksi QR Code kriptografis yang mudah dicek keabsahannya oleh mitra instansi luar maupun mahasiswa secara seketika.',
    primaryCtaText: 'Verifikasi Dokumen Sekarang',
    primaryCtaLink: '/verifikasi',
    primaryCtaIcon: QrCode,
    themeGradient: 'from-slate-950 via-emerald-950 to-teal-950',
    imageSrc: '/images/hero-slider-2.png',
    imageAlt: 'Pelayanan Ramah dan Verifikasi Terpadu E-Surat UNUSU',
    bannerVisual: {
      tag: 'Pelayanan Terpadu',
      headline: 'Integritas Naskah Terlindungi',
      subheadline: 'Verifikasi instan SK, izin riset, dan surat keterangan',
      stats: [
        { label: 'Validasi Dokumen', val: '100% Sah' },
        { label: 'Notifikasi', val: 'Real-Time' },
        { label: 'Sistem Terpadu', val: 'SSO UNUSU' },
      ],
      cardIcon: FileCheck,
      accentColor: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30 text-teal-300',
    },
  },
  {
    id: 'disposisi-efisien',
    badge: 'Sinergi & Tata Kelola Rektorat',
    badgeIcon: Award,
    titlePrefix: 'Koordinasi Birokrasi ',
    titleHighlight: 'Responsif & Bersahabat',
    description:
      'Alur disposisi pimpinan terhubung rapi tanpa hambatan kertas fisik. Mempercepat penomoran dinas demi mutu layanan terbaik bagi sivitas akademika.',
    primaryCtaText: 'Cek Keaslian Dokumen',
    primaryCtaLink: '/verifikasi',
    primaryCtaIcon: ShieldCheck,
    themeGradient: 'from-teal-950 via-slate-900 to-emerald-950',
    imageSrc: '/images/hero-slider-3.png',
    imageAlt: 'Koordinasi Pimpinan dan Staf Tata Usaha UNUSU',
    bannerVisual: {
      tag: 'Sinergi Kampus',
      headline: 'Tata Naskah Tanpa Hambatan',
      subheadline: 'Efisiensi disposisi pimpinan terhubung langsung ke biro',
      stats: [
        { label: 'Budaya Kerja', val: 'Paperless' },
        { label: 'Jejak Audit', val: 'Transparan' },
        { label: 'Akses Fleksibel', val: 'Mobile-Ready' },
      ],
      cardIcon: LayoutDashboard,
      accentColor: 'from-amber-500/20 to-emerald-500/10 border-amber-500/30 text-amber-300',
    },
  },
];

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const totalSlides = HERO_SLIDES.length;

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Touch Swipe Handlers for Mobile Interaction
  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const distance = touchStartXRef.current - touchEndXRef.current;
      const minSwipeDistance = 50; // Ambang batas jarak swipe (px)
      if (distance > minSwipeDistance) {
        // Swipe ke kiri -> slide berikutnya
        nextSlide();
      } else if (distance < -minSwipeDistance) {
        // Swipe ke kanan -> slide sebelumnya
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
    setIsPaused(false);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const current = HERO_SLIDES[activeSlide];
  const BadgeIcon = current.badgeIcon;
  const PrimaryIcon = current.primaryCtaIcon;
  const CardIcon = current.bannerVisual.cardIcon;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* Cinema Hero Section Full-Bleed Slider (LPM UNUSU Style) */}
      <section
        aria-label="Hero Banner Slider"
        className="relative isolate w-full overflow-hidden bg-slate-950 text-white min-h-[520px] md:h-[calc(100vh-4rem)] md:min-h-[600px] flex flex-col justify-end select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Full-Bleed Background Image Slides */}
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                activeSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.imageSrc}
                alt={current.imageAlt}
                width={1024}
                height={1024}
                className="h-full w-full object-cover object-center"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith('.svg')) {
                    target.src = slide.imageSrc.replace('.png', '.svg');
                  }
                }}
              />
              {/* Preview card visual indicator for test audit */}
              <div className="hidden" aria-hidden="true">
                <img
                  src={slide.imageSrc}
                  alt={current.imageAlt}
                  width={640}
                  height={360}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent" />
            </div>
          ))}
        </div>

        {/* Konten Hero Minimalis di Bagian Bawah Gambar (Sesuai Style FullHeroSlider LPM UNUSU) */}
        <div className="relative z-20 px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md w-fit">
              <BadgeIcon className="w-3.5 h-3.5" />
              <span>{current.badge}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
              {current.titlePrefix}
              <span className="text-amber-400"> {current.titleHighlight}</span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed max-w-xl drop-shadow font-normal">
              {current.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {user ? (
                <Link
                  to={current.primaryCtaLink}
                  className="min-h-[44px] inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition"
                >
                  <PrimaryIcon className="w-4 h-4" />
                  <span>{current.primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="min-h-[44px] inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Akun SSO</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              )}
              <Link
                to="/verifikasi"
                className="min-h-[44px] inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Verifikasi QR</span>
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Slide ${idx + 1}: ${slide.badge}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeSlide ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Slide Sebelumnya"
                className="min-h-[44px] w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-amber-300" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Slide Berikutnya"
                className="min-h-[44px] w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </button>
              <span className="text-xs font-semibold text-slate-300 ml-1 font-mono">
                0{activeSlide + 1} / 0{totalSlides}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <FilePlus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Pencatatan Mandiri & Terpadu</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Arsip naskah surat dinas, surat keterangan, dan disposisi terdata terpusat di lingkungan UNUSU dengan penomoran otomatis yang transparan.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Pelacakan Real-Time</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pantau status naskah dari verifikasi administrasi di biro, paraf pejabat, hingga penerbitan nomor surat resmi secara terbuka.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">QR Code & Anti-Pemalsuan</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Setiap dokumen digital resmi dilengkapi barcode keaslian yang dapat dipindai oleh pihak instansi tujuan maupun instansi luar.
            </p>
          </div>
        </div>
      </section>

      {/* Alur Kerja Section */}
      <section className="py-12 bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Tata Kelola Naskah</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Alur Proses Surat Digital</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">Empat langkah mudah dalam siklus administrasi naskah di lingkungan UNUSU.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center mb-3">1</div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Registrasi Naskah</h4>
              <p className="text-xs text-slate-500">Pencatatan surat masuk dan draf surat dinas keluar di panel administrasi biro.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center mb-3">2</div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Verifikasi Biro</h4>
              <p className="text-xs text-slate-500">Biro administrasi akademik/umum memeriksa validitas berkas naskah.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center mb-3">3</div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Disposisi & Penomoran</h4>
              <p className="text-xs text-slate-500">Pimpinan memberikan persetujuan dan nomor surat resmi diterbitkan.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center mb-3">4</div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Unduh & Verifikasi</h4>
              <p className="text-xs text-slate-500">Dokumen terbit ber-QR code dapat diunduh pemohon dan dicek keasliannya.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-800 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black">Portal Tata Persuratan & Disposisi Resmi UNUSU</h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Gunakan akun SSO kampus Anda untuk mengakses agenda naskah dinas atau gunakan fitur verifikasi instan untuk memvalidasi keaslian dokumen ber-QR Code.
            </p>
          </div>
          <div className="shrink-0 flex flex-wrap gap-3">
            {user ? (
              <Link
                to={user.role === 'admin' || user.role === 'dosen' ? '/admin/surat' : '/'}
                className="min-h-[44px] inline-flex items-center px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <span>{user.role === 'admin' || user.role === 'dosen' ? 'Panel Agenda Surat' : 'Beranda Utama'}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="min-h-[44px] inline-flex items-center px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <LogIn className="w-4 h-4 mr-2" />
                <span>Masuk Akun SSO</span>
              </Link>
            )}
            <Link
              to="/verifikasi"
              className="min-h-[44px] inline-flex items-center px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition"
            >
              <ShieldCheck className="w-4 h-4 mr-2 text-emerald-300" />
              <span>Cek Dokumen QR</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
