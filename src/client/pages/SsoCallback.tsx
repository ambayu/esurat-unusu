import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ssoLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SsoLoadingScreen } from '../components/SsoLoadingScreen';
import { SsoProblemScreen } from '../components/SsoProblemScreen';

type SsoExchangeResult = Awaited<ReturnType<typeof ssoLogin>>;

/** Alamat bantuan yang ditampilkan pada layar kegagalan masuk. */
const ALAMAT_BANTUAN = import.meta.env.VITE_BANTUAN_EMAIL || 'esurat@unusu.ac.id';

type Masalah = {
  jenis: 'kosong' | 'token' | 'jaringan' | 'umum';
  judul: string;
  penjelasan: string;
  langkah: string[];
  catatan?: string;
};

/**
 * Pesan kegagalan yang dibaca pengguna.
 *
 * Server mengirim keterangan berbahasa mesin, misalnya "Client ID tidak cocok
 * dengan aplikasi ini" atau "Verifikasi token SSO gagal". Kalimat seperti itu
 * tidak memberi tahu pembaca apa yang harus dilakukan, dan justru membuatnya
 * mengira akunnya bermasalah. Fungsi ini menerjemahkannya menjadi penjelasan
 * yang menjawab tiga pertanyaan: apa yang terjadi, mengapa, dan apa langkah
 * berikutnya. Tidak ada nama parameter atau kode internal yang ikut tampil.
 */
export function terjemahkanGagalSso(err: any, payload: any): Masalah {
  const status = err?.response?.status;
  const pesanServer = String(payload?.message || '').toLowerCase();

  // Token sudah dipakai, kedaluwarsa, atau tidak sah.
  if (status === 401 || pesanServer.includes('token')) {
    return {
      jenis: 'token',
      judul: 'Waktu masuk Anda sudah berakhir',
      penjelasan:
        'Tautan masuk yang dipakai hanya berlaku sekali dan dalam waktu singkat. Tautan yang sudah terpakai, terbuka di dua tab, atau didiamkan terlalu lama tidak bisa dipakai lagi.',
      langkah: [
        'Tutup tab ini, lalu buka kembali halaman masuk E-Surat.',
        'Masuk ulang dari awal agar Anda menerima tautan yang baru.',
        'Hindari membuka tautan masuk di beberapa tab sekaligus.',
      ],
      catatan: 'Akun Anda tidak terkunci. Yang berakhir hanya tautan masuknya.',
    };
  }

  // Perangkat tidak berhasil menghubungi layanan (tidak ada balasan server).
  if (!err?.response) {
    return {
      jenis: 'jaringan',
      judul: 'Koneksi ke portal kampus terputus',
      penjelasan:
        'Perangkat Anda tidak berhasil menghubungi layanan masuk kampus. Ini biasanya terjadi karena jaringan yang tidak stabil atau halaman yang dibuka terlalu lama tanpa aktivitas.',
      langkah: [
        'Periksa apakah perangkat Anda masih terhubung ke internet.',
        'Muat ulang halaman ini, lalu coba masuk kembali.',
        'Bila memakai jaringan kampus, coba jaringan lain untuk memastikan.',
      ],
    };
  }

  return {
    jenis: 'umum',
    judul: 'Proses masuk belum berhasil diselesaikan',
    penjelasan:
      'Portal kampus tidak mengembalikan konfirmasi yang dibutuhkan aplikasi, sehingga sesi Anda belum dapat dibuka. Kejadian seperti ini umumnya bersifat sementara dan tidak berkaitan dengan isi akun Anda.',
    langkah: [
      'Tutup tab ini, lalu buka kembali halaman masuk E-Surat.',
      'Masuk ulang dengan akun ONE UNUSU Anda.',
      'Bila masih terhenti, hubungi administrator E-Surat dengan menyebutkan waktu kejadiannya.',
    ],
    catatan: 'Tidak ada data yang berubah selama proses ini.',
  };
}

