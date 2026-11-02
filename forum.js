globalThis.StillwaterForum = ({ t, esc, getState }) => {
  const posts = globalThis.StillwaterForumData;
  function render() {
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    const section = params.get("section");
    const list = section
      ? posts.filter((p) => p.sections.includes(section))
      : posts;
    const post =
      posts.find((p) => p.id === params.get("topic")) || list[0] || posts[0];
    const avatar = (name, text) =>
      `<span class="bbs-avatar" aria-hidden="true">${esc(text)}</span><strong>${esc(t(...name))}</strong>`;
    const replies = post.replies
      .map(
        ([user, text], i) =>
          `<article class="bbs-reply"><header>${avatar(user, t(...user).slice(0, 2))}<span>${i + 1}${t(" 楼", " / reply")}</span></header><p>${esc(t(...text))}</p></article>`,
      )
      .join("");
    return `<div class="bbs-breadcrumb">${t("夜猫论坛", "Night Owl BBS")} / ${post.sections.includes("work") ? t("工作信息", "Work notices") : post.sections.includes("web") ? t("老网站", "Old websites") : t("闲聊与求助", "Chat & help")}</div><div class="bbs-layout"><div><article class="bbs-post"><header><p class="bbs-tag">${t("网友发帖", "Community post")}</p><h1>${esc(t(...post.title))}</h1><div class="bbs-author">${avatar(post.user, post.avatar)}<time datetime="${post.at.replace(" ", "T")}">${post.at}</time><span>${post.views} ${t("次浏览", "views")}</span></div></header><div class="bbs-post-text">${post.paragraphs.map((text) => `<p>${esc(t(...text))}</p>`).join("")}${post.illustration ? `<figure class="bbs-dinner"><svg viewBox="0 0 240 125" role="img" aria-label="${t("网友画的煎蛋盖饭", "A community drawing of egg over rice")}"><ellipse cx="120" cy="80" rx="90" ry="32" fill="#cbd9df"/><ellipse cx="120" cy="72" rx="76" ry="29" fill="#fff9e6"/><path d="M65 67Q75 33 100 52Q125 30 145 47Q183 44 176 75Q145 100 106 86Q60 90 65 67" fill="#fff"/><ellipse cx="121" cy="64" rx="21" ry="17" fill="#e5b849"/></svg><figcaption>${t("图片：楼主的手绘补图。饭已经吃完了。", "Illustration added by the OP. Dinner has already been eaten.")}</figcaption></figure>` : ""}${post.id === "job" ? `<p class="bbs-entry-label">${t("贴一下入口：", "Here’s the link:")}</p><section class="bbs-link-preview"><span class="bbs-preview-monogram" aria-hidden="true">SH</span><div><h2>Stillwater Heritage Records</h2><p>${t("旧预订资料整理员 / 远程 / 合同制", "Reservation records assistant / remote / contract")}</p><a class="forum-recruit-link" href="#careers">${t("查看招聘页面", "View the job listing")} →</a></div></section>` : ""}</div></article><section class="bbs-replies" aria-label="${t("帖子回复", "Replies")}"><h2>${t("回复", "Replies")} · ${post.replies.length}</h2>${replies}${post.id === "job" && getState().endings.length ? `<article class="bbs-reply bbs-update"><header>${avatar(post.user, post.avatar)}<span>${t("楼主更新", "OP update")}</span></header><p>${t("更新：我后来没找到那家公司的其他信息。有人做完样本了吗？", "Update: I couldn’t find anything else about that company. Has anyone finished the sample?")}</p></article>` : ""}</section></div><aside class="bbs-sidebar"><section><h2>${t("今日热门", "Popular today")}</h2><ul>${list
      .filter((p) => p.id !== post.id)
      .map(
        (p) =>
          `<li><a href="#forum?topic=${p.id}">${esc(t(...p.title))}</a></li>`,
      )
      .join(
        "",
      )}</ul>${section ? `<a href="#forum">${t("查看全部话题", "All topics")}</a>` : ""}</section><section class="bbs-about"><h2>${t("关于这里", "Around here")}</h2><p>${t("夜猫子们聊工作，也聊不工作的事。无需登录，随便看看。", "Night owls talk about work and everything else. No sign-in needed to browse.")}</p><p>${t("当前只开放浏览，暂不接收新回复。", "Read-only at the moment. New replies are closed.")}</p></section><div data-inline-ad></div></aside></div>`;
  }
  return { render };
};
