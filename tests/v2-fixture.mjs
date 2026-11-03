import { test as base, expect } from "@playwright/test";
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem(
          "stillwater-case-intro:v1",
          JSON.stringify({ schema: 1, read: true }),
        );
      } catch {}
    });
    await use(page);
  },
});
export { expect };
