"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [peranSimulasi, setPeranSimulasi] = useState<"Admin" | "Kasir">("Kasir");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLoginStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password) {
      setErrorMsg("Username petugas dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      // Pada tahap backend nanti, arahkan rute berdasarkan role hasil respons POST /api/staff/login
      if (peranSimulasi === "Admin") {
        router.push("/staff/admin");
      } else {
        router.push("/staff/kasir");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-stone-950 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-amber-400 transition mb-2"
          >
            ← Kembali ke Halaman Utama
          </Link>
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold uppercase tracking-wider">
            Gerbang Internal Petugas
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Portal Staff <span className="text-amber-400">Nur Coffe</span>
          </h1>
          <p className="text-xs text-stone-400">
            Sistem akan mengarahkan Anda ke ruang kerja Admin atau Kasir sesuai hak akses akun.
          </p>
        </div>

        <form
          onSubmit={handleLoginStaff}
          className="p-6 sm:p-8 rounded-2xl bg-stone-900 border border-stone-800 space-y-4 shadow-2xl"
        >
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Simulasi Tujuan Dasbor (Sementara Sebelum API)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPeranSimulasi("Kasir")}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  peranSimulasi === "Kasir"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-stone-950 border-stone-800 text-stone-400"
                }`}
              >
                Masuk sebagai Kasir
              </button>
              <button
                type="button"
                onClick={() => setPeranSimulasi("Admin")}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  peranSimulasi === "Admin"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-stone-950 border-stone-800 text-stone-400"
                }`}
              >
                Masuk sebagai Admin
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Username Petugas *
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username petugas"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Kata Sandi *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-bold text-sm transition"
          >
            {loading ? "Memverifikasi Akun..." : `Masuk ke Dasbor ${peranSimulasi}`}
          </button>
        </form>
      </div>
    </div>
  );
}