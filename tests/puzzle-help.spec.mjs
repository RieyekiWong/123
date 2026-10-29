import { test, expect } from "./hotel-fixture.mjs";
const base = ["clock", "door", "ribbon", "register", "switch", "letter"];
async function seed(page, puzzles = []) {
  await page.addInitScript(
    (value) => {
      if (!localStorage.getItem("stillwater-hotel:v2"))
        localStorage.setItem("stillwater-hotel:v2", JSON.stringify(value));
    },
    {
      name: "Avery",
      checkedIn: true,
      chapter: 2,
      clues: base,
      puzzles,
      scares: false,
    },
  );
}

test("power selection supports undo, counts accurately and retains source references without an answer reveal", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/index-zh.html#below");
  await page.locator('main [data-action="puzzle-power"]').click();
  await page.locator('[data-circuit="3"]').click();
  await page.locator('[data-circuit="2"]').click();
  await expect(page.locator("#circuit-count")).toHaveText("2 / 4");
  await page.locator('[data-action="undo-circuit"]').click();
  await expect(page.locator("#circuit-readout")).toHaveText("3");
  await expect(page.locator('[data-circuit="2"]')).toBeEnabled();
  await page.locator(".puzzle-help > summary").click();
  await expect(page.locator(".puzzle-help p")).toContainText("供电说明");
  await expect(page.locator(".puzzle-help")).not.toContainText("3142");
  await expect(page.locator(".puzzle-hint")).toHaveCount(0);
  await page.locator('dialog [data-action="switchboard"]').click();
  await page.locator("#dialog-back").click();
  await expect(page.locator("#circuit-count")).toHaveText("1 / 4");
  await expect(page.locator(".puzzle-help p")).toBeVisible();
  for (const n of [1, 4, 2])
    await page.locator(`[data-circuit="${n}"]`).click();
  await page.locator('#lower-power-form [type="submit"]').click();
  await expect(page.locator("#clue-count")).toHaveText("7 / 12");
});

test("radio accepts exact typing, keeps the slider in sync and restores both controls after a source visit", async ({
  page,
}) => {
  await seed(page, ["power"]);
  await page.goto("/#below");
  await page.locator('main [data-action="puzzle-radio"]').click();
  await page.locator("#radio-frequency-number").fill("88.7");
  await expect(page.locator("#radio-frequency")).toHaveValue("887");
  await expect(page.locator("#frequency-output")).toHaveText("88.7 MHz");
  await page.locator('dialog [data-action="weather"]').click();
  await page.locator("#dialog-back").click();
  await expect(page.locator("#radio-frequency-number")).toHaveValue("88.7");
  await page.locator('#lower-radio-form [type="submit"]').click();
  await expect(page.locator("#clue-count")).toHaveText("7 / 12");
  await expect(page.locator("dialog")).toContainText("FIRST LETTER");
});

test("chronology can undo the latest event without clearing the earlier selection", async ({
  page,
}) => {
  await seed(page, ["power", "radio", "archive", "identity", "mirror"]);
  await page.goto("/#below");
  await page.locator('main [data-action="puzzle-chronology"]').click();
  await page.locator('[data-date="open"]').click();
  await page.locator('[data-date="return"]').click();
  await page.locator('[data-action="undo-date"]').click();
  await expect(page.locator("#date-count")).toHaveText("1 / 3");
  await expect(page.locator('[data-date="open"]')).toBeDisabled();
  await expect(page.locator('[data-date="return"]')).toBeEnabled();
  for (const id of ["stop", "return"])
    await page.locator(`[data-date="${id}"]`).click();
  await page.locator('#lower-chronology-form [type="submit"]').click();
  await expect(page.locator("dialog")).toContainText(
    "The dates are back in order",
  );
});
