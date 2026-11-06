# PAGE TEMPLATES REGISTRY : E-SURAT UNUSU

Tata kelola template halaman sesuai aturan **Build Once, Reuse Everywhere** dan prinsip UI Container terstandar.

---

## 1. Prinsip Utama Template

Setiap halaman di E-Surat UNUSU wajib mengadopsi struktur template yang telah ditetapkan:
1. **Dilarang membuat layout admin mengambang**: Seluruh tampilan di bawah `/admin` wajib dibungkus dalam `AdminPanelTemplate`.
2. **Aturan Form Section (Part 10.8)**: Seluruh formulir registrasi surat atau pengaturan wajib mengelompokkan input ke dalam `CardContainer`.
3. **Resilient Tables**: Seluruh tampilan tabel data wajib dibungkus di dalam kartu dengan fallback `EmptyState` dan proteksi null safety.

---

## 2. Registri Template Halaman

### Template 1: Admin Panel & Data Grid Template (`AdminPanelTemplate`)
- **Digunakan oleh**:
  - `/admin` & `/admin/dashboard` (Dashboard metrik & statistik)
  - `/admin/surat` (Agenda Surat Masuk, Keluar, dan Semua)
  - `/admin/jenis-surat` (Katalog Format Nomor & Template Surat)
  - `/admin/rbac` (Manajemen Pengguna, Peran, dan Matriks Izin)
- **Komposisi Struktur**:
  ```tsx
  <AdminPanelTemplate
    title="Judul Panel"
    description="Deskripsi tugas dan konteks persuratan"
    badge={<StatusBadge />}
    actions={<TombolAksiUtama />}
  >
    {/* 1. Baris KPI / Stats Grid (opsional) */}
    {/* 2. Toolbar Pencarian & Filter Status */}
    {/* 3. CardContainer pembungkus tabel data */}
    <CardContainer title="Daftar Agenda">
      <Table />
    </CardContainer>
  </AdminPanelTemplate>
  ```

---

### Template 2: Form & Registration Template (`AdminSuratForm`)
- **Digunakan oleh**:
  - `/admin/surat-form` (Registrasi Surat Masuk & Pengajuan Surat Keluar)
- **Komposisi Struktur**:
  ```tsx
  <AdminPanelTemplate
    title="Registrasi Naskah Dinas"
    description="Isi metadata surat secara lengkap"
    actions={<BilahTombolSimpan />}
  >
    <div className="space-y-6">
      <CardContainer title="1. Informasi Dokumen & Klasifikasi">
        {/* Field Nomor, Jenis Surat, Perihal, Tanggal */}
      </CardContainer>

      <CardContainer title="2. Pihak Pengirim & Tujuan">
        {/* Field Instansi Pengirim, Tujuan Unit/Pejabat */}
      </CardContainer>

      <CardContainer title="3. Berkas & Lampiran Digital">
        {/* Dropzone Upload Dokumen PDF */}
      </CardContainer>
    </div>
  </AdminPanelTemplate>
  ```

---

### Template 3: Document Detail & Disposition Flow Template (`SuratDetail`)
- **Digunakan oleh**:
  - `/admin/surat/:id` (Detail Naskah, Riwayat Disposisi, dan Verifikasi QR)
- **Komposisi Struktur**:
  ```tsx
  <AdminPanelTemplate
    title={`Naskah Dinas: ${surat.nomorSurat}`}
    description={`Status: ${surat.status}`}
  >
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kolom Kiri: Preview Dokumen PDF & Meta Detail (2 cols) */}
      <div className="lg:col-span-2 space-y-6">
        <CardContainer title="Pratinjau Dokumen">
          <DocumentViewer />
        </CardContainer>
      </div>

      {/* Kolom Kanan: Alur Disposisi & Form Tindak Lanjut (1 col) */}
      <div className="space-y-6">
        <CardContainer title="Instruksi & Disposisi Pimpinan">
          <DispositionTimeline />
        </CardContainer>
      </div>
    </div>
  </AdminPanelTemplate>
  ```

---

### Template 4: Public Document Verification Template (`VerifikasiDokumen`)
- **Digunakan oleh**:
  - `/verifikasi` & `/verifikasi/:token`
- **Tanggung Jawab**:
  - Halaman publik tanpa autentikasi untuk memverifikasi keabsahan naskah dinas bertanda tangan digital atau QR code resmi UNUSU.
  - Memverifikasi status sah (`selesai`), nama penandatangan, tanggal naskah, dan integritas hash dokumen.

---

### Template 5: Public Landing Hero Slider Template (`LandingPage`)
- **Digunakan oleh**:
  - `/` (Halaman depan publik)
- **Tanggung Jawab**:
  - Slider hero layar penuh dengan gambar fotografi yang digenerate khusus untuk E-Surat (dilarang memakai aset dari ONE UNUSU atau aplikasi cabang lain).
  - Autoplay 6 detik, jeda saat hover/sentuh, swipe mobile (ambang 50px), tombol panah, indikator titik, dan penghitung slide.
  - Seluruh kontrol wajib memenuhi tap target minimal 44px.
- **Komposisi Struktur**:
  ```tsx
  <section className="relative isolate min-h-[520px] md:h-[calc(100vh-4rem)]">
    {/* 1. Lapisan gambar slide: <img width={640} height={360} loading="lazy" decoding="async" alt={current.imageAlt} /> */}
    {/* 2. Overlay gradien gelap untuk keterbacaan teks */}
    {/* 3. Kolom kiri-bawah: badge, h1 (prefix + highlight gold), deskripsi, CTA utama + CTA sekunder */}
    {/* 4. Kolom kanan-bawah: indikator titik, tombol panah, penghitung "01 / 03" */}
  </section>
  ```
