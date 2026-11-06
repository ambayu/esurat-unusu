import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchJenisSurat, createSurat, JenisSuratItem } from '../services/api';
import { FormPageTemplate } from '../components/FormPageTemplate';
import {
  BuildingOffice2Icon,
  CheckCircleIcon,
  DocumentPlusIcon,
  DocumentTextIcon,
  UserIcon,
} from '@heroicons/react/24/outline';


export const AdminSuratForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryTipe = searchParams.get('tipe');

  // Mode naskah sepenuhnya ditentukan oleh menu sidebar lewat `?tipe=`.
  // Tidak ada state lokal atau toggle di body : nilai ini satu-satunya sumber.
  const tipeSurat: 'masuk' | 'keluar' = queryTipe === 'masuk' ? 'masuk' : 'keluar';

  const [jenisList, setJenisList] = useState<JenisSuratItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingJenis, setLoadingJenis] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form Field State
  const [jenisId, setJenisId] = useState('');
  const [pemohonNama, setPemohonNama] = useState('');
  const [pemohonId, setPemohonId] = useState('');
  const [pemohonProdi, setPemohonProdi] = useState('S1 Sistem Informasi');
  const [perihal, setPerihal] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [lampiranUrl, setLampiranUrl] = useState('');

  useEffect(() => {
    setLoadingJenis(true);
    fetchJenisSurat()
      .then((res) => {
        const items = res.data.data || [];
        setJenisList(items);
        if (items.length > 0 && !jenisId) {
          setJenisId(String(items[0].id));
        }
      })
      .catch((err) => {
        console.error('Gagal mengambil daftar format jenis surat:', err);
        setError('Gagal memuat template jenis surat');
      })
      .finally(() => setLoadingJenis(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenisId || !pemohonNama.trim() || !perihal.trim()) {
      setError('Mohon lengkapi seluruh kolom wajib bertanda bintang (*)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createSurat({
        tipeSurat,
        jenisId: Number(jenisId),
        pemohonNama: pemohonNama.trim(),
        pemohonId: pemohonId.trim() || undefined,
        pemohonProdi: pemohonProdi.trim() || undefined,
        perihal: perihal.trim(),
        keperluan: keperluan.trim() || undefined,
        lampiranUrl: lampiranUrl.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(tipeSurat === 'masuk' ? '/admin/surat?tipe=masuk' : '/admin/surat?tipe=keluar');
      }, 1200);
    } catch (err: any) {
      console.error('Error saat submit surat di panel admin:', err);
      setError(err?.response?.data?.message || 'Gagal menyimpan naskah surat ke database');
    } finally {
      setLoading(false);
    }
  };

  const isSuratMasuk = tipeSurat === 'masuk';

  return (
    <FormPageTemplate
      title={isSuratMasuk ? 'Pencatatan Naskah Surat Masuk' : 'Pembuatan Naskah Surat Keluar'}
      description={
        isSuratMasuk
          ? 'Formulir registrasi surat masuk dari instansi eksternal, dekanat, atau unit kerja mitra ke lingkungan UNUSU.'
          : 'Formulir penerbitan surat dinas keluar, surat keputusan, pengantar rekomendasi, dan naskah dinas resmi UNUSU.'
      }
      backTo={isSuratMasuk ? '/admin/surat?tipe=masuk' : '/admin/surat?tipe=keluar'}
      isEdit={false}
      submitLabel={isSuratMasuk ? 'Simpan Surat Masuk' : 'Terbitkan Surat Keluar'}
      submitting={loading}
      error={error}
      onSubmit={handleSubmit}
      accentClassName="bg-surat-green hover:bg-surat-green-dark"
      badge={
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-surat-green-100 text-surat-green-dark uppercase tracking-wider">
          {isSuratMasuk ? 'Input Surat Masuk' : 'Input Surat Keluar'}
        </span>
      }
    >
      {/* Notifikasi sukses - tampil di dalam area isian template */}
      {success && (
        <div
          role="status"
          className="p-4 rounded-[12px] bg-surat-green-50 border border-surat-green-100 text-surat-green-dark flex items-center gap-3 text-xs sm:text-sm font-semibold"
        >
          <CheckCircleIcon className="w-5 h-5 text-surat-green shrink-0" aria-hidden="true" />
          <span>Naskah surat berhasil disimpan ke database! Mengalihkan ke halaman daftar surat...</span>
        </div>
      )}

      {/*
        Catatan: pemilih mode naskah (Surat Masuk / Surat Keluar) sudah dihapus.
        Mode ditentukan oleh menu sidebar, sehingga halaman ini hanya menampilkan
        formulir sesuai mode yang dipilih dari sidebar, tanpa switcher ganda di
        dalam body.

        Kartu judul di atas form juga dihapus karena judul dan deskripsi halaman
        sudah tampil pada header PageShell di atas.
      */}
      <div className="space-y-6">
        {/* Baris 1: Klasifikasi & Template Surat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Klasifikasi Jenis Naskah *
            </label>
            {loadingJenis ? (
              <div className="h-10 rounded-[12px] bg-slate-100 animate-pulse border border-[#CBD5E1]" />
            ) : (
              <select
                value={jenisId}
                onChange={(e) => setJenisId(e.target.value)}
                required
                className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] focus:outline-surat-green bg-white"
              >
                {jenisList.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nama} ({j.peruntukan}) - {j.kode}
                  </option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Pilih klasifikasi surat sesuai pedoman tata naskah dinas.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tipe Alur Surat
            </label>
            <input
              type="text"
              readOnly
              value={isSuratMasuk ? 'SURAT MASUK (Agenda IN)' : 'SURAT KELUAR (Agenda REG)'}
              className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] bg-slate-50 text-slate-600 font-semibold cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 mt-1">Kode prefiks otomatis: IN (masuk) / REG (keluar).</p>
          </div>
        </div>

        {/* Baris 2: Pemohon / Instansi Pengirim / Unit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {isSuratMasuk ? 'Nama Instansi / Pengirim Surat *' : 'Nama Pemohon / Penanggung Jawab *'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={pemohonNama}
                onChange={(e) => setPemohonNama(e.target.value)}
                placeholder={
                  isSuratMasuk
                    ? 'Contoh: LLDIKTI Wilayah I Sumatera Utara'
                    : 'Contoh: Dr. H. M. Syukri, M.A. / Tim Panitia'
                }
                className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] focus:outline-surat-green bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {isSuratMasuk ? 'Nomor Asal Surat / Kode Arsip' : 'NIM / NIDN Pemohon (Opsional)'}
            </label>
            <input
              type="text"
              value={pemohonId}
              onChange={(e) => setPemohonId(e.target.value)}
              placeholder={isSuratMasuk ? 'Contoh: 140/LL1/TU/2026' : 'Contoh: 0102038901 / 220101004'}
              className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] focus:outline-surat-green bg-white"
            />
          </div>
        </div>

        {/* Baris 3: Unit Kerja / Program Studi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {isSuratMasuk ? 'Tujuan Unit / Ditujukan Kepada' : 'Unit Kerja / Program Studi'}
            </label>
            <select
              value={pemohonProdi}
              onChange={(e) => setPemohonProdi(e.target.value)}
              className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] focus:outline-surat-green bg-white"
            >
              <option value="Rektorat / Biro Umum">Rektorat / Biro Administrasi Umum</option>
              <option value="Biro Akademik & Kemahasiswaan">Biro Akademik & Kemahasiswaan</option>
              <option value="LPPM UNUSU">LPPM UNUSU</option>
              <option value="LPM UNUSU">LPM UNUSU</option>
              <option value="Fakultas Sains & Teknologi">Fakultas Sains & Teknologi</option>
              <option value="S1 Sistem Informasi">S1 Sistem Informasi</option>
              <option value="S1 Teknik Informatika">S1 Teknik Informatika</option>
              <option value="S1 Manajemen">S1 Manajemen</option>
              <option value="S1 Pendidikan Agama Islam">S1 Pendidikan Agama Islam (PAI)</option>
              <option value="S1 Ilmu Keperawatan">S1 Ilmu Keperawatan</option>
              <option value="Unit Kerja Lainnya">Unit Kerja / Mitra Eksternal</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tautan Berkas Digital / File Lampiran (Opsional)
            </label>
            <input
              type="text"
              value={lampiranUrl}
              onChange={(e) => setLampiranUrl(e.target.value)}
              placeholder="Contoh: /uploads/berkas/surat-undangan.pdf atau https://..."
              className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] focus:outline-surat-green bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">Simpan link PDF naskah pindaian atau draf surat dinas.</p>
          </div>
        </div>

        {/* Baris 4: Perihal Pokok */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Perihal Pokok Surat *
          </label>
          <input
            type="text"
            required
            value={perihal}
            onChange={(e) => setPerihal(e.target.value)}
            placeholder={
              isSuratMasuk
                ? 'Contoh: Undangan Rapat Koordinasi Hibah Riset Perguruan Tinggi Wilayah I'
                : 'Contoh: Penerbitan Surat Keputusan Rektor tentang Panitia Dies Natalis UNUSU'
            }
            className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] focus:outline-surat-green bg-white"
          />
        </div>

        {/* Baris 5: Keperluan / Ringkasan Isi Surat */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Uraian Ringkasan / Instruksi / Catatan Penting
          </label>
          <textarea
            rows={4}
            value={keperluan}
            onChange={(e) => setKeperluan(e.target.value)}
            placeholder="Jelaskan ringkasan isi surat, catatan permohonan, atau saran disposisi awal..."
            className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] focus:outline-surat-green bg-white leading-relaxed"
          />
        </div>

      </div>
    </FormPageTemplate>
  );
};
export default AdminSuratForm;
