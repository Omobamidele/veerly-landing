/**
 * VEERLY COHORT COACH — config + pure logic for /coach (embedded in Notion pages).
 *
 * Cohort by cohort, not task by task: each cohort has ONE set of expectations shown together, grouped by
 * the three systems plus the cohort rhythm. The participant confirms once, then a single countdown runs to
 * the end of their cohort window. Checking items off is free-form (no gating).
 *
 * Edit COACH_COHORTS to change names, lengths, expectations, weekly focus or coach notes.
 * Cohort start dates come from lib/launch.ts so the site and the coach always agree.
 * Nothing here promises a job: the expectations are about effort and preparation.
 */
import { DEFAULT_COHORTS } from "./launch";

export type Expectation = { id: string; text: string };
export type ExpectationGroup = {
  id: string;
  title: string;
  items: Expectation[];
};
export type WeekFocus = { title: string; focus: string };

export type CoachCohort = {
  id: string;
  name: string;
  /** ISO start, 9:00 AM WAT. */
  startsAt: string;
  weeks: number;
  /**
   * true: the window runs from the later of "when you pressed start" and the cohort start date, so everyone in the
   * cohort shares the same finish line. false: a personal window from the moment you start.
   */
  alignToCohortStart: boolean;
  groups: ExpectationGroup[];
  /** One entry per week; extra weeks reuse the last entry. */
  weeklyFocus: WeekFocus[];
  /** Shown before the cohort's first day when someone starts early. */
  setupFocus: WeekFocus;
};

const DAY = 86_400_000;
const WEEK = 7 * DAY;

/** The default founding-cohort expectations. Duplicate and edit per cohort if a cohort should differ. */
const FOUNDING_GROUPS: ExpectationGroup[] = [
  {
    id: "job-hunt-os",
    title: "Job Hunt OS",
    items: [
      {
        id: "jh-setup",
        text: "Set up your Job Hunt OS from your assessment results",
      },
      { id: "jh-15-roles", text: "Build your pipeline with 15+ target roles" },
      {
        id: "jh-companies",
        text: "Add your target companies and a contact for each where you can",
      },
      {
        id: "jh-followups",
        text: "Log every application and follow-up in the tracker",
      },
    ],
  },
  {
    id: "portfolio-builder",
    title: "Portfolio Builder",
    items: [
      { id: "pb-case-1", text: "Finish portfolio case study 1" },
      { id: "pb-case-2", text: "Finish portfolio case study 2" },
      { id: "pb-share", text: "Make your portfolio shareable with one link" },
    ],
  },
  {
    id: "interview-prep",
    title: "Interview Preparation System",
    items: [
      { id: "ip-intro", text: "Write and rehearse your 60-second intro" },
      {
        id: "ip-10-questions",
        text: "Practise 10 interview questions out loud",
      },
      { id: "ip-mock", text: "Do one mock interview and note what to improve" },
    ],
  },
  {
    id: "rhythm",
    title: "Cohort rhythm",
    items: [
      {
        id: "rh-live",
        text: "Attend the weekly live sessions (or watch the replay)",
      },
      {
        id: "rh-sunday",
        text: "Do your Sunday review each week: what moved, what's next",
      },
    ],
  },
];

const FOUNDING_WEEKS: WeekFocus[] = [
  {
    title: "Set up and aim",
    focus:
      "Set up your Job Hunt OS and start listing target roles and companies.",
  },
  {
    title: "Build momentum",
    focus: "Grow your pipeline towards 15+ roles and get case study 1 drafted.",
  },
  {
    title: "Show your work",
    focus: "Finish both case studies and write your 60-second intro.",
  },
  {
    title: "Practise and apply",
    focus: "Practise your 10 questions, do a mock interview and keep applying.",
  },
];

const SETUP: WeekFocus = {
  title: "Before day one",
  focus:
    "Open your Notion systems, skim the expectations and block time for the weekly live session.",
};

const cohortFrom = (i: number, weeks = 4): CoachCohort => ({
  id: `cohort-${i + 1}`,
  name: DEFAULT_COHORTS[i].name,
  startsAt: DEFAULT_COHORTS[i].startsAt,
  weeks,
  alignToCohortStart: true,
  groups: FOUNDING_GROUPS,
  weeklyFocus: FOUNDING_WEEKS,
  setupFocus: SETUP,
});

export const COACH_COHORTS: CoachCohort[] = DEFAULT_COHORTS.map((_, i) =>
  cohortFrom(i),
);
export const DEFAULT_COACH_COHORT = "cohort-1";

