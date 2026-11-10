import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { freshStore } from "./helpers";

test("webhook: rejects bad signature, marks paid once (idempotent)", async () => {
  const file = freshStore();
  process.env.PAYSTACK_SECRET_KEY = "sk_test_mock";
  process.env.PAYSTACK_WEBHOOK_SECRET = "";
  const { upsertSignup, validateStep1 } = await import("../lib/waitlist");
  const { POST } = await import("../app/api/paystack/webhook/route");

  const { signup } = await upsertSignup(
    validateStep1({
      name: "Ada Obi",
      email: "ada@example.com",
      whatsapp: "08031234567",
      whatsappCountry: "NG",
      emailConsent: true,
      whatsappConsent: true,
    }).data,
  );

  const payload = JSON.stringify({
    event: "charge.success",
    data: {
      status: "success",
      reference: "vrly-test-1",
      amount: 1_000_000,
      currency: "NGN",
      paid_at: "2026-12-01T09:05:00.000Z",
      customer: { email: "ada@example.com" },
      metadata: { signupId: signup.id },
    },
  });
  const sig = createHmac("sha512", "sk_test_mock")
    .update(payload)
    .digest("hex");
  const req = (s: string) =>
    new Request("http://localhost/api/paystack/webhook", {
      method: "POST",
      body: payload,
      headers: { "x-paystack-signature": s },
    });

  assert.equal((await POST(req("0".repeat(128)))).status, 401);
  assert.equal((await POST(req(sig))).status, 200);
  assert.equal((await POST(req(sig))).status, 200); // retry from Paystack

  const saved = JSON.parse(readFileSync(file, "utf8"));
  assert.equal(saved.length, 1);
  assert.equal(saved[0].payment.status, "paid");
  assert.equal(saved[0].payment.reference, "vrly-test-1");
  assert.deepEqual(saved[0].payment.references, ["vrly-test-1"]);
});

test("webhook: wrong amount is ignored", async () => {
  const file = freshStore();
  process.env.PAYSTACK_SECRET_KEY = "sk_test_mock";
  const { POST } = await import("../app/api/paystack/webhook/route");
  const payload = JSON.stringify({
    event: "charge.success",
    data: {
      status: "success",
      reference: "cheap",
      amount: 100,
      currency: "NGN",
      customer: { email: "x@example.com" },
    },
  });
  const sig = createHmac("sha512", "sk_test_mock")
    .update(payload)
    .digest("hex");
  const res = await POST(
    new Request("http://localhost/x", {
      method: "POST",
      body: payload,
      headers: { "x-paystack-signature": sig },
    }),
  );
  assert.equal(res.status, 200);
  let list: unknown[] = [];
  try {
    list = JSON.parse(readFileSync(file, "utf8"));
  } catch {}
  assert.equal(list.length, 0);
});
