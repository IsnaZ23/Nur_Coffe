"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { formatRupiah } from "@/lib/format";
import {
  aksiHapusKategori,
  aksiHapusMenu,
  aksiSimpanKategori,
  aksiSimpanMenu,
  type StatusAksi,
} from "../actions";

export type MenuKelolaTampil = {
  id_menu: number;
  id_kategori: number;
  nama_menu: string;
  catatan_singkat: string | null;
  deskripsi: string | null;
  harga: number;
  gambar_menu: string | null;
  unggulan: boolean;
  tersedia: boolean;
};

export type KategoriTampil = {
  id_kategori: number;
  nama_kategori: string;
  urutan_tampil: number;
};

const AWAL: StatusAksi = {};

export default function KelolaMenuClient({
  menu,
  kategori,
}: {
  menu: MenuKelolaTampil[];
  kategori: KategoriTampil[];
}) {
  const [pilih, setPilih] = useState<{
    menu: MenuKelolaTampil | null;
    cap: string | null;
  }>({ menu: null, cap: null });
  const [pilihKategori, setPilihKategori] = useState<{
    kategori: KategoriTampil | null;
    cap: string | null;
  }>({ kategori: null, cap: null });
  const [statusMenu, kirimMenu, sedangMenu] = useActionState(aksiSimpanMenu, AWAL);
  const [statusKategori, kirimKategori, sedangKategori] = useActionState(
    aksiSimpanKategori,
    AWAL
  );

  // Hasil aksi terbaru dipakai sebagai penanda: setelah sukses, form otomatis kosong.
  const menuAktif =
    statusMenu.ok && pilih.cap !== statusMenu.ok ? null : pilih.menu;
  const kategoriAktif =
    statusKategori.ok && pilihKategori.cap !== statusKategori.ok
      ? null
      : pilihKategori.kategori;

  function bukaMenu(menu: MenuKelolaTampil | null) {
    setPilih({ menu, cap: statusMenu.ok ?? null });
  }

  function bukaKategori(kategori: KategoriTampil | null) {
    setPilihKategori({ kategori, cap: statusKategori.ok ?? null });
  }

  const namaKategori = new Map(kategori.map((k) => [k.id_kategori, k.nama_kategori]));
  const keyMenu = `menu-${menuAktif?.id_menu ?? 0}-${statusMenu.ok ?? ""}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <h2 className="font-display text-2xl font-semibold text-primary">
          Daftar Menu ({menu.length})
        </h2>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-primary/15 bg-cream-light">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream text-primary">
              <tr>
                <th className="px-4 py-3 font-semibold">Gambar</th>
                <th className="px-4 py-3 font-semibold">Nama</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Harga</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {menu.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-ink/60">
                    Belum ada menu.
                  </td>
                </tr>
              )}
              {menu.map((m) => (
                <tr key={m.id_menu} className="border-t border-primary/10">
                  <td className="px-4 py-3">
                    <span className="relative block h-11 w-11 overflow-hidden rounded-lg bg-primary/10">
                      {m.gambar_menu ? (
                        <Image
                          src={m.gambar_menu}
                          alt={m.nama_menu}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-primary/50">
                          n/a
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-primary">{m.nama_menu}</span>
                    {m.unggulan && (
                      <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        Unggulan
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {namaKategori.get(m.id_kategori) ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-ink/70">{formatRupiah(m.harga)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        m.tersedia
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-red-100 text-red-900"
                      }`}
                    >
                      {m.tersedia ? "Tersedia" : "Habis"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => bukaMenu(m)}
                        className="rounded-full border border-primary/35 px-3 py-1.5 text-[11px] font-semibold text-primary transition hover:bg-primary/10"
                      >
                        Ubah
                      </button>
                      <form action={aksiHapusMenu}>
                        <input type="hidden" name="id_menu" value={m.id_menu} />
                        <button
                          type="submit"
                          className="rounded-full border border-red-300 px-3 py-1.5 text-[11px] font-semibold text-red-800 transition hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 font-display text-2xl font-semibold text-primary">
          Kategori ({kategori.length})
        </h2>
        <ul className="mt-4 space-y-2">
          {kategori.map((k) => (
            <li
              key={k.id_kategori}
              className="flex items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-cream-light px-4 py-3"
            >
              <div>
                <span className="font-medium text-primary">{k.nama_kategori}</span>
                <span className="ml-2 text-xs text-ink/50">
                  urutan {k.urutan_tampil}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => bukaKategori(k)}
                  className="rounded-full border border-primary/35 px-3 py-1.5 text-[11px] font-semibold text-primary transition hover:bg-primary/10"
                >
                  Ubah
                </button>
                <form action={aksiHapusKategori}>
                  <input type="hidden" name="id_kategori" value={k.id_kategori} />
                  <button
                    type="submit"
                    className="rounded-full border border-red-300 px-3 py-1.5 text-[11px] font-semibold text-red-800 transition hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside className="space-y-8">
        <form
          key={keyMenu}
          action={kirimMenu}
          className="rounded-2xl border border-primary/15 bg-cream-light p-5"
        >
          <h3 className="font-display text-xl font-semibold text-primary">
            {menuAktif ? "Ubah Menu" : "Tambah Menu"}
          </h3>

          <input type="hidden" name="id_menu" value={menuAktif?.id_menu ?? 0} />
          <input
            type="hidden"
            name="gambar_lama"
            value={menuAktif?.gambar_menu ?? ""}
          />

          <label className="mt-4 block">
            <span className="text-sm font-semibold text-primary">Nama menu</span>
            <input
              name="nama_menu"
              required
              defaultValue={menuAktif?.nama_menu ?? ""}
              className="mt-1.5 w-full rounded-xl border border-primary/25 bg-cream px-3 py-2 text-sm outline-none focus:border-primary/60"
            />
          </label>

          <label className="mt-3 block">
            <span className="text-sm font-semibold text-primary">Kategori</span>
            <select
              name="id_kategori"
              required
              defaultValue={menuAktif?.id_kategori ?? kategori[0]?.id_kategori ?? ""}
              className="mt-1.5 w-full rounded-xl border border-primary/25 bg-cream px-3 py-2 text-sm outline-none focus:border-primary/60"
            >
              {kategori.map((k) => (
                <option key={k.id_kategori} value={k.id_kategori}>
                  {k.nama_kategori}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-3 block">
            <span className="text-sm font-semibold text-primary">
              Catatan singkat
            </span>
            <input
              name="catatan_singkat"
              defaultValue={menuAktif?.catatan_singkat ?? ""}
              placeholder="cth. freshly brewed"
              className="mt-1.5 w-full rounded-xl border border-primary/25 bg-cream px-3 py-2 text-sm outline-none focus:border-primary/60"
            />
          </label>

          <label className="mt-3 block">
            <span className="text-sm font-semibold text-primary">Deskripsi</span>
            <textarea
              name="deskripsi"
              rows={2}
              defaultValue={menuAktif?.deskripsi ?? ""}
              className="mt-1.5 w-full resize-none rounded-xl border border-primary/25 bg-cream px-3 py-2 text-sm outline-none focus:border-primary/60"
            />
          </label>

          <label className="mt-3 block">
            <span className="text-sm font-semibold text-primary">Harga (Rp)</span>
            <input
              name="harga"
              type="number"
              min={1}
              required
              defaultValue={menuAktif?.harga ?? ""}
              className="mt-1.5 w-full rounded-xl border border-primary/25 bg-cream px-3 py-2 text-sm outline-none focus:border-primary/60"
            />
          </label>

          <label className="mt-3 block">
            <span className="text-sm font-semibold text-primary">
              Foto menu{" "}
              <span className="font-normal text-ink/50">(JPG/PNG/WEBP, maks 2 MB)</span>
            </span>
            <input
              name="gambar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-1.5 w-full text-xs text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cream-light"
            />
          </label>

          <div className="mt-4 flex gap-5">
            <label className="inline-flex items-center gap-2 text-sm text-primary">
              <input
                name="tersedia"
                type="checkbox"
                defaultChecked={menuAktif ? menuAktif.tersedia : true}
                className="h-4 w-4 accent-[#6e3511]"
              />
              Tersedia
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-primary">
              <input
                name="unggulan"
                type="checkbox"
                defaultChecked={menuAktif?.unggulan ?? false}
                className="h-4 w-4 accent-[#6e3511]"
              />
              Unggulan
            </label>
          </div>

          {statusMenu.pesan && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-800">
              {statusMenu.pesan}
            </p>
          )}
          {statusMenu.ok && (
            <p className="mt-3 text-sm font-medium text-emerald-800">
              {statusMenu.ok}
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              disabled={sedangMenu}
              className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-cream-light transition hover:bg-primary-dark disabled:bg-ink/30"
            >
              {sedangMenu ? "Menyimpan…" : menuAktif ? "Simpan Perubahan" : "Tambah Menu"}
            </button>
            {menuAktif && (
              <button
                type="button"
                onClick={() => bukaMenu(null)}
                className="rounded-full border border-primary/30 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <form
          key={`kategori-${kategoriAktif?.id_kategori ?? 0}-${statusKategori.ok ?? ""}`}
          action={kirimKategori}
          className="rounded-2xl border border-primary/15 bg-cream-light p-5"
        >
          <h3 className="font-display text-xl font-semibold text-primary">
            {pilihKategori ? "Ubah Kategori" : "Tambah Kategori"}
          </h3>

          <input
            type="hidden"
            name="id_kategori"
            value={kategoriAktif?.id_kategori ?? 0}
          />

          <label className="mt-4 block">
            <span className="text-sm font-semibold text-primary">Nama kategori</span>
            <input
              name="nama_kategori"
              required
              defaultValue={kategoriAktif?.nama_kategori ?? ""}
              placeholder="cth. Manual Brew"
              className="mt-1.5 w-full rounded-xl border border-primary/25 bg-cream px-3 py-2 text-sm outline-none focus:border-primary/60"
            />
          </label>

          <label className="mt-3 block">
            <span className="text-sm font-semibold text-primary">Urutan tampil</span>
            <input
              name="urutan_tampil"
              type="number"
              min={0}
              defaultValue={kategoriAktif?.urutan_tampil ?? kategori.length + 1}
              className="mt-1.5 w-full rounded-xl border border-primary/25 bg-cream px-3 py-2 text-sm outline-none focus:border-primary/60"
            />
          </label>

          {statusKategori.pesan && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-800">
              {statusKategori.pesan}
            </p>
          )}
          {statusKategori.ok && (
            <p className="mt-3 text-sm font-medium text-emerald-800">
              {statusKategori.ok}
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              disabled={sedangKategori}
              className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-cream-light transition hover:bg-primary-dark disabled:bg-ink/30"
            >
              {sedangKategori ? "Menyimpan…" : "Simpan Kategori"}
            </button>
            {pilihKategori && (
              <button
                type="button"
                onClick={() => bukaKategori(null)}
                className="rounded-full border border-primary/30 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </aside>
    </div>
  );
}
