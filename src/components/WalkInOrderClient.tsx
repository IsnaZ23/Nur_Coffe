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

type MejaInfo = {
  id_meja: number;
  nomor_meja: string;
  kode_qr: string;
};

type CartItem = {
  key: string;
  id_menu: number;
  nama_menu: string;
  id_menu_ukuran: number | null;
  label_ukuran: string | null;
  harga_satuan: number;
  ice_level: number | null;
  sugar_level: number | null;
  catatan: string;
  kuantitas: number;
};

export default function WalkInOrderClient({
  meja,
  daftarKategori,
}: {
  meja: MejaInfo;
  daftarKategori: KategoriItem[];
}) {
  const [kategoriAktif, setKategoriAktif] = useState<string>("semua");
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [isMinuman, setIsMinuman] = useState<boolean>(false);

  // State modal kustomisasi item
  const [idUkuran, setIdUkuran] = useState<number | null>(null);
  const [iceLevel, setIceLevel] = useState<number>(100);
  const [sugarLevel, setSugarLevel] = useState<number>(100);
  const [catatanItem, setCatatanItem] = useState<string>("");

  // State keranjang & form checkout guest
  const [cart, setCart] = useState<CartItem[]>([]);
  const [namaTamu, setNamaTamu] = useState<string>("");
  const [noHpTamu, setNoHpTamu] = useState<string>("");
  const [metodeBayar, setMetodeBayar] = useState<string>("QRIS");

  const bukaModalMenu = (menu: MenuItem, slugKategori: string) => {
    setSelectedMenu(menu);
    const minuman = slugKategori === "coffee" || slugKategori === "non-coffee";
    setIsMinuman(minuman);
    setIdUkuran(menu.menu_ukuran[0]?.id_menu_ukuran ?? null);
    setIceLevel(100);
    setSugarLevel(100);
    setCatatanItem("");
  };

  const tambahKeKeranjang = () => {
    if (!selectedMenu) return;

    const ukuranObj = selectedMenu.menu_ukuran.find(
      (u) => u.id_menu_ukuran === idUkuran
    );
    const hargaSatuan =
      selectedMenu.harga_dasar + (ukuranObj ? ukuranObj.extra_harga : 0);

    const itemKey = `${selectedMenu.id_menu}-${idUkuran ?? "none"}-${
      isMinuman ? iceLevel : "na"
    }-${isMinuman ? sugarLevel : "na"}-${catatanItem.trim()}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.key === itemKey);
      if (existing) {
        return prev.map((i) =>
          i.key === itemKey ? { ...i, kuantitas: i.kuantitas + 1 } : i
        );
      }
      return [
        ...prev,
        {
          key: itemKey,
          id_menu: selectedMenu.id_menu,
          nama_menu: selectedMenu.nama_menu,
          id_menu_ukuran: ukuranObj?.id_menu_ukuran ?? null,
          label_ukuran: ukuranObj?.label ?? null,
          harga_satuan: hargaSatuan,
          ice_level: isMinuman ? iceLevel : null,
          sugar_level: isMinuman ? sugarLevel : null,
          catatan: catatanItem.trim(),
          kuantitas: 1,
        },
      ];
    });

    setSelectedMenu(null);
  };

  const ubahKuantitas = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key
            ? { ...item, kuantitas: item.kuantitas + delta }
            : item
        )
        .filter((item) => item.kuantitas > 0)
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.harga_satuan * item.kuantitas,
    0
  );

  const kategoriDitampilkan =
    kategoriAktif === "semua"
      ? daftarKategori
      : daftarKategori.filter((k) => k.slug === kategoriAktif);

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      {/* Kolom Kiri (2/3): Filter Kategori & Daftar Menu */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setKategoriAktif("semua")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              kategoriAktif === "semua"
                ? "bg-amber-500 text-stone-950"
                : "bg-stone-900 text-stone-400 hover:text-white border border-stone-800"
            }`}
          >
            Semua Menu
          </button>
          {daftarKategori.map((kat) => (
            <button
              key={kat.id_kategori}
              onClick={() => setKategoriAktif(kat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                kategoriAktif === kat.slug
                  ? "bg-amber-500 text-stone-950"
                  : "bg-stone-900 text-stone-400 hover:text-white border border-stone-800"
              }`}
            >
              {kat.nama_kategori}
            </button>
          ))}
        </div>

        {kategoriDitampilkan.map((kat) => (
          <section key={kat.id_kategori} className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-stone-800 pb-2">
              {kat.nama_kategori}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {kat.menu.map((item) => {
                const habis = item.status_tersedia === "Habis";
                return (
                  <div
                    key={item.id_menu}
                    className={`p-4 rounded-2xl border flex flex-col justify-between transition ${
                      habis
                        ? "bg-stone-900/30 border-stone-800/50 opacity-60"
                        : "bg-stone-900/70 border-stone-800 hover:border-amber-500/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-white text-sm">
                          {item.nama_menu}
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            habis
                              ? "bg-red-500/15 text-red-400"
                              : "bg-emerald-500/15 text-emerald-400"
                          }`}
                        >
                          {item.status_tersedia}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                        {item.deskripsi || "Racikan spesial Nur Coffe."}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                      <span className="font-bold text-amber-400 text-sm">
                        Rp {item.harga_dasar.toLocaleString("id-ID")}
                      </span>
                      <button
                        disabled={habis}
                        onClick={() => bukaModalMenu(item, kat.slug)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-bold text-xs transition"
                      >
                        + Tambah
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Kolom Kanan (1/3): Ringkasan Keranjang & Identitas Tamu */}
      <aside className="p-5 rounded-2xl bg-stone-900 border border-stone-800 sticky top-24 space-y-5">
        <div>
          <h2 className="font-bold text-white text-base">
            Pesanan Meja {meja.nomor_meja}
          </h2>
          <p className="text-xs text-stone-400">
            Isi nama pemesan saat siap melakukan pembayaran.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-stone-800 rounded-xl text-xs text-stone-500">
            Belum ada menu dipilih.
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div
                key={item.key}
                className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs space-y-1.5"
              >
                <div className="flex justify-between font-semibold text-white">
                  <span>{item.nama_menu}</span>
                  <span>
                    Rp{" "}
                    {(item.harga_satuan * item.kuantitas).toLocaleString(
                      "id-ID"
                    )}
                  </span>
                </div>
                <p className="text-stone-400 text-[11px]">
                  {[
                    item.label_ukuran,
                    item.ice_level !== null ? `Es ${item.ice_level}%` : null,
                    item.sugar_level !== null
                      ? `Gula ${item.sugar_level}%`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" • ") || "Porsi Standar"}
                </p>
                {item.catatan && (
                  <p className="text-amber-400/90 text-[11px]">
                    Catatan: {item.catatan}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => ubahKuantitas(item.key, -1)}
                    className="w-6 h-6 rounded bg-stone-800 text-white font-bold"
                  >
                    -
                  </button>
                  <span className="font-semibold text-white">
                    {item.kuantitas}
                  </span>
                  <button
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

        {/* Form Identitas Guest */}
        <div className="space-y-3 pt-3 border-t border-stone-800">
          <div>
            <label className="block text-xs text-stone-400 mb-1">
              Nama Pemesan *
            </label>
            <input
              type="text"
              value={namaTamu}
              onChange={(e) => setNamaTamu(e.target.value)}
              placeholder="Contoh: Andre"
              className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-400 mb-1">
              No. WhatsApp / HP (Opsional)
            </label>
            <input
              type="tel"
              value={noHpTamu}
              onChange={(e) => setNoHpTamu(e.target.value)}
              placeholder="0812xxxxxxxx"
              className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-400 mb-1">
              Metode Pembayaran
            </label>
            <select
              value={metodeBayar}
              onChange={(e) => setMetodeBayar(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="QRIS">QRIS (Bayar Lunas)</option>
              <option value="Cash">Tunai di Kasir</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-800 space-y-3">
          <div className="flex justify-between items-center text-sm font-bold text-white">
            <span>Total Bayar</span>
            <span className="text-amber-400 text-base">
              Rp {subtotal.toLocaleString("id-ID")}
            </span>
          </div>
          <button
            disabled={cart.length === 0 || !namaTamu.trim()}
            onClick={() =>
              alert(
                `Siap dikirim ke API checkout!\nMeja: ${meja.nomor_meja}\nNama: ${namaTamu}\nTotal: Rp ${subtotal.toLocaleString("id-ID")}`
              )
            }
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-bold text-sm transition"
          >
            Buat Pesanan & Bayar
          </button>
        </div>
      </aside>

      {/* Modal Kustomisasi Item */}
      {selectedMenu && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-white">
                  {selectedMenu.nama_menu}
                </h3>
                <p className="text-xs text-stone-400">
                  Harga dasar Rp{" "}
                  {selectedMenu.harga_dasar.toLocaleString("id-ID")}
                </p>
              </div>
              <button
                onClick={() => setSelectedMenu(null)}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {selectedMenu.menu_ukuran.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2">
                  Pilih Ukuran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedMenu.menu_ukuran.map((uk) => (
                    <button
                      key={uk.id_menu_ukuran}
                      onClick={() => setIdUkuran(uk.id_menu_ukuran)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                        idUkuran === uk.id_menu_ukuran
                          ? "border-amber-500 bg-amber-500/15 text-amber-300"
                          : "border-stone-800 bg-stone-950 text-stone-300"
                      }`}
                    >
                      <div>{uk.label}</div>
                      <div className="text-[11px] text-stone-400">
                        {uk.extra_harga > 0
                          ? `+Rp ${uk.extra_harga.toLocaleString("id-ID")}`
                          : "Gratis"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isMinuman && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Level Es (%)
                  </label>
                  <select
                    value={iceLevel}
                    onChange={(e) => setIceLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white"
                  >
                    <option value={0}>0% (Tanpa Es / Panas)</option>
                    <option value={50}>50% (Less Ice)</option>
                    <option value={100}>100% (Normal Ice)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Level Gula (%)
                  </label>
                  <select
                    value={sugarLevel}
                    onChange={(e) => setSugarLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white"
                  >
                    <option value={0}>0% (No Sugar)</option>
                    <option value={50}>50% (Less Sugar)</option>
                    <option value={100}>100% (Normal Sugar)</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                value={catatanItem}
                onChange={(e) => setCatatanItem(e.target.value)}
                placeholder="Contoh: Sedikit pahit, pisah saus"
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white"
              />
            </div>

            <button
              onClick={tambahKeKeranjang}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition"
            >
              Simpan ke Pesanan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}