import { test, expect, reveal } from "./hotel-fixture.mjs";
const baseClues = ["clock", "door", "ribbon", "register", "switch", "letter"];
async function seed(page, extra = {}) {
  await page.addInitScript(
    (value) => {
      if (!localStorage.getItem("stillwater-hotel:v2"))
        localStorage.setItem("stillwater-hotel:v2", JSON.stringify(value));
    },
    {
      name: "Morgan",
      checkedIn: true,
      staff: true,
      clues: baseClues,
      chapter: 2,
      puzzles: [],
      scares: true,
      ...extra,
    },
  );
}
const close = (page) =>
  page.getByRole("button", { name: "Close window", exact: true }).click();

test("public services and expandable notices retain all fair puzzle sources", async ({
  page,
}) => {
  await page.goto("/#guide");
  const cards = [
    ["dining", "The dining room", "WSTL, 88.7 FM"],
    [
      "readingroom",
      "The reading room",
      "reflected writing must be read in reverse",
    ],
    ["garden", "The courtyard walk", "05 October"],
    ["switchboard", "Service restoration order", "first ring reception"],
    ["residents", "A circular for long-stay residents", "Walter Vale"],
    ["inventory", "Lost property, awaiting collection", "Do not turn"],
  ];
  await expect(page.locator(".guide-grid .document-card")).toHaveCount(4);
  await expect(page.locator('main [data-action="switchboard"]')).toBeHidden();
  await page.locator(".service-notices > summary").click();
  for (const [id, title, clue] of cards) {
    const technical = ['switchboard', 'residents'].includes(id);
    await page.locator(`nav [data-nav="${technical ? 'history' : 'guide'}"]`).click();
    if (technical && (await page.locator('.hotel-collection').getAttribute('open')) === null) await page.locator('.hotel-collection > summary').click();
    await page.locator(`main [data-action="${id}"]`).click();
    if (await page.locator(".facility-records").count()) await page.locator(".facility-records > summary").click();
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    await expect(page.locator("dialog")).toContainText(clue);
    expect(await page.locator("dialog .handwritten").count()).toBe(0);
    const note = page.locator("dialog .file-note").first();
    if (await note.count())
      expect(await note.evaluate((el) => getComputedStyle(el).fontStyle)).toBe(
        "normal",
      );
    await close(page);
  }
  await expect(page.locator("#clue-count")).toHaveText("0 / 6");
});

test("lower station dependencies and solved progress survive reloading", async ({
  page,
}) => {
  await seed(page, { clues: [...baseClues, "power"], puzzles: ["power"] });
  await page.goto("/#below");
  await expect(page.locator('main [data-action="puzzle-radio"]')).toBeEnabled();
  await expect(
    page.locator('main [data-action="puzzle-archive"]'),
  ).toBeDisabled();
  await expect(
    page.locator('main [data-action="final-discharge"]'),
  ).toBeDisabled();
  await (await reveal(page, page.locator('main [data-action="puzzle-power"]'))).click();
  await expect(page.locator("dialog")).toContainText(
    "This station is complete.",
  );
  await page.locator('dialog [data-action="replay-power"]').click();
  for (const id of [3, 1, 4, 2])
    await page.locator(`[data-circuit="${id}"]`).click();
  await page
    .getByRole("button", { name: "Energize selected sequence" })
    .click();
  await expect(page.locator("#clue-count")).toHaveText("7 / 12");
  await close(page);
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("stillwater-hotel:v2")).puzzles)).toEqual(["power"]);
  await expect(page.locator('.lower-current [data-action="puzzle-radio"]')).toBeVisible();
  await expect(page.locator('main [data-action="puzzle-radio"]')).toBeEnabled();
});

