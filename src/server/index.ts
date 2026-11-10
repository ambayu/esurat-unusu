import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5002;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Serve static frontend build files in production
const clientDistPath = path.resolve(process.cwd(), "dist/client");
const publicPath = path.resolve(process.cwd(), "public");
const uploadsPath = path.resolve(process.cwd(), "uploads");

// Pastikan direktori fisik uploads (berkas & foto) tersedia untuk static serving
const ensureDirectories = () => {
  const dirs = [
    uploadsPath,
    path.join(uploadsPath, "berkas"),
    path.join(uploadsPath, "foto"),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
};
ensureDirectories();

// Static assets & uploads serving
app.use(express.static(clientDistPath));
app.use("/esurat", express.static(clientDistPath));
app.use("/public", express.static(publicPath));
app.use("/uploads", express.static(uploadsPath));
app.use("/assets", express.static(path.join(clientDistPath, "assets")));
app.use("/images", express.static(path.join(publicPath, "images")));
app.use("/berkas", express.static(path.join(uploadsPath, "berkas")));
app.use("/foto", express.static(path.join(uploadsPath, "foto")));

// Subpath alias untuk static assets saat diakses via prefix /esurat/
app.use("/esurat/public", express.static(publicPath));
app.use("/esurat/uploads", express.static(uploadsPath));
app.use("/esurat/assets", express.static(path.join(clientDistPath, "assets")));
app.use("/esurat/images", express.static(path.join(publicPath, "images")));
app.use("/esurat/berkas", express.static(path.join(uploadsPath, "berkas")));
app.use("/esurat/foto", express.static(path.join(uploadsPath, "foto")));

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", app: "E-Surat UNUSU API", time: new Date().toISOString() });
});

// ==========================================
// SSO ONE UNUSU : satu pintu, tanpa login lokal
// ==========================================
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET belum diset di environment. Server dihentikan demi keamanan.");
  process.exit(1);
}
const SSO_BASE_URL = process.env.SSO_BASE_URL || "http://localhost:5000";
const SSO_CLIENT_ID = process.env.SSO_CLIENT_ID || "e538eac90fb83578";
const SSO_CLIENT_KEY = process.env.SSO_CLIENT_KEY || "";

interface SsoUserPayload {
  id: number;
  username: string;
  nama: string;
  email?: string | null;
  role: string;
  nim?: string | null;
  nidn?: string | null;
  fakultas?: string | null;
  prodi?: string | null;
}

interface SsoSession {
  id: number;
  username: string;
  nama: string;
  email: string | null;
  role: string;
  ssoRole: string;
  nim: string | null;
  nidn: string | null;
  prodi: string | null;
  fakultas: string | null;
}

interface AuthRequest extends Request {
  user?: SsoSession;
}

const SSO_ROLE_MAP: Record<string, string> = {
  SUPERADMIN: "admin",
  ADMIN_ESURAT: "admin",
  DOSEN: "dosen",
  MAHASISWA: "mahasiswa",
};

/** Role SSO yang diizinkan mengakses panel E-Surat (Admin, Dosen, & Mahasiswa) */
const ALLOWED_SSO_ROLES = new Set(["SUPERADMIN", "ADMIN_ESURAT", "DOSEN", "MAHASISWA"]);

const mapSsoRole = (role: string): string => SSO_ROLE_MAP[role] ?? "mahasiswa";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Verifikasi keaslian dokumen lewat QR tetap publik (tidak memuat data sesi).
  if (req.path.startsWith("/verifikasi/")) {
    return next();
  }

  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Token otentikasi tidak disediakan" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    (req as AuthRequest).user = {
      id: Number(decoded.id),
      username: String(decoded.username ?? ""),
      nama: String(decoded.nama ?? ""),
      email: typeof decoded.email === "string" ? decoded.email : null,
      role: String(decoded.role ?? "mahasiswa"),
      ssoRole: String(decoded.ssoRole ?? ""),
      nim: typeof decoded.nim === "string" ? decoded.nim : null,
      nidn: typeof decoded.nidn === "string" ? decoded.nidn : null,
      prodi: typeof decoded.prodi === "string" ? decoded.prodi : null,
      fakultas: typeof decoded.fakultas === "string" ? decoded.fakultas : null,
    };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Sesi login telah kedaluwarsa" });
  }
};

