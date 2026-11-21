"use client";

import { useState } from "react";

type DataCheckIn = {
  kode_reservasi: string;
  nama_member: string;
  nomor_meja: string;
  jam_kedatangan: string;
  jumlah_tamu: number;
  sudah_checkin: boolean;
};

const STORAGE_KEY_MEJA_TERPAKAI = "nur_coffe_meja_terpakai";

export default function KasirCheckInReservasiPage() {
  const [kodeInput, setKodeInput] = useState<string>("");
  const [pesanStatus, setPesanStatus] = useState<string>("");

  const [daftarBooking, setDaftarBooking] = useState<DataCheckIn[]>([
    {
      kode_reservasi: "RSV-101",
      nama_member: "Andre",
      nomor_meja: "M07",
      jam_kedatangan: "19:00 WIB",
      jumlah_tamu: 4,
      sudah_checkin: false,
    },
    {
      kode_reservasi: "RSV-102",
      nama_member: "Salsa",
      nomor_meja: "M08",
      jam_kedatangan: "16:00 WIB",
      jumlah_tamu: 2,
      sudah_checkin: false,
    },
  ]);

  const prosesCheckIn = (kodeTarget: string) => {
    const kodeBersih = kodeTarget.trim().toUpperCase();
    const ditemukan = daftarBooking.find((b) => b.kode_reservasi === kodeBersih);

    if (!ditemukan) {
      setPesanStatus(`Kode reservasi ${kodeBersih} tidak ditemukan dalam daftar hari ini.`);
      return;
    }

    setDaftarBooking((prev) =>
      prev.map((b) =>
        b.kode_reservasi === kodeBersih ? { ...b, sudah_checkin: true } : b
      )
    );

    const dataLama = window.localStorage.getItem(STORAGE_KEY_MEJA_TERPAKAI);
    const daftarTerkunci: string[] = dataLama ? JSON.parse(dataLama) : [];
    if (!daftarTerkunci.includes(ditemukan.nomor_meja)) {
      window.localStorage.setItem(
        STORAGE_KEY_MEJA_TERPAKAI,
        JSON.stringify([...daftarTerkunci, ditemukan.nomor_meja])
      );
    }

    setPesanStatus(
      `Check-In berhasil untuk ${ditemukan.nama_member}. Sesi Meja ${ditemukan.nomor_meja} telah dibuka dan terkunci di Admin.`
    );
    setKodeInput("");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-800 pb-3">
        <h2 className="text-base font-bold text-white">
          Check-In Kedatangan Tamu Reservasi
        </h2>
        <p className="text-xs text-stone-400">
          Masukkan kode reservasi pelanggan untuk membuka sesi meja saat tamu tiba di kedai.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          prosesCheckIn(kodeInput);
        }}
        className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row gap-3"
      >
        <input
          type="text"
          required
          value={kodeInput}
          onChange={(e) => setKodeInput(e.target.value)}
          placeholder="Masukkan kode reservasi (Contoh: RSV-101)"
          className="flex-1 px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white uppercase"
        />
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition"
        >
          Verifikasi & Buka Sesi Meja
        </button>
      </form>

      {pesanStatus && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          {pesanStatus}
        </div>
      )}

      <div className="space-y-3">
        {daftarBooking.map((item) => (
          <div
            key={item.kode_reservasi}
            className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold">
                  {item.kode_reservasi}
                </span>
                <span className="text-sm font-bold text-white">
                  {item.nama_member} • Meja {item.nomor_meja}
                </span>
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Jadwal: {item.jam_kedatangan} ({item.jumlah_tamu} Tamu)
              </div>
            </div>

            {item.sudah_checkin ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold">
                Sesi Meja Aktif
              </span>
            ) : (
              <button
                type="button"
                onClick={() => prosesCheckIn(item.kode_reservasi)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition"
              >
                Check-In Sekarang
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}