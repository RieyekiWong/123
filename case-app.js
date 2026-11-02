(() => {
  "use strict";
  const D = window.StillwaterCaseData,
    M = window.StillwaterCaseState,
    F = D.facts;
  const zh = document.documentElement.lang === "zh-CN",
    t = (a, b) => (zh ? a : b);
  const KEY = "stillwater-case:v2";
  let state = M.fresh(),
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
  const comfort = window.StillwaterCaseComfort.create({
    getState: () => state,
    save,
    onPreference: () =>
      document.body.classList.toggle("reduced-motion", comfort.reduced()),
    reset: () => {
      const preferences = { ...state.preferences, sound: false };
      state = M.fresh();
      state.preferences = preferences;
      save();
      location.hash = "careers";
      render(true);
    },
  });
  const errors = {
    sample: [
      "先去看工作样本，上面有编号。",
      "Return to the role sample and check its original reference.",
    ],
    reservation: [
      "没查到这条。看看编号有没有输错。",
      "No record found. Check the reference on the original sample.",
    ],
    booking: ["还没找到对应的预订单。", "Identify the retained booking first."],
    inventory: [
      "选的房号和预订单对不上。",
      "This is not the assignment on the original booking. Check that record.",
    ],
    "inventory-first": [
      "先确认要查的是哪间房。",
      "Associate the booking with the guest inventory first.",
    ],
    "message-first": [
      "还有一条住客留言没看。",
      "Review the key entry associated with the booking.",
    ],
    "inspect-first": [
      "先点一下平面图上的灰色区域。",
      "Open the position card on the floor plan first.",
    ],
    classification: [
      "这个分类和登记卡对不上。",
      "That classification does not match the position card.",
    ],
    "service-first": [
      "平面图上的登记卡还没看完。",
      "Check the position classification on the floor plan first.",
    ],
    maintenance: [
      "没有这张维修单，看看公告上的编号。",
      "No docket found. Check the original access notice reference.",
    ],
    "maintenance-first": [
      "维修单还没核对完。",
      "The source records are not yet associated with this booking. Check its maintenance docket.",
    ],
    "audit-order": [
      "顺序还是不对，再看看每条记录的时间。",
      "The source timestamps do not match this sequence. Check each original timestamp.",
    ],
    "audit-assessment": [
      "这个判断还缺依据。",
      "That finding is not supported by the records.",
    ],
    "audit-first": [
      "当晚记录还没核对完。",
      "The personnel file requires a reconciled night-audit record.",
    ],
    "revision-unchanged": [
      "有一项其实没改。再对一遍左右两栏。",
      "An unchanged field was selected. Compare the versions row by row.",
    ],
    "revision-missing": [
      "还有改过的地方没勾出来。",
      "A changed field is still unrecorded. Check both originals.",
    ],
    "revisions-first": [
      "修改记录还没核对完。",
      "Associate this addendum with the revision record first.",
    ],
    "closure-first": [
      "这份草稿附在通知后面。",
      "Read the closure notice to establish the note’s historical context.",
    ],
    "evidence-incomplete": [
      "还有文件没看完，暂时不能提交。",
      "A source remains unreconciled. A closing decision cannot be submitted yet. Reopen originals from Case Notes.",
    ],
    "evidence-occupancy": [
      "这一条还缺能对得上的记录。",
      "This finding needs a matching record.",
    ],
    "evidence-operating": [
      "这一条和通知内容对不上。",
      "This finding does not match the notice.",
    ],
    "evidence-consent": [
      "这一条和 Mara 写的不一样。",
      "Check the authorization in Mara’s original note.",
    ],
    "evidence-missing": [
      "选三条有记录能证明的事。",
      "Submit only the three findings that can be cross-checked against the originals.",
    ],
    unknown: [
      "操作没有成功，文件还在。",
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
    return `<section class="career-heading"><p class="kicker">STILLWATER HERITAGE RECORDS</p><h1>${t("旧档案整理，远程兼职。", "A careful eye for the historical record.")}</h1><p>${t("工作地点不限，有电脑就能做。", "Remote opportunities in archive reconciliation.")}</p></section><form id="job-search" class="job-search"><label for="job-keyword">${t("搜索岗位", "Search roles")}</label><div><input id="job-keyword" name="keyword" type="search" placeholder="${t("职位名称或工作内容", "Role or area of work")}"><select name="work" aria-label="${t("工作方式", "Work arrangement")}"><option value="remote">${t("远程", "Remote")}</option><option value="onsite">${t("现场", "On site")}</option></select><button type="submit">${t("搜索", "Search")}</button></div></form><p id="job-result" role="status"></p><article class="job-card" id="archive-job"><p class="kicker">${t("合同制 · 远程", "CONTRACT · REMOTE")}</p><h2>${t("旧预订资料整理员", "Night Archive Reconciliation Assistant")}</h2><p>${t("帮一家湖畔旅馆整理以前的预订单。", "Help a lakeside hotel sort its older reservation records.")}</p><p>${t("想知道具体做什么？先试一份样本。", "Start with a short record-matching sample.")}</p><p>${t("样本档案", "Sample case")}: <span class="reference">${F.reservation}</span></p><button class="primary" data-case-action="sample">${t("试做一份", "Review sample record")} →</button><details><summary>${t("工作内容", "Role details & company information")}</summary><p>${t("对照旧预订单、客房记录和修改记录，看看有没有对不上的地方。这份样本不用注册，也不用上传简历。", "Review sources, reconcile timestamps, compare revisions and retain unresolved entries. No CV, account or contact information is needed for the sample.")}</p><p>Stillwater Heritage Records · ${F.recruitment}</p></details></article>`;
  }
  function guarded(route) {
    const recovery = M.recovery(state, route);
    return (
      views.heading(
        "RECORD INDEX",
        t("文件暂时打不开", "Record not currently available"),
        t(
          "前面的资料还没核对完。先看看这份文件从哪里来的。",
          "This original is not yet associated with the current review. Identify its source record first.",
        ),
      ) + views.reference(recovery, t("查看相关文件", "Open the source record"))
    );
  }
  function currentRoute() {
    return location.hash.slice(1).split("?")[0] || "forum";
  }
  function render(moveFocus = false) {
    let route = currentRoute();
    if (route === "home") route = "hotel";
    if (["below", "surveillance", "employees", "guide"].includes(route)) {
      location.replace(
        (zh ? "classic-zh.html" : "classic.html") + location.hash,
      );
      return;
    }
    const staff = [
      "night-audit",
      "staff",
      "revisions",
      "closure",
      "mara",
      "review",
      "ending",
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
        t("旧文件目录", "Retained file index"),
        t(
          "这里只能查看这次工作中已经打开的文件。",
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
    const content = allowed
      ? ({ careers, forum: forum.render, ...views }[route] || placeholder)()
      : guarded(route);
    document.title =
      route === "forum"
        ? t("夜猫论坛 · 工作信息", "Night Owl BBS · Work notices")
        : route === "careers"
          ? "Stillwater Heritage Careers"
          : staff
            ? "Stillwater / Staff Archive"
            : "The Stillwater Hotel · 2006";
    if (route === "ending" && allowed) {
      const requested = new URLSearchParams(
        location.hash.split("?")[1] || "",
      ).get("view");
      const shown = state.endings.includes(requested)
        ? requested
        : state.lastEnding;
      if (shown === "auto-close")
        document.title =
          t("夜审登记员", "Night Audit Clerk") + " / " + F.temporary;
    }
    document.querySelector("#case-shell").innerHTML =
      `<header class="site-header"><a class="site-brand" href="#${route === "forum" ? "forum" : route === "careers" ? "careers" : staff ? "staff" : "hotel"}">${route === "forum" ? t('夜猫论坛<span class="bbs-subtitle">NIGHT OWL BBS</span>', 'Night Owl BBS<span class="bbs-subtitle">THE LATE THREAD</span>') : route === "careers" ? "Stillwater Heritage Careers" : staff ? "STILLWATER / STAFF ARCHIVE" : "The Stillwater Hotel"}</a><a data-case-language href="${zh ? "index.html" : "index-zh.html"}${esc(location.hash)}">${zh ? "English" : "简体中文"}</a></header>${
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
      }<main id="content" tabindex="-1">${content}</main><footer><p>${t("虚构互动作品。酒店、招聘和资料均为剧情，不接收真实申请或付款。", "A fictional interactive work. The hotel, role and records are part of the story. No real applications or payments are accepted.")}</p>${storageFailed ? `<p role="status">${t("目前无法保存进度。这个页面暂时还能继续用。", "Storage is unavailable; the current tab remains playable.")}</p>` : ""}${a("forum", t("回论坛看看", "Back to the forum"))} · ${a("careers", t("返回招聘页", "Careers"))} · ${a("guestbook", t("住客留言", "Guestbook"))} · ${a("history", t("旅馆历史", "History"))} · ${a("notices", t("公告栏", "Notices"))} · ${a("staff", t("员工档案", "Staff archive"))} · ${a("notes", t("工作笔记", "Case Notes"))} · <button class="footer-settings" data-case-action="settings">${t("声音与设置", "Sound & settings")}</button> · <button class="footer-settings" data-ad-action="folder">${t("我的广告夹", "My ad folder")}</button> · ${a("credits", t("图片来源", "Image credits"))} · <a href="${zh ? "classic-zh.html" : "classic.html"}">${t("上一版与原存档", "Previous edition & saved stay")}</a></footer>`;
    document.querySelectorAll("nav a").forEach((el) => {
      if (el.getAttribute("href") === "#" + route)
        el.setAttribute("aria-current", "page");
    });
    if (route === "night-audit" && allowed) comfort.signal();
    ads.navigate();
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
    const action = e.target.closest("[data-case-action]")?.dataset.caseAction;
    if (action === "settings") comfort.open();
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
          "已调整记录位置。",
          "Record position changed.",
        );
      }
    }
    if (action === "refresh-queue" && perform("queue")) render();
    if (action === "edit-evidence" && perform("edit-evidence")) render();
    if (action === "close-case") {
      const ending = e.target.closest("[data-ending]").dataset.ending;
      if (perform("ending", { ending })) {
        location.hash = "ending";
        if (currentRoute() === "ending") render();
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
  window.addEventListener("hashchange", () => render(true));
  render();
})();