// Verifikasi token SSO sekali-pakai lalu terbitkan sesi lokal
app.post("/api/auth/sso", async (req: Request, res: Response) => {
  try {
    const { client_id, token } = req.body ?? {};

    if (!client_id || !token) {
      return res.status(400).json({ success: false, message: "client_id dan token wajib diisi" });
    }
    if (client_id !== SSO_CLIENT_ID) {
      return res.status(400).json({ success: false, message: "Client ID tidak cocok dengan aplikasi ini" });
    }
    if (!SSO_CLIENT_KEY) {
      return res.status(500).json({ success: false, message: "SSO_CLIENT_KEY belum dikonfigurasi di server" });
    }

    const ssoResponse = await fetch(`${SSO_BASE_URL}/api/v2/website/verify-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: SSO_CLIENT_ID, client_key: SSO_CLIENT_KEY, token }),
    });

    const ssoPayload = (await ssoResponse.json().catch(() => null)) as
      | { status?: boolean; message?: string; data?: { user?: SsoUserPayload } }
      | null;
    const ssoUser = ssoPayload?.data?.user;

    if (!ssoResponse.ok || !ssoPayload?.status || !ssoUser) {
      return res.status(401).json({ success: false, message: ssoPayload?.message || "Verifikasi token SSO gagal" });
    }

    // Tolak login jika role SSO tidak diizinkan di E-Surat
    if (!ALLOWED_SSO_ROLES.has(ssoUser.role)) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Pengguna tidak memiliki hak akses ke panel E-Surat.",
      });
    }

    // Ambil/Buat record pengguna lokal di tabel users E-Surat
    let localUser = await db.user.findFirst({
      where: {
        OR: [
          { username: ssoUser.username },
          ...(ssoUser.email ? [{ email: ssoUser.email }] : []),
        ],
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    const ssoRoles = Array.isArray((ssoUser as any).roles)
      ? (ssoUser as any).roles
      : ssoUser.role
      ? [ssoUser.role]
      : [];

    if (!localUser) {
      // Auto-provisioning akun lokal di E-Surat
      let defaultRoleCode = "dosen";
      if (ssoRoles.includes("SUPERADMIN") || ssoRoles.includes("ADMIN_ESURAT")) {
        defaultRoleCode = "admin";
      } else if (ssoRoles.includes("MAHASISWA")) {
        defaultRoleCode = "mahasiswa";
      }

      const roleDb = await db.role.findFirst({
        where: {
          OR: [{ code: defaultRoleCode }, { code: defaultRoleCode.toUpperCase() }],
        },
      });

      localUser = await db.user.create({
        data: {
          username: ssoUser.username,
          nama: ssoUser.nama,
          email: ssoUser.email || null,
          nim: ssoUser.nim || null,
          nidn: ssoUser.nidn || null,
          prodi: ssoUser.prodi || null,
          fakultas: ssoUser.fakultas || null,
          isActive: true,
          ...(roleDb
            ? {
                userRoles: {
                  create: [{ roleId: roleDb.id }],
                },
              }
            : {}),
        },
        include: {
          userRoles: {
            include: { role: true },
          },
        },
      });
    }

    const localRoleCodes = localUser.userRoles?.map((ur: any) => ur.role.code.toLowerCase()) || [];
    const primaryRole = localRoleCodes.includes("admin")
      ? "admin"
      : localRoleCodes[0] || mapSsoRole(ssoUser.role);

    const sessionUser: SsoSession = {
      id: localUser.id,
      username: ssoUser.username,
      nama: ssoUser.nama,
      email: ssoUser.email ?? null,
      role: primaryRole,
      ssoRole: ssoUser.role,
      nim: ssoUser.nim ?? null,
      nidn: ssoUser.nidn ?? null,
      prodi: ssoUser.prodi ?? null,
      fakultas: ssoUser.fakultas ?? null,
    };

    const userPermissions = await getUserPermissionKeys(localUser.id, primaryRole);

    const tokenJwt = jwt.sign(
      {
        ...sessionUser,
        roles: localRoleCodes,
        permissions: userPermissions,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token: tokenJwt,
      user: { ...sessionUser, roles: localRoleCodes, permissions: userPermissions },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal memproses SSO: " + error?.message });
  }
});

// Endpoint bypass pengujian lokal / demo admin (dinonaktifkan - login via SSO ONE UNUSU terpusat)
// app.post("/api/auth/dev-admin", async (_req: Request, res: Response) => { ... });

/**
 * Penjaga jalur masuk tunggal (SSO-only).
 *
 * E-Surat UNUSU tidak lagi menyediakan formulir kata sandi lokal maupun
 * pintasan "Masuk Cepat sebagai Admin". Permintaan ke endpoint login lama
 * dijawab tegas 410 Gone agar tidak ada jalur sesi yang lahir tanpa tiket SSO.
 */
const SSO_ONLY_MESSAGE =
  "Login lokal dinonaktifkan. Silakan masuk melalui SSO ONE UNUSU di /authorize?client_id=" + SSO_CLIENT_ID;

app.all(["/api/auth/login", "/api/auth/dev-admin", "/api/auth/admin-login", "/api/auth/quick-login"], (_req: Request, res: Response) => {
  res.status(410).json({ success: false, code: "SSO_ONLY", message: SSO_ONLY_MESSAGE });
});

// Seluruh API di bawah ini wajib membawa JWT sesi lokal (hasil SSO).
app.use("/api", authenticate);

/** Middleware otorisasi berbasis role */
const requireRole = (...allowed: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const role = (req as AuthRequest).user?.role;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda tidak memiliki izin untuk operasi ini.",
      });
    }
    next();
  };

// Helper: Ambil seluruh permission key yang dimiliki oleh user
async function getUserPermissionKeys(userId: number, roleCode: string): Promise<string[]> {
  try {
    const db = prisma as any;
    const keys = new Set<string>();

    if (db.user && db.user.findUnique) {
      const userWithRoles = await db.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (userWithRoles?.userRoles) {
        for (const ur of userWithRoles.userRoles) {
          for (const rp of ur.role.permissions) {
            keys.add(rp.permission.key);
          }
        }
      }
    }

    if (db.role && db.role.findFirst) {
      const roleRecord = await db.role.findFirst({
        where: {
          OR: [
            { code: roleCode },
            { code: roleCode.toUpperCase() },
            { code: roleCode.toLowerCase() },
          ],
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (roleRecord?.permissions) {
        for (const rp of roleRecord.permissions) {
          keys.add(rp.permission.key);
        }
      }
    }

    // Default permissions untuk stabilitas hak akses
    if (roleCode === 'admin' || roleCode === 'SUPERADMIN' || roleCode === 'ADMIN_ESURAT') {
      keys.add('surat:menu');
      keys.add('surat:view');
      keys.add('surat:edit');
      keys.add('surat:delete');
      keys.add('disposisi:menu');
      keys.add('disposisi:create');
      keys.add('jenis_surat:menu');
      keys.add('jenis_surat:create');
      keys.add('jenis_surat:edit');
      keys.add('jenis_surat:delete');
      keys.add('rbac:menu');
      keys.add('rbac:view');
      keys.add('rbac:edit');
      keys.add('rbac:delete');
    } else if (roleCode === 'dosen') {
      keys.add('surat:menu');
      keys.add('surat:view');
      keys.add('surat:edit');
      keys.add('disposisi:menu');
    }

    return Array.from(keys);
  } catch {
    return [];
  }
}

/** Middleware verifikasi permission spesifik */
const requirePermission = (permissionKey: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Sesi tidak valid" });
    }

    // Admin selalu lolos
    if (user.role === 'admin' || user.ssoRole === 'SUPERADMIN' || user.ssoRole === 'ADMIN_ESURAT') {
      return next();
    }

    const permissions = await getUserPermissionKeys(user.id, user.role);
    if (!permissions.includes(permissionKey)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Anda tidak memiliki izin '${permissionKey}'.`,
      });
    }

    next();
  };

