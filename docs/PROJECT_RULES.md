# PROJECT RULES : E-SURAT UNUSU

Dokumen ini berisi aturan global mutlak yang berlaku di seluruh modul, halaman, API endpoint, dan komponen aplikasi E-Surat UNUSU.

## ATURAN SSO — Callback, Tiket, dan Diagnosis Gagal Login

Kontrak tetap antara Portal ONE UNUSU dan aplikasi ini. Melanggar satu butir cukup untuk membuat login gagal total, dan gejalanya sering menyerupai masalah lain. Katalog gejala–sebab–solusi lengkap: `one-unusu/docs/SSO_TROUBLESHOOTING.md`.

### A. Aturan Wajib Callback Browser

1. **Callback Berisi Token Saja**: URL callback hanya boleh berbentuk `{urlRedirect}?token=<64 heksadesimal>`. Dilarang menambahkan `client_id`/`client_key` di address bar. `client_id` dibaca dari env server (`SSO_CLIENT_ID`) dan dikirim hanya pada `POST {ONE}/api/v2/website/verify-token`.
2. **Tiket Sekali Pakai**: komponen callback wajib memakai penanda `useRef` (`sudahJalan`) agar `POST /api/auth/sso` tidak terkirim dua kali, termasuk oleh `React.StrictMode`. Dilarang mengulang penukaran tiket yang sudah gagal — minta pengguna memulai login baru. Dilarang memasang logika `cancelled` yang membuang hasil tukar yang sudah berhasil.
3. **Bersihkan Address Bar**: setelah tiket dibaca, jalankan `window.history.replaceState(null, '', window.location.pathname)`. Simpan tiket ke memori modul (mis. `TIKET_TERAKHIR`) **sebelum** pembersihan agar tetap tersedia bila komponen terpasang ulang.
4. **Basis API Relatif**: nilai cadangan `VITE_API_URL` wajib jalur relatif, tidak boleh `http://localhost:<port>/api`. Verifikasi: `grep -o 'http://localhost:[0-9]*/api' dist/**/*.js` harus kosong.
5. **Tiga Lapisan Sepakat**: `base` Vite, rute/redirect server Express, dan `urlRedirect` di tabel `sso_apps` harus menunjuk bentuk URL yang sama. Aplikasi yang memang di subpath boleh berawalan selama ketiganya sama.
6. **Cache Bukan Sumber Kebenaran**: `localStorage` hanya untuk tampilan awal. Keputusan navigasi setelah login wajib lewat verifikasi server; dilarang mengalihkan pengguna hanya karena ada data pengguna di `localStorage`.

### B. Gejala Cepat dan Arah Perbaikan

| Gejala | Sebab paling sering | Solusi |
|---|---|---|
| "Gagal menghubungi server untuk memverifikasi tiket SSO" | Bundel memuat `http://localhost:<port>/api` | Perbaiki `VITE_API_URL` + ubah nilai cadangan jadi `'/api'` |
| Login berhasil lalu terlempar ke `/login` | Tiket ditukar dua kali paralel | Guard `useRef` + `TIKET_TERAKHIR` + hapus penanda `cancelled` |
| Halaman callback kosong / URL berawalan ganda | `base` Vite/redirect backend berbeda dari `urlRedirect` | Samakan ketiga lapisan pada akar domain |
| Konsol: *MIME type 'text/html' is not executable* | Aset `.js` dibalas `index.html` | Samakan `base` build dengan lokasi aset yang dilayani nginx |
| "Parameter tiket autentikasi SSO tidak lengkap" padahal URL membawa token | Komponen terpasang ulang setelah `replaceState` | Simpan tiket ke memori modul sebelum membersihkan URL |
| Tiket terbit tapi `isUsed = false` selamanya | Browser tidak pernah menjalankan callback (bundel gagal dimuat) | Periksa pemuatan bundel dulu, bukan logika callback |

### C. Prosedur Wajib Saat SSO Dilaporkan Gagal

1. Catat gejala persis (teks pesan, URL akhir, halaman) sebelum menyentuh kode.
2. Cari gejala yang sama di tabel ringkas `one-unusu/docs/SSO_TROUBLESHOOTING.md` §1, lalu **jalankan langkah pembuktian** entri tersebut.
3. Terapkan solusi, lalu jalankan verifikasi entri yang sama.
4. Bila gejala belum pernah tercatat, tambahkan entri baru (gejala, sebab, pembuktian, solusi, verifikasi) pada commit yang sama dengan perbaikannya.

---

## 1. Aturan Tata Kelola Halaman & Template (Mandatory)

> **"Every page must use the correct page template and shared components. Admin panels must use AdminPanelTemplate. Duplicating UI structure that already exists in a shared template is forbidden."**

1. **Admin Panel Khusus**: Panel administrasi (`/admin/*`) wajib dibungkus dalam `AdminLayout` dengan `AdminPanelTemplate` sebagai container kartu utama. Dilarang merender halaman admin tanpa struktur kontainer terstandar.
2. **Reuse Shared Components**: Komponen berulang seperti `CardContainer`, `EmptyState`, `ErrorState`, tabel, filter toolbar, dan status badge wajib menggunakan shared components di `src/client/components/`.
3. **Konfigurasi, Bukan Duplikasi**: Setiap halaman hanya bertanggung jawab atas logika data, kolom tabel, aksi, dan alur permohonan/disposisi. Struktur visual berasal dari shared template.

---

## 2. Aturan Form Section & Card Layout

