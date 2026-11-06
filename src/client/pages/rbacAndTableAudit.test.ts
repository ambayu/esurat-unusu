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
assert(
  layoutContent.includes("to: '/admin/pengguna'") &&
  layoutContent.includes("to: '/admin/peran'") &&
  layoutContent.includes("to: '/admin/izin'"),
  'Sidebar mendaftarkan menu Manajemen Pengguna, Peran Sistem, dan Matriks Izin Akses pada grup Tata Kelola'
);
assert(
  !layoutContent.includes("to: '/admin/peran-izin'"),
  'Menu gabungan "Peran & Izin" sudah dipecah menjadi dua menu terpisah'
);
assert(
  layoutContent.includes('Tata Kelola'),
  'Menu manajemen pengguna berada di grup "Tata Kelola" (posisi paling bawah sidebar)'
);

// 2. Audit Tabel Surat: SuratList memakai ListPageTemplate (tabel ada di template)
const suratListPath = path.resolve(process.cwd(), 'src/client/pages/SuratList.tsx');
assert(fs.existsSync(suratListPath), 'SuratList.tsx harus ada');
const suratListContent = fs.readFileSync(suratListPath, 'utf8');

assert(
  suratListContent.includes('ListPageTemplate') &&
  suratListContent.includes('columns={['),
  'Tampilan surat memakai ListPageTemplate dengan definisi kolom tabel'
);

// Struktur tabel baku diperiksa di komponen template-nya.
const listTemplatePath = path.resolve(process.cwd(), 'src/client/components/ListPageTemplate.tsx');
assert(fs.existsSync(listTemplatePath), 'ListPageTemplate.tsx harus ada');
const listTemplateContent = fs.readFileSync(listTemplatePath, 'utf8');
assert(
  listTemplateContent.includes('<table') &&
  /<thead[\s>]/.test(listTemplateContent) &&
  /<tbody[\s>]/.test(listTemplateContent) &&
  listTemplateContent.includes('overflow-x-auto'),
  'ListPageTemplate menyediakan struktur data table dengan scroll horizontal'
);
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
