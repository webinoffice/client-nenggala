import type { Metadata } from "next";
import { Geist, Oswald } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nenggala Academy — Berlatih, Berkarya, Berprestasi",
  description:
    "Sekolah beladiri Taekwondo, Nunchaku-Do, dan Gymnastic dengan pelatih bersertifikat internasional di Jakarta dan Tangerang.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${oswald.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
