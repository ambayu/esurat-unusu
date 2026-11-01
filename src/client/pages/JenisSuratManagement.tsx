import React, { useEffect, useState } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  RotateCw, 
  AlertCircle, 
  CheckCircle2, 
  Tag, 
  FileText,
  X,
  Layers,
  HelpCircle
} from 'lucide-react';
import { fetchJenisSurat, createJenisSurat, updateJenisSurat, deleteJenisSurat, JenisSuratItem } from '../services/api';
import { CardContainer } from '../components/CardContainer';
import { AdminPanelTemplate } from '../components/AdminPanelTemplate';
import { useAuth } from '../context/AuthContext';

export const JenisSuratManagement: React.FC = () => {
  const { user } = useAuth();
  const [list, setList] = useState<JenisSuratItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formFormatNo, setFormFormatNo] = useState('');
  const [formPeruntukan, setFormPeruntukan] = useState('Mahasiswa');

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchJenisSurat()
      .then((res) => {
        if (res.data.success) {
          setList(res.data.data);
        } else {
          setError('Gagal memuat jenis surat.');
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Terjadi kesalahan jaringan.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormKode('');
    setFormNama('');
    setFormFormatNo('{NOMOR}/UNUSU/BAAK/KM/{BULAN}/{TAHUN}');
    setFormPeruntukan('Mahasiswa');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: JenisSuratItem) => {
    setIsEditing(true);
    setEditId(item.id);
    setFormKode(item.kode);
    setFormNama(item.nama);
    setFormFormatNo(item.formatNo);
    setFormPeruntukan(item.peruntukan || 'Mahasiswa');
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!submitting) {
      setIsModalOpen(false);
      setModalError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKode.trim() || !formNama.trim() || !formFormatNo.trim()) {
      setModalError('Seluruh field bertanda bintang wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);

      if (isEditing && editId) {
        await updateJenisSurat(editId, {
          kode: formKode.toUpperCase().trim(),
          nama: formNama.trim(),
          formatNo: formFormatNo.trim(),
          peruntukan: formPeruntukan,
        });
      } else {
        await createJenisSurat({
          kode: formKode.toUpperCase().trim(),
          nama: formNama.trim(),
          formatNo: formFormatNo.trim(),
          peruntukan: formPeruntukan,
        });
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Gagal menyimpan jenis surat');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: JenisSuratItem) => {
    if ((item._count?.suratList ?? 0) > 0) {
      alert(`Jenis surat ${item.nama} tidak dapat dihapus karena telah digunakan pada ${item._count?.suratList} arsip surat.`);
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus jenis surat "${item.nama}" (${item.kode})?`)) {
      return;
    }

    try {
      await deleteJenisSurat(item.id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus jenis surat.');
    }
  };

  const filtered = list.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase()) ||
    item.kode.toLowerCase().includes(search.toLowerCase()) ||
    item.peruntukan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Container Card Standar LPPM */}
      <AdminPanelTemplate
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            Tata Naskah Master
          </span>
        }
        title="Jenis Surat & Template Format"
        description="Kelola katalog jenis naskah dinas, klasifikasi peruntukan civitas akademika, dan pola penomoran surat resmi UNUSU."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center px-3.5 py-2.5 rounded-[12px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition min-h-[44px]"
              title="Segarkan data"
            >
              <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center px-4 py-2.5 rounded-[12px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition min-h-[44px]"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Tambah Jenis Surat</span>
            </button>
          </div>
        }
      >
        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-[14px] p-4 text-center">
            <p className="text-xs text-rose-700 font-bold">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-2 text-xs text-rose-800 underline font-bold"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-white border border-[#CBD5E1] rounded-[14px] p-4 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan kode, nama surat, atau peruntukan..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white focus:outline-emerald-600 focus:border-emerald-600 text-slate-800 min-h-[44px]"
            />
          </div>
        </div>

        {/* Main Table Container */}
        <CardContainer
          title="Daftar Katalog Template Surat"
          subtitle={`Menampilkan ${filtered.length} format template naskah dinas terdaftar.`}
          badge={
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {filtered.length} Template
            </span>
          }
        >
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              Memuat daftar master jenis surat...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Tidak ada jenis surat yang cocok dengan kriteria pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-[#CBD5E1] bg-slate-50/70 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Kode Naskah</th>
                    <th className="py-3 px-4">Nama Jenis Surat</th>
                    <th className="py-3 px-4">Pola Format Penomoran</th>
                    <th className="py-3 px-4">Peruntukan</th>
                    <th className="py-3 px-4 text-center">Penggunaan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1]/60">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {item.kode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.nama}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-800">
                        {item.formatNo}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {item.peruntukan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-700 font-mono">
                          {item._count?.suratList ?? 0}
                        </span>
                        <span className="text-[10px] text-slate-400 block">surat</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition"
                            title="Edit Template"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={(item._count?.suratList ?? 0) > 0}
                            className={`p-1.5 rounded-lg transition ${
                              (item._count?.suratList ?? 0) > 0
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                            title={(item._count?.suratList ?? 0) > 0 ? 'Tidak dapat dihapus karena sedang digunakan' : 'Hapus Template'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContainer>
      </AdminPanelTemplate>

      {/* Modal Dialog Tambah / Edit Jenis Surat */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-[16px] border border-[#CBD5E1] shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#CBD5E1] flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {isEditing ? 'Edit Jenis Surat & Template' : 'Tambah Jenis Surat Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode Naskah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: SKA, ST, SK, REK"
                  value={formKode}
                  onChange={(e) => setFormKode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] font-mono uppercase bg-white focus:outline-emerald-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">Kode singkat unik untuk identifikasi jenis surat</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Jenis Surat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Surat Keterangan Aktif Kuliah"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pola Format Nomor Surat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="{NOMOR}/UNUSU/BAAK/KM/{BULAN}/{TAHUN}"
                  value={formFormatNo}
                  onChange={(e) => setFormFormatNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] font-mono bg-white focus:outline-emerald-600"
                />
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                  <span>Placeholder: {'{NOMOR}'}, {'{BULAN}'}, {'{TAHUN}'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peruntukan Sasaran
                </label>
                <select
                  value={formPeruntukan}
                  onChange={(e) => setFormPeruntukan(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white focus:outline-emerald-600"
                >
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Dosen">Dosen & Pengajar</option>
                  <option value="Tendik">Tenaga Kependidikan</option>
                  <option value="Umum">Umum / Eksternal</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#CBD5E1] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
                >
                  {submitting && <RotateCw className="w-3 h-3 animate-spin" />}
                  <span>{isEditing ? 'Simpan Perubahan' : 'Tambah Template'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
