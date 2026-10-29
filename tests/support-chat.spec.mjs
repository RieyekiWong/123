import { test, expect } from "./hotel-fixture.mjs";
async function pauseClock(page) {
  await page.clock.install({ time: new Date("2026-10-28T18:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-28T18:00:01Z"));
}
async function ask(page, key) {
  await page.locator(`[data-support-keyword="${key}"]`).click();
  await expect(page.locator("#support-input")).not.toHaveValue("");
  await page.locator(".support-send").click();
}
async function open(page, entry = "index-zh.html", mode = "supervisor") {
  await page.goto("/" + entry);
  await page
    .locator(
      mode === "supervisor"
        ? 'footer [data-action="job-resume"]'
        : 'footer [data-action="inquiry"]',
    )
    .click();
}
for (const entry of ["index.html", "index-zh.html"])
  test(`${entry}: the third sent message interrupts support for exactly fifteen seconds and normal chat then returns`, async ({
    page,
  }) => {
    await pauseClock(page);
    await open(page, entry);
    await expect(page.locator("#story-dialog")).toHaveClass(
      /support-chat-dialog/,
    );
    await ask(page, "duties");
    await ask(page, "pay");
    await expect(page.locator("#support-interruption")).toBeHidden();
    await expect(page.locator(".support-message--user")).toHaveCount(2);
    await expect(page.locator('[data-action="job-accept"]')).toBeDisabled();
    await ask(page, "schedule");
    await expect(page.locator("#support-interruption")).toBeVisible();
    await expect(page.locator("#support-input")).toBeDisabled();
    await page.clock.runFor(2000);
    await expect(page.locator("#support-signal-messages")).toContainText(
      entry.includes("zh") ? "迪伦·哈克" : "Dylan Harker",
    );
    await page.clock.runFor(12999);
    await expect(page.locator("#support-interruption")).toBeVisible();
    await expect(page.locator("#support-signal-messages")).toContainText(
      entry.includes("zh")
        ? "先走廊，再前台，最后客房"
        : "corridor first, reception second, guest room last",
    );
    await page.clock.runFor(1);
    await expect(page.locator("#support-interruption")).toBeHidden();
    await expect(page.locator("#support-thread")).toBeVisible();
    await expect(page.locator(".support-message--user")).toHaveCount(3);
    await expect(page.locator("#support-thread")).not.toContainText(
      entry.includes("zh") ? "迪伦" : "Dylan",
    );
    await expect(page.locator("#support-input")).toBeEnabled();
    await expect(page.locator('[data-action="job-accept"]')).toBeEnabled();
    await expect(page.locator("#story-dialog")).not.toHaveClass(
      /support-corrupted/,
    );
    await ask(page, "schedule");
    await page.clock.runFor(16000);
    await expect(page.locator("#support-interruption")).toBeHidden();
  });

test("concierge also receives the interruption and can transfer to the supervisor afterwards", async ({
  page,
}) => {
  await pauseClock(page);
  await open(page, "index-zh.html", "concierge");
  await ask(page, "registration");
  await ask(page, "room");
  await ask(page, "supervisor");
  await expect(page.locator("#support-interruption")).toBeVisible();
  await page.clock.runFor(15000);
  await page.locator('dialog [data-action="contact-supervisor"]').click();
  await expect(page.locator("#support-chat")).toHaveAttribute(
    "data-support-mode",
    "supervisor",
  );
  await ask(page, "duties");
  await ask(page, "pay");
  await ask(page, "schedule");
  await expect(page.locator("#support-interruption")).toBeHidden();
});

test("closing or reloading during the interruption preserves its deadline and restores the same conversation", async ({
  page,
}) => {
  await pauseClock(page);
  await open(page);
  await ask(page, "duties");
  await ask(page, "pay");
  await ask(page, "schedule");
  await page.clock.runFor(5000);
  await page.locator("#dialog-close").click();
  await page.locator('footer [data-action="about"]').click();
  await expect(page.locator("#story-dialog")).not.toHaveClass(
    /support-chat-dialog|support-corrupted/,
  );
  await page.locator("#dialog-close").click();
  await page.clock.runFor(4000);
  await page.reload();
  await page.locator('footer [data-action="job-resume"]').click();
  await expect(page.locator("#support-interruption")).toBeVisible();
  await page.clock.runFor(5999);
  await expect(page.locator("#support-interruption")).toBeVisible();
  await page.clock.runFor(1);
  await expect(page.locator("#support-interruption")).toBeHidden();
  await expect(page.locator(".support-message--user")).toHaveCount(3);
});

test("homepage conceals Dylan; an ordinary guest review contains the attached plea", async ({
  page,
}) => {
  await page.goto("/index-zh.html");
  expect(await page.locator("main").innerText()).not.toMatch(
    /迪伦|Dylan|Harker|求助/,
  );
  await page.locator('footer a[href="#guestbook"]').click();
  await expect(page.locator(".dylan-public-entry")).toBeHidden();
  await page.locator(".guestbook-archive > summary").click();
  const review = page.locator(".dylan-public-entry");
  await expect(review).toContainText("D. H.");
  expect(await review.innerText()).not.toMatch(/迪伦|求助|出不去/);
  await review.locator('[data-action="dylan-message"]').click();
  await expect(page.locator("#dialog-title")).toContainText("迪伦");
  await expect(page.locator("#dylan-order")).toBeVisible();
});

test("free text, draft persistence, keyboard sending and HTML escaping work without rewriting user content", async ({
  page,
}) => {
  await pauseClock(page);
  await open(page);
  await page
    .locator("#support-input")
    .fill('Home <img src=x onerror="window.bad=1">');
  await page.locator("#support-input").press("Enter");
  await expect(
    page.locator(".support-message--user .support-bubble"),
  ).toHaveText('Home <img src=x onerror="window.bad=1">');
  expect(await page.locator("#support-thread img").count()).toBe(0);
  expect(await page.evaluate(() => window.bad)).toBeUndefined();
  await page.locator("#support-input").fill("还没发出的草稿");
  await page.locator("#dialog-close").click();
  await page.reload();
  await page.locator('footer [data-action="job-resume"]').click();
  await expect(page.locator("#support-input")).toHaveValue("还没发出的草稿");
  await page.locator("#support-input").fill("");
  await page.locator(".support-send").click();
  await expect(page.locator(".support-message--user")).toHaveCount(1);
  await page.locator("#support-input").fill("换行");
  await page.locator("#support-input").press("Shift+Enter");
  await expect(page.locator(".support-message--user")).toHaveCount(1);
});

for (const setting of ["quiet", "reduced"])
  test(`the interruption keeps readable clues with ${setting} effects`, async ({
    page,
  }) => {
    await page.addInitScript(
      (quiet) =>
        localStorage.setItem(
          "stillwater-hotel:v2",
          JSON.stringify({ scares: !quiet }),
        ),
      setting === "quiet",
    );
    if (setting === "reduced")
      await page.emulateMedia({ reducedMotion: "reduce" });
    await pauseClock(page);
    await open(page);
    await ask(page, "duties");
    await ask(page, "pay");
    await ask(page, "schedule");
    await page.clock.runFor(8500);
    await expect(page.locator("#support-signal-messages")).toContainText(
      "迪伦",
    );
    await expect(page.locator("#story-dialog")).not.toHaveClass(
      /support-corrupted/,
    );
    await page.clock.runFor(6500);
    await expect(page.locator("#support-input")).toBeEnabled();
  });

for (const width of [320, 390, 768, 1320])
  test(`support conversation and interruption fit ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await pauseClock(page);
    await open(page);
    await ask(page, "duties");
    await ask(page, "pay");
    await ask(page, "schedule");
    await page.clock.runFor(8500);
    const bounds = await page.locator("#story-dialog").boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    expect(
      await page
        .locator("#story-dialog")
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    await page.clock.runFor(6500);
    await expect(page.locator("#support-input")).toBeEnabled();
  });
