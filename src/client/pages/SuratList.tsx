import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchSuratList, deleteSurat, SuratItem, PaginationInfo } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  Send,
  Eye,
  Trash2,
  ExternalLink
} from 'lucide-react';

export const SuratList: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTipe = searchParams.get('tipe') || 'all';

  const [suratList, setSuratList] = useState<SuratItem[]>([]);
  const [loading, setLoading] = useState(true);
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

      {/* Data Table View */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Memuat data persuratan...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#CBD5E1] bg-slate-50 text-slate-700 font-bold">
                  <th className="py-3.5 px-4">Agenda / Nomor Surat</th>
                  <th className="py-3.5 px-4">Tipe & Jenis</th>
                  <th className="py-3.5 px-4">Perihal / Keperluan</th>
                  <th className="py-3.5 px-4">Pemohon</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suratList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Tidak ada data persuratan yang cocok dengan filter atau kata kunci.
                    </td>
                  </tr>
                ) : (
                  suratList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800 text-xs">
                          {item.nomorAgenda}
                        </div>
                        {item.nomorSurat ? (
                          <div className="text-[11px] font-mono text-emerald-700 mt-0.5">
                            {item.nomorSurat}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic">Belum bernomor resmi</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1 ${
                          item.tipeSurat === 'masuk' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {item.tipeSurat === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}
                        </span>
                        <div className="text-slate-600 font-medium truncate max-w-[140px]" title={item.jenisSurat?.nama}>
                          {item.jenisSurat?.nama || 'Surat'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1" title={item.perihal}>
                          {item.perihal}
                        </div>
                        {item.keperluan && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={item.keperluan}>
                            {item.keperluan}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{item.pemohonNama}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.pemohonProdi ? `${item.pemohonProdi}` : item.pemohonId || '-'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/admin/surat/${item.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                            title="Detail & Disposisi"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Detail</span>
                          </Link>
                          <Link
                            to={`/verifikasi/${item.qrCodeToken}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 text-slate-500 hover:text-emerald-700 transition"
                            title="TTE & Verifikasi QR"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          {canDeleteSurat && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-700 transition"
                              title="Hapus Surat"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200 text-xs text-slate-600 bg-slate-50/50">
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
