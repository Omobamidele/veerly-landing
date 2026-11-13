import { parseLevel, parsePath } from "./levels";
import { isAddonMetadata, isExpectedAddonCharge, isExpectedCharge, parseMetadata, type PaystackTransaction } from "./paystack";
import { getStore } from "./store";
import { markAddonPaid, markPaid } from "./waitlist";

/** Shared by the webhook and the /welcome callback. Idempotent per reference. */
export async function processSuccessfulCharge(tx: PaystackTransaction) {
  const meta = parseMetadata(tx.metadata);
  if (isAddonMetadata(meta)) return processSuccessfulAddon(tx, meta);
  if (!isExpectedCharge(tx)) return { ok: false as const, reason: "unexpected_charge" };
  const result = await markPaid({
    signupId: typeof meta.signupId === "string" ? meta.signupId : undefined,
    email: tx.customer.email,
    name: typeof meta.name === "string" ? meta.name : undefined,
    reference: tx.reference,
    amount: tx.amount,
    currency: tx.currency,
    paidAt: tx.paid_at,
    level: parseLevel(meta.level),
    careerPath: parsePath(meta.careerPath ?? meta.pathLabel ?? meta.path),
  });
  return { ok: true as const, ...result };
}

/** A level add-on: needs a level we sell, and a price we would charge (or the one recorded at checkout). */
async function processSuccessfulAddon(tx: PaystackTransaction, meta: Record<string, unknown>) {
  const path = parsePath(meta.path ?? meta.careerPath);
  const addonLevel = parseLevel(meta.addonLevel);
  if (!path || !addonLevel) return { ok: false as const, reason: "bad_addon_metadata" };
  const signupId = typeof meta.signupId === "string" ? meta.signupId : undefined;
  const store = getStore();
  const s = (signupId && (await store.get(signupId))) || (await store.findByEmail(tx.customer.email.toLowerCase()));
  const recorded = s?.addons?.find((a) => a.reference === tx.reference) ?? null;
  if (!isExpectedAddonCharge(tx, recorded)) return { ok: false as const, reason: "unexpected_charge" };
  const result = await markAddonPaid({
    signupId,
    email: tx.customer.email,
    reference: tx.reference,
    amount: tx.amount,
    currency: tx.currency,
    paidAt: tx.paid_at,
    path,
    addonLevel,
    ownedLevel: typeof meta.ownedLevel === "string" ? meta.ownedLevel : "",
    verified: meta.verified === true,
  });
  return { ok: true as const, addon: true as const, ...result };
}
