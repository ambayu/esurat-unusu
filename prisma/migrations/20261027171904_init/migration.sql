-- CreateTable
CREATE TABLE `jenis_surat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(20) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `formatNo` VARCHAR(191) NOT NULL,
    `peruntukan` VARCHAR(191) NOT NULL DEFAULT 'Mahasiswa',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `jenis_surat_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unit_kerja` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(20) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `pimpinan` VARCHAR(191) NULL,
    `jabatan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `unit_kerja_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomorAgenda` VARCHAR(50) NOT NULL,
    `nomorSurat` VARCHAR(100) NULL,
    `tipeSurat` VARCHAR(20) NOT NULL DEFAULT 'keluar',
    `jenisId` INTEGER NOT NULL,
    `pemohonNama` VARCHAR(191) NOT NULL,
    `pemohonId` VARCHAR(191) NULL,
    `pemohonProdi` VARCHAR(191) NULL,
    `perihal` TEXT NOT NULL,
    `keperluan` TEXT NULL,
    `lampiranUrl` VARCHAR(191) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'diajukan',
    `qrCodeToken` VARCHAR(100) NOT NULL,
    `signedBy` VARCHAR(191) NULL,
    `signedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `surat_nomorAgenda_key`(`nomorAgenda`),
    UNIQUE INDEX `surat_nomorSurat_key`(`nomorSurat`),
    UNIQUE INDEX `surat_qrCodeToken_key`(`qrCodeToken`),
    INDEX `surat_tipeSurat_status_idx`(`tipeSurat`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `disposisi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `suratId` INTEGER NOT NULL,
    `dariUnit` VARCHAR(191) NOT NULL,
    `keUnitId` INTEGER NOT NULL,
    `instruksi` TEXT NOT NULL,
    `catatan` TEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'menunggu',
    `deadline` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `surat` ADD CONSTRAINT `surat_jenisId_fkey` FOREIGN KEY (`jenisId`) REFERENCES `jenis_surat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disposisi` ADD CONSTRAINT `disposisi_suratId_fkey` FOREIGN KEY (`suratId`) REFERENCES `surat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disposisi` ADD CONSTRAINT `disposisi_keUnitId_fkey` FOREIGN KEY (`keUnitId`) REFERENCES `unit_kerja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
