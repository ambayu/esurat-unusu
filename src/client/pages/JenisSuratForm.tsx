import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { FormPageTemplate } from '../components/FormPageTemplate';
import {
  QuestionMarkCircleIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import {
  fetchJenisSurat,
  createJenisSurat,
  updateJenisSurat,
  JenisSuratItem,
} from '../services/api';

/**
 * JenisSuratFormPage : Halaman penuh tambah / edit jenis surat & pola penomoran.
 *
 * Menggantikan modal dialog pada `JenisSuratManagement.tsx`.
 * Rute:
 *   - `/admin/jenis-surat/tambah`
 *   - `/admin/jenis-surat/edit/:id`
 *
 * Sesuai panduan arsitektur:
 *   - Menggunakan FormPageTemplate esurat
 *   - Tombol kembali teks "Kembali" tanpa ikon
 *   - Setelah simpan berhasil, pengguna TETAP di form
 */
export const JenisSuratFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);

  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formFormatNo, setFormFormatNo] = useState('{NOMOR}/UNUSU/BAAK/KM/{BULAN}/{TAHUN}');
  const [formPeruntukan, setFormPeruntukan] = useState('Mahasiswa');

  useEffect(() => {
    if (!id) return;
    let aktif = true;
    setLoading(true);
    fetchJenisSurat()
      .then((res) => {
        if (!aktif) return;
        const items: JenisSuratItem[] = res.data?.data || [];
        const item = items.find((j) => String(j.id) === String(id));
        if (!item) {
          setError('Jenis surat tidak ditemukan. Mungkin sudah dihapus.');
          return;
        }
        setFormKode(item.kode);
        setFormNama(item.nama);
        setFormFormatNo(item.formatNo);
        setFormPeruntukan(item.peruntukan || 'Mahasiswa');
      })
      .catch((err: any) => {
        if (aktif) {
          setError(
            err.response?.data?.message || 'Gagal memuat detail jenis surat dari server.'
          );
        }
      })
      .finally(() => {
        if (aktif) setLoading(false);
      });

    return () => {
      aktif = false;
    };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSukses(null);

    if (!formKode.trim() || !formNama.trim() || !formFormatNo.trim()) {
      setError('Kode naskah, nama jenis surat, dan format nomor wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      if (isEdit && id) {
        await updateJenisSurat(Number(id), {
          kode: formKode.toUpperCase().trim(),
          nama: formNama.trim(),
          formatNo: formFormatNo.trim(),
          peruntukan: formPeruntukan,
        });
        setSukses(`Jenis surat "${formNama.trim()}" berhasil diperbarui.`);
      } else {
        await createJenisSurat({
          kode: formKode.toUpperCase().trim(),
          nama: formNama.trim(),
          formatNo: formFormatNo.trim(),
          peruntukan: formPeruntukan,
        });
        setSukses(`Jenis surat "${formNama.trim()}" berhasil ditambahkan.`);
        setFormKode('');
        setFormNama('');
        setFormFormatNo('{NOMOR}/UNUSU/BAAK/KM/{BULAN}/{TAHUN}');
        setFormPeruntukan('Mahasiswa');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan jenis surat.');
    } finally {
      setSubmitting(false);
    }
  };

  const title = isEdit ? 'Edit Jenis Surat & Template' : 'Tambah Jenis Surat Baru';
  const description =
    'Konfigurasi kode naskah dinas, nama resmi, dan pola penomoran otomatis untuk tata persuratan digital.';

  const badge = (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-surat-green-50 border border-surat-green-100 text-[10px] font-bold uppercase tracking-wider text-surat-green-dark">
      <TagIcon className="w-3.5 h-3.5" aria-hidden="true" />
      Klasifikasi Surat
    </span>
  );

  return (
    <FormPageTemplate
      title={title}
      description={description}
      badge={badge}
      backTo="/admin/jenis-surat"
      backLabel="Kembali"
      isEdit={isEdit}
      submitLabel={isEdit ? 'Simpan Perubahan' : 'Tambah Template'}
      submitting={submitting}
      error={error}
      onSubmit={handleSubmit}
      accentClassName="bg-surat-green hover:bg-surat-green-dark"
    >
      {sukses && (
        <div
          role="status"
          className="p-4 rounded-[12px] bg-surat-green-50 border border-surat-green-100 text-surat-green-dark text-xs font-semibold"
        >
          {sukses}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500 font-medium">
          Memuat detail jenis surat...
        </div>
      ) : (
        <div className="space-y-4">
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
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] font-mono uppercase bg-white focus:outline-surat-green min-h-[44px]"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Kode singkat unik untuk identifikasi jenis surat
            </p>
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
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white focus:outline-surat-green min-h-[44px]"
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
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] font-mono bg-white focus:outline-surat-green min-h-[44px]"
            />
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
              <QuestionMarkCircleIcon className="w-3 h-3 text-slate-400" />
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
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white focus:outline-surat-green min-h-[44px]"
            >
              <option value="Mahasiswa">Mahasiswa</option>
              <option value="Dosen">Dosen &amp; Pengajar</option>
              <option value="Tendik">Tenaga Kependidikan</option>
              <option value="Umum">Umum / Eksternal</option>
            </select>
          </div>
        </div>
      )}
    </FormPageTemplate>
  );
};

export default JenisSuratFormPage;
