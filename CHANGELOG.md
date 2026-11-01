# Changelog

Semua perubahan dan catatan rilis penting untuk proyek **E-Surat UNUSU** didokumentasikan di berkas ini.

Format pencatatan berpedoman pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan mengikuti standar arsitektur kualitas & anti-slop.

---

## [Unreleased] - 2026-11-02

- **Rapat QA: Verifikasi Terpadu Pemindahan Form Surat Masuk & Keluar ke Panel Admin & Pemurnian Landing Page (`cmvy72skg05m6uct4ekhmrand`)**:
  - **Verifikasi Task [cmvy72skg05m6uct4ekhmrand]**:
    - *Form Registrasi Surat Masuk & Keluar*: Berpindah sepenuhnya ke dalam Panel Admin pada rute `/admin/surat-form` (dengan parameter `?tipe=masuk` dan `?tipe=keluar`). Form menyediakan toggle dinamis mode surat, pemilihan template jenis naskah, nomor identitas pemohon, perihal, dan lampiran URL, dibungkus rapi dalam `AdminPanelTemplate` & `CardContainer`.
    - *Penyelarasan Tautan Agenda Persuratan (`SuratList.tsx`)*: Tombol "Input Surat Masuk" dan "Input Surat Keluar" pada `/surat` terhubung langsung menuju `/admin/surat-form?tipe=masuk` dan `/admin/surat-form?tipe=keluar` dengan pemenuhan target tap WCAG AA `min-h-[44px]`.
    - *Landing Page Informasi Murni*: `LandingPage.tsx` terverifikasi bersih dari seluruh elemen form transaksi (`<form>`), berfungsi murni sebagai etalase informasi publik, hero slider interaktif, keunggulan institusi, panduan alur dokumen, dan verifikasi keaslian naskah.
    - *Pemisahan Navigasi & Keamanan RBAC*: Navbar publik disembunyikan secara bersih di seluruh sub-rute `/admin/*` via dual-layer protection di `App.tsx` dan `Navbar.tsx`.
    - *Uji Otomasi Terpadu*: Seluruh test suite regresi repo (`adminSuratFormAudit.test.ts`, `navbarAdminAudit.test.ts`, `alurSuratAudit.test.ts`, `navigationAudit.test.ts`, `adminPanelLayoutAudit.test.ts`) lolos 100%.
  - **Kompilasi & Build Verifikasi Monolith**:
    - `npm run build:client` (Vite v6.4.5) dan `npm run build:server` (`tsc -p tsconfig.server.json`) sukses tanpa error maupun regresi tipe.

- **Audit Build & Validasi Fungsional Alur Persuratan, Disposisi & Persetujuan (`alurSuratAudit.test.ts`, `server/index.ts`, `SuratDetail.tsx`)**:
  - **Validasi Alur Pembuatan Naskah & Disposisi**:
    - Memverifikasi lifecycle lengkap naskah dinas: inisialisasi pengajuan naskah (`diajukan`), penomoran agenda otomatis, dan penerbitan token kriptografis keaslian QR.
    - Menguji pendelegasian lembar disposisi pimpinan ke unit kerja terkait (`tujuanUnit`, `instruksi`, `catatan`) serta auto-transisi status menjadi `diproses`.
    - Menguji pembaruan status persetujuan akhir (`disetujui` / `selesai`) disertai penomoran surat resmi dan penandatanganan elektronik (TTE).
    - Memvalidasi verifikasi publik keabsahan dokumen ber-QR code via `/api/verifikasi/:token` (memastikan dokumen berstatus `selesai` terverifikasi valid secara otomatis).
  - **Automated Test Suite**:
    - Membuat suite pengujian baru `alurSuratAudit.test.ts` (10/10 skenario lolos).
  - **Kompilasi & Build Verifikasi Monolith**:
    - Menjalankan kompilasi TypeScript dan bundling Vite (`npm run build:client` & `npm run build:server`) tanpa kesalahan tipe atau runtime bug.

