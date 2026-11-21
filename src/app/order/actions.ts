"use server";

import { revalidatePath } from "next/cache";
import {
  pesananPerMeja,
  simpanPesanan,
  type ItemPesananBaru,
} from "@/lib/kasir";
import type { MetodeBayar, PesananTampil } from "@/lib/pesanan";

export type HasilBuatPesanan =
  | { ok: true; pesanan: PesananTampil }
  | { ok: false; pesan: string };

export async function aksiBuatPesanan(input: {
  kode_qr: string;
  nama_pemesan: string;
  catatan_pesanan?: string | null;
  metode_bayar: MetodeBayar;
  items: ItemPesananBaru[];
}): Promise<HasilBuatPesanan> {
  if (!input.nama_pemesan?.trim()) {
    return { ok: false, pesan: "Nama pemesan wajib diisi." };
  }
  if (!input.items?.length) {
    return { ok: false, pesan: "Keranjang masih kosong." };
  }
  if (input.metode_bayar !== "qris" && input.metode_bayar !== "tunai") {
    return { ok: false, pesan: "Metode pembayaran tidak dikenal." };
  }

  try {
    const pesanan = await simpanPesanan(input);
    revalidatePath("/kasir");
    return { ok: true, pesanan };
  } catch (e) {
    return {
      ok: false,
      pesan: e instanceof Error ? e.message : "Gagal membuat pesanan.",
    };
  }
}

export async function aksiRiwayatMeja(kodeQr: string): Promise<PesananTampil[]> {
  const daftar = await pesananPerMeja(kodeQr);
  return daftar.map((p) => ({
    nomor_pesanan: p.nomor_pesanan,
    nomor_meja: p.nomor_meja,
    nama_pemesan: p.nama_pemesan,
    catatan_pesanan: p.catatan_pesanan,
    total_harga: p.total_harga,
    metode_bayar: p.metode_bayar,
    status_bayar: p.status_bayar,
    status_pesanan: p.status_pesanan,
    dibuat_pada: p.dibuat_pada,
    items: p.items.map((i) => ({
      id_menu: i.id_menu,
      nama_menu: i.nama_menu,
      jumlah: i.jumlah,
      harga_satuan: i.harga_satuan,
      subtotal: i.subtotal,
      catatan_item: i.catatan_item,
    })),
  }));
}
