import type { Signup } from "./types";

const cols: [string, (s: Signup) => unknown][] = [
  ["id", (s) => s.id],
  ["created_at", (s) => s.createdAt],
  ["name", (s) => s.name],
  ["email", (s) => s.email],
  ["whatsapp_e164", (s) => s.whatsapp],
  ["email_consent", (s) => s.consent.email.granted],
  ["email_consent_at", (s) => s.consent.email.at],
  ["whatsapp_consent", (s) => s.consent.whatsapp.granted],
  ["whatsapp_consent_at", (s) => s.consent.whatsapp.at],
  ["consent_version", (s) => s.consent.email.textVersion],
  ["country", (s) => s.profile.country],
  ["profession", (s) => s.profile.profession],
  ["career_stage", (s) => s.profile.careerStage],
  ["career_path", (s) => s.profile.careerPath],
  ["linkedin", (s) => s.profile.linkedin],
  ["payment_status", (s) => s.payment.status],
  ["payment_reference", (s) => s.payment.reference],
  ["payment_amount_subunit", (s) => s.payment.amount],
  ["payment_currency", (s) => s.payment.currency],
  ["paid_at", (s) => s.payment.paidAt],
  ["whatsapp_launch_sent_at", (s) => s.notifications?.whatsappLaunch?.sentAt],
  ["source", (s) => s.source],
];

const cell = (v: unknown) => {
  const s = v === undefined || v === null ? "" : String(v);
  // Quote, and neutralise spreadsheet formula injection.
  const safe = /^[=+\-@]/.test(s) && !/^\+\d{6,15}$/.test(s) ? `'${s}` : s; // E.164 numbers are safe
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function toCsv(list: Signup[]) {
  return [cols.map((c) => c[0]).join(","), ...list.map((s) => cols.map(([, f]) => cell(f(s))).join(","))].join("\n") + "\n";
}
