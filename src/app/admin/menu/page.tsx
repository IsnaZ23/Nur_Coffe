"use client";

import { useState } from "react";

type ItemMenu = {
  id_menu: number;
  nama_menu: string;
  kategori: "Kopi" | "Non-Kopi" | "Makanan";
  harga_dasar: number;
  ukuran: string;
  stok_tersedia: boolean;
};

export default function AdminMenuPage() {
  const [daftarMenu, setDaftarMenu] = useState<ItemMenu[]>([
    {
      id_menu: 1,
      nama_menu: "Kopi Susu Nur",
      kategori: "Kopi",
      harga_dasar: 22000,
      ukuran: "Regular / Large",
      stok_tersedia: true,
    },
    {
      id_menu: 2,
      nama_menu: "V60 Arabika Gayo",
      kategori: "Kopi",
      harga_dasar: 26000,
      ukuran: "Regular",
      stok_tersedia: true,
    },
    {
      id_menu: 3,
      nama_menu: "Butter Croissant",
      kategori: "Makanan",
      harga_dasar: 24000,
      ukuran: "Standar",
      stok_tersedia: true,
    },
  ]);

  const [namaMenu, setNamaMenu] = useState<string>("");
  const [kategori, setKategori] = useState<"Kopi" | "Non-Kopi" | "Makanan">("Kopi");
  const [harga, setHarga] = useState<string>("");
  const [ukuran, setUkuran] = useState<string>("Regular / Large");

  const tambahMenu = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!namaMenu.trim() || !harga) return;

    setDaftarMenu((prev) => [
      {
        id_menu: Date.now(),
        nama_menu: namaMenu.trim(),
        kategori,
        harga_dasar: Number(harga),
        ukuran,
        stok_tersedia: true,
      },
      ...prev,
    ]);
    setNamaMenu("");
    setHarga("");
  };

  const toggleStok = (idMenu: number) => {
    setDaftarMenu((prev) =>
      prev.map((m) =>
        m.id_menu === idMenu ? { ...m, stok_tersedia: !m.stok_tersedia } : m
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-800 pb-3">
        <h2 className="text-base font-bold text-white">
          Kelola Kategori, Menu, Stok, dan Ukuran
        </h2>
        <p className="text-xs text-stone-400">
          Tambahkan varian produk baru atau tandai stok habis agar tidak dipesan pelanggan.
        </p>
      </div>

      <form
        onSubmit={tambahMenu}
        className="p-5 rounded-2xl bg-stone-900 border border-stone-800 grid sm:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label className="block text-xs text-stone-400 mb-1">Nama Menu</label>
          <input
            type="text"
            required
            value={namaMenu}
            onChange={(e) => setNamaMenu(e.target.value)}
            placeholder="Contoh: Matcha Latte"
            className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-stone-400 mb-1">Kategori</label>
          <select
            value={kategori}
            onChange={(e) =>
              setKategori(e.target.value as "Kopi" | "Non-Kopi" | "Makanan")
            }
            className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
          >
            <option value="Kopi">Kopi</option>
            <option value="Non-Kopi">Non-Kopi</option>
            <option value="Makanan">Makanan</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-stone-400 mb-1">
            Harga Dasar (Rp)
          </label>
          <input
            type="number"
            required
            min={1000}
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
            placeholder="25000"
            className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
          />
        </div>
        <button
          type="submit"
          className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition"
        >
          + Simpan Menu
        </button>
      </form>

      <div className="space-y-2.5">
        {daftarMenu.map((item) => (
          <div
            key={item.id_menu}
            className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  {item.nama_menu}
                </span>
                <span className="px-2 py-0.5 rounded bg-stone-800 text-[11px] text-stone-300">
                  {item.kategori}
                </span>
              </div>
              <div className="text-xs text-amber-400 mt-0.5">
                Rp {item.harga_dasar.toLocaleString("id-ID")} • Ukuran: {item.ukuran}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleStok(item.id_menu)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  item.stok_tersedia
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/15 text-red-400 border border-red-500/30"
                }`}
              >
                {item.stok_tersedia ? "Stok Tersedia" : "Stok Habis"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setDaftarMenu((prev) =>
                    prev.filter((m) => m.id_menu !== item.id_menu)
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-red-500/20 text-stone-300 hover:text-red-400 text-xs font-bold transition"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}