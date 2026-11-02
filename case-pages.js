/* Read-only hotel documents and normal business screens. State changes stay in case-state. */
globalThis.StillwaterCaseViews = function ({ t, esc, getState }) {
  const D = globalThis.StillwaterCaseData,
    F = D.facts;
  const has = (id) => getState().evidence.includes(id);
  const a = (route, label, cls = "") =>
    `<a class="${cls}" href="#${route}">${label}</a>`;
  const date = (value) => value.replace("T", " ");
  const heading = (label, title, text = "") =>
    `<header class="page-heading"><p class="kicker">${label}</p><h1>${title}</h1>${text ? `<p>${text}</p>` : ""}</header>`;
  const reference = (route, label) =>
    `<div class="source-link">${a(route, label)} →</div>`;
  const message = t(
    "前台说是 {booked}，但钥匙套上印着 {service}。是印错了吗？",
    "Front desk said {booked}, but the sleeve around my key says {service}. Is this a typo?",
  )
    .replace("{booked}", F.bookedRoom)
    .replace("{service}", F.service);
  function noticeWindow() {
    return `<aside class="notice-window" aria-label="${t("历史通行公告", "Historic access notice")}"><header><span>3F ROUTE NOTICE</span><button type="button" data-case-action="dismiss-notice" aria-label="${t("关闭通行公告", "Close access notice")}">×</button></header><div><h2>${t("三层走廊维护调整", "Third-floor hallway maintenance")}</h2><p>${t("部分通道使用服务区域编号，不属于住客房号。", "Some access areas use service identifiers and are not guest rooms.")}</p><p class="reference">${F.notice} · ${F.transfer.slice(0, 10)}</p>${reference("notices", t("查看原公告", "View original notice"))}</div></aside>`;
  }
  function hotel() {
    return `<section class="hotel-hero"><img src="assets/lobby.jpg" alt="${t("酒店大堂与木质楼梯", "Hotel lobby and wooden staircase")}"><div><p class="kicker">LAKESIDE · INDEPENDENT · EST. 1987</p><h1>The Stillwater Hotel</h1><p>${t("湖畔小住，舒适相伴。", "A comfortable stay by the lake.")}</p>${a("reservations", t("查看预订记录", "Find a reservation"), "primary")}</div></section><p class="daily-notice">${t("前台通知：早餐 7:00–9:00；晚到住客请先在前台领取房卡。", "Reception: breakfast 07:00–09:00. Late arrivals should collect their room card at the desk.")}</p><div class="hotel-intro"><p>${t("提供双人房、双床房与长住客房。客房设独立卫浴、书桌及茶饮设施，前台全天值班。", "Double, twin and longer-stay rooms with private bathrooms, a desk and tea facilities. Reception is staffed around the clock.")}</p>${a("rooms", t("浏览客房与设施", "Rooms & facilities"))}</div>`;
  }
  function reservations() {
    return (
      heading(
        "RESERVATIONS",
        t("预订查询", "Reservation search"),
        t(
          "按档案编号查询留存预订。本页面不接受付款或真实预订。",
          "Look up a retained booking by reference. No payment or real reservation is taken here.",
        ),
      ) +
      `<form id="reservation-search" class="record-query"><label for="reservation-reference">${t("档案编号", "Reservation reference")}</label><div class="query-row"><input id="reservation-reference" name="reference" maxlength="32" value="${esc(getState().drafts.reservation || "")}" autocomplete="off" placeholder="R-____" required><button class="primary">${t("查看预订", "View reservation")}</button></div><p class="form-error" tabindex="-1" id="reservation-error" role="status"></p></form>${has("C2") && getState().drafts.reservation.trim().toUpperCase() === F.reservation ? booking() : `<p class="small">${t("查不到编号？请回到岗位样本核对原件。", "Missing a reference? Check the original role sample.")}</p>${reference("careers", t("岗位样本", "Role sample"))}`}`
    );
  }
  function booking() {
    return `<section class="document" id="reservation-result"><h2>${t("留存预订", "Retained booking")} · ${F.reservation}</h2><table><tbody><tr><th>${t("预订引用", "Reference")}</th><td>${F.reservation}</td></tr><tr><th>${t("住客姓名缩写", "Guest initials")}</th><td>${F.guest}</td></tr><tr><th>${t("登记房号", "Assigned room")}</th><td>${F.bookedRoom}</td></tr><tr><th>${t("记录写入时间", "Created")}</th><td><time datetime="${F.created}">${date(F.created)}</time></td></tr><tr><th>${t("状态", "Status")}</th><td>UNRESOLVED / ${t("留待核对", "Retained for reconciliation")}</td></tr></tbody></table><p class="small">${t("原订房库只记录分配房号；入住情况以客房与前台资料交叉核对。", "The booking database records assignment only. Occupancy must be checked against housekeeping and reception records.")}</p>${reference("rooms", t("核对官方客房目录", "Compare the official room directory"))}</section>`;
  }
  function rooms() {
    return (
      heading(
        "ROOMS & FACILITIES",
        t("客房与设施", "Rooms & facilities"),
        t(
          "双人房、双床房与长住套间，均提供独立卫浴与每日客房清洁。",
          "Double rooms, twin rooms and longer-stay suites, with private bathrooms and daily housekeeping.",
        ),
      ) +
      `<div class="room-list">${[
        [
          "guestroom.jpg",
          t("标准双人房", "Classic double"),
          t("24 平方米 · 双人床 · 书桌", "24 m² · Double bed · Writing desk"),
        ],
        [
          "twin.jpg",
          t("庭院双床房", "Courtyard twin"),
          t(
            "28 平方米 · 两张床 · 茶饮设施",
            "28 m² · Two beds · Tea facilities",
          ),
        ],
        [
          "suite.jpg",
          t("长住套间", "Residence suite"),
          t(
            "38 平方米 · 休息区 · 独立入户",
            "38 m² · Sitting area · Entrance hall",
          ),
        ],
      ]
        .map(
          ([file, title, copy]) =>
            `<article><img src="assets/${file}" alt="${title}" loading="lazy"><h2>${title}</h2><p>${copy}</p></article>`,
        )
        .join(
          "",
        )}</div><div class="hotel-columns"><section><h2>${t("三层客房目录", "Third-floor guest directory")}</h2><p class="small">${t("客房按门牌排列；维修通道不列入客房清单。", "Guest rooms are listed by door number. Maintenance access is not part of the guest inventory.")}</p><ol class="room-inventory" aria-label="${t("官方房号", "Official room numbers")}">${D.inventory.map((n) => `<li>${n}</li>`).join("")}</ol>${has("C2") ? `<form id="inventory-check"><label for="inventory-room">${t("原预订单分配的房号", "Room assigned on the original booking")}</label><div class="query-row"><select id="inventory-room" name="room" required><option value="">${t("选择目录中的对应项", "Select the corresponding entry")}</option>${D.inventory.map((n) => `<option>${n}</option>`).join("")}</select><button>${t("核对记录", "Compare record")}</button></div><p class="form-error" tabindex="-1" id="inventory-error" role="status"></p></form>${has("C3") ? reference("guestbook", t("查看同日住客留言", "Read the guest entry from that night")) : ""}` : reference("reservations", t("查询留存预订", "Find a retained booking"))}<details><summary>${t("入住服务", "Guest services")}</summary><p>${t("早餐在一层餐厅供应，时间为 7:00–9:00。可向前台申请额外床品。", "Breakfast is served in the ground-floor dining room from 07:00 to 09:00. Extra bedding is available from reception.")}</p>${reference("contact", t("前台服务卡", "Reception contact card"))}</details></section><div>${!getState().notices.dismissed ? noticeWindow() : `<aside class="notice-archive-link"><p>${t("通行说明保存在旧公告中。", "Access information is retained in the notice archive.")}</p>${reference("notices", t("旧公告", "Notice archive"))}</aside>`}</div></div>`
    );
  }
  function guestbook() {
    return (
      heading(
        "GUESTBOOK",
        t("住客留言", "Guestbook"),
        t("前台保存的住客留言。", "Guest entries retained by reception."),
      ) +
      `<article class="guest-message"><header><strong>R. Bennett</strong><time>2006-10-15 09:10</time></header><p>${t("早餐不错，工作人员帮我们安排了晚到入住。谢谢。", "A good breakfast and helpful arrangements for our late arrival. Thank you.")}</p></article>${has("C3") ? `<article class="guest-message case-message"><header><strong>${F.guest}</strong><time datetime="${F.message}">${date(F.message)}</time></header><p>${message}</p><button data-case-action="read-key">${t("查看前台批注", "Read reception’s attachment")}</button>${has("C4") ? `<div class="reception-attachment"><p>${t("已抄录钥匙套文字，尚未确认客人实际进入哪个位置。请参照当日三层布局，而不是把钥匙标签直接当作入住证明。", "Key-sleeve wording transcribed. The location actually entered has not been confirmed. Consult the third-floor layout; the sleeve alone is not proof of occupancy.")}</p>${reference("floor-plan", t("三层平面图", "Third-floor plan"))}</div>` : ""}</article>` : `<p>${t("如需查找与某笔预订关联的旧留言，请先核对预订记录。", "To locate an entry associated with a booking, first identify its reservation record.")}</p>${reference("reservations", t("按预订检索", "Look up a booking"))}`}<article class="guest-message"><header><strong>J. Park</strong><time>2006-10-18 08:15</time></header><p>${t("双床房很整洁，庭院适合早晨坐一会儿。", "A tidy twin room. The courtyard was a pleasant place to sit in the morning.")}</p></article>`
    );
  }
  function floorPlan() {
    const inspected = getState().completed.serviceInspected;
    return (
      heading(
        "3F / FLOOR PLAN",
        t("三层平面图", "Third-floor plan"),
        t(
          "客房门牌与维修通道的位置图。",
          "Guest-door positions and maintenance access.",
        ),
      ) +
      `<div class="floor-plan" aria-label="${t("三层位置图", "Third-floor layout")}"><div class="plan-corridor">${t("主走廊 · 通往前台楼梯", "MAIN CORRIDOR · RECEPTION STAIRS")}</div><div class="plan-rooms">${Array.from(
        { length: 20 },
        (_, i) => String(301 + i),
      )
        .map((n) =>
          n === F.service
            ? `<button type="button" class="service-space" data-case-action="inspect-service" aria-label="${t("检查 316 与 318 之间的灰色服务区域", "Inspect the grey service area between 316 and 318")}"><span>${t("服务区域", "Service area")}</span><small>${t("维修通行", "Maintenance access")}</small></button>`
            : `<div class="plan-room"><span>${n}</span><small>${t("客房", "Guest room")}</small></div>`,
        )
        .join("")}</div></div>${
        inspected
          ? `<section class="document"><h2>${t("位置登记卡", "Position record")}</h2><table><tr><th>${t("内部标识", "Internal identifier")}</th><td>${F.service}</td></tr><tr><th>${t("登记用途", "Registered use")}</th><td>SERVICE HOLDING / ${t("服务缓冲位", "Service holding position")}</td></tr><tr><th>${t("关联通告", "Related notice")}</th><td>${F.notice}</td></tr></table><p>${t("用于暂存无法完成核对的服务记录，不列为可分配客房。", "Used to hold service records that cannot yet be reconciled. Not listed as assignable guest accommodation.")}</p><form id="service-classification"><fieldset><legend>${t("在复核表中如何归类这个位置？", "How should this position be classified in the review?")}</legend>${[
              ["guest", t("已确认入住的客房", "Confirmed occupied guest room")],
              [
                "service",
                t("非客房 / 服务缓冲位", "Non-guest space / service holding"),
              ],
              [
                "typo",
                t(
                  "可忽略的门牌印刷错误",
                  "A door-label typo that can be ignored",
                ),
              ],
            ]
              .map(
                ([v, label]) =>
                  `<label><input type="radio" name="classification" value="${v}" required> ${label}</label>`,
              )
              .join(
                "",
              )}</fieldset><button>${t("保存位置分类", "Retain position classification")}</button><p class="form-error" tabindex="-1" id="service-error" role="status"></p></form>${has("C5") ? reference("maintenance", t("查阅关联维修单", "Look up the associated maintenance docket")) : ""}</section>`
          : ""
      }`
    );
  }
  function notices() {
    return (
      heading(
        "NOTICE ARCHIVE",
        t("旧公告", "Notice archive"),
        t(
          "前台保存的通行与维修通知，可随时重新查看。",
          "Access and maintenance notices retained by reception.",
        ),
      ) +
      `<article class="document"><p class="kicker">${F.notice} / ${F.transfer.slice(0, 10)}</p><h2>3F ROUTE NOTICE</h2><p>${t("三层走廊因维护调整通行路线。灰色服务区域采用内部标识，不属于住客房号。房态与门牌不一致时，应转交夜审核对，不得仅凭钥匙套文字确认入住。", "Third-floor access routes have changed for maintenance. Grey service areas use internal identifiers outside the guest-room list. Where availability and door labels differ, refer the record to night audit; a key sleeve alone cannot confirm occupancy.")}</p><p>${t("详细记录保存在同编号维修单内。", "The corresponding maintenance docket retains the detailed record.")}</p>${has("C5") ? reference("maintenance", t("查询维修单", "Find the maintenance docket")) : reference(has("C4") ? "floor-plan" : "reservations", t("核对相关位置记录", "Identify the related position record"))}<button data-case-action="reopen-notice">${t("重新打开公告窗", "Reopen the notice window")}</button></article>`
    );
  }
  function maintenance() {
    return (
      heading(
        "MAINTENANCE RECORDS",
        t("维修档案查询", "Maintenance docket lookup"),
        t(
          "按前台通告上的编号检索原件。",
          "Use the reference printed on the reception notice.",
        ),
      ) +
      `<form id="maintenance-search" class="record-query"><label for="maintenance-reference">${t("通告 / 维修单编号", "Notice / docket reference")}</label><div class="query-row"><input id="maintenance-reference" name="reference" maxlength="32" value="${esc(getState().drafts.maintenance || "")}" placeholder="A-__-__" autocomplete="off" required><button>${t("查阅原件", "Open original")}</button></div><p id="maintenance-error" class="form-error" tabindex="-1" role="status"></p></form>${has("C6") && getState().drafts.maintenance.trim().toUpperCase() === F.notice ? `<article class="document" id="maintenance-result"><h2>${F.notice} / ${t("夜审移交", "Night-audit handover")}</h2><table><tr><th>${t("时间", "Timestamp")}</th><td><time datetime="${F.transfer}">${date(F.transfer)}</time></td></tr><tr><th>${t("记录引用", "Record reference")}</th><td>${F.reservation}</td></tr><tr><th>${t("位置属性", "Position classification")}</th><td>${F.service} / SERVICE HOLDING</td></tr><tr><th>${t("移交处理人", "Handover owner")}</th><td>${F.reviewer} / ${F.reviewerName}</td></tr></table><p>${t("自动夜审将无法核对的订房记录移至服务缓冲位，要求指定处理人。此动作没有确认客人真实入住。", "Automatic night audit moved an unreconciled booking to a service holding position and required an owner. This action did not verify actual guest occupancy.")}</p><section class="handover-excerpt"><h3>${t("随单摘录：客房部巡查", "Attached extract: housekeeping check")}</h3><p><time datetime="${F.housekeeping}">${date(F.housekeeping)}</time> · ${t(...D.audit.find((row) => row.id === "housekeeping").text)}</p></section><figure class="service-photo"><img src="assets/hallway.jpg" alt="${t("酒店走廊及服务区域标注示意", "Hotel corridor with a service-area annotation")}"><figcaption>${t("位置登记标注", "Position annotation")}: ${F.service} / SERVICE HOLDING</figcaption></figure>${reference("night-audit", t("核对同一晚的来源记录", "Reconcile the source records from that night"))}</article>` : ""}`
    );
  }
  function history() {
    return (
      heading(
        "HOTEL HISTORY",
        t("旅馆沿革", "Our history"),
        t(
          "湖畔家庭旅馆，保留传统木质陈设。",
          "An independent lakeside hotel with original woodwork and family-run hospitality.",
        ),
      ) +
      `<img class="history-image" src="assets/lobby.jpg" alt="${t("旅馆大堂", "The hotel lobby")}"><p>${t("1987 年开业，后来增设庭院和东翼客房。档案中保留了历次房型与通行安排。", "Opened in 1987, with a courtyard and east-wing rooms added later. The archive retains changes to the guest inventory and access arrangements.")}</p>${has("C7") ? reference("closure", t("归档续页：停止营业通知", "Archived addendum: closure notice")) : reference("notices", t("前台留存公告", "Reception notice archive"))}`
    );
  }
  function contact() {
    return (
      heading(
        "CONTACT / RECEPTION",
        t("前台服务", "Reception services"),
        t(
          "留存于 2006 年官网的宾客服务卡。",
          "Guest-service card retained from the 2006 website.",
        ),
      ) +
      `<dl class="contact-facts"><div><dt>${t("前台", "Front desk")}</dt><dd>${t("全天值班", "Staffed around the clock")}</dd></div><div><dt>${t("早餐", "Breakfast")}</dt><dd>07:00–09:00</dd></div><div><dt>${t("客房用品", "Room supplies")}</dt><dd>${t("可提供额外毛毯与毛巾", "Extra blankets and towels available")}</dd></div></dl><p>${t("这是只读历史联系卡，不提供现实酒店的电话、邮件或预订服务。", "This is a read-only historical contact card, not a real hotel’s telephone, email or booking service.")}</p>${reference("reservations", t("查询留存预订", "Find a retained reservation"))}${reference("guestbook", t("住客留言", "Guestbook"))}`
    );
  }
  function notes() {
    return (
      heading(
        "CASE NOTES",
        t("本次复核记录", "Case Notes"),
        t(
          "已经打开并核对的原始资料。",
          "Original records already opened and reconciled in this review.",
        ),
      ) +
      `${
        getState().endings.length
          ? `<section class="past-dispositions"><h2>${t("已留存处理意见", "Retained dispositions")}</h2>${getState()
              .endings.map((id) =>
                reference(
                  "ending?view=" + id,
                  id === "auto-close" ? "AUTO CLOSE" : "MARK UNVERIFIED",
                ),
              )
              .join("")}</section>`
          : ""
      }${
        getState().evidence.length
          ? `<div class="case-notes">${getState()
              .evidence.map((id) => {
                const c = D.clues[id];
                return `<article><h2>${t(...c.title)}</h2><p class="small">${t("来源", "Source")}: ${c.source}</p>${reference(c.route + (id === "C2" ? "?record=" + F.reservation : id === "C6" ? "?record=" + F.notice : ""), t("重新查看原件", "Reopen original"))}</article>`;
              })
              .join("")}</div>`
          : `<p>${t("尚无留存资料。可从岗位样本开始查阅。", "No records retained yet. Start with the role sample.")}</p>${reference("careers", t("查看岗位样本", "Review the role sample"))}`
      }`
    );
  }
  function nightAudit() {
    const state = getState();
    return (
      heading(
        "NIGHT AUDIT / " + F.reservation,
        t("来源记录复核", "Source-record reconciliation"),
        t(
          "按原件时间排列当晚的记录，再判断这些资料能够证明什么。",
          "Put the source records in timestamp order, then decide what they establish.",
        ),
      ) +
      `<form id="night-audit-form"><ol class="audit-cards" id="audit-order">${state.drafts.auditOrder
        .map((id, index) => {
          const item = D.audit.find((row) => row.id === id);
          return `<li data-log="${id}"><header><time datetime="${item.at}">${date(item.at)}</time><strong>${t(...item.label)}</strong></header><p>${t(...item.text)}</p><div class="order-controls"><button type="button" data-case-action="move-log" data-log-id="${id}" data-direction="-1" ${index === 0 ? "disabled" : ""} aria-label="${t("上移", "Move up")}: ${t(...item.label)}">↑ ${t("上移", "Up")}</button><button type="button" data-case-action="move-log" data-log-id="${id}" data-direction="1" ${index === state.drafts.auditOrder.length - 1 ? "disabled" : ""} aria-label="${t("下移", "Move down")}: ${t(...item.label)}">↓ ${t("下移", "Down")}</button>${a(item.source + (item.source === "maintenance" ? "?record=" + F.notice : ""), t("原始来源", "Original source"))}</div></li>`;
        })
        .join(
          "",
        )}</ol><fieldset><legend>${t("关于“住客真实入住服务位”的结论", "Finding: a guest actually occupied the service position")}</legend>${[
        ["confirmed", t("已确认", "Confirmed")],
        [
          "insufficient",
          t("证据不足，尚未核实", "Insufficient evidence / unverified"),
        ],
        [
          "other-room",
          t(
            "已确认住客入住另一间客房",
            "Confirmed occupancy in another guest room",
          ),
        ],
      ]
        .map(
          ([value, label]) =>
            `<label><input type="radio" name="assessment" value="${value}" ${state.drafts.auditAssessment === value ? "checked" : ""} required> ${label}</label>`,
        )
        .join(
          "",
        )}</fieldset><button class="primary" type="submit">${t("核对时序与记录性质", "Reconcile sequence & finding")}</button><p id="audit-error" class="form-error" tabindex="-1" role="status"></p></form>${state.completed.audit ? reference("staff", t("关联处理人档案", "Associated reviewer file")) : ""}`
    );
  }
  function staff() {
    return (
      heading(
        "PERSONNEL / " + F.reviewer,
        t("人员档案", "Personnel record"),
        t(
          "依据已核对的夜审记录开放的只读资料。",
          "Read-only access associated with the reconciled night audit.",
        ),
      ) +
      `<article class="document"><h2>${F.reviewerName} / ${F.reviewer}</h2><table><tr><th>${t("原岗位", "Original role")}</th><td>${t("夜班审计员", "Night-audit clerk")}</td></tr><tr><th>${t("职责", "Responsibility")}</th><td>${t("交叉核对客房、钥匙与预订记录。", "Cross-check guest inventory, keys and reservations.")}</td></tr><tr><th>${t("关联记录", "Associated record")}</th><td>${F.reservation} · ${F.notice}</td></tr><tr><th>${t("原责任时间", "Original handover")}</th><td>${date(F.transfer)}</td></tr></table><p>${t("人员目录保留了员工身份，但同一笔业务的修订副本改变了记录归属。两份文件使用同一个原预订引用。", "The personnel index retains her staff identity. A revision of the same transaction changes the record ownership. Both versions retain the same original booking reference.")}</p>${reference("revisions", t("比较原稿与修订副本", "Compare original and revised copies"))}</article>${has("C7") ? `<section class="queue-panel"><h2>${t("连续性系统 / 待办队列", "Continuity / Pending work")}</h2><p>${t("资料目录的读取不会更新队列。可手动查询这笔记录当前的责任归属。", "Reading the file does not refresh its queue. Request the current assignment for this record.")}</p><button data-case-action="refresh-queue">${t("刷新队列", "Refresh queue")}</button>${getState().queueRefreshed ? `<table class="current-queue"><tr><th>${t("引用", "Reference")}</th><td>${F.reservation}</td></tr><tr><th>${t("当前处理人", "Current reviewer")}</th><td>${F.temporary}</td></tr><tr><th>${t("生成批次", "Generated batch")}</th><td>${F.recruitment}</td></tr><tr><th>${t("状态", "Status")}</th><td>PENDING SIGN-OFF</td></tr></table><p class="warning-note">${t("未结记录必须有一名责任人。", "Every unresolved record must have an owner.")}</p>` : ""}</section>` : ""}`
    );
  }
  function revisions() {
    const selected = getState().drafts.revisionSelection;
    return (
      heading(
        "REVISION HISTORY / " + F.reservation,
        t("同一记录的两个版本", "Two versions of one record"),
        t(
          "只标记两个原件之间实际发生改变的字段。原预订引用不变。",
          "Mark only fields that actually changed between these originals. The original booking reference is unchanged.",
        ),
      ) +
      `<form id="revision-form"><div class="table-scroll" tabindex="0" aria-label="${t("修订对照表", "Revision comparison table")}"><table class="revision-table"><thead><tr><th>${t("标记改写", "Changed")}</th><th>${t("字段", "Field")}</th><th>ORIGINAL<br><time>${date(F.draft)}</time></th><th>REVISION<br><time>${F.closure}</time></th></tr></thead><tbody>${D.revisions.map((row) => `<tr><td><input type="checkbox" name="difference" value="${row.id}" ${selected.includes(row.id) ? "checked" : ""} aria-label="${t(...row.label)}"></td><th>${t(...row.label)}</th><td>${t(...row.original)}</td><td>${t(...row.revised)}</td></tr>`).join("")}</tbody></table></div><p class="small">${t("原预订的住客缩写仍为 {guest}；后稿把原处理人归入住客字段。", "The booking’s original guest initials remain {guest}; the revision reclassifies the former reviewer as a guest.").replace("{guest}", F.guest)}</p><button class="primary">${t("留存差异记录", "Retain comparison")}</button><p id="revision-error" class="form-error" tabindex="-1" role="status"></p></form>${has("C7") ? `${photoCompare()}<section class="document"><p>${t("差异已关联到原预订。修订日期与停止营业通知一致，请保留这份时间依据。", "The comparison is associated with the booking. Its revision date matches the closure notice; retain that context.")}</p>${reference("closure", t("归档附件：停止营业通知", "Archived attachment: closure notice"))}<details><summary>${t("查询当前队列", "Query the current queue")}</summary>${reference("staff", t("人员档案与当前责任归属", "Personnel file and current assignment"))}</details></section>` : ""}`
    );
  }
  function closure() {
    return (
      heading(
        "ARCHIVED ADDENDUM / " + F.closure,
        t("停止营业通知", "Closure notice"),
        t(
          "酒店原件的后续归档页。",
          "A later addendum retained with the original hotel records.",
        ),
      ) +
      `<article class="document"><p>${t("静水旅馆自 {date} 起停止接待住客，不再安排新的入住或夜间宾客服务。原始预订资料保留供后续核对。", "Stillwater Hotel ceased receiving guests on {date}. No further stays or overnight guest services were to be arranged. Original bookings were retained for reconciliation.").replace("{date}", F.closure)}</p><p>${t("批量修订程序仍会处理遗留数据。文件被改为“已完成”，不等于酒店重新营业，也不等于原始记录已经得到证实。", "The batch-revision process continued to operate on retained data. A file marked completed does not establish renewed operation or verify its underlying events.")}</p><p class="archive-stamp">RETAINED / ${F.closure}</p></article>${reference("mara", t("同卷留存：Mara 的原备注", "Retained in the same file: Mara’s original note"))}`
    );
  }
  function mara() {
    return (
      heading(
        "RETAINED DRAFT / " + F.reviewer,
        t("未提交的原备注", "Unsubmitted original note"),
        t(
          "从原夜审文件中恢复的文本副本。",
          "Text recovered from the original night-audit file.",
        ),
      ) +
      `<article class="document mara-draft"><p class="kicker">${date(F.draft)} / ${F.reviewer}</p><blockquote>${t("没有已确认住客入住服务缓冲位 {service} 的证据。记录必须保持 UNVERIFIED。待核实，不得替我自动结案。", "No confirmed guest is evidenced at service holding {service}. The record must remain UNVERIFIED. Do not close on my behalf.").replace("{service}", F.service)}</blockquote><p>${t("程序要求每条未结记录都有一个责任人。当客人的经历无法被核实时，它开始改写处理人的身份。不要用一个人的名字去填补另一份记录的空白。", "The program requires an owner for every unresolved entry. When a guest’s experience cannot be verified, it begins rewriting the reviewer’s identity. Do not use a person’s name to fill the absence in another record.")}</p><p>${t("保留原始位置属性、当班处理人和两版核实状态。没有被证实的部分，应当继续留白。", "Retain the original position type, reviewer and verification states in both versions. Leave what has not been established unresolved.")}</p><p class="signature">${F.reviewerName} · ${F.reviewer}</p></article>${reference("review", t("打开本次复核表", "Open the current reconciliation form"))}`
    );
  }
  function review() {
    const state = getState();
    return (
      heading(
        "FINAL REVIEW / " + F.reservation,
        t("记录处理意见", "Record disposition"),
        t(
          "选择能够被原件支持的三项证据，再决定记录应如何归档。",
          "Associate three source-supported findings, then decide how the record should be filed.",
        ),
      ) +
      (state.completed.finalEvidence
        ? `<section class="document verification-receipt"><h2>${t("已关联的证据原件", "Associated source findings")}</h2>${D.finalClaims
            .filter((row) => row.correct)
            .map((row) => `<p>${t(...row.text)}</p>`)
            .join(
              "",
            )}<p>${t("当前复核编号", "Current review")}: ${F.temporary}</p><div class="decision-actions"><button data-case-action="close-case" data-ending="auto-close">AUTO CLOSE<br><span>${t("自动完成记录", "Automatically close the record")}</span></button><button data-case-action="close-case" data-ending="unverified">MARK UNVERIFIED<br><span>${t("按未核实状态归档", "Retain as unverified")}</span></button></div><p class="small">${t("处理方式不会改变原始证据。自动完成会为未结记录指定责任人。", "The disposition does not change the original evidence. Automatic closure assigns an owner to the unresolved entry.")}</p><button class="text-button" data-case-action="edit-evidence">${t("重新核对所选证据", "Review the selected findings again")}</button></section>`
        : `<form id="final-evidence-form"><fieldset><legend>${t("证据关联", "Evidence association")}</legend>${D.finalClaims.map((row) => `<label><input type="checkbox" name="claim" value="${row.id}" ${state.drafts.finalSelection.includes(row.id) ? "checked" : ""}><span>${t(...row.text)}</span></label>`).join("")}</fieldset><button class="primary">${t("核对所选证据", "Validate the associated findings")}</button><p id="evidence-error" class="form-error" tabindex="-1" role="status"></p></form>`)
    );
  }
  function ending() {
    const params = new URLSearchParams(location.hash.split("?")[1] || ""),
      state = getState();
    const requested = params.get("view"),
      id = state.endings.includes(requested) ? requested : state.lastEnding;
    if (!id) return review();
    const auto = id === "auto-close";
    return (
      heading(
        "DISPOSITION / " + F.reservation,
        auto ? "AUDIT COMPLETE" : "RECORD STATUS: UNVERIFIED",
        auto
          ? t("系统已接受复核。", "The system has accepted the reconciliation.")
          : t("历史更正已接收。", "Historical correction accepted."),
      ) +
      `<article class="document ending-record" data-ending-record="${id}"><table><tr><th>${t("记录状态", "Record status")}</th><td>${auto ? "VERIFIED / CLOSED" : "UNVERIFIED"}</td></tr><tr><th>${t("当前身份", "Current identity")}</th><td>${auto ? `${F.temporary} / ${t("永久夜班员工", "PERMANENT NIGHT CLERK")}` : `${F.temporary} / ${t("临时复核已结束", "REVIEW CONCLUDED")}`}</td></tr><tr><th>${t("夜班待办", "Pending shift")}</th><td>${auto ? "ASSIGNED" : "REMOVED"}</td></tr><tr><th>Check-out</th><td>${auto ? "Not available" : t("不再关联待办值班", "No pending shift associated")}</td></tr></table><p>${auto ? t("样本页面上的临时岗位已被改为夜间值班。原本留白的责任人一栏，现在有了你的编号。", "The temporary role on the sample page has become a night shift. The once-empty owner field now contains your identifier.") : t("Mara 的原始备注重新出现在记录中。没有新的住客身份被写入服务位，也不再需要下一位员工替它确认。", "Mara’s original note is restored. No new guest identity is written into the service position. No successor is needed to confirm it on her behalf.")}</p>${!auto ? `<blockquote>${t("待核实，不得替我自动结案。", "The record remains unverified. Do not close on my behalf.")}<br><span>${F.reviewerName} / ${F.reviewer}</span></blockquote>` : ""}</article><div class="ending-links">${a("review", t("回看另一种处理方式", "Review the other disposition"), "primary")}${a("notes", t("回看本次原件", "Reopen the case records"))}${a("careers", t("返回招聘页", "Return to careers"))}</div>`
    );
  }
  function photoCompare() {
    const row = D.revisions.find((item) => item.id === "location"),
      revision = getState().drafts.photoVersion === "revision";
    return `<details class="annotation-comparison"><summary>${t("登记标注层对照（同一底图）", "Compare registration annotation layers (same base image)")}</summary><p>${t("这里变化的是档案导出的标注层，不是走廊本身。它对应修订表中的位置属性字段。", "The exported annotation layer changes, not the corridor itself. It corresponds to the position-type field in the revision table.")}</p><div class="photo-tabs" role="group" aria-label="${t("选择标注版本", "Choose annotation version")}"><button data-case-action="photo-version" data-version="original" aria-pressed="${!revision}">${F.draft.slice(0, 4)} ORIGINAL</button><button data-case-action="photo-version" data-version="revision" aria-pressed="${revision}">${F.closure.slice(0, 4)} REVISION</button></div><figure class="annotated-photo"><img src="assets/hallway.jpg" alt="${t("同一走廊照片，叠加两版位置标注", "The same corridor photograph with versioned position annotations")}"><figcaption>${t(...(revision ? row.revised : row.original))}</figcaption></figure></details>`;
  }
  function credits() {
    return (
      heading(
        "IMAGE SOURCES",
        t("图片来源", "Image sources"),
        t(
          "实拍酒店照片仅用作虚构场景，与现实酒店、摄影师及其服务无关。档案中的服务区标注为本作品叠加的示意层，不是原照片的一部分。",
          "Real hotel photographs are used as fictional scenery, with no connection to the real hotels, photographers or services. Service-area annotations are illustrative overlays, not part of the original photographs.",
        ),
      ) +
      `<div class="credit-list">${D.photographs.map((photo) => `<article><h2>${esc(photo.file)}</h2><p>${esc(photo.title)}<br>${esc(photo.author)}</p><a href="${photo.source}" target="_blank" rel="noopener noreferrer">${t("原始来源", "Original source")} ↗</a> · <a href="${photo.license_url}" target="_blank" rel="noopener noreferrer">${esc(photo.license)} ↗</a></article>`).join("")}</div><p class="small">${t("界面借鉴早期酒店和办公网页的结构与密度，未复制真实招聘平台或酒店品牌标识。", "The interface studies the structure and density of early hotel and office websites. No real recruitment platform or hotel brand identity is copied.")}</p>`
    );
  }
  return {
    hotel,
    reservations,
    rooms,
    guestbook,
    credits,
    "night-audit": nightAudit,
    staff,
    revisions,
    closure,
    mara,
    review,
    ending,
    "floor-plan": floorPlan,
    notices,
    maintenance,
    history,
    contact,
    notes,
    noticeWindow,
    heading,
    reference,
  };
};
