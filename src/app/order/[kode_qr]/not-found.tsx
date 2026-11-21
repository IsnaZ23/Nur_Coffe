import Link from "next/link";

export default function MejaNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full p-8 rounded-2xl bg-stone-900 border border-stone-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center font-bold mx-auto text-lg">
          !
        </div>
        <h1 className="text-xl font-bold text-white">
          Kode QR Meja Tidak Valid
        </h1>
        <p className="text-sm text-stone-400 leading-relaxed">
          Meja tidak ditemukan atau sedang dinonaktifkan sementara oleh petugas.
          Silakan pindai ulang kode QR yang tertera di meja Anda atau hubungi
          kasir.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}