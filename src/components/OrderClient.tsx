"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { KategoriItem, MenuItem } from "@/lib/katalog";
import { formatRupiah } from "@/lib/store";
import {
  LABEL_BAYAR,
  LABEL_STATUS,
  buatPesanan,
  konfirmasiBayar,
  storeKeranjang,
  storePesanan,
  tambahItem,
  totalKeranjang,
  ubahCatatan,
  ubahJumlah,
  type ItemKeranjang,
  type MetodeBayar,
  type PesananLokal,
} from "@/lib/pesanan";
import {
  ArrowRightIcon,
  BagIcon,
  CashIcon,
  ClockIcon,
  CloseIcon,
  CupIcon,
  LeafIcon,
  MinusIcon,
  PinIcon,
  PlusIcon,
  QrIcon,
  ReceiptIcon,
  SparkIcon,
  TrashIcon,
} from "./Icons";

const ALAMAT = "Jl. Cendana No. 12, Kediri, Jawa Timur";
const JAM_BUKA = "Setiap hari · 08.00 – 22.00 WIB";
const PETA_URL = "https://maps.google.com/?q=Nur+Coffee+Kediri";

function useKeranjang() {
  return useSyncExternalStore(
    storeKeranjang.langganan,
    storeKeranjang.baca,
    storeKeranjang.server
  );
}

function usePesanan() {
  return useSyncExternalStore(
    storePesanan.langganan,
    storePesanan.baca,
    storePesanan.server
  );
}

function MenuGambar({ item, nama }: { item: MenuItem; nama: string }) {
  const [gagal, setGagal] = useState(false);
  const src = item.gambar_menu;

  if (!src || gagal) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary-soft to-primary-dark">
        <CupIcon className="h-14 w-14 text-cream-light/80" aria-hidden="true" />
        <span className="absolute bottom-3 left-4 font-hand text-lg text-cream/80">
          {nama.split(" ")[0].toLowerCase()}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={nama}
      fill
      sizes="(max-width: 768px) 50vw, 320px"
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      onError={() => setGagal(true)}
    />
  );
}

function Pembatas() {
  return (
    <span
      className="mx-auto block h-px w-40 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      aria-hidden="true"
    />
  );
}

export default function OrderClient({
  katalog,
  kodeMeja,
  nomorMeja,
}: {
  katalog: KategoriItem[];
  kodeMeja: string;
  nomorMeja: string;
}) {
  const kategori = useMemo(
    () => katalog.filter((k) => k.menu.length > 0),
    [katalog]
  );
  const [tab, setTab] = useState<number>(kategori[0]?.id_kategori ?? 0);
  const [keranjangBuka, setKeranjangBuka] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [struk, setStruk] = useState<PesananLokal | null>(null);
  const [riwayatBuka, setRiwayatBuka] = useState(false);

  const keranjang = useKeranjang();
  const riwayat = usePesanan();
  const items = keranjang.kode_meja === kodeMeja ? keranjang.items : [];
  const total = totalKeranjang(items);
  const jumlahItem = items.reduce((n, i) => n + i.jumlah, 0);

  const semuaMenu = useMemo(
    () => kategori.flatMap((k) => k.menu),
    [kategori]
  );
  const unggulan = useMemo(
    () => semuaMenu.filter((m) => m.unggulan && m.tersedia).slice(0, 3),
    [semuaMenu]
  );

  const menuTab = kategori.find((k) => k.id_kategori === tab);
  const daftarMenu = menuTab
    ? menuTab.menu
    : unggulan.length > 0
      ? unggulan
      : semuaMenu;

  const riwayatMeja = riwayat.filter((p) => p.kode_meja === kodeMeja);

  return (
    <div className="relative overflow-x-hidden">
      <Navbar
        jumlahItem={jumlahItem}
        nomorMeja={nomorMeja}
        onKeranjang={() => setKeranjangBuka(true)}
        onRiwayat={() => setRiwayatBuka(true)}
      />

      <Hero onExplore={() => scrollKe("menu")} />
      <About />
      <MenuSection
        kategori={kategori}
        tab={tab}
        setTab={setTab}
        judul={unggulan.length > 0 && tab === kategori[0]?.id_kategori ? "Best Seller" : "Our Menu"}
        daftar={daftarMenu}
        onTambah={(menu) =>
          tambahItem(
            {
              id_menu: menu.id_menu,
              nama_menu: menu.nama_menu,
              harga: menu.harga,
              gambar_menu: menu.gambar_menu,
            },
            kodeMeja
          )
        }
      />
      <Maps />

      <KeranjangPanel
        buka={keranjangBuka}
        items={items}
        total={total}
        onTutup={() => setKeranjangBuka(false)}
        onCheckout={() => {
          setKeranjangBuka(false);
          setCheckout(true);
        }}
      />

      {checkout && (
        <CheckoutModal
          items={items}
          total={total}
          onTutup={() => setCheckout(false)}
          onSukses={(pesanan) => {
            setCheckout(false);
            setStruk(pesanan);
          }}
          kodeMeja={kodeMeja}
          nomorMeja={nomorMeja}
        />
      )}

      {struk && (
        <StrukModal
          pesanan={struk}
          onTutup={() => setStruk(null)}
          onBayar={(nomor) => {
            konfirmasiBayar(nomor);
            setStruk((s) =>
              s && s.nomor_pesanan === nomor
                ? { ...s, status_bayar: "lunas", status_pesanan: "diproses" }
                : s
            );
          }}
        />
      )}

      {riwayatBuka && (
        <RiwayatModal
          riwayat={riwayatMeja}
          nomorMeja={nomorMeja}
          onTutup={() => setRiwayatBuka(false)}
        />
      )}
    </div>
  );
}

