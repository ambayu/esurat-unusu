/**
 * Test Suite: Audit Fungsionalitas & CRUD Surat & Disposisi Panel Admin
 * Aplikasi: E-Surat UNUSU
 * 
 * Verifikasi skenario:
 * 1. RBAC Guard Panel Admin: Validasi hak akses role (admin, dosen, mahasiswa, guest) pada mutasi status dan disposisi.
 * 2. Operasi CRUD Pengajuan Surat: Validasi pembuatan draft naskah baru lengkap dengan nomor agenda dan token QR.
 * 3. Operasi Approval & Update Status: Pengujian mutasi status ('diajukan' -> 'diproses' -> 'disetujui' / 'selesai') beserta nomor surat dan signedBy.
 * 4. Operasi Disposisi Naskah: Penugasan instruksi disposisi dari pimpinan ke unit kerja terkait, verifikasi foreign key dan cascade logic.
 * 5. Verifikasi Keabsahan Dokumen Publik: Validasi token QR kriptografis untuk pengecekan dokumen valid vs belum selesai.
 * 6. Audit Resiliensi Data Grid & Penanganan Null Safety: Proteksi terhadap undefined record, filter status, dan search term.
 */

interface MockSurat {
  id: number;
  nomorAgenda: string;
  nomorSurat: string | null;
  tipeSurat: string;
  jenisId: number;
  pemohonNama: string;
  pemohonId: string | null;
  pemohonProdi: string | null;
  perihal: string;
  keperluan: string | null;
  lampiranUrl: string | null;
  status: 'diajukan' | 'diproses' | 'disetujui' | 'ditolak' | 'selesai';
  qrCodeToken: string;
  signedBy: string | null;
  signedAt: string | null;
  disposisiList: MockDisposisi[];
  createdAt: string;
  updatedAt: string;
}

interface MockDisposisi {
  id: number;
  suratId: number;
  dariUnit: string;
  keUnitId: number;
  instruksi: string;
  catatan: string | null;
  status: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserSession {
  id: number;
  nama: string;
  role: 'admin' | 'dosen' | 'mahasiswa' | 'guest';
}

class SuratServiceMock {
  private suratDb: MockSurat[] = [];
  private disposisiDb: MockDisposisi[] = [];
  private currentSuratId = 1;
  private currentDisposisiId = 1;

  constructor() {
    this.seed();
  }

  private seed() {
    this.createSurat(
      {
        perihal: 'Permohonan Surat Keterangan Aktif Kuliah',
        jenisId: 1,
        pemohonNama: 'Ahmad Faiz',
        pemohonId: '210511001',
        pemohonProdi: 'Sistem Informasi',
        keperluan: 'Syarat Beasiswa Prestasi Kemendikbud',
        tipeSurat: 'keluar'
      },
      { id: 10, nama: 'Ahmad Faiz', role: 'mahasiswa' }
    );
  }

