/* The only V2 progression model. Views never grant access by counting clicks. */
globalThis.StillwaterCaseState = (() => {
  const D = globalThis.StillwaterCaseData,
    F = D.facts;
  const routes = {
    forum: null,
    careers: null,
    hotel: null,
    rooms: null,
    reservations: null,
    guestbook: null,
    history: null,
    contact: null,
    notices: null,
    notes: null,
    credits: null,
    "floor-plan": "C4",
    maintenance: "C5",
    "night-audit": "C6",
    staff: "audit",
    revisions: "audit",
    closure: "C7",
    mara: "C8",
    review: "C9",
    ending: "finalEvidence",
  };
  const fresh = () => ({
    schema: 2,
    evidence: [],
    completed: { serviceInspected: false, audit: false, finalEvidence: false },
    drafts: {
      reservation: "",
      maintenance: "",
      auditOrder: [...D.auditInitial],
      auditAssessment: "",
      revisionSelection: [],
      finalSelection: [],
      photoVersion: "original",
    },
    endings: [],
    lastEnding: "",
    notices: { shown: false, dismissed: false },
    queueRefreshed: false,
    effectSeen: false,
    preferences: {
      sound: false,
      volume: 0.2,
      reduceMotion: false,
      skipScares: true,
    },
  });
  const has = (state, id) => state.evidence.includes(id);
  const met = (state, requirement) =>
    !requirement ||
    requirement === "public" ||
    has(state, requirement) ||
    state.completed[requirement] === true;
  const canRecord = (state, id) =>
    !!D.clues[id] && met(state, D.clues[id].unlockedAt);
  function record(state, id) {
    if (!canRecord(state, id)) return false;
    if (!has(state, id)) state.evidence.push(id);
    return true;
  }
  const canOpen = (state, route) =>
    Object.hasOwn(routes, route) &&
    ((route === "ending" && state.endings.length > 0) ||
      met(state, routes[route]));
  function recovery(state, route) {
    if (!has(state, "C1")) return "careers";
    for (const id of Object.keys(D.clues)) {
      if (has(state, id)) continue;
      if (id === "C7" && !state.completed.audit) return "night-audit";
      return D.clues[id].route;
    }
    return "review";
  }

  function hydrate(raw) {
    const state = fresh();
    if (!raw || raw.schema !== 2) return state;
    const wanted = new Set(Array.isArray(raw.evidence) ? raw.evidence : []);
    for (const id of Object.keys(D.clues)) {
      if (id === "C7")
        state.completed.audit =
          raw.completed?.audit === true && has(state, "C6");
      if (wanted.has(id)) record(state, id);
    }
    state.completed.audit = raw.completed?.audit === true && has(state, "C6");
    state.completed.serviceInspected =
      raw.completed?.serviceInspected === true && has(state, "C4");
    state.completed.finalEvidence =
      raw.completed?.finalEvidence === true &&
      Object.keys(D.clues).every((id) => has(state, id));
    const draft = raw.drafts || {};
    for (const key of ["reservation", "maintenance"])
      state.drafts[key] =
        typeof draft[key] === "string" ? draft[key].slice(0, 32) : "";
    const order = Array.isArray(draft.auditOrder) ? draft.auditOrder : [];
    if (
      order.length === D.audit.length &&
      new Set(order).size === order.length &&
      order.every((id) => D.audit.some((e) => e.id === id))
    )
      state.drafts.auditOrder = [...order];
    state.drafts.auditAssessment = [
      "",
      "confirmed",
      "insufficient",
      "other-room",
    ].includes(draft.auditAssessment)
      ? draft.auditAssessment
      : "";
    for (const [key, registry] of [
      ["revisionSelection", D.revisions],
      ["finalSelection", D.finalClaims],
    ]) {
      state.drafts[key] = Array.isArray(draft[key])
        ? [
            ...new Set(
              draft[key].filter((id) => registry.some((row) => row.id === id)),
            ),
          ]
        : [];
    }
    state.drafts.photoVersion = ["original", "revision"].includes(
      draft.photoVersion,
    )
      ? draft.photoVersion
      : "original";
    const ends = ["auto-close", "unverified"];
    state.endings =
      state.completed.audit &&
      Object.keys(D.clues).every((id) => has(state, id)) &&
      Array.isArray(raw.endings)
        ? ends.filter((id) => raw.endings.includes(id))
        : [];
    state.lastEnding = state.endings.includes(raw.lastEnding)
      ? raw.lastEnding
      : "";
    state.notices = {
      shown: raw.notices?.shown === true,
      dismissed: raw.notices?.dismissed === true,
    };
    state.queueRefreshed = raw.queueRefreshed === true && has(state, "C7");
    state.effectSeen = raw.effectSeen === true;
    const pref = raw.preferences || {};
    state.preferences = {
      sound: false,
      volume: Number.isFinite(pref.volume)
        ? Math.max(0, Math.min(0.5, pref.volume))
        : 0.2,
      reduceMotion: pref.reduceMotion === true,
      skipScares: pref.skipScares !== false,
    };
    return state;
  }
  const ok = () => ({ ok: true });
  const fail = (error) => ({ ok: false, error });
  function transition(state, action, payload = {}) {
    switch (action) {
      case "sample":
        record(state, "C1");
        return ok();
      case "reservation":
        if (!has(state, "C1")) return fail("sample");
        if (String(payload.reference).trim().toUpperCase() !== F.reservation)
          return fail("reservation");
        record(state, "C2");
        return ok();
      case "inventory":
        if (!has(state, "C2")) return fail("booking");
        if (
          payload.room !== F.bookedRoom ||
          !D.inventory.includes(payload.room)
        )
          return fail("inventory");
        record(state, "C3");
        return ok();
      case "message":
        if (!record(state, "C4")) return fail("inventory-first");
        return ok();
      case "inspect-service":
        if (!has(state, "C4")) return fail("message-first");
        state.completed.serviceInspected = true;
        return ok();
      case "classify-service":
        if (!has(state, "C4") || !state.completed.serviceInspected)
          return fail("inspect-first");
        if (payload.classification !== "service") return fail("classification");
        record(state, "C5");
        return ok();
      case "maintenance":
        if (!has(state, "C5")) return fail("service-first");
        if (String(payload.reference).trim().toUpperCase() !== F.notice)
          return fail("maintenance");
        record(state, "C6");
        return ok();
      case "audit":
        if (!has(state, "C6")) return fail("maintenance-first");
        if (
          !Array.isArray(payload.order) ||
          payload.order.join("|") !== D.audit.map((row) => row.id).join("|")
        )
          return fail("audit-order");
        if (payload.assessment !== "insufficient")
          return fail("audit-assessment");
        state.completed.audit = true;
        return ok();
      case "revisions": {
        if (!state.completed.audit) return fail("audit-first");
        const selected = new Set(payload.selection || []),
          expected = D.revisions.filter((r) => r.changed).map((r) => r.id);
        if ([...selected].some((id) => !expected.includes(id)))
          return fail("revision-unchanged");
        if (expected.some((id) => !selected.has(id)))
          return fail("revision-missing");
        record(state, "C7");
        return ok();
      }
      case "closure":
        if (!record(state, "C8")) return fail("revisions-first");
        return ok();
      case "mara":
        if (!record(state, "C9")) return fail("closure-first");
        return ok();
      case "evidence": {
        if (
          !Object.keys(D.clues).every((id) => has(state, id)) ||
          !state.completed.audit
        )
          return fail("evidence-incomplete");
        const selected = new Set(payload.selection || []),
          expected = D.finalClaims.filter((c) => c.correct).map((c) => c.id);
        if (selected.has("occupancy")) return fail("evidence-occupancy");
        if (selected.has("operating")) return fail("evidence-operating");
        if (selected.has("consent")) return fail("evidence-consent");
        if (
          selected.size !== expected.length ||
          expected.some((id) => !selected.has(id))
        )
          return fail("evidence-missing");
        state.completed.finalEvidence = true;
        return ok();
      }
      case "edit-evidence":
        state.completed.finalEvidence = false;
        return ok();
      case "ending":
        if (
          !state.completed.finalEvidence ||
          !Object.keys(D.clues).every((id) => has(state, id))
        )
          return fail("evidence-incomplete");
        if (!["auto-close", "unverified"].includes(payload.ending))
          return fail("ending");
        state.lastEnding = payload.ending;
        if (!state.endings.includes(payload.ending))
          state.endings.push(payload.ending);
        return ok();
      case "queue":
        if (!has(state, "C7")) return fail("revisions-first");
        state.queueRefreshed = true;
        return ok();
      default:
        return fail("unknown");
    }
  }
  return Object.freeze({
    fresh,
    hydrate,
    has,
    canOpen,
    recovery,
    transition,
    routes,
  });
})();
