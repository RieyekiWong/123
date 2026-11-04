import { test } from "node:test";
import assert from "node:assert/strict";
import "../case-data.js";
import "../case-void-model.js";
import "../case-night-model.js";
import "../case-state.js";
const D = globalThis.StillwaterCaseData,
  M = globalThis.StillwaterCaseState,
  F = D.facts;
import {toAudit,prepareProof,solveProof,fullCase} from './v2-evidence-model-helpers.mjs';
const throughAudit=toAudit;
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
test("incorrect order and record findings leave a recoverable case", () => {
  const s=throughAudit();s.completed.audit=false;delete s.desk.results.timeline;
  assert.equal(M.transition(s,'audit-order',{order:D.auditInitial}).error,'audit-order');
  s.desk.drafts.timeline.values.assessment='confirmed';
  assert.equal(M.transition(s,'audit').error,'audit-assessment');
  s.desk.drafts.timeline.values.assessment='insufficient';
  assert.equal(M.transition(s,'audit').ok,true);
  assert.equal(M.canOpen(s,'staff'),true);
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
  assert.equal(M.canOpen(s, "closure"), false);
  M.transition(s,'desk-discover',{route:'staff'});M.transition(s,'queue');solveProof(s,'identity');
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
    ["night-observe-public", { page: "rooms" }],
    ["night-observe-public", { page: "guestbook" }],
    ["night-pan", { cam: 0, pan: 2 }],
    ["night-pan", { cam: 1, pan: 0 }],
    ["night-link", { link: 0 }],
    ["night-pan", { cam: 1, pan: 2 }],
    ["night-pan", { cam: 2, pan: 0 }],
    ["night-link", { link: 1 }],
    ["night-pan", { cam: 2, pan: 2 }],
    ["night-door", {}],
    ["night-walk", { position: "west" }],
    ["night-inspect", { target: "cart" }],
    ["night-inspect", { target: "cabinet" }],
    ["night-inspect", { target: "power" }],
    ["night-walk", { position: "service" }],
    ["night-inspect", { target: "enter" }],
    ["night-frame", {}],
    ["night-rotate", { node: 0 }],
    ["ending", { ending: "auto-close" }],
    ["ending", { ending: "unverified" }],
  ]) {
    if(a==='closure'){M.transition(s,'desk-discover',{route:'staff'});M.transition(s,'queue');solveProof(s,'identity');}
    assert.equal(M.transition(s,a,p).ok,true,a);
  }
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
  M.transition(s,'desk-discover',{route:'staff'});M.transition(s,'queue');solveProof(s,'identity');
  M.transition(s, "closure");
  M.transition(s, "mara");
  M.transition(s, "evidence", {
    selection: ["service", "reviewer", "revision"],
  });
  // A pre-4.3 saved disposition remains viewable after current findings change.
  s.endings = ["unverified"];
  s.lastEnding = "unverified";
  M.transition(s, "edit-evidence");
  assert.equal(M.transition(s, "ending", { ending: "auto-close" }).ok, false);
  const restored = M.hydrate(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(restored.endings, ["unverified"]);
  assert.equal(M.canOpen(restored, "ending"), true);
  assert.equal(restored.completed.finalEvidence, false);
});
test("all early wrong classifications reject without advancing judgments and remain correctable", () => {
 const s=M.fresh();M.transition(s,'sample');assert.equal(M.transition(s,'reservation',{reference:'R-wrong'}).ok,false);
 M.transition(s,'reservation',{reference:F.reservation});assert.equal(M.transition(s,'inventory',{room:'301'}).ok,false);assert.equal(s.evidence.includes('C3'),false);
 solveProof(s,'intake');M.transition(s,'inventory',{room:F.bookedRoom});M.transition(s,'message');M.transition(s,'inspect-service');
 assert.equal(s.evidence.includes('C5'),true);assert.equal(s.desk.results.space,undefined);
 for(const use of ['room','occupied']){prepareProof(s,'space',{use});assert.equal(M.transition(s,'desk-submit',{key:'space'}).ok,false);}
 solveProof(s,'space');assert.equal(M.transition(s,'maintenance',{reference:'A-wrong'}).ok,false);M.transition(s,'maintenance',{reference:F.notice});
 for(const assessment of ['confirmed','never']){prepareProof(s,'timeline',{assessment});assert.equal(M.transition(s,'desk-submit',{key:'timeline'}).ok,false);}
 assert.equal(s.completed.audit,false);solveProof(s,'timeline');assert.equal(s.completed.audit,true);
});

test("faces default to on; explicit player skip and reduced-motion preferences survive hydration", () => {
  assert.equal(M.fresh().preferences.skipScares, false);
  assert.equal(M.hydrate({ schema: 2 }).preferences.skipScares, false);
  const oldAutomatic = M.hydrate({
    schema: 2,
    preferences: { skipScares: true, reduceMotion: true },
  });
  assert.equal(oldAutomatic.preferences.skipScares, false);
  assert.equal(oldAutomatic.preferences.reduceMotion, true);
  const explicit = M.hydrate({
    schema: 2,
    preferences: { skipScares: true, scareChoiceMade: true },
  });
  assert.equal(explicit.preferences.skipScares, true);
  assert.equal(explicit.preferences.scareChoiceMade, true);
  const legacyChoice = M.hydrate({
    schema: 2,
    night: { comfortAcknowledged: true },
    preferences: { skipScares: true },
  });
  assert.equal(legacyChoice.preferences.skipScares, true);
});
