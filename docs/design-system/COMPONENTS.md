# SHARED COMPONENTS REGISTRY : E-SURAT UNUSU

Dokumen ini mencatat seluruh komponen bersama yang wajib digunakan ulang di seluruh rute aplikasi E-Surat UNUSU. Dilarang menduplikasi struktur UI ini dari scratch.

---

## 1. Komponen Layout & Kontainer

### `AdminLayout` (`src/client/components/AdminLayout.tsx`)
- **Tanggung Jawab**: Kerangka induk seluruh halaman administratif panel persuratan (`/admin/*`).
- **Fitur Utama**:
  - Sidebar responsif dengan drawer mobile (`sidebarOpen`) dan fitur ciut (`collapsed`).
  - Navigasi item terstruktur: Dashboard, Jenis Surat & Template, Surat Masuk, Surat Keluar, Semua Agenda Surat, Verifikasi Dokumen QR, Manajemen Pengguna & RBAC.
  - Topbar sticky dengan breadcrumbs dinamis, profil pengguna, dan tombol logout aman.
  - Memastikan tap target min 44px pada setiap tombol interaktif.

### `AdminPanelTemplate` (`src/client/components/AdminPanelTemplate.tsx`)
- **Tanggung Jawab**: Kontainer utama halaman admin standar UNUSU (selaras dengan LPPM & One UNUSU).
- **Styling**: `bg-white border border-[#CBD5E1] rounded-[16px] shadow-xs`.
- **Props**:
  - `title`: string judul halaman
  - `description`: string deskripsi ringkas
  - `badge?`: React.ReactNode (lencana peran atau status)
  - `actions?`: React.ReactNode (tombol aksi header seperti Tambah Surat, Export)
  - `children`: React.ReactNode (konten halaman)

### `CardContainer` (`src/client/components/CardContainer.tsx`)
- **Tanggung Jawab**: Kontainer kartu data dan sub-bagian form (Part 10.8).
- **Styling**: `bg-white rounded-[14px] border border-[#CBD5E1] shadow-2xs`.
- **Props**:
  - `title?`: string judul kartu
  - `subtitle?`: string subjudul kartu
  - `badge?`: React.ReactNode
  - `actions?`: React.ReactNode
  - `children`: React.ReactNode

### `UserAuthorityCard` (`src/client/components/UserAuthorityCard.tsx`)
- **Tanggung Jawab**: Kartu otoritas pengguna di panel admin, menampilkan empat atribut identitas sesi secara seragam: `USERNAME`, `HAK AKSES`, `UNIT KERJA`, dan `STATUS AKUN`.
- **Styling**: `bg-white border border-[#CBD5E1] rounded-[16px]`, ikon dari `@heroicons/react/24/outline`.
- **Props**:
  - `user`: objek sesi (`nama`, `username`, `role`, `roleLabel`, `email`, `prodi`, `fakultas`, `unitKerja`, `statusAkun`)
  - `roleLabel?`: label hak akses hasil pemetaan (menimpa `user.roleLabel`)
  - `className?`: kelas tambahan
- **Aturan Pemakaian**: Wajib dipakai di halaman beranda panel admin setiap aplikasi turunan UNUSU. Unit kerja diambil berurutan `unitKerja → prodi → fakultas`; status akun default `Aktif` bila data belum tersedia. Dilarang menduplikasi markup empat baris ini di halaman lain.

---

## 2. Komponen Status, Feedback & State

### `EmptyState` (`src/client/components/EmptyState.tsx`)
- **Tanggung Jawab**: Menampilkan pesan informatif ketika data tabel atau daftar surat kosong.
- **Fitur**: Icon tematik, pesan penjelasan ramah pengguna, dan tombol tindakan (CTA) opsional.

