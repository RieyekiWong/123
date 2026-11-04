/* All case facts and clue provenance live here; decorative values never act as passwords. */
globalThis.StillwaterCaseData = (() => {
  const facts = Object.freeze({
    reservation: "R-4829",
    bookedRoom: "318",
    service: "317",
    guest: "E. Vale",
    reviewer: "E-014",
    reviewerName: "Mara Ellis",
    temporary: "TEMP-015",
    notice: "A-06-17",
    created: "2006-10-16T23:40",
    message: "2006-10-17T02:40",
    housekeeping: "2006-10-17T02:50",
    transfer: "2006-10-17T03:17",
    draft: "2006-10-17T03:24",
    closure: "2007-01-08",
    recruitment: "2026-11",
    system: "Continuity",
  });
  const inventory = Object.freeze(
    Array.from({ length: 20 }, (_, i) => String(301 + i)).filter(
      (n) => n !== facts.service,
    ),
  );
  const clues = Object.freeze({
    C1: {
      source: "careers/sample",
      route: "careers",
      usedFor: ["reservation_search"],
      unlockedAt: "public",
      title: ["样本预订编号", "Sample reservation reference"],
    },
    C2: {
      source: "hotel/reservation/" + facts.reservation,
      route: "reservations",
      usedFor: ["inventory_comparison"],
      unlockedAt: "C1",
      title: ["原预订单与登记房号", "Original booking and room assignment"],
    },
    C3: {
      source: "hotel/rooms",
      route: "rooms",
      usedFor: ["room_317_gap"],
      unlockedAt: "C2",
      title: ["三楼客房目录", "Official third-floor guest inventory"],
    },
    C4: {
      source: "hotel/guestbook/" + facts.message,
      route: "guestbook",
      usedFor: ["floor_plan_lookup"],
      unlockedAt: "C2",
      title: ["钥匙套上的房号", "The number on the key sleeve"],
    },
    C5: {
      source: "hotel/floor-plan",
      route: "floor-plan",
      usedFor: ["service_docket", "final_evidence_service"],
      unlockedAt: "C3",
      title: ["服务区域登记卡", "Service-position card"],
    },
    C6: {
      source: "staff/incident/" + facts.notice,
      route: "maintenance",
      usedFor: ["night_audit", "staff_E014", "final_evidence_reviewer"],
      unlockedAt: "C5",
      title: ["夜审移交处理人", "Night-audit handover owner"],
    },
    C7: {
      source: "staff/revisions",
      route: "revisions",
      usedFor: ["final_evidence_revision"],
      unlockedAt: "audit",
      title: ["原稿与修订的差异", "Changes between the original and revision"],
    },
    C8: {
      source: "hotel/closure-notice",
      route: "closure",
      usedFor: ["hiring_realization", "mara_draft"],
      unlockedAt: "C7",
      title: ["停止营业的日期", "The closure date"],
    },
    C9: {
      source: "staff/mara-draft",
      route: "mara",
      usedFor: ["final_decision"],
      unlockedAt: "C8",
      title: ["Mara 留存的原备注", "Mara’s retained original note"],
    },
  });
  const audit = Object.freeze([
    {
      id: "message",
      at: facts.message,
      source: "guestbook",
      label: ["钥匙留言", "Key-sleeve entry"],
      text: [
        `${facts.guest} 留言：前台说是 ${facts.bookedRoom}，钥匙套却写着 ${facts.service}。`,
        `Guest ${facts.guest} reports assignment to ${facts.bookedRoom}, but a key sleeve marked ${facts.service}.`,
      ],
    },
    {
      id: "housekeeping",
      at: facts.housekeeping,
      source: "maintenance",
      label: ["客房部记录", "Housekeeping record"],
      text: [
        `查房：${facts.bookedRoom} 空置，床品未使用。`,
        `Room ${facts.bookedRoom} is empty; bedding unused.`,
      ],
    },
    {
      id: "transfer",
      at: facts.transfer,
      source: "maintenance",
      label: ["系统移交", "System handover"],
      text: [
        `${facts.system} 将 ${facts.reservation} 转到 ${facts.service}（服务暂存区），交给 ${facts.reviewer} 处理。`,
        `${facts.system} moves ${facts.reservation} to service holding ${facts.service}, assigned to ${facts.reviewer}.`,
      ],
    },
    {
      id: "draft",
      at: facts.draft,
      source: "night-audit",
      label: ["夜审备注", "Night-audit note"],
      text: [
        `${facts.reviewer} 备注：${facts.service} 是否住过人，目前查不清，保留待核实。`,
        `${facts.reviewer}: I cannot confirm whether anyone stayed at ${facts.service}. Leave the record unverified.`,
      ],
    },
  ]);
  const auditInitial = Object.freeze([
    "draft",
    "message",
    "transfer",
    "housekeeping",
  ]);
  const revisions = Object.freeze([
    {
      id: "owner",
      label: ["处理人及人员类别", "Handler / record ownership"],
      original: [
        `${facts.reviewer} / ${facts.reviewerName}（员工，处理人）`,
        `${facts.reviewer} / ${facts.reviewerName} (staff reviewer)`,
      ],
      revised: [
        `SYSTEM（处理人） / ${facts.reviewerName}（住客）`,
        `SYSTEM (handler) / ${facts.reviewerName} (guest)`,
      ],
      changed: true,
    },
    {
      id: "location",
      label: ["区域用途", "Position type"],
      original: [
        `${facts.service} / 服务暂存区`,
        `${facts.service} / SERVICE HOLDING`,
      ],
      revised: [`${facts.service} / 客房`, `${facts.service} / GUEST ROOM`],
      changed: true,
    },
    {
      id: "status",
      label: ["核实状态", "Verification status"],
      original: ["UNVERIFIED / 待核实", "UNVERIFIED"],
      revised: ["VERIFIED / CLOSED / 已完成", "VERIFIED / CLOSED"],
      changed: true,
    },
    {
      id: "reference",
      label: ["原预订编号", "Original booking reference"],
      original: [facts.reservation, facts.reservation],
      revised: [facts.reservation, facts.reservation],
      changed: false,
    },
    {
      id: "assignment",
      label: ["原登记房号", "Original assignment"],
      original: [facts.bookedRoom, facts.bookedRoom],
      revised: [facts.bookedRoom, facts.bookedRoom],
      changed: false,
    },
  ]);
  const finalClaims = Object.freeze([
    {
      id: "service",
      correct: true,
      clue: "C5",
      text: [
        `登记卡写明：${facts.service} 是服务暂存区，不是客房。`,
        `${facts.service} is a service holding position, not a confirmed occupied guest room.`,
      ],
    },
    {
      id: "reviewer",
      correct: true,
      clue: "C6",
      text: [
        `${facts.reviewer} 负责处理这条夜审记录。`,
        `${facts.reviewer} is the night-audit reviewer assigned to this record.`,
      ],
    },
    {
      id: "revision",
      correct: true,
      clue: "C7",
      text: [
        `2007 年的修改把“待核实”改成了“已完成”。`,
        `The 2007 revision changes an unverified record to a completed one.`,
      ],
    },
    {
      id: "occupancy",
      correct: false,
      clue: "C4",
      text: [
        `有钥匙套，就能确定 ${facts.guest} 住进了 ${facts.service}。`,
        `The key sleeve proves ${facts.guest} actually occupied ${facts.service}.`,
      ],
    },
    {
      id: "operating",
      correct: false,
      clue: "C8",
      text: [
        `2026 年还在招人，所以酒店仍在接待住客。`,
        `The 2026 job advert proves the hotel is still receiving guests.`,
      ],
    },
    {
      id: "consent",
      correct: false,
      clue: "C9",
      text: [
        `${facts.reviewerName} 允许下一任替她直接结案。`,
        `${facts.reviewerName} authorized her successor to auto-close on her behalf.`,
      ],
    },
  ]);
  // Retained sources are facts; a claim card never counts as its own evidence.
  const row = (id, zh, en, value, english = value) => ({
    id,
    label: [zh, en],
    value: [value, english],
  });
  const file = (group, title, route, at, reference, rows, clue = "") => ({
    group,
    title,
    route,
    at,
    reference,
    rows,
    clue,
    kind: "source",
  });
  const documents = Object.freeze({
    sample: file(
      "BOOKING",
      ["岗位工作样本", "Role sample"],
      "careers",
      "2026-11",
      "SAMPLE / R-4829",
      [
        row("reference", "样本编号", "Sample reference", "R-4829"),
        row(
          "task",
          "工作内容",
          "Work",
          "核对旧预订单，保留原始记录。",
          "Reconcile a retained booking without overwriting its source.",
        ),
      ],
      "C1",
    ),
    booking: file(
      "BOOKING",
      ["原始预订单", "Original booking"],
      "reservations?record=R-4829",
      "2006-10-16 23:40",
      "R-4829",
      [
        row("reference", "预订编号", "Booking reference", "R-4829"),
        row("guest", "住客", "Guest", "E. Vale"),
        row("assignment", "分配房号", "Assigned room", "318"),
        row("status", "记录状态", "Record status", "UNRESOLVED"),
      ],
      "C2",
    ),
    inventory: file(
      "ROOM",
      ["三楼客房目录", "Third-floor room directory"],
      "rooms?copy=original",
      "2006-10-17",
      "3F / GUEST INVENTORY",
      [
        row("rooms", "可预订房号", "Bookable rooms", inventory.join(" · ")),
        row(
          "scope",
          "目录范围",
          "Scope",
          "只列可供预订的客房。",
          "Bookable guest rooms only.",
        ),
      ],
      "C3",
    ),
    key: file(
      "BOOKING",
      ["钥匙套留言", "Key-sleeve entry"],
      "guestbook?copy=original",
      "2006-10-17 02:40",
      "GUESTBOOK / R-4829",
      [
        row("author", "留言人", "Author", "E. Vale"),
        row(
          "account",
          "留言原文",
          "Entry",
          "前台说是 318，但钥匙套上印着 317。是印错了吗？",
          "Front desk said 318, but the sleeve around my key says 317. Is this a typo?",
        ),
      ],
      "C4",
    ),
    position: file(
      "SERVICE",
      ["服务区域登记卡", "Service-position card"],
      "floor-plan",
      "2006-10-17",
      "3F / 317 / A-06-17",
      [
        row("position", "内部编号", "Internal identifier", "317"),
        row(
          "type",
          "登记用途",
          "Registered use",
          "SERVICE HOLDING / 服务暂存区",
          "SERVICE HOLDING",
        ),
        row(
          "location",
          "位置",
          "Position",
          "316 与 318 之间",
          "Between 316 and 318",
        ),
        row("docket", "维修单", "Maintenance docket", "A-06-17"),
      ],
      "C5",
    ),
    housekeeping: file(
      "ROOM",
      ["客房巡查记录", "Housekeeping round"],
      "maintenance?record=A-06-17",
      "2006-10-17 02:50",
      "A-06-17 / HOUSEKEEPING",
      [
        row("room", "巡查房间", "Room inspected", "318"),
        row(
          "observation",
          "巡查所见",
          "Observation",
          "房间空置，床品未使用。",
          "Room empty; bedding unused.",
        ),
      ],
      "C6",
    ),
    transfer: file(
      "SYSTEM",
      ["系统移交记录", "System transfer"],
      "maintenance?record=A-06-17",
      "2006-10-17 03:17",
      "A-06-17 / R-4829",
      [
        row("reference", "预订编号", "Booking reference", "R-4829"),
        row("destination", "移交位置", "Transfer destination", "317"),
        row("reviewer", "原处理人", "Original reviewer", "E-014 / Mara Ellis"),
        row(
          "action",
          "系统操作",
          "System action",
          "TRANSFER / 移交待处理记录",
          "TRANSFER / pending record handed over",
        ),
      ],
      "C6",
    ),
    "draft-audit": file(
      "SYSTEM",
      ["03:24 留言摘录", "03:24 note extract"],
      "night-audit",
      "2006-10-17 03:24",
      "A-06-17 / NOTE EXTRACT",
      [
        row(
          "note",
          "当晚备注",
          "Night note",
          audit.find((r) => r.id === "draft").text[0],
          audit.find((r) => r.id === "draft").text[1],
        ),
      ],
      "C6",
    ),
    personnel: file(
      "PERSONNEL",
      ["原始员工档案", "Original personnel record"],
      "staff",
      "2006-10-17",
      "E-014",
      [
        row("name", "姓名", "Name", "Mara Ellis"),
        row("number", "员工编号", "Staff number", "E-014"),
        row(
          "role",
          "记录角色",
          "Record role",
          "REVIEWER / 夜审处理人",
          "REVIEWER / night audit",
        ),
        row(
          "guest",
          "原预订单住客栏",
          "Guest field on original booking",
          "E. Vale",
        ),
      ],
    ),
    revision: file(
      "SYSTEM",
      ["2007 年修订记录", "2007 revision"],
      "revisions",
      "2007-01-08",
      "REVISION / R-4829",
      revisions.map((r) =>
        row(
          r.id,
          r.label[0],
          r.label[1],
          r.original[0] + " → " + r.revised[0],
          r.original[1] + " → " + r.revised[1],
        ),
      ),
      "C7",
    ),
    queue: file(
      "PERSONNEL",
      ["当前自动排班", "Current generated assignment"],
      "staff",
      "2026-11",
      "TEMP-015 / CURRENT QUEUE",
      [
        row("number", "工作编号", "Assignment identifier", "TEMP-015"),
        row("generated", "生成方式", "Created by", "Continuity / AUTO"),
        row("status", "签收状态", "Acknowledgement", "PENDING SIGNOFF"),
      ],
    ),
    attendance: file(
      "PERSONNEL",
      ["到岗资料索引", "Attendance-file index"],
      "staff",
      "2026-11",
      "TEMP-015 / ATTENDANCE SEARCH",
      [
        row(
          "scope",
          "检索范围",
          "Search scope",
          "本次保留的人员与交接资料",
          "Retained personnel and handover files",
        ),
        row(
          "result",
          "检索结果",
          "Search result",
          "未找到 TEMP-015 的到岗签收记录。",
          "No arrival acknowledgement for TEMP-015 found in these files.",
        ),
      ],
    ),
    closure: file(
      "SYSTEM",
      ["停业通知", "Closure notice"],
      "closure",
      "2007-01-08",
      "CLOSURE / ORIGINAL",
      [
        row(
          "status",
          "通知内容",
          "Notice",
          "酒店于 2007 年 1 月 8 日停止营业。",
          "Hotel operations ceased on 8 January 2007.",
        ),
      ],
      "C8",
    ),
    mara: file(
      "PERSONNEL",
      ["Mara 留存草稿", "Mara’s retained draft"],
      "mara",
      "2006-10-17 03:24",
      "E-014 / RETAINED NOTE",
      [
        row("author", "原处理人", "Original reviewer", "E-014 / Mara Ellis"),
        row(
          "note",
          "备注",
          "Note",
          "这条先记待核实。没查清楚之前，别替我签字。",
          "Leave this one open for now. Do not sign it off on my behalf until it has actually been checked.",
        ),
      ],
      "C9",
    ),
    footage: file(
      "FOOTAGE",
      ["恢复的 03:17 录像", "Restored 03:17 footage"],
      "terminal?view=retained",
      "2006-10-17 03:17",
      "B-3 / READ-ONLY / 03:17",
      [
        row(
          "source",
          "影像来源",
          "Picture source",
          "B-3 / 原始录像线路",
          "B-3 / original recording circuit",
        ),
        row(
          "view",
          "画面范围",
          "Visible area",
          "三楼走廊、门框和服务区域标识。",
          "Third-floor corridor, doorframe and service-position signs.",
        ),
        row(
          "overlay",
          "系统叠字",
          "System overlay",
          "317 / SERVICE HOLDING · E-014",
        ),
        row(
          "identity",
          "画面所见",
          "Visible in this frame",
          "没有可辨认的面孔，未见签收动作。",
          "No identifiable face or acknowledgement action is visible in this frame.",
        ),
      ],
    ),
  });
  const opt = (id, zh, en) => ({ id, label: [zh, en] });
  const proof = (title, question, sources, fields, record) => ({
    title,
    question,
    sources,
    fields,
    record,
  });
  const proofs = Object.freeze({
    intake: proof(
      ["样本登记", "Sample intake"],
      [
        "样本和预订单对应的是同一笔记录吗？",
        "Do the sample and booking refer to the same record?",
      ],
      ["sample", "booking"],
      [
        {
          id: "match",
          label: ["编号对应", "Reference match"],
          answer: "same",
          options: [
            opt("same", "同一笔记录", "Same record"),
            opt("different", "不是同一笔记录", "Different records"),
            opt("unknown", "暂时无法判断", "Not established"),
          ],
        },
      ],
      "R-4829 / SOURCE MATCHED",
    ),
    space: proof(
      ["317 原始用途", "Original use of 317"],
      [
        "317 在原始资料中属于什么？",
        "What use is registered for 317 in the original files?",
      ],
      ["inventory", "position"],
      [
        {
          id: "use",
          label: ["登记用途", "Registered use"],
          answer: "service",
          options: [
            opt("room", "正常客房", "Bookable guest room"),
            opt("service", "非客房服务暂存区域", "Non-guest service holding"),
            opt(
              "occupied",
              "已确认入住的客房",
              "Confirmed occupied guest room",
            ),
          ],
        },
      ],
      "317 / POSITION TYPE / SERVICE HOLDING",
    ),
    timeline: proof(
      ["夜班记录核对", "Night-record review"],
      [
        "这些记录能证明住客实际进入了 317 吗？",
        "Do these records establish actual occupancy of 317?",
      ],
      ["key", "housekeeping", "transfer", "draft-audit"],
      [
        {
          id: "assessment",
          label: ["入住情况", "Occupancy"],
          answer: "insufficient",
          options: [
            opt("confirmed", "足以确认入住", "Occupancy established"),
            opt("insufficient", "目前证据不足", "Insufficient evidence"),
            opt("never", "能证明从未有人进入", "Proves nobody ever entered"),
          ],
        },
      ],
      "R-4829 / OCCUPANCY NOT VERIFIED",
    ),
    identity: proof(
      ["Mara 与当前排班", "Mara and the current queue"],
      [
        "核对原处理人的身份，以及新工作编号的到岗依据。",
        "Check the original reviewer’s role and the basis for the new assignment’s attendance status.",
      ],
      ["personnel", "revision", "queue", "attendance"],
      [
        {
          id: "role",
          label: ["Mara 的原始字段", "Mara’s original field"],
          answer: "reviewer",
          options: [
            opt("reviewer", "REVIEWER / 处理人", "REVIEWER"),
            opt("guest", "GUEST / 住客", "GUEST"),
          ],
        },
        {
          id: "attendance",
          label: [
            "自动排班能否证明到岗",
            "Does an automatic assignment prove arrival?",
          ],
          answer: "insufficient",
          options: [
            opt("confirmed", "可以确认到岗", "Arrival established"),
            opt(
              "insufficient",
              "不能，尚缺到岗记录",
              "No; an arrival record is still missing",
            ),
          ],
        },
      ],
      "E-014 / ORIGINAL ROLE: REVIEWER · TEMP-015 / ATTENDANCE UNVERIFIED",
    ),
    ROOM: proof(
      ["ROOM / 客房归类", "ROOM / classification"],
      [
        "现有资料是否足以把这段影像中的位置确认成正常客房？",
        "Do the retained files support classifying the position in this picture as a guest room?",
      ],
      ["inventory", "position", "footage"],
      [
        {
          id: "finding",
          label: ["核对判断", "Finding"],
          answer: "unsupported",
          options: [
            opt("supported", "资料支持归为客房", "Supported as a guest room"),
            opt(
              "unsupported",
              "现有资料不支持这项归类",
              "Not supported by the available sources",
            ),
          ],
        },
      ],
      "ROOM / NOT SUPPORTED",
    ),
    GUEST: proof(
      ["GUEST / 入住核对", "GUEST / occupancy review"],
      [
        "能否确认住客实际入住这个位置？",
        "Can actual guest occupancy of this position be verified?",
      ],
      ["booking", "key", "housekeeping", "transfer"],
      [
        {
          id: "finding",
          label: ["核对判断", "Finding"],
          answer: "unverified",
          options: [
            opt(
              "verified",
              "移交已发生，可以确认入住",
              "Transfer establishes occupancy",
            ),
            opt(
              "unverified",
              "移交及钥匙套不足以证明入住",
              "Transfer and key sleeve do not establish occupancy",
            ),
            opt(
              "never",
              "可以证明从未有人进入",
              "Nobody could ever have entered",
            ),
          ],
        },
      ],
      "GUEST / NOT VERIFIED",
    ),
    EMPLOYEE: proof(
      ["EMPLOYEE / 人员核对", "EMPLOYEE / personnel review"],
      [
        "能否将这份记录归属于已确认到岗的工作人员？",
        "Can this record be assigned to a verified member of staff on duty?",
      ],
      ["personnel", "revision", "queue", "attendance"],
      [
        {
          id: "finding",
          label: ["核对判断", "Finding"],
          answer: "unverified",
          options: [
            opt(
              "verified",
              "自动排班足以确认人员到岗",
              "Automatic assignment establishes attendance",
            ),
            opt(
              "unverified",
              "编号不能证明到岗，也不能改写原处理人身份",
              "An identifier does not establish attendance or replace the original reviewer’s role",
            ),
          ],
        },
      ],
      "EMPLOYEE / NOT VERIFIED",
    ),
  });
  const recordTypes = Object.freeze([
    {
      id: "housekeeping",
      answer: "observation",
      text: ["318 房间空置，床品未使用。", "Room 318 empty; bedding unused."],
    },
    {
      id: "transfer",
      answer: "system",
      text: ["03:17，R-4829 移交到 317。", "03:17: R-4829 transferred to 317."],
    },
    {
      id: "occupancy",
      answer: "claim",
      text: ["住客已经实际入住 317。", "The guest actually occupied 317."],
    },
  ]);
  const typeOptions = [
    opt("observation", "直接观察", "Direct observation"),
    opt("system", "系统操作", "System action"),
    opt("claim", "未证实的判断", "Unverified claim"),
  ];
  const hints = Object.freeze({
    booking: [
      [
        "编号一般附在工作样本里。",
        "The reference is retained with the work sample.",
      ],
      [
        "返回招聘页，查看这次整理任务的样本。",
        "Reopen the role sample on the careers page.",
      ],
      [
        "把样本上的完整编号填入预订查询，保留字母和连字符。",
        "Enter the complete sample reference in reservation search, including letters and the hyphen.",
      ],
    ],
    inventory: [
      [
        "先核对预订单实际分配的房号。",
        "Check the room assigned by the original booking.",
      ],
      [
        "预订单与三楼客房目录可以来回查看。",
        "You can reopen both the booking and third-floor directory.",
      ],
      [
        "在目录下方选择预订单的分配房号，保存这份目录；同日留言也可单独查看。",
        "Select the assigned room below the directory and retain it. The night’s guest entry can be checked separately.",
      ],
    ],
    maintenance: [
      ["维修资料按单号归档。", "Maintenance files are indexed by docket."],
      [
        "通行公告和服务区域登记卡都留有单号。",
        "The access notice and position card both retain a docket number.",
      ],
      [
        "重新打开其中一份原件，将完整单号填入维修查询。",
        "Reopen either original and enter its complete docket reference in maintenance search.",
      ],
    ],
    cameras: [
      [
        "几个机位可能拍到了同一件东西。",
        "Adjacent cameras may show the same object.",
      ],
      [
        "试着调整角度，找推车或维修告示的特征。",
        "Adjust the views and compare details on the cart or notice.",
      ],
      [
        "让相邻机位拍到同一地标，再确认连接。两处连接保留后，可检查服务区域的门。",
        "Match a landmark across adjacent views and confirm the connection. Once both links are retained, inspect the service-area door.",
      ],
    ],
    wiring: [
      [
        "先把录像信号与自动写入电源分开看。",
        "Treat the reel signal and auto-write supply separately.",
      ],
      [
        "录像从 A 左侧进入，通向 F 右侧；每个弯头都要与邻居对齐。",
        "The reel enters left of A and exits right of F. Each elbow must face its neighbor.",
      ],
      [
        "沿着发亮的接口检查断点。通路恢复后，隔离 AUTO-WRITE 并切为 MANUAL，再保存配置。",
        "Trace the lit ports to find a break. After restoring the path, isolate AUTO-WRITE, switch to MANUAL and save.",
      ],
    ],
    "void-corridor": [
      ["先回头看刚经过的那扇门。", "Look back at the door you came through."],
      [
        "分别看壁灯在哪边、门框哪角有缺口、门槛哪端破了。左右以正对每扇门时为准。",
        "Check the lamp, the missing frame corner and the chipped end of the threshold. Read left and right while facing each door.",
      ],
      [
        "用“查看”按钮检查前方两扇门。把三处细节与刚经过的门逐一对照，全部相同后再推门。",
        "Inspect both doors ahead. Compare all three details with the previous door, then open the one whose details all match.",
      ],
    ],
    "void-fragments": [
      ["先对齐影像外侧的边缘。", "Start with the picture’s outer edges."],
      [
        "四角的淡色标记围出了影像应在的位置。",
        "The faint corner marks define the picture’s position.",
      ],
      [
        "选中一块，用方向键或按钮微调，让门框、墙角与地缝在相邻边缘连上，再复核。",
        "Select a piece and nudge it with the arrow keys or buttons until the frame, corner and floor seams meet, then review.",
      ],
    ],
    promo: [
      [
        "先看两份宣传资料的来源和日期。",
        "Check the source and date of each publicity copy.",
      ],
      [
        "原宣传照片可以在此重新打开，不需要早先保存广告。",
        "The original publicity photograph can be reopened here; an early saved ad is not needed.",
      ],
      [
        "选择留有原始来源的副本，再在并排影像中标记被修改的部分。",
        "Choose the copy with its original provenance, then mark the altered area in the paired images.",
      ],
    ],

    intake: [
      ["先看两份文件的编号。", "Check the references on both files."],
      [
        "招聘样本和原始预订单都可以重新打开。",
        "The role sample and original booking can both be reopened.",
      ],
      [
        "分别打开两份文件，加入对照；引用它们后再提交编号判断。",
        "Open both files, add them to the comparison, then cite them and submit your reference finding.",
      ],
    ],
    space: [
      [
        "门牌和可预订房号不一定是同一回事。",
        "A position number and a bookable room number may mean different things.",
      ],
      [
        "客房目录与服务区域登记卡记录的范围不同。",
        "Compare the scope of the room directory with the service-position card.",
      ],
      [
        "把这两份原件放入对照，检查房号列表和登记用途，再引用资料提交。",
        "Compare the two originals, inspect the room list and registered use, then cite your sources.",
      ],
    ],
    timeline: [
      [
        "记录说的是亲眼所见，还是系统做过的操作？",
        "Does each record describe an observation or a system operation?",
      ],
      [
        "把 02:50 的巡查与 03:17 的移交分开看。",
        "Read the 02:50 round separately from the 03:17 transfer.",
      ],
      [
        "先确认时间顺序，再给三张记录卡选择性质；引用当晚四份记录，判断它们能证明到哪一步。",
        "Confirm the order, classify the three cards, then cite all four night records and decide what they establish.",
      ],
    ],
    identity: [
      [
        "文件里的名字和字段要一起看。",
        "Read the field labels as well as the names.",
      ],
      [
        "对照 E-014 原件、修订记录及 TEMP-015 的排班和到岗资料。",
        "Compare E-014, the revision, and TEMP-015’s assignment and attendance files.",
      ],
      [
        "在人员页刷新当前队列，保留相关原件，再分别核对 Mara 的原字段和新编号的到岗依据。",
        "Refresh the queue on the personnel page, retain its sources, then check Mara’s original field and the evidence of arrival.",
      ],
    ],
    ROOM: [
      [
        "画面里的门并不自带记录类别。",
        "A door in a picture does not establish a record category.",
      ],
      [
        "将恢复的录像与客房目录、区域登记卡对照。",
        "Compare the restored footage with the room directory and position card.",
      ],
      [
        "在 B-3 将已恢复的 03:17 录像加入核对台，引用这三份来源再提交。",
        "Add the restored 03:17 footage in B-3, cite all three sources, then submit.",
      ],
    ],
    GUEST: [
      [
        "分配房间和实际入住需要不同的依据。",
        "A room assignment and actual occupancy require different evidence.",
      ],
      [
        "重看预订单、钥匙套、巡查和系统移交。",
        "Revisit the booking, key sleeve, round and transfer.",
      ],
      [
        "引用这四份原件，分别看它们记录了什么，再判断能否确认入住。",
        "Cite the four originals and check what each records before deciding whether occupancy is verified.",
      ],
    ],
    EMPLOYEE: [
      [
        "工作编号与到岗记录不是同一种资料。",
        "An assignment identifier and an arrival record are different sources.",
      ],
      [
        "核对 E-014 原件、修订、当前队列和到岗索引。",
        "Check E-014, the revision, current queue and attendance index.",
      ],
      [
        "引用这四份资料，查看原处理人字段以及当前编号的签收状态后提交。",
        "Cite all four files and review the original role and current acknowledgement status before submitting.",
      ],
    ],
    revisions: [
      ["逐行查看原稿和修订。", "Read the original and revision row by row."],
      [
        "只标记内容发生变化的字段。",
        "Select only fields whose contents changed.",
      ],
      [
        "换行内容也属于同一字段；编号和分配房号也需要对照。",
        "Wrapped text belongs to the same field; compare the reference and room assignment too.",
      ],
    ],
  });

  const photographs = [
    {
      file: "lobby.jpg",
      title: "Lobby Stanley Lodge Estes Park Colorado 2024.jpg",
      author: "Larry D. Moore",
      license: "CC BY 4.0",
      license_url: "https://creativecommons.org/licenses/by/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Lobby_Stanley_Lodge_Estes_Park_Colorado_2024.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Lobby_Stanley_Lodge_Estes_Park_Colorado_2024.jpg/1920px-Lobby_Stanley_Lodge_Estes_Park_Colorado_2024.jpg",
      sha256:
        "a840b6ac4e32e355e71498ef62882169d635403871f8933ca960b7bd343f176c",
      changes:
        "Wikimedia thumbnail; no pixel edits. CSS cropping, darkening, or sepia may be applied in the game.",
    },
    {
      file: "hallway.jpg",
      title: "Corridor Stanley Hotel Estes Park Colorado 2024.jpg",
      author: "Larry D. Moore",
      license: "CC BY 4.0",
      license_url: "https://creativecommons.org/licenses/by/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Corridor_Stanley_Hotel_Estes_Park_Colorado_2024.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Corridor_Stanley_Hotel_Estes_Park_Colorado_2024.jpg/1920px-Corridor_Stanley_Hotel_Estes_Park_Colorado_2024.jpg",
      sha256:
        "43b08bfbec57e4d2a101f21d50ea0ba570fc066ec82c287c6690d77d11263e3b",
      changes:
        "Wikimedia thumbnail; no pixel edits. CSS cropping, darkening, or sepia may be applied in the game.",
    },
    {
      file: "guestroom.jpg",
      title: "Room Stanley Hotel Estes Park Colorado 2024.jpg",
      author: "Larry D. Moore",
      license: "CC BY 4.0",
      license_url: "https://creativecommons.org/licenses/by/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Room_Stanley_Hotel_Estes_Park_Colorado_2024.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Room_Stanley_Hotel_Estes_Park_Colorado_2024.jpg/1920px-Room_Stanley_Hotel_Estes_Park_Colorado_2024.jpg",
      sha256:
        "4f093ff4c47e4ade9066f48e1433b499e1e680e9820a3638bed390292274e3e7",
      changes:
        "Wikimedia thumbnail; no pixel edits. CSS cropping, darkening, or sepia may be applied in the game.",
    },
    {
      file: "twin.jpg",
      title: "Deluxe Room - Twin beds.jpg",
      author: "Holidayinnklg",
      license: "CC BY-SA 3.0",
      license_url: "https://creativecommons.org/licenses/by-sa/3.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Deluxe_Room_-_Twin_beds.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Deluxe_Room_-_Twin_beds.jpg/1920px-Deluxe_Room_-_Twin_beds.jpg",
      sha256:
        "d81578ae5ce883acfff414ef1ba3db03306bdb8fc2e4a08a03c3368f622a04cb",
      changes:
        "Wikimedia thumbnail; no pixel edits. CSS cropping, darkening, or sepia may be applied in the game.",
    },
    {
      file: "suite.jpg",
      title: "Hotel Room Chicago Hilton2.jpg",
      author: "Michael Gray",
      license: "CC BY-SA 2.0",
      license_url: "https://creativecommons.org/licenses/by-sa/2.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Hotel_Room_Chicago_Hilton2.jpg",
      download:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Hotel_Room_Chicago_Hilton2.jpg/1920px-Hotel_Room_Chicago_Hilton2.jpg",
      sha256:
        "01b15004bb86892ce978153503deb908216689eae777a65d38b31a49a615f4e1",
      changes:
        "Wikimedia thumbnail; no pixel edits. CSS cropping, darkening, or sepia may be applied in the game.",
    },
  ];
  return Object.freeze({
    facts,
    inventory,
    clues,
    audit,
    auditInitial,
    revisions,
    finalClaims,
    photographs,
    documents,
    proofs,
    recordTypes,
    typeOptions,
    hints,
  });
})();
