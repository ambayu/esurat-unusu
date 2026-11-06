# TYPOGRAPHY SYSTEM : E-SURAT UNUSU

Standar tipografi resmi aplikasi E-Surat UNUSU menggunakan font keluarga **Plus Jakarta Sans** (dengan fallback Inter dan sistem sans-serif).

---

## 1. Font Family & Weight

- **Primary Font**: `'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Tersedia Weights**:
  - `400` (Regular): Teks surat, isi perihal, deskripsi naskah
  - `500` (Medium): Label input form, teks navigasi
  - `600` (Semibold): Subheading section, tombol aksi, header kolom tabel
  - `700` (Bold): Judul panel (`AdminPanelTemplate`), angka metrik persuratan
  - `800` (Extra Bold): Hero heading beranda publik

---

## 2. Type Scale Table

| Level Elemen | Ukuran Font | Weight | Tracking & Leading | Penggunaan Utama |
|---|---|---|---|---|
| **Hero Heading** | `text-3xl sm:text-4xl lg:text-5xl` | 700 / 800 | `tracking-tight leading-tight` | Header utama landing page publik |
| **Page Title** | `text-xl sm:text-2xl` (20–24px) | 700 | `tracking-normal` | Judul halaman pada `AdminPanelTemplate` |
| **Section Title** | `text-sm sm:text-base` (14–16px) | 700 | `tracking-normal` | Header card grup form atau widget |
| **Card / Widget Subtitle** | `text-xs` (12px) | 400 | `leading-relaxed` | Deskripsi di bawah judul card |
| **Body Text** | `text-xs sm:text-sm` (12–14px) | 400 | `leading-normal` | Isi perihal, catatan disposisi |
| **Form Label** | `text-xs sm:text-sm` (12–13px) | 500 / 600 | Normal | Label input pengirim, tujuan, nomor surat |
| **Table Head** | `text-xs` (12px) | 600 | `uppercase tracking-wider` | Kolom header tabel agenda surat |
| **Table Cell** | `text-xs sm:text-sm` (12–14px) | 400 / 500 | Normal | Isi data agenda, tanggal, status |
| **Badge / Status Tag** | `text-[10px] sm:text-xs` (10–12px) | 600 | `tracking-wide` | Label status selesai, diproses, ditolak |
| **Monospace / Code** | `text-xs font-mono` | 500 | Normal | Nomor agenda, token QR verifikasi, ID surat |

---

## 3. Aturan Keterbacaan & Kontras (WCAG AA)

1. **Kontras Rasio**: Teks utama `#0F172A` atau `#334155` di atas latar `#FFFFFF` dan `#F8FAFC` memenuhi standar WCAG AAA (> 7:1).
2. **Keterbacaan Nomor Resmi**: Nomor surat resmi (misal: `042/UNUSU/WR1/KM/2026`) dan token verifikasi harus memakai font monospace (`font-mono`) agar angka '0' dan huruf 'O' mudah dibedakan oleh staf tata usaha.
3. **Panjang Baris**: Ringkasan perihal dan disposisi dibatasi agar tidak meluap horizontal tanpa truncate atau wrap yang rapi.
