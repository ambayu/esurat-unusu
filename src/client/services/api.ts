import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// SESI SSO ONE UNUSU
// ==========================================
export interface SessionUser {
  id: number;
  username: string;
  nama: string;
  email: string | null;
  role: string;
  ssoRole: string;
  nim?: string | null;
  nidn?: string | null;
  prodi?: string | null;
  fakultas?: string | null;
}

const TOKEN_KEY = 'esurat_unusu_token';
const USER_KEY = 'esurat_unusu_user';

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const path = window.location.pathname;
    if (status === 401 && path !== import.meta.env.BASE_URL + 'login' && path !== import.meta.env.BASE_URL + 'sso/callback') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.replace(import.meta.env.BASE_URL + 'login');
    }
    return Promise.reject(error);
  }
);

export const ssoLogin = (client_id: string, token: string) =>
  api.post<{ success: boolean; token: string; user: SessionUser; message?: string }>('/auth/sso', { client_id, token });

export interface JenisSuratItem {
  id: number;
  kode: string;
  nama: string;
  formatNo: string;
  peruntukan: string;
}

export interface UnitKerjaItem {
  id: number;
  kode: string;
  nama: string;
  pimpinan?: string;
  jabatan?: string;
}

export interface DisposisiItem {
  id: number;
  suratId: number;
  dariUnit: string;
  keUnitId: number;
  keUnit?: UnitKerjaItem;
  instruksi: string;
  catatan?: string;
  status: string;
  deadline?: string;
  createdAt: string;
}

export interface SuratItem {
  id: number;
  nomorAgenda: string;
  nomorSurat?: string;
  tipeSurat: string;
  jenisId: number;
  jenisSurat?: JenisSuratItem;
  pemohonNama: string;
  pemohonId?: string;
  pemohonProdi?: string;
  perihal: string;
  keperluan?: string;
  status: 'diajukan' | 'diproses' | 'disetujui' | 'ditolak' | 'selesai';
  qrCodeToken: string;
  signedBy?: string;
  signedAt?: string;
  disposisiList?: DisposisiItem[];
  createdAt: string;
}

export const fetchJenisSurat = () => api.get<{ success: boolean; data: JenisSuratItem[] }>('/jenis-surat');
export const fetchSuratList = (params?: { pemohonId?: string; status?: string; tipe?: string }) => 
  api.get<{ success: boolean; data: SuratItem[] }>('/surat', { params });
export const fetchSuratDetail = (id: number) => api.get<{ success: boolean; data: SuratItem }>(`/surat/${id}`);
export const createSurat = (data: any) => api.post<{ success: boolean; data: SuratItem }>('/surat', data);
export const updateStatusSurat = (id: number, data: { status: string; nomorSurat?: string; signedBy?: string }) => 
  api.put(`/surat/${id}/status`, data);
export const createDisposisi = (id: number, data: any) => api.post(`/surat/${id}/disposisi`, data);
export const verifySuratQr = (token: string) => api.get<{ success: boolean; data: SuratItem; isValid: boolean }>(`/verifikasi/${token}`);
export const fetchUnitKerja = () => api.get<{ success: boolean; data: UnitKerjaItem[] }>('/unit-kerja');

export default api;