// 1.0 Ringkasan Statistik Persuratan (Admin / Staff)
app.get("/api/admin/stats", requireRole("admin", "dosen"), async (req: Request, res: Response) => {
  try {
    const [
      totalSurat,
      suratMasuk,
      suratKeluar,
      totalDisposisi,
      statusDiajukan,
      statusDiproses,
      statusDisetujui,
      statusSelesai,
      statusDitolak,
      disposisiMenunggu,
      disposisiDiproses,
      disposisiSelesai,
      recentSurat,
      recentDisposisi,
    ] = await Promise.all([
      prisma.surat.count(),
      prisma.surat.count({ where: { tipeSurat: "masuk" } }),
      prisma.surat.count({ where: { tipeSurat: "keluar" } }),
      prisma.disposisi.count(),
      prisma.surat.count({ where: { status: "diajukan" } }),
      prisma.surat.count({ where: { status: "diproses" } }),
      prisma.surat.count({ where: { status: "disetujui" } }),
      prisma.surat.count({ where: { status: "selesai" } }),
      prisma.surat.count({ where: { status: "ditolak" } }),
      prisma.disposisi.count({ where: { status: "menunggu" } }),
      prisma.disposisi.count({ where: { status: "diproses" } }),
      prisma.disposisi.count({ where: { status: "selesai" } }),
      prisma.surat.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          jenisSurat: true,
        },
      }),
      prisma.disposisi.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          surat: true,
          keUnit: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        surat: {
          total: totalSurat,
          masuk: suratMasuk,
          keluar: suratKeluar,
          pending: statusDiajukan,
          diproses: statusDiproses,
          disetujui: statusDisetujui,
          selesai: statusSelesai,
          ditolak: statusDitolak,
        },
        disposisi: {
          total: totalDisposisi,
          menunggu: disposisiMenunggu,
          diproses: disposisiDiproses,
          selesai: disposisiSelesai,
        },
        recentSurat,
        recentDisposisi,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal mengambil data statistik admin: " + error?.message });
  }
});

// 1. Jenis Surat List
app.get("/api/jenis-surat", async (req: Request, res: Response) => {
  try {
    const list = await prisma.jenisSurat.findMany({
      include: {
        _count: {
          select: { suratList: true }
        }
      },
      orderBy: { nama: "asc" },
    });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil jenis surat" });
  }
});

