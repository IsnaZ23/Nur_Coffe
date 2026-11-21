import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WalkInOrderClient from "@/components/WalkInOrderClient";

interface PageProps {
  params: Promise<{ kode_qr: string }>;
}

export default async function WalkInOrderPage({ params }: PageProps) {
  const { kode_qr } = await params;

  // 1. Validasi kode_qr pada tabel meja
  const meja = await prisma.meja.findUnique({
    where: { kode_qr },
  });

  if (!meja || !meja.aktif) {
    notFound();
  }

  // 2. Cek apakah meja sudah memiliki sesi_meja aktif
  const sesiAktif = await prisma.sesi_meja.findFirst({
    where: {
      id_meja: meja.id_meja,
      status: "aktif",
    },
  });

  // 3. Ambil seluruh kategori beserta menu dan varian ukurannya
  const daftarKategori = await prisma.kategori.findMany({
    orderBy: { urutan_tampil: "asc" },
    include: {
      menu: {
        orderBy: { nama_menu: "asc" },
        include: {
          menu_ukuran: {
            orderBy: { extra_harga: "asc" },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen">
      {/* Header Info Meja */}
      <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition"
            >
              ← Beranda
            </Link>
            <div>
              <h1 className="font-bold text-base text-white">
                Nur <span className="text-amber-400">Coffe</span>
              </h1>
              <p className="text-xs text-stone-400">
                Pemesanan Langsung • Kapasitas {meja.kapasitas} Orang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
              Meja {meja.nomor_meja}
            </span>
            {sesiAktif && (
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                Sesi Aktif
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Katalog Menu & Keranjang Checkout */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <WalkInOrderClient meja={meja} daftarKategori={daftarKategori} />
      </main>
    </div>
  );
}