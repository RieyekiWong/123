import { test, expect } from "./v2-fixture.mjs";
for (const entry of ["index-zh.html", "index.html"])
  test(`${entry}: forum and careers expose only their own footer; hotel operations appear on the hotel site`, async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/" + entry + "#forum");
    for (const site of ["forum", "careers"]) {
      if (site === "careers") await page.locator(".forum-recruit-link").click();
      await expect(
        page.locator(
          'footer a[href="#staff"],footer a[href="#notes"],footer a[href="#history"],footer a[href="#guestbook"],footer a[href="#notices"],footer a[href="#gallery"],footer [data-case-action=settings],footer a[href*="classic"]',
        ),
      ).toHaveCount(0);
      await expect(
        page.locator(".hotel-nav,.hotel-brand-subtitle"),
      ).toHaveCount(0);
      await page.locator("footer [data-ad-action=credits]").click();
      await expect(page.locator(".media-credit-grid article")).toHaveCount(15);
      await expect(page).toHaveURL(new RegExp("#" + site + "$"));
      await page.keyboard.press("Escape");
      await expect(
        page.locator("footer [data-ad-action=credits]"),
      ).toBeFocused();
    }
    await page.locator("[data-case-action=sample]").click();
    await expect(page.locator(".hotel-nav a")).toHaveCount(4);
    await expect(page.locator('footer a[href="#staff"]')).toBeVisible();
    await expect(
      page.locator("footer [data-case-action=settings]"),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
test("all seven advertisements use local existing photographs, with source credits and three cat portraits", async ({
  page,
}) => {
  await page.addInitScript(()=>{Math.random=()=>0;});
  await page.clock.install({time:new Date('2026-11-03T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-11-03T12:00:01Z'));
  await page.goto("/index-zh.html#forum");
  await page.clock.runFor(21000);
  await expect(page.locator("[data-active-ad=pet] img")).toBeVisible();
  await expect
    .poll(() =>
      page.locator("[data-active-ad=pet] img").evaluate((img) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
  await expect(page.locator("[data-active-ad=pet] svg")).toHaveCount(0);
  await page.locator("footer [data-ad-action=folder]").click();
  await page.locator(".ad-directory > summary").click();
  for (const id of [
    "pet",
    "cinema",
    "repair",
    "secondhand",
    "print",
    "cats",
    "weather",
  ]) {
    await page.locator(`.ad-directory [data-ad-id=${id}]`).click();
    const image = page.locator(".ad-shop-intro img");
    await expect(image).toHaveAttribute("src", /^assets\/web\/ad-/);
    await expect
      .poll(() => image.evaluate((img) => img.naturalWidth))
      .toBeGreaterThan(0);
    await expect(
      page.locator(".ad-mini-site > .ad-photo-credit a"),
    ).toHaveCount(2);
    if (id === "cats")
      await expect(page.locator(".ad-shop-item img")).toHaveCount(3);
    await page.locator("#ad-dialog [data-ad-action=folder]").click();
    await page.locator(".ad-directory > summary").click();
  }
});
test("hotel album has ten photographs and a reachable credit for each new source", async ({
  page,
}) => {
  await page.goto("/index-zh.html#hotel");
  await page.locator('.hotel-photo-section a[href="#gallery"]').first().click();
  await expect(page.locator(".hotel-gallery-grid figure")).toHaveCount(10);
  for (const image of await page.locator(".hotel-gallery-grid img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((img) => img.naturalWidth))
      .toBeGreaterThan(0);
  }
  await page.locator('footer a[href="#credits"]').click();
  await expect(page.locator(".credit-list article")).toHaveCount(20);
  await expect(page.locator(".credit-list")).toContainText("Joselodos");
  await expect(page.locator(".credit-list")).toContainText("Larry D. Moore");
  await expect(page.locator(".credit-list")).toContainText("Basile Morin");
});
for (const width of [320, 375, 768, 1440])
  test(`hotel pages retain their layout while photographed ads overlay the page at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => (Math.random = () => 0));
    await page.clock.install({ time: new Date("2026-11-02T15:20:00Z") });
    await page.clock.pauseAt(new Date("2026-11-02T15:20:01Z"));

    for (const route of ["hotel", "rooms", "contact", "gallery", "history"]) {
      await page.goto("/index-zh.html#" + route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        route,
      ).toBe(true);
      await expect(page.locator(".hotel-brand-subtitle")).toBeVisible();
    }
    await page.goto("/index-zh.html#hotel");
    const original=await page.locator('#case-shell').boundingBox();
    // Install the clock before navigation so every interval is controlled.
    await page.clock.runFor(45300);
    await expect(page.locator("[data-active-ad]")).toHaveCount(width<1200?1:2);
    for(const im of await page.locator("[data-active-ad] img").all()) await expect(im).toBeVisible();
    const layout=await page.evaluate(()=>{
      const shell=document.querySelector('#case-shell').getBoundingClientRect();
      return {shell:{left:shell.left,right:shell.right,top:shell.top,bottom:shell.bottom},
        overflow:document.documentElement.scrollWidth>innerWidth+1,
        ads:[...document.querySelectorAll('[data-active-ad]')].map(el=>{
          const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,height:r.height};
        })};
    });
    expect(layout.overflow).toBe(false);
    expect(await page.locator('#case-shell').boundingBox()).toEqual(original);
    for(const r of layout.ads) {
      const s=layout.shell;
      expect(s.left<r.right&&s.right>r.left&&s.top<r.bottom&&s.bottom>r.top).toBe(true);
      if(width<1200)expect(r.height).toBeLessThanOrEqual(900*.38+1);
    }
  });
