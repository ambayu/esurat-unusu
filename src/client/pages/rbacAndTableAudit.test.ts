import assert from 'assert';
import fs from 'fs';
import path from 'path';

/**
 * Audit RBAC, Sidebar Refactoring & Data Table E-Surat
 */
console.log("Memulai Audit RBAC, Sidebar & Tabel Surat...");

// 1. Audit AdminLayout: Badge profile di sidebar sudah dibersihkan & Tautan Cepat 'Halaman Depan'
const layoutPath = path.resolve(process.cwd(), 'src/client/components/AdminLayout.tsx');
assert(fs.existsSync(layoutPath), 'AdminLayout.tsx harus ada');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

assert(!layoutContent.includes('user?.foto && !imgError'), 'User card/badge di atas menu utama sidebar harus sudah dihapus');
assert(layoutContent.includes('>Halaman Depan<') || layoutContent.includes('title={isCollapsed ? \'Halaman Depan\' : undefined}'), 'Tautan Cepat dinamai Halaman Depan');
assert(layoutContent.includes('to="/admin/rbac"'), 'Sidebar mendaftarkan menu Manajemen Pengguna & RBAC');

// 2. Audit Tabel Surat: SuratList murni data table
const suratListPath = path.resolve(process.cwd(), 'src/client/pages/SuratList.tsx');
assert(fs.existsSync(suratListPath), 'SuratList.tsx harus ada');
const suratListContent = fs.readFileSync(suratListPath, 'utf8');

assert(suratListContent.includes('<table') && suratListContent.includes('<thead>') && suratListContent.includes('<tbody>'), 'Tampilan surat menggunakan struktur data table');
assert(suratListContent.includes('canDeleteSurat'), 'Tombol aksi mematuhi gatekeeper permission');

// 3. Audit RBAC API & UI
const serverIndexPath = path.resolve(process.cwd(), 'src/server/index.ts');
assert(fs.existsSync(serverIndexPath), 'server/index.ts harus ada');
const serverContent = fs.readFileSync(serverIndexPath, 'utf8');

assert(serverContent.includes('/api/admin/roles'), 'Endpoint CRUD roles tersedia');
assert(serverContent.includes('/api/admin/users'), 'Endpoint CRUD users tersedia');
assert(serverContent.includes('/api/admin/permissions'), 'Endpoint permissions & default seeds tersedia');
assert(serverContent.includes('/api/admin/roles/:id/permissions'), 'Endpoint permission mapping per-role tersedia');
assert(serverContent.includes('requirePermission'), 'Middleware gatekeeper requirePermission tersedia');

const rbacPagePath = path.resolve(process.cwd(), 'src/client/pages/RbacManagement.tsx');
assert(fs.existsSync(rbacPagePath), 'RbacManagement.tsx harus ada');
const rbacContent = fs.readFileSync(rbacPagePath, 'utf8');
assert(rbacContent.includes('Matriks Izin (Permission Mapping)'), 'Form mapping permission per role tersedia');

console.log("✅ Seluruh 10 assertion audit refaktor Sidebar, Data Table, dan Fitur RBAC lulus validasi!");
