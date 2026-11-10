import { createHmac } from "crypto";
import type { Signup } from "../types";
import type { Sink } from "./index";

/**
 * Generic webhook (Google Sheets via Apps Script, Zapier, Make, n8n...).
 * Body: { event, signup } without the private editToken. If WAITLIST_WEBHOOK_SECRET is set,
 * the request carries X-Veerly-Signature: hex HMAC-SHA256 of the raw body.
 */
export function publicSignup(s: Signup) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { editToken, ...rest } = s;
  return rest;
}

export const webhookSink: Sink = {
  name: "webhook",
  enabled: () => Boolean(process.env.WAITLIST_WEBHOOK_URL),
  async handle(event, s) {
    const body = JSON.stringify({ event, signup: publicSignup(s) });
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const secret = process.env.WAITLIST_WEBHOOK_SECRET;
    if (secret) headers["X-Veerly-Signature"] = createHmac("sha256", secret).update(body).digest("hex");
    const res = await fetch(process.env.WAITLIST_WEBHOOK_URL as string, { method: "POST", headers, body });
    if (!res.ok) throw new Error(`Webhook ${res.status}`);
  },
};