1. **Labels & Fields Inside Card**: Setiap grup input form registrasi surat (Informasi Dokumen, Pengirim & Tujuan, Berkas Lampiran, Metadata Disposisi) **wajib dibungkus di dalam kartu (`CardContainer` atau kontainer border terstandar)**.
2. **Dilarang Form Mengambang**: Dilarang meletakkan label, input, atau grup form langsung di atas background canvas polos tanpa batas visual kontainer yang jelas.
3. **Card Heading Wajib**: Setiap grup form harus memiliki heading section yang jelas dan ringkas.
4. **Action Button Placement**: Tombol aksi (Kirim / Simpan Draft / Batal) ditempatkan pada bar aksi terstruktur, bukan mengambang tanpa penahan visual.

---

## 3. Aturan Desain & Visual UI (UNUSU Green Palette)

1. **Palette Terikat Ketat**:
   - Primary Green: `#0A5C36` (`surat-green`)
   - Dark Green: `#064226` (`surat-green-dark`)
   - Light Green: `#117A4A` (`surat-green-light`)
   - Accent Gold: `#D4AF37` (`surat-gold`)
   - Soft Pale Green: `#F0FDF4` (background badge, highlight bar, welcome container)
   - Slate Ramp: `#0F172A`, `#1E293B`, `#475569`, `#64748B`, `#94A3B8`, `#CBD5E1`, `#F1F5F9`, `#F8FAFC`
2. **Typography**: Menggunakan font utama **Plus Jakarta Sans / Inter**. Skala judul halaman 20–24px, section 14–16px, body 12–14px, badge/metadata 10–12px.
3. **Elevation & Border**: Hindari bayangan berlebihan. Gunakan border `#CBD5E1` yang presisi dengan bayangan halus (`shadow-xs` / `shadow-2xs`).
4. **Touch Target**: Seluruh tombol, link, dan trigger aksi interaktif wajib memenuhi batas minimal 44px (`min-h-[44px] min-w-[44px]`).

---

## 4. Aturan Fungsional & Bisnis Persuratan

1. **SSO-Only Login**: Halaman `/login` hanya menyediakan satu tombol masuk bergaya tombol utama ONE UNUSU (`bg-[#166534]`, `rounded-[8px]`, `py-3.5`, `font-semibold`) yang mengarah ke `/authorize?client_id=esurat-unusu`. Dilarang menyediakan formulir kata sandi lokal atau pintasan "Masuk Cepat sebagai Admin"; endpoint login lama (`/api/auth/login`, `/api/auth/dev-admin`) dijawab `410 Gone` oleh server.
2. **Verifikasi Publik Dokumen**:
   - Rute publik `/verifikasi` dan `/verifikasi/:token` harus selalu dapat diakses oleh publik/guest tanpa memicu redirect 401 atau login loop.
   - Status verifikasi dokumen harus membedakan secara tegas dokumen sah (`status === 'selesai'`) dengan draft atau dokumen yang ditolak.
3. **Alur Disposisi & Tata Naskah**:
   - Surat Masuk dan Surat Keluar memiliki siklus hidup: `draft` -> `diajukan` -> `proses` -> `selesai` / `ditolak`.
   - Perubahan status wajib diverifikasi terhadap hak akses role (`admin`, `staff`, `dosen`).
4. **Penyimpanan Berkas Lampiran**:
   - Lampiran naskah dinas diakses melalui resolver URL aman `getAssetUrl()` untuk mendukung sub-path reverse proxy.
   - Fallback rendering wajib disediakan jika preview dokumen tidak tersedia.

5. **Pembedaan URL Callback (Local Dev vs VPS)**:
   - Lingkungan lokal: `http://localhost:5175/sso/callback`.
   - Lingkungan VPS / Produksi: `https://unusu.ac.id/esurat/sso/callback` (atau sesuai konfigurasi reverse proxy).
   - Diatur terpusat di seeder portal ONE UNUSU melalui `npm run db:sso-dev-urls` / `npm run db:sso-vps-urls`.

---

## 5. Aturan Keamanan & Kode

1. **Permission-Based Access Control (PBAC) & Desentralisasi**:
   - E-Surat UNUSU mengelola otorisasi lokal mandiri melalui relasi `users`, `roles`, `permissions`, `role_permissions`, dan `user_roles`.
   - Endpoint `POST /api/auth/sso` memvalidasi izin masuk SSO, kemudian secara otomatis memetakan/mendaftarkan akun pengguna ke tabel lokal `users` dan `user_roles` (auto-provisioning).
   - Token JWT sesi lokal diterbitkan dengan menyertakan permissions lokal hasil resolusi database internal E-Surat.
   - Dilarang mengandalkan pengecekan nama peran mentah (`role === 'ADMIN_ESURAT'`). Peran admin aplikasi kaku telah dihapus dari portal pusat.
   - SUPERADMIN memiliki izin masuk secara global ke seluruh aplikasi cabang. Super Administrator menautkan peran dan izin di portal SSO.
   - Mutasi data sensitif (persetujuan surat, penomoran resmi, disposisi) wajib diverifikasi berdasarkan hak izin di sisi server.
2. **Secret Safety**: Jangan mengekspos kunci enkripsi, token JWT, file `.env`, atau data sensitif ke log client.
3. **Resilient Data Grids**: Seluruh tabel persuratan wajib aman terhadap nilai `null` atau `undefined` (`surat?.perihal`, `surat?.pengirim`).
