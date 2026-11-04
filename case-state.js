/* The only V2 progression model. Views never grant access by counting clicks. */
globalThis.StillwaterCaseState = (() => {
  const D = globalThis.StillwaterCaseData,
    F = D.facts;
  const freshPromo = () => ({
    schema: 1,
    selected: "",
    marked: "",
    verified: false,
    echoSeen: false,
    legacy: false,
  });
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
    "evidence-desk": "C2",
    credits: null,
    "floor-plan": "C3",
    maintenance: "space",
    "night-audit": "C6",
    staff: "audit",
    revisions: "audit",
    closure: "identity",
    mara: "C8",
    review: "C9",
    ending: "historicalEnding",
    mirror: "finalEvidence",
    cameras: "mirrorStarted",
    "service-passage": "serviceDoor",
    terminal: "passageComplete",
    void: "unlistedReady",
  };
  const freshDesk = () => ({
    schema: 1,
    discovered: [],
    viewed: [],
    active: "sample",
    compare: [],
    marks: {},
    proof: "intake",
    drafts: {},
    results: {},
    hints: {},
    orderConfirmed: false,
    recordTypes: {},
    returnTo: "reservations?record=R-4829",
    footage: null,
  });
  const proofDraft = (state, key) =>
    state.desk.drafts[key] || { sources: [], values: {} };
  function syncSources(state) {
    const desk = state.desk,
      retained = new Set(desk.discovered);
    desk.discovered = Object.entries(D.documents)
      .filter(([id, doc]) =>
        doc.clue
          ? has(state, doc.clue)
          : id === "personnel"
            ? retained.has(id) && state.completed.audit
            : ["queue", "attendance"].includes(id)
              ? state.queueRefreshed
              : id === "footage"
                ? !!desk.footage
                : false,
      )
      .map(([id]) => id);
    return desk.discovered;
  }
  function proofAvailable(state, key) {
    return (
      {
        intake: has(state, "C2"),
        space: has(state, "C3") && has(state, "C5"),
        timeline: has(state, "C6"),
        identity: has(state, "C7"),
        ROOM: state.night.void.reviewed,
        GUEST: state.night.void.reviewed,
        EMPLOYEE: state.night.void.reviewed,
      }[key] === true
    );
  }
  function checkProof(state, key, input, { migrating = false } = {}) {
    const spec = D.proofs[key];
    if (!spec || !proofAvailable(state, key))
      return { ok: false, error: "desk-unavailable" };
    if (key !== "intake" && !state.desk.results.intake && !migrating)
      return { ok: false, error: "desk-intake" };
    const sources = [
      ...new Set(Array.isArray(input?.sources) ? input.sources : []),
    ];
    const found = new Set(syncSources(state));
    const missing = spec.sources.find(
      (id) => !sources.includes(id) || !found.has(id),
    );
    if (missing)
      return { ok: false, error: "desk-source-missing", document: missing };
    if (sources.some((id) => !spec.sources.includes(id)))
      return { ok: false, error: "desk-source-unrelated" };
    const values = input?.values || {};
    if (
      key === "intake" &&
      !migrating &&
      !["sample", "booking"].every(
        (id) =>
          state.desk.compare.includes(id) && state.desk.viewed.includes(id),
      )
    )
      return { ok: false, error: "desk-compare" };
    if (key === "space" && values.use !== "service")
      return {
        ok: false,
        error: values.use === "room" ? "desk-room" : "desk-occupancy",
      };
    if (key === "timeline") {
      if (!state.desk.orderConfirmed)
        return { ok: false, error: "audit-order-first" };
      const types =
        migrating && input.recordTypes
          ? input.recordTypes
          : state.desk.recordTypes;
      if (D.recordTypes.some((r) => types[r.id] !== r.answer))
        return { ok: false, error: "audit-record-type" };
      if (values.assessment !== "insufficient")
        return {
          ok: false,
          error:
            values.assessment === "never" ? "audit-never" : "audit-assessment",
        };
    }
    if (key === "identity") {
      if (values.role !== "reviewer") return { ok: false, error: "desk-role" };
      if (values.attendance !== "insufficient")
        return { ok: false, error: "desk-attendance" };
    }
    if (spec.fields.some((f) => values[f.id] !== f.answer))
      return { ok: false, error: "desk-finding" };
    return { ok: true };
  }
  function retainProof(state, key, input, legacy = false) {
    state.desk.results[key] = {
      sources: [...input.sources],
      values: { ...input.values },
      record: D.proofs[key].record,
      ...(key === "timeline"
        ? {
            sequence: D.audit.map((r) => r.id),
            recordTypes: { ...(input.recordTypes || state.desk.recordTypes) },
          }
        : {}),
      ...(legacy ? { legacy: true } : {}),
    };
    if (key === "timeline") state.completed.audit = true;
  }
  function hydrateDesk(state, rawDesk, raw) {
    const d = state.desk,
      valid = rawDesk?.schema === 1;
    if (valid) {
      d.discovered = [
        ...new Set(
          (Array.isArray(rawDesk.discovered) ? rawDesk.discovered : []).filter(
            (id) => Object.hasOwn(D.documents, id),
          ),
        ),
      ].filter((id) => id !== "personnel" || state.completed.audit);
      if (
        rawDesk.footage &&
        rawDesk.footage.reference === "B-3/03:17" &&
        has(state, "C9")
      )
        d.footage = {
          reference: "B-3/03:17",
          pans: [0, 1, 2].map((i) =>
            [0, 1, 2].includes(rawDesk.footage.pans?.[i])
              ? rawDesk.footage.pans[i]
              : 1,
          ),
          captured: true,
          openDoor: rawDesk.footage.openDoor === true,
          silhouette: rawDesk.footage.silhouette === true,
          cartMoved: rawDesk.footage.cartMoved === true,
          power: rawDesk.footage.power === true,
        };
      d.discovered = d.discovered.filter((id) => id !== "footage" || d.footage);
      d.viewed = (Array.isArray(rawDesk.viewed) ? rawDesk.viewed : []).filter(
        (id) => d.discovered.includes(id),
      );
      d.active = Object.hasOwn(D.documents, rawDesk.active)
        ? rawDesk.active
        : "sample";
      d.compare = [
        ...new Set(
          (Array.isArray(rawDesk.compare) ? rawDesk.compare : []).filter((id) =>
            d.discovered.includes(id),
          ),
        ),
      ].slice(0, 2);
      d.proof = Object.hasOwn(D.proofs, rawDesk.proof)
        ? rawDesk.proof
        : "intake";
      d.returnTo =
        typeof rawDesk.returnTo === "string" &&
        /^[a-z-]+(?:\?[a-zA-Z0-9=&-]+)?$/.test(rawDesk.returnTo) &&
        Object.hasOwn(routes, rawDesk.returnTo.split("?")[0]) &&
        rawDesk.returnTo.split("?")[0] !== "evidence-desk"
          ? rawDesk.returnTo
          : "reservations?record=R-4829";
      for (const [id, fields] of Object.entries(rawDesk.marks || {}))
        if (D.documents[id] && Array.isArray(fields))
          d.marks[id] = [
            ...new Set(
              fields.filter((f) =>
                D.documents[id].rows.some((r) => r.id === f),
              ),
            ),
          ];
      for (const key of Object.keys(D.proofs)) {
        const input = rawDesk.drafts?.[key];
        if (input)
          d.drafts[key] = {
            sources: [
              ...new Set(
                (Array.isArray(input.sources) ? input.sources : []).filter(
                  (id) => Object.hasOwn(D.documents, id),
                ),
              ),
            ],
            values: Object.fromEntries(
              D.proofs[key].fields.map((f) => [
                f.id,
                f.options.some((o) => o.id === input.values?.[f.id])
                  ? input.values[f.id]
                  : "",
              ]),
            ),
          };
        d.hints[key] = Number.isInteger(rawDesk.hints?.[key])
          ? Math.max(0, Math.min(3, rawDesk.hints[key]))
          : 0;
      }
      for (const key of Object.keys(D.hints))
        d.hints[key] = Number.isInteger(rawDesk.hints?.[key])
          ? Math.max(0, Math.min(3, rawDesk.hints[key]))
          : 0;
      d.orderConfirmed =
        rawDesk.orderConfirmed === true &&
        ((Array.isArray(raw.drafts?.auditOrder) &&
          raw.drafts.auditOrder.join("|") ===
            D.audit.map((r) => r.id).join("|")) ||
          (Array.isArray(rawDesk.results?.timeline?.sequence) &&
            rawDesk.results.timeline.sequence.join("|") ===
              D.audit.map((r) => r.id).join("|")));
      for (const row of D.recordTypes)
        d.recordTypes[row.id] = D.typeOptions.some(
          (o) => o.id === rawDesk.recordTypes?.[row.id],
        )
          ? rawDesk.recordTypes[row.id]
          : "";
    }
    syncSources(state);
    for (const key of Object.keys(D.proofs)) {
      const old = rawDesk?.results?.[key];
      const compatible =
        (!valid || old?.legacy === true) &&
        {
          intake: has(state, "C5") || raw.completed?.audit === true,
          space: has(state, "C5"),
          timeline: raw.completed?.audit === true && has(state, "C6"),
          identity: has(state, "C7"),
        }[key];
      if (compatible) {
        const spec = D.proofs[key],
          input = {
            sources: [...spec.sources],
            values: Object.fromEntries(
              spec.fields.map((f) => [f.id, f.answer]),
            ),
          };
        if (key === "identity") {
          d.discovered.push("personnel", "queue", "attendance");
          state.queueRefreshed = true;
        }
        if (key === "timeline") {
          d.orderConfirmed = true;
          d.recordTypes = Object.fromEntries(
            D.recordTypes.map((r) => [r.id, r.answer]),
          );
        }
        retainProof(state, key, input, true);
      } else if (old && checkProof(state, key, old, { migrating: true }).ok)
        retainProof(state, key, old);
    }
    if (valid) state.completed.audit = !!d.results.timeline;
    syncSources(state);
  }
  function objective(state) {
    const go = (key, zh, en, directions) => ({
      key,
      title: [zh, en],
      directions,
    });
    if (state.endings.includes(state.lastEnding))
      return go("saved", "本次处理结果已保存", "Disposition saved", [
        [
          "ending?view=" + state.lastEnding,
          ["查看处理结果", "View disposition"],
        ],
      ]);
    if (!has(state, "C1"))
      return go("sample", "查看岗位样本", "Review the role sample", [
        ["careers", ["岗位工作样本", "Role sample"]],
      ]);
    if (!has(state, "C2"))
      return go("booking", "核对样本中的预订", "Find the sample booking", [
        ["careers", ["工作样本", "Role sample"]],
        ["reservations", ["预订查询", "Reservation search"]],
      ]);
    if (!state.desk.results.intake)
      return go("intake", "登记这份工作样本", "Register the work sample", [
        [
          "evidence-desk?proof=intake",
          ["证据核对台 · 初次登记", "Evidence desk · sample intake"],
        ],
      ]);
    if (!has(state, "C3") || !has(state, "C4"))
      return go(
        "sources",
        "核对房号与当晚留言",
        "Check the room number and night entry",
        [
          ["rooms?copy=original", ["三楼客房目录", "Third-floor directory"]],
          [
            "guestbook?copy=original",
            ["同日住客留言", "Entry from that night"],
          ],
          ...(has(state, "C3")
            ? [["floor-plan", ["三楼平面图", "Third-floor plan"]]]
            : []),
        ],
      );
    if (!state.desk.results.space)
      return go(
        "space",
        "确认 317 的原始用途",
        "Establish the original use of 317",
        [
          ["floor-plan", ["平面图与区域卡", "Plan and position card"]],
          [
            "evidence-desk?proof=space",
            ["核对登记用途", "Review the registered use"],
          ],
        ],
      );
    if (!has(state, "C6"))
      return go(
        "maintenance",
        "查阅相关维修移交",
        "Find the maintenance handover",
        [
          ["maintenance", ["维修记录查询", "Maintenance records"]],
          ["notices", ["当日通行公告", "Access notice"]],
        ],
      );
    if (!state.completed.audit)
      return go("timeline", "核对夜班记录", "Reconcile the night records", [
        ["night-audit", ["当晚记录与时间", "Night records and timestamps"]],
        ["guestbook?copy=original", ["住客留言原件", "Original guest entry"]],
        [
          "evidence-desk?proof=timeline",
          ["记录性质核对", "Review record types"],
        ],
      ]);
    if (!has(state, "C7"))
      return go(
        "revisions",
        "对照原稿与修订",
        "Compare the original and revision",
        [
          ["revisions", ["版本记录", "Revision history"]],
          ["staff", ["原员工档案", "Original personnel record"]],
        ],
      );
    if (!state.desk.results.identity)
      return go(
        "identity",
        "核对 Mara 与当前排班",
        "Review Mara and the current queue",
        [
          ["staff", ["人员与当前队列", "Personnel and current queue"]],
          [
            "evidence-desk?proof=identity",
            ["身份记录核对", "Review personnel sources"],
          ],
        ],
      );
    if (!has(state, "C8"))
      return go(
        "closure",
        "查阅修订后的营业记录",
        "Check the retained operating notice",
        [["closure", ["营业通知存档", "Operating-notice archive"]]],
      );
    if (!has(state, "C9"))
      return go(
        "mara",
        "查阅原处理人的留稿",
        "Read the original reviewer’s draft",
        [["mara", ["Mara 留存草稿", "Mara’s retained draft"]]],
      );
    if (!state.completed.finalEvidence)
      return go("review", "提交本次资料核对", "Submit this source review", [
        ["review", ["核对汇总", "Review summary"]],
      ]);
    if (!state.night.started)
      return go("sync", "查看系统同步结果", "View the synchronization result", [
        ["review", ["记录提交结果", "Submitted review"]],
      ]);
    if (!globalThis.StillwaterNightModel.spreadReady(state.night))
      return go("spread", "核查同步后的网页", "Check the synchronized pages", [
        ["rooms", ["当前客房目录", "Current directory"]],
        ["guestbook", ["当前住客留言", "Current guestbook"]],
      ]);
    if (!state.night.door)
      return go("cameras", "确认服务通道的位置", "Locate the service passage", [
        ["cameras", ["监控室", "Camera room"]],
      ]);
    if (!globalThis.StillwaterNightModel.passageReady(state.night))
      return go(
        "passage",
        "检查维修通道的设备",
        "Inspect the service-passage equipment",
        [["service-passage", ["三楼维修通道", "Third-floor service passage"]]],
      );
    if (!state.night.void.reviewed)
      return go(
        "footage",
        "恢复并检查原始影像",
        "Restore and inspect the original picture",
        [
          ["terminal", ["B-3 录像配线室", "B-3 patch room"]],
          ...(globalThis.StillwaterVoidModel.gate(state.night) &&
          promoChecked(state)
            ? [["void", ["未归档影像", "Unlisted picture"]]]
            : []),
        ],
      );
    if (!state.night.void.classified)
      return go(
        "categories",
        "核对未知影像的归类依据",
        "Review the unknown picture’s classification",
        [
          ["void", ["分类终端", "Classification terminal"]],
          ["evidence-desk", ["原始资料", "Original sources"]],
          ["terminal", ["恢复的录像", "Restored footage"]],
        ],
      );
    return go("handover", "完成夜班交接", "Finish the shift handover", [
      ["terminal", ["B-3 交接终端", "B-3 handover terminal"]],
    ]);
  }
  function deskAction(state, action, p) {
    const d = state.desk;
    syncSources(state);
    if (action === "desk-footage") {
      if (
        !state.completed.finalEvidence ||
        !state.night.frame ||
        !globalThis.StillwaterNightModel.circuit(state.night).readable ||
        !globalThis.StillwaterNightModel.passageReady(state.night)
      )
        return fail("desk-footage");
      if (!d.footage)
        d.footage = {
          reference: "B-3/03:17",
          pans: [...state.night.pans],
          captured: true,
          openDoor: state.night.events.includes("plate-open-door"),
          silhouette:
            state.night.pans[1] === 1 &&
            (state.night.events.includes("hall-silhouette") ||
              state.night.passage.inspected.includes("photo")),
          cartMoved: state.night.passage.cartMoved,
          power: state.night.passage.servicePower,
        };
      syncSources(state);
      return ok();
    }
    if (action === "desk-discover") {
      if (
        p.route === "staff" &&
        canOpen(state, "staff") &&
        !d.discovered.includes("personnel")
      )
        d.discovered.push("personnel");
      return ok();
    }
    if (action === "desk-hint") {
      const related = {
        booking: has(state, "C1"),
        inventory: has(state, "C2"),
        maintenance: !!state.desk.results.space,
        cameras: canOpen(state, "cameras"),
        wiring: canOpen(state, "terminal"),
        "void-corridor": state.night.void.entered,
        "void-fragments": state.night.void.step === 4,
        promo: globalThis.StillwaterVoidModel.ready(state.night),
        revisions: state.completed.audit,
      };
      if (
        !D.hints[p.key] ||
        !(related[p.key] === true || proofAvailable(state, p.key))
      )
        return fail("desk-unavailable");
      d.hints[p.key] = Math.min(3, (d.hints[p.key] || 0) + 1);
      return ok();
    }
    if (!canOpen(state, "evidence-desk")) return fail("desk-unavailable");
    if (action === "desk-ui") {
      const id = p.document,
        key = p.key || d.proof;
      if (
        p.op === "return" &&
        typeof p.route === "string" &&
        Object.hasOwn(routes, p.route.split("?")[0]) &&
        p.route.split("?")[0] !== "evidence-desk"
      ) {
        d.returnTo = p.route.slice(0, 180);
        return ok();
      }
      if (p.op === "proof" && D.proofs[key] && proofAvailable(state, key)) {
        d.proof = key;
        return ok();
      }
      if (
        ["open", "compare", "drop", "mark", "cite"].includes(p.op) &&
        !d.discovered.includes(id)
      )
        return fail("desk-source-missing");
      if (p.op === "open") {
        d.active = id;
        if (!d.viewed.includes(id)) d.viewed.push(id);
        return ok();
      }
      if (p.op === "compare") {
        if (!d.compare.includes(id)) {
          if (d.compare.length === 2) return fail("desk-compare-full");
          d.compare.push(id);
        }
        d.active = id;
        if (!d.viewed.includes(id)) d.viewed.push(id);
        return ok();
      }
      if (p.op === "drop") {
        d.compare = d.compare.filter((x) => x !== id);
        return ok();
      }
      if (p.op === "mark") {
        if (!D.documents[id].rows.some((r) => r.id === p.field))
          return fail("desk-field");
        const list = d.marks[id] || [];
        d.marks[id] = list.includes(p.field)
          ? list.filter((x) => x !== p.field)
          : [...list, p.field];
        return ok();
      }
      if (!D.proofs[key]) return fail("desk-unavailable");
      const input = (d.drafts[key] ||= { sources: [], values: {} });
      if (p.op === "cite") {
        input.sources = input.sources.includes(id)
          ? input.sources.filter((x) => x !== id)
          : [...input.sources, id];
        return ok();
      }
      if (p.op === "choice") {
        const field = D.proofs[key].fields.find((f) => f.id === p.field);
        if (!field?.options.some((o) => o.id === p.value))
          return fail("desk-field");
        input.values[p.field] = p.value;
        return ok();
      }
      if (
        p.op === "type" &&
        key === "timeline" &&
        D.recordTypes.some((r) => r.id === p.field) &&
        D.typeOptions.some((o) => o.id === p.value)
      ) {
        d.recordTypes[p.field] = p.value;
        return ok();
      }
      return fail("desk-action");
    }
    if (action === "desk-submit") {
      const key = p.key || d.proof,
        input = proofDraft(state, key),
        result = checkProof(state, key, input);
      if (!result.ok) return result;
      if (
        ["ROOM", "GUEST", "EMPLOYEE"].includes(key) &&
        (state.night.void.stage !== "classify" || !state.night.void.entered)
      )
        return fail("void-classify");
      retainProof(state, key, input);
      if (["ROOM", "GUEST", "EMPLOYEE"].includes(key))
        return globalThis.StillwaterVoidModel.confirm(
          state.night.void,
          key,
          input,
        );
      return ok();
    }
    return fail("desk-action");
  }

  const fresh = () => ({
    schema: 2,
    night: globalThis.StillwaterNightModel.fresh(),
    promo: freshPromo(),
    desk: freshDesk(),
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
    (["space", "identity"].includes(requirement) &&
      !!state.desk.results[requirement]) ||
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
    syncSources(state);
    return true;
  }
  const canOpen = (state, route) =>
    Object.hasOwn(routes, route) &&
    (!["mirror", "cameras", "service-passage", "terminal", "void"].includes(
      route,
    ) ||
      state.completed.finalEvidence) &&
    ((route === "ending" && state.endings.length > 0) ||
      met(state, routes[route]));
  function recovery(state, route) {
    if (
      route === "maintenance" &&
      !state.desk.results.space &&
      has(state, "C5")
    )
      return "evidence-desk?proof=space";
    if (route === "closure" && !state.desk.results.identity && has(state, "C7"))
      return "evidence-desk?proof=identity";
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
    state.evidence = [...wanted].filter((id) => state.evidence.includes(id));
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
    if (
      !Object.hasOwn(raw.night || {}, "void") &&
      (state.night.locked || state.endings.length)
    )
      state.night.void.legacy = true;
    state.lastEnding = state.endings.includes(raw.lastEnding)
      ? raw.lastEnding
      : "";
    // Existing third-chapter and completed saves keep their access. A mere
    // pre-chapter wiring save still has the new source check available in B-3.
    const oldDeepSave =
      state.night.void.entered ||
      state.night.void.legacy ||
      state.night.locked ||
      state.endings.length > 0;
    const promo = raw.promo?.schema === 1 ? raw.promo : null;
    state.promo = freshPromo();
    state.promo.legacy = oldDeepSave && (!promo || promo.legacy === true);
    if (promo) {
      state.promo.selected = ["original", "synced", "preview"].includes(
        promo.selected,
      )
        ? promo.selected
        : "";
      state.promo.marked = ["left", "middle", "right", "lamp"].includes(
        promo.marked,
      )
        ? promo.marked
        : "";
      state.promo.verified =
        promo.verified === true &&
        state.promo.selected === "original" &&
        state.promo.marked === "middle";
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
    hydrateDesk(state, raw.desk, raw);
    const v = state.night.void;
    for (const key of ["ROOM", "GUEST", "EMPLOYEE"]) {
      if (
        v.reviews[key] &&
        !v.reviews[key].legacy &&
        !state.desk.results[key]
      ) {
        delete v.reviews[key];
        v.attempts = v.attempts.filter((id) => id !== key);
        v.classified = false;
        v.complete = false;
        if (v.reviewed) v.stage = "classify";
      }
    }
    state.completed.finalEvidence =
      state.completed.finalEvidence &&
      !!state.desk.results.space &&
      !!state.desk.results.timeline &&
      !!state.desk.results.identity;
    return state;
  }
  const ok = () => ({ ok: true });
  const fail = (error) => ({ ok: false, error });
  function transition(state, action, payload = {}) {
    if (action.startsWith("desk-")) return deskAction(state, action, payload);
    if (action === "void") {
      if (
        !state.completed.finalEvidence ||
        !promoChecked(state) ||
        !globalThis.StillwaterVoidModel.gate(state.night)
      )
        return fail("void-entry");
      if (payload.action === "disposition") {
        const result = globalThis.StillwaterVoidModel.transition(
          state.night.void,
          payload.action,
          payload,
        );
        if (!result.ok || payload.mode === "retain") return result;
        return transition(state, "ending", { ending: "auto-close" });
      }
      return globalThis.StillwaterVoidModel.transition(
        state.night.void,
        payload.action,
        payload,
      );
    }
    if (action === "promo-source" || action === "promo-mark") {
      if (
        !state.completed.finalEvidence ||
        !globalThis.StillwaterVoidModel.ready(state.night)
      )
        return fail("promo-not-ready");
      if (state.promo.verified) return ok();
      if (action === "promo-source") {
        if (!["original", "synced", "preview"].includes(payload.version))
          return fail("promo-source");
        state.promo.selected = payload.version;
        state.promo.marked = "";
        return payload.version === "original" ? ok() : fail("promo-source");
      }
      if (state.promo.selected !== "original") return fail("promo-source");
      if (!["left", "middle", "right", "lamp"].includes(payload.target))
        return fail("promo-unchanged");
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
        if (!has(state, "C3")) return fail("inventory-first");
        record(state, "C5");
        state.completed.serviceInspected = true;
        return ok();
      case "classify-service":
        return deskAction(state, "desk-submit", { key: "space" });
      case "maintenance":
        if (!has(state, "C5") || !state.desk.results.space)
          return fail("service-first");
        if (String(payload.reference).trim().toUpperCase() !== F.notice)
          return fail("maintenance");
        record(state, "C6");
        return ok();
      case "audit-order":
        if (!has(state, "C6")) return fail("maintenance-first");
        if (
          !Array.isArray(payload.order) ||
          payload.order.join("|") !== D.audit.map((r) => r.id).join("|")
        )
          return fail("audit-order");
        state.drafts.auditOrder = [...payload.order];
        state.desk.orderConfirmed = true;
        return ok();
      case "audit":
        return deskAction(state, "desk-submit", { key: "timeline" });
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
        if (!state.desk.results.identity) return fail("identity-first");
        if (!record(state, "C8")) return fail("revisions-first");
        return ok();
      case "mara":
        if (!record(state, "C9")) return fail("closure-first");
        return ok();
      case "evidence": {
        if (
          !Object.keys(D.clues).every((id) => has(state, id)) ||
          !state.completed.audit ||
          !state.desk.results.space ||
          !state.desk.results.identity
        )
          return fail("evidence-incomplete");
        if (payload.confirmed === true) {
          state.completed.finalEvidence = true;
          return ok();
        }
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
        if (!globalThis.StillwaterVoidModel.finished(n))
          return fail("void-first");
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
        if (
          payload.ending === "released" &&
          (!state.night.locked || !globalThis.StillwaterVoidModel.finished(n))
        )
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
    syncSources,
    proofDraft,
    checkProof,
    proofAvailable,
    objective,
  });
})();
