import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  ADDON_MESSAGES,
  addonLink,
  buyableLevels,
  checkAddonEligibility,
  ownedLevelsOf,
  ownedOnPath,
  parseAddonParams,
  parseStoredOwned,
  preselect,
} from "../lib/addon";
import { lookupOwned, startAddonCheckout } from "../lib/addon-checkout";
import { toCsv } from "../lib/csv";
import { processSuccessfulCharge } from "../lib/payments";
import { isExpectedAddonCharge, type PaystackTransaction } from "../lib/paystack";
import {
  CURRENCIES,
  LEVEL_CHANGE_PRICES,
  LEVEL_CHANGE_USD,
  USD_RATES,
  USD_RATES_UPDATED,
  acceptedAddonCharges,
  addonChargeFor,
  convertedLevelChange,
  formatLevelChange,
  levelChangeParts,
  levelChangeRateNote,
  levelFeeLabel,
  toSubunit,
} from "../lib/pricing";
import { getStore } from "../lib/store";
import type { Signup } from "../lib/types";
import { markPaid, signupForCheckout } from "../lib/waitlist";
import { freshStore } from "./helpers";

const VA = "Administration and Virtual Assistance" as const;

// ---------- Pricing ----------

test("add-on price: US$3.99 headline, and a fixed N5,000 for naira", () => {
  assert.equal(LEVEL_CHANGE_PRICES.USD, 3.99);
  assert.equal(LEVEL_CHANGE_PRICES.NGN, 5000);
  assert.equal(LEVEL_CHANGE_USD, 3.99);
  assert.equal(formatLevelChange("USD"), "$3.99");
  // Naira is static: no "about", no dollars, whatever the exchange rate.
  assert.equal(formatLevelChange("NGN"), "₦5,000");
  assert.deepEqual(levelChangeParts("NGN"), { main: "₦5,000", approx: null });
  assert.equal(levelChangeRateNote("NGN"), null);
  assert.equal(levelChangeRateNote("USD"), null);
});

test("add-on price: other currencies show $3.99 with an approximate local amount", () => {
  const expected: Record<string, string> = {
    GBP: "$3.99 (about £2.98)",
    EUR: "$3.99 (about €3.56)",
    CAD: "$3.99 (about CA$5.62)",
    GHS: "$3.99 (about GH₵47)",
    KES: "$3.99 (about Ksh 520)",
    ZAR: "$3.99 (about R 66)",
    INR: "$3.99 (about ₹375)",
    AUD: "$3.99 (about A$5.78)",
  };
  for (const [c, text] of Object.entries(expected))
    assert.equal(
      formatLevelChange(c as (typeof CURRENCIES)[number]).replace(/[\s\u00a0]/g, " "),
      text.replace(/[\s\u00a0]/g, " "),
      c,
    );
  for (const c of CURRENCIES.filter((x) => x !== "USD" && x !== "NGN"))
    assert.match(levelChangeRateNote(c) ?? "", /approximate/i, c);
});

test("one exchange-rate table, hand-set and dated, no live fetching", () => {
  assert.deepEqual(Object.keys(USD_RATES).sort(), [...CURRENCIES].sort());
  assert.equal(USD_RATES.USD.perUsd, 1);
  for (const c of CURRENCIES) assert.ok(USD_RATES[c].perUsd > 0 && USD_RATES[c].asOf, c);
  assert.match(USD_RATES_UPDATED, /\d{4}$/);
  const src = readFileSync(join(__dirname, "../lib/pricing.ts"), "utf8");
  assert.doesNotMatch(src, /fetch\(/);
  assert.equal(convertedLevelChange("GBP"), 2.98);
});

test("checkout currency for the add-on", () => {
  assert.deepEqual(addonChargeFor("NGN", true), { currency: "NGN", amount: 5000 });
  assert.deepEqual(addonChargeFor("NGN", false), { currency: "NGN", amount: 5000 });
  assert.deepEqual(addonChargeFor("GBP", true), { currency: "USD", amount: 3.99 });
  assert.deepEqual(addonChargeFor("USD", true), { currency: "USD", amount: 3.99 });
  // No USD on Paystack yet: everyone pays the same static N5,000.
  assert.deepEqual(addonChargeFor("GBP", false), { currency: "NGN", amount: 5000 });
  assert.equal(toSubunit(3.99), 399);
  assert.equal(toSubunit(5000), 500_000);
});

test("accepted add-on charges: exact amounts only, USD only when enabled", () => {
  const off = acceptedAddonCharges(false);
  assert.ok(off.every((c) => c.currency === "NGN"));
  assert.ok(acceptedAddonCharges(true).some((c) => c.currency === "USD" && c.amount === 399));
  process.env.PAYSTACK_ENABLE_USD = "true";
  const ok = (amount: number, currency: string, status = "success") =>
    isExpectedAddonCharge({ status, amount, currency });
  assert.equal(ok(399, "USD"), true);
  assert.equal(ok(500_000, "NGN"), true);
  assert.equal(ok(1_000_000, "NGN"), false); // the main course price is not the add-on price
  assert.equal(ok(799, "USD"), false); // founding price is not the add-on price
  assert.equal(ok(399, "USD", "failed"), false);
  assert.equal(isExpectedAddonCharge({ status: "success", amount: 123, currency: "NGN" }, { amount: 123, currency: "NGN" }), true);
  delete process.env.PAYSTACK_ENABLE_USD;
});

test("no copy says the add-on is N10,000 (that is the course price)", () => {
  const walk = (d: string): string[] =>
    readdirSync(d).flatMap((n) => {
      const p = join(d, n);
      return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|md)$/.test(n) ? [p] : [];
    });
  const root = join(__dirname, "..");
  for (const f of ["app", "components", "lib"].flatMap((d) => walk(join(root, d))))
    assert.doesNotMatch(readFileSync(f, "utf8"), /add-on[^.]{0,40}(₦|NGN)\s?10,000|(₦|NGN)\s?10,000[^.]{0,40}(additional fee|add-on)/i, f);
});

