"use client";

import { useContext, createContext, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CURRENCIES,
  PRICES,
  STORAGE_KEY,
  chargeCurrencyFor,
  checkoutNote,
  detectCurrency,
  formatLevelChange,
  levelChangeParts,
  levelChangeRateNote,
  levelFeeLabel,
  formatPrice,
  isCurrency,
  type ChargeCurrency,
  type DisplayCurrency,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

type CurrencyState = {
  currency: DisplayCurrency;
  setCurrency: (c: DisplayCurrency) => void;
  /** Formatted price in the chosen currency, e.g. "₦10,000". */
  price: string;
  /** Additional fee for an extra level, e.g. "₦10,000" or "$3.99 (about £2.98)". */
  levelChangePrice: string;
  /** The same fee split into its headline amount and (outside Nigeria and the US) an approximate local amount. */
  levelChange: { main: string; approx: string | null };
  /** Explains that the local amount is approximate; null when nothing is approximate. */
  levelChangeNote: string | null;
  /** What Paystack will actually charge. */
  charge: ChargeCurrency;
  chargePrice: string;
  /** Quiet reference note when the shown currency differs from the charged one. */
  note: string | null;
  usdEnabled: boolean;
};

const Ctx = createContext<CurrencyState | null>(null);

async function lookupCountry(): Promise<string | null> {
  try {
    const res = await fetch("/api/geo", { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as { country?: string | null };
    return typeof json.country === "string" ? json.country : null;
  } catch {
    return null;
  }
}

export function CurrencyProvider({
  initial,
  country,
  usdEnabled,
  children,
}: {
  /** Server's best guess from geo headers, used for the first paint. */
  initial: DisplayCurrency;
  /** Raw ISO country from the request, if the host sent one. */
  country: string | null;
  usdEnabled: boolean;
  children: React.ReactNode;
}) {
  const [currency, setState] = useState<DisplayCurrency>(initial);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(STORAGE_KEY);
      } catch {}
      if (isCurrency(saved)) {
        if (!cancelled) setState(saved);
        return;
      }
      let timeZone: string | null = null;
      try {
        timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {}
      let countryCode = country;
      if (!countryCode) countryCode = await lookupCountry();
      const locales = navigator.languages?.length
        ? navigator.languages
        : [navigator.language];
      const detected = detectCurrency({
        saved,
        country: countryCode,
        timeZone,
        locales,
      });
      if (!cancelled) setState(detected);
    })();
    return () => {
      cancelled = true;
    };
  }, [country]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && isCurrency(e.newValue)) setState(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setCurrency = (c: DisplayCurrency) => {
    setState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {}
  };

  const charge = chargeCurrencyFor(currency, usdEnabled);
  return (
    <Ctx.Provider
      value={{
        currency,
        setCurrency,
        price: formatPrice(currency),
        levelChangePrice: formatLevelChange(currency),
        levelChange: levelChangeParts(currency),
        levelChangeNote: levelChangeRateNote(currency),
        charge,
        chargePrice: formatPrice(charge),
        note: checkoutNote(currency, usdEnabled),
        usdEnabled,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCurrency() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCurrency must be used inside CurrencyProvider");
  return v;
}

/** The founding price in the visitor's currency. */
export function Price({ className }: { className?: string }) {
  const { price } = useCurrency();
  return <span className={cn("tnum", className)}>{price}</span>;
}

/**
 * The additional fee for an extra level in the visitor's currency: "₦10,000" in Nigeria, "$3.99" in the US,
 * and "$3.99 (about £2.98)" elsewhere.
 */
export function LevelChangeFee({ className }: { className?: string }) {
  const { levelChange } = useCurrency();
  return (
    <span className={cn("tnum", className)} data-level-change-fee>
      {levelChange.main}
      {levelChange.approx ? ` (about ${levelChange.approx})` : ""}
    </span>
  );
}

/** Currency picker. `tone` matches the surface it sits on. */
export function CurrencySelect({
  tone = "light",
  className,
  id,
  detailed = false,
  amounts = "course",
  label = "Currency",
}: {
  tone?: "stage" | "dark" | "light";
  className?: string;
  id?: string;
  /** Show the currency name in the closed trigger too (for full-width form fields). */
  detailed?: boolean;
  /** Which price to list beside each currency: the course price, or the additional-level fee. */
  amounts?: "course" | "level-fee";
  /** Accessible name for the picker. */
  label?: string;
}) {
  const { currency, setCurrency } = useCurrency();
  return (
    <Select
      value={currency}
      onValueChange={(v) => isCurrency(v) && setCurrency(v)}
    >
      <SelectTrigger
        id={id}
        size="sm"
        aria-label={label}
        data-currency-select
        className={cn(
          "tnum h-10 gap-2 rounded-lg px-3 text-[13px] font-semibold md:text-[13px]",
          tone === "stage" &&
            "border-transparent bg-yellow text-ink shadow-[0_1px_0_rgb(255_255_255/0.45)_inset,0_1px_2px_rgb(0_43_66/0.18)] hover:bg-[#f0c93a] focus-visible:border-ink focus-visible:ring-ink/20 [&>svg]:text-ink",
          tone === "dark" &&
            "border-transparent bg-yellow text-ink hover:bg-[#f0c93a] focus-visible:border-yellow focus-visible:ring-yellow/40 [&>svg]:text-ink",
          tone === "light" && "bg-white text-ink",
          className,
        )}
      >
        <SelectValue>
          {detailed ? (
            <>
              <span className="font-semibold">{currency}</span>
              <span className="font-medium text-ink-3">
                {PRICES[currency].name}
              </span>
              {amounts === "level-fee" ? (
                <span className="ml-auto font-medium text-ink-2">
                  {levelFeeLabel(currency)}
                </span>
              ) : null}
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span>
                {amounts === "level-fee"
                  ? levelFeeLabel(currency)
                  : formatPrice(currency)}
              </span>
              <span className="font-medium opacity-70">{currency}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" align="start" className="min-w-72">
        {CURRENCIES.map((c) => (
          <SelectItem
            key={c}
            value={c}
            className="tnum *:[span]:last:w-full *:[span]:last:gap-3"
          >
            <span className="w-9 shrink-0 font-semibold text-ink">{c}</span>
            <span className="flex-1 text-ink-3">{PRICES[c].name}</span>
            <span className="ml-auto font-semibold text-ink">
              {amounts === "level-fee" ? levelFeeLabel(c) : formatPrice(c)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Quiet reference note; renders nothing when the shown and charged currencies match. */
export function CheckoutNote({ className }: { className?: string }) {
  const { note } = useCurrency();
  if (!note) return null;
  return (
    <p className={cn("text-[13px] leading-snug", className)} data-currency-note>
      {note}
    </p>
  );
}
