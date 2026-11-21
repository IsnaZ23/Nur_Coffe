"use client";

import { useState } from "react";

type PesananKasir = {
  id_pesanan: string;
  nomor_meja: string;
  pemesan: string;
  jenis_order: "Walk-In" | "Pre-Order Reservasi";
  ringkasan_item: string;
  total: number;
  metode_bayar: "QRIS" | "Transfer Bank" | "Tunai di Kasir";
  status_pembayaran: "Sudah Dibayar" | "Belum Dibayar";
  status_pesanan: "Menunggu Konfirmasi" | "Diproses Barista" | "Siap Disajikan" | "Selesai";
};

const STORAGE_KEY_MEJA_TERPAKAI = "nur_coffe_meja_terpakai";

export default function KasirAntreanPage() {
  const [notifikasiSync, setNotifikasiSync] = useState<string>("");

  const [daftarPesanan, setDaftarPesanan] = useState<PesananKasir[]>([
    {
      id_pesanan: "ORD-001",
      nomor_meja: "M02",
      pemesan: "Tamu Walk-In",
      jenis_order: "Walk-In",
      ringkasan_item: "2x Kopi Susu Nur, 1x Croissant",
      total: 68000,
      metode_bayar: "QRIS",
      status_pembayaran: "Sudah Dibayar",
      status_pesanan: "Menunggu Konfirmasi",
    },
    {
      id_pesanan: "ORD-002",
      nomor_meja: "M05",
      pemesan: "Tamu Walk-In",
      jenis_order: "Walk-In",
      ringkasan_item: "1x Americano Dingin",
      total: 20000,
      metode_bayar: "Tunai di Kasir",
      status_pembayaran: "Belum Dibayar",
      status_pesanan: "Menunggu Konfirmasi",
    },
    {
      id_pesanan: "ORD-003",
      nomor_meja: "M07",
      pemesan: "Andre (Member)",
      jenis_order: "Pre-Order Reservasi",
      ringkasan_item: "2x V60 Arabika, 2x Kentang Goreng",
      total: 84000,
      metode_bayar: "Transfer Bank",
      status_pembayaran: "Sudah Dibayar",
      status_pesanan: "Diproses Barista",
    },
  ]);

  const kunciMejaDiAdmin = (nomorMeja: string) => {
    if (typeof window === "undefined") return;
    const dataLama = window.localStorage.getItem(STORAGE_KEY_MEJA_TERPAKAI);
    const daftarTerkunci: string[] = dataLama ? JSON.parse(dataLama) : [];

    if (!daftarTerkunci.includes(nomorMeja)) {
      window.localStorage.setItem(
        STORAGE_KEY_MEJA_TERPAKAI,
        JSON.stringify([...daftarTerkunci, nomorMeja])
      );
    }
  };

  const lanjutkanStatusPesanan = (idPesanan: string) => {
    const target = daftarPesanan.find((p) => p.id_pesanan === idPesanan);
    if (!target) return;

    setDaftarPesanan((prev) =>
      prev.map((p) => {
        if (p.id_pesanan !== idPesanan) return p;

        if (p.status_pesanan === "Menunggu Konfirmasi") {
          return {
            ...p,
            status_pembayaran: "Sudah Dibayar",
            status_pesanan: "Diproses Barista",
          };
        }
        if (p.status_pesanan === "Diproses Barista") {
          return { ...p, status_pesanan: "Siap Disajikan" };
        }
        return { ...p, status_pesanan: "Selesai" };
      })
    );

    if (target.status_pesanan === "Menunggu Konfirmasi") {
      kunciMejaDiAdmin(target.nomor_meja);
      setNotifikasiSync(
        `Pesanan ${target.id_pesanan} diterima. Meja ${target.nomor_meja} otomatis terkunci sebagai Terpakai di sistem Admin.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {notifikasiSync && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
          <span>{notifikasiSync}</span>
          <button
            type="button"
            onClick={() => setNotifikasiSync("")}
            className="font-bold text-amber-400 hover:text-white"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white">
            Antrean Pesanan Pelanggan
          </h2>
          <p className="text-xs text-stone-400">
            Alur status pesanan: Dibayar, Diproses Barista, Siap Disajikan, hingga Selesai.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
          {daftarPesanan.length} Pesanan
        </span>
      </div>

      <div className="space-y-3">
        {daftarPesanan.map((pesanan) => {
          const lunas = pesanan.status_pembayaran === "Sudah Dibayar";

          return (
            <div
              key={pesanan.id_pesanan}
              className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold">
                    Meja {pesanan.nomor_meja}
                  </span>
                  <span className="text-xs text-stone-400">
                    {pesanan.id_pesanan} • {pesanan.pemesan} ({pesanan.jenis_order})
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      lunas
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/15 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {pesanan.status_pembayaran} ({pesanan.metode_bayar})
                  </span>
                </div>

                <div className="text-sm font-semibold text-white">
                  {pesanan.ringkasan_item}
                </div>

                <div className="text-xs text-amber-400 font-bold">
                  Total Tagihan: Rp {pesanan.total.toLocaleString("id-ID")}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-stone-800 text-xs font-semibold text-stone-200">
                  {pesanan.status_pesanan}
                </span>

                {pesanan.status_pesanan !== "Selesai" && (
                  <button
                    type="button"
                    onClick={() => lanjutkanStatusPesanan(pesanan.id_pesanan)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition"
                  >
                    {pesanan.status_pesanan === "Menunggu Konfirmasi"
                      ? "Terima & Kunci Meja"
                      : pesanan.status_pesanan === "Diproses Barista"
                      ? "Tandai Siap"
                      : "Tandai Selesai"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}