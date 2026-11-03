import { test } from "node:test";
import assert from "node:assert/strict";
import "../ad-data.js";
import "../ad-system.js";
const P = globalThis.StillwaterAds.policy;
test("popup delays vary, same-page appearances are allowed and seven unique campaigns form the limit", () => {
  assert.equal(P.delay(true,()=>0),12000);
  assert.equal(P.delay(true,()=>1),24000);
  assert.equal(P.delay(false,()=>0),18000);
  assert.equal(P.delay(false,()=>1),36000);
  const s=P.freshSession(()=>0);
  assert.equal(P.advance(s,11000),false);
  assert.equal(P.advance(s,1000),true);
  s.shownThisSession=['pet'];s.remaining=18000;s.navigatedSinceShow=false;
  assert.equal(P.advance(s,18000),true);
  s.shownThisSession=['pet','cinema','repair','secondhand','print','cats','weather'];
  assert.equal(P.advance(s,200000),false);
});
test("random window slots use all four corners and a second window uses the other side",()=>{
  assert.equal(new Set([0,.3,.6,.9].map(r=>P.chooseSlot([],()=>r))).size,4);
  for(const slot of ['top-left','bottom-left','top-right','bottom-right']) {
    const next=P.chooseSlot([{slot}],()=>0);
    assert.notEqual(next.split('-')[1],slot.split('-')[1]);
  }
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
    assert.equal(s.remaining, 12000);
  }
  const s = P.freshSession(() => 0);
  assert.equal(P.advance(s, 7000, { forum: true }), false);
  assert.equal(s.remaining, 12000);
  for (const route of [
    "chat",
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
