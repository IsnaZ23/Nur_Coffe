import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ReservasiClient from "@/components/ReservasiClient";

export default async function ReservasiPage() {
  const daftarMeja = await prisma.meja.findMany({
    where: {
      aktif: true,
      kategori_meja: "Reservasi",
    },
    orderBy: { nomor_meja: "asc" },
    select: {
      id_meja: true,
      nomor_meja: true,
      kapasitas: true,
    },
  });

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
                Reservasi Meja <span className="text-amber-400">Nur Coffe</span>
              </h1>
              <p className="text-xs text-stone-400">
                Pesan tempat lebih awal dan atur menu sebelum tiba
              </p>
            </div>
          </div>

          <Link
            href="/auth/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition"
          >
            Akun Member
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <ReservasiClient
          daftarMeja={daftarMeja}
          daftarKategori={daftarKategori}
        />
      </main>
    </div>
  );
}