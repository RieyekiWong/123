/* Presentation-only help. Validation and case progression remain in case-state. */
globalThis.StillwaterCaseFeedback = ({ t }) => {
  const attempts = new Map();
  const groups = {
    reservation: "careers",
    sample: "careers",
    booking: "reservations",
    inventory: "reservations",
    "inventory-first": "rooms",
    "message-first": "guestbook",
    "inspect-first": "floor-plan",
    classification: "floor-plan",
    "service-first": "floor-plan",
    maintenance: "notices",
    "maintenance-first": "maintenance",
    "audit-order": "night-audit",
    "audit-assessment": "maintenance",
    "audit-first": "night-audit",
    "revision-unchanged": "revisions",
    "revision-missing": "revisions",
    "revisions-first": "revisions",
    "closure-first": "closure",
    "evidence-incomplete": "notes",
    "evidence-occupancy": "guestbook",
    "evidence-operating": "closure",
    "evidence-consent": "mara",
    "evidence-missing": "notes",
  };
  const fields = {
    reservation: [
      "请照招聘页样本上的编号填写，字母前缀也要保留。",
      "Match the sample’s reference, including its letter prefix.",
    ],
    inventory: [
      "看预订单的“登记房号”一栏。",
      "Look at the booking’s assigned-room field.",
    ],
    classification: [
      "查看区域登记卡上的“登记用途”。",
      "The position card has a registered-use field.",
    ],
    maintenance: [
      "完整公告和区域登记卡上都能找到维修单编号。",
      "The full notice and position card both carry the docket reference.",
    ],
    "audit-order": [
      "按每张卡的完整日期和时间，从早到晚排列。",
      "Use the full dates and times, earliest first.",
    ],
    "audit-assessment": [
      "客房部只查了这间房，记录没有说明客人的去向。",
      "Housekeeping checked a room. Look for a record that establishes where the guest went.",
    ],
    "revision-unchanged": [
      "逐行比较左右两栏，相同的项目不用勾选。",
      "Compare each row across both columns; leave identical rows unchecked.",
    ],
    "revision-missing": [
      "再看一下人员、区域用途和状态三栏，换行的内容也要读完。",
      "Check the people, position and status fields, including wrapped text.",
    ],
    "evidence-occupancy": [
      "钥匙套上的房号，能否说明人实际去了那里？",
      "Distinguish what a key says from where a person actually went.",
    ],
    "evidence-operating": [
      "把通知日期和招聘日期放在一起看。",
      "Compare the date of the notice with the job advert.",
    ],
    "evidence-consent": [
      "看草稿最后一句，确认能不能替她签字。",
      "The last sentence of the draft addresses signing on someone’s behalf.",
    ],
    "evidence-missing": [
      "每项说法都要能在已查看的原始文件里找到依据。",
      "Find a supporting entry for each selected finding.",
    ],
  };
  function reset(action) {
    attempts.delete(action);
  }
  function show(id, result, base, action) {
    const el = document.getElementById(id);
    if (!el) return;
    const count = (attempts.get(action) || 0) + 1;
    attempts.set(action, count);
    el.replaceChildren(document.createTextNode(base));
    let route = groups[result.error] || "notes";
    if (result.error === "inventory")
      route =
        "reservations?record=" +
        globalThis.StillwaterCaseData.facts.reservation;
    if (result.error === "audit-assessment")
      route =
        "maintenance?record=" + globalThis.StillwaterCaseData.facts.notice;
    const direction = fields[result.error] || [
      "回看相关文件，核对编号、日期和备注。",
      "Check the reference, date and notes in the related file.",
    ];
    const help = document.createElement("details");
    help.className = "record-help";
    const summary = document.createElement("summary");
    summary.textContent = t("查找帮助", "Help finding the record");
    const link = document.createElement("a");
    link.href = "#" + route;
    link.textContent = t("回到相关文件", "Reopen the related file");
    const text = document.createElement("p");
    text.textContent = t(...direction);
    help.append(summary, link, text);
    el.append(help);
    if (count >= 2) {
      const p = document.createElement("p");
      p.append(
        document.createTextNode(t("相关资料：", "Check this page: ")),
        link.cloneNode(true),
      );
      el.insertBefore(p, help);
    }
    if (count >= 3) {
      const p = document.createElement("p");
      p.textContent = t(...direction);
      el.insertBefore(p, help);
    }
    el.dataset.attempt = String(Math.min(count, 3));
    el.focus({ preventScroll: true });
  }
  return { show, reset };
};
