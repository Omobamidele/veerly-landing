/**
 * VEERLY PRICES — edit this file to change what visitors see.
 *
 * Hand-set, rounded local prices for the founding cohort (no live exchange rates).
 * Each is roughly equal to US$7.99. Reference rates used when these were set
 * (Bank of England / market mid-rates, 9–10 Nov 2026, US$1 =):
 *   NGN: Mo's fixed local price (not converted) · GBP 0.746 · EUR 0.893 · CAD 1.409 · GHS 11.69
 *   KES 130 · ZAR 16.42 · INR 93.9 · AUD 1.448
 *
 * What people are actually charged is decided by Paystack (see `chargeCurrencyFor`):
 *   - NGN and USD are the only currencies charged. NGN and USD amounts below are the
 *     exact checkout amounts, so keep them in sync with what Paystack should charge.
 *   - Every other currency is shown for reference only.
 *
 * This file is imported by both the browser and the server, so it must not read secrets.
 */

export type DisplayCurrency =
  "NGN" | "USD" | "GBP" | "EUR" | "CAD" | "GHS" | "KES" | "ZAR" | "INR" | "AUD";
export type ChargeCurrency = "NGN" | "USD";

type Row = {
  /** The price, in whole currency units (not kobo/cents). */
  amount: number;
  /** Shown in the currency selector. */
  name: string;
  /** Locale used by Intl.NumberFormat, chosen so the symbol is unambiguous (e.g. CA$, A$). */
  locale: string;
};

export const PRICES: Record<DisplayCurrency, Row> = {
  NGN: { amount: 10000, name: "Nigerian naira", locale: "en-NG" },
  USD: { amount: 7.99, name: "US dollar", locale: "en-US" },
  GBP: { amount: 5.99, name: "British pound", locale: "en-GB" },
  EUR: { amount: 6.99, name: "Euro", locale: "en-IE" },
  CAD: { amount: 10.99, name: "Canadian dollar", locale: "en-US" },
  GHS: { amount: 95, name: "Ghanaian cedi", locale: "en-GH" },
  KES: { amount: 1000, name: "Kenyan shilling", locale: "en-KE" },
  ZAR: { amount: 129, name: "South African rand", locale: "en-ZA" },
  INR: { amount: 749, name: "Indian rupee", locale: "en-IN" },
  AUD: { amount: 11.49, name: "Australian dollar", locale: "en-US" },
};

/**
 * LEVEL ADD-ON: the additional fee for each extra level, after checkout.
 *
 * Two fixed prices, both set by Mo:
 *   - US$3.99 for everyone outside Nigeria. Visitors also see an APPROXIMATE amount in their own
 *     currency beside it, worked out from the single rate table below (nothing is fetched live).
 *   - NGN 5,000 for visitors who pick naira, whatever the exchange rate. Static: no "about", no dollars.
 *
 * What Paystack charges (see `addonChargeFor`): naira visitors pay NGN 5,000. Everyone else pays US$3.99
 * when Paystack USD is on (PAYSTACK_ENABLE_USD=true). A Nigerian Paystack business may not be able to take
 * USD yet; until it can, everyone is charged the same static NGN 5,000.
 */
export const LEVEL_CHANGE_PRICES = { USD: 3.99, NGN: 5000 } as const;
export const LEVEL_CHANGE_USD = LEVEL_CHANGE_PRICES.USD;

type RateRow = {
  /** Units of this currency per US$1. Approximate, for display only. */
  perUsd: number;
  /** Round the approximate amount to the nearest multiple of this (0.01 keeps cents/pence). */
  step: number;
  /** Where the rate came from and when. */
  asOf: string;
};

/** The one exchange-rate table. Approximate. Last updated 13 November 2026. */
export const USD_RATES_UPDATED = "13 November 2026";
export const USD_RATES: Record<DisplayCurrency, RateRow> = {
  USD: { perUsd: 1, step: 0.01, asOf: "13 Nov 2026" },
  // Central Bank of Nigeria official (NFEM) rate, 13 Nov 2026: about N1,356 per US$1.
  // Not used for the add-on: naira visitors see the fixed N5,000 instead. Kept so every currency has a row.
  NGN: { perUsd: 1356, step: 100, asOf: "13 Nov 2026 (CBN official)" },
  // The rest are the reference mid-rates listed at the top of this file (9-10 Nov 2026).
  GBP: { perUsd: 0.746, step: 0.01, asOf: "10 Nov 2026" },
  EUR: { perUsd: 0.893, step: 0.01, asOf: "10 Nov 2026" },
  CAD: { perUsd: 1.409, step: 0.01, asOf: "10 Nov 2026" },
  GHS: { perUsd: 11.69, step: 1, asOf: "10 Nov 2026" },
  KES: { perUsd: 130, step: 10, asOf: "10 Nov 2026" },
  ZAR: { perUsd: 16.42, step: 1, asOf: "10 Nov 2026" },
  INR: { perUsd: 93.9, step: 5, asOf: "10 Nov 2026" },
  AUD: { perUsd: 1.448, step: 0.01, asOf: "10 Nov 2026" },
};

