import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "../server.mjs";
import "../case-data.js";
import "../case-night-model.js";
import "../case-state.js";
const phase = process.argv[2] || "after",
  full = process.argv.includes("--full");
const dir = `docs/v2.4/${phase}`;
await mkdir(dir, { recursive: true });
const server = createServer();
await new Promise((r) => server.listen(3265, "127.0.0.1", r));
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const errors = [],
  records = [];
try {
  for (const lang of ["zh", "en"])
    for (const width of full ? [375, 390, 768, 1280, 1440] : [375, 1440])
      for (const route of [
        "forum",
        "careers",
        "hotel",
        "rooms",
        "staff",
        "cameras",
        "terminal",
        "service-passage",
        "ad-pet","ad-cinema","ad-cats","settings"
      ]) {
        const s = StillwaterCaseState.fresh();
        s.evidence = Object.keys(StillwaterCaseData.clues);
        s.completed = {
          serviceInspected: true,
          audit: true,
          finalEvidence: true,
        };
        s.notices = { shown: true, dismissed: true };
        if (["cameras", "terminal","service-passage"].includes(route)) {
          s.night.started = true;
          s.night.pans = [2, 0, 0];
        }
        if (["terminal","service-passage"].includes(route)) {
          s.night.links = [0, 1];
          s.night.door = true;
          s.night.pans = [2, 2, 2];
        }
        const context = await browser.newContext({
          viewport: { width, height: 960 },
          reducedMotion: "reduce",
        });
        await context.addInitScript(
          (s) => {localStorage.setItem("stillwater-case:v2", JSON.stringify(s));localStorage.setItem("stillwater-case-intro:v1", JSON.stringify({schema:1,read:true}));},
          s,
        );
        const page = await context.newPage();
        page.on("pageerror", (e) =>
          errors.push({ lang, width, route, error: e.message }),
        );
        await page.goto(
          `http://127.0.0.1:3265/${lang === "zh" ? "index-zh.html" : "index.html"}#${route.startsWith("ad-")?"forum":route==="settings"?"hotel":route}`,
        );
        await page.locator("main h1").waitFor();
      if(route.startsWith("ad-")){await page.locator('footer [data-ad-action=folder]').click();await page.locator('.ad-directory>summary').click();await page.locator(`.ad-directory [data-ad-id="${route.slice(3)}"]`).click();}
      if(route==="settings")await page.locator('[data-case-action=save-settings]').click();
        await page.screenshot({
          path: `${dir}/${lang}-${width}-${route}.jpg`,
          fullPage: true, type:"jpeg", quality:78,
        });
        records.push({
          lang,
          width,
          route,
          overflow: await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          ),
          body: await page
            .locator("body")
            .evaluate((e) => ({
              font: getComputedStyle(e).fontFamily,
              size: getComputedStyle(e).fontSize,
              color: getComputedStyle(e).color,
              background: getComputedStyle(e).backgroundColor,
            })),
        });
        await context.close();
      }
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
await writeFile(
  `${dir}/results.json`,
  JSON.stringify({ records, errors }, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    screenshots: records.length,
    overflows: records.filter((r) => r.overflow),
    errors,
  }),
);
if (errors.length || records.some((r) => r.overflow)) process.exitCode = 1;
