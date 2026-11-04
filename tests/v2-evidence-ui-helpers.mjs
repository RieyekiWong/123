import { expect } from "@playwright/test";
export const sources = {
  intake: ["sample", "booking"],
  space: ["inventory", "position"],
  timeline: ["key", "housekeeping", "transfer", "draft-audit"],
  identity: ["personnel", "revision", "queue", "attendance"],
  ROOM: ["inventory", "position", "footage"],
  GUEST: ["booking", "key", "housekeeping", "transfer"],
  EMPLOYEE: ["personnel", "revision", "queue", "attendance"],
};
export const values = {
  intake: { match: "same" },
  space: { use: "service" },
  timeline: { assessment: "insufficient" },
  identity: { role: "reviewer", attendance: "insufficient" },
  ROOM: { finding: "unsupported" },
  GUEST: { finding: "unverified" },
  EMPLOYEE: { finding: "unverified" },
};
export async function citeAndSubmit(
  page,
  key,
  { wrong = false, override = {} } = {},
) {
  const panel = page.locator(`[data-desk-proof="${key}"]`),
    form = panel.locator("[data-desk-form]");
  if (key === "timeline")
    for (const [field, value] of Object.entries({
      housekeeping: "observation",
      transfer: "system",
      occupancy: "claim",
    }))
      await panel
        .locator(`[data-desk-input=type][data-field="${field}"]`)
        .selectOption(value);
  for (const id of sources[key])
    await form.locator(`[data-desk-input=cite][data-document="${id}"]`).check();
  for (const [field, value] of Object.entries({ ...values[key], ...override }))
    await form
      .locator(
        `[data-desk-input=choice][data-field="${field}"][value="${value}"]`,
      )
      .check();
  await form.locator("button[type=submit]").click();
  if (!wrong)
    await expect
      .poll(() =>
        page.evaluate(
          (key) =>
            JSON.parse(localStorage.getItem("stillwater-case:v2")).desk.results[
              key
            ]?.record,
          key,
        ),
      )
      .toBeTruthy();
}
export async function intake(page) {
  await page.locator('a[href="#evidence-desk?proof=intake"]').first().click();
  for (const id of ["sample", "booking"]) {
    await page
      .locator(`.desk-files [data-desk-op=open][data-document="${id}"]`)
      .click();
    await page
      .locator(
        `.desk-viewer>.desk-source [data-desk-op=compare][data-document="${id}"]`,
      )
      .click();
  }
  await citeAndSubmit(page, "intake");
}
