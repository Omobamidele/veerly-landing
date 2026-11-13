import { randomBytes, randomUUID, timingSafeEqual } from "crypto";
import { CONSENT_VERSION, consentText } from "./consent";
import { parseLevel, parsePath, type CareerPath, type LevelId } from "./levels";
import { parseLevelSource, type LevelSource } from "./quiz";
import { careerPaths, careerStages } from "./options";
import { toE164 } from "./phone";
import { dispatch } from "./sinks";
import { getStore } from "./store";
import type { AddonOrder, Payment, Profile, Signup } from "./types";

export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");
const bool = (v: unknown) => v === true || v === "true" || v === "on";
const nowIso = () => new Date().toISOString();

// ---------- Step 1 ----------
export function validateStep1(body: Record<string, unknown>) {
  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const whatsappCountry = clean(body.whatsappCountry, 2).toUpperCase() || "NG";
  const whatsappRaw = clean(body.whatsapp, 32);
  const emailConsent = bool(body.emailConsent);
  const whatsappConsent = bool(body.whatsappConsent);
  const errors: FieldErrors = {};

  if (name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
  let whatsapp: string | null = null;
  if (whatsappRaw) {
    whatsapp = toE164(whatsappRaw, whatsappCountry);
    if (!whatsapp) errors.whatsapp = "That number doesn't look right for the selected country.";
  } else if (whatsappConsent) {
    errors.whatsapp = "Add your WhatsApp number so we can notify you there.";
  }
  if (!emailConsent && !whatsappConsent) errors.consent = "Choose at least one way for us to tell you about the launch.";
  const level = parseLevel(body.level);
  if (!level) errors.level = "Choose Beginner, Intermediate or Advanced.";
  const careerPath = parsePath(body.careerPath ?? body.path);
  if (!careerPath) errors.careerPath = "Choose a career path.";

  return { data: { name, email, whatsapp, whatsappCountry: whatsapp ? whatsappCountry : null, emailConsent, whatsappConsent, level, levelSource: parseLevelSource(body.levelSource), careerPath }, errors };
}

// ---------- Step 2 ----------
export function validateProfile(body: Record<string, unknown>) {
  const p: Profile = {
    country: clean(body.country, 80),
    profession: clean(body.profession, 160),
    careerStage: clean(body.careerStage, 80),
    careerPath: parsePath(body.careerPath ?? body.path) ?? clean(body.careerPath, 80),
    linkedin: clean(body.linkedin, 300),
  };
  const level = parseLevel(body.level);
  if (level) p.level = level;
  const levelSource = parseLevelSource(body.levelSource);
  if (level && levelSource) p.levelSource = levelSource;
  const errors: FieldErrors = {};
  if (body.level && !level) errors.level = "Choose Beginner, Intermediate or Advanced.";
  if (p.careerStage && !(careerStages as readonly string[]).includes(p.careerStage)) errors.careerStage = "Choose a stage from the list.";
  if (p.careerPath && p.careerPath !== "Not sure yet" && !(careerPaths as readonly string[]).includes(p.careerPath))
    errors.careerPath = "Choose a path from the list.";
  if (p.linkedin) {
    try {
      const u = new URL(p.linkedin.startsWith("http") ? p.linkedin : `https://${p.linkedin}`);
      if (!/(^|\.)linkedin\.com$/i.test(u.hostname)) throw new Error();
      p.linkedin = u.toString();
    } catch {
      errors.linkedin = "Use a linkedin.com profile link.";
    }
  }
  return { data: p, errors };
}

const consent = (granted: boolean, text: string, at: string) => ({
  granted,
  at: granted ? at : null,
  textVersion: CONSENT_VERSION,
  text,
});

function blankPayment(): Payment {
  return { status: "unpaid", references: [] };
}

async function save(s: Signup, event: Parameters<typeof dispatch>[0]) {
  const store = getStore();
  await store.put(s); // primary store first: never lose data
  const { patch } = await dispatch(event, s);
  if (patch.external && Object.keys(patch.external).length) {
    s = { ...s, external: { ...s.external, ...patch.external } };
    await store.put(s);
  }
  return s;
}

/**
 * Create a signup, or merge into an existing one with the same email.
 * For an existing email we only ADD information (grant consents, fill a missing WhatsApp number),
 * so nobody can downgrade or replace someone else's details just by knowing their email.
 */
export async function upsertSignup(d: ReturnType<typeof validateStep1>["data"], source = "landing") {
  const store = getStore();
  const at = nowIso();
  const existing = await store.findByEmail(d.email);
  if (existing) {
    const s: Signup = {
      ...existing,
      profile: withPlan(existing.profile, d.level, d.careerPath, d.levelSource),
      whatsapp: existing.whatsapp || d.whatsapp,
      whatsappCountry: existing.whatsappCountry || d.whatsappCountry,
      consent: {
        email: existing.consent.email.granted ? existing.consent.email : consent(d.emailConsent, consentText.email, at),
        whatsapp: existing.consent.whatsapp.granted
          ? existing.consent.whatsapp
          : consent(d.whatsappConsent && Boolean(existing.whatsapp || d.whatsapp), consentText.whatsapp, at),
      },
      editToken: randomBytes(24).toString("base64url"),
      updatedAt: at,
    };
    return { signup: await save(s, "signup.updated"), duplicate: true };
  }
  const s: Signup = {
    id: randomUUID(),
    editToken: randomBytes(24).toString("base64url"),
    name: d.name,
    email: d.email,
    whatsapp: d.whatsapp,
    whatsappCountry: d.whatsappCountry,
    consent: {
      email: consent(d.emailConsent, consentText.email, at),
      whatsapp: consent(d.whatsappConsent && Boolean(d.whatsapp), consentText.whatsapp, at),
    },
    profile: withPlan({}, d.level, d.careerPath, d.levelSource),
    payment: blankPayment(),
    source,
    createdAt: at,
    updatedAt: at,
  };
  return { signup: await save(s, "signup.created"), duplicate: false };
}

function tokenOk(a: string, b: string) {
  const x = Buffer.from(a || "");
  const y = Buffer.from(b || "");
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}

export async function updateProfile(id: string, token: string, p: Profile) {
  const s = await getStore().get(id);
  if (!s || !tokenOk(s.editToken, token)) return null;
  const next: Signup = { ...s, profile: { ...s.profile, ...p, completedAt: nowIso() }, updatedAt: nowIso() };
  return save(next, "profile.updated");
}

function withPlan(
  profile: Signup["profile"],
  level?: LevelId | null,
  careerPath?: CareerPath | null,
  levelSource?: LevelSource | null,
): Signup["profile"] {
  if (!level && !careerPath) return profile;
  return {
    ...profile,
    ...(level ? { level } : {}),
    ...(level && levelSource ? { levelSource } : {}),
    ...(careerPath ? { careerPath } : {}),
  };
}

/** Find or create the record a checkout belongs to. */
export async function signupForCheckout(
  email: string,
  name: string,
  plan?: { level?: LevelId | null; careerPath?: CareerPath | null; levelSource?: LevelSource | null },
) {
  const store = getStore();
  const existing = await store.findByEmail(email);
  const at = nowIso();
  const level = plan?.level;
  const careerPath = plan?.careerPath;
  if (existing) {
    // Once paid, the level they bought is fixed. Extra levels go through the add-on flow.
    if (existing.payment.status === "paid") return existing;
    const same =
      (!level || existing.profile.level === level) &&
      (!careerPath || existing.profile.careerPath === careerPath);
    if (same) return existing;
    const s: Signup = { ...existing, profile: withPlan(existing.profile, level, careerPath, plan?.levelSource), updatedAt: at };
    await store.put(s);
    return s;
  }
  const s: Signup = {
    id: randomUUID(),
    editToken: randomBytes(24).toString("base64url"),
    name: name || email.split("@")[0],
    email,
    whatsapp: null,
    whatsappCountry: null,
    consent: { email: consent(false, consentText.email, at), whatsapp: consent(false, consentText.whatsapp, at) },
    profile: withPlan({}, level, careerPath, plan?.levelSource),
    payment: blankPayment(),
    source: "checkout",
    createdAt: at,
    updatedAt: at,
  };
  await store.put(s);
  return s;
}

export async function markPending(id: string, reference: string, amount: number, currency: string) {
  const store = getStore();
  const s = await store.get(id);
  if (!s || s.payment.status === "paid") return s;
  await store.put({ ...s, payment: { ...s.payment, status: "pending", provider: "paystack", reference, amount, currency }, updatedAt: nowIso() });
}

/** Idempotent: the same reference is only processed once. */
export async function markPaid(opts: { signupId?: string; email: string; name?: string; reference: string; amount: number; currency: string; paidAt?: string; level?: LevelId | null; careerPath?: CareerPath | null }) {
  const store = getStore();
  let s = (opts.signupId && (await store.get(opts.signupId))) || (await store.findByEmail(opts.email));
  if (!s) s = await signupForCheckout(opts.email.toLowerCase(), opts.name || "", { level: opts.level, careerPath: opts.careerPath });
  const refs = s.payment.references || [];
  if (refs.includes(opts.reference)) return { signup: s, alreadyProcessed: true };
  const next: Signup = {
    ...s,
    profile: withPlan(s.profile, opts.level, opts.careerPath),
    owned: withOwned(s.owned, opts.careerPath ?? parsePath(s.profile.careerPath), opts.level ?? parseLevel(s.profile.level)),
    payment: {
      status: "paid",
      provider: "paystack",
      reference: opts.reference,
      amount: opts.amount,
      currency: opts.currency,
      paidAt: opts.paidAt || nowIso(),
      references: [...refs, opts.reference],
    },
    updatedAt: nowIso(),
  };
  return { signup: await save(next, "payment.succeeded"), alreadyProcessed: false };
}

function withOwned(owned: Signup["owned"], path?: CareerPath | null, level?: LevelId | null) {
  const list = [...(owned ?? [])];
  if (path && level && !list.some((o) => o.path === path && o.level === level)) list.push({ path, level });
  return list;
}

/**
 * Find a PAID student by the email or WhatsApp number they used. Returns null when nobody matches or
 * the match has not paid, so the page can't be used to learn who has merely joined the waitlist.
 */
export async function findPaidByContact(contact: string, country = "NG"): Promise<Signup | null> {
  const raw = clean(contact, 254);
  if (!raw) return null;
  const store = getStore();
  let s: Signup | null = null;
  if (raw.includes("@")) {
    s = await store.findByEmail(raw.toLowerCase());
  } else {
    const e164 = toE164(raw, country.toUpperCase());
    if (e164) s = (await store.list()).find((x) => x.whatsapp === e164 && x.payment.status === "paid") ?? null;
  }
  return s && s.payment.status === "paid" ? s : null;
}

/** Save a pending add-on order on the student's record (one record per reference). */
export async function markAddonPending(id: string, order: AddonOrder) {
  const store = getStore();
  const s = await store.get(id);
  if (!s) return null;
  const addons = (s.addons ?? []).filter((a) => a.reference !== order.reference);
  const next: Signup = { ...s, addons: [...addons, order], updatedAt: nowIso() };
  await store.put(next);
  return next;
}

/** Idempotent: a reference is only counted once. Adds the level to what the student owns. */
export async function markAddonPaid(opts: {
  signupId?: string;
  email: string;
  reference: string;
  amount: number;
  currency: string;
  paidAt?: string;
  path: CareerPath;
  addonLevel: LevelId;
  ownedLevel: string;
  verified: boolean;
}) {
  const store = getStore();
  let s = (opts.signupId && (await store.get(opts.signupId))) || (await store.findByEmail(opts.email.toLowerCase()));
  if (!s) s = await signupForCheckout(opts.email.toLowerCase(), "", {});
  const existing = (s.addons ?? []).find((a) => a.reference === opts.reference);
  if (existing?.status === "paid") return { signup: s, alreadyProcessed: true };
  const order: AddonOrder = {
    type: "level_addon",
    reference: opts.reference,
    path: opts.path,
    ownedLevel: existing?.ownedLevel ?? opts.ownedLevel,
    addonLevel: opts.addonLevel,
    amount: opts.amount,
    currency: opts.currency,
    status: "paid",
    verified: existing?.verified ?? opts.verified,
    createdAt: existing?.createdAt ?? nowIso(),
    paidAt: opts.paidAt || nowIso(),
  };
  const addons = (s.addons ?? []).filter((a) => a.reference !== opts.reference);
  const next: Signup = {
    ...s,
    addons: [...addons, order],
    owned: withOwned(s.owned, opts.path, opts.addonLevel),
    updatedAt: nowIso(),
  };
  return { signup: await save(next, "addon.paid"), alreadyProcessed: false };
}
