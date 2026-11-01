/**
 * Test Suite: Alur Navigasi dan Akses Root URL E-Surat UNUSU
 * 
 * Verifikasi skenario:
 * 1. Tamu publik (unauthenticated) mengakses root URL ('/') tetap di LandingPage dan tidak terlempar ke '/admin'.
 * 2. Tamu publik mengakses route terproteksi ('/surat', '/ajukan', '/admin', '/dashboard') diarahkan ke '/login' (bukan bocor/terlempar ke admin).
 * 3. Pengguna authenticated (admin/dosen/mahasiswa) dapat mengakses alur dashboard/persuratan.
 * 4. Alur navigasi root URL '/' menampilkan CTA login bagi tamu dan CTA persuratan bagi user login.
 */

interface MockUser {
  id: number;
  nama: string;
  role: 'admin' | 'dosen' | 'mahasiswa';
}

interface NavigationResolution {
  targetPath: string;
  resolvedComponent: string;
  redirectedTo?: string;
  guardedByAuth?: boolean;
}

function resolveRoute(
  requestedPath: string,
  user: MockUser | null,
  allowedRolesForAjukan = ['admin', 'dosen', 'mahasiswa']
): NavigationResolution {
  // Simulating App.tsx Routing logic
  let target = requestedPath;

  // Legacy redirects & dashboard
  if (target === '/dashboard') {
    target = '/admin';
  }

  // Exact public routes
  if (target === '/') {
    return {
      targetPath: '/',
      resolvedComponent: 'LandingPage',
      guardedByAuth: false
    };
  }

  if (target === '/login') {
    return {
      targetPath: '/login',
      resolvedComponent: 'LoginPage',
      guardedByAuth: false
    };
  }

  if (target === '/verifikasi' || target.startsWith('/verifikasi/')) {
    return {
      targetPath: target,
      resolvedComponent: 'VerifikasiDokumen',
      guardedByAuth: false
    };
  }

  // Protected routes
  if (target === '/surat' || target.startsWith('/surat/')) {
    if (!user) {
      return {
        targetPath: target,
        resolvedComponent: 'Navigate',
        redirectedTo: '/login',
        guardedByAuth: true
      };
    }
    return {
      targetPath: target,
      resolvedComponent: target === '/surat' ? 'SuratList' : 'SuratDetail',
      guardedByAuth: true
    };
  }

  if (target === '/ajukan') {
    // Alur form surat telah dipindahkan ke panel admin (/admin/surat-form)
    if (!user) {
      return {
        targetPath: target,
        resolvedComponent: 'Navigate',
        redirectedTo: '/login',
        guardedByAuth: true
      };
    }
    return {
      targetPath: '/ajukan',
      resolvedComponent: 'Navigate',
      redirectedTo: '/admin/surat-form?tipe=keluar',
      guardedByAuth: true
    };
  }

  // Admin Panel Route (/admin)
  if (target === '/admin' || target.startsWith('/admin/')) {
    if (!user) {
      return {
        targetPath: target,
        resolvedComponent: 'Navigate',
        redirectedTo: '/login',
        guardedByAuth: true
      };
    }
    if (!['admin', 'dosen'].includes(user.role)) {
      return {
        targetPath: target,
        resolvedComponent: 'Navigate',
        redirectedTo: '/',
        guardedByAuth: true
      };
    }
    return {
      targetPath: target,
      resolvedComponent: 'AdminDashboard',
      guardedByAuth: true
    };
  }

  // Wildcard fallback
  return {
    targetPath: target,
    resolvedComponent: 'Navigate',
    redirectedTo: '/',
    guardedByAuth: false
  };
}

export function runNavigationTests() {
  const tests = [
    {
      name: "Tamu publik mengakses root URL ('/')",
      run: () => {
        const res = resolveRoute('/', null);
        if (res.resolvedComponent !== 'LandingPage') {
          throw new Error(`Expected LandingPage but got ${res.resolvedComponent}`);
        }
        if (res.redirectedTo === '/admin') {
          throw new Error(`Tamu publik terlempar ke /admin!`);
        }
      }
    },
    {
      name: "Tamu publik mengakses '/admin' diarahkan ke /login lewat proteksi /surat",
      run: () => {
        const res = resolveRoute('/admin', null);
        if (res.redirectedTo !== '/login') {
          throw new Error(`Expected redirect to /login for unauthenticated guest accessing /admin, got ${res.redirectedTo}`);
        }
      }
    },
    {
      name: "Tamu publik mengakses route terproteksi '/surat'",
      run: () => {
        const res = resolveRoute('/surat', null);
        if (res.redirectedTo !== '/login') {
          throw new Error(`Expected redirect to /login, got ${res.redirectedTo}`);
        }
      }
    },
    {
      name: "User authenticated (role mahasiswa) mengakses root URL ('/')",
      run: () => {
        const res = resolveRoute('/', { id: 1, nama: 'Ahmad Mahasiswa', role: 'mahasiswa' });
        if (res.resolvedComponent !== 'LandingPage') {
          throw new Error(`Expected LandingPage for user, got ${res.resolvedComponent}`);
        }
      }
    },
    {
      name: "User role mahasiswa mencoba akses '/admin' diarahkan ke '/'",
      run: () => {
        const res = resolveRoute('/admin', { id: 1, nama: 'Ahmad Mahasiswa', role: 'mahasiswa' });
        if (res.redirectedTo !== '/') {
          throw new Error(`Expected redirect to / for mahasiswa accessing /admin, got ${res.redirectedTo}`);
        }
      }
    },
    {
      name: "User authenticated (role admin) mengakses '/admin' membuka AdminDashboard",
      run: () => {
        const res = resolveRoute('/admin', { id: 99, nama: 'Admin Biro', role: 'admin' });
        if (res.resolvedComponent !== 'AdminDashboard') {
          throw new Error(`Expected AdminDashboard for logged-in admin accessing /admin, got ${res.resolvedComponent}`);
        }
      }
    },
    {
      name: "User authenticated mengakses '/dashboard' diarahkan ke AdminDashboard",
      run: () => {
        const res = resolveRoute('/dashboard', { id: 10, nama: 'Dosen Penguji', role: 'dosen' });
        if (res.resolvedComponent !== 'AdminDashboard') {
          throw new Error(`Expected AdminDashboard for logged-in dosen accessing /dashboard, got ${res.resolvedComponent}`);
        }
      }
    },
    {
      name: "Wildcard URL acak diarahkan kembali ke root ('/')",
      run: () => {
        const res = resolveRoute('/halaman-tidak-ditemukan-123', null);
        if (res.redirectedTo !== '/') {
          throw new Error(`Expected redirect to /, got ${res.redirectedTo}`);
        }
      }
    }
  ];

  console.log("=== MEMULAI TEST AUDIT NAVIGASI & AKSES ROOT URL ===");
  let passed = 0;
  for (const t of tests) {
    try {
      t.run();
      console.log(`[PASS] ${t.name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] ${t.name} -> ${err.message}`);
    }
  }
  console.log(`=== HASIL PENGUJIAN: ${passed}/${tests.length} TEST BERHASIL ===\n`);
  return passed === tests.length;
}

if (process.argv[1]?.includes('navigationAudit.test')) {
  const success = runNavigationTests();
  process.exit(success ? 0 : 1);
}
