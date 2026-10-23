import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSuratList, SuratItem } from '../services/api';
import { Mail, Clock, CheckCircle2, AlertCircle, FileText, ArrowRight, Plus, Search, Filter } from 'lucide-react';

export const SuratList: React.FC = () => {
  const [suratList, setSuratList] = useState<SuratItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSuratList()
      .then((res) => setSuratList(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = suratList.filter((s) => {
    const matchSearch = s.perihal.toLowerCase().includes(search.toLowerCase()) ||
      s.pemohonNama.toLowerCase().includes(search.toLowerCase()) ||
      s.nomorAgenda.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
        <Link
          to="/ajukan"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Buat Pengajuan Surat Baru</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
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
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-emerald-600"
          >
            <option value="all">Semua Status</option>
            <option value="diajukan">Diajukan</option>
            <option value="diproses">Diproses</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Surat Items List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">Memuat data persuratan...</div>
      ) : (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              Tidak ada data persuratan yang cocok.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.nomorAgenda}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
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

                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    to={`/surat/${item.id}`}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition"
                  >
                    <span>Detail & Disposisi</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
