import { test, expect } from "./hotel-fixture.mjs";
async function ask(page, key) {
  await page.locator(`[data-support-keyword="${key}"]`).click();
  await expect(page.locator(`[data-support-keyword="${key}"]`)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#support-input")).not.toHaveValue("");
  await page.locator(".support-send").click();
}
async function clock(page) {
  await page.clock.install({ time: new Date("2026-10-28T23:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-28T23:00:01Z"));
}
for (const entry of ["index-zh.html", "index.html"])
  test(`${entry}: management introduces Reed; three consecutive time questions summon the impostor, then normal help remains available`, async ({
    page,
  }) => {
    await clock(page);
    await page.goto("/" + entry + "#history");
    await page.locator('main [data-action="management"]').click();
    await expect(page.locator(".management-profiles article")).toHaveCount(4);
    await expect(page.locator(".management-profiles")).toContainText(
      entry.includes("zh") ? "很在意时间" : "particular about time",
    );
    await page
      .locator('.management-profiles [data-action="contact-supervisor"]')
      .click();
    const normalBody = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const normalNav = await page
      .locator(".navigation")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    await ask(page, "schedule");
    await ask(page, "startdate");
    await expect(page.locator("#support-interruption")).toBeHidden();
    await ask(page, "reporttime");
    await expect(page.locator("#story-dialog")).toHaveClass(/support-impostor/);
    await expect(page.locator("body")).toHaveClass(/supervisor-takeover/);
    expect(
      await page
        .locator("body")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).not.toBe(normalBody);
    expect(
      await page
        .locator(".navigation")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).not.toBe(normalNav);
    expect(
      await page
        .locator("#support-controls")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe("rgb(36, 16, 22)");
    expect(
      await page
        .locator("#story-dialog")
        .evaluate((el) => getComputedStyle(el, "::backdrop").backdropFilter),
    ).toBe("none");
    await expect(page.locator("#support-signal-messages")).toContainText(
      entry.includes("zh") ? "迪伦·哈克" : "Dylan Harker",
    );
    await expect(page.locator("#support-signal-messages")).toContainText(
      entry.includes("zh") ? "下班时间" : "finishing time",
    );
    await page.locator("#dialog-close").click();
    await expect(page.locator("body")).not.toHaveClass(/supervisor-takeover/);
    expect(
      await page
        .locator("body")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe(normalBody);
    await page.reload();
    await expect(page.locator("body")).not.toHaveClass(/supervisor-takeover/);
    await page.locator('main [data-action="management"]').click();
    await page
      .locator('.management-profiles [data-action="contact-supervisor"]')
      .click();
    await expect(page.locator("[data-support-dismiss]")).toBeVisible();
    await expect(page.locator("body")).toHaveClass(/supervisor-takeover/);
    await page.locator("[data-support-dismiss]").click();
    await expect(page.locator("body")).not.toHaveClass(/supervisor-takeover/);
    expect(
      await page
        .locator(".navigation")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe(normalNav);
    await expect(page.locator("#support-input")).toBeEnabled();
    await ask(page, "duties");
    await expect(page.locator("#support-interruption")).toBeVisible();
    await expect(page.locator("#story-dialog")).not.toHaveClass(
      /support-impostor/,
    );
    await page.clock.runFor(15000);
    await expect(page.locator('[data-action="job-accept"]')).toBeEnabled();
  });
test("all supervisor topics can be selected and sent, including the formerly unresponsive later options", async ({
  page,
}) => {
  await clock(page);
  await page.goto("/index-zh.html");
  await page.locator('footer [data-action="job-resume"]').click();
  for (const [index, key] of [
    "duties",
    "pay",
    "schedule",
    "handover",
    "startdate",
    "reporttime",
  ].entries()) {
    await ask(page, key);
    if (index === 2) {
      await expect(page.locator("#support-input")).toBeDisabled();
      await page.clock.runFor(15000);
    }
    await expect(page.locator(".support-message--user")).toHaveCount(index + 1);
    await expect(page.locator("#support-input")).toBeEnabled();
  }
  await expect(page.locator("#story-dialog")).not.toHaveClass(
    /support-impostor/,
  );
});
test("a non-time question resets the consecutive count and free-text date questions count correctly", async ({
  page,
}) => {
  await clock(page);
  await page.goto("/index-zh.html");
  await page.locator('footer [data-action="job-resume"]').click();
  await ask(page, "schedule");
  await ask(page, "startdate");
  await ask(page, "pay");
  await page.clock.runFor(15000);
  for (const [index, message] of [
    "什么时候可以入职？",
    "哪天报到？",
    "我几点到酒店开始工作？",
  ].entries()) {
    await page.locator("#support-input").fill(message);
    await page.locator(".support-send").click();
    if (index < 2)
      await expect(page.locator("#story-dialog")).not.toHaveClass(
        /support-impostor/,
      );
  }
  await expect(page.locator("[data-support-dismiss]")).toBeVisible();
  await page.locator("[data-support-dismiss]").click();
  for (const key of ["schedule", "startdate", "reporttime"])
    await ask(page, key);
  await expect(page.locator("#support-interruption")).toBeHidden();
});

test("later topics remain selectable during the fifteen-second interruption and their draft can be sent afterwards", async ({
  page,
}) => {
  await clock(page);
  await page.goto("/index-zh.html");
  await page.locator('footer [data-action="job-resume"]').click();
  for (const key of ["duties", "pay", "schedule"]) await ask(page, key);
  await expect(page.locator("#support-interruption")).toBeVisible();
  await page.locator('[data-support-keyword="handover"]').click();
  await expect(page.locator("#support-input")).toHaveValue(
    "我想办理入职，接下来该怎么做？",
  );
  await expect(page.locator("#support-input-status")).toContainText("暂存");
  await expect(page.locator(".support-send")).toBeDisabled();
  await page.clock.runFor(15000);
  await expect(page.locator("#support-input")).toHaveValue(
    "我想办理入职，接下来该怎么做？",
  );
  await expect(page.locator(".support-send")).toBeEnabled();
  await page.locator(".support-send").click();
  await expect(page.locator(".support-message--user")).toHaveCount(4);
});

for (const reduced of [false, true])
  test(`whole-site supervisor colors restore on Escape and navigation, reduced motion: ${reduced}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    if (reduced) await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() =>
      localStorage.setItem(
        "stillwater-hotel:v2",
        JSON.stringify({
          scares: false,
          sideQuests: { support: { impostorSeen: true, impostorActive: true } },
        }),
      ),
    );
    await page.goto("/index-zh.html");
    await page.locator('footer [data-action="job-resume"]').click();
    await expect(page.locator("body")).toHaveClass(/supervisor-takeover/);
    expect(
      await page
        .locator("body")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe("rgb(32, 14, 18)");
    await page.keyboard.press("Escape");
    await expect(page.locator("body")).not.toHaveClass(/supervisor-takeover/);
    await page.locator('footer [data-action="job-resume"]').click();
    await expect(page.locator("body")).toHaveClass(/supervisor-takeover/);
    await page.evaluate(() => (location.hash = "history"));
    await expect(page.locator("body")).not.toHaveClass(/supervisor-takeover/);
  });
