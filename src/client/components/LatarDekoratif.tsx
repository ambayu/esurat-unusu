import React from 'react';

/**
 * LatarDekoratif: lapisan tekstur & bentuk untuk seksi berlatar terang.
 *
 * Halaman yang seluruhnya putih terasa datar dan belum selesai. Lapisan ini
 * memberi skala pada bidang kosong tanpa menambah warna baru: semuanya memakai
 * hijau E-Surat dengan opasitas rendah, atau garis netral.
 *
 * Tiga ragam dipilih berdasarkan isi seksi:
 * - `titik`  : grid titik halus. Netral, cocok untuk seksi naratif.
 * - `kisi`   : garis kisi 64px di-mask radial. Cocok untuk seksi tabular,
 *              karena garis mengisyaratkan struktur data.
 * - `lengkung`: lingkaran konsentris. Cocok untuk seksi bertahap, karena
 *              bentuk melingkar mengisyaratkan siklus.
 *
 * Selalu `aria-hidden` dan `pointer-events-none` agar tidak mengganggu
 * pembaca layar maupun klik.
 */
export const LatarDekoratif: React.FC<{
  ragam: 'titik' | 'kisi' | 'lengkung';
  /** Posisi vertikal bentuk, mis. 'top' atau 'bottom'. */
  posisi?: 'top' | 'bottom';
}> = ({ ragam, posisi = 'top' }) => {
  if (ragam === 'titik') {
    return (
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.55) 1px, transparent 0)',
            backgroundSize: '22px 22px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 100%)',
          }}
        />
        <div className="absolute -top-24 -right-24 size-[420px] rounded-full bg-surat-green/[0.04] blur-3xl" />
      </div>
    );
  }

  if (ragam === 'kisi') {
    return (
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgb(15 23 42 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(15 23 42 / 0.05) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 60% 70% at 50% 50%, black 20%, transparent 90%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 60% 70% at 50% 50%, black 20%, transparent 90%)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute -z-10 ${posisi === 'top' ? '-top-32' : '-bottom-40'} right-0 left-0 overflow-hidden`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 600"
        className="mx-auto h-auto w-full max-w-5xl text-surat-green/[0.07]"
        fill="none"
      >
        <circle cx="600" cy="300" r="120" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="600" cy="300" r="200" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="600" cy="300" r="280" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
};
