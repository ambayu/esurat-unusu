import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchSuratList, SuratItem, PaginationInfo } from '../services/api';
import { 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowRight, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Inbox,
  Send
} from 'lucide-react';

export const SuratList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTipe = searchParams.get('tipe') || 'all';

  const [suratList, setSuratList] = useState<SuratItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tipeFilter, setTipeFilter] = useState(queryTipe);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

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
      .catch((err) => console.error('Gagal mengambil data surat:', err))
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Agenda Persuratan Digital</h1>
          <p className="text-xs text-slate-500 mt-1">Lacak status permohonan surat keterangan, izin riset, surat tugas, dan disposisi pimpinan.</p>
        </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/surat-form?tipe=masuk"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs shadow-2xs transition min-h-[44px]"
            >
              <Inbox className="w-4 h-4 mr-1.5" />
              <span>Input Surat Masuk</span>
            </Link>
            <Link
              to="/admin/surat-form?tipe=keluar"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition min-h-[44px]"
            >
              <Send className="w-4 h-4 mr-1.5" />
              <span>Input Surat Keluar</span>
            </Link>
          </div>
      </div>

      {/* Tabs Filter Tipe Surat */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => handleTipeChange('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition min-h-[44px] flex items-center gap-2 cursor-pointer ${
            tipeFilter === 'all'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Semua Agenda ({suratList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTipeChange('masuk')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition min-h-[44px] flex items-center gap-2 cursor-pointer ${
            tipeFilter === 'masuk'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Surat Masuk</span>
        </button>

        <button
          type="button"
          onClick={() => handleTipeChange('keluar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition min-h-[44px] flex items-center gap-2 cursor-pointer ${
            tipeFilter === 'keluar'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Surat Keluar</span>
        </button>
      </div>

      {/* Filters & Search */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari perihal, nomor agenda, atau nama pemohon..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-emerald-600"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Tipe Surat: Masuk, Keluar, Semua */}
          <select
            value={tipeFilter}
            onChange={(e) => handleTipeChange(e.target.value)}
            aria-label="Filter tipe surat"
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-emerald-600 font-semibold text-slate-700 min-h-[44px]"
          >
            <option value="all">Semua Tipe (Masuk & Keluar)</option>
            <option value="masuk">Surat Masuk Saja</option>
            <option value="keluar">Surat Keluar Saja</option>
          </select>

          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-emerald-600"
          >
            <option value="all">Semua Status</option>
            <option value="diajukan">Diajukan</option>
            <option value="diproses">Diproses</option>
            <option value="disetujui">Disetujui</option>
            <option value="selesai">Selesai</option>
            <option value="ditolak">Ditolak</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cari
          </button>
        </div>
      </form>

      {/* Surat Items List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Memuat data persuratan...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {suratList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              Tidak ada data persuratan yang cocok.
            </div>
          ) : (
            suratList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.nomorAgenda}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      item.tipeSurat === 'masuk' ? 'bg-blue-50 text-blue-800' : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {item.tipeSurat === 'masuk' ? 'Masuk' : 'Keluar'}
                    </span>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {item.jenisSurat?.nama || 'Surat'}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.perihal}
                  </h3>

                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Pemohon: <strong className="text-slate-700">{item.pemohonNama}</strong> ({item.pemohonId || '-'})</span>
                    <span>Prodi: <strong className="text-slate-700">{item.pemohonProdi || '-'}</strong></span>
                    <span>Tanggal: {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  {item.nomorSurat && (
                    <div className="text-xs font-semibold text-emerald-700">
                      Nomor Surat Resmi: <span className="font-mono">{item.nomorSurat}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/admin/surat/${item.id}`}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition"
                  >
                    <span>Detail & Disposisi</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                  <Link
                    to={`/verifikasi/${item.qrCodeToken}`}
                    className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                    title="Periksa TTE & QR Code"
                  >
                    <FileText className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 pb-2 text-xs text-slate-600">
              <div>
                Menampilkan halaman <strong className="font-bold text-slate-900">{pagination.page}</strong> dari{' '}
                <strong className="font-bold text-slate-900">{pagination.totalPages}</strong> (Total {pagination.total} surat)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
                <button
                  type="button"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