### `ErrorState` (`src/client/components/ErrorState.tsx`)
- **Tanggung Jawab**: Menampilkan visual error ketika permintaan data jaringan gagal.
- **Fitur**: Pesan kendala, rincian teknis tersembunyi/ringkas, dan tombol "Coba Lagi" (retry callback).

---

## 3. Komponen Navigasi Publik & Branding

### `Navbar` (`src/client/components/Navbar.tsx`)
- **Tanggung Jawab**: Bar navigasi atas untuk halaman publik (`/`, `/verifikasi`, `/login`).
- **Fitur**: Logo UNUSU, tautan ke beranda, modul verifikasi dokumen, dan tombol login/masuk ke panel.

### `OneUnusuMark` (`src/client/components/OneUnusuMark.tsx`) & `AnimatedFlatSsoLogo`
- **Tanggung Jawab**: Lambang identitas visual resmi UNUSU dan integrasi Single Sign-On.

---

## 4. Komponen Laporan & Grafik

### `LaporanCharts` (`src/client/components/LaporanCharts.tsx`)
- **Tanggung Jawab**: Kumpulan komponen grafik ringkas untuk dashboard panel, dibangun **murni dengan SVG dan CSS** : tanpa library chart eksternal, sehingga ukuran bundle tetap ringan dan tidak menambah dependensi baru.
- **Alasan tidak memakai library**: grafik dashboard bersifat ringkasan (bukan analitik interaktif), dan palette harus mengikuti warna aplikasi masing-masing.
- **Komponen yang tersedia**:
  | Komponen | Kegunaan |
  | --- | --- |
  | `ReportCard` | Kartu pembungkus laporan (judul + subjudul + aksi opsional) |
  | `MetricTile` | Kartu metrik angka besar dengan ikon & aksen warna |
  | `DonutChart` | Proporsi antar kategori (mis. status surat, kondisi fasilitas) |
  | `BarChart` | Perbandingan kategori dengan bar horizontal |
  | `ColumnChart` | Tren per periode dengan kolom vertikal |
  | `TrendChart` | Tren waktu dengan area lembut (SVG path) |
  | `StackedBar` | Komposisi satu batang bertingkat |
  | `GaugeRing` | Capaian persentase tunggal berbentuk cincin |
  | `ActivityFeed` | Daftar kejadian terbaru bersusun waktu |
- **Aksesibilitas**: Setiap grafik memakai `role="img"` + `aria-label` yang merangkum datanya; nilai juga tetap ditampilkan sebagai teks sehingga tidak bergantung pada warna saja.
- **Aturan Pemakaian**: Dashboard setiap aplikasi **wajib** menampilkan laporan/grafik ringkas untuk tiap menu, dan **dilarang** menyertakan panel aksi cepat (tombol pintas tambah/input) di dashboard. Navigasi tetap melalui sidebar.

---

## 5. Komponen Landing Page

### Seksi Tentang Platform (inline di `LandingPage.tsx`)
- **Tanggung Jawab**: Seksi **Tentang Platform** pada landing dengan pola baku: teks di kiri, gambar di kanan. Ditulis langsung di halaman karena hanya punya satu pemakaian; komponen pembungkus `TentangPlatform.tsx` sudah dihapus.
- **Komposisi kiri**: eyebrow bilah tegak, judul seksi, dua paragraf penjelas, dan tiga poin centang.
- **Komposisi kanan**: potret operator (`object-contain` agar siluet tidak ter-crop) di atas plakat gradien membulat `rounded-[40px]`.
- **Aturan Aset**: path selalu lewat `getAssetUrl()` supaya benar pada sub-path `/esurat/`. Dilarang memakai gambar dengan branding institusi lain.
- **Aturan Eyebrow**: dilarang memakai pil `rounded-full` berlabel pengulang judul. Eyebrow ditulis sebagai bilah tegak `border-l-2 border-surat-green pl-3`; pada latar gelap `border-white/60`.

