"use client";

import { useState } from "react";

type UkuranItem = {
  id_menu_ukuran: number;
  label: string;
  extra_harga: number;
};

type MenuItem = {
  id_menu: number;
  nama_menu: string;
  deskripsi: string | null;
  harga_dasar: number;
  status_tersedia: "Tersedia" | "Habis";
  menu_ukuran: UkuranItem[];
};

type KategoriItem = {
  id_kategori: number;
  nama_kategori: string;
  slug: string;
  menu: MenuItem[];
};

type MejaReservasi = {
  id_meja: number;
  nomor_meja: string;
  kapasitas: number;
};

type PreOrderItem = {
  key: string;
  id_menu: number;
  nama_menu: string;
  id_menu_ukuran: number | null;
  label_ukuran: string | null;
  harga_satuan: number;
  kuantitas: number;
};

export default function ReservasiClient({
  daftarMeja,
  daftarKategori,
}: {
  daftarMeja: MejaReservasi[];
  daftarKategori: KategoriItem[];
}) {
  const [idMejaDipilih, setIdMejaDipilih] = useState<number | null>(
    daftarMeja[0]?.id_meja ?? null
  );
  const [tanggal, setTanggal] = useState<string>("");
  const [jamMulai, setJamMulai] = useState<string>("19:00");
  const [jumlahTamu, setJumlahTamu] = useState<number>(2);
  const [catatanReservasi, setCatatanReservasi] = useState<string>("");
  const [preOrderCart, setPreOrderCart] = useState<PreOrderItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const mejaAktif = daftarMeja.find((m) => m.id_meja === idMejaDipilih);

  const tambahMenuPreOrder = (menu: MenuItem) => {
    const ukuranDefault = menu.menu_ukuran[0] ?? null;
    const hargaSatuan =
      menu.harga_dasar + (ukuranDefault ? ukuranDefault.extra_harga : 0);
    const key = `${menu.id_menu}-${ukuranDefault?.id_menu_ukuran ?? "std"}`;

    setPreOrderCart((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, kuantitas: item.kuantitas + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          key,
          id_menu: menu.id_menu,
          nama_menu: menu.nama_menu,
          id_menu_ukuran: ukuranDefault?.id_menu_ukuran ?? null,
          label_ukuran: ukuranDefault?.label ?? null,
          harga_satuan: hargaSatuan,
          kuantitas: 1,
        },
      ];
    });
  };

  const ubahKuantitas = (key: string, delta: number) => {
    setPreOrderCart((prev) =>
      prev
        .map((item) =>
          item.key === key
            ? { ...item, kuantitas: item.kuantitas + delta }
            : item
        )
        .filter((item) => item.kuantitas > 0)
    );
  };

  const totalPreOrder = preOrderCart.reduce(
    (total, item) => total + item.harga_satuan * item.kuantitas,
    0
  );

  const handleSubmitReservasi = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (!idMejaDipilih) {
      setErrorMsg("Silakan pilih salah satu meja reservasi yang tersedia.");
      return;
    }

    if (!tanggal) {
      setErrorMsg("Tanggal kedatangan wajib diisi.");
      return;
    }

    if (mejaAktif && jumlahTamu > mejaAktif.kapasitas) {
      setErrorMsg(
        `Jumlah tamu (${jumlahTamu} orang) melebihi kapasitas maksimal Meja ${mejaAktif.nomor_meja} (${mejaAktif.kapasitas} orang).`
      );
      return;
    }

    alert(
      `Data reservasi siap dikirim ke API:\nMeja: ${mejaAktif?.nomor_meja}\nTanggal: ${tanggal} pukul ${jamMulai}\nTamu: ${jumlahTamu} orang\nTotal Pre-Order: Rp ${totalPreOrder.toLocaleString("id-ID")}`
    );
  };

  return (
    <form
      onSubmit={handleSubmitReservasi}
      className="grid lg:grid-cols-3 gap-8 items-start"
    >
      {/* Kolom Kiri (2/3): Jadwal, Pilihan Meja, dan Katalog Pre-Order */}
      <div className="lg:col-span-2 space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Bagian 1: Detail Waktu dan Jumlah Tamu */}
        <section className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
          <h2 className="text-base font-bold text-white">
            1. Tentukan Jadwal Kedatangan
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-stone-400 mb-1.5">
                Tanggal Kedatangan *
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1.5">
                Jam Mulai *
              </label>
              <input
                type="time"
                required
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1.5">
                Jumlah Tamu (Orang) *
              </label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={jumlahTamu}
                onChange={(e) => setJumlahTamu(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </section>

        {/* Bagian 2: Pilihan Meja Khusus Reservasi */}
        <section className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              2. Pilih Meja Reservasi
            </h2>
            <span className="text-xs text-stone-400">
              Khusus area reservasi member
            </span>
          </div>

          {daftarMeja.length === 0 ? (
            <p className="text-xs text-stone-400">
              Belum ada meja berkategori reservasi yang aktif di database.
            </p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3">
              {daftarMeja.map((meja) => {
                const terpilih = idMejaDipilih === meja.id_meja;
                return (
                  <button
                    type="button"
                    key={meja.id_meja}
                    onClick={() => setIdMejaDipilih(meja.id_meja)}
                    className={`p-4 rounded-xl border text-left transition ${
                      terpilih
                        ? "border-amber-500 bg-amber-500/15 text-amber-300"
                        : "border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700"
                    }`}
                  >
                    <div className="font-bold text-sm text-white">
                      Meja {meja.nomor_meja}
                    </div>
                    <div className="text-xs text-stone-400 mt-1">
                      Kapasitas maks. {meja.kapasitas} orang
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Bagian 3: Menu Pre-Order Opsional */}
        <section className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">
              3. Pre-Order Menu (Opsional)
            </h2>
            <p className="text-xs text-stone-400">
              Pesanan akan mulai diracik saat Anda melakukan check-in di kedai.
            </p>
          </div>

          <div className="space-y-4">
            {daftarKategori.map((kat) => (
              <div key={kat.id_kategori} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  {kat.nama_kategori}
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {kat.menu.map((item) => {
                    const habis = item.status_tersedia === "Habis";
                    return (
                      <div
                        key={item.id_menu}
                        className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {item.nama_menu}
                          </div>
                          <div className="text-xs text-amber-400">
                            Rp {item.harga_dasar.toLocaleString("id-ID")}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={habis}
                          onClick={() => tambahMenuPreOrder(item)}
                          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-40 text-xs font-semibold text-white transition"
                        >
                          {habis ? "Habis" : "+ Pilih"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Kolom Kanan (1/3): Ringkasan Reservasi */}
      <aside className="p-6 rounded-2xl bg-stone-900 border border-stone-800 sticky top-24 space-y-5">
        <h2 className="text-base font-bold text-white border-b border-stone-800 pb-3">
          Ringkasan Reservasi
        </h2>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-stone-400">
            <span>Meja Dipilih</span>
            <span className="font-semibold text-white">
              {mejaAktif ? `Meja ${mejaAktif.nomor_meja}` : "Belum dipilih"}
            </span>
          </div>
          <div className="flex justify-between text-stone-400">
            <span>Jadwal</span>
            <span className="font-semibold text-white">
              {tanggal ? `${tanggal} (${jamMulai})` : "Belum diisi"}
            </span>
          </div>
          <div className="flex justify-between text-stone-400">
            <span>Jumlah Tamu</span>
            <span className="font-semibold text-white">{jumlahTamu} Orang</span>
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t border-stone-800">
          <div className="text-xs font-semibold text-stone-300">
            Daftar Pre-Order ({preOrderCart.length} item)
          </div>
          {preOrderCart.length === 0 ? (
            <p className="text-xs text-stone-500">
              Tidak ada menu pre-order. Anda tetap bisa memesan langsung saat
              tiba di meja.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {preOrderCart.map((item) => (
                <div
                  key={item.key}
                  className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">
                      {item.nama_menu}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Rp{" "}
                      {(item.harga_satuan * item.kuantitas).toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => ubahKuantitas(item.key, -1)}
                      className="w-6 h-6 rounded bg-stone-800 text-white font-bold"
                    >
                      -
                    </button>
                    <span className="w-4 text-center text-white">
                      {item.kuantitas}
                    </span>
                    <button
                      type="button"
                      onClick={() => ubahKuantitas(item.key, 1)}
                      className="w-6 h-6 rounded bg-stone-800 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs text-stone-400 mb-1.5">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            rows={2}
            value={catatanReservasi}
            onChange={(e) => setCatatanReservasi(e.target.value)}
            placeholder="Contoh: Butuh stopkontak dekat meja"
            className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="pt-3 border-t border-stone-800 space-y-3">
          <div className="flex justify-between items-center text-sm font-bold text-white">
            <span>Estimasi Pre-Order</span>
            <span className="text-amber-400">
              Rp {totalPreOrder.toLocaleString("id-ID")}
            </span>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition shadow-lg shadow-amber-500/15"
          >
            Ajukan Reservasi Meja
          </button>
        </div>
      </aside>
    </form>
  );
}