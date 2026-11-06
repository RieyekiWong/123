/* Completion presentation only. Existing ending IDs and saves remain authoritative. */
globalThis.StillwaterEnding = {
  render(id, { t, pending = false, stored = true, storyEdition='' }) {
    if(storyEdition==='2.0-prototype'){
      const names={'auto-close':['错误的找到','A false return'],unverified:['保存疑问','Keep the question open'],released:['分离原件','Separate the originals']};
      if(!names[id])return '';
      return `<section class="ending-completion" data-ending-complete="${id}" tabindex="-1"><p>2.0 / ${t('路线预览结局','Route prototype ending')}</p><h1>GAME OVER</h1><h2>${t(...names[id])}</h2><p>${stored?t('这条预览路线已保存。正式演出和素材仍在后续阶段制作。','This prototype route is saved. Final scenes and assets are being made in later stages.'):t('本次预览已结束，浏览器未能保存记录。','The prototype has ended, but this browser could not save it.')}</p><a href="#sw2/notes">${t('回看调查资料','Revisit the sources')}</a> · <a href="#sw2/heritage/final-trace">${t('查看其他处理方式','Review other dispositions')}</a></section>`;
    }
    const endings = {
      "auto-close": ["01", "夜班留任", "The permanent night shift"],
      unverified: ["02", "拒绝结案", "Leave the record open"],
      released: ["03", "保留原件并离开", "Keep the originals and leave"],
    };
    const ending = endings[id];
    if (!ending) return "";
    if(storyEdition==='v13'){
      const names={'auto-close':['一份漂亮的错误报告','A neat, incorrect report'],unverified:['至少没有替他回答','At least you did not answer for him'],released:['两份不同的失踪记录','Two separate missing-person records']};
      ending[1]=names[id][0];ending[2]=names[id][1];
    }
    const released = id === "released";
    return `${released ? `<p class="ending-exit-status" data-ending-pending role="status" ${pending ? "" : "hidden"}>${t("正在退出值班系统…", "Disconnecting from the shift…")}</p>` : ""}<section class="ending-completion ${released ? "true-completion" : ""}" data-ending-complete="${id}" ${pending ? "hidden" : ""} tabindex="-1" aria-labelledby="ending-completion-title"><p class="ending-number">ENDING ${ending[0]}${released ? " / TRUE ENDING" : ""}</p><h1 id="ending-completion-title">${released ? "GAME OVER" : t("结局已达成", "Ending reached")}</h1><h2>${released ? t("真结局 · ", "True ending · ") : ""}${t(ending[1], ending[2])}</h2><p>${released ? t("你已退出值班系统，原始资料已锁定。故事到这里结束。", "You have left the shift system. The original records are locked. The story ends here.") : t("本次处理已完成，最终记录如下。", "Your decision is complete. The final record is below.")}</p><p class="ending-saved">${stored ? t("进度已保存在当前浏览器，现在可以关闭网页。", "Progress is saved in this browser. You can close the page now.") : t("本次故事已经结束，可以关闭网页；当前浏览器未能保存记录。", "The browser cannot save records. The story is complete; you can close the page.")}</p><div class="ending-actions">${released||storyEdition==='v13' ? '<a href="#notes">' + t("回看调查记录", "Revisit the case records") + '</a><button data-case-action="save-settings">' + t("重新开始", "Start again") + '</button>' : '<a class="primary" href="#terminal">' + t("返回终端，选择其他处理方式", "Return to the terminal for another decision") + '</a><a href="#notes">' + t("回看调查记录", "Revisit the case records") + '</a>'}</div></section>`;
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
