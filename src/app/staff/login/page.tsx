"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [peranSimulasi, setPeranSimulasi] = useState<"kasir" | "admin">("kasir");
  const [pesanError, setPesanError] = useState<string>("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setPesanError("Nama pengguna dan kata sandi wajib diisi.");
      return;
    }

    setPesanError("");
    if (peranSimulasi === "admin") {
      router.push("/admin");
    } else {
      router.push("/kasir");
    }
  };

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-3xl bg-stone-900 border border-stone-800 space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Portal Internal Petugas
          </span>
          <h1 className="text-2xl font-extrabold text-white">
            Masuk Sistem Nur Coffe
          </h1>
          <p className="text-xs text-stone-400">
            Gunakan akun petugas terdaftar untuk mengakses dasbor operasional.
          </p>
        </div>

        {pesanError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {pesanError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-stone-400 mb-1.5">
              Username Petugas
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs text-stone-400 mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
            <div className="text-[11px] font-semibold text-stone-400">
              Simulasi Tujuan Dasbor (Sebelum Koneksi API MySQL)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPeranSimulasi("kasir")}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  peranSimulasi === "kasir"
                    ? "bg-amber-500 text-stone-950"
                    : "bg-stone-900 text-stone-400 hover:text-white"
                }`}
              >
                Masuk sebagai Kasir
              </button>
              <button
                type="button"
                onClick={() => setPeranSimulasi("admin")}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  peranSimulasi === "admin"
                    ? "bg-amber-500 text-stone-950"
                    : "bg-stone-900 text-stone-400 hover:text-white"
                }`}
              >
                Masuk sebagai Admin
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition"
          >
            Masuk ke Dasbor
          </button>
        </form>

        <div className="pt-2 border-t border-stone-800 text-center">
          <Link
            href="/"
            className="text-xs text-stone-400 hover:text-amber-400 transition"
          >
            Kembali ke Halaman Utama Pelanggan
          </Link>
        </div>
      </div>
    </main>
  );
}