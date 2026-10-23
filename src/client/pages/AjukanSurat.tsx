import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJenisSurat, createSurat, JenisSuratItem } from '../services/api';
import { Send, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const AjukanSurat: React.FC = () => {
  const navigate = useNavigate();
  const [jenisList, setJenisList] = useState<JenisSuratItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [jenisId, setJenisId] = useState('');
  const [pemohonNama, setPemohonNama] = useState('');
  const [pemohonId, setPemohonId] = useState('');
  const [pemohonProdi, setPemohonProdi] = useState('S1 Sistem Informasi');
  const [perihal, setPerihal] = useState('');
  const [keperluan, setKeperluan] = useState('');

  useEffect(() => {
    fetchJenisSurat()
      .then((res) => {
        setJenisList(res.data.data);
        if (res.data.data.length > 0) {
          setJenisId(String(res.data.data[0].id));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenisId || !pemohonNama || !perihal) {
      alert('Mohon lengkapi kolom yang wajib diisi');
      return;
    }

    setLoading(true);
    try {
      await createSurat({
        jenisId: Number(jenisId),
        pemohonNama,
        pemohonId,
        pemohonProdi,
        perihal,
        keperluan,
      });
      alert('Pengajuan surat berhasil dikirim! Silakan pantau status permohonan.');
      navigate('/');
    } catch (err) {
      alert('Gagal mengirim pengajuan surat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800">
            Formulir Online
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Pengajuan Surat Digital</h1>
          <p className="text-xs text-slate-500 mt-1">
            Isi rincian permohonan dengan data yang valid. Surat akan diproses oleh Biro Administrasi & Dekanat.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Jenis Surat *</label>
            <select
              value={jenisId}
              onChange={(e) => setJenisId(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-white"
            >
              {jenisList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nama} ({j.peruntukan})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nama Pemohon *</label>
              <input
                type="text"
                required
                value={pemohonNama}
                onChange={(e) => setPemohonNama(e.target.value)}
                placeholder="Contoh: Muhammad Fadhil"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">NIM / NIDN Pemohon</label>
              <input
                type="text"
                value={pemohonId}
                onChange={(e) => setPemohonId(e.target.value)}
                placeholder="Contoh: 230101001"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Program Studi / Unit</label>
            <select
              value={pemohonProdi}
              onChange={(e) => setPemohonProdi(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-emerald-600 bg-white"
            >
              <option value="S1 Sistem Informasi">S1 Sistem Informasi</option>
              <option value="S1 Teknik Informatika">S1 Teknik Informatika</option>
              <option value="S1 Pendidikan Agama Islam">S1 Pendidikan Agama Islam (PAI)</option>
              <option value="S1 Manajemen">S1 Manajemen</option>
              <option value="S1 Ilmu Keperawatan">S1 Ilmu Keperawatan</option>
              <option value="Dosen Tetap">Dosen / Tenaga Kependidikan</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Perihal Permohonan *</label>
            <input
              type="text"
              required
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              placeholder="Contoh: Permohonan Surat Keterangan Aktif Kuliah untuk Tunjangan Orang Tua"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Keperluan / Keterangan Tambahan</label>
            <textarea
              rows={4}
              value={keperluan}
              onChange={(e) => setKeperluan(e.target.value)}
              placeholder="Tuliskan tujuan surat dan instansi tujuan bila diperlukan..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-emerald-600"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>{loading ? 'Mengirim...' : 'Kirim Permohonan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
