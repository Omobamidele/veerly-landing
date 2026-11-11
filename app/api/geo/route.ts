import { NextResponse } from "next/server";
import { countryFromHeaders } from "@/lib/geo";
import { currencyForCountry } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the visitor country (if a platform geo header or Accept-Language
 * region is present) and the matching display currency. Nothing is stored.
 */
export async function GET(req: Request) {
  const country = countryFromHeaders(req.headers);
  return NextResponse.json(
    {
      country,
      currency: country ? currencyForCountry(country) : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
