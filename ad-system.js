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
    Math.round((first ? 12000 : 18000) + rng() * (first ? 12000 : 18000));
  const slots = ["top-left", "bottom-right", "bottom-left", "top-right"];
  const chooseSlot = (windows, rng = Math.random) => {
    const occupied = new Set(windows.map(window => window.slot.split("-")[1]));
    const free = slots.filter(slot => !occupied.has(slot.split("-")[1]));
    return free[Math.min(free.length - 1, Math.floor(rng() * free.length))] || slots[0];
  };
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
    if (forum && !dialog) s.forumReadMs += ms;
    if (
      !eligible ||
      !quiet ||
      active ||
      typing ||
      dialog ||
      s.shownThisSession.length >= 7 ||
      (forum && s.forumReadMs < 8000)
    )
      return false;
    s.remaining = Math.max(0, s.remaining - ms);
    return s.remaining === 0;
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
            ? Math.max(0, Math.min(v.shownThisSession?.length ? 36000 : 24000, v.remaining))
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
    let active = [],
      route = "",
      lastTick = Date.now(),
      quietUntil = 0,
      grace = loadedSession ? 8000 : 0,
      returnFocus = null,
      flushMs = 0,
      scrollChanged = false;
    const small = matchMedia("(max-width:1199px)");
    const allowed = () =>
      eligibleRoutes.has(getRoute()) && (!getState().evidence.includes("C9") || getState().lastEnding === "released");
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
    const photo = (id, usage = "card") => {
      const p = globalThis.StillwaterMedia.find(id);
      return `<img class="ad-photo ad-photo-${usage}" src="assets/${esc(p.file)}" alt="${esc(t(...p.alt))}" width="${p.width}" height="${p.height}" loading="${usage === "card" ? "eager" : "lazy"}">`;
    };
    const credit = (id) => {
      const p = globalThis.StillwaterMedia.find(id);
      return `<p class="ad-photo-credit"><span class="ad-photo-title">${esc(p.title)}</span><br>${t("摄影", "Photo")}: ${esc(p.author)} · <a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">${t("来源", "Source")}</a> · <a href="${esc(p.license_url)}" target="_blank" rel="noopener noreferrer">${esc(p.license)}</a></p>`;
    };
    const capacity = () => small.matches ? 1 : 2;
    function adjustLayout() {
      const docks = [...host.querySelectorAll(".ad-dock")];
      const visible = docks.length > 0;
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
      document.body.classList.toggle("ad-expanded", active.length > 0 && allowed());
      for (const side of ["left", "right"]) {
        const widths = docks.filter(dock => dock.dataset.slot.endsWith(side))
          .map(dock => Math.ceil(dock.getBoundingClientRect().width) + 28);
        document.body.style.setProperty("--ad-" + side, Math.max(0, ...widths) + "px");
      }
      const height = small.matches && docks[0] ? Math.ceil(docks[0].getBoundingClientRect().height) : 0;
      document.body.style.setProperty("--ad-height", height + "px");
      document.body.style.setProperty("--ad-top", height && docks[0].dataset.slot.startsWith("top") ? height + "px" : "0px");
    }
    const observer = new ResizeObserver(adjustLayout);
    function renderOverlay() {
      observer.disconnect();
      if (!allowed()) {
        host.replaceChildren();
        adjustLayout();
        return;
      }
      host.innerHTML = active.map(window => {
        const ad = item(window.id), pinned = persistent.pinnedIds.includes(ad.id);
        const effect = ["cinema", "cats"].includes(ad.id) ? "blink" : ["repair", "secondhand"].includes(ad.id) ? "lights" : "none";
        return `<aside class="ad-dock ad-card ad-${ad.kind}" data-slot="${window.slot}" data-folded="${window.folded}" data-popup-effect="${effect}" aria-label="${t("广告", "Advertisement")}: ${esc(t(...ad.name))}" data-active-ad="${ad.id}"><header><span class="ad-window-title"><span aria-hidden="true">▣</span> AD · ${t("本地推荐", "Local picks")}</span><div><button data-ad-action="pin" data-ad-id="${ad.id}" ${pinned ? "disabled" : ""}>${pinned ? t("已留着", "Saved") : t("留着", "Keep")}</button><button data-ad-action="collapse" data-ad-id="${ad.id}" aria-label="${window.folded ? t("展开广告", "Expand advertisement") : t("收起广告", "Minimize advertisement")}">${window.folded ? "□" : "−"}</button><button data-ad-action="close" data-ad-id="${ad.id}" aria-label="${t("关闭广告", "Close advertisement")}">×</button></div></header>${window.folded ? "" : `<div class="ad-card-body"><p class="ad-teaser">✦ ${esc(t(...ad.tag))} ✦</p>${photo(ad.imageId)}<div><h2>${esc(t(...ad.headline))}</h2><p>${esc(t(...ad.copy))}</p><p class="ad-shop-name">${esc(t(...ad.name))}</p><button data-ad-action="detail" data-ad-id="${ad.id}">${esc(t(...ad.cta))} →</button></div></div>`}</aside>`;
      }).join("") || (persistent.pinnedIds.length ? `<aside class="ad-dock ad-saved-tab" data-slot="bottom-right"><button data-ad-action="folder">${t("我留下的广告", "Saved ads")} · ${persistent.pinnedIds.length}</button></aside>` : "");
      host.querySelectorAll(".ad-dock").forEach(dock => observer.observe(dock));
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
          `<article class="ad-mini-site ad-${ad.kind}"><p class="ad-label">AD · ${t("虚构店铺", "FICTIONAL SHOP")}</p><div class="ad-shop-intro">${photo(ad.imageId, "detail")}<div><h3>${esc(t(...ad.headline))}</h3><p>${esc(t(...ad.intro))}</p></div></div><div class="ad-shop-items">${ad.items.map(([title, text], index) => `<section class="ad-shop-item">${ad.galleryIds ? photo(ad.galleryIds[index], "gallery") : ""}<h4>${esc(t(...title))}</h4><p>${esc(t(...text))}</p></section>`).join("")}</div>${credit(ad.imageId)}${ad.galleryIds ? `<details class="ad-extra-credits"><summary>${t("作品照片署名", "Portrait photo credits")}</summary>${ad.galleryIds.map(credit).join("")}</details>` : ""}<p class="ad-fineprint">${esc(t(...ad.note))}</p><div class="ad-detail-actions"><button data-ad-action="pin" data-ad-id="${id}" ${persistent.pinnedIds.includes(id) ? "disabled" : ""}>${persistent.pinnedIds.includes(id) ? t("已放进广告夹", "Saved") : t("收藏到广告夹", "Keep this ad")}</button><button data-ad-action="folder">${t("返回广告夹", "Back to the ad folder")}</button></div><p class="ad-feedback" role="status"></p></article>`,
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
          `<p>${t("收藏的广告保存在当前浏览器，游戏进度不受影响。", "Saved ads stay in this browser, separately from the records.")}</p><h3>${t("我留下的广告", "Saved ads")}</h3>${list.length ? cards(list, true) : `<p>${t("还没留下广告。看到喜欢的，点“留着”就行。", "Nothing saved yet. Choose Keep on an ad to put it here.")}</p>`}${recent.length ? `<h3>${t("最近看过", "Recently seen")}</h3>${cards(recent, false)}` : ""}<details class="ad-directory"><summary>${t("小镇店铺目录", "Local shop directory")}</summary>${data.map((ad) => `<p><button data-ad-action="detail" data-ad-id="${ad.id}">${esc(t(...ad.name))}</button></p>`).join("")}</details>`,
        ),
        trigger,
      );
    }
    function openCredits(trigger) {
      const photos = globalThis.StillwaterMedia.photos.filter(
        (p) => p.group === "ad",
      );
      openDialog(
        frame(
          t("图片鸣谢", "Photo acknowledgements"),
          `<p>${t("以下实拍照片来自 Wikimedia Commons，用于虚构商家展示。照片中的场所、动物及摄影师不代言这些商家。原图保留，显示副本已降低分辨率并增加 JPEG 压缩。", "Existing photographs from Wikimedia Commons illustrate fictional shops. The depicted places, animals and photographers do not endorse them. Originals are retained; display copies are downsampled and JPEG-compressed.")}</p><div class="media-credit-grid">${photos.map((p) => `<article><img src="assets/${esc(p.file)}" alt="${esc(t(...p.alt))}" width="140" height="95" loading="lazy"><h3>${esc(t(...p.caption))}</h3>${credit(p.id)}</article>`).join("")}</div>`,
        ),
        trigger,
      );
    }
    function navigate() {
      const next = location.hash.slice(1) || getRoute(),
        changed = route !== next;
      if (changed) {
        if (session.lastRoute && session.lastRoute !== next)
          session.navigatedSinceShow = true;
        route = next;
        session.lastRoute = next;
      }
      if (!allowed()) active = [];
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
      if (action === "credits") openCredits(button);
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
        } else host.querySelector(`[data-active-ad="${id}"] [data-ad-action=collapse]`)?.focus({preventScroll:true});
      }
      if (["close", "collapse"].includes(action) && ids.has(id)) {
        const window = active.find(window => window.id === id);
        if (action === "collapse" && window) window.folded = !window.folded;
        if (action === "close") {
          if (!session.dismissedThisSession.includes(id)) session.dismissedThisSession.push(id);
          active = active.filter(window => window.id !== id);
        }
        if (persistent.pinnedIds.includes(id)) {
          persistent.collapsedPinnedIds = persistent.collapsedPinnedIds.filter(value => value !== id);
          if (action === "close" || window?.folded) persistent.collapsedPinnedIds.push(id);
        }
        save();
        renderOverlay();
        (action === "collapse" ? host.querySelector(`[data-active-ad="${id}"] [data-ad-action=collapse]`) : document.querySelector("footer [data-ad-action=folder]"))?.focus({preventScroll:true});
      }
      if (action === "remove") {
        persistent.pinnedIds = persistent.pinnedIds.filter((v) => v !== id);
        persistent.collapsedPinnedIds = persistent.collapsedPinnedIds.filter(
          (v) => v !== id,
        );
        active = active.filter(window => window.id !== id);
        save();
        renderOverlay();
        openFolder();
      }
      if (action === "reopen" && ids.has(id) && allowed()) {
        const window = active.find(window => window.id === id);
        if (window) window.folded = false;
        else {
          if (active.length >= capacity()) active.shift();
          active.push({id, slot: chooseSlot(active), folded:false});
        }
        persistent.collapsedPinnedIds = persistent.collapsedPinnedIds.filter(
          (v) => v !== id,
        );
        save();
        dialog.close();
        renderOverlay();
        host
          .querySelector(`[data-active-ad="${id}"] [data-ad-action=detail]`)
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
    small.addEventListener("change", () => {
      if (small.matches && active.length > 1) active = active.slice(-1);
      renderOverlay();
    });
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
        active: active.length >= capacity(),
        typing:
          focus?.matches("input,textarea,select") || focus?.isContentEditable,
        dialog: !!document.querySelector("dialog[open]"),
      });
      if (due) {
        const choices = data.filter(
          (ad) =>
            !session.shownThisSession.includes(ad.id) &&
            !session.dismissedThisSession.includes(ad.id) &&
            !persistent.pinnedIds.includes(ad.id) &&
            !active.some(window => window.id === ad.id),
        );
        if (choices.length) {
          const ad = choices[Math.floor(Math.random() * choices.length)];
          active.push({id:ad.id, slot:chooseSlot(active), folded:false});
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
  return { create, policy: { delay, freshSession, advance, eligibleRoutes, chooseSlot } };
})();
