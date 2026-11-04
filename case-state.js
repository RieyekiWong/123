/* The only V2 progression model. Views never grant access by counting clicks. */
globalThis.StillwaterCaseState = (() => {
  const D = globalThis.StillwaterCaseData,
    F = D.facts;
  const freshPromo = () => ({ schema: 1, selected: "", marked: "", verified: false, echoSeen: false, legacy: false });
  const promoChecked = (state) => state.promo.verified || state.promo.legacy;
  const routes = {
    chat: null,
    forum: null,
    careers: null,
    hotel: null,
    gallery: null,
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
    ending: "historicalEnding",
    mirror: "finalEvidence",
    cameras: "mirrorStarted",
    "service-passage": "serviceDoor",
    terminal: "passageComplete",
    void: "unlistedReady",
  };
  const fresh = () => ({
    schema: 2,
    night: globalThis.StillwaterNightModel.fresh(),
    promo: freshPromo(),
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
      breathing: false,
      volume: 0.2,
      reduceMotion: false,
      skipScares: false,
      scareChoiceMade: false,
    },
  });
  const has = (state, id) => state.evidence.includes(id);
  const met = (state, requirement) =>
    !requirement ||
    requirement === "public" ||
    has(state, requirement) ||
    state.completed[requirement] === true ||
    (requirement === "mirrorStarted" &&
      state.night.started &&
      globalThis.StillwaterNightModel.spreadReady(state.night)) ||
    (requirement === "serviceDoor" && state.night.door) ||
    (requirement === "passageComplete" &&
      globalThis.StillwaterNightModel.passageReady(state.night)) ||
    (requirement === "unlistedReady" &&
      promoChecked(state) &&
      globalThis.StillwaterVoidModel.gate(state.night));
  const canRecord = (state, id) =>
    !!D.clues[id] && met(state, D.clues[id].unlockedAt);
  function record(state, id) {
    if (!canRecord(state, id)) return false;
    if (!has(state, id)) state.evidence.push(id);
    return true;
  }
  const canOpen = (state, route) =>
    Object.hasOwn(routes, route) &&
    (!["mirror", "cameras", "service-passage", "terminal", "void"].includes(route) ||
      state.completed.finalEvidence) &&
    ((route === "ending" && state.endings.length > 0) ||
      met(state, routes[route]));
  function recovery(state, route) {
    if (!has(state, "C1")) return "careers";
    for (const id of Object.keys(D.clues)) {
      if (has(state, id)) continue;
      if (id === "C7" && !state.completed.audit) return "night-audit";
      return D.clues[id].route;
    }
    if (!state.completed.finalEvidence) return "review";
    if (
      state.night.started &&
      !globalThis.StillwaterNightModel.spreadReady(state.night)
    )
      return !state.night.spread.rooms ? "rooms" : "guestbook";
    if (
      state.night.door &&
      !globalThis.StillwaterNightModel.passageReady(state.night)
    )
      return "service-passage";
    return state.night.started
      ? state.night.door
        ? "terminal"
        : "cameras"
      : "review";
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
    state.night = globalThis.StillwaterNightModel.hydrate(
      raw.night,
      state.completed.finalEvidence ||
        (state.completed.audit && has(state, "C9")),
    );
    const ends = [
      "auto-close",
      "unverified",
      ...(state.night.released ? ["released"] : []),
    ];
    state.endings =
      state.completed.audit &&
      Object.keys(D.clues).every((id) => has(state, id)) &&
      Array.isArray(raw.endings)
        ? ends.filter((id) => raw.endings.includes(id))
        : [];
    if (!Object.hasOwn(raw.night || {}, "void") &&
        (state.night.locked || state.endings.length))
      state.night.void.legacy = true;
    state.lastEnding = state.endings.includes(raw.lastEnding)
      ? raw.lastEnding
      : "";
    // Existing third-chapter and completed saves keep their access. A mere
    // pre-chapter wiring save still has the new source check available in B-3.
    const oldDeepSave = state.night.void.entered || state.night.void.legacy ||
      state.night.locked || state.endings.length > 0;
    const promo = raw.promo?.schema === 1 ? raw.promo : null;
    state.promo = freshPromo();
    state.promo.legacy = oldDeepSave && (!promo || promo.legacy === true);
    if (promo) {
      state.promo.selected = ["original", "synced", "preview"].includes(promo.selected) ? promo.selected : "";
      state.promo.marked = ["left", "middle", "right", "lamp"].includes(promo.marked) ? promo.marked : "";
      state.promo.verified = promo.verified === true && state.promo.selected === "original" && state.promo.marked === "middle";
      state.promo.echoSeen = state.promo.verified && promo.echoSeen === true;
    }
    state.notices = {
      shown: raw.notices?.shown === true,
      dismissed: raw.notices?.dismissed === true,
    };
    state.queueRefreshed = raw.queueRefreshed === true && has(state, "C7");
    state.effectSeen = raw.effectSeen === true;
    const pref = raw.preferences || {};
    // Earlier releases saved "skip" automatically. Only an actual player
    // choice should override the new default; keep Reduce Motion independent.
    const scareChoiceMade =
      pref.scareChoiceMade === true || raw.night?.comfortAcknowledged === true;
    // Effects skipped by the former automatic default were never seen. Re-arm
    // only their visual triggers; preserve every clue, mechanism and ending.
    if (pref.skipScares === true && !scareChoiceMade) {
      state.night.events = state.night.events.filter(
        (id) => !["photo-face", "cabinet-face", "last-frame"].includes(id),
      );
      state.night.lastFaceStep = -100;
    }
    state.preferences = {
      sound: false,
      breathing: pref.breathing === true,
      volume: Number.isFinite(pref.volume)
        ? Math.max(0, Math.min(0.5, pref.volume))
        : 0.2,
      reduceMotion: pref.reduceMotion === true,
      skipScares: scareChoiceMade && pref.skipScares === true,
      scareChoiceMade,
    };
    return state;
  }
  const ok = () => ({ ok: true });
  const fail = (error) => ({ ok: false, error });
  function transition(state, action, payload = {}) {
    if (action === "void") {
      if (!state.completed.finalEvidence || !promoChecked(state) || !globalThis.StillwaterVoidModel.gate(state.night))
        return fail("void-entry");
      return globalThis.StillwaterVoidModel.transition(state.night.void, payload.action, payload);
    }
    if (action === "promo-source" || action === "promo-mark") {
      if (!state.completed.finalEvidence || !globalThis.StillwaterVoidModel.ready(state.night))
        return fail("promo-not-ready");
      if (state.promo.verified) return ok();
      if (action === "promo-source") {
        if (!["original", "synced", "preview"].includes(payload.version)) return fail("promo-source");
        state.promo.selected = payload.version;
        state.promo.marked = "";
        return payload.version === "original" ? ok() : fail("promo-source");
      }
      if (state.promo.selected !== "original") return fail("promo-source");
      if (!["left", "middle", "right", "lamp"].includes(payload.target)) return fail("promo-unchanged");
      state.promo.marked = payload.target;
      if (payload.target !== "middle") return fail("promo-unchanged");
      state.promo.verified = true;
      const first = !state.promo.echoSeen;
      state.promo.echoSeen = true;
      return { ok: true, ...(first ? { event: "promo-source-echo" } : {}) };
    }
    if (action.startsWith("night-") && !state.completed.finalEvidence)
      return fail("evidence-incomplete");
    const N = globalThis.StillwaterNightModel,
      n = state.night;
    if (
      action.startsWith("night-") &&
      !["night-start", "night-observe-public", "night-comfort"].includes(action)
    ) {
      if (!n.started || !N.spreadReady(n)) return fail("night-spread");
      n.steps++;
    }
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
      case "night-start":
        if (!state.completed.finalEvidence) return fail("evidence-incomplete");
        if (!n.started) n.spreadRequired = true;
        state.night.started = true;
        return ok();
      case "night-observe-public":
        if (!n.started || !["rooms", "guestbook"].includes(payload.page))
          return fail("night-access");
        n.spread[payload.page] = true;
        return ok();
      case "night-comfort":
        if (!n.started || typeof payload.enable !== "boolean")
          return fail("night-access");
        state.preferences.skipScares = !payload.enable;
        state.preferences.scareChoiceMade = true;
        n.comfortAcknowledged = true;
        return ok();
      case "night-walk":
        if (
          !n.door ||
          !["landing", "west", "service"].includes(payload.position)
        )
          return fail("night-access");
        n.passage.position = payload.position;
        if (
          payload.position === "landing" &&
          n.passage.inspected.includes("photo")
        )
          return N.event(n, "hall-silhouette");
        return ok();
      case "night-inspect": {
        const p = n.passage,
          id = payload.target;
        if (
          !n.door ||
          ![
            "plate",
            "peephole",
            "photo",
            "notice",
            "cart",
            "cabinet",
            "power",
            "enter",
          ].includes(id)
        )
          return fail("night-access");
        if (
          ["plate", "peephole", "photo"].includes(id) &&
          p.position !== "landing"
        )
          return fail("night-access");
        if (["cart", "cabinet", "power"].includes(id) && p.position !== "west")
          return fail("night-access");
        if (id === "enter" && p.position !== "service")
          return fail("night-access");
        if (
          ["plate", "peephole", "photo", "notice"].includes(id) &&
          !p.inspected.includes(id)
        )
          p.inspected.push(id);
        if (id === "plate") return N.event(n, "plate-open-door");
        if (id === "peephole") return N.event(n, "peephole-empty");
        if (id === "photo") return N.event(n, "photo-face", true);
        if (id === "cart") p.cartMoved = true;
        if (id === "cabinet") {
          if (!p.cartMoved) return fail("night-cart");
          p.cabinetOpen = true;
          return N.event(n, "cabinet-face", true);
        }
        if (id === "power") {
          if (!p.cabinetOpen) return fail("night-cabinet");
          p.servicePower = true;
        }
        if (id === "enter") {
          if (!p.servicePower) return fail("night-power");
          p.complete = true;
        }
        return ok();
      }
      case "night-pan": {
        if (
          !state.night.started ||
          ![0, 1, 2].includes(payload.cam) ||
          ![0, 1, 2].includes(payload.pan)
        )
          return fail("night-access");
        const previous = state.night.pans[payload.cam];
        state.night.pans[payload.cam] = payload.pan;
        if (
          payload.cam === 1 &&
          payload.pan === 1 &&
          previous !== 1 &&
          n.links.includes(0)
        )
          return N.event(n, "hall-silhouette");
        return ok();
      }
      case "night-link": {
        const i = payload.link,
          n = state.night,
          N = globalThis.StillwaterNightModel;
        if (!n.started || ![0, 1].includes(i)) return fail("night-access");
        const left = N.anchor(i, n.pans[i]),
          right = N.anchor(i + 1, n.pans[i + 1]);
        if (!left || left !== right) return fail("night-landmark");
        if (!n.links.includes(i)) n.links.push(i);
        return ok();
      }
      case "night-door":
        if (state.night.links.length !== 2 || state.night.pans[2] !== 2)
          return fail("night-door");
        if (!n.door) n.passageRequired = true;
        state.night.door = true;
        return ok();
      case "night-frame":
        if (!N.passageReady(n)) return fail("night-access");
        state.night.frame = true;
        return N.event(n, "last-frame", true);
      case "night-rotate":
      case "night-isolate":
      case "night-manual":
      case "night-reset":
      case "night-undo": {
        const n = state.night;
        if (!N.passageReady(n)) return fail("night-access");
        if (
          action === "night-rotate" &&
          ![0, 1, 2, 3, 4, 5].includes(payload.node)
        )
          return fail("night-access");
        const snapshot = () => ({
          orientations: [...n.orientations],
          isolated: n.isolated,
          manual: n.manual,
        });
        if (action === "night-undo") {
          const previous = n.undo.pop();
          if (previous) Object.assign(n, previous);
        } else {
          n.undo.push(snapshot());
          if (n.undo.length > 30) n.undo.shift();
          if (action === "night-rotate")
            n.orientations[payload.node] =
              (n.orientations[payload.node] + 1) % 4;
          if (action === "night-isolate") n.isolated = !n.isolated;
          if (action === "night-manual") n.manual = !n.manual;
          if (action === "night-reset")
            Object.assign(n, snapshot(), {
              orientations:
                globalThis.StillwaterNightModel.fresh().orientations,
              isolated: false,
              manual: false,
            });
        }
        n.operations++;
        n.saved = false;
        n.locked = false;
        return ok();
      }
      case "night-save":
        if (
          !N.passageReady(n) ||
          !globalThis.StillwaterNightModel.circuit(state.night).valid
        )
          return fail("night-circuit");
        state.night.saved = true;
        return ok();
      case "night-lock":
        if (
          !N.passageReady(n) ||
          !state.night.saved ||
          !state.night.frame ||
          !globalThis.StillwaterNightModel.circuit(state.night).valid
        )
          return fail("night-circuit");
        if (!globalThis.StillwaterVoidModel.finished(n)) return fail("void-first");
        state.night.locked = true;
        return ok();
      case "ending":
        if (
          !state.completed.finalEvidence ||
          !Object.keys(D.clues).every((id) => has(state, id))
        )
          return fail("evidence-incomplete");
        if (!N.passageReady(n) || !state.night.frame || !state.night.operations)
          return fail("night-access");
        if (payload.ending === "released" && (!state.night.locked || !globalThis.StillwaterVoidModel.finished(n)))
          return fail("night-circuit");
        if (!["auto-close", "unverified", "released"].includes(payload.ending))
          return fail("ending");
        if (payload.ending === "released") state.night.released = true;
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
    promoChecked,
    recovery,
    transition,
    routes,
  });
})();
