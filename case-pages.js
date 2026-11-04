/* Read-only hotel documents and normal business screens. State changes stay in case-state. */
globalThis.StillwaterCaseViews = function ({ t, esc, getState }) {
  const D = globalThis.StillwaterCaseData,
    F = D.facts;
  const mirrored = () =>
    getState().night.started &&
    getState().lastEnding !== "released" &&
    new URLSearchParams(location.hash.split("?")[1] || "").get("copy") !==
      "original";
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
  const media = globalThis.StillwaterMedia;
  const photo = (id, cls = "") => {
    const p = media.find(id);
    return `<img class="${cls}" src="assets/${esc(p.file)}" alt="${esc(t(...p.alt))}" width="${p.width}" height="${p.height}" loading="lazy">`;
  };
  const photoStrip = (ids, cls = "") =>
    `<div class="hotel-photo-strip ${cls}">${ids.map((id) => `<figure>${a("gallery", photo(id))}<figcaption>${esc(t(...media.find(id).caption))}</figcaption></figure>`).join("")}</div>`;
  function noticeWindow() {
    return `<aside class="notice-window" aria-label="${t("历史通行公告", "Historic access notice")}"><header><span>3F ROUTE NOTICE</span><button type="button" data-case-action="dismiss-notice" aria-label="${t("关闭通行公告", "Close access notice")}">×</button></header><div><h2>${t("三楼西侧通道维修中", "West third-floor passage under repair")}</h2><p>${t("维修期间请走东侧楼梯。旧房卡如有问题，请找前台核对。", "Please use the east stairs during repairs. Bring any problems with old room keys to reception.")}</p><p class="reference">${F.notice} · ${F.transfer.slice(0, 10)}</p>${reference("notices", t("查看完整公告", "View original notice"))}</div></aside>`;
  }
  function hotel() {
    return `<section class="hotel-hero"><img src="assets/lobby.jpg" alt="${t("酒店大堂与木质楼梯", "Hotel lobby and wooden staircase")}"><div><p class="kicker">INDEPENDENT LAKESIDE HOTEL · EST. 1987</p><h1>${t("欢迎来到静水旅馆", "Welcome to Stillwater")}</h1><p>${t("湖畔客房，安静舒适，适合短住或长住。", "Quiet rooms by the lake, for a night or a longer stay.")}</p>${a("reservations", t("预订查询", "Find a reservation"), "primary")}</div></section><p class="daily-notice">${t("早餐于 7:00–9:00 在一层餐厅供应。晚到的住客请先到前台领取房卡；需要加领毛毯，也可向值班人员询问。", "A note from reception: breakfast is served from 7:00 to 9:00. Late arrivals should collect a room card at reception. Ask the member of staff on duty if you need an extra blanket.")}</p><div class="hotel-intro"><p>${t("旅馆保留了木质楼梯和老式家具。天气好时，欢迎到庭院坐坐。湖边早晚风大，出门不妨带件外套。", "The lobby and rooms retain the wooden stairs and older furnishings. Enjoy the courtyard in good weather, and bring an extra layer for breezy mornings and evenings by the lake.")}</p><p>${t("提供双人房、双床房及长住套间。客房页附有照片和设施说明，可按入住需要选择。", "Choose a double, a twin or a suite for a longer stay. If you are unsure, have a look at the room photographs and facilities.")}</p>${a("rooms", t("浏览客房与设施", "Rooms & facilities"))}</div><section class="hotel-photo-section"><header><div><p class="kicker">AROUND THE HOTEL</p><h2>${t("住在这里", "A look around")}</h2></div>${a("gallery", t("查看旅馆相册", "View our photo gallery"))}</header>${photoStrip(["hotel-dining", "hotel-garden", "hotel-dayroom"])}</section>${globalThis.StillwaterHotelExtras.home({t, esc})}`;
  }
  function reservations() {
    return (
      heading(
        "RESERVATIONS",
        t("预订查询", "Reservation search"),
        t(
          "输入预订编号，查询历史订房记录。",
          "Look up a retained booking by reference. No payment or real reservation is taken here.",
        ),
      ) +
      `<form id="reservation-search" class="record-query"><label for="reservation-reference">${t("预订编号", "Reservation reference")}</label><div class="query-row"><input id="reservation-reference" name="reference" maxlength="32" value="${esc(getState().drafts.reservation || "")}" autocomplete="off" placeholder="R-____" required><button class="primary">${t("查看预订", "View reservation")}</button></div><div class="form-error" tabindex="-1" id="reservation-error" role="status"></div></form>${has("C2") && getState().drafts.reservation.trim().toUpperCase() === F.reservation ? booking() : `<p class="small">${t("工作样本中附有预订编号。", "Missing a reference? Check the original role sample.")}</p>${reference("careers", t("岗位样本", "Role sample"))}`}`
    );
  }
  function booking() {
    return `<section class="document" id="reservation-result"><h2>${t("旧预订单", "Retained booking")} · ${F.reservation}</h2><table><tbody><tr><th>${t("预订编号", "Reference")}</th><td>${F.reservation}</td></tr><tr><th>${t("住客姓名缩写", "Guest initials")}</th><td>${F.guest}</td></tr><tr><th>${t("登记房号", "Assigned room")}</th><td>${F.bookedRoom}</td></tr><tr><th>${t("登记时间", "Created")}</th><td><time datetime="${F.created}">${date(F.created)}</time></td></tr><tr><th>${t("状态", "Status")}</th><td>UNRESOLVED / ${t("待处理", "Retained for reconciliation")}</td></tr></tbody></table><p class="small">${t("这是原始订房记录。是否实际入住，须另查前台记录。", "The booking database records assignment only. Occupancy must be checked against housekeeping and reception records.")}</p>${reference("rooms", t("查看客房目录", "Compare the official room directory"))}</section>`;
  }
  function rooms() {
    return (
      heading(
        "ROOMS & FACILITIES",
        t("客房与设施", "Rooms & facilities"),
        t(
          "双人房、双床房和长住套间均配独立卫浴，提供每日客房清洁。",
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
            "38 平方米 · 休息区 · 独立入口",
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
        )}</div>${mirrored() ? `<p>${a("rooms?copy=original", t("查看历史房间目录", "View historical directory"))} · ${a("guestbook", t("查看同日住客留言", "Read the entry from that night"))}</p>` : ""}<div class="hotel-columns"><section><h2>${t("三楼房间列表", "Third-floor guest directory")}</h2><p class="small">${t("以下为三楼可预订的客房。未开放区域不列入预订。", "These third-floor rooms are available to book. Some areas are not open to guests.")}</p><ol class="room-inventory" aria-label="${t("官方房号", "Official room numbers")}">${(mirrored() ? [...D.inventory, F.service].sort() : D.inventory).map((n) => `<li>${n === F.service ? a("mirror?room=317", n) : n}</li>`).join("")}</ol>${has("C2") ? `<form id="inventory-check"><label for="inventory-room">${t("预订单上写的房号", "Room assigned on the original booking")}</label><div class="query-row"><select id="inventory-room" name="room" required><option value="">${t("选择房号", "Select the corresponding entry")}</option>${D.inventory.map((n) => `<option>${n}</option>`).join("")}</select><button>${t("核对房号", "Compare record")}</button></div><div class="form-error" tabindex="-1" id="inventory-error" role="status"></div></form>${has("C3") ? reference("guestbook", t("查看同日住客留言", "Read the guest entry from that night")) : ""}` : reference("reservations", t("查询旧预订单", "Find a retained booking"))}<details><summary>${t("入住服务", "Guest services")}</summary><p>${t("早餐时间为 7:00–9:00，地点在一层餐厅。如需额外床品，请联系前台。", "Breakfast is served in the ground-floor dining room from 07:00 to 09:00. Extra bedding is available from reception.")}</p>${reference("contact", t("前台服务卡", "Reception contact card"))}</details></section><div>${!getState().notices.dismissed ? noticeWindow() : `<aside class="notice-archive-link"><p>${t("往年的通行安排可在公告栏查阅。", "Access information is retained in the notice archive.")}</p>${reference("notices", t("公告栏", "Notice archive"))}</aside>`}</div></div><p class="hotel-album-link">${a("gallery", t("更多客房与环境照片", "More room and hotel photographs"))} →</p>`
    );
  }
  function guestbook() {
    return (
      heading(
        "GUESTBOOK",
        t("住客留言", "Guestbook"),
        t("感谢各位住客留下入住感受。", "Thank you to our guests for sharing their stays."),
      ) +
      `${globalThis.StillwaterHotelExtras.guestEntries({t,esc})}<article class="guest-message"><header><strong>R. Bennett</strong><time>2006-10-15 09:10</time></header><p>${t("早餐挺不错。我们到得很晚，前台还在，挺方便的。", "A good breakfast and helpful arrangements for our late arrival. Thank you.")}</p></article>${has("C3") ? `<article class="guest-message case-message"><header><strong>${F.guest}</strong><time datetime="${F.message}">${date(F.message)}</time></header><p>${mirrored() ? t("已正常入住。", "Checked in normally.") : message}</p>${mirrored() ? reference("guestbook?copy=original", t("查看历史留言副本", "View historical copy")) + " · " + reference("cameras",t("前台附注：维修通道监控已恢复","Reception note: passage cameras restored")) : ""}<button data-case-action="read-key">${t("看前台回复", "Read reception’s attachment")}</button>${has("C4") ? `<div class="reception-attachment"><p>${t("已收到。预订单上的房号没有改动，钥匙套仍在核查。请先查看当天的楼层图。", "Noted. The booking assignment is unchanged; we are checking the key sleeve. Please look at the floor plan from that date.")}</p>${reference("floor-plan", t("三楼平面图", "Third-floor plan"))}</div>` : ""}</article>` : `<p>${t("查询旧留言，请填写预订单上的房号。", "To locate an entry associated with a booking, first identify its reservation record.")}</p>${reference("reservations", t("按预订检索", "Look up a booking"))}`}<article class="guest-message"><header><strong>J. Park</strong><time>2006-10-18 08:15</time></header><p>${t("双床房还可以。早上坐在院子里很舒服。", "A tidy twin room. The courtyard was a pleasant place to sit in the morning.")}</p></article>`
    );
  }
  function floorPlan() {
    const inspected = getState().completed.serviceInspected;
    return (
      heading(
        "3F / FLOOR PLAN",
        t("三楼平面图", "Third-floor plan"),
        t(
          "三楼客房、走廊及服务区域的位置。",
          "Guest-door positions and maintenance access.",
        ),
      ) +
      `<div class="floor-plan" aria-label="${t("三楼平面图", "Third-floor layout")}"><div class="plan-corridor">${t("主走廊 · 通往前台楼梯", "MAIN CORRIDOR · RECEPTION STAIRS")}</div><div class="plan-rooms">${Array.from(
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
          ? `<section class="document"><h2>${t("区域登记卡", "Position record")}</h2><table><tr><th>${t("内部标识", "Internal identifier")}</th><td>${F.service}</td></tr><tr><th>${t("登记用途", "Registered use")}</th><td>SERVICE HOLDING / ${t("服务暂存区", "Service holding position")}</td></tr><tr><th>${t("公告编号", "Related notice")}</th><td>${F.notice}</td></tr></table><p>${t("暂存待处理的服务记录，不对外作为客房使用。", "Used to hold service records that cannot yet be reconciled. Not listed as assignable guest accommodation.")}</p><form id="service-classification"><fieldset><legend>${t("根据登记卡，这个区域属于哪一类？", "How should this position be classified in the review?")}</legend>${[
              ["guest", t("住客已入住的客房", "Confirmed occupied guest room")],
              [
                "service",
                t("非客房 / 服务暂存区", "Non-guest space / service holding"),
              ],
              [
                "typo",
                t(
                  "仅为门牌印刷错误，无需核查",
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
              )}</fieldset><button>${t("保存选择", "Retain position classification")}</button><div class="form-error" tabindex="-1" id="service-error" role="status"></div></form>${has("C5") ? reference("maintenance", t("查询对应维修单", "Look up the associated maintenance docket")) : ""}</section>`
          : ""
      }`
    );
  }
  function notices() {
    return (
      heading(
        "NOTICE ARCHIVE",
        t("公告栏", "Notice archive"),
        t(
          "前台留存的历年通知。",
          "Access and maintenance notices retained by reception.",
        ),
      ) +
      `<article class="document"><p class="kicker">${F.notice} / ${F.transfer.slice(0, 10)}</p><h2>3F ROUTE NOTICE</h2><p>${t("三楼西侧通道维修期间，部分区域暂停通行。旧门牌可能与前台资料不一致，请以登记卡为准；遇到房号不符，请交当班人员核对。", "Repairs are in progress on the west third-floor passage. Some areas are temporarily closed. Old door labels may differ from reception records; consult the position card. Refer mismatched numbers to the staff on duty.")}</p><p>${t("详细记录见同编号维修单。", "The corresponding maintenance docket retains the detailed record.")}</p>${has("C5") ? reference("maintenance", t("查询维修单", "Find the maintenance docket")) : reference(has("C4") ? "floor-plan" : "reservations", t("查看相关登记资料", "Identify the related position record"))}<button data-case-action="reopen-notice">${t("重新打开公告窗", "Reopen the notice window")}</button></article>`
    );
  }
  function maintenance() {
    return (
      heading(
        "MAINTENANCE RECORDS",
        t("维修档案查询", "Maintenance docket lookup"),
        t(
          "请填写公告所列编号。",
          "Use the reference printed on the reception notice.",
        ),
      ) +
      `<form id="maintenance-search" class="record-query"><label for="maintenance-reference">${t("公告或维修单编号", "Notice / docket reference")}</label><div class="query-row"><input id="maintenance-reference" name="reference" maxlength="32" value="${esc(getState().drafts.maintenance || "")}" placeholder="A-__-__" autocomplete="off" required><button>${t("打开维修单", "Open original")}</button></div><div id="maintenance-error" class="form-error" tabindex="-1" role="status"></div></form>${has("C6") && getState().drafts.maintenance.trim().toUpperCase() === F.notice ? `<article class="document" id="maintenance-result"><h2>${F.notice} / ${t("夜审移交", "Night-audit handover")}</h2><table><tr><th>${t("时间", "Timestamp")}</th><td><time datetime="${F.transfer}">${date(F.transfer)}</time></td></tr><tr><th>${t("预订编号", "Record reference")}</th><td>${F.reservation}</td></tr><tr><th>${t("区域用途", "Position classification")}</th><td>${F.service} / SERVICE HOLDING</td></tr><tr><th>${t("处理人", "Handover owner")}</th><td>${F.reviewer} / ${F.reviewerName}</td></tr></table><p>${t("夜审把待核查的预订单移交给当班人员。入住情况一栏未填写。", "Automatic night audit moved an unreconciled booking to a service holding position and required an owner. This action did not verify actual guest occupancy.")}</p><section class="handover-excerpt"><h3>${t("附件：客房部巡查记录", "Attached extract: housekeeping check")}</h3><p><time datetime="${F.housekeeping}">${date(F.housekeeping)}</time> · ${t(...D.audit.find((row) => row.id === "housekeeping").text)}</p></section><figure class="service-photo"><img src="assets/hallway.jpg" alt="${t("酒店走廊及服务区域标注示意", "Hotel corridor with a service-area annotation")}"><figcaption>${t("登记区域", "Position annotation")}: ${F.service} / SERVICE HOLDING</figcaption></figure>${reference("night-audit", t("查看当晚记录", "Reconcile the source records from that night"))}</article>` : ""}`
    );
  }
  function history() {
    return (
      heading(
        "HOTEL HISTORY",
        t("旅馆沿革", "Our history"),
        t(
          "一间湖边的家庭旅馆，木质楼梯和老式家具一直保留至今。",
          "An independent lakeside hotel with original woodwork and family-run hospitality.",
        ),
      ) +
      `${photo("hotel-exterior", "history-image")}<p>${t("旅馆于 1987 年开业，后增设庭院和东翼客房。历次房型调整和通行安排均留有档案。", "Opened in 1987, with a courtyard and east-wing rooms added later. The archive retains changes to the guest inventory and access arrangements.")}</p>${photoStrip(["hotel-lounge", "hotel-dayroom"], "hotel-history-photos")}${has("C7") ? reference("closure", t("后来补入的通知", "Archived addendum: closure notice")) : reference("notices", t("前台留存公告", "Reception notice archive"))}`
    );
  }
  function contact() {
    return (
      heading(
        "CONTACT / RECEPTION",
        t("前台服务", "Reception services"),
        t(
          "前台全天值班。如需客房用品，请到柜台领取或询问。",
          "Guest-service card retained from the 2006 website.",
        ),
      ) +
      `${photoStrip(["hotel-dining", "hotel-breakfast"], "hotel-service-photos")}<dl class="contact-facts"><div><dt>${t("前台", "Front desk")}</dt><dd>${t("全天值班", "Staffed around the clock")}</dd></div><div><dt>${t("早餐", "Breakfast")}</dt><dd>07:00–09:00</dd></div><div><dt>${t("客房用品", "Room supplies")}</dt><dd>${t("可提供额外毛毯与毛巾", "Extra blankets and towels available")}</dd></div></dl><p>${t("晚到的住客请先到前台办理入住。需要加领毛毯或毛巾，也请到这里询问。", "This is a read-only historical contact card, not a real hotel’s telephone, email or booking service.")}</p>${reference("reservations", t("查询旧预订单", "Find a retained reservation"))}${reference("guestbook", t("住客留言", "Guestbook"))}${globalThis.StillwaterHotelExtras.note({t})}${globalThis.StillwaterHotelExtras.guide({t})}`
    );
  }
  function notes() {
    return (
      heading(
        "CASE NOTES",
        t("工作笔记", "Case Notes"),
        t(
          "本次查看过的文件及出处。",
          "Original records already opened and reconciled in this review.",
        ),
      ) +
      `${
        getState().endings.length
          ? `<section class="past-dispositions"><h2>${t("已保存的处理结果", "Retained dispositions")}</h2>${getState()
              .endings.map((id) =>
                reference(
                  "ending?view=" + id,
                  id === "auto-close"
                    ? "AUTO CLOSE"
                    : id === "released"
                      ? "REVIEW ENDED / RELEASED"
                      : "MARK UNVERIFIED",
                ),
              )
              .join("")}</section>`
          : ""
      }${
        getState().evidence.length
          ? `<div class="case-notes">${getState()
              .evidence.map((id) => {
                const c = D.clues[id];
                return `<article><h2>${t(...c.title)}</h2><p class="small">${t("来源", "Source")}: ${c.source}</p>${reference(c.route + (id === "C2" ? "?record=" + F.reservation : id === "C6" ? "?record=" + F.notice : id === "C3" || id === "C4" ? "?copy=original" : ""), t("重新打开", "Reopen original"))}</article>`;
              })
              .join("")}</div>`
          : `<p>${t("还没有查看记录。可以先打开招聘页的工作样本。", "No records retained yet. Start with the role sample.")}</p>${reference("careers", t("查看岗位样本", "Review the role sample"))}`
      }`
    );
  }
  function nightAudit() {
    const state = getState();
    return (
      heading(
        "NIGHT AUDIT / " + F.reservation,
        t("核对当晚记录", "Source-record reconciliation"),
        t(
          "用“上移”“下移”调整顺序，按日期和时间由早到晚排列。排好后，选择下方的核对结果。",
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
        )}</ol><fieldset><legend>${t("根据这些记录，能否确定住客实际住进了 {service}？", "Do these records establish that the guest occupied {service}?").replace("{service}", F.service)}</legend>${[
        ["confirmed", t("能确定", "Confirmed")],
        [
          "insufficient",
          t("目前还不能确定", "Insufficient evidence / unverified"),
        ],
        [
          "other-room",
          t(
            "能确定住客住在另一间房",
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
        )}</fieldset><button class="primary" type="submit">${t("提交核对结果", "Reconcile sequence & finding")}</button><div id="audit-error" class="form-error" tabindex="-1" role="status"></div></form>${state.completed.audit ? reference("staff", t("打开当班员工档案", "Associated reviewer file")) : ""}`
    );
  }
  function staff() {
    return (
      heading(
        "PERSONNEL / " + F.reviewer,
        t("人员档案", "Personnel record"),
        t(
          "当班人员登记资料。",
          "The retained record for the employee on duty.",
        ),
      ) +
      `<article class="document"><h2>${F.reviewerName} / ${F.reviewer}</h2><table><tr><th>${t("原岗位", "Original role")}</th><td>${t("夜班审计员", "Night-audit clerk")}</td></tr><tr><th>${t("职责", "Responsibility")}</th><td>${t("核对房态、钥匙发放与预订记录。", "Cross-check guest inventory, keys and reservations.")}</td></tr><tr><th>${t("经手记录", "Associated record")}</th><td>${F.reservation} · ${F.notice}</td></tr><tr><th>${t("移交时间", "Original handover")}</th><td>${date(F.transfer)}</td></tr></table><p>${t("这笔预订有两份文件，两份的处理人一栏不同。", "Two copies have the same booking reference, but different entries in the reviewer field.")}</p>${reference("revisions", t("比较原稿与修订副本", "Compare original and revised copies"))}</article>${has("C7") ? `<section class="queue-panel"><h2>${t("Continuity / 当前待办", "Continuity / Pending work")}</h2><p>${t("手动刷新可查看当前经手人。", "Refresh to see who is handling this record now.")}</p><button data-case-action="refresh-queue">${t("刷新待办", "Refresh queue")}</button>${getState().queueRefreshed ? `<table class="current-queue"><tr><th>${t("预订编号", "Reference")}</th><td>${F.reservation}</td></tr><tr><th>${t("当前处理人", "Current reviewer")}</th><td>${F.temporary}</td></tr><tr><th>${t("生成批次", "Generated batch")}</th><td>${F.recruitment}</td></tr><tr><th>${t("状态", "Status")}</th><td>PENDING SIGN-OFF</td></tr></table><p class="warning-note">${t("记录未结案，须指定处理人。", "A reviewer must remain assigned until the record is closed.")}</p>` : ""}</section>` : ""}`
    );
  }
  function revisions() {
    const selected = getState().drafts.revisionSelection;
    return (
      heading(
        "REVISION HISTORY / " + F.reservation,
        t("记录修改对照", "Two versions of one record"),
        t(
          "左侧为原稿，右侧为修改稿。请逐行比较，只勾选有改动的项目。",
          "Mark only fields that actually changed between these originals. The original booking reference is unchanged.",
        ),
      ) +
      `<form id="revision-form"><div class="table-scroll" tabindex="0" aria-label="${t("修订对照表", "Revision comparison table")}"><table class="revision-table"><thead><tr><th>${t("有修改", "Changed")}</th><th>${t("字段", "Field")}</th><th>ORIGINAL<br><time>${date(F.draft)}</time></th><th>REVISION<br><time>${F.closure}</time></th></tr></thead><tbody>${D.revisions.map((row) => `<tr><td><input type="checkbox" name="difference" value="${row.id}" ${selected.includes(row.id) ? "checked" : ""} aria-label="${t(...row.label)}"></td><th>${t(...row.label)}</th><td>${t(...row.original)}</td><td>${t(...row.revised)}</td></tr>`).join("")}</tbody></table></div><p class="small">${t("原预订单的住客为 {guest}。请分别核对两份表中的人员栏。", "The booking’s original guest initials remain {guest}; the revision reclassifies the former reviewer as a guest.").replace("{guest}", F.guest)}</p><button class="primary">${t("保存对比", "Retain comparison")}</button><div id="revision-error" class="form-error" tabindex="-1" role="status"></div></form>${has("C7") ? `${photoCompare()}<section class="document"><p>${t("对比结果已保存，附有同日通知。", "Comparison saved. A notice dated the same day is attached.")}</p>${reference("closure", t("查看所附通知", "Archived attachment: closure notice"))}<details><summary>${t("查询当前队列", "Query the current queue")}</summary>${reference("staff", t("员工资料和当前待办", "Personnel file and current assignment"))}</details></section>` : ""}`
    );
  }
  function closure() {
    return (
      heading(
        "ARCHIVED ADDENDUM / " + F.closure,
        t("停业通知", "Closure notice"),
        t(
          "补入存档的通知，发布日期见原件。",
          "A later addendum retained with the original hotel records.",
        ),
      ) +
      `<article class="document"><p>${t("静水旅馆自 {date} 起停止接待住客，不再办理新入住或提供夜间宾客服务。原始预订资料留存备查。", "Stillwater Hotel ceased receiving guests on {date}. No further stays or overnight guest services were to be arranged. Original bookings were retained for reconciliation.").replace("{date}", F.closure)}</p><p>${t("停业后仅开放历史资料查询。批量生成的“已完成”标记尚未经人工复核。", "After closure, access is limited to historical records. Completion flags created by batch processing have not been reviewed by staff.")}</p><p class="archive-stamp">RETAINED / ${F.closure}</p></article>${reference("mara", t("附件：Mara 的备注草稿", "Retained in the same file: Mara’s original note"))}`
    );
  }
  function mara() {
    return (
      heading(
        "RETAINED DRAFT / " + F.reviewer,
        t("Mara 的备注草稿", "Mara’s draft note"),
        t("未发送的草稿。", "A draft recovered from an old file."),
      ) +
      `<article class="document mara-draft"><p class="kicker">${date(F.draft)} / ${F.reviewer}</p><blockquote>${t("这里不是客房。", "This is not a guest room.")}<br>${F.service} / UNVERIFIED</blockquote><p>${t("预订单、钥匙和客房部的记录，我都查过了。还是不知道客人到底去了哪儿。", "I checked the booking, the keys and the housekeeping records. I still cannot tell where the guest went.")}</p><p>${t("系统还在催我选“已完成”。我没选。", "The system keeps asking for “completed.” I have not selected it.")}</p><p>${t("我在处理人那栏，不在住客栏。别把两栏混在一起。", "My name belongs under reviewer, not guest. Those two fields must stay separate.")}</p><p>${t("这条先记待核实。没查清楚之前，别替我签字。", "Leave this one open for now. Do not sign it off on my behalf until it has actually been checked.")}</p><p class="signature">— ${F.reviewerName} / ${F.reviewer}</p></article>${reference("review", t("核对本次调查资料", "Review the source findings"))}`
    );
  }
  function review() {
    const state = getState();
    return (
      heading(
        "SOURCE REVIEW / " + F.reservation,
        t("资料核对", "Source review"),
        t(
          "请选择三项能在原始记录中找到依据的说法，再提交核对。",
          "Check three findings against their sources, then synchronize the hotel directory.",
        ),
      ) +
      (state.completed.finalEvidence
        ? `<section class="document verification-receipt"><h2>${t("已核对的三项记录", "Associated source findings")}</h2>${D.finalClaims
            .filter((row) => row.correct)
            .map((row) => `<p>${t(...row.text)}</p>`)
            .join(
              "",
            )}<p>${t("本次工作编号", "Current review")}: ${F.temporary}</p><p>${t("两份客房目录不一致，当前显示的仍是旧版。", "The two room directories differ. This page is not the latest version.")}</p><button class="primary" data-case-action="sync-records">${t("同步资料，返回酒店查看", "Synchronize records and return to the hotel")}</button><button class="text-button" data-case-action="edit-evidence">${t("返回修改", "Review the selected findings again")}</button></section>`
        : `<form id="final-evidence-form"><fieldset><legend>${t("选择记录", "Evidence association")}</legend>${D.finalClaims.map((row) => `<label><input type="checkbox" name="claim" value="${row.id}" ${state.drafts.finalSelection.includes(row.id) ? "checked" : ""}><span>${t(...row.text)}</span></label>`).join("")}</fieldset><button class="primary">${t("核对这三条", "Validate the associated findings")}</button><div id="evidence-error" class="form-error" tabindex="-1" role="status"></div></form>`)
    );
  }
  function ending() {
    const params = new URLSearchParams(location.hash.split("?")[1] || ""),
      state = getState();
    const requested = params.get("view"),
      id = state.endings.includes(requested) ? requested : state.lastEnding;
    if (!id) return review();
    const auto = id === "auto-close";
    const face = !state.preferences.skipScares && !state.preferences.reduceMotion &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const staffCard = auto ? `<section class="ending-staff-card" aria-label="${t("当前员工证","Current staff card")}">${face ? `<img src="assets/haunt-v442/corridor.jpg" width="128" height="96" alt="${t("系统留存的员工照片","Staff photograph retained by the system")}">` : '<span class="ending-staff-placeholder" aria-hidden="true">SW</span>'}<div><p>CONTINUITY / STAFF</p><strong>Rieyeki · ${F.temporary}</strong><p>${t("岗位：夜班审计员 · 长期排班","Night-audit clerk · Permanent assignment")}</p></div></section>` : "";
    return (
      heading(
        "DISPOSITION / " + F.reservation,
        auto ? "AUDIT COMPLETE" : "RECORD STATUS: UNVERIFIED",
        auto
          ? t("已提交。", "The system has accepted the reconciliation.")
          : t("修改已保存。", "Historical correction accepted."),
      ) +
      `<article class="document ending-record" data-ending-record="${id}">${staffCard}<table><tr><th>${t("记录状态", "Record status")}</th><td>${auto ? "VERIFIED / CLOSED" : "UNVERIFIED"}</td></tr><tr><th>${t("当前员工编号", "Current identity")}</th><td>${auto ? `${F.temporary} / ${t("永久夜班员工", "PERMANENT NIGHT CLERK")}` : `${F.temporary} / ${t("临时工作已结束", "REVIEW CONCLUDED")}`}</td></tr><tr><th>${t("下一班", "Pending shift")}</th><td>${auto ? "ASSIGNED" : "REMOVED"}</td></tr><tr><th>Check-out</th><td>${auto ? "Not available" : t("无后续班次", "No pending shift associated")}</td></tr></table><p>${auto ? t("岗位：夜班审计员。临时用工期限已取消。", "The temporary role on the sample page has become a night shift. The once-empty owner field now contains your identifier.") : t("原备注已保留，记录状态仍为待核实。退出交接尚未提交。", "Mara’s note is retained and the record remains unverified. Exit handover: not submitted.")}</p>${!auto ? `<blockquote>${t("这条还没查清，别替我自动结案。", "The record remains unverified. Do not close on my behalf.")}<br><span>${F.reviewerName} / ${F.reviewer}</span></blockquote>` : ""}</article>`
    );
  }
  function photoCompare() {
    const row = D.revisions.find((item) => item.id === "location"),
      revision = getState().drafts.photoVersion === "revision";
    return `<details class="annotation-comparison"><summary>${t("照片登记标注", "Compare registration annotation layers (same base image)")}</summary><p>${t("两版是同一张走廊照片，登记用途却不同。切换版本可查看标注。", "The exported annotation layer changes, not the corridor itself. It corresponds to the position-type field in the revision table.")}</p><div class="photo-tabs" role="group" aria-label="${t("选择版本", "Choose annotation version")}"><button data-case-action="photo-version" data-version="original" aria-pressed="${!revision}">${F.draft.slice(0, 4)} ORIGINAL</button><button data-case-action="photo-version" data-version="revision" aria-pressed="${revision}">${F.closure.slice(0, 4)} REVISION</button></div><figure class="annotated-photo"><img src="assets/hallway.jpg" alt="${t("同一走廊照片，叠加两版位置标注", "The same corridor photograph with versioned position annotations")}"><figcaption>${t(...(revision ? row.revised : row.original))}</figcaption></figure></details>`;
  }
  function gallery() {
    return (
      heading(
        "PHOTO GALLERY",
        t("旅馆相册", "Around the hotel"),
        t(
          "客房、庭院与公共区域照片。",
          "A few photographs of the rooms, courtyard and shared spaces.",
        ),
      ) +
      `<section class="hotel-gallery-grid">${media.photos
        .filter((p) => p.group === "hotel")
        .map(
          (p) =>
            `<figure><button type="button" data-hotel-photo aria-label="${t("放大照片：", "Enlarge photograph: ")}${esc(t(...p.caption))}">${photo(p.id)}</button><figcaption>${esc(t(...(globalThis.StillwaterHotelExtras.captions[p.file] || p.caption)))}</figcaption></figure>`,
        )
        .join("")}${[
        ["lobby.jpg", t("大堂", "Lobby")],
        ["guestroom.jpg", t("标准双人房", "Classic double")],
        ["twin.jpg", t("庭院双床房", "Courtyard twin")],
        ["suite.jpg", t("长住套间", "Residence suite")],
      ]
        .map(
          ([file, title]) =>
            `<figure><button type="button" data-hotel-photo aria-label="${t("放大照片：", "Enlarge photograph: ")}${title}"><img src="assets/${file}" alt="${title}" loading="lazy"></button><figcaption>${esc(t(...globalThis.StillwaterHotelExtras.captions[file]))}</figcaption></figure>`,
        )
        .join(
          "",
        )}</section><p class="hotel-album-link">${a("rooms", t("查看客房与设施", "Rooms & facilities"))} · ${a("contact", t("前台服务", "Reception services"))}</p>`
    );
  }
  function credits() {
    return (
      heading(
        "IMAGE SOURCES",
        t("图片来源", "Image sources"),
        t(
          "酒店和店铺使用的实拍照片列于下方。真实场所、人物及摄影师与本作剧情无关。页面使用低清、JPEG 压缩副本，原图和许可保留；档案中的服务区标注为后加的示意内容。",
          "Existing photographs illustrate fictional hotels and shops. The real properties, people and photographers are not connected with the story. Originals are retained; display copies are downsampled and JPEG-compressed. Service-area labels are separate illustrative overlays.",
        ),
      ) +
      `<p>${t("走廊人影、柜中爬出的身影、玻璃后的面孔和倒悬身影均为生成插图，人物是虚构的，并非真实事件照片。", "The new edition's scare scenes are generated fictional illustrations: a corridor figure, someone crawling from a cabinet, a face behind glass and an inverted ceiling figure. They do not depict real people or incidents.")} <a href="assets/haunt-v442/manifest.json">${t("素材记录", "Asset record")}</a></p><p>${t("未归档画面中的两幅人像来自本项目的第三阶段概念文档，保留原始 PNG 文件。", "The two portraits in the unlisted chapter come from the project's supplied concept document; their original PNG files are retained.")} <a href="assets/void-v26/credits.json">${t("第三阶段素材记录", "Unlisted chapter sources")}</a></p><p>${t("聊天头像使用有许可的网络照片。参考截图里的私人头像和联系人资料未用于本作。", "Chat avatars use licensed photographs from the web. Private avatars and contact details from the reference screenshot are not used.")} <a href="assets/chat-avatars/credits.json">${t("头像作者、来源及许可", "Avatar authors, sources and licenses")}</a></p><section class="audio-credits"><h2>${t("音乐与音效", "Music & sound")}</h2><p>${t("背景音乐使用 CC0 音源，压缩后按需加载。提示音、机位切换声和呼吸声由浏览器合成，没有使用微信官方音效。", "The CC0 music is compressed and served locally on demand. Notifications, camera feedback and breathing are synthesized in the browser; no official messenger sounds are used.")}</p><ul>${globalThis.StillwaterAudioTracks.map(track=>`<li><a href="${esc(track.source)}" target="_blank" rel="noopener noreferrer">${esc(track.title)}</a> · ${esc(track.author)} · <a href="${esc(track.license_url)}" target="_blank" rel="noopener noreferrer">CC0</a></li>`).join("")}</ul><p><a href="assets/audio-v28/credits.json">${t("音源与压缩文件记录", "Audio source & processing ledger")}</a></p></section><details><summary>${t("保留素材的来源", "Retained asset sources")}</summary><p><a href="https://commons.wikimedia.org/wiki/File:Mask_Diabo_of_Portugal_used_on_folk_fest_and_rituals.jpg" target="_blank" rel="noopener">${t("民俗面具摄影", "Folk-mask photograph")} · Wilfredor · CC0</a> — ${t("原图与低清副本继续保留，并沿用原许可。", "The original and display copy remain available under their source license.")}</p></details><div class="credit-list">${[...D.photographs, ...media.photos].map((photo) => `<article><h2>${esc(photo.file)}</h2><p>${esc(photo.title)}<br>${esc(photo.author)}</p><a href="${photo.source}" target="_blank" rel="noopener noreferrer">${t("原始来源", "Original source")} ↗</a> · <a href="${photo.license_url}" target="_blank" rel="noopener noreferrer">${esc(photo.license)} ↗</a></article>`).join("")}</div><p class="small">${t("监控场景由程序绘制，分辨率为 320 × 240；第三阶段为 480 × 360。门牌、时间和机位编号分别绘制。酒店页面参考了 2010 年代官网的版式，未使用真实品牌标识。", "Camera spaces are locally rendered at 320 × 240; the unlisted chapter uses 480 × 360. Signs and timestamps are separate scene and web elements. The hotel layout draws on early 2010s websites without copying a real brand.")}</p>`
    );
  }
  return {
    hotel,
    gallery,
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
