import { test, expect } from "./v2-fixture.mjs";
const ids = [
  "scratch",
  "parcel",
  "photobooth",
  "aquarium",
  "pocket",
  "noodles",
  "books",
  "karaoke",
];
async function openPopup(page, id) {
  await page.locator("footer [data-ad-action=folder]").click();
  await page.locator("#ad-dialog .ad-directory>summary").click();
  await page.locator(`#ad-dialog .ad-directory [data-ad-id=${id}]`).click();
  await page
    .locator(`#ad-dialog [data-ad-action=reopen][data-ad-id=${id}]`)
    .click();
  return page.locator(`[data-active-ad=${id}]`);
}
for (const entry of ["index-zh.html", "index.html"])
  for (const width of [375, 1440])
    test(`${entry} ${width}px: eight distinct, operable new windows retain the page, credited photos and real close controls`, async ({
      page,
    }) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width, height: 900 });
      await page.clock.install();
      await page.clock.pauseAt(new Date(Date.now() + 1000));
      await page.goto("/" + entry + "#forum");
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const layout = () =>
        page
          .locator("#case-shell")
          .evaluate((el) => ({
            width: el.offsetWidth,
            height: el.offsetHeight,
            left: el.offsetLeft,
            top: el.offsetTop,
          }));
      const before = await layout(),
        layouts = [];
      const initialCase = await page.evaluate(() =>
        localStorage.getItem("stillwater-case:v2"),
      );
      for (const id of ids) {
        const card = await openPopup(page, id);
        await expect(card).toBeVisible();
        layouts.push(await card.getAttribute("data-layout"));
        expect(await layout()).toEqual(before);
        const bounds = await card.boundingBox();
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        expect(
          (await card.locator("[data-ad-action=close]").boundingBox()).height,
        ).toBeGreaterThanOrEqual(44);
        const status = card.locator(".ad-toy-status");
        if (id === "scratch") {
          await card.locator("[data-ad-toy=scratch]").click();
          await expect(card.locator(".ad-scratch-prize")).toBeVisible();
          await expect(status).not.toBeEmpty();
        } else if (id === "photobooth") {
          const first = await card
            .locator(".ad-contact-strip img")
            .first()
            .getAttribute("src");
          await card.locator("[data-ad-toy=photo]").click();
          expect(
            await card
              .locator(".ad-contact-strip img")
              .first()
              .getAttribute("src"),
          ).not.toBe(first);
        } else if (id === "pocket") {
          const first = await card
            .locator(".ad-wallpaper img")
            .getAttribute("src");
          await card.locator("[data-choice=ad-cat-tabby]").click();
          expect(
            await card.locator(".ad-wallpaper img").getAttribute("src"),
          ).not.toBe(first);
          await expect(
            card.locator("[data-choice=ad-cat-tabby]"),
          ).toHaveAttribute("aria-pressed", "true");
        } else {
          const action = {
            parcel: "parcel",
            aquarium: "fish",
            noodles: "flavour",
            books: "books",
            karaoke: "song",
          }[id];
          await card.locator(`[data-ad-toy=${action}]`).last().click();
          await expect(status).not.toBeEmpty();
          if (id === "aquarium") {
            await expect(card.locator(".ad-fish-tank")).toHaveAttribute(
              "data-fed",
              "true",
            );
            await card.locator("[data-ad-toy=fish]").click();
            await expect(card.locator(".ad-fish-tank")).toHaveAttribute(
              "data-fed",
              "false",
            );
          }
        }
        await card.locator("[data-ad-action=detail]").click();
        await expect(
          page.locator(".ad-photo-credit a").first(),
        ).toHaveAttribute("href", /^https:\/\/commons.wikimedia.org/);
        await expect(
          page.locator(
            "#ad-dialog input,#ad-dialog iframe,#ad-dialog audio,#ad-dialog video",
          ),
        ).toHaveCount(0);
        await page.keyboard.press("Escape");
        await expect(card).toBeVisible();
        await card.locator("[data-ad-action=close]").focus();
        await page.keyboard.press("Escape");
        await expect(card).toHaveCount(0);
      }
      expect(new Set(layouts).size).toBe(8);
      expect(errors).toEqual([]);
      expect(
        await page.evaluate(() => localStorage.getItem("stillwater-case:v2")),
      ).toBe(initialCase);
    });

test("turning off popup delivery immediately removes active windows, keeps saved ads and can be reversed", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.goto("/index-zh.html#forum");
  await page.clock.runFor(12000);
  await expect(page.locator("[data-active-ad]")).toHaveCount(2);
  await page.locator("[data-active-ad=pet] [data-ad-action=pin]").click();
  await page.locator("[data-case-action=save-settings]").first().click();
  await page.locator("[name=popup-ads]").uncheck();
  await expect(page.locator("[data-active-ad],.ad-saved-tab")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.clock.runFor(120000);
  await expect(page.locator("[data-active-ad]")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("stillwater-ads:v1")).pinnedIds,
    ),
  ).toEqual(["pet"]);
  await page.reload();
  await page.clock.runFor(15000);
  await expect(page.locator("[data-active-ad]")).toHaveCount(0);
  await page.locator("footer [data-ad-action=folder]").click();
  await expect(
    page.locator(
      "#ad-dialog .ad-folder-item [data-ad-action=detail][data-ad-id=pet]",
    ),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator("[data-case-action=save-settings]").first().click();
  await expect(page.locator("[name=popup-ads]")).not.toBeChecked();
  await page.locator("[name=popup-ads]").check();
  await page.keyboard.press("Escape");
  await page.clock.runFor(12000);
  await expect(page.locator("[data-active-ad]").first()).toBeVisible();
});

for (const entry of ["index-zh.html", "index.html"])
  test(`${entry}: the declaration opt-out survives a language change and leaves the W3-02 source available`, async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.removeItem("stillwater-case-intro:v1"),
    );
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await page.goto("/" + entry + "#forum?topic=job");
    await expect(page.locator("#case-welcome")).toBeVisible();
    await expect(page.locator("[name=ads]")).toBeChecked();
    await page.locator("[name=ads]").uncheck();
    await page.locator("[data-welcome-language]").click();
    await expect(page.locator("[name=ads]")).not.toBeChecked();
    await page.locator("[data-welcome=enter]").click();
    await page.clock.runFor(60000);
    await expect(page.locator("[data-active-ad],.ad-saved-tab")).toHaveCount(0);
    await expect(page.locator(".hotel-promo-forum")).toBeVisible();
    await page.locator(".hotel-promo-forum [data-promo-action=open]").click();
    await expect(page.locator("#hotel-promo-viewer")).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("stillwater-case:v2")).preferences
            .popupAds,
      ),
    ).toBe(false);
  });

test("the fish preview stays static under device reduced motion and the new ads keep chat fixed to the bottom-right", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.goto("/index-zh.html#chat");
  await page.locator("[data-chat-action=members]").click();
  await page.locator("[data-ad-action=folder]").click();
  await page.locator(".ad-directory>summary").click();
  await page.locator(".ad-directory [data-ad-id=aquarium]").click();
  await page.locator("#ad-dialog [data-ad-action=reopen]").click();
  const card = page.locator("[data-active-ad=aquarium]");
  await expect(card).toHaveAttribute("data-slot", "bottom-right");
  await expect(card.locator(".ad-toy-fish").first()).toHaveCSS(
    "animation-name",
    "none",
  );
});
