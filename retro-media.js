/* Local low-resolution display copies; originals and their licenses remain available. */
(() => {
  const map = {
    "assets/lobby.jpg": "assets/lowres/lobby.jpg",
    "assets/hallway.jpg": "assets/lowres/hallway.jpg",
    "assets/guestroom.jpg": "assets/lowres/guestroom.jpg",
    "assets/twin.jpg": "assets/lowres/twin.jpg",
    "assets/suite.jpg": "assets/lowres/suite.jpg",
    "assets/night-mask.jpg": "assets/lowres/night-mask.jpg",
    "assets/scare-porter.png": "assets/lowres/scare-porter.jpg",
    "assets/scare-veil.png": "assets/lowres/scare-veil.jpg",
    "assets/scare-reflection.png": "assets/lowres/scare-reflection.jpg",
    "assets/dylan-room.png": "assets/lowres/dylan-room.jpg",
    "assets/web/ad-cat-snow.jpg": "assets/lowres/web-ad-cat-snow.jpg",
    "assets/web/ad-cat-tabby.jpg": "assets/lowres/web-ad-cat-tabby.jpg",
    "assets/web/ad-cat.jpg": "assets/lowres/web-ad-cat.jpg",
    "assets/web/ad-cinema.jpg": "assets/lowres/web-ad-cinema.jpg",
    "assets/web/ad-clouds.jpg": "assets/lowres/web-ad-clouds.jpg",
    "assets/web/ad-computer.jpg": "assets/lowres/web-ad-computer.jpg",
    "assets/web/ad-dog.jpg": "assets/lowres/web-ad-dog.jpg",
    "assets/web/ad-print.jpg": "assets/lowres/web-ad-print.jpg",
    "assets/web/ad-records.jpg": "assets/lowres/web-ad-records.jpg",
    "assets/web/hotel-breakfast.jpg": "assets/lowres/web-hotel-breakfast.jpg",
    "assets/web/hotel-dayroom.jpg": "assets/lowres/web-hotel-dayroom.jpg",
    "assets/web/hotel-dining.jpg": "assets/lowres/web-hotel-dining.jpg",
    "assets/web/hotel-exterior.jpg": "assets/lowres/web-hotel-exterior.jpg",
    "assets/web/hotel-garden.jpg": "assets/lowres/web-hotel-garden.jpg",
    "assets/web/hotel-lounge.jpg": "assets/lowres/web-hotel-lounge.jpg",
  };
  function element(el) {
    if (el.tagName === "IMG") {
      const key = el.getAttribute("src");
      if (map[key] && el.getAttribute("srcset") !== map[key] + " 1x")
        el.setAttribute("srcset", map[key] + " 1x");
      else if (
        !map[key] &&
        el.getAttribute("srcset")?.startsWith("assets/lowres/")
      )
        el.removeAttribute("srcset");
    }
    const old = el.getAttribute?.("style");
    if (old?.includes("assets/")) {
      let next = old;
      for (const [from, to] of Object.entries(map))
        next = next.replaceAll(from, to);
      if (next !== old) el.setAttribute("style", next);
    }
  }
  function subtree(root) {
    if (root.nodeType === 1) element(root);
    root.querySelectorAll?.("img[src],[style]").forEach(element);
  }
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === "attributes") element(r.target);
      else for (const node of r.addedNodes) subtree(node);
    }
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src", "style"],
  });
  subtree(document);
})();
