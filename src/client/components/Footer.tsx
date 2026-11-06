import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowTopRightOnSquareIcon,
  EnvelopeIcon,
  QrCodeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

/** Tautan mutu layanan di kolom pertama footer. */
const TAUTAN_LAYANAN = [
  { label: 'Cek Keaslian Dokumen', to: '/verifikasi', internal: true },
  { label: 'Masuk Akun SSO', to: '/login', internal: true },
  { label: 'Portal ONE UNUSU', to: 'https://unusu.bpp-developer.com/', internal: false },
  { label: 'Situs Resmi Kampus', to: 'https://unusu.ac.id', internal: false },
];
/** Ringkasan alur yang bisa dipakai pengunjung tanpa masuk akun. */
const TAUTAN_BANTUAN = [
  { label: 'Verifikasi Publik', to: '/verifikasi' },
  { label: 'Masuk Akun SSO', to: '/login' },
];

/**
 * Footer publik E-Surat UNUSU.
 *
 * Sebelumnya footer hanya satu baris teks hak cipta di atas latar putih, sehingga
 * halaman terasa terpotong. Footer kini berlatar hijau tua agar menutup halaman
 * dengan identitas yang sama seperti navbar, dan memuat tiga kolom berguna:
 * identitas layanan, tautan, serta keterangan kontak.
 *
 * Semua tautan diberi tinggi minimum 44px supaya memenuhi ambang tap target.
 */
export const Footer: React.FC = () => {
  const tahun = new Date().getFullYear();

  return (
    <footer className="bg-surat-green-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          {/* Kolom 1: identitas */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[10px] bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <EnvelopeIcon className="w-4.5 h-4.5 text-surat-gold" aria-hidden="true" />
              </div>
              <div className="leading-tight">
                <div className="flex items-baseline gap-1">
                  <span className="font-extrabold text-[15px] tracking-tight text-white">E-SURAT</span>
                  <span className="font-extrabold text-[15px] tracking-tight text-surat-gold">UNUSU</span>
                </div>
                <p className="text-[10px] font-medium text-surat-green-50/80">
                  Persuratan &amp; Disposisi Digital
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-surat-green-50/80 max-w-sm text-pretty">
              Sistem tata naskah dinas digital Universitas Nahdlatul Ulama Sumatera Utara.
              Mengelola surat masuk, surat keluar, disposisi pimpinan, dan pengarsipan dokumen resmi.
            </p>

            <div className="flex items-start gap-2.5 pt-1">
              <ShieldCheckIcon className="w-4 h-4 mt-0.5 shrink-0 text-surat-gold" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-surat-green-50/70">
                Setiap dokumen terbit dilengkapi kode keaslian yang dapat diverifikasi
                secara mandiri oleh instansi tujuan.
              </p>
            </div>
          </div>

          {/* Kolom 2: layanan */}
          <nav className="md:col-span-4" aria-labelledby="footer-layanan">
            <h2
              id="footer-layanan"
              className="text-xs font-bold uppercase tracking-[0.14em] text-surat-gold mb-2"
            >
              Layanan
            </h2>
            <ul>
              {TAUTAN_LAYANAN.map((tautan) => (
                <li key={tautan.label}>
                  {tautan.internal ? (
                    <Link
                      to={tautan.to}
                      className="inline-flex items-center min-h-[44px] text-sm text-surat-green-50/80 hover:text-white transition-colors"
                    >
                      {tautan.label}
                    </Link>
                  ) : (
                    <a
                      href={tautan.to}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 min-h-[44px] text-sm text-surat-green-50/80 hover:text-white transition-colors"
                    >
                      <span>{tautan.label}</span>
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Kolom 3: pintasan & verifikasi */}
          <div className="md:col-span-3 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-surat-gold mb-2">
              Pintasan
            </h2>
            <ul>
              {TAUTAN_BANTUAN.map((tautan) => (
                <li key={tautan.label}>
                  <Link
                    to={tautan.to}
                    className="inline-flex items-center min-h-[44px] text-sm text-surat-green-50/80 hover:text-white transition-colors"
                  >
                    {tautan.label}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              to="/verifikasi"
              className="mt-2 inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg bg-surat-gold hover:bg-[#c5a132] text-surat-green-dark text-sm font-bold transition-colors"
            >
              <QrCodeIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Pindai QR Surat</span>
            </Link>
          </div>
        </div>

        {/* Garis penutup hak cipta */}
        <div className="mt-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-surat-green-50/70">
            &copy; {tahun} E-Surat UNUSU. Universitas Nahdlatul Ulama Sumatera Utara.
          </p>
          <p className="text-xs text-surat-green-50/70">
            Tata Naskah &amp; Disposisi Elektronik
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
