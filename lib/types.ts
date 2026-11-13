import type { CareerPath, LevelId, VaLevel } from "./levels";
import type { LevelSource } from "./quiz";

export type Consent = { granted: boolean; at: string | null; textVersion: string; text: string };

export type Payment = {
  status: "unpaid" | "pending" | "paid";
  provider?: "paystack";
  reference?: string;
  amount?: number; // subunit (kobo/cents)
  currency?: string;
  paidAt?: string;
  references?: string[]; // all references processed (idempotency)
};

/** A career path and level a student has paid for (the first one at checkout, more through add-ons). */
export type OwnedLevel = { path: CareerPath; level: LevelId };

/** One "additional level" purchase. Stored on the student's record, so there is a single store. */
export type AddonOrder = {
  type: "level_addon";
  reference: string;
  path: CareerPath;
  /** Level(s) the student already owned on this path when they bought (our record, or what they said). */
  ownedLevel: string;
  addonLevel: LevelId;
  amount: number; // subunit (kobo/cents)
  currency: string;
  status: "pending" | "paid";
  /** True when the owned level was matched to a paid record; false when the student only stated it. */
  verified: boolean;
  createdAt: string;
  paidAt?: string;
};

export type Profile = {
  country?: string;
  profession?: string;
  careerStage?: string;
  careerPath?: string;
  /** Virtual Assistant level chosen on the landing page. */
  level?: VaLevel;
  /** How the level was chosen: the "Which level am I?" quiz, or picked directly. */
  levelSource?: LevelSource;
  linkedin?: string;
  completedAt?: string;
};

export type Signup = {
  id: string;
  /** Random secret returned to the browser once, used to add step-2 details. */
  editToken: string;
  name: string;
  email: string;
  whatsapp: string | null; // E.164
  whatsappCountry: string | null; // ISO 3166 alpha-2
  consent: { email: Consent; whatsapp: Consent };
  profile: Profile;
  payment: Payment;
  /** Levels paid for. Set when the first payment succeeds and grows with each add-on. */
  owned?: OwnedLevel[];
  /** Level add-on orders (pending and paid). */
  addons?: AddonOrder[];
  notifications?: Record<string, { sentAt: string; messageId?: string }>; // e.g. whatsappLaunch, whatsappReminder
  /** IDs in external tools, e.g. { notionPageId } */
  external?: Record<string, string>;
  source: string;
  createdAt: string;
  updatedAt: string;
};
