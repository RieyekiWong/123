import { test, expect } from "./v2-fixture.mjs";
import {
  toAudit,
  toRevisions,
  toReview,
  validateFindings,
  toNight,
  state,
  link,
} from "./v2-helpers.mjs";
for (const [entry, ending] of [
  ["index-zh.html", "unverified"],
  ["index.html", "auto-close"],
]) {
  test(`${entry}: unseeded case, recoverable errors and ${ending}`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await toAudit(page, entry);
    await toRevisions(page);
    await toReview(page);
    await validateFindings(page);
    await toNight(page);
    await page.locator(`[data-ending="${ending}"]`).click();
    await expect(
      page.locator(`[data-ending-record="${ending}"]`),
    ).toBeVisible();
    const saved = await state(page);
    expect(saved.evidence).toHaveLength(9);
    expect(saved.endings).toContain(ending);
    if (ending === "auto-close") {
      await expect(page.locator("main")).toContainText("Not available");
      await expect(page).toHaveTitle(/TEMP-015/);
    } else await expect(page.locator("main")).toContainText("UNVERIFIED");
    await page.reload();
    await expect(
      page.locator(`[data-ending-record="${ending}"]`),
    ).toBeVisible();
    await link(page, "terminal");
    const other = ending === "auto-close" ? "unverified" : "auto-close";
    await page.locator(`[data-ending="${other}"]`).click();
    await expect(page.locator(`[data-ending-record="${other}"]`)).toBeVisible();
    expect((await state(page)).endings).toHaveLength(2);
    await link(page, "forum", "footer");
    await page.locator('.bbs-topic-link[href="#forum?topic=job"]').click();
    await expect(page.locator(".bbs-update")).toBeVisible();
    await expect(
      page.locator(".ad-inline,[data-active-ad],.ad-saved-tab"),
    ).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
