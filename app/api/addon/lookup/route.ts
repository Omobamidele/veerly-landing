import { NextResponse } from "next/server";
import { lookupOwned } from "@/lib/addon-checkout";
import { clientKey, rateLimited } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Which levels does this paid student already own? Rate-limited; returns nothing for unpaid or unknown contacts. */
export async function POST(req: Request) {
  if (rateLimited(`addon-lookup:${clientKey(req)}`, 8))
    return NextResponse.json(
      { ok: false, message: "Too many tries. Please wait a minute and try again." },
      { status: 429 },
    );
  const body = await req.json().catch(() => ({}));
  const r = await lookupOwned(body && typeof body === "object" ? body : {});
  return NextResponse.json(
    r.found ? { ok: true, found: true, owned: r.owned } : { ok: true, found: false, message: r.error },
    { headers: { "Cache-Control": "no-store" } },
  );
}
