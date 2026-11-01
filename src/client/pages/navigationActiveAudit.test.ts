import assert from 'assert';

/**
 * Unit Test Audit: Active State Navigation & Tabs Matching
 * Menguji logika penentuan status aktif pada navigasi panel admin dan filter tabs agenda persuratan.
 */

// Simulasi logika isItemActive pada AdminLayout
function evaluateIsItemActive(pathname: string, search: string, itemTo: string, itemEnd?: boolean): boolean {
  try {
    const [targetPath, targetQuery] = itemTo.split('?');
    const targetParams = new URLSearchParams(targetQuery || '');
    const currentParams = new URLSearchParams(search);

    if (itemEnd) {
      if (pathname !== targetPath) return false;
    } else {
      if (targetPath === '/admin') {
        if (pathname !== '/admin') return false;
      } else if (!pathname.startsWith(targetPath)) {
        return false;
      }
    }

    const targetTipe = targetParams.get('tipe');
    if (targetTipe) {
      return currentParams.get('tipe') === targetTipe;
    }

    if (targetPath.includes('/surat') && !targetTipe) {
      const currentTipe = currentParams.get('tipe');
      if (currentTipe === 'masuk' || currentTipe === 'keluar') {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

console.log("Memulai Audit Active State Navigasi...");

// Kasus 1: Pengguna membuka Agenda Surat Masuk
const masukIsActive = evaluateIsItemActive('/admin/surat', '?tipe=masuk', '/admin/surat?tipe=masuk');
const keluarOnMasuk = evaluateIsItemActive('/admin/surat', '?tipe=masuk', '/admin/surat?tipe=keluar');
const semuaOnMasuk = evaluateIsItemActive('/admin/surat', '?tipe=masuk', '/admin/surat');

assert(masukIsActive === true, "Menu 'Surat Masuk' WAJIB aktif ketika URL '?tipe=masuk'");
assert(keluarOnMasuk === false, "Menu 'Surat Keluar' TIDAK BOLEH aktif ketika URL '?tipe=masuk'");
assert(semuaOnMasuk === false, "Menu 'Semua Agenda Surat' TIDAK BOLEH aktif ketika URL '?tipe=masuk'");

// Kasus 2: Pengguna membuka Agenda Surat Keluar
const keluarIsActive = evaluateIsItemActive('/admin/surat', '?tipe=keluar', '/admin/surat?tipe=keluar');
const masukOnKeluar = evaluateIsItemActive('/admin/surat', '?tipe=keluar', '/admin/surat?tipe=masuk');
const semuaOnKeluar = evaluateIsItemActive('/admin/surat', '?tipe=keluar', '/admin/surat');

assert(keluarIsActive === true, "Menu 'Surat Keluar' WAJIB aktif ketika URL '?tipe=keluar'");
assert(masukOnKeluar === false, "Menu 'Surat Masuk' TIDAK BOLEH aktif ketika URL '?tipe=keluar'");
assert(semuaOnKeluar === false, "Menu 'Semua Agenda Surat' TIDAK BOLEH aktif ketika URL '?tipe=keluar'");

// Kasus 3: Pengguna membuka Semua Agenda Surat (tanpa param tipe)
const semuaIsActive = evaluateIsItemActive('/admin/surat', '', '/admin/surat');
const masukOnSemua = evaluateIsItemActive('/admin/surat', '', '/admin/surat?tipe=masuk');
const keluarOnSemua = evaluateIsItemActive('/admin/surat', '', '/admin/surat?tipe=keluar');

assert(semuaIsActive === true, "Menu 'Semua Agenda Surat' WAJIB aktif ketika membuka agenda tanpa filter tipe");
assert(masukOnSemua === false, "Menu 'Surat Masuk' TIDAK BOLEH aktif pada halaman umum agenda");
assert(keluarOnSemua === false, "Menu 'Surat Keluar' TIDAK BOLEH aktif pada halaman umum agenda");

// Kasus 4: Dashboard /admin
const dashboardActive = evaluateIsItemActive('/admin', '', '/admin', true);
const suratOnDashboard = evaluateIsItemActive('/admin', '', '/admin/surat');

assert(dashboardActive === true, "Menu 'Dashboard' aktif pada rute /admin");
assert(suratOnDashboard === false, "Menu 'Semua Agenda Surat' TIDAK BOLEH aktif pada rute /admin");

console.log("✅ Semua assertion active state navigation/tabs lolos verifikasi logika presisi!");
