import { expect } from "@playwright/test";
export async function solvePromo(page) {
  const panel = page.locator(".promo-check-panel");
  await expect(panel).toBeVisible();
  await panel.locator('[data-promo-action=source][data-version=original]').click();
  await panel.locator('.promo-mark-controls [data-target=middle]').click();
  await expect(page.locator("[data-unlisted-entry]")).toBeVisible();
}