// 1.1 CRUD Master Jenis Surat & Template Format (Admin Only)
app.post("/api/jenis-surat", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { kode, nama, formatNo, peruntukan } = req.body;
    if (!kode || !nama || !formatNo) {
      return res.status(400).json({ success: false, message: "Kode, nama, dan format nomor surat wajib diisi" });
    }

    const existing = await prisma.jenisSurat.findUnique({ where: { kode: String(kode).toUpperCase().trim() } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Kode surat ${kode} sudah digunakan` });
    }

    const created = await prisma.jenisSurat.create({
      data: {
        kode: String(kode).toUpperCase().trim(),
        nama: String(nama).trim(),
        formatNo: String(formatNo).trim(),
        peruntukan: peruntukan || "Mahasiswa",
      }
    });

    res.json({ success: true, data: created, message: "Jenis surat & template berhasil ditambahkan" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal menambahkan jenis surat: " + error?.message });
  }
});

app.put("/api/jenis-surat/:id", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { kode, nama, formatNo, peruntukan } = req.body;

    const existing = await prisma.jenisSurat.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Jenis surat tidak ditemukan" });
    }

    // Jika kode diubah, periksa keunikan
    if (kode && kode.toUpperCase().trim() !== existing.kode) {
      const duplicate = await prisma.jenisSurat.findUnique({ where: { kode: String(kode).toUpperCase().trim() } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Kode surat ${kode} sudah digunakan jenis surat lain` });
      }
    }

    const updated = await prisma.jenisSurat.update({
      where: { id },
      data: {
        ...(kode ? { kode: String(kode).toUpperCase().trim() } : {}),
        ...(nama ? { nama: String(nama).trim() } : {}),
        ...(formatNo ? { formatNo: String(formatNo).trim() } : {}),
        ...(peruntukan ? { peruntukan: String(peruntukan).trim() } : {}),
      }
    });

    res.json({ success: true, data: updated, message: "Jenis surat & template berhasil diperbarui" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal memperbarui jenis surat: " + error?.message });
  }
});

