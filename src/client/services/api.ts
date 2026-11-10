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
  foto?: string | null;
  permissions?: string[];
}

const TOKEN_KEY = 'esurat_unusu_token';
const USER_KEY = 'esurat_unusu_user';

/**
 * Menghasilkan URL absolut/relatif aman untuk file foto profil atau lampiran berkas
 */
export const getAssetUrl = (rawPath?: string | null): string => {
  if (!rawPath) return '';
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://') || rawPath.startsWith('data:')) {
    return rawPath;
  }
  const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const baseUrl = import.meta.env.BASE_URL || '/';

  // Jika URL sudah mengandung baseUrl yang bukan '/', jangan duplikasi prefix
  if (baseUrl !== '/' && cleanPath.startsWith(baseUrl)) {
    return cleanPath;
  }

  return baseUrl.endsWith('/') && cleanPath.startsWith('/')
    ? `${baseUrl.slice(0, -1)}${cleanPath}`
    : `${baseUrl}${cleanPath}`;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Rute publik yang boleh dibuka tanpa sesi. Respons 401 TIDAK boleh melempar
 * pengguna ke /login dari halaman-halaman ini.
 *
 * Cara lama membandingkan `window.location.pathname` dengan `BASE_URL + 'login'`.
 * Perbandingan itu rapuh: bila BASE_URL bukan '/' atau pathname berakhir garis
 * miring, hasilnya tidak cocok sehingga halaman publik seperti '/' ikut
 * terlempar ke /login. Sekarang pathname dinormalisasi lalu dicocokkan ke
 * daftar rute publik yang eksplisit.
 */
const PUBLIC_PATHS = ['/', '/login', '/sso/callback', '/akses-ditolak'];

const isPublicPath = (pathname: string) => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  let path = pathname;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  path = path.replace(/\/+$/, '').replace(/\/index\.html$/, '');
  return PUBLIC_PATHS.includes(path || '/');
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const path = window.location.pathname;
    if (status === 401 && !isPublicPath(path)) {
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
  _count?: {
    suratList: number;
  };
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
  lampiranUrl?: string | null;
  disposisiList?: DisposisiItem[];
  createdAt: string;
}

export interface AdminStatsData {
  surat: {
    total: number;
    masuk: number;
    keluar: number;
    pending: number;
    diproses: number;
    disetujui: number;
    selesai: number;
    ditolak: number;
  };
  disposisi: {
    total: number;
    menunggu: number;
    diproses: number;
    selesai: number;
  };
  recentSurat: SuratItem[];
  recentDisposisi: DisposisiItem[];
}

export const fetchAdminStats = () => api.get<{ success: boolean; data: AdminStatsData }>('/admin/stats');
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const fetchJenisSurat = () => api.get<{ success: boolean; data: JenisSuratItem[] }>('/jenis-surat');
export const fetchSuratList = (params?: { pemohonId?: string; status?: string; tipe?: string; search?: string; page?: number; limit?: number }) => 
  api.get<{ success: boolean; data: SuratItem[]; pagination?: PaginationInfo }>('/surat', { params });
export const fetchSuratDetail = (id: number) => api.get<{ success: boolean; data: SuratItem }>(`/surat/${id}`);
export const createSurat = (data: any) => api.post<{ success: boolean; data: SuratItem }>('/surat', data);
export const updateStatusSurat = (id: number, data: { status: string; nomorSurat?: string; signedBy?: string; catatanPenolakan?: string }) =>
  api.put(`/surat/${id}/status`, data);
export const fetchRekomendasiNomorSurat = (id: number) =>
  api.get<{ success: boolean; data: { nomorSurat: string; formatTemplate: string } }>(`/surat/${id}/nomor-rekomendasi`);
export const createDisposisi = (id: number, data: any) => api.post(`/surat/${id}/disposisi`, data);
export const verifySuratQr = (token: string) => api.get<{ success: boolean; data: SuratItem; isValid: boolean }>(`/verifikasi/${token}`);
export const fetchUnitKerja = () => api.get<{ success: boolean; data: UnitKerjaItem[] }>('/unit-kerja');

