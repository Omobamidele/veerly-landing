import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

export type { CountryCode };

/** Normalise a local or international number to E.164, or null if invalid. */
export function toE164(raw: string, country: string): string | null {
  const value = (raw || "").trim();
  if (!value) return null;
  const cc = (getCountries() as string[]).includes(country) ? (country as CountryCode) : undefined;
  const parsed = parsePhoneNumberFromString(value, cc);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number; // E.164
}

export function countryOptions(locale = "en") {
  const names = new Intl.DisplayNames([locale], { type: "region" });
  return getCountries()
    .map((code) => ({ code, name: names.of(code) || code, dial: `+${getCountryCallingCode(code)}` }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
