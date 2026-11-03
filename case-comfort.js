/* Viewing preferences and explicitly enabled audio. */
globalThis.StillwaterCaseComfort = {
  create({ getState, save, onPreference, reset }) {
    const zh = document.documentElement.lang === "zh-CN",
      t = (a, b) => (zh ? a : b);
    const dialog = document.querySelector("#case-settings");
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let context = null,
      timer = null,
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
      dialog.querySelector("#volume-value").textContent =
        Math.round(pref.volume * 100) + "%";
    }
    function tone() {
      if (
        !getState().preferences.sound ||
        !context ||
        context.state !== "running"
      )
        return;
      const now = context.currentTime,
        osc = context.createOscillator(),
        gain = context.createGain();
      osc.type = "sine";
      osc.frequency.value = 210;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(
        getState().preferences.volume * 0.04,
        now + 0.04,
      );
      gain.gain.linearRampToValueAtTime(0, now + 0.22);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(now);
      osc.stop(now + 0.24);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    }
    async function toggleSound() {
      const pref = getState().preferences;
      if (pref.sound) {
        pref.sound = false;
        await context?.suspend();
      } else {
        try {
          const Audio = window.AudioContext || window.webkitAudioContext;
          if (!Audio) throw Error("audio");
          context ||= new Audio();
          await context.resume();
          pref.sound = context.state === "running";
          tone();
        } catch {
          pref.sound = false;
          (
            dialog.querySelector("#comfort-feedback") ||
            document.querySelector("#case-status")
          ).textContent = t(
            "浏览器没能开启声音，静音也能继续。",
            "Audio could not be enabled. All records can be reconciled silently.",
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
      dialog.innerHTML = `<header class="settings-heading"><h2 id="settings-title">${t("声音与浏览设置", "Sound & viewing settings")}</h2><button data-comfort="close" aria-label="${t("关闭设置", "Close settings")}">×</button></header><div class="settings-content"><p>${t("声音默认关闭。第二阶段开启声音后，先听到机器运转声；进入深处后会自动加入呼吸声，关闭声音即可停止。鬼脸和突脸默认开启，可勾选下方的“跳过监控突脸与短暂故障”关闭。", "Sound is off by default. In the second phase it starts with machinery, adding breathing deeper in the passage; switching it off stops both. Faces and jump scares are on by default. Select Skip Scares below to turn them off; motion is controlled separately.")}</p><button type="button" data-comfort="sound" aria-pressed="false"></button><label for="case-volume">${t("音量", "Volume")} <output id="volume-value"></output></label><input id="case-volume" type="range" name="volume" min="0" max="50" step="5"><label class="setting-toggle"><input type="checkbox" name="reduce-motion">${t("减少动态效果", "Reduce Motion")}</label>${media.matches ? `<p class="small">${t("正在遵循设备的减少动态设置。", "Following your device’s reduced-motion setting.")}</p>` : ""}<label class="setting-toggle"><input type="checkbox" name="skip-scares">${t("跳过监控突脸与短暂故障", "Skip Scares / brief connection effects")}</label><p id="comfort-feedback" role="status"></p><details class="save-section" ${options.save ? "open" : ""}><summary>${t("存档与重新开始", "Saves & restart")}</summary><p>${t("进度存在当前浏览器里。重新开始会清除本次调查、监控与结局记录，从论坛开始。收藏的广告和显示偏好会保留，声音恢复为关闭。", "Starting again clears this investigation, equipment chapters and endings, and returns to the forum. Saved ads and viewing preferences are kept; sound returns to off.")}</p><button data-comfort="reset-prompt">${t("重新开始游戏", "Start the game again")}</button><div id="case-reset-confirm" hidden><p>${t("清除新版的全部进度和结局记录？", "Clear this case and its retained dispositions?")}</p><button data-comfort="reset-confirm">${t("确认重新开始", "Confirm restart")}</button><button data-comfort="reset-cancel">${t("取消，保留进度", "Keep current records")}</button></div></details><p class="small">${t("样本不需要姓名、邮箱、电话、简历或支付信息。", "The sample needs no name, email, phone number, CV or payment information.")}</p></div>`;
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
        void context?.suspend();
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
        void context?.suspend();
        save();
        update();
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
        "连接中断，正在读取备份。",
        "Connection delayed. Reading the retained copy.",
      );
      host.after(pane);
      tone();
      timer = setTimeout(() => {
        if (pane.isConnected) {
          pane.textContent = t(
            "已恢复备份，原始时间未变。",
            "Retained copy restored. Source timestamps unchanged.",
          );
          pane.classList.add("restored");
        }
      }, 600);
    }
    return { open, signal, update, tone, reduced, toggleSound };
  },
};
