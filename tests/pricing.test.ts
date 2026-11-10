import assert from "node:assert/strict";
import { test } from "node:test";
import { isExpectedCharge, priceFor } from "../lib/paystack";
import {
  CURRENCIES,
  PRICES,
  chargeCurrencyFor,
  checkoutNote,
  currencyForCountry,
  currencyForLocale,
  currencyForTimeZone,
  detectCurrency,
  formatPrice,
} from "../lib/pricing";

test("price table: all ten currencies, Nigeria is ₦10,000, US is $7.99", () => {
  assert.deepEqual(CURRENCIES, [
    "NGN",
    "USD",
    "GBP",
    "EUR",
    "CAD",
    "GHS",
    "KES",
    "ZAR",
    "INR",
    "AUD",
  ]);
  assert.equal(PRICES.NGN.amount, 10000);
  assert.equal(PRICES.USD.amount, 7.99);
  for (const c of CURRENCIES) assert.ok(PRICES[c].amount > 0, c);
});

test("formatPrice uses Intl.NumberFormat with clean symbols", () => {
  assert.equal(formatPrice("NGN"), "₦10,000");
  assert.equal(formatPrice("USD"), "$7.99");
  assert.equal(formatPrice("GBP"), "£5.99");
  assert.equal(formatPrice("EUR"), "€6.99");
  assert.equal(formatPrice("CAD"), "CA$10.99");
  assert.equal(formatPrice("AUD"), "A$11.49");
  assert.equal(formatPrice("INR"), "₹749");
  // whole-unit prices never show decimals
  for (const c of ["NGN", "GHS", "KES", "ZAR", "INR"] as const)
    assert.doesNotMatch(formatPrice(c), /[.,]\d{2}$/);
});

test("checkout currency: NGN → NGN; others → USD only when enabled", () => {
  assert.equal(chargeCurrencyFor("NGN", false), "NGN");
  assert.equal(chargeCurrencyFor("NGN", true), "NGN");
  assert.equal(chargeCurrencyFor("USD", true), "USD");
  assert.equal(chargeCurrencyFor("USD", false), "NGN");
  assert.equal(chargeCurrencyFor("GBP", true), "USD");
  assert.equal(chargeCurrencyFor("GBP", false), "NGN");
});

test("reference note matches the configured checkout", () => {
  assert.equal(checkoutNote("NGN", false), null);
  assert.equal(checkoutNote("USD", true), null);
  assert.equal(
    checkoutNote("GBP", true),
    "Shown in GBP for reference. You'll pay in US dollars ($7.99) at checkout; your bank converts it.",
  );
  assert.equal(
    checkoutNote("GBP", false),
    "Shown in GBP for reference. You'll pay in naira (₦10,000) at checkout; your bank converts it.",
  );
  assert.match(checkoutNote("USD", false) || "", /pay in naira/);
});

test("Paystack amounts come from the price table", () => {
  assert.deepEqual(priceFor("NGN"), { currency: "NGN", amount: 1_000_000 });
  assert.deepEqual(priceFor("USD"), { currency: "USD", amount: 799 });
  assert.equal(
    isExpectedCharge({ status: "success", amount: 1_000_000, currency: "NGN" }),
    true,
  );
  assert.equal(
    isExpectedCharge({ status: "success", amount: 599, currency: "GBP" }),
    false,
  );
});

test("detection: country header → timezone → locale → USD, saved choice wins", () => {
  assert.equal(currencyForCountry("ng"), "NGN");
  assert.equal(currencyForCountry("DE"), "EUR");
  assert.equal(currencyForCountry("BR"), null);
  assert.equal(currencyForTimeZone("Africa/Lagos"), "NGN");
  assert.equal(currencyForTimeZone("Europe/Paris"), "EUR");
  assert.equal(currencyForTimeZone("Australia/Sydney"), "AUD");
  assert.equal(currencyForTimeZone("America/Toronto"), "CAD");
  assert.equal(currencyForTimeZone("America/New_York"), null);
  assert.equal(currencyForLocale("en-GB"), "GBP");

  assert.equal(
    detectCurrency({ country: "GH", timeZone: "Africa/Lagos" }),
    "GHS",
  );
  assert.equal(
    detectCurrency({
      country: null,
      timeZone: "Africa/Lagos",
      locales: ["en-US"],
    }),
    "NGN",
  );
  assert.equal(
    detectCurrency({ timeZone: "America/New_York", locales: ["en-GB"] }),
    "GBP",
  );
  assert.equal(
    detectCurrency({ timeZone: "America/New_York", locales: ["en"] }),
    "USD",
  );
  assert.equal(
    detectCurrency({ timeZone: "Asia/Tokyo", locales: ["ja-JP"] }),
    "USD",
  );
  assert.equal(detectCurrency({ saved: "KES", country: "NG" }), "KES");
  assert.equal(detectCurrency({ saved: "XYZ", country: "NG" }), "NGN");
});
