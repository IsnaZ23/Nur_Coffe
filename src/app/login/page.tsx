"use client";

import { useActionState, useState } from "react";
import { daftar, masuk, type StatusLogin } from "./actions";

const AWAL: StatusLogin = {};

export default function LoginPage() {
  const [status, kirim, sedang] = useActionState(masuk, AWAL);
  const [statusDaftar, kirimDaftar, sedangDaftar] = useActionState(daftar, AWAL);
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const daftarMode = mode === "daftar";

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="font-hand text-2xl text-primary-soft">
            {daftarMode ? "join the team" : "welcome back"}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-primary">
            Nur Coffee
          </h1>
          <p className="mt-2 text-sm text-ink/70">
            {daftarMode ? "Daftar akun kasir baru" : "Masuk sebagai kasir"}
          </p>
        </div>

        {daftarMode ? (
          <form
            action={kirimDaftar}
            className="mt-8 rounded-[1.75rem] border border-primary/15 bg-cream-light p-6 shadow-2xl shadow-primary/25"
          >
            <label className="block">
              <span className="text-sm font-semibold text-primary">Nama</span>
              <input
                name="nama_kasir"
                autoComplete="name"
                required
                className="mt-1.5 w-full rounded-xl border border-primary/25 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-primary/60"
                placeholder="Nama lengkap"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-primary">Username</span>
              <input
                name="username"
                autoComplete="username"
                required
                className="mt-1.5 w-full rounded-xl border border-primary/25 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-primary/60"
                placeholder="kasir"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-primary">Kata sandi</span>
              <input
                name="kata_sandi"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="mt-1.5 w-full rounded-xl border border-primary/25 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-primary/60"
                placeholder="Minimal 6 karakter"
              />
            </label>

            {statusDaftar.pesan && (
              <p role="alert" className="mt-3 text-sm font-medium text-primary-dark">
                {statusDaftar.pesan}
              </p>
            )}

            <button
              type="submit"
              disabled={sedangDaftar}
              className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-semibold tracking-wide text-cream-light shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-ink/30"
            >
              {sedangDaftar ? "Mendaftarkan…" : "Daftar"}
            </button>

            <p className="mt-4 text-center text-sm text-ink/70">
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => setMode("masuk")}
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                Masuk
              </button>
            </p>
          </form>
        ) : (
          <form
            action={kirim}
            className="mt-8 rounded-[1.75rem] border border-primary/15 bg-cream-light p-6 shadow-2xl shadow-primary/25"
          >
            <label className="block">
              <span className="text-sm font-semibold text-primary">Username</span>
              <input
                name="username"
                autoComplete="username"
                required
                className="mt-1.5 w-full rounded-xl border border-primary/25 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-primary/60"
                placeholder="kasir"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-primary">Kata sandi</span>
              <input
                name="kata_sandi"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1.5 w-full rounded-xl border border-primary/25 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-primary/60"
                placeholder="••••••••"
              />
            </label>

            {status.pesan && (
              <p role="alert" className="mt-3 text-sm font-medium text-primary-dark">
                {status.pesan}
              </p>
            )}

            <button
              type="submit"
              disabled={sedang}
              className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-semibold tracking-wide text-cream-light shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-ink/30"
            >
              {sedang ? "Memeriksa…" : "Masuk"}
            </button>

            <p className="mt-4 text-center text-sm text-ink/70">
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => setMode("daftar")}
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                Daftar
              </button>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