// ---------- Eligibility and deep links ----------

test("eligibility: a level you own cannot be bought again", () => {
  const owned = [{ path: VA, level: "beginner" as const }];
  const same = checkAddonEligibility(owned, "va", "beginner");
  assert.equal(same.ok, false);
  if (!same.ok) {
    assert.equal(same.code, "already_owned");
    assert.match(same.message, /You already have the Beginner level for Virtual Assistant/);
  }
  assert.deepEqual(checkAddonEligibility(owned, "va", "intermediate"), { ok: true, path: VA, level: "intermediate" });
  // Another path's Beginner is a different workspace.
  assert.equal(checkAddonEligibility(owned, "sales", "beginner").ok, true);
  assert.deepEqual(buyableLevels(owned, VA), ["intermediate", "advanced"]);
  assert.deepEqual(ownedOnPath(owned, VA), ["beginner"]);
});

test("eligibility: plain-language messages for missing input", () => {
  const r1 = checkAddonEligibility([], "", "beginner");
  const r2 = checkAddonEligibility([], "va", "expert");
  assert.ok(!r1.ok && r1.message === ADDON_MESSAGES.no_path);
  assert.ok(!r2.ok && r2.message === ADDON_MESSAGES.no_level);
  for (const m of Object.values(ADDON_MESSAGES)) assert.doesNotMatch(m, /invalid|undefined|null|error code/i);
});

test("deep links: build, parse and preselect exactly one level", () => {
  assert.equal(addonLink("Administration and Virtual Assistance", "intermediate"), "/add-level?path=va&level=intermediate");
  assert.equal(addonLink(), "/add-level");
  assert.deepEqual(parseAddonParams(new URLSearchParams("path=va&level=intermediate")), { path: VA, level: "intermediate" });
  assert.deepEqual(parseAddonParams({ path: "gtm", level: ["advanced", "beginner"] }), { path: "GTM and Revenue Operations", level: "advanced" });
  assert.deepEqual(parseAddonParams(new URLSearchParams("path=nonsense&level=expert")), { path: null, level: null });
  const linked = parseAddonParams(new URLSearchParams("path=va&level=intermediate"));
  assert.deepEqual(preselect(linked, [{ path: VA, level: "beginner" }]), { path: VA, level: "intermediate", blocked: null });
  // A link to a level they own preselects nothing and says why.
  assert.deepEqual(preselect(linked, [{ path: VA, level: "intermediate" }]), { path: VA, level: null, blocked: "intermediate" });
  assert.deepEqual(preselect({ path: VA, level: null }, []), { path: VA, level: null, blocked: null });
});

test("remembered levels in the browser are parsed safely", () => {
  assert.deepEqual(parseStoredOwned('[{"path":"va","level":"beginner"},{"path":"va","level":"beginner"},{"path":"x","level":"y"}]'), [
    { path: VA, level: "beginner" },
  ]);
  assert.deepEqual(parseStoredOwned("not json"), []);
  assert.deepEqual(parseStoredOwned(null), []);
});

// ---------- Store: owned levels, checkout, payment, CSV ----------

async function paidStudent(level: "beginner" | "intermediate" | "advanced" = "beginner") {
  const s = await signupForCheckout("ada@example.com", "Ada Obi", { level, careerPath: VA });
  const store = getStore();
  await store.put({ ...s, whatsapp: "+2348012345678" });
  await markPaid({ signupId: s.id, email: s.email, reference: "vrly-main-1", amount: 1_000_000, currency: "NGN", level, careerPath: VA });
  return s.id;
}

