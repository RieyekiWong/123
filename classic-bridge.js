/* Keep dynamically-created language links within the preserved edition. */
(() => {
  if (document.body.dataset.edition !== "classic") return;
  function rewrite(root) {
    const links =
      root.nodeType === 1 ? [root, ...root.querySelectorAll("a[href]")] : [];
    for (const el of links) {
      if (!el.matches("a[href]")) continue;
      const href = el.getAttribute("href");
      // Only explicit edition links need rewriting. Hash-only links must stay
      // within the current document, preserving drafts, dialogs and playback.
      if (!/(?:^|\/)index(?:-zh)?\.html(?:$|[?#])/i.test(href)) continue;
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) continue;
      const path = url.pathname.replace(
        /\/index(-zh)?\.html$/,
        "/classic$1.html",
      );
      if (path !== url.pathname) {
        url.pathname = path;
        el.href = url.href;
      }
    }
  }
  rewrite(document.documentElement);
  new MutationObserver((records) =>
    records.forEach((r) => {
      if (r.type === "attributes") rewrite(r.target);
      else r.addedNodes.forEach(rewrite);
    }),
  ).observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["href"],
  });
})();
