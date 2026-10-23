import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSuratDetail, updateStatusSurat, createDisposisi, fetchUnitKerja, SuratItem, UnitKerjaItem } from '../services/api';
import { ArrowLeft, CheckCircle2, Clock, ShieldCheck, QrCode, FileText, Send, UserCheck } from 'lucide-react';

export const SuratDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [surat, setSurat] = useState<SuratItem | null>(null);
  const [units, setUnits] = useState<UnitKerjaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Disposisi form state
  const [keUnitId, setKeUnitId] = useState('');
  const [instruksi, setInstruksi] = useState('');
  const [catatan, setCatatan] = useState('');

  // Status update state
  const [newStatus, setNewStatus] = useState('');
  const [nomorSurat, setNomorSurat] = useState('');
  const [signedBy, setSignedBy] = useState('');

  const loadData = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchSuratDetail(Number(id)), fetchUnitKerja()])
      .then(([suratRes, unitRes]) => {
        setSurat(suratRes.data.data);
        setUnits(unitRes.data.data);
        setNewStatus(suratRes.data.data.status);
        if (unitRes.data.data.length > 0) {
          setKeUnitId(String(unitRes.data.data[0].id));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateStatusSurat(Number(id), {
        status: newStatus,
        nomorSurat: nomorSurat || undefined,
        signedBy: signedBy || undefined,
      });
      alert('Status surat berhasil diperbarui!');
      loadData();
    } catch (err) {
      alert('Gagal memperbarui status surat');
    }
  };

  const handleCreateDisposisi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !keUnitId || !instruksi) {
      alert('Lengkapi unit tujuan dan instruksi disposisi');
      return;
    }
    try {
      await createDisposisi(Number(id), {
        dariUnit: 'Rektorat / Dekan',
        keUnitId: Number(keUnitId),
        instruksi,
        catatan,
      });
      alert('Disposisi naskah berhasil diteruskan!');
      setInstruksi('');
      setCatatan('');
      loadData();
    } catch (err) {
      alert('Gagal membuat disposisi');
    }
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">Memuat rincian surat...</div>;
  }

  if (!surat) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">Surat tidak ditemukan.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Link to="/" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-emerald-700">
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        <span>Kembali ke Daftar Surat</span>
      </Link>

      {/* Main Info Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded text-slate-600">
                {surat.nomorAgenda}
              </span>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded">
                {surat.jenisSurat?.nama}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">{surat.perihal}</h1>
            {surat.nomorSurat && (
              <p className="text-xs font-mono font-bold text-emerald-700 mt-1">
                Nomor Surat: {surat.nomorSurat}
              </p>
            )}
          </div>

          {/* QR Code Token Badge */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center shrink-0">
            <QrCode className="w-8 h-8 text-slate-700 mx-auto" />
            <span className="text-[10px] font-mono text-slate-400 block mt-1">{surat.qrCodeToken.slice(0, 16)}...</span>
            <span className="text-[10px] font-bold text-emerald-700 block">TTE Terverifikasi</span>
          </div>
        </div>

        {/* Pemohon Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-2xl">
          <div>
            <span className="text-slate-400 block">Nama Pemohon:</span>
            <strong className="text-slate-800 font-bold">{surat.pemohonNama}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">NIM / NIDN:</span>
            <strong className="text-slate-800 font-bold">{surat.pemohonId || '-'}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Program Studi:</span>
            <strong className="text-slate-800 font-bold">{surat.pemohonProdi || '-'}</strong>
          </div>
        </div>

        {surat.keperluan && (
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Keperluan:</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
              {surat.keperluan}
            </p>
          </div>
        )}

        {surat.signedBy && (
          <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ditandatangani secara elektronik oleh: <strong>{surat.signedBy}</strong></span>
          </div>
        )}
      </div>

      {/* Disposisi History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Riwayat Disposisi Naskah</h3>
        {surat.disposisiList?.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Belum ada catatan disposisi pimpinan.</p>
        ) : (
          <div className="space-y-3">
            {surat.disposisiList?.map((d) => (
              <div key={d.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-emerald-800">{d.dariUnit} ➔ {d.keUnit?.nama}</span>
                  <span className="text-slate-400 font-normal">{new Date(d.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                <p className="text-slate-700 font-medium">Instruksi: {d.instruksi}</p>
                {d.catatan && <p className="text-slate-500">Catatan: {d.catatan}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Form Tambah Disposisi */}
        <form onSubmit={handleCreateDisposisi} className="pt-4 border-t border-slate-100 space-y-3">
          <p className="text-xs font-bold text-slate-700">Teruskan Disposisi Baru</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Diteruskan Ke Unit</label>
              <select
                value={keUnitId}
                onChange={(e) => setKeUnitId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Instruksi Disposisi</label>
              <input
                type="text"
                required
                value={instruksi}
                onChange={(e) => setInstruksi(e.target.value)}
                placeholder="Misal: Tindak lanjuti penerbitan surat"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
          >
            Kirim Disposisi
          </button>
        </form>
      </div>

      {/* Admin Action: Update Status */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Perbarui Status Surat (Tata Usaha / Dekanat)</h3>
        <form onSubmit={handleUpdateStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Status Surat</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="diajukan">Diajukan</option>
              <option value="diproses">Diproses</option>
              <option value="disetujui">Disetujui</option>
              <option value="selesai">Selesai (Terbit)</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Nomor Surat Resmi (Opsional)</label>
            <input
              type="text"
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
              placeholder="Misal: 046/UNUSU/BAAK/KM/X/2026"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Pejabat Penandatangan</label>
            <input
              type="text"
              value={signedBy}
              onChange={(e) => setSignedBy(e.target.value)}
              placeholder="Misal: Drs. H. M. Yusuf, M.Pd."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
            >
              Simpan Perubahan Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
