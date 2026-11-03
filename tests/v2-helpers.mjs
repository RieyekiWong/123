import { expect } from "@playwright/test";
import { solveVoid } from "./v2-void-helpers.mjs";
export const link = async (page, route, scope = "main") => {
  await page.locator(`${scope} a[href="#${route}"]`).first().click();
  await expect(page).toHaveURL((url) => url.hash === "#" + route);
};
export const state = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("stillwater-case:v2")));
export async function toAudit(page, entry = "index-zh.html") {
  await page.goto("/" + entry);
  if (await page.locator("#case-welcome[open]").count())
    await page.locator("[data-welcome=enter]").click();
  if (await page.locator(".chat-app").count()) {
    await page.locator("#chat-input").fill(entry.includes("zh") ? "发链接我看看" : "Send me the link");
    await page.locator(".chat-composer button[type=submit]").click();
    await page.locator(".chat-share-card").click();
  }
  if (await page.locator('.bbs-topic-link[href="#forum?topic=job"]').count())
    await page.locator('.bbs-topic-link[href="#forum?topic=job"]').click();
  await page.locator(".forum-recruit-link").click();
  const reference = await page.locator(".job-card .reference").innerText();
  await page.locator("[data-case-action=sample]").click();
  await expect(page.locator("#reservation-search")).toBeVisible();
  await page.locator("#reservation-reference").fill("R-wrong");
  await page.locator("#reservation-search button").click();
  await expect(page.locator("#reservation-error")).not.toBeEmpty();
  await page.locator("#reservation-reference").fill(reference);
  await page.locator("#reservation-search button").click();
  const assigned = await page
    .locator("#reservation-result table tr")
    .nth(2)
    .locator("td")
    .innerText();
  await link(page, "rooms");
  await expect(page.locator(".notice-window")).toBeVisible();
  await page.locator("[data-case-action=dismiss-notice]").click();
  await page.locator("#inventory-room").selectOption(assigned);
  await page.locator("#inventory-check button").click();
  await link(page, "guestbook");
  await page.locator("[data-case-action=read-key]").click();
  await link(page, "floor-plan");
  await page.locator(".service-space").click();
  const docket = await page
    .locator(".document table tr")
    .nth(2)
    .locator("td")
    .innerText();
  await page.locator("[name=classification][value=guest]").check();
  await page.locator("#service-classification button").click();
  await expect(page.locator("#service-error")).not.toBeEmpty();
  await page.locator("[name=classification][value=service]").check();
  await page.locator("#service-classification button").click();
  await link(page, "maintenance");
  await page.locator("#maintenance-reference").fill(docket);
  await page.locator("#maintenance-search button").click();
  await expect(page.locator(".document")).toContainText("E-014");
  await link(page, "night-audit");
}
export async function toRevisions(page) {
  await page.locator("[name=assessment][value=insufficient]").check();
  await page.locator("#night-audit-form > button").click();
  await expect(page.locator("#audit-error")).not.toBeEmpty();
  const rows = await page.locator(".audit-cards li").evaluateAll((els) =>
    els
      .map((el) => ({
        id: el.dataset.log,
        at: el.querySelector("time").dateTime,
      }))
      .sort((a, b) => a.at.localeCompare(b.at)),
  );
  for (let index = 0; index < rows.length; index++) {
    while (
      (await page
        .locator(".audit-cards li")
        .evaluateAll(
          (els, id) => els.findIndex((el) => el.dataset.log === id),
          rows[index].id,
        )) > index
    )
      await page
        .locator(`[data-log="${rows[index].id}"] [data-direction="-1"]`)
        .click();
  }
  await page.locator("[name=assessment][value=confirmed]").check();
  await page.locator("#night-audit-form > button").click();
  await expect(page.locator("#audit-error")).not.toBeEmpty();
  await page.locator("[name=assessment][value=insufficient]").check();
  await page.locator("#night-audit-form > button").click();
  await link(page, "staff");
  await expect(page.locator("main")).toContainText("Mara Ellis");
  await link(page, "revisions");
}
export async function toReview(page) {
  const changed = await page
    .locator(".revision-table tbody tr")
    .evaluateAll((rows) =>
      rows
        .filter((row) => row.cells[2].textContent !== row.cells[3].textContent)
        .map((row) => row.querySelector("input").value),
    );
  await page.locator("[name=difference][value=reference]").check();
  await page.locator("#revision-form > button").click();
  await expect(page.locator("#revision-error")).not.toBeEmpty();
  await page.locator("[name=difference][value=reference]").uncheck();
  for (const field of changed)
    await page.locator(`[name=difference][value="${field}"]`).check();
  await page.locator("#revision-form > button").click();
  await link(page, "closure");
  await expect(page.locator("main")).toContainText("2007-01-08");
  await link(page, "mara");
  await link(page, "review");
}
export async function validateFindings(page) {
  await page.locator("[name=claim][value=occupancy]").check();
  await page.locator("#final-evidence-form > button").click();
  await expect(page.locator("#evidence-error")).not.toBeEmpty();
  await page.locator("[name=claim][value=occupancy]").uncheck();
  for (const id of ["service", "reviewer", "revision"])
    await page.locator(`[name=claim][value="${id}"]`).check();
  await page.locator("#final-evidence-form > button").click();
  await expect(page.locator(".verification-receipt")).toBeVisible();
}

