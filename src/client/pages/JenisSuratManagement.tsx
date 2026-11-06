import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchJenisSurat, deleteJenisSurat, JenisSuratItem } from '../services/api';
import { ListPageTemplate, ListActionButton } from '../components/ListPageTemplate';
import { useAuth } from '../context/AuthContext';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  PlusIcon,
  RectangleStackIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export const JenisSuratManagement: React.FC = () => {
  const { user } = useAuth();
  const [list, setList] = useState<JenisSuratItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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
    <>
      <ListPageTemplate<JenisSuratItem>
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-surat-green-100 text-surat-green-dark uppercase tracking-wider">
            Tata Naskah Master
          </span>
        }
        title="Jenis Surat & Template Format"
        description="Kelola katalog jenis naskah dinas, klasifikasi peruntukan civitas akademika, dan pola penomoran surat resmi UNUSU."
        actions={
          <>
            <ListActionButton
              variant="secondary"
              onClick={loadData}
              disabled={loading}
              icon={<ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Segarkan
            </ListActionButton>
            <ListActionButton icon={<PlusIcon className="w-4 h-4" />} to="/admin/jenis-surat/tambah">
              Tambah Jenis Surat
            </ListActionButton>
          </>
        }
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari berdasarkan kode, nama surat, atau peruntukan..."
        tableTitle="Daftar Katalog Template Surat"
        tableSubtitle={`Menampilkan ${filtered.length} format template naskah dinas terdaftar.`}
        tableBadge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surat-green-50 text-surat-green-dark border border-surat-green-100">
            {filtered.length} Template
          </span>
        }
        loading={loading}
        error={error}
        onRetry={loadData}
        hasActiveFilter={search.trim().length > 0}
        emptyMessage="Belum ada jenis surat terdaftar."
        noResultMessage="Tidak ada jenis surat yang cocok dengan kriteria pencarian."
        rowKey={(item) => item.id}
        rows={filtered}
        columns={[
          {
            key: 'kode',
            header: 'Kode Naskah',
            render: (item) => (
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono font-bold text-slate-900">
                {item.kode}
              </span>
            ),
          },
          {
            key: 'nama',
            header: 'Nama Jenis Surat',
            render: (item) => <span className="font-bold text-slate-900">{item.nama}</span>,
          },
          {
            key: 'formatNo',
            header: 'Pola Format Penomoran',
            render: (item) => (
              <span className="font-mono text-[11px] text-surat-green-dark">{item.formatNo}</span>
            ),
          },
          {
            key: 'peruntukan',
            header: 'Peruntukan',
            render: (item) => (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {item.peruntukan}
              </span>
            ),
          },
          {
            key: 'penggunaan',
            header: 'Penggunaan',
            headerClassName: 'text-center',
            cellClassName: 'text-center',
            render: (item) => (
              <>
                <span className="font-bold text-slate-700 font-mono">{item._count?.suratList ?? 0}</span>
                <span className="text-[10px] text-slate-400 block">surat</span>
              </>
            ),
          },
          {
            key: 'aksi',
            header: 'Aksi',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (item) => {
              const dipakai = (item._count?.suratList ?? 0) > 0;
              return (
                <div className="inline-flex items-center space-x-1.5">
                  <Link
                    to={`/admin/jenis-surat/edit/${item.id}`}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-surat-green transition"
                    title="Edit Template"
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={dipakai}
                    className={`p-1.5 rounded-lg transition ${
                      dipakai
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                    title={dipakai ? 'Tidak dapat dihapus karena sedang digunakan' : 'Hapus Template'}
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            },
          },
        ]}
      />
    </>
  );
};

