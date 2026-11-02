import { test } from "node:test";
import assert from "node:assert/strict";
import "../case-data.js";
import "../case-night-model.js";
import "../case-state.js";
const D = globalThis.StillwaterCaseData,
  M = globalThis.StillwaterCaseState,
  F = D.facts;
function throughAudit() {
  const s = M.fresh();
  for (const [a, p] of [
    ["sample", {}],
    ["reservation", { reference: F.reservation }],
    ["inventory", { room: F.bookedRoom }],
    ["message", {}],
    ["inspect-service", {}],
    ["classify-service", { classification: "service" }],
    ["maintenance", { reference: F.notice }],
    ["audit", { order: D.audit.map((e) => e.id), assessment: "insufficient" }],
  ])
    assert.equal(M.transition(s, a, p).ok, true, a);
  return s;
}
test("every necessary clue has an actual source, dependency and downstream use", () => {
  assert.equal(Object.keys(D.clues).length, 9);
  for (const c of Object.values(D.clues)) {
    assert.ok(c.source);
    assert.ok(c.unlockedAt);
    assert.ok(c.usedFor.length);
    assert.ok(Object.hasOwn(M.routes, c.route));
  }
});
test("a guessed final answer and a premature deep link cannot bypass the case", () => {
  const s = M.fresh();
  assert.equal(M.canOpen(s, "staff"), false);
  assert.equal(M.canOpen(s, "review"), false);
  assert.equal(M.transition(s, "ending", { ending: "unverified" }).ok, false);
  assert.equal(
    M.transition(s, "reservation", { reference: F.reservation }).ok,
    false,
  );
  assert.deepEqual(s.evidence, []);
});
test("incorrect classification, timeline and assessment leave a recoverable case", () => {
  const s = throughAudit();
  s.completed.audit = false;
  assert.equal(
    M.transition(s, "audit", {
      order: D.auditInitial,
      assessment: "insufficient",
    }).error,
    "audit-order",
  );
  assert.equal(
    M.transition(s, "audit", {
      order: D.audit.map((e) => e.id),
      assessment: "confirmed",
    }).error,
    "audit-assessment",
  );
  assert.equal(
    M.transition(s, "audit", {
      order: D.audit.map((e) => e.id),
      assessment: "insufficient",
    }).ok,
    true,
  );
  assert.equal(M.canOpen(s, "staff"), true);
});
test("revision comparison checks both missing differences and unchanged rows", () => {
  const s = throughAudit();
  assert.equal(
    M.transition(s, "revisions", { selection: ["status"] }).error,
    "revision-missing",
  );
  assert.equal(
    M.transition(s, "revisions", { selection: D.revisions.map((r) => r.id) })
      .error,
    "revision-unchanged",
  );
  assert.equal(
    M.transition(s, "revisions", {
      selection: D.revisions.filter((r) => r.changed).map((r) => r.id),
    }).ok,
    true,
  );
  assert.equal(M.canOpen(s, "closure"), true);
});
test("the same verified evidence supports two replayable endings and survives reload", () => {
  let s = throughAudit();
  for (const [a, p] of [
    [
      "revisions",
      { selection: D.revisions.filter((r) => r.changed).map((r) => r.id) },
    ],
    ["closure", {}],
    ["mara", {}],
    [
      "evidence",
      { selection: D.finalClaims.filter((r) => r.correct).map((r) => r.id) },
    ],
    ["night-start", {}],
    ["night-pan", {cam:0,pan:2}],
    ["night-pan", {cam:1,pan:0}],
    ["night-link", {link:0}],
    ["night-pan", {cam:1,pan:2}],
    ["night-pan", {cam:2,pan:0}],
    ["night-link", {link:1}],
    ["night-pan", {cam:2,pan:2}],
    ["night-door", {}],
    ["night-frame", {}],
    ["night-rotate", {node:0}],
    ["ending", { ending: "auto-close" }],
    ["ending", { ending: "unverified" }],
  ])
    assert.equal(M.transition(s, a, p).ok, true, a);
  s.drafts.auditOrder = ["housekeeping", "transfer", "message", "draft"];
  s = M.hydrate(JSON.parse(JSON.stringify(s)));
  assert.equal(s.evidence.length, 9);
  assert.equal(s.completed.finalEvidence, true);
  assert.deepEqual(s.endings, ["auto-close", "unverified"]);
  assert.equal(s.preferences.sound, false);
  assert.deepEqual(s.drafts.auditOrder, [
    "housekeeping",
    "transfer",
    "message",
    "draft",
  ]);
});
test("invalid saves are sanitized without affecting the previous edition", () => {
  assert.deepEqual(M.hydrate({ schema: 55 }), M.fresh());
  const s = M.hydrate({
    schema: 2,
    evidence: ["C9", "C7", "C2", "bogus"],
    completed: { audit: true, finalEvidence: true },
    endings: ["unverified"],
    drafts: { auditOrder: ["draft", "draft"] },
  });
  assert.deepEqual(s.evidence, []);
  assert.deepEqual(s.endings, []);
  assert.deepEqual(s.drafts.auditOrder, D.auditInitial);
});
test("editing a current conclusion invalidates new sign-off without erasing historical dispositions", () => {
  const s = throughAudit();
  M.transition(s, "revisions", { selection: ["owner", "location", "status"] });
  M.transition(s, "closure");
  M.transition(s, "mara");
  M.transition(s, "evidence", {
    selection: ["service", "reviewer", "revision"],
  });
  // A pre-4.3 saved disposition remains viewable after current findings change.
  s.endings=["unverified"];s.lastEnding="unverified";
  M.transition(s, "edit-evidence");
  assert.equal(M.transition(s, "ending", { ending: "auto-close" }).ok, false);
  const restored = M.hydrate(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(restored.endings, ["unverified"]);
  assert.equal(M.canOpen(restored, "ending"), true);
  assert.equal(restored.completed.finalEvidence, false);
});
test("all early wrong classifications reject without advancing evidence and remain correctable", () => {
  const s = M.fresh();
  M.transition(s, "sample");
  assert.equal(
    M.transition(s, "reservation", { reference: "R-wrong" }).ok,
    false,
  );
  M.transition(s, "reservation", { reference: F.reservation });
  assert.equal(
    M.transition(s, "inventory", {
      room: D.inventory.find((n) => n !== F.bookedRoom),
    }).ok,
    false,
  );
  assert.equal(s.evidence.includes("C3"), false);
  M.transition(s, "inventory", { room: F.bookedRoom });
  M.transition(s, "message");
  M.transition(s, "inspect-service");
  for (const classification of ["guest", "typo"])
    assert.equal(
      M.transition(s, "classify-service", { classification }).ok,
      false,
    );
  assert.equal(s.evidence.includes("C5"), false);
  M.transition(s, "classify-service", { classification: "service" });
  assert.equal(
    M.transition(s, "maintenance", { reference: "A-wrong" }).ok,
    false,
  );
  M.transition(s, "maintenance", { reference: F.notice });
  for (const assessment of ["confirmed", "other-room"])
    assert.equal(
      M.transition(s, "audit", { order: D.audit.map((r) => r.id), assessment })
        .ok,
      false,
    );
  assert.equal(s.completed.audit, false);
  assert.equal(
    M.transition(s, "audit", {
      order: D.audit.map((r) => r.id),
      assessment: "insufficient",
    }).ok,
    true,
  );
});
