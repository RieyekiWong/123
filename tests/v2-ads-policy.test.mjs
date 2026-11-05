import { test } from "node:test";
import assert from "node:assert/strict";
import "../ad-data.js";
import "../ad-system.js";
const P = globalThis.StillwaterAds.policy;
test("shorter random delays keep advertisements circulating after the first seven campaigns", () => {
  assert.equal(P.delay(true,()=>0),3000);
  assert.equal(P.delay(true,()=>1),5000);
  assert.equal(P.delay(false,()=>0),4000);
  assert.equal(P.delay(false,()=>1),7000);
  const s=P.freshSession(()=>0);
  assert.equal(P.advance(s,2000),false);
  assert.equal(P.advance(s,1000),true);
  s.shownThisSession=['pet'];s.remaining=18000;s.navigatedSinceShow=false;
  assert.equal(P.advance(s,18000),true);
  s.shownThisSession=['pet','cinema','repair','secondhand','print','cats','weather'];
  assert.equal(P.advance(s,200000),true);
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
    assert.equal(s.remaining, 3000);
  }
  const s = P.freshSession(() => 0);
  assert.equal(P.advance(s, 2000, { forum: true }), false);
  assert.equal(s.remaining, 3000);
  for (const route of [
    "void",
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
test('old seven-ad histories resume fairly; recent closes, active cards and saved ads are respected',()=>{
  const data=globalThis.StillwaterAdData,s=P.freshSession(()=>0),rng=()=>0;
  s.shownThisSession=data.map(ad=>ad.id);s.lastShownById={pet:100,cinema:200};s.lastAdId='cinema';
  assert.equal(P.chooseCampaign(s,data,{now:1000,rng}).id,'repair');
  s.blockedUntil.repair=5000;
  assert.equal(P.chooseCampaign(s,data,{now:1000,rng,pinnedIds:['secondhand'],activeIds:['print','cats']}).id,'weather');
  assert.equal(P.chooseCampaign(s,data,{now:6000,rng}).id,'repair');
  assert.equal(P.chooseCampaign(s,data,{now:1000,rng,pinnedIds:data.map(ad=>ad.id)}),null);
  s.shownThisSession=['pet'];s.blockedUntil={};s.lastShownById={};s.lastAdId='';
  assert.equal(P.chooseCampaign(s,data,{now:1000,rng}).id,'cinema');
});
test("all twenty-five ads have complete bilingual local content and no case clues or external contact mechanisms", () => {
  const ads = globalThis.StillwaterAdData;
  assert.equal(ads.length, 25);
  assert.equal(new Set(ads.map((a) => a.id)).size, 25);
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

test('the original saved IDs are retained and old sessions discover every unseen campaign before repeats',()=>{
 const data=globalThis.StillwaterAdData,original=['pet','cinema','repair','secondhand','print','cats','weather'];
 assert.deepEqual(data.slice(0,7).map(ad=>ad.id),original);
 assert.equal(P.eligibleRoutes.has('chat'),true);
 const s=P.freshSession(()=>0);s.shownThisSession=[...original];
 const found=[];for(let i=0;i<data.length-7;i++){const next=P.chooseCampaign(s,data,{rng:()=>0});found.push(next.id);s.shownThisSession.push(next.id);}
 assert.deepEqual(found,data.slice(7).map(ad=>ad.id));
});
