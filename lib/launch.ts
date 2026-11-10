/**
 * VEERLY TIMELINE — every launch and cohort date lives here (all 9:00 AM WAT, Africa/Lagos, UTC+01:00, no DST).
 *
 *   Before PROMO_AT ............ "prelaunch": no countdown, calm "Enrolment opens …" panel, waitlist only.
 *   PROMO_AT  (1 Dec 2026) ..... "promo":     the yellow countdown appears, counting to Cohort 1. Still waitlist only.
 *   ENROL_AT  (1 Jan 2027) ..... "enrol":     enrolment + Paystack checkout open. Countdown keeps counting to the next cohort.
 *   Cohort 1  (1 Feb 2027) ..... confirmed. Then the countdown rolls to Cohort 2, 3, … and finally the
 *                                first-Monday-of-next-month fallback (lib/cohorts.ts), so it never runs out.
 *
 * Env overrides (ISO strings with offset, e.g. 2026-12-01T09:00:00+01:00):
 *   NEXT_PUBLIC_LAUNCH_AT       promotion / countdown start   (PROMO_AT)
 *   NEXT_PUBLIC_ENROL_AT        enrolment / payment opens     (ENROL_AT)
 *   NEXT_PUBLIC_COHORT_START_AT Cohort 1 start
 *   NEXT_PUBLIC_LAUNCH_STATE    force a phase: prelaunch | promo | enrol (legacy "launched" = enrol)
 * Previews: ?preview=prelaunch | promo | enrol | launched (= enrol).
 */

export type Cohort = { name: string; startsAt: string; confirmed?: boolean };
export type Phase = "prelaunch" | "promo" | "enrol";

export const DEFAULT_PROMO_AT = "2026-12-01T09:00:00+01:00";
export const DEFAULT_ENROL_AT = "2027-01-01T09:00:00+01:00";

export const DEFAULT_COHORTS: Cohort[] = [
  { name: "Cohort 1", startsAt: "2027-02-01T09:00:00+01:00", confirmed: true },
  { name: "Cohort 2", startsAt: "2027-03-01T09:00:00+01:00" }, // placeholder (Mon)
  { name: "Cohort 3", startsAt: "2027-04-05T09:00:00+01:00" }, // placeholder (Mon)
];

const env = (k: string) =>
  typeof process !== "undefined" ? (process.env[k] ?? "").trim() : "";
const validIso = (raw: string, fallback: string) =>
  raw && !Number.isNaN(new Date(raw).getTime()) ? raw : fallback;

export function promoAt(): Date {
  return new Date(validIso(env("NEXT_PUBLIC_LAUNCH_AT"), DEFAULT_PROMO_AT));
}
export function enrolAt(): Date {
  return new Date(validIso(env("NEXT_PUBLIC_ENROL_AT"), DEFAULT_ENROL_AT));
}
/** Cohort list with the Cohort 1 env override applied. */
export function cohorts(): Cohort[] {
  const c1 = env("NEXT_PUBLIC_COHORT_START_AT");
  return DEFAULT_COHORTS.map((c, i) =>
    i === 0 && c1 ? { ...c, startsAt: validIso(c1, c.startsAt) } : c,
  );
}
export function cohortOne(): Cohort {
  return cohorts()[0];
}

/** Map a preview/env string to a phase ("launched" is the old name for the enrol phase). */
export function parsePhase(v: string | null | undefined): Phase | null {
  if (v === "prelaunch" || v === "promo" || v === "enrol") return v;
  if (v === "launched") return "enrol";
  return null;
}

/** Phase from the clock alone. */
export function phaseAt(
  now: number,
  promoAtMs: number,
  enrolAtMs: number,
): Phase {
  if (now >= enrolAtMs) return "enrol";
  if (now >= promoAtMs) return "promo";
  return "prelaunch";
}

/** Phase for this request: ?preview → NEXT_PUBLIC_LAUNCH_STATE → clock. */
export function currentPhase(now = Date.now(), preview?: string | null): Phase {
  return (
    parsePhase(preview) ??
    parsePhase(env("NEXT_PUBLIC_LAUNCH_STATE")) ??
    phaseAt(now, promoAt().getTime(), enrolAt().getTime())
  );
}

/** Payment/checkout is open only in the enrol phase. */
export const paymentOpen = (phase: Phase) => phase === "enrol";

// ───── Labels (always Lagos time) ─────
export function formatDay(d: Date | number): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
/** "1 January 2027, 9:00 AM WAT" */
export function formatWhen(d: Date | number): string {
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Lagos",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  return `${formatDay(d)}, ${time} WAT`;
}
/** "1 Jan" */
export function formatShort(d: Date | number): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
  }).format(d);
}
