import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { store, validate } from "@/lib/waitlist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Light in-memory throttle (per server instance).
const hits = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 8;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (throttled(ip))
    return NextResponse.json({ ok: false, message: "Too many attempts. Please wait a minute and try again." }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "We couldn't read that submission." }, { status: 400 });
  }

  // Honeypot: real people never fill this hidden field.
  if (typeof body.company_website === "string" && body.company_website.trim() !== "")
    return NextResponse.json({ ok: true });

  const { data, errors } = validate(body);
  if (Object.keys(errors).length)
    return NextResponse.json({ ok: false, message: "Please check the highlighted fields.", errors }, { status: 422 });

  const now = new Date().toISOString();
  try {
    const result = await store({ id: randomUUID(), ...data, createdAt: now, updatedAt: now });
    return NextResponse.json({ ok: true, duplicate: result.duplicate });
  } catch (err) {
    console.error("[waitlist]", err);
    return NextResponse.json(
      { ok: false, message: "Something went wrong on our side and your details were not saved. Please try again shortly." },
      { status: 500 },
    );
  }
}
