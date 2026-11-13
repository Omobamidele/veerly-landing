import type { Metadata } from "next";
import { headers } from "next/headers";
import AddLevelFlow, { AddLevelMore } from "@/components/AddLevelFlow";
import { CurrencyProvider } from "@/components/Currency";
import { Footer, Nav } from "@/components/SiteChrome";
import { parseAddonParams } from "@/lib/addon";
import { pricing } from "@/lib/config";
import { countryFromHeaders } from "@/lib/geo";
import { currentPhase, enrolAt, formatWhen, paymentOpen } from "@/lib/launch";
import { FALLBACK_CURRENCY, currencyForCountry } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Get another level",
  description:
    "Chose the wrong level? Add another Veerly level for an additional fee. Enter the email or WhatsApp number you paid with and pick the level you want.",
  robots: { index: false, follow: false },
};

/**
 * /add-level, with optional deep links: /add-level?path=va&level=intermediate
 * (path is a slug or full path name; level is beginner, intermediate or advanced).
 */
export default async function AddLevel({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const preview = typeof sp.preview === "string" ? sp.preview : null;
  const linked = parseAddonParams(sp);
  const country = countryFromHeaders(await headers());
  const initialCurrency = currencyForCountry(country) ?? FALLBACK_CURRENCY;
  const open = paymentOpen(currentPhase(Date.now(), preview));

  return (
    <>
      <Nav />
      <main className="page" id="main">
        <div className="wrap">
          <div className="mb-10 flex max-w-[62ch] flex-col gap-4">
            <h1 className="display text-[clamp(34px,5vw,52px)] leading-[1.12] font-extrabold tracking-[-0.03em] text-ink">
              Chose the wrong level? Get another level.
            </h1>
            <p className="text-[19px] leading-snug text-ink-2">
              Each extra level is an additional fee, paid once for that level.
              Enter the email or WhatsApp number you paid with, pick the level
              you want and pay. You keep the level you already have, and we send
              you the Notion link for the new one.
            </p>
            <AddLevelMore />
          </div>
          <CurrencyProvider
            initial={initialCurrency}
            country={country}
            usdEnabled={pricing.usdEnabled}
          >
            <AddLevelFlow
              initialPath={linked.path}
              initialLevel={linked.level}
              openNotice={
                open
                  ? null
                  : `Extra levels open for purchase when enrolment opens, on ${formatWhen(enrolAt())}. You can look around now, but payment isn't open yet.`
              }
            />
          </CurrencyProvider>
        </div>
      </main>
      <Footer />
    </>
  );
}
