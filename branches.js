/* Two independent side stories; the original public/lower investigation is unchanged. */
window.StillwaterBranches = (() => {
  "use strict";
  const noteIds = ["library", "property", "roster"];
  const feeds = ["lobby", "corridor", "room"];
  const stages = ["none", "interview", "hired", "working", "escaped"];
  const fresh = () => ({
    support: window.StillwaterSupport.fresh(),
    dylan: { met: false, notes: [], found: false },
    job: {
      stage: "none",
      talked: [],
      round: 1,
      reviewed: [],
      inspected: [],
      feed: "lobby",
      mistakes: 0,
    },
  });
  function hydrate(raw) {
    const value = fresh();
    if (!raw || typeof raw !== "object") return value;
    value.support = window.StillwaterSupport.hydrate(raw.support);
    const d = raw.dylan || {},
      j = raw.job || {};
    value.dylan = {
      met: d.met === true,
      notes: noteIds.filter(
        (id) => Array.isArray(d.notes) && d.notes.includes(id),
      ),
      found: d.found === true,
    };
    value.job = {
      stage: stages.includes(j.stage) ? j.stage : "none",
      talked: ["duties", "pay", "dylan"].filter(
        (id) => Array.isArray(j.talked) && j.talked.includes(id),
      ),
      round:
        Number.isInteger(j.round) && j.round >= 1 && j.round <= 3 ? j.round : 1,
      reviewed: [
        ...new Set(
          (Array.isArray(j.reviewed) ? j.reviewed : []).filter((id) =>
            /^[1-3]:(lobby|corridor|room)$/.test(id),
          ),
        ),
      ],
      inspected: feeds.filter(
        (id) => Array.isArray(j.inspected) && j.inspected.includes(id),
      ),
      feed: feeds.includes(j.feed) ? j.feed : "lobby",
      mistakes:
        Number.isSafeInteger(j.mistakes) && j.mistakes >= 0 ? j.mistakes : 0,
    };
    return value;
  }
  function create(api) {
    const { getState, show, save, go, render, toast, escape } = api;
    const zh = document.documentElement.lang === "zh-CN";
    const t = (a, b) => (zh ? a : b);
    const state = () => getState().sideQuests;
    const dylan = () => state().dylan;
    const job = () => state().job;
    const $ = (selector) => document.querySelector(selector);
    const feedInfo = {
      lobby: {
        name: t("前台", "Reception"),
        camera: "01",
        image: "lobby.jpg",
        number: "7",
        detail: t(
          "钥匙柜边缘有一块铜牌，上面刻着 7。",
          "A brass tag at the edge of the key rack is engraved with a 7.",
        ),
      },
      corridor: {
        name: t("走廊", "Corridor"),
        camera: "02",
        image: "hallway.jpg",
        number: "4",
        detail: t(
          "走廊墙上有一个红色的 4。颜料还没干。",
          "A red 4 has been painted on the corridor wall. The paint is still wet.",
        ),
      },
      room: {
        name: t("客房", "Guest room"),
        camera: "03",
        image: "guestroom.jpg",
        number: "2",
        detail: t(
          "床头柜旁贴着一张纸，写着数字 2。",
          "A slip beside the bedside table bears the number 2.",
        ),
      },
    };
    const notes = {
      library: {
        title: t("夹在借书卡里的纸条", "The note inside a library card"),
        text: t(
          "如果有人还在找我：我搬到东楼二层了，不在三层。房牌只剩一个“2”，后面的数字被人拆走了。失物处保留着我那只蓝色行李袋，上面还有完整标记。——迪伦",
          "If anyone is still looking for me: I moved to the second floor of the east wing, not the third. Only the first digit, 2, remains on the door. Lost property still has my blue bag and its tag. — Dylan",
        ),
        clue: t(
          "房间在二层；剩余两位房号去失物处找。",
          "The room is on floor 2. Look for its last two digits in lost property.",
        ),
      },
      property: {
        title: t("迪伦的蓝色行李袋", "Dylan’s blue luggage bag"),
        text: t(
          "行李袋里只有一件工作衬衫。寄存签写着“D. Harker / 房号 __16”。衬衫口袋里有另一行字：“门禁用我第一次值夜班的月、日，各两位。旧排班单夹在早餐广播节目单后面。”",
          "There is a work shirt inside the bag. Its tag reads “D. Harker / Room __16.” A line in the shirt pocket says: “The door uses the month and day of my first night shift, two digits each. The old roster is behind the breakfast radio card.”",
        ),
        clue: t(
          "房号末两位为 16；门禁取首次夜班的月日。",
          "The room number ends in 16. The door code uses the first shift’s month and day.",
        ),
      },
      roster: {
        title: t(
          "早餐节目单背后的排班记录",
          "The roster behind the breakfast radio card",
        ),
        text: t(
          "旧排班表 / 新员工首次值班：迪伦·哈克，2018 年 6 月 14 日，23:00–07:00，东楼监控室。下一行是同一个名字，日期却被涂掉了。",
          "Old roster / First shift: Dylan Harker, June 14, 2018, 23:00–07:00, east-wing surveillance room. The next line repeats his name, but its date has been blacked out.",
        ),
        clue: t(
          "首次夜班为 6 月 14 日；门禁格式为 MMDD。",
          "His first shift was June 14. The door code format is MMDD.",
        ),
      },
    };
    function remember(id) {
      if (!getState().endings.includes(id)) getState().endings.push(id);
      save();
    }
    function notebook() {
      if (!dylan().met && job().stage === "none") return "";
      return `<section class="side-notebook" data-puzzle-original><h3>${t("其他调查记录", "Additional investigation records")}</h3>${dylan().met ? `<p>${t("迪伦留下的机位顺序：", "Dylan’s camera order: ")}<b>${t("走廊 → 前台 → 客房", "Corridor → reception → guest room")}</b></p><ul>${noteIds.map((id) => `<li>${dylan().notes.includes(id) ? "✓ " + notes[id].clue : "— " + notes[id].title}</li>`).join("")}</ul><button class="paper-button" data-action="dylan-trail">${t("整理求助线索", "Review the rescue trail")} →</button>` : ""}${job().stage !== "none" ? `<p>${t("监控巡检记录：", "Surveillance checks: ")}${job().reviewed.length} / 9</p><button class="paper-button" data-action="job-interview">${t("返回夜班记录", "Return to night-shift records")} →</button>` : ""}</section>`;
    }
    function startDylan() {
      dylan().met = true;
      save();
      show(
        t("迪伦·哈克的求助留言", "Dylan Harker’s message"),
        `<div class="dylan-message" data-puzzle-original><p class="eyebrow">D. HARKER / ${t("发送时间不明", "TIMESTAMP MISSING")}</p><p>${t("有人看得到吗？我叫迪伦·哈克。我也是看到招聘消息才来的。现在我出不了这间房，前台一直说我已经离职了。", "Can anyone see this? My name is Dylan Harker. I came here because of a job advert too. I cannot get out of this room, and reception keeps saying I no longer work here.")}</p><p>${t("我把房间的位置和门禁线索分开放在了阅览室、失物处和早餐节目单后面。如果有人愿意来找我，请先去看阅览室的借书卡。", "I left the room’s location and door clues in the reading room, lost property and behind the breakfast programme. If someone can come for me, start with the reading-room loan card.")}</p><blockquote class="dylan-order" id="dylan-order">${t("如果你被安排到监控室，记住：开门时按场景顺序输数字，先走廊，再前台，最后客房。不要照摄像头编号排。", "If they put you in the surveillance room, enter the numbers by location: corridor first, reception second, guest room last. Do not use the camera numbers.")}</blockquote><p class="fine-print">${t("留言下方没有回复。刷新后，发送时间仍然是空白。", "There are no replies. Refreshing does not restore the missing timestamp.")}</p><div class="dialog-actions"><button class="button" data-action="dylan-trail">${t("查看他留下的线索", "Follow his trail")} →</button><button class="paper-button" data-action="job-interview">${t("查看酒店招聘回复", "Read the hotel’s job reply")} →</button></div></div>`,
        t("住客留言 / 未处理的求助", "GUEST MESSAGES / UNANSWERED REQUEST"),
      );
    }
    function trail() {
      if (!dylan().met) return startDylan();
      if (dylan().found) return foundRoom();
      const targets = {
        library: "readingroom",
        property: "inventory",
        roster: "weather",
      };
      show(
        t("寻找迪伦", "Looking for Dylan"),
        `<div data-puzzle-original><p class="document-intro">${t("这三份资料能确认他的房间与门禁。它们不会计入原来的六份酒店记录。", "These three documents identify his room and door code. They are separate from the six original hotel records.")}</p><ol class="trail-list">${noteIds.map((id) => `<li><span class="trail-status">${dylan().notes.includes(id) ? "✓" : "○"}</span><div><h3>${notes[id].title}</h3><p>${dylan().notes.includes(id) ? notes[id].clue : t("尚未保存", "Not yet saved")}</p><button class="underlined" data-action="${targets[id]}">${t("查看原始资料", "Open the source document")} →</button></div></li>`).join("")}</ol><p class="side-progress">${t("已保存纸条", "Saved notes")} <b>${dylan().notes.length} / 3</b></p><div class="dialog-actions"><button class="button" data-action="dylan-door" ${dylan().notes.length < 3 ? "disabled" : ""}>${t("去东楼找他的房间", "Find his room in the east wing")} →</button><button class="paper-button" data-action="dylan-message">${t("重读求助留言", "Read the message again")}</button></div></div>`,
      );
    }
    function showNote(id) {
      if (!dylan().met) return startDylan();
      show(
        notes[id].title,
        `<div class="dylan-note" data-puzzle-original><p class="document-intro">D. HARKER / ${t("留在酒店里的记录", "RETAINED HOTEL RECORD")}</p><p>${notes[id].text}</p><p class="file-note">${notes[id].clue}</p><div class="dialog-actions"><button class="button" data-action="dylan-keep-${id}" data-dylan-fragment="${id}" ${dylan().notes.includes(id) ? "disabled" : ""}>${dylan().notes.includes(id) ? t("已保存纸条 ✓", "Note saved ✓") : t("保存这张纸条", "Save this note")}</button><button class="paper-button" data-action="dylan-trail">${t("整理线索", "Review the trail")} →</button></div></div>`,
      );
    }
    function refreshDocument() {
      document.querySelectorAll("[data-dylan-fragment]").forEach((button) => {
        if (dylan().notes.includes(button.dataset.dylanFragment)) {
          button.disabled = true;
          button.textContent = t("已保存纸条 ✓", "Note saved ✓");
        }
      });
    }
    function door() {
      if (dylan().found) return foundRoom();
      if (dylan().notes.length < 3) return trail();
      if (job().stage === "working")
        return show(
          t("监控室的门还锁着", "The surveillance room is still locked"),
          `<p>${t("你仍可查看酒店资料，但得先完成巡检并打开监控室的门，才能去东楼。纸条已经保存，不会丢失。", "You can still read the hotel records, but must finish the checks and open the surveillance-room door before going to the east wing. Your notes are saved.")}</p><button class="button" data-action="job-resume">${t("返回监控工作台", "Return to the surveillance desk")} →</button>`,
        );
      show(
        t("东楼二层", "East wing, second floor"),
        `<div data-puzzle-original><p class="document-intro">${t("走廊尽头有一排拆掉门牌的房间。请先确认房号，再输入迪伦留下的门禁。", "At the end of the corridor, several doors have lost their numbers. Identify the room before entering Dylan’s door code.")}</p><form id="dylan-room-form"><label class="field-label" for="dylan-room">${t("要找的房号", "Room to find")}</label><input class="text-input" id="dylan-room" name="room" inputmode="numeric" pattern="[0-9]{3}" maxlength="3" required autocomplete="off"><label class="field-label" for="dylan-code">${t("四位门禁密码", "Four-digit door code")}</label><input class="text-input" id="dylan-code" name="code" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required autocomplete="off"><p id="dylan-error" class="form-error" role="status"></p><button class="button" type="submit">${t("确认房间并开门", "Find the room & unlock it")} →</button></form><div class="dialog-actions"><button class="underlined" data-action="dylan-trail">${t("核对三份纸条", "Check the three notes")}</button></div><details class="puzzle-help"><summary>${t("需要一点提示？", "Need a hint?")}</summary><p>${t("二层加上房号末两位 16，是 216。首次值班日期为 6 月 14 日，门禁按 MMDD 填写。", "Floor 2 and the last two digits, 16, give 216. His first shift was June 14; use MMDD for the code.")}</p></details></div>`,
      );
    }
    function foundRoom() {
      show(
        t("216 号房", "Room 216"),
        `<div class="dylan-discovery" data-puzzle-original><p class="ending-code">${t("支线一 / 未能送达的求助", "SIDE STORY 01 / THE UNANSWERED MESSAGE")}</p><p>${t("门开了。没有人回应。你找到的是一间早已封存的客房。床上的人被白布完整盖住，桌边放着迪伦的工牌。", "The door opens. Nobody answers. The room was sealed long ago. A person on the bed is completely covered by a white sheet. Dylan’s staff badge lies on the desk.")}</p><figure class="dylan-room-photo"><img src="assets/dylan-room.png" alt="${t("封存的酒店客房，床上的人被白布完整盖住，床边留有行李和工牌", "A sealed hotel room with a fully covered figure on the bed, luggage and an employee badge")}"><figcaption>${t("216 号房 / 虚构场景插图", "ROOM 216 / FICTIONAL SCENE ILLUSTRATION")}</figcaption></figure><p>${t("抽屉里的旧记录确认：迪伦·哈克已自杀身亡。那几条求助留言在多年前就发出了，却一直夹在旧评价的附件里。", "An old record in the drawer confirms that Dylan Harker died by suicide. The messages were sent years ago and remained attached to the old guest reviews.")}</p><p>${t("他的工牌、借书卡和行李标签对得上。你把它们收进同一个封套，带离这间房。这一次，求助记录没有再被删掉。", "The badge, library card and luggage tag match. You put them in the same envelope and take it from the room. This time, the request for help remains in the record.")}</p><div class="dialog-actions"><button class="button" data-action="dylan-finish">${t("带走记录，离开东楼", "Take the records & leave the wing")} →</button><button class="paper-button" data-action="dylan-message">${t("重读迪伦的留言", "Read Dylan’s message again")}</button></div></div>`,
        t("封存客房 / 迪伦·哈克", "SEALED ROOM / DYLAN HARKER"),
      );
    }
    function finishDylan() {
      if (!dylan().found) return trail();
      remember("departure");
      show(
        t("未能送达的求助", "The unanswered message"),
        `<div class="ending" data-puzzle-original><p class="ending-code">${t("结局 01 / 迪伦·哈克", "ENDING 01 / DYLAN HARKER")}</p><p>${t("你推开红色出口，天已经快亮了。手里的封套装着迪伦留在酒店里的全部记录，背面还写着监控机位的顺序。", "You push through the red exit just before dawn. The envelope holds Dylan’s surviving records. On its back is the order of the surveillance locations.")}</p><p>${t("你没能把他带出来，但终于有人确认，他确实来过这里，也曾向外面求助。", "You could not bring him out. But his presence here, and his attempts to reach someone outside, have finally been recorded.")}</p><p class="file-note">${t("已收录迪伦的记录。监控顺序：走廊 → 前台 → 客房。", "Dylan’s records retained. Camera order: corridor → reception → guest room.")}</p>${endingLinks()}</div>`,
      );
    }
    function endingLinks() {
      return `<div class="dialog-actions"><button class="button" data-action="journal">${t("查看已保存的记录", "View saved records")}</button><button class="paper-button" data-room="404">${t("回看另一种选择", "Revisit another choice")} →</button><button class="paper-button" data-page="home">${t("返回酒店网站", "Return to the hotel website")}</button></div><p class="local-note">${t("这个结局已保存。其他支线及原来的地下调查仍可继续。", "This ending is saved. The other side story and the original lower investigation remain available.")}</p>`;
    }
    function interview() {
      if (job().stage === "escaped") return jobEnding();
      if (job().stage === "working") return go("surveillance");
      api.openSupport("supervisor");
    }
    function acceptJob() {
      if (job().stage === "escaped") return jobEnding();
      void api.preloadScares();
      if (job().stage !== "hired" && !api.canAcceptJob()) return interview();
      if (!getState().checkedIn)
        return show(
          t("先办理住宿登记", "Register for your room first"),
          `<div data-puzzle-original><p>${t("里德把工牌压在一张登记表下：“先到前台登记，领取 307 号房钥匙，再回来交接。你的东西还没地方放。”", "Reed puts the badge beneath a registration form. “Collect the key to Room 307 first. You need somewhere to leave your belongings.”")}</p><button class="button" data-page="reservations">${t("到前台登记", "Register at reception")} →</button><button class="paper-button" data-action="job-interview">${t("返回交接", "Return to the handover")}</button></div>`,
        );
      if (job().stage !== "working") job().stage = "hired";
      save();
      show(
        t("今晚从监控室开始", "Your shift begins in surveillance"),
        `<div data-puzzle-original><div class="temporary-badge"><span>STILLWATER</span><strong>${escape(getState().name)}</strong><b>${t("临时值班员", "TEMPORARY OPERATOR")}</b><small>SECURITY / EAST WING</small></div><p>${t("你领到了工牌。里德带你穿过员工通道，打开监控室的门，指了指三路画面：“按交接单来。下一班到了会有人叫你。”", "You collect the badge. Reed leads you through the service corridor, opens surveillance and points to the three feeds. “Follow the handover sheet. Someone will call when your relief arrives.”")}</p><p>${t("桌上只有一支笔、三张巡检表和一个三位数字面板。你坐下后，门在身后锁上了。", "There is a pen, three check sheets and a three-digit panel on the desk. The door locks after you sit down.")}</p><button class="button" data-action="job-resume">${t("坐到监控工作台前", "Sit at the surveillance desk")} →</button></div>`,
      );
    }
    let timers = [],
      viewToken = 0,
      scareIndex = -1;
    const lastPortraits = [
      "scare-porter.png",
      "scare-veil.png",
      "scare-reflection.png",
    ];
    function cancelTimers() {
      timers.forEach(clearTimeout);
      timers = [];
      viewToken++;
    }
    function later(fn, delay) {
      const timer = setTimeout(fn, delay);
      timers.push(timer);
    }
    const noMotion = () =>
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    function scare() {
      if (
        !getState().scares ||
        noMotion() ||
        document.hidden ||
        location.hash.split("?")[0] !== "#surveillance" ||
        job().stage !== "working"
      )
        return;
      const actor = $("#monitor-threat");
      if (!actor) return;
      scareIndex = (scareIndex + 1) % lastPortraits.length;
      actor.querySelector("img").src = "assets/" + lastPortraits[scareIndex];
      actor.dataset.encounter = String(scareIndex);
      actor.hidden = false;
      api.playKnock();
      later(() => {
        actor.hidden = true;
      }, 650);
    }
    function reviewedRound() {
      return feeds.every((id) =>
        job().reviewed.includes(`${job().round}:${id}`),
      );
    }
    function feedMarkup() {
      const id = job().feed,
        feed = feedInfo[id],
        digitsVisible = job().round >= (id === "room" ? 3 : 2);
      return `<div class="shift-feed ${"shift-feed--" + id}" style="--feed-image:url('assets/${feed.image}')" data-feed="${id}"><div class="shift-feed-header"><span>● REC / CAM ${feed.camera}</span><span>04:04:${String(job().reviewed.length * 3).padStart(2, "0")}</span></div><div class="shift-scene">${digitsVisible ? `<button class="scene-mark scene-mark--${id}" data-action="monitor-inspect-${id}" aria-label="${t("检查画面中的标记", "Inspect the mark in the scene")}"><span aria-hidden="true">${feed.number}</span></button>` : ""}</div><div class="shift-feed-footer">${feed.name} / STILLWATER HOTEL</div><div class="monitor-threat" id="monitor-threat" hidden aria-hidden="true"><img alt="" src="assets/${lastPortraits[Math.max(scareIndex, 0)]}"></div></div>`;
    }
    function monitorPage() {
      if (job().stage === "escaped") return jobEndingMarkup();
      if (!["hired", "working"].includes(job().stage))
        return `<div class="page-main" data-puzzle-original><h1>${t("监控室尚未交接", "The surveillance handover is incomplete")}</h1><p>${t("请先与里德主管交谈，完成住宿登记并领取临时工牌。", "Speak to Reed, register for your room and collect your temporary badge first.")}</p><button class="button" data-action="job-interview">${t("联系夜班主管", "Contact the night supervisor")} →</button></div>`;
      const j = job();
      return `<div class="page-main surveillance-desk" data-puzzle-original><header class="surveillance-heading"><div><p class="eyebrow">STILLWATER / SECURITY OPERATIONS</p><h1>${t("夜班监控工作台", "Night surveillance desk")}</h1><p>${t("三路画面，每轮各确认一次，共三轮。留意画面里后来出现的标记。", "Check each of the three feeds once per round, for three rounds. Watch for marks that appear later.")}</p></div><div class="shift-clock">04:04<span>${t("室门：已锁", "DOOR: LOCKED")}</span></div></header><div class="surveillance-layout"><section><div class="shift-tabs" role="group" aria-label="${t("选择监控机位", "Choose a surveillance feed")}">${feeds.map((id) => `<button data-action="monitor-feed-${id}" aria-pressed="${j.feed === id}">CAM ${feedInfo[id].camera}<span>${feedInfo[id].name}</span></button>`).join("")}</div><div id="shift-feed-container">${feedMarkup()}</div><div class="shift-watch-controls"><button class="button" id="monitor-log" data-action="monitor-log" disabled>${t("画面同步中…", "Synchronizing feed…")}</button><p id="monitor-status" role="status">${t("请检查画面后再确认。", "Examine the feed before confirming it.")}</p></div><div class="shift-rounds"><span>${t("本轮巡检", "CURRENT ROUND")} <b>${j.round} / 3</b></span><span>${t("已确认画面", "FEEDS CONFIRMED")} <b id="monitor-total">${j.reviewed.length} / 9</b></span></div><div class="shift-checklist">${feeds.map((id) => `<span data-check-feed="${id}">${j.reviewed.includes(`${j.round}:${id}`) ? "✓" : "○"} ${feedInfo[id].name}</span>`).join("")}</div><button class="paper-button" id="monitor-next-round" data-action="monitor-next-round" ${j.round === 3 || !reviewedRound() ? "hidden" : ""}>${t("开始下一轮巡检", "Begin the next round")} →</button></section><aside class="shift-side-panel"><div class="shift-handover"><p class="eyebrow">${t("交接记录", "HANDOVER LOG")}</p><p id="shift-round-message">${roundMessage()}</p><button class="underlined" data-action="monitor-order-note">${t("查阅住客留下的旧备注", "Read the old guest notes")} →</button><button class="underlined" data-action="monitor-settings">${t("画面与声音设置", "Visual & audio settings")}</button></div><div class="shift-evidence"><h2>${t("画面中的数字", "Numbers in the feeds")}</h2><ul>${feeds.map((id) => `<li><span>${feedInfo[id].name}</span><b data-feed-evidence="${id}">${j.inspected.includes(id) ? feedInfo[id].number : "—"}</b></li>`).join("")}</ul><p>${t("点击画面里的标记，将数字记到这里。", "Inspect a mark in the scene to record it here.")}</p></div><form id="monitor-escape-form" class="monitor-keypad"><h2>${t("应急开门校验", "Emergency door verification")}</h2><p>${t("完成三轮巡检并找到三个数字后，按旧备注中的场景顺序输入。", "Complete three rounds, find all three numbers and follow the location order in the old notes.")}</p><label for="monitor-code">${t("三位数字校验码", "Three-digit verification code")}</label><input class="text-input" id="monitor-code" name="code" inputmode="numeric" pattern="[0-9]{3}" maxlength="3" autocomplete="off" required placeholder="— — —"><p class="form-error" id="monitor-error" role="status"></p><button class="button full-width" type="submit">${t("解除门锁", "Release the door lock")} →</button></form></aside></div></div>`;
    }
    function roundMessage() {
      return [
        "",
        t(
          "里德：我去接下一位。你先看第一轮，别漏了客房那路。",
          "Reed: I will meet the next arrival. Start your first round; do not miss the room feed.",
        ),
        t(
          "对讲机没有人回应。门旁的指示灯由绿变红，画面里多了先前没有的字迹。",
          "The intercom is silent. The light beside the door turns red. Marks have appeared in the feeds.",
        ),
        t(
          "第三轮。门外有人试了一下把手，然后走远了。先把数字记齐。",
          "Third round. Someone tries the handle outside, then walks away. Find the remaining numbers.",
        ),
      ][job().round];
    }
    function armFeed() {
      cancelTimers();
      void api.preloadScares();
      if (job().stage !== "working" || !$("#shift-feed-container")) return;
      const token = viewToken;
      const done = job().reviewed.includes(`${job().round}:${job().feed}`);
      const log = $("#monitor-log");
      if (done) {
        log.disabled = true;
        log.textContent = t("本轮已确认 ✓", "Confirmed this round ✓");
      } else
        later(() => {
          if (token !== viewToken || !$("#monitor-log")) return;
          $("#monitor-log").disabled = false;
          $("#monitor-log").textContent = t(
            "确认这路画面",
            "Confirm this feed",
          );
        }, 900);
      if (
        getState().scares &&
        !noMotion() &&
        (Math.random() < 0.55 || job().feed === "room")
      )
        void api.preloadScares().then(() => {
          if (token !== viewToken) return;
          later(
            () => {
              if (token === viewToken) scare();
            },
            450 + Math.random() * 1200,
          );
        });
    }
    function selectFeed(id) {
      if (job().stage !== "working" || !feeds.includes(id)) return;
      job().feed = id;
      save();
      $("#shift-feed-container").innerHTML = feedMarkup();
      $("#monitor-status").textContent = t(
        "请检查画面后再确认。",
        "Examine the feed before confirming it.",
      );
      $("#monitor-log").disabled = true;
      $("#monitor-log").textContent = t("画面同步中…", "Synchronizing feed…");
      document
        .querySelectorAll(".shift-tabs button")
        .forEach((button) =>
          button.setAttribute(
            "aria-pressed",
            String(button.dataset.action === "monitor-feed-" + id),
          ),
        );
      armFeed();
    }
    function logFeed() {
      if (
        job().stage !== "working" ||
        !$("#monitor-log") ||
        $("#monitor-log").disabled
      )
        return;
      const key = `${job().round}:${job().feed}`;
      if (!job().reviewed.includes(key)) job().reviewed.push(key);
      save();
      $("#monitor-log").disabled = true;
      $("#monitor-log").textContent = t(
        "本轮已确认 ✓",
        "Confirmed this round ✓",
      );
      $("#monitor-total").textContent = `${job().reviewed.length} / 9`;
      $(`[data-check-feed="${job().feed}"]`).textContent =
        "✓ " + feedInfo[job().feed].name;
      $("#monitor-next-round").hidden = job().round === 3 || !reviewedRound();
      $("#monitor-status").textContent = reviewedRound()
        ? job().round === 3
          ? t(
              "三轮记录完整。核对数字，打开门锁。",
              "All three rounds are complete. Check the numbers and release the lock.",
            )
          : t(
              "本轮已完成，可以开始下一轮。",
              "Round complete. You may begin the next one.",
            )
        : t(
            "记录已保存，请切换到本轮尚未确认的机位。",
            "Log saved. Check another feed that has not been confirmed this round.",
          );
    }
    function jobEndingMarkup() {
      return `<section class="page-main monitor-ending" data-puzzle-original><p class="eyebrow">${t("结局 02 / 最后一班", "ENDING 02 / THE LAST SHIFT")}</p><h1>${t("监控室的门开了。", "The surveillance-room door opens.")}</h1><p>${t("你输入最后一个数字，门锁终于弹开。走廊里没有里德，也没有来接班的人。你把工牌留在桌上，从员工通道走到街边。", "You enter the final digit. The lock releases. Neither Reed nor your relief is in the corridor. You leave the badge on the desk and follow the service corridor out to the street.")}</p><p>${t("手机里的招聘消息变成了“岗位已招满”。监控室那台电脑却还亮着，客房画面里，有个人正坐在刚才那张椅子上。", "The job message on your phone now reads “Position filled.” The surveillance computer is still lit. In the room feed, someone sits in the chair you just left.")}</p><p class="file-note">${t("巡检记录：9 / 9。已核对数字：走廊 4、前台 7、客房 2。门锁解除。", "Patrol log: 9 / 9. Numbers confirmed: corridor 4, reception 7, room 2. Door released.")}</p>${endingLinks()}<button class="underlined" data-action="job-replay">${t("重新体验监控值班（保留其他记录）", "Replay the surveillance shift (keep other records)")}</button></section>`;
    }
    function jobEnding() {
      if (job().stage !== "escaped") return interview();
      go("surveillance");
      render(true);
    }
    function appendix(title) {
      const id = {
        "The reading room": "library",
        "Lost property, awaiting collection": "property",
        "The breakfast programme": "roster",
      }[title];
      if (!id) return "";
      return `<aside class="dylan-document-appendix" data-puzzle-original><p>${t("资料夹里还夹着一份署名 D. Harker 的记录。", "There is another record in the folder, signed D. Harker.")}</p><button class="underlined" data-action="dylan-note-${id}">${notes[id].title} →</button></aside>`;
    }
    function decorate(route) {
      if (route === "guestbook")
        $("#guestbook-archive-entries")?.insertAdjacentHTML(
          "beforeend",
          `<article class="guest-entry dylan-public-entry" data-puzzle-original><div class="entry-meta"><span>D. H. · ${t("夜班住宿", "Night-shift accommodation")}</span><span>${t("日期未注明", "Undated")}</span></div><blockquote>${t("“晚到的话，最好先问清楚谁负责交班。前台的铃声隔着两层楼也听得见，走廊的灯一整晚都没关。”", "“If you arrive late, check who is responsible for the handover. You can hear the reception bell two floors away. The corridor lights stayed on all night.”")}</blockquote><button class="underlined" data-action="dylan-message">${t("查看附带的留言", "Read the attached message")} →</button></article>`,
        );
      const working = job().stage === "working";
      $("#surveillance-return").hidden = !working || route === "surveillance";
      document.body.classList.toggle(
        "security-shift",
        route === "surveillance" && working,
      );
      if (route === "surveillance" && working) armFeed();
      else cancelTimers();
    }
    const actions = {
      "dylan-message": startDylan,
      "dylan-trail": trail,
      "dylan-door": door,
      "dylan-finish": finishDylan,
      "job-interview": () => interview(),
      "job-accept": acceptJob,
      "job-resume"() {
        if (!["hired", "working", "escaped"].includes(job().stage))
          return interview();
        if (job().stage === "escaped") return jobEnding();
        job().stage = "working";
        save();
        go("surveillance");
        render(true);
      },
      "job-replay"() {
        state().job = fresh().job;
        save();
        interview();
      },
      "monitor-log": logFeed,
      "monitor-next-round"() {
        if (job().stage !== "working" || job().round >= 3 || !reviewedRound())
          return;
        job().round++;
        save();
        render();
      },
      "monitor-order-note"() {
        if (dylan().met) return startDylan();
        show(
          t("旧值班备注", "Old shift notes"),
          `<div data-puzzle-original><p>${t("旧备注保存在住客留言里。有一条署名 D. H. 的评价，下面附着一段补充内容。", "The old notes are kept with the guest messages. Look for the review signed D. H. and open its attached message.")}</p><p class="file-note">D. H. · ${t("夜班住宿 / 附带一段补充留言", "Night-shift accommodation / An additional message is attached")}</p><button class="button" data-action="dylan-message">${t("查看附带的留言", "Read the attached message")} →</button><button class="paper-button" data-page="guestbook">${t("浏览全部住客留言", "Browse all guest messages")}</button></div>`,
        );
      },
      "monitor-settings"() {
        api.actions.about();
      },
    };
    for (const id of noteIds) {
      actions[`dylan-note-${id}`] = () => showNote(id);
      actions[`dylan-keep-${id}`] = () => {
        if (!dylan().met) return;
        if (!dylan().notes.includes(id)) dylan().notes.push(id);
        save();
        refreshDocument();
        toast(
          t(
            "纸条已保存，可以在住客笔记里核对。",
            "Note saved. Review it in your notebook.",
          ),
        );
      };
    }
    for (const id of feeds) {
      actions[`monitor-feed-${id}`] = () => selectFeed(id);
      actions[`monitor-inspect-${id}`] = () => {
        if (
          job().stage !== "working" ||
          job().feed !== id ||
          job().round < (id === "room" ? 3 : 2)
        )
          return;
        if (!job().inspected.includes(id)) job().inspected.push(id);
        save();
        $(`[data-feed-evidence="${id}"]`).textContent = feedInfo[id].number;
        $("#monitor-status").textContent = feedInfo[id].detail;
      };
    }
    document.addEventListener("submit", (event) => {
      if (event.target.id === "dylan-room-form") {
        event.preventDefault();
        if (dylan().notes.length !== 3) return trail();
        if (job().stage === "working") return door();
        if (event.target.elements.room.value !== "216") {
          $("#dylan-error").textContent = t(
            "房号不符。借书卡给出楼层，行李签给出最后两位。",
            "Wrong room. The library card gives the floor; the luggage tag gives the last two digits.",
          );
          return;
        }
        if (event.target.elements.code.value !== "0614") {
          $("#dylan-error").textContent = t(
            "门禁没有打开。请按首次夜班的月份、日期填写，各两位。",
            "The door remains locked. Use the first shift’s month and day, two digits each.",
          );
          return;
        }
        dylan().found = true;
        save();
        foundRoom();
      }
      if (event.target.id === "monitor-escape-form") {
        event.preventDefault();
        if (job().stage !== "working") return;
        if (job().reviewed.length !== 9 || job().inspected.length !== 3) {
          $("#monitor-error").textContent = t(
            "请先完成三轮巡检，并检查三个场景中的数字标记。",
            "Complete all three rounds and inspect the number in each location first.",
          );
          return;
        }
        if (event.target.elements.code.value !== "472") {
          job().mistakes++;
          save();
          $("#monitor-error").textContent = t(
            "顺序不正确。旧备注写的是场景顺序，不是摄像头编号。",
            "Wrong order. The old notes list locations, not camera numbers.",
          );
          scare();
          return;
        }
        cancelTimers();
        job().stage = "escaped";
        remember("return");
        render(true);
      }
    });
    return {
      actions,
      pages: { surveillance: monitorPage },
      appendix,
      decorate,
      refreshDocument,
      notebook,
      startDylan,
      startJob: () => interview(),
      cancelTimers,
    };
  }
  return { fresh, hydrate, create };
})();
