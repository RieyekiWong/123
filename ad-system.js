/* Independent scenery state. Never calls or modifies the case progression model. */
globalThis.StillwaterAds = (() => {
  const eligibleRoutes = new Set([
    "forum",
    "careers",
    "hotel",
    "rooms",
    "guestbook",
    "history",
  ]);
  const delay = (first, rng = Math.random) =>
    Math.round((first ? 45000 : 90000) + rng() * (first ? 30000 : 60000));
  const freshSession = (rng = Math.random) => ({
    schema: 1,
    shownThisSession: [],
    dismissedThisSession: [],
    remaining: delay(true, rng),
    lastShownAt: 0,
    navigatedSinceShow: true,
    lastRoute: "",
    forumReadMs: 0,
  });
  function advance(
    s,
    ms,
    {
      eligible = true,
      forum = false,
      visible = true,
      quiet = true,
      active = false,
      typing = false,
      dialog = false,
    } = {},
  ) {
    if (!visible) return false;
    if (forum) s.forumReadMs += ms;
    if (
      !eligible ||
      !quiet ||
      active ||
      typing ||
      dialog ||
      s.shownThisSession.length >= 3 ||
      (forum && s.forumReadMs < 35000)
    )
      return false;
    s.remaining = Math.max(0, s.remaining - ms);
    return s.remaining === 0 && s.navigatedSinceShow;
  }
  function create({ getState, getRoute, t, esc }) {
    const data = globalThis.StillwaterAdData,
      ids = new Set(data.map((a) => a.id));
    const validIds = (value) =>
      Array.isArray(value)
        ? [...new Set(value.filter((id) => ids.has(id)))]
        : [];
    let persistent = { schema: 1, pinnedIds: [], collapsedPinnedIds: [] };
    let session = freshSession();
    let loadedSession = false;
    try {
      const v = JSON.parse(localStorage.getItem("stillwater-ads:v1"));
      if (v?.schema === 1) {
        persistent.pinnedIds = validIds(v.pinnedIds);
        persistent.collapsedPinnedIds = validIds(v.collapsedPinnedIds).filter(
          (id) => persistent.pinnedIds.includes(id),
        );
      }
    } catch {}
    try {
      const v = JSON.parse(sessionStorage.getItem("stillwater-ads-session:v1"));
      if (v?.schema === 1) {
        loadedSession = true;
        session = {
          ...freshSession(),
          shownThisSession: validIds(v.shownThisSession),
          dismissedThisSession: validIds(v.dismissedThisSession),
          remaining: Number.isFinite(v.remaining)
            ? Math.max(0, Math.min(150000, v.remaining))
            : delay(true),
          lastShownAt: Number.isFinite(v.lastShownAt) ? v.lastShownAt : 0,
          navigatedSinceShow: v.navigatedSinceShow === true,
          lastRoute:
            typeof v.lastRoute === "string" ? v.lastRoute.slice(0, 180) : "",
          forumReadMs: Number.isFinite(v.forumReadMs)
            ? Math.max(0, v.forumReadMs)
            : 0,
        };
      }
    } catch {}
    const host = document.createElement("div");
    host.id = "ad-host";
    document.body.append(host);
    const dialog = document.createElement("dialog");
    dialog.id = "ad-dialog";
    dialog.setAttribute("aria-labelledby", "ad-dialog-title");
    document.body.append(dialog);
    let active = null,
      route = "",
      lastTick = Date.now(),
      quietUntil = 0,
      grace = loadedSession ? 8000 : 0,
      returnFocus = null,
      flushMs = 0,
      scrollChanged = false;
    const small = matchMedia("(max-width:1199px)");
    const allowed = () =>
      eligibleRoutes.has(getRoute()) && !getState().evidence.includes("C9");
    const save = () => {
      try {
        localStorage.setItem("stillwater-ads:v1", JSON.stringify(persistent));
      } catch {}
      try {
        sessionStorage.setItem(
          "stillwater-ads-session:v1",
          JSON.stringify(session),
        );
      } catch {}
    };
    const item = (id) => data.find((ad) => ad.id === id);
    const art = (kind, variant = 0) => {
      const marks = {
        paw: '<ellipse cx="55" cy="67" rx="23" ry="20"/><circle cx="29" cy="42" r="10"/><circle cx="48" cy="29" r="10"/><circle cx="70" cy="31" r="10"/><circle cx="87" cy="48" r="10"/>',
        film: '<rect x="22" y="22" width="70" height="62" rx="4"/><path d="M12 36H102M12 68H102" stroke="currentColor" stroke-width="6"/><path d="M49 38L73 53L49 70" fill="#fff4c9"/>',
        computer:
          '<rect x="15" y="19" width="88" height="59" rx="2"/><path d="M22 27H96V68H22Z" fill="#dce7e5"/><path d="M53 78V90H70M34 93H84" stroke="currentColor" stroke-width="7"/>',
        tv: '<rect x="14" y="30" width="91" height="57" rx="9"/><rect x="23" y="39" width="61" height="39" rx="7" fill="#e2eacb"/><path d="M46 28L30 11M66 28L83 10" stroke="currentColor" stroke-width="4"/>',
        paper:
          '<path d="M28 10H74L93 28V93H28Z"/><path d="M40 40H80M40 52H80M40 65H70" stroke="#fff" stroke-width="4"/>',
        cat: `<path d="M20 70V22L46 39Q60 32 73 39L100 22V70Q99 97 60 97Q21 97 20 70"/><path d="M37 60h8m29 0h8M55 76l7 5 7-5" stroke="#fff" stroke-width="${variant === 1 ? 5 : 3}" fill="none"/>`,
        cloud:
          '<path d="M28 79Q5 75 18 54Q23 43 37 45Q39 22 62 25Q82 25 86 45Q111 42 111 63Q110 82 90 82H28Z"/><path d="M37 91L32 102M64 91L59 102M89 91L84 102" stroke="currentColor" stroke-width="4"/>',
      };
      return `<svg viewBox="0 0 120 112" class="ad-art" aria-hidden="true" focusable="false">${marks[kind] || marks.paper}</svg>`;
    };
    function adjustLayout() {
      const dock = host.querySelector(".ad-dock");
      const visible = !!dock;
      const shell = document.querySelector("#case-shell");
      if (!shell) return;
      if (small.matches && visible && !scrollChanged) {
        const y = window.scrollY;
        document.body.classList.add("ad-rail");
        shell.scrollTop = y;
        window.scrollTo(0, 0);
        scrollChanged = true;
      } else if ((!visible || !small.matches) && scrollChanged) {
        const y = shell.scrollTop;
        document.body.classList.remove("ad-rail");
        scrollChanged = false;
        window.scrollTo(0, y);
      }
      document.body.classList.toggle("ad-rail", visible);
      document.body.classList.toggle("ad-expanded", !!active && allowed());
      document.body.style.setProperty(
        "--ad-height",
        dock ? Math.ceil(dock.getBoundingClientRect().height) + "px" : "0px",
      );
    }
    const observer = new ResizeObserver(adjustLayout);
    function renderOverlay() {
      observer.disconnect();
      if (!allowed()) {
        host.replaceChildren();
        adjustLayout();
        return;
      }
      const ad = item(active),
        pinned = ad && persistent.pinnedIds.includes(ad.id);
      host.innerHTML = ad
        ? `<aside class="ad-dock ad-card ad-${ad.kind}" aria-label="${t("广告", "Advertisement")}" data-active-ad="${ad.id}"><header><span>AD · ${t("广告", "ADVERTISEMENT")}</span><div><button data-ad-action="pin" data-ad-id="${ad.id}" ${pinned ? "disabled" : ""}>${pinned ? t("已留着", "Saved") : t("留着", "Keep")}</button>${pinned ? `<button data-ad-action="collapse" data-ad-id="${ad.id}">${t("收起", "Fold")}</button>` : ""}<button data-ad-action="close" data-ad-id="${ad.id}" aria-label="${t("关闭广告", "Close advertisement")}">×</button></div></header><div class="ad-card-body">${art(ad.kind)}<div><h2>${esc(t(...ad.headline))}</h2><p>${esc(t(...ad.copy))}</p><p class="ad-shop-name">${esc(t(...ad.name))}</p><button data-ad-action="detail" data-ad-id="${ad.id}">${esc(t(...ad.cta))} →</button></div></div></aside>`
        : persistent.pinnedIds.length
          ? `<aside class="ad-dock ad-saved-tab"><button data-ad-action="folder">${t("我留下的广告", "Saved ads")} · ${persistent.pinnedIds.length}</button></aside>`
          : "";
      const dock = host.querySelector(".ad-dock");
      if (dock) observer.observe(dock);
      adjustLayout();
    }
    function frame(title, body) {
      return `<header class="ad-dialog-heading"><h2 id="ad-dialog-title">${esc(title)}</h2><button data-ad-action="dialog-close" aria-label="${t("关闭广告详情", "Close ad details")}">×</button></header><div class="ad-dialog-content">${body}</div>`;
    }
    function openDialog(html, trigger) {
      if (document.querySelector("dialog[open]") && !dialog.open) return;
      if (!dialog.open) returnFocus = trigger || document.activeElement;
      dialog.innerHTML = html;
      if (!dialog.open) dialog.showModal();
      dialog.querySelector("[data-ad-action=dialog-close]").focus();
    }
    function openDetail(id, trigger) {
      const ad = item(id);
      if (!ad) return;
      openDialog(
        frame(
          t(...ad.name),
          `<article class="ad-mini-site ad-${ad.kind}"><p class="ad-label">AD · ${t("虚构店铺", "FICTIONAL SHOP")}</p><div class="ad-shop-intro">${art(ad.kind)}<div><h3>${esc(t(...ad.headline))}</h3><p>${esc(t(...ad.intro))}</p></div></div><div class="ad-shop-items">${ad.items.map(([title, text], index) => `<section class="ad-shop-item">${ad.kind === "cat" ? art("cat", index) : ""}<h4>${esc(t(...title))}</h4><p>${esc(t(...text))}</p></section>`).join("")}</div><p class="ad-fineprint">${esc(t(...ad.note))}</p><div class="ad-detail-actions"><button data-ad-action="pin" data-ad-id="${id}" ${persistent.pinnedIds.includes(id) ? "disabled" : ""}>${persistent.pinnedIds.includes(id) ? t("已放进广告夹", "Saved") : t("留到广告夹", "Keep this ad")}</button><button data-ad-action="folder">${t("返回广告夹", "Back to the ad folder")}</button></div><p class="ad-feedback" role="status"></p></article>`,
        ),
        trigger,
      );
    }
    function openFolder(trigger) {
      const list = persistent.pinnedIds;
      const recent = session.shownThisSession.filter(
        (id) => !list.includes(id),
      );
      const cards = (collection, saved) =>
        collection
          .map((id) => {
            const ad = item(id);
            return `<article class="ad-folder-item"><h3>${esc(t(...ad.name))}</h3><p>${esc(t(...ad.headline))}</p><div><button data-ad-action="detail" data-ad-id="${id}">${t("查看详情", "View details")}</button>${allowed() ? `<button data-ad-action="reopen" data-ad-id="${id}">${t("重新打开", "Open card")}</button>` : ""}${saved ? `<button data-ad-action="remove" data-ad-id="${id}">${t("移除", "Remove")}</button>` : ""}</div></article>`;
          })
          .join("");
      openDialog(
        frame(
          t("我的广告夹", "My ad folder"),
          `<p>${t("留下的广告存在本浏览器里，不影响工作记录。", "Saved ads stay in this browser, separately from the records.")}</p><h3>${t("我留下的广告", "Saved ads")}</h3>${list.length ? cards(list, true) : `<p>${t("还没留下广告。看到喜欢的，点“留着”就行。", "Nothing saved yet. Choose Keep on an ad to put it here.")}</p>`}${recent.length ? `<h3>${t("最近看过", "Recently seen")}</h3>${cards(recent, false)}` : ""}<details class="ad-directory"><summary>${t("小镇店铺目录", "Local shop directory")}</summary>${data.map((ad) => `<p><button data-ad-action="detail" data-ad-id="${ad.id}">${esc(t(...ad.name))}</button></p>`).join("")}</details>`,
        ),
        trigger,
      );
    }
    function inline() {
      document.querySelectorAll("[data-inline-ad]").forEach((el) => {
        if (getState().evidence.includes("C9")) {
          el.replaceChildren();
          return;
        }
        const ad = data[0];
        el.innerHTML = `<aside class="ad-inline ad-paw"><p class="ad-label">AD · ${t("广告", "ADVERTISEMENT")}</p>${art("paw")}<h3>${esc(t(...ad.headline))}</h3><p>${esc(t(...ad.copy))}</p><button data-ad-action="detail" data-ad-id="${ad.id}">${esc(t(...ad.cta))} →</button><p class="ad-shop-name">${esc(t(...ad.name))}</p></aside>`;
      });
    }
    function navigate() {
      const next = location.hash.slice(1) || getRoute(),
        changed = route !== next;
      if (changed) {
        active = null;
        if (session.lastRoute && session.lastRoute !== next)
          session.navigatedSinceShow = true;
        route = next;
        session.lastRoute = next;
      }
      if (!allowed()) active = null;
      inline();
      renderOverlay();
      save();
      lastTick = Date.now();
      if (changed && scrollChanged)
        document.querySelector("#case-shell").scrollTop = 0;
    }
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-ad-action]");
      if (!button) return;
      const action = button.dataset.adAction,
        id = button.dataset.adId;
      if (action === "detail") openDetail(id, button);
      if (action === "folder") openFolder(button);
      if (action === "dialog-close") dialog.close();
      if (action === "pin" && ids.has(id)) {
        if (!persistent.pinnedIds.includes(id)) persistent.pinnedIds.push(id);
        persistent.collapsedPinnedIds = persistent.collapsedPinnedIds.filter(
          (v) => v !== id,
        );
        save();
        renderOverlay();
        if (dialog.open) {
          button.disabled = true;
          button.textContent = t("已放进广告夹", "Saved");
          dialog
            .querySelector(".ad-feedback")
            ?.replaceChildren(
              document.createTextNode(
                t(
                  "下次可以从页脚的广告夹再打开。",
                  "Reopen it later from the footer’s ad folder.",
                ),
              ),
            );
        } else host.querySelector("[data-ad-action=collapse]")?.focus();
      }
      if (["close", "collapse"].includes(action) && ids.has(id)) {
        if (action === "close" && !session.dismissedThisSession.includes(id))
          session.dismissedThisSession.push(id);
        if (
          persistent.pinnedIds.includes(id) &&
          !persistent.collapsedPinnedIds.includes(id)
        )
          persistent.collapsedPinnedIds.push(id);
        active = null;
        save();
        renderOverlay();
        document
          .querySelector("footer [data-ad-action=folder]")
          ?.focus({ preventScroll: true });
      }
      if (action === "remove") {
        persistent.pinnedIds = persistent.pinnedIds.filter((v) => v !== id);
        persistent.collapsedPinnedIds = persistent.collapsedPinnedIds.filter(
          (v) => v !== id,
        );
        if (active === id) active = null;
        save();
        renderOverlay();
        openFolder();
      }
      if (action === "reopen" && ids.has(id) && allowed()) {
        active = id;
        persistent.collapsedPinnedIds = persistent.collapsedPinnedIds.filter(
          (v) => v !== id,
        );
        save();
        dialog.close();
        renderOverlay();
        host
          .querySelector("[data-ad-action=detail]")
          ?.focus({ preventScroll: true });
      }
    });
    dialog.addEventListener("close", () => {
      (returnFocus?.isConnected
        ? returnFocus
        : document.querySelector("footer [data-ad-action=folder]")
      )?.focus({ preventScroll: true });
    });
    const interact = () => {
      quietUntil = Date.now() + 5000;
    };
    document.addEventListener("pointerdown", interact, { passive: true });
    document.addEventListener("keydown", interact);
    document.addEventListener("visibilitychange", () => {
      lastTick = Date.now();
      grace = 5000;
      save();
    });
    small.addEventListener("change", adjustLayout);
    window.addEventListener("pagehide", save);
    setInterval(() => {
      const now = Date.now(),
        elapsed = Math.max(0, Math.min(2000, now - lastTick));
      lastTick = now;
      if (document.hidden) return;
      if (grace > 0) {
        grace = Math.max(0, grace - elapsed);
        return;
      }
      const focus = document.activeElement;
      const due = advance(session, elapsed, {
        eligible: allowed(),
        forum: getRoute() === "forum",
        visible: !document.hidden,
        quiet: now >= quietUntil,
        active: !!active,
        typing:
          focus?.matches("input,textarea,select") || focus?.isContentEditable,
        dialog: !!document.querySelector("dialog[open]"),
      });
      if (due) {
        const choices = data.filter(
          (ad) =>
            !session.shownThisSession.includes(ad.id) &&
            !session.dismissedThisSession.includes(ad.id) &&
            !persistent.pinnedIds.includes(ad.id),
        );
        if (choices.length) {
          const ad = choices[Math.floor(Math.random() * choices.length)];
          active = ad.id;
          session.shownThisSession.push(ad.id);
          session.lastShownAt = now;
          session.remaining = delay(false);
          session.navigatedSinceShow = false;
          save();
          renderOverlay();
        }
      }
      flushMs += elapsed;
      if (flushMs >= 5000) {
        flushMs = 0;
        save();
      }
    }, 1000);
    return { navigate, openFolder };
  }
  return { create, policy: { delay, freshSession, advance, eligibleRoutes } };
})();
