/**
 * Central configuration. Everything is optional so the site previews with no secrets.
 * See README "Environment variables" for the full list.
 */
const env = (k: string) => (process.env[k] ?? "").trim();

export const DEFAULT_LAUNCH_AT = "2026-12-01T09:00:00+01:00"; // 1 Dec 2026, 9:00 AM WAT (Africa/Lagos)

export const site = {
  name: "Veerly",
  title: "Veerly — Remote Career Accelerator",
  tagline: "Your career. Your goals. Your personalized path.",
  description:
    "A personalized operating system for building, navigating and growing your remote career. Join the waitlist for the Veerly Remote Career Accelerator founding cohort.",
  belief:
    "Access to better career opportunities should not be limited by where you live or what profession you started in.",
  // Placeholder until a domain is chosen (veerly.com is an unrelated company).
  url: env("NEXT_PUBLIC_SITE_URL") || "http://localhost:3210",
  contactEmail: env("NEXT_PUBLIC_CONTACT_EMAIL"),
  whatsappChannelUrl: env("NEXT_PUBLIC_WHATSAPP_CHANNEL_URL"),
  assessmentUrl: env("NEXT_PUBLIC_ASSESSMENT_URL"),
  notionAccessUrl: env("NEXT_PUBLIC_NOTION_ACCESS_URL"),
  cohortLabel: env("NEXT_PUBLIC_COHORT_LABEL") || "January 2027",
  // Optional ISO date for the cohort calendar invite once Mo confirms it.
  cohortStartAt: env("NEXT_PUBLIC_COHORT_START_AT"),
};

export function launchAt(): Date {
  const raw = env("NEXT_PUBLIC_LAUNCH_AT") || DEFAULT_LAUNCH_AT;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date(DEFAULT_LAUNCH_AT) : d;
}

/** "1 December 2026, 9:00 AM WAT" — always shown in Lagos time. */
export function formatLaunchLabel(d: Date = launchAt()): string {
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Lagos",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  return `${date}, ${time} WAT`;
}

export function formatLaunchShort(d: Date = launchAt()): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "short" }).format(d);
}

/** Launch state: env override → preview → clock. */
export function isLaunched(now = Date.now(), preview?: string | null): boolean {
  const forced = env("NEXT_PUBLIC_LAUNCH_STATE"); // "prelaunch" | "launched" | ""
  if (preview === "launched") return true;
  if (preview === "prelaunch") return false;
  if (forced === "launched") return true;
  if (forced === "prelaunch") return false;
  return now >= launchAt().getTime();
}

export const pricing = {
  usdLabel: "$7.99",
  ngnLabel: "₦10,000",
  /** Paystack amounts are in the currency subunit (kobo / cents). */
  ngnAmount: Number(env("PAYSTACK_AMOUNT_NGN") || 10000),
  usdAmount: Number(env("PAYSTACK_AMOUNT_USD") || 7.99),
  usdEnabled: env("PAYSTACK_ENABLE_USD") === "true",
};

export const paymentsEnabled = () => Boolean(env("PAYSTACK_SECRET_KEY"));