export async function toNight(page, visit = async () => {}) {
  await expect(page.locator("[data-ending]")).toHaveCount(0);
  await page.locator("[data-case-action=sync-records]").click();
  await expect(page.locator("body")).toHaveAttribute("data-anomaly", "altered");
  await link(page, "rooms");
  await link(page, "guestbook");
  await link(page, "cameras");
  await visit("cameras");
  await page.locator('[data-night-action=link][data-link="0"]').click();
  await expect(page.locator("#night-feedback")).not.toBeEmpty();
  for (const [cam, pan] of [
    [0, 2],
    [1, 0],
  ])
    await page
      .locator(`[data-night-action=pan][data-cam="${cam}"][data-pan="${pan}"]`)
      .click();
  await page.locator('[data-night-action=link][data-link="0"]').click();
  for (const [cam, pan] of [
    [1, 2],
    [2, 0],
  ])
    await page
      .locator(`[data-night-action=pan][data-cam="${cam}"][data-pan="${pan}"]`)
      .click();
  await page.locator('[data-night-action=link][data-link="1"]').click();
  await page
    .locator('[data-night-action=pan][data-cam="2"][data-pan="2"]')
    .click();
  await page.locator("[data-night-action=door]").click();
  await expect(page.locator("body")).toHaveAttribute(
    "data-anomaly",
    "terminal",
  );
  await expect(page).toHaveURL(/#service-passage$/);
  await visit("corridor");
  await page.locator(".space-actions [data-target=plate]").click();
  await page.locator("[data-night-action=walk][data-position=west]").click();
  await page.locator(".space-actions [data-target=cart]").click();
  await page.locator(".space-actions [data-target=cabinet]").click();
  await visit("cabinet");
  await page.locator(".space-actions [data-target=power]").click();
  await page.locator("[data-night-action=walk][data-position=service]").click();
  await page.locator(".space-actions [data-target=enter]").click();
  await expect(page).toHaveURL(/#terminal$/);
  await visit("terminal");
  await page.locator("[data-night-action=frame]").click();
  await page.locator('[data-night-action=rotate][data-node="0"]').click();
}
export async function wireNight(page, { visitVoid = async () => {} } = {}) {
  // Follow the physical A-D-E-B-C-F path, checking the rendered connector angles.
  for (const [node, target] of [
    [0, 2],
    [3, 0],
    [4, 3],
    [1, 1],
    [2, 2],
    [5, 0],
  ]) {
    const button = page.locator(
      `[data-night-action=rotate][data-node="${node}"]`,
    );
    for (let turn = 0; turn < 4; turn++) {
      const transform = await button.locator("[data-circuit-wire]").getAttribute("transform");
      if (transform === `rotate(${target * 90} 50 50)`) break;
      await button.click();
    }
  }
  await expect(page.locator(".circuit-status")).toContainText("03:17");
  await page.locator("[data-night-action=isolate]").click();
  await page.locator("[data-night-action=manual]").click();
  await page.locator("[data-night-action=save]").click();
  if (await page.locator('[data-unlisted-entry]').count() && !(await page.locator('[data-night-action=lock]').count())) {
    await page.locator('[data-unlisted-entry]').click();
    await solveVoid(page, { visit: visitVoid });
  }
  await expect(page.locator("[data-night-action=lock]")).toBeVisible();
}
