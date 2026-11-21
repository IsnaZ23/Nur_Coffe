import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nur Coffe — Sistem Pemesanan & Reservasi",
    template: "%s | Nur Coffe",
  },
  description:
    "Pesan kopi langsung dari meja lewat pemindaian QR atau lakukan reservasi meja dan pre-order secara online di Nur Coffe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${plusJakarta.className} min-h-screen bg-stone-950 text-stone-100 antialiased selection:bg-amber-500 selection:text-stone-950`}
      >
        {children}
      </body>
    </html>
  );
}