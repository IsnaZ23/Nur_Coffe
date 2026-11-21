import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderClient from "@/components/OrderClient";
import { ambilKatalog, ambilMeja } from "@/lib/katalog";

type Params = { kode_qr: string };

export async function generateStaticParams() {
  try {
    const { daftarMeja } = await import("@/lib/katalog");
    const meja = await daftarMeja();
    return meja.map((m) => ({ kode_qr: m.kode_qr }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { kode_qr } = await params;
  const meja = await ambilMeja(kode_qr).catch(() => null);
  if (!meja) return { title: "Meja tidak ditemukan" };
  return {
    title: `Meja - ${meja.nomor_meja}`,
    description: `Pesan menu Nur Coffee langsung dari Meja - ${meja.nomor_meja}.`,
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { kode_qr } = await params;
  const meja = await ambilMeja(kode_qr);
  if (!meja) notFound();

  const katalog = await ambilKatalog();

  return (
    <OrderClient
      katalog={katalog}
      kodeMeja={meja.kode_qr}
      nomorMeja={meja.nomor_meja}
    />
  );
}
