"use client";

import { useEffect, useState } from "react";

type ReservasiItem = {
  id_reservasi: string;
  nama_pemesan: string;
  nomor_meja: string;
  waktu: string;
  jumlah_tamu: number;
  status: "Menunggu Konfirmasi" | "Diterima" | "Ditolak";
};

const STORAGE_KEY_MEJA_TERPAKAI = "nur_coffe_meja_terpakai";

export default function AdminReservasiPage() {
  const [mejaTerpakai, setMejaTerpakai] = useState<string[]>([]);
  const [daftarReservasi, setDaftarReservasi] = useState<ReservasiItem[]>([
    {
      id_reservasi: "RSV-101",
      nama_pemesan: "Andre",
      nomor_meja: "M07",
      waktu: "Hari Ini, 19:00",
      jumlah_tamu: 4,
      status: "Menunggu Konfirmasi",
    },
    {
      id_reservasi: "RSV-102",
      nama_pemesan: "Salsa",
      nomor_meja: "M08",
      waktu: "Hari Ini, 20:00",
      jumlah_tamu: 2,
      status: "Diterima",
    },
  ]);

  const [namaManual, setNamaManual] = useState<string>("");
  const [mejaManual, setMejaManual] = useState<string>("M07");
  const [waktuManual, setWaktuManual] = useState<string>("Hari Ini, 21:00");

  useEffect(() => {
    const tersimpan = window.localStorage.getItem(STORAGE_KEY_MEJA_TERPAKAI);
    if (tersimpan) {
      setMejaTerpakai(JSON.parse(tersimpan));
    }
  }, []);

  const tambahReservasiManual = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!namaManual.trim()) return;

    setDaftarReservasi((prev) => [
      {
        id_reservasi: `RSV-${Math.floor(200 + Math.random() * 700)}`,
        nama_pemesan: `${namaManual.trim()} (Input Manual)`,
        nomor_meja: mejaManual,
        waktu: waktuManual,
        jumlah_tamu: 2,
        status: "Diterima",
      },
      ...prev,
    ]);
    setNamaManual("");
  };

  const ubahStatus = (idReservasi: string, statusBaru: "Diterima" | "Ditolak") => {
    setDaftarReservasi((prev) =>
      prev.map((r) =>
        r.id_reservasi === idReservasi ? { ...r, status: statusBaru } : r
      )
    );
  };

  const gantiMejaHold = (idReservasi: string, mejaBaru: string) => {
    setDaftarReservasi((prev) =>
      prev.map((r) =>
        r.id_reservasi === idReservasi ? { ...r, nomor_meja: mejaBaru } : r
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-800 pb-3">
        <h2 className="text-base font-bold text-white">
          Konfirmasi Reservasi, Ganti Meja Hold, dan Input Manual
        </h2>
        <p className="text-xs text-stone-400">
          Kelola pengajuan reservasi pelanggan serta alihkan nomor meja apabila meja tujuan sedang terpakai.
        </p>
      </div>

      <form
        onSubmit={tambahReservasiManual}
        className="p-5 rounded-2xl bg-stone-900 border border-stone-800 grid sm:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label className="block text-xs text-stone-400 mb-1">
            Nama Pelanggan (Walk-In / Telepon)
          </label>
          <input
            type="text"
            required
            value={namaManual}
            onChange={(e) => setNamaManual(e.target.value)}
            placeholder="Nama pemesan"
            className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-stone-400 mb-1">Pilih Meja</label>
          <select
            value={mejaManual}
            onChange={(e) => setMejaManual(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
          >
            <option value="M07">Meja M07</option>
            <option value="M08">Meja M08</option>
            <option value="M10">Meja M10 (VIP)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-stone-400 mb-1">Waktu</label>
          <input
            type="text"
            value={waktuManual}
            onChange={(e) => setWaktuManual(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
          />
        </div>
        <button
          type="submit"
          className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition"
        >
          + Input Reservasi Manual
        </button>
      </form>

      <div className="space-y-3">
        {daftarReservasi.map((res) => {
          const bentrok = mejaTerpakai.includes(res.nomor_meja);

          return (
            <div
              key={res.id_reservasi}
              className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold">
                    Meja {res.nomor_meja}
                  </span>
                  <span className="text-xs text-stone-400">
                    {res.id_reservasi} • {res.nama_pemesan}
                  </span>
                  {bentrok && (
                    <span className="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] font-bold">
                      Meja Sedang Terpakai (Harap Ganti Meja)
                    </span>
                  )}
                </div>

                <div className="text-sm font-semibold text-white">
                  {res.waktu} ({res.jumlah_tamu} Tamu)
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-stone-400">Ganti Meja Hold:</span>
                  <select
                    value={res.nomor_meja}
                    onChange={(e) =>
                      gantiMejaHold(res.id_reservasi, e.target.value)
                    }
                    className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-xs text-white"
                  >
                    <option value="M07">M07</option>
                    <option value="M08">M08</option>
                    <option value="M10">M10</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-stone-800 text-xs font-bold text-stone-200">
                  {res.status}
                </span>

                {res.status === "Menunggu Konfirmasi" && (
                  <>
                    <button
                      type="button"
                      disabled={bentrok}
                      onClick={() => ubahStatus(res.id_reservasi, "Diterima")}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-bold text-xs transition"
                    >
                      Terima
                    </button>
                    <button
                      type="button"
                      onClick={() => ubahStatus(res.id_reservasi, "Ditolak")}
                      className="px-3.5 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold transition"
                    >
                      Tolak
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}