app.delete("/api/jenis-surat/:id", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // Lindungi relasi cascade: Cek apakah masih ada surat terbit yang menggunakan jenis surat ini
    const suratCount = await prisma.surat.count({ where: { jenisId: id } });
    if (suratCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus jenis surat ini karena terdapat ${suratCount} arsip surat yang merujuk padanya.`
      });
    }

    await prisma.jenisSurat.delete({ where: { id } });
    res.json({ success: true, message: "Jenis surat berhasil dihapus" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal menghapus jenis surat: " + error?.message });
  }
});

// 2. Daftar Surat (Bisa filter by status / pemohonId / search, dilengkapi Pagination)
app.get("/api/surat", async (req: Request, res: Response) => {
  try {
    const { pemohonId, status, tipe, search, page, limit } = req.query;
    const where: any = {};
    if (pemohonId) where.pemohonId = String(pemohonId);
    if (status && status !== 'all') where.status = String(status);
    if (tipe && tipe !== 'all') where.tipeSurat = String(tipe);
    if (search && String(search).trim() !== '') {
      const q = String(search).trim();
      where.OR = [
        { perihal: { contains: q } },
        { pemohonNama: { contains: q } },
        { pemohonProdi: { contains: q } },
        { nomorAgenda: { contains: q } },
        { nomorSurat: { contains: q } },
      ];
    }

    const pageNum = page ? Math.max(1, parseInt(String(page), 10) || 1) : 1;
    const pageSize = limit ? Math.max(1, parseInt(String(limit), 10) || 10) : 10;
    const isPaginated = Boolean(page || limit);

    const total = await prisma.surat.count({ where });

    const queryOptions: any = {
      where,
      include: {
        jenisSurat: true,
        disposisiList: {
          include: { keUnit: true }
        }
      },
      orderBy: { createdAt: "desc" }
    };

    if (isPaginated) {
      queryOptions.skip = (pageNum - 1) * pageSize;
      queryOptions.take = pageSize;
    }

    const suratList = await prisma.surat.findMany(queryOptions);

    res.json({
      success: true,
      data: suratList,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
        hasNextPage: pageNum * pageSize < total,
        hasPrevPage: pageNum > 1,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil daftar surat" });
  }
});

// 3. Detail Surat
app.get("/api/surat/:id", requirePermission("surat:view"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const surat = await prisma.surat.findUnique({
      where: { id },
      include: {
        jenisSurat: true,
        disposisiList: {
          include: { keUnit: true }
        }
      }
    });

    if (!surat) {
      return res.status(404).json({ success: false, message: "Surat tidak ditemukan" });
    }

    res.json({ success: true, data: surat });
  } catch (error) {
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
});

// 4. Pengajuan Surat Baru (Admin & Dosen untuk tata naskah internal/eksternal)
app.post("/api/surat", requireRole("admin", "dosen"), async (req: Request, res: Response) => {
  try {
    const { jenisId, pemohonNama, pemohonId, pemohonProdi, perihal, keperluan, tipeSurat, lampiranUrl } = req.body;
    
    // Generate nomor agenda acak sederhana
    const count = await prisma.surat.count();
    const prefix = tipeSurat === "masuk" ? "IN" : "REG";
    const agendaCode = `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
    const token = `UNUSU-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newSurat = await prisma.surat.create({
      data: {
        nomorAgenda: agendaCode,
        tipeSurat: tipeSurat === "masuk" ? "masuk" : "keluar",
        jenisId: Number(jenisId),
        pemohonNama,
        pemohonId: pemohonId || null,
        pemohonProdi: pemohonProdi || null,
        perihal,
        keperluan: keperluan || null,
        lampiranUrl: lampiranUrl || null,
        status: "diajukan",
        qrCodeToken: token,
      },
      include: {
        jenisSurat: true,
      }
    });

    res.json({ success: true, data: newSurat, message: "Pengajuan surat berhasil dikirim!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal membuat pengajuan surat" });
  }
});

// Helper untuk konversi angka bulan ke angka romawi
function toRomanMonth(monthIndex: number): string {
  const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return romans[monthIndex] || "I";
}

// 4.1 Generate Template Nomor Surat Resmi Otomatis (Admin Only)
app.get("/api/surat/:id/nomor-rekomendasi", requireRole("admin", "dosen"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const surat = await prisma.surat.findUnique({
      where: { id },
      include: { jenisSurat: true }
    });

    if (!surat) {
      return res.status(404).json({ success: false, message: "Surat tidak ditemukan" });
    }

    const countAll = await prisma.surat.count({ where: { nomorSurat: { not: null } } });
    const urutan = String(countAll + 1).padStart(3, "0");
    const now = new Date();
    const bulanRomawi = toRomanMonth(now.getMonth());
    const tahun = now.getFullYear();

    // Pola format standar dari template jenis surat atau default UNUSU
    let generatedNo = `${urutan}/UNUSU/${surat.jenisSurat?.kode || "SRT"}/${bulanRomawi}/${tahun}`;
    if (surat.jenisSurat?.formatNo) {
      generatedNo = surat.jenisSurat.formatNo
        .replace(/\{NO\}/g, urutan)
        .replace(/\{BULAN\}/g, bulanRomawi)
        .replace(/\{TAHUN\}/g, String(tahun))
        .replace(/\[nomor\]/gi, urutan)
        .replace(/\[bulan\]/gi, bulanRomawi)
        .replace(/\[tahun\]/gi, String(tahun));
    }

    res.json({
      success: true,
      data: {
        nomorSurat: generatedNo,
        formatTemplate: surat.jenisSurat?.formatNo || "{NO}/UNUSU/{KODE}/{BULAN}/{TAHUN}"
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal membuat rekomendasi nomor surat" });
  }
});

// 5. Update Status / Approval / Penolakan Surat (Admin / Tata Usaha)
app.put("/api/surat/:id/status", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, nomorSurat, signedBy, catatanPenolakan } = req.body;

    const data: any = { status };
    if (nomorSurat) data.nomorSurat = nomorSurat;
    if (signedBy) {
      data.signedBy = signedBy;
      data.signedAt = new Date();
    }
    if (catatanPenolakan) {
      data.keperluan = data.keperluan ? `${data.keperluan}\n[Catatan Admin: ${catatanPenolakan}]` : `[Catatan Admin: ${catatanPenolakan}]`;
    }

    const updated = await prisma.surat.update({
      where: { id },
      data,
      include: { jenisSurat: true }
    });

    res.json({ success: true, data: updated, message: `Status surat berhasil diperbarui menjadi ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memperbarui status surat" });
  }
});

// 5.1 Hapus Surat (Admin Only, Relational Protection)
app.delete("/api/surat/:id", requirePermission("surat:delete"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // Periksa keberadaan surat
    const surat = await prisma.surat.findUnique({
      where: { id },
      include: { disposisiList: true }
    });

    if (!surat) {
      return res.status(404).json({ success: false, message: "Surat tidak ditemukan" });
    }

    // Hapus surat beserta disposisi terkait
    await prisma.surat.delete({
      where: { id }
    });

    res.json({ success: true, message: "Arsip surat berhasil dihapus" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal menghapus surat: " + error?.message });
  }
});

// 6. Buat Disposisi Surat
app.post("/api/surat/:id/disposisi", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const suratId = parseInt(req.params.id);
    const { dariUnit, keUnitId, instruksi, catatan, deadline } = req.body;

    const disposisi = await prisma.disposisi.create({
      data: {
        suratId,
        dariUnit,
        keUnitId: Number(keUnitId),
        instruksi,
        catatan,
        status: "diproses",
        deadline: deadline ? new Date(deadline) : null,
      },
      include: {
        keUnit: true,
      }
    });

    // Update status surat jika masih 'diajukan'
    await prisma.surat.update({
      where: { id: suratId },
      data: { status: "diproses" }
    });

    res.json({ success: true, data: disposisi, message: "Disposisi berhasil dibuat!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal membuat disposisi" });
  }
});

