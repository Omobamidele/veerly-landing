/**
 * WhatsApp Business Platform (Cloud API) template sender.
 * POST https://graph.facebook.com/<version>/<PHONE_NUMBER_ID>/messages
 * Only approved templates can be sent outside a 24h customer-service window, and only to people who opted in.
 */
const env = (k: string) => (process.env[k] || "").trim();

export function whatsappConfig() {
  return {
    token: env("WHATSAPP_TOKEN"),
    phoneNumberId: env("WHATSAPP_PHONE_NUMBER_ID"),
    version: env("WHATSAPP_GRAPH_VERSION") || "v23.0",
    launchTemplate: env("WHATSAPP_LAUNCH_TEMPLATE") || "veerly_launch",
    reminderTemplate: env("WHATSAPP_REMINDER_TEMPLATE") || "veerly_launch_reminder",
    language: env("WHATSAPP_TEMPLATE_LANG") || "en",
  };
}

export function buildTemplatePayload(to: string, template: string, language: string, bodyParams: string[]) {
  return {
    messaging_product: "whatsapp",
    to: to.replace(/^\+/, ""),
    type: "template",
    template: {
      name: template,
      language: { code: language },
      components: bodyParams.length ? [{ type: "body", parameters: bodyParams.map((text) => ({ type: "text", text })) }] : [],
    },
  };
}

export class WhatsAppError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryable: boolean,
  ) {
    super(message);
  }
}

export async function sendTemplate(payload: ReturnType<typeof buildTemplatePayload>) {
  const c = whatsappConfig();
  const res = await fetch(`https://graph.facebook.com/${c.version}/${c.phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new WhatsAppError(json?.error?.message || `HTTP ${res.status}`, res.status, res.status === 429 || res.status >= 500);
  return json?.messages?.[0]?.id as string | undefined;
}
