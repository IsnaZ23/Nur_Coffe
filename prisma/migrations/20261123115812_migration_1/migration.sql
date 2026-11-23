-- CreateTable
CREATE TABLE `detail_pesanan` (
    `id_detail` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pesanan` INTEGER NOT NULL,
    `id_menu` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL DEFAULT 1,
    `harga_satuan` INTEGER NOT NULL,
    `subtotal` INTEGER NOT NULL,
    `catatan_item` VARCHAR(255) NULL,

    INDEX `fk_detail_menu`(`id_menu`),
    INDEX `fk_detail_pesanan`(`id_pesanan`),
    PRIMARY KEY (`id_detail`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kategori` (
    `id_kategori` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_kategori` VARCHAR(50) NOT NULL,
    `urutan_tampil` INTEGER NOT NULL DEFAULT 0,
    `dibuat_pada` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `nama_kategori`(`nama_kategori`),
    PRIMARY KEY (`id_kategori`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meja` (
    `id_meja` INTEGER NOT NULL AUTO_INCREMENT,
    `nomor_meja` VARCHAR(10) NOT NULL,
    `kode_qr` VARCHAR(30) NOT NULL,
    `status_meja` ENUM('tersedia', 'terisi') NOT NULL DEFAULT 'tersedia',
    `dibuat_pada` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `nomor_meja`(`nomor_meja`),
    UNIQUE INDEX `kode_qr`(`kode_qr`),
    PRIMARY KEY (`id_meja`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu` (
    `id_menu` INTEGER NOT NULL AUTO_INCREMENT,
    `id_kategori` INTEGER NOT NULL,
    `nama_menu` VARCHAR(100) NOT NULL,
    `catatan_singkat` VARCHAR(100) NULL,
    `deskripsi` TEXT NULL,
    `harga` INTEGER NOT NULL,
    `gambar_menu` VARCHAR(255) NULL,
    `unggulan` BOOLEAN NOT NULL DEFAULT false,
    `tersedia` BOOLEAN NOT NULL DEFAULT true,
    `dibuat_pada` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `diperbarui_pada` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_menu_kategori`(`id_kategori`),
    PRIMARY KEY (`id_menu`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pesanan` (
    `id_pesanan` INTEGER NOT NULL AUTO_INCREMENT,
    `nomor_pesanan` VARCHAR(30) NOT NULL,
    `id_meja` INTEGER NOT NULL,
    `id_kasir` INTEGER NULL,
    `nama_pemesan` VARCHAR(100) NOT NULL,
    `catatan_pesanan` TEXT NULL,
    `total_harga` INTEGER NOT NULL DEFAULT 0,
    `metode_bayar` ENUM('qris', 'tunai') NOT NULL DEFAULT 'qris',
    `status_bayar` ENUM('menunggu_bayar', 'lunas') NOT NULL DEFAULT 'menunggu_bayar',
    `status_pesanan` ENUM('menunggu_bayar', 'diproses', 'siap_saji', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'menunggu_bayar',
    `dibuat_pada` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `diperbarui_pada` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `nomor_pesanan`(`nomor_pesanan`),
    INDEX `fk_pesanan_kasir`(`id_kasir`),
    INDEX `fk_pesanan_meja`(`id_meja`),
    PRIMARY KEY (`id_pesanan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kasir` (
    `id_kasir` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_kasir` VARCHAR(100) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `kata_sandi` VARCHAR(255) NOT NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `dibuat_pada` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `username`(`username`),
    PRIMARY KEY (`id_kasir`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `detail_pesanan` ADD CONSTRAINT `fk_det_menu` FOREIGN KEY (`id_menu`) REFERENCES `menu`(`id_menu`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_pesanan` ADD CONSTRAINT `fk_det_pesanan` FOREIGN KEY (`id_pesanan`) REFERENCES `pesanan`(`id_pesanan`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu` ADD CONSTRAINT `fk_menu_kategori` FOREIGN KEY (`id_kategori`) REFERENCES `kategori`(`id_kategori`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pesanan` ADD CONSTRAINT `fk_pesanan_kasir` FOREIGN KEY (`id_kasir`) REFERENCES `kasir`(`id_kasir`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pesanan` ADD CONSTRAINT `fk_pesanan_meja` FOREIGN KEY (`id_meja`) REFERENCES `meja`(`id_meja`) ON DELETE RESTRICT ON UPDATE CASCADE;
