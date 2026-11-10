import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl, fetchPublicSliders, EsuratBannerSliderItem } from '../services/api';
import { LatarDekoratif } from '../components/LatarDekoratif';
import { Reveal } from '../components/Reveal';
import {
  AcademicCapIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentCheckIcon,
  DocumentPlusIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

interface SlideItem {
  id: string;
  /** Label kecil di atas judul. Ditulis sebagai keterangan, bukan slogan. */
  keterangan: string;
  titlePrefix: string;
  titleHighlight: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  primaryCtaIcon: React.ElementType;
  imageSrc: string;
  imageAlt: string;
}

const HERO_SLIDES: SlideItem[] = [
  {
    id: 'persuratan-akademik',
    keterangan: 'Layanan Naskah & Sivitas',
    titlePrefix: 'Layanan Surat Mahasiswa ',
    titleHighlight: 'Lebih Dekat & Cepat',
    description:
      'Permohonan surat aktif kuliah, pengantar magang, dan rekomendasi riset kini diproses satu pintu. Tidak perlu datang ke loket, tidak perlu menunggu jam kerja biro.',
    primaryCtaText: 'Masuk Portal Sivitas',
    primaryCtaLink: '/login',
    primaryCtaIcon: ArrowRightOnRectangleIcon,
    imageSrc: '/images/hero-slider-1.png',
    imageAlt: 'Meja layanan tata naskah dengan berkas surat resmi kampus',
  },
  {
    id: 'verifikasi-keaslian',
    keterangan: 'Otentikasi & Keabsahan Dokumen',
    titlePrefix: 'Jaminan Naskah Resmi & ',
    titleHighlight: 'Tervalidasi Seketika',
    description:
      'Setiap lembar surat resmi kampus membawa kode QR kriptografis. Mitra instansi luar dapat memeriksa keabsahannya dalam hitungan detik tanpa menghubungi bagian tata usaha.',
    primaryCtaText: 'Verifikasi Dokumen Sekarang',
    primaryCtaLink: '/verifikasi',
    primaryCtaIcon: QrCodeIcon,
    imageSrc: '/images/hero-slider-2.png',
    imageAlt: 'Pemindaian kode QR keaslian pada dokumen surat resmi',
  },
  {
    id: 'disposisi-efisien',
    keterangan: 'Sinergi & Tata Kelola Rektorat',
    titlePrefix: 'Koordinasi Birokrasi ',
    titleHighlight: 'Responsif & Bersahabat',
    description:
      'Disposisi pimpinan berjalan tanpa tumpukan kertas fisik. Penomoran dinas terekam rapi, sehingga setiap permohonan punya jejak yang jelas dari pengirim sampai penerima.',
    primaryCtaText: 'Cek Keaslian Dokumen',
    primaryCtaLink: '/verifikasi',
    primaryCtaIcon: ShieldCheckIcon,
    imageSrc: '/images/hero-slider-3.png',
    imageAlt: 'Petugas menyerahkan berkas dinas di koridor layanan kampus',
  },
];

/** Tiga keunggulan layanan. Ikon dipilih menurut fungsinya, bukan hiasan. */
const KEUNGGULAN = [
  {
    ikon: DocumentPlusIcon,
    judul: 'Pencatatan Mandiri & Terpadu',
    teks: 'Arsip naskah surat dinas, surat keterangan, dan disposisi terdata terpusat di lingkungan UNUSU dengan penomoran otomatis yang transparan.',
  },
  {
    ikon: ClockIcon,
    judul: 'Pelacakan Real-Time',
    teks: 'Pantau status naskah dari verifikasi administrasi di biro, paraf pejabat, hingga penerbitan nomor surat resmi secara terbuka.',
  },
  {
    ikon: QrCodeIcon,
    judul: 'QR Code & Anti-Pemalsuan',
    teks: 'Setiap dokumen digital resmi dilengkapi barcode keaslian yang dapat dipindai oleh pihak instansi tujuan maupun instansi luar.',
  },
];

/** Empat tahap siklus naskah dinas. */
const ALUR = [
  {
    judul: 'Registrasi Naskah',
    teks: 'Pencatatan surat masuk dan draf surat dinas keluar di panel administrasi biro.',
  },
  {
    judul: 'Verifikasi Biro',
    teks: 'Biro administrasi akademik/umum memeriksa validitas berkas naskah.',
  },
  {
    judul: 'Disposisi & Penomoran',
    teks: 'Pimpinan memberikan persetujuan dan nomor surat resmi diterbitkan.',
  },
  {
    judul: 'Unduh & Verifikasi',
    teks: 'Dokumen terbit ber-QR code dapat diunduh pemohon dan dicek keasliannya.',
  },
];

/** Poin ringkas pada seksi Tentang. */
const TENTANG_POIN = [
  'Agenda surat masuk dan keluar dalam satu arsip digital',
  'Disposisi berjenjang dengan pantauan status tiap unit kerja',
  'Verifikasi keaslian dokumen melalui QR Code',
];

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slides, setSlides] = useState<SlideItem[]>(HERO_SLIDES);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  useEffect(() => {
    fetchPublicSliders()
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          const mapped: SlideItem[] = res.data.data.map((item) => ({
            id: `custom-slider-${item.id}`,
            keterangan: 'Layanan Resmi E-Surat',
            titlePrefix: item.judul + ' ',
            titleHighlight: '',
            description: item.subjudul || 'Sistem Persuratan & Disposisi Digital Universitas Nahdlatul Ulama Sumatera Utara.',
            primaryCtaText: 'Masuk Portal Sivitas',
            primaryCtaLink: item.linkUrl || '/login',
            primaryCtaIcon: ArrowRightOnRectangleIcon,
            imageSrc: item.gambarUrl,
            imageAlt: item.judul,
          }));
          setSlides(mapped);
        }
      })
      .catch(() => {
        // Fallback memakai HERO_SLIDES default bawaan
      });
  }, []);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Gestur geser untuk layar sentuh.
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
      const minSwipeDistance = 50;
      if (distance > minSwipeDistance) {
        nextSlide();
      } else if (distance < -minSwipeDistance) {
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

  const current = slides[activeSlide] || slides[0] || HERO_SLIDES[0];
  const PrimaryIcon = current.primaryCtaIcon;

  return (
    <div className="bg-white min-h-screen text-slate-800">
      {/* Strip identitas aplikasi: nama sistem + subteks satu baris.
          Latar emas (surat-gold) dengan teks hijau tua agar kontras terjaga. */}
      <div className="bg-surat-gold text-surat-green-dark px-4 py-2 text-xs font-medium border-b border-[#b8952c]">
        <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-start">
          <p className="truncate text-center sm:text-left">
            <span className="font-bold text-surat-green-dark">E-SURAT UNUSU</span>
            <span className="mx-1.5 text-surat-green-dark/50" aria-hidden="true">
              &middot;
            </span>
            <span>Sistem Persuratan &amp; Disposisi Digital</span>
            <span className="hidden sm:inline">
              <span className="mx-1.5 text-surat-green-dark/50" aria-hidden="true">
                &middot;
              </span>
              Universitas Nahdlatul Ulama Sumatera Utara
            </span>
          </p>
        </div>
      </div>

      {/* Hero slider, tinggi penuh.
          Tinggi `100svh - 4rem`: 4rem mengimbangi navbar sticky setinggi h-16,
          sehingga tidak muncul scrollbar hantu. Satuan `svh` mencegah lompatan
          saat bilah alamat ponsel menyusut. `max-h` menjaga ketajaman gambar
          pada monitor sangat besar. */}
      <section
        aria-label="Sorotan Layanan E-Surat"
        className="relative isolate w-full overflow-hidden bg-slate-950 text-white h-[calc(100svh-4rem)] min-h-[560px] max-h-[1080px] flex flex-col justify-end select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Latar gambar tiap slide, berganti dengan transisi opasitas. */}
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                activeSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.imageSrc.startsWith('data:') ? slide.imageSrc : getAssetUrl(slide.imageSrc)}
                alt={slide.imageAlt}
                width={640}
                height={360}
                className="h-full w-full object-cover object-center"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith('.svg')) {
                    target.src = getAssetUrl(slide.imageSrc.replace('.png', '.svg'));
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/25" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/45 to-transparent" />
            </div>
          ))}
        </div>

        {/* Konten hero: teks di kiri bawah, kontrol slider di kanan bawah. */}
        <div className="relative z-20 px-4 sm:px-6 lg:px-8 pb-8 md:pb-12 pt-24 max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              {/* Eyebrow berupa bilah tegak, bukan pil berwarna. */}
              <p className="border-l-2 border-surat-gold pl-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-surat-gold">
                {current.keterangan}
              </p>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] text-balance">
                {current.titlePrefix}
                <span className="text-white/90">{current.titleHighlight}</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl">
                {current.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                {user ? (
                  <Link
                    to={current.primaryCtaLink}
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-colors"
                  >
                    <PrimaryIcon className="w-4 h-4" aria-hidden="true" />
                    <span>{current.primaryCtaText}</span>
                    <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" aria-hidden="true" />
                    <span>Masuk Akun SSO</span>
                    <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
                  </Link>
                )}
                <Link
                  to="/verifikasi"
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-sm transition-colors"
                >
                  <ShieldCheckIcon className="w-4 h-4" aria-hidden="true" />
                  <span>Verifikasi QR</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 shrink-0 lg:flex-col lg:items-end lg:gap-3">
              <div className="flex items-center gap-2">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Slide ${idx + 1}: ${slide.keterangan}`}
                    aria-current={idx === activeSlide}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Slide Sebelumnya"
                  className="min-h-[44px] min-w-[44px] rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/25 transition-colors cursor-pointer"
                >
                  <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Slide Berikutnya"
                  className="min-h-[44px] min-w-[44px] rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/25 transition-colors cursor-pointer"
                >
                  <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
                </button>
                <span className="text-xs font-semibold text-slate-200 ml-1 font-mono tabular-nums">
                  0{activeSlide + 1} / 0{totalSlides}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tentang platform: teks kiri, gambar kanan.
          Ditaruh langsung setelah hero supaya pengunjung tahu ini layanan apa
          sebelum dijejali daftar fitur. */}
      <section
        id="tentang"
        aria-labelledby="tentang-title"
        className="relative isolate overflow-hidden py-16 sm:py-24"
      >
        <LatarDekoratif ragam="titik" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Kiri: narasi */}
          <Reveal animasiAwal={false} className="lg:col-span-6 space-y-5">
            <p className="border-l-2 border-surat-green pl-3 text-xs font-bold text-surat-green uppercase tracking-[0.14em]">
              Tentang Platform
            </p>
            <h2
              id="tentang-title"
              className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900"
            >
              Mengenal E-Surat UNUSU
            </h2>

            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 text-pretty">
              <p>
                E-Surat UNUSU adalah sistem tata naskah dinas digital yang mengelola seluruh
                siklus persuratan kampus: registrasi surat masuk, penyusunan surat keluar,
                disposisi pimpinan, hingga pengarsipan dokumen resmi.
              </p>
              <p>
                Setiap dokumen yang terbit dilengkapi barcode keaslian yang dapat dipindai,
                sehingga instansi tujuan maupun pihak luar dapat memverifikasi keabsahan surat
                secara mandiri dan seketika.
              </p>
            </div>

            <ul className="space-y-3 pt-1">
              {TENTANG_POIN.map((poin) => (
                <li key={poin} className="flex items-start gap-3 text-sm text-slate-700">
                  <span
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-surat-green text-white"
                    aria-hidden="true"
                  >
                    <CheckIcon className="size-3.5" />
                  </span>
                  <span>{poin}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Kanan: potret operator di atas plakat gradien. */}
          <Reveal delay={120} className="lg:col-span-6">
            <div className="relative mx-auto flex max-w-lg items-end justify-center">
              <div
                className="absolute inset-x-2 bottom-0 h-[86%] rounded-[40px] border border-surat-green-100 bg-gradient-to-tr from-surat-green-50 via-surat-green-50/40 to-transparent"
                aria-hidden="true"
              />
              <img
                src={getAssetUrl('/assets/profil-operator-surat.png')}
                alt="Operator tata usaha Universitas Nahdlatul Ulama Sumatera Utara mengelola naskah dinas"
                width={1024}
                height={1024}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="relative z-10 w-full rounded-[28px] object-contain"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Tiga keunggulan layanan. Latar hijau sangat muda agar halaman berganti
          nada setelah seksi putih Tentang, tanpa memakai warna baru. */}
      <section
        aria-labelledby="keunggulan-title"
        className="relative isolate overflow-hidden py-16 sm:py-20 bg-surat-green-50 border-y border-surat-green-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl mb-12 space-y-3">
            <p className="border-l-2 border-surat-green pl-3 text-xs font-bold text-surat-green uppercase tracking-[0.14em]">
              Tiga Keunggulan
            </p>
            <h2
              id="keunggulan-title"
              className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
            >
              Yang Membedakan Layanan Ini
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-pretty">
              Tiga hal yang membuat pengurusan naskah dinas kampus berbeda dari alur berbasis kertas.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {KEUNGGULAN.map((item, idx) => {
              const Icon = item.ikon;
              return (
                <Reveal
                  key={item.judul}
                  delay={idx * 90}
                  className="bg-white rounded-2xl p-6 border border-surat-green-100 hover:border-surat-green transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-surat-green text-white flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{item.judul}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.teks}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Alur kerja: empat tahap siklus naskah dinas. */}
      <section
        aria-labelledby="alur-title"
        className="relative isolate overflow-hidden py-16 sm:py-20"
      >
        <LatarDekoratif ragam="lengkung" posisi="top" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl mb-12 space-y-3">
            <p className="border-l-2 border-surat-green pl-3 text-xs font-bold text-surat-green uppercase tracking-[0.14em]">
              Empat Tahap
            </p>
            <h2 id="alur-title" className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Alur Proses Surat Digital
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed text-pretty">
              Empat langkah dalam siklus administrasi naskah di lingkungan UNUSU.
            </p>
          </Reveal>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ALUR.map((tahap, idx) => (
              <Reveal as="li" key={tahap.judul} delay={idx * 80} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-surat-green text-white font-bold text-sm flex items-center justify-center shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <span
                    className="h-px flex-1 bg-gradient-to-r from-surat-green/40 to-transparent"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{tahap.judul}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{tahap.teks}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>


      {/* Kotak ajakan masuk. Latar hijau tua penuh selebar halaman agar
          menutup landing dengan identitas yang sama seperti navbar dan footer. */}
      <section className="relative isolate overflow-hidden bg-surat-green py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-24 -right-16 size-[380px] rounded-full bg-white/[0.06] blur-3xl" />
          <div className="absolute -bottom-32 -left-20 size-[420px] rounded-full bg-white/[0.04] blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-xl space-y-3 text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-surat-gold">
                Mulai Gunakan
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-balance">
                Portal Tata Persuratan &amp; Disposisi Resmi UNUSU
              </h2>
              <p className="text-sm sm:text-base text-surat-green-50/85 leading-relaxed text-pretty">
                Gunakan akun SSO kampus Anda untuk mengakses agenda naskah dinas, atau pakai
                fitur verifikasi instan untuk memvalidasi keaslian dokumen ber-QR Code.
              </p>
            </div>
            <div className="shrink-0 flex flex-wrap justify-center md:justify-end gap-3">
              {user ? (
                <Link
                  to={user.role === 'admin' || user.role === 'dosen' ? '/admin/surat' : '/'}
                  className="min-h-[44px] inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white hover:bg-surat-green-50 text-surat-green-dark font-bold text-sm transition-colors"
                >
                  <span>
                    {user.role === 'admin' || user.role === 'dosen'
                      ? 'Panel Agenda Surat'
                      : 'Beranda Utama'}
                  </span>
                  <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="min-h-[44px] inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white hover:bg-surat-green-50 text-surat-green-dark font-bold text-sm transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" aria-hidden="true" />
                  <span>Masuk Akun SSO</span>
                </Link>
              )}
              <Link
                to="/verifikasi"
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-transparent hover:bg-white/10 border border-white/40 text-white font-semibold text-sm transition-colors"
              >
                <ShieldCheckIcon className="w-4 h-4" aria-hidden="true" />
                <span>Cek Dokumen QR</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
