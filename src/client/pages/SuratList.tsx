import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchSuratList, deleteSurat, SuratItem, PaginationInfo } from '../services/api';
import { ListPageTemplate, ListActionButton } from '../components/ListPageTemplate';
import { useAuth } from '../context/AuthContext';
import {
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  EyeIcon,
  FunnelIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';


export const SuratList: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTipe = searchParams.get('tipe') || 'all';

  const [suratList, setSuratList] = useState<SuratItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tipeFilter, setTipeFilter] = useState(queryTipe);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const canDeleteSurat = user?.role === 'admin' || user?.permissions?.includes('surat:delete');
  const canEditSurat = user?.role === 'admin' || user?.permissions?.includes('surat:edit');

  // Sinkronkan filter tipe bila searchParams di URL berubah (misal navigasi dari sidebar)
  useEffect(() => {
    const currentTipe = searchParams.get('tipe') || 'all';
    setTipeFilter(currentTipe);
    setPage(1);
  }, [searchParams]);

  const loadData = (
    currentPage = page, 
    currentStatus = statusFilter, 
    currentSearch = search, 
    currentTipe = tipeFilter
  ) => {
    setLoading(true);
    setError(null);
    fetchSuratList({
      page: currentPage,
      limit: 8,
      status: currentStatus !== 'all' ? currentStatus : undefined,
      search: currentSearch.trim() || undefined,
      tipe: currentTipe !== 'all' ? currentTipe : undefined,
    })
      .then((res) => {
        setSuratList(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        console.error('Gagal mengambil data surat:', err);
        setError('Gagal memuat daftar surat. Periksa koneksi lalu coba lagi.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData(page, statusFilter, search, tipeFilter);
  }, [page, statusFilter, tipeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, statusFilter, search, tipeFilter);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleTipeChange = (val: string) => {
    setTipeFilter(val);
    setPage(1);
    if (val === 'all') {
      searchParams.delete('tipe');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams.entries()), tipe: val });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus arsip surat ini beserta seluruh disposisi terkait?')) return;
    try {
      await deleteSurat(id);
      loadData(page, statusFilter, search, tipeFilter);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal menghapus surat');
    }
  };

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
    <ListPageTemplate<SuratItem>
      title="Agenda Persuratan Digital"
      description="Lacak status permohonan surat keterangan, izin riset, surat tugas, dan disposisi pimpinan."
      badge={
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-surat-green-100 text-surat-green-dark uppercase tracking-wider">
          Agenda Surat
        </span>
      }
      actions={
        <>
          <ListActionButton
            to="/admin/surat-form?tipe=masuk"
            variant="secondary"
            icon={<InboxIcon className="w-4 h-4" />}
          >
            Input Surat Masuk
          </ListActionButton>
          <ListActionButton
            to="/admin/surat-form?tipe=keluar"
            icon={<PaperAirplaneIcon className="w-4 h-4" />}
          >
            Input Surat Keluar
          </ListActionButton>
        </>
      }
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Cari perihal, nomor agenda, atau nama pemohon..."
      filters={
        <>
          {/* Tab tipe surat */}
          <button
            type="button"
            onClick={() => handleTipeChange('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition min-h-[44px] ${
              tipeFilter === 'all'
                ? 'bg-surat-green text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#CBD5E1]'
            }`}
          >
            Semua ({suratList.length})
          </button>
          <button
            type="button"
            onClick={() => handleTipeChange('masuk')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition min-h-[44px] ${
              tipeFilter === 'masuk'
                ? 'bg-surat-green text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#CBD5E1]'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => handleTipeChange('keluar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition min-h-[44px] ${
              tipeFilter === 'keluar'
                ? 'bg-surat-green text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#CBD5E1]'
            }`}
          >
            Keluar
          </button>

          {/* FunnelIcon status */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            aria-label="FunnelIcon status surat"
            className="text-xs py-2 px-3 rounded-xl border border-[#CBD5E1] bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 font-semibold text-slate-700 min-h-[44px]"
          >
            <option value="all">Semua Status</option>
            <option value="diajukan">Diajukan</option>
            <option value="diproses">Diproses</option>
            <option value="disetujui">Disetujui</option>
            <option value="selesai">Selesai</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </>
      }
      tableTitle="Daftar Agenda Surat"
      tableSubtitle={`Menampilkan ${suratList.length} naskah dinas${pagination ? ` dari total ${pagination.total}` : ''}.`}
      tableBadge={
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surat-green-50 text-surat-green-dark border border-surat-green-100">
          {suratList.length} Surat
        </span>
      }
      loading={loading}
      error={error}
      onRetry={loadData}
      hasActiveFilter={Boolean(search.trim() || tipeFilter !== 'all' || statusFilter !== 'all')}
      emptyMessage="Belum ada naskah surat terdaftar."
      noResultMessage="Tidak ada data persuratan yang cocok dengan filter atau kata kunci."
      rowKey={(item) => item.id}
      rows={suratList}
      footer={
        pagination && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between p-4 border-t border-[#CBD5E1] text-xs text-slate-600 bg-slate-50/50">
            <div>
              Menampilkan halaman <strong className="font-bold text-slate-900">{pagination.page}</strong> dari{' '}
              <strong className="font-bold text-slate-900">{pagination.totalPages}</strong> (Total {pagination.total} surat)
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
              >
                <span>Selanjutnya</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : null
      }
      columns={[
        {
          key: 'agenda',
          header: 'Agenda / Nomor Surat',
          render: (item) => (
            <>
              <div className="font-mono font-bold text-slate-800 text-xs">{item.nomorAgenda}</div>
              {item.nomorSurat ? (
                <div className="text-[11px] font-mono text-surat-green mt-0.5">{item.nomorSurat}</div>
              ) : (
                <div className="text-[10px] text-slate-400 italic">Belum bernomor resmi</div>
              )}
            </>
          ),
        },
        {
          key: 'tipe',
          header: 'Tipe & Jenis',
          render: (item) => (
            <>
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1 ${
                  item.tipeSurat === 'masuk' ? 'bg-slate-100 text-slate-700' : 'bg-surat-green-50 text-surat-green'
                }`}
              >
                {item.tipeSurat === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}
              </span>
              <div className="text-slate-600 font-medium truncate max-w-[140px]" title={item.jenisSurat?.nama}>
                {item.jenisSurat?.nama || 'Surat'}
              </div>
            </>
          ),
        },
        {
          key: 'perihal',
          header: 'Perihal / Keperluan',
          cellClassName: 'max-w-xs',
          render: (item) => (
            <>
              <div className="font-bold text-slate-900 line-clamp-1" title={item.perihal}>
                {item.perihal}
              </div>
              {item.keperluan && (
                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={item.keperluan}>
                  {item.keperluan}
                </div>
              )}
            </>
          ),
        },
        {
          key: 'pemohon',
          header: 'Pemohon',
          render: (item) => (
            <>
              <div className="font-bold text-slate-800">{item.pemohonNama}</div>
              <div className="text-[11px] text-slate-400">
                {item.pemohonProdi ? `${item.pemohonProdi}` : item.pemohonId || '-'}
              </div>
            </>
          ),
        },
        {
          key: 'createdAt',
          header: 'Tanggal',
          cellClassName: 'text-slate-500 whitespace-nowrap',
          render: (item) =>
            new Date(item.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
        },
        {
          key: 'status',
          header: 'Status',
          headerClassName: 'text-center',
          cellClassName: 'text-center whitespace-nowrap',
          render: (item) => getStatusBadge(item.status),
        },
        {
          key: 'aksi',
          header: 'Aksi',
          headerClassName: 'text-right',
          cellClassName: 'text-right whitespace-nowrap',
          render: (item) => (
            <div className="inline-flex items-center gap-1.5">
              <Link
                to={`/admin/surat/${item.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                title="Detail & Disposisi"
              >
                <EyeIcon className="w-3.5 h-3.5 text-surat-green" />
                <span>Detail</span>
              </Link>
              <Link
                to={`/verifikasi/${item.qrCodeToken}`}
                target="_blank"
                className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 text-slate-500 hover:text-surat-green transition"
                title="TTE & Verifikasi QR"
              >
                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
              </Link>
              {canDeleteSurat && (
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-700 transition"
                  title="Hapus Surat"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ),
        },
      ]}
    />
  );
};
