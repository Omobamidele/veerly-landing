import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Figtree } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["800"], variable: "--font-display", display: "swap" });
const body = Geist({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const app = Figtree({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-app", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: "Veerly",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: site.title,
    description: site.description,
    siteName: "Veerly",
    url: "/",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = { themeColor: "#4A1FD6", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${app.variable}`}>
      <body>{children}</body>
    </html>
  );
}
