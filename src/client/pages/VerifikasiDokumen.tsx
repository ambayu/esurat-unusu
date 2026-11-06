import React, { useState } from 'react';
import { verifySuratQr, SuratItem } from '../services/api';
import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';


export const VerifikasiDokumen: React.FC = () => {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<SuratItem | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await verifySuratQr(token.trim());
      setResult(res.data.data);
    } catch (err) {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-surat-green-50 text-surat-green flex items-center justify-center mx-auto shadow-inner">
          <QrCodeIcon className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Verifikasi Dokumen Resmi UNUSU</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Masukkan kode QR Token yang tertera di surat resmi universitas untuk memvalidasi keaslian tanda tangan digital dan keabsahan naskah.
        </p>
      </div>

      {/* Form Input Token */}
      <form onSubmit={handleVerify} className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Kode / Token Verifikasi QR</label>
          <div className="relative">
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Contoh: UNUSU-VERIF-SKA-2026-FADHIL-884920"
              className="w-full text-xs p-3.5 pr-10 rounded-xl border border-slate-200 focus:outline-surat-green font-mono"
            />
            <MagnifyingGlassIcon className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-surat-green hover:bg-surat-green-dark text-white font-bold text-xs shadow-md transition"
        >
          {loading ? 'Memvalidasi...' : 'Periksa Keabsahan Naskah'}
        </button>
      </form>

      {/* Verification Result */}
      {searched && (
        <div>
          {result ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surat-green-light shadow-md space-y-4">
              <div className="flex items-center space-x-3 text-surat-green-dark bg-surat-green-50 p-4 rounded-2xl">
                <CheckCircleIcon className="w-8 h-8 text-surat-green shrink-0" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">DOKUMEN DINAS ASLI & TERVERIFIKASI</h3>
                  <p className="text-xs text-surat-green">Naskah resmi terdaftar dalam Sistem Informasi E-Surat Universitas Nahdlatul Ulama Sumatera Utara.</p>
                </div>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-400">Nomor Surat:</span>
                  <span className="font-mono font-bold text-slate-900">{result.nomorSurat || 'Dalam Proses Penerbitan'}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-400">Jenis Dokumen:</span>
                  <span className="font-bold text-slate-900">{result.jenisSurat?.nama}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-400">Nama Penerima/Pemohon:</span>
                  <span className="font-bold text-slate-900">{result.pemohonNama} ({result.pemohonId || '-'})</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-400">Perihal:</span>
                  <span className="font-medium text-slate-900 max-w-xs text-right">{result.perihal}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-400">Pejabat Penandatangan:</span>
                  <span className="font-bold text-surat-green">{result.signedBy || '-'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm text-center space-y-2">
              <XCircleIcon className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="font-bold text-sm text-slate-900">Dokumen Tidak Ditemukan</h3>
              <p className="text-xs text-slate-500">
                Token yang Anda masukkan tidak terdaftar dalam pangkalan data arsip digital UNUSU. Pastikan kode diketik dengan benar.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
