"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY_MEJA_TERPAKAI = "nur_coffe_meja_terpakai";

const DAFTAR_MEJA_MASTER = [
  { nomor_meja: "M01", kategori: "Reguler", kapasitas: 2 },
  { nomor_meja: "M02", kategori: "Reguler", kapasitas: 2 },
  { nomor_meja: "M05", kategori: "Reguler", kapasitas: 4 },
  { nomor_meja: "M07", kategori: "Reservasi", kapasitas: 4 },
  { nomor_meja: "M08", kategori: "Reservasi", kapasitas: 4 },
  { nomor_meja: "M10", kategori: "VIP", kapasitas: 6 },
];

export default function AdminOkupansiPage() {
  const [mejaTerpakai, setMejaTerpakai] = useState<string[]>([]);

  useEffect(() => {
    const tersimpan = window.localStorage.getItem(STORAGE_KEY_MEJA_TERPAKAI);
    if (tersimpan) {
      setMejaTerpakai(JSON.parse(tersimpan));
    }
  }, []);

  const bebaskanMeja = (nomorMeja: string) => {
    const daftarBaru = mejaTerpakai.filter((kode) => kode !== nomorMeja);
    setMejaTerpakai(daftarBaru);
    window.localStorage.setItem(
      STORAGE_KEY_MEJA_TERPAKAI,
      JSON.stringify(daftarBaru)
    );
  };

  const jumlahTerpakai = DAFTAR_MEJA_MASTER.filter((m) =>
    mejaTerpakai.includes(m.nomor_meja)
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
          <div className="text-xs text-stone-400">Total Meja Kedai</div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {DAFTAR_MEJA_MASTER.length} Meja
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
          <div className="text-xs text-stone-400">Sedang Terpakai (Aktif)</div>
          <div className="text-2xl font-extrabold text-red-400 mt-1">
            {jumlahTerpakai} Meja
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800">
          <div className="text-xs text-stone-400">Tersedia / Kosong</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {DAFTAR_MEJA_MASTER.length - jumlahTerpakai} Meja
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white">
            Pemantauan Okupansi Meja Langsung
          </h2>
          <p className="text-xs text-stone-400">
            Meja yang dikunci oleh Kasir otomatis berstatus Terpakai hingga pelanggan selesai.
          </p>
        </div>
        <Link
          href="/admin/reservasi"
          className="text-xs font-bold text-amber-400 hover:underline"
        >
          Lihat Jadwal Reservasi Hari Ini
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {DAFTAR_MEJA_MASTER.map((meja) => {
          const terpakai = mejaTerpakai.includes(meja.nomor_meja);
          return (
            <div
              key={meja.nomor_meja}
              className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-sm text-white">
                    Meja {meja.nomor_meja}
                  </div>
                  <div className="text-xs text-stone-400">
                    {meja.kategori} • {meja.kapasitas} Kursi
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    terpakai
                      ? "bg-red-500/15 text-red-400"
                      : "bg-emerald-500/15 text-emerald-400"
                  }`}
                >
                  {terpakai ? "Terpakai" : "Kosong"}
                </span>
              </div>

              {terpakai ? (
                <button
                  type="button"
                  onClick={() => bebaskanMeja(meja.nomor_meja)}
                  className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition"
                >
                  Meja Sudah Kosong, Aktifkan
                </button>
              ) : (
                <div className="text-[11px] text-stone-500 text-center py-2">
                  Siap menerima tamu walk-in atau reservasi
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}