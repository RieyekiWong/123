import { test } from "node:test";
import assert from "node:assert/strict";
import "../case-data.js";
import "../case-void-model.js";
import "../case-night-model.js";
import "../case-state.js";
const M = globalThis.StillwaterCaseState, D = globalThis.StillwaterCaseData;
import {fullCase} from './v2-evidence-model-helpers.mjs';
function ready() {
  const s = fullCase();
  s.evidence = Object.keys(D.clues);
  s.completed = { serviceInspected: true, audit: true, finalEvidence: true };
  Object.assign(s.night, { started: true, links: [0, 1], door: true, frame: true, orientations: [2, 1, 2, 0, 3, 0], isolated: true, manual: true, saved: true, operations: 6 });
  return s;
}
const choose = (s, version) => M.transition(s, "promo-source", { version });
const mark = (s, target) => M.transition(s, "promo-mark", { target });

test("W3-02 cannot skip the original case, last frame, passage or saved valid wiring", () => {
  assert.equal(choose(M.fresh(), "original").error, "promo-not-ready");
  for (const field of ["saved", "frame", "door", "manual", "isolated"]) {
    const s = ready(); s.night[field] = false;
    assert.equal(choose(s, "original").ok, false, field);
    assert.equal(M.canOpen(s, "void"), false, field);
  }
  const broken = ready(); broken.night.orientations[2] = 3;
  assert.equal(choose(broken, "original").ok, false);
  const incomplete = ready(); incomplete.completed.finalEvidence = false;
  assert.equal(choose(incomplete, "original").ok, false);
});
test("the later images and unchanged regions really fail, without changing C1–C9 or the six junctions", () => {
  const s = ready(), before = JSON.stringify({ evidence: s.evidence, night: s.night });
  assert.equal(mark(s, "middle").error, "promo-source");
  for (const id of ["preview", "synced", "unknown", undefined]) assert.equal(choose(s, id).ok, false);
  assert.equal(M.canOpen(s, "void"), false);
  assert.ok(choose(s, "original").ok);
  for (const target of ["left", "right", "lamp", "unknown"]) assert.equal(mark(s, target).ok, false);
  assert.equal(M.transition(s, "void", { action: "enter" }).ok, false);
  assert.equal(JSON.stringify({ evidence: s.evidence, night: s.night }), before);
  assert.deepEqual(s.endings, []);
});
test("selection and the actual changed sign survive refresh, unlock only the next image, and emit one optional echo", () => {
  let s = ready(); choose(s, "original");
  s = M.hydrate(JSON.parse(JSON.stringify(s)));
  assert.equal(s.promo.selected, "original"); assert.equal(s.promo.verified, false);
  assert.equal(mark(s, "middle").event, "promo-source-echo");
  assert.ok(M.canOpen(s, "void")); assert.equal(s.night.void.entered, false);
  assert.equal(M.transition(s, "night-lock").error, "void-first");
  assert.deepEqual(s.endings, []); assert.equal(s.evidence.length, 9);
  s = M.hydrate(JSON.parse(JSON.stringify(s)));
  assert.ok(s.promo.verified); assert.equal(mark(s, "middle").event, undefined);
  assert.ok(M.transition(s, "void", { action: "enter", now: 1000 }).ok);
});
test("source verification does not replace save, isolation or manual operation, and stays checked after rewiring", () => {
  const s = ready(); choose(s, "original"); mark(s, "middle");
  assert.ok(M.transition(s, "night-rotate", { node: 0 }).ok);
  assert.equal(s.night.saved, false); assert.equal(M.canOpen(s, "void"), false);
  s.night.orientations = [2, 1, 2, 0, 3, 0];
  assert.ok(M.transition(s, "night-save").ok);
  assert.ok(M.canOpen(s, "void")); assert.ok(s.promo.verified);
});
test("older saves before the black world get a recoverable check; saves inside it and all completed endings keep access", () => {
  const pending = ready(); delete pending.promo;
  const p = M.hydrate(pending); assert.equal(p.promo.legacy, false); assert.equal(M.canOpen(p, "void"), false);
  assert.equal(p.night.saved, true); assert.equal(p.evidence.length, 9);
  for (const at of ["corridor", "fragments", "released", "unverified", "auto-close"]) {
    const old = ready(); delete old.promo;
    if (["corridor", "fragments"].includes(at)) {
      old.night.void.entered = true; old.night.void.enteredAt = 1000;
      if (at === "fragments") { old.night.void.step = 4; old.night.void.stage = "fragments"; old.night.void.positions[1] = [2, 1]; }
    } else {
      old.endings = [at]; old.lastEnding = at;
      if (at === "released") { old.night.locked = true; old.night.released = true; }
    }
    let restored = M.hydrate(old);
    assert.equal(restored.promo.legacy, true, at); assert.ok(M.canOpen(restored, "void"), at);
    assert.deepEqual(restored.evidence, old.evidence); assert.deepEqual(restored.endings, old.endings);
    assert.deepEqual(restored.night.void.positions, old.night.void.positions);
    restored = M.hydrate(JSON.parse(JSON.stringify(restored)));
    assert.ok(restored.promo.legacy, at); assert.ok(M.canOpen(restored, "void"), at);
  }
});
test("malformed new additions cannot forge a source check or erase valid old progress", () => {
  for (const promo of [null, {}, { schema: 1, verified: true }, { schema: 1, selected: "preview", marked: "middle", verified: true }, { schema: 1, legacy: true }]) {
    const s = ready(); s.promo = promo;
    const hydrated = M.hydrate(s);
    assert.equal(hydrated.promo.verified, false); assert.equal(hydrated.promo.legacy, false);
    assert.equal(M.canOpen(hydrated, "void"), false);
    assert.equal(hydrated.evidence.length, 9); assert.equal(hydrated.night.saved, true);
  }
});
test("muted, reduced-motion and skipped-scare players use identical evidence requirements", () => {
  for (const preferences of [{ sound: false, skipScares: true }, { sound: true, reduceMotion: true }, { sound: false, reduceMotion: true, skipScares: true }]) {
    const s = ready(); Object.assign(s.preferences, preferences); const before = { ...s.preferences };
    assert.ok(choose(s, "original").ok); assert.ok(mark(s, "middle").ok);
    assert.ok(M.canOpen(s, "void")); assert.deepEqual(s.preferences, before);
  }
});
