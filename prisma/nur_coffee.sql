-- ============================================================================
-- BASIS DATA NUR COFFEE (KONSEP RINGKAS: KASIR + PEMBELI QR MEJA 01-10)
-- ============================================================================

DROP DATABASE IF EXISTS nur_coffee;

CREATE DATABASE nur_coffee
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nur_coffee;

-- 1. Tabel Kasir (Login, Session, & Pengelola Pesanan + Menu)
CREATE TABLE kasir (
  id_kasir INT AUTO_INCREMENT PRIMARY KEY,
  nama_kasir VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  kata_sandi VARCHAR(255) NOT NULL,
  aktif TINYINT(1) NOT NULL DEFAULT 1,
  dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabel Kategori Menu (Coffee, Non Coffee, Dessert)
CREATE TABLE kategori (
  id_kategori INT AUTO_INCREMENT PRIMARY KEY,
  nama_kategori VARCHAR(50) NOT NULL UNIQUE,
  urutan_tampil INT NOT NULL DEFAULT 0,
  dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabel Menu (Dikelola Kasir: CRUD + Upload Gambar)
CREATE TABLE menu (
  id_menu INT AUTO_INCREMENT PRIMARY KEY,
  id_kategori INT NOT NULL,
  nama_menu VARCHAR(100) NOT NULL,
  catatan_singkat VARCHAR(100) NULL,
  deskripsi TEXT NULL,
  harga INT NOT NULL,
  gambar_menu VARCHAR(255) NULL,
  unggulan TINYINT(1) NOT NULL DEFAULT 0,
  tersedia TINYINT(1) NOT NULL DEFAULT 1,
  dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_menu_kategori
    FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4. Tabel Meja (Meja 01 sampai 10 untuk QR Meja)
CREATE TABLE meja (
  id_meja INT AUTO_INCREMENT PRIMARY KEY,
  nomor_meja VARCHAR(10) NOT NULL UNIQUE,
  kode_qr VARCHAR(30) NOT NULL UNIQUE,
  status_meja ENUM('tersedia', 'terisi') NOT NULL DEFAULT 'tersedia',
  dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Tabel Pesanan (Transaksi Checkout, Pembayaran, Struk, & Riwayat Order)
CREATE TABLE pesanan (
  id_pesanan INT AUTO_INCREMENT PRIMARY KEY,
  nomor_pesanan VARCHAR(30) NOT NULL UNIQUE,
  id_meja INT NOT NULL,
  id_kasir INT NULL,
  nama_pemesan VARCHAR(100) NOT NULL,
  catatan_pesanan TEXT NULL,
  total_harga INT NOT NULL DEFAULT 0,
  metode_bayar ENUM('qris', 'tunai') NOT NULL DEFAULT 'qris',
  status_bayar ENUM('menunggu_bayar', 'lunas') NOT NULL DEFAULT 'menunggu_bayar',
  status_pesanan ENUM('menunggu_bayar', 'diproses', 'siap_saji', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'menunggu_bayar',
  dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  diperbarui_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pesanan_meja
    FOREIGN KEY (id_meja) REFERENCES meja(id_meja)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pesanan_kasir
    FOREIGN KEY (id_kasir) REFERENCES kasir(id_kasir)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Tabel Detail Pesanan (Rincian Item per Pesanan & Struk)
CREATE TABLE detail_pesanan (
  id_detail INT AUTO_INCREMENT PRIMARY KEY,
  id_pesanan INT NOT NULL,
  id_menu INT NOT NULL,
  jumlah INT NOT NULL DEFAULT 1,
  harga_satuan INT NOT NULL,
  subtotal INT NOT NULL,
  catatan_item VARCHAR(255) NULL,
  CONSTRAINT fk_detail_pesanan
    FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_detail_menu
    FOREIGN KEY (id_menu) REFERENCES menu(id_menu)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================================
-- DATA AWAL (SEED): MEJA 01-10, KATEGORI, & CONTOH MENU
-- ============================================================================

INSERT INTO meja (nomor_meja, kode_qr, status_meja) VALUES
('01', 'meja-01', 'tersedia'),
('02', 'meja-02', 'tersedia'),
('03', 'meja-03', 'tersedia'),
('04', 'meja-04', 'tersedia'),
('05', 'meja-05', 'tersedia'),
('06', 'meja-06', 'tersedia'),
('07', 'meja-07', 'tersedia'),
('08', 'meja-08', 'tersedia'),
('09', 'meja-09', 'tersedia'),
('10', 'meja-10', 'tersedia');

INSERT INTO kategori (nama_kategori, urutan_tampil) VALUES
('Coffee', 1),
('Non Coffee', 2),
('Dessert', 3);

INSERT INTO menu (id_kategori, nama_menu, catatan_singkat, deskripsi, harga, gambar_menu, unggulan, tersedia) VALUES
(1, 'Nur Signature Latte', 'freshly brewed', 'Espresso house blend dengan susu segar dan gula aren lembut.', 24000, '/uploads/menu/signature-latte.jpg', 1, 1),
(1, 'Americano Classic', 'bold & clean', 'Ekstraksi ganda biji kopi pilihan disajikan hangat atau dingin.', 20000, '/uploads/menu/americano.jpg', 0, 1),
(2, 'Matcha Cream Latte', 'calm sip', 'Matcha pilihan dengan tekstur creamy untuk suasana santai.', 26000, '/uploads/menu/matcha-latte.jpg', 1, 1),
(3, 'Chocolate Cake', 'handmade taste', 'Kue cokelat lembut dengan lapisan ganache cokelat pekat.', 32000, '/uploads/menu/chocolate-cake.jpg', 1, 1);

-- ============================================================================
-- TRIGGER OTOMATIS STATUS MEJA (TERSEDIA <-> TERISI)
-- ============================================================================

DELIMITER $$

CREATE TRIGGER trg_pesanan_after_insert
AFTER INSERT ON pesanan
FOR EACH ROW
BEGIN
  IF NEW.status_pesanan <> 'dibatalkan' THEN
    UPDATE meja
    SET status_meja = 'terisi'
    WHERE id_meja = NEW.id_meja;
  END IF;
END$$

CREATE TRIGGER trg_pesanan_after_update
AFTER UPDATE ON pesanan
FOR EACH ROW
BEGIN
  IF NEW.status_pesanan IN ('selesai', 'dibatalkan') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pesanan
      WHERE id_meja = NEW.id_meja
        AND status_pesanan NOT IN ('selesai', 'dibatalkan')
    ) THEN
      UPDATE meja
      SET status_meja = 'tersedia'
      WHERE id_meja = NEW.id_meja;
    END IF;
  ELSE
    UPDATE meja
    SET status_meja = 'terisi'
    WHERE id_meja = NEW.id_meja;
  END IF;
END$$

DELIMITER ;