- **Audit Navigasi Form Admin & Pembersihan Landing Page (`LandingPage.tsx`, `AdminSuratForm.tsx`, `AdminLayout.tsx`, `App.tsx`, `adminSuratFormAudit.test.ts`)**:
  - **Landing Page Informasi Bersih Tanpa Form Transaksi**:
    - Memverifikasi bahwa `LandingPage.tsx` murni menyajikan informasi, layanan hero slider interaktif, keunggulan tata kelola dokumen kampus, dan otentikasi QR.
    - Menghilangkan sepenuhnya elemen form transaksi penginputan surat (`<form>`) pada landing page publik.
    - Menyelaraskan seluruh tombol aksi CTA (Call To Action) agar mengarahkan pengguna ke rute otentikasi dan modul terkait (`/surat`, `/verifikasi`).
  - **Fungsionalitas Penuh Form Surat Masuk & Keluar di Panel Admin**:
    - Memverifikasi komponen `AdminSuratForm.tsx` untuk registrasi Surat Masuk dan pembuatan Surat Keluar/Naskah Dinas oleh admin dan tata usaha biro.
    - Menyediakan toggle cepat pemilihan mode Surat Masuk (Eksternal/In) dan Surat Keluar (Dinas/Out) dengan penyesuaian label otomatis.
    - Membungkus formulir di dalam `CardContainer` dan `AdminPanelTemplate` dengan border `#CBD5E1` serta tap target WCAG AA (`min-h-[44px]`).
    - Mengintegrasikan rute `/admin/surat-form` di dalam manifest `App.tsx` terproteksi RBAC (`allowedRoles={['admin', 'dosen']}`) di bawah `<AdminLayout />`.
    - Menyematkan tautan cepat "Input Surat Keluar" dan "Input Surat Masuk" pada sidebar navigasi `AdminLayout.tsx`.
  - **Automated Test Suite**:
    - Membuat suite pengujian baru `adminSuratFormAudit.test.ts` (14/14 lolos) memvalidasi kebersihan landing page dari elemen form serta kelengkapan operasional form registrasi surat masuk/keluar di panel admin.
  - **Verifikasi Build & Typecheck Monolith**:
    - `npm run build:client` (Vite v6.4.5) dan `npm run build:server` (`tsc -p tsconfig.server.json`) sukses 100% tanpa kesalahan tipe.

- **Audit & Pemisahan Visibilitas Navbar Publik vs Admin Panel (`App.tsx`, `Navbar.tsx`, `AdminLayout.tsx`, `navbarAdminAudit.test.ts`)**:
  - **Pemisahan Navigasi Antara Publik & Admin**:
    - Memverifikasi arsitektur routing kondisional di `App.tsx`: Navbar publik (`<Navbar />`) dan footer publik hanya dirender di luar rute admin (`!isAdminRoute`).
    - Menghadirkan pertahanan ganda (dual-layer guard) pada level komponen `Navbar.tsx` (`if (location.pathname.startsWith('/admin')) return null`) sehingga Navbar publik terisolasi dari seluruh rute administratif `/admin/*`.
    - Halaman Landing Page publik (`/`), formulir pengajuan (`/ajukan`), daftar surat (`/surat`), dan verifikasi QR (`/verifikasi`) tetap menampilkan Navbar publik secara normal dan responsif.
    - Halaman Admin Panel (`/admin`, `/admin/dashboard`, `/admin/jenis-surat`) secara eksklusif menggunakan sistem navigasi khusus `AdminLayout` dengan sidebar responsif, drawer mobile, dan header administratif mandiri tanpa gangguan elemen publik.
  - **Automated Test Suite**:
    - Membuat suite pengujian baru `navbarAdminAudit.test.ts` memvalidasi 16 skenario visibilitas navbar publik vs admin panel (16/16 lolos).
  - **Kompilasi & Build Verifikasi**:
    - `npm run build:client` (Vite v6.4.5) dan `npm run build:server` (`tsc -p tsconfig.server.json`) lulus 100% tanpa kesalahan tipe maupun regresi.

