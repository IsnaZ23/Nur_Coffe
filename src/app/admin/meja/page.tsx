"use client";

import { useEffect, useState } from "react";

type MasterMeja = {
  id_meja: number;
  nomor_meja: string;
  kapasitas: number;
  kategori_meja: "Reguler" | "Reservasi" | "VIP";
  aktif: boolean;
};

const STORAGE_KEY_MEJA_TERPAKAI = "nur_coffe_meja_terpakai";

export default function AdminMasterMejaPage() {
  const [mejaTerkunciKasir, setMejaTerkunciKasir] = useState<string[]>([]);
  const [daftarMeja, setDaftarMeja] = useState<MasterMeja[]>([
    { id_meja: 1, nomor_meja: "M01", kapasitas: 2, kategori_meja: "Reguler", aktif: true },
    { id_meja: 2, nomor_meja: "M02", kapasitas: 2, kategori_meja: "Reguler", aktif: true },
    { id_meja: 3, nomor_meja: "M05", kapasitas: 4, kategori_meja: "Reguler", aktif: true },
    { id_meja: 4, nomor_meja: "M07", kapasitas: 4, kategori_meja: "Reservasi", aktif: true },
    { id_meja: 5, nomor_meja: "M08", kapasitas: 4, kategori_meja: "Reservasi", aktif: true },
    { id_meja: 6, nomor_meja: "M10", kapasitas: 6, kategori_meja: "VIP", aktif: true },
  ]);

  const [nomorBaru, setNomorBaru] = useState<string>("");
  const [kapasitasBaru, setKapasitasBaru] = useState<string>("4");
  const [kategoriBaru, setKategoriBaru] = useState<"Reguler" | "Reservasi" | "VIP">("Reguler");

  useEffect(() => {
    const tersimpan = window.localStorage.getItem(STORAGE_KEY_MEJA_TERPAKAI);
    const terkunci: string[] = tersimpan ? JSON.parse(tersimpan) : [];
    setMejaTerkunciKasir(terkunci);

    if (terkunci.length > 0) {
      setDaftarMeja((prev) =>
        prev.map((m) =>
          terkunci.includes(m.nomor_meja) ? { ...m, aktif: false } : m
        )
      );
    }
  }, []);

  const tambahMeja = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nomorBaru.trim()) return;

    setDaftarMeja((prev) => [
      ...prev,
      {
        id_meja: Date.now(),
        nomor_meja: nomorBaru.trim().toUpperCase(),
        kapasitas: Number(kapasitasBaru),
        kategori_meja: kategoriBaru,
        aktif: true,
      },
    ]);
    setNomorBaru("");
  };

  const toggleStatusMeja = (meja: MasterMeja) => {
    if (!meja.aktif) {
      const daftarBaru = mejaTerkunciKasir.filter((k) => k !== meja.nomor_meja);
      setMejaTerkunciKasir(daftarBaru);
      window.localStorage.setItem(
        STORAGE_KEY_MEJA_TERPAKAI,
        JSON.stringify(daftarBaru)
      );
    }

    setDaftarMeja((prev) =>
      prev.map((m) =>
        m.id_meja === meja.id_meja ? { ...m, aktif: !m.aktif } : m
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-800 pb-3">
        <h2 className="text-base font-bold text-white">
          Kelola Master Meja dan Status Aktif
        </h2>
        <p className="text-xs text-stone-400">
          Nonaktifkan meja saat sedang dipakai pelanggan sesuai laporan Kasir atau saat perbaikan.
        </p>
      </div>

      <form
        onSubmit={tambahMeja}
        className="p-5 rounded-2xl bg-stone-900 border border-stone-800 grid sm:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label className="block text-xs text-stone-400 mb-1">Nomor Meja</label>
          <input
            type="text"
            required
            value={nomorBaru}
            onChange={(e) => setNomorBaru(e.target.value)}
            placeholder="Contoh: M11"
            className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white uppercase"
          />
        </div>
        <div>
          <label className="block text-xs text-stone-400 mb-1">Kategori</label>
          <select
            value={kategoriBaru}
            onChange={(e) =>
              setKategoriBaru(e.target.value as "Reguler" | "Reservasi" | "VIP")
            }
            className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
          >
            <option value="Reguler">Reguler</option>
            <option value="Reservasi">Reservasi</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-stone-400 mb-1">Kapasitas Kursi</label>
          <input
            type="number"
            min={1}
            max={20}
            value={kapasitasBaru}
            onChange={(e) => setKapasitasBaru(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
          />
        </div>
        <button
          type="submit"
          className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition"
        >
          + Tambah Meja
        </button>
      </form>

      <div className="grid sm:grid-cols-3 gap-4">
        {daftarMeja.map((meja) => {
          const dikunciKasir = mejaTerkunciKasir.includes(meja.nomor_meja);
          return (
            <div
              key={meja.id_meja}
              className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm text-white">
                    Meja {meja.nomor_meja}
                  </div>
                  <div className="text-xs text-stone-400">
                    {meja.kategori_meja} • {meja.kapasitas} Kursi
                  </div>
                  {!meja.aktif && (
                    <div className="text-[11px] text-amber-400 mt-1">
                      {dikunciKasir
                        ? "Terkunci otomatis dari pesanan Kasir"
                        : "Dinonaktifkan manual oleh Admin"}
                    </div>
                  )}
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    meja.aktif
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {meja.aktif ? "Aktif / Kosong" : "Nonaktif / Terpakai"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggleStatusMeja(meja)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                  meja.aktif
                    ? "bg-stone-800 hover:bg-stone-700 text-white"
                    : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {meja.aktif
                  ? "Nonaktifkan (Meja Terpakai)"
                  : "Meja Sudah Kosong, Aktifkan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}