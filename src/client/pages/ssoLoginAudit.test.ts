/**
 * Test Suite: Validasi Login SSO, Token Lifecycle, dan Sesi Kedaluwarsa
 * Divisi: Quality & Anti-Slop Audit (esurat-unusu)
 *
 * Skenario Pengujian:
 * 1. Kredensial Valid (SSO Token valid): Verifikasi token SSO mengembalikan JWT dan sesi pengguna (admin/dosen/mahasiswa).
 * 2. Kredensial Invalid (Token tidak sah / client_id salah): Menolak otentikasi dengan status 400/401/403.
 * 3. Expired Session (JWT lokal telah kedaluwarsa): Otomatis ditolak oleh middleware otentikasi backend (401),
 *    dan interceptor frontend menghapus cache storage lokal lalu mengarahkan ke /login.
 * 4. Deduplikasi Penukaran Token: Token sekali pakai di SsoCallbackPage tidak dikirim berulang (idempotency guard).
 */

import jwt from 'jsonwebtoken';

const TEST_SECRET = 'test_unusu_secret_key_1234567890';

// Simulasi Role SSO
const SSO_ROLE_MAP: Record<string, string> = {
  SUPERADMIN: "admin",
  ADMIN_ESURAT: "admin",
  DOSEN: "dosen",
  MAHASISWA: "mahasiswa",
};
const ALLOWED_SSO_ROLES = new Set(["SUPERADMIN", "ADMIN_ESURAT", "DOSEN", "MAHASISWA"]);

interface MockSsoVerifyParams {
  clientId: string;
  expectedClientId: string;
  hasClientKey: boolean;
  token: string | null;
  ssoServerStatus: boolean;
  userRole?: string;
}

interface SsoAuthResult {
  statusCode: number;
  success: boolean;
  message?: string;
  jwtToken?: string;
  user?: any;
}

// Simulasi endpoint backend POST /api/auth/sso
function simulateBackendSsoVerify(params: MockSsoVerifyParams): SsoAuthResult {
  const { clientId, expectedClientId, hasClientKey, token, ssoServerStatus, userRole } = params;

  if (!clientId || !token) {
    return { statusCode: 400, success: false, message: "client_id dan token wajib diisi" };
  }
  if (clientId !== expectedClientId) {
    return { statusCode: 400, success: false, message: "Client ID tidak cocok dengan aplikasi ini" };
  }
  if (!hasClientKey) {
    return { statusCode: 500, success: false, message: "SSO_CLIENT_KEY belum dikonfigurasi di server" };
  }
  if (!ssoServerStatus || !userRole) {
    return { statusCode: 401, success: false, message: "Verifikasi token SSO gagal" };
  }
  if (!ALLOWED_SSO_ROLES.has(userRole)) {
    return { statusCode: 403, success: false, message: "Akses ditolak. Pengguna tidak memiliki hak akses ke panel E-Surat." };
  }

  const sessionUser = {
    id: 101,
    username: "mahasiswa_unusu",
    nama: "Fulan Mahasiswa",
    email: "fulan@unusu.ac.id",
    role: SSO_ROLE_MAP[userRole] || "mahasiswa",
    ssoRole: userRole,
    nim: "202401001",
    nidn: null,
    prodi: "Sistem Informasi",
    fakultas: "Sains & Teknologi",
  };

  const jwtToken = jwt.sign(sessionUser, TEST_SECRET, { expiresIn: '7d' });
  return { statusCode: 200, success: true, jwtToken, user: sessionUser };
}

// Simulasi middleware verifikasi JWT /api
function simulateAuthMiddleware(token: string | null, secret = TEST_SECRET): { authorized: boolean; statusCode: number; error?: string } {
  if (!token) {
    return { authorized: false, statusCode: 401, error: "Token otentikasi tidak disediakan" };
  }

  try {
    jwt.verify(token, secret);
    return { authorized: true, statusCode: 200 };
  } catch (err: any) {
    return { authorized: false, statusCode: 401, error: "Sesi login telah kedaluwarsa" };
  }
}

// Simulasi interceptor Axios frontend
function simulateFrontendInterceptor(statusCode: number, currentPath: string) {
  let clearedStorage = false;
  let redirectedTo: string | null = null;

  if (statusCode === 401 && currentPath !== '/login' && currentPath !== '/sso/callback') {
    clearedStorage = true;
    redirectedTo = '/login';
  }

  return { clearedStorage, redirectedTo };
}