// 7. Verifikasi Keaslian Dokumen via QR Token (Publik)
app.get("/api/verifikasi/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const surat = await prisma.surat.findUnique({
      where: { qrCodeToken: token },
      include: { jenisSurat: true }
    });

    if (!surat) {
      return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan atau tidak valid" });
    }

    res.json({ success: true, data: surat, isValid: surat.status === "selesai" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memverifikasi dokumen" });
  }
});

// 8. Master Unit Kerja
app.get("/api/unit-kerja", async (req: Request, res: Response) => {
  try {
    const units = await prisma.unitKerja.findMany({
      orderBy: { nama: "asc" }
    });
    res.json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil data unit kerja" });
  }
});

// ==========================================
// RBAC CRUD API: Pengguna, Peran, & Izin
// ==========================================
const db = prisma as any;

// Helper auto-seed default permission jika tabel masih kosong
async function ensureDefaultPermissions() {
  try {
    if (!db.permission) return;
    const count = await db.permission.count();
    if (count === 0) {
      const defaults = [
        { key: 'surat:menu', resource: 'Surat', action: 'menu', label: 'Akses Menu Agenda Surat' },
        { key: 'surat:view', resource: 'Surat', action: 'view', label: 'Lihat Detail & Dokumen Surat' },
        { key: 'surat:edit', resource: 'Surat', action: 'edit', label: 'Registrasi & Edit Naskah Surat' },
        { key: 'surat:delete', resource: 'Surat', action: 'delete', label: 'Hapus Arsip Surat' },
        { key: 'disposisi:menu', resource: 'Disposisi', action: 'menu', label: 'Akses Lembar Disposisi' },
        { key: 'disposisi:create', resource: 'Disposisi', action: 'edit', label: 'Terbitkan Instruksi Disposisi' },
        { key: 'jenis_surat:menu', resource: 'Jenis Surat', action: 'menu', label: 'Akses Menu Jenis Surat' },
        { key: 'jenis_surat:create', resource: 'Jenis Surat', action: 'edit', label: 'Tambah Template Jenis Surat' },
        { key: 'jenis_surat:edit', resource: 'Jenis Surat', action: 'edit', label: 'Ubah Template Jenis Surat' },
        { key: 'jenis_surat:delete', resource: 'Jenis Surat', action: 'delete', label: 'Hapus Master Jenis Surat' },
        { key: 'rbac:menu', resource: 'RBAC', action: 'menu', label: 'Akses Menu Pengguna & Peran' },
        { key: 'rbac:view', resource: 'RBAC', action: 'view', label: 'Lihat Data Pengguna & Hak Akses' },
        { key: 'rbac:edit', resource: 'RBAC', action: 'edit', label: 'Atur Peran & Permission Mapping' },
        { key: 'rbac:delete', resource: 'RBAC', action: 'delete', label: 'Hapus Akun & Role' },
      ];
      for (const p of defaults) {
        await db.permission.create({ data: p });
      }
    }
  } catch (e) {
    console.error("Warning ensureDefaultPermissions:", e);
  }
}

// Inisialisasi default permissions di background
ensureDefaultPermissions();

// --- 1. Manajemen Izin (Permissions) ---
app.get("/api/admin/permissions", requireRole("admin"), async (_req: Request, res: Response) => {
  try {
    await ensureDefaultPermissions();
    const list = db.permission ? await db.permission.findMany({ orderBy: [{ resource: 'asc' }, { action: 'asc' }] }) : [];
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal mengambil data permission: " + error?.message });
  }
});

