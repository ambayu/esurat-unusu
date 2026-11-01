import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Inbox, 
  Send, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowRight, 
  RotateCw, 
  Filter,
  Plus,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { fetchAdminStats, AdminStatsData, SuratItem, DisposisiItem } from '../services/api';
import { CardContainer } from '../components/CardContainer';
import { AdminPanelTemplate } from '../components/AdminPanelTemplate';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchAdminStats()
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.data);
        } else {
          setError('Gagal memuat ringkasan statistik');
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || 'Terjadi kesalahan jaringan saat memuat data statistik');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selesai':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Selesai</span>;
      case 'diproses':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" /> Diproses</span>;
      case 'disetujui':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Disetujui</span>;
      case 'ditolak':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800"><AlertCircle className="w-3 h-3 mr-1" /> Ditolak</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" /> Diajukan</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Panel Standar LPPM */}
      <AdminPanelTemplate
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            Panel Tata Usaha & Biro
          </span>
        }
        title="Ringkasan Persuratan Digital"
        description="Pantau arus lalu lintas surat masuk, surat keluar, antrean permohonan, serta disposisi pimpinan UNUSU secara real-time."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/surat-form?tipe=masuk"
              aria-label="Input surat masuk baru"
              className="inline-flex items-center px-3.5 py-2.5 rounded-[12px] bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs transition min-h-[44px] shadow-2xs focus:outline-none"
            >
              <Inbox className="w-3.5 h-3.5 mr-1.5" />
              <span>Input Surat Masuk</span>
            </Link>
            <Link
              to="/admin/surat-form?tipe=keluar"
              aria-label="Input surat keluar baru"
              className="inline-flex items-center px-3.5 py-2.5 rounded-[12px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition min-h-[44px] focus:outline-none"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>Input Surat Keluar</span>
            </Link>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              aria-label="Segarkan data statistik persuratan"
              className="inline-flex items-center px-3.5 py-2.5 rounded-[12px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              title="Muat ulang data"
            >
              <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
            <Link
              to="/admin/surat"
              aria-label="Kelola agenda surat"
              className="inline-flex items-center px-4 py-2.5 rounded-[12px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition min-h-[44px] focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              <span>Agenda Surat</span>
            </Link>
          </div>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Selamat datang di Pusat Kontrol Tata Naskah & Disposisi Elektronik UNUSU. Anda dapat memvalidasi dokumen masuk, mengesahkan penomoran surat keluar, dan mendelegasikan disposisi unit kerja.
        </p>
      </AdminPanelTemplate>

      {/* Error State with Retry Button */}
      {error && (
        <CardContainer>
          <ErrorState
            title="Gagal Memuat Ringkasan Statistik"
            description={error}
            onRetry={loadData}
          />
        </CardContainer>
      )}

      {/* Loading Skeleton / State */}
      {loading && !stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-[#CBD5E1] rounded-[14px] p-5 h-28 animate-pulse bg-slate-100" />
          ))}
        </div>
      )}

      {/* Metrics Cards Grid (UI Container Governance compliant: radius 14px, border #CBD5E1) */}
      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Surat Masuk */}
            <div className="bg-white border border-[#CBD5E1] rounded-[14px] p-5 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Surat Masuk</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Inbox className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-slate-900">{stats.surat.masuk}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Total arsip surat dinas eksternal</p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs font-bold">
                <Link 
                  to="/admin/surat?tipe=masuk" 
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  Daftar <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/admin/surat-form?tipe=masuk"
                  className="text-slate-600 hover:text-blue-700 bg-slate-50 px-2 py-1 rounded-[8px] border border-slate-200"
                >
                  + Input
                </Link>
              </div>
            </div>

            {/* Surat Keluar */}
            <div className="bg-white border border-[#CBD5E1] rounded-[14px] p-5 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Surat Keluar</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-slate-900">{stats.surat.keluar}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Surat resmi & surat keterangan</p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs font-bold">
                <Link 
                  to="/admin/surat?tipe=keluar" 
                  className="text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                >
                  Daftar <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/admin/surat-form?tipe=keluar"
                  className="text-slate-600 hover:text-emerald-700 bg-slate-50 px-2 py-1 rounded-[8px] border border-slate-200"
                >
                  + Input
                </Link>
              </div>
            </div>

            {/* Menunggu Persetujuan / Pending */}
            <div className="bg-white border border-[#CBD5E1] rounded-[14px] p-5 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Pending</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-amber-600">{stats.surat.pending}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Perlu verifikasi & penomoran</p>
              </div>
              <Link 
                to="/admin/surat?status=diajukan" 
                className="mt-3 text-xs font-bold text-amber-600 hover:text-amber-800 inline-flex items-center gap-1"
              >
                Proses permohonan <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Total Disposisi */}
            <div className="bg-white border border-[#CBD5E1] rounded-[14px] p-5 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disposisi Pimpinan</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-slate-900">{stats.disposisi.total}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  <span className="text-purple-600 font-semibold">{stats.disposisi.menunggu} menunggu</span>, {stats.disposisi.diproses} proses
                </p>
              </div>
              <Link 
                to="/admin/surat" 
                className="mt-3 text-xs font-bold text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
              >
                Cek riwayat disposisi <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Breakdown Status Card Container */}
          <CardContainer
            title="Distribusi Status Seluruh Surat"
            subtitle="Ringkasan proporsi status alur hidup tata naskah"
            badge={<TrendingUp className="w-4 h-4 text-emerald-700" />}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-center">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-xs font-bold text-amber-800 block">Diajukan</span>
                <span className="text-2xl font-black text-amber-700 mt-1 block">{stats.surat.pending}</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-xs font-bold text-blue-800 block">Diproses</span>
                <span className="text-2xl font-black text-blue-700 mt-1 block">{stats.surat.diproses}</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="text-xs font-bold text-indigo-800 block">Disetujui</span>
                <span className="text-2xl font-black text-indigo-700 mt-1 block">{stats.surat.disetujui}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 block">Selesai</span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">{stats.surat.selesai}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-xs font-bold text-rose-800 block">Ditolak</span>
                <span className="text-2xl font-black text-rose-700 mt-1 block">{stats.surat.ditolak}</span>
              </div>
            </div>
          </CardContainer>

          {/* 2 Column Section: Surat Terbaru & Disposisi Terbaru */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Surat Terbaru Container */}
            <CardContainer
              title="Surat & Permohonan Terbaru"
              subtitle="5 berkas surat dan permohonan terkini"
              badge={<FileText className="w-4 h-4 text-emerald-700" />}
              actions={
                <Link to="/admin/surat" className="text-xs font-bold text-emerald-700 hover:text-emerald-900 min-h-[44px] inline-flex items-center">
                  Lihat Semua
                </Link>
              }
            >
              {stats.recentSurat.length === 0 ? (
                <EmptyState
                  title="Belum Ada Catatan Surat"
                  description="Belum ada surat masuk atau permohonan surat yang tersimpan dalam sistem."
                />
              ) : (
                <div className="space-y-3">
                  {stats.recentSurat.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors bg-slate-50/50 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {item.nomorAgenda}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded">
                            {item.tipeSurat}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-1 truncate" title={item.perihal}>
                          {item.perihal}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Pemohon: <span className="font-medium text-slate-700">{item.pemohonNama}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {getStatusBadge(item.status)}
                        <Link
                          to={`/admin/surat/${item.id}`}
                          className="text-[11px] font-bold text-emerald-700 hover:underline inline-flex items-center min-h-[44px]"
                        >
                          Detail <ChevronRight className="w-3 h-3 ml-0.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContainer>

            {/* Disposisi Terakhir Container */}
            <CardContainer
              title="Instruksi Disposisi Terakhir"
              subtitle="5 disposisi dan delegasi pimpinan terbaru"
              badge={<Layers className="w-4 h-4 text-purple-700" />}
              actions={
                <Link to="/admin/surat" className="text-xs font-bold text-purple-700 hover:text-purple-900 min-h-[44px] inline-flex items-center">
                  Semua Surat
                </Link>
              }
            >
              {stats.recentDisposisi.length === 0 ? (
                <EmptyState
                  title="Belum Ada Catatan Disposisi"
                  description="Belum ada instruksi disposisi dari pimpinan yang tercatat."
                />
              ) : (
                <div className="space-y-3">
                  {stats.recentDisposisi.map((disp: any) => (
                    <div 
                      key={disp.id} 
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 transition-colors bg-slate-50/50 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {disp.dariUnit} ➔ {disp.keUnit?.nama || 'Unit Kerja'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                          {disp.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-semibold line-clamp-2">
                        "{disp.instruksi}"
                      </p>
                      {disp.catatan && (
                        <p className="text-[11px] text-slate-500 italic">
                          Catatan: {disp.catatan}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 mt-1">
                        <span>Surat #{disp.suratId}</span>
                        <Link 
                          to={`/admin/surat/${disp.suratId}`}
                          className="font-bold text-purple-700 hover:underline min-h-[44px] inline-flex items-center"
                        >
                          Periksa Surat
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContainer>
          </div>
        </>
      )}
    </div>
  );
};

const ChevronRightSmall = () => (
  <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
  </svg>
);