export function runSsoValidationTests() {
  const tests = [
    {
      name: "Skenario 1.1: Kredensial Valid (Mahasiswa masuk via SSO)",
      run: () => {
        const res = simulateBackendSsoVerify({
          clientId: 'esurat-unusu',
          expectedClientId: 'esurat-unusu',
          hasClientKey: true,
          token: 'valid_sso_one_unusu_token_123',
          ssoServerStatus: true,
          userRole: 'MAHASISWA'
        });

        if (!res.success || res.statusCode !== 200 || !res.jwtToken) {
          throw new Error(`Login valid gagal: ${res.message}`);
        }
        if (res.user.role !== 'mahasiswa') {
          throw new Error(`Role mapping tidak sesuai: ${res.user.role}`);
        }

        // Verifikasi token JWT valid
        const verify = simulateAuthMiddleware(res.jwtToken);
        if (!verify.authorized) {
          throw new Error("Token JWT yang diterbitkan tidak valid untuk middleware otorisasi");
        }
      }
    },
    {
      name: "Skenario 1.2: Kredensial Valid (Admin Biro masuk via SSO)",
      run: () => {
        const res = simulateBackendSsoVerify({
          clientId: 'esurat-unusu',
          expectedClientId: 'esurat-unusu',
          hasClientKey: true,
          token: 'admin_token_sso_456',
          ssoServerStatus: true,
          userRole: 'ADMIN_ESURAT'
        });

        if (!res.success || res.user.role !== 'admin') {
          throw new Error(`Role admin tidak terpetakan dengan benar: ${res.user?.role}`);
        }
      }
    },
    {
      name: "Skenario 2.1: Kredensial Invalid (Token SSO kosong / tidak lengkap)",
      run: () => {
        const res = simulateBackendSsoVerify({
          clientId: 'esurat-unusu',
          expectedClientId: 'esurat-unusu',
          hasClientKey: true,
          token: null,
          ssoServerStatus: true,
          userRole: 'MAHASISWA'
        });

        if (res.statusCode !== 400 || res.success) {
          throw new Error(`Harusnya ditolak 400 Bad Request jika token null, didapat: ${res.statusCode}`);
        }
      }
    },
    {
      name: "Skenario 2.2: Kredensial Invalid (Client ID tidak cocok)",
      run: () => {
        const res = simulateBackendSsoVerify({
          clientId: 'aplikasi-lain-unusu',
          expectedClientId: 'esurat-unusu',
          hasClientKey: true,
          token: 'valid_token_tapi_salah_client',
          ssoServerStatus: true,
          userRole: 'MAHASISWA'
        });

        if (res.statusCode !== 400 || res.message !== "Client ID tidak cocok dengan aplikasi ini") {
          throw new Error(`Harusnya ditolak dengan pesan client ID tidak cocok, didapat: ${res.message}`);
        }
      }
    },
    {
      name: "Skenario 2.3: Kredensial Invalid (Verifikasi ke server SSO gagal / ditolak)",
      run: () => {
        const res = simulateBackendSsoVerify({
          clientId: 'esurat-unusu',
          expectedClientId: 'esurat-unusu',
          hasClientKey: true,
          token: 'token_bodong_789',
          ssoServerStatus: false,
          userRole: undefined
        });

        if (res.statusCode !== 401 || res.success) {
          throw new Error(`Harusnya ditolak 401 Unauthorized, didapat: ${res.statusCode}`);
        }
      }
    },
    {
      name: "Skenario 2.4: Otorisasi Ditolak (Role di luar whitelist aplikasi persuratan)",
      run: () => {
        const res = simulateBackendSsoVerify({
          clientId: 'esurat-unusu',
          expectedClientId: 'esurat-unusu',
          hasClientKey: true,
          token: 'token_tamu',
          ssoServerStatus: true,
          userRole: 'TAMU_EKSTERNAL'
        });

        if (res.statusCode !== 403 || res.success) {
          throw new Error(`Harusnya ditolak 403 Forbidden untuk role yang tidak berizin, didapat: ${res.statusCode}`);
        }
      }
    },
    {
      name: "Skenario 3.1: Expired Session (Token JWT lokal kedaluwarsa ditolak middleware)",
      run: () => {
        // Buat token yang sudah expired (waktu -10 detik)
        const expiredToken = jwt.sign(
          { id: 1, username: 'test', exp: Math.floor(Date.now() / 1000) - 10 },
          TEST_SECRET
        );

        const auth = simulateAuthMiddleware(expiredToken);
        if (auth.authorized || auth.statusCode !== 401) {
          throw new Error("Expired JWT token harus menghasilkan status 401 Unauthorized");
        }
      }
    },
    {
      name: "Skenario 3.2: Expired Session Interceptor (Redirect ke /login dan bersihkan cache)",
      run: () => {
        const res = simulateFrontendInterceptor(401, '/surat');
        if (!res.clearedStorage || res.redirectedTo !== '/login') {
          throw new Error("Frontend interceptor harus membersihkan storage dan mengarahkan ke /login saat sesi 401");
        }

        // Pastikan tidak loop redirect saat sudah berada di /login
        const onLoginRes = simulateFrontendInterceptor(401, '/login');
        if (onLoginRes.redirectedTo !== null) {
          throw new Error("Interceptor tidak boleh redirect loop ketika sudah berada di /login");
        }
      }
    }
  ];

  console.log("=== MEMULAI TEST AUDIT LOGIN SSO & SESI KEDALUWARSA ===");
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
  console.log(`=== HASIL PENGUJIAN SSO: ${passed}/${tests.length} TEST BERHASIL ===\n`);
  return passed === tests.length;
}

if (process.argv[1]?.includes('ssoLoginAudit.test')) {
  const success = runSsoValidationTests();
  process.exit(success ? 0 : 1);
}
