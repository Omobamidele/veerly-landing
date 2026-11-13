import assert from "node:assert/strict";
import { test } from "node:test";
import { careerPaths } from "../lib/options";
import { LEVELS, PATH_META } from "../lib/levels";
import {
  QUIZ_MAX,
  QUIZ_QUESTION_IDS,
  isQuizComplete,
  parseLevelSource,
  quizQuestions,
  scoreQuiz,
  type Points,
  type QuizAnswers,
} from "../lib/quiz";
import { toCsv } from "../lib/csv";
import { validateStep1, validateProfile } from "../lib/waitlist";
import type { Signup } from "../lib/types";

const answers = (e: Points, t: Points, c: Points, k: Points, s: Points): QuizAnswers => ({
  experience: e,
  tools: t,
  client: c,
  tasks: k,
  support: s,
});

test("five questions, three options each, for every path and with no path", () => {
  for (const path of [...careerPaths, null, undefined, "not a path"]) {
    const qs = quizQuestions(path);
    assert.equal(qs.length, 5);
    assert.deepEqual(qs.map((q) => q.id), [...QUIZ_QUESTION_IDS]);
    for (const q of qs) {
      assert.ok(q.title.length > 10);
      assert.deepEqual(q.options.map((o) => o.points), [0, 1, 2]);
      for (const o of q.options) assert.ok(o.label.trim().length > 5);
    }
  }
});

test("questions follow the chosen path and fall back to generic wording", () => {
  const va = quizQuestions("Administration and Virtual Assistance");
  const data = quizQuestions("Data and Analytics");
  const none = quizQuestions(null);
  assert.notEqual(va[0].title, data[0].title);
  assert.notEqual(va[3].options[2].label, data[3].options[2].label);
  assert.match(va[1].title, /Gmail/);
  assert.match(none[0].title, /this kind of work/);
  // A slug works as well as the full name.
  assert.deepEqual(quizQuestions("va"), va);
  // Questions that are not about the work are the same everywhere.
  assert.equal(va[2].title, data[2].title);
});

test("every path has its own task ladder, three different tasks", () => {
  for (const p of PATH_META) {
    const q = quizQuestions(p.id)[3];
    const labels = q.options.map((o) => o.label);
    assert.equal(new Set(labels).size, 3);
    assert.notDeepEqual(labels, quizQuestions(null)[3].options.map((o) => o.label));
  }
});

test("plain language: no jargon-only options, no emoji, no job promises", () => {
  const text = [...careerPaths, null]
    .flatMap((p) => quizQuestions(p))
    .flatMap((q) => [q.title, q.hint ?? "", ...q.options.map((o) => o.label)])
    .join("\n");
  assert.doesNotMatch(text, /\p{Extended_Pictographic}/u);
  assert.doesNotMatch(text, /guarantee|you will get a job|get hired/i);
});

test("all low answers are Beginner, all high answers are Advanced", () => {
  const low = scoreQuiz(answers(0, 0, 0, 0, 0));
  assert.equal(low.level, "beginner");
  assert.equal(low.score, 0);
  const high = scoreQuiz(answers(2, 2, 2, 2, 2));
  assert.equal(high.level, "advanced");
  assert.equal(high.score, QUIZ_MAX);
});

test("score bands: 0-3 Beginner, 4-7 Intermediate, 8-10 Advanced", () => {
  assert.equal(scoreQuiz(answers(1, 1, 1, 0, 0)).level, "beginner"); // 3
  assert.equal(scoreQuiz(answers(1, 1, 1, 1, 0)).level, "intermediate"); // 4
  assert.equal(scoreQuiz(answers(2, 2, 1, 1, 1)).level, "intermediate"); // 7
  assert.equal(scoreQuiz(answers(2, 1, 1, 2, 2)).level, "advanced"); // 8
});

test("never done the work before is always Beginner, however confident", () => {
  const r = scoreQuiz(answers(0, 2, 2, 2, 2));
  assert.equal(r.level, "beginner");
  assert.match(r.reason, /not done this kind of work/);
});

test("Advanced needs real experience, paid work and the hardest tasks", () => {
  // High total but no paid work: capped at Intermediate.
  const noClient = scoreQuiz(answers(2, 2, 0, 2, 2));
  assert.equal(noClient.score, 8);
  assert.equal(noClient.level, "intermediate");
  assert.match(noClient.reason, /Advanced is for people with paid experience/);
  // High total but only some experience: capped.
  assert.equal(scoreQuiz(answers(1, 2, 2, 2, 2)).level, "intermediate");
  // High total but the hardest task is not something they can do: capped.
  assert.equal(scoreQuiz(answers(2, 2, 2, 1, 2)).level, "intermediate");
});

