import { test, expect } from "@playwright/test";
import { toAudit, toRevisions, state, link } from "./v2-helpers.mjs";
test("sound is opt-in, settings are keyboard-accessible and reset preserves the classic save", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.addInitScript(() =>
    localStorage.setItem(
      "stillwater-hotel:v2",
      '{"name":"Classic visitor","chapter":2}',
    ),
  );
  await page.goto("/index-zh.html#hotel");
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.locator("[data-case-action=settings]").click();
  await expect(page.locator("[data-comfort=sound]")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.locator("[data-comfort=sound]").click();
  await expect(page.locator("[data-comfort=sound]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator("[name=reduce-motion]").check();
  await expect(page.locator("body")).toHaveClass(/reduced-motion/);
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-case-action=settings]")).toBeFocused();
  await link(page, "careers", "footer");
  await page.locator("[data-case-action=sample]").click();
  await page.reload();
  expect((await state(page)).preferences.sound).toBe(false);
  expect((await state(page)).preferences.reduceMotion).toBe(true);
  await page.locator("[data-case-action=settings]").click();
  await page.locator("#case-settings details > summary").click();
  await page.locator("[data-comfort=reset-prompt]").click();
  await page.locator("[data-comfort=reset-confirm]").click();
  await expect(page.locator(".job-card")).toBeVisible();
  expect((await state(page)).evidence).toEqual([]);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("stillwater-hotel:v2")).name,
    ),
  ).toBe("Classic visitor");
  expect(requests.some((url) => /youtube|\.mp3|scare-/.test(url))).toBe(false);
});
test("one optional, non-obstructing signal and manually refreshed current queue", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await toAudit(page);
  await expect(page.locator(".connection-notice")).toHaveCount(0);
  await page.locator("[data-case-action=settings]").click();
  await page.locator("[name=skip-scares]").uncheck();
  await page.keyboard.press("Escape");
  await link(page, "notes", "footer");
  await page.locator('footer a[href="#staff"]').click();
  await expect(page).toHaveURL(/#staff$/);
  // The personnel gate refers back to the unresolved night audit.
  await page.locator("main .source-link a").click();
  await expect(page.locator(".connection-notice")).toBeVisible();
  await expect(page.locator("#night-audit-form")).toBeVisible();
  await page.reload();
  await expect(page.locator(".connection-notice")).toHaveCount(0);
  await toRevisions(page);
  for (const id of ["owner", "location", "status"])
    await page.locator(`[name=difference][value=${id}]`).check();
  await page.locator("#revision-form > button").click();
  await page.locator(".annotation-comparison > summary").click();
  await expect(page.locator(".annotated-photo figcaption")).toContainText(
    "服务",
  );
  await page.locator("[data-version=revision]").click();
  await expect(page.locator(".annotated-photo figcaption")).toContainText(
    "客房",
  );
  await page.locator('footer a[href="#staff"]').click();
  await expect(page.locator(".current-queue")).toHaveCount(0);
  await page.locator("[data-case-action=refresh-queue]").click();
  await expect(page.locator(".current-queue")).toContainText("TEMP-015");
  await expect(page.locator(".current-queue")).toContainText("2026-11");
  await page.reload();
  await expect(page.locator(".current-queue")).toContainText("TEMP-015");
});
