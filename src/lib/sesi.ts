import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const NAMA_COOKIE = "sesi_kasir";
const UMUR_DETIK = 60 * 60 * 8;

export type SesiKasir = {
  id_kasir: number;
  nama_kasir: string;
  username: string;
  kedaluwarsa: number;
};

function kunci() {
  const rahasia = process.env.SESSION_SECRET;
  if (!rahasia) throw new Error("SESSION_SECRET belum diisi di .env");
  return createHmac("sha256", rahasia).update("nur-coffee-sesi").digest();
}

function tandaTangan(data: string) {
  return createHmac("sha256", kunci()).update(data).digest("base64url");
}

function bungkus(sesi: SesiKasir) {
  const data = Buffer.from(JSON.stringify(sesi)).toString("base64url");
  return `${data}.${tandaTangan(data)}`;
}

function bongkar(token: string | undefined): SesiKasir | null {
  if (!token) return null;
  const [data, tanda] = token.split(".");
  if (!data || !tanda) return null;

  const harapan = Buffer.from(tandaTangan(data));
  const diterima = Buffer.from(tanda);
  if (harapan.length !== diterima.length) return null;
  if (!timingSafeEqual(harapan, diterima)) return null;

  try {
    const sesi = JSON.parse(Buffer.from(data, "base64url").toString()) as SesiKasir;
    if (!sesi.kedaluwarsa || sesi.kedaluwarsa < Date.now()) return null;
    return sesi;
  } catch {
    return null;
  }
}

export async function buatSesi(kasir: {
  id_kasir: number;
  nama_kasir: string;
  username: string;
}) {
  const sesi: SesiKasir = {
    ...kasir,
    kedaluwarsa: Date.now() + UMUR_DETIK * 1000,
  };
  const toko = await cookies();
  toko.set(NAMA_COOKIE, bungkus(sesi), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: UMUR_DETIK,
  });
}

export async function hapusSesi() {
  const toko = await cookies();
  toko.delete(NAMA_COOKIE);
}

export async function ambilSesi(): Promise<SesiKasir | null> {
  const toko = await cookies();
  return bongkar(toko.get(NAMA_COOKIE)?.value);
}

export async function wajibSesi(): Promise<SesiKasir> {
  const sesi = await ambilSesi();
  if (!sesi) throw new Error("Tidak punya sesi kasir");
  return sesi;
}
