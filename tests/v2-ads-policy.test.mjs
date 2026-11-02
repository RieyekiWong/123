import { test } from "node:test";
import assert from "node:assert/strict";
import "../ad-data.js";
import "../ad-system.js";
const P = globalThis.StillwaterAds.policy;
test("ads have bounded varied delays, three-card session cap and require navigation between displays", () => {
  assert.equal(
    P.delay(true, () => 0),
    45000,
  );
  assert.equal(
    P.delay(true, () => 1),
    75000,
  );
  assert.equal(
    P.delay(false, () => 0),
    90000,
  );
  assert.equal(
    P.delay(false, () => 1),
    150000,
  );
  const s = P.freshSession(() => 0);
  assert.equal(P.advance(s, 44000), false);
  assert.equal(P.advance(s, 1000), true);
  s.shownThisSession = ["pet"];
  s.remaining = 90000;
  s.navigatedSinceShow = false;
  assert.equal(P.advance(s, 90000), false);
  s.navigatedSinceShow = true;
  assert.equal(P.advance(s, 0), true);
  s.shownThisSession = ["pet", "cinema", "cats"];
  assert.equal(P.advance(s, 200000), false);
});
test("reading, hidden tabs, forms, dialogs and serious files pause advertisement time", () => {
  for (const options of [
    { visible: false },
    { eligible: false },
    { typing: true },
    { dialog: true },
    { active: true },
    { quiet: false },
  ]) {
    const s = P.freshSession(() => 0);
    assert.equal(P.advance(s, 100000, options), false);
    assert.equal(s.remaining, 45000);
  }
  const s = P.freshSession(() => 0);
  assert.equal(P.advance(s, 34000, { forum: true }), false);
  assert.equal(s.remaining, 45000);
  for (const route of [
    "floor-plan",
    "maintenance",
    "night-audit",
    "staff",
    "revisions",
    "closure",
    "mara",
    "review",
    "ending",
    "reservations",
  ])
    assert.equal(P.eligibleRoutes.has(route), false);
});
test("all seven ads have complete bilingual local content and no case clues or external contact mechanisms", () => {
  const ads = globalThis.StillwaterAdData;
  assert.equal(ads.length, 7);
  assert.equal(new Set(ads.map((a) => a.id)).size, 7);
  for (const ad of ads) {
    for (const key of ["name", "headline", "copy", "cta", "intro", "note"])
      assert.ok(
        ad[key].length === 2 &&
          ad[key].every((s) => typeof s === "string" && s.length > 0),
      );
    assert.ok(ad.items.length);
    const text = JSON.stringify(ad);
    assert.doesNotMatch(
      text,
      /R-4829|A-06-17|E-014|TEMP-015|317|Mara|https?:|mailto:|tel:|<iframe/,
    );
  }
});
