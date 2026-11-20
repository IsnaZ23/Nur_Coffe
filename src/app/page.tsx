import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  // Mengambil data kategori beserta daftar menu dari MySQL XAMPP
  const daftarKategori = await prisma.kategori.findMany({
    orderBy: { urutan_tampil: "asc" },
    include: {
      menu: {
        include: {
          menu_ukuran: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-stone-50 p-8 text-stone-900">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-amber-900">
          Kopi Senja — Uji Koneksi Pangkalan Data
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Data diambil langsung dari MySQL XAMPP (coffee_shop_nur) melalui
          Prisma ORM.
        </p>

        {daftarKategori.length === 0 ? (
          <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-800">
            Koneksi berhasil, tetapi tabel <strong>kategori</strong> masih
            kosong.
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {daftarKategori.map((kat) => (
              <section
                key={kat.id_kategori}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <h2 className="border-b pb-2 text-xl font-semibold text-amber-800">
                  {kat.nama_kategori}
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {kat.menu.map((item) => (
                    <div
                      key={item.id_menu}
                      className="flex flex-col justify-between rounded-lg border border-stone-200 p-4"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold">{item.nama_menu}</h3>
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                            {item.status_tersedia}
                          </span>
                        </div>
                        {item.deskripsi && (
                          <p className="mt-1 text-xs text-stone-500">
                            {item.deskripsi}
                          </p>
                        )}
                      </div>
                      <p className="mt-3 font-bold text-amber-900">
                        Rp {item.harga_dasar.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
