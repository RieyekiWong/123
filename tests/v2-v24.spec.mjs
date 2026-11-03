import { test, expect } from "./v2-fixture.mjs";
import "../case-data.js";
import "../case-void-model.js";
import "../case-night-model.js";
import "../case-state.js";
const M = globalThis.StillwaterCaseState;
async function seed(page, stage = "normal") {
  const s = M.fresh();
  s.evidence = Object.keys(StillwaterCaseData.clues);
  s.completed = { serviceInspected: true, audit: true, finalEvidence: true };
  s.notices = { shown: true, dismissed: true };
  if (stage !== "normal") s.night.started = true;
  if (stage === "terminal") {
    s.night.links = [0, 1];
    s.night.door = true;
    s.night.pans = [2, 2, 2];
  }
  await page.addInitScript((s) => {
    if (!sessionStorage.getItem("v24-seeded")) {
      localStorage.setItem("stillwater-case:v2", JSON.stringify(s));
      sessionStorage.setItem("v24-seeded", "yes");
      localStorage.setItem(
        "stillwater-hotel:v2",
        '{"name":"Old guest","chapter":2}',
      );
      localStorage.setItem(
        "stillwater-ads:v1",
        '{"schema":1,"pinnedIds":["pet"],"collapsedPinnedIds":[]}',
      );
    }
  }, s);
}
test("first transition is pure black for two seconds, commits once and restores controls", async ({
  page,
}) => {
  await seed(page);
  await page.clock.install({ time: new Date("2026-11-03T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-11-03T00:00:01Z"));
  await page.goto("/index-zh.html#review");
  await page.evaluate(() => {
    const b = document.querySelector("[data-case-action=sync-records]");
    b.click();
    b.click();
  });
  await expect(page.locator("#phase-blackout")).toHaveCount(1);
  await expect(page.locator("body")).toHaveAttribute("data-anomaly", "normal");
  expect(
    await page
      .locator("#phase-blackout")
      .evaluate((e) => getComputedStyle(e).backgroundColor),
  ).toBe("rgb(0, 0, 0)");
  expect(await page.locator("#case-shell").evaluate((e) => e.inert)).toBe(true);
  await page.clock.runFor(1999);
  await expect(page.locator("#phase-blackout")).toBeVisible();
  await page.clock.runFor(1);
  await expect(page).toHaveURL(/#mirror$/);
  await expect(page.locator("#phase-blackout")).toHaveCount(0);
  await expect(page.locator("body")).toHaveAttribute("data-anomaly", "altered");
  expect(await page.locator("#case-shell").evaluate((e) => e.inert)).toBe(
    false,
  );
  await expect(page.locator("main")).toBeFocused();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("stillwater-case:v2")).evidence.length,
    ),
  ).toBe(9);
});
test("reloading during blackout finishes the remaining delay and reduced motion does not flash", async ({
  page,
}) => {
  await seed(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install({ time: new Date("2026-11-03T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-11-03T00:00:01Z"));
  await page.goto("/index-zh.html#review");
  await page.locator("[data-case-action=sync-records]").click();
  await page.clock.runFor(700);
  await page.reload();
  await expect(page.locator("#phase-blackout")).toBeVisible();
  await page.clock.runFor(1299);
  await expect(page.locator("#phase-blackout")).toBeVisible();
  await page.clock.runFor(1);
  await expect(page).toHaveURL(/#mirror$/);
  await expect(page.locator("#phase-blackout")).toHaveCount(0);
});
test("new-edition reset is visible from the forum, needs confirmation and preserves independent saves", async ({
  page,
}) => {
  await seed(page, "terminal");
  await page.goto("/index-zh.html#forum");
  await page.locator("[data-case-action=save-settings]").click();
  await expect(page.locator(".save-section")).toHaveAttribute("open", "");
  await expect(page.locator("[data-comfort=reset-prompt]")).toHaveText(
    "重新开始游戏",
  );
  await page.locator("[data-comfort=reset-prompt]").click();
  await page.locator("[data-comfort=reset-cancel]").click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("stillwater-case:v2")).night.started,
    ),
  ).toBe(true);
  await page.locator("[data-comfort=reset-prompt]").click();
  await page.locator("[data-comfort=reset-confirm]").click();
  await expect(page).toHaveURL(/#chat$/);
  await expect(page.locator("body")).toHaveAttribute("data-anomaly", "normal");
  const saved = await page.evaluate(() => ({
    case: JSON.parse(localStorage.getItem("stillwater-case:v2")),
    classic: localStorage.getItem("stillwater-hotel:v2"),
    ads: JSON.parse(localStorage.getItem("stillwater-ads:v1")),
    intro: JSON.parse(localStorage.getItem("stillwater-prologue:v1")),
    transition: localStorage.getItem("stillwater-transition:v1"),
  }));
  expect(saved.case.evidence).toEqual([]);
  expect(saved.case.night.started).toBe(false);
  expect(saved.classic).toContain("Old guest");
  expect(saved.ads.pinnedIds).toContain("pet");
  expect(saved.intro.entered).toBe(false);
  expect(saved.transition).toBeNull();
  await page.reload();
  await expect(page).toHaveURL(/#chat$/);
});
for (const entry of ["index-zh.html", "index.html"])
  test(`${entry}: clear physical wiring labels, integrated landmarks and footer audio`, async ({
    page,
  }) => {
    await seed(page, "terminal");
    await page.goto("/" + entry + "#cameras");
    await expect(page.locator('.cctv-picture canvas[data-rendered=yes]')).toHaveCount(3);
    await expect(page.locator('.cctv-picture[data-landmark=cart]')).toHaveCount(1);
    await expect(page.locator('.cctv-osd.bottom').first()).toContainText('2006-10-17');
    await page.goto("/" + entry + "#terminal");
    await expect(page.locator(".maintenance-label")).toContainText(
      entry.includes("zh") ? "A 左侧" : "enters A from the left",
    );
    await expect(page.locator(".maintenance-label")).toContainText("MANUAL");
    await expect(
      page.locator(".terminal-layout [data-night-action=settings]"),
    ).toHaveCount(0);
    await expect(
      page.locator("footer [data-case-action=toggle-sound]"),
    ).toBeVisible();
    await page.locator("[data-night-action=save]").click();
    await expect(page.locator("#night-feedback")).toContainText(
      entry.includes("zh") ? "A 的左侧" : "left of A",
    );
  });
for (const width of [375, 390, 768, 1280, 1440])
  for (const entry of ["index-zh.html", "index.html"])
    test(`${entry}: typography, fields and layouts at ${width}px`, async ({
      page,
    }) => {
      await seed(page);
      await page.setViewportSize({ width, height: 900 });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      for (const route of [
        "forum",
        "careers",
        "hotel",
        "rooms",
        "guestbook",
        "floor-plan",
        "maintenance",
        "night-audit",
        "revisions",
      ]) {
        await page.goto("/" + entry + "#" + route);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          route,
        ).toBe(true);
        for (const input of await page
          .locator(
            "input:not([type=checkbox]):not([type=radio]),select,textarea",
          )
          .all()) {
          if (await input.isVisible())
            expect(
              await input.evaluate((e) =>
                parseFloat(getComputedStyle(e).fontSize),
              ),
            ).toBeGreaterThanOrEqual(16);
        }
      }
      await page.goto("/" + entry + "#forum");
      expect(
        await page
          .locator(".bbs-post-text>p")
          .first()
          .evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
      ).toBe(16);
      await page.goto("/" + entry + "#hotel");
      expect(
        await page
          .locator(".hotel-hero")
          .evaluate((e) => getComputedStyle(e.querySelector("h1")).fontFamily),
      ).toContain("Georgia");
      if (width <= 390) {
        const im = await page.locator(".hotel-hero>img").boundingBox(),
          copy = await page.locator(".hotel-hero>div").boundingBox();
        expect(copy.y).toBeGreaterThanOrEqual(im.y + im.height - 1);
      }
      expect(errors).toEqual([]);
    });
test("200 percent layout and font fallback retain navigation and equipment controls", async ({
  page,
}) => {
  await seed(page, "terminal");
  await page.setViewportSize({ width: 1280, height: 960 });
  await page.goto("/index-zh.html#terminal");
  await page.evaluate(() => (document.body.style.zoom = "2"));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await expect(
    page.locator("[data-night-action=rotate]").first(),
  ).toBeVisible();
  await page.locator("[data-night-action=rotate]").first().press("Enter");
  await expect(
    page.locator("[data-night-action=rotate]").first(),
  ).toBeFocused();
});
