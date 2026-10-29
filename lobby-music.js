/* First-phase hotel music through visible, official YouTube players. */
window.StillwaterLobbyMusic = (() => {
  "use strict";
  const tracks = [
    {
      title: "等着你回来",
      artist: "白光",
      src: "LYDTJtV7vCE",
      link: "https://www.youtube.com/watch?v=LYDTJtV7vCE",
    },
    {
      title: "期待",
      artist: "白光",
      src: "Wno9SKAxmcg",
      link: "https://www.youtube.com/watch?v=Wno9SKAxmcg",
    },
    {
      title: "今晚且流连",
      artist: "白光",
      src: "TPj2Z6WLCQ8",
      link: "https://www.youtube.com/watch?v=TPj2Z6WLCQ8",
    },
  ];
  let youtubeReady;
  function loadYouTube() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (youtubeReady) return youtubeReady;
    youtubeReady = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      const timer = setTimeout(() => {
        youtubeReady = null;
        reject(new Error("YouTube unavailable"));
      }, 15000);
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timer);
        if (typeof previous === "function") previous();
        resolve(window.YT);
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => {
        clearTimeout(timer);
        youtubeReady = null;
        script.remove();
        reject(new Error("YouTube unavailable"));
      };
      document.head.append(script);
    });
    return youtubeReady;
  }
  function youtubeMedia(mount) {
    let player = null,
      disposed = false,
      source = "",
      volume = 0,
      rejectPlay = null,
      playTimer = null;
    const events = new Map();
    const emit = (name) => {
      for (const callback of events.get(name) || []) callback();
    };
    const host = document.createElement("div");
    mount.append(host);
    mount.hidden = false;
    const media = {
      addEventListener(name, callback) {
        if (!events.has(name)) events.set(name, []);
        events.get(name).push(callback);
      },
      getAttribute(name) {
        return name === "src" ? source : null;
      },
      removeAttribute(name) {
        if (name === "src") source = "";
      },
      async play() {
        const YT = await loadYouTube();
        if (disposed) throw new DOMException("Player closed", "AbortError");
        if (player) {
          player.playVideo();
          return;
        }
        return new Promise((resolve, reject) => {
          rejectPlay = reject;
          playTimer = setTimeout(
            () => reject(new DOMException("Tap to play", "NotAllowedError")),
            15000,
          );
          player = new YT.Player(host, {
            width: "100%",
            height: "225",
            videoId: source,
            playerVars: {
              playsinline: 1,
              controls: 1,
              rel: 0,
              ...(location.origin !== "null"
                ? { origin: location.origin }
                : {}),
            },
            events: {
              onReady(event) {
                if (disposed) return;
                event.target.setVolume(volume * 100);
                event.target.playVideo();
              },
              onStateChange(event) {
                if (disposed) return;
                if (event.data === 1) {
                  clearTimeout(playTimer);
                  rejectPlay = null;
                  resolve();
                  emit("playing");
                } else if (event.data === 0) emit("ended");
                else if (event.data === 2) emit("pause");
              },
              onError() {
                if (disposed) return;
                clearTimeout(playTimer);
                rejectPlay = null;
                reject(new Error("Video unavailable"));
                emit("error");
              },
              onAutoplayBlocked() {
                if (disposed) return;
                emit("blocked");
                clearTimeout(playTimer);
                rejectPlay = null;
                reject(new DOMException("Tap to play", "NotAllowedError"));
              },
            },
          });
        });
      },
      pause() {
        try {
          player?.pauseVideo();
        } catch {
          /* API may still be loading. */
        }
      },
      load() {
        disposed = true;
        clearTimeout(playTimer);
        rejectPlay?.(new DOMException("Player closed", "AbortError"));
        rejectPlay = null;
        try {
          player?.destroy();
        } catch {
          /* Always remove the frame even if the API failed. */
        }
        mount.replaceChildren();
        mount.hidden = true;
      },
      get src() {
        return source;
      },
      set src(value) {
        source = value;
      },
      get volume() {
        return volume;
      },
      set volume(value) {
        volume = value;
        try {
          player?.setVolume(value * 100);
        } catch {
          /* Apply the value on ready. */
        }
      },
    };
    return media;
  }

  function create({ getState, playlist = tracks }) {
    const key = "stillwater-lobby-music:v1";
    const zh = document.documentElement.lang === "zh-CN";
    const t = (a, b) => (zh ? a : b);
    let enabled = true,
      collapsed = false,
      level = 0.24;
    try {
      const stored = JSON.parse(localStorage.getItem(key));
      if (typeof stored?.enabled === "boolean") enabled = stored.enabled;
      if (typeof stored?.collapsed === "boolean") collapsed = stored.collapsed;
      if (Number.isFinite(stored?.level))
        level = Math.max(0, Math.min(0.6, stored.level));
    } catch {
      /* Playback still works without storage. */
    }
    let ready = false,
      entryAt = null,
      timer = null,
      fade = null,
      token = 0,
      index = 0,
      audio = null;
    let phase = "idle",
      stoppedForStory = false,
      destroyed = false,
      preloadStarted = false,
      dockOpen = false;
    const root =
      document.querySelector("[data-footer-player]") ||
      document.querySelector(".footer-columns > div:first-child");
    const panel = document.createElement("section");
    panel.className = "lobby-record-player";
    panel.id = "lobby-record-player";
    panel.setAttribute("data-puzzle-original", "");
    panel.setAttribute("aria-label", t("大堂留声机", "Lobby record player"));
    panel.innerHTML = `<div><span class="lobby-record-label">${t("大堂留声机", "LOBBY RECORD PLAYER")}</span><p class="lobby-record-status" role="status" aria-live="polite"></p><a class="lobby-record-source" target="_blank" rel="noopener noreferrer" hidden></a></div><div class="lobby-record-controls"><button type="button" class="lobby-record-collapse" aria-label="${t("收起留声机并暂停", "Collapse player and pause")}" aria-expanded="true" aria-controls="lobby-record-player">${t("收起", "Hide")}</button><button type="button" class="lobby-record-close" aria-label="${t("关闭官网音乐", "Turn hotel music off")}">×</button><button type="button" data-lobby-action="toggle"></button><button type="button" data-lobby-action="replay" hidden>${t("重新播放", "Replay")}</button><label>${t("音量", "Volume")}<input type="range" min="0" max="60" value="${Math.round(level * 100)}" step="1" aria-label="${t("官网音乐音量", "Hotel music volume")}"></label></div><div class="lobby-youtube-mount" hidden></div>`;
    root?.append(panel);
    const restore = document.createElement("button");
    restore.type = "button";
    restore.className = "lobby-record-restore";
    restore.setAttribute("data-puzzle-original", "");
    restore.setAttribute(
      "aria-label",
      t("展开留声机，继续播放", "Expand record player to resume"),
    );
    restore.setAttribute("aria-expanded", "false");
    restore.setAttribute("aria-controls", panel.id);
    restore.title = t(
      "留声机已收起，音乐已暂停",
      "Player collapsed; music paused",
    );
    restore.textContent = t("♫ 留声机", "♫ Music");
    restore.hidden = true;
    root?.append(restore);
    const status = panel.querySelector(".lobby-record-status");
    const toggle = panel.querySelector('[data-lobby-action="toggle"]');
    const replay = panel.querySelector('[data-lobby-action="replay"]');
    const source = panel.querySelector(".lobby-record-source");
    const configured = () =>
      playlist.length === 3 &&
      playlist.every(
        (track) =>
          typeof track.src === "string" &&
          /^[A-Za-z0-9_-]{11}$/.test(track.src),
      );
    const storyOver = () =>
      getState().musicInterrupted || getState().chapter !== 1;
    const inHotel = () =>
      ready &&
      !destroyed &&
      !document.body.classList.contains("career-mode") &&
      !document.body.classList.contains("instructions-open") &&
      !document.hidden &&
      !document.querySelector("#afterword-screen[open]") &&
      (location.hash.slice(1) || "home") !== "surveillance";
    const allowed = () => inHotel() && !storyOver() && enabled && !collapsed;
    function persist() {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ enabled, level, collapsed }),
        );
      } catch {
        /* Session preference remains available. */
      }
    }
    function update() {
      const copy = {
        idle: t(
          "进入酒店后播放。",
          "Playback begins after entering the hotel.",
        ),
        waiting: t("唱片准备中…", "Preparing the records…"),
        playing: `${playlist[index]?.artist} · ${playlist[index]?.title}`,
        paused: t("音乐已暂停。", "Music paused."),
        "user-paused": t(
          "音乐已暂停，可在播放器中继续。",
          "Paused. Resume in the player.",
        ),
        starting: t("正在连接 YouTube…", "Connecting to YouTube…"),
        collapsed: t(
          "留声机已收起，音乐已暂停。",
          "Player collapsed; music paused.",
        ),
        muted: t("官网音乐已关闭。", "Hotel music is off."),
        blocked: t("点按播放，开启大堂音乐。", "Tap to start the lobby music."),
        unavailable: t(
          "唱片暂时无法播放，可重试。",
          "The record could not play. You can retry.",
        ),
        finished: t("唱片已播放完毕。", "The records have finished."),
        stopped: t("留声机已停止。", "The record player has stopped."),
      };
      if (status.textContent !== copy[phase])
        status.textContent = copy[phase] || copy.idle;
      toggle.disabled = storyOver();
      toggle.textContent = ["blocked", "unavailable"].includes(phase)
        ? t("点击播放", "Play music")
        : enabled
          ? t("关闭音乐", "Music off")
          : t("开启音乐", "Music on");
      toggle.setAttribute("aria-pressed", String(enabled));
      replay.hidden = phase !== "finished" || storyOver();
      source.hidden = ![
        "playing",
        "starting",
        "blocked",
        "unavailable",
        "user-paused",
      ].includes(phase);
      if (!source.hidden) {
        source.href = playlist[index].link;
        source.textContent = t("在 YouTube 观看 ↗", "Watch on YouTube ↗");
      }
      panel.hidden = collapsed;
      restore.hidden = !collapsed || !inHotel() || storyOver();
      panel.classList.toggle(
        "is-youtube-visible",
        !collapsed &&
          !storyOver() &&
          inHotel() &&
          (dockOpen ||
            (!!audio &&
              ["playing", "starting", "blocked", "user-paused"].includes(
                phase,
              ))),
      );
      document.body.classList.toggle(
        "lobby-youtube-visible",
        panel.classList.contains("is-youtube-visible"),
      );
      window.dispatchEvent(new CustomEvent("stillwater-music-change"));
    }
    function cancel() {
      token++;
      clearTimeout(timer);
      timer = null;
      clearInterval(fade);
      fade = null;
      if (audio) {
        audio.volume = 0;
        audio.pause();
      }
    }
    function release() {
      cancel();
      if (audio) {
        audio.removeAttribute("src");
        audio.load();
        audio = null;
      }
    }
    function fadeIn(duration) {
      clearInterval(fade);
      const started = Date.now();
      fade = setInterval(() => {
        if (!allowed() || !audio || phase !== "playing") {
          clearInterval(fade);
          fade = null;
          return;
        }
        const progress = Math.min(1, (Date.now() - started) / duration);
        audio.volume = level * progress;
        if (progress === 1) {
          clearInterval(fade);
          fade = null;
        }
      }, 100);
    }
    function play() {
      if (!allowed() || phase === "finished" || phase === "playing") return;
      clearTimeout(timer);
      timer = null;
      if (!configured()) {
        phase = "unavailable";
        update();
        return;
      }
      const generation = ++token;
      if (!audio) {
        audio = youtubeMedia(panel.querySelector(".lobby-youtube-mount"));
        const current = audio;
        audio.addEventListener("playing", () => {
          if (audio !== current || !allowed()) {
            current.pause();
            return;
          }
          if (phase !== "playing") {
            phase = "playing";
            fadeIn(index === 0 ? 6000 : 2000);
            update();
          }
        });
        audio.addEventListener("blocked", () => {
          if (audio !== current || !allowed()) return;
          cancel();
          phase = "blocked";
          update();
        });
        audio.addEventListener("pause", () => {
          if (audio === current && phase === "playing" && allowed()) {
            clearInterval(fade);
            fade = null;
            phase = "user-paused";
            update();
          }
        });
        audio.addEventListener("ended", () => {
          if (phase !== "playing" || !allowed()) return;
          clearInterval(fade);
          fade = null;
          if (index === playlist.length - 1) {
            release();
            phase = "finished";
            update();
            return;
          }
          index++;
          release();
          phase = "idle";
          play();
        });
        audio.addEventListener("error", () => {
          if (phase === "playing" || phase === "starting") {
            release();
            phase = "unavailable";
            update();
          }
        });
      }
      const media = audio;
      if (!media.getAttribute("src")) media.src = playlist[index].src;
      media.volume = 0;
      phase = "starting";
      update();
      let result;
      try {
        result = media.play();
      } catch (error) {
        result = Promise.reject(error);
      }
      Promise.resolve(result)
        .then(() => {
          if (generation !== token || !allowed() || media !== audio) {
            media.pause();
            return;
          }
          phase = "playing";
          fadeIn(index === 0 ? 6000 : 2000);
          update();
        })
        .catch((error) => {
          if (generation !== token || !allowed()) return;
          if (error?.name === "NotAllowedError") cancel();
          else release();
          phase = error?.name === "NotAllowedError" ? "blocked" : "unavailable";
          update();
        });
    }
    function sync() {
      if (destroyed) return;
      if (storyOver()) {
        release();
        entryAt = null;
        stoppedForStory = true;
        dockOpen = false;
        phase = "stopped";
        update();
        return;
      }
      if (stoppedForStory) {
        stoppedForStory = false;
        index = 0;
        phase = "idle";
      }
      if (!inHotel()) {
        const wasPlaying = phase === "playing" || phase === "starting";
        cancel();
        entryAt = null;
        if (wasPlaying) phase = "paused";
        update();
        return;
      }
      if (entryAt === null) entryAt = Date.now();
      if (collapsed) {
        cancel();
        phase = "collapsed";
        update();
        return;
      }
      if (!enabled) {
        cancel();
        phase = "muted";
        update();
        return;
      }
      if (!preloadStarted) {
        preloadStarted = true;
        void loadYouTube().catch(() => {});
      }
      if (
        [
          "playing",
          "starting",
          "user-paused",
          "finished",
          "blocked",
          "unavailable",
        ].includes(phase)
      )
        return;
      const remaining = Math.max(0, 10000 - (Date.now() - entryAt));
      if (remaining === 0) {
        play();
        return;
      }
      if (timer === null) {
        phase = "waiting";
        timer = setTimeout(play, remaining);
        update();
      }
    }
    function setEnabled(value) {
      enabled = value;
      persist();
      if (!value) {
        if (phase === "starting") release();
        else cancel();
        dockOpen = false;
        phase = "muted";
      } else if (["muted", "blocked", "unavailable"].includes(phase))
        phase = "idle";
      sync();
      update();
      return enabled;
    }
    function setCollapsed(value) {
      if (storyOver()) return;
      collapsed = value;
      if (value) {
        if (phase === "starting") release();
        else cancel();
        dockOpen = false;
        phase = "collapsed";
      } else {
        dockOpen = true;
        if (phase === "collapsed") phase = "idle";
      }
      persist();
      sync();
      update();
      if (value && !restore.hidden) restore.focus({ preventScroll: true });
      else if (!value)
        panel
          .querySelector(".lobby-record-collapse")
          .focus({ preventScroll: true });
    }
    panel
      .querySelector(".lobby-record-collapse")
      .addEventListener("click", () => setCollapsed(true));
    restore.addEventListener("click", () => setCollapsed(false));
    panel.querySelector(".lobby-record-close").addEventListener("click", () => {
      setEnabled(false);
      setCollapsed(true);
    });
    toggle.addEventListener("click", () => {
      if (storyOver()) return;
      if (["blocked", "unavailable"].includes(phase)) {
        phase = "idle";
        play();
      } else setEnabled(!enabled);
    });
    replay.addEventListener("click", () => {
      if (!allowed()) return;
      index = 0;
      phase = "idle";
      entryAt = Date.now() - 10000;
      play();
    });
    panel.querySelector("input").addEventListener("input", (event) => {
      level = Number(event.target.value) / 100;
      persist();
      if (audio && !fade) audio.volume = level;
    });
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
    });
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("hashchange", sync);
    const unload = () => release();
    window.addEventListener("pagehide", unload);
    const activate = () => {
      if (ready) return;
      ready = true;
      sync();
    };
    if (document.readyState === "complete") activate();
    else {
      document.addEventListener("DOMContentLoaded", activate, { once: true });
      window.addEventListener("load", activate, { once: true });
    }
    update();
    return {
      sync,
      enabled: () => enabled,
      setEnabled,
      destroy() {
        destroyed = true;
        release();
        observer.disconnect();
        document.removeEventListener("visibilitychange", sync);
        document.removeEventListener("DOMContentLoaded", activate);
        window.removeEventListener("load", activate);
        window.removeEventListener("hashchange", sync);
        window.removeEventListener("pagehide", unload);
        panel.remove();
        restore.remove();
        document.body.classList.remove("lobby-youtube-visible");
      },
    };
  }
  return { tracks, create };
})();
