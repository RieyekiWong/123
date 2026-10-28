import { test, expect } from "./hotel-fixture.mjs";
const puzzles = [
  "power",
  "radio",
  "archive",
  "identity",
  "mirror",
  "chronology",
];
async function seed(page, extra = {}) {
  await page.addInitScript(
    (value) => {
      if (!localStorage.getItem("stillwater-hotel:v2"))
        localStorage.setItem("stillwater-hotel:v2", JSON.stringify(value));
    },
    {
      name: "Morgan",
      checkedIn: true,
      chapter: 3,
      puzzles,
      endings: ["dawn"],
      scares: false,
      ...extra,
    },
  );
}
async function open(page, entry = "index-zh.html") {
  await page.goto("/" + entry + "#below");
  await page.locator('[data-action="afterword-open"]').click();
  await expect(page.locator("#afterword-screen")).toBeVisible();
}
for (const entry of ["index-zh.html", "index.html"]) {
  test(`${entry}: six complete subtitle calls unlock the response and only help me opens the warning email`, async ({
    page,
  }) => {
    await seed(page);
    await page.clock.install({ time: new Date("2026-10-28T23:00:00Z") });
    await page.clock.pauseAt(new Date("2026-10-28T23:00:01Z"));
    await open(page, entry);
    await expect(page.locator("#afterword-answer")).toBeHidden();
    await page.locator("#afterword-start [data-afterword-captions]").click();
    await page.clock.runFor(14999);
    await expect(page.locator("#afterword-answer")).toBeHidden();
    await page.clock.runFor(2301);
    await expect(page.locator("#afterword-answer")).toBeVisible();
    await page.locator("#afterword-input").fill("let me out");
    await page.locator("#afterword-input").press("Enter");
    await expect(page.locator("#afterword-error")).not.toBeEmpty();
    await page.locator("#afterword-input").fill(" HELP   ME ");
    await page.locator("#afterword-input").press("Enter");
    await expect(page.locator(".warning-mail")).toBeVisible();
    await expect(page.locator(".mail-body")).toContainText(
      entry.includes("zh") ? "04:04" : "04:04",
    );
    await expect(page.locator(".mail-sender")).toContainText(
      "d.harker@stillwater.invalid",
    );
    await expect(page.locator(".mail-sender")).toContainText("Morgan");
    await expect(page.locator(".mail-body")).toContainText(
      entry.includes("zh") ? "不要回信" : "do not reply",
    );
    await page.locator(".warning-mail > header [data-afterword-close]").click();
    await expect(page.locator(".afterword-invitation p")).toContainText(
      entry.includes("zh") ? "来信已保存" : "letter is saved",
    );
    await expect(page.locator('[data-action="afterword-open"]')).toContainText(
      entry.includes("zh") ? "查看迪伦的来信" : "Read Dylan",
    );
    await page.reload();
    await page.locator('[data-action="afterword-open"]').click();
    await expect(page.locator(".warning-mail")).toBeVisible();
    const state = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("stillwater-hotel:v2")),
    );
    expect(state.afterword).toEqual({ stage: "letter", heard: 6 });
    expect(state.chapter).toBe(3);
    expect(state.endings).toEqual(["dawn"]);
  });
}
test("the original final puzzle immediately opens the new black screen and old completed saves can continue", async ({
  page,
}) => {
  await seed(page, { chapter: 2, endings: [] });
  await page.goto("/index-zh.html#below");
  await page.locator('main [data-action="final-discharge"]').click();
  for (const [id, value] of [
    ["register", "original"],
    ["key", "leave"],
    ["route", "stair"],
  ])
    await page.locator("#discharge-" + id).selectOption(value);
  await page.locator('#lower-discharge-form [type="submit"]').click();
  await expect(page.locator("#afterword-screen")).toBeVisible();
  expect(
    await page
      .locator("#afterword-screen")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(0, 0, 0)");
  await page.keyboard.press("Escape");
  await expect(page.locator("#afterword-screen")).toHaveCount(0);
  await expect(page.locator(".epilogue")).toBeVisible();
  await expect(page.locator('[data-action="afterword-open"]')).toBeVisible();
});
test("the local male voice actually plays six times before the input appears", async ({
  page,
}) => {
  test.setTimeout(45000);
  await seed(page);
  await open(page);
  await page.locator("[data-afterword-play]").click();
  await expect(page.locator("#afterword-start")).toBeHidden();
  await expect(page.locator("#afterword-answer")).toBeHidden();
  await expect(page.locator("#afterword-answer")).toBeVisible({
    timeout: 35000,
  });
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("stillwater-hotel:v2")).afterword.heard,
    ),
  ).toBe(6);
});
test("a blocked recording offers subtitles; pause, close and reload never count unheard calls", async ({
  page,
}) => {
  await seed(page);
  await page.route("**/assets/dylan-help.mp3*", (route) => route.abort());
  await page.clock.install();
  await open(page);
  await page.locator("[data-afterword-play]").click();
  await expect(page.locator("#afterword-start")).toBeVisible();
  await page.locator("#afterword-start [data-afterword-captions]").click();
  await page.clock.runFor(2400);
  await page.locator("[data-afterword-pause]").click();
  await page.clock.runFor(30000);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("stillwater-hotel:v2")).afterword.heard,
    ),
  ).toBe(1);
  await page.locator("[data-afterword-close]").click();
  await page.reload();
  await page.locator('[data-action="afterword-open"]').click();
  await expect(page.locator("#afterword-answer")).toBeHidden();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("stillwater-hotel:v2")).afterword.heard,
    ),
  ).toBe(1);
});
for (const width of [320, 390, 768, 1320])
  test(`the warning email fits ${width}px and does not transmit mail`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await seed(page, {
      afterword: { stage: "letter", heard: 6 },
      name: "<img src=x>",
    });
    const requests = [];
    page.on("request", (request) => {
      if (!request.url().startsWith("http://127.0.0.1:3107"))
        requests.push(request.url());
    });
    await open(page);
    await expect(page.locator(".mail-sender")).toContainText("<img src=x>");
    expect(await page.locator(".warning-mail img").count()).toBe(0);
    expect(
      await page
        .locator("#afterword-screen")
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    expect(requests).toEqual([]);
  });