test("sudden-effect preference persists and does not block puzzle interaction", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/#below");
  await page.locator('footer [data-action="about"]').click();
  await expect(page.locator("#sound-button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.locator('[data-action="toggle-scares"]').click();
  await expect(page.locator('[data-action="toggle-scares"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await close(page);
  await page.reload();
  await expect(page.locator("body")).toHaveClass(/quiet-effects/);
  expect(
    await page
      .locator(".visitor-window img")
      .evaluate((img) => getComputedStyle(img).visibility),
  ).toBe("hidden");
  await (await reveal(page, page.locator('main [data-action="puzzle-power"]'))).click();
  for (let n = 0; n < 3; n++)
    await page
      .getByRole("button", { name: "Energize selected sequence" })
      .click();
  await expect(page.locator("#puzzle-error")).toContainText("rejects");
  await expect(page.locator("body")).not.toHaveClass(/intrusion-hit/);
  for (const id of [3, 1, 4, 2])
    await page.locator(`[data-circuit="${id}"]`).click();
  await page
    .getByRole("button", { name: "Energize selected sequence" })
    .click();
  await expect(
    page.getByRole("heading", { name: "The second supply answers" }),
  ).toBeVisible();
});

test("reduced motion suppresses animated interruptions", async ({ page }) => {
  await seed(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#below");
  await (await reveal(page, page.locator('main [data-action="puzzle-power"]'))).click();
  for (let n = 0; n < 3; n++)
    await page
      .getByRole("button", { name: "Energize selected sequence" })
      .click();
  expect(
    await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el, "::before").display),
  ).toBe("none");
  expect(
    await page
      .locator("dialog")
      .evaluate((el) => getComputedStyle(el, "::before").display),
  ).toBe("none");
});

for (const width of [320, 390, 768, 1320]) {
  test(`lower register, dialogue and public archive fit ${width}px`, async ({
    page,
  }) => {
    await seed(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#below");
    await expect(page.locator(".lower-card")).toHaveCount(6);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await (await reveal(page, page.locator('main [data-action="puzzle-power"]'))).click();
    const rect = await page.locator("dialog").boundingBox();
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(width);
    await page.locator('dialog [data-action="switchboard"]').click();
    const dialogWidths = await page
      .locator("dialog")
      .evaluate((el) => ({ content: el.scrollWidth, visible: el.clientWidth }));
    expect(dialogWidths.content).toBeLessThanOrEqual(dialogWidths.visible + 1);
    await page.keyboard.press("Escape");
    await page.locator('nav [data-nav="guide"]').click();
    await expect(page.locator("body")).toHaveClass(/breached/);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await page.locator("#chapter-return button").click();
    await expect(page.locator(".lower-register")).toBeVisible();
  });
}

test("old completed public story can enter the new chapter without resetting", async ({
  page,
}) => {
  await seed(page, { chapter: 1, endings: ["release"] });
  await page.goto("/");
  await page.locator("#journal-button").click();
  await page.locator('dialog [data-room="404"]').click();
  await page.getByLabel("Four-digit door code").fill("0404");
  await page.getByRole("button", { name: "Turn the lock" }).click();
  await page.locator('dialog [data-action="ending-release"]').click();
  await expect(
    page.getByRole("heading", { name: "CHECKOUT REJECTED" }),
  ).toBeVisible();
  await page.locator('dialog [data-action="continue-below"]').click();
  await expect(page.locator("dialog")).not.toBeVisible();
  await expect(page.locator(".lower-register")).toBeVisible();
  await expect(page.locator("#clue-count")).toHaveText("6 / 12");
});

test("reset removes both chapters and a direct lower URL cannot skip the story", async ({
  page,
}) => {
  await seed(page, {
    clues: [...baseClues, "power"],
    puzzles: ["power"],
    scares: false,
  });
  await page.goto("/#below");
  await page.locator('footer [data-action="about"]').click();
  await page.locator('dialog [data-action="reset-prompt"]').click();
  await page.locator('dialog [data-action="reset-confirm"]').click();
  await expect(page.locator("#clue-count")).toHaveText("0 / 6");
  await expect(page.locator("body")).not.toHaveClass(/breached/);
  await expect(page.locator("#chapter-return")).toBeHidden();
  await expect(page.locator("body")).toHaveClass(/quiet-effects/);
  await page.goto("/#below");
  await expect(
    page.getByRole("heading", { name: "Record unavailable." }),
  ).toBeVisible();
  await expect(page.locator(".lower-card")).toHaveCount(0);
});
