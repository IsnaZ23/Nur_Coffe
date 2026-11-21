"use client";

export type Store<T> = {
  baca: () => T;
  tulis: (updater: (prev: T) => T) => void;
  langganan: (cb: () => void) => () => void;
  server: () => T;
};

export function createStore<T>(key: string, seed: () => T): Store<T> {
  let cache: T | null = null;
  const listeners = new Set<() => void>();
  const snapshotServer = seed();

  const baca = (): T => {
    if (cache) return cache;
    if (typeof window === "undefined") return snapshotServer;
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : snapshotServer;
    } catch {
      cache = snapshotServer;
    }
    return cache;
  };

  const tulis = (updater: (prev: T) => T) => {
    cache = updater(baca());
    try {
      window.localStorage.setItem(key, JSON.stringify(cache));
    } catch {
      // ponytail: quota/private-mode diabaikan; pindah ke DB saat backend siap.
    }
    listeners.forEach((fn) => fn());
  };

  const langganan = (cb: () => void) => {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      cache = null;
      cb();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  };

  return { baca, tulis, langganan, server: () => snapshotServer };
}

export function kodeBaru(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export function formatRupiah(nilai: number) {
  return `Rp ${nilai.toLocaleString("id-ID")}`;
}

export function formatWaktu(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTanggalPanjang(tanggal: string) {
  const d = new Date(`${tanggal}T00:00:00`);
  if (Number.isNaN(d.getTime())) return tanggal;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
