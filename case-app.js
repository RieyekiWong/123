(() => {
  "use strict";
  const D = window.StillwaterCaseData,
    M = window.StillwaterCaseState,
    F = D.facts;
  const zh = document.documentElement.lang === "zh-CN",
    t = (a, b) => (zh ? a : b);
  const KEY = "stillwater-case:v2";
  let state = M.fresh(),
    pendingEscape = false,
    finalScenePending = false,
    welcome = null,
    storageFailed = false;
  let nextVoidFocus = "", pendingVoidHandover = false, voidSignal = null, messenger = null;
  let existingSave = null;
  try {
    existingSave = localStorage.getItem(KEY);
  } catch {
    storageFailed = true;
  }
  if (existingSave) {
    try {
      state = M.hydrate(JSON.parse(existingSave));
    } catch {
      state = M.fresh();
    }
  }
  if (!existingSave)
    state.preferences.reduceMotion = matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      storageFailed = false;
    } catch {
      storageFailed = true;
    }
  }
  const a = (route, label, cls = "") =>
    `<a class="${cls}" href="#${route}">${label}</a>`;
  const promo = window.StillwaterHotelPromo.create({
    t, esc, getState: () => state,
    reduced: () => comfort.reduced(),
    sound: () => nightAudio.effect("camera"),
    onAction: (action, payload) => {
      const result = M.transition(state, "promo-" + action, payload);
      save();
      render();
      return result;
    },
  });
  const evidenceDesk = window.StillwaterEvidence.create({t,esc,getState:()=>state,onAction:(action,payload,options={})=>{
    const result=action==='desk-refresh'?{ok:true}:M.transition(state,action,payload);
    save();
    if(options.render!==false){render();if(options.focus){const el=document.querySelector(options.focus);if(el){if(!el.matches('button,input,select,a'))el.tabIndex=-1;el.focus({preventScroll:true});}}}
    return result;
  }});
  const views = window.StillwaterCaseViews({ t, esc, getState: () => state, evidence: evidenceDesk });
  const nightViews = window.StillwaterNightViews({ t, getState: () => state, sourceCheck: () => promo.renderCheck() });
  const spaceViews = window.StillwaterSpaceViews({ t, getState: () => state });
  const nightAudio = window.StillwaterCaseAudio.create({
    getState: () => state,
    getRoute: currentRoute,
    canOpen: (route) => M.canOpen(state, route),
    getPresentation: () => ({
      blocked: !!welcome?.isOpen(),
      transition: phaseTransition.isActive(),
      endingPending: finalScenePending,
      ending: (() => {
        const requested = new URLSearchParams(location.hash.split("?")[1] || "").get("view");
        return state.endings.includes(requested) ? requested : state.lastEnding;
      })(),
    }),
  });
  const forum = window.StillwaterForum({ t, esc, getState: () => state });
  const chat = window.StillwaterChat.create({ t, esc, getRoute: currentRoute, audio: nightAudio, onIncoming: messages=>messenger?.incoming(messages) });
  const PROLOGUE = "stillwater-prologue:v1";
  let prologue = { schema: 1, entered: false, lastRoute: "" };
  try {
    const raw = JSON.parse(localStorage.getItem(PROLOGUE));
    if (raw?.schema === 1)
      prologue = {
        schema: 1,
        entered: raw.entered === true,
        lastRoute:
          typeof raw.lastRoute === "string" ? raw.lastRoute.slice(0, 180) : "",
      };
  } catch {}
  function rememberRoute(route) {
    if (!Object.hasOwn(M.routes, route)) return;
    if (!["forum", "chat"].includes(route)) prologue.entered = true;
    prologue.lastRoute = location.hash.slice(1) || route;
    if(!["evidence-desk","chat","forum","notes","ending"].includes(route)) state.desk.returnTo=prologue.lastRoute;
    try {
      localStorage.setItem(PROLOGUE, JSON.stringify(prologue));
    } catch {}
  }
  if (!location.hash) {
    const savedRoute = prologue.lastRoute.split("?")[0];
    const hasProgress = state.evidence.length > 0 || state.endings.length > 0;
    const next = hasProgress
      ? M.canOpen(state, savedRoute)
        ? prologue.lastRoute
        : state.lastEnding
          ? "ending"
          : M.recovery(state)
      : savedRoute && M.canOpen(state, savedRoute)
        ? prologue.lastRoute
        : prologue.entered
          ? "careers"
          : existingSave
            ? "forum"
            : "chat";
    history.replaceState(
      null,
      "",
      location.pathname + location.search + "#" + next,
    );
  }
  const phaseTransition = window.StillwaterCaseTransition.create({
    getState: () => state,
    t,
    onBegin: () => {void nightAudio.sync();messenger?.sync();},
    complete: () => {
      history.replaceState(
        null,
        "",
        location.pathname + location.search + "#mirror",
      );
      render(true);
    },
  });
  const comfort = window.StillwaterCaseComfort.create({
    getState: () => state,
    audio: nightAudio,
    save,
    onPreference: () => {
      document.body.classList.toggle("reduced-motion", comfort.reduced());
      for (const button of document.querySelectorAll(
        "[data-case-action=toggle-sound]",
      )) {
        button.textContent = state.preferences.sound
          ? t("声音：开启", "Sound: On")
          : t("声音：关闭", "Sound: Off");
        button.setAttribute("aria-pressed", String(state.preferences.sound));
      }
      if (
        state.preferences.skipScares ||
        comfort.reduced() ||
        !state.preferences.sound
      )
        nightEvents.clear();
      promo.stopEffects();
      void nightAudio.sync();
      voidWorld?.refresh();
      voidSignal?.sync();
      ads.navigate();
    },
    reset: () => {
      phaseTransition.cancel();
      pendingEscape = false;
      finalScenePending = false;
      pendingVoidHandover = false;
      nextVoidFocus = "";
      welcome?.forget();
      chat.reset();
      evidenceDesk.reset();
      promo.reset();
      nightEvents.clear();
      voidSignal?.clear();
      messenger?.reset();
      nightAudio.stop();
      const preferences = { ...state.preferences, sound: false };
      state = M.fresh();
      state.preferences = preferences;
      save();
      prologue = { schema: 1, entered: false, lastRoute: "chat" };
      try {
        localStorage.setItem(PROLOGUE, JSON.stringify(prologue));
      } catch {}
      history.replaceState(
        null,
        "",
        location.pathname + location.search + "#chat",
      );
      render(true);
      welcome?.open({ mandatory: true });
    },
  });
  const nightEvents = window.StillwaterEvents.create({
    getState: () => state,
    reduced: () => comfort.reduced(),
    audio: nightAudio,
    sting: () => comfort.tone(),
    t,
  });
  voidSignal = window.StillwaterVoidSignal.create({getState:()=>state,reduced:()=>comfort.reduced(),audio:nightAudio});
  const voidWorld = window.StillwaterVoid.create({
    getState: () => state, t, esc, evidenceReview:()=>evidenceDesk.finalReview(), guide:(key)=>evidenceDesk.hints(key),
    onAction: (action, payload, focusKey) => {
      const previousEvents = state.night.void.events.length;
      const result = M.transition(state, "void", { action, ...payload });
      save();
      if (!result.ok) {
        const target = document.querySelector("#void-feedback");
        if (target) target.textContent = result.error === "void-alignment"
          ? t("画面还没拼齐。检查相邻边缘的门框和地缝，看看哪里断开了。", "The edges do not meet yet. Check the frame and floor seams between fragments.")
          : t("这一步还未完成，刚才的操作已保留。", "This operation is not ready yet. Your picture and adjustments are retained.");
        voidWorld.refresh();
        return;
      }
      nightAudio.effect(action === "walk" ? "door" : "ui");
      if (action === "disposition" && payload.mode !== "retain") { location.hash="ending"; return; }
      if (result.route) { pendingVoidHandover = true; location.hash = result.route; return; }
      nextVoidFocus = focusKey;
      render();
      if (state.night.void.events.length > previousEvents) nightAudio.silence();
      if (result.event) nightEvents.present(result.event);
    },
  });
  messenger = window.StillwaterMessengerBridge.create({chat,getState:()=>state,getRoute:currentRoute,canOpen:route=>M.canOpen(state,route),t,esc,audio:nightAudio,reduced:()=>comfort.reduced(),blocked:()=>!!welcome?.isOpen()||phaseTransition.isActive()});
  const errors = {
    "story-required":["姓名关联仍有来源冲突，请先完成当前调查中的来源核对。","The name association still has source conflicts. Complete the current source review before synchronizing."],
    sample: [
      "请先到招聘页查看样本编号。",
      "Check the reference on the job sample.",
    ],
    reservation: [
      "查不到这笔预订，请检查编号是否完整。",
      "No record found. Check the reference on the original sample.",
    ],
    booking: ["请先查到对应的预订单。", "Identify the retained booking first."],
    inventory: [
      "这个房号与预订单不一致，请再看一下登记房号。",
      "This is not the assignment on the original booking. Check that record.",
    ],
    "inventory-first": [
      "请先核对预订单上的房号。",
      "Associate the booking with the guest inventory first.",
    ],
    "message-first": [
      "请先查看这笔预订对应的住客留言。",
      "Review the key entry associated with the booking.",
    ],
    "inspect-first": [
      "请先打开服务区域的登记卡。",
      "Open the position card on the floor plan first.",
    ],
    classification: [
      "所选用途与登记卡上的内容不一致。",
      "That classification does not match the position card.",
    ],
    "service-first": [
      "请先核对服务区域的登记用途。",
      "Check the position classification on the floor plan first.",
    ],
    maintenance: [
      "查不到这张维修单，请核对公告编号。",
      "No docket found. Check the original access notice reference.",
    ],
    "maintenance-first": [
      "请先查询对应的维修单。",
      "The source records are not yet associated with this booking. Check its maintenance docket.",
    ],
    "audit-order": [
      "顺序不对。请按记录上的日期和时间，从早到晚排列。",
      "The source timestamps do not match this sequence. Check each original timestamp.",
    ],
    "audit-assessment": [
      "现有记录还不足以得出这个结论。",
      "That finding is not supported by the records.",
    ],
    "audit-first": [
      "请先核对当晚的记录。",
      "The personnel file requires a reconciled night-audit record.",
    ],
    "revision-unchanged": [
      "有一项两栏内容相同，不需要勾选。",
      "An unchanged field was selected. Compare the versions row by row.",
    ],
    "revision-missing": [
      "还有改动没有选出来，请再对照一次。",
      "A changed field is still unrecorded. Check both originals.",
    ],
    "revisions-first": [
      "请先比较原稿与修改稿。",
      "Associate this addendum with the revision record first.",
    ],
    "closure-first": [
      "这份草稿附在停业通知后，请从附件进入。",
      "Read the closure notice to establish the note’s historical context.",
    ],
    "evidence-incomplete": [
      "还有资料未查看，暂时无法提交。",
      "Some records are still missing. Reopen the sources in Case Notes before submitting.",
    ],
    "evidence-occupancy": [
      "目前没有记录能证实住客实际入住。",
      "This finding needs a matching record.",
    ],
    "evidence-operating": [
      "这项说法与停业通知的内容不符。",
      "This finding does not match the notice.",
    ],
    "evidence-consent": [
      "这项说法与 Mara 留下的原备注不符。",
      "Check the authorization in Mara’s original note.",
    ],
    "evidence-missing": [
      "请选择三项能在原始记录中找到依据的说法。",
      "Submit only the three findings that can be cross-checked against the originals.",
    ],
    unknown: [
      "操作未完成，之前保存的资料还在。",
      "This operation is not recognized. The original records remain available.",
    ],
  };
  const feedback = window.StillwaterCaseFeedback({ t });
  const ads = window.StillwaterAds.create({
    getState: () => state,
    getRoute: currentRoute,
    t,
    esc,
  });
  welcome = window.StillwaterWelcome.create({
    getState: () => state,
    save,
    comfort,
    getCredits: () => views.credits(),
    t,
    onOpen: () => {
      nightEvents.clear();
      nightAudio.pause();
    },
    onContinue: () => {
      render();
      void nightAudio.sync();
    },
  });
  const story = window.StillwaterStory.create({getState:()=>state,getRoute:currentRoute,save,render,chat,signal:voidSignal,t,esc,phaseTransition,blocked:()=>!!welcome?.isOpen()||phaseTransition.isActive()});
  function perform(action, payload = {}, errorId = "case-status") {
    const result = M.transition(state, action, payload);
    save();
    if (!result.ok)
      feedback.show(
        errorId,
        result,
        t(...(errors[result.error] || errors.unknown)),
        action,
      );
    else feedback.reset(action);
    return result.ok;
  }
  function careers() {
    return window.StillwaterCareers.render({t, esc, state, facts: F});
  }
  function guarded(route) {
    const recovery = M.recovery(state, route);
    return (
      views.heading(
        "RECORD INDEX",
        t("文件暂时打不开", "Record not currently available"),
        t(
          "这份文件暂时无法直接打开，请从相关资料中的链接进入。",
          "This file is not available yet. Open it through the related record.",
        ),
      ) + views.reference(recovery, t("查看相关文件", "Open the source record"))
    );
  }
  function currentRoute() {
    return location.hash.slice(1).split("?")[0] || "chat";
  }
  function siteFooter(site) {
    const warning = storageFailed
      ? `<p role="status">${t("浏览器暂时无法保存进度。这个标签页仍可继续，关闭后可能丢失记录。", "Your browser can’t save progress right now. You can keep going in this tab, but closing it may lose your work.")}</p>`
      : "";
    const credits = `<button class="footer-settings" data-ad-action="credits">${t("图片鸣谢", "Photo acknowledgements")}</button>`;
    const folder = `<button class="footer-settings" data-ad-action="folder">${t("我的广告夹", "My ad folder")}</button>`;
    if (site === "forum")
      return `<footer class="forum-footer"><p class="bbs-footer-sticker">${t("页面不会自动刷新，帖子内容以本次打开时显示的为准。", "This page does not refresh automatically. You’re reading the version loaded when you opened it.")}</p><p class="footer-site-name">NIGHT OWL BBS · ${t("夜猫论坛", "Night Owl BBS")}</p><div class="footer-links">${a("chat", t("回到聊天", "Back to chat"))} · ${a("forum", t("论坛首页", "Forum home"))} · ${a("forum?section=work", t("工作信息", "Work notices"))} · ${a("forum?section=web", t("老网站", "Old websites"))} · ${folder} · ${credits}</div><p>${t("本论坛及商家均为虚构，不接受真实交易。", "A fictional community. Posts and shops are part of the work; no real transactions are accepted.")}</p>${warning}</footer>`;
    if (site === "careers")
      return `<footer class="careers-footer"><p class="footer-site-name">STILLWATER HERITAGE RECORDS</p><div class="footer-links">${a("careers", t("招聘信息", "Opportunities"))} · ${a("forum", t("回论坛看看", "Back to the forum"))} · ${folder} · ${credits}</div><p>${t("职位均为虚构，不接收简历、真实申请或付款。", "A fictional job listing. No real CVs, applications or payments are accepted.")}</p>${warning}</footer>`;
    return `<footer>${site === "hotel" ? `<p class="hotel-archive-stamp">${t("网页存档 · 2006 年版本。房型和服务信息仅供查阅。", "Website archive: 2006 edition. Room and service information is retained for historical reference.")}</p>` : ""}<p>${t("本作是虚构互动作品，酒店、招聘及档案均属剧情内容。不接受真实申请或付款。", "A fictional interactive work. The hotel, role and records are part of the story. No real applications or payments are accepted.")}</p>${storageFailed ? `<p role="status">${t("浏览器暂时无法保存进度。这个标签页仍可继续，关闭后可能丢失记录。", "Your browser can’t save progress right now. You can keep going in this tab, but closing it may lose your work.")}</p>` : ""}${a("forum", t("回论坛看看", "Back to the forum"))} · ${a("careers", t("返回招聘页", "Careers"))} · ${a("guestbook", t("住客留言", "Guestbook"))} · ${a("history", t("旅馆历史", "History"))} · ${a("gallery", t("旅馆相册", "Photo gallery"))} · ${a("notices", t("公告栏", "Notices"))} · ${a("staff", t("员工档案", "Staff archive"))} · ${a("notes", t("工作笔记", "Case Notes"))} · <button class="footer-settings" data-case-action="toggle-sound" aria-pressed="${state.preferences.sound}">${state.preferences.sound ? t("声音：开启", "Sound: On") : t("声音：关闭", "Sound: Off")}</button> · <button class="footer-settings" data-case-action="settings">${t("声音与设置", "Sound & settings")}</button> · <button class="footer-settings" data-ad-action="folder">${t("我的广告夹", "My ad folder")}</button> · ${a("credits", t("图片来源", "Image credits"))}</footer>`;
  }
  function endingView() {
    const requested = new URLSearchParams(
      location.hash.split("?")[1] || "",
    ).get("view");
    const shown = state.endings.includes(requested)
      ? requested
      : state.lastEnding;
    return window.StillwaterEnding.render(shown, {
      t,
      storyEdition:state.story?.edition,
      pending: shown === "released" && finalScenePending,
      stored: !storageFailed,
    }) + (globalThis.StillwaterStoryV13?.active(state)?globalThis.StillwaterStoryV13Pages({getState:()=>state,t,esc}).epilogue(shown):shown === "released" ? nightViews.released() : views.ending());
  }
  function finishFinalScene() {
    finalScenePending = false;
    if (currentRoute() === "ending")
      window.StillwaterEnding.reveal({
        focus: !document.hidden && !document.querySelector("dialog[open]"),
      });
    void nightAudio.sync();
  }
  function render(moveFocus = false) {
    messenger?.beforeRender();
    promo.stopEffects();
    let route = currentRoute();
    story.prepare(route,new URLSearchParams(location.hash.split("?")[1]||""));
    if (route === "home") route = "hotel";
    const inVoid = route === "void" && M.canOpen(state, "void");
    const staff = [
      ...window.StillwaterStoryModel.routes,
      "evidence-desk",
      "night-audit",
      "staff",
      "revisions",
      "closure",
      "mara",
      "review",
      "ending",
      "cameras",
      "terminal",
      "service-passage",
      "void",
    ].includes(route);
    const site =
      inVoid ? "void" : route === "chat"
        ? "chat"
        : route === "forum"
          ? "forum"
        : route === "careers"
          ? "careers"
          : staff
            ? "staff"
            : "hotel";
    rememberRoute(route);
    document.body.dataset.site = site;
    document.body.dataset.anomaly =
      inVoid ? "void" : route === "chat"
        ? "normal"
        : state.lastEnding === "released"
        ? "resolved"
        : state.night.door
          ? "terminal"
          : state.night.started
            ? "altered"
            : "normal";
    if (welcome?.isOpen()) nightAudio.pause();
    else void nightAudio.sync();
    document.body.classList.toggle(
      "reduced-motion",
      state.preferences.reduceMotion ||
        matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    voidSignal.sync();
    if (route === "chat") {
      promo.mount(route);
      voidWorld.leave();
      document.title = t("这周一定早睡（4） · 聊天", "Early nights, starting this week (4) · Chat");
      chat.mount(document.querySelector("#case-shell"), { focus: moveFocus, room: new URLSearchParams(location.hash.split("?")[1]||"").get("room") });
      ads.navigate();
      messenger.afterRender();
      story.afterRender();
      return;
    }
    chat.leave();
    if(messenger.restoreDOM()) {
      if(inVoid)voidWorld.mount(document.querySelector('#case-shell'),nextVoidFocus);
      evidenceDesk.decorate();ads.navigate();messenger.afterRender();voidSignal.sync();story.afterRender();return;
    }
    if (inVoid) {
      promo.mount(route);
      M.transition(state, "void", { action: "enter", now: Date.now() });
      save();
      document.title = "NO INDEX · Stillwater";
      document.querySelector("#case-shell").innerHTML = voidWorld.render();
      voidWorld.mount(document.querySelector("#case-shell"), nextVoidFocus);
      voidSignal.sync();
      evidenceDesk.decorate();
      nextVoidFocus = "";
      ads.navigate();
      messenger.afterRender();
      story.afterRender();
      if (moveFocus) {
        window.scrollTo(0, 0);
        document.querySelector("#case-shell").scrollTop = 0;
        document.querySelector("#content").focus({ preventScroll: true });
      }
      return;
    }
    voidWorld.leave();
    if (route === "rooms" && !state.notices.shown) {
      state.notices.shown = true;
      save();
    }
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    if (
      route === "reservations" &&
      M.has(state, "C2") &&
      params.get("record") === F.reservation
    ) {
      state.drafts.reservation = F.reservation;
      save();
    }
    if (
      route === "maintenance" &&
      M.has(state, "C6") &&
      params.get("record") === F.notice
    ) {
      state.drafts.maintenance = F.notice;
      save();
    }
    const valid = Object.hasOwn(M.routes, route),
      allowed = valid && M.canOpen(state, route);
    const placeholder = () =>
      views.heading(
        "STAFF ARCHIVE",
        t("旧档案目录", "Retained file index"),
        t(
          "本次查看过的文件列在这里。",
          "This index contains read-only material associated with the review.",
        ),
      ) + views.reference("notes", t("工作笔记", "Case Notes"));
    if (allowed && route === "closure" && !M.has(state, "C8")) {
      M.transition(state, "closure");
      save();
    }
    if (allowed && route === "mara" && !M.has(state, "C9")) {
      M.transition(state, "mara");
      save();
    }
    if (
      allowed &&
      ["rooms", "guestbook"].includes(route) &&
      params.get("copy") !== "original" &&
      state.night.started &&
      state.lastEnding !== "released"
    ) {
      M.transition(state, "night-observe-public", { page: route });
      save();
    }
    if(allowed && route==='staff'){M.transition(state,'desk-discover',{route});save();}
    if(allowed && route==='evidence-desk'){
      const requested=params.get('proof');
      if(requested)M.transition(state,'desk-ui',{op:'proof',key:requested});
      M.syncSources(state);save();
    }
    const content = allowed
      ? (
          {
            careers,
            "evidence-desk": evidenceDesk.render,
            forum: forum.render,
            ...views,
            ...nightViews,
            ...spaceViews,
            ...story.views.routes,
            ending: endingView,
          }[route] || placeholder
        )()
      : guarded(route);
    document.title =
      route === "forum"
        ? t("夜猫论坛 · 工作信息", "Night Owl BBS · Work notices")
        : route === "careers"
          ? "Stillwater Heritage Careers"
          : staff
            ? "Stillwater / Staff Archive"
            : "The Stillwater Hotel";
    if (route === "ending" && allowed) {
      const requested = new URLSearchParams(
        location.hash.split("?")[1] || "",
      ).get("view");
      const shown = state.endings.includes(requested)
        ? requested
        : state.lastEnding;
      if (shown === "auto-close")
        document.title =
          t("夜班审计员", "Night Audit Clerk") + " / " + F.temporary;
      if (shown === "released") document.title = "GAME OVER · Stillwater Hotel";
    }
    document.querySelector("#case-shell").innerHTML =
      `<header class="site-header"><a class="site-brand" href="#${route === "forum" ? "forum" : route === "careers" ? "careers" : staff ? "notes" : "hotel"}">${route === "forum" ? t('夜猫论坛<span class="bbs-subtitle">NIGHT OWL BBS</span>', 'Night Owl BBS<span class="bbs-subtitle">THE LATE THREAD</span>') : route === "careers" ? "Stillwater Heritage Careers" : staff ? "STILLWATER / STAFF ARCHIVE" : '<span class="hotel-brand-title">The Stillwater Hotel</span><span class="hotel-brand-subtitle">A FAMILIAR PLACE · SINCE 1987</span>'}</a><div class="site-utilities">${M.has(state,"C1") && site!=="forum"?a("notes",t("工作笔记","Case notes")):""}<button data-case-action="instructions" aria-haspopup="dialog">${t("游玩说明", "How to play")}</button><button data-case-action="save-settings" aria-haspopup="dialog">${t("存档与重置", "Saves & reset")}</button><a data-case-language href="${zh ? "index.html" : "index-zh.html"}${esc(location.search)}${esc(location.hash)}">${zh ? "English" : "简体中文"}</a></div></header>${
        route === "forum"
          ? '<nav class="forum-nav" aria-label="' +
            t("论坛分区", "Forum sections") +
            '">' +
            [
              ["chat", t("闲聊", "Chat")],
              ["work", t("工作信息", "Work notices")],
              ["web", t("老网站", "Old websites")],
              ["help", t("求助", "Help")],
            ]
              .map(([id, label]) => a("forum?section=" + id, label))
              .join("") +
            "</nav>"
          : route === "careers"
            ? '<nav class="careers-nav">' +
              a("careers", t("招聘信息", "Opportunities")) +
              "</nav>"
            : staff
              ? '<nav class="staff-nav">' +
                a("hotel", t("酒店目录", "Hotel index")) +
                a("notes", t("工作笔记", "Case Notes")) +
                a("evidence-desk", t("证据核对台", "Evidence desk")) +
                (M.canOpen(state,"staff")?a("staff", t("员工档案", "Staff archive")):"") +
                "</nav>"
              : '<nav class="hotel-nav">' +
                a("hotel", t("首页", "Home")) +
                a("rooms", t("客房", "Rooms")) +
                a("reservations", t("预订查询", "Reservations")) +
                a("contact", t("联系前台", "Contact")) +
                "</nav>"
      }<main id="content" tabindex="-1">${allowed && ["cameras", "terminal", "service-passage"].includes(route) ? nightViews.scareChoice() : ""}${allowed && staff && !["evidence-desk","ending"].includes(route)?evidenceDesk.goal(true):""}${content}${allowed&&route==="cameras"?evidenceDesk.hints("cameras"):""}${allowed&&route==="terminal"?evidenceDesk.hints("wiring"):""}${allowed&&route==="terminal"&&window.StillwaterVoidModel.ready(state.night)&&!M.promoChecked(state)?evidenceDesk.hints("promo"):""}</main>${siteFooter(site)}`;
    const walker = document.createTreeWalker(
      document.querySelector("#content"),
      NodeFilter.SHOW_TEXT,
    );
    const leaves = [];
    while (walker.nextNode())
      if (!walker.currentNode.parentElement.closest(".record-id,script,style"))
        leaves.push(walker.currentNode);
    for (const node of leaves) {
      const pattern = /(R-4829|A-06-17|TEMP-015|E-014)/g;
      if (!pattern.test(node.nodeValue)) continue;
      const fragment = document.createDocumentFragment();
      let start = 0;
      for (const match of node.nodeValue.matchAll(pattern)) {
        fragment.append(node.nodeValue.slice(start, match.index));
        const span = document.createElement("span");
        span.className = "record-id";
        span.textContent = match[0];
        fragment.append(span);
        start = match.index + match[0].length;
      }
      fragment.append(node.nodeValue.slice(start));
      node.replaceWith(fragment);
    }
    document.querySelectorAll("nav a").forEach((el) => {
      if (el.getAttribute("href") === "#" + route)
        el.setAttribute("aria-current", "page");
    });
    if (route === "night-audit" && allowed) comfort.signal();
    if (
      state.night.started &&
      state.lastEnding !== "released" &&
      route === "hotel"
    ) {
      document
        .querySelector(".daily-notice")
        ?.insertAdjacentHTML(
          "afterend",
          `<p class="document"><a href="#mirror">${t("客房目录有更新 · 查看", "Room directory updated · View current page")} →</a></p>`,
        );
    }
    evidenceDesk.decorate();
    ads.navigate();
    promo.mount(route);
    if (
      pendingEscape &&
      route === "ending" &&
      allowed &&
      state.lastEnding === "released"
    ) {
      pendingEscape = false;
      nightEvents.escape({ onComplete: finishFinalScene });
    }
    if (moveFocus) {
      window.scrollTo(0, 0);
      document.querySelector("#case-shell").scrollTop = 0;
      document.querySelector("#content").focus({ preventScroll: true });
    }
    if (route === "terminal" && pendingVoidHandover) {
      pendingVoidHandover = false;
      const handover = document.querySelector('[data-night-action=lock]:not(:disabled)')
        || document.querySelector('[data-ending=released]')
        || document.querySelector('[data-night-action=save]');
      handover?.scrollIntoView({ block: "center", behavior: "instant" });
      handover?.focus({ preventScroll: true });
    }
    messenger.afterRender();
    story.afterRender();
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest("a.skip")) {
      e.preventDefault();
      document.querySelector("#content")?.focus();
      document.querySelector("#content")?.scrollIntoView();
      return;
    }
    const nightControl = e.target.closest("[data-night-action]");
    if (nightControl) {
      const act = nightControl.dataset.nightAction;
      if (act === "settings") {
        comfort.open();
        return;
      }

      const payload = {
        cam: Number(nightControl.dataset.cam),
        pan: Number(nightControl.dataset.pan),
        link: Number(nightControl.dataset.link),
        node: Number(nightControl.dataset.node),
        position: nightControl.dataset.position,
        target: nightControl.dataset.target,
        enable: nightControl.dataset.enable === "true",
      };
      const result = M.transition(state, "night-" + act, payload);
      save();
      if (!result.ok) {
        const el = document.querySelector("#night-feedback");
        if (el) {
          el.className = "night-feedback-error";
          el.textContent = result.error === "void-first"
            ? t("还有一段画面未查看，入口在监控下方。", "An unlisted picture remains. Open it below the monitor first.")
            : [
            "night-cart",
            "night-cabinet",
            "night-power",
          ].includes(result.error)
            ? {
                "night-cart": t(
                  "推车挡住了柜门，先把它挪开。",
                  "Move the cart to reach the cabinet.",
                ),
                "night-cabinet": t(
                  "门锁的供电拉杆在维修柜内。",
                  "The supply lever is inside the cabinet.",
                ),
                "night-power": t(
                  "门锁没有通电。沿墙上的线回西侧维修柜检查。",
                  "The lock has no power. Follow its cable back to the west cabinet.",
                ),
              }[result.error]
            : result.error === "night-landmark"
              ? t(
                  "这两个机位的地标对不上。之前确认的连接已保留。",
                  "The landmarks do not match. Earlier connections are retained.",
                )
              : (() => {
                  const circuit = window.StillwaterNightModel.circuit(
                    state.night,
                  );
                  return !circuit.readable
                    ? t(
                        "未保存：录像线路没有接通。请检查 A 左侧到 F 右侧是否连成通路；当前接线不会丢失。",
                        "Not saved: the reel has no continuous path from the left of A to the right of F. Your wiring is retained.",
                      )
                    : !state.night.isolated
                      ? t(
                          "未保存：AUTO-WRITE 仍接着电源，请先切到“已隔离”。",
                          "Not saved: auto-write is still connected. Switch AUTO-WRITE to ISOLATED.",
                        )
                      : !state.night.manual
                        ? t(
                            "未保存：当前是 AUTO 模式，请切换为 MANUAL 后再保存。",
                            "Not saved: the panel is in AUTO mode. Select MANUAL to save the service configuration.",
                          )
                        : t(
                            "请先保存接线配置、恢复监控最后一帧，再锁定原始备份。",
                            "Save the configuration and restore the last camera frame before locking the archive.",
                          );
                })();
        }
        return;
      }
      nightAudio.effect(["camera", "pan"].includes(act) ? "camera" : ["door", "walk", "inspect"].includes(act) ? "door" : "ui");
      if (act === "door") {
        location.hash =
          state.night.passageRequired && !state.night.passage.complete
            ? "service-passage"
            : "terminal";
        return;
      }
      if (act === "inspect" && payload.target === "enter") {
        location.hash = "terminal";
        return;
      }
      render();
      if (act === "comfort") nightEvents.clear();
      if (result.event&&!(globalThis.StillwaterStoryV13?.active(state)&&result.event==='last-frame')) { nightAudio.silence(); nightEvents.present(result.event); }
      const match = [...document.querySelectorAll("[data-night-action]")].find(
        (el) =>
          el.dataset.nightAction === act &&
          (act !== "pan" ||
            (el.dataset.cam === nightControl.dataset.cam &&
              el.dataset.pan === nightControl.dataset.pan)) &&
          (act !== "rotate" || el.dataset.node === nightControl.dataset.node) &&
          (act !== "link" || el.dataset.link === nightControl.dataset.link) &&
          (act !== "inspect" || el.dataset.target === payload.target) &&
          (act !== "walk" || el.dataset.position === payload.position),
      );
      (match || document.querySelector("#content"))?.focus({
        preventScroll: true,
      });
      // A completed device operation hands off to its next real control.
      const nextControl = act === "lock"
        ? document.querySelector('[data-ending="released"]')
        : act === "save" || (act === "frame" && state.night.saved && !state.night.locked)
          ? state.night.frame && !window.StillwaterVoidModel.finished(state.night)
            ? document.querySelector('[data-unlisted-entry]') || document.querySelector('[data-promo-action=source]')
            : document.querySelector(`[data-night-action="${state.night.frame ? "lock" : "frame"}"]`)
          : null;
      if (nextControl) {
        nextControl.scrollIntoView({ block: "center", behavior: "instant" });
        nextControl.focus({ preventScroll: true });
      }
      return;
    }
    const action = e.target.closest("[data-case-action]")?.dataset.caseAction;
    if (
      action === "sync-records" &&
      !phaseTransition.isActive() &&
      perform("night-start")
    ) {
      phaseTransition.begin();
      return;
    }
    if (action === "instructions") welcome.open();
    if (action === "settings") {
      nightEvents.clear();
      comfort.open();
    }
    if (action === "toggle-sound") void comfort.toggleSound();
    if (action === "save-settings") {
      nightEvents.clear();
      comfort.open({ save: true });
    }
    if (action === "photo-version") {
      state.drafts.photoVersion =
        e.target.closest("[data-version]").dataset.version === "revision"
          ? "revision"
          : "original";
      save();
      render();
      const details = document.querySelector(".annotation-comparison");
      if (details) details.open = true;
    }
    if (action === "sample" && perform("sample")) {
      if(chat.storyState().openingEdition==='v12'&&chat.hasVisitedForum()&&state.evidence.length===1&&perform('story-v13-begin'))render();
      else location.hash = "reservations";
    }
    if (action === "read-key" && perform("message")) render();
    if (action === "inspect-service" && perform("inspect-service")) {
      render();
      document
        .querySelector("#service-classification")
        ?.scrollIntoView({ block: "center" });
    }
    if (action === "move-log") {
      const control = e.target.closest("[data-log-id]");
      const index = state.drafts.auditOrder.indexOf(control.dataset.logId),
        next = index + Number(control.dataset.direction);
      if (index >= 0 && next >= 0 && next < state.drafts.auditOrder.length) {
        [state.drafts.auditOrder[index], state.drafts.auditOrder[next]] = [
          state.drafts.auditOrder[next],
          state.drafts.auditOrder[index],
        ];
        save();
        render();
        const candidate = document.querySelector(
          `[data-log-id="${control.dataset.logId}"][data-direction="${control.dataset.direction}"]`,
        );
        (candidate?.disabled
          ? document.querySelector(
              `[data-log="${control.dataset.logId}"] button:not(:disabled)`,
            )
          : candidate
        )?.focus({ preventScroll: true });
        document.querySelector("#case-status").textContent = t(
          "排列已保存。",
          "Record position changed.",
        );
      }
    }
    if (action === "refresh-queue" && perform("queue")) render();
    if (action === "edit-evidence" && perform("edit-evidence")) render();
    if (action === "close-case") {
      const ending = e.target.closest("[data-ending]").dataset.ending;
      const firstEscape =
        ending === "released" && !state.endings.includes("released");
      if (perform("ending", { ending })) {
        pendingEscape = firstEscape;
        finalScenePending = firstEscape;
        if (currentRoute() === "ending") render(true);
        else location.hash = "ending";
      }
    }
    if (action === "dismiss-notice") {
      state.notices.dismissed = true;
      save();
      render();
    }
    if (action === "reopen-notice") {
      state.notices.dismissed = false;
      save();
      location.hash = "rooms";
    }
  });
  document.addEventListener("click", (event)=>evidenceDesk.click(event));
  document.addEventListener("change", (event)=>evidenceDesk.change(event));
  document.addEventListener("submit", (event)=>evidenceDesk.submit(event));
  document.addEventListener("input", (e) => {
    if (e.target.id === "reservation-reference")
      state.drafts.reservation = e.target.value.slice(0, 32);
    else if (e.target.id === "maintenance-reference")
      state.drafts.maintenance = e.target.value.slice(0, 32);
    else return;
    save();
  });
  document.addEventListener("change", (e) => {
    if (e.target.name === "assessment")
      state.drafts.auditAssessment = e.target.value;
    else if (e.target.name === "difference")
      state.drafts.revisionSelection = [
        ...document.querySelectorAll("[name=difference]:checked"),
      ].map((el) => el.value);
    else if (e.target.name === "claim") {
      state.drafts.finalSelection = [
        ...document.querySelectorAll("[name=claim]:checked"),
      ].map((el) => el.value);
      state.completed.finalEvidence = false;
    } else return;
    save();
  });
  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (form.id === "job-search") {
      e.preventDefault();
      window.StillwaterCareers.filter(form);
    }

    if (form.id === "reservation-search") {
      e.preventDefault();
      state.drafts.reservation = form.reference.value.slice(0, 32);
      if (
        perform(
          "reservation",
          { reference: form.reference.value },
          "reservation-error",
        )
      )
        render();
      else
        document
          .querySelector("#reservation-result")
          ?.setAttribute("hidden", "");
    }
    if (form.id === "inventory-check") {
      e.preventDefault();
      if (perform("inventory", { room: form.room.value }, "inventory-error"))
        render();
    }
    if (form.id === "service-classification") {
      e.preventDefault();
      if (
        perform(
          "classify-service",
          { classification: form.classification.value },
          "service-error",
        )
      )
        render();
    }
    if (form.id === "night-audit-form") {
      e.preventDefault();
      if (
        perform(
          "audit-order",
          { order: state.drafts.auditOrder },
          "audit-error",
        )
      )
        render();
    }
    if (form.id === "revision-form") {
      e.preventDefault();
      if (
        perform(
          "revisions",
          { selection: state.drafts.revisionSelection },
          "revision-error",
        )
      )
        render();
    }
    if (form.id === "final-evidence-form") {
      e.preventDefault();
      if (
        perform(
          "evidence",
          { confirmed: true },
          "evidence-error",
        )
      )
        render();
    }
    if (form.id === "maintenance-search") {
      e.preventDefault();
      state.drafts.maintenance = form.reference.value.slice(0, 32);
      if (
        perform(
          "maintenance",
          { reference: form.reference.value },
          "maintenance-error",
        )
      )
        render();
      else
        document
          .querySelector("#maintenance-result")
          ?.setAttribute("hidden", "");
    }
  });
  let rippleFrame = null;
  document.addEventListener(
    "pointermove",
    (event) => {
      const frame = event.target.closest(".cctv-frame[data-cctv-phase]");
      const allowed =
        frame &&
        state.night.started &&
        !comfort.reduced() &&
        matchMedia("(hover:hover) and (pointer:fine)").matches;
      if (rippleFrame && rippleFrame !== frame)
        rippleFrame.classList.remove("ripple-active");
      rippleFrame = allowed ? frame : null;
      if (!allowed) return;
      let ripple = frame.querySelector(".cctv-ripple");
      if (!ripple) {
        ripple = document.createElement("span");
        ripple.className = "cctv-ripple";
        ripple.setAttribute("aria-hidden", "true");
        frame.append(ripple);
      }
      const bounds = frame.getBoundingClientRect();
      frame.style.setProperty("--ripple-x", event.clientX - bounds.left + "px");
      frame.style.setProperty("--ripple-y", event.clientY - bounds.top + "px");
      frame.classList.add("ripple-active");
    },
    { passive: true },
  );
  document.addEventListener(
    "pointerout",
    (event) => {
      if (rippleFrame && !rippleFrame.contains(event.relatedTarget)) {
        rippleFrame.classList.remove("ripple-active");
        rippleFrame = null;
      }
    },
    { passive: true },
  );
  window.addEventListener("hashchange", () => render(true));
  render();
  phaseTransition.resume();
  welcome.start();
})();
