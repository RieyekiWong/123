import { test, expect } from "./v2-fixture.mjs";
import { fullCase } from "./v2-evidence-model-helpers.mjs";
async function open(page, route = "terminal", width = 1440) {
  const s = fullCase();
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
  s.preferences.skipScares = false;
  s.preferences.scareChoiceMade = true;
  await page.setViewportSize({ width, height: 950 });
  await page.addInitScript((s) => {
    if (sessionStorage.getItem("scene-polish")) return;
    sessionStorage.setItem("scene-polish", "1");
    localStorage.setItem("stillwater-case:v2", JSON.stringify(s));
  }, s);
  await page.goto("/index-zh.html#" + route);
}
async function differences(page) {
  return page.locator(".promo-source-cards").evaluate(async (root) => {
    const bitmaps = [];
    for (const el of root.querySelectorAll("svg")) {
      const svg = el.cloneNode(true);
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.setAttribute("width", "1000");
      svg.setAttribute("height", "750");
      for (const image of svg.querySelectorAll("image")) {
        const blob = await (await fetch(image.getAttribute("href"))).blob();
        const uri = await new Promise((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.readAsDataURL(blob);
        });
        image.setAttribute("href", uri);
      }
      const url = URL.createObjectURL(
        new Blob([svg.outerHTML], { type: "image/svg+xml" }),
      );
      const im = new Image();
      im.src = url;
      await im.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 750;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(im, 0, 0);
      bitmaps.push(ctx.getImageData(0, 0, 1000, 690).data);
      URL.revokeObjectURL(url);
    }
    return bitmaps.slice(1).map((pixels) => {
      let plaque = 0,
        recess = 0,
        outside = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (
          ![0, 1, 2].some(
            (c) => Math.abs(pixels[i + c] - bitmaps[0][i + c]) > 2,
          )
        )
          continue;
        const x = (i / 4) % 1000,
          y = Math.floor(i / 4000);
        if (x >= 460 && x <= 528 && y >= 302 && y <= 343) plaque++;
        else if (x >= 560 && x <= 694 && y >= 231 && y <= 624) recess++;
        else outside++;
      }
      return { plaque, recess, outside };
    });
  });
}
test("the actual three photo composites differ only at the physical plaque and the optional doorway figure", async ({
  page,
}) => {
  await open(page);
  const results = await differences(page);
  expect(results[0].plaque).toBeGreaterThan(200);
  expect(results[0].recess).toBe(0);
  expect(results[0].outside).toBe(0);
  expect(results[1].plaque).toBeGreaterThan(200);
  expect(results[1].recess).toBeGreaterThan(1000);
  expect(results[1].outside).toBe(0);
  for (const path of ["original", "synced", "preview"]) {
    expect(
      await page.evaluate(async (path) => {
        const im = new Image();
        im.src = `assets/hotel-promo-v2/${path}.png`;
        await im.decode();
        return [im.naturalWidth, im.naturalHeight];
      }, path),
    ).toEqual([1448, 1086]);
  }
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("stillwater-case:v2"));
    s.preferences.skipScares = true;
    localStorage.setItem("stillwater-case:v2", JSON.stringify(s));
  });
  await page.reload();
  await expect(page.locator("[data-promo-face]")).toHaveCount(0);
  const quiet = await differences(page);
  expect(quiet[1].recess).toBe(0);
  expect(quiet[1].outside).toBe(0);
  await page
    .locator("[data-promo-action=source][data-version=original]")
    .click();
  await page.locator(".promo-mark-controls [data-target=middle]").click();
  await expect(page.locator("[data-unlisted-entry]")).toBeVisible();
});
for (const width of [390, 1440])
  test(`${width}px: scene controls stay clear without painted-on buttons; the same equipment still works`, async ({
    page,
  }) => {
    await open(page, "service-passage", width);
    const plate = page.locator(".scene-hotspots [data-target=plate]");
    await expect(plate).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(plate).toHaveCSS("color", "rgba(0, 0, 0, 0)");
    const frame = await page.locator(".passage-frame").boundingBox(),
      box = await plate.boundingBox();
    expect(box.x + box.width / 2).toBeGreaterThan(frame.x + frame.width / 2);
    await plate.click();
    await expect(page.locator(".cctv-picture")).toHaveAttribute(
      "data-open-door",
      "true",
    );
    await page.locator("[data-night-action=walk][data-position=west]").click();
    await page.locator(".space-actions [data-target=cart]").click();
    await page.locator(".space-actions [data-target=cabinet]").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".cctv-picture")).toHaveAttribute(
      "data-cabinet-open",
      "true",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
test("revision notes sit beneath the photograph, and changing the record preserves its original picture", async ({
  page,
}) => {
  await open(page, "revisions", 390);
  await page.locator(".annotation-comparison > summary").click();
  const image = page.locator(".annotated-photo img");
  const before = await image.getAttribute("src");
  const photo = await image.boundingBox(),
    caption = await page.locator(".annotated-photo figcaption").boundingBox();
  expect(caption.y).toBeGreaterThanOrEqual(photo.y + photo.height - 1);
  await page
    .locator("[data-case-action=photo-version][data-version=revision]")
    .click();
  expect(await image.getAttribute("src")).toBe(before);
  await expect(page.locator(".annotated-photo figcaption")).not.toBeEmpty();
});
