# CHANGELOG — E-SURAT UNUSU

## [2026-11-18] — Slider Hero Berbasis Berkas dengan Dukungan Video

### Added
- **Unggah video pada slider hero beranda.** Panel `ManajemenSliderEsurat` dan
  `LandingPage` kini menerima berkas video (MP4, WebM, OGG, MOV, M4V) hingga
  **50 MB**, di samping gambar (JPG, PNG, WebP) yang dibatasi **5 MB**.
- **`src/server/sliderMedia.ts`**: modul penyimpanan media slider — multer disk
  storage dengan nama berkas acak, daftar putih ekstensi,
  `periksaUkuranMediaSlider`, `urlMediaSlider`, `hapusMediaSliderFisik`, dan
  `namaBerkasMediaDariUrl`.
- **`src/client/lib/mediaSlider.ts`**: `JENIS_MEDIA`, `jenisMedia`,
  `validasiBerkasMedia`, `labelJenisMedia`, serta batas ukuran sisi klien.
- **Slide video menunggu selesai sebelum berpindah.** `LandingPage` tidak memakai
  timer untuk slide video: perpindahan terjadi saat peristiwa `ended` elemen
  `<video>`. Slide gambar tetap berotasi tiap 6 detik.

### Changed
- **Media slider tidak lagi disimpan sebagai base64.** Kolom `gambarUrl` kini hanya
  memuat path (`/storage/slider/<berkas>`) dan berkasnya disajikan lewat
  `express.static` pada `PREFIX_MEDIA_SLIDER`. Sebelumnya berkas dibaca
  `FileReader.readAsDataURL()` lalu dikirim sebagai string base64 di dalam body JSON.
  Skema database tidak berubah.
- **Endpoint `POST`/`PUT` `/api/admin/sliders` menerima `multipart/form-data`**
  (`berkas`), bukan lagi JSON berisi `gambarUrl`. Berkas lama dihapus dari disk
  setelah pembaruan berhasil; `DELETE` menghapus berkas setelah baris hilang.
- **`src/client/services/api.ts`**: `createAdminSlider`/`updateAdminSlider` mengirim
  `FormData` dengan `Content-Type` dikosongkan agar peramban menambahkan `boundary`.
- **Tombol `Tambah Foto Slider` menjadi `Tambah Data`** dan kartu daftar menampilkan
  label jenis media.
- **`multer` (`^2.5.0`) dan `@types/multer`** ditambahkan sebagai dependensi baru.

## [2026-11-09] — Desentralisasi RBAC, Auto-Provisioning Pengguna, & Penyelarasan Callback

### Added
- **Desentralisasi Penuh RBAC**: Mengaktifkan relasi junction `user_roles` dan `role_permissions` di database lokal E-Surat.
- **Seeder Domain Granular**: Menyemai permissions persuratan masuk/keluar, disposisi naskah dinas, jenis surat, dan peran default civitas (`admin`, `dosen`, `mahasiswa`).

### Changed
- **Endpoint SSO (`POST /api/auth/sso`)**: Membaca profil dan izin dari basis data lokal E-Surat dengan auto-provisioning pengguna baru ke tabel `users` dan `user_roles`.
- **Penyelarasan Callback per Lingkungan**: Mendukung URL callback mode lokal (`http://localhost:5175/sso/callback`) dan mode VPS (`/esurat/sso/callback`).
