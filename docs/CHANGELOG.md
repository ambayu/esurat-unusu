# CHANGELOG — E-SURAT UNUSU

## [2026-11-09] — Desentralisasi RBAC, Auto-Provisioning Pengguna, & Penyelarasan Callback

### Added
- **Desentralisasi Penuh RBAC**: Mengaktifkan relasi junction `user_roles` dan `role_permissions` di database lokal E-Surat.
- **Seeder Domain Granular**: Menyemai permissions persuratan masuk/keluar, disposisi naskah dinas, jenis surat, dan peran default civitas (`admin`, `dosen`, `mahasiswa`).

### Changed
- **Endpoint SSO (`POST /api/auth/sso`)**: Membaca profil dan izin dari basis data lokal E-Surat dengan auto-provisioning pengguna baru ke tabel `users` dan `user_roles`.
- **Penyelarasan Callback per Lingkungan**: Mendukung URL callback mode lokal (`http://localhost:5175/sso/callback`) dan mode VPS (`/esurat/sso/callback`).
