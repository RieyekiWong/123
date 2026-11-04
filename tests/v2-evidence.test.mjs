import { test } from "node:test";
import assert from "node:assert/strict";
import {
  D,
  M,
  move,
  prepareProof,
  solveProof,
  booking,
  toAudit,
  toIdentity,
  fullCase,
} from "./v2-evidence-model-helpers.mjs";
const copy = (s) => M.hydrate(JSON.parse(JSON.stringify(s)));
const N = globalThis.StillwaterNightModel,
  V = globalThis.StillwaterVoidModel;
function ready() {
  const s = fullCase();
  Object.assign(s.night, {
    started: true,
    links: [0, 1],
    spreadRequired: false,
    door: true,
    frame: true,
    orientations: [2, 1, 2, 0, 3, 0],
    isolated: true,
    manual: true,
    saved: true,
    operations: 6,
  });
  move(s, "promo-source", { version: "original" });
  move(s, "promo-mark", { target: "middle" });
  return s;
}
function classification(s) {
  move(s, "void", { action: "enter" });
  for (let i = 0; i < 4; i++)
    move(s, "void", { action: "walk", direction: V.correct(i) });
  for (let i = 0; i < 3; i++)
    move(s, "void", {
      action: "move",
      id: i,
      dx: -s.night.void.positions[i][0],
      dy: -s.night.void.positions[i][1],
    });
  move(s, "void", { action: "review" });
  move(s, "void", { action: "terminal" });
}
test("C3 and C4 can be discovered in either order, without opening the next chapter", () => {
  for (const order of [
    ["inventory", "message"],
    ["message", "inventory"],
  ]) {
    const s = booking();
    for (const a of order) move(s, a, a === "inventory" ? { room: "318" } : {});
    assert.ok(s.evidence.includes("C3"));
    assert.ok(s.evidence.includes("C4"));
    assert.equal(M.canOpen(s, "staff"), false);
    assert.equal(M.canOpen(s, "floor-plan"), true);
    assert.deepEqual(copy(s).evidence, s.evidence);
  }
});
test("intake requires two opened and compared originals as well as a justified judgment", () => {
  const s = M.fresh();
  move(s, "sample");
  move(s, "reservation", { reference: "R-4829" });
  s.desk.drafts.intake = {
    sources: ["sample", "booking"],
    values: { match: "same" },
  };
  assert.equal(
    M.transition(s, "desk-submit", { key: "intake" }).error,
    "desk-compare",
  );
  prepareProof(s, "intake", { match: "different" });
  assert.equal(M.transition(s, "desk-submit", { key: "intake" }).ok, false);
  solveProof(s, "intake");
  assert.ok(copy(s).desk.results.intake);
});
test("a position card is a discovered source, not an inferred classification", () => {
  const s = booking();
  move(s, "inventory", { room: "318" });
  move(s, "inspect-service");
  assert.ok(s.evidence.includes("C5"));
  assert.equal(M.canOpen(s, "maintenance"), false);
  prepareProof(s, "space");
  s.desk.drafts.space.sources = ["position"];
  assert.equal(
    M.transition(s, "desk-submit", { key: "space" }).document,
    "inventory",
  );
  s.desk.drafts.space.sources = ["inventory", "position", "booking"];
  assert.equal(
    M.transition(s, "desk-submit", { key: "space" }).error,
    "desk-source-unrelated",
  );
  prepareProof(s, "space", { use: "room" });
  assert.equal(
    M.transition(s, "desk-submit", { key: "space" }).error,
    "desk-room",
  );
  prepareProof(s, "space", { use: "occupied" });
  assert.equal(
    M.transition(s, "desk-submit", { key: "space" }).error,
    "desk-occupancy",
  );
  solveProof(s, "space");
  assert.ok(M.canOpen(s, "maintenance"));
});
test("sources remain reachable if the player follows space before reading the guest entry", () => {
  const s = booking();
  move(s, "inventory", { room: "318" });
  move(s, "inspect-service");
  solveProof(s, "space");
  move(s, "maintenance", { reference: "A-06-17" });
  prepareProof(s, "timeline");
  assert.equal(
    M.transition(s, "desk-submit", { key: "timeline" }).document,
    "key",
  );
  move(s, "message");
  move(s, "desk-submit", { key: "timeline" });
  assert.ok(s.completed.audit);
});
test("sorting is retained when record classification or the occupancy finding fails", () => {
  const s = toAudit();
  s.completed.audit = false;
  delete s.desk.results.timeline;
  s.desk.recordTypes.housekeeping = "system";
  assert.equal(
    M.transition(s, "desk-submit", { key: "timeline" }).error,
    "audit-record-type",
  );
  assert.equal(s.desk.orderConfirmed, true);
  s.desk.recordTypes.housekeeping = "observation";
  s.desk.drafts.timeline.values.assessment = "never";
  assert.equal(
    M.transition(s, "desk-submit", { key: "timeline" }).error,
    "audit-never",
  );
  assert.equal(copy(s).desk.orderConfirmed, true);
  s.desk.drafts.timeline.values.assessment = "insufficient";
  move(s, "desk-submit", { key: "timeline" });
  assert.ok(s.completed.audit);
});
test("revision differences alone cannot pass the identity review or open closure", () => {
  const s = toAudit();
  move(s, "revisions", { selection: ["owner", "location", "status"] });
  assert.equal(M.canOpen(s, "closure"), false);
  prepareProof(s, "identity");
  assert.equal(
    M.transition(s, "desk-submit", { key: "identity" }).document,
    "personnel",
  );
  move(s, "desk-discover", { route: "staff" });
  assert.equal(
    M.transition(s, "desk-submit", { key: "identity" }).document,
    "queue",
  );
  move(s, "queue");
  prepareProof(s, "identity", { role: "guest" });
  assert.equal(
    M.transition(s, "desk-submit", { key: "identity" }).error,
    "desk-role",
  );
  prepareProof(s, "identity", { attendance: "confirmed" });
  assert.equal(
    M.transition(s, "desk-submit", { key: "identity" }).error,
    "desk-attendance",
  );
  solveProof(s, "identity");
  assert.ok(M.canOpen(s, "closure"));
});
test("hints only advance on explicit action, are capped and persist; wrong answers preserve all records", () => {
  let s = toIdentity();
  const before = [...s.evidence];
  for (let i = 0; i < 7; i++) {
    s.desk.drafts.space.values.use = "room";
    M.transition(s, "desk-submit", { key: "space" });
  }
  assert.equal(s.desk.hints.space || 0, 0);
  for (let i = 0; i < 5; i++) move(s, "desk-hint", { key: "space" });
  s = copy(s);
  assert.equal(s.desk.hints.space, 3);
  assert.deepEqual(s.evidence, before);
  assert.ok(s.desk.results.space);
});
test("comparison, field marks, citations, independent drafts and last file survive reload", () => {
  let s = toAudit();
  move(s, "desk-ui", { op: "drop", document: "sample" });
  move(s, "desk-ui", { op: "compare", document: "position" });
  move(s, "desk-ui", { op: "mark", document: "position", field: "type" });
  move(s, "desk-ui", { op: "return", route: "maintenance?record=A-06-17" });
  s = copy(s);
  assert.deepEqual(s.desk.compare, ["booking", "position"]);
  assert.deepEqual(s.desk.marks.position, ["type"]);
  assert.equal(s.desk.returnTo, "maintenance?record=A-06-17");
  assert.ok(s.completed.audit);
});
test("footage cannot be acquired before both the circuit and cached frame are restored, then is immutable and reusable", () => {
  const s = ready();
  s.night.frame = false;
  assert.equal(M.transition(s, "desk-footage").ok, false);
  s.night.frame = true;
  s.night.orientations[0] = 0;
  assert.equal(M.transition(s, "desk-footage").ok, false);
  s.night.orientations[0] = 2;
  move(s, "desk-footage");
  assert.equal(s.desk.results.ROOM, undefined);
  const snapshot = JSON.stringify(s.desk.footage);
  move(s, "night-rotate", { node: 0 });
  move(s, "night-pan", { cam: 2, pan: 0 });
  assert.equal(JSON.stringify(copy(s).desk.footage), snapshot);
});
test("clicking all categories never confirms a review; each needs its own source-backed submission", () => {
  let s = ready();
  classification(s);
  for (const type of ["ROOM", "GUEST", "EMPLOYEE"])
    move(s, "void", { action: "classify", type });
  assert.equal(s.night.void.attempts.length, 0);
  assert.equal(
    M.transition(s, "void", { action: "disposition", mode: "retain" }).ok,
    false,
  );
  prepareProof(s, "ROOM");
  assert.equal(
    M.transition(s, "desk-submit", { key: "ROOM" }).document,
    "footage",
  );
  move(s, "desk-footage");
  move(s, "desk-submit", { key: "ROOM" });
  s = copy(s);
  assert.deepEqual(s.night.void.attempts, ["ROOM"]);
  assert.ok(s.desk.results.ROOM);
  assert.equal(s.night.void.classified, false);
  for (const key of ["GUEST", "EMPLOYEE"]) solveProof(s, key);
  assert.equal(s.night.void.classified, false);
  move(s, "void", { action: "disposition", mode: "retain" });
  move(s, "void", { action: "leave" });
  move(s, "night-lock");
  move(s, "ending", { ending: "released" });
  assert.equal(copy(s).lastEnding, "released");
});
test("all final choices preserve original ending IDs and physical release rules", () => {
  for (const mode of ["auto", "force", "retain"]) {
    const s = ready();
    move(s, "desk-footage");
    classification(s);
    for (const key of ["ROOM", "GUEST", "EMPLOYEE"]) solveProof(s, key);
    move(s, "void", { action: "disposition", mode, type: "ROOM" });
    assert.equal(s.night.void.disposition, mode);
    if (mode !== "retain") assert.equal(s.lastEnding, "auto-close");
    else {
      move(s, "void", { action: "leave" });
      move(s, "ending", { ending: "unverified" });
      assert.equal(s.lastEnding, "unverified");
      assert.equal(M.transition(s, "ending", { ending: "released" }).ok, false);
      move(s, "night-lock");
      move(s, "ending", { ending: "released" });
    }
    assert.ok(
      ["auto-close", "unverified", "released"].includes(copy(s).lastEnding),
    );
  }
});
test("legacy early, B-3, void and ending saves migrate without deleting progress or exposing unseen sources", () => {
  for (const kind of ["early", "b3", "void", "ended"]) {
    const s = kind === "early" ? toAudit() : ready();
    delete s.desk;
    if (kind === "void" || kind === "ended") {
      classification(s);
      delete s.night.void.reviewVersion;
      s.night.void.attempts = ["ROOM"];
    }
    if (kind === "ended") {
      s.endings = ["unverified"];
      s.lastEnding = "unverified";
    }
    const r = copy(s);
    assert.deepEqual(r.evidence, s.evidence);
    assert.equal(r.completed.audit, true);
    assert.ok(r.desk.results.timeline.legacy);
    assert.deepEqual(copy(r).endings, s.endings);
    if (kind !== "early") assert.ok(M.canOpen(r, "terminal"));
    if (kind === "void") assert.deepEqual(r.night.void.attempts, ["ROOM"]);
  }
  const s = booking();
  assert.equal(s.desk.discovered.includes("revision"), false);
  assert.ok(M.objective(s).directions.length <= 3);
});
test("all new sources, decisions and three-level hints have Chinese and English copy", () => {
  for (const doc of Object.values(D.documents)) {
    assert.equal(doc.title.length, 2);
    for (const row of doc.rows)
      for (const text of [...row.label, ...row.value])
        assert.equal(typeof text, "string");
  }
  for (const [key, spec] of Object.entries(D.proofs)) {
    assert.equal(D.hints[key].length, 3);
    for (const f of spec.fields)
      for (const o of f.options) {
        assert.equal(o.label.length, 2);
        assert.ok(o.label.every(Boolean));
      }
  }
});

