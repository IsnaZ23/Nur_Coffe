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

## Arsitektur & Fungsi Kodingan Inti

### A. Kodingan Inti Sisi Pelanggan (Dari Scan QR → Pesanan Masuk DB)

#### 1. Mesin Validasi & Query Menu dari Database `CORE`
* **Berkas Terkait:** `src/app/order/[kode_qr]/page.tsx` dan `src/lib/katalog.ts`
* **Baris Kunci:** `ambilMeja(kode_qr)` dan `ambilKatalog()`
* **Fungsi Nyata:** Menangkap parameter kode meja dari URL hasil pemindaian QR (misal: `/order/meja-01`). Mengecek ke database apakah meja tersebut sah dan aktif di kafe. Jika valid, sistem memanggil seluruh kategori dan menu makanan/minuman yang aktif dari database MySQL via Prisma (`prisma.kategori.findMany` & `prisma.meja.findUnique`).

#### 2. Mesin Keranjang Belanja Reaktif `CORE`
* **Berkas Terkait:** `src/lib/pesanan.ts` dan `src/lib/store.ts`
* **Fungsi Nyata:** Menyediakan fungsi logika keranjang: `tambahItem()`, `ubahJumlah()`, `ubahCatatan()`, dan `totalKeranjang()`. Menggunakan `useSyncExternalStore` yang terikat ke `localStorage` browser HP pelanggan per kode meja, sehingga pesanan tidak hilang jika HP mati atau halaman ter-refresh.

#### 3. Mesin Pengirim & Penyimpan Pesanan ke Database (Jantung Aplikasi) `CORE`
* **Berkas Terkait:** `src/app/order/actions.ts` (`aksiBuatPesanan`) dan `src/lib/kasir.ts` (`simpanPesanan`, baris 150–210)
* **Fungsi Nyata:**
  * **Validasi Input:** Memastikan nama pelanggan dan item pesanan tidak kosong di server.
  * **Proteksi Manipulasi Harga:** Server membaca ulang harga asli dari database MySQL, bukan mempercayai harga dari browser client.
  * **Nomor Pesanan Unik:** Menghasilkan kode resmi otomatis berformat `NOR-ABC123XY`.
  * **Database Transaction:** Menyimpan transaksi ke tabel `pesanan` dan tabel relasi `detail_pesanan` dengan status awal `menunggu_bayar`.
  * **Revalidasi Kasir:** Menjalankan `revalidatePath("/kasir")` agar pesanan baru langsung muncul di layar kasir seketika.

---

### B. Kodingan Inti Sisi Kasir (Operasional Kafe)

#### 1. Mesin Keamanan & Sesi Kasir `SECURITY`
* **Berkas Terkait:** `src/app/kasir/layout.tsx` (baris 13–14) dan `src/lib/sesi.ts`
* **Baris Kunci:** `const sesi = await ambilSesi(); if (!sesi) redirect("/login");`
* **Fungsi Nyata:** Satpam gerbang utama. Memeriksa cookie sesi bertanda tangan kriptografi HMAC-SHA256. Setiap pengguna (termasuk pelanggan) yang mencoba masuk ke URL `/kasir` tanpa login yang sah akan langsung dicegat dan dialihkan ke `/login`.

#### 2. Mesin Pemroses Antrean & Pembayaran (POS) `CORE`
* **Berkas Terkait:** `src/app/kasir/page.tsx`, `src/app/kasir/actions.ts`, dan `src/lib/kasir.ts`
* **Fungsi Nyata:**
  * `aksiKonfirmasiBayar`: Mengubah status bayar di database MySQL dari `menunggu_bayar` menjadi `lunas` dan mencatat ID kasir yang melayani.
  * `aksiUbahStatus`: Memajukan alur kerja dari `menunggu_bayar` → `diproses` → `siap_saji` → `selesai`.
  * `antreanPesanan()`: Menarik seluruh pesanan aktif secara langsung dari database MySQL.

#### 3. Mesin Manajemen Menu & Upload Cloudinary `CORE`
* **Berkas Terkait:** `src/app/kasir/actions.ts` (`aksiSimpanMenu`) dan `src/lib/cloudinary.ts`
* **Fungsi Nyata:** Menangani upload file foto menu asli ke Cloudinary CDN secara streaming (`unggahGambar`), menyimpan URL gambarnya ke database, dan menghapus foto lama secara otomatis saat foto menu diganti (`hapusGambar`).

---

### C. Sistem Login, Registrasi, & Password Hashing

Sistem autentikasi kasir dirancang dengan standar keamanan modern menggunakan **Bcrypt** untuk hashing kata sandi dan **Cookie Bertanda Tangan HMAC-SHA256** untuk manajemen sesi.

#### 1. Struktur Database Kasir
Di file `prisma/schema.prisma`:
```prisma
model kasir {
  id_kasir    Int       @id @default(autoincrement())
  nama_kasir  String    @db.VarChar(100)
  username    String    @unique
  kata_sandi  String    @db.VarChar(255)  // Menyimpan string hash, BUKAN teks asli
  aktif       Boolean   @default(true)
  pesanan     pesanan[]
}
```

