"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function KasirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const daftarMenuNavigasi = [
    { label: "Antrean Pesanan", href: "/kasir" },
    { label: "Check-In Reservasi", href: "/kasir/reservasi" },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-stone-800 bg-stone-900/70 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Mode Operasional Kasir
            </span>
            <h1 className="text-lg font-extrabold text-white">
              Panel Layanan Nur Coffe
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {daftarMenuNavigasi.map((item) => {
              const aktif = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    aktif
                      ? "bg-amber-500 text-stone-950"
                      : "bg-stone-800 text-stone-300 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/staff/login"
              className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-xs font-bold transition"
            >
              Keluar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}