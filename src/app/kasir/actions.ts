"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { wajibSesi } from "@/lib/sesi";
import { unggahGambar, hapusGambar } from "@/lib/cloudinary";
import { ubahStatusPesanan, konfirmasiPembayaran } from "@/lib/kasir";
import {
  buatKategori,
  buatMenu,
  hapusKategori,
  hapusMenu,
  perbaruiKategori,
  perbaruiMenu,
} from "@/lib/katalog";
import type { pesanan_status_pesanan } from "@prisma/client";

export type StatusAksi = { pesan?: string; ok?: string };

const MAKS_BAYTES = 2 * 1024 * 1024;
const JENIS_DIIZINKAN = new Set(["image/jpeg", "image/png", "image/webp"]);

function teks(formData: FormData, nama: string) {
  const nilai = formData.get(nama);
  return typeof nilai === "string" ? nilai.trim() : "";
}

function angka(formData: FormData, nama: string) {
  const nilai = Number(teks(formData, nama));
  return Number.isFinite(nilai) ? nilai : 0;
}

async function simpanGambar(berkas: File): Promise<string> {
  if (!JENIS_DIIZINKAN.has(berkas.type)) {
    throw new Error("Format gambar harus JPG, PNG, atau WEBP.");
  }
  if (berkas.size > MAKS_BAYTES) {
    throw new Error("Ukuran gambar maksimal 2 MB.");
  }

  return unggahGambar(berkas);
}

export async function aksiUbahStatus(formData: FormData) {
  const sesi = await wajibSesi();
  const nomor = teks(formData, "nomor_pesanan");
  const status = teks(formData, "status") as pesanan_status_pesanan;

  try {
    await ubahStatusPesanan(nomor, status, sesi.id_kasir);
  } catch {
    redirect("/kasir?galat=1");
  }
  revalidatePath("/kasir");
}

export async function aksiKonfirmasiBayar(formData: FormData) {
  const sesi = await wajibSesi();
  const nomor = teks(formData, "nomor_pesanan");
  await konfirmasiPembayaran(nomor, sesi.id_kasir);
  revalidatePath("/kasir");
}

export async function aksiSimpanMenu(
  _prev: StatusAksi,
  formData: FormData
): Promise<StatusAksi> {
  await wajibSesi();

  const id = angka(formData, "id_menu");
  const nama = teks(formData, "nama_menu");
  const idKategori = angka(formData, "id_kategori");
  const harga = angka(formData, "harga");

  if (!nama) return { pesan: "Nama menu wajib diisi." };
  if (!idKategori) return { pesan: "Kategori wajib dipilih." };
  if (harga <= 0) return { pesan: "Harga harus lebih dari nol." };

  const berkas = formData.get("gambar");
  const gambarLama = teks(formData, "gambar_lama") || null;
  let gambar: string | null = gambarLama;
  let gambarBaru: string | null = null;

  try {
    if (berkas instanceof File && berkas.size > 0) {
      gambarBaru = await simpanGambar(berkas);
      gambar = gambarBaru;
    }
  } catch (e) {
    return { pesan: e instanceof Error ? e.message : "Gagal mengunggah gambar." };
  }

  const data = {
    id_kategori: idKategori,
    nama_menu: nama,
    catatan_singkat: teks(formData, "catatan_singkat") || null,
    deskripsi: teks(formData, "deskripsi") || null,
    harga,
    gambar_menu: gambar,
    unggulan: formData.get("unggulan") === "on",
    tersedia: formData.get("tersedia") === "on",
  };

  try {
    if (id) await perbaruiMenu(id, data);
    else await buatMenu(data);
  } catch {
    if (gambarBaru) await hapusGambar(gambarBaru);
    return { pesan: "Gagal menyimpan menu." };
  }

  if (gambarBaru && gambarLama && gambarLama !== gambarBaru) {
    await hapusGambar(gambarLama);
  }

  revalidatePath("/kasir/menu");
  revalidatePath("/kasir");
  return { ok: id ? "Menu diperbarui." : "Menu ditambahkan." };
}

export async function aksiHapusMenu(formData: FormData) {
  await wajibSesi();
  try {
    const terhapus = await hapusMenu(angka(formData, "id_menu"));
    await hapusGambar(terhapus.gambar_menu);
  } catch (e) {
    redirect(
      `/kasir/menu?galat=${encodeURIComponent(
        e instanceof Error ? e.message : "Gagal menghapus menu."
      )}`
    );
  }
  revalidatePath("/kasir/menu");
}

export async function aksiSimpanKategori(
  _prev: StatusAksi,
  formData: FormData
): Promise<StatusAksi> {
  await wajibSesi();
  const id = angka(formData, "id_kategori");
  const nama = teks(formData, "nama_kategori");

  if (!nama) return { pesan: "Nama kategori wajib diisi." };

  try {
    if (id) await perbaruiKategori(id, nama, angka(formData, "urutan_tampil"));
    else await buatKategori(nama, angka(formData, "urutan_tampil"));
  } catch {
    return { pesan: "Gagal menyimpan kategori. Nama mungkin sudah dipakai." };
  }

  revalidatePath("/kasir/menu");
  return { ok: id ? "Kategori diperbarui." : "Kategori ditambahkan." };
}

export async function aksiHapusKategori(formData: FormData) {
  await wajibSesi();
  try {
    await hapusKategori(angka(formData, "id_kategori"));
  } catch (e) {
    redirect(
      `/kasir/menu?galat=${encodeURIComponent(
        e instanceof Error ? e.message : "Gagal menghapus kategori."
      )}`
    );
  }
  revalidatePath("/kasir/menu");
}