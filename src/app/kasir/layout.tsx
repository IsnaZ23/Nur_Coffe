import { redirect } from "next/navigation";
import Link from "next/link";
import { ambilSesi } from "@/lib/sesi";
import { keluar } from "../login/actions";

export const metadata = { title: "Dasbor Kasir" };

export default async function KasirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesi = await ambilSesi();
  if (!sesi) redirect("/login");

  const tautan = [
    { href: "/kasir", label: "Antrean" },
    { href: "/kasir/menu", label: "Menu & Kategori" },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-primary/15 bg-primary text-cream-light">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-6">
            <span className="font-display text-lg italic font-semibold">
              Nur Coffee
            </span>
            <nav className="flex items-center gap-1">
              {tautan.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="rounded-full px-4 py-1.5 text-sm font-medium transition hover:bg-cream-light/15"
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-cream/80">{sesi.nama_kasir}</span>
            <form action={keluar}>
              <button
                type="submit"
                className="rounded-full border border-cream-light/50 px-4 py-1.5 text-xs font-semibold transition hover:bg-cream-light/15"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
