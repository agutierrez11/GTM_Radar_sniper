import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const siteUrlRaw =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://nerv.equalitech.xyz";

const title = "NERV | El sistema nervioso del ecosistema Fintech Latam";
const description =
  "GTM Intelligence OS: dossier forense, ICP score y plan de ataque para equipos B2B Fintech en Latinoamérica — en segundos.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrlRaw),
  title: {
    default: title,
    template: "%s | NERV",
  },
  description,
  applicationName: "NERV",
  keywords: [
    "GTM",
    "Fintech",
    "Latam",
    "B2B",
    "ICP",
    "inteligencia comercial",
    "NERV",
  ],
  authors: [{ name: "NERV" }],
  robots: { index: true, follow: true },
  alternates: {
    canonical: siteUrlRaw,
  },
  icons: {
    icon: [{ url: "/icons/favicon.ico", sizes: "any" }],
    shortcut: "/icons/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    title: "NERV",
    statusBarStyle: "black-translucent",
  },
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
    { media: "(prefers-color-scheme: light)", color: "#0f172a" },
  ],
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: siteUrlRaw,
    siteName: "NERV",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
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
