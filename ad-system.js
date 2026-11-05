/* Independent scenery state. Never calls or modifies the case progression model. */
globalThis.StillwaterAds = (() => {
  const eligibleRoutes = new Set([
    "chat",
    "forum",
    "careers",
    "hotel",
    "rooms",
    "guestbook",
    "history",
  ]);
  const delay = (first, rng = Math.random) =>
    Math.round((first ? 3000 : 4000) + rng() * (first ? 2000 : 3000));
  const slots = ["top-left", "bottom-right", "bottom-right", "bottom-left", "top-right"];
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
    lastShownById: {},
    blockedUntil: {},
    lastAdId: "",
    appearances: 0,
  });
  function chooseCampaign(s, data, {activeIds=[],pinnedIds=[],now=Date.now(),rng=Math.random}={}) {
    const free=data.filter(ad=>!activeIds.includes(ad.id)&&!pinnedIds.includes(ad.id)&&!(s.blockedUntil?.[ad.id]>now));
    const unseen=free.filter(ad=>!s.shownThisSession.includes(ad.id));
    let pool=unseen.length?unseen:free.filter(ad=>ad.id!==s.lastAdId);
    if(!pool.length)pool=free;
    if(!pool.length)return null;
    const oldest=Math.min(...pool.map(ad=>s.lastShownById?.[ad.id]||0));
    pool=pool.filter(ad=>(s.lastShownById?.[ad.id]||0)===oldest);
    return pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];
  }
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
      (forum && s.forumReadMs < 3000)
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
            ? Math.max(0, Math.min(v.shownThisSession?.length ? 7000 : 5000, v.remaining))
            : delay(true),
          lastShownAt: Number.isFinite(v.lastShownAt) ? v.lastShownAt : 0,
          navigatedSinceShow: v.navigatedSinceShow === true,
          lastRoute:
            typeof v.lastRoute === "string" ? v.lastRoute.slice(0, 180) : "",
          forumReadMs: Number.isFinite(v.forumReadMs)
            ? Math.max(0, v.forumReadMs)
            : 0,
          lastShownById:Object.fromEntries([...ids].filter(id=>Number.isFinite(v.lastShownById?.[id])).map(id=>[id,Math.max(0,v.lastShownById[id])])),
          blockedUntil:Object.fromEntries([...ids].filter(id=>Number.isFinite(v.blockedUntil?.[id])).map(id=>[id,Math.max(0,Math.min(Date.now()+45000,v.blockedUntil[id]))])),
          lastAdId:ids.has(v.lastAdId)?v.lastAdId:"",
          appearances:Number.isInteger(v.appearances)?Math.max(0,Math.min(100000,v.appearances)):validIds(v.shownThisSession).length,
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
      grace = loadedSession ? 4000 : 0,
      returnFocus = null,
      flushMs = 0;
    const small = matchMedia("(max-width:1199px)");
    const allowed = () =>
      getState().preferences.popupAds !== false && eligibleRoutes.has(getRoute()) && (getRoute() === "chat" || !getState().evidence.includes("C9") || getState().lastEnding === "released");
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
    const capacity = () => getRoute() === "chat" || small.matches ? 1 : 2;
    const position = () => getRoute() === "chat" ? "bottom-right" : chooseSlot(active);
    const variant = id => data.findIndex(ad => ad.id === id) < 7 && Math.random() < .25 ? "classic" : "campaign";
    const campaigns=globalThis.StillwaterAdCampaigns.create({t,esc,photo});
    function renderOverlay() {
      if (!allowed()) {
        host.replaceChildren();
        return;
      }
      const focus=document.activeElement;
      const focused=focus?.closest('[data-active-ad]')?{id:focus.dataset.adId,action:focus.dataset.adAction}:null;
      const fragments=active.map(window => {
        const ad = item(window.id), pinned = persistent.pinnedIds.includes(ad.id), classic=window.variant==="classic";
        const key=`${ad.id}:${window.slot}:${window.folded}:${pinned}:${classic}`;
        return {id:ad.id,key,html:`<aside class="ad-dock ad-card ad-${ad.kind}" data-layout="${campaigns.layout(ad,classic)}" data-slot="${window.slot}" data-folded="${window.folded}" data-popup-effect="${campaigns.effect(ad,classic)}" aria-label="${t("广告", "Advertisement")}: ${esc(t(...ad.name))}" data-active-ad="${ad.id}"><header><span class="ad-window-title"><span aria-hidden="true">▣</span> ${esc(campaigns.title(ad,classic))}</span><div><button data-ad-action="pin" data-ad-id="${ad.id}" ${pinned ? "disabled" : ""}>${pinned ? t("已留着", "Saved") : t("留着", "Keep")}</button><button data-ad-action="collapse" data-ad-id="${ad.id}" aria-label="${window.folded ? t("展开广告", "Expand advertisement") : t("收起广告", "Minimize advertisement")}">${window.folded ? "□" : "−"}</button><button data-ad-action="close" data-ad-id="${ad.id}" aria-label="${t("关闭广告", "Close advertisement")}">×</button></div></header>${window.folded ? "" : campaigns.body(ad,classic)}</aside>`};
      });
      for(const node of [...host.children])if(!fragments.some(f=>f.id===node.dataset.activeAd))node.remove();
      for(const fragment of fragments) {
        const old=host.querySelector(`[data-active-ad="${fragment.id}"]`);
        if(old?.dataset.renderKey===fragment.key)continue;
        const template=document.createElement('template');template.innerHTML=fragment.html;
        const node=template.content.firstElementChild;node.dataset.renderKey=fragment.key;
        if(old)old.replaceWith(node);else host.append(node);
      }
      if(!active.length&&persistent.pinnedIds.length)host.innerHTML=`<aside class="ad-dock ad-saved-tab" data-slot="bottom-right"><button data-ad-action="folder">${t("我留下的广告", "Saved ads")} · ${persistent.pinnedIds.length}</button></aside>`;
      if(focused)host.querySelector(`[data-active-ad="${focused.id}"] [data-ad-action="${focused.action}"]`)?.focus({preventScroll:true});
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
          `<article class="ad-mini-site ad-${ad.kind}"><p class="ad-label">AD · ${t("虚构店铺", "FICTIONAL SHOP")}</p><div class="ad-shop-intro">${photo(ad.imageId, "detail")}<div><h3>${esc(t(...ad.headline))}</h3><p>${esc(t(...ad.intro))}</p></div></div><div class="ad-shop-items">${ad.items.map(([title, text], index) => `<section class="ad-shop-item">${ad.galleryIds ? photo(ad.galleryIds[index], "gallery") : ""}<h4>${esc(t(...title))}</h4><p>${esc(t(...text))}</p></section>`).join("")}</div>${credit(ad.imageId)}${ad.galleryIds ? `<details class="ad-extra-credits"><summary>${t("照片来源与许可", "Photo credits & licences")}</summary>${ad.galleryIds.map(credit).join("")}</details>` : ""}<p class="ad-fineprint">${esc(t(...ad.note))}</p><div class="ad-detail-actions"><button data-ad-action="pin" data-ad-id="${id}" ${persistent.pinnedIds.includes(id) ? "disabled" : ""}>${persistent.pinnedIds.includes(id) ? t("已放进广告夹", "Saved") : t("收藏到广告夹", "Keep this ad")}</button>${allowed() ? `<button data-ad-action="reopen" data-ad-id="${id}">${t("预览弹窗", "Preview popup")}</button>` : ""}<button data-ad-action="folder">${t("返回广告夹", "Back to the ad folder")}</button></div><p class="ad-feedback" role="status"></p></article>`,
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
          `<p>${t("广告收藏保存在当前浏览器，与游戏进度分开保存。", "Saved ads stay in this browser, separately from the records.")}</p><h3>${t("我留下的广告", "Saved ads")}</h3>${list.length ? cards(list, true) : `<p>${t("这里还没有收藏。看到想再看的广告，点“留着”即可。", "Nothing saved yet. Choose Keep on an ad to put it here.")}</p>`}${recent.length ? `<h3>${t("最近看过", "Recently seen")}</h3>${cards(recent, false)}` : ""}<details class="ad-directory"><summary>${t("小镇店铺目录", "Local shop directory")}</summary>${data.map((ad) => `<p><button data-ad-action="detail" data-ad-id="${ad.id}">${esc(t(...ad.name))}</button></p>`).join("")}</details>`,
        ),
        trigger,
      );
    }
    function openCredits(trigger) {
      const used = new Set(data.flatMap(ad => [ad.imageId, ...(ad.galleryIds || [])]));
      const photos = globalThis.StillwaterMedia.photos.filter(p => used.has(p.id));
      openDialog(
        frame(
          t("图片鸣谢", "Photo acknowledgements"),
          `<p>${t("广告中的实拍照片来自 Wikimedia Commons。店铺是虚构的，与照片中的场所、动物及摄影师无关。页面使用低清压缩副本，原图和许可保留。", "Existing photographs from Wikimedia Commons illustrate fictional shops. The depicted places, animals and photographers do not endorse them. Originals are retained; display copies are downsampled and JPEG-compressed.")}</p><div class="media-credit-grid">${photos.map((p) => `<article><img src="assets/${esc(p.file)}" alt="${esc(t(...p.alt))}" width="140" height="95" loading="lazy"><h3>${esc(t(...p.caption))}</h3>${credit(p.id)}</article>`).join("")}</div>`,
        ),
        trigger,
      );
    }
    function navigate() {
      const fromChat = route.split("?")[0] === "chat";
      const next = location.hash.slice(1) || getRoute(),
        changed = route !== next;
      if (changed) {
        if (session.lastRoute && session.lastRoute !== next)
          session.navigatedSinceShow = true;
        route = next;
        session.lastRoute = next;
      }
      if (!allowed()) active = [];
      else if (getRoute() === "chat") active = active.slice(-1).map(window => ({...window, slot:"bottom-right"}));
      else if (fromChat) active = active.map(window => ({...window, slot:chooseSlot([])}));
      renderOverlay();
      save();
      lastTick = Date.now();
    }
    document.addEventListener("click", (event) => {
      if(campaigns.handle(event))return;
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
                  "已收藏，可随时从“我的广告夹”重新打开。",
                  "Saved. Reopen it later from My ad folder.",
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
          session.blockedUntil[id]=Date.now()+45000;
        }
        if (persistent.pinnedIds.includes(id)) {
          persistent.collapsedPinnedIds = persistent.collapsedPinnedIds.filter(value => value !== id);
          if (action === "close" || window?.folded) persistent.collapsedPinnedIds.push(id);
        }
        save();
        renderOverlay();
        (action === "collapse" ? host.querySelector(`[data-active-ad="${id}"] [data-ad-action=collapse]`) : document.querySelector(getRoute() === "chat" ? "#chat-input" : "footer [data-ad-action=folder]"))?.focus({preventScroll:true});
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
          active.push({id, slot: position(), folded:false,variant:variant(id),openedAt:Date.now(),lifetime:30000+Math.round(Math.random()*10000)});
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
        : document.querySelector(getRoute() === "chat" ? "#chat-input" : "footer [data-ad-action=folder]")
      )?.focus({ preventScroll: true });
    });
    const interact = () => {
      quietUntil = Date.now() + 1500;
    };
    document.addEventListener("pointerdown", interact, { passive: true });
    document.addEventListener("keydown", event => {
      interact();
      if(event.key!=="Escape"||event.defaultPrevented||document.querySelector("dialog[open]"))return;
      const focused=document.activeElement?.closest("#ad-host [data-active-ad]");
      if(!focused&&document.activeElement?.matches("input,textarea,select,[contenteditable=true]"))return;
      const top=focused||[...host.querySelectorAll("[data-active-ad]")].at(-1);
      const close=top?.querySelector("[data-ad-action=close]");
      if(close){event.preventDefault();close.click();}
    });
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
      const replacement=active.find(window=>!window.folded&&!persistent.pinnedIds.includes(window.id)&&now-window.openedAt>=window.lifetime&&!host.querySelector(`[data-active-ad="${window.id}"]`)?.matches(':hover')&&!host.querySelector(`[data-active-ad="${window.id}"]`)?.contains(focus));
      const due = advance(session, elapsed, {
        eligible: allowed(),
        forum: getRoute() === "forum",
        visible: !document.hidden,
        quiet: now >= quietUntil,
        active: active.length >= capacity()&&!replacement,
        typing: getRoute() !== "chat" &&
          (focus?.matches("input,textarea,select") || focus?.isContentEditable),
        dialog: !!document.querySelector("dialog[open]"),
      });
      if (due) {
        const ad=chooseCampaign(session,data,{activeIds:active.map(window=>window.id),pinnedIds:persistent.pinnedIds,now});
        if (ad) {
          if(active.length>=capacity())active=active.filter(window=>window!==replacement);
          active.push({id:ad.id, slot:position(), folded:false,variant:variant(ad.id),openedAt:now,lifetime:30000+Math.round(Math.random()*10000)});
          if(!session.shownThisSession.includes(ad.id))session.shownThisSession.push(ad.id);
          session.lastShownById[ad.id]=now;session.lastAdId=ad.id;session.appearances++;
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
  return { create, policy: { delay, freshSession, advance, eligibleRoutes, chooseSlot,chooseCampaign } };
})();
