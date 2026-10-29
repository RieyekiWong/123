import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "stillwater-lobby-music:v1",
      JSON.stringify({ enabled: false }),
    );
    localStorage.setItem("stillwater-instructions:v1", "read");
  });
});
const failures = ["harbor", "park", "cedar", "lake", "union", "elm"];
async function apply(page, id) {
  await page.locator(`[data-job-card="${id}"] [data-career-apply]`).click();
  await expect(
    page.locator(`[data-job-card="${id}"] .career-result`),
  ).toBeVisible();
}
async function invitation(page) {
  for (const id of failures) await apply(page, id);
  await expect(page.locator("#career-invitation")).toBeVisible();
}

for (const entry of ["index.html", "index-zh.html"]) {
  test(`${entry}: cold opening leads from failed applications to the hotel and keeps the applicant identity`, async ({
    page,
  }) => {
    const errors = [],
      methods = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => methods.push(request.method()));
    await page.goto("/" + entry);
    await expect(page.locator("#career-scene h1")).toBeVisible();
    await expect(page.locator("#career-results .career-job")).toHaveCount(6);
    await expect(page.locator("#career-invitation")).toBeHidden();
    await apply(page, "harbor");
    await apply(page, "park");
    await expect(page.locator("#career-invitation")).toBeHidden();
    await page.reload();
    await expect(
      page.locator('[data-job-card="harbor"] [data-career-apply]'),
    ).toBeDisabled();
    for (const id of failures.slice(2)) await apply(page, id);
    await expect(page.locator("#career-invitation")).toBeVisible();
    await page.locator('[data-career="dismiss"]').click();
    await expect(page.locator("#career-invitation")).toBeHidden();
    await page.locator('[data-career="message"]').click();
    await page.locator('[data-career="enter"]').click();
    await expect(page.locator("#career-scene")).toHaveCount(0);
    await expect(page.locator("#applicant-banner")).toBeVisible();
    await page.locator('#applicant-banner [data-page="reservations"]').click();
    await expect(page.locator("main")).toContainText(
      entry.includes("zh")
        ? "本次登记不代表已办理入职"
        : "this is not a staff contract",
    );
    await page.locator("#guest-name").fill("林 & Rowan");
    await page.locator("#agree-guidelines").check();
    await page.locator('#reservation-form [type="submit"]').click();
    await expect(page.locator("#applicant-banner")).toBeHidden();
    await expect(page.locator(".form-panel")).toContainText(
      entry.includes("zh") ? "等候夜班交接" : "night receptionist interview",
    );
    await page.reload();
    await expect(page.locator("#career-scene")).toHaveCount(0);
    const save = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("stillwater-hotel:v2")),
    );
    expect(save.applicant).toBe(true);
    expect(save.checkedIn).toBe(true);
    expect(save.name).toBe("林 & Rowan");
    expect(methods.every((method) => method === "GET")).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("all six advertised jobs reject applications; the invitation does not hide the remaining listings", async ({
  page,
}) => {
  await page.goto("/index-zh.html");
  for (const id of failures) await apply(page, id);
  await expect(page.locator("#career-results .career-result")).toHaveCount(6);
  await expect(page.locator("#career-attempt-count")).toContainText("6");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("stillwater-career:v1")),
  );
  expect(new Set(saved.failed).size).toBe(6);
  expect(saved.entered).toBe(false);
});

test("job filters, search, details and language switching work without discarding earlier attempts", async ({
  page,
}) => {
  await page.goto("/index-zh.html");
  await apply(page, "harbor");
  await page.locator('[data-career-filter="rooms"]').click();
  await expect(page.locator("#career-results .career-job")).toHaveCount(2);
  await page.locator('.career-title[data-career-detail="cedar"]').click();
  await expect(page.locator("#career-detail h2")).toHaveText("客房服务员");
  await page.locator("#career-search").fill("没有这份工作");
  await page.locator('#career-search-form [type="submit"]').click();
  await expect(page.locator(".career-empty")).toBeVisible();
  await page.locator('[data-career="clear-search"]').click();
  await expect(page.locator("#career-results .career-job")).toHaveCount(6);
  await expect(
    page.locator('[data-job-card="harbor"] [data-career-apply]'),
  ).toBeDisabled();
  await page.locator(".career-language").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.locator('[data-job-card="harbor"] [data-career-apply]'),
  ).toBeDisabled();
  expect(
    (await page.locator("#career-scene").innerText()).replace("简体中文", ""),
  ).not.toMatch(/[\u3400-\u9fff]/);
});

test("existing hotel saves bypass the opening and replaying it preserves collected clues and solved puzzles", async ({
  page,
}) => {
  const saved = {
    name: "Returning",
    applicant: false,
    checkedIn: true,
    chapter: 2,
    staff: true,
    clues: ["clock", "door", "ribbon", "register", "switch", "letter", "power"],
    puzzles: ["power"],
    scares: false,
  };
  await page.addInitScript((value) => {
    if (!localStorage.getItem("stillwater-hotel:v2"))
      localStorage.setItem("stillwater-hotel:v2", JSON.stringify(value));
  }, saved);
  await page.goto("/index-zh.html#below");
  await expect(page.locator("#career-scene")).toHaveCount(0);
  await page.locator('footer [data-action="replay-introduction"]').click();
  await page.locator(".career-language").click();
  await expect(page.locator("#career-scene")).toBeVisible();
  await invitation(page);
  await page.locator('[data-career="enter"]').click();
  const restored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("stillwater-hotel:v2")),
  );
  expect(restored.clues).toEqual(saved.clues);
  expect(restored.puzzles).toEqual(saved.puzzles);
  expect(restored.chapter).toBe(2);
  expect(restored.scares).toBe(false);
});

for (const width of [320, 390, 768, 1320]) {
  test(`recruitment page and message fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 820 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/index-zh.html");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await invitation(page);
    const box = await page.locator("#career-invitation").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(box.y + box.height).toBeLessThanOrEqual(820);
    expect(
      await page
        .locator("#career-invitation")
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
    await page.locator('[data-career="enter"]').click();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
  });
}

test("the built static distribution plays the opening and enters the hotel with all bundled resources", async ({
  page,
}) => {
  const { resolve } = await import("node:path");
  const { createServer } = await import("../server.mjs");
  const server = createServer(resolve("dist"));
  await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/index-zh.html`);
    await invitation(page);
    await page.locator('[data-career="enter"]').click();
    await page.locator('#applicant-banner [data-page="reservations"]').click();
    await page.locator("#guest-name").fill("打包试玩");
    await page.locator("#agree-guidelines").check();
    await page.locator('#reservation-form [type="submit"]').click();
    await expect(page.locator(".welcome-key")).toContainText("307");
    expect(errors).toEqual([]);
  } finally {
    await new Promise((done) => server.close(done));
  }
});