/**
 * Token SSO hanya boleh ditukar satu kali. React menjalankan efek dua kali pada
 * mode pengembangan (StrictMode) dan halaman callback dapat dirender ulang,
 * sehingga penukaran dideduplikasi per token. Tanpa ini permintaan kedua
 * ditolak server karena token sudah terpakai.
 */
const exchangeRequests = new Map<string, Promise<SsoExchangeResult>>();

function exchangeSsoToken(clientId: string, token: string): Promise<SsoExchangeResult> {
  const key = `${clientId}:${token}`;
  const pending = exchangeRequests.get(key);

  if (pending) {
    return pending;
  }

  const request = ssoLogin(clientId, token);
  exchangeRequests.set(key, request);

  request.catch(() => {
    // Penukaran gagal (mis. jaringan terputus) boleh dicoba lagi; hasil sukses
    // tetap disimpan agar token tidak pernah dikirim ulang.
    exchangeRequests.delete(key);
  });

  return request;
}

/**
 * Callback SSO ONE UNUSU.
 * URL: /sso/callback?client_id=..&token=..
 * Token diverifikasi backend aplikasi ini (server-to-server).
 */
export function SsoCallbackPage() {
  const [params] = useSearchParams();
  const { saveSession } = useAuth();
  const [masalah, setMasalah] = useState<Masalah | null>(null);

  useEffect(() => {
    const clientId = params.get('client_id');
    const token = params.get('token');

    // Portal mengirim balik pengguna tanpa tiket bila permintaan izin tidak
    // selesai. Ini keadaan normal, bukan kerusakan, jadi penjelasannya dibuat
    // ringan dan tidak menuduh pengguna melakukan kesalahan.
    if (!clientId || !token) {
      setMasalah({
        jenis: 'kosong',
        judul: 'Permintaan masuk belum selesai',
        penjelasan:
          'Halaman ini terbuka tanpa menyelesaikan langkah persetujuan di portal kampus. Biasanya ini terjadi karena proses sebelumnya dibatalkan atau halaman dimuat ulang di tengah jalan.',
        langkah: [
          'Buka halaman masuk E-Surat dan tekan tombol masuk.',
          'Selesaikan seluruh langkah di portal kampus tanpa menutup tab.',
          'Anda akan kembali ke sini secara otomatis setelah persetujuan selesai.',
        ],
      });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await exchangeSsoToken(clientId, token);
        if (!response.data?.success) {
          throw new Error('Respons masuk tidak dapat dibaca');
        }

        saveSession(response.data.token, response.data.user);

        if (!cancelled) {
          // Arahkan langsung ke dashboard/agenda surat setelah login berhasil
          const targetUrl = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/dashboard`;
          window.location.replace(targetUrl);
        }
      } catch (err: any) {
        if (!cancelled) {
          setMasalah(terjemahkanGagalSso(err, err.response?.data));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, saveSession]);

  // Verifikasi tiket menunggu request jaringan nyata (server-to-server), jadi
  // layar tunggu penuh memang pantas ditampilkan. Gayanya disamakan dengan
  // layar tunggu di halaman login supaya seluruh rangkaian masuk terasa satu
  // alur, bukan beberapa halaman berbeda.
  if (!masalah) {
    return (
      <SsoLoadingScreen
        title="Memverifikasi tiket masuk"
        description="Aplikasi sedang memvalidasi token sekali pakai Anda. Jangan tutup halaman ini."
      />
    );
  }

  // Tombol coba lagi hanya ditampilkan bila mengulang memang masuk akal.
  // Untuk permintaan yang dibatalkan, pengguna cukup masuk ulang dari awal.
  const bolehUlangi =
    masalah.jenis === 'token' || masalah.jenis === 'jaringan' || masalah.jenis === 'umum';

  return (
    <SsoProblemScreen
      judul={masalah.judul}
      penjelasan={masalah.penjelasan}
      langkah={masalah.langkah}
      catatan={masalah.catatan}
      alamatBantuan={ALAMAT_BANTUAN}
      onCobaLagi={bolehUlangi ? () => window.location.reload() : undefined}
    />
  );
}
