import { test, expect } from "@playwright/test";
async function seed(page, entry) {
  await page.addInitScript(() => {
    const key = "event-test-seeded";
    if (sessionStorage.getItem(key)) return;
    // Modules run after init scripts, so construct a backward-compatible deep save.
    localStorage.setItem(
      "stillwater-case:v2",
      JSON.stringify({
        schema: 2,
        evidence: ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"],
        completed: { audit: true, finalEvidence: true },
        night: { started: true, links: [0, 1], door: true, pans: [2, 1, 2] },
        preferences: { skipScares: true },
      }),
    );
    sessionStorage.setItem(key, "yes");
  });
  await page.goto("/" + entry + "#service-passage");
}
const action = (page, target) =>
  page.locator(`.space-actions [data-target="${target}"]`).click();
const walk = (page, position) =>
  page.locator(`[data-night-action=walk][data-position="${position}"]`).click();
for (const entry of ["index-zh.html", "index.html"]) {
  test(`${entry}: explicit scare choice, six authored events, persistent geometry and dynamic canonical HUD`, async ({
    page,
  }) => {
    await seed(page, entry);
    await expect(page.locator(".chapter-comfort")).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("stillwater-case:v2")).preferences
            .skipScares,
      ),
    ).toBe(true);
    await page.locator("[data-night-action=comfort][data-enable=true]").click();
    await action(page, "plate");
    await expect(page.locator(".cctv-picture")).toHaveAttribute(
      "data-open-door",
      "true",
    );
    await action(page, "peephole");
    await expect(page.locator(".frame-face")).toHaveCount(0);
    await action(page, "photo");
    await expect(
      page.locator(".frame-face[data-event=photo-face]"),
    ).toBeVisible();
    const first = await page.locator(".frame-face img").getAttribute("src");
    await expect(page.locator(".frame-face")).toHaveCount(0);
    await walk(page, "west");
    await walk(page, "landing");
    await expect(page.locator(".cctv-picture")).toHaveAttribute(
      "data-silhouette",
      "true",
    );
    await walk(page, "west");
    await action(page, "cabinet");
    await expect(page.locator("#night-feedback")).not.toBeEmpty();
    await action(page, "cart");
    await action(page, "cabinet");
    await expect(
      page.locator(".frame-face[data-event=cabinet-face]"),
    ).toBeVisible();
    expect(await page.locator(".frame-face img").getAttribute("src")).not.toBe(
      first,
    );
    await expect(page.locator(".frame-face")).toHaveCount(0);
    await action(page, "power");
    await page.reload();
    await expect(page.locator(".cctv-picture")).toHaveAttribute(
      "data-power",
      "true",
    );
    await walk(page, "service");
    await action(page, "enter");
    await expect(page).toHaveURL(/#terminal$/);
    await page.locator("[data-night-action=frame]").click();
    await expect(
      page.locator(".frame-face[data-event=last-frame]"),
    ).toBeVisible();
    await expect(page.locator(".frame-face")).toHaveCount(0);
    await expect(page.locator(".cctv-osd.bottom")).toContainText("2006-10-17");
    expect(
      await page.locator(".cctv-picture canvas").getAttribute("width"),
    ).toBe("320");
    await page.reload();
    await expect(page.locator(".frame-face")).toHaveCount(0);
    expect(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("stillwater-case:v2")).night.events
            .length,
      ),
    ).toBe(6);
  });
  test(`${entry}: skip keeps every interaction and scene information without creating a face`, async ({
    page,
  }) => {
    await seed(page, entry);
    await page
      .locator("[data-night-action=comfort][data-enable=false]")
      .click();
    await action(page, "plate");
    await action(page, "photo");
    await expect(page.locator(".frame-face")).toHaveCount(0);
    await expect(page.locator(".space-observations")).toContainText("E-014");
    await walk(page, "west");
    await action(page, "cart");
    await action(page, "cabinet");
    await action(page, "power");
    await walk(page, "service");
    await action(page, "enter");
    await page.locator("[data-night-action=frame]").click();
    await expect(page.locator(".last-frame")).toContainText("E-014");
    await expect(page.locator(".frame-face")).toHaveCount(0);
  });
}
test("reduced motion suppresses opted-in portraits and leaving during recovery cancels the pending face", async ({
  page,
}) => {
  await seed(page, "index-zh.html");
  await page.locator("[data-night-action=comfort][data-enable=true]").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await action(page, "photo");
  await expect(page.locator(".frame-face")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await walk(page, "west");
  await action(page, "cart");
  await action(page, "cabinet");
  await action(page, "power");
  await walk(page, "service");
  await action(page, "enter");
  await page.clock.install();
  await page.locator("[data-night-action=frame]").click();
  await page.locator('nav a[href="#hotel"]').click();
  await page.clock.runFor(2500);
  await expect(page.locator(".frame-face")).toHaveCount(0);
});

test("operating another junction during recovery keeps the authored climax on the current screen", async ({
  page,
}) => {
  await seed(page, "index-zh.html");
  await page.locator("[data-night-action=comfort][data-enable=true]").click();
  await page.goto("/index-zh.html#terminal");
  await page.locator("[data-night-action=frame]").click();
  await page.locator('[data-night-action=rotate][data-node="0"]').click();
  await expect(
    page.locator(".frame-face[data-event=last-frame]"),
  ).toBeVisible();
  await expect(page.locator(".frame-face")).toHaveCount(0);
});