// --- 2. Manajemen Peran (Roles) & Mapping Permission ---
app.get("/api/admin/roles", requireRole("admin"), async (_req: Request, res: Response) => {
  try {
    if (!db.role) {
      return res.json({ success: true, data: [] });
    }
    const roles = await db.role.findMany({
      include: {
        permissions: {
          include: { permission: true }
        },
        _count: {
          select: { userRoles: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const formatted = roles.map((r: any) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      isSystem: r.isSystem,
      userCount: r._count?.userRoles || 0,
      permissionKeys: r.permissions?.map((p: any) => p.permission.key) || [],
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal mengambil daftar peran: " + error?.message });
  }
});

app.post("/api/admin/roles", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { code, name, description } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: "Kode dan nama peran wajib diisi" });
    }
    const cleanCode = String(code).trim().toUpperCase();
    const role = await db.role.create({
      data: {
        code: cleanCode,
        name: String(name).trim(),
        description: description ? String(description).trim() : null,
      }
    });
    res.json({ success: true, data: role, message: "Peran berhasil ditambahkan" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal membuat peran: " + error?.message });
  }
});

app.put("/api/admin/roles/:id", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description } = req.body;
    const role = await db.role.update({
      where: { id },
      data: {
        ...(name && { name: String(name).trim() }),
        ...(description !== undefined && { description: description ? String(description).trim() : null }),
      }
    });
    res.json({ success: true, data: role, message: "Data peran berhasil diperbarui" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal memperbarui peran: " + error?.message });
  }
});

app.delete("/api/admin/roles/:id", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const role = await db.role.findUnique({ where: { id } });
    if (!role) {
      return res.status(404).json({ success: false, message: "Peran tidak ditemukan" });
    }
    if (role.isSystem) {
      return res.status(400).json({ success: false, message: "Peran sistem bawaan tidak dapat dihapus" });
    }
    await db.role.delete({ where: { id } });
    res.json({ success: true, message: "Peran berhasil dihapus" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal menghapus peran: " + error?.message });
  }
});

// Update permission mapping per role
app.put("/api/admin/roles/:id/permissions", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.id, 10);
    const { permissionKeys } = req.body;

    if (!Array.isArray(permissionKeys)) {
      return res.status(400).json({ success: false, message: "permissionKeys harus berupa array" });
    }

    // Cari permission records
    const permissions = await db.permission.findMany({
      where: { key: { in: permissionKeys } }
    });

    // Hapus relasi lama
    await db.rolePermission.deleteMany({
      where: { roleId }
    });

    // Masukkan relasi baru
    if (permissions.length > 0) {
      for (const p of permissions) {
        await db.rolePermission.create({
          data: {
            roleId,
            permissionId: p.id,
          }
        });
      }
    }

    res.json({
      success: true,
      message: "Pemetaan izin peran berhasil disimpan",
      data: { roleId, totalPermissions: permissions.length }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal menyimpan mapping izin: " + error?.message });
  }
});

// --- 3. Manajemen Pengguna (Users) & Role Assignment ---
app.get("/api/admin/users", requireRole("admin"), async (_req: Request, res: Response) => {
  try {
    if (!db.user) {
      return res.json({ success: true, data: [] });
    }
    const users = await db.user.findMany({
      include: {
        userRoles: {
          include: { role: true }
        }
      },
      orderBy: { nama: 'asc' }
    });

    const formatted = users.map((u: any) => ({
      id: u.id,
      username: u.username,
      nama: u.nama,
      email: u.email,
      nim: u.nim,
      nidn: u.nidn,
      prodi: u.prodi,
      fakultas: u.fakultas,
      isActive: u.isActive,
      roles: u.userRoles?.map((ur: any) => ({ id: ur.role.id, code: ur.role.code, name: ur.role.name })) || [],
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal mengambil daftar pengguna: " + error?.message });
  }
});

app.post("/api/admin/users", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { username, nama, email, nim, nidn, prodi, fakultas, roleIds } = req.body;
    if (!username || !nama) {
      return res.status(400).json({ success: false, message: "Username dan Nama wajib diisi" });
    }

    const newUser = await db.user.create({
      data: {
        username: String(username).trim(),
        nama: String(nama).trim(),
        email: email ? String(email).trim() : null,
        nim: nim ? String(nim).trim() : null,
        nidn: nidn ? String(nidn).trim() : null,
        prodi: prodi ? String(prodi).trim() : null,
        fakultas: fakultas ? String(fakultas).trim() : null,
        isActive: true,
      }
    });

    if (Array.isArray(roleIds) && roleIds.length > 0) {
      for (const rId of roleIds) {
        await db.userRole.create({
          data: {
            userId: newUser.id,
            roleId: Number(rId),
          }
        });
      }
    }

    res.json({ success: true, data: newUser, message: "Pengguna berhasil ditambahkan" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal membuat pengguna: " + error?.message });
  }
});

app.put("/api/admin/users/:id", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { isActive, roleIds } = req.body;

    const existingUser = await db.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan" });
    }

    const isTargetSuperadmin =
      existingUser.userRoles.some((ur: any) => ur.role.code === "SUPERADMIN") ||
      existingUser.username.toLowerCase() === "superadmin" ||
      existingUser.username.toLowerCase() === "admin";

    // Guard: Super Administrator tidak boleh dinonaktifkan
    if (isTargetSuperadmin && typeof isActive === "boolean" && !isActive) {
      return res.status(403).json({
        success: false,
        message: "Akun Super Administrator tidak dapat dinonaktifkan demi integritas sistem.",
      });
    }

    const updated = await db.user.update({
      where: { id },
      data: {
        ...(typeof isActive === 'boolean' && { isActive }),
      }
    });

    if (Array.isArray(roleIds)) {
      let finalRoleIds = [...roleIds].map((r: any) => Number(r));

      // Guard: Role SUPERADMIN tidak boleh dilepas jika user adalah superadmin
      if (isTargetSuperadmin) {
        const superRole = await db.role.findFirst({ where: { code: "SUPERADMIN" } });
        if (superRole && !finalRoleIds.includes(superRole.id)) {
          finalRoleIds.push(superRole.id);
        }
      }

      await db.userRole.deleteMany({ where: { userId: id } });
      for (const rId of finalRoleIds) {
        await db.userRole.create({
          data: {
            userId: id,
            roleId: Number(rId),
          }
        });
      }
    }

    res.json({ success: true, data: updated, message: "Data pengguna berhasil diperbarui" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal memperbarui pengguna: " + error?.message });
  }
});

app.delete("/api/admin/users/:id", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.user.delete({ where: { id } });
    res.json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal menghapus pengguna: " + error?.message });
  }
});

// ===========================================================================
// BANNER SLIDER HERO (E-SURAT UNUSU)
// ===========================================================================

// GET /api/sliders (Daftar slider hero aktif untuk halaman publik E-Surat)
app.get("/api/sliders", async (req: Request, res: Response) => {
  try {
    const sliders = await db.esuratBannerSlider.findMany({
      where: { active: true },
      orderBy: [{ urutan: "asc" }, { createdAt: "desc" }],
    });
    res.json({ success: true, data: sliders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil foto slider hero E-Surat." });
  }
});

// GET /api/admin/sliders (Seluruh foto slider hero termasuk non-aktif)
app.get("/api/admin/sliders", async (req: Request, res: Response) => {
  try {
    const sliders = await db.esuratBannerSlider.findMany({
      orderBy: [{ urutan: "asc" }, { createdAt: "desc" }],
    });
    res.json({ success: true, data: sliders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil daftar slider admin E-Surat." });
  }
});

// POST /api/admin/sliders (Tambah foto slider hero baru dengan upload langsung)
app.post("/api/admin/sliders", async (req: Request, res: Response) => {
  try {
    const { judul, subjudul, gambarUrl, gambarMobileUrl, linkUrl, urutan, active } = req.body;

    if (!judul || typeof judul !== "string" || !judul.trim()) {
      return res.status(400).json({ success: false, message: "Judul slider wajib diisi." });
    }
    if (!gambarUrl || typeof gambarUrl !== "string" || !gambarUrl.trim()) {
      return res.status(400).json({ success: false, message: "File foto slider desktop wajib diunggah." });
    }

    const created = await db.esuratBannerSlider.create({
      data: {
        judul: judul.trim(),
        subjudul: subjudul && typeof subjudul === "string" ? subjudul.trim() : null,
        gambarUrl: gambarUrl.trim(),
        gambarMobileUrl: gambarMobileUrl && typeof gambarMobileUrl === "string" ? gambarMobileUrl.trim() : null,
        linkUrl: linkUrl && typeof linkUrl === "string" ? linkUrl.trim() : null,
        urutan: Number.isInteger(Number(urutan)) ? Number(urutan) : 0,
        active: active === undefined ? true : Boolean(active),
      },
    });

    res.status(201).json({ success: true, message: "Foto slider hero E-Surat berhasil ditambahkan.", data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menyimpan foto slider E-Surat." });
  }
});

// PUT /api/admin/sliders/:id (Update foto slider hero)
app.put("/api/admin/sliders/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "ID slider tidak valid." });
    }

    const { judul, subjudul, gambarUrl, gambarMobileUrl, linkUrl, urutan, active } = req.body;

    const data: Record<string, unknown> = {};
    if (judul !== undefined) data.judul = String(judul).trim();
    if (subjudul !== undefined) data.subjudul = subjudul ? String(subjudul).trim() : null;
    if (gambarUrl !== undefined) data.gambarUrl = String(gambarUrl).trim();
    if (gambarMobileUrl !== undefined) data.gambarMobileUrl = gambarMobileUrl ? String(gambarMobileUrl).trim() : null;
    if (linkUrl !== undefined) data.linkUrl = linkUrl ? String(linkUrl).trim() : null;
    if (urutan !== undefined) data.urutan = Number(urutan) || 0;
    if (active !== undefined) data.active = Boolean(active);

    const updated = await db.esuratBannerSlider.update({
      where: { id },
      data,
    });

    res.json({ success: true, message: "Foto slider hero E-Surat berhasil diperbarui.", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memperbarui foto slider E-Surat." });
  }
});

// DELETE /api/admin/sliders/:id (Hapus foto slider hero)
app.delete("/api/admin/sliders/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "ID slider tidak valid." });
    }

    await db.esuratBannerSlider.delete({ where: { id } });
    res.json({ success: true, message: "Foto slider hero E-Surat berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menghapus foto slider E-Surat." });
  }
});

// Fallback all non-API routes to index.html (SPA History Fallback)
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
    if (err) {
      res.status(200).send("E-Surat UNUSU Server Running. Build the client using 'npm run build:client' to serve the UI.");
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 E-Surat UNUSU Monolith Server running on http://localhost:${PORT}`);
});

