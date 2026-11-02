import { test } from "node:test";
import assert from "node:assert/strict";
import "../case-data.js";
import "../case-night-model.js";
import "../case-state.js";
const M = globalThis.StillwaterCaseState,
  N = globalThis.StillwaterNightModel,
  D = globalThis.StillwaterCaseData;
const move = (s, a, p = {}) => M.transition(s, "night-" + a, p);
function ready() {
  const s = M.fresh();
  s.evidence = Object.keys(D.clues);
  s.completed.audit = true;
  s.completed.finalEvidence = true;
  return s;
}
function door(s) {
  move(s, "start");
  for (const [cam, pan] of [
    [0, 2],
    [1, 0],
  ])
    move(s, "pan", { cam, pan });
  assert.ok(move(s, "link", { link: 0 }).ok);
  for (const [cam, pan] of [
    [1, 2],
    [2, 0],
  ])
    move(s, "pan", { cam, pan });
  assert.ok(move(s, "link", { link: 1 }).ok);
  move(s, "pan", { cam: 2, pan: 2 });
  assert.ok(move(s, "door").ok);
}
test("spatial links require actual shared landmarks; mistakes retain correct links", () => {
  const s = ready();
  assert.equal(move(s, "link", { link: 0 }).ok, false);
  move(s, "start");
  assert.equal(move(s, "door").ok, false);
  move(s, "pan", { cam: 0, pan: 2 });
  move(s, "pan", { cam: 1, pan: 0 });
  assert.ok(move(s, "link", { link: 0 }).ok);
  assert.equal(move(s, "link", { link: 1 }).ok, false);
  assert.deepEqual(s.night.links, [0]);
  assert.deepEqual(M.hydrate(s).night.links, [0]);
});
test("graph traces all six reciprocal elbow connections, output and isolation separately", () => {
  const n = N.fresh();
  n.orientations = [2, 1, 2, 0, 3, 0];
  let c = N.circuit(n);
  assert.equal(c.readable, true);
  assert.equal(c.register, true);
  assert.equal(c.valid, false);
  n.isolated = true;
  n.manual = true;
  assert.equal(N.circuit(n).valid, true);
  for (let i = 0; i < 6; i++) {
    n.orientations[i] = (n.orientations[i] + 1) % 4;
    assert.equal(N.circuit(n).readable, false, "broken physical junction " + i);
    n.orientations[i] = (n.orientations[i] + 3) % 4;
  }
});
test("new endings cannot skip equipment, true ending needs saved isolation and explicit archive lock", () => {
  let s = ready();
  assert.equal(M.transition(s, "ending", { ending: "unverified" }).ok, false);
  door(s);
  assert.equal(move(s, "save").ok, false);
  move(s, "frame");
  move(s, "rotate", { node: 0 });
  assert.equal(M.transition(s, "ending", { ending: "released" }).ok, false);
  s.night.orientations = [2, 1, 2, 0, 3, 0];
  move(s, "isolate");
  move(s, "manual");
  assert.ok(move(s, "save").ok);
  s = M.hydrate(s);
  assert.equal(s.night.saved, true);
  assert.ok(move(s, "lock").ok);
  assert.ok(M.transition(s, "ending", { ending: "released" }).ok);
  assert.ok(M.hydrate(s).endings.includes("released"));
  assert.deepEqual(s.evidence, Object.keys(D.clues));
});
test("old schema-two ending saves migrate without resetting clues, drafts or ending history", () => {
  const old = ready();
  delete old.night;
  old.endings = ["auto-close", "unverified"];
  old.lastEnding = "unverified";
  old.drafts.reservation = "R-4829";
  const s = M.hydrate(old);
  assert.deepEqual(s.endings, old.endings);
  assert.deepEqual(s.evidence, old.evidence);
  assert.equal(s.night.started, false);
  assert.equal(s.drafts.reservation, "R-4829");
  assert.ok(M.canOpen(s, "ending"));
  assert.ok(move(s, "start").ok);
});

test("a malformed new equipment field cannot discard an otherwise valid historical case", () => {
  const old = ready();
  old.endings = ["unverified"];
  old.lastEnding = "unverified";
  old.night = {
    started: true,
    links: { unexpected: true },
    undo: [null, 9, { orientations: [] }],
    orientations: ["bad"],
  };
  const s = M.hydrate(old);
  assert.equal(s.evidence.length, 9);
  assert.deepEqual(s.endings, ["unverified"]);
  assert.deepEqual(s.night.links, []);
  assert.deepEqual(s.night.undo, []);
  assert.equal(s.night.door, false);
});

test('editing findings gates live equipment but always offers a route back to the review',()=>{
 const s=ready();door(s);M.transition(s,'edit-evidence');assert.equal(M.canOpen(s,'terminal'),false);assert.equal(M.recovery(s,'terminal'),'review');assert.equal(M.canOpen(s,'review'),true);
});
