/* Optional last transmission and management profiles. Everything stays local. */
window.StillwaterAfterword = (() => {
  "use strict";
  const fresh = () => ({ stage: "none", heard: 0 });
  function hydrate(raw) {
    const heard = Number.isInteger(raw?.heard)
      ? Math.max(0, Math.min(6, raw.heard))
      : 0;
    return {
      stage:
        raw?.stage === "letter" && heard === 6
          ? "letter"
          : raw?.stage === "voices"
            ? "voices"
            : "none",
      heard,
    };
  }
  function create(api) {
    const { getState, save, show, escape } = api;
    const zh = document.documentElement.lang === "zh-CN";
    const t = (a, b) => (zh ? a : b);
    const state = () => getState().afterword;
    const $ = (selector) => document.querySelector(selector);
    let screen,
      audio,
      captionTimer,
      running = false,
      generation = 0,
      previousFocus;
    function management() {
      show(
        t("酒店管理团队", "Hotel management"),
        `<section class="management-profiles" data-puzzle-original><p class="document-intro">${t("从客房维护到夜间服务，我们的团队负责酒店的日常运营。以下为酒店创办人及主要管理人员介绍。", "From room maintenance to overnight service, our team looks after the hotel’s daily operation. Meet our founders and department leads.")}</p>${[
          [
            "WV",
            t("沃尔特·维尔", "Walter Vale"),
            t("联合创办人 · 物业运营", "Co-founder · Property operations"),
            t(
              "1987 年与妻子共同创办静水旅馆，负责建筑维护和设备管理。前台的铜钟是他为开业挑选的。",
              "Founded Stillwater with his wife in 1987, overseeing the building and its equipment. He chose the brass reception clock for opening night.",
            ),
          ],
          [
            "EV",
            t("埃莉诺·维尔", "Eleanor Vale"),
            t("联合创办人 · 宾客服务", "Co-founder · Guest services"),
            t(
              "参与制定客房服务标准，也负责早年的住客登记。她保留下来的登记簿和信件，现收录于酒店历史资料中。",
              "Helped establish the room service standards and kept the early guest registers. Her surviving books and letters are held in the hotel collection.",
            ),
          ],
          [
            "NB",
            t("诺拉·贝尔", "Nora Bell"),
            t("运营经理", "Operations manager"),
            t(
              "协调客房、餐饮与前台工作，负责员工培训及日常服务安排。如对住宿服务有建议，可通过前台转交。",
              "Coordinates rooms, dining and reception, including staff training and daily service arrangements. Reception can pass on feedback about your stay.",
            ),
          ],
          [
            "R",
            t("里德", "Reed"),
            t(
              "夜班主管 · 招聘与交接",
              "Night supervisor · Recruitment & handover",
            ),
            t(
              "负责夜间招聘、值班安排和监控室交接。他很在意时间，习惯在每次谈话前核对墙上的钟。新员工若不确定入职日期、报到时间或班次起止时间，可以直接向他确认。",
              "Handles overnight recruitment, rotas and surveillance handovers. He is particular about time and checks the wall clock before every conversation. New starters can ask him about their start date, arrival time or shift hours.",
            ),
          ],
        ]
          .map(
            ([initial, name, role, text]) =>
              `<article><span class="management-monogram" aria-hidden="true">${initial}</span><div><p class="eyebrow">${role}</p><h3>${name}</h3><p>${text}</p></div></article>`,
          )
          .join(
            "",
          )}<button class="button" data-action="contact-supervisor">${t("联系夜班主管", "Contact the night supervisor")} →</button></section>`,
        t("关于酒店 / 管理团队", "ABOUT THE HOTEL / OUR TEAM"),
      );
    }
    function stop() {
      generation++;
      running = false;
      clearTimeout(captionTimer);
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        audio = null;
      }
    }
    function close() {
      stop();
      if (screen?.open) screen.close();
      screen?.remove();
      screen = null;
      previousFocus?.isConnected &&
        previousFocus.focus({ preventScroll: true });
    }
    function controls() {
      return `<div class="afterword-tools"><button type="button" data-afterword-pause>${t("暂停", "Pause")}</button><button type="button" data-afterword-captions>${t("改用字幕", "Use captions")}</button><button type="button" data-afterword-close>${t("返回酒店", "Return to hotel")}</button></div>`;
    }
    function renderVoice() {
      screen.className = "afterword-screen afterword-black";
      screen.setAttribute(
        "aria-label",
        t("最后的求救录音", "The last distress recording"),
      );
      screen.innerHTML = `<section class="afterword-voice" data-puzzle-original><div id="afterword-start"><p>${t("一段未播放的语音", "An unplayed voice message")}</p><button type="button" data-afterword-play>${t("播放语音", "Play recording")}</button><button type="button" data-afterword-captions>${t("仅看字幕", "Captions only")}</button></div><p id="afterword-caption" role="status" aria-live="polite"></p><span id="afterword-count" class="support-sr-only"></span><form id="afterword-answer" hidden><label for="afterword-input">${t("回应他。", "Answer him.")}</label><input id="afterword-input" name="answer" maxlength="40" autocomplete="off" spellcheck="false" autocapitalize="none" placeholder="…" required><button type="submit">${t("发送", "Send")} →</button><p id="afterword-error" role="status"></p><button type="button" data-afterword-hint>${t("提示", "Hint")}</button></form>${controls()}</section>`;
      $("[data-afterword-pause]").hidden = true;
      if (state().heard === 6) unlock();
    }
    function unlock() {
      stop();
      screen.classList.remove("audio-only");
      $("#afterword-start").hidden = true;
      $("#afterword-caption").textContent = "help me";
      $("#afterword-answer").hidden = false;
      $("[data-afterword-pause]").hidden = true;
      screen
        .querySelectorAll("[data-afterword-captions]")
        .forEach((button) => (button.hidden = true));
      $("#afterword-input").focus({ preventScroll: true });
    }
    function countVoice() {
      state().heard = Math.min(6, state().heard + 1);
      save();
      $("#afterword-count").textContent = t(
        `已听到 ${state().heard} 次。`,
        `${state().heard} calls received.`,
      );
      if (state().heard === 6) unlock();
    }
    function play(captions = false) {
      if (!screen?.open || state().heard >= 6) return;
      stop();
      const token = generation;
      running = true;
      screen.classList.toggle("audio-only", !captions);
      $("#afterword-start").hidden = true;
      $("[data-afterword-pause]").hidden = false;
      const next = () => {
        if (!running || generation !== token || !screen?.open) return;
        $("#afterword-caption").textContent = "help me";
        if (captions) {
          captionTimer = setTimeout(() => {
            if (generation !== token) return;
            countVoice();
            if (state().heard < 6) {
              $("#afterword-caption").textContent = "";
              captionTimer = setTimeout(next, 700);
            }
          }, 2300);
          return;
        }
        audio = new Audio("assets/dylan-help.mp3?v=3.6.0");
        audio.volume = 0.65;
        audio.addEventListener(
          "ended",
          () => {
            if (generation !== token || !running) return;
            countVoice();
            if (state().heard < 6) {
              $("#afterword-caption").textContent = "";
              captionTimer = setTimeout(next, 700 + (state().heard % 3) * 180);
            }
          },
          { once: true },
        );
        let failed = false;
        const fail = () => {
          if (failed || generation !== token || !screen?.open) return;
          failed = true;
          stop();
          $("#afterword-start").hidden = false;
          $("#afterword-start p").textContent = t(
            "语音未能播放，可以重试或改用字幕。",
            "The recording could not play. Retry or use captions.",
          );
          $("[data-afterword-pause]").hidden = true;
        };
        audio.addEventListener("error", fail, { once: true });
        audio.play().catch(fail);
      };
      next();
    }
    function letter() {
      stop();
      screen.className = "afterword-screen afterword-mail";
      screen.setAttribute(
        "aria-label",
        t("收件箱 · 迪伦的警告", "Inbox · Dylan’s warning"),
      );
      screen.innerHTML = `<section class="warning-mail" data-puzzle-original><header><strong>STILLMAIL<span> / ${t("邮件", "MAIL")}</span></strong><span class="mail-account">${t("本地存档", "LOCAL ARCHIVE")}</span><button type="button" data-afterword-close>${t("关闭", "Close")} ×</button></header><div class="mail-layout"><aside><p class="mail-folder-selected">${t("收件箱", "Inbox")} <b>1</b></p><p>${t("已发送", "Sent")}</p><p>${t("草稿", "Drafts")} <span>0</span></p><p class="mail-offline">${t("离线邮件副本", "Offline message copy")}</p></aside><main class="mail-reader"><div class="mail-toolbar"><span>← &nbsp; ${t("收件箱", "Inbox")}</span><span>1 / 1</span></div><article><p class="mail-tag">${t("刚刚收到", "JUST RECEIVED")}</p><h1>${t("请不要再回答他", "Do not answer him again")}</h1><div class="mail-sender"><span class="mail-avatar">D</span><div><strong>${t("迪伦·哈克", "Dylan Harker")}</strong><span>&lt;d.harker@stillwater.invalid&gt;</span><small>${t("收件人：", "To: ")}${escape(getState().name || t("求职者", "Applicant"))}</small></div><time>04:04</time></div><div class="mail-body"><p>${t("如果这封信能出现在你的收件箱里，就说明你听见了那段录音。", "If this letter has reached your inbox, you heard the recording.")}</p><p>${t("我把求救录了六遍。前五遍，它会拿去学我的声音。只有最后一遍是我留给你的。", "I recorded the call six times. It uses the first five to learn my voice. The last one is the one I left for you.")}</p><p>${t("你可能已经走出了酒店。先别回头，也别接那个没有号码的来电。如果有人自称里德，说你的班还没交完，让他等。真正的主管不会在 04:04 找你。", "You may already be outside the hotel. Do not look back or answer a call with no number. If someone says he is Reed and your shift is not finished, let him wait. The real supervisor will not contact you at 04:04.")}</p><p>${t("它问你几点到、几点走，是为了知道该在哪里等你。不要再告诉它新的时间。它说要你付出代价的时候，说的不是钱。", "It asks when you arrive and when you leave so it knows where to wait. Do not give it another time. When it says you will pay, it does not mean money.")}</p><p>${t("还有一件事：如果你又收到我的求救，不要回信。我留下的信息到这里就结束了。后面那个知道我名字的东西，已经不是我。", "One more thing: if another plea arrives in my name, do not reply. This is the last message I left. Whatever knows my name after this is not me.")}</p><p>${t("把网页关掉。今晚别再找工作了。", "Close the page. Do not look for another job tonight.")}</p><p class="mail-signature">${t("迪伦·哈克", "Dylan Harker")}<br><small>${t("最后一封 · 不要回复", "Last message · Do not reply")}</small></p></div><footer><span>${t("此邮件无法回复。", "Replies are unavailable for this message.")}</span><button type="button" data-afterword-close>${t("收好这封信", "Keep this letter")}</button></footer></article></main></div></section>`;
      screen.scrollTop = 0;
      const entry = document.querySelector('[data-action="afterword-open"]');
      if (entry) {
        entry.textContent = t("查看迪伦的来信 →", "Read Dylan’s letter →");
        document.querySelector(".afterword-invitation p").textContent = t(
          "迪伦的来信已保存。",
          "Dylan’s letter is saved.",
        );
      }
    }
    function open() {
      if (getState().chapter !== 3) return;
      close();
      previousFocus = document.activeElement;
      screen = document.createElement("dialog");
      screen.id = "afterword-screen";
      screen.setAttribute("data-puzzle-original", "");
      document.body.append(screen);
      screen.addEventListener("cancel", (event) => {
        event.preventDefault();
        close();
      });
      screen.addEventListener("click", (event) => {
        if (event.target.closest("[data-afterword-close]")) close();
        else if (event.target.closest("[data-afterword-play]")) play();
        else if (event.target.closest("[data-afterword-captions]")) play(true);
        else if (event.target.closest("[data-afterword-pause]")) {
          stop();
          $("#afterword-start").hidden = false;
          $("[data-afterword-pause]").hidden = true;
        } else if (event.target.closest("[data-afterword-hint]"))
          $("#afterword-error").textContent = t(
            "输入录音里重复的两个英文单词，中间留一个空格。",
            "Enter the two words repeated in the recording, separated by a space.",
          );
      });
      screen.addEventListener("submit", (event) => {
        if (event.target.id !== "afterword-answer") return;
        event.preventDefault();
        if (state().heard !== 6) return;
        if (
          event.target.elements.answer.value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ") !== "help me"
        ) {
          $("#afterword-error").textContent = t(
            "信号没有回应。把听到的话原样发回去。",
            "No reply. Send back the words you heard.",
          );
          return;
        }
        state().stage = "letter";
        save();
        letter();
      });
      if (state().stage === "letter") letter();
      else {
        state().stage = "voices";
        save();
        renderVoice();
      }
      screen.showModal();
    }
    function decorate(route) {
      if (route === "history")
        $("#page-content").insertAdjacentHTML(
          "beforeend",
          `<section class="management-intro" data-puzzle-original><div><p class="eyebrow">${t("关于酒店", "ABOUT THE HOTEL")}</p><h2>${t("认识我们的管理团队", "Meet our management team")}</h2><p>${t("了解酒店创办人，以及负责日常运营和夜间服务的管理人员。", "Meet the founders and the people responsible for day-to-day and overnight operations.")}</p></div><button class="button button-secondary" data-action="management">${t("查看团队介绍", "Meet the team")} →</button></section>`,
        );
      if (route === "home")
        $(".side-story-board article")?.insertAdjacentHTML(
          "beforeend",
          `<p data-puzzle-original><button class="underlined" data-action="management">${t("了解管理团队", "Meet our management team")} →</button></p>`,
        );
      if (route === "below" && getState().chapter === 3)
        $(".epilogue .inline-actions")?.insertAdjacentHTML(
          "beforebegin",
          `<section class="afterword-invitation" data-puzzle-original><p>${state().stage === "letter" ? t("迪伦的来信已保存。", "Dylan’s letter is saved.") : t("你的收件箱里，还有一条未读消息。", "There is still one unread message in your inbox.")}</p><button class="button" data-action="afterword-open">${state().stage === "letter" ? t("查看迪伦的来信", "Read Dylan’s letter") : t("收听最后一段录音", "Play the last recording")} →</button></section>`,
        );
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && running && screen?.open) {
        stop();
        $("#afterword-start").hidden = false;
        $("[data-afterword-pause]").hidden = true;
      }
    });
    window.addEventListener("hashchange", () => {
      if (screen?.open && location.hash !== "#below") close();
    });
    return {
      open,
      close,
      decorate,
      actions: { management, "afterword-open": open },
    };
  }
  return { fresh, hydrate, create };
})();
