/**
 * Visitor country, used only to pick a default display currency.
 * The IP itself is never stored. We read CDN/platform geo headers first,
 * then fall back to the region on Accept-Language.
 *
 * Headers, in order:
 *   x-vercel-ip-country       Vercel
 *   x-country, x-nf-country-code
 *                             Netlify (and older Netlify)
 *   cf-ipcountry              Cloudflare
 *   cloudfront-viewer-country AWS CloudFront
 *   x-appengine-country       Google App Engine / Cloud Run (when set)
 *   fastly-client-country-code
 *                             Fastly
 *   accept-language           region subtag only, e.g. en-NG → NG
 */

const HEADER_NAMES = [
  "x-vercel-ip-country",
  "x-country",
  "x-nf-country-code",
  "cf-ipcountry",
  "cloudfront-viewer-country",
  "x-appengine-country",
  "fastly-client-country-code",
] as const;

/** Two-letter ISO 3166-1 alpha-2, or null if the value is missing or a placeholder. */
export function normalizeCountry(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(s)) return null;
  // CDN placeholders: unknown, or anonymised / Tor.
  if (s === "XX" || s === "T1" || s === "ZZ" || s === "A1" || s === "A2")
    return null;
  return s;
}

/** Best country code from a request's geo headers, or null. */
export function countryFromHeaders(
  headers: Pick<Headers, "get">,
): string | null {
  for (const name of HEADER_NAMES) {
    const country = normalizeCountry(headers.get(name));
    if (country) return country;
  }
  return countryFromAcceptLanguage(headers.get("accept-language"));
}

/**
 * First explicit region on an Accept-Language value, e.g. "en-NG,en;q=0.9" → "NG".
 * Bare languages ("en") are ignored — they are not a location.
 */
export function countryFromAcceptLanguage(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  for (const part of value.split(",")) {
    const tag = part.trim().split(";")[0]?.trim();
    if (!tag) continue;
    const region = tag.match(/[-_]([A-Za-z]{2})$/)?.[1];
    const country = normalizeCountry(region);
    if (country) return country;
  }
  return null;
}
