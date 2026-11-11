import { NextResponse } from "next/server";
import { paymentsEnabled, pricing, site } from "@/lib/config";
import { currentPhase, enrolAt, formatWhen, paymentOpen } from "@/lib/launch";
import { initializeTransaction, newReference, priceFor } from "@/lib/paystack";
import { LEVEL_LABEL, parseLevel, parsePath, pathLabel } from "@/lib/levels";
import { chargeCurrencyFor, isCurrency } from "@/lib/pricing";
import { clientKey, rateLimited } from "@/lib/ratelimit";
import { markPending, signupForCheckout } from "@/lib/waitlist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  if (rateLimited(`co:${clientKey(req)}`, 6))
    return NextResponse.json(
      { ok: false, message: "Too many attempts. Please wait a minute." },
      { status: 429 },
    );
  if (!paymentOpen(currentPhase()))
    return NextResponse.json(
      {
        ok: false,
        code: "enrolment_not_open",
        message: `Enrolment and payment open ${formatWhen(enrolAt())}. Join the waitlist and we'll tell you the moment it opens.`,
      },
      { status: 409 },
    );
  if (!paymentsEnabled())
    return NextResponse.json(
      {
        ok: false,
        code: "payments_closed",
        message: "Payments open at launch.",
      },
      { status: 503 },
    );

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const name = String(body.name || "")
    .trim()
    .slice(0, 120);
  // The visitor's chosen display currency decides the charge: NGN → NGN; anything else → USD if enabled, else NGN.
  const currency = chargeCurrencyFor(
    isCurrency(body.currency) ? body.currency : "NGN",
    pricing.usdEnabled,
  );
  if (!EMAIL_RE.test(email))
    return NextResponse.json(
      {
        ok: false,
        errors: { email: "Enter the email you'd like your access sent to." },
      },
      { status: 422 },
    );
  const level = parseLevel(body.level);
  if (!level)
    return NextResponse.json(
      {
        ok: false,
        errors: { level: "Choose Beginner, Intermediate or Advanced." },
        message: "Choose Beginner, Intermediate or Advanced first.",
      },
      { status: 422 },
    );
  const careerPath = parsePath(body.careerPath ?? body.path);
  if (!careerPath)
    return NextResponse.json(
      {
        ok: false,
        errors: { careerPath: "Choose a career path." },
        message: "Choose a career path first.",
      },
      { status: 422 },
    );

  try {
    const s = await signupForCheckout(email, name, { level, careerPath });
    if (s.payment.status === "paid")
      return NextResponse.json({ ok: true, url: `/welcome?already=1` });
    const { amount } = priceFor(currency);
    const reference = newReference(s.id);
    const tx = await initializeTransaction({
      email,
      amount,
      currency,
      reference,
      callbackUrl: `${site.url}/welcome`,
      metadata: {
        signupId: s.id,
        name: s.name,
        careerPath,
        pathLabel: pathLabel(careerPath),
        level,
        levelLabel: LEVEL_LABEL[level],
        product: "veerly-founding-cohort",
      },
    });
    await markPending(s.id, reference, amount, currency);
    return NextResponse.json({ ok: true, url: tx.authorization_url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      {
        ok: false,
        message: "We couldn't start checkout. Please try again in a moment.",
      },
      { status: 502 },
    );
  }
}
