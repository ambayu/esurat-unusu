/**
 * Katalog Permission Granular E-Surat UNUSU
 * Format baku: resource:action
 * Action: menu, view, create, edit, delete
 */

export const PERMISSIONS = {
  // Dashboard
  dashboardMenu: "dashboard:menu",
  dashboardView: "dashboard:view",

  // Surat Masuk
  suratMasukMenu: "surat-masuk:menu",
  suratMasukView: "surat-masuk:view",
  suratMasukCreate: "surat-masuk:create",
  suratMasukEdit: "surat-masuk:edit",
  suratMasukDelete: "surat-masuk:delete",

  // Surat Keluar
  suratKeluarMenu: "surat-keluar:menu",
  suratKeluarView: "surat-keluar:view",
  suratKeluarCreate: "surat-keluar:create",
  suratKeluarEdit: "surat-keluar:edit",
  suratKeluarDelete: "surat-keluar:delete",

  // Disposisi
  disposisiMenu: "disposisi:menu",
  disposisiView: "disposisi:view",
  disposisiCreate: "disposisi:create",
  disposisiEdit: "disposisi:edit",
  disposisiDelete: "disposisi:delete",

  // Master Jenis Surat
  jenisSuratMenu: "jenis-surat:menu",
  jenisSuratView: "jenis-surat:view",
  jenisSuratCreate: "jenis-surat:create",
  jenisSuratEdit: "jenis-surat:edit",
  jenisSuratDelete: "jenis-surat:delete",

  // Master Unit Kerja
  unitKerjaMenu: "unit-kerja:menu",
  unitKerjaView: "unit-kerja:view",
  unitKerjaCreate: "unit-kerja:create",
  unitKerjaEdit: "unit-kerja:edit",
  unitKerjaDelete: "unit-kerja:delete",

  // Manajemen User
  userMenu: "user:menu",
  userView: "user:view",
  userCreate: "user:create",
  userEdit: "user:edit",
  userDelete: "user:delete",

  // Manajemen Role
  roleMenu: "role:menu",
  roleView: "role:view",
  roleCreate: "role:create",
  roleEdit: "role:edit",
  roleDelete: "role:delete",

  // Manajemen Permission
  permissionMenu: "permission:menu",
  permissionView: "permission:view",
  permissionCreate: "permission:create",
  permissionEdit: "permission:edit",
  permissionDelete: "permission:delete",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface PermissionHolder {
  permissions?: string[];
  role?: string;
}

/** Cek satu izin granular */
export function hasPermission(holder: PermissionHolder | null | undefined, key: string): boolean {
  if (!holder) return false;
  // Superadmin / role admin default memiliki bypass akses
  if (holder.role === "admin") return true;
  return Boolean(holder.permissions?.includes(key));
}

/** Cek salah satu izin terpenuhi */
export function hasAnyPermission(holder: PermissionHolder | null | undefined, keys: string[]): boolean {
  return keys.some((key) => hasPermission(holder, key));
}

/** Cek semua izin wajib terpenuhi */
export function hasAllPermissions(holder: PermissionHolder | null | undefined, keys: string[]): boolean {
  return keys.every((key) => hasPermission(holder, key));
}
