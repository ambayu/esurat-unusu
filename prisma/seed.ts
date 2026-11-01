import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data E-Surat UNUSU...");

  // 1. Jenis Surat
  const jenisSka = await prisma.jenisSurat.upsert({
    where: { kode: "SKA" },
    update: {},
    create: {
      kode: "SKA",
      nama: "Surat Keterangan Aktif Kuliah",
      formatNo: "{NOMOR}/UNUSU/BAAK/KM/{BULAN}/{TAHUN}",
      peruntukan: "Mahasiswa",
    },
  });

  const jenisIzinRiset = await prisma.jenisSurat.upsert({
    where: { kode: "SR-TA" },
    update: {},
    create: {
      kode: "SR-TA",
      nama: "Surat Pengantar Riset Skripsi / Tugas Akhir",
      formatNo: "{NOMOR}/UNUSU/FAST/TA/{BULAN}/{TAHUN}",
      peruntukan: "Mahasiswa",
    },
  });

  const jenisSt = await prisma.jenisSurat.upsert({
    where: { kode: "ST" },
    update: {},
    create: {
      kode: "ST",
      nama: "Surat Tugas Dosen / Tenaga Kependidikan",
      formatNo: "{NOMOR}/UNUSU/RKT/KP/{BULAN}/{TAHUN}",
      peruntukan: "Dosen",
    },
  });

  // 2. Unit Kerja
  const rektorat = await prisma.unitKerja.upsert({
    where: { kode: "REKTORAT" },
    update: {},
    create: {
      kode: "REKTORAT",
      nama: "Kantor Rektorat UNUSU",
      pimpinan: "Prof. Dr. K.H. Syahrin Harahap, M.A.",
      jabatan: "Rektor",
    },
  });

  const baak = await prisma.unitKerja.upsert({
    where: { kode: "BAAK" },
    update: {},
    create: {
      kode: "BAAK",
      nama: "Biro Administrasi Akademik dan Kemahasiswaan",
      pimpinan: "Drs. H. M. Yusuf, M.Pd.",
      jabatan: "Kepala Biro",
    },
  });

  const fastek = await prisma.unitKerja.upsert({
    where: { kode: "FAST" },
    update: {},
    create: {
      kode: "FAST",
      nama: "Fakultas Sains dan Teknologi",
      pimpinan: "Dr. H. Muhammad Ilyas, M.Kom.",
      jabatan: "Dekan",
    },
  });

  // 3. Surat Contoh
  const surat1 = await prisma.surat.upsert({
    where: { nomorAgenda: "REG-2026-0001" },
    update: {},
    create: {
      nomorAgenda: "REG-2026-0001",
      nomorSurat: "045/UNUSU/BAAK/KM/X/2026",
      tipeSurat: "keluar",
      jenisId: jenisSka.id,
      pemohonNama: "Muhammad Fadhil",
      pemohonId: "230101001",
      pemohonProdi: "S1 Sistem Informasi",
      perihal: "Permohonan Surat Keterangan Aktif Kuliah untuk Beasiswa",
      keperluan: "Kelengkapan berkas pengajuan Beasiswa Prestasi Pemerintah Provinsi Sumatera Utara",
      status: "selesai",
      qrCodeToken: "UNUSU-VERIF-SKA-2026-FADHIL-884920",
      signedBy: "Drs. H. M. Yusuf, M.Pd.",
      signedAt: new Date(),
    },
  });

  const surat2 = await prisma.surat.upsert({
    where: { nomorAgenda: "REG-2026-0002" },
    update: {},
    create: {
      nomorAgenda: "REG-2026-0002",
      nomorSurat: null,
      tipeSurat: "keluar",
      jenisId: jenisIzinRiset.id,
      pemohonNama: "Aisyah Putri",
      pemohonId: "230101002",
      pemohonProdi: "S1 Sistem Informasi",
      perihal: "Permohonan Surat Izin Penelitian Tugas Akhir",
      keperluan: "Pengambilan data observasi skripsi di Dinas Kominfo Provinsi Sumatera Utara",
      status: "diproses",
      qrCodeToken: "UNUSU-VERIF-SRTA-2026-AISYAH-112349",
    },
  });

  // 4. Disposisi
  await prisma.disposisi.create({
    data: {
      suratId: surat2.id,
      dariUnit: "Dekan Fakultas Sains & Teknologi",
      keUnitId: baak.id,
      instruksi: "Mohon diverifikasi kelengkapan KRS semester berjalan dan cetak draf surat pengantar.",
      catatan: "Mahasiswa bersangkutan telah menyelesaikan seminar proposal.",
      status: "diproses",
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  // 5. Seed Permissions RBAC Granular (format: resource:action)
  console.log("Seeding Permissions & Role RBAC...");
  const permissionsList = [
    // Dashboard & Menu
    { key: "dashboard:menu", resource: "dashboard", action: "menu", label: "Akses Menu Dashboard" },
    { key: "dashboard:view", resource: "dashboard", action: "view", label: "Lihat Ringkasan & Statistik Dashboard" },

    // Surat Masuk
    { key: "surat-masuk:menu", resource: "surat-masuk", action: "menu", label: "Akses Menu Surat Masuk" },
    { key: "surat-masuk:view", resource: "surat-masuk", action: "view", label: "Lihat Daftar & Detail Surat Masuk" },
    { key: "surat-masuk:create", resource: "surat-masuk", action: "create", label: "Registrasi / Unggah Surat Masuk" },
    { key: "surat-masuk:edit", resource: "surat-masuk", action: "edit", label: "Perbarui Informasi Surat Masuk" },
    { key: "surat-masuk:delete", resource: "surat-masuk", action: "delete", label: "Hapus Arsip Surat Masuk" },

    // Surat Keluar
    { key: "surat-keluar:menu", resource: "surat-keluar", action: "menu", label: "Akses Menu Surat Keluar" },
    { key: "surat-keluar:view", resource: "surat-keluar", action: "view", label: "Lihat Daftar & Detail Surat Keluar" },
    { key: "surat-keluar:create", resource: "surat-keluar", action: "create", label: "Buat Pengajuan Surat Keluar" },
    { key: "surat-keluar:edit", resource: "surat-keluar", action: "edit", label: "Ubah / Edit Surat Keluar" },
    { key: "surat-keluar:delete", resource: "surat-keluar", action: "delete", label: "Hapus Arsip Surat Keluar" },

    // Disposisi Surat
    { key: "disposisi:menu", resource: "disposisi", action: "menu", label: "Akses Menu Disposisi" },
    { key: "disposisi:view", resource: "disposisi", action: "view", label: "Lihat Riwayat Disposisi Surat" },
    { key: "disposisi:create", resource: "disposisi", action: "create", label: "Buat Lembar Disposisi Baru" },
    { key: "disposisi:edit", resource: "disposisi", action: "edit", label: "Perbarui Status / Isi Disposisi" },
    { key: "disposisi:delete", resource: "disposisi", action: "delete", label: "Batalkan / Hapus Disposisi" },

    // Jenis Surat
    { key: "jenis-surat:menu", resource: "jenis-surat", action: "menu", label: "Akses Menu Jenis Surat" },
    { key: "jenis-surat:view", resource: "jenis-surat", action: "view", label: "Lihat Master Jenis Surat" },
    { key: "jenis-surat:create", resource: "jenis-surat", action: "create", label: "Tambah Jenis Surat Baru" },
    { key: "jenis-surat:edit", resource: "jenis-surat", action: "edit", label: "Ubah Konfigurasi Jenis Surat" },
    { key: "jenis-surat:delete", resource: "jenis-surat", action: "delete", label: "Hapus Jenis Surat" },

    // Unit Kerja
    { key: "unit-kerja:menu", resource: "unit-kerja", action: "menu", label: "Akses Menu Unit Kerja" },
    { key: "unit-kerja:view", resource: "unit-kerja", action: "view", label: "Lihat Master Unit Kerja" },
    { key: "unit-kerja:create", resource: "unit-kerja", action: "create", label: "Tambah Unit Kerja Baru" },
    { key: "unit-kerja:edit", resource: "unit-kerja", action: "edit", label: "Ubah Data Unit Kerja" },
    { key: "unit-kerja:delete", resource: "unit-kerja", action: "delete", label: "Hapus Unit Kerja" },

    // User Management
    { key: "user:menu", resource: "user", action: "menu", label: "Akses Menu Manajemen Pengguna" },
    { key: "user:view", resource: "user", action: "view", label: "Lihat Daftar Akun Pengguna" },
    { key: "user:create", resource: "user", action: "create", label: "Tambah Pengguna Baru" },
    { key: "user:edit", resource: "user", action: "edit", label: "Ubah Data & Status Pengguna" },
    { key: "user:delete", resource: "user", action: "delete", label: "Hapus Pengguna" },

    // Role Management
    { key: "role:menu", resource: "role", action: "menu", label: "Akses Menu Manajemen Role" },
    { key: "role:view", resource: "role", action: "view", label: "Lihat Daftar Role" },
    { key: "role:create", resource: "role", action: "create", label: "Tambah Role Baru" },
    { key: "role:edit", resource: "role", action: "edit", label: "Ubah Nama / Deskripsi Role" },
    { key: "role:delete", resource: "role", action: "delete", label: "Hapus Role" },

    // Permission Management
    { key: "permission:menu", resource: "permission", action: "menu", label: "Akses Menu Permission" },
    { key: "permission:view", resource: "permission", action: "view", label: "Lihat Daftar Permission" },
    { key: "permission:create", resource: "permission", action: "create", label: "Tambah Permission Baru" },
    { key: "permission:edit", resource: "permission", action: "edit", label: "Ubah Definisi Permission" },
    { key: "permission:delete", resource: "permission", action: "delete", label: "Hapus Permission" },
  ];

  const seededPermissions = [];
  for (const perm of permissionsList) {
    const p = await prisma.permission.upsert({
      where: { key: perm.key },
      update: {
        resource: perm.resource,
        action: perm.action,
        label: perm.label,
      },
      create: {
        key: perm.key,
        resource: perm.resource,
        action: perm.action,
        label: perm.label,
      },
    });
    seededPermissions.push(p);
  }

  // 6. Seed Roles
  const adminRole = await prisma.role.upsert({
    where: { code: "admin" },
    update: {
      name: "Administrator E-Surat",
      description: "Akses penuh seluruh modul persuratan, disposisi, dan konfigurasi RBAC",
      isSystem: true,
    },
    create: {
      code: "admin",
      name: "Administrator E-Surat",
      description: "Akses penuh seluruh modul persuratan, disposisi, dan konfigurasi RBAC",
      isSystem: true,
    },
  });

  const dosenRole = await prisma.role.upsert({
    where: { code: "dosen" },
    update: {
      name: "Dosen / Pimpinan Unit",
      description: "Akses permohonan surat tugas, disposisi, dan approval unit",
      isSystem: true,
    },
    create: {
      code: "dosen",
      name: "Dosen / Pimpinan Unit",
      description: "Akses permohonan surat tugas, disposisi, dan approval unit",
      isSystem: true,
    },
  });

  const mahasiswaRole = await prisma.role.upsert({
    where: { code: "mahasiswa" },
    update: {
      name: "Mahasiswa",
      description: "Pengajuan surat akademik (keterangan aktif, izin riset) dan pelacakan status",
      isSystem: true,
    },
    create: {
      code: "mahasiswa",
      name: "Mahasiswa",
      description: "Pengajuan surat akademik (keterangan aktif, izin riset) dan pelacakan status",
      isSystem: true,
    },
  });

  // 7. Hubungkan Permission ke Role (Default Hak Akses Admin = Semua Permission)
  for (const perm of seededPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Permission khusus untuk role Dosen
  const dosenPermKeys = [
    "dashboard:menu",
    "dashboard:view",
    "surat-masuk:menu",
    "surat-masuk:view",
    "surat-keluar:menu",
    "surat-keluar:view",
    "surat-keluar:create",
    "disposisi:menu",
    "disposisi:view",
    "disposisi:create",
    "disposisi:edit",
    "jenis-surat:view",
    "unit-kerja:view",
  ];
  for (const perm of seededPermissions.filter((p) => dosenPermKeys.includes(p.key))) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: dosenRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: dosenRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Permission khusus untuk role Mahasiswa
  const mahasiswaPermKeys = [
    "surat-keluar:menu",
    "surat-keluar:view",
    "surat-keluar:create",
    "jenis-surat:view",
  ];
  for (const perm of seededPermissions.filter((p) => mahasiswaPermKeys.includes(p.key))) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: mahasiswaRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: mahasiswaRole.id,
        permissionId: perm.id,
      },
    });
  }

  // 8. Seed Default Admin User & Relasi UserRole
  const adminUser = await prisma.user.upsert({
    where: { username: "admin_tu" },
    update: {
      nama: "Administrator Tata Usaha",
      email: "admin.tu@unusu.ac.id",
      isActive: true,
    },
    create: {
      username: "admin_tu",
      nama: "Administrator Tata Usaha",
      email: "admin.tu@unusu.ac.id",
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log("Seeding data E-Surat UNUSU & RBAC selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
