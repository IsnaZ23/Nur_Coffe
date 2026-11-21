"use client";

import { useActionState } from "react";
import { masuk, type StatusLogin } from "./actions";

const AWAL: StatusLogin = {};

export default function LoginPage() {
  const [status, kirim, sedang] = useActionState(masuk, AWAL);

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="font-hand text-2xl text-cream">welcome back</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-cream-light">
            Nur Coffee
          </h1>
          <p className="mt-2 text-sm text-cream/75">Masuk sebagai kasir</p>
        </div>

        <form
          action={kirim}
          className="mt-8 rounded-[1.75rem] bg-cream-light p-6 shadow-2xl shadow-ink/30"
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
            <p role="alert" className="mt-3 text-sm font-medium text-red-800">
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
        </form>
      </div>
    </main>
  );
}
