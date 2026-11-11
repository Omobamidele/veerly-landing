import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { site } from "@/lib/config";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap", axes: ["opsz"], weight: "variable" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: "%s · Veerly" },
  description: site.description,
  applicationName: "Veerly",
  alternates: { canonical: "/" },
  openGraph: { type: "website", title: site.title, description: site.description, siteName: "Veerly", url: "/" },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = { themeColor: "#0075AD", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(geist.variable, bricolage.variable)} suppressHydrationWarning>
      <head>
        <script
          // Lets CSS hold the hero entrance until GSAP runs; skipped entirely for reduced motion.
          dangerouslySetInnerHTML={{
            __html: "try{var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: no-preference)').matches)d.dataset.motion='on'}catch(e){}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
