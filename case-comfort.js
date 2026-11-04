/* Viewing preferences and explicitly enabled audio. */
globalThis.StillwaterCaseComfort = {
  create({ getState, save, onPreference, reset, audio }) {
    const zh = document.documentElement.lang === "zh-CN",
      t = (a, b) => (zh ? a : b);
    const dialog = document.querySelector("#case-settings");
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let timer = null,
      returnFocus = null;
    const reduced = () => media.matches || getState().preferences.reduceMotion;
    function update() {
      const pref = getState().preferences;
      document.body.classList.toggle("reduced-motion", reduced());
      if (!dialog.open) return;
      const sound = dialog.querySelector("[data-comfort=sound]");
      sound.textContent = pref.sound
        ? t("声音：开启", "Sound: On")
        : t("声音：关闭", "Sound: Off");
      sound.setAttribute("aria-pressed", String(pref.sound));
      dialog.querySelector("[name=reduce-motion]").checked = reduced();
      dialog.querySelector("[name=reduce-motion]").disabled = media.matches;
      dialog.querySelector("[name=skip-scares]").checked = pref.skipScares;

      dialog.querySelector("[name=volume]").value = String(pref.volume * 100);
      dialog.querySelector("#volume-value").textContent = Math.round(pref.volume * 100) + "%";
      const mix = audio.getMix();
      for (const [name, channel] of [["music-volume", "music"], ["sfx-volume", "effects"]]) {
        dialog.querySelector(`[name=${name}]`).value = String(Math.round(mix[channel] * 100));
        dialog.querySelector(`#${name}-value`).textContent = Math.round(mix[channel] * 100) + "%";
      }
    }
    function tone() { audio.effect("ui"); }
    async function toggleSound() {
      const pref = getState().preferences;
      if (pref.sound) {
        pref.sound = false;
        audio.stop();
      } else {
        try {
          pref.sound = await audio.unlock();
          tone();
        } catch {
          pref.sound = false;
          (
            dialog.querySelector("#comfort-feedback") ||
            document.querySelector("#case-status")
          ).textContent = t(
            "声音暂时没能开启，静音仍可继续游玩。",
            "Audio could not start. You can complete the game without sound.",
          );
        }
      }
      save();
      update();
      onPreference();
    }
    function open(options = {}) {
      if (dialog.open) return;
      returnFocus = document.activeElement;
      dialog.innerHTML = `<header class="settings-heading"><h2 id="settings-title">${t("声音与浏览设置", "Sound & viewing settings")}</h2><button data-comfort="close" aria-label="${t("关闭设置", "Close settings")}">×</button></header><div class="settings-content"><p>${t("声音默认关闭。开启后会播放聊天提示音、酒店和监控的背景音，以及后半段的呼吸声；论坛和招聘页没有背景音。鬼脸默认开启，可在下方关闭。", "Sound is off by default. Chat has quiet notifications; investigation, archives and cameras have their own ambience, with breathing deeper inside. The forum and careers pages stay silent. Faces are on by default; disable them below.")}</p><button type="button" data-comfort="sound" aria-pressed="false"></button><label for="case-volume">${t("总音量", "Master volume")} <output id="volume-value"></output></label><input id="case-volume" type="range" name="volume" min="0" max="50" step="5"><label for="music-volume">${t("背景音乐", "Background music")} <output id="music-volume-value"></output></label><input id="music-volume" type="range" name="music-volume" min="0" max="100" step="5"><label for="sfx-volume">${t("提示音与环境音效", "Notifications & environmental effects")} <output id="sfx-volume-value"></output></label><input id="sfx-volume" type="range" name="sfx-volume" min="0" max="100" step="5"><label class="setting-toggle"><input type="checkbox" name="reduce-motion">${t("减少动态效果与闪屏", "Reduce motion & signal flashes")}</label>${media.matches ? `<p class="small">${t("已按设备设置减少动态效果。", "Following your device’s reduced-motion setting.")}</p>` : ""}<label class="setting-toggle"><input type="checkbox" name="skip-scares">${t("跳过监控突脸与短暂故障", "Skip Scares / brief connection effects")}</label><p id="comfort-feedback" role="status"></p><details class="save-section" ${options.save ? "open" : ""}><summary>${t("存档与重新开始", "Saves & restart")}</summary><p>${t("进度保存在当前浏览器。重新开始后，会清除聊天、调查、监控和结局记录，回到开场群聊。收藏的广告和显示设置保留，声音会恢复关闭。", "Starting again clears the chat, investigation, equipment chapters and endings, and returns to the group chat. Saved ads and viewing preferences are kept; sound returns to off.")}</p><button data-comfort="reset-prompt">${t("重新开始游戏", "Start the game again")}</button><div id="case-reset-confirm" hidden><p>${t("清除聊天记录、本次调查进度和结局，重新开始？", "Clear the chat, investigation and ending history, and start again?")}</p><button data-comfort="reset-confirm">${t("确认重新开始", "Confirm restart")}</button><button data-comfort="reset-cancel">${t("取消，保留进度", "Keep current records")}</button></div></details><p class="small">${t("查看样本无需填写姓名、邮箱、电话、简历或支付信息。", "The sample needs no name, email, phone number, CV or payment information.")}</p></div>`;
      dialog.showModal();
      update();
      (options.save
        ? dialog.querySelector(".save-section summary")
        : dialog.querySelector("[data-comfort=close]")
      ).focus();
    }
    dialog.addEventListener("click", (event) => {
      const action = event.target.closest("[data-comfort]")?.dataset.comfort;
      if (action === "close") dialog.close();
      if (action === "sound") void toggleSound();
      if (action === "reset-prompt")
        dialog.querySelector("#case-reset-confirm").hidden = false;
      if (action === "reset-cancel")
        dialog.querySelector("#case-reset-confirm").hidden = true;
      if (action === "reset-confirm") {
        getState().preferences.sound = false;
        audio.stop();
        clearTimeout(timer);
        dialog.close();
        reset();
      }
    });
    dialog.addEventListener("close", () => {
      (returnFocus?.isConnected
        ? returnFocus
        : document.querySelector(
            "[data-case-action=settings], [data-case-action=save-settings]",
          )
      )?.focus({ preventScroll: true });
    });
    dialog.addEventListener("input", (event) => {
      if (["music-volume", "sfx-volume"].includes(event.target.name)) {
        audio.setMix(event.target.name === "music-volume" ? "music" : "effects", Number(event.target.value) / 100);
        update();
      }
      if (event.target.name === "volume") {
        getState().preferences.volume = Math.min(
          0.5,
          Math.max(0, Number(event.target.value) / 100),
        );
        save();
        update();
        onPreference();
      }
    });
    dialog.addEventListener("change", (event) => {
      if (event.target.name === "reduce-motion")
        getState().preferences.reduceMotion = event.target.checked;
      else if (event.target.name === "skip-scares") {
        getState().preferences.skipScares = event.target.checked;
        getState().preferences.scareChoiceMade = true;
      } else return;
      save();
      update();
      onPreference();
    });
    media.addEventListener("change", () => {
      update();
      onPreference();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && getState().preferences.sound) {
        getState().preferences.sound = false;
        audio.stop();
        save();
        update();
        onPreference();
      }
    });
    function signal() {
      clearTimeout(timer);
      const state = getState();
      if (state.effectSeen || state.preferences.skipScares || reduced()) return;
      state.effectSeen = true;
      save();
      const host = document.querySelector(".page-heading");
      if (!host) return;
      const pane = document.createElement("aside");
      pane.className = "connection-notice";
      pane.setAttribute("role", "status");
      pane.textContent = t(
        "连接已中断，正在载入备份。",
        "Connection delayed. Reading the retained copy.",
      );
      host.after(pane);
      tone();
      timer = setTimeout(() => {
        if (pane.isConnected) {
          pane.textContent = t(
            "备份已载入，原始时间保持不变。",
            "Retained copy restored. Source timestamps unchanged.",
          );
          pane.classList.add("restored");
        }
      }, 600);
    }
    return { open, signal, update, tone, reduced, toggleSound };
  },
};