/** US$3.99 converted at the table rate and rounded to a friendly amount (the "about" amount). */
export function convertedLevelChange(code: DisplayCurrency): number {
  const { perUsd, step } = USD_RATES[code];
  return Number((Math.round((LEVEL_CHANGE_USD * perUsd) / step) * step).toFixed(2));
}

/**
 * What the add-on looks like in a currency.
 * - NGN: the fixed price only ("N5,000"), never approximate.
 * - USD: "$3.99".
 * - Anything else: "$3.99" with an approximate local amount beside it.
 */
export function levelChangeParts(code: DisplayCurrency): {
  /** The headline amount. */
  main: string;
  /** Approximate local amount, only for currencies other than USD and NGN. */
  approx: string | null;
} {
  if (code === "NGN")
    return { main: formatPrice("NGN", LEVEL_CHANGE_PRICES.NGN), approx: null };
  const main = formatPrice("USD", LEVEL_CHANGE_USD);
  if (code === "USD") return { main, approx: null };
  return { main, approx: formatPrice(code, convertedLevelChange(code)) };
}

/**
 * What the currency dropdown shows beside the add-on price: "₦5,000" for naira (the fixed price, not a
 * conversion), "$3.99" for US dollars, and "about £2.98" for everything else.
 */
export function levelFeeLabel(code: DisplayCurrency): string {
  const { main, approx } = levelChangeParts(code);
  return approx ? `about ${approx}` : main;
}

/** "₦5,000", "$3.99", or "$3.99 (about £2.98)". */
export function formatLevelChange(code: DisplayCurrency): string {
  const { main, approx } = levelChangeParts(code);
  return approx ? `${main} (about ${approx})` : main;
}

/** Quiet line explaining the approximate amount, or null when nothing is approximate. */
export function levelChangeRateNote(code: DisplayCurrency): string | null {
  if (code === "USD" || code === "NGN") return null;
  return `The ${code} amount is approximate (rates last updated ${USD_RATES_UPDATED}), shown so you can convert. The fee is ${formatPrice("USD", LEVEL_CHANGE_USD)}.`;
}

/**
 * What Paystack charges for the add-on, in whole currency units.
 * Naira visitors: NGN 5,000. Others: US$3.99 when USD is enabled, else the same static NGN 5,000.
 */
export function addonChargeFor(
  display: DisplayCurrency,
  usdEnabled: boolean,
): { currency: ChargeCurrency; amount: number } {
  if (display === "NGN")
    return { currency: "NGN", amount: LEVEL_CHANGE_PRICES.NGN };
  if (usdEnabled) return { currency: "USD", amount: LEVEL_CHANGE_USD };
  return { currency: "NGN", amount: LEVEL_CHANGE_PRICES.NGN };
}

/** Every add-on charge we would accept from Paystack right now: [currency, subunit]. */
export function acceptedAddonCharges(
  usdEnabled: boolean,
): { currency: ChargeCurrency; amount: number }[] {
  const out: { currency: ChargeCurrency; amount: number }[] = [
    { currency: "NGN", amount: toSubunit(LEVEL_CHANGE_PRICES.NGN) },
  ];
  if (usdEnabled)
    out.push({ currency: "USD", amount: Math.round(LEVEL_CHANGE_USD * 100) });
  return out;
}

/** Paystack subunit (kobo / cents) for a charge from `addonChargeFor`. */
export function toSubunit(amount: number): number {
  return Math.round(amount * 100);
}

/** Order in the selector. */
export const CURRENCIES = Object.keys(PRICES) as DisplayCurrency[];
export const FALLBACK_CURRENCY: DisplayCurrency = "USD";
export const STORAGE_KEY = "veerly.currency";

export function isCurrency(v: unknown): v is DisplayCurrency {
  return typeof v === "string" && v in PRICES;
}

