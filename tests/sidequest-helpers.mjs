import { expect } from "@playwright/test";
export const sideAction = (page, id) =>
  page.locator(`dialog [data-action="${id}"]`).click();
export async function collectDylanNotes(page) {
  await sideAction(page, "dylan-trail");
  for (const [id, source] of [
    ["library", "readingroom"],
    ["property", "inventory"],
    ["roster", "weather"],
  ]) {
    await sideAction(page, source);
    await sideAction(page, "dylan-note-" + id);
    await sideAction(page, "dylan-keep-" + id);
    await sideAction(page, "dylan-trail");
  }
}
export async function completeDylan(page) {
  await collectDylanNotes(page);
  await sideAction(page, "dylan-door");
  await page.locator("#dylan-room").fill("216");
  await page.locator("#dylan-code").fill("0614");
  await page.locator('#dylan-room-form [type="submit"]').click();
  await expect(page.locator(".dylan-room-photo img")).toBeVisible();
  await sideAction(page, "dylan-finish");
}
const clockedPages = new WeakSet();
export async function openDylan(page) {
  if (await page.locator("#story-dialog").isVisible())
    await page.locator("#dialog-close").click();
  await page.locator('footer a[href="#guestbook"]').click();
  await page.locator(".guestbook-archive > summary").click();
  await page
    .locator('.dylan-public-entry [data-action="dylan-message"]')
    .click();
}
export async function prepareHire(page) {
  if (!clockedPages.has(page)) {
    await page.clock.install();
    clockedPages.add(page);
  }
  for (const key of ["duties", "pay", "schedule"]) {
    await page.locator(`[data-support-keyword="${key}"]`).click();
    await page.locator(".support-send").click();
    if (await page.locator("#support-interruption").isVisible())
      await page.clock.fastForward(15050);
  }
  await expect(page.locator('[data-action="job-accept"]')).toBeEnabled();
}
export async function acceptShift(page) {
  await prepareHire(page);
  await sideAction(page, "job-accept");
  await sideAction(page, "job-resume");
  await expect(page.locator(".surveillance-desk")).toBeVisible();
}
export async function patrol(page, fromRound = 1) {
  for (let round = fromRound; round <= 3; round++) {
    for (const feed of ["lobby", "corridor", "room"]) {
      await page.locator(`[data-action="monitor-feed-${feed}"]`).click();
      const marker = page.locator(`[data-action="monitor-inspect-${feed}"]`);
      if (await marker.count()) await marker.click();
      await expect(page.locator("#monitor-log")).toBeEnabled();
      await page.locator("#monitor-log").click();
    }
    if (round < 3)
      await page.locator('[data-action="monitor-next-round"]').click();
  }
}
export async function escapeShift(page) {
  await patrol(page);
  await page.locator("#monitor-code").fill("472");
  await page.locator('#monitor-escape-form [type="submit"]').click();
  await expect(page.locator(".monitor-ending")).toBeVisible();
}
