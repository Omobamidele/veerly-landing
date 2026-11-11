import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LEVEL_CARDS,
  LEVEL_LABEL,
  isLevel,
  levelLabel,
  parseLevel,
} from "../lib/levels";
import { PRICES } from "../lib/pricing";

test("parseLevel accepts beginner, intermediate, advanced only", () => {
  assert.equal(parseLevel("beginner"), "beginner");
  assert.equal(parseLevel(" Intermediate "), "intermediate");
  assert.equal(parseLevel("ADVANCED"), "advanced");
  assert.equal(parseLevel("expert"), null);
  assert.equal(parseLevel(""), null);
  assert.equal(parseLevel(undefined), null);
  assert.equal(isLevel("beginner"), true);
  assert.equal(isLevel("Beginner"), false);
  assert.equal(levelLabel("advanced"), "Advanced");
  assert.deepEqual(
    LEVEL_CARDS.map((c) => c.id),
    ["beginner", "intermediate", "advanced"],
  );
  assert.equal(LEVEL_LABEL.beginner, "Beginner");
});

test("every VA level uses the same founding price", () => {
  // Price is not per-level; the picker must not invent a new amount.
  assert.equal(PRICES.NGN.amount, 10000);
  assert.equal(PRICES.USD.amount, 7.99);
  for (const card of LEVEL_CARDS) {
    assert.equal(typeof card.who, "string");
    assert.ok(card.who.length > 20);
    assert.ok(card.learn.length >= 4);
    assert.ok(card.able.length >= 4);
    assert.match(card.cta, /^Choose /);
  }
});
