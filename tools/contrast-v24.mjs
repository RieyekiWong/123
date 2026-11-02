import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { createServer } from "../server.mjs";
import "../case-data.js";
import "../case-night-model.js";
import "../case-state.js";
const server = createServer();
await new Promise((r) => server.listen(3266, "127.0.0.1", r));
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const results = [],
  errors = [];
const collect = () => {
  const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number),
    blend = (f, b) => {
      const a = f[3] ?? 1;
      return f.slice(0, 3).map((v, i) => v * a + b[i] * (1 - a));
    },
    lum = (c) =>
      c
        .map((v) => {
          v /= 255;
          return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        })
        .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0),
    contrast = (a, b) => {
      const x = lum(a),
        y = lum(b);
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
  const background = (el) => {
    const parents = [];
    for (let x = el; x; x = x.parentElement) parents.unshift(x);
    let b = [255, 255, 255];
    for (const p of parents) {
      const s = getComputedStyle(p),
        rgba = rgb(s.backgroundColor);
      if (rgba.length >= 3) b = blend(rgba, b);
      const stops = s.backgroundImage.match(/rgba?\([^)]+\)/g);
      if (stops?.length && s.backgroundImage.startsWith("linear-gradient"))
        b = blend(rgb(stops[0]), b);
    }
    return b;
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT),
    issues = [];
  let count = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode,
      el = node.parentElement,
      text = node.nodeValue.trim();
    if (
      !text ||
      el.closest(
        "script,style,[aria-hidden=true],.cctv-frame,button:disabled,[hidden],.sr-only",
      )
    )
      continue;
    const st = getComputedStyle(el);
    if (st.visibility !== "visible" || !el.getClientRects().length) continue;
    const r = document.createRange();
    r.selectNodeContents(node);
    if (!r.getBoundingClientRect().height) continue;
    count++;
    const font = parseFloat(st.fontSize),
      minimum =
        font >= 24 || (font >= 18.66 && Number(st.fontWeight) >= 700) ? 3 : 4.5,
      bg = background(el),
      color = blend(rgb(st.color), bg),
      ratio = contrast(color, bg);
    if (ratio + 0.02 < minimum)
      issues.push({
        text: text.slice(0, 120),
        selector: el.tagName.toLowerCase() + "." + [...el.classList].join("."),
        font,
        color: st.color,
        bg,
        ratio: Number(ratio.toFixed(2)),
        minimum,
      });
  }
  return { count, issues };
};
try {
  for (const lang of ["zh", "en"])
    for (const phase of ["normal", "altered", "terminal", "resolved"]) {
      const state = StillwaterCaseState.fresh();
      state.evidence = Object.keys(StillwaterCaseData.clues);
      state.completed = {
        audit: true,
        finalEvidence: true,
        serviceInspected: true,
      };
      state.drafts.reservation = "R-4829";
      state.drafts.maintenance = "A-06-17";
      state.notices = { shown: true, dismissed: false };
      state.endings=["auto-close","unverified"];state.lastEnding="unverified";
    if(phase!=="normal")state.night.started=true;
    if (phase === "terminal" || phase === "resolved") {
        state.night.started = true;
        state.night.door = true;
        state.night.links = [0, 1];
      }
      if(phase==="resolved"){Object.assign(state.night,{frame:true,orientations:[2,1,2,0,3,0],isolated:true,manual:true,saved:true,locked:true,released:true,operations:1});state.endings.push("released");state.lastEnding="released";}
    const context = await browser.newContext({
        viewport: { width: 1280, height: 960 },
        reducedMotion: "reduce",
      });
      await context.addInitScript(
        (s) => localStorage.setItem("stillwater-case:v2", JSON.stringify(s)),
        state,
      );
      const page = await context.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      const capture = async (route) =>
        results.push({ lang, phase, route, ...(await page.evaluate(collect)) });
      for (const route of [
        "forum",
        "careers",
        "hotel",
        "gallery",
        "rooms",
        "reservations",
        "guestbook",
        "history",
        "contact",
        "notices",
        "floor-plan",
        "maintenance",
        "night-audit",
        "staff",
        "revisions",
        "closure",
        "mara",
        "review",
        "notes",
        "credits",
      "ending?view=auto-close",
      "ending?view=unverified",
      ...(phase==="resolved"?["ending?view=released"]:[]),
        ...(phase !== "normal" ? ["mirror", "cameras", ...(phase!=="altered"?["terminal","service-passage"]:[])] : []),
      ]) {
        await page.goto(
          `http://127.0.0.1:3266/${lang === "zh" ? "index-zh.html" : "index.html"}#${route}`,
        );
        await capture(route);
      }
      await page.locator("[data-case-action=save-settings]").click();
      await capture("save-settings");
      await page.keyboard.press("Escape");
      await page.locator("footer [data-ad-action=folder]").click();
      await page.locator(".ad-directory>summary").click();
      for (const id of [
        "pet",
        "cinema",
        "repair",
        "secondhand",
        "print",
        "cats",
        "weather",
      ]) {
        await page.locator(`.ad-directory [data-ad-id=${id}]`).click();
        await capture("ad-" + id);
        await page.locator("#ad-dialog [data-ad-action=folder]").click();
        await page.locator(".ad-directory>summary").click();
      }
      await context.close();
    }
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
await writeFile(
  "docs/v2.4/contrast-results.json",
  JSON.stringify({ results, errors }, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    screens: results.length,
    textRuns: results.reduce((n, r) => n + r.count, 0),
    issues: results.flatMap((r) =>
      r.issues.map((i) => ({
        lang: r.lang,
        phase: r.phase,
        route: r.route,
        ...i,
      })),
    ),
    errors,
  }),
);

if (errors.length || results.some((r) => r.issues.length)) process.exitCode = 1;
