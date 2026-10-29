/* A spoiler-free first-visit guide. Acknowledging it never changes story saves. */
(() => {
  "use strict";
  const KEY = "stillwater-instructions:v1";
  const zh = document.documentElement.lang === "zh-CN";
  const t = (a, b) => (zh ? a : b);
  let screen,
    previousFocus,
    seen = false;
  try {
    seen = localStorage.getItem(KEY) === "read";
  } catch {
    /* Session play is still available. */
  }
  const settings = () => window.StillwaterPlayerSettings;
  const photographs = [
    [
      "lobby.jpg",
      "Lobby_Stanley_Lodge_Estes_Park_Colorado_2024.jpg",
      "Larry D. Moore",
      "4.0",
      "by",
    ],
    [
      "hallway.jpg",
      "Corridor_Stanley_Hotel_Estes_Park_Colorado_2024.jpg",
      "Larry D. Moore",
      "4.0",
      "by",
    ],
    [
      "guestroom.jpg",
      "Room_Stanley_Hotel_Estes_Park_Colorado_2024.jpg",
      "Larry D. Moore",
      "4.0",
      "by",
    ],
    [
      "twin.jpg",
      "Deluxe_Room_-_Twin_beds.jpg",
      "Holidayinnklg",
      "3.0",
      "by-sa",
    ],
    [
      "suite.jpg",
      "Hotel_Room_Chicago_Hilton2.jpg",
      "Michael Gray",
      "2.0",
      "by-sa",
    ],
  ];
  function updatePreferences() {
    const music = screen.querySelector('[data-instructions="music"]');
    music.textContent = settings()?.musicEnabled()
      ? t("官网音乐：开启", "Hotel music: on")
      : t("官网音乐：关闭", "Hotel music: off");
    music.setAttribute(
      "aria-pressed",
      String(settings()?.musicEnabled() === true),
    );
    const sound = screen.querySelector('[data-instructions="sound"]');
    const scares = screen.querySelector('[data-instructions="scares"]');
    const soundOn = settings()?.soundEnabled() === true;
    const scaresOn = settings()?.scaresEnabled() !== false;
    sound.textContent = soundOn
      ? t("环境音：开启", "Ambient sound: on")
      : t("环境音：关闭", "Ambient sound: off");
    sound.setAttribute("aria-pressed", String(soundOn));
    scares.textContent = scaresOn
      ? t("突发惊吓画面：开启", "Sudden visual effects: on")
      : t("突发惊吓画面：关闭", "Sudden visual effects: off");
    scares.setAttribute("aria-pressed", String(scaresOn));
  }
  function enter() {
    seen = true;
    try {
      localStorage.setItem(KEY, "read");
    } catch {
      /* Do not require storage to continue. */
    }
    if (new URLSearchParams(location.search).has("instructions")) {
      try {
        const url = new URL(location.href);
        url.searchParams.delete("instructions");
        history.replaceState(history.state, "", url.href);
      } catch {
        /* File-based play may restrict history changes. */
      }
    }
    document.body.classList.remove("instructions-open");
    screen?.close();
    screen?.remove();
    screen = null;
    if (previousFocus?.isConnected)
      previousFocus.focus({ preventScroll: true });
    else
      document
        .querySelector("#career-scene h1, #page-content")
        ?.focus({ preventScroll: true });
  }
  function open() {
    if (screen?.open) return;
    previousFocus = document.activeElement;
    screen = document.createElement("dialog");
    screen.id = "game-instructions";
    screen.setAttribute("data-puzzle-original", "");
    screen.setAttribute("aria-labelledby", "instructions-title");
    screen.innerHTML = `<div class="instructions-shell"><header class="instructions-header"><a class="instructions-brand" href="#" data-instructions="top"><span aria-hidden="true">S</span><strong>${t("静水旅馆", "THE STILLWATER HOTEL")}<small>${t("网页互动恐怖解谜游戏", "AN INTERACTIVE WEB MYSTERY")}</small></strong></a><a class="instructions-language" href="${zh ? "index.html" : "index-zh.html"}">${zh ? "English" : "简体中文"}</a></header><div class="instructions-content"><div class="instructions-opening"><p class="instructions-eyebrow">${t("游玩前请阅读", "BEFORE YOU BEGIN")}</p><h1 id="instructions-title" tabindex="-1">${t("开始之前，先读这里。", "A few things before you begin.")}</h1><p>${t("你刚结束上一份工作，打开了招聘网站，想找一份提供住宿的酒店岗位。这场求职，会把你带到静水旅馆。", "Your last job has ended. You open a recruitment website, looking for a hotel role with accommodation. The search will lead you to Stillwater.")}</p><p class="instructions-fiction">${t("这是一款虚构的网页恐怖解谜游戏。招聘、酒店、人物、聊天和网站故障均为剧情，不是真实服务。", "This is a fictional horror puzzle game. Its recruitment service, hotel, characters, conversations and website faults are part of the story.")}</p></div><section class="instructions-warning" aria-labelledby="instructions-warning-title"><span class="instructions-section-number">01</span><div><h2 id="instructions-warning-title">${t("注意事项", "Content & comfort")}</h2><p>${t("游戏含突发人脸、异常人影、页面变色、求救声，以及涉及死亡和自杀的剧情文字。建议先调低音量；感到不适时，可以随时暂停或关闭网页。", "Contains sudden faces, unsettling figures, changes to the site’s colours, distress calls, and story references to death and suicide. Start at a low volume and take a break or close the page whenever you need.")}</p><p>${t("可关闭突发惊吓画面，不影响解谜。游戏没有快速频闪；系统的“减少动态效果”设置同样有效。", "Sudden visual effects can be switched off without losing any puzzles. There is no rapid flashing; your device’s reduced-motion setting is respected.")}</p><button type="button" data-instructions="scares" aria-pressed="true"></button></div></section><div class="instructions-columns"><section><p class="instructions-eyebrow">02 / ${t("基础操作", "CONTROLS")}</p><h2>${t("像浏览网站一样探索", "Explore it like a website")}</h2><ul><li>${t("电脑用鼠标点击，手机直接点按。链接、按钮、留言及资料中的文字，都可能带你找到新的信息。", "Click with a mouse or tap on your phone. Links, buttons, reviews and documents can lead to new information.")}</li><li>${t("资料窗口左上角的“返回”可回到上一份资料；右上角 × 或电脑 Esc 键可关闭窗口。", "Use Back at the top left of a document to return to the previous one. The × at the top right, or Escape on a keyboard, closes it.")}</li><li>${t("发现线索后，点击资料里的记录按钮。已保存内容可在右下角“住客笔记”查看，仅仅读过不会自动记入。", "Use a document’s record button to keep a clue. Review saved discoveries in the notebook at the bottom right; reading alone does not record them.")}</li><li>${t("客服聊天中，先点输入框上方的关键词，再点 ↑ 发送；也可直接输入。电脑 Enter 发送，Shift + Enter 换行。", "In support chat, choose a keyword above the box, then press ↑ to send, or type your own message. Enter sends; Shift + Enter adds a line.")}</li><li>${t("所有谜题线索都在游戏内。不需要查看网页源代码，也不需要联系现实中的酒店或任何人。遇到困难时，可展开谜题里的提示。", "All puzzle clues are inside the game. No source-code inspection or contact with real hotels or people is needed. Optional puzzle hints are available when you get stuck.")}</li></ul></section><section><p class="instructions-eyebrow">03 / ${t("声音设置", "AUDIO")}</p><h2>${t("音乐与环境音", "Music & ambient sound")}</h2><p>${t("环境音默认关闭，可以在下方开启。进入酒店后，也可在页脚“网站说明”中点击“环境音：关闭”切换。重新打开网页后，需要再次手动开启。", "Ambient sound is off by default. Enable it below, or later in Site Information in the hotel footer. Reopening the page leaves it off until you enable it again.")}</p><p>${t("官网音乐默认开启，第一阶段进入酒店官网 10 秒后会逐渐播放，按《等着你回来》《期待》《今晚且流连》的顺序播放。出现异常或进入后续剧情后停止。播放器在电脑侧栏、手机底部单独显示，不遮盖游戏。点击“收起”会暂停，展开后继续。本功能需要能访问 YouTube；浏览器阻止自动播放时，请点击播放器的播放按钮。", "The first-phase hotel site starts its music after ten seconds, in the order Waiting for You to Return, Expectation, and Stay Tonight. It stops when the story turns. A separate YouTube area sits beside the game on desktop and below it on mobile. Collapsing pauses playback; expand to resume. YouTube access is required; tap Play if your browser blocks automatic playback.")}</p><button type="button" data-instructions="music" aria-pressed="true"></button><button type="button" data-instructions="sound" aria-pressed="false"></button><p class="instructions-note">${t("剧情录音需单独点击“播放语音”，也提供字幕。不打开声音，仍能完成全部谜题。", "Story recordings have their own Play recording button and a captions option. Every puzzle can be completed without sound.")}</p><p class="instructions-status" id="instructions-audio-status" role="status"></p><p class="instructions-eyebrow instructions-saving-label">04 / ${t("存档与重置", "SAVES & RESET")}</p><h2>${t("进度保存在当前浏览器", "Your progress stays in this browser")}</h2><p>${t("游戏会自动保存已记录的线索、入住信息与剧情进度。更换设备、浏览器或清除网站数据后，原存档不会随之转移；请尽量使用同一个浏览器继续。", "Recorded clues, registration and story progress save automatically. Saves do not transfer to another device or browser, and clearing site data removes them. Continue in the same browser when possible.")}</p><ol><li>${t("重置酒店进度：进入酒店后，在页脚打开“网站说明”，选择“重新开始 / 清除本设备的剧情进度”。", "To reset hotel progress, open Site Information in the hotel footer and select Start over / clear this device’s story progress.")}</li><li>${t("再次点击“清除进度并重新开始”确认。这会清除全部酒店支线、谜题和结局记录，无法撤销。", "Confirm with Clear progress & begin again. This removes the hotel side stories, puzzles and ending records and cannot be undone.")}</li><li>${t("想从求职开场重新玩，再点击页脚“重看求职开场”。单独使用这个按钮只会重置求职申请，不会清除酒店存档。", "To return to the very start, then choose Replay the job search in the footer. Using that button on its own resets applications while keeping hotel progress.")}</li></ol></section></div><details class="instructions-credits"><summary><span>05 / ${t("图片与声音来源", "IMAGE & AUDIO CREDITS")}</span><strong>${t("查看素材来源及授权", "View sources & licences")} <span aria-hidden="true">＋</span></strong></summary><div><p>${t("酒店场景使用 Wikimedia Commons 上的真实酒店照片，仅用作虚构故事背景。现实酒店、员工及摄影师与本游戏剧情无关。照片可能经过页面裁切、调暗和色彩滤镜处理。", "Hotel scenery uses real photographs from Wikimedia Commons as settings for fiction. The real hotels, their employees and the photographers are not involved in the story. On-screen cropping, darkening and colour filters may be applied.")}</p><ul>${photographs.map(([file, source, author, version, license]) => `<li><strong>${file}</strong> · ${author}<br><a href="https://commons.wikimedia.org/wiki/File:${source}" target="_blank" rel="noopener noreferrer">${t("原始照片", "Original photograph")} ↗</a> · <a href="https://creativecommons.org/licenses/${license}/${version}/" target="_blank" rel="noopener noreferrer">CC ${license.toUpperCase()} ${version} ↗</a></li>`).join("")}</ul><p>${t("恐怖人物及部分剧情插图为生成的虚构图像。求救男声使用 Piper 的 en_US-ryan-medium 模型本地合成，并做断续及混响处理；语音模型注明 RyanSpeech 数据集授权为 CC BY-NC-SA 4.0。", "Horror figures and selected story illustrations are generated fictional art. The adult male distress voice was synthesized locally with Piper’s en_US-ryan-medium model, with dropouts and echo. The model card identifies the RyanSpeech dataset licence as CC BY-NC-SA 4.0.")}</p><p><a href="https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ryan/medium" target="_blank" rel="noopener noreferrer">${t("语音模型与说明", "Voice model & model card")} ↗</a> · <a href="https://github.com/RieyekiWong/123/blob/main/assets/CREDITS.md" target="_blank" rel="noopener noreferrer">${t("完整素材说明", "Full asset credits")} ↗</a></p><p>${t("官网留声机使用白光的歌曲，通过 YouTube 官方播放器播放。", "The lobby records feature Bai Guang through official YouTube players.")}</p><ul><li><a href="https://www.youtube.com/watch?v=LYDTJtV7vCE" target="_blank" rel="noopener noreferrer">等着你回来 ↗</a></li><li><a href="https://www.youtube.com/watch?v=Wno9SKAxmcg" target="_blank" rel="noopener noreferrer">期待 ↗</a></li><li><a href="https://www.youtube.com/watch?v=TPj2Z6WLCQ8" target="_blank" rel="noopener noreferrer">今晚且流连 ↗</a></li></ul><p>${t("网页叙事形式参考：", "Web-story format reference: ")}<a href="https://anninganya-glitch.github.io/My-Secret-Garden/" target="_blank" rel="noopener noreferrer">My Secret Garden ↗</a></p></div></details><p class="instructions-last-note">${t("这份说明可在求职网站或酒店页脚的“游戏说明”中再次查看。已有存档会继续保留。", "Reopen this guide from Game instructions in the recruitment or hotel footer. Existing saves will be kept.")}</p></div><footer class="instructions-footer"><span>${t("准备好后，再开始你的求职。", "Continue when you are ready.")}</span><button type="button" data-instructions="enter">${t("我已了解，进入游戏", "Understood · Enter game")} →</button></footer></div>`;
    document.body.append(screen);
    const language = new URL(
      zh ? "index.html" : "index-zh.html",
      location.href,
    );
    language.search = location.search;
    language.searchParams.set("instructions", "1");
    language.hash = location.hash;
    screen.querySelector(".instructions-language").href = language.href;
    document.body.classList.add("instructions-open");
    screen.addEventListener("cancel", (event) => {
      event.preventDefault();
      enter();
    });
    screen.addEventListener("click", async (event) => {
      const action = event.target.closest("[data-instructions]")?.dataset
        .instructions;
      if (action === "enter") enter();
      else if (action === "top") {
        event.preventDefault();
        screen.scrollTop = 0;
      } else if (action === "sound") {
        const button = event.target.closest("button");
        button.disabled = true;
        const requested = !settings()?.soundEnabled();
        try {
          await settings()?.toggleSound();
        } finally {
          button.disabled = false;
          if (screen?.isConnected) {
            updatePreferences();
            screen.querySelector("#instructions-audio-status").textContent =
              requested && !settings()?.soundEnabled()
                ? t(
                    "此浏览器未能开启声音。可以继续静音游玩。",
                    "This browser could not enable audio. You can continue without it.",
                  )
                : "";
          }
        }
      } else if (action === "music") {
        settings()?.toggleMusic();
        updatePreferences();
      } else if (action === "scares") {
        settings()?.toggleScares();
        updatePreferences();
      }
    });
    updatePreferences();
    screen.showModal();
    screen.querySelector("#instructions-title").focus({ preventScroll: true });
    screen.scrollTop = 0;
  }
  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-open-instructions]")) return;
    event.preventDefault();
    open();
  });
  if (!seen || new URLSearchParams(location.search).get("instructions") === "1")
    open();
})();
