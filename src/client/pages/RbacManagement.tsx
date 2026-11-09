import React, { useState, useEffect } from 'react';

import { PageShell } from '../components/PageShell';
import { CardContainer } from '../components/CardContainer';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CheckIcon,
  ExclamationCircleIcon,
  KeyIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { 
  fetchAdminUsers, 
  createAdminUser, 
  updateAdminUser, 
  deleteAdminUser, 
  fetchAdminRoles, 
  createAdminRole, 
  updateAdminRole, 
  deleteAdminRole, 
  fetchAdminPermissions, 
  updateAdminRolePermissions,
  UserItem, 
  RoleItem, 
  PermissionItem 
} from '../services/api';

export type RbacMode = 'users' | 'roles' | 'permissions';

interface RbacManagementProps {
  /**
   * Mode terfokus (satu menu = satu tab):
   *  - `users`       → hanya daftar pengguna
   *  - `roles`       → hanya daftar peran
   *  - `permissions` → hanya matriks izin (permission mapping)
   * Tanpa prop ini, seluruh tab ditampilkan (perilaku lama).
   */
  mode?: RbacMode;
}

export const RbacManagement: React.FC<RbacManagementProps> = ({ mode }) => {
  const [activeTab, setActiveTab] = useState<RbacMode>(
    mode === 'roles' ? 'roles' : mode === 'permissions' ? 'permissions' : 'users'
  );

  // Sinkronkan tab aktif saat mode berubah (mis. navigasi antar menu).
  useEffect(() => {
    if (mode === 'roles') setActiveTab('roles');
    else if (mode === 'permissions') setActiveTab('permissions');
    else if (mode === 'users') setActiveTab('users');
  }, [mode]);
  
  // Data States
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // User Form Modal State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    nama: '',
    email: '',
    nim: '',
    nidn: '',
    prodi: '',
    fakultas: '',
    roleIds: [] as number[],
    isActive: true,
  });

  // Role Form Modal State
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [roleFormData, setRoleFormData] = useState({
    code: '',
    name: '',
    description: '',
  });

  // Permission Mapping State
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<string[]>([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [uRes, rRes, pRes] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminRoles(),
        fetchAdminPermissions(),
      ]);
      setUsers(uRes.data.data || []);
      setRoles(rRes.data.data || []);
      setPermissions(pRes.data.data || []);

      if (rRes.data.data?.length > 0 && !selectedRoleId) {
        setSelectedRoleId(rRes.data.data[0].id);
        setDraftPermissions(rRes.data.data[0].permissionKeys || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Gagal memuat data RBAC');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      const r = roles.find((item) => item.id === selectedRoleId);
      if (r) {
        setDraftPermissions(r.permissionKeys || []);
      }
    }
  }, [selectedRoleId, roles]);

  const isEditingSuperadmin =
    Boolean(editingUser) &&
    (editingUser?.roles?.some((r) => r.code === 'SUPERADMIN') ||
      editingUser?.username === 'admin' ||
      editingUser?.username === 'superadmin');

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateAdminUser(editingUser.id, {
          isActive: isEditingSuperadmin ? true : userFormData.isActive,
          roleIds: userFormData.roleIds,
        });
        setSuccess('Data pengguna berhasil diperbarui!');
      } else {
        await createAdminUser(userFormData);
        setSuccess('Pengguna baru berhasil ditambahkan!');
      }
      setUserModalOpen(false);
      loadAllData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal menyimpan data pengguna');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus pengguna ini?')) return;
    try {
      await deleteAdminUser(id);
      setSuccess('Pengguna berhasil dihapus');
      loadAllData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal menghapus pengguna');
    }
  };

  const handleCreateOrUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await updateAdminRole(editingRole.id, roleFormData);
        setSuccess('Data peran berhasil diperbarui!');
      } else {
        await createAdminRole(roleFormData);
        setSuccess('Peran baru berhasil ditambahkan!');
      }
      setRoleModalOpen(false);
      loadAllData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal menyimpan peran');
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus peran ini?')) return;
    try {
      await deleteAdminRole(id);
      setSuccess('Peran berhasil dihapus');
      loadAllData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal menghapus peran');
    }
  };

  const togglePermissionKey = (key: string) => {
    setDraftPermissions((prev) => 
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRoleId) return;
    setIsSavingPermissions(true);
    try {
      await updateAdminRolePermissions(selectedRoleId, draftPermissions);
      setSuccess('Hak akses peran berhasil disimpan!');
      loadAllData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal menyimpan mapping permission');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  return (
    <PageShell
      badge={
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-200 text-slate-800 uppercase tracking-wider">
          RBAC Gatekeeper
        </span>
      }
      title={
        mode === 'users'
          ? 'Manajemen Pengguna'
          : mode === 'roles'
            ? 'Peran'
            : mode === 'permissions'
              ? 'Izin'
              : 'Manajemen Pengguna, Peran & Izin'
      }
      description={
        mode === 'users'
          ? 'Kelola akun pengguna, status aktif, dan penugasan peran pada sistem persuratan.'
          : mode === 'roles'
            ? 'Kelola daftar peran sistem persuratan beserta jumlah pemegangnya.'
            : mode === 'permissions'
              ? 'Atur pemetaan izin (permission) granuler untuk setiap peran pada sistem persuratan.'
              : 'Konfigurasi akun pengguna sistem, pembagian role, dan matriks hak akses persuratan.'
      }
      actions={
        <button
          onClick={loadAllData}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[12px] border border-[#CBD5E1] bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs min-h-[44px]"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Muat Ulang</span>
        </button>
      }
      headerFooter={
        /* Navigation Tabs : hanya untuk tampilan gabungan (tanpa prop `mode`) */
        !mode ? (
          <>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition min-h-[44px] flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-surat-green text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            <span>Daftar Pengguna ({users.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition min-h-[44px] flex items-center gap-2 cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-surat-green text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Daftar Peran ({roles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition min-h-[44px] flex items-center gap-2 cursor-pointer ${
              activeTab === 'permissions'
                ? 'bg-surat-green text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <KeyIcon className="w-4 h-4" />
            <span>Matriks Izin (Permission Mapping)</span>
          </button>
          </>
        ) : undefined
      }
    >

      {/* Alert Notifikasi */}
      {success && (
        <div className="p-4 rounded-[14px] bg-surat-green-50 border border-surat-green-100 text-surat-green-dark flex items-center justify-between text-xs sm:text-sm font-semibold">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-surat-green shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="p-1 hover:text-surat-green-dark">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-[14px] bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between text-xs sm:text-sm font-semibold">
          <div className="flex items-center space-x-2">
            <ExclamationCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:text-rose-950">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: PENGGUNA (USERS) */}
      {activeTab === 'users' && (
        <CardContainer
          title="Tabel Manajemen Pengguna"
          subtitle="Daftar akun pengguna lokal & integrasi akun SSO Universitas."
          badge={<UsersIcon className="w-4 h-4 text-surat-green" />}
          actions={
            <button
              onClick={() => {
                setEditingUser(null);
                setUserFormData({
                  username: '',
                  nama: '',
                  email: '',
                  nim: '',
                  nidn: '',
                  prodi: '',
                  fakultas: '',
                  roleIds: [],
                });
                setUserModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-surat-green text-white hover:bg-surat-green-dark font-bold text-xs min-h-[44px]"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-[#CBD5E1] bg-slate-50 text-slate-600 font-bold">
                  <th className="py-3 px-3">NIDN / NIM</th>
                  <th className="py-3 px-3">Nama Lengkap</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Role Terkait</th>
                  <th className="py-3 px-3 text-center">Status Akun</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada pengguna yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isSuper =
                      u.roles?.some((r) => r.code === 'SUPERADMIN') ||
                      u.username === 'admin' ||
                      u.username === 'superadmin';
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                          {u.nidn || u.nim || u.username}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">{u.nama}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                          {u.email || (u.username.includes('@') ? u.username : `${u.username.toLowerCase()}@unusu.ac.id`)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {u.roles?.map((r) => (
                              <span
                                key={r.id}
                                className="px-2 py-0.5 rounded bg-surat-green-50 text-surat-green-dark border border-surat-green-100 text-[10px] font-bold"
                              >
                                {r.name}
                              </span>
                            ))}
                            {(!u.roles || u.roles.length === 0) && (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1 text-surat-green bg-surat-green-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              <UserPlusIcon className="w-3 h-3" /> Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              <UserMinusIcon className="w-3 h-3" /> Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setUserFormData({
                                  username: u.username,
                                  nama: u.nama,
                                  email: u.email || '',
                                  nim: u.nim || '',
                                  nidn: u.nidn || '',
                                  prodi: u.prodi || '',
                                  fakultas: u.fakultas || '',
                                  roleIds: u.roles?.map((r) => r.id) || [],
                                  isActive: u.isActive,
                                });
                                setUserModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-[#CBD5E1] text-slate-600 hover:text-surat-green hover:bg-slate-50 transition"
                              title="Edit Pengguna"
                            >
                              <PencilSquareIcon className="w-3.5 h-3.5" />
                            </button>
                            {!isSuper && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 rounded-lg border border-[#CBD5E1] text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition"
                                title="Hapus Pengguna"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContainer>
      )}

      {/* TAB 2: PERAN (ROLES) */}
      {activeTab === 'roles' && (
        <CardContainer
          title="Tabel Manajemen Peran (Roles)"
          subtitle="Grup otorisasi yang menentukan kewenangan staf, dosen, dan pejabat kampus."
          badge={<ShieldCheckIcon className="w-4 h-4 text-surat-green" />}
          actions={
            <button
              onClick={() => {
                setEditingRole(null);
                setRoleFormData({ code: '', name: '', description: '' });
                setRoleModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-surat-green text-white hover:bg-surat-green-dark font-bold text-xs min-h-[44px]"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Tambah Peran</span>
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#CBD5E1] bg-slate-50 text-slate-600 font-bold">
                  <th className="py-3 px-3">Kode Peran</th>
                  <th className="py-3 px-3">Nama Peran</th>
                  <th className="py-3 px-3">Deskripsi</th>
                  <th className="py-3 px-3 text-center">Pengguna</th>
                  <th className="py-3 px-3 text-center">Izin Aktif</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada peran terdaftar.
                    </td>
                  </tr>
                ) : (
                  roles.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {r.code}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {r.name}
                        {r.isSystem && (
                          <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                            Sistem
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{r.description || '-'}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700">
                          {r.userCount} akun
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-surat-green-50 text-surat-green-dark font-bold">
                          {r.permissionKeys?.length || 0} izin
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedRoleId(r.id);
                              setActiveTab('permissions');
                            }}
                            className="p-1.5 rounded-lg border border-[#CBD5E1] text-surat-green hover:bg-surat-green-50 transition"
                            title="Atur Matriks Izin"
                          >
                            <KeyIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingRole(r);
                              setRoleFormData({
                                code: r.code,
                                name: r.name,
                                description: r.description || '',
                              });
                              setRoleModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-[#CBD5E1] text-slate-600 hover:text-surat-green hover:bg-slate-50 transition"
                            title="Edit Peran"
                          >
                            <PencilSquareIcon className="w-3.5 h-3.5" />
                          </button>
                          {!r.isSystem && (
                            <button
                              onClick={() => handleDeleteRole(r.id)}
                              className="p-1.5 rounded-lg border border-[#CBD5E1] text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition"
                              title="Hapus Peran"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
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
        </CardContainer>
      )}

      {/* TAB 3: MATRIKS IZIN PER ROLE (PERMISSION MAPPING) */}
      {activeTab === 'permissions' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sisi Kiri: Pilih Peran */}
          <div className="md:col-span-1">
            <CardContainer
              title="Pilih Peran"
              subtitle="Pilih peran yang ingin dikonfigurasi izinnya."
            >
              <div className="space-y-1">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoleId(r.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-[12px] text-xs font-bold transition flex items-center justify-between ${
                      selectedRoleId === r.id
                        ? 'bg-surat-green text-white'
                        : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <span>{r.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      selectedRoleId === r.id ? 'bg-surat-green-dark text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {r.permissionKeys?.length || 0}
                    </span>
                  </button>
                ))}
              </div>
            </CardContainer>
          </div>

          {/* Sisi Kanan: Checklist Matriks Izin */}
          <div className="md:col-span-3">
            <CardContainer
              title={`Matriks Hak Akses: ${roles.find((r) => r.id === selectedRoleId)?.name || '-'}`}
              subtitle="Centang izin yang diberikan kepada peran ini untuk mengakses menu & tindakan naskah."
              badge={<LockClosedIcon className="w-4 h-4 text-surat-green" />}
              actions={
                <button
                  onClick={handleSaveRolePermissions}
                  disabled={isSavingPermissions || !selectedRoleId}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-surat-green text-white hover:bg-surat-green-dark font-bold text-xs min-h-[44px] disabled:opacity-50"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>{isSavingPermissions ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              }
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {permissions.map((p) => {
                    const isChecked = draftPermissions.includes(p.key);
                    return (
                      <div
                        key={p.id}
                        onClick={() => togglePermissionKey(p.key)}
                        className={`p-3 rounded-[12px] border cursor-pointer transition flex items-start gap-3 ${
                          isChecked
                            ? 'border-surat-green-light bg-surat-green-50/50'
                            : 'border-[#CBD5E1] bg-white hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by wrapper onClick
                          className="mt-1 h-4 w-4 rounded text-surat-green focus:ring-surat-green-light border-slate-300"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{p.label}</span>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {p.action}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{p.key}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContainer>
          </div>
        </div>
      )}

      {/* MODAL USER FORM */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[16px] border border-[#CBD5E1] shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? 'Edit Pengguna' : 'Tambah Akun Pengguna Baru'}
              </h3>
              <button onClick={() => setUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdateUser} className="space-y-3.5 text-xs">
              {editingUser ? (
                /* READ-ONLY BIODATA SECTION */
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[12px] space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">
                      Identitas Civitas (ONE UNUSU SSO)
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                      Read-Only
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-semibold">NIDN / NIM</span>
                      <p className="font-mono font-bold text-slate-800">
                        {userFormData.nidn || userFormData.nim || userFormData.username}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-semibold">Nama Lengkap</span>
                      <p className="font-bold text-slate-800">{userFormData.nama}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold">Email</span>
                    <p className="font-mono text-slate-700">
                      {userFormData.email || `${userFormData.username.toLowerCase()}@unusu.ac.id`}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={userFormData.username}
                      onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={userFormData.nama}
                      onChange={(e) => setUserFormData({ ...userFormData, nama: e.target.value })}
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Akun</label>
                <select
                  disabled={isEditingSuperadmin}
                  value={isEditingSuperadmin ? 'true' : String(userFormData.isActive)}
                  onChange={(e) => setUserFormData({ ...userFormData, isActive: e.target.value === 'true' })}
                  className={`w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px] font-semibold ${
                    isEditingSuperadmin ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'
                  }`}
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
                {isEditingSuperadmin && (
                  <p className="text-[10px] text-amber-600 mt-1 font-semibold">
                    🔒 Akun Super Administrator terkunci permanen pada status Aktif.
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role Terkait</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-[10px]">
                  {roles.map((r) => {
                    const isSuperRole = r.code === 'SUPERADMIN';
                    const isLocked = isEditingSuperadmin && isSuperRole;
                    const isChecked = userFormData.roleIds.includes(r.id);

                    return (
                      <label
                        key={r.id}
                        className={`flex items-center gap-2 p-1.5 rounded transition ${
                          isLocked ? 'cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={isLocked}
                          checked={isChecked}
                          onChange={(e) => {
                            if (isLocked) return;
                            if (e.target.checked) {
                              setUserFormData({ ...userFormData, roleIds: [...userFormData.roleIds, r.id] });
                            } else {
                              setUserFormData({
                                ...userFormData,
                                roleIds: userFormData.roleIds.filter((id) => id !== r.id),
                              });
                            }
                          }}
                          className="rounded text-surat-green focus:ring-surat-green-light"
                        />
                        <span className="text-[11px] font-semibold text-slate-800">
                          {r.name} {isLocked && '🔒'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-[10px] border border-[#CBD5E1] text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[10px] bg-surat-green text-white font-bold hover:bg-surat-green-dark"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ROLE FORM */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[16px] border border-[#CBD5E1] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingRole ? 'Edit Data Peran' : 'Tambah Peran Baru'}
              </h3>
              <button onClick={() => setRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdateRole} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kode Peran *</label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingRole)}
                  placeholder="CONTOH: STAF_BIRO"
                  value={roleFormData.code}
                  onChange={(e) => setRoleFormData({ ...roleFormData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px] uppercase font-mono disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Peran *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Staf Administrasi Biro"
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px]"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Kewenangan</label>
                <textarea
                  rows={3}
                  placeholder="Keterangan cakupan hak akses peran ini..."
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  className="px-4 py-2 rounded-[10px] border border-[#CBD5E1] text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[10px] bg-surat-green text-white font-bold hover:bg-surat-green-dark"
                >
                  Simpan Peran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
};
