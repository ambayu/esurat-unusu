# SHARED COMPONENTS REGISTRY — E-SURAT UNUSU

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