- **Audit & Verifikasi Komprehensif Admin Panel eSurat UNUSU (`AdminLayout.tsx`, `AdminDashboard.tsx`, `JenisSuratManagement.tsx`, `App.tsx`)**:
  - **Kesesuaian Desain & Layout dengan Standar LPPM UNUSU**:
    - Memverifikasi implementasi `AdminPanelTemplate` dengan rounded-[16px], border `#CBD5E1`, header bar terstruktur, dan action slot yang konsisten dengan template LPPM ONE UNUSU.
    - Memverifikasi keselarasan `CardContainer` (radius 14px `rounded-[14px]`, border `#CBD5E1`), `EmptyState`, dan `ErrorState` dengan tombol retry pada seluruh view admin.
    - Memastikan pemenuhan aksesibilitas WCAG AA (tap target `min-h-[44px]`, `min-w-[44px]`, aria-label lengkap, kontras teks).
  - **Integritas Routing & RBAC Admin**:
    - Memverifikasi manifest routing di `App.tsx`: `/admin`, `/admin/dashboard`, dan `/admin/jenis-surat` terproteksi RBAC (`allowedRoles={['admin', 'dosen']}`).
    - Akses unauthenticated dialihkan ke `/login` tanpa redirect loop; role mahasiswa dialihkan ke `/`. Rute root `/` tetap netral dan publik.
  - **Hasil Test Suites Otomasi (104/104 Assertions Lolos)**:
    - `adminPanelLayoutAudit.test.ts`: 13/13 lolos (struktur sidebar, menu links, 4 kartu metrik, sebaran status, resiliensi error).
    - `adminIntegrationAudit.test.ts`: 15/15 lolos (RBAC server-side, transisi status, TTE pejabat, in-app file preview, pagination metadata).
    - `adminCrudAudit.test.ts`: 7/7 lolos (pengajuan surat, penomoran resmi, disposisi unit kerja, verifikasi keabsahan QR).
    - `visualResponsivenessAudit.test.ts`: 12/12 lolos (multi-device 320px–1440px, layout responsive, overflow guard, pencegahan CLS).
    - `navigationAudit.test.ts`: 8/8 lolos (netralitas root, RBAC matrix, proteksi route admin, redirect wildcard).
    - `ssoLoginAudit.test.ts`: 8/8 lolos (flow autentikasi SSO terpusat, token expired handling, whitelist role).
    - `heroSliderAudit.test.ts`: 14/14 lolos (slider navigasi, pause on hover, mobile touch swipe gesture threshold 50px).
    - `photoRenderingAudit.test.ts`: 27/27 lolos (integritas aset, async decoding, fallback onError, static endpoint).
  - **Verifikasi Build Produksi & Typecheck**:
    - `npm run build:client` (Vite v6.4.5) sukses mentransformasikan 1974 modul tanpa error lint/type.
    - `npm run build:server` (`tsc -p tsconfig.server.json`) sukses mengompilasi backend tanpa error TypeScript.
    - Zero error regresi pada seluruh sistem monolith.

## [Unreleased] - 2026-11-01

- **Verifikasi Kualitas & Audit E2E Admin Panel E-Surat (`App.tsx`, `AdminLayout.tsx`, `AdminDashboard.tsx`, `JenisSuratManagement.tsx`, `adminPanelLayoutAudit.test.ts`, `adminIntegrationAudit.test.ts`, `adminCrudAudit.test.ts`)**:
  - **Verifikasi Kompilasi & Build Produksi Monolith**:
    - `npm run build:client` (Vite 6.4.5) selesai dalam 2.53s mentransformasikan 1973 modul tanpa error lint/type.
    - `npm run build:server` (`tsc -p tsconfig.server.json`) kompilasi backend bersih tanpa kesalahan tipe.
    - Full build `npm run build` sukses 100%.
  - **Sinkronisasi Routing Admin & Sidebar Navigation**:
    - Memastikan sinkronisasi routing manifest di `App.tsx` untuk `/admin`, `/admin/dashboard`, dan `/admin/jenis-surat` (`<JenisSuratManagement />`) terdaftar dalam nested route `<AdminLayout />` dengan proteksi peran (`allowedRoles={['admin', 'dosen']}`).
    - Memastikan rute `/admin` dan seluruh sub-rutenya terlindungi dari akses unauthenticated maupun role mahasiswa (diarahkan kembali ke `/` atau `/login` tanpa loop redirect).
  - **Hasil Eksekusi Test Suite Terotomasi**:
    - `navigationAudit.test.ts`: 7/7 lolos (validasi root landing netral, alur role-guard, redirect aman).
    - `ssoLoginAudit.test.ts`: 8/8 lolos (pertukaran SSO, penolakan token invalid, penanganan sesi kedaluwarsa).
    - `heroSliderAudit.test.ts`: 14/14 lolos (navigasi slider, autoplay pause hover/touch, gesture swipe mobile min 50px).
    - `visualResponsivenessAudit.test.ts`: 12/12 lolos (resolusi 320px–1440px, tap target WCAG AA, pencegahan CLS & overflow).
    - `photoRenderingAudit.test.ts`: 27/27 lolos (integritas aset PNG/SVG/wallpaper, fallback onError, decoding async).
    - `adminPanelLayoutAudit.test.ts`: 13/13 lolos (standar UI Container, metrics card, status distribution, error/retry states).
    - `adminCrudAudit.test.ts`: 7/7 lolos (pengajuan surat, approval tata usaha, penomoran resmi, disposisi unit kerja, QR check).
    - `adminIntegrationAudit.test.ts`: 15/15 lolos (RBAC admin endpoint, lifecycle surat, in-app file preview, pagination metadata).
    - Total: 103/103 assertions automated tests terverifikasi valid secara menyeluruh.


