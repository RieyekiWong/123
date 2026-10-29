/* Fictional recruitment prologue. Applications never leave this browser. */
(() => {
  "use strict";
  const KEY = "stillwater-career:v1";
  const zh = document.documentElement.lang === "zh-CN";
  const t = (chinese, english) => (zh ? chinese : english);
  const escape = (value) =>
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
  const jobs = [
    {
      id: "harbor",
      group: "front",
      mark: "H",
      company: t("海岸酒店", "Harbor Hotel"),
      title: t("酒店前台接待", "Front desk agent"),
      place: t("温哥华 · 市中心", "Vancouver · Downtown"),
      pay: t("时薪 $23–26", "$23–26 / hour"),
      shift: t("全职 · 轮班制", "Full time · Rotating shifts"),
      tags: [t("员工餐", "Staff meals"), t("带薪培训", "Paid training")],
      detail: t(
        "负责入住及退房办理、预订查询和住客咨询。需要能适应早晚轮班，有酒店前台经验者优先。",
        "Handle arrivals, departures, reservation enquiries and guest requests. Rotating morning and evening shifts; front desk experience preferred.",
      ),
      reason: t(
        "该职位已招满，暂不接受新申请。",
        "This position has been filled. New applications are closed.",
      ),
    },
    {
      id: "park",
      group: "front",
      mark: "P",
      company: t("帕克酒店集团", "Park Hotel Group"),
      title: t("夜班前台", "Night receptionist"),
      place: t("多伦多 · 北约克", "Toronto · North York"),
      pay: t("时薪 $25–28", "$25–28 / hour"),
      shift: t("全职 · 固定夜班", "Full time · Night shift"),
      tags: [
        t("夜班津贴", "Night allowance"),
        t("员工住宿", "Staff accommodation"),
      ],
      detail: t(
        "负责夜间接待、当天账务核对及早班交接。上班时间为 23:00 至次日 7:00，提供员工住宿。",
        "Overnight reception, daily account checks and morning handover. Hours: 11 p.m. to 7 a.m. Staff accommodation provided.",
      ),
      reason: t(
        "招聘计划已取消，职位暂时关闭。",
        "The hiring plan has been cancelled. This vacancy is closed.",
      ),
    },
    {
      id: "cedar",
      group: "rooms",
      mark: "C",
      company: t("雪松山度假酒店", "Cedar Mountain Lodge"),
      title: t("客房服务员", "Room attendant"),
      place: t("班夫 · 度假区", "Banff · Resort district"),
      pay: t("时薪 $22–25", "$22–25 / hour"),
      shift: t("全职 · 日班", "Full time · Day shift"),
      tags: [t("提供住宿", "Accommodation"), t("交通补贴", "Travel allowance")],
      detail: t(
        "负责客房清洁、布草更换和客房用品补充。可以接受无经验应聘者，入职后统一培训。",
        "Clean guest rooms, change linens and replenish supplies. No previous experience required; training is provided.",
      ),
      reason: t(
        "本轮招聘已结束，申请未能提交。",
        "This recruitment round has ended. Your application could not be submitted.",
      ),
    },
    {
      id: "lake",
      group: "food",
      mark: "L",
      company: t("湖畔会馆", "Lakeside House"),
      title: t("餐厅服务员", "Restaurant server"),
      place: t("渥太华 · 湖畔区", "Ottawa · Lakeside"),
      pay: t("时薪 $19–23", "$19–23 / hour"),
      shift: t("全职 / 兼职", "Full time / Part time"),
      tags: [t("员工餐", "Staff meals"), t("弹性排班", "Flexible shifts")],
      detail: t(
        "负责早餐及晚餐时段的接待、点单和餐桌整理。周末可以上班者优先。",
        "Welcome diners, take orders and reset tables during breakfast and dinner. Weekend availability preferred.",
      ),
      reason: t(
        "该职位仅接受内部推荐，暂不开放申请。",
        "This role is currently available through internal referrals only.",
      ),
    },
    {
      id: "union",
      group: "front",
      mark: "U",
      company: t("联合广场酒店", "Union Square Hotel"),
      title: t("宾客服务专员", "Guest services associate"),
      place: t("蒙特利尔 · 旧城区", "Montreal · Old Town"),
      pay: t("时薪 $24–27", "$24–27 / hour"),
      shift: t("全职 · 轮班制", "Full time · Rotating shifts"),
      tags: [t("员工福利", "Staff benefits"), t("带薪年假", "Paid leave")],
      detail: t(
        "协助住客寄存行李、安排叫车及处理一般咨询，需要与前台和客房部保持沟通。",
        "Assist with luggage storage, transport and general enquiries, working closely with reception and housekeeping.",
      ),
      reason: t(
        "招聘信息已过期，请查看其他职位。",
        "This listing has expired. Please try another vacancy.",
      ),
    },
    {
      id: "elm",
      group: "rooms",
      mark: "E",
      company: t("榆树街公寓酒店", "Elm Street Suites"),
      title: t("客房部文员", "Housekeeping coordinator"),
      place: t("卡尔加里 · 市中心", "Calgary · Downtown"),
      pay: t("时薪 $23–26", "$23–26 / hour"),
      shift: t("全职 · 日班", "Full time · Day shift"),
      tags: [t("固定排班", "Regular hours"), t("员工折扣", "Staff discounts")],
      detail: t(
        "核对房态、整理维修记录并安排客房用品领用。需要熟悉基本办公软件。",
        "Update room status, maintain repair records and coordinate room supplies. Basic office software skills required.",
      ),
      reason: t(
        "雇主已暂停接收简历，申请未能提交。",
        "The employer has paused applications. Nothing was submitted.",
      ),
    },
  ];
  let record = { failed: [], entered: false, replay: false };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && typeof saved === "object")
      record = {
        failed: [
          ...new Set(
            (Array.isArray(saved.failed) ? saved.failed : []).filter((id) =>
              jobs.some((job) => job.id === id),
            ),
          ),
        ],
        entered: saved.entered === true,
        replay: saved.replay === true,
      };
  } catch {
    /* A blocked or damaged store does not prevent play. */
  }
  let scene,
    selected = jobs[0].id,
    filter = "all",
    query = "";
  const pending = new Set();
  const timers = new Set();
  let invitationDismissed = false;
  function later(callback, ms) {
    const id = setTimeout(() => {
      timers.delete(id);
      callback();
    }, ms);
    timers.add(id);
    return id;
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(record));
    } catch {
      /* Session play remains available. */
    }
  }
  function hasHotelProgress() {
    try {
      const value =
        JSON.parse(localStorage.getItem("stillwater-hotel:v2")) ||
        JSON.parse(localStorage.getItem("no-return-hotel:v1"));
      return (
        value &&
        (value.name ||
          value.checkedIn ||
          value.staff ||
          value.chapter > 1 ||
          value.clues?.length ||
          value.endings?.length ||
          value.puzzles?.length)
      );
    } catch {
      return false;
    }
  }
  function status(job) {
    return record.failed.includes(job.id)
      ? `<p class="career-result" role="status">${job.reason}</p>`
      : "";
  }
  function applyButton(job) {
    const done = record.failed.includes(job.id);
    return `<button class="career-apply" data-career-apply="${job.id}" ${done || pending.has(job.id) ? "disabled" : ""}>${pending.has(job.id) ? t("正在提交…", "Submitting…") : done ? t("无法申请", "Unavailable") : t("申请职位", "Apply now")}</button>`;
  }
  function card(job) {
    return `<article class="career-job ${selected === job.id ? "is-selected" : ""}" data-job-card="${job.id}"><div class="career-job-top"><div><p class="career-company"><span>${job.mark}</span>${job.company}</p><button class="career-title" data-career-detail="${job.id}">${job.title}</button></div><strong class="career-pay">${job.pay}</strong></div><p class="career-location">${job.place}<span>·</span>${job.shift}</p><div class="career-tags">${job.tags.map((tag) => `<span>${tag}</span>`).join("")}</div><div class="career-job-bottom"><button class="career-detail-link" data-career-detail="${job.id}">${t("查看详情", "View details")} →</button>${applyButton(job)}</div>${status(job)}</article>`;
  }
  function renderDetail() {
    const job = jobs.find((item) => item.id === selected);
    scene.querySelector("#career-detail").innerHTML =
      `<p class="career-eyebrow">${t("职位详情", "JOB DETAILS")}</p><h2>${job.title}</h2><p class="career-company-name">${job.company}</p><p class="career-detail-pay">${job.pay}</p><dl><div><dt>${t("工作地点", "Location")}</dt><dd>${job.place}</dd></div><div><dt>${t("工作时间", "Schedule")}</dt><dd>${job.shift}</dd></div></dl><h3>${t("岗位职责与要求", "About the role")}</h3><p>${job.detail}</p><h3>${t("福利待遇", "Benefits")}</h3><div class="career-tags">${job.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>${applyButton(job)}${status(job)}<p class="career-detail-note">${t("申请进度以雇主实际回复为准。", "Application status is subject to the employer’s response.")}</p>`;
  }
  function renderJobs(focusJob) {
    const visible = jobs.filter(
      (job) =>
        (filter === "all" ||
          (filter === "attempted"
            ? record.failed.includes(job.id)
            : job.group === filter)) &&
        (!query ||
          `${job.title} ${job.company} ${job.place} ${job.shift} ${job.tags.join(" ")} ${job.detail}`
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase())),
    );
    if (visible.length && !visible.some((job) => job.id === selected))
      selected = visible[0].id;
    scene.querySelector("#career-detail").hidden = visible.length === 0;
    scene.querySelector("#career-results").innerHTML = visible.length
      ? visible.map(card).join("")
      : `<div class="career-empty"><h2>${t("没有找到相关职位", "No matching jobs")}</h2><p>${t("试试“前台”或清空关键词，查看全部职位。", "Try “front” or clear the search to see all jobs.")}</p><button class="career-reset-search" data-career="clear-search">${t("查看全部职位", "Show all jobs")}</button></div>`;
    scene.querySelector("#career-result-count").textContent = t(
      `为您找到 ${visible.length} 个职位`,
      `${visible.length} jobs found`,
    );
    scene.querySelector("#career-attempt-count").textContent = t(
      `已尝试申请 ${record.failed.length} / ${jobs.length} 个职位`,
      `${record.failed.length} / ${jobs.length} applications attempted`,
    );
    scene.querySelector("#career-profile-count").textContent =
      `${record.failed.length} / ${jobs.length}`;
    renderDetail();
    if (focusJob) {
      const result = scene.querySelector(
        `[data-job-card="${focusJob}"] .career-result`,
      );
      if (result) {
        result.tabIndex = -1;
        result.focus({ preventScroll: true });
        result.scrollIntoView({ block: "nearest" });
      }
    }
  }
  function showInvitation() {
    if (!scene?.isConnected || record.failed.length < jobs.length) return;
    scene.querySelector("#career-invitation").hidden = false;
    scene.querySelector("#career-message-button").hidden = true;
    scene.querySelector("#career-notification").textContent = t(
      "您收到一条新的招聘消息。",
      "You have a new recruitment message.",
    );
  }
  function scheduleInvitation() {
    if (record.failed.length < jobs.length || invitationDismissed) return;
    showInvitation();
  }
  function apply(id) {
    const job = jobs.find((item) => item.id === id);
    if (!job || pending.has(id) || record.failed.includes(id)) return;
    selected = id;
    pending.add(id);
    renderJobs();
    later(() => {
      pending.delete(id);
      if (!scene?.isConnected) return;
      record.failed.push(id);
      save();
      renderJobs(id);
      scheduleInvitation();
    }, 420);
  }
  function leave() {
    record.entered = true;
    record.replay = false;
    save();
    timers.forEach(clearTimeout);
    timers.clear();
    scene?.remove();
    document.body.classList.remove("career-mode");
    window.dispatchEvent(new CustomEvent("stillwater-career-enter"));
  }
  function start(replay = false) {
    if (scene?.isConnected) return;
    if (replay) {
      record = { failed: [], entered: false, replay: true };
      save();
    }
    selected = jobs[0].id;
    filter = "all";
    query = "";
    invitationDismissed = false;
    document.querySelector("dialog[open]:not(#game-instructions)")?.close();
    scene = document.createElement("section");
    scene.id = "career-scene";
    scene.setAttribute("data-puzzle-original", "");
    scene.setAttribute(
      "aria-label",
      t("职途酒店招聘", "Shiftwork hospitality jobs"),
    );
    scene.innerHTML = `<nav class="career-navband" aria-label="${t("招聘网站导航", "Recruitment navigation")}"><div class="career-width career-navigation-inner"><span class="career-national">⌖ ${t("全国职位", "All locations")}</span><div class="career-navigation-links"><button data-career="home" class="is-current">${t("首页", "Home")}</button><button data-career="positions">${t("职位", "Jobs")}</button><button data-career-query="">${t("酒店招聘", "Hospitality")}</button><button data-career-query="${t("夜班", "night")}">${t("夜班专区", "Night shifts")}</button><button data-career="guide">${t("求职指南", "Career guide")}</button></div><a class="career-language" href="${zh ? "index.html" : "index-zh.html"}">${zh ? "English" : "简体中文"}</a><button class="career-account-link" data-career="applications">${t("我的申请", "My applications")}</button></div></nav>
    <header class="career-search-band"><div class="career-width career-search-row"><a class="career-brand" href="${zh ? "index-zh.html" : "index.html"}"><span class="career-brand-icon">↗</span><span>${t("职途招聘", "shiftwork")}<small>${t("酒店 · 旅游 · 服务业", "HOSPITALITY CAREERS")}</small></span></a><form id="career-search-form" class="career-search"><label class="career-sr-only" for="career-search">${t("职位、公司或城市", "Job title, company or city")}</label><div><input id="career-search" name="keyword" type="search" maxlength="60" placeholder="${t("搜索职位、公司或城市", "Search jobs, companies or cities")}"><button type="submit">⌕ ${t("搜索", "Search")}</button></div></form><button class="career-search-progress" data-career="applications"><span>▤</span><strong>${t("求职进度", "My progress")}</strong><small>${t("查看已申请职位", "Review applications")}</small></button></div><div class="career-width career-popular"><span>${t("热门搜索", "Popular")}</span><button data-career-query="${t("前台", "front")}">${t("酒店前台", "Front desk")}</button><button data-career-query="${t("住宿", "accommodation")}">${t("提供住宿", "Accommodation")}</button><button data-career-query="${t("客房", "room")}">${t("客房服务", "Housekeeping")}</button></div></header>
    <div class="career-width"><section class="career-portal-hero"><aside class="career-category-menu"><p>${t("职位分类", "JOB CATEGORIES")}</p>${[
      ["all", t("酒店 / 旅游", "Hotels / Tourism")],
      ["front", t("前台 / 接待", "Front office")],
      ["rooms", t("客房 / 保洁", "Housekeeping")],
      ["food", t("餐饮 / 服务", "Food & beverage")],
    ]
      .map(
        ([id, label]) =>
          `<button data-career-filter="${id}" aria-pressed="${id === "all"}">${label}<span>›</span></button>`,
      )
      .join(
        "",
      )}<button data-career-query="${t("夜班", "night")}">${t("夜班岗位", "Night shifts")}<span>›</span></button><button data-career-query="${t("培训", "training")}">${t("无经验 / 培训", "Entry level / Training")}<span>›</span></button><button data-career-query="${t("住宿", "accommodation")}">${t("提供住宿", "Accommodation")}<span>›</span></button></aside><div class="career-recruitment-banner"><div class="career-promo-copy"><p>${t("酒店服务业专场", "HOSPITALITY CAREER FAIR")}<span>${t("秋季招聘", "AUTUMN HIRING")}</span></p><h1>${t("下一份工作，<br>从这里开始。", "Your next job.<br>A new beginning.")}</h1><p class="career-promo-subtitle">${t("前台接待 · 客房服务 · 夜班岗位", "Front office · Housekeeping · Night shifts")}</p><button data-career="positions">${t("查看最新职位", "Explore current vacancies")} →</button></div><div class="career-cityscape" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><span></span></div><small>${t("行业招聘专题", "INDUSTRY RECRUITMENT")}</small></div><aside class="career-seeker-card"><p class="career-seeker-label">${t("求职者中心", "APPLICANT CENTRE")}</p><div class="career-seeker-avatar">${t("我", "ME")}</div><h2>${t("继续寻找合适的工作", "Find your next role")}</h2><p>${t("求职方向", "Looking for")}</p><strong>${t("酒店接待 / 夜班岗位", "Hotel reception / Night shifts")}</strong><div class="career-profile-stat"><span>${t("已尝试申请", "APPLICATIONS ATTEMPTED")}</span><b id="career-profile-count">0 / 6</b></div><button data-career="applications">${t("查看申请记录", "View applications")}</button><small>${t("无需注册，记录仅保存在本机。", "No account needed. Records stay on this device.")}</small></aside></section><div class="career-story-note"><span>${t("你的求职日记", "YOUR JOB SEARCH")}</span><p>${t("你一直在酒店做接待，最近刚结束上一份工作。今晚，你又打开招聘网站，想找一份能尽快入职、最好提供住宿的岗位。", "Your last reception job ended recently. Tonight, you are looking for somewhere you can start soon, preferably with a room included.")}</p></div></div>
    <div class="career-width career-content"><div class="career-filter-bar"><strong>${t("为你推荐", "Recommended jobs")}</strong><label class="career-city-label" for="career-city">${t("工作城市", "City")}<select id="career-city"><option value="">${t("不限城市", "All cities")}</option>${[t("温哥华", "Vancouver"), t("多伦多", "Toronto"), t("班夫", "Banff"), t("渥太华", "Ottawa"), t("蒙特利尔", "Montreal"), t("卡尔加里", "Calgary")].map((city) => `<option value="${city}">${city}</option>`).join("")}</select></label><button class="career-reset-search" data-career="reset-filters">${t("清空筛选", "Clear filters")}</button></div><div class="career-results-heading"><h2 id="career-result-count"></h2><span id="career-attempt-count" aria-live="polite"></span></div><div class="career-layout"><div id="career-results"></div><aside id="career-detail" class="career-detail"></aside></div><footer class="career-footer"><span>${t("© 职途招聘 · 酒店与旅游行业人才平台", "© Shiftwork · Hospitality careers")}</span><p>${t("虚构互动故事的开场。无需真实简历或联系方式，所有申请均为剧情演示，不会发送给任何雇主。", "A fictional story prologue. No real CV or contact details are needed. Applications are simulated and never sent to employers.")}</p><button type="button" class="career-instructions" data-open-instructions>${t("游戏说明", "Game instructions")}</button></footer></div>
    <aside id="career-invitation" class="career-invitation" aria-labelledby="career-invite-title" hidden><div class="career-invite-top"><span><i></i>${t("新的招聘消息", "NEW RECRUITMENT MESSAGE")}</span><button data-career="dismiss" aria-label="${t("收起招聘消息", "Minimize recruitment message")}">×</button></div><div class="career-invite-body"><div class="career-hotel-identity"><span>S</span><div><h2 id="career-invite-title">${t("静水旅馆", "The Stillwater Hotel")}</h2><p>${t("夜班前台 · 提供食宿", "Night receptionist · Room & board")}</p></div></div><p>${t("我们看过您的简历。今晚可以来上班吗？", "We have read your CV. Can you start tonight?")}</p><p class="career-invite-odd">${t("奇怪，你不记得投过这家酒店。消息里却写着你的上一份工作。", "You do not remember applying here. The message knows where you last worked.")}</p><button class="career-invite-enter" data-career="enter">${t("查看酒店与岗位", "View hotel & vacancy")} <span>↗</span></button><small>${t("招聘方邀请 · 刚刚", "Employer invitation · Just now")}</small></div></aside><button id="career-message-button" class="career-message-button" data-career="message" hidden>${t("1 条招聘消息", "1 recruitment message")}</button><div class="career-sr-only" id="career-notification" role="status" aria-live="polite"></div>
    <dialog id="career-guide" class="career-guide-dialog"><form method="dialog"><button aria-label="${t("关闭求职指南", "Close career guide")}">×</button></form><h2>${t("求职提醒", "Before applying")}</h2><p>${t("先查看工作地点、班次和住宿条件，再申请职位。招聘状态可能随时调整；无法申请时，可以继续查看其他岗位。", "Check location, working hours and accommodation before applying. Vacancies can close at any time; try another role if an application is unavailable.")}</p><p>${t("本页是互动故事，不需要填写真实联系方式，也不会向雇主发送任何信息。", "This is an interactive story. No real contact details are required and nothing is sent to employers.")}</p></dialog>`;
    document.body.prepend(scene);
    document.body.classList.add("career-mode");
    document.title = t(
      "职途招聘 — 寻找下一份酒店工作",
      "Shiftwork — Your next hospitality job",
    );
    scene.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      if (button.dataset.careerApply) apply(button.dataset.careerApply);
      if (button.dataset.careerDetail) {
        selected = button.dataset.careerDetail;
        renderJobs();
        if (matchMedia("(max-width: 780px)").matches)
          scene
            .querySelector("#career-detail")
            .scrollIntoView({ block: "start" });
      }
      if (button.dataset.careerFilter) {
        filter = button.dataset.careerFilter;
        scene
          .querySelectorAll("[data-career-filter]")
          .forEach((item) =>
            item.setAttribute("aria-pressed", String(item === button)),
          );
        renderJobs();
      }
      if (
        button.dataset.careerQuery !== undefined ||
        ["clear-search", "reset-filters"].includes(button.dataset.career)
      ) {
        query = button.dataset.careerQuery || "";
        scene.querySelector("#career-city").value = "";
        scene.querySelector("#career-search").value = query;
        filter = "all";
        scene
          .querySelectorAll("[data-career-filter]")
          .forEach((item) =>
            item.setAttribute(
              "aria-pressed",
              String(item.dataset.careerFilter === "all"),
            ),
          );
        renderJobs();
      }
      if (button.dataset.career === "home") window.scrollTo({ top: 0 });
      if (button.dataset.career === "positions")
        scene
          .querySelector(".career-content")
          .scrollIntoView({ block: "start" });
      if (button.dataset.career === "guide")
        scene.querySelector("#career-guide").showModal();
      if (button.dataset.career === "applications") {
        filter = "attempted";
        query = "";
        scene.querySelector("#career-search").value = "";
        scene
          .querySelectorAll("[data-career-filter]")
          .forEach((item) => item.setAttribute("aria-pressed", "false"));
        renderJobs();
        scene
          .querySelector(".career-content")
          .scrollIntoView({ block: "start" });
      }
      if (button.dataset.career === "enter") leave();
      if (button.dataset.career === "dismiss") {
        invitationDismissed = true;
        scene.querySelector("#career-invitation").hidden = true;
        scene.querySelector("#career-message-button").hidden = false;
        scene.querySelector("#career-message-button").focus();
      }
      if (button.dataset.career === "message") showInvitation();
    });
    scene
      .querySelector("#career-search-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        query = scene.querySelector("#career-search").value.trim();
        renderJobs();
      });
    scene.querySelector("#career-city").addEventListener("change", (event) => {
      query = event.target.value;
      scene.querySelector("#career-search").value = query;
      renderJobs();
    });
    renderJobs();
    scheduleInvitation();
    window.scrollTo(0, 0);
  }
  window.StillwaterCareer = { replay: () => start(true) };
  if (!record.entered && (record.replay || !hasHotelProgress())) start();
})();
