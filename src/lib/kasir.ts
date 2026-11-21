import { prisma } from "./prisma";
import type {
  pesanan_metode_bayar,
  pesanan_status_bayar,
  pesanan_status_pesanan,
} from "@/generated/prisma/enums";

export type PesananAntre = {
  id_pesanan: number;
  nomor_pesanan: string;
  nama_pemesan: string;
  nomor_meja: string;
  status_meja: string;
  nama_kasir: string | null;
  catatan_pesanan: string | null;
  total_harga: number;
  metode_bayar: pesanan_metode_bayar;
  status_bayar: pesanan_status_bayar;
  status_pesanan: pesanan_status_pesanan;
  dibuat_pada: string;
  items: {
    id_detail: number;
    id_menu: number;
    nama_menu: string;
    jumlah: number;
    harga_satuan: number;
    subtotal: number;
    catatan_item: string | null;
  }[];
};

const PILIH_PESANAN = {
  id_pesanan: true,
  nomor_pesanan: true,
  nama_pemesan: true,
  catatan_pesanan: true,
  total_harga: true,
  metode_bayar: true,
  status_bayar: true,
  status_pesanan: true,
  dibuat_pada: true,
  meja: { select: { nomor_meja: true, status_meja: true } },
  kasir: { select: { nama_kasir: true } },
  detail_pesanan: {
    select: {
      id_detail: true,
      id_menu: true,
      jumlah: true,
      harga_satuan: true,
      subtotal: true,
      catatan_item: true,
      menu: { select: { nama_menu: true } },
    },
  },
} as const;

type BarisPesanan = {
  id_pesanan: number;
  nomor_pesanan: string;
  nama_pemesan: string;
  catatan_pesanan: string | null;
  total_harga: number;
  metode_bayar: pesanan_metode_bayar;
  status_bayar: pesanan_status_bayar;
  status_pesanan: pesanan_status_pesanan;
  dibuat_pada: Date | null;
  meja: { nomor_meja: string; status_meja: string };
  kasir: { nama_kasir: string } | null;
  detail_pesanan: {
    id_detail: number;
    id_menu: number;
    jumlah: number;
    harga_satuan: number;
    subtotal: number;
    catatan_item: string | null;
    menu: { nama_menu: string };
  }[];
};

function rapikan(p: BarisPesanan): PesananAntre {
  return {
    id_pesanan: p.id_pesanan,
    nomor_pesanan: p.nomor_pesanan,
    nama_pemesan: p.nama_pemesan,
    nomor_meja: p.meja.nomor_meja,
    status_meja: p.meja.status_meja,
    nama_kasir: p.kasir?.nama_kasir ?? null,
    catatan_pesanan: p.catatan_pesanan,
    total_harga: p.total_harga,
    metode_bayar: p.metode_bayar,
    status_bayar: p.status_bayar,
    status_pesanan: p.status_pesanan,
    dibuat_pada: (p.dibuat_pada ?? new Date()).toISOString(),
    items: p.detail_pesanan.map((d) => ({
      id_detail: d.id_detail,
      id_menu: d.id_menu,
      nama_menu: d.menu.nama_menu,
      jumlah: d.jumlah,
      harga_satuan: d.harga_satuan,
      subtotal: d.subtotal,
      catatan_item: d.catatan_item,
    })),
  };
}

export async function antreanPesanan(): Promise<PesananAntre[]> {
  const baris = await prisma.pesanan.findMany({
    where: { status_pesanan: { notIn: ["selesai", "dibatalkan"] } },
    orderBy: { dibuat_pada: "desc" },
    select: PILIH_PESANAN,
  });
  return baris.map(rapikan);
}

export async function riwayatPesanan(limit = 30): Promise<PesananAntre[]> {
  const baris = await prisma.pesanan.findMany({
    orderBy: { dibuat_pada: "desc" },
    take: limit,
    select: PILIH_PESANAN,
  });
  return baris.map(rapikan);
}