test("all existing core interactions now have three manual, persistent hints without advancing a puzzle", () => {
  const s = fullCase();
  Object.assign(s.night, {
    started: true,
    spreadRequired: false,
    links: [0, 1],
    door: true,
    frame: true,
    orientations: [2, 1, 2, 0, 3, 0],
    isolated: true,
    manual: true,
    saved: true,
    operations: 6,
  });
  move(s, "promo-source", { version: "original" });
  move(s, "promo-mark", { target: "middle" });
  move(s, "void", { action: "enter" });
  s.night.void.step = 4;
  const before = {
    evidence: [...s.evidence],
    rotations: [...s.night.orientations],
    classified: s.night.void.classified,
  };
  for (const key of [
    "booking",
    "inventory",
    "maintenance",
    "revisions",
    "cameras",
    "wiring",
    "void-corridor",
    "void-fragments",
    "promo",
  ]) {
    assert.equal(D.hints[key].length, 3);
    assert.equal(s.desk.hints[key] || 0, 0);
    for (let i = 0; i < 3; i++) move(s, "desk-hint", { key });
    assert.equal(copy(s).desk.hints[key], 3);
  }
  assert.deepEqual(s.evidence, before.evidence);
  assert.deepEqual(s.night.orientations, before.rotations);
  assert.equal(s.night.void.classified, before.classified);
});
test("a retained timeline judgment uses its submitted types even if a later draft differs, across repeated reloads", () => {
  let s = toAudit();
  s.desk.recordTypes.housekeeping = "system";
  s.drafts.auditOrder = [...D.auditInitial];
  for (let i = 0; i < 3; i++) {
    s = copy(s);
    assert.ok(s.desk.results.timeline);
    assert.equal(
      s.desk.results.timeline.recordTypes.housekeeping,
      "observation",
    );
    assert.equal(s.completed.audit, true);
  }
});
