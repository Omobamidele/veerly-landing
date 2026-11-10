/**
 * Central configuration. Everything is optional so the site previews with no secrets.
 * See README "Environment variables" for the full list.
 */
const env = (k: string) => (process.env[k] ?? "").trim();

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
};

// Launch phases and every date (promotion, enrolment, cohorts) live in lib/launch.ts.

/** Prices live in lib/pricing.ts. This only says whether Paystack may charge in USD. */
export const pricing = {
  get usdEnabled() {
    return env("PAYSTACK_ENABLE_USD") === "true";
  },
};

export const paymentsEnabled = () => Boolean(env("PAYSTACK_SECRET_KEY"));
