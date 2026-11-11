import assert from "node:assert/strict";
import { test } from "node:test";
import {
  COACH_COHORTS,
  allItems,
  coachCohort,
  coachNote,
  ensureStarted,
  parseSaved,
  parts,
  progress,
  storageKey,
  timeline,
  type CoachCohort,
} from "../lib/coach";

const DAY = 86_400_000;
const c1 = coachCohort("cohort-1");
const START = Date.parse("2027-02-01T09:00:00+01:00");

test("config: Cohort 1 starts Mon 1 Feb 2027, 4 weeks, expectations grouped by the three systems", () => {
  assert.equal(c1.name, "Cohort 1");
  assert.equal(c1.startsAt, "2027-02-01T09:00:00+01:00");
  assert.equal(c1.weeks, 4);
  assert.deepEqual(
    c1.groups.map((g) => g.title),
    [
      "Job Hunt OS",
      "Portfolio Builder",
      "Interview Preparation System",
      "Cohort rhythm",
    ],
  );
  const ids = allItems(c1).map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length, "item ids are unique");
  assert.equal(coachCohort("nope").id, "cohort-1");
  assert.equal(COACH_COHORTS.length >= 3, true);
  assert.equal(storageKey("cohort-2"), "veerly.coach.cohort-2");
});

test("timeline aligned to the cohort: starting early waits for day one", () => {
  const early = START - 10 * DAY;
  const t = timeline(c1, early, early + DAY);
  assert.equal(t.status, "before");
  assert.equal(t.week, 0);
  assert.equal(t.windowStartMs, START);
  assert.equal(t.endMs, START + 28 * DAY);
  assert.equal(t.focus.title, "Before day one");
});

test("timeline: weeks 1-4 from elapsed time, then closed at the end", () => {
  assert.equal(timeline(c1, START, START).week, 1);
  assert.equal(timeline(c1, START, START + 7 * DAY - 1).week, 1);
  assert.equal(timeline(c1, START, START + 7 * DAY).week, 2);
  assert.equal(
    timeline(c1, START, START + 22 * DAY).focus.title,
    "Practise and apply",
  );
  const last = timeline(c1, START, START + 28 * DAY - 1);
  assert.equal(last.status, "active");
  assert.equal(last.remainingMs, 1);
  const closed = timeline(c1, START, START + 28 * DAY);
  assert.deepEqual(
    [closed.status, closed.remainingMs, closed.elapsed],
    ["closed", 0, 1],
  );
});

test("late starters share the cohort finish line; personal windows run from first open", () => {
  const late = START + 10 * DAY;
  assert.equal(timeline(c1, late, late).windowStartMs, late); // later of first open and cohort start
  const personal: CoachCohort = { ...c1, alignToCohortStart: false };
  const t = timeline(personal, START - 3 * DAY, START - 3 * DAY);
  assert.equal(t.status, "active");
  assert.equal(t.endMs, START + 25 * DAY);
});

test("progress counts known ids only, per group and overall", () => {
  const p = progress(c1, ["jh-15-roles", "pb-case-1", "pb-case-2", "ghost-id"]);
  assert.equal(p.done, 3);
  assert.equal(p.total, allItems(c1).length);
  assert.equal(p.percent, Math.round((3 / p.total) * 100));
  assert.deepEqual(
    p.groups.find((g) => g.id === "portfolio-builder"),
    {
      id: "portfolio-builder",
      title: "Portfolio Builder",
      done: 2,
      total: 3,
    },
  );
  assert.equal(progress(c1, []).percent, 0);
  assert.equal(
    progress(
      c1,
      allItems(c1).map((i) => i.id),
    ).percent,
    100,
  );
});

test("coach notes stay calm and never shame", () => {
  const none = progress(c1, []);
  const all = progress(
    c1,
    allItems(c1).map((i) => i.id),
  );
  const notes = [
    coachNote(timeline(c1, START, START + DAY), none),
    coachNote(
      timeline(c1, START, START + 20 * DAY),
      progress(c1, ["jh-setup"]),
    ),
    coachNote(
      timeline(c1, START, START + 2 * DAY),
      progress(c1, ["jh-setup", "jh-15-roles"]),
    ),
    coachNote(timeline(c1, START, START + 40 * DAY), none),
    coachNote(
      timeline(c1, START, START + 40 * DAY),
      progress(c1, ["jh-setup"]),
    ),
    coachNote(timeline(c1, START - 5 * DAY, START - 4 * DAY), none),
    coachNote(timeline(c1, START, START + DAY), all),
  ];
  for (const n of notes) {
    assert.ok(n.length > 20);
    assert.doesNotMatch(n, /behind|fail|late|should have|guarantee|job offer/i);
  }
  assert.match(notes[3], /window has closed/);
});

test("saved state parsing and countdown parts", () => {
  assert.equal(parseSaved(null), null);
  assert.equal(parseSaved("not json"), null);
  assert.equal(parseSaved('{"done":[]}'), null);
  assert.deepEqual(parseSaved('{"startedAt":5,"done":["a",3,"b"]}'), {
    startedAt: 5,
    done: ["a", "b"],
  });
  assert.deepEqual(parts(DAY + 3_661_000), {
    days: 1,
    hours: 1,
    minutes: 1,
    seconds: 1,
  });
  assert.deepEqual(parts(-5), { days: 0, hours: 0, minutes: 0, seconds: 0 });
});

test("auto-start: first open starts the clock at now; a saved start time is kept", () => {
  const now = START - 20 * DAY;
  const fresh = ensureStarted(parseSaved(null), now);
  assert.equal(fresh.isNew, true);
  assert.deepEqual(fresh.state, { startedAt: now, done: [] });
  const broken = ensureStarted(parseSaved("{oops"), now);
  assert.equal(broken.isNew, true);
  const kept = ensureStarted(
    parseSaved(JSON.stringify({ startedAt: now - DAY, done: ["jh-setup"] })),
    now,
  );
  assert.equal(kept.isNew, false);
  assert.deepEqual(kept.state, { startedAt: now - DAY, done: ["jh-setup"] });
});

test("single countdown: counts to day one, then to the window end, never sits at zero while running", () => {
  const opened = START - 20 * DAY;
  const before = timeline(c1, opened, opened);
  assert.equal(before.countdownTo, "start");
  assert.equal(before.countdownMs, 20 * DAY);
  assert.equal(timeline(c1, opened, START - 1).countdownMs, 1);
  const dayOne = timeline(c1, opened, START);
  assert.equal(dayOne.status, "active");
  assert.equal(dayOne.countdownTo, "end");
  assert.equal(dayOne.countdownMs, 28 * DAY);
  for (let ms = opened; ms < START + 28 * DAY; ms += 37 * 3_600_000) {
    assert.ok(timeline(c1, opened, ms).countdownMs > 0, `countdown positive at ${ms}`);
  }
  assert.equal(timeline(c1, opened, START + 28 * DAY).countdownTo, null);
});

test("every group has a short tab label", () => {
  for (const g of c1.groups) {
    assert.ok(g.short.length > 0 && g.short.length <= 14, g.short);
  }
});