- **Implementasi & Audit UI/UX Layout Panel Admin serta Dashboard Persuratan (`AdminLayout.tsx`, `AdminDashboard.tsx`, `adminPanelLayoutAudit.test.ts`)**:
  - **Tata Letak Panel Admin Terstandardisasi (`AdminLayout.tsx`)**:
    - Menerapkan arsitektur layout terpisah untuk area administratif kampus (`/admin`) dengan sidebar navigasi responsif, mobile drawer dengan backdrop blur dan kontrol penutup.
    - Menghadirkan menu navigasi komprehensif: Ringkasan Dashboard, Surat Masuk, Surat Keluar, Semua Agenda Surat, dan Verifikasi Dokumen QR, serta tautan cepat ke Landing Page publik dan Form Pengajuan Surat.
    - Menyelaraskan kartu profil identitas pengguna aktif di sidebar dengan avatar, inisial nama fallback, indikator status online, dan tombol keluar sesi.
    - Memastikan seluruh tombol kontrol dan item navigasi memenuhi standar aksesibilitas WCAG AA (minimum tap target `min-h-[44px]` dan accessible `aria-label`).
  - **Standar UI Container & Resiliensi Dashboard (`AdminDashboard.tsx`)**:
    - Membungkus seluruh tampilan ringkasan metrik, sebaran status, dan daftar transaksi terbaru menggunakan komponen baku `CardContainer` (border `#CBD5E1`, radius 14px `rounded-[14px]`).
    - Menyajikan 4 kartu metrik utama: Surat Masuk, Surat Keluar, Status Pending, dan Disposisi Pimpinan dengan tautan filter langsung ke agenda persuratan.
    - Menampilkan panel distribusi status naskah (Diajukan, Diproses, Disetujui, Selesai, Ditolak) dan 2-kolom ringkasan berkas surat terbaru serta instruksi disposisi terakhir.
    - Mengintegrasikan penanganan `EmptyState` untuk catatan kosong dan `ErrorState` dengan tombol retry `onRetry={loadData}` bila terjadi kendala pengambilan data.
  - **Automated Test Suite & Verifikasi Build**:
    - Membuat suite pengujian baru `adminPanelLayoutAudit.test.ts` memvalidasi 13 poin integrasi struktur layout, metrik data, standar UI container, dan guard RBAC (13/13 test valid).
    - Menjalankan seluruh test suite regresi (`visualResponsivenessAudit.test.ts`, `ssoLoginAudit.test.ts`, `photoRenderingAudit.test.ts`, `navigationAudit.test.ts`, `heroSliderAudit.test.ts`, `adminIntegrationAudit.test.ts`, `adminCrudAudit.test.ts`, `adminPanelLayoutAudit.test.ts`) dengan hasil 100% lulus.
    - Memastikan proses build produksi klien dan server (`vite build` + `tsc -p tsconfig.server.json`) lolos bersih tanpa kesalahan tipe TypeScript.


