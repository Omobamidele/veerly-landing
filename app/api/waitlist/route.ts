import { NextResponse } from "next/server";
import { clientKey, rateLimited } from "@/lib/ratelimit";
import { upsertSignup, validateStep1 } from "@/lib/waitlist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (rateLimited(`wl:${clientKey(req)}`))
    return NextResponse.json({ ok: false, message: "Too many attempts. Please wait a minute and try again." }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "We couldn't read that submission." }, { status: 400 });
  }
  // Honeypot: hidden from people, often filled by bots. Pretend success, store nothing.
  if (typeof body.company === "string" && body.company.trim()) return NextResponse.json({ ok: true, id: null });

  const { data, errors } = validateStep1(body);
  if (Object.keys(errors).length)
    return NextResponse.json({ ok: false, message: "Please check the highlighted fields.", errors }, { status: 422 });

  try {
    const { signup, duplicate } = await upsertSignup(data);
    return NextResponse.json({
      ok: true,
      duplicate,
      id: signup.id,
      token: signup.editToken,
      whatsapp: signup.consent.whatsapp.granted,
      email: signup.consent.email.granted,
    });
  } catch (err) {
    console.error("[waitlist]", err);
    return NextResponse.json(
      { ok: false, message: "Something went wrong on our side and your details weren't saved. Please try again shortly." },
      { status: 500 },
    );
  }
}