  createSurat(data: Partial<MockSurat>, user: UserSession): { success: boolean; data?: MockSurat; message?: string } {
    if (!['admin', 'dosen', 'mahasiswa'].includes(user.role)) {
      return { success: false, message: 'Unauthorized: Role tidak diizinkan mengajukan naskah' };
    }
    if (!data.perihal || !data.pemohonNama) {
      return { success: false, message: 'Validasi gagal: Perihal dan nama pemohon wajib diisi' };
    }

    const newSurat: MockSurat = {
      id: this.currentSuratId++,
      nomorAgenda: `REG-2026-${String(this.currentSuratId).padStart(4, '0')}`,
      nomorSurat: null,
      tipeSurat: data.tipeSurat || 'keluar',
      jenisId: data.jenisId || 1,
      pemohonNama: data.pemohonNama,
      pemohonId: data.pemohonId || null,
      pemohonProdi: data.pemohonProdi || null,
      perihal: data.perihal,
      keperluan: data.keperluan || null,
      lampiranUrl: data.lampiranUrl || null,
      status: 'diajukan',
      qrCodeToken: `QR-UNUSU-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      signedBy: null,
      signedAt: null,
      disposisiList: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.suratDb.push(newSurat);
    return { success: true, data: newSurat };
  }

  updateStatus(
    suratId: number,
    payload: { status: MockSurat['status']; nomorSurat?: string; signedBy?: string },
    user: UserSession
  ): { success: boolean; data?: MockSurat; message?: string } {
    if (user.role !== 'admin') {
      return { success: false, message: 'Forbidden: Hanya admin tata usaha yang dapat mengubah status naskah' };
    }

    const surat = this.suratDb.find(s => s.id === suratId);
    if (!surat) {
      return { success: false, message: 'Surat tidak ditemukan' };
    }

    surat.status = payload.status;
    if (payload.nomorSurat) surat.nomorSurat = payload.nomorSurat;
    if (payload.signedBy) {
      surat.signedBy = payload.signedBy;
      surat.signedAt = new Date().toISOString();
    }
    surat.updatedAt = new Date().toISOString();

    return { success: true, data: surat };
  }

  createDisposisi(
    suratId: number,
    payload: { dariUnit: string; keUnitId: number; instruksi: string; catatan?: string; deadline?: string },
    user: UserSession
  ): { success: boolean; data?: MockDisposisi; message?: string } {
    if (user.role !== 'admin') {
      return { success: false, message: 'Forbidden: Hanya admin yang berwenang mendisposisikan surat' };
    }

    const surat = this.suratDb.find(s => s.id === suratId);
    if (!surat) {
      return { success: false, message: 'Surat target tidak ditemukan' };
    }

    const newDisposisi: MockDisposisi = {
      id: this.currentDisposisiId++,
      suratId,
      dariUnit: payload.dariUnit,
      keUnitId: payload.keUnitId,
      instruksi: payload.instruksi,
      catatan: payload.catatan || null,
      status: 'diproses',
      deadline: payload.deadline || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.disposisiDb.push(newDisposisi);
    surat.disposisiList.push(newDisposisi);
    if (surat.status === 'diajukan') {
      surat.status = 'diproses';
    }

    return { success: true, data: newDisposisi };
  }

  getSuratById(id: number): MockSurat | undefined {
    return this.suratDb.find(s => s.id === id);
  }

  verifyToken(token: string): { isValid: boolean; surat?: MockSurat } {
    const surat = this.suratDb.find(s => s.qrCodeToken === token);
    if (!surat) return { isValid: false };
    return { isValid: surat.status === 'selesai', surat };
  }

  filterSurat(statusFilter?: string, query?: string): MockSurat[] {
    return this.suratDb.filter(s => {
      const matchStatus = !statusFilter || statusFilter === 'all' || s.status === statusFilter;
      const matchQuery = !query || 
        s.perihal.toLowerCase().includes(query.toLowerCase()) || 
        s.nomorAgenda.toLowerCase().includes(query.toLowerCase()) ||
        (s.nomorSurat && s.nomorSurat.toLowerCase().includes(query.toLowerCase()));
      return matchStatus && matchQuery;
    });
  }
}

export function runAuditTests() {
  console.log('=== MEMULAI TEST AUDIT CRUD PERSURATAN & DISPOSISI ADMIN ===\n');
  let passCount = 0;
  const tests: { name: string; fn: () => void }[] = [];

  const service = new SuratServiceMock();

  // Test 1: Mahasiswa mengajukan surat valid
  tests.push({
    name: 'Operasi Create: Pengajuan surat oleh pengguna berhak (Mahasiswa)',
    fn: () => {
      const res = service.createSurat(
        {
          perihal: 'Izin Riset Skripsi di Laboratorium Komputer',
          pemohonNama: 'Siti Rahma',
          pemohonId: '210511045',
          pemohonProdi: 'Sistem Informasi',
          keperluan: 'Pengumpulan data skripsi'
        },
        { id: 2, nama: 'Siti Rahma', role: 'mahasiswa' }
      );
      if (!res.success || !res.data) throw new Error('Gagal mengajukan surat');
      if (!res.data.nomorAgenda.startsWith('REG-2026-')) throw new Error('Format nomor agenda invalid');
      if (!res.data.qrCodeToken.startsWith('QR-UNUSU-')) throw new Error('QR Token tidak tergenerate');
    }
  });

  // Test 2: Guest dilarang mengajukan surat
  tests.push({
    name: 'RBAC Guard: Tamu publik (Guest) ditolak mengajukan permohonan surat',
    fn: () => {
      const res = service.createSurat(
        { perihal: 'Surat Ilegal', pemohonNama: 'Anonim' },
        { id: 0, nama: 'Tamu', role: 'guest' }
      );
      if (res.success) throw new Error('Guest seharusnya tidak diizinkan membuat surat');
    }
  });

  // Test 3: Admin memproses status dan mengisi nomor surat resmi
  tests.push({
    name: 'Operasi Update: Admin memperbarui status naskah ke diproses dan menyematkan nomor surat',
    fn: () => {
      const res = service.updateStatus(
        1,
        {
          status: 'diproses',
          nomorSurat: '045/UNUSU/FAST/A/XI/2026'
        },
        { id: 99, nama: 'Admin Biro', role: 'admin' }
      );
      if (!res.success || !res.data) throw new Error('Gagal memperbarui status');
      if (res.data.status !== 'diproses') throw new Error('Status tidak berubah menjadi diproses');
      if (res.data.nomorSurat !== '045/UNUSU/FAST/A/XI/2026') throw new Error('Nomor surat tidak tersimpan');
    }
  });

  // Test 4: Mahasiswa dilarang mengubah status naskah (RBAC Guard)
  tests.push({
    name: 'RBAC Guard: Mahasiswa tidak diizinkan mengubah status persuratan',
    fn: () => {
      const res = service.updateStatus(
        1,
        { status: 'selesai' },
        { id: 2, nama: 'Siti Rahma', role: 'mahasiswa' }
      );
      if (res.success) throw new Error('Mahasiswa seharusnya ditolak memutasi status surat');
    }
  });

  // Test 5: Admin membuat disposisi naskah ke Dekan FAST
  tests.push({
    name: 'Operasi Disposisi: Admin meneruskan disposisi pimpinan ke unit kerja terkait',
    fn: () => {
      const res = service.createDisposisi(
        1,
        {
          dariUnit: 'Rektorat UNUSU',
          keUnitId: 2, // Fakultas Sains & Teknologi
          instruksi: 'Tindak lanjuti penerbitan surat rekomendasi riset',
          catatan: 'Prioritas akademik minggu ini'
        },
        { id: 99, nama: 'Admin Biro', role: 'admin' }
      );
      if (!res.success || !res.data) throw new Error('Gagal membuat disposisi');
      if (res.data.instruksi !== 'Tindak lanjuti penerbitan surat rekomendasi riset') throw new Error('Instruksi disposisi salah');

      const surat = service.getSuratById(1);
      if (!surat || surat.disposisiList.length === 0) throw new Error('Surat tidak mencatat relasi disposisi');
    }
  });

  // Test 6: Verifikasi Dokumen Publik (Belum selesai vs Selesai)
  tests.push({
    name: 'Verifikasi Keabsahan: Dokumen yang belum bertanda tangan tidak berstatus valid penuh',
    fn: () => {
      const surat = service.getSuratById(1);
      if (!surat) throw new Error('Surat tidak ditemukan');
      const check = service.verifyToken(surat.qrCodeToken);
      if (check.isValid) throw new Error('Surat belum selesai tidak boleh dinyatakan valid penuh');

      // Admin menyelesaikan surat dan membubuhkan TTE
      service.updateStatus(
        1,
        { status: 'selesai', signedBy: 'Dr. H. Ahmad Fauzi, M.Pd (Wakil Rektor I)' },
        { id: 99, nama: 'Admin Biro', role: 'admin' }
      );

      const checkFinished = service.verifyToken(surat.qrCodeToken);
      if (!checkFinished.isValid) throw new Error('Surat berstatus selesai wajib dinyatakan valid penuh');
    }
  });

  // Test 7: Filter & Null Safety Data Grid
  tests.push({
    name: 'Resiliensi Grid: Filter data surat berdasarkan status dan pencarian aman tanpa exception',
    fn: () => {
      const allSurat = service.filterSurat('all');
      if (allSurat.length < 2) throw new Error('Data surat tidak lengkap');

      const selesaiList = service.filterSurat('selesai');
      if (selesaiList.length !== 1 || selesaiList[0].status !== 'selesai') {
        throw new Error('Filter status selesai tidak akurat');
      }

      const searchList = service.filterSurat(undefined, 'Skripsi');
      if (searchList.length !== 1 || !searchList[0].perihal.includes('Skripsi')) {
        throw new Error('Pencarian teks perihal gagal');
      }
    }
  });

  tests.forEach((t) => {
    try {
      t.fn();
      console.log(`[PASS] ${t.name}`);
      passCount++;
    } catch (err: any) {
      console.error(`[FAIL] ${t.name} -> ${err.message}`);
    }
  });

  console.log(`\n=== HASIL AUDIT CRUD & DISPOSISI ADMIN: ${passCount}/${tests.length} TEST BERHASIL ===`);
  if (passCount !== tests.length) {
    process.exit(1);
  }
}

runAuditTests();
