"use server";

import { redirect } from "next/navigation";
import { loginKasir } from "@/lib/auth";
import { buatSesi, hapusSesi } from "@/lib/sesi";

export type StatusLogin = { pesan?: string };

export async function masuk(_prev: StatusLogin, formData: FormData): Promise<StatusLogin> {
  const username = String(formData.get("username") ?? "");
  const kataSandi = String(formData.get("kata_sandi") ?? "");

  if (!username.trim() || !kataSandi) {
    return { pesan: "Username dan kata sandi wajib diisi." };
  }

  const hasil = await loginKasir(username, kataSandi);
  if (!hasil.ok) return { pesan: hasil.pesan };

  await buatSesi(hasil.kasir);
  redirect("/kasir");
}

export async function keluar() {
  await hapusSesi();
  redirect("/login");
}
