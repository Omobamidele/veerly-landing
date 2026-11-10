import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { buildIcs } from "../lib/ics";
import { toE164 } from "../lib/phone";
import { freshStore } from "./helpers";

test("phone numbers normalise to E.164", () => {
  assert.equal(toE164("0803 123 4567", "NG"), "+2348031234567");
  assert.equal(toE164("+44 7911 123456", "NG"), "+447911123456");
  assert.equal(toE164("12345", "NG"), null);
});

test("step 1 validation: consent rules", async () => {
  const { validateStep1 } = await import("../lib/waitlist");
  assert.ok(validateStep1({ name: "A B", email: "a@b.co" }).errors.consent);
  assert.ok(
    validateStep1({ name: "A B", email: "a@b.co", whatsappConsent: true })
      .errors.whatsapp,
  );
  assert.deepEqual(
    validateStep1({ name: "A B", email: "a@b.co", emailConsent: true }).errors,
    {},
  );
});

test("signup → profile update → duplicate email only adds information", async () => {
  const file = freshStore();
  const { upsertSignup, updateProfile, validateStep1 } =
    await import("../lib/waitlist");
  const first = await upsertSignup(
    validateStep1({
      name: "Ngozi A",
      email: "NGOZI@example.com",
      emailConsent: true,
    }).data,
  );
  assert.equal(first.duplicate, false);
  assert.equal(first.signup.consent.whatsapp.granted, false);

  assert.equal(
    await updateProfile(first.signup.id, "wrong-token", {
      careerPath: "Data and Analytics",
    }),
    null,
  );
  const updated = await updateProfile(first.signup.id, first.signup.editToken, {
    careerPath: "Data and Analytics",
  });
  assert.equal(updated?.profile.careerPath, "Data and Analytics");

  const again = await upsertSignup(
    validateStep1({
      name: "Someone Else",
      email: "ngozi@example.com",
      whatsapp: "08031234567",
      whatsappCountry: "NG",
      whatsappConsent: true,
    }).data,
  );
  assert.equal(again.duplicate, true);
  assert.equal(again.signup.name, "Ngozi A"); // not overwritten
  assert.equal(again.signup.consent.email.granted, true); // not downgraded
  assert.equal(again.signup.consent.whatsapp.granted, true); // added
  const saved = JSON.parse(readFileSync(file, "utf8"));
  assert.equal(saved.length, 1);
  assert.equal(saved[0].consent.whatsapp.textVersion.length > 0, true);
});

test("ics has the launch time in UTC", () => {
  const ics = buildIcs({
    uid: "x",
    title: "Launch",
    description: "d",
    start: new Date("2026-12-01T09:00:00+01:00"),
    minutes: 30,
  });
  assert.match(ics, /DTSTART:20261201T080000Z/);
  assert.match(ics, /DTEND:20261201T083000Z/);
});
