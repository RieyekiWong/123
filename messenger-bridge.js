/* Two local applications, one preserved browser view. No game progress or AI
   routing is derived from an incoming message. */
globalThis.StillwaterMessengerBridge = {
  create({
    chat,
    getState,
    getRoute,
    canOpen,
    t,
    esc,
    audio,
    reduced,
    blocked = () => false,
    storageNamespace = '',
    parseHash = null,
    formatHash = route => '#'+route,
    scenePolicy = null,
  }) {
    const SNAP = storageNamespace ? `stillwater-browser:${storageNamespace}:v1` : "stillwater-browser:v1",
      META = storageNamespace ? `stillwater-messenger:${storageNamespace}:v1` : "stillwater-messenger:v1";
    const contacts = ["mom", "gg", "milk", "lin", "zhang", "dad", "zhe"];
    const firstDelay = () => 30000 + Math.random() * 10000;
    const nextDelay = () => 60000 + Math.random() * 60000;
    const host = () => document.querySelector("#case-shell");
    const isChat = () => getRoute() === "chat";
    const coordinate = (value) =>
      Number.isFinite(value) ? Math.max(0, Math.min(10000000, value)) : 0;
    const safeHash = (value) => {
      if (
        typeof value !== "string" ||
        value.length > 400 ||
        !value.startsWith("#")
      )
        return "";
      if(parseHash){const parsed=parseHash(value);return parsed&&parsed.route!=='chat'&&canOpen(parsed.route)?value:'';}
      const route = value.slice(1).split("?")[0];
      return /^[a-z][a-z-]*$/.test(route) &&
        route !== "chat" &&
        canOpen(route === "home" ? "hotel" : route)
        ? value
        : "";
    };
    const read = (key) => {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch {
        return null;
      }
    };
    const write = (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    };
    let saved = null,
      cache = null,
      lastHash = "",
      restorePending = true,
      saveTimer = 0,
      notice = null,
      noticeTimer = 0,
      lastNotice = -Infinity,
      lastTick = Date.now(),
      lastMeta = 0;
    const old = read(SNAP);
    if (old?.schema === 1 && safeHash(old.hash))
      saved = {
        schema: 1,
        hash: old.hash,
        title:
          typeof old.title === "string"
            ? old.title.slice(0, 100)
            : "Stillwater Hotel",
        browserTitle:
          typeof old.browserTitle === "string"
            ? old.browserTitle.slice(0, 160)
            : "Stillwater Hotel",
        fields: Array.isArray(old.fields) ? old.fields.slice(0, 300) : [],
        scrollers: Array.isArray(old.scrollers)
          ? old.scrollers
              .filter(
                (item) =>
                  item &&
                  Number.isInteger(item.i) &&
                  item.i >= 0 &&
                  item.i < 20,
              )
              .slice(0, 20)
              .map((item) => ({
                i: item.i,
                x: coordinate(item.x),
                y: coordinate(item.y),
              }))
          : [],
        x: coordinate(old.x),
        y: coordinate(old.y),
        focus: old.focus || null,
      };
    const raw = read(META),
      past = scenePolicy ? false : getState().evidence.includes("C9") || getState().night.started;
    let meta = {
      schema: 1,
      cadence: 2,
      remaining: firstDelay(),
      nextContact: 0,
      intrusionSeen: past,
    };
    if (raw?.schema === 1) {
      meta.remaining = Number.isFinite(raw.remaining)
        ? Math.max(
            1000,
            Math.min(
              raw.cadence === 2 ? 120000 : meta.remaining,
              raw.remaining,
            ),
          )
        : meta.remaining;
      meta.nextContact =
        Number.isInteger(raw.nextContact) && raw.nextContact >= 0
          ? raw.nextContact % contacts.length
          : 0;
      meta.intrusionSeen =
        raw.intrusionSeen === true || (!scenePolicy&&getState().night.started);
    }
    const intrusion = globalThis.StillwaterMessengerIntrusion.create({
      chat,
      t,
      esc,
      audio,
      reduced: () => reduced() || getState().preferences.skipScares,
    });
    const fields = () =>
      [...host().querySelectorAll("input,select,textarea")].filter(
        (el) => !["password", "file", "hidden"].includes(el.type),
      );
    const identify = (el, index) => ({
      fieldId: el.dataset.fieldId || '',
      id: el.id.slice(0, 100),
      name: el.name?.slice(0, 100) || "",
      type: el.type,
      index,
    });
    function capture() {
      const root = host();
      if (
        !root ||
        root.querySelector(".chat-app") ||
        !lastHash ||
        !safeHash(lastHash)
      )
        return;
      const list = fields();
      saved = {
        schema: 1,
        hash: lastHash,
        title: (root.querySelector("h1")?.textContent || document.title)
          .trim()
          .slice(0, 100),
        browserTitle: document.title.slice(0, 160),
        x: scrollX,
        y: scrollY,
        fields: list.slice(0, 300).map((el, i) => ({
          ...identify(el, i),
          value: String(el.value).slice(0, 2400),
          checked: el.checked === true,
        })),
        scrollers: [
          ...root.querySelectorAll(".table-scroll,[data-browser-scroll]"),
        ]
          .slice(0, 20)
          .map((el, i) => ({ i, x: el.scrollLeft, y: el.scrollTop })),
        focus: list.includes(document.activeElement)
          ? {
              ...identify(
                document.activeElement,
                list.indexOf(document.activeElement),
              ),
              start: document.activeElement.selectionStart,
              end: document.activeElement.selectionEnd,
            }
          : saved?.hash===lastHash ? saved.focus : null,
      };
      write(SNAP, saved);
    }
    function fieldFor(item, list) {
      if (!item || typeof item !== "object") return null;
      if(item.fieldId)return list.find(el=>el.dataset.fieldId===item.fieldId&&el.type===item.type)||null;
      if (typeof item.id === "string" && item.id)
        return (
          list.find((el) => el.id === item.id && el.type === item.type) || null
        );
      if (!Number.isInteger(item.index) || item.index < 0) return null;
      const el = list[item.index];
      return el && el.type === item.type && el.name === (item.name || "")
        ? el
        : null;
    }
    function restoreFields() {
      if (!saved || saved.hash !== location.hash) return;
      const list = fields();
      for (const item of saved.fields) {
        const el = fieldFor(item, list);
        if (!el) continue;
        try {
          if (
            typeof item.value === "string" &&
            el.type !== "checkbox" &&
            el.type !== "radio"
          )
            el.value = item.value.slice(0, 2400);
          if (["checkbox", "radio"].includes(el.type))
            el.checked = item.checked === true;
        } catch {}
      }
    }
    function restoreView() {
      if (!saved) return;
      const target = saved,
        apply = () => {
          if (location.hash !== target.hash || isChat()) return;
          const areas = host().querySelectorAll(
            ".table-scroll,[data-browser-scroll]",
          );
          for (const item of target.scrollers) {
            const el = areas[item.i];
            if (el) {
              el.scrollLeft = Math.max(0, Number(item.x) || 0);
              el.scrollTop = Math.max(0, Number(item.y) || 0);
            }
          }
          window.scrollTo(
            Math.max(0, Number(target.x) || 0),
            Math.max(0, Number(target.y) || 0),
          );
        };
      const field = fieldFor(target.focus, fields());
      if (field) {
        field.focus({ preventScroll: true });
        try {
          field.setSelectionRange(target.focus.start, target.focus.end);
        } catch {}
      }
      apply();
      requestAnimationFrame(() => requestAnimationFrame(apply));
    }
    function beforeRender() {
      const next = location.hash;
      const wasChat = parseHash ? parseHash(lastHash)?.route==='chat' : lastHash.startsWith('#chat');
      if (
        isChat() &&
        lastHash &&
        !wasChat &&
        host()?.childNodes.length
      ) {
        capture();
        const fragment = document.createDocumentFragment();
        while (host().firstChild) fragment.append(host().firstChild);
        cache = { hash: saved?.hash, fragment };
      } else if (!isChat() && wasChat)
        restorePending = true;
      if (
        !isChat() &&
        lastHash &&
        !wasChat &&
        next !== lastHash
      ) {
        cache = null;
        restorePending = false;
      }
    }
    function restoreDOM() {
      if (!cache || cache.hash !== location.hash || !safeHash(cache.hash))
        return false;
      host().replaceChildren(cache.fragment);
      cache = null;
      restorePending = false;
      document.title = saved?.browserTitle || "Stillwater Hotel";
      restoreView();
      return true;
    }
    function returnBar() {
      document.body.classList.toggle(
        "has-browser-return",
        !!saved && !!safeHash(saved.hash),
      );
      if (
        !saved ||
        !safeHash(saved.hash) ||
        host().querySelector(".chat-browser-bar")
      )
        return;
      const bar = document.createElement("div");
      bar.className = "chat-browser-bar";
      bar.innerHTML = `<button data-messenger-action="return"><span class="browser-return-desktop">‹ ${t("返回浏览器", "Back to browser")} · ${esc(saved.title)}</span><span class="browser-return-mobile">‹ ${t("返回 Stillwater Hotel", "Back to Stillwater Hotel")}</span></button><span class="browser-current-tab">${t("微信", "Messages")}</span>`;
      host().prepend(bar);
    }
    const eligible = () =>
      !isChat() &&
      (scenePolicy ? scenePolicy().notices : !getState().night.started) &&
      !["void", "ending"].includes(getRoute()) &&
      !blocked() &&
      !document.hidden &&
      !document.querySelector("dialog[open],#phase-blackout") &&
      !intrusion.active();
    function dismiss() {
      clearTimeout(noticeTimer);
      notice?.remove();
      notice = null;
    }
    function updateLauncher() {
      for (const el of document.querySelectorAll(
        "[data-messenger-action=launch]",
      ))
        el.textContent =
          t("微信", "Messages") + (chat.unread() ? ` (${chat.unread()})` : "");
    }
    function incoming(messages) {
      updateLauncher();
      if (!eligible()) return;
      const message = messages.at(-1);
      if (!message) return;
      if (
        notice &&
        (notice.matches(":hover") || notice.contains(document.activeElement))
      )
        return;
      if (Date.now() - lastNotice < 20000) return;
      dismiss();
      lastNotice = Date.now();
      notice = document.createElement("aside");
      notice.className = "messenger-notice";
      notice.setAttribute("role", "status");
      notice.innerHTML = `<button class="messenger-notice-open" data-messenger-action="open" data-room="${esc(message.room)}">${message.avatar}<span><small>${t("微信", "Messages")} · ${esc(message.name)}<time>${t("现在", "now")}</time></small><span class="messenger-notice-text">${esc(message.text.slice(0, 180))}</span></span></button><button class="messenger-notice-close" data-messenger-action="dismiss" aria-label="${t("忽略通知", "Dismiss notification")}">×</button>`;
      document.body.append(notice);
      audio.effect("messenger-receive");
      const expire = () => {
        if (
          notice &&
          (notice.matches(":hover") || notice.contains(document.activeElement))
        )
          noticeTimer = setTimeout(expire, 2000);
        else dismiss();
      };
      noticeTimer = setTimeout(expire, 8000);
    }
    function sync() {
      if (!eligible()) dismiss();
      if(scenePolicy)return;
      const currentStory = globalThis.StillwaterStoryV13?.active(getState());
      const warningReview = currentStory
        ? getState().story.tab === "cause" && ["rewrite-review", "source-review"].includes(getRoute())
        : ["mara", "review"].includes(getRoute());
      if (
        !getState().night.started &&
        getState().evidence.includes("C9") &&
        warningReview &&
        !meta.intrusionSeen &&
        !blocked() &&
        !document.hidden &&
        !document.querySelector("dialog[open],#phase-blackout")
      ) {
        meta.intrusionSeen = true;
        write(META, meta);
        dismiss();
        intrusion.start();
      }
    }
    function afterRender() {
      if (isChat()) returnBar();
      else {
        document.body.classList.remove("has-browser-return");
        if (restorePending && saved?.hash === location.hash) {
          restoreFields();
          restoreView();
        }
        restorePending = false;
        if (!["void", "ending"].includes(getRoute())) {
          const footer = host().querySelector("footer");
          if (footer && !footer.querySelector("[data-messenger-action=launch]"))
            footer.insertAdjacentHTML(
              "beforeend",
              `<button class="browser-wechat-launch" data-messenger-action="launch">${t("微信", "Messages")}</button>`,
            );
        }
      }
      lastHash = location.hash;
      updateLauncher();
      sync();
    }
    document.addEventListener("click", (event) => {
      const el = event.target.closest("[data-messenger-action]");
      if (!el) return;
      event.preventDefault();
      if (el.dataset.messengerAction === "dismiss") {
        dismiss();
        return;
      }
      if (el.dataset.messengerAction === "return") {
        if (saved && safeHash(saved.hash)) location.hash = saved.hash;
        return;
      }
      dismiss();
      if (el.dataset.messengerAction === "open") chat.openRoom(el.dataset.room);
      const room = el.dataset.room;
      location.hash = formatHash(room ? "chat?room=" + encodeURIComponent(room) : "chat");
    });
    const deferCapture = () => {
      if (!isChat()) {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(capture, 220);
      }
    };
    document.addEventListener("input", deferCapture);
    document.addEventListener("change", deferCapture);
    window.addEventListener("scroll", deferCapture, { passive: true });
    setInterval(() => {
      const now = Date.now(),
        dt = Math.min(2000, Math.max(0, now - lastTick));
      lastTick = now;
      sync();
      if (!eligible()) return;
      meta.remaining -= dt;
      if (meta.remaining <= 0) {
        for (let offset = 0; offset < contacts.length; offset++) {
          const index = (meta.nextContact + offset) % contacts.length;
          const message = chat.checkIn(contacts[index], { repeat: true });
          if (message) {
            meta.nextContact = (index + 1) % contacts.length;
            incoming([message]);
            break;
          }
        }
        meta.remaining = nextDelay();
        write(META, meta);
      } else if (now - lastMeta > 15000) {
        write(META, meta);
        lastMeta = now;
      }
    }, 1000);
    const pageHide = () => {
      capture();
      write(META, meta);
      intrusion.clear();
      dismiss();
    };
    window.addEventListener("pagehide", pageHide);
    document.addEventListener("visibilitychange", () => {
      lastTick = Date.now();
      if (document.hidden) pageHide();
    });
    return {
      beforeRender,
      restoreDOM,
      afterRender,
      incoming,
      sync,
      reset() {
        dismiss();
        intrusion.clear();
        cache = null;
        saved = null;
        lastHash = "";
        restorePending = false;
        meta = {
          schema: 1,
          cadence: 2,
          remaining: firstDelay(),
          nextContact: 0,
          intrusionSeen: false,
        };
        for (const key of [SNAP, META])
          try {
            localStorage.removeItem(key);
          } catch {}
        document.body.classList.remove("has-browser-return");
      },
    };
  },
};
