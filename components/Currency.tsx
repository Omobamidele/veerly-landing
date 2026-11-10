"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
  /** What Paystack will actually charge. */
  charge: ChargeCurrency;
  chargePrice: string;
  /** Quiet reference note when the shown currency differs from the charged one. */
  note: string | null;
  usdEnabled: boolean;
};

const Ctx = createContext<CurrencyState | null>(null);

export function CurrencyProvider({
  initial,
  country,
  usdEnabled,
  children,
}: {
  /** Server's best guess (from x-vercel-ip-country), used for the first paint. */
  initial: DisplayCurrency;
  /** Raw country header, if the host sent one. */
  country: string | null;
  usdEnabled: boolean;
  children: React.ReactNode;
}) {
  const [currency, setState] = useState<DisplayCurrency>(initial);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    let timeZone: string | null = null;
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {}
    const detected = detectCurrency({
      saved,
      country,
      timeZone,
      locales: navigator.languages?.length
        ? navigator.languages
        : [navigator.language],
    });
    setState(detected);
  }, [country]);

  // Keep several selectors on the page (hero, pricing, checkout) in sync.
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

/** Small currency picker. `tone` matches the surface it sits on. */
export function CurrencySelect({
  tone = "light",
  className,
  id,
  detailed = false,
}: {
  tone?: "stage" | "dark" | "light";
  className?: string;
  id?: string;
  /** Show the currency name in the closed trigger too (for full-width form fields). */
  detailed?: boolean;
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
        aria-label="Currency"
        data-currency-select
        className={cn(
          "tnum h-7 gap-1 rounded-md px-2 text-[13px] font-medium md:text-[13px]",
          tone === "stage" &&
            "border-white/35 bg-black/15 text-white hover:border-white/60 hover:bg-black/25 focus-visible:border-white focus-visible:ring-white/40 [&>svg]:text-white/80",
          tone === "dark" &&
            "border-white/20 bg-white/5 text-white hover:border-white/45 hover:bg-white/10 focus-visible:border-white focus-visible:ring-white/30 [&>svg]:text-white/70",
          tone === "light" && "bg-white text-ink",
          className,
        )}
      >
        <SelectValue>
          {detailed ? (
            <>
              <span className="font-medium">{currency}</span>
              <span className="text-ink-3">{PRICES[currency].name}</span>
            </>
          ) : (
            currency
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" align="start" className="min-w-64">
        {CURRENCIES.map((c) => (
          <SelectItem
            key={c}
            value={c}
            className="tnum *:[span]:last:w-full *:[span]:last:gap-3"
          >
            <span className="w-9 shrink-0 font-medium text-ink">{c}</span>
            <span className="flex-1 text-ink-3">{PRICES[c].name}</span>
            <span className="ml-auto text-ink-2">{formatPrice(c)}</span>
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
