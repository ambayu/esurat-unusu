import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  InboxIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { 
  fetchSuratDetail, 
  updateStatusSurat, 
  createDisposisi, 
  fetchUnitKerja, 
  fetchRekomendasiNomorSurat,
  SuratItem, 
  UnitKerjaItem, 
  getAssetUrl 
} from '../services/api';


export const SuratDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [surat, setSurat] = useState<SuratItem | null>(null);
  const [units, setUnits] = useState<UnitKerjaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNoSurat, setLoadingNoSurat] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Disposisi form state
  const [keUnitId, setKeUnitId] = useState('');
  const [instruksi, setInstruksi] = useState('');
  const [catatan, setCatatan] = useState('');
  const [deadline, setDeadline] = useState('');

  // Status update state
  const [newStatus, setNewStatus] = useState('');
  const [nomorSurat, setNomorSurat] = useState('');
  const [signedBy, setSignedBy] = useState('');
  const [catatanPenolakan, setCatatanPenolakan] = useState('');

  const loadData = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchSuratDetail(Number(id)), fetchUnitKerja()])
      .then(([suratRes, unitRes]) => {
        const suratData = suratRes.data.data;
        setSurat(suratData);
        setUnits(unitRes.data.data || []);
        setNewStatus(suratData.status);
        if (suratData.nomorSurat) {
          setNomorSurat(suratData.nomorSurat);
        }
        if (suratData.signedBy) {
          setSignedBy(suratData.signedBy);
        }
        if (unitRes.data.data && unitRes.data.data.length > 0) {
          setKeUnitId(String(unitRes.data.data[0].id));
        }
      })
      .catch((err) => {
        console.error('Gagal memuat rincian naskah surat:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleGenerateNomor = async () => {
    if (!id) return;
    setLoadingNoSurat(true);
    try {
      const res = await fetchRekomendasiNomorSurat(Number(id));
      if (res.data?.success && res.data?.data?.nomorSurat) {
        setNomorSurat(res.data.data.nomorSurat);
        setStatusMessage({
          type: 'success',
          text: `Nomor surat otomatis berhasil di-generate sesuai pola: ${res.data.data.formatTemplate}`
        });
      }
    } catch (err: any) {
      console.error('Gagal generate nomor rekomendasi:', err);
      setStatusMessage({
        type: 'error',
        text: 'Gagal men-generate nomor otomatis'
      });
    } finally {
      setLoadingNoSurat(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateStatusSurat(Number(id), {
        status: newStatus,
        nomorSurat: nomorSurat.trim() || undefined,
        signedBy: signedBy.trim() || undefined,
        catatanPenolakan: newStatus === 'ditolak' ? catatanPenolakan.trim() : undefined,
      });
      setStatusMessage({
        type: 'success',
        text: `Status naskah berhasil diperbarui menjadi ${newStatus.toUpperCase()}`
      });
      loadData();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Gagal memperbarui status naskah surat'
      });
    }
  };

  const handleCreateDisposisi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !keUnitId || !instruksi.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Unit penerima dan instruksi disposisi wajib diisi.'
      });
      return;
    }
    try {
      await createDisposisi(Number(id), {
        dariUnit: 'Rektorat / Biro Tata Usaha',
        keUnitId: Number(keUnitId),
        instruksi: instruksi.trim(),
        catatan: catatan.trim() || undefined,
        deadline: deadline || undefined,
      });
      setStatusMessage({
        type: 'success',
        text: 'Lembar disposisi pimpinan berhasil diteruskan ke unit kerja terkait!'
      });
      setInstruksi('');
      setCatatan('');
      setDeadline('');
      loadData();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Gagal meneruskan disposisi'
      });
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
      <div className="flex items-center justify-between">
        <Link to="/admin/surat" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-surat-green min-h-[44px]">
          <ArrowLeftIcon className="w-3.5 h-3.5 mr-1" />
          <span>Kembali ke Agenda Surat</span>
        </Link>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          ID Naskah: #{surat.id}
        </span>
      </div>

      {/* Global Status Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center space-x-3 text-xs sm:text-sm font-semibold transition ${
            statusMessage.type === 'success'
              ? 'bg-surat-green-50 border border-surat-green-100 text-surat-green-dark'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 text-surat-green shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Info Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded text-slate-600">
                {surat.nomorAgenda}
              </span>
              <span className="text-xs font-bold bg-surat-green-50 text-surat-green-dark px-2.5 py-1 rounded">
                {surat.jenisSurat?.nama}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">{surat.perihal}</h1>
            {surat.nomorSurat && (
              <p className="text-xs font-mono font-bold text-surat-green mt-1">
                Nomor Surat: {surat.nomorSurat}
              </p>
            )}
          </div>

          {/* QR Code Token Badge */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center shrink-0">
            <QrCodeIcon className="w-8 h-8 text-slate-700 mx-auto" />
            <span className="text-[10px] font-mono text-slate-400 block mt-1">{surat.qrCodeToken.slice(0, 16)}...</span>
            <span className="text-[10px] font-bold text-surat-green block">TTE Terverifikasi</span>
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
          <div className="flex items-center space-x-2 text-xs text-surat-green-dark bg-surat-green-50/70 p-3 rounded-xl border border-surat-green-100">
            <CheckCircleIcon className="w-4 h-4 text-surat-green shrink-0" />
            <span>Ditandatangani secara elektronik oleh: <strong>{surat.signedBy}</strong></span>
          </div>
        )}

        {surat.lampiranUrl && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
              <div className="flex items-center space-x-3 text-slate-700 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-surat-green-100/80 text-surat-green-dark flex items-center justify-center shrink-0">
                  <DocumentTextIcon className="w-5 h-5 text-surat-green" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">Berkas Lampiran Dokumen</span>
                  <span className="text-[11px] text-slate-500 font-mono block truncate">{surat.lampiranUrl}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getAssetUrl(surat.lampiranUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Unduh atau buka berkas lampiran surat"
                  className="inline-flex items-center justify-center space-x-1.5 min-h-[44px] px-4 py-2 bg-surat-green hover:bg-surat-green-dark text-white rounded-xl font-bold text-xs transition shrink-0 focus:outline-none focus:ring-2 focus:ring-surat-green-light focus:ring-offset-2"
                >
                  <span>Unduh / Buka Berkas</span>
                </a>
              </div>
            </div>

            {/* In-App Preview Berkas (PDF / Image / Frame) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <DocumentTextIcon className="w-4 h-4 text-surat-green" />
                  Preview Pratinjau Berkas Dokumen
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {surat.lampiranUrl.split('.').pop()?.toUpperCase() || 'FILE'}
                </span>
              </div>
              <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center min-h-[280px]">
                {surat.lampiranUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                  <img
                    src={getAssetUrl(surat.lampiranUrl)}
                    alt="Preview Lampiran Surat"
                    className="max-h-[500px] w-auto object-contain mx-auto"
                    loading="lazy"
                  />
                ) : (
                  <iframe
                    src={getAssetUrl(surat.lampiranUrl)}
                    title="Preview Berkas Lampiran PDF / Dokumen"
                    className="w-full h-[450px] border-0"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disposisi History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Riwayat Disposisi Naskah</h3>
        {surat.disposisiList?.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Belum ada catatan disposisi pimpinan.</p>
        ) : (
          <div className="space-y-3">
            {surat.disposisiList?.map((d) => (
              <div key={d.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-surat-green-dark">{d.dariUnit} ➔ {d.keUnit?.nama}</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Diteruskan Ke Unit *</label>
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
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Batas Waktu / Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Instruksi Disposisi *</label>
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
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Catatan Tambahan Pimpinan</label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan khusus disposisi (opsional)..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 bg-surat-green hover:bg-surat-green-dark text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <PaperAirplaneIcon className="w-3.5 h-3.5" />
              <span>Kirim Disposisi</span>
            </button>
          </div>
        </form>
      </div>

      {/* Admin Action: Update Status & Pengesahan / Approval TTE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Pengesahan & Pembaruan Status Surat</h3>
            <p className="text-xs text-slate-500">Otorisasi penerbitan nomor surat resmi, pengesahan TTE, dan validasi persetujuan naskah dinas.</p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surat-green-50 text-surat-green-dark border border-surat-green-100 self-start sm:self-auto">
            Otoritas: Admin / Dekanat / Rektorat
          </span>
        </div>
        
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Status Persetujuan Naskah</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-surat-green font-semibold"
              >
                <option value="diajukan">Diajukan (Tahap Permohonan)</option>
                <option value="diproses">Diproses (Sedang Ditelaah Biro)</option>
                <option value="disetujui">Disetujui (Disahkan Pimpinan)</option>
                <option value="selesai">Selesai (Nomor Terbit & Tervalidasi)</option>
                <option value="ditolak">Ditolak (Perlu Revisi / Tidak Sesuai)</option>
              </select>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">Nomor Surat Resmi</label>
                <button
                  type="button"
                  onClick={handleGenerateNomor}
                  disabled={loadingNoSurat}
                  className="text-[10px] text-surat-green hover:text-surat-green-dark font-bold inline-flex items-center gap-1 cursor-pointer"
                  title="Generate nomor otomatis berdasarkan template format jenis surat"
                >
                  <PencilSquareIcon className="w-3 h-3" />
                  <span>{loadingNoSurat ? 'Membuat...' : 'Auto-Generate'}</span>
                </button>
              </div>
              <input
                type="text"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                placeholder="Misal: 046/UNUSU/BAAK/KM/X/2026"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-surat-green font-mono"
              />
            </div>
            
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Pejabat Penandatangan (TTE Digital)</label>
              <input
                type="text"
                value={signedBy}
                onChange={(e) => setSignedBy(e.target.value)}
                placeholder="Misal: Prof. Dr. H. Syahrizal, M.A."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-surat-green"
              />
            </div>
          </div>

          {newStatus === 'ditolak' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <label className="text-[11px] font-bold text-rose-800 block mb-1">Alasan Penolakan / Catatan Revisi *</label>
              <textarea
                rows={2}
                value={catatanPenolakan}
                onChange={(e) => setCatatanPenolakan(e.target.value)}
                placeholder="Tuliskan catatan alasan penolakan berkas permohonan agar dapat diperbaiki..."
                className="w-full text-xs p-2.5 rounded-xl border border-rose-300 bg-white focus:outline-rose-500"
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <UserPlusIcon className="w-4 h-4 text-surat-green-light" />
              <span>Simpan & Sahkan Perubahan Status</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
