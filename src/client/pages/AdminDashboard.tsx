import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchAdminStats, AdminStatsData, SuratItem, DisposisiItem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CardContainer } from '../components/CardContainer';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ReportCard, DonutChart, BarChart, StackedBar, GaugeRing } from '../components/LaporanCharts';
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  InboxIcon,
  PaperAirplaneIcon,
  PlusIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStatsData | null>(null);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 19) return 'Selamat sore';
    return 'Selamat malam';
  })();
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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surat-green-100 text-surat-green-dark"><CheckCircleIcon className="w-3 h-3 mr-1" /> Selesai</span>;
      case 'diproses':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800"><ClockIcon className="w-3 h-3 mr-1" /> Diproses</span>;
      case 'disetujui':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700"><CheckCircleIcon className="w-3 h-3 mr-1" /> Disetujui</span>;
      case 'ditolak':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800"><ExclamationCircleIcon className="w-3 h-3 mr-1" /> Ditolak</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800"><ClockIcon className="w-3 h-3 mr-1" /> Diajukan</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Catatan tata letak: JANGAN tambahkan `max-w-7xl mx-auto` di sini.
       *  `AdminLayout` sudah memberi padding `p-5 sm:p-7` pada elemen <main>,
       *  dan halaman panel lain (Surat, Pengguna, Peran, Izin, Profil) tidak
       *  memakai pembatas lebar. Menambahkan `max-w-7xl mx-auto` membuat
       *  dashboard terpusat dengan margin kiri-kanan lebih lebar daripada
       *  halaman lain, sehingga kolomnya terlihat "menyempit" saat berpindah
       *  menu. */}
      {/* Welcome Banner : identitas sesi + sapaan kontekstual */}
      <section
        aria-label="Sambutan panel E-Surat"
        className="relative overflow-hidden rounded-[16px] border border-surat-green-dark bg-surat-green text-white"
      >
        <div className="px-5 py-6 sm:px-7 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-surat-gold">
                Panel Tata Usaha &amp; Biro
              </span>
              <h1 className="mt-2.5 text-xl sm:text-2xl font-bold leading-snug">
                {greeting}, {user?.nama?.split(' ')[0] || 'Pengguna'}
              </h1>
              <p className="mt-1.5 max-w-xl text-xs sm:text-sm text-surat-green-50/90 leading-relaxed">
                Pusat kendali tata naskah dan disposisi elektronik UNUSU. Validasi surat masuk, sahkan
                penomoran surat keluar, lalu teruskan disposisi ke unit kerja terkait.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                to="/admin/surat-form?tipe=masuk"
                className="min-h-[44px] inline-flex items-center gap-1.5 rounded-[8px] bg-white px-3.5 text-xs font-bold text-surat-green hover:bg-surat-green-50 transition-colors"
              >
                <InboxIcon className="w-3.5 h-3.5" />
                <span>Input Surat Masuk</span>
              </Link>
              <Link
                to="/admin/surat-form?tipe=keluar"
                className="min-h-[44px] inline-flex items-center gap-1.5 rounded-[8px] bg-surat-gold px-3.5 text-xs font-bold text-slate-950 hover:bg-[#c5a132] transition-colors"
              >
                <PaperAirplaneIcon className="w-3.5 h-3.5" />
                <span>Input Surat Keluar</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

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
            <div className="bg-white border border-[#CBD5E1] rounded-[14px] p-5 hover:border-surat-green-light transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Surat Masuk</span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <InboxIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-slate-900">{stats.surat.masuk}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Total arsip surat dinas eksternal</p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs font-bold">
                <Link 
                  to="/admin/surat?tipe=masuk" 
                  className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                >
                  Daftar <ArrowRightIcon className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Surat Keluar */}
            <div className="bg-white border border-[#CBD5E1] rounded-[14px] p-5 hover:border-surat-green-light transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Surat Keluar</span>
                <div className="w-9 h-9 rounded-xl bg-surat-green-50 text-surat-green flex items-center justify-center">
                  <PaperAirplaneIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-slate-900">{stats.surat.keluar}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Surat resmi & surat keterangan</p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs font-bold">
                <Link 
                  to="/admin/surat?tipe=keluar" 
                  className="text-surat-green hover:text-surat-green-dark inline-flex items-center gap-1"
                >
                  Daftar <ArrowRightIcon className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Menunggu Persetujuan / Pending */}
            <div className="bg-white border border-[#CBD5E1] rounded-[14px] p-5 hover:border-surat-green-light transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Pending</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <ClockIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-amber-600">{stats.surat.pending}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Perlu verifikasi & penomoran</p>
              </div>
              <Link 
                to="/admin/surat?status=diajukan" 
                className="mt-3 text-xs font-bold text-amber-600 hover:text-amber-800 inline-flex items-center gap-1"
              >
                Proses permohonan <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>

            {/* Total Disposisi */}
            <div className="bg-white border border-[#CBD5E1] rounded-[14px] p-5 hover:border-surat-green-light transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disposisi Pimpinan</span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <RectangleStackIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-slate-900">{stats.disposisi.total}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  <span className="text-slate-700 font-semibold">{stats.disposisi.menunggu} menunggu</span>, {stats.disposisi.diproses} proses
                </p>
              </div>
              <Link 
                to="/admin/surat" 
                className="mt-3 text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
              >
                Cek riwayat disposisi <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Laporan Grafik per Menu : tanpa panel aksi cepat */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReportCard
              title="Laporan Alur Status Surat"
              subtitle="Proporsi status tata naskah seluruh surat"
            >
              <DonutChart
                data={[
                  { label: 'Diajukan', value: stats.surat.pending, color: '#D97706' },
                  { label: 'Diproses', value: stats.surat.diproses, color: '#2563EB' },
                  { label: 'Disetujui', value: stats.surat.disetujui, color: '#4F46E5' },
                  { label: 'Selesai', value: stats.surat.selesai, color: '#059669' },
                  { label: 'Ditolak', value: stats.surat.ditolak, color: '#E11D48' },
                ].filter((d) => d.value > 0)}
                centerLabel="Total Surat"
                centerValue={stats.surat.total}
              />
            </ReportCard>

            <ReportCard
              title="Laporan Beban Kerja Disposisi"
              subtitle="Status instruksi pimpinan yang berjalan"
            >
              <div className="space-y-4">
                <StackedBar
                  data={[
                    { label: 'Menunggu', value: stats.disposisi.menunggu, color: '#D97706' },
                    { label: 'Diproses', value: stats.disposisi.diproses, color: '#2563EB' },
                    { label: 'Selesai', value: stats.disposisi.selesai, color: '#059669' },
                  ]}
                />
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <GaugeRing
                    value={stats.disposisi.selesai}
                    total={Math.max(stats.disposisi.total, 1)}
                    label="Tuntas"
                    color="#059669"
                    size={88}
                  />
                  <GaugeRing
                    value={stats.disposisi.diproses}
                    total={Math.max(stats.disposisi.total, 1)}
                    label="Diproses"
                    color="#2563EB"
                    size={88}
                  />
                  <GaugeRing
                    value={stats.disposisi.menunggu}
                    total={Math.max(stats.disposisi.total, 1)}
                    label="Menunggu"
                    color="#D97706"
                    size={88}
                  />
                </div>
              </div>
            </ReportCard>

            <ReportCard
              title="Laporan Volume Surat per Jenis"
              subtitle="Perbandingan arsip surat masuk dan surat keluar"
            >
              <BarChart
                data={[
                  { label: 'Surat Masuk', value: stats.surat.masuk, color: '#2563EB' },
                  { label: 'Surat Keluar', value: stats.surat.keluar, color: '#059669' },
                ]}
                unit=" surat"
              />
            </ReportCard>

            <ReportCard
              title="Laporan Penyelesaian Tata Naskah"
              subtitle="Capaian surat yang telah tuntas diproses"
            >
              <div className="flex items-center justify-around gap-2 py-2">
                <GaugeRing
                  value={stats.surat.selesai}
                  total={Math.max(stats.surat.total, 1)}
                  label="Surat Selesai"
                  color="#059669"
                  size={116}
                />
                <GaugeRing
                  value={stats.surat.selesai + stats.surat.disetujui}
                  total={Math.max(stats.surat.total, 1)}
                  label="Disetujui + Selesai"
                  color="#4F46E5"
                  size={116}
                />
              </div>
            </ReportCard>
          </div>

          {/* 2 Column Section: Surat Terbaru & Disposisi Terbaru */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Surat Terbaru Container */}
            <CardContainer
              title="Surat & Permohonan Terbaru"
              subtitle="5 berkas surat dan permohonan terkini"
              badge={<DocumentTextIcon className="w-4 h-4 text-surat-green" />}
              actions={
                <Link to="/admin/surat" className="text-xs font-bold text-surat-green hover:text-surat-green-dark min-h-[44px] inline-flex items-center">
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
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-surat-green-light transition-colors bg-slate-50/50 flex items-start justify-between gap-3"
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
                          className="text-[11px] font-bold text-surat-green hover:underline inline-flex items-center min-h-[44px]"
                        >
                          Detail <ChevronRightIcon className="w-3 h-3 ml-0.5" />
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
              badge={<RectangleStackIcon className="w-4 h-4 text-slate-700" />}
              actions={
                <Link to="/admin/surat" className="text-xs font-bold text-slate-700 hover:text-slate-900 min-h-[44px] inline-flex items-center">
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
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-surat-green transition-colors bg-slate-50/50 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
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
                          className="font-bold text-slate-700 hover:underline min-h-[44px] inline-flex items-center"
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