/** "₦10,000", "$7.99", "£5.99", "CA$10.99", "Ksh 1,000"… Whole amounts show no decimals. */
export function formatPrice(
  code: DisplayCurrency,
  amount = PRICES[code].amount,
): string {
  const digits = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat(PRICES[code].locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}

/**
 * The currency Paystack will actually charge for a visitor's chosen display currency.
 * A Nigerian Paystack business settles in NGN; USD only works when PAYSTACK_ENABLE_USD=true.
 */
export function chargeCurrencyFor(
  display: DisplayCurrency,
  usdEnabled: boolean,
): ChargeCurrency {
  if (display === "NGN") return "NGN";
  return usdEnabled ? "USD" : "NGN";
}

/** Quiet note under a price when the shown currency isn't the one charged. Null when they match. */
export function checkoutNote(
  display: DisplayCurrency,
  usdEnabled: boolean,
): string | null {
  const charge = chargeCurrencyFor(display, usdEnabled);
  if (charge === display) return null;
  const pay =
    charge === "USD"
      ? `in US dollars (${formatPrice("USD")})`
      : `in naira (${formatPrice("NGN")})`;
  return `Shown in ${display} for reference. You'll pay ${pay} at checkout; your bank converts it.`;
}

// ───── Default currency detection ─────

const EURO =
  "AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK".split(" ");

/** ISO 3166 country code → display currency, or null if we don't price for it. */
export function currencyForCountry(
  country: string | null | undefined,
): DisplayCurrency | null {
  const c = (country || "").trim().toUpperCase();
  if (!c) return null;
  const direct: Record<string, DisplayCurrency> = {
    NG: "NGN",
    US: "USD",
    GB: "GBP",
    CA: "CAD",
    GH: "GHS",
    KE: "KES",
    ZA: "ZAR",
    IN: "INR",
    AU: "AUD",
  };
  if (direct[c]) return direct[c];
  if (EURO.includes(c)) return "EUR";
  return null;
}

const ZONES: Record<string, DisplayCurrency> = {
  "Africa/Lagos": "NGN",
  "Africa/Accra": "GHS",
  "Africa/Nairobi": "KES",
  "Africa/Johannesburg": "ZAR",
  "Asia/Kolkata": "INR",
  "Asia/Calcutta": "INR",
  "Europe/London": "GBP",
  "Europe/Belfast": "GBP",
};
const EURO_ZONES =
  "Amsterdam Athens Berlin Bratislava Brussels Dublin Helsinki Lisbon Ljubljana Luxembourg Madrid Malta Nicosia Paris Riga Rome Tallinn Vienna Vilnius Zagreb".split(
    " ",
  );
const CANADA_ZONES =
  "Toronto Vancouver Montreal Edmonton Winnipeg Halifax Regina St_Johns Moncton Whitehorse Yellowknife Iqaluit".split(
    " ",
  );

/** IANA timezone → display currency, or null. Africa/Lagos covers Nigeria (and is shared by a few neighbours). */
export function currencyForTimeZone(
  tz: string | null | undefined,
): DisplayCurrency | null {
  if (!tz) return null;
  if (ZONES[tz]) return ZONES[tz];
  const [area, city] = tz.split("/");
  if (area === "Australia") return "AUD";
  if (area === "Europe" && city && EURO_ZONES.includes(city)) return "EUR";
  if (area === "America" && city && CANADA_ZONES.includes(city)) return "CAD";
  if (area === "America" && city) return null; // the US has many zones; let the locale decide
  return null;
}

/** BCP 47 locale like "en-GB" → display currency via its region, or null. */
export function currencyForLocale(
  locale: string | null | undefined,
): DisplayCurrency | null {
  if (!locale) return null;
  try {
    const region = new Intl.Locale(locale).maximize().region;
    return currencyForCountry(region);
  } catch {
    return null;
  }
}

/**
 * Pick the default currency. Order: saved choice → IP country header → timezone → browser locales → USD.
 * (Note: `maximize()` guesses a region for bare languages, e.g. "en" → US, so only explicit regions are trusted.)
 */
export function detectCurrency(opts: {
  saved?: string | null;
  country?: string | null;
  timeZone?: string | null;
  locales?: readonly string[];
}): DisplayCurrency {
  if (isCurrency(opts.saved)) return opts.saved;
  const fromCountry = currencyForCountry(opts.country);
  if (fromCountry) return fromCountry;
  const fromZone = currencyForTimeZone(opts.timeZone);
  if (fromZone) return fromZone;
  for (const l of opts.locales || []) {
    if (!/[-_][A-Za-z]{2}\b/.test(l)) continue; // explicit region only
    const fromLocale = currencyForLocale(l);
    if (fromLocale) return fromLocale;
  }
  return FALLBACK_CURRENCY;
}

/** Paystack amount in the subunit (kobo / cents). */
export function chargeAmount(currency: ChargeCurrency): number {
  return Math.round(PRICES[currency].amount * 100);
}
