import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { pricing } from "./config";
import { acceptedAddonCharges, chargeAmount, type ChargeCurrency } from "./pricing";

/**
 * Paystack (primary payments for Nigeria). Docs:
 * - Initialize: POST https://api.paystack.co/transaction/initialize (amount in subunit, Bearer secret key)
 * - Verify:     GET  https://api.paystack.co/transaction/verify/:reference
 * - Webhooks:   `Paystack-Signature: t=<unix>,v1=<key_id>:<hex>` = HMAC-SHA512(whsec_ secret, `${t}.${rawBody}`)
 *               legacy `x-paystack-signature` = HMAC-SHA512(secret key, rawBody)
 * Other providers (Stripe, Lemon Squeezy) can implement the same three functions later.
 */
const API = "https://api.paystack.co";
const env = (k: string) => (process.env[k] || "").trim();

export type Currency = ChargeCurrency;

/** Checkout amount in the subunit (kobo / cents), from the price table in lib/pricing.ts. */
export function priceFor(currency: Currency) {
  return { currency, amount: chargeAmount(currency) };
}

export function allowedCurrencies(): Currency[] {
  return pricing.usdEnabled ? ["NGN", "USD"] : ["NGN"];
}

export function newReference(signupId: string) {
  return `vrly-${signupId.slice(0, 8)}-${randomBytes(6).toString("hex")}`;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env("PAYSTACK_SECRET_KEY")}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.status)
    throw new Error(
      `Paystack ${path} ${res.status}: ${json.message || "error"}`,
    );
  return json.data as T;
}

export function initializeTransaction(input: {
  email: string;
  amount: number;
  currency: Currency;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}) {
  return api<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: String(input.amount),
      currency: input.currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: JSON.stringify(input.metadata),
    }),
  });
}

export type PaystackTransaction = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string;
  customer: { email: string; first_name?: string | null };
  metadata?: Record<string, unknown> | string | null;
};

export function verifyTransaction(reference: string) {
  return api<PaystackTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}

function safeEqualHex(a: string, b: string) {
  if (!/^[0-9a-f]+$/i.test(b) || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

/**
 * Verify a webhook. Prefers the timestamped `Paystack-Signature` (needs PAYSTACK_WEBHOOK_SECRET),
 * falls back to legacy `x-paystack-signature` (needs PAYSTACK_SECRET_KEY) only when the new header is absent.
 */
export function verifyWebhookSignature(
  rawBody: string,
  headers: { get(name: string): string | null },
  opts: {
    secretKey?: string;
    webhookSecret?: string;
    now?: number;
    toleranceSec?: number;
  } = {},
): boolean {
  const secretKey = opts.secretKey ?? env("PAYSTACK_SECRET_KEY");
  const webhookSecret = opts.webhookSecret ?? env("PAYSTACK_WEBHOOK_SECRET");
  const now = Math.floor((opts.now ?? Date.now()) / 1000);
  const tolerance = opts.toleranceSec ?? 300;

  const modern = headers.get("paystack-signature");
  if (modern && webhookSecret) {
    let t = "";
    const sigs: string[] = [];
    for (const part of modern.split(",")) {
      const [k, ...v] = part.trim().split("=");
      const value = v.join("=");
      if (k === "t") t = value;
      if (k === "v1") {
        const idx = value.indexOf(":");
        sigs.push(idx >= 0 ? value.slice(idx + 1) : value);
      }
    }
    if (!/^\d+$/.test(t) || Math.abs(now - Number(t)) > tolerance) return false;
    const expected = createHmac("sha512", webhookSecret)
      .update(`${t}.${rawBody}`)
      .digest("hex");
    return sigs.some((s) => safeEqualHex(expected, s.toLowerCase()));
  }
  // Without the signing secret the new header can't be checked; fall back to the legacy header.
  const legacy = headers.get("x-paystack-signature");
  if (!legacy || !secretKey) return false;
  const expected = createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");
  return safeEqualHex(expected, legacy.toLowerCase());
}

export function parseMetadata(
  m: PaystackTransaction["metadata"],
): Record<string, unknown> {
  if (!m) return {};
  if (typeof m === "string") {
    try {
      return JSON.parse(m);
    } catch {
      return {};
    }
  }
  return m;
}

/** A charge is only accepted if it matches one of our prices exactly. */
export function isExpectedCharge(
  tx: Pick<PaystackTransaction, "status" | "amount" | "currency">,
) {
  if (tx.status !== "success") return false;
  return allowedCurrencies().some((c) => {
    const p = priceFor(c);
    return p.currency === tx.currency && p.amount === tx.amount;
  });
}

/** Is this metadata from a level add-on purchase? */
export const isAddonMetadata = (meta: Record<string, unknown>) => meta.product === "level_addon";

/**
 * An add-on charge is accepted if it matches an add-on price we would charge today, or the exact amount we
 * recorded when the order was started (so a rate-table edit between "pay" and "paid" can't strand a payment).
 */
export function isExpectedAddonCharge(
  tx: Pick<PaystackTransaction, "status" | "amount" | "currency">,
  recorded?: { amount: number; currency: string } | null,
) {
  if (tx.status !== "success") return false;
  if (recorded && recorded.amount === tx.amount && recorded.currency === tx.currency) return true;
  return acceptedAddonCharges(pricing.usdEnabled).some((c) => c.currency === tx.currency && c.amount === tx.amount);
}