- **Verifikasi Fungsionalitas & Integrasi Admin Panel (`adminIntegrationAudit.test.ts`, `SuratList.tsx`, `SuratDetail.tsx`, `server/index.ts`, `api.ts`)**:
  - **Otentikasi & Otorisasi Role Admin (RBAC Guard)**:
    - Verifikasi ketat role-based access control pada level API server (`/api/surat/:id/status`, `/api/surat/:id/disposisi`, `/api/admin/stats`): hanya mengizinkan role `admin` (dan `dosen` untuk ringkasan stats), serta menolak role `mahasiswa` (403 Forbidden) dan tamu unauthenticated (401 Unauthorized).
    - Menjaga proteksi antarmuka panel admin agar selaras dengan skema izin pengguna dan mencegah pembobolan otorisasi.
  - **Alur Pembaruan Status Surat & Disposisi**:
    - Memverifikasi siklus hidup naskah dinas: `diajukan` -> `diproses` -> `disetujui` -> `selesai` (penerbitan nomor surat resmi birokrasi & penandatanganan elektronik / TTE).
    - Memastikan form update status di `SuratDetail.tsx` menyediakan feedback jelas dan kontrol form yang responsif dengan tap-target WCAG AA.
  - **Pratinjau Berkas Lampiran Dokumen (In-App Document Preview)**:
    - Menambahkan modul pratinjau dokumen langsung di dalam aplikasi pada `SuratDetail.tsx` untuk berkas gambar (`.jpg`, `.png`, `.webp`, `.svg`) dan frame penampil berkas/PDF terintegrasi dengan resolver aset `getAssetUrl`.
    - Menyediakan tombol buka/unduh berkas lampiran dengan target minimum 44px (`min-h-[44px]`) dan `aria-label` ramah pembaca layar.
  - **Validasi Respons Filter & Pagination Data Surat**:
    - Memperbarui endpoint `GET /api/surat` pada `src/server/index.ts` untuk mendukung pagination (`page`, `limit`), kalkulasi metadata pagination (`total`, `totalPages`, `hasNextPage`, `hasPrevPage`), dan multi-field search (perihal, nama pemohon, prodi, nomor agenda, nomor surat).
    - Memperbarui interface `PaginationInfo` dan method `fetchSuratList` di `src/client/services/api.ts`.
    - Mengintegrasikan state pagination dinamis dan navigasi halaman (Sebelumnya / Selanjutnya) pada komponen `SuratList.tsx` dengan empty state terstandarisasi.
  - **Automated Test Suite & Build Verification**:
    - Membuat suite pengujian komprehensif `adminIntegrationAudit.test.ts` (15/15 test valid).
    - Memperbaiki pengujian responsivitas visual `visualResponsivenessAudit.test.ts` (12/12 valid) dan rendering foto `photoRenderingAudit.test.ts` (27/27 valid).
    - Verifikasi penuh produksi monolith (`npm run build`: `vite build` + `tsc -p tsconfig.server.json`) sukses tanpa error maupun peringatan tipe.

- **Penyempurnaan & Pengujian Fitur Admin Panel E-Surat (`AdminDashboard.tsx`, `SuratList.tsx`, `SuratDetail.tsx`, `server/index.ts`, `adminIntegrationAudit.test.ts`)**:
  - **Sistem Pagination & Server-Side Filtering (`src/server/index.ts`)**:
    - Memperbaiki parsing query parameter pencarian pada endpoint `GET /api/surat` sehingga mendukung pencarian multi-bidang (perihal, nama pemohon, prodi pemohon, nomor agenda, nomor surat).
    - Menghitung metadata pagination (`total`, `page`, `limit`, `totalPages`, `hasNextPage`, `hasPrevPage`) secara terintegrasi dengan filter status dan tipe surat.
  - **Tampilan Interaktif Berkas & Detail Naskah (`SuratDetail.tsx`)**:
    - Penambahan in-app document preview frame terstandardisasi untuk berkas bertipe PDF dan gambar (JPG/PNG/WEBP).
    - Penyediaan aksi cetak dokumen resmi (print preview) dan tombol verifikasi publik langsung ke `/verifikasi/:token`.
    - Integrasi lembar disposisi pimpinan dengan metadata penerima unit kerja, batas waktu tindak lanjut (deadline), dan catatan disposisi.
  - **Pengujian Terotomasi Admin Panel (`adminIntegrationAudit.test.ts`)**:
    - Menyusun test suite otomatis mencakup 15 assertions: autentikasi JWT admin, pembatasan RBAC role non-admin, transisi status naskah surat, penerbitan nomor surat resmi, TTE pejabat, disposisi ke unit kerja, in-app file preview, serta integritas pagination multi-halaman. 15/15 uji valid.

