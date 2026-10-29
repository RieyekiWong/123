import { test, expect } from "@playwright/test";
const enter = (page) => page.locator('[data-instructions="enter"]').click();
for (const entry of ["index-zh.html", "index.html"])
  test(`${entry}: instructions are optional, explicitly opened, and can be reopened`, async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/" + entry + "?instructions=1");
    await expect(page.locator("#game-instructions")).toBeVisible();
    await expect(page.locator("#game-instructions")).toContainText(
      entry.includes("zh") ? "注意事项" : "Content & comfort",
    );
    await expect(page.locator("#game-instructions")).toContainText(
      entry.includes("zh") ? "重看求职开场" : "Replay the job search",
    );
    await expect(page.locator('[data-instructions="sound"]')).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      await page.evaluate(() => window.StillwaterPlayerSettings.soundEnabled()),
    ).toBe(false);
    // The native modal prevents keyboard focus entering the job search underneath.
    expect(
      await page.evaluate(() => {
        document.querySelector("#career-search").focus();
        return document.activeElement.id;
      }),
    ).toBe("instructions-title");
    await enter(page);
    await expect(page.locator("#game-instructions")).toHaveCount(0);
    await expect(page.locator("#career-search")).toBeVisible();
    await page.locator('[data-job-card="harbor"] [data-career-apply]').click();
    await expect(
      page.locator('[data-job-card="harbor"] .career-result'),
    ).toBeVisible();
    await page.reload();
    await expect(page.locator("#game-instructions")).toHaveCount(0);
    await page.locator(".career-footer [data-open-instructions]").click();
    await expect(page.locator("#game-instructions")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#game-instructions")).toHaveCount(0);
    await expect(
      page.locator('[data-job-card="harbor"] [data-career-apply]'),
    ).toBeDisabled();
    expect(errors).toEqual([]);
  });
test("a returning player sees the guide without losing hotel records, and the hotel footer reopens it", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "stillwater-career:v1",
      JSON.stringify({ entered: true }),
    );
    if (!localStorage.getItem("stillwater-hotel:v2"))
      localStorage.setItem(
        "stillwater-hotel:v2",
        JSON.stringify({
          name: "旅人",
          checkedIn: true,
          chapter: 2,
          clues: ["clock", "power"],
          puzzles: ["power"],
          scares: false,
        }),
      );
  });
  await page.goto("/index-zh.html?instructions=1#below");
  await expect(page.locator("#game-instructions")).toBeVisible();
  await expect(page.locator('[data-instructions="scares"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await enter(page);
  await expect(page.locator("body")).toHaveClass(/breached/);
  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("stillwater-hotel:v2")),
  );
  expect(state.name).toBe("旅人");
  expect(state.puzzles).toEqual(["power"]);
  expect(state.clues).toEqual(["clock", "power"]);
  await page.locator("footer [data-open-instructions]").click();
  await expect(page.locator("#game-instructions")).toBeVisible();
  await enter(page);
  await expect(page.locator("#clue-count")).toHaveText("2 / 12");
});
test("sound and scare switches use the real hotel settings and audio remains off after reopening the page", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "stillwater-career:v1",
      JSON.stringify({ entered: true }),
    ),
  );
  await page.goto("/index-zh.html?instructions=1");
  await page.locator('[data-instructions="sound"]').click();
  await expect(page.locator('[data-instructions="sound"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator('[data-instructions="scares"]').click();
  await expect(page.locator('[data-instructions="scares"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await enter(page);
  await page.locator('footer [data-action="about"]').click();
  await expect(page.locator("#sound-button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator('[data-action="toggle-scares"]')).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.reload();
  expect(
    await page.evaluate(() => window.StillwaterPlayerSettings.soundEnabled()),
  ).toBe(false);
  expect(
    await page.evaluate(() => window.StillwaterPlayerSettings.scaresEnabled()),
  ).toBe(false);
});
test("credit details identify all five real photographs and licences without loading external content", async ({
  page,
}) => {
  const external = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1:3107")) external.push(r.url());
  });
  await page.goto("/index-zh.html?instructions=1");
  await page.locator(".instructions-credits summary").click();
  await expect(page.locator(".instructions-credits")).toContainText(
    "Larry D. Moore",
  );
  await expect(page.locator(".instructions-credits")).toContainText(
    "Michael Gray",
  );
  await expect(
    page.locator(
      '.instructions-credits a[href*="commons.wikimedia.org/wiki/File:"]',
    ),
  ).toHaveCount(5);
  await expect(
    page.locator(
      '.instructions-credits a[href*="creativecommons.org/licenses/"]',
    ),
  ).toHaveCount(5);
  for (const link of await page.locator(".instructions-credits a").all())
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  expect(external).toEqual([]);
});
test("storage failures never block the instructions or the first application", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw Error("blocked");
    };
    Storage.prototype.setItem = () => {
      throw Error("blocked");
    };
  });
  await page.goto("/index-zh.html?instructions=1");
  await enter(page);
  await page.locator('[data-job-card="harbor"] [data-career-apply]').click();
  await expect(
    page.locator('[data-job-card="harbor"] .career-result'),
  ).toBeVisible();
});
for (const width of [320, 390, 768, 1320])
  test(`opening instructions, expanded credits and entry button fit ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 820 });
    await page.goto("/index-zh.html?instructions=1");
    await page.locator(".instructions-credits summary").click();
    expect(
      await page
        .locator("#game-instructions")
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    const cta = await page.locator('[data-instructions="enter"]').boundingBox();
    expect(cta.x).toBeGreaterThanOrEqual(0);
    expect(cta.x + cta.width).toBeLessThanOrEqual(width);
    expect(cta.y + cta.height).toBeLessThanOrEqual(820);
    await enter(page);
    await expect(page.locator("#career-scene")).toBeVisible();
  });

test("switching languages while rereading keeps the guide open and preserves application records", async ({
  page,
}) => {
  await page.goto("/index-zh.html?instructions=1");
  await enter(page);
  await page.locator('[data-job-card="harbor"] [data-career-apply]').click();
  await expect(
    page.locator('[data-job-card="harbor"] .career-result'),
  ).toBeVisible();
  await page.locator(".career-footer [data-open-instructions]").click();
  await page.locator(".instructions-language").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#game-instructions")).toBeVisible();
  await expect(page.locator("#instructions-title")).toContainText(
    "A few things",
  );
  await enter(page);
  expect(new URL(page.url()).searchParams.has("instructions")).toBe(false);
  await expect(
    page.locator('[data-job-card="harbor"] [data-career-apply]'),
  ).toBeDisabled();
  await page.reload();
  await expect(page.locator("#game-instructions")).toHaveCount(0);
});
