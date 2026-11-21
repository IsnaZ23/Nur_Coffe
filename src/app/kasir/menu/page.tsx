import { prisma } from "@/lib/prisma";
import { daftarMenuKelola } from "@/lib/katalog";
import KelolaMenuClient from "./KelolaMenuClient";

export const metadata = { title: "Menu & Kategori" };
export const dynamic = "force-dynamic";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string }>;
}) {
  const { galat } = await searchParams;

  const [menu, kategori] = await Promise.all([
    daftarMenuKelola(),
    prisma.kategori.findMany({
      orderBy: { urutan_tampil: "asc" },
      select: { id_kategori: true, nama_kategori: true, urutan_tampil: true },
    }),
  ]);

  return (
    <div>
      <header className="mb-6">
        <p className="font-hand text-2xl text-primary-soft">catalog manager</p>
        <h1 className="font-display text-3xl font-semibold text-primary">
          Menu & Kategori
        </h1>
      </header>

      {galat && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {galat}
        </p>
      )}

      <KelolaMenuClient menu={menu} kategori={kategori} />
    </div>
  );
}