export function coachCohort(id?: string | null): CoachCohort {
  return (
    COACH_COHORTS.find((c) => c.id === id) ??
    COACH_COHORTS.find((c) => c.id === DEFAULT_COACH_COHORT)!
  );
}

export const storageKey = (cohortId: string) => `veerly.coach.${cohortId}`;

export type SavedCoach = { startedAt: number; done: string[] };

/** Parse whatever is in localStorage; anything malformed counts as "not started". */
export function parseSaved(raw: string | null | undefined): SavedCoach | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (typeof v?.startedAt !== "number" || !Number.isFinite(v.startedAt))
      return null;
    const done = Array.isArray(v.done)
      ? v.done.filter((x: unknown) => typeof x === "string")
      : [];
    return { startedAt: v.startedAt, done };
  } catch {
    return null;
  }
}

export const allItems = (c: CoachCohort) => c.groups.flatMap((g) => g.items);

export type CoachTimeline = {
  status: "before" | "active" | "closed";
  /** When the window starts counting (later of start press and cohort start, when aligned). */
  windowStartMs: number;
  endMs: number;
  remainingMs: number;
  /** 1-based week, 0 before the window starts. */
  week: number;
  focus: WeekFocus;
  /** Share of the window elapsed, 0..1. */
  elapsed: number;
};

export function timeline(
  c: CoachCohort,
  startedAt: number,
  now: number,
): CoachTimeline {
  const cohortStart = new Date(c.startsAt).getTime();
  const windowStartMs = c.alignToCohortStart
    ? Math.max(startedAt, cohortStart)
    : startedAt;
  const endMs = windowStartMs + c.weeks * WEEK;
  if (now < windowStartMs) {
    return {
      status: "before",
      windowStartMs,
      endMs,
      remainingMs: endMs - now,
      week: 0,
      focus: c.setupFocus,
      elapsed: 0,
    };
  }
  if (now >= endMs) {
    return {
      status: "closed",
      windowStartMs,
      endMs,
      remainingMs: 0,
      week: c.weeks,
      focus: c.weeklyFocus[c.weeklyFocus.length - 1],
      elapsed: 1,
    };
  }
  const week = Math.min(c.weeks, Math.floor((now - windowStartMs) / WEEK) + 1);
  return {
    status: "active",
    windowStartMs,
    endMs,
    remainingMs: endMs - now,
    week,
    focus: c.weeklyFocus[Math.min(week, c.weeklyFocus.length) - 1],
    elapsed: (now - windowStartMs) / (endMs - windowStartMs),
  };
}

export type Progress = {
  done: number;
  total: number;
  /** 0..100, rounded. */
  percent: number;
  groups: { id: string; title: string; done: number; total: number }[];
};

/** Progress over the cohort's current expectations; ids no longer in the config are ignored. */
export function progress(c: CoachCohort, doneIds: Iterable<string>): Progress {
  const done = new Set(doneIds);
  const groups = c.groups.map((g) => ({
    id: g.id,
    title: g.title,
    done: g.items.filter((i) => done.has(i.id)).length,
    total: g.items.length,
  }));
  const d = groups.reduce((a, g) => a + g.done, 0);
  const t = groups.reduce((a, g) => a + g.total, 0);
  return {
    done: d,
    total: t,
    percent: t ? Math.round((d / t) * 100) : 0,
    groups,
  };
}

/** A calm, never-shaming note that reflects where things stand. */
export function coachNote(t: CoachTimeline, p: Progress): string {
  if (p.total > 0 && p.done === p.total)
    return "You've done everything on the list. Keep your Sunday review going and keep applying; that rhythm is what lasts.";
  if (t.status === "before")
    return "You're set for day one. Nothing to rush: get familiar with your systems and protect time for the live session.";
  if (t.status === "closed")
    return p.done > 0
      ? "Your cohort window has closed. Everything you finished is still yours, and your systems keep working after the cohort."
      : "Your cohort window has closed. Your systems are still here; pick one item and start there whenever you're ready.";
  const expected = t.elapsed * p.total;
  if (p.done >= expected)
    return "You're moving at a good pace. Keep this week's focus small and finish what you start.";
  if (p.done === 0)
    return "A good first step is one small item from this week's focus. Progress counts, not perfection.";
  return "Steady is fine. Pick the one item from this week's focus that would help you most, and give it your next session.";
}

/** Days/hours/minutes/seconds for the tiles. */
export function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}
