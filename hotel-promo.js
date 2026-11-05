/* Deterministic publicity archive. No ordinary-ad pool, timer, or case progress of its own. */
globalThis.StillwaterHotelPromo = {
  create({ t, esc, getState, onAction, reduced, sound }) {
    const D = globalThis.StillwaterHotelPromoData, KEY = "stillwater-hotel-promo:v1";
    const fresh = () => ({ schema: 1, topics: [], forumSeen: false, hallSeen: false, versions: [], previewViews: 0, noticeDismissed: false, closeNoteShown: false });
    let record = fresh(), viewerVersion = "original", viewerMode = "front", zoom = 1, returnFocus = null, effectTimer = 0, printSerial = 0;
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (raw?.schema === 1) record = {
        ...fresh(),
        topics: [...new Set((Array.isArray(raw.topics) ? raw.topics : []).filter(id => globalThis.StillwaterForumData.some(p => p.id === id)))].slice(0, 20),
        forumSeen: raw.forumSeen === true, hallSeen: raw.hallSeen === true,
        versions: D.versions.map(v => v.id).filter(id => Array.isArray(raw.versions) && raw.versions.includes(id)),
        previewViews: Math.max(0, Math.min(100, Number(raw.previewViews) || 0)),
        noticeDismissed: raw.noticeDismissed === true, closeNoteShown: raw.closeNoteShown === true,
      };
    } catch {}
    const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(record)); } catch {} };
    const button = (action, text, attrs = "") => `<button type="button" data-promo-action="${action}" ${attrs}>${text}</button>`;
    const version = id => D.versions.find(v => v.id === id) || D.versions[0];
    const available = () => getState().night.started ? D.versions : D.versions.slice(0, 1);
    const currentVersion = () => getState().lastEnding === "released" ? "original" : getState().night.started ? record.hallSeen ? "preview" : "synced" : "original";
    const canScare = () => !getState().preferences.skipScares && !reduced() && !document.hidden;
    const dialog = document.createElement("dialog");
    dialog.id = "hotel-promo-viewer";
    dialog.className = "hotel-promo-dialog";
    dialog.setAttribute("aria-labelledby", "promo-viewer-title");
    document.body.append(dialog);

    function scan(id, { clean = false } = {}) {
      const v=version(id), preview=id==='preview', shape=preview&&!getState().preferences.skipScares;
      const maskId='promo-natural-'+(++printSerial);
      // Use one immutable photograph. Generated edits are composited only inside
      // the real plaque and, in the preview, the service-door recess. The rest
      // of the photograph stays identical across all three versions.
      const edits=id==='original'?'':`<image class="promo-revision-image" href="${v.image}" width="1000" height="750" preserveAspectRatio="xMidYMid slice" mask="url(#${maskId}-plaque)"/>`;
      const face=shape?`<image class="promo-distant-figure" data-promo-face href="${v.image}" width="1000" height="750" preserveAspectRatio="xMidYMid slice" mask="url(#${maskId}-recess)"/>`:'';
      return `<span class="promo-print ${clean?'promo-clean-print':''}" data-promo-image="${v.id}" data-preview-haunt="${shape}"><svg viewBox="0 0 1000 750" role="img" data-promo-signs="316 / ${v.sign} / 318" aria-label="${esc(t(`W3-02 三楼西侧走廊，门牌从左到右：316 / ${v.sign} / 318；可放大查看`,`W3-02, third-floor west corridor; door signs from left to right: 316 / ${v.sign} / 318. Enlarge to inspect`))}"><defs><filter id="${maskId}-soft"><feGaussianBlur stdDeviation=".7"/></filter><mask id="${maskId}-plaque" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="750"><path d="${D.editRegions.plaque}" fill="white" filter="url(#${maskId}-soft)"/></mask><mask id="${maskId}-recess" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="750"><path d="${D.editRegions.recess}" fill="white" filter="url(#${maskId}-soft)"/></mask></defs><image class="promo-base-image" href="${D.baseImage}" width="1000" height="750" preserveAspectRatio="xMidYMid slice"/>${edits}${face}<rect class="promo-print-footer" x="0" y="690" width="1000" height="60" fill="#e4d9bc"/><g fill="#514a3e" font-family="monospace" font-size="15"><text x="24" y="715">W3-02 / WEST WING, 3F / 2006</text><text x="24" y="737">${v.stamp}</text></g></svg><span class="promo-paper-wear" aria-hidden="true"></span><span class="promo-source-echo" aria-hidden="true"><i></i></span></span>`;
    }
    function card(site, id = currentVersion()) {
      const copy = id === "original" ? site === "forum" ? D.forum : site === "careers" ? D.careers : D.leaflet : D[id];
      const action = id === "original" && !["forum", "careers"].includes(site) ? t("查看原始宣传照", "View the original publicity print") : t(...copy.action);
      return `<section class="hotel-promo-placement hotel-promo-${site}" data-promo-placement="${site}"><p class="promo-tag">${t(...copy.tag)}</p><h2>${t(...copy.title)}</h2>${scan(id)}<p>${t(...copy.text)}</p>${id === "original" && !["forum", "careers"].includes(site) ? `<p class="promo-caption">${t(...D.leaflet.caption)}</p>` : ""}${id === "synced" ? `<span class="promo-sync-label">${t("资料已同步", "SYNCHRONIZED")}</span>` : ""}<div class="promo-card-actions">${button("open", action, `data-version="${id}" data-origin="${site}"`)}${site === "cameras" ? button("dismiss", t("关闭提醒", "Dismiss update")) : ""}</div>${copy.note ? `<p class="promo-fineprint">${t(...copy.note)}</p>` : ""}<p class="promo-close-note" role="status"></p></section>`;
    }
    function mount(route) {
      if (["chat", "void", "ending"].includes(route)) {
        stopEffects();
        if (dialog.open) dialog.close();
        return;
      }
      if (route === "forum") {
        const topic = new URLSearchParams(location.hash.split("?")[1] || "").get("topic");
        if (globalThis.StillwaterForumData.some(p => p.id === topic)) {
          if (topic !== "job" && !record.topics.includes(topic)) record.topics.push(topic);
          if (topic === "job" || record.topics.length >= 2) record.forumSeen = true;
        }
        if (record.forumSeen) document.querySelector(".bbs-sidebar")?.insertAdjacentHTML("beforeend", card("forum"));
      } else if (route === "careers") {
        document.querySelector(".career-content-layout")?.insertAdjacentHTML("afterend", card("careers"));
      } else if (["gallery", "history"].includes(route)) {
        document.querySelector("#content")?.insertAdjacentHTML("beforeend", card("hotel", "original"));
      } else if (route === "mirror" && getState().night.started && getState().lastEnding !== "released") {
        document.querySelector("#content")?.insertAdjacentHTML("beforeend", card("archive", "synced"));
      } else if (route === "cameras" && getState().night.started && getState().lastEnding !== "released") {
        record.hallSeen = true;
        if (!record.noticeDismissed) document.querySelector(".camera-grid")?.insertAdjacentHTML("afterend", card("cameras", "preview"));
      }
      if (route !== "chat" && !["void", "ending"].includes(route)) {
        const footer = document.querySelector("#case-shell > footer");
        if (footer) footer.insertAdjacentHTML("beforeend", ` <span class="promo-footer-separator"> · </span>${button("archive", t("宣传资料", "Publicity archive"), 'class="footer-settings"')}`);
      }
      persist();
    }
    function renderViewer(focus = "") {
      const original = viewerVersion === "original", back = viewerMode === "back";
      const noraNote=globalThis.StillwaterStoryV13?.active(getState())?t('西侧走廊。周五拍的。中间这门不是客房，别给新来的弄错。—— N.B.','West corridor. Taken Friday. Middle door is not a guest room. Don’t let the new staff get it wrong. — N.B.'):'';
      const scanControls = original ? `<div class="promo-scan-controls">${button("print-mode", t("扫描原件", "Scanned print"), 'data-mode="front" aria-pressed="' + (viewerMode === "front") + '"')}${button("print-mode", t("清理后的样张", "Cleaned scan"), 'data-mode="clean" aria-pressed="' + (viewerMode === "clean") + '"')}${button("print-mode", t(...D.leaflet.action), 'data-mode="back" aria-pressed="' + back + '"')}</div>` : "";
      dialog.innerHTML = `<header class="promo-dialog-heading"><div><p class="promo-tag">${t(...D.leaflet.tag)}</p><h2 id="promo-viewer-title">${t(...D.leaflet.title)}</h2></div>${button("close", t("关闭", "Close"), 'aria-label="' + t("关闭宣传资料", "Close publicity archive") + '"')}</header><div class="promo-viewer-body"><div class="promo-version-tabs" role="group" aria-label="${t("宣传图片版本", "Publicity image version")}">${available().map(v => button("version", t(...v.label), `data-version="${v.id}" aria-pressed="${v.id === viewerVersion}"`)).join("")}</div><p>${t(...D.leaflet.text)}</p>${scanControls}${back ? `<div class="promo-print-back"><span>STILLWATER / PUBLICITY</span><p>${t(...D.leaflet.back)}</p></div>` : `<div class="promo-zoom-controls">${button("zoom", t("原大小", "Fit image"), `data-zoom="1" aria-pressed="${zoom === 1}"`)}${button("zoom", t("放大检查", "Enlarge image"), `data-zoom="2" aria-pressed="${zoom === 2}"`)}</div><div class="promo-zoom-area" tabindex="0" aria-label="${t("照片；放大后可以滚动查看", "Photograph; scroll to inspect when enlarged")}"><div data-promo-zoom="${zoom === 1 ? "fit" : "large"}" style="width:${zoom * 100}%">${scan(viewerVersion, { clean: viewerMode === "clean" })}</div></div>`}<p class="promo-caption">${original ? t(...D.leaflet.caption) : t(...version(viewerVersion).label)}</p><details class="promo-image-details"><summary>${t("图片详情", "Image details")}</summary><p>${t(...D.synced.details)}</p><p>${t(...D.leaflet.back)}</p><a href="assets/hotel-promo-v2/SOURCES.md" target="_blank" rel="noopener">${t("画面素材与来源", "Artwork and provenance")}</a></details><p class="promo-fineprint">${t(...D.forum.note)}</p></div>`;
      if(back&&noraNote){const paragraph=document.createElement('p');paragraph.className='promo-pencil-note';paragraph.textContent=noraNote;dialog.querySelector('.promo-print-back')?.append(paragraph);}
      if (focus) dialog.querySelector(focus)?.focus({ preventScroll: true });
    }
    function open(id = "original", trigger, origin = "") {
      if (["chat", "void", "ending"].includes(location.hash.slice(1).split("?")[0])) return;
      if (!available().some(v => v.id === id)) id = "original";
      if (!dialog.open && document.querySelector("dialog[open]")) return;
      viewerVersion = id; viewerMode = "front"; zoom = 1; returnFocus = trigger || document.activeElement;
      if (!record.versions.includes(id)) record.versions.push(id);
      if (id === "preview") record.previewViews = Math.min(100, record.previewViews + 1);
      persist(); renderViewer();
      if (!dialog.open) dialog.showModal();
      dialog.querySelector('[data-promo-action="close"]')?.focus({ preventScroll: true });
      if (origin === "careers") dialog.dataset.sample = "true";
      else delete dialog.dataset.sample;
      if (id === "preview" && canScare()) sound();
    }
    function renderCheck() {
      const s = getState(), p = s.promo;
      if (!globalThis.StillwaterVoidModel.ready(s.night) || p.legacy || s.night.void.entered) return "";
      const confirmed = p.selected === "original";
      const regions = [["left", t("左侧门牌", "Left door sign")], ["middle", t("中间门牌", "Middle door sign")], ["right", t("右侧门牌", "Right door sign")], ["lamp", t("上方灯具", "Overhead lamp")]];
      const comparison = id => `<figure class="promo-comparison-image"><figcaption>${t(...version(id).label)}</figcaption><div class="promo-image-regions">${scan(id)}${regions.map(([target, label]) => button("mark", "", `class="promo-region promo-region-${target}" data-target="${target}" aria-label="${label}"`)).join("")}</div></figure>`;
      return `<section class="promo-check-panel" aria-labelledby="promo-check-title"><p class="promo-tag">B-3 / W3-02</p><h2 id="promo-check-title">${t(...D.check.title)}</h2><p>${t(...D.check.intro)}</p>${button("archive", t(...D.check.archive), 'class="promo-archive-link"')}<h3>${t(...D.check.heading)}</h3>${p.verified ? `<div class="promo-check-success" role="status"><p>${t(...D.check.success)}</p><a href="#void" data-unlisted-entry>${t(...D.check.action)} →</a></div>${scan("original")}` : `<div class="promo-source-cards" role="group" aria-label="${t("选择最早的可信来源", "Choose the earliest reliable source")}">${D.versions.map(v => button("source", `${scan(v.id)}<span>${t(...v.label)}</span>`, `class="promo-source-card" data-version="${v.id}" aria-pressed="${p.selected === v.id}"`)).join("")}</div>${confirmed ? `<div class="promo-comparison">${comparison("original")}${comparison("synced")}</div><div class="promo-mark-controls" role="group" aria-label="${t("指出照片中变化的位置", "Identify the changed part of the photograph")}">${regions.map(([target, label]) => button("mark", label, `data-target="${target}"`)).join("")}</div>` : ""}`}<p id="promo-check-feedback" role="status"></p></section>`;
    }
    function stopEffects() {
      clearTimeout(effectTimer);
      document.querySelectorAll(".promo-echo-active").forEach(el => el.classList.remove("promo-echo-active"));
    }
    function echo() {
      if (!canScare() || dialog.open || document.querySelector("dialog[open]")) return;
      const print = document.querySelector('.promo-check-panel [data-promo-image="original"]');
      if (!print) return;
      print.classList.add("promo-echo-active"); sound();
      effectTimer = setTimeout(stopEffects, 650);
    }
    function closeNote() {
      if (viewerVersion !== "preview" || record.closeNoteShown) return;
      record.closeNoteShown = true; persist();
      const status = document.querySelector(".hotel-promo-cameras .promo-close-note");
      if (status) status.textContent = t(...D.preview.closed);
    }
    dialog.addEventListener("close", () => {
      closeNote();
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    });
    document.addEventListener("click", event => {
      const control = event.target.closest("[data-promo-action]");
      if (!control) return;
      const act = control.dataset.promoAction;
      if (act === "open") open(control.dataset.version, control, control.dataset.origin);
      if (act === "archive") open("original", control);
      if (act === "close") dialog.close();
      if (act === "version") {
        viewerVersion = available().some(v => v.id === control.dataset.version) ? control.dataset.version : "original";
        if (!record.versions.includes(viewerVersion)) record.versions.push(viewerVersion);
        if (viewerVersion === "preview") record.previewViews = Math.min(100, record.previewViews + 1);
        persist(); viewerMode = "front"; zoom = 1; renderViewer(`[data-promo-action=version][data-version=${viewerVersion}]`);
      }
      if (act === "print-mode") { viewerMode = ["front", "clean", "back"].includes(control.dataset.mode) ? control.dataset.mode : "front"; renderViewer(`[data-promo-action=print-mode][data-mode=${viewerMode}]`); }
      if (act === "zoom") { zoom = control.dataset.zoom === "2" ? 2 : 1; renderViewer(`[data-promo-action=zoom][data-zoom="${zoom}"]`); }
      if (act === "dismiss") {
        record.noticeDismissed = true; record.closeNoteShown = true; persist();
        const host = control.closest(".hotel-promo-placement");
        const note = document.createElement("p"); note.className = "promo-dismissed-note"; note.setAttribute("role", "status"); note.tabIndex = -1; note.textContent = t(...D.preview.closed);
        host?.replaceWith(note); note.focus({ preventScroll: true });
      }
      if (["source", "mark"].includes(act)) {
        const result = onAction(act, { version: control.dataset.version, target: control.dataset.target });
        const feedback = document.querySelector("#promo-check-feedback");
        if (feedback && !result.ok) feedback.textContent = t(...(result.error === "promo-unchanged" ? D.check.unchanged : D.check.later));
        const next = getState().promo.verified ? document.querySelector("[data-unlisted-entry]") : act === "source" ? document.querySelector(`[data-promo-action=source][data-version="${control.dataset.version}"]`) : document.querySelector(`.promo-mark-controls [data-target="${control.dataset.target}"]`);
        if (getState().promo.verified) next?.scrollIntoView({ block: "center", behavior: "instant" });
        next?.focus({ preventScroll: true });
        if (result.event === "promo-source-echo") echo();
      }
    });
    window.addEventListener("hashchange", () => { stopEffects(); if (dialog.open) dialog.close(); });
    document.addEventListener("visibilitychange", () => { if (document.hidden) stopEffects(); });
    return {
      mount, renderCheck, stopEffects,
      reset() {
        stopEffects(); viewerVersion = "original"; viewerMode = "front"; zoom = 1; returnFocus = null;
        if (dialog.open) dialog.close(); record = fresh(); persist();
      },
    };
  },
};
