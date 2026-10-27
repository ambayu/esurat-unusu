import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
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
app.use(express.static(clientDistPath));

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", app: "E-Surat UNUSU API", time: new Date().toISOString() });
});

// ==========================================
// SSO ONE UNUSU — satu pintu, tanpa login lokal
// ==========================================
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET belum diset di environment. Server dihentikan demi keamanan.");
  process.exit(1);
}
const SSO_BASE_URL = process.env.SSO_BASE_URL || "http://localhost:5000";
const SSO_CLIENT_ID = process.env.SSO_CLIENT_ID || "esurat-unusu";
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
  DOSEN: "dosen",
  MAHASISWA: "mahasiswa",
};

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

    const sessionUser: SsoSession = {
      id: ssoUser.id,
      username: ssoUser.username,
      nama: ssoUser.nama,
      email: ssoUser.email ?? null,
      role: mapSsoRole(ssoUser.role),
      ssoRole: ssoUser.role,
      nim: ssoUser.nim ?? null,
      nidn: ssoUser.nidn ?? null,
      prodi: ssoUser.prodi ?? null,
      fakultas: ssoUser.fakultas ?? null,
    };

    const tokenJwt = jwt.sign(sessionUser, JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token: tokenJwt, user: sessionUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Gagal memproses SSO: " + error?.message });
  }
});

// Seluruh API di bawah ini wajib membawa JWT sesi lokal (hasil SSO).
app.use("/api", authenticate);

// 1. Jenis Surat List
app.get("/api/jenis-surat", async (req: Request, res: Response) => {
  try {
    const list = await prisma.jenisSurat.findMany({
      orderBy: { nama: "asc" },
    });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil jenis surat" });
  }
});

// 2. Daftar Surat (Bisa filter by status / pemohonId)
app.get("/api/surat", async (req: Request, res: Response) => {
  try {
    const { pemohonId, status, tipe } = req.query;
    const where: any = {};
    if (pemohonId) where.pemohonId = String(pemohonId);
    if (status) where.status = String(status);
    if (tipe) where.tipeSurat = String(tipe);

    const suratList = await prisma.surat.findMany({
      where,
      include: {
        jenisSurat: true,
        disposisiList: {
          include: { keUnit: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ success: true, data: suratList });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil daftar surat" });
  }
});

// 3. Detail Surat
app.get("/api/surat/:id", async (req: Request, res: Response) => {
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

// 4. Pengajuan Surat Baru (Mahasiswa / Dosen)
app.post("/api/surat", async (req: Request, res: Response) => {
  try {
    const { jenisId, pemohonNama, pemohonId, pemohonProdi, perihal, keperluan } = req.body;
    
    // Generate nomor agenda acak sederhana
    const count = await prisma.surat.count();
    const agendaCode = `REG-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
    const token = `UNUSU-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newSurat = await prisma.surat.create({
      data: {
        nomorAgenda: agendaCode,
        tipeSurat: "keluar",
        jenisId: Number(jenisId),
        pemohonNama,
        pemohonId,
        pemohonProdi,
        perihal,
        keperluan,
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

// 5. Update Status / Approval Surat (Admin / Tata Usaha)
app.put("/api/surat/:id/status", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status, nomorSurat, signedBy } = req.body;

    const data: any = { status };
    if (nomorSurat) data.nomorSurat = nomorSurat;
    if (signedBy) {
      data.signedBy = signedBy;
      data.signedAt = new Date();
    }

    const updated = await prisma.surat.update({
      where: { id },
      data,
      include: { jenisSurat: true }
    });

    res.json({ success: true, data: updated, message: "Status surat berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memperbarui status surat" });
  }
});

// 6. Buat Disposisi Surat
app.post("/api/surat/:id/disposisi", async (req: Request, res: Response) => {
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
