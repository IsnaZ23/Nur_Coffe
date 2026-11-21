import type { Metadata } from "next";
import { Caveat, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-playfair",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-caveat",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Nur Coffee — Pesan dari Meja",
    template: "%s | Nur Coffee",
  },
  description:
    "Nur Coffee — pesan menu langsung dari meja lewat pemindaian QR. Secangkir waktu hangat untuk setiap momen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${caveat.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-cream text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
