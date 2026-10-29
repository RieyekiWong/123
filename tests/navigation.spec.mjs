import { test, expect, reveal } from "./hotel-fixture.mjs";
const base = ["clock", "door", "ribbon", "register", "switch", "letter"];
const lowerSteps = ["power", "radio", "archive", "identity", "mirror"];
async function seed(page, puzzles = []) {
  await page.addInitScript(
    (value) => {
      if (!localStorage.getItem("stillwater-hotel:v2"))
        localStorage.setItem("stillwater-hotel:v2", JSON.stringify(value));
    },
    {
      name: "Avery",
      checkedIn: true,
      staff: true,
      chapter: 2,
      clues: base,
      puzzles,
      scares: false,
    },
  );
}
const back = (page) => page.locator("#dialog-back").click();
const close = (page) => page.locator("#dialog-close").click();

test("reading guidelines keeps the unfinished reservation and returns without reloading it", async ({
  page,
}) => {
  await page.goto("/#reservations");
  await page.locator("#guest-name").fill("Night visitor");
  await page.locator("#arrival-date").fill("2027-04-12");
  await page.locator("#stay-length").selectOption("4");
  await page.locator("#room-preference").selectOption("twin");
  await page.locator('.form-panel [data-action="rules"]').click();
  await page.locator('dialog [data-page="reservations"]').click();
  await expect(page.locator("dialog")).not.toBeVisible();
  await expect(page.locator("#guest-name")).toHaveValue("Night visitor");
  await expect(page.locator("#arrival-date")).toHaveValue("2027-04-12");
  await expect(page.locator("#stay-length")).toHaveValue("4");
  await expect(page.locator("#room-preference")).toHaveValue("twin");
});

for (const entry of ["index.html", "index-zh.html"]) {
  test(`${entry}: a source round trip restores circuit choices and their real controller state`, async ({
    page,
  }) => {
    await seed(page);
    await page.goto("/" + entry + "#below");
    await (await reveal(page, page.locator('main [data-action="puzzle-power"]'))).click();
    for (const n of [3, 1]) await page.locator(`[data-circuit="${n}"]`).click();
    await page.locator('dialog [data-action="switchboard"]').click();
    await expect(page.locator("#dialog-back")).toBeVisible();
    await back(page);
    await expect(page.locator("#circuit-readout")).toHaveText("3 → 1");
    await expect(page.locator('[data-circuit="3"]')).toBeDisabled();
    for (const n of [4, 2]) await page.locator(`[data-circuit="${n}"]`).click();
    await page.locator('#lower-power-form button[type="submit"]').click();
    await expect(page.locator("#clue-count")).toHaveText("7 / 12");
  });
}

