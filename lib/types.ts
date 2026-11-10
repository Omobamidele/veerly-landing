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

export type Profile = {
  country?: string;
  profession?: string;
  careerStage?: string;
  careerPath?: string;
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
  notifications?: Record<string, { sentAt: string; messageId?: string }>; // e.g. whatsappLaunch, whatsappReminder
  /** IDs in external tools, e.g. { notionPageId } */
  external?: Record<string, string>;
  source: string;
  createdAt: string;
  updatedAt: string;
};
