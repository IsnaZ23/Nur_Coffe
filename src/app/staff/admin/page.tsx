import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "@/components/AdminDashboardClient";

export default async function AdminDashboardPage() {
  const daftarMenu = await prisma.menu.findMany({
    orderBy: { nama_menu: "asc" },
    select: {
      id_menu: true,
      nama_menu: true,
      harga_dasar: true,
      status_tersedia: true,
    },
  });

  const daftarMeja = await prisma.meja.findMany({
    orderBy: { nomor_meja: "asc" },
    select: {
      id_meja: true,
      nomor_meja: true,
      kapasitas: true,
      kategori_meja: true,
      aktif: true,
    },
  });

  return (
    <div className="min-h-screen bg-stone-950">
      <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Mode Administrator
            </span>
            <h1 className="font-bold text-base text-white">
              Dasbor Manajemen Master <span className="text-amber-400">Nur Coffe</span>
            </h1>
          </div>
          <Link
            href="/staff/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-red-400 transition"
          >
            Keluar
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <AdminDashboardClient
          dataMenuAwal={daftarMenu}
          dataMejaAwal={daftarMeja}
        />
      </main>
    </div>
  );
}