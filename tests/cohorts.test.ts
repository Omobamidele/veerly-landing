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

const P = Date.parse("2026-12-01T09:00:00+01:00"); // promotion + countdown start
const E = Date.parse("2027-01-01T09:00:00+01:00"); // enrolment / payment opens
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

test("prelaunch: no countdown (null = hidden)", () => {
  assert.equal(
    pickCountdownTarget({ now: P - 1, promoAtMs: P, phase: "prelaunch" }),
    null,
  );
});

test("promo and enrol: count to Cohort 1 (1 Feb 2027), then roll on", () => {
  for (const [now, phase] of [
    [P, "promo"],
    [E - 1, "promo"],
    [E, "enrol"],
  ] as const) {
    const t = pickCountdownTarget({ now, promoAtMs: P, phase });
    assert.ok(t);
    assert.deepEqual(
      [t.name, t.atMs, t.label],
      ["Cohort 1", C1, "Next cohort starts in"],
    );
  }
  assert.equal(
    pickCountdownTarget({ now: C1, promoAtMs: P, phase: "enrol" })?.name,
    "Cohort 2",
  );
  assert.equal(
    pickCountdownTarget({
      now: Date.parse("2027-03-01T09:00:00+01:00"),
      promoAtMs: P,
      phase: "enrol",
    })?.atMs,
    Date.parse("2027-04-05T09:00:00+01:00"),
  );
});

test("?preview=promo / enrol before 1 Dec still shows the Cohort 1 countdown", () => {
  const now = Date.parse("2026-11-10T13:00:00+01:00");
  assert.equal(
    pickCountdownTarget({ now, promoAtMs: P, phase: "promo" })?.name,
    "Cohort 1",
  );
  assert.equal(
    pickCountdownTarget({ now, promoAtMs: P, phase: "enrol" })?.name,
    "Cohort 1",
  );
});

test("list exhausted: first Monday of next month 9:00 WAT; never zero from promo onward", () => {
  const t = pickCountdownTarget({
    now: Date.parse("2027-04-20T12:00:00+01:00"),
    promoAtMs: P,
    phase: "enrol",
  });
  assert.ok(t);
  assert.equal(t.fallback, true);
  assert.equal(new Date(t.atMs).toISOString(), "2027-05-03T08:00:00.000Z"); // Mon 3 May 2027
  assert.equal(t.name, "May 2027 cohort");
  for (let ms = P; ms < P + 500 * 86_400_000; ms += 3 * 3_600_000 + 17_000) {
    const x = pickCountdownTarget({
      now: ms,
      promoAtMs: P,
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
