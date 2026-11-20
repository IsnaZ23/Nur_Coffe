# Panduan Git — Proyek Nur_Coffe

Repo: https://github.com/IsnaZ23/Nur_Coffe.git

---

## Aturan dasar

1. Jangan push langsung ke `main`. Selalu lewat branch + Pull Request.
2. Branch = jalur kerja sementara. Tujuan akhir semua tetap `main`.
3. Yang mengerjakan sesuatu, dialah yang push file itu.
4. File yang **TIDAK PERNAH** dipush siapa pun:
   - `.env` — kredensial DB (sudah otomatis ditolak git)
   - `src/generated/prisma/` — hasil generate (sudah otomatis ditolak git)
   - `node_modules/`, `.next/` — sudah otomatis ditolak git
5. Setiap anggota punya `.env` sendiri. Jangan pernah kirim `.env` lewat repo.

---

## Alur setup awal (sekali jalan)

### Hari 1 — Isnan: setup Prisma

1) Cek kondisi repo
```bash
git status
git log --oneline -5
```

2) Bikin branch
```bash
git checkout -b feat/prisma-setup
```

3) Import SQL ke MySQL (lokal)
```bash
cmd /c '"C:\xampp\mysql\bin\mysql.exe" -u root --default-character-set=utf8mb4 < "C:\xampp\htdocs\coffe_nur\prisma\database_Coffo_Nur_v2.sql"'
```

4) Pull schema lalu generate client
```bash
npx prisma db pull
npx prisma generate
```

5) Stage file yang benar
```bash
git add prisma/schema.prisma prisma/database_Coffo_Nur_v2.sql prisma.config.ts src/lib/prisma.ts .gitignore package.json package-lock.json
git status
```
Cek: `.env` dan `src/generated/prisma/` **tidak boleh muncul**. Kalau muncul: `git reset .env`

6) Commit + push
```bash
git commit -m "setup prisma: schema, client singleton, dependency"
git push -u origin feat/prisma-setup
```

7) Buat PR di GitHub
Buka link dari output push → Compare & pull request → isi judul → Create → minta Andre review → Merge.
Setelah merge, `main` sudah punya Prisma.

### Hari 1 malam — Andre: pull setelah PR di-merge

1) Ambil kode terbaru
```bash
git checkout main
git pull
```

2) Install dependency baru
```bash
npm install
```

3) Generate Prisma client (**WAJIB**)
```bash
npx prisma generate
```
Kalau dilewat → `Cannot find module '@/generated/prisma/client'`

4) Siapkan DB lokal sendiri — buat `.env` (jangan dipush):
```env
DATABASE_URL="mysql://root:@localhost:3306/coffee_shop_nur"
```
Lalu import SQL yang sama (lihat Hari 1 langkah 3).

5) Tes
```bash
npm run dev
```

Andre **tidak push apa pun** di tahap ini.

### Hari 2 — Andre: edit frontend lalu push

1) Pastikan mulai dari terbaru
```bash
git checkout main
git pull
```

2) Bikin branch sendiri
```bash
git checkout -b feat/frontend-menu
```

3) Kerjakan frontend

4) Stage **hanya** file yang disentuh
```bash
git add src/app/menu/page.tsx src/components/MenuCard.tsx
git status
```

5) Commit + push
```bash
git commit -m "feat: halaman menu"
git push -u origin feat/frontend-menu
```

6) Buka PR → merge ke `main`

### Hari 3 — Isnan: pull hasil frontend

1) Ambil kode terbaru
```bash
git checkout main
git pull
```

2) Cek perubahan
```bash
git log --oneline -5
```

| Yang diubah | Yang perlu dijalankan |
|---|---|
| file frontend saja | `npm run dev` langsung |
| `package.json` | `npm install` |
| `prisma/schema.prisma` | `npx prisma generate` |

3) Jalankan
```bash
npm run dev
```

### Kunci urutan

Isnan push + merge Prisma **dulu**. Andre baru bisa kerja frontend karena butuh `src/lib/prisma.ts`. Urutan ini tidak boleh dibalik.

---

## Hari kerja normal (Hari 4 dan seterusnya)

Alur berulang untuk setiap fitur, siapa pun yang mengerjakan:

```bash
git checkout main
git pull
git checkout -b feat/<nama-fitur>
# ... kerja ...
git add <file yang kamu sentuh>
git commit -m "<pesan jelas>"
git push -u origin feat/<nama-fitur>
```

Lalu buka Pull Request ke `main` di GitHub → review → merge.

Setelah pull yang mengubah `package.json`:
```bash
npm install
```

---

## Kalau schema Prisma berubah

Berlaku hanya kalau ada yang mengubah `prisma/schema.prisma` (tambah kolom/tabel/enum).

**Yang mengubah schema:**
```bash
npx prisma migrate dev --name <nama-perubahan>
npx prisma generate
git add prisma/
git commit -m "db: <perubahan>"
git push
```
Lalu buka PR → merge.

**Semua anggota lain setelah pull:**
```bash
git checkout main
git pull
npm install
npx prisma generate
```

Catatan: `prisma migrate dev` hanya kalau `prisma/migrations/` dipakai. Kalau schema masih dipegang oleh file SQL manual (`docker`/XAMPP), ganti dengan `npx prisma db pull` setelah import SQL terbaru, dan beri tahu anggota lain bahwa file SQL berubah.

---

## Kalau terjadi conflict

```bash
git checkout main
git pull
git checkout feat/<branch-kamu>
git rebase origin/main
# ... selesaikan file yang konflik ...
git add <file yang sudah dibereskan>
git rebase --continue
git push --force-with-lease
```

File yang paling sering bentrok: `package.json`, `package-lock.json`.

---

## Tabel cepat

|  | Isnan | Andre |
|---|---|---|
| bikin branch | ya | ya (sendiri) |
| push branch sendiri | ya | ya |
| push ke branch orang | tidak | tidak |
| push langsung ke `main` | tidak | tidak |
| pull `main` | ya | ya |
| `npm install` | saat dependency berubah | saat dependency berubah |
| `npx prisma generate` | saat schema berubah | saat schema berubah |
| push `.env` | tidak | tidak |
| push `src/generated/prisma/` | tidak | tidak |

---

## Catatan

- `src/generated/prisma` **tidak ada** di repo. Wajib `npx prisma generate` setiap kali clone atau pull yang mengubah `schema.prisma`.
- Jangan pernah commit `.env`. Kalau `.env` sudah terlanjur ter-commit, minta bantuan sebelum push.