- **Aturan Data Slide**: Minimal 3 slide. Setiap slide wajib memiliki `id`, `badge`, `badgeIcon`, `titlePrefix`, `titleHighlight`, `description`, `primaryCtaText`, `primaryCtaLink`, `primaryCtaIcon`, `imageSrc`, dan `imageAlt`. Field dekoratif tanpa pemakaian render (mis. `themeGradient`, `bannerVisual`) dilarang dipertahankan.

---

## 6. Template 6: Form Page Template (`FormPageTemplate`)

- **Digunakan oleh**: **seluruh** halaman formulir tambah/ubah data (mis. `/penelitian/tambah`, `/penelitian/edit/:id`, `/admin/surat-form`, `/admin/standar/tambah`). **Dashboard tidak memakai template ini.**
- **Tanggung Jawab**: Menyeragamkan kerangka halaman formulir di seluruh aplikasi sehingga tata letaknya identik antar menu: header panel + pesan galat + area isian + baris aksi tetap di bawah.
- **Komposisi Struktur**:
  ```tsx
  <FormPageTemplate
    title="Tambah Proposal Riset Baru"
    description="Formulir pencatatan lengkap proposal penelitian."
    backTo="/penelitian"
    isEdit={isEdit}
    submitLabel={isEdit ? 'Perbarui Data' : 'Simpan Proposal'}
    submitting={submitting}
    error={error}
    onSubmit={handleSubmit}
    accentClassName="bg-violet-700 hover:bg-violet-800"
  >
    <CardContainer title="Informasi Judul & Tim Peneliti">
      {/* field-field formulir */}
    </CardContainer>
  </FormPageTemplate>
  ```
- **Poin Penting**:
  1. Tidak perlu lagi menulis `<form>`, blok galat, dan baris tombol Batal/Simpan secara manual : semuanya disediakan template.
  2. Baris aksi (Batal + Simpan) selalu berada di **bawah** formulir dengan tap target minimal 42px.
  3. `submitLabel` default otomatis: `Simpan Perubahan` saat `isEdit`, `Simpan Data` saat menambah.
  4. Tombol "Batal" mengarah ke `backTo`; tombol "Kembali" pada header juga mengarah ke sana.
  5. `accentClassName` disesuaikan dengan palette aplikasi (ESurat emerald, LPM/LPPM biru/violet, dll).
- **Dilarang**: Membuat struktur header formulir + baris aksi sendiri di halaman baru. Gunakan template ini agar konsisten.

---

## 6b. Kerangka Bersama: `PageShell`

`FormPageTemplate` dan `ListPageTemplate` **berbagi satu kerangka kepala halaman**, yaitu `PageShell`
(`src/client/components/PageShell.tsx`). Ini yang menjamin halaman formulir dan halaman daftar
tampak identik: lebar, padding, border `#CBD5E1`, `rounded-[16px]`, tipografi judul, dan posisi
tombol aksi.

```tsx
<PageShell title="..." description="..." badge={...} actions={...} headerFooter={tabs}>
  {children}
</PageShell>
```

**Aturan keras** : pelanggaran pada poin berikut adalah penyebab paling umum halaman "terlihat
beda" padahal sudah memanggil template:

1. **Jangan** membungkus template dengan container luar seperti
   `<div className="max-w-7xl mx-auto px-4 py-8">`. `AdminLayout`/`SidebarLayout` sudah memberi
   padding dan lebar kanvas. Membungkus ulang membuat halaman menyempit dan bertambah padding :
   persis inilah yang dulu membuat `/admin/surat` berbeda dari `/admin/jenis-surat`.
2. **Jangan** membuat header panel sendiri di halaman. Judul, deskripsi, badge, dan tombol aksi
   semuanya lewat props template.
3. Halaman yang perlu modal di luar template memakai fragment:
   ```tsx
   return (
     <>
       <ListPageTemplate ... />
       {isModalOpen && <Modal ... />}
     </>
   );
   ```
4. Halaman **dashboard** dan halaman **detail** tidak memakai template ini.

---

## 7. Aturan Status Aktif Menu Sidebar (`isActive`)

Semua sidebar panel **wajib** memakai aturan kecocokan yang sama agar tidak pernah ada dua menu aktif sekaligus:

1. **Cocok persis** : `pathname === to` → aktif.
2. **Cocok batas segmen** : `pathname.startsWith(to + '/')` → kandidat aktif. Dilarang memakai `startsWith(to)` tanpa garis miring, karena `/peran` akan ikut menyala di `/perangkat`.
3. **Kecocokan terpanjang menang** : bila beberapa menu berbagi prefix yang sama (mis. `/admin` dan `/admin/pengguna`), hanya menu dengan path **terpanjang** yang dianggap aktif.
4. **Menu ber-`end`** : menu yang menunjuk rute akar (mis. `/`) wajib ditandai `end: true` agar tidak menyala di semua halaman. Rute turunannya (mis. `/class/:id`) dipetakan manual ke menu induk.
5. **Reaktif** : status harus dihitung dari `useLocation()` (bukan `window.location.pathname`), supaya ikut berubah saat navigasi client-side.