- **Audit Fungsionalitas & Verifikasi Build Panel Admin (`AdminDashboard.tsx`, `SuratList.tsx`, `SuratDetail.tsx`, `adminCrudAudit.test.ts`)**:
  - **Typecheck & Monolith Build**:
    - `npm run build:client` (Vite 6.4.5) sukses melakukan bundling produksi (1969 modules transformed) tanpa error.
    - `npm run build:server` (`tsc -p tsconfig.server.json`) sukses mengompilasi TypeScript backend bersih tanpa kesalahan tipe.
  - **Uji Alur Login & Proteksi Route Panel Admin (`App.tsx`, `navigationAudit.test.ts`)**:
    - Proteksi rute `/admin` dan `/dashboard` teruji aman: tamu (unauthenticated) otomatis diarahkan ke `/login`, role mahasiswa diarahkan ke root `/`, dan role admin/dosen berhak membuka `AdminDashboard`.
    - Akses root URL `/` (landing page) tetap netral tanpa redirect loop ke panel admin. 8/8 test navigasi lulus.
  - **Verifikasi Operasi CRUD Persuratan & Disposisi (`adminCrudAudit.test.ts`)**:
    - *Create*: Validasi pengajuan permohonan surat oleh civitas (mahasiswa/dosen/admin) dengan pembentukan otomatis nomor agenda dan token verifikasi QR kriptografis.
    - *Read/Filter*: Resiliensi data grid dan filter status persuratan ('diajukan', 'diproses', 'disetujui', 'ditolak', 'selesai') serta sanitasi pencarian teks bebas dari exception/null pointer.
    - *Update/Status*: Mutasi status naskah beserta nomor surat resmi dan nama penandatangan (TTE digital) terlindungi oleh RBAC guard server-side dan client-side (hanya admin/tata usaha).
    - *Disposisi*: Penugasan naskah oleh pimpinan terhubung rapi ke unit kerja tujuan dengan integritas relasi foreign key dan auto-transisi status surat menjadi 'diproses'.
    - *Verifikasi Publik*: Pengecekan token QR keabsahan dokumen via `/api/verifikasi/:token` membedakan secara ketat dokumen valid (berstatus selesai) versus draf belum selesai.
    - 7/7 automated assertions pada `adminCrudAudit.test.ts` berhasil lulus.
  - **Koreksi Tautan Navigasi & Konsistensi UI**:
    - Menyelaraskan tombol navigasi kembali pada `SuratDetail.tsx` agar mengarah ke `/surat` (daftar agenda persuratan).
    - Memastikan seluruh tag `<img>`, avatar, dan slider banner di `LandingPage.tsx` konsisten dengan fallback error boundary `.svg`, loading lazy/async decoding, dan pencegahan CLS.


