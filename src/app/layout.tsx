import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";

import "./globals.css";

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const displayFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Carta Digital | El Pollon",
  description: "Carta digital moderna para El Pollon con administracion en Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
