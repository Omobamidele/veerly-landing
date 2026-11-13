import {
  LEVELS,
  LEVEL_LABEL,
  parseLevel,
  parsePath,
  pathLabel,
  pathMeta,
  type CareerPath,
  type LevelId,
} from "./levels";
import type { OwnedLevel, Signup } from "./types";

/**
 * Rules for buying an additional level. Pure functions, shared by the page, the API and the tests.
 * Product type used in Paystack metadata and in the admin CSV.
 */
export const ADDON_PRODUCT = "level_addon";
export const ADDON_PAGE = "/add-level";
export const ADDON_SUCCESS_PAGE = "/add-level/success";
/** Browser-only memory of what this student has paid for, so the quiz can point to the add-on page. */
export const OWNED_STORAGE_KEY = "veerly.owned";

/** What a student owns, from our record. Paid students own the level they paid for plus any paid add-ons. */
export function ownedLevelsOf(s: Signup | null | undefined): OwnedLevel[] {
  if (!s) return [];
  const out: OwnedLevel[] = [];
  const add = (o: OwnedLevel | null | undefined) => {
    if (o && !out.some((x) => x.path === o.path && x.level === o.level)) out.push(o);
  };
  for (const o of s.owned ?? []) add(o);
  // Records paid before `owned` existed: the profile still shows the level they paid for.
  if (s.payment.status === "paid") {
    const path = parsePath(s.profile.careerPath);
    const level = parseLevel(s.profile.level);
    if (path && level) add({ path, level });
  }
  for (const a of s.addons ?? []) if (a.status === "paid") add({ path: a.path, level: a.addonLevel });
  return out;
}

export const ownsLevel = (owned: OwnedLevel[], path: CareerPath, level: LevelId) =>
  owned.some((o) => o.path === path && o.level === level);

/** Levels owned on one path, in Beginner → Advanced order. */
export function ownedOnPath(owned: OwnedLevel[], path: CareerPath | null): LevelId[] {
  if (!path) return [];
  return LEVELS.filter((l) => ownsLevel(owned, path, l));
}

/** The levels a student could still buy on a path. */
export function buyableLevels(owned: OwnedLevel[], path: CareerPath | null): LevelId[] {
  if (!path) return [];
  return LEVELS.filter((l) => !ownsLevel(owned, path, l));
}

export type Eligibility =
  | { ok: true; path: CareerPath; level: LevelId }
  | { ok: false; code: "no_path" | "no_level" | "already_owned" | "no_owned"; message: string };

/** Plain-language validation messages. */
export const ADDON_MESSAGES = {
  no_path: "Choose your career path first.",
  no_level: "Choose the level you want to add.",
  no_owned: "Tell us which level you already have, so we don't sell you the same one twice.",
  contact: "Enter the email address or WhatsApp number you used when you paid.",
  email: "That email doesn't look right. Check it for typing mistakes.",
  not_found:
    "We couldn't find a payment with those details. Check for typing mistakes, or tell us the level you already have below and we'll check it against our records.",
} as const;

export function alreadyOwnedMessage(level: LevelId, path?: CareerPath | null) {
  return `You already have the ${LEVEL_LABEL[level]} level${path ? ` for ${pathLabel(path)}` : ""}. Choose a level you don't have yet.`;
}

/** Can this student buy this level? Blocks levels they already own. */
export function checkAddonEligibility(
  owned: OwnedLevel[],
  path: unknown,
  level: unknown,
): Eligibility {
  const p = parsePath(path);
  if (!p) return { ok: false, code: "no_path", message: ADDON_MESSAGES.no_path };
  const l = parseLevel(level);
  if (!l) return { ok: false, code: "no_level", message: ADDON_MESSAGES.no_level };
  if (ownsLevel(owned, p, l))
    return { ok: false, code: "already_owned", message: alreadyOwnedMessage(l, p) };
  return { ok: true, path: p, level: l };
}

/** "va" + "intermediate" → "/add-level?path=va&level=intermediate". Either part may be left out. */
export function addonLink(path?: unknown, level?: unknown): string {
  const params = new URLSearchParams();
  const m = pathMeta(path);
  const l = parseLevel(level);
  if (m) params.set("path", m.slug);
  if (l) params.set("level", l);
  const q = params.toString();
  return q ? `${ADDON_PAGE}?${q}` : ADDON_PAGE;
}

/** Read a deep link. Unknown values are ignored, so a broken link still opens the page. */
export function parseAddonParams(
  params: { get(name: string): string | null } | Record<string, string | string[] | undefined>,
): { path: CareerPath | null; level: LevelId | null } {
  const get = (k: string) => {
    if (typeof (params as { get?: unknown }).get === "function")
      return (params as { get(n: string): string | null }).get(k);
    const v = (params as Record<string, string | string[] | undefined>)[k];
    return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
  };
  return { path: parsePath(get("path")), level: parseLevel(get("level")) };
}

/**
 * What to preselect on the page. A deep-linked level is selected only if the student doesn't own it;
 * otherwise nothing is selected and `blocked` says why, so the page can explain.
 */
export function preselect(
  linked: { path: CareerPath | null; level: LevelId | null },
  owned: OwnedLevel[],
): { path: CareerPath | null; level: LevelId | null; blocked: LevelId | null } {
  if (!linked.path || !linked.level) return { ...linked, blocked: null };
  if (ownsLevel(owned, linked.path, linked.level))
    return { path: linked.path, level: null, blocked: linked.level };
  return { ...linked, blocked: null };
}

/** The level text stored on an order: what they owned on that path ("beginner", "beginner+advanced") or "". */
export const ownedLevelText = (owned: OwnedLevel[], path: CareerPath) =>
  ownedOnPath(owned, path).join("+");

/** Remember in this browser what the student owns (never sent anywhere). */
export function parseStoredOwned(raw: string | null | undefined): OwnedLevel[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const out: OwnedLevel[] = [];
    for (const x of data) {
      const path = parsePath(x?.path);
      const level = parseLevel(x?.level);
      if (path && level && !ownsLevel(out, path, level)) out.push({ path, level });
    }
    return out;
  } catch {
    return [];
  }
}