- **Investigasi & Perbaikan Path Rendering Foto Profil & Berkas Lampiran (`Navbar.tsx`, `SuratDetail.tsx`, `api.ts`, `server/index.ts`)**:
  - **Static Serving Endpoints & Subpath Aliasing**:
    - Memperkuat konfigurasi Express static serving di `src/server/index.ts` dengan penambahan pemetaan subpath `/esurat/berkas`, `/esurat/foto`, `/esurat/uploads`, `/esurat/images`, dan `/esurat/public` agar kompatibel penuh pada deployment reverse proxy Nginx.
    - Menambahkan `ensureDirectories()` otomatis pada saat inisialisasi server untuk menjamin keberadaan folder fisik `uploads/`, `uploads/berkas/`, dan `uploads/foto/` tanpa crash saat upload atau file serving.
  - **Helper `getAssetUrl` Lebih Tangguh**:
    - Memperbarui helper `getAssetUrl` di `src/client/services/api.ts` agar menangani URL absolut (`http://`, `https://`, `data:`), mencegah duplikasi prefix `BASE_URL`, dan mengembalikan path aset yang aman.
    - Menambahkan tipe opsional `lampiranUrl?: string | null` ke interface model `SuratItem` pada `api.ts`.
  - **Tampilan Foto Profil Sivitas & Fallback (`Navbar.tsx`)**:
    - Menambahkan atribut dimensi eksplisit `width={32}`, `height={32}`, `loading="lazy"`, dan `decoding="async"` pada tag `<img>` avatar profil sivitas guna mencegah Cumulative Layout Shift (CLS).
    - Memastikan fallback inisial nama sivitas (avatar circle) tetap aktif secara anggun jika foto bernilai null, string kosong, atau gagal dimuat via event `onError`.
  - **Pengunduhan & Pembukaan Berkas Lampiran Surat (`SuratDetail.tsx`)**:
    - Memperbarui tampilan kontainer berkas lampiran dengan ikon terstandardisasi, preview nama/path file, serta tombol aksi 'Unduh / Buka Berkas' yang memenuhi standar WCAG AA (min 44px tap target) dan atribut aksesibilitas `aria-label`.
  - **Automated QA Assertions (`photoRenderingAudit.test.ts`)**:
    - Menambahkan pengujian otomatis terhadap endpoint static uploads server, fungsi `ensureDirectories`, format URL lampiran, serta kelengkapan dimensi & atribut aksesibilitas pada avatar dan tombol lampiran. Seluruh 27/27 uji valid.

- **Verifikasi Rendering Foto & Alur Navigasi Terkait (`LandingPage.tsx`, `Login.tsx`, `Navbar.tsx`, `photoRenderingAudit.test.ts`)**:
  - **Integritas Aset Fisik Gambar**: Memastikan seluruh berkas foto raster dan aset visual fallback SVG (`hero-slider-1.png`, `hero-slider-2.png`, `hero-slider-3.png`, `campus-login.png`, dan SVG pendukung) tersedia secara valid di direktori `public/images/` dan `public/assets/` tanpa missing file.
  - **Pencegahan Broken Image & Fallback Graceful**:
    - Menambahkan error handling fallback `onError` pada background slider dan visual preview card di `LandingPage.tsx` yang secara otomatis mengalihkan sumber gambar ke fallback SVG jika berkas PNG gagal dimuat akibat kendala jaringan.
    - Menambahkan `onError` handler pada wallpaper kampus di `Login.tsx` serta foto profil pengguna di `Navbar.tsx` (fallback inisial nama sivitas) agar tidak menghasilkan visual broken image icon.
  - **Optimasi Render & Pencegahan CLS**:
    - Menyematkan dimensi eksplisit `width={1024}`, `height={1024}` serta `width={640}`, `height={360}` pada elemen `<img>`.
    - Mengonfigurasi `decoding="async"` dan strategi `loading="lazy"` / `loading="eager"` yang tepat pada seluruh viewport (mobile hingga ultra-wide desktop).
  - **Verifikasi Alur Navigasi Terkait Foto**:
    - Menguji keselarasan navigasi tombol CTA pada slide foto (`/ajukan`, `/verifikasi`, `/surat`, `/login`) dengan route manifest di `App.tsx`.
    - Memastikan navigasi root (`/`) netral bagi pengunjung publik tanpa loop redirect ke `/admin` atau `/dashboard`.
    - Mengesahkan 19/19 pengujian pada automated test suite `photoRenderingAudit.test.ts`.

