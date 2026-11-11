/**
 * Virtual Assistant levels — source of truth for the landing-page picker.
 * Copied from /workspace/veerly-super/va-levels.md. Each student gets only
 * the workspace for the level they choose. Same price at every level.
 *
 * These describe skills students can show at the end. They are not job guarantees.
 */

export const VA_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type VaLevel = (typeof VA_LEVELS)[number];

export const VA_PATH_LABEL = "Virtual Assistant";
/** Matches the career path option in lib/options.ts. */
export const VA_CAREER_PATH = "Administration and Virtual Assistance";
export const LEVEL_STORAGE_KEY = "veerly.level";

export const LEVEL_LABEL: Record<VaLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export type LevelCard = {
  id: VaLevel;
  name: string;
  /** One-line "who it's for", taken from va-levels.md. */
  who: string;
  learn: string[];
  able: string[];
  cta: string;
};

export const LEVEL_CARDS: LevelCard[] = [
  {
    id: "beginner",
    name: "Beginner",
    who: "You've never worked as a virtual assistant, or you've only helped friends or family.",
    learn: [
      "Google Workspace basics: Gmail, Calendar, Drive, Docs and Sheets",
      "Running an inbox: labels, filters, saved replies and a daily summary",
      "Calendars and time zones, including booking links",
      "Writing clear messages and updates to clients",
      "Research and simple travel planning",
      "Your first client: boundaries, rates and your 60-second intro",
    ],
    able: [
      "Set up a professional Gmail and Google Drive and keep files tidy",
      "Sort a busy inbox with labels, filters and saved replies",
      "Book meetings across time zones without mistakes",
      "Write short, clear updates: what's done, what's next, what you need",
      "Research options and present one clear recommendation",
      "Keep client logins safe with a password manager and 2-step verification",
      "Introduce yourself in 60 seconds and show three finished portfolio projects",
    ],
    cta: "Choose Beginner",
  },
  {
    id: "intermediate",
    name: "Intermediate",
    who: "You've done some admin or VA work, or you're confident with Gmail, Google Calendar, Docs and Sheets.",
    learn: [
      "Client onboarding: welcome pack, intake form and safe access",
      "Writing SOPs and recording walkthrough videos",
      "Task tools: Trello, Asana and Notion",
      "Spreadsheets with dropdowns, formulas and a summary tab",
      "Zapier basics: your first automation",
      "Canva brand kits, and managing two or three clients at once",
    ],
    able: [
      "Onboard a new client with a welcome pack, intake form and safe access",
      "Write SOPs and record short walkthrough videos",
      "Run several clients' work on a Trello, Asana or Notion board",
      "Build spreadsheets with dropdowns, formulas and a summary tab",
      "Set up a simple Zapier automation and explain how it works",
      "Make on-brand graphics from a Canva brand kit",
      "Plan your week across two or three clients and report to each one",
    ],
    cta: "Choose Intermediate",
  },
  {
    id: "advanced",
    name: "Advanced",
    who: "You already work with clients, or you're confident with SOPs, task tools and basic automation.",
    learn: [
      "Choosing a specialism: executive, e-commerce, operations or project-management VA",
      "Multi-step automation with Zapier and Notion",
      "Client onboarding systems that run the same way every time",
      "Pricing, packages and monthly retainers",
      "Proposals, discovery calls and stopping scope creep",
      "Leading: delegation, quality checks and client reporting",
    ],
    able: [
      "Choose a specialism (executive, e-commerce, operations or project-management VA) and explain it clearly",
      "Design and run a multi-step automation with checks and alerts",
      "Build an onboarding system that sets up every new client the same way",
      "Price your work from your own numbers and write retainer packages",
      "Write a one-page proposal and lead a discovery call",
      "Delegate to a junior VA, check the quality and report to the client",
      "Protect client access with an access log and clean offboarding",
    ],
    cta: "Choose Advanced",
  },
];

export function isLevel(v: unknown): v is VaLevel {
  return typeof v === "string" && (VA_LEVELS as readonly string[]).includes(v);
}

/** Accepts "beginner", "Beginner" or leftover whitespace; otherwise null. */
export function parseLevel(v: unknown): VaLevel | null {
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase();
  return isLevel(s) ? s : null;
}

export function levelLabel(v: unknown): string | null {
  const level = parseLevel(v);
  return level ? LEVEL_LABEL[level] : null;
}

export function levelCard(v: unknown): LevelCard | null {
  const level = parseLevel(v);
  return level ? LEVEL_CARDS.find((c) => c.id === level) ?? null : null;
}
