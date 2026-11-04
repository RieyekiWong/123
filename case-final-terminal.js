/* Compact presentation of the existing source-checked final classifications.
   Choices, citations and save validation still belong to case-state.js. */
globalThis.StillwaterFinalTerminal = {
  render({ state, t, esc, error, hints }) {
    const D = globalThis.StillwaterCaseData,
      M = globalThis.StillwaterCaseState;
    const key = state.night.void.activeCategory;
    if (!key || !M.proofAvailable(state, key)) return "";
    const copy = {
      ROOM: {
        question: ["这是客房吗？", "Is this a guest room?"],
        candidates: ["inventory", "booking", "position", "footage"],
        choices: {
          supported: ["有依据", "Supported"],
          unsupported: ["暂无依据", "Not supported"],
        },
      },
      GUEST: {
        question: ["有人在这里住过吗？", "Was someone checked in here?"],
        candidates: ["booking", "key", "housekeeping", "position", "transfer"],
        choices: {
          verified: ["可以确认", "Verified"],
          unverified: ["无法确认", "Unverified"],
          never: ["从未有人进入", "Nobody ever entered"],
        },
      },
      EMPLOYEE: {
        question: ["有人来接班了吗？", "Did someone report for this shift?"],
        candidates: ["personnel", "queue", "revision", "footage", "attendance"],
        choices: {
          verified: ["可以确认", "Verified"],
          unverified: ["无法确认", "Unverified"],
        },
      },
    }[key];
    const names = {
      inventory: ["客房目录", "Room register"],
      position: ["区域登记", "Position card"],
      footage: ["03:17 录像", "03:17 footage"],
      booking: ["原预订单", "Booking slip"],
      key: ["钥匙套留言", "Key-sleeve note"],
      housekeeping: ["客房巡查", "Room round"],
      transfer: ["系统移交", "System transfer"],
      personnel: ["原员工档案", "Personnel file"],
      revision: ["修订记录", "Revised copy"],
      queue: ["当前排班", "Assignment"],
      attendance: ["到岗索引", "Arrival index"],
    };
    const input = M.proofDraft(state, key),
      complete =
        !!state.desk.results[key] || !!state.night.void.reviews[key]?.legacy;
    // Keep old, unrelated draft citations visible so an old save can remove them.
    const ids = [...new Set([...copy.candidates, ...input.sources])].filter(
      (id) => state.desk.discovered.includes(id),
    );
    const active = ids.includes(state.desk.active) ? state.desk.active : ids[0];
    const label = (id) => esc(t(...(names[id] || D.documents[id].title)));
    const file = D.documents[active];
    let feedback = "";
    if (error?.key === key)
      feedback =
        error.result.error === "desk-source-missing"
          ? t("还缺一份原件：", "Missing source: ") +
            (error.result.document ? label(error.result.document) : "")
          : error.result.error === "desk-source-unrelated"
            ? t(
                "有一份资料不支持这项判断。",
                "One cited file does not support this finding.",
              )
            : t(
                "原件还不能支持这个结论。",
                "The originals do not support that conclusion.",
              );
    return `<section class="void-terminal-review desk-proof" data-desk-proof="${key}" aria-labelledby="desk-proof-title"><header><span class="final-channel">${key} / SOURCE CHECK</span><button type="button" class="final-close" data-desk-op="close-final" aria-label="${t("关闭核对", "Close review")}">×</button></header><h2 id="desk-proof-title">${esc(t(...copy.question))}</h2>${
      complete
        ? `<p class="final-retained" role="status">${esc(D.proofs[key].record)}</p>`
        : `<form data-desk-form="${key}" novalidate><fieldset class="final-sources"><legend>${t("引用原件", "Cite originals")}</legend>${ids.map((id) => `<label><input type="checkbox" data-desk-input="cite" data-key="${key}" data-document="${id}" ${input.sources.includes(id) ? "checked" : ""}><span>${label(id)}</span></label>`).join("")}</fieldset><fieldset class="final-choices"><legend class="sr-only">${t("判断", "Finding")}</legend>${D.proofs[key].fields[0].options.map((o) => `<label><input type="radio" name="${key}-finding" data-desk-input="choice" data-key="${key}" data-field="finding" value="${o.id}" ${input.values.finding === o.id ? "checked" : ""}><span>${esc(t(...copy.choices[o.id]))}</span></label>`).join("")}</fieldset><button type="submit" class="final-write">${t("写入判断", "Retain finding")} ↵</button></form>`
    }<p id="desk-feedback" class="final-feedback" role="status" tabindex="-1">${feedback}</p><details id="desk-viewer" class="final-originals" tabindex="-1"><summary>${t("重看原件", "Reopen originals")}</summary><nav aria-label="${t("原始资料", "Original sources")}">${ids.map((id) => `<button type="button" data-desk-op="open" data-document="${id}" aria-pressed="${id === active}">${label(id)}</button>`).join("")}</nav>${file ? `<article data-desk-document="${active}"><p class="final-file-id">${esc(file.reference)} · ${esc(file.at)}</p><dl>${file.rows.map((r) => `<div><dt>${esc(t(...r.label))}</dt><dd>${esc(t(...r.value))}</dd></div>`).join("")}</dl><a href="#${esc(file.route)}">${t("打开原网页", "Open source page")} →</a></article>` : ""}</details><details class="final-help" ${state.desk.hints[key] ? "open" : ""}><summary>${t("查看提示", "Need help?")}</summary>${hints(key)}</details></section>`;
  },
};
