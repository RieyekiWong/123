import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import {
  toAudit,
  toRevisions,
  toReview,
  validateFindings,
  toNight,
  wireNight,
} from "../tests/v2-helpers.mjs";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } }),
  snapshots = [],
  errors = [];
page.on("pageerror", (error) => errors.push(error.message));
async function capture(label) {
  await page.waitForTimeout(60);
  snapshots.push({
    label,
    url: page.url(),
    text: await page.locator("body").innerText(),
    attributes: await page
      .locator("[alt],[aria-label],[placeholder]")
      .evaluateAll((els) =>
        els.flatMap((el) =>
          ["alt", "aria-label", "placeholder"]
            .map((a) => el.getAttribute(a))
            .filter(Boolean),
        ),
      ),
  });
}
const base = "http://127.0.0.1:3251/";
await page.goto(base + "index-zh.html#forum");
for (const route of [
  "forum",
  "forum?section=chat",
  "forum?section=work",
  "forum?section=web",
  "forum?section=help",
  ...(await page.evaluate(() =>
    StillwaterForumData.map((r) => "forum?thread=" + r.id),
  )),
  "careers",
  "hotel",
  "rooms",
  "gallery",
  "contact",
  "history",
  "guestbook",
  "notices",
  "credits",
  "notes",
]) {
  await page.goto(base + "index-zh.html#" + route);
  await capture(route);
}
await page.locator("[data-ad-action=folder]").click();
await capture("ad-folder");
const ads = await page.evaluate(() => StillwaterAdData.map((a) => a.id));
for (const id of ads) {
  await page
    .locator("#ad-dialog details")
    .evaluateAll((es) => es.forEach((e) => (e.open = true)));
  await page
    .locator(`#ad-dialog [data-ad-action=detail][data-ad-id="${id}"]`)
    .first()
    .click();
  await capture("ad-" + id);
  await page.locator("#ad-dialog [data-ad-action=folder]").click();
}
await page.keyboard.press("Escape");
// Collect actual visible text during the unseeded source flow, not just final screens.
await page.exposeFunction("captureText", (text) =>
  snapshots.push({
    label: "interactive step",
    url: "V2 source flow",
    text,
    attributes: [],
  }),
);
await page.addInitScript(() =>
  new MutationObserver(() => {
    clearTimeout(window.copyCapture);
    window.copyCapture = setTimeout(
      () => window.captureText?.(document.body?.innerText || ""),
      30,
    );
  }).observe(document, { subtree: true, childList: true }),
);
await page.evaluate(() => {
  localStorage.removeItem("stillwater-case:v2");
  localStorage.removeItem("stillwater-prologue:v1");
});
await page.goto(base + "index-zh.html");
// Helpers use relative URLs, so provide an absolute goto adapter for this independent review.
const originalGoto = page.goto.bind(page);
page.goto = (url, options) =>
  originalGoto(url.startsWith("/") ? base + url.slice(1) : url, options);
