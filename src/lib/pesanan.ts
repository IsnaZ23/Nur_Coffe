"use client";

import { createStore } from "./store";

export type ItemKeranjang = {
  id_menu: number;
  nama_menu: string;
  harga: number;
  gambar_menu: string | null;
  catatan_item: string | null;
  jumlah: number;
};

export type MetodeBayar = "qris" | "tunai";
export type StatusBayar = "menunggu_bayar" | "lunas";
export type StatusPesanan =
  | "menunggu_bayar"
  | "diproses"
  | "siap_saji"
  | "selesai"
  | "dibatalkan";

export type Keranjang = {
  kode_meja: string;
  items: ItemKeranjang[];
};

export type ItemPesananTampil = {
  id_menu: number;
  nama_menu: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  catatan_item: string | null;
};

export type PesananTampil = {
  nomor_pesanan: string;
  nomor_meja: string;
  nama_pemesan: string;
  catatan_pesanan: string | null;
  total_harga: number;
  metode_bayar: MetodeBayar;
  status_bayar: StatusBayar;
  status_pesanan: StatusPesanan;
  dibuat_pada: string;
  items: ItemPesananTampil[];
};

export const storeKeranjang = createStore<Keranjang>("nur_coffee_keranjang", () => ({
  kode_meja: "",
  items: [],
}));

export function tambahItem(
  menu: Omit<ItemKeranjang, "jumlah" | "catatan_item">,
  kode_meja: string
) {
  storeKeranjang.tulis((prev) => {
    const dasar = prev.kode_meja === kode_meja ? prev.items : [];
    const ada = dasar.find((i) => i.id_menu === menu.id_menu);
    const items = ada
      ? dasar.map((i) =>
          i.id_menu === menu.id_menu ? { ...i, jumlah: i.jumlah + 1 } : i
        )
      : [...dasar, { ...menu, catatan_item: null, jumlah: 1 }];
    return { kode_meja, items };
  });
}

export function ubahJumlah(id_menu: number, delta: number) {
  storeKeranjang.tulis((prev) => ({
    ...prev,
    items: prev.items
      .map((i) => (i.id_menu === id_menu ? { ...i, jumlah: i.jumlah + delta } : i))
      .filter((i) => i.jumlah > 0),
  }));
}

export function ubahCatatan(id_menu: number, catatan: string) {
  storeKeranjang.tulis((prev) => ({
    ...prev,
    items: prev.items.map((i) =>
      i.id_menu === id_menu ? { ...i, catatan_item: catatan.trim() || null } : i
    ),
  }));
}

export function kosongkanKeranjang() {
  storeKeranjang.tulis(() => ({ kode_meja: "", items: [] }));
}

export function totalKeranjang(items: ItemKeranjang[]) {
  return items.reduce((sum, i) => sum + i.harga * i.jumlah, 0);
}

export const LABEL_STATUS: Record<StatusPesanan, string> = {
  menunggu_bayar: "Menunggu Bayar",
  diproses: "Diproses",
  siap_saji: "Siap Disajikan",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export const LABEL_BAYAR: Record<StatusBayar, string> = {
  menunggu_bayar: "Belum Bayar",
  lunas: "Lunas",
};
