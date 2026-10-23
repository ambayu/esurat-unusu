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

  console.log("Seeding data E-Surat UNUSU selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
