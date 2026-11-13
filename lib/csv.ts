import type { AddonOrder, Signup } from "./types";

/** One CSV row: a signup, or one level add-on order (which repeats the student's details). */
type Row = { s: Signup; addon?: AddonOrder };
const major = (subunit?: number) => (typeof subunit === "number" ? subunit / 100 : "");

const cols: [string, (r: Row) => unknown][] = [
  ["id", ({ s }) => s.id],
  ["created_at", ({ s }) => s.createdAt],
  ["name", ({ s }) => s.name],
  ["email", ({ s }) => s.email],
  ["whatsapp_e164", ({ s }) => s.whatsapp],
  ["email_consent", ({ s }) => s.consent.email.granted],
  ["email_consent_at", ({ s }) => s.consent.email.at],
  ["whatsapp_consent", ({ s }) => s.consent.whatsapp.granted],
  ["whatsapp_consent_at", ({ s }) => s.consent.whatsapp.at],
  ["consent_version", ({ s }) => s.consent.email.textVersion],
  ["country", ({ s }) => s.profile.country],
  ["profession", ({ s }) => s.profile.profession],
  ["career_stage", ({ s }) => s.profile.careerStage],
  ["career_path", ({ s }) => s.profile.careerPath],
  ["level", ({ s }) => s.profile.level || ""],
  ["level_source", ({ s }) => s.profile.levelSource || ""],
  ["linkedin", ({ s }) => s.profile.linkedin],
  ["payment_status", ({ s, addon }) => (addon ? "" : s.payment.status)],
  ["payment_reference", ({ s, addon }) => (addon ? "" : s.payment.reference)],
  ["payment_amount_subunit", ({ s, addon }) => (addon ? "" : s.payment.amount)],
  ["payment_currency", ({ s, addon }) => (addon ? "" : s.payment.currency)],
  ["paid_at", ({ s, addon }) => (addon ? "" : s.payment.paidAt)],
  ["whatsapp_launch_sent_at", ({ s }) => s.notifications?.whatsappLaunch?.sentAt],
  ["source", ({ s }) => s.source],
  // Level add-ons. Signup rows leave the add-on columns empty; add-on rows repeat the student's details.
  ["type", ({ addon }) => (addon ? "level_addon" : "signup")],
  ["path", ({ s, addon }) => addon?.path ?? s.profile.careerPath],
  ["ownedLevel", ({ s, addon }) => (addon ? addon.ownedLevel : s.payment.status === "paid" ? (s.profile.level ?? "") : "")],
  ["addonLevel", ({ addon }) => addon?.addonLevel ?? ""],
  ["amount", ({ s, addon }) => (addon ? major(addon.amount) : major(s.payment.amount))],
  ["currency", ({ s, addon }) => (addon ? addon.currency : (s.payment.currency ?? ""))],
  ["addon_status", ({ addon }) => addon?.status ?? ""],
  ["addon_reference", ({ addon }) => addon?.reference ?? ""],
  ["addon_owned_verified", ({ addon }) => (addon ? addon.verified : "")],
  ["addon_paid_at", ({ addon }) => addon?.paidAt ?? ""],
];

const cell = (v: unknown) => {
  const s = v === undefined || v === null ? "" : String(v);
  // Quote, and neutralise spreadsheet formula injection.
  const safe = /^[=+\-@]/.test(s) && !/^\+\d{6,15}$/.test(s) ? `'${s}` : s; // E.164 numbers are safe
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function toCsv(list: Signup[]) {
  const rows: Row[] = list.flatMap((s) => [{ s }, ...(s.addons ?? []).map((addon) => ({ s, addon }))]);
  return [cols.map((c) => c[0]).join(","), ...rows.map((r) => cols.map(([, f]) => cell(f(r))).join(","))].join("\n") + "\n";
}
