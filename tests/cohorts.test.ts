import assert from "node:assert/strict";
import { test } from "node:test";
import { firstMondayAt9Wat, pickCountdownTarget } from "../lib/cohorts";
import {
  DEFAULT_COHORTS,
  cohorts,
  currentPhase,
  enrolAt,
  paymentOpen,
  parsePhase,
  phaseAt,
  promoAt,
} from "../lib/launch";

const P = Date.parse("2026-12-01T09:00:00+01:00"); // promotion start (still waitlist only)
const E = Date.parse("2027-01-01T09:00:00+01:00"); // enrolment / payment opens; countdown target until then
const C1 = Date.parse("2027-02-01T09:00:00+01:00"); // Cohort 1 (confirmed)

test("default timeline: 1 Dec promo, 1 Jan enrolment, Cohort 1 1 Feb (confirmed), then 1 Mar and 5 Apr", () => {
  assert.equal(promoAt().getTime(), P);
  assert.equal(enrolAt().getTime(), E);
  assert.deepEqual(
    DEFAULT_COHORTS.map((c) => [c.name, c.startsAt, Boolean(c.confirmed)]),
    [
      ["Cohort 1", "2027-02-01T09:00:00+01:00", true],
      ["Cohort 2", "2027-03-01T09:00:00+01:00", false],
      ["Cohort 3", "2027-04-05T09:00:00+01:00", false],
    ],
  );
});

test("phases by clock, with exact 9:00 WAT boundaries", () => {
  assert.equal(phaseAt(P - 1, P, E), "prelaunch");
  assert.equal(phaseAt(P, P, E), "promo");
  assert.equal(phaseAt(E - 1, P, E), "promo");
  assert.equal(phaseAt(E, P, E), "enrol");
  assert.equal(phaseAt(C1 + 86_400_000 * 90, P, E), "enrol");
  assert.equal(paymentOpen("prelaunch"), false);
  assert.equal(paymentOpen("promo"), false);
  assert.equal(paymentOpen("enrol"), true);
});

test("previews and env overrides", () => {
  assert.equal(parsePhase("promo"), "promo");
  assert.equal(parsePhase("enrol"), "enrol");
  assert.equal(parsePhase("launched"), "enrol"); // legacy name kept working
  assert.equal(parsePhase("nope"), null);
  const now = Date.parse("2026-11-10T13:00:00+01:00");
  assert.equal(currentPhase(now), "prelaunch");
  assert.equal(currentPhase(now, "promo"), "promo");
  assert.equal(currentPhase(now, "launched"), "enrol");
  process.env.NEXT_PUBLIC_ENROL_AT = "2027-01-15T09:00:00+01:00";
  process.env.NEXT_PUBLIC_COHORT_START_AT = "2027-02-08T09:00:00+01:00";
  process.env.NEXT_PUBLIC_LAUNCH_STATE = "promo";
  try {
    assert.equal(enrolAt().toISOString(), "2027-01-15T08:00:00.000Z");
    assert.equal(cohorts()[0].startsAt, "2027-02-08T09:00:00+01:00");
    assert.equal(currentPhase(now), "promo");
    assert.equal(currentPhase(now, "prelaunch"), "prelaunch"); // ?preview beats env
  } finally {
    delete process.env.NEXT_PUBLIC_ENROL_AT;
    delete process.env.NEXT_PUBLIC_COHORT_START_AT;
    delete process.env.NEXT_PUBLIC_LAUNCH_STATE;
  }
});

test("prelaunch and promo: count to enrolment (1 Jan 2027), not hidden", () => {
  for (const [now, phase] of [
    [Date.parse("2026-11-11T05:00:00+01:00"), "prelaunch"],
    [P - 1, "prelaunch"],
    [P, "promo"],
    [E - 1, "promo"],
  ] as const) {
    const t = pickCountdownTarget({ now, promoAtMs: P, enrolAtMs: E, phase });
    assert.ok(t);
    assert.deepEqual(
      [t.kind, t.atMs, t.label, t.name],
      ["enrolment", E, "Founding enrolment", undefined],
    );
    assert.ok(t.atMs > now);
  }
});

test("enrol: count to Cohort 1 (1 Feb 2027), then roll on", () => {
  const t = pickCountdownTarget({
    now: E,
    promoAtMs: P,
    enrolAtMs: E,
    phase: "enrol",
  });
  assert.ok(t);
  assert.deepEqual(
    [t.kind, t.name, t.atMs, t.label],
    ["cohort", "Cohort 1", C1, "Next cohort starts in"],
  );
  assert.equal(
    pickCountdownTarget({
      now: C1,
      promoAtMs: P,
      enrolAtMs: E,
      phase: "enrol",
    })?.name,
    "Cohort 2",
  );
  assert.equal(
    pickCountdownTarget({
      now: Date.parse("2027-03-01T09:00:00+01:00"),
      promoAtMs: P,
      enrolAtMs: E,
      phase: "enrol",
    })?.atMs,
    Date.parse("2027-04-05T09:00:00+01:00"),
  );
});

test("?preview=promo before 1 Dec still counts to enrolment; enrol preview counts to Cohort 1", () => {
  const now = Date.parse("2026-11-10T13:00:00+01:00");
  const promo = pickCountdownTarget({
    now,
    promoAtMs: P,
    enrolAtMs: E,
    phase: "promo",
  });
  assert.equal(promo?.kind, "enrolment");
  assert.equal(promo?.atMs, E);
  assert.equal(
    pickCountdownTarget({ now, promoAtMs: P, enrolAtMs: E, phase: "enrol" })
      ?.name,
    "Cohort 1",
  );
});

test("list exhausted: first Monday of next month 9:00 WAT; never zero, including before enrolment", () => {
  const t = pickCountdownTarget({
    now: Date.parse("2027-04-20T12:00:00+01:00"),
    promoAtMs: P,
    enrolAtMs: E,
    phase: "enrol",
  });
  assert.ok(t);
  assert.equal(t.fallback, true);
  assert.equal(new Date(t.atMs).toISOString(), "2027-05-03T08:00:00.000Z"); // Mon 3 May 2027
  assert.equal(t.name, "May 2027 cohort");
  const start = Date.parse("2026-11-01T09:00:00+01:00");
  for (
    let ms = start;
    ms < start + 500 * 86_400_000;
    ms += 3 * 3_600_000 + 17_000
  ) {
    const x = pickCountdownTarget({
      now: ms,
      promoAtMs: P,
      enrolAtMs: E,
      phase: phaseAt(ms, P, E),
    });
    assert.ok(x && x.atMs > ms);
  }
});

test("first Monday helper", () => {
  assert.equal(
    new Date(firstMondayAt9Wat(2027, 0)).toISOString(),
    "2027-01-04T08:00:00.000Z",
  );
  assert.equal(
    new Date(firstMondayAt9Wat(2027, 3)).toISOString(),
    "2027-04-05T08:00:00.000Z",
  );
  assert.equal(
    new Date(firstMondayAt9Wat(2026, 12)).toISOString(),
    "2027-01-04T08:00:00.000Z",
  );
});