test("owned levels come from the paid record and survive a second checkout", async () => {
  freshStore();
  const id = await paidStudent("beginner");
  // Trying to re-pick a level at checkout after paying must not rewrite what they bought.
  await signupForCheckout("ada@example.com", "Ada", { level: "advanced", careerPath: VA });
  const s = await getStore().get(id);
  assert.deepEqual(ownedLevelsOf(s), [{ path: VA, level: "beginner" }]);
  assert.deepEqual(ownedLevelsOf(null), []);
  // An unpaid signup owns nothing.
  const unpaid = await signupForCheckout("bo@example.com", "Bo", { level: "beginner", careerPath: VA });
  assert.deepEqual(ownedLevelsOf(unpaid), []);
});

test("lookup finds paid students by email or WhatsApp, and nobody else", async () => {
  freshStore();
  await paidStudent("beginner");
  await signupForCheckout("waitlist@example.com", "Wai", { level: "beginner", careerPath: VA });
  const byEmail = await lookupOwned({ contact: "ADA@example.com" });
  assert.ok(byEmail.found && byEmail.owned.length === 1);
  const byPhone = await lookupOwned({ contact: "0801 234 5678", whatsappCountry: "NG" });
  assert.ok(byPhone.found);
  const unpaid = await lookupOwned({ contact: "waitlist@example.com" });
  assert.deepEqual(unpaid, { found: false, error: null });
  const bad = await lookupOwned({ contact: "ada@" });
  assert.ok(!bad.found && bad.error === ADDON_MESSAGES.email);
  const empty = await lookupOwned({});
  assert.ok(!empty.found && empty.error === ADDON_MESSAGES.contact);
});

test("add-on checkout refuses a level already owned and asks for what is missing", async () => {
  freshStore();
  await paidStudent("beginner");
  const owned = await startAddonCheckout({ contact: "ada@example.com", path: "va", level: "beginner", currency: "USD" });
  assert.equal(owned.status, 409);
  assert.ok(!owned.json.ok && owned.json.code === "already_owned");
  const noLevel = await startAddonCheckout({ contact: "ada@example.com", path: "va", currency: "USD" });
  assert.equal(noLevel.status, 422);
  const noPath = await startAddonCheckout({ contact: "ada@example.com", level: "advanced" });
  assert.equal(noPath.status, 422);
  const noContact = await startAddonCheckout({ path: "va", level: "advanced" });
  assert.equal(noContact.status, 422);
  // Not found and nothing stated: asks for the level they already have.
  const stranger = await startAddonCheckout({ contact: "who@example.com", path: "va", level: "advanced" });
  assert.ok(!stranger.json.ok && stranger.json.code === "no_owned");
  // Stating the same level as the one they want is blocked too.
  const same = await startAddonCheckout({ contact: "who@example.com", path: "va", level: "advanced", ownedLevel: "advanced" });
  assert.ok(!same.json.ok && same.json.code === "already_owned");
});

const addonTx = (over: Partial<PaystackTransaction> & { metadata?: Record<string, unknown> } = {}): PaystackTransaction => ({
  status: "success",
  reference: "vrly-add-1",
  amount: 500_000,
  currency: "NGN",
  paid_at: "2027-01-05T10:00:00.000Z",
  customer: { email: "ada@example.com" },
  metadata: { product: "level_addon", path: VA, ownedLevel: "beginner", addonLevel: "intermediate", verified: true },
  ...over,
});

test("a paid add-on is recorded once, grants the level, and is blocked from being bought again", async () => {
  freshStore();
  const id = await paidStudent("beginner");
  const first = await processSuccessfulCharge(addonTx());
  assert.ok(first.ok);
  const again = await processSuccessfulCharge(addonTx()); // webhook and callback both arrive
  assert.ok(again.ok);
  const s = await getStore().get(id);
  assert.equal(s?.addons?.length, 1);
  assert.equal(s?.addons?.[0].status, "paid");
  assert.equal(s?.addons?.[0].amount, 500_000);
  assert.deepEqual(ownedLevelsOf(s), [
    { path: VA, level: "beginner" },
    { path: VA, level: "intermediate" },
  ]);
  // The main payment is untouched.
  assert.equal(s?.payment.reference, "vrly-main-1");
  const blocked = await startAddonCheckout({ contact: "ada@example.com", path: "va", level: "intermediate", currency: "USD" });
  assert.equal(blocked.status, 409);
  // Each further level is its own add-on.
  assert.ok((await processSuccessfulCharge(addonTx({ reference: "vrly-add-2", metadata: { product: "level_addon", path: VA, ownedLevel: "beginner+intermediate", addonLevel: "advanced", verified: true } }))).ok);
  assert.equal((await getStore().get(id))?.addons?.length, 2);
});

