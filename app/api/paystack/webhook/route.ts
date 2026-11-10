import { NextResponse } from "next/server";
import { processSuccessfulCharge } from "@/lib/payments";
import { verifyWebhookSignature, type PaystackTransaction } from "@/lib/paystack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Paystack webhook: verify signature on the raw body, then process charge.success idempotently. */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers)) return new NextResponse("invalid signature", { status: 401 });

  let event: { event?: string; data?: PaystackTransaction };
  try {
    event = JSON.parse(raw);
  } catch {
    return new NextResponse("bad json", { status: 400 });
  }
  if (event.event === "charge.success" && event.data) {
    try {
      const r = await processSuccessfulCharge(event.data);
      if (!r.ok) console.warn("[paystack] ignored charge", event.data.reference, r.reason);
    } catch (err) {
      console.error("[paystack] processing failed", err);
      return new NextResponse("retry", { status: 500 }); // Paystack retries non-200s
    }
  }
  return NextResponse.json({ received: true });
}
