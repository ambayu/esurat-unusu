import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Key, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  UserX,
  Search,
  Lock
} from 'lucide-react';
import { AdminPanelTemplate } from '../components/AdminPanelTemplate';
import { CardContainer } from '../components/CardContainer';
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

export const RbacManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');
  
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

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateAdminUser(editingUser.id, userFormData);
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminPanelTemplate
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
            RBAC Gatekeeper
          </span>
        }
        title="Manajemen Pengguna, Peran & Izin"
        description="Konfigurasi akun pengguna sistem, pembagian role, dan matriks hak akses persuratan."
        actions={
          <button
            onClick={loadAllData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[12px] border border-[#CBD5E1] bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs min-h-[44px]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Muat Ulang</span>
          </button>
        }
      >
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition min-h-[44px] flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Pengguna ({users.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition min-h-[44px] flex items-center gap-2 cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Daftar Peran ({roles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition min-h-[44px] flex items-center gap-2 cursor-pointer ${
              activeTab === 'permissions'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Matriks Izin (Permission Mapping)</span>
          </button>
        </div>
      </AdminPanelTemplate>

      {/* Alert Notifikasi */}
      {success && (
        <div className="p-4 rounded-[14px] bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs sm:text-sm font-semibold">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="p-1 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-[14px] bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between text-xs sm:text-sm font-semibold">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:text-rose-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: PENGGUNA (USERS) */}
      {activeTab === 'users' && (
        <CardContainer
          title="Tabel Manajemen Pengguna"
          subtitle="Daftar akun pengguna lokal & integrasi akun SSO Universitas."
          badge={<Users className="w-4 h-4 text-emerald-700" />}
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-xs shadow-xs min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#CBD5E1] bg-slate-50 text-slate-600 font-bold">
                  <th className="py-3 px-3">Nama / Akun</th>
                  <th className="py-3 px-3">Email & Identitas</th>
                  <th className="py-3 px-3">Unit / Prodi</th>
                  <th className="py-3 px-3">Peran (Roles)</th>
                  <th className="py-3 px-3 text-center">Status</th>
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
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{u.nama}</div>
                        <div className="text-[11px] text-slate-400">@{u.username}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div>{u.email || '-'}</div>
                        <div className="text-[11px] text-slate-400">
                          {u.nidn ? `NIDN: ${u.nidn}` : u.nim ? `NIM: ${u.nim}` : 'Non-Civitas'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div>{u.prodi || '-'}</div>
                        <div className="text-[11px] text-slate-400">{u.fakultas || '-'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {u.roles?.map((r) => (
                            <span
                              key={r.id}
                              className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"
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
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <UserCheck className="w-3 h-3" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <UserX className="w-3 h-3" /> Nonaktif
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
                              });
                              setUserModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-[#CBD5E1] text-slate-600 hover:text-emerald-700 hover:bg-slate-50 transition"
                            title="Edit Pengguna"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 rounded-lg border border-[#CBD5E1] text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* TAB 2: PERAN (ROLES) */}
      {activeTab === 'roles' && (
        <CardContainer
          title="Tabel Manajemen Peran (Roles)"
          subtitle="Grup otorisasi yang menentukan kewenangan staf, dosen, dan pejabat kampus."
          badge={<Shield className="w-4 h-4 text-emerald-700" />}
          actions={
            <button
              onClick={() => {
                setEditingRole(null);
                setRoleFormData({ code: '', name: '', description: '' });
                setRoleModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-xs shadow-xs min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
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
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold">
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
                            className="p-1.5 rounded-lg border border-[#CBD5E1] text-emerald-700 hover:bg-emerald-50 transition"
                            title="Atur Matriks Izin"
                          >
                            <Key className="w-3.5 h-3.5" />
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
                            className="p-1.5 rounded-lg border border-[#CBD5E1] text-slate-600 hover:text-emerald-700 hover:bg-slate-50 transition"
                            title="Edit Peran"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {!r.isSystem && (
                            <button
                              onClick={() => handleDeleteRole(r.id)}
                              className="p-1.5 rounded-lg border border-[#CBD5E1] text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition"
                              title="Hapus Peran"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <span>{r.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      selectedRoleId === r.id ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500'
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
              badge={<Lock className="w-4 h-4 text-emerald-700" />}
              actions={
                <button
                  onClick={handleSaveRolePermissions}
                  disabled={isSavingPermissions || !selectedRoleId}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-xs shadow-xs min-h-[44px] disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
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
                            ? 'border-emerald-500 bg-emerald-50/50'
                            : 'border-[#CBD5E1] bg-white hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by wrapper onClick
                          className="mt-1 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
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
                {editingUser ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
              </h3>
              <button onClick={() => setUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Username *</label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingUser)}
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px] disabled:bg-slate-100"
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NIM / NIDN</label>
                  <input
                    type="text"
                    value={userFormData.nidn || userFormData.nim}
                    onChange={(e) => setUserFormData({ ...userFormData, nidn: e.target.value, nim: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Program Studi</label>
                  <input
                    type="text"
                    value={userFormData.prodi}
                    onChange={(e) => setUserFormData({ ...userFormData, prodi: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fakultas</label>
                  <input
                    type="text"
                    value={userFormData.fakultas}
                    onChange={(e) => setUserFormData({ ...userFormData, fakultas: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-[10px]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Penugasan Peran (Roles)</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-[10px]">
                  {roles.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userFormData.roleIds.includes(r.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserFormData({ ...userFormData, roleIds: [...userFormData.roleIds, r.id] });
                          } else {
                            setUserFormData({
                              ...userFormData,
                              roleIds: userFormData.roleIds.filter((id) => id !== r.id),
                            });
                          }
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] font-semibold text-slate-800">{r.name}</span>
                    </label>
                  ))}
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
                  className="px-4 py-2 rounded-[10px] bg-emerald-700 text-white font-bold hover:bg-emerald-800"
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
                <X className="w-5 h-5" />
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
                  className="px-4 py-2 rounded-[10px] bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                >
                  Simpan Peran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
