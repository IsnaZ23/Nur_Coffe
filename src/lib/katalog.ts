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
