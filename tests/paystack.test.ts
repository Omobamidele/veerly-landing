import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { isExpectedCharge, priceFor, verifyWebhookSignature } from "../lib/paystack";

const h = (o: Record<string, string>) => new Headers(o);
const body = JSON.stringify({ event: "charge.success", data: { reference: "r1", amount: 1000000 } });

test("legacy x-paystack-signature: valid, tampered, missing", () => {
  const secretKey = "sk_test_abc";
  const sig = createHmac("sha512", secretKey).update(body).digest("hex");
  assert.equal(verifyWebhookSignature(body, h({ "x-paystack-signature": sig }), { secretKey, webhookSecret: "" }), true);
  assert.equal(verifyWebhookSignature(body + " ", h({ "x-paystack-signature": sig }), { secretKey, webhookSecret: "" }), false);
  assert.equal(verifyWebhookSignature(body, h({}), { secretKey, webhookSecret: "" }), false);
  assert.equal(verifyWebhookSignature(body, h({ "x-paystack-signature": "nothex" }), { secretKey, webhookSecret: "" }), false);
});

test("modern Paystack-Signature: valid, any v1 matches, stale timestamp, wrong secret", () => {
  const webhookSecret = "whsec_test_123";
  const now = 1_760_270_400_000;
  const t = String(now / 1000);
  const sig = createHmac("sha512", webhookSecret).update(`${t}.${body}`).digest("hex");
  const header = `t=${t},v1=whk_old:${"0".repeat(128)},v1=whk_new:${sig}`;
  assert.equal(verifyWebhookSignature(body, h({ "paystack-signature": header }), { webhookSecret, secretKey: "", now }), true);
  assert.equal(
    verifyWebhookSignature(body, h({ "paystack-signature": header }), { webhookSecret, secretKey: "", now: now + 301_000 }),
    false,
  );
  assert.equal(verifyWebhookSignature(body, h({ "paystack-signature": header }), { webhookSecret: "whsec_other", secretKey: "", now }), false);
});

test("modern header present but mismatching is rejected even if legacy matches", () => {
  const secretKey = "sk_test_abc";
  const legacy = createHmac("sha512", secretKey).update(body).digest("hex");
  const now = Date.now();
  const header = `t=${Math.floor(now / 1000)},v1=whk_x:${"a".repeat(128)}`;
  assert.equal(
    verifyWebhookSignature(body, h({ "paystack-signature": header, "x-paystack-signature": legacy }), { secretKey, webhookSecret: "whsec_s", now }),
    false,
  );
});

test("only exact founding prices are accepted", () => {
  assert.deepEqual(priceFor("NGN"), { currency: "NGN", amount: 1_000_000 });
  assert.equal(isExpectedCharge({ status: "success", amount: 1_000_000, currency: "NGN" }), true);
  assert.equal(isExpectedCharge({ status: "success", amount: 100, currency: "NGN" }), false);
  assert.equal(isExpectedCharge({ status: "failed", amount: 1_000_000, currency: "NGN" }), false);
  assert.equal(isExpectedCharge({ status: "success", amount: 799, currency: "USD" }), false); // USD off by default
});
