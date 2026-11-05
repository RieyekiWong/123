import { test, expect } from "./v2-fixture.mjs";
import { toAudit, toRevisions, toReview, validateFindings, toNight, wireNight, state } from "./v2-helpers.mjs";
import { solvePromo } from "./v2-promo-helpers.mjs";

async function seeded(page, { entry = "index-zh.html", skip = true, legacy = "" } = {}) {
  await page.addInitScript(({ skip, legacy }) => {
    if (sessionStorage.getItem("promo-seeded")) return;
    sessionStorage.setItem("promo-seeded", "1");
    const p = { schema: 1, selected: "", marked: "", verified: false, echoSeen: false, legacy: false };
    const night = { started: true, links: [0, 1], door: true, frame: true, orientations: [2, 1, 2, 0, 3, 0], isolated: true, manual: true, saved: true, operations: 6, void: { schema: 1, ...(legacy === "inside" ? { entered: true, enteredAt: 1000, step: 1 } : {}) } };
    if (legacy === "ended") { night.locked = true; night.released = true; delete night.void; }
    const saved = { schema: 2, evidence: ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"], completed: { audit: true, finalEvidence: true }, night, preferences: { skipScares: skip, scareChoiceMade: true }, ...(legacy ? {} : { promo: p }), ...(legacy === "ended" ? { endings: ["released"], lastEnding: "released" } : {}) };
    localStorage.setItem("stillwater-case:v2", JSON.stringify(saved));
    localStorage.setItem("stillwater-ads:v1", JSON.stringify({ schema: 1, pinnedIds: ["pet", "repair"], collapsedPinnedIds: [] }));
  }, { skip, legacy });
  await page.goto("/" + entry + (legacy === "inside" ? "#void" : "#terminal"));
}
async function frozen(page) {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
}
for (const entry of ["index-zh.html", "index.html"]) {
  test(`${entry}: a quiet archive advert links the forum, sample and 2006 leaflet without granting clues`, async ({ page }) => {
    await frozen(page);
    await page.goto("/" + entry + "#chat");
    await expect(page.locator(".hotel-promo-placement")).toHaveCount(0);
    await page.goto("/" + entry + "#forum");
    await expect(page.locator(".hotel-promo-placement")).toHaveCount(0);
    await page.locator('.bbs-topic-link[href="#forum?topic=job"]').click();
    await expect(page.locator('.hotel-promo-forum')).toBeVisible();
    await expect(page.locator('.hotel-promo-forum')).toContainText(entry.includes("zh") ? "有人还记得静水旅馆吗？" : "Remember Stillwater Hotel?");
    const before = await page.evaluate(() => localStorage.getItem("stillwater-case:v2"));
    await page.locator('.hotel-promo-forum [data-promo-action=open]').click();
    await expect(page.locator('#hotel-promo-viewer')).toBeVisible();
    await expect(page.locator('#hotel-promo-viewer [data-promo-action=version]')).toHaveCount(1);
    await expect(page.locator('#hotel-promo-viewer svg[data-promo-signs]')).toHaveAttribute("data-promo-signs", "316 / STAFF ONLY / 318");
    await page.locator('[data-promo-action=print-mode][data-mode=back]').click();
    await expect(page.locator('.promo-print-back')).toContainText(entry.includes("zh") ? "2006.09" : "Sep 2006");
    await page.keyboard.press("Escape");
    expect(await page.evaluate(() => localStorage.getItem("stillwater-case:v2"))).toBe(before);
    await page.locator('.forum-recruit-link').click();
    await expect(page.locator('.job-card')).toHaveCount(4);
    await page.locator('.hotel-promo-careers [data-promo-action=open]').click();
    await page.locator('[data-promo-action=print-mode][data-mode=clean]').click();
    await expect(page.locator('.promo-clean-print svg[data-promo-signs]')).toHaveAttribute("data-promo-signs", "316 / STAFF ONLY / 318");
    await page.keyboard.press("Escape");
    await page.goto("/" + entry + "#gallery");
    await expect(page.locator('.hotel-promo-hotel svg[data-promo-signs]')).toHaveAttribute("data-promo-signs", "316 / STAFF ONLY / 318");
    expect(await page.evaluate(() => StillwaterAdData.length)).toBe(25);
    expect(await page.evaluate(() => localStorage.getItem("stillwater-case:v2"))).toBe(before);
  });

  test(`${entry}: missing every early ad still permits a real, persistent two-step image comparison`, async ({ page }) => {
    await seeded(page, { entry });
    await expect(page.locator('[data-unlisted-entry]')).toHaveCount(0);
    await page.locator('.promo-check-panel [data-promo-action=archive]').click();
    await expect(page.locator('#hotel-promo-viewer .promo-version-tabs button')).toHaveCount(3);
    await page.locator('[data-promo-action=print-mode][data-mode=back]').click();
    await expect(page.locator('.promo-print-back')).toContainText("W3-02");
    await page.keyboard.press("Escape");
    await page.locator('[data-promo-action=source][data-version=synced]').click();
    await expect(page.locator('#promo-check-feedback')).toContainText(entry.includes("zh") ? "后来生成" : "generated later");
    await expect(page.locator('[data-unlisted-entry]')).toHaveCount(0);
    await page.locator('[data-promo-action=source][data-version=original]').click();
    await page.locator('.promo-mark-controls [data-target=left]').click();
    await expect(page.locator('#promo-check-feedback')).toContainText(entry.includes("zh") ? "没有变化" : "Nothing changed");
    await page.reload();
    await expect(page.locator('.promo-comparison')).toBeVisible();
    const sameBase = await page.locator('.promo-comparison svg .promo-base-image').evaluateAll(images => images.map(el => el.getAttribute("href")));
    expect(new Set(sameBase).size).toBe(1);
    await expect(page.locator('.promo-comparison .promo-region-middle').first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await page.locator('.promo-mark-controls [data-target=middle]').click();
    await expect(page.locator('.promo-check-success')).toContainText(entry.includes("zh") ? "中间为员工通道" : "staff access door");
    await expect(page.locator('[data-unlisted-entry]')).toBeFocused();
    await page.reload(); expect((await state(page)).promo.verified).toBe(true);
    expect((await state(page)).evidence).toHaveLength(9); expect((await state(page)).endings).toEqual([]);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("stillwater-ads:v1")).pinnedIds)).toEqual(["pet", "repair"]);
    await page.locator('[data-unlisted-entry]').click(); await expect(page.locator('.void-world')).toBeVisible();
    await expect(page.locator('.hotel-promo-placement,[data-active-ad]')).toHaveCount(0);
  });

  test(`${entry}: forum to unchanged case, rewrites, CCTV, B-3, publicity evidence, black world and GAME OVER`, async ({ page }) => {
    test.setTimeout(90000);
    const errors = []; page.on("pageerror", e => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem("stillwater-case:v2", JSON.stringify({ schema: 2, preferences: { skipScares: true, scareChoiceMade: true } })));
    await toAudit(page, entry + "#forum?topic=job");
    await toRevisions(page); await toReview(page); await validateFindings(page);
    await toNight(page, async stage => {
      if (stage === "mirror") await expect(page.locator('.hotel-promo-archive svg[data-promo-signs]')).toHaveAttribute("data-promo-signs", "316 / 317 / 318");
      if (stage === "cameras") await expect(page.locator('.hotel-promo-cameras')).toContainText(entry.includes("zh") ? "那扇门还在照片里" : "The door is still in the picture");
    });
    await wireNight(page);
    expect((await state(page)).promo.verified).toBe(true);
    expect((await state(page)).night.void.complete).toBe(true);
    await page.locator('[data-night-action=lock]').click(); await page.locator('[data-ending=released]').click();
    await expect(page.getByRole("heading", { name: "GAME OVER", exact: true })).toBeVisible();
    await page.goto("/" + entry + "#forum?topic=job");
    await expect(page.locator('.hotel-promo-forum svg[data-promo-signs]')).toHaveAttribute("data-promo-signs", "316 / STAFF ONLY / 318");
    expect(errors).toEqual([]);
  });
}
test("the preview is a one-time inline update, preserves the old original and never becomes a WeChat ad", async ({ page }) => {
  await seeded(page, { skip: false });
  await page.goto("/index-zh.html#cameras");
  await page.locator('.hotel-promo-cameras [data-promo-action=open]').click();
  await expect(page.locator('#hotel-promo-viewer [data-promo-image=preview]')).toBeVisible();
  await page.locator('#hotel-promo-viewer [data-promo-action=version][data-version=original]').click();
  await expect(page.locator('#hotel-promo-viewer .promo-distant-figure')).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.locator('.hotel-promo-cameras [data-promo-action=dismiss]').click();
  await expect(page.locator('.promo-dismissed-note')).toContainText("W3-02");
  await page.reload(); await expect(page.locator('.hotel-promo-cameras')).toHaveCount(0);
  await page.goto("/index-zh.html#gallery");
  await expect(page.locator('.hotel-promo-hotel svg[data-promo-signs]')).toHaveAttribute("data-promo-signs", "316 / STAFF ONLY / 318");
  await page.goto("/index-zh.html#chat");
  await expect(page.locator('.hotel-promo-placement,#hotel-promo-viewer[open]')).toHaveCount(0);
});
for (const legacy of ["inside", "ended"]) test(`existing ${legacy} saves retain their black-world/ending route and bypass only the added check`, async ({ page }) => {
  await seeded(page, { legacy });
  if (legacy === "inside") { await expect(page.locator('.void-world')).toBeVisible(); expect((await state(page)).night.void.step).toBe(1); }
  else { await expect(page.locator('[data-ending=released]')).toBeVisible(); await expect(page.locator('[data-unlisted-entry]')).toBeVisible(); }
  const legacyFlag = () => page.evaluate(() => StillwaterCaseState.hydrate(JSON.parse(localStorage.getItem("stillwater-case:v2"))).promo.legacy);
  expect(await legacyFlag()).toBe(true);
  await page.reload(); expect(await legacyFlag()).toBe(true);
  await expect(page.locator('.promo-check-panel')).toHaveCount(0);
});
for (const mode of ["enabled", "skip", "reduced"]) test(`source-check echo is once-only and respects ${mode} settings`, async ({ page }) => {
  if (mode === "reduced") await page.emulateMedia({ reducedMotion: "reduce" });
  await seeded(page, { skip: mode === "skip" }); await frozen(page);
  await solvePromo(page);
  await expect(page.locator('.promo-echo-active')).toHaveCount(mode === "enabled" ? 1 : 0);
  await page.clock.runFor(700); await expect(page.locator('.promo-echo-active')).toHaveCount(0);
  await page.reload(); await expect(page.locator('.promo-echo-active')).toHaveCount(0);
  expect((await state(page)).preferences.sound).toBe(false);
});
test("keyboard control and a language switch preserve selection without needing a tiny hotspot", async ({ page }) => {
  await seeded(page);
  await page.locator('[data-promo-action=source][data-version=original]').focus(); await page.keyboard.press("Enter");
  await page.locator('[data-case-language]').click(); await expect(page).toHaveURL(/index.html#terminal$/);
  await expect(page.locator('.promo-comparison')).toBeVisible();
  await page.locator('.promo-mark-controls [data-target=middle]').focus(); await page.keyboard.press("Enter");
  await expect(page.locator('[data-unlisted-entry]')).toBeFocused();
});
test("a confirmed restart clears only the new publicity trail and case, keeping ordinary saved ads", async ({ page }) => {
  await seeded(page); await solvePromo(page);
  await page.locator('.site-utilities [data-case-action=save-settings]').click();
  await page.locator('[data-comfort=reset-prompt]').click();
  await page.locator('[data-comfort=reset-confirm]').click();
  await expect(page).toHaveURL(/#chat$/);
  const result = await page.evaluate(() => ({ trail: JSON.parse(localStorage.getItem('stillwater-hotel-promo:v1')), game: JSON.parse(localStorage.getItem('stillwater-case:v2')), ads: JSON.parse(localStorage.getItem('stillwater-ads:v1')) }));
  expect(result.trail.versions).toEqual([]); expect(result.trail.topics).toEqual([]);
  expect(result.game.promo.verified).toBe(false); expect(result.game.evidence).toEqual([]);
  expect(result.ads.pinnedIds).toEqual(['pet', 'repair']);
});
test.describe("touch controls", () => {
  test.use({ hasTouch: true, viewport: { width: 375, height: 850 } });
  test("a silent reduced-motion phone can compare the actual image areas and continue", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" }); await seeded(page);
    await page.locator('[data-promo-action=source][data-version=original]').tap();
    const region = page.locator('.promo-comparison-image').first().locator('.promo-region-middle');
    const box = await region.boundingBox(); expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
    await region.tap(); await expect(page.locator('[data-unlisted-entry]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('[data-unlisted-entry]').tap(); await expect(page.locator('.void-world')).toBeVisible();
  });
});
