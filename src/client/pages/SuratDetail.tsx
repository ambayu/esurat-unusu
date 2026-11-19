import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UserIcon,
  UserPlusIcon,
  XMarkIcon,
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
import { PageShell } from '../components/PageShell';
import { CardContainer } from '../components/CardContainer';

const STATUS_STEPS = [
  { key: 'diajukan', label: '1. Diajukan', desc: 'Permohonan naskah diajukan pemohon' },
  { key: 'diproses', label: '2. Diproses', desc: 'Penelaahan biro & lembar disposisi' },
  { key: 'disetujui', label: '3. Disetujui', desc: 'Persetujuan pimpinan berwenang' },
  { key: 'selesai', label: '4. Selesai', desc: 'Penomoran surat & TTE QR aktif' },
];

export const SuratDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [surat, setSurat] = useState<SuratItem | null>(null);
  const [units, setUnits] = useState<UnitKerjaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNoSurat, setLoadingNoSurat] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSubmittingDisposisi, setIsSubmittingDisposisi] = useState(false);
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
          text: `Nomor surat otomatis berhasil di-generate sesuai format: ${res.data.data.formatTemplate}`
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
    setIsUpdatingStatus(true);
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
    } finally {
      setIsUpdatingStatus(false);
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
    setIsSubmittingDisposisi(true);
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
    } finally {
      setIsSubmittingDisposisi(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-surat-green-50 text-surat-green-dark border border-surat-green-200">
            <CheckCircleIcon className="w-3.5 h-3.5 text-surat-green" /> Selesai
          </span>
        );
      case 'disetujui':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-600" /> Disetujui
          </span>
        );
      case 'diproses':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <ClockIcon className="w-3.5 h-3.5 text-amber-600" /> Diproses
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <ExclamationCircleIcon className="w-3.5 h-3.5 text-rose-600" /> Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <DocumentTextIcon className="w-3.5 h-3.5 text-slate-500" /> Diajukan
          </span>
        );
    }
  };

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    if (currentStatus === 'ditolak') {
      if (stepKey === 'diajukan') return 'completed';
      return 'rejected';
    }
    const order = ['diajukan', 'diproses', 'disetujui', 'selesai'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  if (loading) {
    return (
      <div className="w-full py-16 text-center text-slate-400 bg-white border border-[#CBD5E1] rounded-[16px]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-surat-green mb-3" />
        <p className="text-sm font-semibold text-slate-600">Memuat rincian naskah surat...</p>
      </div>
    );
  }

  if (!surat) {
    return (
      <div className="w-full py-16 text-center text-slate-500 bg-white border border-[#CBD5E1] rounded-[16px] space-y-4">
        <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Surat Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">Naskah dinas dengan ID #{id} tidak terdaftar pada basis data persuratan.</p>
        <Link
          to="/admin/surat"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-surat-green text-white font-bold text-xs hover:bg-surat-green-dark"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Kembali ke Agenda Surat</span>
        </Link>
      </div>
    );
  }

  return (
    <PageShell
      title={surat.perihal}
      description={`Agenda: ${surat.nomorAgenda} • Jenis: ${surat.jenisSurat?.nama || 'Naskah Dinas'} • Diajukan: ${new Date(
        surat.createdAt
      ).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
      badge={
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
              surat.tipeSurat === 'masuk'
                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                : 'bg-surat-green-50 text-surat-green-dark border border-surat-green-200'
            }`}
          >
            {surat.tipeSurat === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}
          </span>
          {getStatusBadge(surat.status)}
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            ID: #{surat.id}
          </span>
        </div>
      }
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/admin/surat"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[12px] border border-[#CBD5E1] bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs min-h-[44px] transition"
          >
            <ArrowLeftIcon className="w-4 h-4 text-slate-500" />
            <span>Kembali ke Agenda</span>
          </Link>
          <Link
            to={`/verifikasi/${surat.qrCodeToken}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-surat-green-50 text-surat-green-dark border border-surat-green-200 hover:bg-surat-green-100 font-bold text-xs min-h-[44px] transition"
            title="Buka Halaman Verifikasi Publik"
          >
            <QrCodeIcon className="w-4 h-4 text-surat-green" />
            <span>Cek Validitas QR</span>
          </Link>
        </div>
      }
    >
      {/* Global Status Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-[14px] flex items-center justify-between text-xs sm:text-sm font-semibold transition ${
            statusMessage.type === 'success'
              ? 'bg-surat-green-50 border border-surat-green-200 text-surat-green-dark'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 text-surat-green shrink-0" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* WORKFLOW STEPPER ALUR SURAT */}
      <CardContainer
        title="Alur Progres Naskah Persuratan"
        subtitle="Tahapan siklus hidup dokumen dari registrasi awal hingga penomoran resmi dan tanda tangan elektronik."
        badge={
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
            Siklus Naskah
          </span>
        }
      >
        <div className="py-2">
          {/* Stepper Bar Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {STATUS_STEPS.map((step, idx) => {
              const state = getStepStatus(step.key, surat.status);
              const isLast = idx === STATUS_STEPS.length - 1;

              return (
                <div key={step.key} className="relative flex flex-col">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        state === 'completed'
                          ? 'bg-surat-green text-white shadow-xs'
                          : state === 'current'
                          ? 'bg-white border-2 border-surat-green text-surat-green shadow-xs ring-4 ring-surat-green/10'
                          : state === 'rejected'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 border border-slate-200 text-slate-400'
                      }`}
                    >
                      {state === 'completed' ? (
                        <CheckIcon className="w-5 h-5 stroke-[2.5]" />
                      ) : state === 'rejected' ? (
                        <XMarkIcon className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`block text-xs font-bold leading-tight ${
                          state === 'completed' || state === 'current'
                            ? 'text-slate-900'
                            : state === 'rejected'
                            ? 'text-rose-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="block text-[11px] text-slate-500 truncate mt-0.5">
                        {step.desc}
                      </span>
                    </div>
                  </div>

                  {/* Highlight bar line */}
                  <div
                    className={`h-1.5 w-full rounded-full mt-3 ${
                      state === 'completed'
                        ? 'bg-surat-green'
                        : state === 'current'
                        ? 'bg-surat-green/40'
                        : state === 'rejected'
                        ? 'bg-rose-500'
                        : 'bg-slate-100'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Banner Peringatan jika status Ditolak */}
          {surat.status === 'ditolak' && (
            <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-[12px] flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-900">Naskah Ditangguhkan / Ditolak oleh Pimpinan</p>
                <p className="text-xs text-rose-700 mt-0.5">
                  Dokumen ini membutuhkan revisi atau penyesuaian kelengkapan berkas sebelum dapat diproses kembali.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContainer>

      {/* GRID DUA KOLOM: INFORMASI & DOKUMEN (KIRI) VS WORKFLOW TINDAK LANJUT (KANAN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI (7/12): METADATA SURAT & PRATINJAU BERKAS */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Metadata Naskah */}
          <CardContainer
            title="Informasi Naskah Dinas"
            subtitle="Metadata identitas pemohon, klasifikasi permohonan, dan legalitas surat."
            badge={<DocumentTextIcon className="w-4 h-4 text-surat-green" />}
          >
            <div className="space-y-4">
              {/* Highlight Nomor Agenda & Nomor Surat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-[12px]">
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Nomor Agenda Arsip
                  </span>
                  <p className="font-mono font-bold text-sm text-slate-900 mt-0.5">{surat.nomorAgenda}</p>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Nomor Surat Resmi
                  </span>
                  {surat.nomorSurat ? (
                    <p className="font-mono font-bold text-sm text-surat-green mt-0.5">{surat.nomorSurat}</p>
                  ) : (
                    <p className="text-xs text-slate-400 italic mt-0.5">Belum diterbitkan</p>
                  )}
                </div>
              </div>

              {/* Rincian Pemohon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white border border-[#CBD5E1] rounded-[10px]">
                  <span className="text-slate-400 block text-[10px] font-semibold">Nama Pemohon</span>
                  <strong className="text-slate-800 font-bold block mt-0.5 truncate">{surat.pemohonNama}</strong>
                </div>
                <div className="p-3 bg-white border border-[#CBD5E1] rounded-[10px]">
                  <span className="text-slate-400 block text-[10px] font-semibold">NIDN / NIM</span>
                  <strong className="text-slate-800 font-mono font-bold block mt-0.5">{surat.pemohonId || '-'}</strong>
                </div>
                <div className="p-3 bg-white border border-[#CBD5E1] rounded-[10px]">
                  <span className="text-slate-400 block text-[10px] font-semibold">Program Studi / Unit</span>
                  <strong className="text-slate-800 font-bold block mt-0.5 truncate">{surat.pemohonProdi || '-'}</strong>
                </div>
              </div>

              {/* Keperluan */}
              {surat.keperluan && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[10px]">
                  <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider mb-1">
                    Uraian Keperluan / Catatan Pemohon:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">{surat.keperluan}</p>
                </div>
              )}

              {/* TTE Signature & QR Info */}
              <div className="p-3.5 bg-surat-green-50/60 border border-surat-green-100 rounded-[12px] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[10px] bg-surat-green text-white flex items-center justify-center shrink-0">
                    <QrCodeIcon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-surat-green-dark block">
                      Tanda Tangan Elektronik (TTE Digital)
                    </span>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      {surat.signedBy ? (
                        <>Disahkan oleh: <strong className="font-semibold text-slate-800">{surat.signedBy}</strong></>
                      ) : (
                        'Menunggu penandatanganan pimpinan berwenang'
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 block">{surat.qrCodeToken.slice(0, 12)}...</span>
                  <span className="text-[10px] font-bold text-surat-green block mt-0.5">Valid QR Token</span>
                </div>
              </div>
            </div>
          </CardContainer>

          {/* Card Pratinjau Dokumen Berkas Lampiran */}
          <CardContainer
            title="Pratinjau Dokumen Lampiran"
            subtitle="Berkas digital naskah dinas yang diunggah pemohon atau operator persuratan."
            badge={<DocumentArrowUpIcon className="w-4 h-4 text-surat-green" />}
            actions={
              surat.lampiranUrl ? (
                <a
                  href={getAssetUrl(surat.lampiranUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Unduh atau buka berkas lampiran surat"
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 bg-surat-green text-white hover:bg-surat-green-dark text-xs font-bold rounded-[10px] transition shadow-xs"
                  title="Unduh atau buka di tab baru"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  <span>Buka Berkas</span>
                </a>
              ) : undefined
            }
          >
            {surat.lampiranUrl ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-[10px] text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <DocumentTextIcon className="w-5 h-5 text-surat-green shrink-0" />
                    <span className="font-mono font-medium text-slate-700 truncate">{surat.lampiranUrl}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 uppercase">
                    {surat.lampiranUrl.split('.').pop() || 'FILE'}
                  </span>
                </div>

                {/* Frame Preview */}
                <div className="w-full bg-slate-100 rounded-[12px] border border-slate-200 overflow-hidden min-h-[320px] flex items-center justify-center">
                  {surat.lampiranUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                    <img
                      src={getAssetUrl(surat.lampiranUrl)}
                      alt="Pratinjau Lampiran Naskah Surat"
                      className="max-h-[500px] w-auto object-contain p-2"
                      loading="lazy"
                    />
                  ) : (
                    <iframe
                      src={getAssetUrl(surat.lampiranUrl)}
                      title="Pratinjau Berkas Lampiran PDF / Dokumen"
                      className="w-full h-[460px] border-0"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-[12px] border border-dashed border-slate-200 space-y-2">
                <DocumentTextIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Tidak ada berkas lampiran digital yang dilampirkan.</p>
                <p className="text-[11px] text-slate-400">Naskah ini didaftarkan tanpa berkas fisik terunggah.</p>
              </div>
            )}
          </CardContainer>
        </div>

        {/* KOLOM KANAN (5/12): TINDAK LANJUT DISPOSISI & APPROVAL PENGESAHAN */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Pengesahan Status Surat */}
          <CardContainer
            title="Pengesahan & Status Naskah"
            subtitle="Pembaruan status persetujuan, penomoran resmi, dan pengesahan TTE."
            badge={<ShieldCheckIcon className="w-4 h-4 text-surat-green" />}
          >
            <form onSubmit={handleUpdateStatus} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Persetujuan Naskah *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px] bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-surat-green-light"
                >
                  <option value="diajukan">Diajukan (Tahap Permohonan Awal)</option>
                  <option value="diproses">Diproses (Sedang Ditelaah / Disposisi)</option>
                  <option value="disetujui">Disetujui (Disahkan Pimpinan)</option>
                  <option value="selesai">Selesai (Nomor Terbit & TTE Valid)</option>
                  <option value="ditolak">Ditolak (Perlu Revisi / Tidak Sesuai)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Nomor Surat Resmi</label>
                  <button
                    type="button"
                    onClick={handleGenerateNomor}
                    disabled={loadingNoSurat}
                    className="text-[11px] text-surat-green hover:text-surat-green-dark font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    title="Generate nomor otomatis sesuai format jenis surat"
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                    <span>{loadingNoSurat ? 'Membuat...' : 'Auto-Generate'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  placeholder="Misal: 046/UNUSU/BAAK/KM/X/2026"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-surat-green-light"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pejabat Penandatangan (TTE Digital)</label>
                <input
                  type="text"
                  value={signedBy}
                  onChange={(e) => setSignedBy(e.target.value)}
                  placeholder="Misal: Prof. Dr. H. Syahrizal, M.A."
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-surat-green-light"
                />
              </div>

              {newStatus === 'ditolak' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-[10px] space-y-1">
                  <label className="font-bold text-rose-800 block text-[11px]">
                    Alasan Penolakan / Catatan Perbaikan *
                  </label>
                  <textarea
                    rows={2}
                    value={catatanPenolakan}
                    onChange={(e) => setCatatanPenolakan(e.target.value)}
                    placeholder="Tuliskan catatan alasan penolakan agar pemohon dapat memperbaiki dokumen..."
                    className="w-full p-2 border border-rose-300 rounded-[8px] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdatingStatus}
                className="w-full mt-2 min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-[12px] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <DocumentCheckIcon className="w-4 h-4 text-surat-green-light" />
                <span>{isUpdatingStatus ? 'Menyimpan...' : 'Simpan & Sahkan Perubahan'}</span>
              </button>
            </form>
          </CardContainer>

          {/* Card Lembar Disposisi Pimpinan */}
          <CardContainer
            title="Lembar Disposisi Pimpinan"
            subtitle="Pendelegasian tindak lanjut naskah dinas ke unit kerja di lingkungan universitas."
            badge={<InboxIcon className="w-4 h-4 text-surat-green" />}
          >
            <div className="space-y-4">
              {/* Riwayat Disposisi Timeline */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                  Riwayat Disposisi Naskah ({surat.disposisiList?.length || 0})
                </span>
                {(!surat.disposisiList || surat.disposisiList.length === 0) ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-[10px] border border-dashed border-slate-200">
                    Belum ada instruksi disposisi dari pimpinan untuk naskah ini.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {surat.disposisiList.map((d, index) => (
                      <div
                        key={d.id || index}
                        className="p-3 rounded-[10px] bg-slate-50 border border-slate-200 text-xs space-y-1 relative"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span className="text-surat-green-dark truncate pr-2">
                            {d.dariUnit} ➔ {d.keUnit?.nama || 'Unit Terkait'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal shrink-0">
                            {new Date(d.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium leading-relaxed">
                          <strong className="text-slate-900">Instruksi:</strong> {d.instruksi}
                        </p>
                        {d.catatan && (
                          <p className="text-slate-500 text-[11px]">
                            <strong className="text-slate-600">Catatan:</strong> {d.catatan}
                          </p>
                        )}
                        {d.deadline && (
                          <div className="pt-1 flex items-center gap-1 text-[10px] text-amber-700 font-semibold">
                            <ClockIcon className="w-3 h-3 text-amber-600" />
                            <span>Batas Waktu: {new Date(d.deadline).toLocaleDateString('id-ID')}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Tambah Disposisi */}
              <form onSubmit={handleCreateDisposisi} className="pt-3 border-t border-slate-200 space-y-3 text-xs">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                  Teruskan Disposisi Baru
                </span>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Diteruskan Ke Unit *</label>
                  <select
                    value={keUnitId}
                    onChange={(e) => setKeUnitId(e.target.value)}
                    className="w-full px-3 py-2 rounded-[10px] border border-[#CBD5E1] bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-surat-green-light"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama} ({u.kode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Instruksi Disposisi *</label>
                  <input
                    type="text"
                    required
                    value={instruksi}
                    onChange={(e) => setInstruksi(e.target.value)}
                    placeholder="Misal: Tindak lanjuti penerbitan surat tugas..."
                    className="w-full px-3 py-2 rounded-[10px] border border-[#CBD5E1] text-xs focus:outline-none focus:ring-2 focus:ring-surat-green-light"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Batas Waktu (Deadline)</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-[10px] border border-[#CBD5E1] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-surat-green-light"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Catatan Tambahan</label>
                    <input
                      type="text"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Opsional..."
                      className="w-full px-3 py-2 rounded-[10px] border border-[#CBD5E1] text-xs focus:outline-none focus:ring-2 focus:ring-surat-green-light"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingDisposisi}
                  className="w-full min-h-[44px] px-4 py-2 bg-surat-green hover:bg-surat-green-dark text-white font-bold text-xs rounded-[12px] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="w-3.5 h-3.5" />
                  <span>{isSubmittingDisposisi ? 'Meneruskan...' : 'Kirim Lembar Disposisi'}</span>
                </button>
              </form>
            </div>
          </CardContainer>
        </div>
      </div>
    </PageShell>
  );
};

export default SuratDetail;
