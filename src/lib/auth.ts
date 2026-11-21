import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export type HasilLogin =
  | { ok: true; kasir: { id_kasir: number; nama_kasir: string; username: string } }
  | { ok: false; pesan: string };

export async function loginKasir(
  username: string,
  kataSandi: string
): Promise<HasilLogin> {
  const kasir = await prisma.kasir.findUnique({
    where: { username: username.trim() },
  });

  if (!kasir || !kasir.aktif) {
    return { ok: false, pesan: "Username atau kata sandi salah." };
  }

  const cocok = await compare(kataSandi, kasir.kata_sandi);
  if (!cocok) {
    return { ok: false, pesan: "Username atau kata sandi salah." };
  }

  return {
    ok: true,
    kasir: {
      id_kasir: kasir.id_kasir,
      nama_kasir: kasir.nama_kasir,
      username: kasir.username,
    },
  };
}
