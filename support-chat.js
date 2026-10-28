/* A local story conversation, with a single 15-second interrupted connection. */
window.StillwaterSupport = (() => {
  "use strict";
  const MODES = ["supervisor", "concierge"];
  const REPLIES = [
    "greeting",
    "duties",
    "pay",
    "schedule",
    "startdate",
    "reporttime",
    "handover",
    "dylan",
    "registration",
    "room",
    "supervisor",
    "archive",
    "messages",
    "fallback",
  ];
  const DURATION = 15000;
  const fresh = () => ({
    threads: { supervisor: [], concierge: [] },
    sent: { supervisor: 0, concierge: 0 },
    drafts: { supervisor: "", concierge: "" },
    interrupted: false,
    until: 0,
    timeStreak: 0,
    impostorSeen: false,
    impostorActive: false,
  });
  function hydrate(raw) {
    const value = fresh();
    if (!raw || typeof raw !== "object") return value;
    for (const mode of MODES) {
      const messages = Array.isArray(raw.threads?.[mode])
        ? raw.threads[mode]
        : [];
      value.threads[mode] = messages
        .filter(
          (message) =>
            message &&
            ((message.role === "user" && typeof message.text === "string") ||
              (message.role === "agent" && REPLIES.includes(message.key))),
        )
        .slice(-80)
        .map((message) =>
          message.role === "user"
            ? { role: "user", text: message.text.slice(0, 280) }
            : { role: "agent", key: message.key },
        );
      value.sent[mode] =
        Number.isSafeInteger(raw.sent?.[mode]) && raw.sent[mode] >= 0
          ? Math.min(raw.sent[mode], 10000)
          : value.threads[mode].filter((message) => message.role === "user")
              .length;
      value.drafts[mode] =
        typeof raw.drafts?.[mode] === "string"
          ? raw.drafts[mode].slice(0, 280)
          : "";
    }
    value.interrupted = raw.interrupted === true;
    value.timeStreak = Number.isInteger(raw.timeStreak)
      ? Math.max(0, Math.min(3, raw.timeStreak))
      : 0;
    value.impostorSeen = raw.impostorSeen === true;
    value.impostorActive = value.impostorSeen && raw.impostorActive === true;
    value.until =
      value.interrupted &&
      Number.isFinite(raw.until) &&
      raw.until > 0 &&
      raw.until <= Date.now() + DURATION
        ? raw.until
        : 0;
    return value;
  }
  function create(api) {
    const { getState, save, show, escape } = api;
    const zh = document.documentElement.lang === "zh-CN";
    const t = (a, b) => (zh ? a : b);
    const state = () => getState().sideQuests.support;
    const $ = (selector) => document.querySelector(selector);
    let timer = null,
      phase = -1,
      lastActive = null;
    const currentMode = () => $("#support-chat")?.dataset.supportMode;
    const active = () =>
      state().impostorActive ||
      (state().interrupted && state().until > Date.now());
    const totalSent = () => state().sent.supervisor + state().sent.concierge;
    const canAccept = () =>
      getState().sideQuests.job.talked.includes("duties") &&
      totalSent() >= 3 &&
      !active();
    const labels = {
      duties: t("岗位职责", "Job duties"),
      pay: t("薪资住宿", "Pay & accommodation"),
      schedule: t("值班时间", "Shift hours"),
      handover: t("入职办理", "Starting work"),
      registration: t("办理入住", "Check-in"),
      room: t("客房设施", "Room facilities"),
      supervisor: t("联系主管", "Contact supervisor"),
      dylan: t("迪伦", "Dylan"),
      messages: t("旧留言", "Old messages"),
      archive: t("员工门禁", "Staff access"),
    };
    const questions = {
      duties: t(
        "请问今晚的工作具体要做什么？",
        "What would I be doing tonight?",
      ),
      pay: t("工资和住宿怎么安排？", "What about pay and accommodation?"),
      schedule: t(
        "今晚几点上班，几点交接？",
        "What time does tonight’s shift start and finish?",
      ),
      handover: t(
        "我想办理入职，接下来该怎么做？",
        "I would like to start work. What should I do next?",
      ),
      startdate: t(
        "如果入职，具体哪天开始上班？",
        "If I accept, which date would I start?",
      ),
      reporttime: t(
        "报到当天需要几点到酒店？",
        "What time should I arrive on my first day?",
      ),
      registration: t(
        "请问办理入住需要哪些信息？",
        "What information do I need for check-in?",
      ),
      room: t("客房里有哪些设施？", "What facilities are in the rooms?"),
      supervisor: t(
        "我想联系夜班主管，咨询招聘的事情。",
        "I would like to contact the night supervisor about the vacancy.",
      ),
      dylan: t("迪伦·哈克以前在这里工作吗？", "Did Dylan Harker work here?"),
      messages: t(
        "在哪里可以看到以前的住客留言？",
        "Where can I find the older guest messages?",
      ),
      archive: t(
        "员工档案的门禁要在哪里办理？",
        "How do I access the employee archive?",
      ),
    };
    function reply(key, mode) {
      const supervisor = mode === "supervisor";
      return (
        {
          greeting: supervisor
            ? t(
                "你好，我是夜班主管里德。关于今晚的岗位，你想先了解哪方面？",
                "Hello, I’m Reed, the night supervisor. What would you like to know about tonight’s vacancy?",
              )
            : t(
                "你好，这里是静水旅馆前台。入住安排或求职问题，都可以在这里咨询。",
                "Hello, this is Stillwater reception. I can help with accommodation or recruitment enquiries.",
              ),
          duties: t(
            "今晚安排你在监控室值班。三路画面，每轮各确认一次，一共三轮。看清后再记录，出现异常时保留画面。",
            "Tonight’s role is in surveillance: three feeds per round, for three rounds. Examine each feed before confirming it, and preserve anything unusual.",
          ),
          pay: t(
            "岗位按夜班结算，提供临时住宿。先完成今晚的交接，具体合同明早再确认。",
            "The role pays per night shift and includes temporary accommodation. Complete tonight’s handover; the contract will be confirmed in the morning.",
          ),
          schedule: t(
            "今晚 23:00 到次日 7:00。请先问清岗位内容，再到前台办理住宿登记。下一班到岗后，会有人通知你。",
            "Tonight’s hours are 11 p.m. to 7 a.m. Check the role first, then register for your room. Someone will notify you when your relief arrives.",
          ),
          startdate: t(
            "本次招募安排今晚入职。如果今晚无法到岗，请提前联系前台，确认是否还有其他班次。",
            "This vacancy starts tonight. If you cannot arrive tonight, let reception know so they can check for another shift.",
          ),
          reporttime: t(
            "请在 22:40 到前台报到，23:00 正式接班。住宿登记请在交接前办好，监控室会有人带你过去。",
            "Report to reception at 10:40 p.m. for an 11 p.m. handover. Complete your room registration first; someone will take you to surveillance.",
          ),
          handover: t(
            "请先确认岗位、班次和住宿安排。沟通完成后，点击下方“确认入职”，再到前台登记领取钥匙。",
            "Check the role, hours and accommodation. When you are ready, select “Accept night shift” below, then collect your room key at reception.",
          ),
          dylan: t(
            "系统里没有这名在职员工。今晚的工作安排，请以本次交接名单为准。",
            "There is no current employee by that name in the system. Please follow tonight’s handover list.",
          ),
          registration: t(
            "用昵称填写入住登记，阅读入住须知后即可领取钥匙。无需付款或提供证件信息。",
            "Use a nickname on the registration page and read the guest guidelines to collect your key. No payment or identity documents are required.",
          ),
          room: t(
            "客房配有独立卫浴、书桌和茶饮用品。早餐在一层供应，时间为 7:00–9:00。具体房型可在“客房与套房”查看。",
            "Rooms have a private bathroom, desk and tea facilities. Breakfast is served downstairs from 7 to 9 a.m. See Rooms & Suites for the room types.",
          ),
          supervisor: t(
            "招聘和夜班交接由里德主管负责。你可以点击下方“转接主管”，继续咨询岗位。",
            "Reed handles recruitment and the night handover. Select “Transfer to supervisor” below to discuss the role.",
          ),
          archive: t(
            "正式员工档案使用单独的四位通行码。相关提示保留在旅馆往事中，临时工牌不能直接打开档案室。",
            "The original staff archive uses a separate four-digit code. Its hint is in the hotel history; the temporary badge does not open the archive.",
          ),
          messages: t(
            "网站保留了以前的住客留言。有些留言的补充内容折叠在正文下面，可以点开查看。",
            "Older guest messages are retained on the website. Some have extra replies folded beneath the main text.",
          ),
          fallback: supervisor
            ? t(
                "我在。你可以问岗位、薪资住宿、值班时间或入职办理，也可以选择输入框上方的关键词。",
                "I’m here. Ask about duties, pay, shift hours or starting work, or choose a keyword above the message box.",
              )
            : t(
                "可以帮你查询入住、客房和招聘安排。选一个上方关键词，或直接输入问题即可。",
                "I can help with check-in, rooms or recruitment. Choose a keyword above the box or type your question.",
              ),
        }[key] || ""
      );
    }
    function classify(text, mode) {
      const suggested = Object.entries(questions).find(
        ([, question]) => question === text,
      )?.[0];
      if (suggested)
        return mode === "concierge" &&
          ["duties", "handover"].includes(suggested)
          ? "supervisor"
          : suggested;
      if (/迪伦|哈克|dylan|harker/i.test(text)) return "dylan";
      if (/旧留言|住客留言|以前.*留言|old.*message|guest.*message/i.test(text))
        return "messages";
      if (/门禁|通行码|员工档案|staff.*access|archive/i.test(text))
        return "archive";
      if (/主管|招聘|supervisor|recruit/i.test(text) && mode === "concierge")
        return "supervisor";
      if (/入住|预订|登记|check.?in|registration|reservation/i.test(text))
        return "registration";
      if (
        /几点|什么时候|哪天|日期|时间|几号|班次|交接|排班|小时|hours|schedule|what time|which date|when.*(start|work|shift|arriv)|shift.*(start|finish)/i.test(
          text,
        )
      )
        return "schedule";
      if (
        /入职|接下|接受|报到|确认工作|start.*work|accept|appointment|handover/i.test(
          text,
        )
      )
        return mode === "supervisor" ? "handover" : "supervisor";
      if (/工资|薪|住宿|报酬|待遇|pay|salary|accommodation|benefit/i.test(text))
        return "pay";
      if (
        /几点|时间|班次|交接|排班|小时|hours|schedule|shift|start.*finish/i.test(
          text,
        )
      )
        return "schedule";
      if (/岗位|职责|做什么|工作|duties|role|work|job/i.test(text))
        return mode === "supervisor" ? "duties" : "supervisor";
      if (/客房|设施|room|facilit|amenit/i.test(text)) return "room";
      return "fallback";
    }
    function threadMarkup(mode) {
      return state()
        .threads[mode].map((message) =>
          message.role === "user"
            ? `<div class="support-message support-message--user"><div class="support-bubble" data-user-text>${escape(message.text)}</div><span>${t("已发送", "Sent")}</span></div>`
            : `<div class="support-message support-message--agent"><div class="support-bubble">${reply(message.key, mode)}</div></div>`,
        )
        .join("");
    }
    function keywords(mode) {
      const ids =
        mode === "supervisor"
          ? ["duties", "pay", "schedule", "handover"]
          : ["registration", "room", "supervisor"];
      if (mode === "supervisor") ids.push("startdate", "reporttime");
      if (getState().sideQuests.dylan.met) ids.push("messages", "dylan");
      return ids
        .map(
          (id) =>
            `<button type="button" data-support-keyword="${id}" aria-pressed="false">${labels[id] || t(id === "startdate" ? "入职日期" : "报到时间", id === "startdate" ? "Start date" : "Arrival time")}</button>`,
        )
        .join("");
    }
    function controls(mode) {
      if (mode === "concierge")
        return `<button class="support-secondary" type="button" data-action="contact-supervisor">${t("转接主管", "Transfer to supervisor")} →</button><button class="support-secondary" type="button" data-page="reservations">${t("前往入住登记", "Go to registration")}</button>`;
      const stage = getState().sideQuests.job.stage;
      if (["working", "escaped"].includes(stage))
        return `<button class="support-primary" type="button" data-action="job-resume">${stage === "working" ? t("返回监控室", "Return to surveillance") : t("查看值班记录", "View shift records")} →</button>`;
      return `<button class="support-primary" type="button" data-action="job-accept" ${canAccept() || stage === "hired" ? "" : "disabled"}>${t("确认入职", "Accept night shift")} →</button><span>${t("先了解岗位、班次和住宿安排。", "Check the role, hours and accommodation first.")}</span>`;
    }
    function open(mode = "supervisor") {
      if (!MODES.includes(mode)) mode = "supervisor";
      if (mode === "supervisor" && getState().sideQuests.job.stage === "none")
        getState().sideQuests.job.stage = "interview";
      if (!state().threads[mode].length)
        state().threads[mode].push({ role: "agent", key: "greeting" });
      save();
      show(
        mode === "supervisor"
          ? t("联系主管", "Contact supervisor")
          : t("联系客服", "Contact support"),
        `<section id="support-chat" data-support-mode="${mode}" data-puzzle-original><header class="support-contact"><span class="support-avatar">${mode === "supervisor" ? "R" : "S"}</span><div><h3>${mode === "supervisor" ? t("里德 · 夜班主管", "Reed · Night supervisor") : t("静水旅馆 · 前台客服", "Stillwater · Guest support")}</h3><p id="support-connection" role="status"><i></i>${t("在线", "Online")}</p></div><span class="support-channel">${t("酒店在线服务", "HOTEL MESSAGING")}</span></header><div id="support-thread" class="support-thread" role="log" aria-label="${t("聊天记录", "Conversation")}" aria-live="polite"></div><section id="support-interruption" class="support-interruption" aria-label="${t("异常会话", "Interrupted connection")}" hidden><div class="support-signal-label"><span>CONNECTION LOST</span><span>… / D.H.</span></div><div id="support-signal-messages" role="log" aria-live="polite"></div><p class="support-reconnecting">${t("正在尝试恢复会话…", "Attempting to restore the conversation…")}</p></section><fieldset id="support-controls"><div class="support-suggestions"><span>${t("你可以问", "ASK ABOUT")}</span><div id="support-keywords"></div></div><form id="support-chat-form"><label class="support-sr-only" for="support-input">${t("发送给对方的消息", "Message to send")}</label><div class="support-composer"><textarea id="support-input" name="message" maxlength="280" rows="2" placeholder="${t("输入消息，或选择上方关键词", "Type a message or choose a keyword above")}"></textarea><button type="submit" class="support-send" aria-label="${t("发送消息", "Send message")}">↑</button></div><p id="support-input-status" class="support-input-status" role="status"></p></form><div id="support-actions" class="support-actions"></div><p class="support-local-note">${t("剧情对话，消息只保存在当前设备。", "Story conversation. Messages stay on this device.")}</p></fieldset></section>`,
        t("静水旅馆 / 在线会话", "STILLWATER / LIVE MESSAGING"),
      );
    }
    function updateConversation(scroll = true) {
      const mode = currentMode();
      if (!mode) return;
      $("#support-thread").innerHTML = threadMarkup(mode);
      $("#support-keywords").innerHTML = keywords(mode);
      $("#support-actions").innerHTML = controls(mode);
      if (scroll)
        $("#support-thread").scrollTop = $("#support-thread").scrollHeight;
    }
    const signalMessages = [
      t(
        "别关窗口。我只能趁现在联系你。",
        "Do not close the window. This is the only way I can reach you.",
      ),
      t(
        "我叫迪伦·哈克。我被锁在这家酒店里。前台不会帮我。",
        "My name is Dylan Harker. I am locked inside this hotel. Reception will not help me.",
      ),
      t(
        "去住客留言里找署名 D. H. 的那一条，点开下面附带的留言。我把房间线索留在那里了。",
        "Find the guest entry signed D. H. Open the message attached beneath it. I left the room clues there.",
      ),
      t(
        "如果他们让你去监控室：开门时先走廊，再前台，最后客房。别按摄像头编号排。",
        "If they send you to surveillance: corridor first, reception second, guest room last. Do not use the camera numbers.",
      ),
    ];
    function reconcile() {
      if (!currentMode()) return;
      const interrupted = active();
      const impostor = state().impostorActive;
      document.body.classList.toggle("supervisor-takeover", impostor);
      const visualEffects =
        interrupted &&
        getState().scares &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches;
      $("#story-dialog").classList.toggle("support-corrupted", visualEffects);
      $("#support-chat").classList.toggle("support-signal-active", interrupted);
      $("#support-thread").hidden = interrupted;
      $("#support-interruption").hidden = !interrupted;
      // Keep topic selection available during a dropped connection. Only sending
      // and changing the handover are paused; the selected draft survives it.
      $("#support-controls").disabled = false;
      $("#support-input").disabled = interrupted;
      $(".support-send").disabled = interrupted;
      $("#support-actions")
        .querySelectorAll("button")
        .forEach((button) => {
          button.disabled =
            interrupted ||
            (button.dataset.action === "job-accept" &&
              !canAccept() &&
              getState().sideQuests.job.stage !== "hired");
        });
      $("#story-dialog").classList.toggle("support-impostor", impostor);
      if (lastActive !== interrupted) {
        $("#support-connection").innerHTML = interrupted
          ? impostor
            ? t("里德 · 已读", "Reed · Read")
            : t("连接异常 · 正在恢复", "Connection unstable · Reconnecting")
          : `<i></i>${t("在线", "Online")}`;
        lastActive = interrupted;
      }
      if (interrupted) {
        if (impostor) {
          if (phase !== 99) {
            phase = 99;
            $("#support-signal-messages").innerHTML =
              `<p class="support-unknown-sender">${t("里德 · 夜班主管", "Reed · Night supervisor")}</p>${[
                t(
                  "你已经问了三次时间。我每一次都按时回答了。",
                  "You have asked about the time three times. I answered on time each time.",
                ),
                t(
                  "请把你的明天留给排班。迪伦·哈克没有明天，不必替他安排。",
                  "Please leave your tomorrow available for the rota. Dylan Harker has no tomorrow. You need not arrange one for him.",
                ),
                t(
                  "如果你继续查他的事，我们会把损失记在你的名下。先扣掉你的下班时间。然后是别人记得你的时间。",
                  "If you keep looking into him, we will charge the loss to your name. Your finishing time will be deducted first. Then the time for which other people remember you.",
                ),
                t(
                  "收到请回复。不要让我再等到你。",
                  "Please acknowledge receipt. Do not make me wait until you again.",
                ),
              ]
                .map(
                  (message) =>
                    `<div class="support-signal-bubble">${message}</div>`,
                )
                .join(
                  "",
                )}<button type="button" class="support-acknowledge" data-support-dismiss>${t("我知道了。", "Understood.")}</button>`;
            $(".support-signal-label").innerHTML =
              "<span>STAFF SESSION / 00:00</span><span>R. / R.</span>";
            $(".support-reconnecting").textContent = t(
              "另一台设备正在使用此身份。",
              "This identity is active on another device.",
            );
          }
          return;
        }
        $(".support-signal-label").innerHTML =
          "<span>CONNECTION LOST</span><span>… / D.H.</span>";
        $(".support-reconnecting").textContent = t(
          "正在尝试恢复会话…",
          "Attempting to restore the conversation…",
        );
        const elapsed = DURATION - (state().until - Date.now());
        const nextPhase =
          elapsed >= 8000 ? 3 : elapsed >= 5000 ? 2 : elapsed >= 2000 ? 1 : 0;
        if (phase !== nextPhase) {
          phase = nextPhase;
          $("#support-signal-messages").innerHTML =
            `<p class="support-unknown-sender">${phase ? t("迪伦·哈克", "Dylan Harker") : t("未知发送者", "Unknown sender")}</p>` +
            signalMessages
              .slice(0, phase + 1)
              .map(
                (message) =>
                  `<div class="support-signal-bubble">${message}</div>`,
              )
              .join("");
          $("#support-interruption").scrollTop = $(
            "#support-interruption",
          ).scrollHeight;
        }
      } else if (state().until) {
        state().until = 0;
        phase = -1;
        save();
        $("#support-signal-messages").innerHTML = "";
        updateConversation();
        $("#support-input-status").textContent = state().drafts[currentMode()]
          ? t(
              "会话已恢复，可以发送刚才选择的问题。",
              "Connection restored. You can send your selected question.",
            )
          : "";
      }
    }
    function detach() {
      clearInterval(timer);
      timer = null;
      phase = -1;
      lastActive = null;
      document.body.classList.remove("supervisor-takeover");
      $("#story-dialog")?.classList.remove(
        "support-chat-dialog",
        "support-corrupted",
        "support-impostor",
      );
    }
    function onDocumentChange() {
      detach();
      const mode = currentMode();
      if (!mode) return;
      $("#story-dialog").classList.add("support-chat-dialog");
      updateConversation();
      $("#support-input").value = state().drafts[mode];
      reconcile();
      timer = setInterval(() => {
        if (!$("#story-dialog")?.open || !currentMode()) return detach();
        reconcile();
      }, 250);
    }
    function send() {
      const mode = currentMode();
      if (!mode || active()) return;
      const message = $("#support-input").value.trim().slice(0, 280);
      if (!message) {
        $("#support-input-status").textContent = t(
          "请先输入一条消息。",
          "Enter a message first.",
        );
        return;
      }
      const key = classify(message, mode);
      state().threads[mode].push(
        { role: "user", text: message },
        { role: "agent", key },
      );
      state().threads[mode] = state().threads[mode].slice(-80);
      state().sent[mode]++;
      state().drafts[mode] = "";
      state().timeStreak =
        mode === "supervisor" &&
        ["schedule", "startdate", "reporttime"].includes(key)
          ? state().timeStreak + 1
          : 0;
      if (mode === "supervisor" && ["duties", "pay", "dylan"].includes(key)) {
        const job = getState().sideQuests.job;
        if (!job.talked.includes(key)) job.talked.push(key);
      }
      if (state().timeStreak >= 3 && !state().impostorSeen) {
        state().impostorSeen = true;
        state().impostorActive = true;
        phase = -1;
      } else if (!state().interrupted && state().sent[mode] >= 3) {
        state().interrupted = true;
        state().until = Date.now() + DURATION;
        phase = -1;
      }
      save();
      $("#support-input").value = "";
      $("#support-input-status").textContent = "";
      updateConversation();
      reconcile();
      if (!active()) $("#support-input").focus({ preventScroll: true });
    }
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-support-dismiss]") && currentMode()) {
        state().impostorActive = false;
        state().timeStreak = 0;
        phase = -1;
        lastActive = null;
        save();
        updateConversation();
        reconcile();
        return;
      }
      const chip = event.target.closest("[data-support-keyword]");
      if (!chip || !currentMode()) return;
      const value = questions[chip.dataset.supportKeyword];
      if (!value) return;
      $("#support-input").value = value;
      $("#support-keywords")
        .querySelectorAll("button")
        .forEach((button) =>
          button.setAttribute("aria-pressed", String(button === chip)),
        );
      $("#support-input-status").textContent = active()
        ? t(
            "问题已暂存，会话恢复后即可发送。",
            "Question saved. Send it when the connection returns.",
          )
        : t(
            "问题已填入，点击右侧箭头发送。",
            "Question selected. Use the arrow to send it.",
          );
      state().drafts[currentMode()] = value;
      save();
      if (!active()) $("#support-input").focus({ preventScroll: true });
    });
    document.addEventListener("input", (event) => {
      if (event.target.id !== "support-input" || !currentMode()) return;
      state().drafts[currentMode()] = event.target.value.slice(0, 280);
      save();
    });
    document.addEventListener("keydown", (event) => {
      if (
        event.target.id === "support-input" &&
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.isComposing
      ) {
        event.preventDefault();
        send();
      }
    });
    document.addEventListener("submit", (event) => {
      if (event.target.id === "support-chat-form") {
        event.preventDefault();
        send();
      }
    });
    return { open, canAccept, detach, onDocumentChange };
  }
  return { fresh, hydrate, create };
})();