function scrollKe(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Navbar({
  jumlahItem,
  nomorMeja,
  onKeranjang,
  onRiwayat,
}: {
  jumlahItem: number;
  nomorMeja: string;
  onKeranjang: () => void;
  onRiwayat: () => void;
}) {
  const [padat, setPadat] = useState(false);

  useEffect(() => {
    const onScroll = () => setPadat(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tautan = [
    { label: "Explore", id: "explore" },
    { label: "About", id: "about" },
    { label: "Menu", id: "menu" },
    { label: "Maps", id: "maps" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        padat
          ? "bg-cream/95 shadow-[0_10px_30px_-18px_rgba(110,53,17,0.55)] backdrop-blur"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <ul
          className={`hidden items-center gap-7 text-sm font-medium tracking-wide md:flex ${
            padat ? "text-ink" : "text-cream-light"
          }`}
        >
          {tautan.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => scrollKe(t.id)}
                className="transition-colors hover:text-primary-soft focus-visible:text-primary-soft focus-visible:outline-none"
                style={padat ? undefined : { textShadow: "0 1px 6px rgba(43,26,14,.6)" }}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5 md:gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide ${
              padat
                ? "bg-primary text-cream-light"
                : "bg-primary/85 text-cream-light backdrop-blur"
            }`}
          >
            <PinIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Meja - {nomorMeja}
          </span>

          <span
            className={`font-display text-lg italic font-semibold ${
              padat ? "text-primary" : "text-cream-light"
            }`}
            style={padat ? undefined : { textShadow: "0 1px 8px rgba(43,26,14,.6)" }}
          >
            Nur Coffee
          </span>

          <button
            type="button"
            onClick={onRiwayat}
            className={`hidden rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition sm:inline-flex ${
              padat
                ? "border-primary/40 text-primary hover:bg-primary hover:text-cream-light"
                : "border-cream-light/60 text-cream-light hover:bg-cream-light/15 backdrop-blur"
            }`}
          >
            Riwayat Order
          </button>

          <button
            type="button"
            onClick={onKeranjang}
            aria-label={`Buka keranjang, ${jumlahItem} item`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-cream-light shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
          >
            <BagIcon className="h-5 w-5" aria-hidden="true" />
            {jumlahItem > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cream-light px-1 text-[11px] font-bold text-primary">
                {jumlahItem}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}

function Hero({ onExplore }: { onExplore: () => void }) {
  return (
    <section id="explore" className="relative isolate min-h-[100svh] overflow-hidden">
      <Image
        src="/images/bg_coffee.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/80 via-ink/65 to-primary-dark/90" />

      <div className="mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <span className="anim-fade inline-flex h-16 w-16 items-center justify-center rounded-full border border-cream-light/40 bg-cream-light/10 backdrop-blur">
          <CupIcon className="h-8 w-8 text-cream-light" aria-hidden="true" />
        </span>

        <p className="anim-up mt-6 font-hand text-2xl text-cream">
          freshly brewed everyday
        </p>

        <h1
          className="anim-up mt-2 font-display text-5xl leading-[1.05] font-semibold text-cream-light sm:text-6xl md:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          Secangkir
          <br />
          <span className="italic text-cream">Waktu</span> yang Hangat
        </h1>

        <span
          className="anim-up my-7 block h-px w-44 bg-gradient-to-r from-transparent via-cream/70 to-transparent"
          style={{ animationDelay: "140ms" }}
          aria-hidden="true"
        />

        <p
          className="anim-up max-w-xl font-display text-base italic leading-relaxed text-cream/90 sm:text-lg"
          style={{ animationDelay: "200ms" }}
        >
          Tempat sederhana untuk berhenti sejenak — kopi yang diseduh perlahan,
          ruang yang tenang, dan cerita yang tumbuh di antara tegukan.
        </p>

        <button
          type="button"
          onClick={onExplore}
          className="anim-up group mt-10 inline-flex items-center gap-2 rounded-full bg-cream-light px-8 py-3.5 text-sm font-semibold tracking-wide text-primary shadow-xl shadow-ink/40 transition hover:bg-cream hover:gap-3"
          style={{ animationDelay: "260ms" }}
        >
          Explore Menu
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="relative bg-cream px-6 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
        <div className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-2xl shadow-primary/25 md:-rotate-3">
            <Image
              src="/images/nur_coffe.webp"
              alt="Fasad kedai Nur Coffee"
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
            />
          </div>
          <span
            className="absolute -bottom-6 -right-3 hidden h-28 w-28 rounded-full border border-primary/30 md:block"
            aria-hidden="true"
          />
        </div>

        <div>
          <p className="font-hand text-2xl text-primary-soft">
            a quiet handwritten café story
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-semibold text-primary sm:text-5xl">
            Tempat Hangat
            <br />
            Dalam Secangkir Waktu
          </h2>

          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink/80">
            <p>
              Nur Coffee lahir dari kebiasaan kecil: menyeduh kopi tanpa tergesa,
              menemani pagi yang tenang, dan menyisakan ruang untuk percakapan
              panjang.
            </p>
            <p>
              Setiap biji kopi kami pilih dengan teliti dan disangrai dalam
              porsi kecil agar rasanya tetap segar. Susu, gula aren, hingga
              matcha — semuanya diracik untuk kenyamanan, bukan sekadar
              kekuatan.
            </p>
            <p>
              Semoga setiap kunjungan terasa seperti pulang: hangat, akrab, dan
              cukup pelan untuk dinikmati.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-cream-light px-4 py-2 text-xs font-semibold tracking-wide text-primary">
              <LeafIcon className="h-4 w-4" aria-hidden="true" />
              Biji lokal pilihan
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-cream-light px-4 py-2 text-xs font-semibold tracking-wide text-primary">
              <SparkIcon className="h-4 w-4" aria-hidden="true" />
              Diracik per pesanan
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MenuSection({
  kategori,
  tab,
  setTab,
  judul,
  daftar,
  onTambah,
}: {
  kategori: KategoriItem[];
  tab: number;
  setTab: (id: number) => void;
  judul: string;
  daftar: MenuItem[];
  onTambah: (menu: MenuItem) => void;
}) {
  return (
    <section id="menu" className="bg-cream-light px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <p className="font-hand text-2xl text-primary-soft">
            handwritten special menu
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold text-primary sm:text-5xl">
            {judul}
          </h2>
          <div className="mt-6">
            <Pembatas />
          </div>
        </header>

        <div className="mt-9 flex flex-wrap justify-center gap-2">
          <div className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-primary/20 bg-cream p-1.5 shadow-sm">
            {kategori.map((k) => (
              <button
                key={k.id_kategori}
                type="button"
                onClick={() => setTab(k.id_kategori)}
                aria-pressed={tab === k.id_kategori}
                className={`rounded-full px-5 py-2 text-sm font-semibold tracking-wide transition ${
                  tab === k.id_kategori
                    ? "bg-primary text-cream-light shadow-md shadow-primary/30"
                    : "text-primary/75 hover:bg-primary/10"
                }`}
              >
                {k.nama_kategori}
              </button>
            ))}
          </div>
        </div>

        {daftar.length === 0 ? (
          <p className="mt-16 text-center font-hand text-2xl text-primary/60">
            belum ada menu di kategori ini
          </p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {daftar.map((menu) => (
              <KartuMenu key={menu.id_menu} menu={menu} onTambah={onTambah} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function KartuMenu({
  menu,
  onTambah,
}: {
  menu: MenuItem;
  onTambah: (menu: MenuItem) => void;
}) {
  const habis = !menu.tersedia;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-primary/10 bg-cream shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/15">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <MenuGambar item={menu} nama={menu.nama_menu} />
        {menu.unggulan && (
          <span className="absolute left-4 top-4 rounded-full bg-cream-light/95 px-3 py-1 text-[11px] font-bold tracking-wide text-primary">
            Best Seller
          </span>
        )}
        {habis && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/65">
            <span className="rounded-full bg-cream-light px-4 py-1.5 text-xs font-bold tracking-wide text-primary">
              Habis
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {menu.catatan_singkat && (
          <p className="font-hand text-lg text-primary-soft">
            {menu.catatan_singkat}
          </p>
        )}
        <h3 className="mt-1 font-display text-xl font-semibold text-primary">
          {menu.nama_menu}
        </h3>
        {menu.deskripsi && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/70">
            {menu.deskripsi}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 pt-2">
          <span className="font-display text-lg font-semibold text-primary">
            {formatRupiah(menu.harga)}
          </span>
          <button
            type="button"
            disabled={habis}
            onClick={() => onTambah(menu)}
            aria-label={`Tambah ${menu.nama_menu} ke keranjang`}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-cream-light shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-ink/25 disabled:shadow-none"
          >
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

function KeranjangPanel({
  buka,
  items,
  total,
  onTutup,
  onCheckout,
}: {
  buka: boolean;
  items: ItemKeranjang[];
  total: number;
  onTutup: () => void;
  onCheckout: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 ${buka ? "" : "pointer-events-none"}`}
      aria-hidden={!buka}
    >
      <div
        onClick={onTutup}
        className={`absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-300 ${
          buka ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Keranjang pesanan"
        aria-modal="true"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream-light shadow-2xl transition-transform duration-300 ${
          buka ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-primary/15 px-6 py-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-primary">
              Keranjang
            </h2>
            <p className="font-hand text-lg text-primary-soft">
              {items.length} pilihan menu
            </p>
          </div>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup keranjang"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-primary/10"
          >
            <CloseIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <BagIcon className="h-12 w-12 text-primary/35" aria-hidden="true" />
              <p className="mt-4 font-hand text-2xl text-primary/60">
                keranjang masih kosong
              </p>
              <p className="mt-1 text-sm text-ink/60">
                Pilih menu favoritmu dari katalog.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id_menu}
                  className="rounded-2xl border border-primary/10 bg-cream p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-primary">
                        {item.nama_menu}
                      </h3>
                      <p className="text-sm text-ink/70">
                        {formatRupiah(item.harga)}
                      </p>
                    </div>
                    <span className="font-display text-base font-semibold text-primary">
                      {formatRupiah(item.harga * item.jumlah)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-primary/25 bg-cream-light">
                      <button
                        type="button"
                        onClick={() => ubahJumlah(item.id_menu, -1)}
                        aria-label={`Kurangi ${item.nama_menu}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-primary transition hover:bg-primary/10"
                      >
                        <MinusIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className="min-w-7 text-center text-sm font-semibold text-primary">
                        {item.jumlah}
                      </span>
                      <button
                        type="button"
                        onClick={() => ubahJumlah(item.id_menu, 1)}
                        aria-label={`Tambah ${item.nama_menu}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-primary transition hover:bg-primary/10"
                      >
                        <PlusIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => ubahJumlah(item.id_menu, -item.jumlah)}
                      className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-primary/60 transition hover:text-primary"
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden="true" />
                      Hapus
                    </button>
                  </div>

                  <label className="mt-3 block">
                    <span className="text-xs font-semibold tracking-wide text-primary/70">
                      Catatan item
                    </span>
                    <input
                      type="text"
                      value={item.catatan_item ?? ""}
                      onChange={(e) => ubahCatatan(item.id_menu, e.target.value)}
                      placeholder="cth. less ice, tanpa gula"
                      className="mt-1 w-full rounded-xl border border-primary/20 bg-cream-light px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-primary/60"
                    />
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-primary/15 bg-cream px-6 py-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink/70">Total</span>
            <span className="font-display text-2xl font-semibold text-primary">
              {formatRupiah(total)}
            </span>
          </div>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={onCheckout}
            className="mt-4 w-full rounded-full bg-primary py-3.5 text-sm font-semibold tracking-wide text-cream-light shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-ink/25 disabled:shadow-none"
          >
            Lanjut ke Checkout
          </button>
        </footer>
      </aside>
    </div>
  );
}

function CheckoutModal({
  items,
  total,
  kodeMeja,
  nomorMeja,
  onTutup,
  onSukses,
}: {
  items: ItemKeranjang[];
  total: number;
  kodeMeja: string;
  nomorMeja: string;
  onTutup: () => void;
  onSukses: (pesanan: PesananLokal) => void;
}) {
  const [nama, setNama] = useState("");
  const [catatan, setCatatan] = useState("");
  const [metode, setMetode] = useState<MetodeBayar>("qris");
  const [galat, setGalat] = useState<string | null>(null);
  const refNama = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refNama.current?.focus();
  }, []);

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) {
      setGalat("Nama pemesan wajib diisi.");
      refNama.current?.focus();
      return;
    }
    if (items.length === 0) {
      setGalat("Keranjang kosong.");
      return;
    }
    const pesanan = buatPesanan({
      kode_meja: kodeMeja,
      nomor_meja: nomorMeja,
      nama_pemesan: nama.trim(),
      catatan_pesanan: catatan,
      items,
      metode_bayar: metode,
    });
    onSukses(pesanan);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/55 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <form
        onSubmit={kirim}
        className="anim-up max-h-[95svh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-cream-light p-6 shadow-2xl sm:rounded-[2rem] sm:p-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-hand text-xl text-primary-soft">almost ready</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-primary">
              Konfirmasi Pesanan
            </h2>
          </div>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-primary/10"
          >
            <CloseIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <PinIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Meja - {nomorMeja}
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-primary">
              Nama pemesan
            </span>
            <input
              ref={refNama}
              type="text"
              value={nama}
              onChange={(e) => {
                setNama(e.target.value);
                if (galat) setGalat(null);
              }}
              placeholder="Nama kamu"
              aria-invalid={!!galat}
              className="mt-1.5 w-full rounded-xl border border-primary/20 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-primary/60"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-primary">
              Catatan pesanan{" "}
              <span className="font-normal text-ink/50">(opsional)</span>
            </span>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={2}
              placeholder="cth. tolong sajikan bersama"
              className="mt-1.5 w-full resize-none rounded-xl border border-primary/20 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-primary/60"
            />
          </label>

          <fieldset>
            <legend className="text-sm font-semibold text-primary">
              Metode pembayaran
            </legend>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              <TombolMetode
                aktif={metode === "qris"}
                onClick={() => setMetode("qris")}
                ikon={<QrIcon className="h-5 w-5" aria-hidden="true" />}
                label="QRIS"
              />
              <TombolMetode
                aktif={metode === "tunai"}
                onClick={() => setMetode("tunai")}
                ikon={<CashIcon className="h-5 w-5" aria-hidden="true" />}
                label="Tunai"
              />
            </div>
          </fieldset>
        </div>

        <div className="mt-6 rounded-2xl border border-primary/15 bg-cream p-4">
          <ul className="space-y-1.5 text-sm text-ink/80">
            {items.map((i) => (
              <li key={i.id_menu} className="flex justify-between gap-3">
                <span>
                  {i.jumlah}× {i.nama_menu}
                </span>
                <span>{formatRupiah(i.harga * i.jumlah)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-primary/15 pt-3">
            <span className="font-semibold text-primary">Total</span>
            <span className="font-display text-xl font-semibold text-primary">
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        {galat && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-800">
            {galat}
          </p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-semibold tracking-wide text-cream-light shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
        >
          Buat Pesanan
        </button>
      </form>
    </div>
  );
}

function TombolMetode({
  aktif,
  onClick,
  ikon,
  label,
}: {
  aktif: boolean;
  onClick: () => void;
  ikon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktif}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
        aktif
          ? "border-primary bg-primary text-cream-light shadow-md shadow-primary/25"
          : "border-primary/25 bg-cream text-primary hover:border-primary/50"
      }`}
    >
      {ikon}
      {label}
    </button>
  );
}

function StrukModal({
  pesanan,
  onTutup,
  onBayar,
}: {
  pesanan: PesananLokal;
  onTutup: () => void;
  onBayar: (nomor: string) => void;
}) {
  const [konfirmasi, setKonfirmasi] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/55 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="anim-up max-h-[95svh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-cream-light p-6 shadow-2xl sm:rounded-[2rem] sm:p-8">
        <div className="text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ReceiptIcon className="h-7 w-7 text-primary" aria-hidden="true" />
          </span>
          <h2 className="mt-3 font-display text-2xl font-semibold text-primary">
            Pesanan Diterima
          </h2>
          <p className="font-hand text-xl text-primary-soft">
            terima kasih, {pesanan.nama_pemesan.toLowerCase()}
          </p>
        </div>

        <dl className="mt-6 space-y-2 rounded-2xl border border-dashed border-primary/30 bg-cream p-4 text-sm">
          <Baris label="No. Pesanan" nilai={pesanan.nomor_pesanan} />
          <Baris label="Meja" nilai={`Meja - ${pesanan.nomor_meja}`} />
          <Baris
            label="Metode"
            nilai={pesanan.metode_bayar === "qris" ? "QRIS" : "Tunai"}
          />
          <Baris label="Pembayaran" nilai={LABEL_BAYAR[pesanan.status_bayar]} />
          <Baris
            label="Status"
            nilai={LABEL_STATUS[pesanan.status_pesanan]}
          />
        </dl>

        <ul className="mt-4 space-y-2 text-sm text-ink/80">
          {pesanan.items.map((i) => (
            <li key={i.id_menu} className="flex justify-between gap-3">
              <span>
                {i.jumlah}× {i.nama_menu}
                {i.catatan_item && (
                  <em className="block text-xs text-ink/55">“{i.catatan_item}”</em>
                )}
              </span>
              <span>{formatRupiah(i.harga * i.jumlah)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-primary/15 pt-3">
          <span className="font-semibold text-primary">Total</span>
          <span className="font-display text-xl font-semibold text-primary">
            {formatRupiah(pesanan.total_harga)}
          </span>
        </div>

        {pesanan.status_bayar === "menunggu_bayar" && (
          <div className="mt-6 rounded-2xl border border-primary/20 bg-cream p-4 text-center">
            {pesanan.metode_bayar === "qris" ? (
              <>
                <p className="text-sm font-medium text-ink/75">
                  Pindai kode QRIS berikut untuk membayar
                </p>
                <div className="mx-auto mt-4 flex h-40 w-40 items-center justify-center rounded-2xl border border-primary/25 bg-cream-light">
                  <QrIcon className="h-24 w-24 text-primary" aria-hidden="true" />
                </div>
                <p className="mt-3 text-xs text-ink/60">
                  Setelah membayar, tekan tombol di bawah. Kasir akan memverifikasi.
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-ink/75">
                Silakan bayar tunai di kasir. Kasir akan menandai pesanan sebagai lunas.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          {pesanan.status_bayar === "menunggu_bayar" && (
            <button
              type="button"
              onClick={() => setKonfirmasi(true)}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold tracking-wide text-cream-light shadow-lg shadow-primary/30 transition hover:bg-primary-dark"
            >
              Saya Sudah Bayar
            </button>
          )}
          <button
            type="button"
            onClick={onTutup}
            className="w-full rounded-full border border-primary/30 py-3 text-sm font-semibold tracking-wide text-primary transition hover:bg-primary/10"
          >
            Tutup
          </button>
        </div>
      </div>

      {konfirmasi && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-6 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Konfirmasi pembayaran"
            className="anim-fade w-full max-w-sm rounded-3xl bg-cream-light p-6 text-center shadow-2xl"
          >
            <h3 className="font-display text-xl font-semibold text-primary">
              Konfirmasi pembayaran?
            </h3>
            <p className="mt-2 text-sm text-ink/70">
              Tandai pesanan {pesanan.nomor_pesanan} sebagai sudah dibayar.
              Kasir tetap memverifikasi sebelum pesanan diproses.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setKonfirmasi(false)}
                className="flex-1 rounded-full border border-primary/30 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onBayar(pesanan.nomor_pesanan);
                  setKonfirmasi(false);
                }}
                className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-cream-light transition hover:bg-primary-dark"
              >
                Ya, sudah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Baris({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink/60">{label}</dt>
      <dd className="font-semibold text-primary">{nilai}</dd>
    </div>
  );
}

function RiwayatModal({
  riwayat,
  nomorMeja,
  onTutup,
}: {
  riwayat: PesananLokal[];
  nomorMeja: string;
  onTutup: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/55 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="anim-up max-h-[95svh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-cream-light p-6 shadow-2xl sm:rounded-[2rem] sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-hand text-xl text-primary-soft">
              your coffee moments
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-primary">
              Riwayat Order
            </h2>
          </div>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-primary/10"
          >
            <CloseIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <PinIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Meja - {nomorMeja}
        </p>

        {riwayat.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <ClockIcon className="h-12 w-12 text-primary/35" aria-hidden="true" />
            <p className="mt-4 font-hand text-2xl text-primary/60">
              belum ada riwayat pesanan
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {riwayat.map((p) => (
              <li
                key={p.nomor_pesanan}
                className="rounded-2xl border border-primary/15 bg-cream p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-base font-semibold text-primary">
                    {p.nomor_pesanan}
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-wide text-primary">
                    {LABEL_STATUS[p.status_pesanan]}
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-ink/75">
                  {p.items.map((i) => (
                    <li key={i.id_menu}>
                      {i.jumlah}× {i.nama_menu}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-primary/15 pt-2.5 text-sm">
                  <span className="text-ink/60">
                    {LABEL_BAYAR[p.status_bayar]} ·{" "}
                    {p.metode_bayar === "qris" ? "QRIS" : "Tunai"}
                  </span>
                  <span className="font-display font-semibold text-primary">
                    {formatRupiah(p.total_harga)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Maps() {
  return (
    <section id="maps" className="bg-primary px-6 py-20 text-cream-light sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
        <div>
          <p className="font-hand text-2xl text-cream/85">find us here</p>
          <h2 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
            Kunjungi Kedai Kami
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/80">
            Mampir dan nikmati suasana tenang Nur Coffee. Meja 01–10 siap
            menemani waktu santaimu — cukup pindai QR di meja.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-cream" aria-hidden="true" />
              <span>{ALAMAT}</span>
            </li>
            <li className="flex items-start gap-3">
              <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-cream" aria-hidden="true" />
              <span>{JAM_BUKA}</span>
            </li>
          </ul>

          <a
            href={PETA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-cream-light px-7 py-3.5 text-sm font-semibold tracking-wide text-primary shadow-xl shadow-ink/30 transition hover:bg-cream hover:gap-3"
          >
            Buka di Google Maps
            <ArrowRightIcon
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-cream/25 bg-primary-dark/60 p-8">
          <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(#f4f0dd33_1px,transparent_1px),linear-gradient(90deg,#f4f0dd33_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="relative flex h-full min-h-56 flex-col items-center justify-center text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cream-light/15">
              <PinIcon className="h-8 w-8 text-cream-light" aria-hidden="true" />
            </span>
            <p className="mt-4 font-display text-2xl font-semibold">
              Nur Coffee
            </p>
            <p className="font-hand text-xl text-cream/80">Kediri, Jawa Timur</p>
          </div>
        </div>
      </div>

      <footer className="mx-auto mt-16 max-w-6xl border-t border-cream/20 pt-6 text-center text-xs text-cream/70">
        © {new Date().getFullYear()} Nur Coffee — Secangkir waktu yang hangat.
      </footer>
    </section>
  );
}
