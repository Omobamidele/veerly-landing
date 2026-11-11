import assert from "node:assert/strict";
import { test } from "node:test";
import { careerPaths } from "../lib/options";
import {
  LEVELS,
  LEVELS_BY_PATH,
  PATH_META,
  isCareerPath,
  levelCardsFor,
  parseLevel,
  parsePath,
  pathLabel,
  planSummary,
} from "../lib/levels";
import { PRICES } from "../lib/pricing";

test("every career path has beginner, intermediate and advanced cards", () => {
  assert.deepEqual(
    PATH_META.map((p) => p.id),
    [...careerPaths],
  );
  assert.equal(PATH_META.length, 10);
  for (const path of careerPaths) {
    const cards = levelCardsFor(path);
    assert.ok(cards);
    assert.deepEqual(
      cards.map((c) => c.id),
      ["beginner", "intermediate", "advanced"],
    );
    for (const card of cards) {
      assert.ok(card.who.length > 20, path + " " + card.id);
      assert.ok(card.learn.length >= 4, path + " " + card.id);
      assert.ok(card.able.length >= 4, path + " " + card.id);
      assert.match(card.cta, /^Choose /);
    }
  }
  assert.equal(PRICES.NGN.amount, 10000);
  assert.equal(PRICES.USD.amount, 7.99);
  assert.equal(Object.keys(LEVELS_BY_PATH).length, 10);
});

test("parsePath accepts official names, slugs and short labels", () => {
  assert.equal(parsePath("va"), "Administration and Virtual Assistance");
  assert.equal(parsePath("Virtual Assistant"), "Administration and Virtual Assistance");
  assert.equal(parsePath("GTM and Revenue Operations"), "GTM and Revenue Operations");
  assert.equal(parsePath("gtm"), "GTM and Revenue Operations");
  assert.equal(parsePath("design"), "Design and Creative Services");
  assert.equal(parsePath("not a path"), null);
  assert.equal(isCareerPath("Project Management"), true);
  assert.equal(pathLabel("va"), "Virtual Assistant");
  assert.equal(
    planSummary("sales", "beginner"),
    "Sales and Business Development · Beginner",
  );
  assert.equal(parseLevel(" Advanced "), "advanced");
  assert.deepEqual([...LEVELS], ["beginner", "intermediate", "advanced"]);
});
