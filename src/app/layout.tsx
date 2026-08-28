import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Montserrat } from "next/font/google";

import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const categoryFont = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-category",
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
    <html lang="es">
      <body className={`${bodyFont.variable} ${displayFont.variable} ${categoryFont.variable}`}>{children}</body>
    </html>
  );
}