test("an add-on charge with the wrong amount, or missing details, is ignored", async () => {
  freshStore();
  await paidStudent("beginner");
  const wrong = await processSuccessfulCharge(addonTx({ amount: 12345 }));
  assert.deepEqual(wrong, { ok: false, reason: "unexpected_charge" });
  const bad = await processSuccessfulCharge(addonTx({ metadata: { product: "level_addon", path: VA } }));
  assert.deepEqual(bad, { ok: false, reason: "bad_addon_metadata" });
});

test("admin CSV: type, path, ownedLevel, addonLevel, amount, currency", async () => {
  freshStore();
  await paidStudent("beginner");
  await processSuccessfulCharge(addonTx());
  const list = await getStore().list();
  const csv = toCsv(list as Signup[]);
  const [header, ...rows] = csv.trim().split("\n");
  const cols = header.split(",");
  for (const c of ["type", "path", "ownedLevel", "addonLevel", "amount", "currency"]) assert.ok(cols.includes(c), c);
  assert.equal(rows.length, 2); // the signup row and the add-on row
  const pick = (row: string, name: string) => row.split(",")[cols.indexOf(name)];
  const [signupRow, addonRow] = rows;
  assert.equal(pick(signupRow, "type"), "signup");
  assert.equal(pick(signupRow, "amount"), "10000");
  assert.equal(pick(signupRow, "currency"), "NGN");
  assert.equal(pick(signupRow, "addonLevel"), "");
  assert.equal(pick(addonRow, "type"), "level_addon");
  assert.equal(pick(addonRow, "ownedLevel"), "beginner");
  assert.equal(pick(addonRow, "addonLevel"), "intermediate");
  assert.equal(pick(addonRow, "amount"), "5000");
  assert.equal(pick(addonRow, "currency"), "NGN");
  assert.equal(pick(addonRow, "payment_reference"), ""); // add-on rows don't repeat the main payment
});

test("the fee is called an additional fee in the FAQ, terms, quiz, levels line and dialogs", () => {
  const read = (f: string) => readFileSync(join(__dirname, "..", f), "utf8").replace(/\s+/g, " ");
  for (const f of [
    "app/page.tsx",
    "app/terms/page.tsx",
    "components/LevelQuiz.tsx",
    "components/LevelChoice.tsx",
    "components/SignupCard.tsx",
    "components/AddLevelFlow.tsx",
  ])
    assert.match(read(f), /additional fee/i, f);
  assert.match(read("app/page.tsx"), /href="\/add-level"/);
  assert.match(read("components/SiteChrome.tsx"), /href="\/add-level"/);
  assert.match(read("components/LevelQuiz.tsx"), /addonLink\(path, result\.level\)/);
  assert.match(read("app/welcome/page.tsx"), /ADDON_PAGE/);
});

test("currency dropdown beside the add-on price: every currency, naira stays the fixed N5,000", () => {
  // One option per currency already in lib/pricing.ts.
  assert.equal(CURRENCIES.length, 10);
  assert.equal(levelFeeLabel("NGN"), "₦5,000");
  assert.equal(levelFeeLabel("USD"), "$3.99");
  assert.equal(levelFeeLabel("GBP"), "about £2.98");
  for (const c of CURRENCIES) {
    const label = levelFeeLabel(c);
    assert.match(label, /\d/, c);
    // Only converted amounts are called "about"; the two fixed prices never are.
    assert.equal(label.startsWith("about "), c !== "NGN" && c !== "USD", c);
  }
  // Choosing naira is not a conversion: moving the rate table can't change it.
  const before = USD_RATES.NGN.perUsd;
  USD_RATES.NGN.perUsd = 9999;
  assert.equal(levelFeeLabel("NGN"), "₦5,000");
  assert.equal(formatLevelChange("NGN"), "₦5,000");
  USD_RATES.NGN.perUsd = before;
  // Changing another currency's rate does move its "about" amount.
  const gbp = USD_RATES.GBP.perUsd;
  USD_RATES.GBP.perUsd = 1;
  assert.equal(levelFeeLabel("GBP"), "about £3.99");
  USD_RATES.GBP.perUsd = gbp;
});

test("the dropdown is the shadcn Select, on the page and in the confirm dialog, and the dialog sits beside the price", () => {
  const read = (f: string) => readFileSync(join(__dirname, "..", f), "utf8");
  const flow = read("components/AddLevelFlow.tsx");
  assert.equal((flow.match(/<CurrencySelect/g) ?? []).length, 2); // page summary + confirm dialog
  assert.equal((flow.match(/amounts="level-fee"/g) ?? []).length, 2);
  assert.match(flow, /data-addon-price-row/);
  assert.match(flow, /data-addon-confirm-currency/);
  const cur = read("components/Currency.tsx");
  assert.match(cur, /from "@\/components\/ui\/select"/);
  assert.match(cur, /CURRENCIES\.map/); // all currencies are listed
  assert.match(cur, /levelFeeLabel/);
});
