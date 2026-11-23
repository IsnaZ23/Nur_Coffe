# Nur Coffee — Sistem Pemesanan Kafe Berbasis QR

Aplikasi web pemesanan menu untuk kedai kopi: pelanggan memindai QR di meja, memilih menu, dan melakukan pemesanan. Kasir mengelola antrean pesanan, pembayaran, dan katalog menu dari portal kasir.

## Fitur

### Portal Pelanggan (Order)
- **Pemesanan via QR per meja** — setiap meja punya kode QR sendiri (`/order/[kode_qr]`); nomor meja otomatis terdeteksi dari kode.
- **Katalog menu per kategori** — menu dikelompokkan per kategori, ada label *Best Seller* untuk menu unggulan.
- **Pencarian menu** — filter realtime berdasarkan nama menu.
- **Keranjang belanja** — tambah/kurang jumlah, hapus item, dan catatan per item (cth. *less ice*). Tersimpan di `localStorage` per meja, jadi tidak hilang saat halaman di-refresh.
- **Checkout** — pilih metode bayar (QRIS / tunai), catatan pesanan, dan nama pemesan.
- **Struk digital QRIS** — setelah pesanan dibuat, tampil struk berisi nomor pesanan, rincian item, total, dan gambar QRIS untuk dipindai.
- **Riwayat pesanan per meja** — daftar pesanan sejak meja terakhir kosong, otomatis dimuat ulang saat tab kembali aktif.

### Portal Kasir
- **Login kasir** — autentikasi username + password (bcrypt), sesi cookie httpOnly bertanda tangan HMAC, berlaku 8 jam.
- **Proteksi rute** — middleware membatasi `/kasir/*` hanya untuk sesi aktif.
- **Antrean pesanan** — papan antrean pesanan aktif (diproses / siap saji / selesai / dibatalkan).
- **Konfirmasi pembayaran** — tandai pesanan lunas (QRIS diverifikasi kasir, tunai dibayar langsung).
- **Kelola menu & kategori** — CRUD lengkap dengan unggah gambar (validasi tipe & ukuran maks 2 MB) serta toggle ketersediaan.

## Teknologi

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, React 19) |
| Bahasa | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | MySQL |
| ORM | Prisma 6 |
| Autentikasi | bcryptjs + sesi cookie HMAC (crypto bawaan Node.js) |

## Cara Kerja

### Alur pemesanan
1. Pelanggan memindai QR di meja → membuka `/order/[kode_qr]`.
2. Halaman server mengambil katalog menu dan riwayat pesanan meja dari MySQL via Prisma.
3. Pelanggan memilih menu → keranjang disimpan di `localStorage` (custom store dengan `useSyncExternalStore`, sinkron antar tab).
4. Checkout → Server Action `aksiBuatPesanan` memvalidasi ulang harga di server, membuat `pesanan` + `detail_pesanan` dalam satu transaksi, lalu mengembalikan struk.
5. Kasir memverifikasi pembayaran → status pesanan berubah (menunggu bayar → diproses → siap saji → selesai).

### Alur kasir
1. `/login` → Server Action memverifikasi password dengan bcrypt.
2. Sesi disimpan sebagai cookie httpOnly berisi data kasir + kedaluwarsa, ditandatangani HMAC-SHA256 dengan `SESSION_SECRET`.
3. Middleware (`proxy.ts`) memeriksa cookie di setiap request ke `/kasir/*` dan redirect ke `/login` jika tidak valid.
4. Semua Server Action kasir memvalidasi ulang sesi dengan `wajibSesi()` sebelum menyentuh database.

### Struktur proyek
```
src/
├── app/
│   ├── page.tsx              # Redirect ke /order/meja-01
│   ├── order/[kode_qr]/      # Portal pelanggan (halaman + Server Actions)
│   ├── login/                # Login kasir
│   └── kasir/                # Portal kasir (antrean, kelola menu)
├── components/               # Komponen klien (OrderClient, Icons)
├── lib/                      # Logika bisnis (katalog, pesanan, kasir, sesi, auth)
└── proxy.ts                  # Middleware proteksi rute
prisma/schema.prisma          # Skema database (kategori, menu, meja, pesanan, kasir)
```

## Menjalankan Proyek

### 1. Persiapan
```bash
npm install
```

Buat file `.env`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/nur_coffee"
SESSION_SECRET="ganti-dengan-rahasia-panjang"
```

### 2. Setup database
```bash
npm run db:generate   # generate Prisma Client
npm run db:push       # buat tabel sesuai skema
```

Seed data awal (kategori, menu, meja 01–10, akun kasir) tersedia di `prisma/nur_coffee.sql` — import via phpMyAdmin atau:
```bash
mysql -u user -p nur_coffee < prisma/nur_coffee.sql
```

### 3. Jalankan
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) (redirect ke meja 01 untuk demo). Portal kasir di [http://localhost:3000/login](http://localhost:3000/login).

Perintah lain:
```bash
npm run build        # build produksi
npm run lint         # cek ESLint
npm run db:studio    # Prisma Studio (kelola data via UI)
```
