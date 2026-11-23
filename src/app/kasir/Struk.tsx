"use client";

import { useState } from "react";
import type { PesananAntre } from "@/lib/kasir";
import { formatRupiah, formatWaktu } from "@/lib/format";

export default function TombolStruk({ pesanan }: { pesanan: PesananAntre }) {
  const [buka, setBuka] = useState(false);

  function cetak() {
    window.print();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setBuka(true)}
        className="rounded-full border border-primary/35 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
      >
        Cetak Struk
      </button>

      {buka && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
          onClick={() => setBuka(false)}
        >
          <div
            className="struk-cetak max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 text-ink shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="font-display text-xl font-semibold">Nur Coffee</h3>
              <p className="text-xs">Struk Pesanan</p>
            </div>

            <div className="mt-4 border-y border-dashed border-ink/30 py-3 text-xs">
              <div className="flex justify-between">
                <span>No. Pesanan</span>
                <span>{pesanan.nomor_pesanan}</span>
              </div>
              <div className="flex justify-between">
                <span>Meja</span>
                <span>{pesanan.nomor_meja}</span>
              </div>
              <div className="flex justify-between">
                <span>Pemesan</span>
                <span>{pesanan.nama_pemesan}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu</span>
                <span>{formatWaktu(pesanan.dibuat_pada)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir</span>
                <span>{pesanan.nama_kasir ?? "—"}</span>
              </div>
            </div>

            <ul className="mt-3 space-y-2 text-xs">
              {pesanan.items.map((i) => (
                <li key={i.id_detail} className="border-b border-dashed border-ink/15 pb-2">
                  <div className="flex justify-between gap-2">
                    <span>
                      {i.jumlah}× {i.nama_menu}
                      <em className="block text-[11px] text-ink/55">
                        @ {formatRupiah(i.harga_satuan)}
                      </em>
                    </span>
                    <span>{formatRupiah(i.subtotal)}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{formatRupiah(pesanan.total_harga)}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs">
              <span>Metode Bayar</span>
              <span>{pesanan.metode_bayar === "qris" ? "QRIS" : "Tunai"}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs">
              <span>Status Bayar</span>
              <span>{pesanan.status_bayar === "lunas" ? "Lunas" : "Belum Bayar"}</span>
            </div>

            <p className="mt-4 text-center text-xs">Terima kasih atas kunjungannya!</p>

            <div className="no-print mt-5 flex gap-2">
              <button
                type="button"
                onClick={cetak}
                className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-cream-light transition hover:bg-primary-dark"
              >
                Cetak
              </button>
              <button
                type="button"
                onClick={() => setBuka(false)}
                className="flex-1 rounded-full border border-primary/35 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
