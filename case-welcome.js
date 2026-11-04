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
          "声音暂时未能开启。之后可在底部菜单重试，静音也能通关。",
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
      screen.innerHTML = `<header class="welcome-heading"><div><p class="welcome-eyebrow">STILLWATER HOTEL</p><h1 id="welcome-title" tabindex="-1">${t("游玩前说明", "Before you begin")}</h1></div><a data-welcome-language href="${document.documentElement.lang === "zh-CN" ? "index.html" : "index-zh.html"}${location.search}${location.hash}">${t("English", "简体中文")}</a></header><form><div class="welcome-content"><p class="welcome-fiction">${t("本作是虚构的网页恐怖解谜游戏。论坛、招聘、酒店和人物均为虚构，聊天及网站故障也属于剧情。", "This is a fictional web horror mystery. Its forum, jobs, hotel, characters, messages and website faults are part of the story, not real services.")}</p><section class="welcome-notice"><h2>${t("内容注意事项", "Content notes")}</h2><p>${t("游戏含突脸、人影、画面扭曲和呼吸声，剧情涉及失踪与死亡。建议先调低音量；如感到不适，可随时暂停或关闭网页。", "Contains sudden close-up faces, unsettling figures, distorted pictures, breathing and story references to disappearance and death. Start with a low volume. Take a break or close the page whenever you need.")}</p><p>${t("关闭鬼脸或音效也能完成全部剧情和解谜。游戏不使用快速频闪，并遵循设备的“减少动态效果”设置。", "Faces and sound can be disabled without losing any story or puzzles. There is no rapid flashing, and your device’s reduced-motion setting is respected.")}</p></section><section class="welcome-options"><h2>${t("选择游玩设置", "Choose your settings")}</h2><label><input type="checkbox" name="sound" ${p.sound || soundDraft ? "checked" : ""}><span><strong>${t("开启声音", "Enable sound")}</strong><small>${t("默认关闭。勾选并进入游戏后，会开启聊天提示音和后续背景音；可随时在“声音与设置”中调整。", "Off by default. Includes chat notifications and later ambience. Starts when you enter with this checked; adjust it later in Sound & settings.")}</small></span></label><label><input type="checkbox" name="faces" ${p.skipScares ? "" : "checked"}><span><strong>${t("显示鬼脸与 Jump Scare", "Show faces & jump scares")}</strong><small>${t("默认开启。取消勾选会跳过突脸，不影响剧情和通关。", "On by default. Uncheck to skip close-up scares without changing the story or completion.")}</small></span></label>${comfort.reduced() ? `<p class="welcome-motion-note">${t("设备已开启“减少动态效果”，因此突脸仍会跳过。此项以设备设置为准，可在浏览设置中查看。", "Reduced Motion is active: sudden faces are skipped even when checked. View this in settings; device preferences take priority.")}</p>` : ""}</section><section><h2>${t("基础操作与存档", "Controls & saves")}</h2><ul><li>${t("电脑用鼠标，手机直接点按。群聊中按 Enter 发送，Shift + Enter 换行，论坛卡片可直接打开。网页里的链接和文件引用都能点；设备页面也可使用场景旁的同名按钮。", "Click on a computer or tap on a phone. Type freely in chat: Enter sends, Shift + Enter adds a line. Your friend’s forum card opens the post. Follow links, reviews and document references. Equipment can be operated through the scene or its matching labelled buttons.")}</li><li>${t("进度保存在当前浏览器，不会自动同步到其他设备或浏览器。清除网站数据也会清掉存档。", "Progress is saved in this browser, without automatic syncing to another device or browser. Clearing site data also clears the save.")}</li><li>${t("重新开始：打开“存档与重置”，选择“重新开始游戏”并确认。声音和鬼脸选项可在“声音与设置”里调整。", "To restart, open Saves & reset, choose Restart game and confirm. Sound and face options are in Sound & settings.")}</li></ul></section><details class="welcome-sources"><summary>${t("图片来源与素材说明", "Image sources & asset notes")}</summary><p>${t("酒店和广告页使用实拍照片，真实场所、人物及摄影师与剧情无关。展示照片经过低清处理，原图和许可保留。监控场景由程序绘制，部分恐怖人像为生成插图。背景音乐使用 CC0 音源，提示音及部分环境音由浏览器合成。", "Hotel and shop photographs depict real places; those places, people and photographers are not involved in or sponsors of the fiction. Low-resolution display copies retain the originals and licences. Camera spaces are rendered in code, some horror portraits are existing generated illustrations. Music uses CC0 recordings; notification sounds and some environmental effects are synthesized locally.")}</p><p>${t("W3-02 宣传照为本作新建的虚构生成场景，素材记录可在宣传资料的“图片详情”中查看。", "The W3-02 publicity print is a new generated fictional scene. Its artwork record is linked under Image details in the publicity archive.")}</p>${getCredits()}</details><p class="welcome-privacy">${t("酒店预订查询、应聘样本和住客留言均为本地模拟，无需填写真实姓名、电话、简历或支付信息。", "Hotel booking searches, job samples and guestbook forms are simulated locally. They do not need real names, phone numbers, CVs or payment details.")}</p></div><footer class="welcome-footer"><p>${t("之后可通过“游玩说明”重新查看本页。", "You can reopen this page from How to play.")}</p><button type="submit" data-welcome="enter">${t("我已了解，进入游戏", "Understood · Enter game")} →</button></footer></form>`;
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