test("every result has a one-line plain reason and a real level", () => {
  const seen = new Set<string>();
  for (let n = 0; n < 3 ** 5; n++) {
    const a = answers(
      (n % 3) as Points,
      (Math.floor(n / 3) % 3) as Points,
      (Math.floor(n / 9) % 3) as Points,
      (Math.floor(n / 27) % 3) as Points,
      (Math.floor(n / 81) % 3) as Points,
    );
    const r = scoreQuiz(a);
    assert.ok((LEVELS as readonly string[]).includes(r.level));
    assert.ok(r.reason.length > 20 && !r.reason.includes("\n"));
    assert.ok(r.score >= 0 && r.score <= QUIZ_MAX);
    seen.add(r.level);
  }
  assert.deepEqual([...seen].sort(), [...LEVELS].sort());
});

test("a higher answer never lowers the suggested level", () => {
  const rank = { beginner: 0, intermediate: 1, advanced: 2 } as const;
  for (let n = 0; n < 3 ** 5; n++) {
    const base = [n % 3, Math.floor(n / 3) % 3, Math.floor(n / 9) % 3, Math.floor(n / 27) % 3, Math.floor(n / 81) % 3];
    for (let i = 0; i < 5; i++) {
      if (base[i] === 2) continue;
      const up = [...base];
      up[i] += 1;
      const mk = (b: number[]) => answers(b[0] as Points, b[1] as Points, b[2] as Points, b[3] as Points, b[4] as Points);
      assert.ok(rank[scoreQuiz(mk(up)).level] >= rank[scoreQuiz(mk(base)).level]);
    }
  }
});

test("missing answers count as zero and are reported as incomplete", () => {
  assert.equal(isQuizComplete({}), false);
  assert.equal(isQuizComplete(answers(0, 0, 0, 0, 0)), true);
  assert.equal(scoreQuiz({}).level, "beginner");
});

test("level source: only quiz or manual is accepted", () => {
  assert.equal(parseLevelSource("quiz"), "quiz");
  assert.equal(parseLevelSource(" Manual "), "manual");
  assert.equal(parseLevelSource("admin"), null);
  assert.equal(parseLevelSource(undefined), null);
});

const base = {
  name: "Ada Obi",
  email: "ada@example.com",
  emailConsent: "true",
  level: "intermediate",
  careerPath: "va",
};

test("waitlist keeps the level source, and ignores junk", () => {
  assert.equal(validateStep1({ ...base, levelSource: "quiz" }).data.levelSource, "quiz");
  assert.equal(validateStep1({ ...base, levelSource: "manual" }).data.levelSource, "manual");
  assert.equal(validateStep1({ ...base, levelSource: "<script>" }).data.levelSource, null);
  assert.equal(validateStep1(base).data.levelSource, null);
});

test("profile step only stores a level source together with a level", () => {
  assert.equal(validateProfile({ level: "beginner", levelSource: "quiz" }).data.levelSource, "quiz");
  assert.equal(validateProfile({ levelSource: "quiz" }).data.levelSource, undefined);
});

test("admin CSV has a level_source column", () => {
  const s = {
    id: "1",
    createdAt: "2026-11-13T00:00:00Z",
    name: "Ada",
    email: "a@example.com",
    whatsapp: null,
    consent: { email: { granted: true, at: null, textVersion: "v1", text: "" }, whatsapp: { granted: false, at: null, textVersion: "v1", text: "" } },
    profile: { level: "advanced", levelSource: "quiz" },
    payment: { status: "unpaid" },
    source: "landing",
  } as unknown as Signup;
  const [head, row] = toCsv([s]).split("\n");
  const cols = head.split(",");
  const i = cols.indexOf("level_source");
  assert.ok(i > cols.indexOf("level"));
  assert.equal(row.split(",")[i], "quiz");
});

test("signup stores the level source, and a later pick replaces it", async () => {
  const { freshStore } = await import("./helpers");
  freshStore();
  const { upsertSignup, signupForCheckout } = await import("../lib/waitlist");
  const form = { ...base, careerPath: "Administration and Virtual Assistance" };
  const first = await upsertSignup(validateStep1({ ...form, levelSource: "quiz" }).data);
  assert.equal(first.signup.profile.level, "intermediate");
  assert.equal(first.signup.profile.levelSource, "quiz");
  // Same email picks a level directly this time.
  const again = await upsertSignup(validateStep1({ ...form, level: "advanced", levelSource: "manual" }).data);
  assert.equal(again.signup.profile.level, "advanced");
  assert.equal(again.signup.profile.levelSource, "manual");
  // Checkout path keeps it too.
  const co = await signupForCheckout("new@example.com", "New", { level: "beginner", careerPath: "Business Operations", levelSource: "quiz" });
  assert.equal(co.profile.levelSource, "quiz");
});
