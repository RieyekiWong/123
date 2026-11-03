/* Action-authored, once-per-save events. No periodic or random scare timer. */
globalThis.StillwaterEvents = {
  create({ getState, reduced, audio, sting, t }) {
    let timers = [],
      active = null,
      route = "",
      generation = 0;
    const clear = () => {
      generation++;
      timers.forEach(clearTimeout);
      timers = [];
      active?.remove();
      active = null;
      document.body.classList.remove("event-signal-drop");
    };
    const allowed = () =>
      !getState().preferences.skipScares &&
      !reduced() &&
      !document.hidden &&
      !document.querySelector("dialog[open]");
    const assets = {
      "cabinet-face": "assets/haunt-v442/cabinet.jpg",
      "photo-face": "assets/haunt-v442/corridor.jpg",
      "last-frame": "assets/haunt-v442/last-frame.jpg",
    };
    const captions = {
      "plate-open-door": ["隔壁的门开着。", "The neighbouring door is open."],
      "peephole-empty": [
        "灯闪了一下。猫眼里没有人。",
        "A light flickered. No one at the peephole.",
      ],
      "hall-silhouette": [
        "走廊尽头多了一个影子。",
        "A shape at the end of the hall.",
      ],
      "cabinet-face": [
        "柜门已经打开。门锁供电拉杆在柜子下方。",
        "The cabinet is open. The door supply lever is below it.",
      ],
      "photo-face": [
        "合照上的脸被刮花了，背面留着 E-014。监控里，门边站着一个人。",
        "Scratched faces in the photograph. E-014 on the back. Someone stands beside a door in the feed.",
      ],
      "last-frame": [
        "录像停在 03:17，317 的门还没有关上。",
        "The reel stopped at 03:17. The 317 door was still open.",
      ],
    };
    function present(id) {
      clear();
      route = location.hash.split("?")[0];
      const status =
        document.querySelector("#night-feedback") ||
        document.querySelector("#case-status");
      if (status && captions[id]) status.textContent = t(...captions[id]);
      if (!allowed()) return;
      if (!assets[id]) {
        if (id === "peephole-empty") {
          document.body.classList.add("event-signal-drop");
          timers.push(
            setTimeout(
              () => document.body.classList.remove("event-signal-drop"),
              160,
            ),
          );
        }
        return; // Environment changes are rendered by the persistent scene state.
      }
      const frame = document.querySelector(
        ".passage-frame,.terminal-layout .cctv-frame",
      );
      if (!frame) return;
      const token = generation;
      const img = document.createElement("img");
      img.src = assets[id];
      img.alt = "";
      // These scenes already have authored low-resolution display copies.
      // Preserve their bodies/actions instead of reducing them as old portraits.
      img.dataset.cctvScene = "true";
      const ready = img.decode().then(() => true, () => false);
      const show = async () => {
        // Count the visible duration after decode, including on a slow connection.
        const decoded = await ready;
        if (
          token !== generation ||
          !allowed() ||
          location.hash.split("?")[0] !== route
        )
          return;
        document.body.classList.remove("event-signal-drop");
        if (!decoded) return;
        const currentFrame = document.querySelector(
          ".passage-frame,.terminal-layout .cctv-frame",
        );
        if (!currentFrame) return;
        active = document.createElement("div");
        active.className = "frame-face authored-face";
        if (id === "photo-face") active.classList.add("scene-appearance");
        active.dataset.event = id;
        active.setAttribute("aria-hidden", "true");
        active.append(img);
        const bounds = currentFrame.getBoundingClientRect();
        // Phone controls can sit below the monitor. Keep a triggered face visible
        // without scrolling the player's page or changing puzzle controls.
        const visibleHeight = Math.max(
          0,
          Math.min(innerHeight, bounds.bottom) - Math.max(0, bounds.top),
        );
        if (visibleHeight < bounds.height * 0.85) {
          active.classList.add("portrait-popout");
          document.body.append(active);
        } else currentFrame.append(active);
        audio.afterScare();
        timers.push(
          setTimeout(
            () => {
              active?.remove();
              active = null;
            },
            id === "photo-face" ? 2400 : id === "last-frame" ? 850 : 550,
          ),
        );
      };
      if (id === "last-frame") {
        audio.approach();
        document.body.classList.add("event-signal-drop");
        timers.push(setTimeout(show, 1700));
      } else show();
    }
    function escape() {
      clear();
      if (!allowed()) return;
      route = location.hash.split("?")[0];
      const token = generation;
      const img = document.createElement("img");
      img.src = "assets/haunt-v442/escape.jpg";
      img.alt = "";
      img.dataset.cctvScene = "true";
      const ready = img.decode().then(() => true, () => false);
      // First let the completed escape show. Only this explicit ending action
      // schedules the final surprise; loading/revisiting an ending never does.
      timers.push(
        setTimeout(async () => {
          const decoded = await ready;
          if (
            token !== generation ||
            !allowed() ||
            location.hash.split("?")[0] !== route ||
            !decoded
          )
            return;
          active = document.createElement("div");
          active.className = "frame-face escape-scare";
          active.dataset.event = "escape-face";
          active.setAttribute("aria-hidden", "true");
          active.append(img);
          document.body.append(active);
          audio.stop();
          sting?.();
          timers.push(
            setTimeout(() => {
              active?.remove();
              active = null;
            }, 1100),
          );
        }, 1800),
      );
    }
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") clear();
    });
    window.addEventListener("pagehide", clear);
    window.addEventListener("hashchange", clear);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clear();
    });
    return { present, clear, escape };
  },
};
