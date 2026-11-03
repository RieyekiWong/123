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
  const views = window.StillwaterCaseViews({ t, esc, getState: () => state });
  const nightViews = window.StillwaterNightViews({ t, getState: () => state });
  const spaceViews = window.StillwaterSpaceViews({ t, getState: () => state });
  const nightAudio = window.StillwaterCaseAudio.create({
    getState: () => state,
    getRoute: currentRoute,
  });
  const forum = window.StillwaterForum({ t, esc, getState: () => state });
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
    if (route !== "forum") prologue.entered = true;
    prologue.lastRoute = location.hash.slice(1) || route;
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
      : prologue.entered
        ? "careers"
        : "forum";
    history.replaceState(
      null,
      "",
      location.pathname + location.search + "#" + next,
    );
  }
  const phaseTransition = window.StillwaterCaseTransition.create({
    getState: () => state,
    t,
    onBegin: () => nightAudio.stop(),
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
      void nightAudio.sync();
    },
    reset: () => {
      phaseTransition.cancel();
      pendingEscape = false;
      finalScenePending = false;
      welcome?.forget();
      nightEvents.clear();
      nightAudio.stop();
      const preferences = { ...state.preferences, sound: false };
      state = M.fresh();
      state.preferences = preferences;
      save();
      prologue = { schema: 1, entered: false, lastRoute: "forum" };
      try {
        localStorage.setItem(PROLOGUE, JSON.stringify(prologue));
      } catch {}
      history.replaceState(
        null,
        "",
        location.pathname + location.search + "#forum",
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
  const errors = {
    sample: [
      "缺少样本编号。可返回招聘页查看。",
      "Return to the role sample and check its original reference.",
    ],
    reservation: [
      "未找到预订，请检查编号。",
      "No record found. Check the reference on the original sample.",
    ],
    booking: ["还没找到对应的预订单。", "Identify the retained booking first."],
    inventory: [
      "房号与预订单不符。",
      "This is not the assignment on the original booking. Check that record.",
    ],
    "inventory-first": [
      "尚未确认预订单上的房号。",
      "Associate the booking with the guest inventory first.",
    ],
    "message-first": [
      "尚未打开对应的住客留言。",
      "Review the key entry associated with the booking.",
    ],
    "inspect-first": [
      "尚未打开服务区域登记卡。",
      "Open the position card on the floor plan first.",
    ],
    classification: [
      "所选用途与登记卡不符。",
      "That classification does not match the position card.",
    ],
    "service-first": [
      "服务区域用途尚未确认。",
      "Check the position classification on the floor plan first.",
    ],
    maintenance: [
      "未找到维修单，请检查公告编号。",
      "No docket found. Check the original access notice reference.",
    ],
    "maintenance-first": [
      "尚未查到对应的维修单。",
      "The source records are not yet associated with this booking. Check its maintenance docket.",
    ],
    "audit-order": [
      "日期顺序有误。请检查每条记录的时间。",
      "The source timestamps do not match this sequence. Check each original timestamp.",
    ],
    "audit-assessment": [
      "现有记录不能支持这一判断。",
      "That finding is not supported by the records.",
    ],
    "audit-first": [
      "当晚记录尚未核对。",
      "The personnel file requires a reconciled night-audit record.",
    ],
    "revision-unchanged": [
      "选中了未修改的项目。请对照两栏内容。",
      "An unchanged field was selected. Compare the versions row by row.",
    ],
    "revision-missing": [
      "有修改项尚未选中。",
      "A changed field is still unrecorded. Check both originals.",
    ],
    "revisions-first": [
      "修改记录尚未核对。",
      "Associate this addendum with the revision record first.",
    ],
    "closure-first": [
      "请从停业通知的附件打开这份草稿。",
      "Read the closure notice to establish the note’s historical context.",
    ],
    "evidence-incomplete": [
      "资料不全，暂时无法提交。",
      "A source remains unreconciled. A closing decision cannot be submitted yet. Reopen originals from Case Notes.",
    ],
    "evidence-occupancy": [
      "没有记录能确认住客实际入住。",
      "This finding needs a matching record.",
    ],
    "evidence-operating": [
      "该说法与停业通知不符。",
      "This finding does not match the notice.",
    ],
    "evidence-consent": [
      "该说法与 Mara 的原备注不符。",
      "Check the authorization in Mara’s original note.",
    ],
    "evidence-missing": [
      "请选择三项有原始记录支持的说法。",
      "Submit only the three findings that can be cross-checked against the originals.",
    ],
    unknown: [
      "操作未完成，已保存的资料不受影响。",
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
      nightAudio.stop();
    },
    onContinue: () => {
      render();
      void nightAudio.sync();
    },
  });
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
    if (state.lastEnding === "released")
      return (
        views.heading(
          "STILLWATER HERITAGE RECORDS",
          t("该岗位已撤下", "This vacancy has been withdrawn"),
          t("目前没有可申请的岗位。", "No roles are currently available."),
        ) + views.reference("forum", t("返回论坛", "Back to the forum"))
      );
    return `<section class="career-heading"><p class="kicker">STILLWATER HERITAGE RECORDS</p><h1>${t("旧预订资料整理兼职", "A careful eye for the historical record.")}</h1><p>${t("远程工作，需能使用电脑查看表格和扫描件。", "Remote opportunities in archive reconciliation.")}</p></section><form id="job-search" class="job-search"><label for="job-keyword">${t("搜索岗位", "Search roles")}</label><div><input id="job-keyword" name="keyword" type="search" placeholder="${t("职位名称或工作内容", "Role or area of work")}"><select name="work" aria-label="${t("工作方式", "Work arrangement")}"><option value="remote">${t("远程", "Remote")}</option><option value="onsite">${t("现场", "On site")}</option></select><button type="submit">${t("搜索", "Search")}</button></div></form><p id="job-result" role="status"></p><article class="job-card" id="archive-job"><p class="kicker">${t("合同制 · 远程", "CONTRACT · REMOTE")}</p><h2>${t("预订档案整理员", "Night Archive Reconciliation Assistant")}</h2><p>${t("帮一家湖畔旅馆整理以前的预订单。", "Help a lakeside hotel sort its older reservation records.")}</p><p>${t("申请前可先做一份工作样本，无需注册。", "Start with a short record-matching sample.")}</p><p>${t("样本档案", "Sample case")}: <span class="reference">${F.reservation}</span></p><button class="primary" data-case-action="sample">${t("查看工作样本", "Review sample record")} →</button><details><summary>${t("工作内容", "Role details & company information")}</summary><p>${t("对照旧预订单、客房记录和修改记录，看看有没有对不上的地方。这份样本不用注册，也不用上传简历。", "Review sources, reconcile timestamps, compare revisions and retain unresolved entries. No CV, account or contact information is needed for the sample.")}</p><p>Stillwater Heritage Records · ${F.recruitment}</p></details></article>`;
  }
  function guarded(route) {
    const recovery = M.recovery(state, route);
    return (
      views.heading(
        "RECORD INDEX",
        t("文件暂时打不开", "Record not currently available"),
        t(
          "暂时没有这份文件的访问权限。请从相关资料打开。",
          "This original is not yet associated with the current review. Identify its source record first.",
        ),
      ) + views.reference(recovery, t("查看相关文件", "Open the source record"))
    );
  }
  function currentRoute() {
    return location.hash.slice(1).split("?")[0] || "forum";
  }
  function siteFooter(site) {
    const warning = storageFailed
      ? `<p role="status">${t("浏览器无法保存进度，当前标签页仍可继续操作。", "Storage is unavailable; the current tab remains playable.")}</p>`
      : "";
    const credits = `<button class="footer-settings" data-ad-action="credits">${t("图片鸣谢", "Photo acknowledgements")}</button>`;
    const folder = `<button class="footer-settings" data-ad-action="folder">${t("我的广告夹", "My ad folder")}</button>`;
    if (site === "forum")
      return `<footer class="forum-footer"><p class="footer-site-name">NIGHT OWL BBS · ${t("夜猫论坛", "Night Owl BBS")}</p><div class="footer-links">${a("forum", t("论坛首页", "Forum home"))} · ${a("forum?section=work", t("工作信息", "Work notices"))} · ${a("forum?section=web", t("老网站", "Old websites"))} · ${folder} · ${credits}</div><p>${t("虚构社区，帖子与商家均为作品内容，不接受真实交易。", "A fictional community. Posts and shops are part of the work; no real transactions are accepted.")}</p>${warning}</footer>`;
    if (site === "careers")
      return `<footer class="careers-footer"><p class="footer-site-name">STILLWATER HERITAGE RECORDS</p><div class="footer-links">${a("careers", t("招聘信息", "Opportunities"))} · ${a("forum", t("回论坛看看", "Back to the forum"))} · ${folder} · ${credits}</div><p>${t("虚构职位展示，不接收真实简历、申请或付款。", "A fictional job listing. No real CVs, applications or payments are accepted.")}</p>${warning}</footer>`;
    return `<footer><p>${t("虚构互动作品。酒店、招聘和资料均为剧情，不接收真实申请或付款。", "A fictional interactive work. The hotel, role and records are part of the story. No real applications or payments are accepted.")}</p>${storageFailed ? `<p role="status">${t("浏览器无法保存进度，当前标签页仍可继续操作。", "Storage is unavailable; the current tab remains playable.")}</p>` : ""}${a("forum", t("回论坛看看", "Back to the forum"))} · ${a("careers", t("返回招聘页", "Careers"))} · ${a("guestbook", t("住客留言", "Guestbook"))} · ${a("history", t("旅馆历史", "History"))} · ${a("gallery", t("旅馆相册", "Photo gallery"))} · ${a("notices", t("公告栏", "Notices"))} · ${a("staff", t("员工档案", "Staff archive"))} · ${a("notes", t("工作笔记", "Case Notes"))} · <button class="footer-settings" data-case-action="toggle-sound" aria-pressed="${state.preferences.sound}">${state.preferences.sound ? t("声音：开启", "Sound: On") : t("声音：关闭", "Sound: Off")}</button> · <button class="footer-settings" data-case-action="settings">${t("声音与设置", "Sound & settings")}</button> · <button class="footer-settings" data-ad-action="folder">${t("我的广告夹", "My ad folder")}</button> · ${a("credits", t("图片来源", "Image credits"))}</footer>`;
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
      pending: shown === "released" && finalScenePending,
      stored: !storageFailed,
    }) + (shown === "released" ? nightViews.released() : views.ending());
  }
  function finishFinalScene() {
    finalScenePending = false;
    if (currentRoute() === "ending")
      window.StillwaterEnding.reveal({
        focus: !document.hidden && !document.querySelector("dialog[open]"),
      });
  }
  function render(moveFocus = false) {
    let route = currentRoute();
    if (route === "home") route = "hotel";
    const staff = [
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
    ].includes(route);
    const site =
      route === "forum"
        ? "forum"
        : route === "careers"
          ? "careers"
          : staff
            ? "staff"
            : "hotel";
    rememberRoute(route);
    document.body.dataset.site = site;
    document.body.dataset.anomaly =
      state.lastEnding === "released"
        ? "resolved"
        : state.night.door
          ? "terminal"
          : state.night.started
            ? "altered"
            : "normal";
    if (phaseTransition.isActive() || welcome?.isOpen()) nightAudio.stop();
    else void nightAudio.sync();
    document.body.classList.toggle(
      "reduced-motion",
      state.preferences.reduceMotion ||
        matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
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
          "这里只列出本次已打开的文件。",
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
    const content = allowed
      ? (
          {
            careers,
            forum: forum.render,
            ...views,
            ...nightViews,
            ...spaceViews,
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
      `<header class="site-header"><a class="site-brand" href="#${route === "forum" ? "forum" : route === "careers" ? "careers" : staff ? "staff" : "hotel"}">${route === "forum" ? t('夜猫论坛<span class="bbs-subtitle">NIGHT OWL BBS</span>', 'Night Owl BBS<span class="bbs-subtitle">THE LATE THREAD</span>') : route === "careers" ? "Stillwater Heritage Careers" : staff ? "STILLWATER / STAFF ARCHIVE" : '<span class="hotel-brand-title">The Stillwater Hotel</span><span class="hotel-brand-subtitle">A FAMILIAR PLACE · SINCE 1987</span>'}</a><div class="site-utilities"><button data-case-action="instructions" aria-haspopup="dialog">${t("游玩说明", "How to play")}</button><button data-case-action="save-settings" aria-haspopup="dialog">${t("存档与重置", "Saves & reset")}</button><a data-case-language href="${zh ? "index.html" : "index-zh.html"}${esc(location.search)}${esc(location.hash)}">${zh ? "English" : "简体中文"}</a></div></header>${
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
                a("staff", t("员工档案", "Staff archive")) +
                "</nav>"
              : '<nav class="hotel-nav">' +
                a("hotel", t("首页", "Home")) +
                a("rooms", t("客房", "Rooms")) +
                a("reservations", t("预订查询", "Reservations")) +
                a("contact", t("联系前台", "Contact")) +
                "</nav>"
      }<main id="content" tabindex="-1">${allowed && ["cameras", "terminal", "service-passage"].includes(route) ? nightViews.scareChoice() : ""}${content}</main>${siteFooter(site)}`;
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
          `<p class="document"><a href="#mirror">${t("客房目录已更新 · 查看当前页面", "Room directory updated · View current page")} →</a></p>`,
        );
    }
    ads.navigate();
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
          el.textContent = [
            "night-cart",
            "night-cabinet",
            "night-power",
          ].includes(result.error)
            ? {
                "night-cart": t(
                  "先把推车挪开，柜门才能打开。",
                  "Move the cart to reach the cabinet.",
                ),
                "night-cabinet": t(
                  "供电拉杆在维修柜里。",
                  "The supply lever is inside the cabinet.",
                ),
                "night-power": t(
                  "门锁没通电。沿线路回西侧维修柜看看。",
                  "The lock has no power. Follow its cable back to the west cabinet.",
                ),
              }[result.error]
            : result.error === "night-landmark"
              ? t(
                  "两路画面的地标对不上。已确认的连接还在。",
                  "The landmarks do not match. Earlier connections are retained.",
                )
              : (() => {
                  const circuit = window.StillwaterNightModel.circuit(
                    state.night,
                  );
                  return !circuit.readable
                    ? t(
                        "未保存：录像线路还没接通。A 的左侧输入必须连到 F 的右侧出口。当前接线已保留。",
                        "Not saved: the reel has no continuous path from the left of A to the right of F. Your wiring is retained.",
                      )
                    : !state.night.isolated
                      ? t(
                          "未保存：自动回写电源仍然连接。请把 AUTO-WRITE 切到“已隔离”。",
                          "Not saved: auto-write is still connected. Switch AUTO-WRITE to ISOLATED.",
                        )
                      : !state.night.manual
                        ? t(
                            "未保存：当前为自动模式。切换到 MANUAL 后才能保存检修配置。",
                            "Not saved: the panel is in AUTO mode. Select MANUAL to save the service configuration.",
                          )
                        : t(
                            "锁定前请先保存配置，并恢复监控最后一帧。",
                            "Save the configuration and restore the last camera frame before locking the archive.",
                          );
                })();
        }
        return;
      }
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
      if (result.event) nightEvents.present(result.event);
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
          ? document.querySelector(`[data-night-action="${state.night.frame ? "lock" : "frame"}"]`)
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
    if (action === "sample" && perform("sample"))
      location.hash = "reservations";
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
      const keyword = form.keyword.value.trim().toLowerCase();
      const searchable = document
        .querySelector("#archive-job")
        .textContent.toLowerCase();
      const match =
        form.work.value === "remote" &&
        (!keyword ||
          keyword.split(/\s+/).every((word) => searchable.includes(word)));
      document.querySelector("#archive-job").hidden = !match;
      document.querySelector("#job-result").textContent = match
        ? t("找到 1 个岗位。", "1 opportunity found.")
        : t(
            "没有匹配岗位，请调整筛选。",
            "No matching roles. Adjust the search.",
          );
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
          "audit",
          { order: state.drafts.auditOrder, assessment: form.assessment.value },
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
          { selection: state.drafts.finalSelection },
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
