import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Nexus Architect | Inteligencia GTM Fintech Latam",
  description: "Operación Nexo: Consolidando el universo Fintech de Latinoamérica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${dmSans.variable} font-sans antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
