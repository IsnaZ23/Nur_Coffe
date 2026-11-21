import Link from "next/link";
import KasirDashboardClient from "@/components/KasirDashboardClient";

export default function KasirDashboardPage() {
  return (
    <div className="min-h-screen bg-stone-950">
      <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Mode Operasional Kasir
            </span>
            <h1 className="font-bold text-base text-white">
              Dasbor Transaksi & Meja <span className="text-amber-400">Nur Coffe</span>
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
        <KasirDashboardClient />
      </main>
    </div>
  );
}