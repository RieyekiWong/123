/* Completion presentation only. Existing ending IDs and saves remain authoritative. */
globalThis.StillwaterEnding = {
  render(id, { t, pending = false, stored = true }) {
    const endings = {
      "auto-close": ["01", "夜班留任", "The permanent night shift"],
      unverified: ["02", "拒绝结案", "Leave the record open"],
      released: ["03", "保留原件并离开", "Keep the originals and leave"],
    };
    const ending = endings[id];
    if (!ending) return "";
    const released = id === "released";
    return `${released ? `<p class="ending-exit-status" data-ending-pending role="status" ${pending ? "" : "hidden"}>${t("正在退出值班系统…", "Disconnecting from the shift…")}</p>` : ""}<section class="ending-completion ${released ? "true-completion" : ""}" data-ending-complete="${id}" ${pending ? "hidden" : ""} tabindex="-1" aria-labelledby="ending-completion-title"><p class="ending-number">ENDING ${ending[0]}${released ? " / TRUE ENDING" : ""}</p><h1 id="ending-completion-title">${released ? "GAME OVER" : t("结局已达成", "Ending reached")}</h1><h2>${released ? t("真结局 · ", "True ending · ") : ""}${t(ending[1], ending[2])}</h2><p>${released ? t("你已退出值班系统，原始资料已锁定。故事到这里结束。", "You have left the shift system. The original records are locked. The story ends here.") : t("本次处理已完成，最终记录如下。", "Your decision is complete. The final record is below.")}</p><p class="ending-saved">${stored ? t("进度已保存在当前浏览器，现在可以关闭网页。", "Progress is saved in this browser. You can close the page now.") : t("本次故事已经结束，可以关闭网页；当前浏览器未能保存记录。", "The browser cannot save records. The story is complete; you can close the page.")}</p><div class="ending-actions">${released ? '<a href="#notes">' + t("回看调查记录", "Revisit the case records") + '</a><button data-case-action="save-settings">' + t("重新开始", "Start again") + '</button>' : '<a class="primary" href="#terminal">' + t("返回终端，选择其他处理方式", "Return to the terminal for another decision") + '</a><a href="#notes">' + t("回看调查记录", "Revisit the case records") + '</a>'}</div></section>`;
  },
  reveal({ focus = true } = {}) {
    const panel = document.querySelector('[data-ending-complete="released"]');
    if (!panel) return;
    panel.hidden = false;
    const pending = document.querySelector('[data-ending-pending]');
    if (pending) pending.hidden = true;
    if (focus) {
      panel.scrollIntoView({ block: "start", behavior: "instant" });
      panel.focus({ preventScroll: true });
    }
  },
};
