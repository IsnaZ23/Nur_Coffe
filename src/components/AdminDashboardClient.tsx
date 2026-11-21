"use client";

import { useEffect, useState } from "react";

type MenuAdmin = {
  id_menu: number;
  nama_menu: string;
  harga_dasar: number;
  status_tersedia: "Tersedia" | "Habis";
};

type MejaAdmin = {
  id_meja: number;
  nomor_meja: string;
  kapasitas: number;
  kategori_meja: string;
  aktif: boolean;
};

type ReservasiAdmin = {
  id_reservasi: string;
  nama_member: string;
  nomor_meja: string;
  waktu: string;
  jumlah_tamu: number;
  catatan: string;
  status_reservasi: "Menunggu Konfirmasi" | "Diterima" | "Ditolak";
};

const STORAGE_KEY_MEJA_TERPAKAI = "nur_coffe_meja_terpakai";

export default function AdminDashboardClient({
  dataMenuAwal,
  dataMejaAwal,
}: {
  dataMenuAwal: MenuAdmin[];
  dataMejaAwal: MejaAdmin[];
}) {
  const [tab, setTab] = useState<"menu" | "meja" | "reservasi">("menu");
  const [daftarMenu, setDaftarMenu] = useState<MenuAdmin[]>(dataMenuAwal);
  const [daftarMeja, setDaftarMeja] = useState<MejaAdmin[]>(dataMejaAwal);
  const [mejaTerkunciKasir, setMejaTerkunciKasir] = useState<string[]>([]);

  useEffect(() => {
    const muatStatusMejaKasir = () => {
      const tersimpan = window.localStorage.getItem(STORAGE_KEY_MEJA_TERPAKAI);
      const daftarTerkunci: string[] = tersimpan ? JSON.parse(tersimpan) : [];
      setMejaTerkunciKasir(daftarTerkunci);

      if (daftarTerkunci.length > 0) {
        setDaftarMeja((prev) =>
          prev.map((m) =>
            daftarTerkunci.includes(m.nomor_meja) ? { ...m, aktif: false } : m
          )
        );
      }
    };

    muatStatusMejaKasir();
    window.addEventListener("storage", muatStatusMejaKasir);
    return () => window.removeEventListener("storage", muatStatusMejaKasir);
  }, []);

  const [daftarReservasi, setDaftarReservasi] = useState<ReservasiAdmin[]>([
    {
      id_reservasi: "RSV-101",
      nama_member: "Andre",
      nomor_meja: "M07",
      waktu: "Hari Ini, 19:00",
      jumlah_tamu: 4,
      catatan: "Butuh stopkontak dekat meja",
      status_reservasi: "Menunggu Konfirmasi",
    },
    {
      id_reservasi: "RSV-102",
      nama_member: "Salsa",
      nomor_meja: "M08",
      waktu: "Besok, 16:00",
      jumlah_tamu: 2,
      catatan: "Area tenang",
      status_reservasi: "Diterima",
    },
  ]);

  const [namaMenuBaru, setNamaMenuBaru] = useState<string>("");
  const [hargaMenuBaru, setHargaMenuBaru] = useState<string>("");

  const handleTambahMenu = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!namaMenuBaru.trim() || !hargaMenuBaru) return;

    const itemBaru: MenuAdmin = {
      id_menu: Date.now(),
      nama_menu: namaMenuBaru.trim(),
      harga_dasar: Number(hargaMenuBaru),
      status_tersedia: "Tersedia",
    };

    setDaftarMenu((prev) => [itemBaru, ...prev]);
    setNamaMenuBaru("");
    setHargaMenuBaru("");
  };

  const handleHapusMenu = (idMenu: number) => {
    setDaftarMenu((prev) => prev.filter((item) => item.id_menu !== idMenu));
  };

  const toggleStatusMeja = (
    idMeja: number,
    nomorMeja: string,
    sedangAktif: boolean
  ) => {
    if (!sedangAktif) {
      const daftarBaru = mejaTerkunciKasir.filter((kode) => kode !== nomorMeja);
      setMejaTerkunciKasir(daftarBaru);
      window.localStorage.setItem(
        STORAGE_KEY_MEJA_TERPAKAI,
        JSON.stringify(daftarBaru)
      );
    }

    setDaftarMeja((prev) =>
      prev.map((m) => (m.id_meja === idMeja ? { ...m, aktif: !m.aktif } : m))
    );
  };

  const ubahStatusReservasi = (
    idReservasi: string,
    statusBaru: "Diterima" | "Ditolak"
  ) => {
    const targetReservasi = daftarReservasi.find(
      (r) => r.id_reservasi === idReservasi
    );

    setDaftarReservasi((prev) =>
      prev.map((r) =>
        r.id_reservasi === idReservasi
          ? { ...r, status_reservasi: statusBaru }
          : r
      )
    );

    if (statusBaru === "Diterima" && targetReservasi) {
      setDaftarMeja((prev) =>
        prev.map((m) =>
          m.nomor_meja === targetReservasi.nomor_meja
            ? { ...m, aktif: false }
            : m
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-stone-800 pb-3">
        <button
          type="button"
          onClick={() => setTab("menu")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            tab === "menu"
              ? "bg-amber-500 text-stone-950"
              : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          CRUD Katalog Menu
        </button>
        <button
          type="button"
          onClick={() => setTab("meja")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            tab === "meja"
              ? "bg-amber-500 text-stone-950"
              : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          CRUD Konfigurasi Meja
        </button>
        <button
          type="button"
          onClick={() => setTab("reservasi")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            tab === "reservasi"
              ? "bg-amber-500 text-stone-950"
              : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          Penerimaan Reservasi ({daftarReservasi.length})
        </button>
      </div>

      {/* Tab 1: CRUD Menu */}
      {tab === "menu" && (
        <div className="space-y-6">
          <form
            onSubmit={handleTambahMenu}
            className="p-5 rounded-2xl bg-stone-900 border border-stone-800 grid sm:grid-cols-3 gap-3 items-end"
          >
            <div>
              <label className="block text-xs text-stone-400 mb-1">
                Nama Menu Baru
              </label>
              <input
                type="text"
                required
                value={namaMenuBaru}
                onChange={(e) => setNamaMenuBaru(e.target.value)}
                placeholder="Contoh: Kopi Susu Gula Aren"
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1">
                Harga Dasar (Rp)
              </label>
              <input
                type="number"
                required
                min={1000}
                value={hargaMenuBaru}
                onChange={(e) => setHargaMenuBaru(e.target.value)}
                placeholder="22000"
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition"
            >
              + Tambah Menu ke Katalog
            </button>
          </form>

          <div className="space-y-2">
            {daftarMenu.map((menu) => (
              <div
                key={menu.id_menu}
                className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-white">
                    {menu.nama_menu}
                  </div>
                  <div className="text-xs text-amber-400">
                    Rp {menu.harga_dasar.toLocaleString("id-ID")} • Status:{" "}
                    {menu.status_tersedia}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleHapusMenu(menu.id_menu)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold"
                >
                  Hapus Menu
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: CRUD Meja */}
      {tab === "meja" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-400">
            Meja yang pesanannya sudah diterima oleh Kasir akan otomatis berstatus{" "}
            <span className="text-red-400 font-semibold">Terpakai</span>. Aktifkan kembali hanya apabila pelanggan sudah meninggalkan meja.
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {daftarMeja.map((meja) => {
              const dikunciKasir = mejaTerkunciKasir.includes(meja.nomor_meja);

              return (
                <div
                  key={meja.id_meja}
                  className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3"
                >
                  <div className="flex justify-between items-start gap-2">
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
                            ? "Otomatis terkunci dari order Kasir"
                            : "Dinonaktifkan manual oleh Admin"}
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                        meja.aktif
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {meja.aktif ? "Kosong / Aktif" : "Terpakai"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      toggleStatusMeja(meja.id_meja, meja.nomor_meja, meja.aktif)
                    }
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition ${
                      meja.aktif
                        ? "bg-stone-800 hover:bg-stone-700 text-white"
                        : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {meja.aktif
                      ? "Tandai Terpakai (Nonaktifkan)"
                      : "Meja Sudah Kosong, Aktifkan"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Penerimaan Reservasi oleh Admin */}
      {tab === "reservasi" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
            <div className="text-xs font-bold text-stone-300">
              Status Ketersediaan Meja Reservasi Saat Ini
            </div>
            <div className="flex flex-wrap gap-2">
              {daftarMeja
                .filter((m) => m.kategori_meja === "Reservasi")
                .map((m) => (
                  <span
                    key={m.id_meja}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      m.aktif
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}
                  >
                    Meja {m.nomor_meja}: {m.aktif ? "Tersedia" : "Sudah Terpakai"}
                  </span>
                ))}
            </div>
          </div>

          <div className="space-y-3">
            {daftarReservasi.map((res) => {
              const mejaSedangTerpakai = daftarMeja.some(
                (m) => m.nomor_meja === res.nomor_meja && !m.aktif
              );

              return (
                <div
                  key={res.id_reservasi}
                  className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold">
                        Meja {res.nomor_meja}
                      </span>
                      <span className="text-xs text-stone-400">
                        {res.id_reservasi} • Member: {res.nama_member}
                      </span>
                      {mejaSedangTerpakai && (
                        <span className="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] font-semibold">
                          Meja Sedang Terpakai
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {res.waktu} ({res.jumlah_tamu} Orang)
                    </div>
                    <div className="text-xs text-stone-400">
                      Catatan: {res.catatan || "Tidak ada catatan"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        res.status_reservasi === "Diterima"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : res.status_reservasi === "Ditolak"
                          ? "bg-red-500/15 text-red-400 border border-red-500/30"
                          : "bg-stone-800 text-stone-200"
                      }`}
                    >
                      {res.status_reservasi}
                    </span>

                    {res.status_reservasi === "Menunggu Konfirmasi" && (
                      <>
                        <button
                          type="button"
                          disabled={mejaSedangTerpakai}
                          onClick={() =>
                            ubahStatusReservasi(res.id_reservasi, "Diterima")
                          }
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-bold text-xs transition"
                        >
                          {mejaSedangTerpakai
                            ? "Meja Terpakai"
                            : "Terima Reservasi"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            ubahStatusReservasi(res.id_reservasi, "Ditolak")
                          }
                          className="px-3.5 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 font-bold text-xs transition"
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
      )}
    </div>
  );
}