export async function pesananPerMeja(kodeQr: string): Promise<PesananAntre[]> {
  const baris = await prisma.pesanan.findMany({
    where: { meja: { kode_qr: kodeQr } },
    orderBy: { dibuat_pada: "desc" },
    take: 20,
    select: PILIH_PESANAN,
  });
  return baris.map(rapikan);
}

export type ItemPesananBaru = { id_menu: number; jumlah: number; catatan_item?: string | null };

export async function simpanPesanan(input: {
  kode_qr: string;
  nama_pemesan: string;
  catatan_pesanan?: string | null;
  metode_bayar: pesanan_metode_bayar;
  items: ItemPesananBaru[];
}) {
  if (input.items.length === 0) throw new Error("Keranjang kosong");

  const meja = await prisma.meja.findUnique({
    where: { kode_qr: input.kode_qr },
    select: { id_meja: true },
  });
  if (!meja) throw new Error("Meja tidak ditemukan");

  const ids = [...new Set(input.items.map((i) => i.id_menu))];
  const menu = await prisma.menu.findMany({
    where: { id_menu: { in: ids }, tersedia: true },
    select: { id_menu: true, harga: true, tersedia: true },
  });

  const hargaPerMenu = new Map(menu.map((m) => [m.id_menu, m.harga]));
  for (const item of input.items) {
    if (!hargaPerMenu.has(item.id_menu)) {
      throw new Error(`Menu ${item.id_menu} tidak tersedia`);
    }
    if (!Number.isInteger(item.jumlah) || item.jumlah < 1) {
      throw new Error("Jumlah item tidak valid");
    }
  }

  const rincian = input.items.map((i) => {
    const harga = hargaPerMenu.get(i.id_menu)!;
    return {
      id_menu: i.id_menu,
      jumlah: i.jumlah,
      harga_satuan: harga,
      subtotal: harga * i.jumlah,
      catatan_item: i.catatan_item?.trim() || null,
    };
  });
  const total = rincian.reduce((s, r) => s + r.subtotal, 0);
  const nomor = `NOR-${Date.now().toString(36).toUpperCase().slice(-8)}`;

  const pesanan = await prisma.pesanan.create({
    data: {
      nomor_pesanan: nomor,
      id_meja: meja.id_meja,
      nama_pemesan: input.nama_pemesan.trim(),
      catatan_pesanan: input.catatan_pesanan?.trim() || null,
      total_harga: total,
      metode_bayar: input.metode_bayar,
      status_bayar: "menunggu_bayar",
      status_pesanan: "menunggu_bayar",
      detail_pesanan: { create: rincian },
    },
    select: PILIH_PESANAN,
  });

  return rapikan(pesanan);
}

export async function ubahStatusPesanan(
  nomorPesanan: string,
  status: pesanan_status_pesanan,
  kasirId: number
) {
  const ada = await prisma.pesanan.findUnique({
    where: { nomor_pesanan: nomorPesanan },
    select: { id_pesanan: true, status_bayar: true },
  });
  if (!ada) throw new Error("Pesanan tidak ditemukan");

  const pesanan = await prisma.pesanan.update({
    where: { nomor_pesanan: nomorPesanan },
    data: {
      status_pesanan: status,
      id_kasir: kasirId,
      status_bayar:
        status === "dibatalkan" ? ada.status_bayar : ("lunas" as pesanan_status_bayar),
    },
    select: PILIH_PESANAN,
  });

  return rapikan(pesanan);
}

export async function konfirmasiPembayaran(nomorPesanan: string, kasirId: number) {
  const pesanan = await prisma.pesanan.update({
    where: { nomor_pesanan: nomorPesanan },
    data: { status_bayar: "lunas", id_kasir: kasirId },
    select: PILIH_PESANAN,
  });
  return rapikan(pesanan);
}
