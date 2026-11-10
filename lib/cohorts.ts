/**
 * Countdown target logic. The DATES live in lib/launch.ts (one config for the whole timeline).
 *   prelaunch → null (no countdown). promo / enrol → the next cohort after max(now, promotion start),
 *   then the first Monday of next month at 9:00 AM WAT once the list runs out, so it never sits at zero.
 */
import { DEFAULT_COHORTS, type Cohort, type Phase } from "./launch";

export type { Cohort };
export const COHORTS = DEFAULT_COHORTS;

export type CountdownTarget = {
  kind: "cohort";
  /** Heading above the tiles. */
  label: string;
  /** Cohort name, when counting to a cohort. */
  name?: string;
  atMs: number;
  /** True when the date came from the fallback rule rather than the list. */
  fallback?: boolean;
};

const WAT_OFFSET_H = 1;

/** First Monday of the given month (0-based), 9:00 AM WAT, as epoch ms. */
export function firstMondayAt9Wat(year: number, month: number): number {
  const y = year + Math.floor(month / 12);
  const m = ((month % 12) + 12) % 12;
  const firstDow = new Date(Date.UTC(y, m, 1)).getUTCDay(); // 0 = Sunday
  const day = 1 + ((8 - firstDow) % 7);
  return Date.UTC(y, m, day, 9 - WAT_OFFSET_H, 0, 0);
}

const monthName = (ms: number) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    month: "long",
    year: "numeric",
  }).format(ms);

/**
 * Pick what the countdown should count to.
 * `phase` comes from lib/launch.ts (clock, ?preview= or NEXT_PUBLIC_LAUNCH_STATE).
 */
export function pickCountdownTarget(opts: {
  now: number;
  /** Promotion start (countdown start); previews before it count from here. */
  promoAtMs: number;
  phase: Phase;
  cohorts?: Cohort[];
}): CountdownTarget | null {
  const { now, promoAtMs, phase } = opts;
  if (phase === "prelaunch") return null; // no ticking numbers before promotion starts

  // After launch (or previewing it): count from whichever is later, so a preview shows the first cohort after launch.
  const from = Math.max(now, promoAtMs);
  const next = (opts.cohorts ?? COHORTS)
    .map((c) => ({ ...c, ms: new Date(c.startsAt).getTime() }))
    .filter((c) => Number.isFinite(c.ms) && c.ms > from)
    .sort((a, b) => a.ms - b.ms)[0];
  if (next)
    return {
      kind: "cohort",
      label: "Next cohort starts in",
      name: next.name,
      atMs: next.ms,
    };

  // Fallback: first Monday of the next month (in WAT) at 9:00, never in the past.
  const wat = new Date(from + WAT_OFFSET_H * 3_600_000);
  let at = firstMondayAt9Wat(wat.getUTCFullYear(), wat.getUTCMonth() + 1);
  if (at <= from)
    at = firstMondayAt9Wat(wat.getUTCFullYear(), wat.getUTCMonth() + 2);
  return {
    kind: "cohort",
    label: "Next cohort starts in",
    name: `${monthName(at)} cohort`,
    atMs: at,
    fallback: true,
  };
}