### `LatarDekoratif` (`src/client/components/LatarDekoratif.tsx`)
- **Tanggung Jawab**: Lapisan tekstur latar untuk seksi berlatar terang agar halaman tidak terasa datar, tanpa menambah warna baru.
- **Ragam**:
  - `titik`: grid titik 22px dengan mask radial. Untuk seksi naratif.
  - `kisi`: garis kisi 64px ber-mask. Untuk seksi tabular, karena garis mengisyaratkan struktur data.
  - `lengkung`: tiga lingkaran SVG konsentris. Untuk seksi bertahap, karena bentuk melingkar mengisyaratkan siklus.
- **Aksesibilitas**: selalu `aria-hidden` dan `pointer-events-none`. Seksi induk wajib memakai `isolate overflow-hidden` agar bentuk tidak meluber.

### `Reveal` (`src/client/components/Reveal.tsx`) + `useReveal` (`src/client/hooks/useReveal.ts`)
- **Tanggung Jawab**: Memunculkan elemen saat memasuki viewport (geser 20px + fade 600ms).
- **Props `Reveal`**: `delay?` (ms), `className?`, `as?` (`div` | `li` | `section` | `article`).
- **Aturan Animasi**:
  - Animasi **sekali jalan**, tidak berulang saat scroll balik. Animasi yang berulang membuat halaman terasa gelisah.
  - Untuk efek berurutan dalam satu grid, isi `delay` dengan indeks dikali 70 sampai 120ms.
  - Semua elemen berbagi **satu** `IntersectionObserver` (`observerBersama()` + `WeakMap`), jadi biayanya konstan berapa pun jumlah elemen.
  - `threshold: 0` + `rootMargin: 0px 0px -80px 0px`: elemen setinggi viewport tetap memicu, dan animasi selesai sebelum elemen menyentuh tepi layar.
  - Mati total pada `prefers-reduced-motion: reduce` dan tetap menampilkan konten bila `IntersectionObserver` tidak tersedia.

---

## 6. Aturan Palet, Tipografi, dan Ikon

### Palet
- **Hitam, hijau tua, putih**. Hijau memakai token `surat-green` / `surat-green-dark` / `surat-green-light` beserta skala `50` dan `100`. `emerald-*` tidak dipakai lagi.
- **Gold (`surat-gold`) hanya aksen tipis**: garis eyebrow pada hero, aksen logo, dan sorotan. Dilarang sebagai warna latar kartu atau tombol utama.
- **Dilarang**: `blue-*`, `purple-*`, `indigo-*`, `violet-*`, `teal-*`. Warna status (masuk/keluar/disposisi) dibedakan lewat skala netral `slate`, bukan lewat warna baru.
- **Amber hanya untuk status** (menunggu, pending). Amber dekoratif dilarang.

### Tipografi
- `fontFamily.sans` dan `fontFamily.display` dideklarasikan di `tailwind.config.js` dan mengarah ke Plus Jakarta Sans. `<body>` memakai `font-sans`.
- **Dilarang `font-black`**. Weight 900 tidak dimuat dari Google Fonts sehingga browser mensintesisnya dan hasilnya berbeda antar-browser. Gunakan `font-extrabold` (800) sebagai bobot tertinggi.

### Ikon
- **Satu keluarga ikon: `@heroicons/react/24/outline`**. `lucide-react` sudah dihapus dari dependensi dan dilarang ditambahkan kembali.
- Dilarang ikon bernuansa sihir atau kilau (`Wand2`, sparkles). Ikon dipilih menurut fungsi, bukan hiasan.

### Aset & Bayangan
- Path aset wajib lewat `getAssetUrl()`; jangan hardcode `/images/...` karena aplikasi dipasang di sub-path `/esurat/`.
- **Dilarang `shadow-xs` dan `shadow-2xs`**: keduanya kelas Tailwind v4 dan tidak menghasilkan apa pun pada Tailwind 3.4. Pemisah kartu memakai border.
