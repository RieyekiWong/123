/* New-edition introduction. Only preference/acknowledgement data lives here. */
globalThis.StillwaterWelcome = {
  create({ getState, save, comfort, getCredits, onOpen, onContinue, t }) {
    const KEY = "stillwater-case-intro:v1";
    let screen = null,
      read = false,
      soundDraft = false,
      mandatory = false,
      previousFocus = null;
    try {
      const stored = JSON.parse(localStorage.getItem(KEY));
      read = stored?.schema === 1 && stored.read === true;
      soundDraft = !read && stored?.sound === true;
    } catch {}
    const store = () => {
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({ schema: 1, read, sound: soundDraft }),
        );
      } catch {}
    };
    function close() {
      screen?.close();
      screen?.remove();
      screen = null;
      document.body.classList.remove("welcome-open");
      onContinue();
      (previousFocus?.isConnected
        ? previousFocus
        : document.querySelector("#content")
      )?.focus({ preventScroll: true });
    }
    async function enter() {
      const form = screen?.querySelector("form");
      if (!form || form.dataset.busy) return;
      form.dataset.busy = "true";
      const wantsSound = form.elements.sound.checked,
        p = getState().preferences;
      p.skipScares = !form.elements.faces.checked;
      p.scareChoiceMade = true;
      form.querySelector("button[type=submit]").disabled = true;
      // Called directly from the user's submit gesture; no autoplay permission bypass.
      if (wantsSound !== p.sound) await comfort.toggleSound();
      save();
      read = true;
      soundDraft = false;
      store();
      close();
      if (wantsSound && !p.sound)
        document.querySelector("#case-status").textContent = t(
          "浏览器未能开启音效。可在页面底部再次开启，静音也能通关。",
          "Audio could not start. Try the footer sound control; all puzzles remain playable silently.",
        );
    }
    function open(options = {}) {
      if (screen?.open) return;
      mandatory = options.mandatory === true;
      previousFocus = document.activeElement;
      onOpen();
      const p = getState().preferences;
      screen = document.createElement("dialog");
      screen.id = "case-welcome";
      screen.setAttribute("aria-labelledby", "welcome-title");
      screen.innerHTML = `<header class="welcome-heading"><div><p class="welcome-eyebrow">STILLWATER HOTEL</p><h1 id="welcome-title" tabindex="-1">${t("游玩前说明", "Before you begin")}</h1></div><a data-welcome-language href="${document.documentElement.lang === "zh-CN" ? "index.html" : "index-zh.html"}${location.search}${location.hash}">${t("English", "简体中文")}</a></header><form><div class="welcome-content"><p class="welcome-fiction">${t("这是一款虚构的网页恐怖解谜游戏。论坛、招聘、酒店、人物、聊天和网站故障都是剧情，不是真实服务。", "This is a fictional web horror mystery. Its forum, jobs, hotel, characters, messages and website faults are part of the story, not real services.")}</p><section class="welcome-notice"><h2>${t("内容注意事项", "Content notes")}</h2><p>${t("含突然出现的鬼脸、异常人影、画面扭曲、呼吸声，以及涉及失踪与死亡的剧情。建议先调低音量；感到不适时，可随时暂停或关闭网页。", "Contains sudden close-up faces, unsettling figures, distorted pictures, breathing and story references to disappearance and death. Start with a low volume. Take a break or close the page whenever you need.")}</p><p>${t("可以关闭鬼脸和音效，仍能完成全部剧情与解谜。游戏不使用快速频闪；系统的“减少动态效果”设置也会生效。", "Faces and sound can be disabled without losing any story or puzzles. There is no rapid flashing, and your device’s reduced-motion setting is respected.")}</p></section><section class="welcome-options"><h2>${t("选择游玩设置", "Choose your settings")}</h2><label><input type="checkbox" name="sound" ${p.sound || soundDraft ? "checked" : ""}><span><strong>${t("开启音效", "Enable sound")}</strong><small>${t("默认关闭。勾选后，点击进入游戏才会启用；之后可在底部菜单调整。", "Off by default. Starts when you enter with this checked; adjust it later in the footer.")}</small></span></label><label><input type="checkbox" name="faces" ${p.skipScares ? "" : "checked"}><span><strong>${t("显示鬼脸与 Jump Scare", "Show faces & jump scares")}</strong><small>${t("默认开启。取消勾选会跳过突脸，不影响剧情和通关。", "On by default. Uncheck to skip close-up scares without changing the story or completion.")}</small></span></label>${comfort.reduced() ? `<p class="welcome-motion-note">${t("当前正在减少动态效果：即使勾选鬼脸，突脸仍会跳过。可在浏览设置中查看；设备设置始终优先。", "Reduced Motion is active: sudden faces are skipped even when checked. View this in settings; device preferences take priority.")}</p>` : ""}</section><section><h2>${t("基础操作与存档", "Controls & saves")}</h2><ul><li>${t("电脑用鼠标点击，手机直接点按。群聊可自由输入，Enter 发送，Shift + Enter 换行；朋友发的论坛卡片可以直接打开。链接、留言和档案中的引用都可以继续调查；设备页面可点击场景或旁边的同名按钮。", "Click on a computer or tap on a phone. Type freely in chat: Enter sends, Shift + Enter adds a line. Your friend’s forum card opens the post. Follow links, reviews and document references. Equipment can be operated through the scene or its matching labelled buttons.")}</li><li>${t("进度自动保存在当前浏览器。换设备、换浏览器或清除网站数据后，存档不会自动转移。", "Progress saves in this browser. It does not transfer when you change devices or browsers, or clear site data.")}</li><li>${t("重新开始：顶部“存档与重置”→“重新开始游戏”→确认。声音和鬼脸设置可在“声音与设置”里随时修改。", "To restart: Saves & reset → Start the game again → Confirm. Sound & settings lets you change sound and scare preferences at any time.")}</li></ul></section><details class="welcome-sources"><summary>${t("图片来源与素材说明", "Image sources & asset notes")}</summary><p>${t("酒店与广告使用现成实拍照片；现实场所、人物和摄影师不参与或代言剧情。显示副本经过低清处理，原图与许可保留。监控空间由程序绘制，部分恐怖人像为已有的生成插图，环境音由浏览器本地合成。", "Hotel and shop photographs depict real places; those places, people and photographers are not involved in or sponsors of the fiction. Low-resolution display copies retain the originals and licences. Camera spaces are rendered in code, some horror portraits are existing generated illustrations, and ambient audio is synthesized locally in the browser.")}</p>${getCredits()}</details><p class="welcome-privacy">${t("无需真实姓名、电话、简历或支付信息。页面中的预订、应聘和留言均为本地模拟。", "No real name, phone number, CV or payment details are needed. Reservations, applications and messages are local simulations.")}</p></div><footer class="welcome-footer"><p>${t("阅读后即可进入。之后可从顶部“游玩说明”重新打开本页。", "Continue when ready. Reopen this page through How to play in the header.")}</p><button type="submit" data-welcome="enter">${t("我已了解，进入游戏", "Understood · Enter game")} →</button></footer></form>`;
      document.body.append(screen);
      document.body.classList.add("welcome-open");
      screen.addEventListener("submit", (event) => {
        event.preventDefault();
        void enter();
      });
      screen.addEventListener("change", () => {
        const form = screen.querySelector("form");
        getState().preferences.skipScares = !form.elements.faces.checked;
        getState().preferences.scareChoiceMade = true;
        soundDraft = form.elements.sound.checked;
        save();
        store();
      });
      screen.addEventListener("cancel", (event) => {
        event.preventDefault();
        if (!mandatory) close();
      });
      screen.showModal();
      screen.querySelector("#welcome-title").focus({ preventScroll: true });
      screen.scrollTop = 0;
    }
    function forget() {
      read = false;
      soundDraft = false;
      try {
        localStorage.removeItem(KEY);
      } catch {}
    }
    return {
      open,
      forget,
      isOpen: () => screen?.open === true,
      start: () => {
        if (!read) open({ mandatory: true });
      },
    };
  },
};
