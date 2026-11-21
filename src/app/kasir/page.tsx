import { antreanPesanan, riwayatPesanan } from "@/lib/kasir";
import { formatRupiah } from "@/lib/format";
import { aksiKonfirmasiBayar, aksiUbahStatus } from "./actions";
import type { pesanan_status_pesanan } from "@/generated/prisma/enums";

export const metadata = { title: "Antrean Pesanan" };
export const dynamic = "force-dynamic";

const URUTAN: pesanan_status_pesanan[] = [
  "diproses",
  "siap_saji",
  "selesai",
  "dibatalkan",
];

const LABEL: Record<pesanan_status_pesanan, string> = {
  menunggu_bayar: "Menunggu Bayar",
  diproses: "Diproses",
  siap_saji: "Siap Disajikan",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const WARNA: Record<pesanan_status_pesanan, string> = {
  menunggu_bayar: "bg-amber-100 text-amber-900",
  diproses: "bg-primary/15 text-primary",
  siap_saji: "bg-emerald-100 text-emerald-900",
  selesai: "bg-ink/10 text-ink/70",
  dibatalkan: "bg-red-100 text-red-900",
};

export default async function KasirPage() {
  const [antrean, riwayat] = await Promise.all([antreanPesanan(), riwayatPesanan(10)]);

  return (
    <div>
      <header>
        <p className="font-hand text-2xl text-primary-soft">queue board</p>
        <h1 className="font-display text-3xl font-semibold text-primary">
          Antrean Pesanan
        </h1>
        <p className="mt-1 text-sm text-ink/70">
          Verifikasi pembayaran lalu update status pesanan secara berurutan.
        </p>
      </header>

      {antrean.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-primary/30 bg-cream-light p-10 text-center font-hand text-2xl text-primary/60">
          belum ada pesanan aktif
        </p>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {antrean.map((p) => (
            <article
              key={p.id_pesanan}
              className="rounded-2xl border border-primary/15 bg-cream-light p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-primary">
                    Meja - {p.nomor_meja}
                  </h2>
                  <p className="text-sm text-ink/70">{p.nama_pemesan}</p>
                  <p className="text-xs text-ink/50">{p.nomor_pesanan}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold ${WARNA[p.status_pesanan]}`}
                  >
                    {LABEL[p.status_pesanan]}
                  </span>
                  <p className="mt-1 text-[11px] font-semibold text-ink/60">
                    {p.status_bayar === "lunas" ? "Lunas" : "Belum Bayar"} ·{" "}
                    {p.metode_bayar === "qris" ? "QRIS" : "Tunai"}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-1.5 border-t border-primary/15 pt-3 text-sm text-ink/80">
                {p.items.map((i) => (
                  <li key={i.id_detail} className="flex justify-between gap-3">
                    <span>
                      {i.jumlah}× {i.nama_menu}
                      {i.catatan_item && (
                        <em className="block text-xs text-ink/55">
                          “{i.catatan_item}”
                        </em>
                      )}
                    </span>
                    <span>{formatRupiah(i.subtotal)}</span>
                  </li>
                ))}
              </ul>

              {p.catatan_pesanan && (
                <p className="mt-3 rounded-xl bg-cream p-3 text-xs text-ink/70">
                  Catatan: {p.catatan_pesanan}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-primary/15 pt-3">
                <span className="font-display text-lg font-semibold text-primary">
                  {formatRupiah(p.total_harga)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {p.status_bayar === "menunggu_bayar" && (
                  <form action={aksiKonfirmasiBayar}>
                    <input type="hidden" name="nomor_pesanan" value={p.nomor_pesanan} />
                    <button
                      type="submit"
                      className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-cream-light transition hover:bg-primary-dark"
                    >
                      Tandai Lunas
                    </button>
                  </form>
                )}

                {URUTAN.map((s) => (
                  <form key={s} action={aksiUbahStatus}>
                    <input type="hidden" name="nomor_pesanan" value={p.nomor_pesanan} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      type="submit"
                      disabled={s === "dibatalkan" && p.status_pesanan === "dibatalkan"}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold transition disabled:opacity-40 ${
                        s === "dibatalkan"
                          ? "border-red-300 text-red-800 hover:bg-red-50"
                          : "border-primary/35 text-primary hover:bg-primary/10"
                      }`}
                    >
                      {LABEL[s]}
                    </button>
                  </form>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-primary">
          Riwayat Terakhir
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-primary/15 bg-cream-light">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream text-primary">
              <tr>
                <th className="px-4 py-3 font-semibold">No. Pesanan</th>
                <th className="px-4 py-3 font-semibold">Meja</th>
                <th className="px-4 py-3 font-semibold">Pemesan</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Kasir</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-ink/60">
                    Belum ada transaksi.
                  </td>
                </tr>
              )}
              {riwayat.map((p) => (
                <tr key={p.id_pesanan} className="border-t border-primary/10">
                  <td className="px-4 py-3 text-ink/80">{p.nomor_pesanan}</td>
                  <td className="px-4 py-3 text-ink/80">{p.nomor_meja}</td>
                  <td className="px-4 py-3 text-ink/80">{p.nama_pemesan}</td>
                  <td className="px-4 py-3 text-ink/80">
                    {formatRupiah(p.total_harga)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${WARNA[p.status_pesanan]}`}
                    >
                      {LABEL[p.status_pesanan]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/60">{p.nama_kasir ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