// Master Jenis Surat CRUD API (Admin)
export const createJenisSurat = (data: { kode: string; nama: string; formatNo: string; peruntukan: string }) =>
  api.post<{ success: boolean; data: JenisSuratItem; message: string }>('/jenis-surat', data);

export const updateJenisSurat = (id: number, data: Partial<{ kode: string; nama: string; formatNo: string; peruntukan: string }>) =>
  api.put<{ success: boolean; data: JenisSuratItem; message: string }>(`/jenis-surat/${id}`, data);

export const deleteJenisSurat = (id: number) =>
  api.delete<{ success: boolean; message: string }>(`/jenis-surat/${id}`);

// ==========================================
// RBAC CRUD API: Pengguna, Peran, & Izin
// ==========================================
export interface PermissionItem {
  id: number;
  key: string;
  resource: string;
  action: string;
  label: string;
  description?: string | null;
}

export interface RoleItem {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  userCount: number;
  permissionKeys: string[];
}

export interface UserItem {
  id: number;
  username: string;
  nama: string;
  email?: string | null;
  nim?: string | null;
  nidn?: string | null;
  prodi?: string | null;
  fakultas?: string | null;
  isActive: boolean;
  roles: { id: number; code: string; name: string }[];
}

export const fetchAdminPermissions = () =>
  api.get<{ success: boolean; data: PermissionItem[] }>('/admin/permissions');

export const fetchAdminRoles = () =>
  api.get<{ success: boolean; data: RoleItem[] }>('/admin/roles');

export const createAdminRole = (data: { code: string; name: string; description?: string }) =>
  api.post<{ success: boolean; data: any; message: string }>('/admin/roles', data);

export const updateAdminRole = (id: number, data: { name?: string; description?: string }) =>
  api.put<{ success: boolean; data: any; message: string }>(`/admin/roles/${id}`, data);

export const updateAdminRolePermissions = (id: number, permissionKeys: string[]) =>
  api.put<{ success: boolean; message: string; data: { roleId: number; totalPermissions: number } }>(
    `/admin/roles/${id}/permissions`,
    { permissionKeys }
  );

export const deleteAdminRole = (id: number) =>
  api.delete<{ success: boolean; message: string }>(`/admin/roles/${id}`);

export const fetchAdminUsers = () =>
  api.get<{ success: boolean; data: UserItem[] }>('/admin/users');

export const createAdminUser = (data: any) =>
  api.post<{ success: boolean; data: any; message: string }>('/admin/users', data);

export const updateAdminUser = (id: number, data: any) =>
  api.put<{ success: boolean; data: any; message: string }>(`/admin/users/${id}`, data);

export const deleteAdminUser = (id: number) =>
  api.delete<{ success: boolean; message: string }>(`/admin/users/${id}`);

export const deleteSurat = (id: number) =>
  api.delete<{ success: boolean; message: string }>(`/surat/${id}`);

// ==========================================
// BANNER SLIDER HERO (`/api/sliders`, `/api/admin/sliders`)
// ==========================================
export interface EsuratBannerSliderItem {
  id: number;
  judul: string;
  subjudul?: string | null;
  gambarUrl: string;
  gambarMobileUrl?: string | null;
  linkUrl?: string | null;
  urutan: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const fetchPublicSliders = () =>
  api.get<{ success: boolean; data: EsuratBannerSliderItem[] }>('/sliders');

export const fetchAdminSliders = () =>
  api.get<{ success: boolean; data: EsuratBannerSliderItem[] }>('/admin/sliders');

export const createAdminSlider = (data: Partial<EsuratBannerSliderItem>) =>
  api.post<{ success: boolean; message: string; data: EsuratBannerSliderItem }>('/admin/sliders', data);

export const updateAdminSlider = (id: number, data: Partial<EsuratBannerSliderItem>) =>
  api.put<{ success: boolean; message: string; data: EsuratBannerSliderItem }>(`/admin/sliders/${id}`, data);

export const deleteAdminSlider = (id: number) =>
  api.delete<{ success: boolean; message: string }>(`/admin/sliders/${id}`);

export default api;
