import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navbar Utama */}
      <header className="sticky top-0 z-50 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-stone-950">
              NC
            </div>
            <span className="font-bold text-lg tracking-tight text-stone-100">
              Nur <span className="text-amber-400">Coffe</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-stone-400">
            <Link href="#layanan" className="hover:text-amber-400 transition">
              Layanan
            </Link>
            <Link href="/reservasi" className="hover:text-amber-400 transition">
              Reservasi Meja
            </Link>
            <Link
              href="/order/qr-m01-0001"
              className="hover:text-amber-400 transition"
            >
              Simulasi Scan QR
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-stone-300 hover:text-white px-3 py-1.5 transition"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2 rounded-lg transition shadow-lg shadow-amber-500/10"
            >
              Daftar Member
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 md:py-28 px-6">
          {/* Efek Cahaya Latar */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium tracking-wide mb-6">
              SISTEM PEMESANAN & RESERVASI DIGITAL
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Nikmati Kopi Pilihan Tanpa Antre di{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600">
                Nur Coffe
              </span>
            </h1>

            <p className="text-stone-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Pesan langsung dari meja lewat pemindaian QR, atau reservasi tempat
              dan pre-order menu favoritmu sebelum tiba di kedai.
            </p>

            {/* Tombol Aksi Utama Pelanggan */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/reservasi"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition shadow-xl shadow-amber-500/20"
              >
                Reservasi & Pre-Order
              </Link>
              <Link
                href="/order/qr-m01-0001"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-semibold text-sm transition"
              >
                Coba Pesan Walk-In (Meja M01)
              </Link>
            </div>
          </div>
        </section>

        {/* Kartu Alur Layanan */}
        <section id="layanan" className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-amber-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Walk-In & Scan QR
              </h3>
              <p className="text-sm text-stone-400 leading-relaxed">
                Duduk di meja, pindai kode QR meja, pilih racikan kopi beserta
                level gula dan es, lalu bayar praktis menggunakan QRIS.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-amber-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Reservasi & Pre-Order
              </h3>
              <p className="text-sm text-stone-400 leading-relaxed">
                Amankan meja untuk kerja atau diskusi kelompok. Pesananmu siap
                disajikan tepat saat kamu tiba dan melakukan check-in.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-amber-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Pantau Status Pesanan
              </h3>
              <p className="text-sm text-stone-400 leading-relaxed">
                Tidak perlu bolak-balik bertanya ke meja kasir. Pantau status
                pembayaran dan pembuatan pesanan langsung dari layar ponselmu.
              </p>
            </div>
          </div>

          {/* Pintasan Area Internal */}
          <div className="mt-12 p-5 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Pintasan Pengembangan (Portal Staff)
              </p>
              <p className="text-sm text-stone-400">
                Gunakan tautan cepat ini untuk menguji akses login dan halaman
                operasional.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/staff/login"
                className="px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-xs font-semibold text-amber-300 transition"
              >
                Login Staff
              </Link>
              <Link
                href="/kasir"
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 transition"
              >
                Dashboard Kasir →
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 transition"
              >
                Panel Admin →
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 py-6 px-6 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Nur Coffe — Sistem Pemesanan & Reservasi
        Kedai Kopi.
      </footer>
    </div>
  );
}