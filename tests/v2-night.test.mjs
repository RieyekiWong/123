import { test } from "node:test";
import assert from "node:assert/strict";
import "../case-data.js";
import "../case-void-model.js";
import "../case-night-model.js";
import "../case-state.js";
const M = globalThis.StillwaterCaseState,
  N = globalThis.StillwaterNightModel,
  D = globalThis.StillwaterCaseData;
const move = (s, a, p = {}) => M.transition(s, "night-" + a, p);
import {fullCase} from './v2-evidence-model-helpers.mjs';
function ready() {
  return fullCase();
}
function door(s) {
  move(s, "start");
  move(s, "observe-public", { page: "rooms" });
  move(s, "observe-public", { page: "guestbook" });
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
  move(s, "walk", { position: "west" });
  for (const target of ["cart", "cabinet", "power"])
    assert.ok(move(s, "inspect", { target }).ok);
  move(s, "walk", { position: "service" });
  assert.ok(move(s, "inspect", { target: "enter" }).ok);
}
test("spatial links require actual shared landmarks; mistakes retain correct links", () => {
  const s = ready();
  assert.equal(move(s, "link", { link: 0 }).ok, false);
  move(s, "start");
  move(s, "observe-public", { page: "rooms" });
  move(s, "observe-public", { page: "guestbook" });
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
  assert.equal(move(s, "lock").error, "void-first");
  assert.ok(M.transition(s, "promo-source", { version: "original" }).ok);
  assert.ok(M.transition(s, "promo-mark", { target: "middle" }).ok);
  M.transition(s, "void", { action: "enter", now: 1000 });
  const V = globalThis.StillwaterVoidModel, v = s.night.void;
  for (let i = 0; i < 4; i++) V.transition(v, "walk", { direction: V.correct(i) });
  for (let id = 0; id < 3; id++) V.transition(v, "move", { id, dx: -v.positions[id][0], dy: -v.positions[id][1] });
  V.transition(v, "review"); V.transition(v, "terminal");
  for (const type of ["ROOM", "GUEST", "EMPLOYEE"]) {const spec=D.proofs[type];V.confirm(v,type,{sources:spec.sources,values:Object.fromEntries(spec.fields.map(f=>[f.id,f.answer]))});}
  V.transition(v,'disposition',{mode:'retain'});
  V.transition(v, "leave");
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

test("editing findings gates live equipment but always offers a route back to the review", () => {
  const s = ready();
  door(s);
  M.transition(s, "edit-evidence");
  assert.equal(M.canOpen(s, "terminal"), false);
  assert.equal(M.recovery(s, "terminal"), "review");
  assert.equal(M.canOpen(s, "review"), true);
});

test("new live chapters require actually revisiting both changed pages and traversing the service space", () => {
  const s = ready();
  move(s, "start");
  assert.equal(M.canOpen(s, "cameras"), false);
  assert.equal(M.recovery(s), "rooms");
  move(s, "observe-public", { page: "rooms" });
  assert.equal(M.canOpen(s, "cameras"), false);
  assert.equal(M.recovery(s), "guestbook");
  move(s, "observe-public", { page: "guestbook" });
  assert.equal(M.canOpen(s, "cameras"), true);
  for (const [cam, pan] of [
    [0, 2],
    [1, 0],
  ])
    move(s, "pan", { cam, pan });
  move(s, "link", { link: 0 });
  for (const [cam, pan] of [
    [1, 2],
    [2, 0],
  ])
    move(s, "pan", { cam, pan });
  move(s, "link", { link: 1 });
  move(s, "pan", { cam: 2, pan: 2 });
  move(s, "door");
  assert.equal(M.canOpen(s, "terminal"), false);
  assert.equal(M.recovery(s), "service-passage");
  assert.equal(move(s, "frame").ok, false);
  assert.equal(move(s, "save").ok, false);
  move(s, "walk", { position: "service" });
  assert.equal(move(s, "inspect", { target: "enter" }).error, "night-power");
  move(s, "walk", { position: "west" });
  assert.equal(move(s, "inspect", { target: "cabinet" }).error, "night-cart");
  move(s, "inspect", { target: "cart" });
  move(s, "inspect", { target: "cabinet" });
  move(s, "inspect", { target: "power" });
  move(s, "walk", { position: "service" });
  move(s, "inspect", { target: "enter" });
  assert.equal(M.canOpen(M.hydrate(s), "terminal"), true);
});
test("six authored events are action-bound, distinct, once per save and faces have action spacing", () => {
  const s = ready();
  door(s);
  const n = s.night;
  move(s, "walk", { position: "landing" });
  assert.equal(
    move(s, "inspect", { target: "plate" }).event,
    "plate-open-door",
  );
  assert.equal(move(s, "inspect", { target: "plate" }).event, undefined);
  assert.equal(
    move(s, "inspect", { target: "peephole" }).event,
    "peephole-empty",
  );
  assert.equal(move(s, "inspect", { target: "photo" }).event, "photo-face");
  assert.equal(move(s, "inspect", { target: "photo" }).event, undefined);
  move(s, "walk", { position: "west" });
  assert.equal(
    move(s, "walk", { position: "landing" }).event,
    "hall-silhouette",
  );
  assert.equal(move(s, "frame").event, "last-frame");
  assert.deepEqual(
    new Set(n.events),
    new Set([
      "cabinet-face",
      "plate-open-door",
      "peephole-empty",
      "photo-face",
      "hall-silhouette",
      "last-frame",
    ]),
  );
  const saved = M.hydrate(s);
  assert.deepEqual(saved.night.events, n.events);
  assert.equal(move(saved, "frame").event, undefined);
  assert.equal(
    saved.preferences.skipScares,
    false,
    "story actions retain the enabled default without changing player preferences",
  );
});
test("existing deep saves retain immediate terminal access and malformed additions cannot erase original progress", () => {
  const s = ready();
  s.night = {
    started: true,
    links: [0, 1],
    door: true,
    frame: true,
    orientations: [2, 1, 2, 0, 3, 0],
    isolated: true,
    manual: true,
    saved: true,
    locked: true,
    operations: 9,
  };
  const hydrated = M.hydrate(s);
  assert.equal(M.canOpen(hydrated, "terminal"), true);
  assert.equal(hydrated.night.saved, true);
  s.night.passage = {
    position: "evil",
    inspected: { bad: true },
    complete: true,
  };
  s.night.events = { bad: true };
  const safe = M.hydrate(s);
  assert.equal(safe.night.door, true);
  assert.equal(safe.evidence.length, 9);
  assert.deepEqual(safe.night.events, []);
  assert.equal(safe.night.passage.complete, false);
});

test("migrating the former automatic skip re-arms unseen faces without resetting story or equipment", () => {
  const s = ready();
  door(s);
  move(s, "frame");
  move(s, "rotate", { node: 0 });
  s.preferences = { skipScares: true };
  s.night.events = [
    "plate-open-door",
    "photo-face",
    "cabinet-face",
    "last-frame",
  ];
  const upgraded = M.hydrate(s);
  assert.equal(upgraded.preferences.skipScares, false);
  assert.deepEqual(upgraded.night.events, ["plate-open-door"]);
  assert.equal(upgraded.night.frame, true);
  assert.equal(upgraded.night.passage.complete, true);
  assert.deepEqual(upgraded.evidence, s.evidence);
  assert.deepEqual(upgraded.night.orientations, s.night.orientations);
  assert.equal(move(upgraded, "frame").event, "last-frame");
  assert.equal(move(upgraded, "frame").event, undefined);
});
