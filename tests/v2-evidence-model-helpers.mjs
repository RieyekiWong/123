import assert from "node:assert/strict";
import "../case-data.js";
import "../case-void-model.js";
import "../case-night-model.js";
import "../case-state.js";
export const D = globalThis.StillwaterCaseData,
  M = globalThis.StillwaterCaseState;
export function move(s, a, p = {}) {
  const r = M.transition(s, a, p);
  assert.equal(r.ok, true, `${a}: ${r.error || ""}`);
  return r;
}
export function prepareProof(s, key, values = {}) {
  const spec = D.proofs[key];
  if (key === "intake")
    for (const document of ["sample", "booking"]) {
      move(s, "desk-ui", { op: "open", document });
      move(s, "desk-ui", { op: "compare", document });
    }
  s.desk.drafts[key] = {
    sources: [...spec.sources],
    values: {
      ...Object.fromEntries(spec.fields.map((f) => [f.id, f.answer])),
      ...values,
    },
  };
  if (key === "timeline") {
    move(s, "audit-order", { order: D.audit.map((r) => r.id) });
    for (const r of D.recordTypes)
      move(s, "desk-ui", { op: "type", key, field: r.id, value: r.answer });
  }
}
export function solveProof(s, key) {
  prepareProof(s, key);
  move(s, "desk-submit", { key });
}
export function booking() {
  const s = M.fresh();
  move(s, "sample");
  move(s, "reservation", { reference: D.facts.reservation });
  solveProof(s, "intake");
  return s;
}
export function toAudit() {
  const s = booking();
  move(s, "inventory", { room: "318" });
  move(s, "message");
  move(s, "inspect-service");
  solveProof(s, "space");
  move(s, "maintenance", { reference: "A-06-17" });
  solveProof(s, "timeline");
  return s;
}
export function toIdentity() {
  const s = toAudit();
  move(s, "desk-discover", { route: "staff" });
  move(s, "revisions", { selection: ["owner", "location", "status"] });
  move(s, "queue");
  solveProof(s, "identity");
  return s;
}
export function fullCase() {
  const s = toIdentity();
  move(s, "closure");
  move(s, "mara");
  move(s, "evidence", { confirmed: true });
  return s;
}
