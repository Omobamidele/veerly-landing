import assert from "node:assert/strict";
import { test } from "node:test";
import { freshStore } from "./helpers";

test("brevo sink: syncs consented contact with attributes and lists (mocked fetch)", async () => {
  freshStore();
  process.env.BREVO_API_KEY = "xkeysib-test";
  process.env.BREVO_LIST_ID = "3";
  process.env.BREVO_WHATSAPP_LIST_ID = "4";
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(String(init.body)) });
    return new Response(JSON.stringify({ id: 1 }), { status: 201 });
  }) as typeof fetch;
  try {
    const { upsertSignup, validateStep1 } = await import("../lib/waitlist");
    await upsertSignup(
      validateStep1({
        name: "Tunde Bello",
        email: "tunde@example.com",
        whatsapp: "08031234567",
        whatsappCountry: "NG",
        emailConsent: true,
        whatsappConsent: true,
        level: "beginner",
      }).data,
    );
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://api.brevo.com/v3/contacts");
    assert.deepEqual(calls[0].body.listIds, [3, 4]);
    const attrs = calls[0].body.attributes as Record<string, unknown>;
    assert.equal(attrs.WHATSAPP, "+2348031234567");
    assert.equal(attrs.EMAIL_CONSENT, true);
    assert.equal(calls[0].body.updateEnabled, true);

    calls.length = 0;
    await upsertSignup(
      validateStep1({
        name: "No Consent",
        email: "nc@example.com",
        emailConsent: false,
        whatsappConsent: false,
      }).data,
    ).catch(() => {});
    // validation would block this in the API; the sink itself also refuses without consent:
    assert.equal(calls.length, 0);
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.BREVO_API_KEY;
  }
});

test("checkout: 409 before launch, 503 'payments open at launch' without Paystack key", async () => {
  freshStore();
  delete process.env.PAYSTACK_SECRET_KEY;
  const { POST } = await import("../app/api/checkout/route");
  const mk = () =>
    new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ email: "a@example.com", level: "beginner" }),
      headers: { "x-forwarded-for": `t${Math.random()}` },
    });
  for (const state of ["prelaunch", "promo"]) {
    process.env.NEXT_PUBLIC_LAUNCH_STATE = state;
    const res = await POST(mk());
    assert.equal(res.status, 409);
    const j = await res.json();
    assert.equal(j.code, "enrolment_not_open");
    assert.match(j.message, /1 January 2027, 9:00 AM WAT/);
  }
  process.env.NEXT_PUBLIC_LAUNCH_STATE = "enrol";
  assert.equal((await POST(mk())).status, 503);
  process.env.NEXT_PUBLIC_LAUNCH_STATE = "launched";
  const r = await POST(mk());
  assert.equal(r.status, 503);
  assert.equal((await r.json()).code, "payments_closed");
  delete process.env.NEXT_PUBLIC_LAUNCH_STATE;
});

test("whatsapp payload uses an approved template with the first name", async () => {
  const { buildTemplatePayload } = await import("../lib/whatsapp");
  const p = buildTemplatePayload("+2348031234567", "veerly_launch", "en", [
    "Ada",
  ]);
  assert.equal(p.to, "2348031234567");
  assert.equal(p.type, "template");
  assert.equal(p.template.name, "veerly_launch");
  assert.deepEqual(p.template.components[0].parameters, [
    { type: "text", text: "Ada" },
  ]);
});

test("checkout: 422 when no level is chosen", async () => {
  freshStore();
  process.env.NEXT_PUBLIC_LAUNCH_STATE = "enrol";
  process.env.PAYSTACK_SECRET_KEY = "sk_test_mock";
  const { POST } = await import("../app/api/checkout/route");
  const res = await POST(
    new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ email: "a@example.com" }),
      headers: { "x-forwarded-for": `t${Math.random()}` },
    }),
  );
  assert.equal(res.status, 422);
  const j = await res.json();
  assert.equal(j.errors.level, "Choose Beginner, Intermediate or Advanced.");
  delete process.env.NEXT_PUBLIC_LAUNCH_STATE;
  delete process.env.PAYSTACK_SECRET_KEY;
});
