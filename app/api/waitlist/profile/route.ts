import { NextResponse } from "next/server";
import { clientKey, rateLimited } from "@/lib/ratelimit";
import { updateProfile, validateProfile } from "@/lib/waitlist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (rateLimited(`pf:${clientKey(req)}`))
    return NextResponse.json({ ok: false, message: "Too many attempts. Please wait a minute." }, { status: 429 });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "We couldn't read that submission." }, { status: 400 });
  }
  const { data, errors } = validateProfile(body);
  if (Object.keys(errors).length)
    return NextResponse.json({ ok: false, message: "Please check the highlighted fields.", errors }, { status: 422 });
  try {
    const s = await updateProfile(String(body.id || ""), String(body.token || ""), data);
    if (!s) return NextResponse.json({ ok: false, message: "This link has expired. Your spot is still saved." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[profile]", err);
    return NextResponse.json({ ok: false, message: "We couldn't save that. Your spot is still saved." }, { status: 500 });
  }
}
