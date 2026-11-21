"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginMemberPage() {
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (!identifier.trim() || !password) {
      setErrorMsg("Username atau email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      // Titik integrasi endpoint POST /api/auth/login pada tahap backend
      alert(`Validasi form login berhasil.\nAkun: ${identifier}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-amber-400 transition mb-2"
          >
            ← Kembali ke Beranda
          </Link>
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-stone-950 mx-auto mb-3">
            NC
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Masuk ke <span className="text-amber-400">Nur Coffe</span>
          </h1>
          <p className="text-xs text-stone-400">
            Masuk menggunakan akun member untuk mengelola reservasi dan
            pre-order.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur-md space-y-4 shadow-2xl"
        >
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Username atau Email *
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Contoh: nur atau nur@demo.test"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password Anda"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-bold text-sm transition shadow-lg shadow-amber-500/15"
          >
            {loading ? "Memeriksa Akun..." : "Masuk Sekarang"}
          </button>

          <div className="pt-3 border-t border-stone-800/80 flex flex-col gap-2 text-center text-xs text-stone-400">
            <p>
              Belum terdaftar sebagai member?{" "}
              <Link
                href="/auth/register"
                className="text-amber-400 hover:underline font-semibold"
              >
                Daftar akun baru
              </Link>
            </p>
            <p className="text-[11px] text-stone-500">
              Petugas Admin atau Kasir?{" "}
              <Link
                href="/staff/login"
                className="text-stone-300 hover:text-amber-400 underline"
              >
                Masuk lewat Portal Staff
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}