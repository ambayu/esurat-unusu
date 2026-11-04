# PROJECT RULES — E-SURAT UNUSU

Dokumen ini berisi aturan global mutlak yang berlaku di seluruh modul, halaman, API endpoint, dan komponen aplikasi E-Surat UNUSU.

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

---

## 5. Aturan Keamanan & Kode

1. **Role-Based Access Control (RBAC)**: Mutasi data sensitif (persetujuan surat, penomoran resmi, perubahan hak akses RBAC) wajib dilindungi di sisi client dan server.
2. **Secret Safety**: Jangan mengekspos kunci enkripsi, token JWT, file `.env`, atau data sensitif ke log client.
3. **Resilient Data Grids**: Seluruh tabel persuratan wajib aman terhadap nilai `null` atau `undefined` (`surat?.perihal`, `surat?.pengirim`).
