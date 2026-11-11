import type { Signup } from "../types";
import type { Sink, SinkEvent } from "./index";

/**
 * Brevo (formerly Sendinblue) — primary email platform.
 * Contacts API: POST /v3/contacts (updateEnabled) · DOI: POST /v3/contacts/doubleOptinConfirmation
 * Transactional: POST /v3/smtp/email with a templateId.
 * Nothing is called unless BREVO_API_KEY is set.
 */
const API = "https://api.brevo.com/v3";
const env = (k: string) => (process.env[k] || "").trim();
const num = (k: string) => (env(k) ? Number(env(k)) : undefined);

async function call(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "api-key": env("BREVO_API_KEY"), "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok && res.status !== 204) throw new Error(`Brevo ${path} ${res.status}: ${await res.text()}`);
}

export function brevoAttributes(s: Signup) {
  const [first, ...rest] = s.name.split(" ");
  return {
    FIRSTNAME: first,
    LASTNAME: rest.join(" "),
    // Brevo uses the WHATSAPP attribute for WhatsApp campaigns. Only shared with consent.
    ...(s.consent.whatsapp.granted && s.whatsapp ? { WHATSAPP: s.whatsapp } : {}),
    COUNTRY: s.profile.country || "",
    CAREER_PATH: s.profile.careerPath || "",
    CAREER_STAGE: s.profile.careerStage || "",
    LEVEL: s.profile.level || "",
    EMAIL_CONSENT: s.consent.email.granted,
    WHATSAPP_CONSENT: s.consent.whatsapp.granted,
    CONSENT_VERSION: s.consent.email.textVersion,
    PAID: s.payment.status === "paid",
  };
}

async function sendTemplate(templateId: number, s: Signup) {
  await call("/smtp/email", {
    templateId,
    to: [{ email: s.email, name: s.name }],
    params: { FIRSTNAME: s.name.split(" ")[0] },
  });
}

export const brevoSink: Sink = {
  name: "brevo",
  enabled: () => Boolean(env("BREVO_API_KEY")),
  async handle(event: SinkEvent, s: Signup) {
    const marketing = s.consent.email.granted;
    const whatsapp = s.consent.whatsapp.granted && Boolean(s.whatsapp);

    if (event === "payment.succeeded") {
      // Buyers get a transactional onboarding email regardless of marketing consent.
      const listIds = [num("BREVO_PAID_LIST_ID")].filter(Boolean) as number[];
      await call("/contacts", { email: s.email, attributes: brevoAttributes(s), listIds, updateEnabled: true });
      const tpl = num("BREVO_PAID_TEMPLATE_ID");
      if (tpl) await sendTemplate(tpl, s);
      return;
    }

    if (!marketing && !whatsapp) return; // no consent, nothing to sync

    const listIds = [marketing ? num("BREVO_LIST_ID") : undefined, whatsapp ? num("BREVO_WHATSAPP_LIST_ID") : undefined].filter(
      Boolean,
    ) as number[];

    const doiTemplate = num("BREVO_DOI_TEMPLATE_ID");
    if (event === "signup.created" && marketing && doiTemplate && env("BREVO_DOI_REDIRECT_URL")) {
      await call("/contacts/doubleOptinConfirmation", {
        email: s.email,
        attributes: brevoAttributes(s),
        includeListIds: listIds,
        templateId: doiTemplate,
        redirectionUrl: env("BREVO_DOI_REDIRECT_URL"),
      });
      return;
    }

    await call("/contacts", { email: s.email, attributes: brevoAttributes(s), listIds, updateEnabled: true });
    const welcome = num("BREVO_WELCOME_TEMPLATE_ID");
    if (event === "signup.created" && marketing && welcome) await sendTemplate(welcome, s);
  },
};
