"use server";

import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
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

export async function daftar(
  _prev: StatusLogin,
  formData: FormData
): Promise<StatusLogin> {
  const nama = String(formData.get("nama_kasir") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const kataSandi = String(formData.get("kata_sandi") ?? "");

  if (!nama) return { pesan: "Nama wajib diisi." };
  if (!username) return { pesan: "Username wajib diisi." };
  if (kataSandi.length < 6) return { pesan: "Kata sandi minimal 6 karakter." };

  try {
    const kasirBaru = await prisma.kasir.create({
      data: {
        nama_kasir: nama,
        username,
        kata_sandi: await hash(kataSandi, 10),
      },
    });
    await buatSesi(kasirBaru);
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return { pesan: "Username sudah dipakai, pilih yang lain." };
    }
    return { pesan: "Gagal mendaftar. Coba lagi." };
  }

  redirect("/kasir");
}

export async function keluar() {
  await hapusSesi();
  redirect("/login");
}
