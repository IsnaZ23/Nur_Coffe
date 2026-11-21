import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="font-hand text-2xl text-primary-soft">oops, meja tidak ada</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-primary sm:text-5xl">
        QR Tidak Dikenali
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/70">
        Kode meja pada tautan ini tidak terdaftar. Silakan pindai kembali QR yang
        tertempel di meja, atau minta bantuan kasir kami.
      </p>
      <Link
        href="/order/meja-01"
        className="mt-8 rounded-full bg-primary px-7 py-3 text-sm font-semibold tracking-wide text-cream-light transition hover:bg-primary-dark"
      >
        Coba Meja - 01
      </Link>
    </main>
  );
}
