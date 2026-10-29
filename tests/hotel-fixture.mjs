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
