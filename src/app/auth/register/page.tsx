"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterMemberPage() {
  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    email: "",
    no_hp: "",
    password: "",
    konfirmasiPassword: "",
  });
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.username.includes(" ")) {
      setErrorMsg("Username tidak boleh mengandung spasi.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password minimal harus terdiri dari 6 karakter.");
      return;
    }

    if (formData.password !== formData.konfirmasiPassword) {
      setErrorMsg("Konfirmasi password tidak cocok dengan password utama.");
      return;
    }

    setLoading(true);
    try {
      // Titik integrasi endpoint POST /api/auth/register pada tahap backend
      alert(
        `Validasi form berhasil.\nNama: ${formData.nama}\nUsername: ${formData.username}\nEmail: ${formData.email}`
      );
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Daftar Akun <span className="text-amber-400">Member</span>
          </h1>
          <p className="text-xs text-stone-400">
            Buat akun untuk melakukan reservasi meja dan pre-order menu di Nur
            Coffe.
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
              Nama Lengkap *
            </label>
            <input
              type="text"
              name="nama"
              required
              value={formData.nama}
              onChange={handleChange}
              placeholder="Contoh: Juan Andre"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Username *
              </label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="andre_kopi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                No. WhatsApp / HP *
              </label>
              <input
                type="tel"
                name="no_hp"
                required
                value={formData.no_hp}
                onChange={handleChange}
                placeholder="0812xxxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Alamat Email *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Password *
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 karakter"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Ulangi Password *
              </label>
              <input
                type="password"
                name="konfirmasiPassword"
                required
                value={formData.konfirmasiPassword}
                onChange={handleChange}
                placeholder="Ketik ulang"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-bold text-sm transition shadow-lg shadow-amber-500/15"
          >
            {loading ? "Memproses..." : "Buat Akun Member"}
          </button>

          <p className="text-center text-xs text-stone-400 pt-2">
            Sudah punya akun member?{" "}
            <Link
              href="/auth/login"
              className="text-amber-400 hover:underline font-semibold"
            >
              Masuk di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}