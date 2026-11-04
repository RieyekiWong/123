import { test, expect } from "./v2-fixture.mjs";
import { D, M, move, fullCase } from "./v2-evidence-model-helpers.mjs";
function ready() {
  const s = fullCase(),
    V = globalThis.StillwaterVoidModel;
  Object.assign(s.night, {
    started: true,
    spreadRequired: false,
    links: [0, 1],
    door: true,
    frame: true,
    orientations: [2, 1, 2, 0, 3, 0],
    isolated: true,
    manual: true,
    saved: true,
    operations: 6,
  });
  move(s, "promo-source", { version: "original" });
  move(s, "promo-mark", { target: "middle" });
  move(s, "desk-footage");
  move(s, "void", { action: "enter" });
  return s;
}
function terminal(s) {
  const V = globalThis.StillwaterVoidModel;
  for (let i = 0; i < 4; i++)
    move(s, "void", { action: "walk", direction: V.correct(i) });
  for (let i = 0; i < 3; i++)
    move(s, "void", {
      action: "move",
      id: i,
      dx: -s.night.void.positions[i][0],
      dy: -s.night.void.positions[i][1],
    });
  move(s, "void", { action: "review" });
  move(s, "void", { action: "terminal" });
  return s;
}
async function seed(page, s, entry = "index-zh.html") {
  await page.addInitScript((s) => {
    if (sessionStorage.getItem("void-style")) return;
    sessionStorage.setItem("void-style", "1");
    localStorage.setItem("stillwater-case:v2", JSON.stringify(s));
  }, s);
  await page.goto("/" + entry + "#void");
}
for (const [entry, width] of [
  ["index-zh.html", 390],
  ["index.html", 1440],
])
  test(`${entry}: final evidence remains dark, readable, operable and separate from the earlier staff palette`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await seed(page, terminal(ready()), entry);
    await page
      .locator("[data-void-action=classify][data-type=EMPLOYEE]")
      .click();
    await expect(page.locator(".desk-final-window")).toBeVisible();
    const colors = await page
      .locator(".desk-final-window")
      .evaluate((panel) => {
        const rgb = (s) =>
          s
            .match(/[\d.]+/g)
            .slice(0, 3)
            .map(Number);
        const lum = (c) =>
          c
            .map((x) => x / 255)
            .map((x) =>
              x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4,
            )
            .reduce((s, x, i) => s + x * [0.2126, 0.7152, 0.0722][i], 0);
        const title = panel.querySelector("h2"),
          p = panel.querySelector(".desk-proof");
        const a = lum(rgb(getComputedStyle(title).color)),
          b = lum(rgb(getComputedStyle(p).backgroundColor));
        return {
          surfaces: [panel, p, panel.querySelector(".desk-source")].map((el) =>
            rgb(getComputedStyle(el).backgroundColor),
          ),
          contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
        };
      });
    for (const color of colors.surfaces)
      expect(Math.max(...color)).toBeLessThan(30);
    expect(colors.contrast).toBeGreaterThanOrEqual(4.5);
    await page.locator("[data-desk-form=EMPLOYEE] button[type=submit]").click();
    await expect(page.locator("#desk-feedback")).not.toBeEmpty();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.locator("[data-desk-op=close-final]").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".desk-final-window")).toHaveCount(0);
    await page.evaluate(() => (location.hash = "evidence-desk"));
    const light = await page
      .locator(".evidence-desk .desk-source")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(light).toBe("rgb(27, 18, 20)");
    expect(errors).toEqual([]);
  });
test("door observations identify the previous door and use all three real features in a consistent facing direction", async ({
  page,
}) => {
  await seed(page, ready());
  await expect(page.locator(".void-instruction")).toContainText(
    "三处都要对得上",
  );
  await expect(page.locator(".void-facing-note")).toContainText("正对这扇门");
  const V = globalThis.StillwaterVoidModel;
  for (let step = 0; step < 4; step++) {
    const scene = V.scenes[step];
    for (const target of ["reference", "left", "right"]) {
      await page
        .locator(`[data-void-action=observe][data-target=${target}]`)
        .click();
      const cue = scene[target];
      const text = await page.locator(".void-observation").innerText();
      expect(text).toContain(
        "壁灯在门" + (cue[0] === "left" ? "左" : "右") + "边",
      );
      expect(text).toContain(
        "门框" + (cue[2] === "left" ? "左" : "右") + "上角",
      );
      expect(text).toContain("门槛" + (cue[1] === "left" ? "左" : "右") + "端");
      if (target === "reference") expect(text).toContain("刚经过的门：");
    }
    await page
      .locator(`[data-void-action=walk][data-direction=${V.correct(step)}]`)
      .click();
  }
  await expect(page.locator("[data-void-stage=fragments]")).toHaveCount(1);
});
for (const pref of [
  { skipScares: true, scareChoiceMade: true },
  { reduceMotion: true },
])
  test(`quiet final terminal keeps the same review with ${JSON.stringify(pref)}`, async ({
    page,
  }) => {
    const s = terminal(ready());
    Object.assign(s.preferences, pref);
    await seed(page, s);
    await page.locator("[data-void-action=classify][data-type=ROOM]").click();
    await expect(page.locator(".desk-final-window")).toHaveAttribute(
      "data-terminal-haunt",
      "false",
    );
    await expect(page.locator(".desk-final-window")).toHaveCSS(
      "animation-name",
      "none",
    );
    await expect(page.locator("[data-desk-form=ROOM]")).toBeVisible();
  });
