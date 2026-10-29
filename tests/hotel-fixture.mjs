import { test as base, expect } from "@playwright/test";
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem(
          "stillwater-lobby-music:v1",
          JSON.stringify({ enabled: false }),
        );
        localStorage.setItem("stillwater-instructions:v1", "read");
        localStorage.setItem(
          "stillwater-career:v1",
          JSON.stringify({ failed: [], entered: true }),
        );
      } catch {
        /* Storage failure tests still run. */
      }
    });
    await use(page);
  },
});
export { expect };

// Regression paths may reopen a retained file from its ordinary collapsed index.
export async function reveal(page, target) {
  const parents = await target.locator('xpath=ancestor::details').all();
  for (const parent of parents) {
    if ((await parent.getAttribute('open')) === null)
      await parent.locator(':scope > summary').click();
  }
  return target;
}
export async function readCopy(page, id) {
  const target = page.locator(`[data-clue="${id}"]`);
  await reveal(page, target);
  await expect(target).toBeDisabled();
}
