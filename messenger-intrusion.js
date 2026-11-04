/* Authored, six-second impersonation. These warnings never enter chat-model. */
globalThis.StillwaterMessengerIntrusion = {
  create({ chat, t, esc, audio, reduced }) {
    let layer = null,
      timers = [],
      previous = null,
      host = null,
      route = "";
    const people = ["gg", "zhang", "lin", "mom", "dad", "milk", "zhe"];
    function clear() {
      timers.forEach(clearTimeout);
      timers = [];
      layer?.remove();
      layer = null;
      document.body.classList.remove("messenger-intrusion-active");
      if (host) {
        host.inert = false;
        host = null;
      }
      if (previous?.isConnected) previous.focus({ preventScroll: true });
      previous = null;
    }
    function start() {
      clear();
      const quiet = reduced();
      route = location.hash;
      previous = document.activeElement;
      host = document.querySelector("#case-shell");
      if (host) host.inert = true;
      layer = document.createElement("section");
      layer.className = "messenger-intrusion";
      layer.dataset.quiet = String(quiet);
      layer.setAttribute(
        "aria-label",
        t("微信连接异常", "Messenger connection interrupted"),
      );
      layer.innerHTML = `<div class="intrusion-notifications" aria-hidden="true"></div><div class="intrusion-wechat" role="dialog" aria-modal="true" aria-label="${t("微信", "Messages")}" tabindex="-1"><header><span class="messenger-app-icon" aria-hidden="true">●●</span>${t("微信", "Messages")}<button class="intrusion-close" aria-label="${t("关闭异常窗口", "Close interrupted window")}">×</button></header><div class="intrusion-app"><aside>${people
        .map((id) => {
          const p = chat.contact(id);
          return `<div>${p.avatar}<span>${esc(p.name)}</span><b>99+</b></div>`;
        })
        .join(
          "",
        )}</aside><main><h2>${esc(chat.contact("gg").name)}</h2><div class="intrusion-message-log" aria-hidden="true"></div><div class="intrusion-frozen-input">▏</div></main></div></div><p class="sr-only" role="status">${t("多位联系人发来：不要再调查。", "Several contacts say: stop investigating.")}</p>`;
      document.body.append(layer);
      if (!quiet) document.body.classList.add("messenger-intrusion-active");
      layer.querySelector(".intrusion-close").addEventListener("click", clear);
      function showWindow() {
        if (!layer) return;
        layer.classList.add("show-window");
        layer.querySelector(".intrusion-close").focus({ preventScroll: true });
      }
      function pulse(index) {
        if (!layer || document.hidden) return;
        const id = people[index % people.length],
          p = chat.contact(id),
          warning = t("不要再调查", "STOP INVESTIGATING");
        const notice = document.createElement("div");
        notice.className = "intrusion-notice";
        notice.setAttribute("role", "button");
        notice.tabIndex = -1;
        const show = () => {
          if (!layer) return;
          layer.querySelector(".intrusion-app h2").textContent = p.name;
          showWindow();
        };
        notice.addEventListener("click", show);
        notice.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            show();
          }
        });
        notice.innerHTML = `${p.avatar}<div><small>${t("微信", "Messages")} · ${esc(p.name)}</small><p>${warning}</p></div>`;
        const stack = layer.querySelector(".intrusion-notifications");
        stack.prepend(notice);
        while (stack.children.length > 4) stack.lastElementChild.remove();
        const bubble = document.createElement("div");
        bubble.className = "intrusion-bubble";
        bubble.innerHTML = `${p.avatar}<div><small>${esc(p.name)}</small><p>${warning}</p></div>`;
        const log = layer.querySelector(".intrusion-message-log");
        log.append(bubble);
        while (log.children.length > 14) log.firstElementChild.remove();
        log.scrollTop = log.scrollHeight;
        if (index % 10 === 0) audio.effect("messenger-receive");
      }
      pulse(0);
      if (quiet) {
        for (let i = 1; i < people.length; i++) pulse(i);
        showWindow();
      } else {
        for (let i = 1; i < 31; i++)
          timers.push(setTimeout(() => pulse(i), i * 180));
        timers.push(setTimeout(showWindow, 1050));
      }
      timers.push(setTimeout(clear, 6000));
    }
    const changed = () => {
      if (layer && (document.hidden || location.hash !== route)) clear();
    };
    document.addEventListener("visibilitychange", changed);
    window.addEventListener("hashchange", changed);
    window.addEventListener("pagehide", clear);
    document.addEventListener("keydown", (event) => {
      if (layer && event.key === "Escape") {
        event.preventDefault();
        clear();
      }
    });
    return { start, clear, active: () => !!layer };
  },
};
