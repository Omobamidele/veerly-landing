import assert from "node:assert/strict";
import { test } from "node:test";
import {
  countryFromAcceptLanguage,
  countryFromHeaders,
  normalizeCountry,
} from "../lib/geo";
import { detectCurrency } from "../lib/pricing";

test("normalizeCountry accepts ISO codes and rejects placeholders", () => {
  assert.equal(normalizeCountry("ng"), "NG");
  assert.equal(normalizeCountry(" US "), "US");
  assert.equal(normalizeCountry("XX"), null);
  assert.equal(normalizeCountry("T1"), null);
  assert.equal(normalizeCountry("NGA"), null);
  assert.equal(normalizeCountry(""), null);
});

test("countryFromHeaders reads Vercel, Netlify and Cloudflare first", () => {
  const h = (o: Record<string, string>) => new Headers(o);
  assert.equal(countryFromHeaders(h({ "x-vercel-ip-country": "NG" })), "NG");
  assert.equal(countryFromHeaders(h({ "x-country": "ng" })), "NG");
  assert.equal(countryFromHeaders(h({ "x-nf-country-code": "GB" })), "GB");
  assert.equal(countryFromHeaders(h({ "cf-ipcountry": "GH" })), "GH");
  assert.equal(
    countryFromHeaders(h({ "cloudfront-viewer-country": "KE" })),
    "KE",
  );
  // Vercel wins when several are present.
  assert.equal(
    countryFromHeaders(
      h({ "x-vercel-ip-country": "NG", "cf-ipcountry": "US" }),
    ),
    "NG",
  );
  assert.equal(countryFromHeaders(h({ "x-vercel-ip-country": "XX" })), null);
});

test("Accept-Language region is a last-resort header fallback", () => {
  assert.equal(countryFromAcceptLanguage("en-NG,en;q=0.9"), "NG");
  assert.equal(countryFromAcceptLanguage("en-GB"), "GB");
  assert.equal(countryFromAcceptLanguage("en,fr"), null); // no region
  const h = (o: Record<string, string>) => new Headers(o);
  assert.equal(
    countryFromHeaders(h({ "accept-language": "en-NG,en;q=0.8" })),
    "NG",
  );
  // A real geo header still wins over the language tag.
  assert.equal(
    countryFromHeaders(
      h({ "x-country": "GH", "accept-language": "en-NG" }),
    ),
    "GH",
  );
});

test("detectCurrency: Nigeria is ₦, Africa/Lagos means NGN, others default to USD", () => {
  assert.equal(detectCurrency({ country: "NG" }), "NGN");
  assert.equal(detectCurrency({ timeZone: "Africa/Lagos" }), "NGN");
  assert.equal(detectCurrency({ timeZone: "Africa/Accra" }), "GHS");
  assert.equal(detectCurrency({ country: "US" }), "USD");
  assert.equal(detectCurrency({ country: "GB" }), "GBP");
  assert.equal(detectCurrency({}), "USD");
  // A saved choice wins over geo.
  assert.equal(
    detectCurrency({ saved: "USD", country: "NG", timeZone: "Africa/Lagos" }),
    "USD",
  );
  assert.equal(
    detectCurrency({ saved: "NGN", country: "US" }),
    "NGN",
  );
  // Timezone wins when no country header is present (local or a host without geo).
  assert.equal(
    detectCurrency({ country: null, timeZone: "Africa/Lagos", locales: ["en-US"] }),
    "NGN",
  );
});
