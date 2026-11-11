import { parseLevel } from "./levels";
import { isExpectedCharge, parseMetadata, type PaystackTransaction } from "./paystack";
import { markPaid } from "./waitlist";

/** Shared by the webhook and the /welcome callback. Idempotent per reference. */
export async function processSuccessfulCharge(tx: PaystackTransaction) {
  if (!isExpectedCharge(tx)) return { ok: false as const, reason: "unexpected_charge" };
  const meta = parseMetadata(tx.metadata);
  const result = await markPaid({
    signupId: typeof meta.signupId === "string" ? meta.signupId : undefined,
    email: tx.customer.email,
    name: typeof meta.name === "string" ? meta.name : undefined,
    reference: tx.reference,
    amount: tx.amount,
    currency: tx.currency,
    paidAt: tx.paid_at,
    level: parseLevel(meta.level),
  });
  return { ok: true as const, ...result };
}