### Quality Assurance & Verification
- **Verifikasi Slider Hero Section & Mobile Responsiveness (`LandingPage.tsx`, `heroSliderAudit.test.ts`, `visualResponsivenessAudit.test.ts`)**:
  - **Uji Visual & Responsivitas Antar Viewport**: Verifikasi rendering visual di berbagai target viewport (Mobile 320px-480px, Tablet 768px-820px, Desktop 1024px-1440px) bebas horizontal overflow dan terbungkus rapi dalam kontainer `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`. 12/12 uji valid pada `visualResponsivenessAudit.test.ts`.
  - **Uji Fungsional & State Navigasi**: Verifikasi perpindahan slide (maju/mundur/wrap-around siklis) dan navigasi langsung via titik indikator (dots indicator). 14/14 automated test suite assertions lulus (`heroSliderAudit.test.ts`).
  - **Dukungan Touch Gestures (Swipe)**: Penambahan event handler `onTouchStart`, `onTouchMove`, dan `onTouchEnd` dengan deteksi ambang batas swipe (50px horizontal) untuk navigasi geser antar-slide secara native di perangkat layar sentuh/mobile (`touch-pan-y`, `select-none`).
  - **Optimasi Gambar & Pencegahan Layout Shift (CLS)**:
    - Menyelaraskan dimensi eksplisit `width={640}` dan `height={360}` pada visual card `<img>` serta `width={1920}` dan `height={1080}` pada background hero slider untuk pencegahan CLS.
    - Mengonfigurasi `decoding="async"`, `loading="lazy"` / `loading="eager"`, dan fallback anggun ke SVG via `onError`.
  - **Aksesibilitas & Tap Target WCAG AA**:
    - Tombol panah navigasi slider (`ChevronLeft`, `ChevronRight`) serta tombol aksi CTA memenuhi standar minimum 44x44px (`min-h-[44px] min-w-[44px]`).
    - Titik indikator tablist slider dilengkapi keyboard focus (`focus:ring-amber-400`), status semantik (`aria-selected`), dan pembaca layar (`sr-only`).
  - **Transisi Autoplay & Interaktivitas**: Autoplay interval 6000ms berjalan konsisten dan otomatis jeda (pause) saat mouse hover atau touch swipe aktif.

- **Audit UI & Responsiveness Landing Page (`LandingPage.tsx`)**:
  - Memastikan akses root URL (`/`) sepenuhnya netral dan tidak memaksa loop redirect ke `/admin` atau `/dashboard`.
  - Memastikan tap target tombol aksi dan link CTA memenuhi standar WCAG AA (min 44px) untuk perangkat mobile dan desktop.
  - Menyelaraskan navigasi landing page dengan state autentikasi (menampilkan tautan agenda surat bagi user terautentikasi dan login SSO bagi tamu).
  - Memastikan tata letak responsif bebas dari horizontal overflow di berbagai ukuran breakpoint.

- **Validasi Login SSO & Sesi Pengguna (`ssoLoginAudit.test.ts`)**:
  - **Skenario Kredensial Valid**: Pertukaran token SSO berhasil mengembalikan JWT dan profil pengguna (`ADMIN_ESURAT` -> `admin`, `MAHASISWA` -> `mahasiswa`).
  - **Skenario Kredensial Invalid**:
    - Penolakan jika parameter `client_id` atau `token` kosong (400 Bad Request).
    - Penolakan jika `client_id` tidak sesuai dengan identitas aplikasi (400 Bad Request).
    - Penolakan jika verifikasi token SSO ke server ONE UNUSU gagal (401 Unauthorized).
    - Penolakan jika role pengguna berada di luar izin akses persuratan (403 Forbidden).
  - **Skenario Sesi Kedaluwarsa (Expired Session)**:
    - Middleware backend menolak JWT kedaluwarsa dengan status 401 Unauthorized.
    - Interceptor frontend mendeteksi status 401, membersihkan cache penyimpanan lokal (`localStorage`), dan mengarahkan pengguna kembali ke halaman login tanpa redirect loop.
  - **Deduplikasi Penukaran Token**: Penanganan idempotency penukaran token sekali pakai di `SsoCallbackPage` untuk mencegah pengiriman berulang pada mode StrictMode.

- **Verifikasi Build & Typecheck**:
  - Frontend (`vite build`): Berhasil membangun modul client tanpa error TypeScript (1967 modules transformed).
  - Backend (`tsc -p tsconfig.server.json`): Kompilasi TypeScript backend bersih tanpa kesalahan tipe.
  - Test Suite (`heroSliderAudit.test.ts`): 14/14 automated assertions passed.
  - Test Suite Visual & Responsiveness (`visualResponsivenessAudit.test.ts`): 12/12 automated assertions passed (mencakup breakpoint 320px - 1440px, tap target WCAG AA, optimasi aset gambar banner, pencegahan horizontal overflow, dan Cumulative Layout Shift).
  - **Audit Aksesibilitas WCAG AA & Craft**: Penambahan atribut accessible `aria-label` pada tautan tombol aksi Landing Page (`LandingPage.tsx`).

