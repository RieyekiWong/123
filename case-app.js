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
      "请回到岗位样本核对原件编号。",
      "Return to the role sample and check its original reference.",
    ],
    reservation: [
      "未找到该编号。请核对原样本中的档案引用。",
      "No record found. Check the reference on the original sample.",
    ],
    booking: [
      "请先找到对应的留存预订。",
      "Identify the retained booking first.",
    ],
    inventory: [
      "这不是原预订单上的分配房号。请回看原记录。",
      "This is not the assignment on the original booking. Check that record.",
    ],
    "inventory-first": [
      "这条留言需与对应房型目录关联。",
      "Associate the booking with the guest inventory first.",
    ],
    "message-first": [
      "请核对该预订关联的钥匙留言。",
      "Review the key entry associated with the booking.",
    ],
    "inspect-first": [
      "请先打开平面图上的位置登记卡。",
      "Open the position card on the floor plan first.",
    ],
    classification: [
      "位置卡记录的是服务用途，门牌和钥匙套不能证明真实入住。",
      "The card records a service use. A label or sleeve alone cannot establish occupancy.",
    ],
    "service-first": [
      "请先核对平面图中的位置属性。",
      "Check the position classification on the floor plan first.",
    ],
    maintenance: [
      "未找到这份维修单。请核对原通告编号。",
      "No docket found. Check the original access notice reference.",
    ],
    "maintenance-first": [
      "来源记录尚未关联到这笔预订，请核对原维修单。",
      "The source records are not yet associated with this booking. Check its maintenance docket.",
    ],
    "audit-order": [
      "来源时间与当前顺序不一致。请按各原件的时间戳核对。",
      "The source timestamps do not match this sequence. Check each original timestamp.",
    ],
    "audit-assessment": [
      "02:50 的客房部记录证明的是房间状态，不是入住人的身份或去向。",
      "The 02:50 housekeeping record establishes room condition, not a person’s identity or location.",
    ],
    "audit-first": [
      "人员资料须关联已复核的夜审记录。",
      "The personnel file requires a reconciled night-audit record.",
    ],
    "revision-unchanged": [
      "勾选项中含有未被改写的字段，请逐行对照两个版本。",
      "An unchanged field was selected. Compare the versions row by row.",
    ],
    "revision-missing": [
      "仍有改写字段未记录，请核对两份原件。",
      "A changed field is still unrecorded. Check both originals.",
    ],
    "revisions-first": [
      "这份续页需关联修订记录。",
      "Associate this addendum with the revision record first.",
    ],
    "closure-first": [
      "请先查阅停止营业通知，核对原备注的时间背景。",
      "Read the closure notice to establish the note’s historical context.",
    ],
    "evidence-incomplete": [
      "仍有来源未核对，当前不能提交结案决定。可从复核记录回看原件。",
      "A source remains unreconciled. A closing decision cannot be submitted yet. Reopen originals from Case Notes.",
    ],
    "evidence-occupancy": [
      "钥匙套只记录标签文字，不能据此确认入住。",
      "A key sleeve records label text, not verified occupancy.",
    ],
    "evidence-operating": [
      "招聘发布时间与停止营业通知属于不同年代，不能证明酒店继续接待住客。",
      "The advert and closure notice belong to different periods; the advert does not establish continued hotel operation.",
    ],
    "evidence-consent": [
      "请核对 Mara 原备注的授权范围。",
      "Check the authorization in Mara’s original note.",
    ],
    "evidence-missing": [
      "请只提交能够由原件交叉验证的三项证据。",
      "Submit only the three findings that can be cross-checked against the originals.",
    ],
    unknown: [
      "未识别该操作。原资料仍可回看。",
      "This operation is not recognized. The original records remain available.",
    ],
  };
  function feedback(id, result) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = t(...(errors[result.error] || errors.unknown));
    el.focus({ preventScroll: true });
  }
  function perform(action, payload = {}, errorId = "case-status") {
    const result = M.transition(state, action, payload);
    save();
    if (!result.ok) feedback(errorId, result);
    return result.ok;
  }
  function careers() {
    return `<section class="career-heading"><p class="kicker">STILLWATER HERITAGE RECORDS</p><h1>${t("让每一份旧档案都有据可查。", "A careful eye for the historical record.")}</h1><p>${t("远程档案整理与复核岗位。", "Remote opportunities in archive reconciliation.")}</p></section><form id="job-search" class="job-search"><label for="job-keyword">${t("搜索岗位", "Search roles")}</label><div><input id="job-keyword" name="keyword" type="search" placeholder="${t("职位名称或工作内容", "Role or area of work")}"><select name="work" aria-label="${t("工作方式", "Work arrangement")}"><option value="remote">${t("远程", "Remote")}</option><option value="onsite">${t("现场", "On site")}</option></select><button type="submit">${t("搜索", "Search")}</button></div></form><p id="job-result" role="status"></p><article class="job-card" id="archive-job"><p class="kicker">${t("合同制 · 远程", "CONTRACT · REMOTE")}</p><h2>${t("历史档案复核员", "Night Archive Reconciliation Assistant")}</h2><p>${t("整理一家已停业湖畔酒店的历史预订资料。", "Help digitize reservation records from a closed lakeside hotel.")}</p><p>${t("通过一份记录核对样本，了解具体工作。", "Start with a short record-matching sample.")}</p><p>${t("样本档案", "Sample case")}: <span class="reference">${F.reservation}</span></p><button class="primary" data-case-action="sample">${t("查看样本资料", "Review sample record")} →</button><details><summary>${t("岗位详情与公司介绍", "Role details & company information")}</summary><p>${t("工作包括核对来源、整理时间、比较历史修订和保留无法证实的项目。样本不需要简历、账号或联系方式。", "Review sources, reconcile timestamps, compare revisions and retain unresolved entries. No CV, account or contact information is needed for the sample.")}</p><p>Stillwater Heritage Records · ${F.recruitment}</p></details></article>`;
  }
  function guarded(route) {
    const recovery = M.recovery(state, route);
    return (
      views.heading(
        "RECORD INDEX",
        t("暂时无法调阅此资料", "Record not currently available"),
        t(
          "这份原件尚未关联到本次复核。可以先核对下列来源。",
          "This original is not yet associated with the current review. Identify its source record first.",
        ),
      ) + views.reference(recovery, t("查看来源记录", "Open the source record"))
    );
  }
  function currentRoute() {
    return location.hash.slice(1).split("?")[0] || "careers";
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
    const site = route === "careers" ? "careers" : staff ? "staff" : "hotel";
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
        t("留存文件索引", "Retained file index"),
        t(
          "此页仅提供已关联来源的只读资料。",
          "This index contains read-only material associated with the review.",
        ),
      ) + views.reference("notes", "Case Notes");
    if (allowed && route === "closure" && !M.has(state, "C8")) {
      M.transition(state, "closure");
      save();
    }
    if (allowed && route === "mara" && !M.has(state, "C9")) {
      M.transition(state, "mara");
      save();
    }
    const content = allowed
      ? ({ careers, ...views }[route] || placeholder)()
      : guarded(route);
    document.title =
      route === "careers"
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
      `<header class="site-header"><a class="site-brand" href="#${route === "careers" ? "careers" : staff ? "staff" : "hotel"}">${route === "careers" ? "Stillwater Heritage Careers" : staff ? "STILLWATER / STAFF ARCHIVE" : "The Stillwater Hotel"}</a><a data-case-language href="${zh ? "index.html" : "index-zh.html"}${location.hash}">${zh ? "English" : "简体中文"}</a></header>${route === "careers" ? '<nav class="careers-nav">' + a("careers", t("工作机会", "Opportunities")) + "</nav>" : staff ? '<nav class="staff-nav">' + a("hotel", t("酒店目录", "Hotel index")) + a("notes", "Case Notes") + a("staff", t("员工档案", "Staff archive")) + "</nav>" : '<nav class="hotel-nav">' + a("hotel", t("首页", "Home")) + a("rooms", t("客房", "Rooms")) + a("reservations", t("预订查询", "Reservations")) + a("contact", t("联系前台", "Contact")) + "</nav>"}<main id="content" tabindex="-1">${content}</main><footer><p>${t("虚构互动作品。酒店、招聘和资料均为剧情，不接收真实申请或付款。", "A fictional interactive work. The hotel, role and records are part of the story. No real applications or payments are accepted.")}</p>${storageFailed ? `<p role="status">${t("本设备无法保存进度；当前标签页仍可继续。", "Storage is unavailable; the current tab remains playable.")}</p>` : ""}${a("careers", t("招聘主页", "Careers"))} · ${a("guestbook", t("住客留言", "Guestbook"))} · ${a("history", t("历史资料", "History"))} · ${a("notices", t("旧公告", "Notices"))} · ${a("staff", t("员工档案", "Staff archive"))} · ${a("notes", "Case Notes")} · <button class="footer-settings" data-case-action="settings">${t("声音与设置", "Sound & settings")}</button> · ${a("credits", t("图片来源", "Image credits"))} · <a href="${zh ? "classic-zh.html" : "classic.html"}">${t("上一版与原存档", "Previous edition & saved stay")}</a></footer>`;
    document.querySelectorAll("nav a").forEach((el) => {
      if (el.getAttribute("href") === "#" + route)
        el.setAttribute("aria-current", "page");
    });
    if (route === "night-audit" && allowed) comfort.signal();
    if (moveFocus) {
      window.scrollTo(0, 0);
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
    if (action === "sample" && perform("sample")) location.hash = "hotel";
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
