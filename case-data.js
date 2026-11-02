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
      title: ["原预订与分配房号", "Original booking and room assignment"],
    },
    C3: {
      source: "hotel/rooms",
      route: "rooms",
      usedFor: ["room_317_gap"],
      unlockedAt: "C2",
      title: ["三层官方客房清单", "Official third-floor guest inventory"],
    },
    C4: {
      source: "hotel/guestbook/" + facts.message,
      route: "guestbook",
      usedFor: ["floor_plan_lookup"],
      unlockedAt: "C3",
      title: ["钥匙套上的房号", "The number on the key sleeve"],
    },
    C5: {
      source: "hotel/floor-plan",
      route: "floor-plan",
      usedFor: ["service_docket", "final_evidence_service"],
      unlockedAt: "C4",
      title: ["服务区域的登记属性", "Classification of the service area"],
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
        `住客 ${facts.guest} 表示：前台分配 ${facts.bookedRoom}，钥匙套却写着 ${facts.service}。`,
        `Guest ${facts.guest} reports assignment to ${facts.bookedRoom}, but a key sleeve marked ${facts.service}.`,
      ],
    },
    {
      id: "housekeeping",
      at: facts.housekeeping,
      source: "maintenance",
      label: ["客房部记录", "Housekeeping record"],
      text: [
        `${facts.bookedRoom} 房无人入住，床品未使用。此记录没有确认其他位置是否有人。`,
        `Room ${facts.bookedRoom} is empty; bedding unused. This record does not establish occupancy elsewhere.`,
      ],
    },
    {
      id: "transfer",
      at: facts.transfer,
      source: "maintenance",
      label: ["系统移交", "System handover"],
      text: [
        `${facts.system} 将 ${facts.reservation} 转入服务缓冲位 ${facts.service}，处理人为 ${facts.reviewer}。`,
        `${facts.system} moves ${facts.reservation} to service holding ${facts.service}, assigned to ${facts.reviewer}.`,
      ],
    },
    {
      id: "draft",
      at: facts.draft,
      source: "night-audit",
      label: ["夜审备注", "Night-audit note"],
      text: [
        `${facts.reviewer}：没有已确认住客入住服务位 ${facts.service} 的证据，记录仍待核实。`,
        `${facts.reviewer}: no confirmed guest is evidenced at service holding ${facts.service}. Record remains unverified.`,
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
      label: ["处理人 / 记录归属", "Handler / record ownership"],
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
      label: ["位置属性", "Position type"],
      original: [
        `${facts.service} / 服务缓冲位`,
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
      label: ["原预订引用", "Original booking reference"],
      original: [facts.reservation, facts.reservation],
      revised: [facts.reservation, facts.reservation],
      changed: false,
    },
    {
      id: "assignment",
      label: ["原分配房号", "Original assignment"],
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
        `${facts.service} 是服务缓冲位，不是已确认入住的客房。`,
        `${facts.service} is a service holding position, not a confirmed occupied guest room.`,
      ],
    },
    {
      id: "reviewer",
      correct: true,
      clue: "C6",
      text: [
        `${facts.reviewer} 是该记录的夜审处理人。`,
        `${facts.reviewer} is the night-audit reviewer assigned to this record.`,
      ],
    },
    {
      id: "revision",
      correct: true,
      clue: "C7",
      text: [
        `2007 修订把原来未核实的记录改为已完成。`,
        `The 2007 revision changes an unverified record to a completed one.`,
      ],
    },
    {
      id: "occupancy",
      correct: false,
      clue: "C4",
      text: [
        `钥匙套足以证明 ${facts.guest} 实际入住 ${facts.service}。`,
        `The key sleeve proves ${facts.guest} actually occupied ${facts.service}.`,
      ],
    },
    {
      id: "operating",
      correct: false,
      clue: "C8",
      text: [
        `2026 招聘证明酒店仍正常接待住客。`,
        `The 2026 job advert proves the hotel is still receiving guests.`,
      ],
    },
    {
      id: "consent",
      correct: false,
      clue: "C9",
      text: [
        `${facts.reviewerName} 同意由下一任自动代签结案。`,
        `${facts.reviewerName} authorized her successor to auto-close on her behalf.`,
      ],
    },
  ]);
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
  });
})();
