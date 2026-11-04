/* Old archive workstation. This module renders and dispatches; case-state validates. */
globalThis.StillwaterEvidence = {
  create({ getState, t, esc, onAction }) {
    const D = globalThis.StillwaterCaseData,
      M = globalThis.StillwaterCaseState;
    let lastError = null;
    const S = () => getState(),
      desk = () => S().desk;
    const button = (op, label, attrs = "") =>
      `<button type="button" data-desk-op="${op}" ${attrs}>${label}</button>`;
    const link = (route, label) => `<a href="#${esc(route)}">${esc(label)}</a>`;
    const status = (key) => !!desk().results[key];
    function error(result) {
      const copy = {
        "desk-unavailable": [
          "这份核对所需的资料还未开放。",
          "The source files for this review are not open yet.",
        ],
        "desk-intake": [
          "先完成样本登记，正式核对会继续保留。",
          "Complete sample intake first. Your review draft is retained.",
        ],
        "desk-source-missing": [
          "还缺少一份原始资料：",
          "An original source is still needed: ",
        ],
        "desk-source-unrelated": [
          "附上的资料中有不支持本项判断的记录。请保留与这项核对直接相关的原件。",
          "One or more attached files do not support this review. Keep the original sources relevant to this finding.",
        ],
        "desk-compare": [
          "先分别打开样本和预订单，并把两份文件放入对照栏。",
          "Open the sample and booking, then add both to the comparison.",
        ],
        "desk-compare-full": [
          "对照栏已放了两份文件。先移出其中一份，再添加。",
          "Two files are already being compared. Remove one before adding another.",
        ],
        "desk-room": [
          "客房目录中没有对应的可预订房号。请核对目录范围。",
          "No corresponding bookable room is listed. Check the directory’s scope.",
        ],
        "desk-occupancy": [
          "区域编号不能确认实际入住。请检查记录用途。",
          "A position number does not establish occupancy. Check the purpose of the record.",
        ],
        "audit-order-first": [
          "时间顺序还未确认，可回夜审记录继续调整。",
          "The sequence has not been confirmed. Reopen the night records to finish ordering them.",
        ],
        "audit-record-type": [
          "记录性质还未核对清楚。巡查所见、系统操作和入住判断需要分开。",
          "The record types still need review. Distinguish the round’s observation, a system operation and an occupancy claim.",
        ],
        "audit-assessment": [
          "现有记录没有补足实际入住的依据。请核对每份记录的范围。",
          "The sources do not fill the gap in evidence of actual occupancy. Check what each record covers.",
        ],
        "audit-never": [
          "无法确认入住，也不等于能证明从未有人进入。",
          "Unverified occupancy does not establish that nobody ever entered.",
        ],
        "desk-role": [
          "请核对原始员工编号与预订单住客字段。",
          "Compare the original staff identifier with the booking’s guest field.",
        ],
        "desk-attendance": [
          "系统分配了工作，但尚未找到实际到岗记录。",
          "The system assigned work, but an arrival record has not been found.",
        ],
        "desk-finding": [
          "这项判断没有得到所附原件的支持。草稿和之前的核对仍已保存。",
          "The cited originals do not support this finding. Your draft and earlier reviews are retained.",
        ],
        "desk-footage": [
          "录像尚未恢复。先检查原始录像线路和 03:17 缓存帧。",
          "The recording is not restored yet. Check the original circuit and the 03:17 cached frame.",
        ],
      };
      const text = t(...(copy[result.error] || copy["desk-finding"]));
      return (
        text + (result.document ? t(...D.documents[result.document].title) : "")
      );
    }
    function hints(key) {
      const level = desk().hints[key] || 0;
      return `<div class="desk-hints"><span>${t("核对帮助", "Review help")}</span>${
        level
          ? `<ol>${D.hints[key]
              .slice(0, level)
              .map((pair) => `<li>${esc(t(...pair))}</li>`)
              .join("")}</ol>`
          : ""
      }${level < 3 ? button("hint", level ? t("再看一级提示", "Next hint") : t("查看提示", "Need help?"), `data-key="${key}"`) : `<small>${t("已查看全部三级提示", "All three hints opened")}</small>`}</div>`;
    }
    function goal(compact = false) {
      const o = M.objective(S());
      return `<section class="investigation-focus${compact ? " compact" : ""}" aria-label="${t("当前调查", "Current investigation")}"><p class="desk-label">${t("当前调查", "CURRENT REVIEW")}</p><${compact ? "p" : "h2"}>${esc(t(...o.title))}</${compact ? "p" : "h2"}><div class="investigation-directions">${o.directions
        .slice(0, 3)
        .map(([route, title]) => link(route, t(...title)))
        .join("")}</div></section>`;
    }
    function documentView(id, { comparison = false } = {}) {
      const doc = D.documents[id];
      if (!doc || !desk().discovered.includes(id))
        return `<p>${t("选择一份已发现的资料。", "Select a retained source.")}</p>`;
      const marks = desk().marks[id] || [];
      let media = "";
      if (id === "footage") {
        const p = desk().footage;
        if (p)
          media = `<div class="desk-footage cctv-frame" data-cctv-phase="altered"><canvas width="480" height="360" data-desk-footage aria-label="${t("保存的 03:17 服务通道画面", "Retained 03:17 service-passage picture")}"></canvas><p>CAM 03 / 2006-10-17 03:17:00 / READ ONLY</p></div>`;
      }
      return `<article class="desk-source" data-desk-document="${id}"><header><small>${esc(doc.group)} / SOURCE FILE</small><h3>${esc(t(...doc.title))}</h3><p>${esc(doc.reference)}<br><time>${esc(doc.at)}</time></p></header>${media}<table><caption>${t("原始记录 · 点字段可作标记", "Source record · select a field to mark it")}</caption><tbody>${doc.rows.map((r) => `<tr class="${marks.includes(r.id) ? "desk-marked" : ""}"><th>${button("mark", esc(t(...r.label)), `data-document="${id}" data-field="${r.id}" aria-pressed="${marks.includes(r.id)}"`)}</th><td>${esc(t(...r.value))}</td></tr>`).join("")}</tbody></table><p class="desk-source-origin">${t("出处", "Source")}: ${link(doc.route, doc.route)}</p><div class="desk-file-actions">${comparison ? button("drop", t("移出对照", "Remove from comparison"), `data-document="${id}"`) : button("compare", t("加入对照", "Compare this file"), `data-document="${id}"`)}${link(doc.route, t("打开原网页", "Open source page"))}</div></article>`;
    }
    function comparison() {
      return `<section class="desk-comparison" aria-label="${t("两份原件对照", "Compare two originals")}"><h2>${t("原件对照", "Source comparison")} <small>${desk().compare.length}/2</small></h2><div class="desk-pair">${
        desk()
          .compare.map((id) => documentView(id, { comparison: true }))
          .join("") ||
        `<p class="desk-empty">${t("在文件下方选择“加入对照”，可并排查看两份原件。", "Choose “Compare this file” below a source to view two originals side by side.")}</p>`
      }</div></section>`;
    }
    function typeReview() {
      return `<fieldset class="desk-record-types"><legend>${t("记录性质", "Record type")}</legend>${D.recordTypes.map((row) => `<label>${esc(t(...row.text))}<select data-desk-input="type" data-key="timeline" data-field="${row.id}" aria-label="${esc(t(...row.text))}"><option value="">${t("选择性质", "Choose a type")}</option>${D.typeOptions.map((o) => `<option value="${o.id}" ${desk().recordTypes[row.id] === o.id ? "selected" : ""}>${esc(t(...o.label))}</option>`).join("")}</select></label>`).join("")}</fieldset>`;
    }
    function proofPanel(key, { final = false } = {}) {
      const spec = D.proofs[key],
        input = M.proofDraft(S(), key);
      if (!spec || !M.proofAvailable(S(), key)) return "";
      const complete =
        status(key) || (final && S().night.void.reviews[key]?.legacy);
      return `<section class="desk-proof${final ? " desk-final-proof" : ""}" data-desk-proof="${key}" aria-labelledby="desk-proof-title"><header><p class="desk-label">${final ? "CONTINUITY / SOURCE REVIEW" : t("核对记录", "REVIEW RECORD")}</p><h2 id="desk-proof-title">${esc(t(...spec.title))}</h2>${final ? button("close-final", t("关闭核对窗口", "Close review")) : ""}</header>${
        complete
          ? `<div class="desk-confirmed" role="status"><p>${esc(spec.record)}</p><small>SOURCE VERIFIED${desk().results[key]?.legacy || (final && S().night.void.reviews[key]?.legacy) ? " / " + t("已保留的核对", "retained review") : ""}</small></div>`
          : `<p>${esc(t(...spec.question))}</p>${key === "intake" ? `<p class="desk-tutorial">${t("先打开两份文件，加入对照，再引用原件提交。离开此页也会保留。", "Open both files, compare them, then cite the originals and submit. You can leave and return at any time.")}</p>` : ""}${key === "timeline" ? `<p>${link("night-audit", desk().orderConfirmed ? t("时间顺序已确认 · 返回查看", "Sequence confirmed · reopen") : t("返回夜审记录排列时间", "Order the night records"))}</p>${typeReview()}` : ""}<form data-desk-form="${key}" novalidate><fieldset class="desk-citations"><legend>${t("引用的原始资料", "Cited originals")}</legend>${desk()
              .discovered.filter((id) => id !== "mara" && id !== "closure")
              .map(
                (id) =>
                  `<div><label><input type="checkbox" data-desk-input="cite" data-key="${key}" data-document="${id}" ${input.sources.includes(id) ? "checked" : ""}><span>${esc(t(...D.documents[id].title))}</span></label>${button("open", t("查看", "View"), `data-document="${id}"`)}</div>`,
              )
              .join(
                "",
              )}</fieldset>${spec.fields.map((f) => `<fieldset><legend>${esc(t(...f.label))}</legend>${f.options.map((o) => `<label><input type="radio" name="${key}-${f.id}" data-desk-input="choice" data-key="${key}" data-field="${f.id}" value="${o.id}" ${input.values[f.id] === o.id ? "checked" : ""}>${esc(t(...o.label))}</label>`).join("")}</fieldset>`).join("")}<button type="submit" class="primary">${t("提交来源核对", "Submit source review")}</button></form>`
      }<div class="desk-feedback" id="desk-feedback" tabindex="-1" role="status">${lastError?.key === key ? esc(error(lastError.result)) : ""}</div>${hints(key)}</section>`;
    }
    function results() {
      const items = Object.entries(desk().results);
      return `<section class="desk-results"><h2>${t("已保存的核对结果", "Saved review results")}</h2>${items.length ? items.map(([key, result]) => `<p><strong>${esc(t(...D.proofs[key].title))}</strong><br><code>${esc(result.record)}</code></p>`).join("") : `<p>${t("尚未提交核对结果。", "No source reviews submitted yet.")}</p>`}</section>`;
    }
    function render() {
      M.syncSources(S());
      const key = desk().results.intake ? desk().proof : "intake";
      const groups = [
        ...new Set(desk().discovered.map((id) => D.documents[id].group)),
      ];
      return `<header class="page-heading"><p class="kicker">CONTINUITY / EVIDENCE DESK</p><h1>${t("证据核对台", "Evidence desk")}</h1><p>${link(desk().returnTo, t("返回上次调查位置", "Return to the last file"))} · ${link("notes", t("工作笔记", "Case notes"))}</p></header>${goal()}<nav class="desk-review-nav" aria-label="${t("可核对的记录", "Available reviews")}">${[
        "intake",
        "space",
        "timeline",
        "identity",
      ]
        .filter(
          (k) =>
            M.proofAvailable(S(), k) &&
            (k === "intake" || desk().results.intake),
        )
        .map((k) =>
          button(
            "proof",
            esc(t(...D.proofs[k].title)) + (status(k) ? " ✓" : ""),
            `data-key="${k}" aria-pressed="${k === key}"`,
          ),
        )
        .join(
          "",
        )}</nav><div class="evidence-desk"><aside class="desk-files"><h2>${t("已发现的文件", "Retained files")}</h2><label class="desk-mobile-source">${t("查看资料", "Open a source")}<select data-desk-input="source" aria-label="${t("查看已发现的资料", "Open a retained source")}">${groups
        .map(
          (group) =>
            `<optgroup label="${group}">${desk()
              .discovered.filter((id) => D.documents[id].group === group)
              .map(
                (id) =>
                  `<option value="${id}" ${desk().active === id ? "selected" : ""}>${esc(t(...D.documents[id].title))}</option>`,
              )
              .join("")}</optgroup>`,
        )
        .join("")}</select></label>${groups
        .map(
          (group) =>
            `<section><h3>${group}</h3>${desk()
              .discovered.filter((id) => D.documents[id].group === group)
              .map((id) =>
                button(
                  "open",
                  esc(t(...D.documents[id].title)),
                  `data-document="${id}" aria-pressed="${desk().active === id}"`,
                ),
              )
              .join("")}</section>`,
        )
        .join(
          "",
        )}</aside><div class="desk-viewer" id="desk-viewer" tabindex="-1">${documentView(desk().active)}${comparison()}</div><div class="desk-review">${proofPanel(key)}${results()}</div></div>`;
    }
    function finalReview() {
      const v = S().night.void,
        key = v.activeCategory;
      if (!key) return "";
      return `<div class="desk-final-window" role="region" aria-label="${t("归类证据核对", "Classification source review")}">${proofPanel(key, { final: true })}<div class="desk-final-sources" id="desk-viewer" tabindex="-1">${documentView(desk().active)}${comparison()}${link("evidence-desk", t("打开完整核对台", "Open the full evidence desk"))}</div></div>`;
    }
    function act(action, payload, focus = "", render = true) {
      const result = onAction(action, payload, { focus, render });
      return result;
    }
    function click(event) {
      const el = event.target.closest("[data-desk-op]");
      if (!el) return false;
      event.preventDefault();
      const op = el.dataset.deskOp,
        key = el.dataset.key || desk().proof,
        document = el.dataset.document;
      if (op === "hint") {
        act("desk-hint", { key }, `[data-desk-op=hint][data-key="${key}"]`);
        return true;
      }
      if (op === "close-final") {
        act("void", { action: "close-review" }, "[data-void-action=classify]");
        return true;
      }
      if (op === "footage") {
        act("desk-footage", {}, "[data-desk-op=footage]");
        return true;
      }
      if (op === "proof") {
        lastError = null;
        location.hash = "evidence-desk?proof=" + key;
        return true;
      }
      const result = act(
        "desk-ui",
        { op, key, document, field: el.dataset.field },
        op === "open"
          ? "#desk-viewer"
          : `[data-desk-op="${op}"]${document ? `[data-document="${document}"]` : ""}${op === "mark" ? `[data-field="${el.dataset.field}"]` : ""}${op === "proof" ? `[data-key="${key}"]` : ""}`,
      );
      if (op === "open") {
        const viewer = globalThis.document.querySelector("#desk-viewer");
        if (viewer?.tagName === "DETAILS") viewer.open = true;
        viewer?.focus?.({ preventScroll: true });
        viewer?.scrollIntoView?.({ block: "nearest" });
      }
      if (!result.ok) {
        lastError = { key, result };
        onAction("desk-refresh", {}, { focus: "#desk-feedback" });
      }
      return true;
    }
    function change(event) {
      const el = event.target;
      if (!el.matches("[data-desk-input]")) return false;
      const op = el.dataset.deskInput;
      if (op === "source") {
        act("desk-ui", { op: "open", document: el.value }, "#desk-viewer");
        globalThis.document
          .querySelector("#desk-viewer")
          ?.scrollIntoView({ block: "nearest" });
        return true;
      }
      act(
        "desk-ui",
        {
          op,
          key: el.dataset.key,
          document: el.dataset.document,
          field: el.dataset.field,
          value: el.value,
        },
        "",
        false,
      );
      return true;
    }
    function submit(event) {
      const key = event.target.dataset.deskForm;
      if (!key) return false;
      event.preventDefault();
      const result = onAction("desk-submit", { key }, { render: false });
      lastError = result.ok ? null : { key, result };
      onAction(
        "desk-refresh",
        {},
        { focus: result.ok ? "[data-desk-proof]" : "#desk-feedback" },
      );
      return true;
    }
    function notes() {
      return `${goal()}${M.canOpen(S(), "evidence-desk") ? `<p class="desk-notes-entry">${link("evidence-desk", t("打开证据核对台", "Open evidence desk"))}</p>` : ""}<section class="desk-progress"><h2>${t("调查记录", "Review status")}</h2>${["intake", "space", "timeline", "identity"].map((key) => `<p><span>${status(key) ? t("已核对", "REVIEWED") : M.proofAvailable(S(), key) ? t("正在调查", "OPEN") : t("尚未开放", "NOT OPEN")}</span> ${esc(t(...(key === "identity" && !M.proofAvailable(S(), key) && !status(key) ? ["人员资料核对", "Personnel review"] : key === "space" && !M.proofAvailable(S(), key) && !status(key) ? ["区域用途核对", "Position-use review"] : D.proofs[key].title)))}</p>`).join("")}</section>${results()}`;
    }
    function embedded(key) {
      return `<div class="desk-embedded">${proofPanel(key)}<details class="desk-embedded-viewer" id="desk-viewer"><summary>${t("查看所选原件与对照", "View the selected source and comparison")}</summary>${documentView(desk().active)}${comparison()}</details></div>`;
    }
    function decorate() {
      for (const canvas of document.querySelectorAll("[data-desk-footage]"))
        globalThis.StillwaterScenes?.render(canvas, {
          scene: "hall",
          pan: desk().footage?.pans?.[1] ?? 1,
          landmark: globalThis.StillwaterNightModel.anchor(
            1,
            desk().footage?.pans?.[1] ?? 1,
          ),
          openDoor: desk().footage?.openDoor,
          silhouette: desk().footage?.silhouette,
          cartMoved: desk().footage?.cartMoved,
          power: desk().footage?.power,
        });
    }
    return {
      render,
      goal,
      notes,
      proofPanel,
      embedded,
      finalReview,
      hints,
      click,
      change,
      submit,
      error,
      decorate,
      reset: () => {
        lastError = null;
      },
    };
  },
};
