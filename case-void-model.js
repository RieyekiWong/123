/* The unlisted chapter lives inside the existing schema-two night save. */
globalThis.StillwaterVoidModel = (() => {
  const names = ["entry", "corner", "doorway", "end"];
  const scenes = [
    {
      id: "entry",
      title: ["入口", "Entrance"],
      reference: ["left", "left", "right"],
      left: ["left", "left", "right"],
      right: ["left", "right", "right"],
    },
    {
      id: "corner",
      title: ["拐角", "Corner"],
      reference: ["right", "right", "left"],
      left: ["left", "right", "left"],
      right: ["right", "right", "left"],
    },
    {
      id: "doorway",
      title: ["门外", "Outside the door"],
      reference: ["left", "right", "left"],
      left: ["left", "right", "left"],
      right: ["left", "right", "right"],
    },
    {
      id: "end",
      title: ["尽头", "Far end"],
      reference: ["right", "left", "right"],
      left: ["right", "right", "left"],
      right: ["right", "left", "right"],
    },
  ];
  const initial = [
    [3, -2],
    [-3, 3],
    [3, 1],
  ];
  const slots = [
    { x: 20, y: 28, w: 220, h: 156 },
    { x: 240, y: 28, w: 220, h: 156 },
    { x: 20, y: 184, w: 440, h: 140 },
  ];
  const fresh = () => ({
    schema: 1,
    entered: false,
    enteredAt: 0,
    legacy: false,
    stage: "corridor",
    step: 0,
    visits: 0,
    shadow: false,
    observation: "",
    positions: initial.map((p) => [...p]),
    selected: 0,
    reviewed: false,
    attempts: [],
    reviewVersion: 1,
    reviews: {},
    activeCategory: "",
    disposition: "",
    forcedType: "",
    classified: false,
    complete: false,
    events: [],
  });
  const matches = (a, b) => a.every((v, i) => v === b[i]);
  const correct = (step) =>
    matches(scenes[step].left, scenes[step].reference) ? "left" : "right";
  const aligned = (v) =>
    v.positions
      .map((p, i) => (p[0] === 0 && p[1] === 0 ? i : -1))
      .filter((i) => i >= 0);
  const ready = (n) =>
    n.started &&
    n.frame &&
    n.saved &&
    globalThis.StillwaterNightModel.passageReady(n) &&
    globalThis.StillwaterNightModel.circuit(n).valid;
  const gate = (n) => n.void.entered || ready(n);
  const finished = (n) => n.void.complete || n.void.legacy;
  const fail = (error) => ({ ok: false, error });
  function hydrate(raw) {
    const v = fresh();
    if (!raw || raw.schema !== 1) return v;
    v.entered = raw.entered === true;
    v.enteredAt = Number.isFinite(raw.enteredAt)
      ? Math.max(0, raw.enteredAt)
      : 0;
    v.legacy = raw.legacy === true;
    v.step = Number.isInteger(raw.step)
      ? Math.max(0, Math.min(4, raw.step))
      : 0;
    v.visits = Math.max(0, Math.min(10000, Number(raw.visits) || 0));
    v.shadow = raw.shadow === true;
    v.observation = [
      "reference",
      "left",
      "right",
      "shadow",
      "loop",
      "joined",
      "ROOM",
      "GUEST",
      "EMPLOYEE",
    ].includes(raw.observation)
      ? raw.observation
      : "";
    v.positions = initial.map((p, i) =>
      p.map((x, j) =>
        Number.isInteger(raw.positions?.[i]?.[j])
          ? Math.max(-6, Math.min(6, raw.positions[i][j]))
          : x,
      ),
    );
    v.selected = [0, 1, 2].includes(raw.selected) ? raw.selected : 0;
    v.reviewed =
      v.step === 4 && aligned(v).length === 3 && raw.reviewed === true;
    v.activeCategory = ["ROOM", "GUEST", "EMPLOYEE"].includes(
      raw.activeCategory,
    )
      ? raw.activeCategory
      : "";
    v.disposition = ["force", "auto", "retain"].includes(raw.disposition)
      ? raw.disposition
      : "";
    v.forcedType = ["ROOM", "GUEST", "EMPLOYEE"].includes(raw.forcedType)
      ? raw.forcedType
      : "";
    for (const type of ["ROOM", "GUEST", "EMPLOYEE"]) {
      const r = raw.reviews?.[type],
        spec = globalThis.StillwaterCaseData.proofs[type];
      const legacy =
        (raw.reviewVersion !== 1 || r?.legacy === true) &&
        Array.isArray(raw.attempts) &&
        raw.attempts.includes(type);
      const verified =
        r &&
        Array.isArray(r.sources) &&
        r.sources.length === spec.sources.length &&
        spec.sources.every((id) => r.sources.includes(id)) &&
        spec.fields.every((f) => r.values?.[f.id] === f.answer);
      if (legacy || verified) {
        v.attempts.push(type);
        v.reviews[type] = legacy
          ? { legacy: true }
          : { sources: [...r.sources], values: { ...r.values } };
      }
    }
    v.classified =
      v.reviewed && v.attempts.length === 3 && raw.classified === true;
    v.complete = v.classified && raw.complete === true;
    v.events = [
      "entry-shadow",
      "void-fragment-face",
      "terminal-shape",
      "void-lookback",
    ].filter((id) => Array.isArray(raw.events) && raw.events.includes(id));
    v.stage =
      v.step < 4
        ? "corridor"
        : !v.reviewed
          ? "fragments"
          : !v.classified
            ? raw.stage === "fragments"
              ? "fragments"
              : "classify"
            : "return";
    return v;
  }
  function transition(v, action, p = {}) {
    if (action === "enter") {
      if (!v.entered) {
        v.entered = true;
        v.enteredAt = Number.isFinite(p.now) ? p.now : Date.now();
        v.visits = 1;
      }
      return { ok: true };
    }
    if (!v.entered) return fail("void-entry");
    if (action === "observe") {
      if (!["reference", "left", "right", "shadow"].includes(p.target))
        return fail("void-observe");
      v.observation = p.target;
      if (p.target === "shadow") v.shadow = false;
      return { ok: true };
    }
    if (action === "walk") {
      if (v.stage !== "corridor" || !["left", "right"].includes(p.direction))
        return fail("void-route");
      if (p.direction === correct(v.step)) {
        v.step++;
        v.observation = "joined";
        if (v.step === 4) v.stage = "fragments";
      } else {
        v.step = 0;
        v.visits++;
        v.observation = "loop";
        if (v.visits >= 2 && !v.events.includes("entry-shadow")) {
          v.shadow = true;
          v.events.push("entry-shadow");
        }
      }
      return { ok: true };
    }
    if (action === "select") {
      if (![0, 1, 2].includes(p.id)) return fail("void-fragment");
      v.selected = p.id;
      return { ok: true };
    }
    if (action === "move") {
      if (v.stage !== "fragments" || v.reviewed) return fail("void-fragment");
      const id = Number.isInteger(p.id) ? p.id : v.selected;
      if (![0, 1, 2].includes(id) || ![p.dx, p.dy].every(Number.isInteger))
        return fail("void-fragment");
      v.selected = id;
      v.positions[id] = v.positions[id].map((x, i) =>
        Math.max(-6, Math.min(6, x + [p.dx, p.dy][i])),
      );
      return { ok: true };
    }
    if (action === "reset-fragments") {
      if (v.reviewed) return fail("void-reviewed");
      v.positions = initial.map((p) => [...p]);
      return { ok: true };
    }
    if (action === "review") {
      if (v.stage !== "fragments" || aligned(v).length !== 3)
        return fail("void-alignment");
      v.reviewed = true;
      if (!v.events.includes("void-fragment-face")) {
        v.events.push("void-fragment-face");
        return { ok: true, event: "void-fragment-face" };
      }
      return { ok: true };
    }
    if (action === "terminal") {
      if (!v.reviewed) return fail("void-review");
      v.stage = "classify";
      return { ok: true };
    }
    if (action === "classify") {
      if (v.stage !== "classify" || !v.reviewed) return fail("void-classify");
      if (["ROOM", "GUEST", "EMPLOYEE"].includes(p.type)) {
        v.activeCategory = p.type;
        v.observation = p.type;
        return { ok: true };
      }
      if (p.type !== "UNVERIFIED" || v.attempts.length !== 3)
        return fail("void-classify");
      v.disposition = "retain";
      v.classified = true;
      v.stage = "return";
      return { ok: true };
    }
    if (action === "close-review") {
      v.activeCategory = "";
      return { ok: true };
    }
    if (action === "disposition") {
      if (
        v.stage !== "classify" ||
        v.attempts.length !== 3 ||
        !["force", "auto", "retain"].includes(p.mode)
      )
        return fail("void-classify");
      if (p.mode === "force" && !["ROOM", "GUEST", "EMPLOYEE"].includes(p.type))
        return fail("void-force-type");
      v.disposition = p.mode;
      v.forcedType = p.mode === "force" ? p.type : "";
      v.classified = true;
      v.stage = "return";
      return { ok: true };
    }
    if (action === "lookback") {
      if (!v.classified) return fail("void-classify");
      if (!v.events.includes("void-lookback")) {
        v.events.push("void-lookback");
        return { ok: true, event: "void-lookback" };
      }
      return { ok: true };
    }
    if (action === "leave") {
      if (!v.classified) return fail("void-classify");
      v.complete = true;
      return { ok: true, route: "terminal" };
    }
    return fail("void-action");
  }
  function confirm(v, type, input) {
    if (
      v.stage !== "classify" ||
      !v.reviewed ||
      !["ROOM", "GUEST", "EMPLOYEE"].includes(type)
    )
      return fail("void-classify");
    const spec = globalThis.StillwaterCaseData.proofs[type];
    if (
      !Array.isArray(input?.sources) ||
      input.sources.length !== spec.sources.length ||
      !spec.sources.every((id) => input.sources.includes(id)) ||
      !spec.fields.every((f) => input.values?.[f.id] === f.answer)
    )
      return fail("void-evidence");
    if (!v.attempts.includes(type)) v.attempts.push(type);
    v.reviews[type] = {
      sources: [...input.sources],
      values: { ...input.values },
    };
    v.activeCategory = "";
    if (v.attempts.length === 3 && !v.events.includes("terminal-shape"))
      v.events.push("terminal-shape");
    return { ok: true };
  }
  return {
    fresh,
    hydrate,
    transition,
    confirm,
    ready,
    gate,
    finished,
    aligned,
    correct,
    scenes,
    slots,
    initial,
  };
})();
