import React, { useState, useEffect, useMemo } from 'react';
import { PageShell } from '../components/PageShell';
import { CardContainer } from '../components/CardContainer';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CheckIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  IdentificationIcon,
  InboxIcon,
  KeyIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserGroupIcon,
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
   * Tanpa prop ini, seluruh tab ditampilkan.
   */
  mode?: RbacMode;
}

interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  items: PermissionItem[];
}

export const RbacManagement: React.FC<RbacManagementProps> = ({ mode }) => {
  const [activeTab, setActiveTab] = useState<RbacMode>(
    mode === 'roles' ? 'roles' : mode === 'permissions' ? 'permissions' : 'users'
  );

  // Sinkronkan tab aktif saat mode berubah (mis. navigasi antar menu di sidebar)
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

  // Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [roleSearch, setRoleSearch] = useState('');
  const [permissionSearch, setPermissionSearch] = useState('');
  const [roleSelectorSearch, setRoleSelectorSearch] = useState('');

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

  const handleToggleGroup = (groupKeys: string[], selectAll: boolean) => {
    setDraftPermissions((prev) => {
      if (selectAll) {
        const set = new Set([...prev, ...groupKeys]);
        return Array.from(set);
      } else {
        return prev.filter((k) => !groupKeys.includes(k));
      }
    });
  };

  const handleSelectAllGlobal = () => {
    setDraftPermissions(permissions.map((p) => p.key));
  };

  const handleClearAllGlobal = () => {
    setDraftPermissions([]);
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

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Status filter
      if (userStatusFilter === 'active' && !u.isActive) return false;
      if (userStatusFilter === 'inactive' && u.isActive) return false;

      // Role filter
      if (userRoleFilter !== 'all') {
        const hasRole = u.roles?.some((r) => String(r.id) === userRoleFilter || r.code === userRoleFilter);
        if (!hasRole) return false;
      }

      // Keyword search
      if (!userSearch.trim()) return true;
      const kw = userSearch.toLowerCase();
      return (
        u.nama.toLowerCase().includes(kw) ||
        u.username.toLowerCase().includes(kw) ||
        (u.email && u.email.toLowerCase().includes(kw)) ||
        (u.nim && u.nim.toLowerCase().includes(kw)) ||
        (u.nidn && u.nidn.toLowerCase().includes(kw))
      );
    });
  }, [users, userSearch, userStatusFilter, userRoleFilter]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    if (!roleSearch.trim()) return roles;
    const kw = roleSearch.toLowerCase();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(kw) ||
        r.code.toLowerCase().includes(kw) ||
        (r.description && r.description.toLowerCase().includes(kw))
    );
  }, [roles, roleSearch]);

  // Role list for left-panel selector in permissions mode
  const selectorRoles = useMemo(() => {
    if (!roleSelectorSearch.trim()) return roles;
    const kw = roleSelectorSearch.toLowerCase();
    return roles.filter(
      (r) => r.name.toLowerCase().includes(kw) || r.code.toLowerCase().includes(kw)
    );
  }, [roles, roleSelectorSearch]);

  // Grouped Permissions
  const permissionGroups = useMemo<PermissionGroup[]>(() => {
    const kw = permissionSearch.trim().toLowerCase();
    const matching = permissions.filter((p) => {
      if (!kw) return true;
      return (
        p.label.toLowerCase().includes(kw) ||
        p.key.toLowerCase().includes(kw) ||
        p.action.toLowerCase().includes(kw) ||
        p.resource.toLowerCase().includes(kw) ||
        (p.description && p.description.toLowerCase().includes(kw))
      );
    });

    const groupsMap: { [key: string]: PermissionGroup } = {
      surat: {
        id: 'surat',
        name: 'Persuratan & Agenda Naskah Dinas',
        description: 'Akses menu agenda, melihat detail berkas, registrasi surat, dan penghapusan arsip.',
        icon: InboxIcon,
        items: [],
      },
      disposisi: {
        id: 'disposisi',
        name: 'Lembar Disposisi Pimpinan',
        description: 'Kewenangan penerbitan dan pendelegasian instruksi disposisi surat ke unit kerja.',
        icon: ClipboardDocumentCheckIcon,
        items: [],
      },
      jenis_surat: {
        id: 'jenis_surat',
        name: 'Format & Template Jenis Surat',
        description: 'Pengelolaan master data format nomor surat, kode klasifikasi, dan peruntukan template.',
        icon: IdentificationIcon,
        items: [],
      },
      rbac: {
        id: 'rbac',
        name: 'Tata Kelola Pengguna & RBAC',
        description: 'Pengaturan akun civitas, konfigurasi peran sistem, dan penetapan matriks hak akses.',
        icon: ShieldCheckIcon,
        items: [],
      },
      lainnya: {
        id: 'lainnya',
        name: 'Modul Institusi Lainnya',
        description: 'Hak akses fitur tambahan dan integrasi layanan publik.',
        icon: KeyIcon,
        items: [],
      },
    };

    for (const p of matching) {
      const res = p.resource.toLowerCase();
      const keyPrefix = p.key.split(':')[0].toLowerCase();

      if (res.includes('surat') && !res.includes('jenis')) {
        groupsMap.surat.items.push(p);
      } else if (res.includes('disposisi') || keyPrefix === 'disposisi') {
        groupsMap.disposisi.items.push(p);
      } else if (res.includes('jenis') || keyPrefix === 'jenis_surat') {
        groupsMap.jenis_surat.items.push(p);
      } else if (res.includes('rbac') || keyPrefix === 'rbac' || keyPrefix === 'user' || keyPrefix === 'role') {
        groupsMap.rbac.items.push(p);
      } else {
        groupsMap.lainnya.items.push(p);
      }
    }

    return Object.values(groupsMap).filter((g) => g.items.length > 0);
  }, [permissions, permissionSearch]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <PageShell
      badge={
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-surat-green-50 text-surat-green-dark border border-surat-green-200 uppercase tracking-wider">
          Otorisasi & Keamanan
        </span>
      }
      title={
        mode === 'users'
          ? 'Manajemen Pengguna'
          : mode === 'roles'
            ? 'Peran Sistem Persuratan'
            : mode === 'permissions'
              ? 'Matriks Izin (Permission Mapping)'
              : 'Manajemen Pengguna, Peran & Izin'
      }
      description={
        mode === 'users'
          ? 'Kelola akun pengguna, sinkronisasi profil ONE UNUSU SSO, status aktif, dan penugasan peran persuratan.'
          : mode === 'roles'
            ? 'Kelola daftar peran sistem persuratan, cakupan kewenangan, dan jumlah akun civitas pemegang peran.'
            : mode === 'permissions'
              ? 'Atur pemetaan izin (permission) granuler untuk setiap peran pada sistem persuratan universitas.'
              : 'Konfigurasi akun pengguna sistem, pembagian role, dan matriks hak akses persuratan.'
      }
      actions={
        <button
          onClick={loadAllData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[12px] border border-[#CBD5E1] bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs min-h-[44px] cursor-pointer disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      }
      headerFooter={
        /* Navigation Tabs : hanya untuk tampilan gabungan (tanpa prop `mode`) */
        !mode ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition min-h-[44px] flex items-center gap-2 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-surat-green text-white shadow-xs'
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
                  ? 'bg-surat-green text-white shadow-xs'
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
                  ? 'bg-surat-green text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <KeyIcon className="w-4 h-4" />
              <span>Matriks Izin (Permission Mapping)</span>
            </button>
          </div>
        ) : undefined
      }
    >
      {/* Alert Notifikasi */}
      {success && (
        <div className="p-4 rounded-[14px] bg-surat-green-50 border border-surat-green-200 text-surat-green-dark flex items-center justify-between text-xs sm:text-sm font-semibold">
          <div className="flex items-center space-x-2.5">
            <CheckCircleIcon className="w-5 h-5 text-surat-green shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="p-1 hover:text-surat-green-dark text-slate-400">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-[14px] bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between text-xs sm:text-sm font-semibold">
          <div className="flex items-center space-x-2.5">
            <ExclamationCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:text-rose-950 text-slate-400">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: PENGGUNA (USERS) */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          {/* KPI Ringkasan Pengguna */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-[14px] border border-[#CBD5E1] bg-white">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Pengguna</span>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{users.length}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Akun terdaftar di sistem</span>
            </div>
            <div className="p-4 rounded-[14px] border border-[#CBD5E1] bg-white">
              <span className="text-[11px] font-bold text-surat-green uppercase tracking-wide">Akun Aktif</span>
              <p className="text-xl sm:text-2xl font-extrabold text-surat-green-dark mt-1">
                {users.filter((u) => u.isActive).length}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Dapat login & bertransaksi</span>
            </div>
            <div className="p-4 rounded-[14px] border border-[#CBD5E1] bg-white">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wide">Nonaktif</span>
              <p className="text-xl sm:text-2xl font-extrabold text-rose-700 mt-1">
                {users.filter((u) => !u.isActive).length}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Akses ditangguhkan</span>
            </div>
            <div className="p-4 rounded-[14px] border border-[#CBD5E1] bg-white">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">Integrasi SSO</span>
              <p className="text-xl sm:text-2xl font-extrabold text-blue-800 mt-1">100%</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Terautentikasi ONE UNUSU</span>
            </div>
          </div>

          <CardContainer
            title="Tabel Manajemen Pengguna"
            subtitle={`Menampilkan ${filteredUsers.length} dari total ${users.length} pengguna terdaftar.`}
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
                    isActive: true,
                  });
                  setUserModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] bg-surat-green text-white hover:bg-surat-green-dark font-bold text-xs min-h-[44px] cursor-pointer shadow-xs transition"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Tambah Pengguna</span>
              </button>
            }
          >
            <div className="space-y-4">
              {/* Filter Toolbar Pengguna */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-[12px]">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Cari nama pengguna, username, NIDN/NIM, atau email..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-surat-green-light"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-white border border-[#CBD5E1] rounded-[10px] text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-surat-green-light min-h-[40px]"
                  >
                    <option value="all">Semua Status</option>
                    <option value="active">Hanya Aktif</option>
                    <option value="inactive">Hanya Nonaktif</option>
                  </select>

                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-[#CBD5E1] rounded-[10px] text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-surat-green-light min-h-[40px]"
                  >
                    <option value="all">Semua Peran</option>
                    {roles.map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data Table Pengguna */}
              <div className="overflow-x-auto rounded-[12px] border border-[#CBD5E1]">
                <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                  <thead>
                    <tr className="border-b border-[#CBD5E1] bg-slate-50 text-slate-700 font-bold">
                      <th className="py-3 px-3.5 w-12 text-center">No</th>
                      <th className="py-3 px-3.5">Identitas Civitas</th>
                      <th className="py-3 px-3.5">NIDN / NIM / User</th>
                      <th className="py-3 px-3.5">Email Akun</th>
                      <th className="py-3 px-3.5">Peran Ditugaskan</th>
                      <th className="py-3 px-3.5 text-center">Status</th>
                      <th className="py-3 px-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <UsersIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold text-slate-600">Tidak ada pengguna yang cocok.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Ubah kata kunci pencarian atau reset filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u, index) => {
                        const isSuper =
                          u.roles?.some((r) => r.code === 'SUPERADMIN') ||
                          u.username === 'admin' ||
                          u.username === 'superadmin';
                        const initial = (u.nama || u.username).charAt(0).toUpperCase();

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-3.5 text-center text-slate-500 tabular-nums">{index + 1}</td>
                            <td className="py-3 px-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-surat-green/10 text-surat-green-dark font-extrabold flex items-center justify-center shrink-0 border border-surat-green/20">
                                  {initial}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 truncate">{u.nama}</div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {u.prodi ? `${u.prodi} ` : ''}{u.fakultas ? `• ${u.fakultas}` : ''}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3.5 font-mono font-semibold text-slate-800">
                              {u.nidn || u.nim || u.username}
                            </td>
                            <td className="py-3 px-3.5 text-slate-600 font-mono text-[11px]">
                              {u.email || (u.username.includes('@') ? u.username : `${u.username.toLowerCase()}@unusu.ac.id`)}
                            </td>
                            <td className="py-3 px-3.5">
                              <div className="flex flex-wrap gap-1">
                                {u.roles?.map((r) => (
                                  <span
                                    key={r.id}
                                    className="px-2 py-0.5 rounded bg-surat-green-50 text-surat-green-dark border border-surat-green-200 text-[10px] font-bold"
                                  >
                                    {r.name}
                                  </span>
                                ))}
                                {(!u.roles || u.roles.length === 0) && (
                                  <span className="text-slate-400 text-[11px] italic">Tanpa Peran</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              {u.isActive ? (
                                <span className="inline-flex items-center gap-1 text-surat-green-dark bg-surat-green-50 border border-surat-green-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  <UserPlusIcon className="w-3 h-3 text-surat-green" /> Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  <UserMinusIcon className="w-3 h-3 text-rose-600" /> Nonaktif
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-right">
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
            </div>
          </CardContainer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PERAN (ROLES) */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <div className="space-y-5">
          {/* KPI Ringkasan Peran */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-[14px] border border-[#CBD5E1] bg-white">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Peran</span>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{roles.length}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Kategori kewenangan</span>
            </div>
            <div className="p-4 rounded-[14px] border border-[#CBD5E1] bg-white">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Peran Sistem</span>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">
                {roles.filter((r) => r.isSystem).length}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Bawaan platform UNUSU</span>
            </div>
            <div className="p-4 rounded-[14px] border border-[#CBD5E1] bg-white">
              <span className="text-[11px] font-bold text-surat-green uppercase tracking-wide">Peran Kustom</span>
              <p className="text-xl sm:text-2xl font-extrabold text-surat-green-dark mt-1">
                {roles.filter((r) => !r.isSystem).length}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Dapat disesuaikan biro</span>
            </div>
            <div className="p-4 rounded-[14px] border border-[#CBD5E1] bg-white">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">Akun Terikat</span>
              <p className="text-xl sm:text-2xl font-extrabold text-blue-800 mt-1">
                {roles.reduce((acc, r) => acc + (r.userCount || 0), 0)}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Penugasan hak akses</span>
            </div>
          </div>

          <CardContainer
            title="Tabel Manajemen Peran (Roles)"
            subtitle="Grup otorisasi yang menentukan hak akses menu dan wewenang pengesahan naskah persuratan."
            badge={<ShieldCheckIcon className="w-4 h-4 text-surat-green" />}
            actions={
              <button
                onClick={() => {
                  setEditingRole(null);
                  setRoleFormData({ code: '', name: '', description: '' });
                  setRoleModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] bg-surat-green text-white hover:bg-surat-green-dark font-bold text-xs min-h-[44px] cursor-pointer shadow-xs transition"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Tambah Peran</span>
              </button>
            }
          >
            <div className="space-y-4">
              {/* Toolbar Pencarian Peran */}
              <div className="relative max-w-md">
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  placeholder="Cari nama peran, kode, atau deskripsi..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-surat-green-light"
                />
              </div>

              {/* Data Table Peran */}
              <div className="overflow-x-auto rounded-[12px] border border-[#CBD5E1]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#CBD5E1] bg-slate-50 text-slate-700 font-bold">
                      <th className="py-3 px-3.5 w-12 text-center">No</th>
                      <th className="py-3 px-3.5">Kode Peran</th>
                      <th className="py-3 px-3.5">Nama Peran</th>
                      <th className="py-3 px-3.5">Deskripsi Kewenangan</th>
                      <th className="py-3 px-3.5 text-center">Pengguna Terikat</th>
                      <th className="py-3 px-3.5 text-center">Cakupan Izin</th>
                      <th className="py-3 px-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredRoles.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <ShieldCheckIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold text-slate-600">Belum ada peran terdaftar.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Ubah kata kunci pencarian atau tambah peran baru.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRoles.map((r, index) => (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3.5 text-center text-slate-500 tabular-nums">{index + 1}</td>
                          <td className="py-3 px-3.5">
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                              {r.code}
                            </span>
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{r.name}</span>
                              {r.isSystem && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
                                  Sistem
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-slate-500 max-w-xs">{r.description || '-'}</td>
                          <td className="py-3 px-3.5 text-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700 text-[11px] border border-slate-200">
                              {r.userCount} akun
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-surat-green-50 text-surat-green-dark border border-surat-green-200 font-bold text-[11px]">
                              {r.permissionKeys?.length || 0} / {permissions.length} Izin
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedRoleId(r.id);
                                  setActiveTab('permissions');
                                }}
                                className="px-2.5 py-1.5 rounded-lg border border-surat-green-200 bg-surat-green-50 text-surat-green-dark hover:bg-surat-green-100 font-bold text-xs inline-flex items-center gap-1 transition"
                                title="Atur Matriks Izin Peran"
                              >
                                <KeyIcon className="w-3.5 h-3.5 text-surat-green" />
                                <span>Atur Izin</span>
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
            </div>
          </CardContainer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MATRIKS IZIN PER ROLE (PERMISSION MAPPING) */}
      {/* ========================================================================= */}
      {activeTab === 'permissions' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Sisi Kiri (4/12): Pilih Peran */}
          <div className="md:col-span-4 space-y-4">
            <CardContainer
              title="Pilih Peran Sistem"
              subtitle="Pilih peran yang ingin dikonfigurasi hak akses izinnya."
              badge={<ShieldCheckIcon className="w-4 h-4 text-surat-green" />}
            >
              <div className="space-y-3">
                {/* Search Role di selector */}
                <div className="relative">
                  <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={roleSelectorSearch}
                    onChange={(e) => setRoleSelectorSearch(e.target.value)}
                    placeholder="Filter peran..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-[#CBD5E1] rounded-[8px] text-xs focus:outline-none focus:ring-1 focus:ring-surat-green-light"
                  />
                </div>

                <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                  {selectorRoles.map((r) => {
                    const isSelected = selectedRoleId === r.id;
                    const permCount = r.permissionKeys?.length || 0;
                    const percentage = permissions.length > 0 ? Math.round((permCount / permissions.length) * 100) : 0;

                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelectedRoleId(r.id)}
                        className={`w-full text-left p-3 rounded-[12px] text-xs font-bold transition flex flex-col gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-surat-green text-white shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate text-sm">{r.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                              isSelected
                                ? 'bg-surat-green-dark text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {r.code}
                          </span>
                        </div>

                        {/* Progress Bar Cakupan Izin */}
                        <div className="w-full space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-normal">
                            <span className={isSelected ? 'text-white/80' : 'text-slate-500'}>
                              {permCount} dari {permissions.length} Izin
                            </span>
                            <span className={`font-bold ${isSelected ? 'text-white' : 'text-surat-green-dark'}`}>
                              {percentage}%
                            </span>
                          </div>
                          <div
                            className={`h-1.5 w-full rounded-full overflow-hidden ${
                              isSelected ? 'bg-white/20' : 'bg-slate-100'
                            }`}
                          >
                            <div
                              className={`h-full rounded-full ${isSelected ? 'bg-white' : 'bg-surat-green'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContainer>
          </div>

          {/* Sisi Kanan (8/12): Checklist Matriks Izin (Permission Mapping) */}
          <div className="md:col-span-8 space-y-4">
            <CardContainer
              title={`Matriks Izin (Permission Mapping) : ${selectedRole?.name || '-'}`}
              subtitle="Centang izin yang diberikan kepada peran ini untuk mengakses menu & tindakan naskah."
              badge={<LockClosedIcon className="w-4 h-4 text-surat-green" />}
              actions={
                <button
                  onClick={handleSaveRolePermissions}
                  disabled={isSavingPermissions || !selectedRoleId}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-surat-green text-white hover:bg-surat-green-dark font-bold text-xs min-h-[44px] cursor-pointer disabled:opacity-50 shadow-xs transition"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>{isSavingPermissions ? 'Menyimpan...' : 'Simpan Perubahan Matriks'}</span>
                </button>
              }
            >
              <div className="space-y-5">
                {/* Search & Global Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-[12px]">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      placeholder="Cari izin berdasarkan nama, action, atau kode kunci (misal surat:edit)..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-surat-green-light"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllGlobal}
                      className="px-3 py-2 bg-white hover:bg-slate-100 border border-[#CBD5E1] rounded-[10px] text-xs font-bold text-slate-700 min-h-[38px] transition"
                    >
                      Pilih Semua
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllGlobal}
                      className="px-3 py-2 bg-white hover:bg-rose-50 border border-[#CBD5E1] hover:border-rose-200 text-rose-700 rounded-[10px] text-xs font-bold min-h-[38px] transition"
                    >
                      Kosongkan Semua
                    </button>
                  </div>
                </div>

                {/* Ringkasan Status Hak Akses Peran Aktif */}
                {selectedRole && (
                  <div className="p-3.5 bg-surat-green-50/60 border border-surat-green-200 rounded-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-surat-green-dark block text-sm">
                        {selectedRole.name} ({selectedRole.code})
                      </span>
                      <p className="text-slate-600 mt-0.5">{selectedRole.description || 'Tidak ada deskripsi peran.'}</p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="font-mono font-bold text-surat-green text-sm">
                        {draftPermissions.length} / {permissions.length}
                      </span>
                      <span className="text-[11px] text-slate-500 block">Izin Diberikan</span>
                    </div>
                  </div>
                )}

                {/* List Grup Modul Matriks Izin */}
                {permissionGroups.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-[12px] border border-dashed border-slate-200">
                    <LockClosedIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada izin yang sesuai dengan pencarian.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Coba cari dengan kata kunci lain.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {permissionGroups.map((group) => {
                      const groupKeys = group.items.map((i) => i.key);
                      const activeInGroup = groupKeys.filter((k) => draftPermissions.includes(k)).length;
                      const isAllChecked = activeInGroup === groupKeys.length;
                      const IconComponent = group.icon;

                      return (
                        <div
                          key={group.id}
                          className="border border-[#CBD5E1] rounded-[14px] overflow-hidden bg-white shadow-2xs"
                        >
                          {/* Header Group */}
                          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-surat-green/10 text-surat-green flex items-center justify-center shrink-0">
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 leading-tight">{group.name}</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">{group.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                {activeInGroup} / {groupKeys.length}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleGroup(groupKeys, !isAllChecked)}
                                className="text-[11px] font-bold text-surat-green hover:text-surat-green-dark px-2 py-1 rounded hover:bg-surat-green-50 transition cursor-pointer"
                              >
                                {isAllChecked ? 'Batalkan Grup' : 'Pilih Grup'}
                              </button>
                            </div>
                          </div>

                          {/* Items Grid */}
                          <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {group.items.map((p) => {
                              const isChecked = draftPermissions.includes(p.key);
                              return (
                                <div
                                  key={p.id}
                                  onClick={() => togglePermissionKey(p.key)}
                                  className={`p-3 rounded-[10px] border cursor-pointer transition flex items-start gap-3 ${
                                    isChecked
                                      ? 'border-surat-green bg-surat-green-50/40 ring-1 ring-surat-green/20'
                                      : 'border-slate-200 bg-white hover:bg-slate-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}} // dikendalikan oleh container onClick
                                    className="mt-0.5 h-4 w-4 rounded text-surat-green focus:ring-surat-green-light border-slate-300"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-xs text-slate-900 leading-snug">{p.label}</span>
                                      <span
                                        className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                                          p.action === 'delete'
                                            ? 'bg-rose-100 text-rose-700'
                                            : p.action === 'edit'
                                            ? 'bg-amber-100 text-amber-800'
                                            : p.action === 'view'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-slate-100 text-slate-700'
                                        }`}
                                      >
                                        {p.action}
                                      </span>
                                    </div>
                                    <p className="text-[10px] font-mono text-slate-400 mt-1">{p.key}</p>
                                    {p.description && (
                                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{p.description}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContainer>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL USER FORM (TAMBAH / EDIT PENGGUNA) */}
      {/* ========================================================================= */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[16px] border border-[#CBD5E1] shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
              </h3>
              <button onClick={() => setUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdateUser} className="space-y-3.5 text-xs">
              {editingUser ? (
                /* READ-ONLY BIODATA SECTION */
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[12px] space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">
                      Identitas Civitas (ONE UNUSU SSO)
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                      Terverifikasi
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
                    <span className="text-slate-500 block text-[10px] font-semibold">Email Resmi</span>
                    <p className="font-mono text-slate-700">
                      {userFormData.email || `${userFormData.username.toLowerCase()}@unusu.ac.id`}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Username Akun *</label>
                    <input
                      type="text"
                      required
                      value={userFormData.username}
                      onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                      placeholder="Misal: 21051204011 atau nama.dosen"
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-surat-green-light"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Civitas *</label>
                    <input
                      type="text"
                      required
                      value={userFormData.nama}
                      onChange={(e) => setUserFormData({ ...userFormData, nama: e.target.value })}
                      placeholder="Nama lengkap beserta gelar..."
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-surat-green-light"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Keaktifan Akun</label>
                <select
                  disabled={isEditingSuperadmin}
                  value={isEditingSuperadmin ? 'true' : String(userFormData.isActive)}
                  onChange={(e) => setUserFormData({ ...userFormData, isActive: e.target.value === 'true' })}
                  className={`w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px] font-semibold ${
                    isEditingSuperadmin ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'
                  }`}
                >
                  <option value="true">Aktif (Diberi izin akses persuratan)</option>
                  <option value="false">Nonaktif (Akses ditangguhkan)</option>
                </select>
                {isEditingSuperadmin && (
                  <p className="text-[10px] text-amber-600 mt-1 font-semibold">
                    🔒 Akun Super Administrator terkunci permanen pada status Aktif.
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Penugasan Peran Sistem</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2.5 border border-slate-200 rounded-[10px] bg-slate-50/50">
                  {roles.map((r) => {
                    const isSuperRole = r.code === 'SUPERADMIN';
                    const isLocked = isEditingSuperadmin && isSuperRole;
                    const isChecked = userFormData.roleIds.includes(r.id);

                    return (
                      <label
                        key={r.id}
                        className={`flex items-center gap-2 p-1.5 rounded transition ${
                          isLocked ? 'cursor-not-allowed bg-slate-100' : 'cursor-pointer hover:bg-white'
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
                          className="rounded text-surat-green focus:ring-surat-green-light border-slate-300"
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
                  className="px-4 py-2 rounded-[10px] border border-[#CBD5E1] text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[10px] bg-surat-green text-white font-bold hover:bg-surat-green-dark transition shadow-xs"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ROLE FORM (TAMBAH / EDIT PERAN) */}
      {/* ========================================================================= */}
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
            <form onSubmit={handleCreateOrUpdateRole} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kode Peran *</label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingRole)}
                  placeholder="CONTOH: STAF_BIRO"
                  value={roleFormData.code}
                  onChange={(e) => setRoleFormData({ ...roleFormData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px] uppercase font-mono disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-surat-green-light"
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
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-surat-green-light"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Kewenangan</label>
                <textarea
                  rows={3}
                  placeholder="Keterangan cakupan hak akses peran ini pada naskah persuratan..."
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-surat-green-light"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  className="px-4 py-2 rounded-[10px] border border-[#CBD5E1] text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[10px] bg-surat-green text-white font-bold hover:bg-surat-green-dark transition shadow-xs"
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

export default RbacManagement;
