# E-Surat UNUSU - Persuratan & Disposisi Digital

Sistem Informasi Tata Naskah Dinas, Pengajuan Surat Akademik/Kepegawaian, dan Disposisi Berjenjang untuk Universitas Nahdlatul Ulama Sumatera Utara berbasis **Vite React + Node.js Express + Prisma ORM (MySQL)**.

---

## 🚀 Fitur Utama

1. **Pengajuan Surat Online**:
   * Surat Keterangan Aktif Kuliah (SKA).
   * Surat Pengantar Izin Riset / Tugas Akhir / Magang.
   * Surat Tugas Dosen & Tenaga Kependidikan.
2. **Alur Disposisi Naskah**:
   * Disposisi berjenjang antar unit (Rektorat, Fakultas/Dekanat, BAAK, Prodi).
   * Instruksi pimpinan dan pelacakan deadline tindak lanjut.
3. **Penerbitan Nomor Surat Resmi & Tanda Tangan Elektronik (TTE)**.
4. **Verifikasi Keabsahan Dokumen via QR Token**:
   * Masyarakat dan pihak eksternal dapat memvalidasi keaslian surat melalui token QR unik secara instan.

---

## 🛠️ Tech Stack
* **Frontend (`client/`)**: Vite React 18, TypeScript, Tailwind CSS, Lucide Icons, React Router v6.
* **Backend (`server/`)**: Node.js Express, TypeScript, Prisma ORM.
* **Database**: MySQL (`esurat_unusu_db`).
* **Environment**: 1 File terpusat di root (`esurat-unusu/.env`).

---

## ⚡ Cara Menjalankan

1. **Instal Dependensi**:
   ```bash
   npm install
   npm install --prefix server
   npm install --prefix client
   ```

2. **Setup Database & Seeder**:
   Konfigurasi database di `.env` root, lalu jalankan:
   ```bash
   cd server
   npx prisma generate
   npx prisma migrate dev --name init_esurat
   npm run prisma:seed
   ```

3. **Jalankan Aplikasi**:
   ```bash
   npm run dev
   ```
   * Frontend: `http://localhost:5175`
   * Backend REST API: `http://localhost:5002/api`
