-- ============================================================
-- DATABASE COFFEE SHOP  — sesuai rangkuman_entitas_dan_alur_sistem_coffee_shop_v2.md
-- MariaDB 10.11 / MySQL 8.0+  (InnoDB, utf8mb4)
--
-- Perubahan dari database_Coffo_Nur.sql (v1):
--   - staff.role: barista dihapus (kasir urus pesanan + panggil pelanggan)
--   - addon, addon_menu, detail_pesanan_addon DIHAPUS (tanpa add-on berbayar)
--   - kustom minuman tetap: menu_ukuran + ice_level + sugar_level di detail_pesanan
--   - pelanggan tambah kolom username (login member)
--   - reservasi: tanpa jam_selesai; meja di-HOLD otomatis saat booking (reservasi_meja)
--   - pembayaran: tanpa DP (kolom jenis dihapus, semua Full)
--   - pesanan: status_dapur dihapus, satu alur status_pesanan saja
-- ============================================================

DROP DATABASE IF EXISTS coffee_shop_nur;
CREATE DATABASE coffee_shop_nur
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coffee_shop_nur;

-- ------------------------------------------------------------
-- 1. pelanggan  (walk-in guest + reservasi member)
-- ------------------------------------------------------------
CREATE TABLE pelanggan (
  id_pelanggan INT AUTO_INCREMENT PRIMARY KEY,
  tipe         ENUM('member','guest') NOT NULL,
  nama         VARCHAR(100) NOT NULL,
  username     VARCHAR(50)  NULL,
  email        VARCHAR(150) NULL,
  password     VARCHAR(255) NULL,
  no_hp        VARCHAR(20)  NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pelanggan_username (username),
  UNIQUE KEY uq_pelanggan_email (email),
  CONSTRAINT chk_pelanggan_akun CHECK (
    (tipe = 'member' AND username IS NOT NULL AND email IS NOT NULL AND password IS NOT NULL)
    OR (tipe = 'guest')
  )
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. staff  (admin / kasir)
-- ------------------------------------------------------------
CREATE TABLE staff (
  id_staff     INT AUTO_INCREMENT PRIMARY KEY,
  nama         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('admin','kasir') NOT NULL,
  status_aktif TINYINT(1) NOT NULL DEFAULT 1,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_staff_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. kategori
-- ------------------------------------------------------------
CREATE TABLE kategori (
  id_kategori   INT AUTO_INCREMENT PRIMARY KEY,
  nama_kategori VARCHAR(80) NOT NULL,
  slug          VARCHAR(80) NOT NULL,
  urutan_tampil INT NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_kategori_slug (slug)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. menu
-- ------------------------------------------------------------
CREATE TABLE menu (
  id_menu         INT AUTO_INCREMENT PRIMARY KEY,
  id_kategori     INT NOT NULL,
  nama_menu       VARCHAR(120) NOT NULL,
  deskripsi       TEXT NULL,
  harga_dasar     INT NOT NULL,
  status_tersedia ENUM('Tersedia','Habis') NOT NULL DEFAULT 'Tersedia',
  gambar_menu     VARCHAR(255) NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_menu_kategori FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori),
  CONSTRAINT chk_menu_harga CHECK (harga_dasar >= 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. menu_ukuran  (custom ukuran minuman; bukan add-on berbayar)
-- ------------------------------------------------------------
CREATE TABLE menu_ukuran (
  id_menu_ukuran INT AUTO_INCREMENT PRIMARY KEY,
  id_menu        INT NOT NULL,
  label          VARCHAR(30) NOT NULL,
  extra_harga    INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_ukuran_menu FOREIGN KEY (id_menu) REFERENCES menu(id_menu) ON DELETE CASCADE,
  CONSTRAINT chk_ukuran_extra CHECK (extra_harga >= 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. meja  (status dihitung dari sesi_meja/reservasi_meja, bukan kolom statis)
-- ------------------------------------------------------------
CREATE TABLE meja (
  id_meja       INT AUTO_INCREMENT PRIMARY KEY,
  nomor_meja    VARCHAR(10) NOT NULL,
  kapasitas     INT NOT NULL,
  kode_qr       VARCHAR(64) NOT NULL,
  kategori_meja ENUM('Walk-In','Reservasi','Fleksibel') NOT NULL DEFAULT 'Fleksibel',
  aktif         TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_meja_nomor (nomor_meja),
  UNIQUE KEY uq_meja_qr    (kode_qr),
  CONSTRAINT chk_meja_kapasitas CHECK (kapasitas > 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. reservasi  (tanpa jam_selesai — tamu bebas keluar kapan saja)
--    status: Menunggu Konfirmasi -> Dikonfirmasi -> Check-In -> Selesai
-- ------------------------------------------------------------
CREATE TABLE reservasi (
  id_reservasi     INT AUTO_INCREMENT PRIMARY KEY,
  id_pelanggan     INT NOT NULL,
  kode_reservasi   VARCHAR(30) NOT NULL,
  tanggal_reservasi DATE NOT NULL,
  jam_mulai        TIME NOT NULL,
  jumlah_tamu      INT NOT NULL,
  catatan          TEXT NULL,
  status_reservasi ENUM('Menunggu Konfirmasi','Dikonfirmasi','Check-In',
                        'Selesai','Batal','No-Show')
                     NOT NULL DEFAULT 'Menunggu Konfirmasi',
  dibuat_oleh      ENUM('pelanggan','admin') NOT NULL DEFAULT 'pelanggan',
  id_staff_konfirmasi INT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_kode_reservasi (kode_reservasi),
  KEY idx_reservasi_tanggal (tanggal_reservasi),
  CONSTRAINT fk_res_pelanggan FOREIGN KEY (id_pelanggan)        REFERENCES pelanggan(id_pelanggan),
  CONSTRAINT fk_res_staff     FOREIGN KEY (id_staff_konfirmasi) REFERENCES staff(id_staff),
  CONSTRAINT chk_res_tamu    CHECK (jumlah_tamu > 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. reservasi_meja  (junction = HOLD meja)
--    Baris dibuat otomatis saat booking supaya meja terkunci sebelum bayar.
-- ------------------------------------------------------------
CREATE TABLE reservasi_meja (
  id_reservasi_meja INT AUTO_INCREMENT PRIMARY KEY,
  id_reservasi      INT NOT NULL,
  id_meja           INT NOT NULL,
  UNIQUE KEY uq_res_meja (id_reservasi, id_meja),
  KEY idx_rm_meja (id_meja),
  CONSTRAINT fk_rm_reservasi FOREIGN KEY (id_reservasi) REFERENCES reservasi(id_reservasi) ON DELETE CASCADE,
  CONSTRAINT fk_rm_meja      FOREIGN KEY (id_meja)      REFERENCES meja(id_meja)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. sesi_meja  (okupansi meja walk-in / check-in reservasi)
-- ------------------------------------------------------------
CREATE TABLE sesi_meja (
  id_sesi        INT AUTO_INCREMENT PRIMARY KEY,
  id_meja        INT NOT NULL,
  id_pelanggan   INT NULL,
  sumber         ENUM('walk-in','reservasi') NOT NULL,
  id_reservasi   INT NULL,
  waktu_mulai    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  waktu_selesai  DATETIME NULL,
  status         ENUM('aktif','selesai') NOT NULL DEFAULT 'aktif',
  dibuat_oleh    INT NULL,
  KEY idx_sesi_meja_status (id_meja, status),
  CONSTRAINT fk_sesi_meja        FOREIGN KEY (id_meja)      REFERENCES meja(id_meja),
  CONSTRAINT fk_sesi_pelanggan   FOREIGN KEY (id_pelanggan) REFERENCES pelanggan(id_pelanggan),
  CONSTRAINT fk_sesi_reservasi   FOREIGN KEY (id_reservasi) REFERENCES reservasi(id_reservasi),
  CONSTRAINT fk_sesi_staff       FOREIGN KEY (dibuat_oleh)  REFERENCES staff(id_staff)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 10. pesanan  (muara walk-in & pre-order reservasi)
--     satu alur status: menunggu_bayar -> dibayar -> dibuat -> siap -> selesai
-- ------------------------------------------------------------
CREATE TABLE pesanan (
  id_pesanan      INT AUTO_INCREMENT PRIMARY KEY,
  kode_pesanan    VARCHAR(30) NOT NULL,
  id_pelanggan    INT NOT NULL,
  id_sesi         INT NULL,
  id_reservasi    INT NULL,
  jenis_pesanan   ENUM('dine-in','take-away','delivery','pre-order') NOT NULL,
  waktu_pesan     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal        INT NOT NULL DEFAULT 0,
  pajak           INT NOT NULL DEFAULT 0,
  total_harga     INT NOT NULL DEFAULT 0,
  status_pesanan  ENUM('menunggu_bayar','dibayar','dibuat','siap','selesai','batal')
                    NOT NULL DEFAULT 'menunggu_bayar',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_kode_pesanan (kode_pesanan),
  KEY idx_pesanan_waktu (waktu_pesan),
  CONSTRAINT fk_pes_pelanggan FOREIGN KEY (id_pelanggan) REFERENCES pelanggan(id_pelanggan),
  CONSTRAINT fk_pes_sesi      FOREIGN KEY (id_sesi)      REFERENCES sesi_meja(id_sesi),
  CONSTRAINT fk_pes_reservasi FOREIGN KEY (id_reservasi) REFERENCES reservasi(id_reservasi),
  -- pre-order reservasi wajib punya id_reservasi; walk-in pakai id_sesi tanpa reservasi
  CONSTRAINT chk_pes_jenis CHECK (
    (jenis_pesanan = 'pre-order' AND id_reservasi IS NOT NULL)
    OR (jenis_pesanan <> 'pre-order' AND id_reservasi IS NULL)
  ),
  CONSTRAINT chk_pes_total CHECK (subtotal >= 0 AND pajak >= 0 AND total_harga >= 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 11. detail_pesanan  (custom minuman: ukuran + ice + sugar)
-- ------------------------------------------------------------
CREATE TABLE detail_pesanan (
  id_detail      INT AUTO_INCREMENT PRIMARY KEY,
  id_pesanan     INT NOT NULL,
  id_menu        INT NOT NULL,
  id_menu_ukuran INT NULL,
  kuantitas      INT NOT NULL,
  harga_satuan   INT NOT NULL,
  ice_level      TINYINT NULL,
  sugar_level    TINYINT NULL,
  catatan        VARCHAR(255) NULL,
  subtotal       INT NOT NULL,
  KEY idx_detail_pesanan (id_pesanan),
  CONSTRAINT fk_det_pesanan FOREIGN KEY (id_pesanan)     REFERENCES pesanan(id_pesanan) ON DELETE CASCADE,
  CONSTRAINT fk_det_menu    FOREIGN KEY (id_menu)        REFERENCES menu(id_menu),
  CONSTRAINT fk_det_ukuran  FOREIGN KEY (id_menu_ukuran) REFERENCES menu_ukuran(id_menu_ukuran),
  CONSTRAINT chk_det_qty      CHECK (kuantitas > 0),
  CONSTRAINT chk_det_subtotal CHECK (subtotal >= 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 12. pembayaran  (full payment; tanpa DP)
-- ------------------------------------------------------------
CREATE TABLE pembayaran (
  id_pembayaran    INT AUTO_INCREMENT PRIMARY KEY,
  id_pesanan       INT NOT NULL,
  order_id_gateway VARCHAR(100) NOT NULL,
  metode_pembayaran VARCHAR(30) NOT NULL,   -- 'QRIS','BCA VA','GoPay','Cash', ...
  jumlah_bayar     INT NOT NULL,
  waktu_bayar      DATETIME NULL,
  status_pembayaran_gateway ENUM('Pending','Success','Failed','Expired') NOT NULL DEFAULT 'Pending',
  snap_token       VARCHAR(255) NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_order_gateway (order_id_gateway),
  KEY idx_bayar_pesanan (id_pesanan),
  CONSTRAINT fk_bayar_pesanan FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan),
  CONSTRAINT chk_bayar_jumlah CHECK (jumlah_bayar >= 0)
) ENGINE=InnoDB;

-- ============================================================
-- SEED — akun staff dasar (password: admin123 / kasir123)
-- ============================================================
INSERT INTO staff (nama, email, password, role) VALUES
  ('Admin Kopi Senja', 'admin@kopisenja.test', '$2y$12$eUfJPv6KYjnxTXsOZsXHgO4j75kw4fUv25g.Uxl5n7IU8EBMMBbPS', 'admin'),
  ('Kasir Kopi Senja', 'kasir@kopisenja.test', '$2y$12$lEx/Kus7NtqjL./hXWatnuWHFG81kDhaeBnXj9kxwGcdojKheK.JW', 'kasir');

-- ============================================================
-- SEED — kategori
-- ============================================================
INSERT INTO kategori (nama_kategori, slug, urutan_tampil) VALUES
  ('Coffee',     'coffee',     1),
  ('Non-Coffee', 'non-coffee', 2),
  ('Food',       'food',       3),
  ('Snack',      'snack',      4);

-- ============================================================
-- SEED — meja 10 buah
--   Walk-In  : M01-M06  (QR khusus pelanggan langsung)
--   Reservasi: M07-M09  (dipilih admin saat konfirmasi)
--   Fleksibel: M10
-- ============================================================
INSERT INTO meja (nomor_meja, kapasitas, kode_qr, kategori_meja) VALUES
  ('M01', 2, 'qr-m01-0001', 'Walk-In'),
  ('M02', 2, 'qr-m02-0002', 'Walk-In'),
  ('M03', 4, 'qr-m03-0003', 'Walk-In'),
  ('M04', 4, 'qr-m04-0004', 'Walk-In'),
  ('M05', 4, 'qr-m05-0005', 'Walk-In'),
  ('M06', 6, 'qr-m06-0006', 'Walk-In'),
  ('M07', 4, 'qr-m07-0007', 'Reservasi'),
  ('M08', 4, 'qr-m08-0008', 'Reservasi'),
  ('M09', 6, 'qr-m09-0009', 'Reservasi'),
  ('M10', 8, 'qr-m10-0010', 'Fleksibel');

-- ============================================================
-- SEED — katalog menu (14 item)
-- ============================================================
INSERT INTO menu (id_kategori, nama_menu, deskripsi, harga_dasar, status_tersedia)
SELECT k.id_kategori, v.nama, v.desk, v.harga, 'Tersedia'
FROM kategori k
JOIN (
            SELECT 'coffee'     AS slug, 'Espresso'           AS nama, 'Single shot, pekat'            AS desk, 18000 AS harga
  UNION ALL SELECT 'coffee',          'Americano',             'Espresso + air',                20000
  UNION ALL SELECT 'coffee',          'Kopi Susu Senja',       'Signature, gula aren',          22000
  UNION ALL SELECT 'coffee',          'Cappuccino',            'Espresso + foam susu',          25000
  UNION ALL SELECT 'coffee',          'Cafe Latte',            'Espresso + susu steamed',       25000
  UNION ALL SELECT 'coffee',          'V60 Manual Brew',       'Single origin, diseduh manual', 28000
  UNION ALL SELECT 'non-coffee',      'Matcha Latte',          'Matcha premium + susu',         26000
  UNION ALL SELECT 'non-coffee',      'Chocolate',             'Cokelat pekat hangat/dingin',   24000
  UNION ALL SELECT 'non-coffee',      'Teh Tarik',             'Teh susu tarik',                18000
  UNION ALL SELECT 'food',            'Nasi Goreng Kampung',   'Telur, ayam suwir, kerupuk',    28000
  UNION ALL SELECT 'food',            'Mie Goreng Spesial',    'Telur, sayur, ayam',            26000
  UNION ALL SELECT 'food',            'Roti Bakar Cokelat',    'Roti + cokelat + keju',         15000
  UNION ALL SELECT 'snack',           'Kentang Goreng',        'Porsi reguler + saus',          18000
  UNION ALL SELECT 'snack',           'Pisang Goreng',         '5 potong + madu',               15000
) v ON v.slug = k.slug;

-- ============================================================
-- SEED — ukuran untuk menu minuman (coffee & non-coffee)
-- ============================================================
INSERT INTO menu_ukuran (id_menu, label, extra_harga)
SELECT m.id_menu, 'Regular', 0 FROM menu m
JOIN kategori k ON k.id_kategori = m.id_kategori
WHERE k.slug IN ('coffee','non-coffee');

INSERT INTO menu_ukuran (id_menu, label, extra_harga)
SELECT m.id_menu, 'Large', 4000 FROM menu m
JOIN kategori k ON k.id_kategori = m.id_kategori
WHERE k.slug IN ('coffee','non-coffee');

-- ============================================================
-- SEED — akun pelanggan member demo (username: nur / password: nur12345)
-- ============================================================
INSERT INTO pelanggan (tipe, nama, username, email, password, no_hp) VALUES
  ('member', 'Nur Demo', 'nur', 'nur@demo.test',
   '$2y$12$ZWBAs5fURDMfIdKWC4jIYOGCzLCVYu2l6DC2v3pF/Qj16FGOBwFOm',
   '081200000001');

-- ============================================================
-- SEED — reservasi demo (besok) + HOLD meja
-- ============================================================
INSERT INTO reservasi (id_pelanggan, kode_reservasi, tanggal_reservasi, jam_mulai,
                       jumlah_tamu, catatan, status_reservasi, dibuat_oleh)
SELECT p.id_pelanggan, v.kode, CURDATE() + INTERVAL 1 DAY, v.mulai,
       v.tamu, v.catatan, v.status, 'pelanggan'
FROM pelanggan p
JOIN (
            SELECT 'RSV-DEMO-001' AS kode, '10:00:00' AS mulai,
                   4 AS tamu, 'Birthday, minta meja dekat jendela' AS catatan,
                   'Dikonfirmasi' AS status
  UNION ALL SELECT 'RSV-DEMO-002',     '13:00:00', 2,
                   'Pre-order 2 latte', 'Menunggu Konfirmasi'
) v
WHERE p.username = 'nur';

INSERT INTO reservasi_meja (id_reservasi, id_meja)
SELECT r.id_reservasi, m.id_meja
FROM reservasi r JOIN meja m ON m.nomor_meja = 'M07'
WHERE r.kode_reservasi = 'RSV-DEMO-001';

INSERT INTO reservasi_meja (id_reservasi, id_meja)
SELECT r.id_reservasi, m.id_meja
FROM reservasi r JOIN meja m ON m.nomor_meja = 'M08'
WHERE r.kode_reservasi = 'RSV-DEMO-002';

-- ============================================================
-- QUERY BANTU: cari meja kosong untuk reservasi pada waktu tertentu
-- ponytail: asumsi durasi 90 menit karena kolom jam_selesai dihapus.
--           Tambah kolom durasi_menit kalau perlu beda per reservasi.
-- Ganti '?' = tanggal, jam_mulai yang diinginkan, jumlah tamu.
-- ============================================================
-- SELECT m.id_meja, m.nomor_meja, m.kapasitas
-- FROM meja m
-- WHERE m.aktif = 1
--   AND m.kategori_meja IN ('Reservasi','Fleksibel')
--   AND m.kapasitas >= ?
--   AND m.id_meja NOT IN (
--     SELECT rm.id_meja
--     FROM reservasi_meja rm
--     JOIN reservasi r ON r.id_reservasi = rm.id_reservasi
--     WHERE r.tanggal_reservasi = ?
--       AND r.status_reservasi NOT IN ('Batal','No-Show')
--       AND NOT (
--             ADDTIME(r.jam_mulai, '01:30:00') <= ?
--          OR ADDTIME(?, '01:30:00')            <= r.jam_mulai
--       )
--   )
-- ORDER BY m.kapasitas ASC
-- LIMIT 1;

-- ============================================================
-- QUERY BANTU: meja kosong/terisi untuk dashboard admin
-- ============================================================
-- SELECT m.id_meja, m.nomor_meja, m.kategori_meja,
--        (SELECT COUNT(*) FROM sesi_meja s
--          WHERE s.id_meja = m.id_meja AND s.status = 'aktif') AS terisi_walkin,
--        (SELECT COUNT(*) FROM reservasi_meja rm
--           JOIN reservasi r ON r.id_reservasi = rm.id_reservasi
--          WHERE rm.id_meja = m.id_meja
--            AND r.tanggal_reservasi = CURDATE()
--            AND r.status_reservasi IN ('Dikonfirmasi','Check-In')) AS reservasi_hari_ini
-- FROM meja m
-- WHERE m.aktif = 1
-- ORDER BY m.nomor_meja;