await toAudit(page);
await capture("night-audit");
await toRevisions(page);
await capture("revisions");
await toReview(page);
await capture("review");
await validateFindings(page);
await toNight(page);
await capture("terminal");
await wireNight(page);
await capture("wired terminal");
await page.locator("[data-night-action=lock]").click();
for (const id of ["auto-close", "unverified", "released"]) {
  await page.locator(`[data-ending=${id}]`).click();
  await capture("ending-" + id);
  if (id !== "released") await page.goto(base + "index-zh.html#terminal");
}
await page.goto(base + "index-zh.html#careers");
await capture("withdrawn");
await page.close();
const classic = await browser.newPage({
  viewport: { width: 1440, height: 960 },
});
classic.on("pageerror", (e) => errors.push(e.message));
await classic.addInitScript(() => {
  localStorage.setItem("stillwater-instructions:v1", "read");
  localStorage.setItem("stillwater-career:v1", '{"failed":[],"entered":true}');
  localStorage.setItem("stillwater-lobby-music:v1", '{"enabled":false}');
});
const classicSeed = {
  name: "审查访客",
  checkedIn: true,
  staff: true,
  chapter: 2,
  clues: [
    "clock",
    "door",
    "ribbon",
    "register",
    "switch",
    "letter",
    "power",
    "radio",
    "archive",
    "identity",
    "mirror",
    "chronology",
  ],
  puzzles: ["power", "radio", "archive", "identity", "mirror", "chronology"],
  endings: ["departure", "return", "release", "custodian", "dawn"],
  scares: false,
  sideQuests: {
    dylan: { met: true, notes: ["library", "property", "roster"], found: true },
    job: {
      stage: "working",
      talked: ["duties", "pay"],
      round: 2,
      reviewed: [],
      inspected: [],
      feed: "lobby",
    },
  },
};
for (const [origin, label] of [
  ["http://127.0.0.1:3252/", "before"],
  [base, "after"],
]) {
  await classic.goto(origin + "classic-zh.html#home");
  await classic.evaluate(
    (s) => localStorage.setItem("stillwater-hotel:v2", JSON.stringify(s)),
    classicSeed,
  );
  await classic.goto(origin + "classic-zh.html#employees");
  await classic.reload();
  await classic.locator("main [data-action=monitor]").first().click();
  for (const cam of [1, 2, 3]) {
    await classic.locator(`[data-camera="${cam}"]`).click();
    await classic.screenshot({
      path: `docs/v2.3/classic-camera-${cam}-${label}.png`,
      fullPage: true,
    });
  }
  await classic.locator("#dialog-close").click();
  await classic.goto(origin + "classic-zh.html#surveillance");
  for (const feed of ["lobby", "corridor", "room"]) {
    await classic.locator(`[data-action=monitor-feed-${feed}]`).click();
    await classic.screenshot({
      path: `docs/v2.3/classic-shift-${feed}-${label}.png`,
      fullPage: true,
    });
  }
  await classic.setViewportSize({ width: 375, height: 812 });
  await classic.screenshot({
    path: `docs/v2.3/classic-mobile-${label}.png`,
    fullPage: true,
  });
  await classic.setViewportSize({ width: 1440, height: 960 });
}
for (const route of [
  "home",
  "rooms",
  "guide",
  "history",
  "guestbook",
  "reservations",
  "employees",
  "below",
  "surveillance",
]) {
  await classic.goto(base + "classic-zh.html#" + route);
  await classic.waitForTimeout(70);
  snapshots.push({
    label: "classic " + route,
    url: classic.url(),
    text: await classic.locator("body").innerText(),
    attributes: await classic
      .locator("[alt],[aria-label],[placeholder]")
      .evaluateAll((es) =>
        es.flatMap((e) =>
          ["alt", "aria-label", "placeholder"]
            .map((a) => e.getAttribute(a))
            .filter(Boolean),
        ),
      ),
  });
  const actions = await classic
    .locator("main [data-action]")
    .evaluateAll((es) => [...new Set(es.map((e) => e.dataset.action))]);
  for (const action of actions) {
    if (
      /reset|replay|sound|toggle|scare|finish|continue|job-accept|monitor-|ending|final-discharge/.test(
        action,
      )
    )
      continue;
    await classic.goto(base + "classic-zh.html#" + route);
    const target = classic.locator(`main [data-action="${action}"]`).first();
    if (!(await target.count()) || (await target.isDisabled())) continue;
    await target.evaluate((el) => {
      for (let p = el.parentElement; p; p = p.parentElement)
        if (p.tagName === "DETAILS") p.open = true;
    });
    await target.click();
    await classic.waitForTimeout(70);
    snapshots.push({
      label: "classic " + route + "/" + action,
      url: classic.url(),
      text: await classic.locator("body").innerText(),
      attributes: await classic
        .locator("[alt],[aria-label],[placeholder]")
        .evaluateAll((es) =>
          es.flatMap((e) =>
            ["alt", "aria-label", "placeholder"]
              .map((a) => e.getAttribute(a))
              .filter(Boolean),
          ),
        ),
    });
    if (await classic.locator("#story-dialog").isVisible())
      await classic.locator("#dialog-close").click();
  }
}
await writeFile(
  "docs/v2.3/browser-copy-review.json",
  JSON.stringify({ snapshots, errors }, null, 2) + "\n",
);
console.log(JSON.stringify({ snapshots: snapshots.length, errors }));
await browser.close();
