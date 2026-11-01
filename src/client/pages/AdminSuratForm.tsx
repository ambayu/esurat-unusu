import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { fetchJenisSurat, createSurat, JenisSuratItem } from '../services/api';
import { AdminPanelTemplate } from '../components/AdminPanelTemplate';
import { CardContainer } from '../components/CardContainer';
import { 
  Inbox, 
  Send, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Building2, 
  User, 
  FilePlus, 
  AlertCircle 
} from 'lucide-react';

export const AdminSuratForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryTipe = searchParams.get('tipe');
  const initialTipe = queryTipe === 'masuk' ? 'masuk' : 'keluar';

  const [tipeSurat, setTipeSurat] = useState<'masuk' | 'keluar'>(initialTipe);
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

  // Sinkronkan tipe surat jika URL searchParams berubah
  useEffect(() => {
    if (queryTipe === 'masuk' || queryTipe === 'keluar') {
      setTipeSurat(queryTipe);
    }
  }, [queryTipe]);

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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Panel Template Standar LPPM */}
      <AdminPanelTemplate
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            {isSuratMasuk ? 'Input Surat Masuk' : 'Input Surat Keluar'}
          </span>
        }
        title={isSuratMasuk ? 'Pencatatan Naskah Surat Masuk' : 'Pembuatan Naskah Surat Keluar'}
        description={
          isSuratMasuk
            ? 'Formulir registrasi surat masuk dari instansi eksternal, dekanat, atau unit kerja mitra ke lingkungan UNUSU.'
            : 'Formulir penerbitan surat dinas keluar, surat keputusan, pengantar rekomendasi, dan naskah dinas resmi UNUSU.'
        }
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              aria-label="Kembali ke Dashboard Admin"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-[12px] border border-[#CBD5E1] bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs transition min-h-[44px] shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Kembali</span>
            </Link>
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            aria-label="Mode registrasi Surat Masuk"
            onClick={() => {
              setTipeSurat('masuk');
              navigate('/admin/surat-form?tipe=masuk', { replace: true });
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-bold transition min-h-[44px] cursor-pointer ${
              isSuratMasuk
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-[#CBD5E1] hover:bg-slate-50'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Mode Surat Masuk (Eksternal/In)</span>
          </button>

          <button
            type="button"
            aria-label="Mode registrasi Surat Keluar"
            onClick={() => {
              setTipeSurat('keluar');
              navigate('/admin/surat-form?tipe=keluar', { replace: true });
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-bold transition min-h-[44px] cursor-pointer ${
              !isSuratMasuk
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-[#CBD5E1] hover:bg-slate-50'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Mode Surat Keluar (Dinas/Out)</span>
          </button>
        </div>
      </AdminPanelTemplate>

      {/* Pesan Sukses Notifikasi */}
      {success && (
        <div className="p-4 rounded-[14px] bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-3 text-xs sm:text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Naskah surat berhasil disimpan ke database! Mengalihkan ke halaman daftar surat...</span>
        </div>
      )}

      {/* Pesan Error Notifikasi */}
      {error && (
        <div className="p-4 rounded-[14px] bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-3 text-xs sm:text-sm font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card Container Berstandar UI Governance */}
      <CardContainer
        title={isSuratMasuk ? 'Informasi Berkas Surat Masuk' : 'Informasi Rincian Surat Keluar'}
        subtitle="Lengkapi data naskah dinas untuk penerbitan nomor agenda dan disposisi digital."
        badge={isSuratMasuk ? <Inbox className="w-4 h-4 text-blue-600" /> : <Send className="w-4 h-4 text-emerald-600" />}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
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
                  className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] focus:outline-emerald-600 bg-white"
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
                  className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] focus:outline-emerald-600 bg-white"
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
                className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] focus:outline-emerald-600 bg-white"
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
                className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] focus:outline-emerald-600 bg-white"
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
                className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] focus:outline-emerald-600 bg-white"
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
              className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] focus:outline-emerald-600 bg-white"
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
              className="w-full text-xs p-3 rounded-[12px] border border-[#CBD5E1] focus:outline-emerald-600 bg-white leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#CBD5E1] flex flex-wrap items-center justify-between gap-3">
            <Link
              to={isSuratMasuk ? '/admin/surat?tipe=masuk' : '/admin/surat?tipe=keluar'}
              className="inline-flex items-center px-4 py-2.5 rounded-[12px] border border-[#CBD5E1] bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs min-h-[44px] transition"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[12px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs hover:shadow-md transition min-h-[44px] cursor-pointer disabled:opacity-50"
            >
              {isSuratMasuk ? <Inbox className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>{loading ? 'Menyimpan...' : isSuratMasuk ? 'Simpan Surat Masuk' : 'Terbitkan Surat Keluar'}</span>
            </button>
          </div>
        </form>
      </CardContainer>
    </div>
  );
};
export default AdminSuratForm;
