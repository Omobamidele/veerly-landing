import { NextResponse } from "next/server";
import { startAddonCheckout } from "@/lib/addon-checkout";
import { paymentsEnabled } from "@/lib/config";
import { currentPhase, enrolAt, formatWhen, paymentOpen } from "@/lib/launch";
import { clientKey, rateLimited } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Level add-on checkout (product "level_addon"). Same gates as the main checkout: enrolment open, Paystack key set. */
export async function POST(req: Request) {
  if (rateLimited(`addon-co:${clientKey(req)}`, 6))
    return NextResponse.json(
      { ok: false, message: "Too many attempts. Please wait a minute." },
      { status: 429 },
    );
  if (!paymentOpen(currentPhase()))
    return NextResponse.json(
      {
        ok: false,
        code: "enrolment_not_open",
        message: `Extra levels open for purchase when enrolment opens, on ${formatWhen(enrolAt())}.`,
      },
      { status: 409 },
    );
  if (!paymentsEnabled())
    return NextResponse.json(
      { ok: false, code: "payments_closed", message: "Payments open at launch." },
      { status: 503 },
    );
  const body = await req.json().catch(() => ({}));
  const r = await startAddonCheckout(body && typeof body === "object" ? body : {});
  return NextResponse.json(r.json, { status: r.status });
}