#### 2. Alur Registrasi (Daftar Kasir Baru & Hashing)
Kodingan ada di `src/app/login/actions.ts` (fungsi `daftar`):
```typescript
const kasirBaru = await prisma.kasir.create({
  data: {
    nama_kasir: nama,
    username,
    kata_sandi: await hash(kataSandi, 10), // <-- HASHING TERJADI DI SINI
  },
});
await buatSesi(kasirBaru);
```
* **Cara Kerja Password Hash:** Ketika kasir mengetik kata sandi (misal: `"kopi123"`), library `bcryptjs` menjalankan `hash(kataSandi, 10)` dengan 10 putaran salt. Kata sandi diubah menjadi string acak sepanjang 60 karakter (misal: `$2a$10$wT8e1QvY...7Z2xKu...M9v`). Nilai hash bersifat satu arah (*one-way*), sehingga tidak bisa didekripsi balik menjadi teks asli.

#### 3. Alur Login & Verifikasi Password
Kodingan ada di `src/lib/auth.ts` (fungsi `loginKasir`):
```typescript
// 1. Cari kasir berdasarkan username
const kasir = await prisma.kasir.findUnique({
  where: { username: username.trim() },
});
if (!kasir || !kasir.aktif) {
  return { ok: false, pesan: "Username atau kata sandi salah." };
}

// 2. Bandingkan password yang diketik dengan hash di database
const cocok = await compare(kataSandi, kasir.kata_sandi);
if (!cocok) {
  return { ok: false, pesan: "Username atau kata sandi salah." };
}
```
* Fungsi `compare(kataSandi, kasir.kata_sandi)` mencocokkan input pengguna dengan hash di database tanpa membuka hash-nya.
* Jika cocok, sistem memanggil `buatSesi()` di `src/lib/sesi.ts` untuk membuat cookie `sesi_kasir` yang dienkripsi dan memiliki masa kedaluwarsa 8 jam.

---

### D. Operasi CRUD yang Dilakukan Kasir

#### 1. CRUD Menu Kopi & Makanan
Kodingan berada di: `src/app/kasir/actions.ts`, `src/lib/katalog.ts`, dan `src/app/kasir/menu/KelolaMenuClient.tsx`.

| Operasi CRUD | Kodingan yang Bekerja | Penjelasan Teknis |
|---|---|---|
| **Create (Tambah)** | `aksiSimpanMenu` → `buatMenu()` | Kasir mengisi nama, kategori, harga, dan memilih foto menu. Foto diupload ke Cloudinary CDN via `simpanGambar()`, lalu URL gambar disimpan ke database tabel `menu`. |
| **Read (Melihat)** | `daftarMenuKelola()` | Mengambil seluruh menu yang terdaftar di database MySQL dan menampilkannya dalam tabel di halaman `/kasir/menu`. |
| **Update (Edit & Saklar Stok)** | `aksiSimpanMenu` → `perbaruiMenu()` | Kasir bisa mengedit nama/harga menu, mengubah saklar **Tersedia/Habis**, dan status **Best Seller**. Jika kasir mengganti foto baru, foto lama di Cloudinary otomatis dihapus via `hapusGambar()`. |
| **Delete (Hapus)** | `aksiHapusMenu` → `hapusMenu()` | **Proteksi Integritas Data:** Kasir tidak bisa menghapus menu yang sudah pernah dipesan oleh pelanggan (`detail_pesanan.count > 0`), agar riwayat transaksi masa lalu tidak rusak. Kasir diarahkan untuk menonaktifkan status ketersediaannya saja. |

#### 2. CRUD Kategori Menu
Kodingan berada di: `src/lib/katalog.ts` (baris 107–126).
* **Create:** `buatKategori(nama, urutan)` → Membuat kategori baru (misal: "Espresso Based", "Non-Coffee", "Snack").
* **Read:** `prisma.kategori.findMany({ orderBy: { urutan_tampil: 'asc' } })`.
* **Update:** `perbaruiKategori(id, nama, urutan)` → Mengubah nama atau urutan tampilan kategori di layar pelanggan.
* **Delete:** `hapusKategori(id)` → Menghapus kategori. Terdapat pengaman: jika kategori masih memiliki menu di dalamnya, sistem menolak penghapusan (*"Kategori masih punya menu"*).

#### 3. CRUD & Pengelolaan Transaksi Pesanan (POS Kasir)
Kodingan berada di: `src/lib/kasir.ts` dan `src/app/kasir/page.tsx`.
* **Read (Antrean Masuk):** Fungsi `antreanPesanan()` membaca pesanan pelanggan yang masuk dari seluruh meja secara real-time.
* **Update (Konfirmasi Pembayaran):** Fungsi `aksiKonfirmasiBayar` memanggil `konfirmasiPembayaran(nomorPesanan, kasirId)`: mengubah `status_bayar` dari `'menunggu_bayar'` → `'lunas'` dan mencatat `id_kasir` yang menangani transaksi tersebut.
* **Update (Status Pengerjaan Pesanan):** Fungsi `aksiUbahStatus` memanggil `ubahStatusPesanan()`:
  $$\text{menunggu\_bayar} \longrightarrow \text{diproses} \longrightarrow \text{siap\_saji} \longrightarrow \text{selesai}$$
* **Delete / Batal:** Kasir bisa membatalkan pesanan (`status_pesanan = 'dibatalkan'`).

---

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
