import { NextResponse } from "next/server";
import { isLaunched, paymentsEnabled, site } from "@/lib/config";
import { allowedCurrencies, initializeTransaction, newReference, priceFor, type Currency } from "@/lib/paystack";
import { clientKey, rateLimited } from "@/lib/ratelimit";
import { markPending, signupForCheckout } from "@/lib/waitlist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  if (rateLimited(`co:${clientKey(req)}`, 6))
    return NextResponse.json({ ok: false, message: "Too many attempts. Please wait a minute." }, { status: 429 });
  if (!isLaunched()) return NextResponse.json({ ok: false, code: "not_launched", message: "Enrolment hasn't opened yet." }, { status: 409 });
  if (!paymentsEnabled())
    return NextResponse.json({ ok: false, code: "payments_closed", message: "Payments open at launch." }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim().slice(0, 120);
  const currency = (allowedCurrencies() as string[]).includes(body.currency) ? (body.currency as Currency) : "NGN";
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ ok: false, errors: { email: "Enter the email you'd like your access sent to." } }, { status: 422 });

  try {
    const s = await signupForCheckout(email, name);
    if (s.payment.status === "paid") return NextResponse.json({ ok: true, url: `/welcome?already=1` });
    const { amount } = priceFor(currency);
    const reference = newReference(s.id);
    const tx = await initializeTransaction({
      email,
      amount,
      currency,
      reference,
      callbackUrl: `${site.url}/welcome`,
      metadata: { signupId: s.id, name: s.name, careerPath: s.profile.careerPath || "", product: "veerly-founding-cohort" },
    });
    await markPending(s.id, reference, amount, currency);
    return NextResponse.json({ ok: true, url: tx.authorization_url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ ok: false, message: "We couldn't start checkout. Please try again in a moment." }, { status: 502 });
  }
}
