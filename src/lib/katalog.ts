import { prisma } from "./prisma";

export type MenuItem = {
  id_menu: number;
  nama_menu: string;
  catatan_singkat: string | null;
  deskripsi: string | null;
  harga: number;
  gambar_menu: string | null;
  unggulan: boolean;
  tersedia: boolean;
};

export type KategoriItem = {
  id_kategori: number;
  nama_kategori: string;
  menu: MenuItem[];
};

export async function ambilKatalog(): Promise<KategoriItem[]> {
  const kategori = await prisma.kategori.findMany({
    orderBy: { urutan_tampil: "asc" },
    select: {
      id_kategori: true,
      nama_kategori: true,
      menu: {
        orderBy: [{ unggulan: "desc" }, { id_menu: "asc" }],
        select: {
          id_menu: true,
          nama_menu: true,
          catatan_singkat: true,
          deskripsi: true,
          harga: true,
          gambar_menu: true,
          unggulan: true,
          tersedia: true,
        },
      },
    },
  });

  return kategori;
}

export async function ambilMeja(kodeQr: string) {
  return prisma.meja.findUnique({
    where: { kode_qr: kodeQr },
    select: { id_meja: true, nomor_meja: true, kode_qr: true, status_meja: true },
  });
}

export async function daftarMeja() {
  return prisma.meja.findMany({
    orderBy: { nomor_meja: "asc" },
    select: { nomor_meja: true, kode_qr: true },
  });
}

export type MenuKelola = MenuItem & { id_kategori: number };

export async function daftarMenuKelola(): Promise<MenuKelola[]> {
  return prisma.menu.findMany({
    orderBy: [{ id_kategori: "asc" }, { id_menu: "asc" }],
    select: {
      id_menu: true,
      id_kategori: true,
      nama_menu: true,
      catatan_singkat: true,
      deskripsi: true,
      harga: true,
      gambar_menu: true,
      unggulan: true,
      tersedia: true,
    },
  });
}

export type InputMenu = {
  id_kategori: number;
  nama_menu: string;
  catatan_singkat?: string | null;
  deskripsi?: string | null;
  harga: number;
  gambar_menu?: string | null;
  unggulan: boolean;
  tersedia: boolean;
};

export async function buatMenu(input: InputMenu) {
  return prisma.menu.create({ data: input });
}

export async function perbaruiMenu(id: number, input: Partial<InputMenu>) {
  return prisma.menu.update({ where: { id_menu: id }, data: input });
}

export async function hapusMenu(id: number) {
  const dipakai = await prisma.detail_pesanan.count({ where: { id_menu: id } });
  if (dipakai > 0) {
    throw new Error(
      "Menu sudah dipakai di pesanan lain. Nonaktifkan ketersediaannya saja."
    );
  }
  return prisma.menu.delete({ where: { id_menu: id } });
}

export async function buatKategori(nama: string, urutan = 0) {
  return prisma.kategori.create({
    data: { nama_kategori: nama.trim(), urutan_tampil: urutan },
  });
}

export async function perbaruiKategori(id: number, nama: string, urutan: number) {
  return prisma.kategori.update({
    where: { id_kategori: id },
    data: { nama_kategori: nama.trim(), urutan_tampil: urutan },
  });
}

export async function hapusKategori(id: number) {
  const jumlahMenu = await prisma.menu.count({ where: { id_kategori: id } });
  if (jumlahMenu > 0) {
    throw new Error("Kategori masih punya menu. Pindahkan atau hapus menunya dulu.");
  }
  return prisma.kategori.delete({ where: { id_kategori: id } });
}
