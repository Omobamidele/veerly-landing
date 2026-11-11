"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { site } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * Sticky nav. On the homepage it sits on the brand stage ("stage" tone) and turns light once the
 * stage scrolls away. Other pages use the light tone throughout.
 */
export function Nav({
  cta,
  tone = "light",
}: {
  cta?: React.ReactNode;
  tone?: "stage" | "light";
}) {
  const [onStage, setOnStage] = useState(tone === "stage");
  useEffect(() => {
    if (tone !== "stage") return;
    const end = document.getElementById("stage-end");
    if (!end) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      setOnStage(end.getBoundingClientRect().top > 80);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [tone]);

  return (
    <header
      data-tone={onStage ? "stage" : "light"}
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300",
        onStage
          ? "border-white/10 bg-stage"
          : "border-line bg-ground/85 backdrop-blur-md backdrop-saturate-150",
      )}
    >
      <div className="wrap flex h-20 items-center gap-8">
        <Link href="/" aria-label="Veerly home" className="shrink-0">
          <Logo tone={onStage ? "stage" : "light"} />
        </Link>
        {cta ? (
          <nav
            aria-label="Main"
            className="hidden items-center gap-7 text-sm md:flex"
          >
            {[
              ["/#systems", "What you get"],
              ["/#levels", "Your plan"],
              ["/#pricing", "Pricing"],
              ["/#faq", "FAQ"],
            ].map(([href, text]) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "no-underline transition-colors",
                  onStage
                    ? "text-white hover:text-white/80"
                    : "text-ink-2 hover:text-ink",
                )}
              >
                {text}
              </Link>
            ))}
          </nav>
        ) : null}
        <div className="ml-auto" data-on-stage={onStage}>
          {cta}
        </div>
      </div>
    </header>
  );
}

export function Footer({ belief = site.belief }: { belief?: string }) {
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const channel = process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL;
  return (
    <footer className="border-t border-line bg-ground">
      <div className="wrap grid gap-10 py-14 md:grid-cols-12">
        <div className="flex flex-col gap-4 md:col-span-6">
          <Logo />
          <p className="max-w-[46ch] text-sm text-ink-2">{belief}</p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-7 gap-y-3 text-sm md:col-span-6 md:justify-end"
        >
          <Link
            className="text-ink-2 no-underline hover:text-ink"
            href="/privacy"
          >
            Privacy
          </Link>
          <Link
            className="text-ink-2 no-underline hover:text-ink"
            href="/terms"
          >
            Terms
          </Link>
          {channel ? (
            <a
              className="text-ink-2 no-underline hover:text-ink"
              href={channel}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp channel
            </a>
          ) : null}
          {contact ? (
            <a
              className="text-ink-2 no-underline hover:text-ink"
              href={`mailto:${contact}`}
            >
              Contact
            </a>
          ) : null}
        </nav>
      </div>
      <div className="wrap flex flex-col gap-2 border-t border-line py-6 text-[13px] text-ink-3 sm:flex-row sm:justify-between">
        <p>© 2026 Veerly</p>
        <p>
          Veerly helps you get organised and prepared. It does not guarantee
          employment.
        </p>
      </div>
    </footer>
  );
}
