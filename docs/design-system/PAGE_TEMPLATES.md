# PAGE TEMPLATES REGISTRY — E-SURAT UNUSU

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