test("a nested radio reference preserves tuning and decodes the restored value", async ({
  page,
}) => {
  await seed(page, ["power"]);
  await page.goto("/#below");
  await (await reveal(page, page.locator('main [data-action="puzzle-radio"]'))).click();
  await page.locator("#radio-frequency").evaluate((el) => {
    el.value = "887";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.locator('dialog [data-action="weather"]').click();
  await page.locator('dialog [data-action="dining"]').click();
  await back(page);
  await expect(page.locator("#dialog-title")).toHaveText(
    "The breakfast programme",
  );
  await back(page);
  await expect(page.locator("#radio-frequency")).toHaveValue("887");
  await expect(page.locator("#frequency-output")).toHaveText("88.7 MHz");
  await page.locator('#lower-radio-form button[type="submit"]').click();
  await expect(page.locator("dialog")).toContainText("FIRST LETTER");
});

test("looking up a menu preserves typed answers and chronology keeps partially selected events", async ({
  page,
}) => {
  await seed(page, lowerSteps);
  await page.goto("/#below");
  await (await reveal(page, page.locator('main [data-action="puzzle-archive"]'))).click();
  await page.locator('dialog [data-action="replay-archive"]').click();
  await page.locator("#answer-archive").fill("STI");
  await page.locator('dialog [data-action="dining"]').click();
  await back(page);
  await expect(page.locator("#answer-archive")).toHaveValue("STI");
  await close(page);
  await (await reveal(page, page.locator('main [data-action="puzzle-chronology"]'))).click();
  await page.locator('[data-date="open"]').click();
  await page.locator('[data-date="stop"]').click();
  await page.locator('dialog [data-action="incident"]').click();
  await page.locator('dialog [data-action="nightaudit"]').click();
  await back(page);
  await back(page);
  await expect(page.locator("#dates-readout")).toHaveText(
    "OPENING → CLOCK FAILURE",
  );
  await page.locator('[data-date="return"]').click();
  await page.locator('#lower-chronology-form button[type="submit"]').click();
  await expect(page.locator("#dialog-title")).toHaveText(
    "The dates are back in order",
  );
});

test("camera channel changes replace the current feed while Back returns to its source", async ({
  page,
}) => {
  await page.goto("/#rooms");
  await page.locator('main [data-action="explore"]').click();
  await page.locator('dialog [data-action="monitor"]').click();
  for (const n of [2, 3, 1, 3])
    await page.locator(`[data-camera="${n}"]`).click();
  await back(page);
  await expect(page.locator("#dialog-title")).toHaveText(
    "The third-floor directory",
  );
  await expect(page.locator("#dialog-back")).toBeHidden();
  await close(page);
  await page.locator('footer [data-action="journal"]').click();
  await expect(page.locator("#dialog-back")).toBeHidden();
});

test("scare frames cycle through distinct artwork and the preference hides every actor", async ({
  page,
}) => {
  await page.goto("/#rooms");
  await page.locator('main [data-action="explore"]').click();
  await page.locator('dialog [data-action="monitor"]').click();
  await page.locator('[data-camera="3"]').click();
  await page.locator('dialog [data-action="inspect-shadow"]').click();
  const ids = [];
  const sources = [];
  for (let n = 0; n < 4; n++) {
    ids.push(
      await page.locator(".intrusion-frame").getAttribute("data-encounter"),
    );
    sources.push(await page.locator(".intrusion-figure").getAttribute("src"));
    if (n < 3)
      await page.locator('dialog [data-action="inspect-shadow"]').click();
  }
  expect(new Set(ids.slice(0, 3)).size).toBe(3);
  expect(new Set(sources.slice(0, 3)).size).toBe(3);
  expect(ids[3]).not.toBe(ids[2]);
  await close(page);
  await page.locator('footer [data-action="about"]').click();
  await expect(page.locator("#sound-button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.locator('dialog [data-action="toggle-scares"]').click();
  await close(page);
  await page.locator('main [data-action="explore"]').click();
  await page.locator('dialog [data-action="monitor"]').click();
  await page.locator('[data-camera="3"]').click();
  await page.locator('dialog [data-action="inspect-shadow"]').click();
  await expect(page.locator(".intrusion-figure")).toHaveCount(0);
  await expect(page.locator("body")).toHaveClass(/quiet-effects/);
});

test("real hotel photographs have visible attribution and room cards use different files", async ({
  page,
}) => {
  await page.goto("/#rooms");
  const sources = await page
    .locator(".room-image img")
    .evaluateAll((images) => images.map((img) => img.getAttribute("src")));
  expect(new Set(sources).size).toBe(3);
  expect(sources).toEqual([
    "assets/guestroom.jpg",
    "assets/twin.jpg",
    "assets/suite.jpg",
  ]);
  await page.locator('footer [data-action="credits"]').click();
  await expect(page.locator(".credit-item")).toHaveCount(5);
  await expect(page.locator("dialog")).toContainText("Larry D. Moore");
  await expect(page.locator("dialog")).toContainText("CC BY 4.0");
  await expect(page.locator("dialog")).toContainText("Holidayinnklg");
});
