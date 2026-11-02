import { test, expect } from "@playwright/test";
import { toAudit, toRevisions, toReview, state, link } from "./v2-helpers.mjs";
const savedAds = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("stillwater-ads:v1")));
const adSession = (page) =>
  page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("stillwater-ads-session:v1")),
  );
async function timed(page, entry = "#careers") {
  await page.addInitScript(() => (Math.random = () => 0));
  await page.clock.install({ time: new Date("2026-11-02T15:20:00Z") });
  await page.clock.pauseAt(new Date("2026-11-02T15:20:01Z"));
  await page.goto("/index-zh.html" + entry);
}
for (const entry of ["index-zh.html", "index.html"])
  test(`${entry}: new reader starts in a normal forum without answers, then reaches the sample`, async ({
    page,
  }) => {
    await page.goto("/" + entry);
    await expect(page).toHaveURL(/#forum$/);
    await expect(page.locator(".bbs-post")).toBeVisible();
    await expect(page.locator(".bbs-reply")).toHaveCount(5);
    await expect(page.locator("main")).not.toContainText(
      /R-4829|317|E-014|Mara|2007|停业|closed lakeside|诅咒|任务列表/,
    );
    await expect(page.locator(".forum-recruit-link")).toHaveCount(1);
    await page.locator(".forum-recruit-link").click();
    await expect(page).toHaveURL(/#careers$/);
    await expect(page.locator(".job-card")).not.toContainText(
      /停业|closed lakeside|2007|Mara/,
    );
    await page.locator("[data-case-action=sample]").click();
    await expect(page).toHaveURL(/#reservations$/);
    expect((await state(page)).evidence).toEqual(["C1"]);
  });
test("valid deep links, language switches and pre-existing schema 2 saves skip the prologue", async ({
  page,
}) => {
  for (const route of ["careers", "contact", "rooms"]) {
    await page.goto("/index-zh.html#" + route);
    await expect(page).toHaveURL(new RegExp("#" + route + "$"));
    await expect(page.locator(".bbs-post")).toHaveCount(0);
  }
  await page.locator("[data-case-language]").click();
  await expect(page).toHaveURL(/index.html#rooms$/);
  await expect(page.locator(".room-list")).toBeVisible();
  await page.evaluate(() => {
    localStorage.removeItem("stillwater-prologue:v1");
    localStorage.setItem(
      "stillwater-case:v2",
      JSON.stringify({
        schema: 2,
        evidence: ["C1", "C2"],
        drafts: { reservation: "R-4829" },
      }),
    );
  });
  await page.goto("/index-zh.html");
  await expect(page).toHaveURL(/#rooms$/);
  expect((await state(page)).evidence).toEqual(["C1", "C2"]);
  await link(page, "forum", "footer");
  await page.reload();
  await expect(page.locator(".bbs-post")).toBeVisible();
});
test("ordinary threads and all forum sections lead to real local content", async ({
  page,
}) => {
  await page.goto("/index-zh.html");
  for (const topic of ["cv", "printer", "save-page", "dinner", "excuses"]) {
    await page.locator(`.bbs-sidebar a[href="#forum?topic=${topic}"]`).click();
    await expect(page.locator(".bbs-post-text")).not.toBeEmpty();
    await expect(page.locator(".bbs-reply")).not.toHaveCount(0);
    await page.locator('footer a[href="#forum"]').click();
  }
  for (const section of ["chat", "work", "web", "help"]) {
    await page.locator(`nav a[href="#forum?section=${section}"]`).click();
    await expect(page.locator(".bbs-post h1")).toBeVisible();
  }
});
test("early notices no longer explain the position; progressive errors point back without filling answers", async ({
  page,
}) => {
  await page.goto("/index-zh.html#rooms");
  await expect(page.locator("main")).not.toContainText(
    /服务缓冲位|不属于住客房号|不能证明/,
  );
  await link(page, "notices", "footer");
  await expect(page.locator("main")).not.toContainText(
    /服务缓冲位|不属于住客房号|不能证明/,
  );
  await link(page, "careers", "footer");
  await page.locator("[data-case-action=sample]").click();
  await page.locator("#reservation-reference").fill("wrong");
  await page.locator("#reservation-search button").click();
  await expect(page.locator("#reservation-error")).toHaveAttribute(
    "data-attempt",
    "1",
  );
  await expect(page.locator("#reservation-error")).not.toContainText("R-4829");
  await expect(page.locator("#reservation-error details")).not.toHaveAttribute(
    "open",
  );
  await page.locator("#reservation-search button").click();
  await expect(page.locator("#reservation-error")).toHaveAttribute(
    "data-attempt",
    "2",
  );
  await expect(page.locator("#reservation-error > p a")).toHaveAttribute(
    "href",
    "#careers",
  );
  await page.locator("#reservation-search button").click();
  await expect(page.locator("#reservation-error")).toHaveAttribute(
    "data-attempt",
    "3",
  );
  await expect(page.locator("#reservation-reference")).toHaveValue("wrong");
  await page.locator("#reservation-reference").fill("R-4829");
  await page.locator("#reservation-search button").click();
  await page.locator("#reservation-reference").fill("wrong");
  await page.locator("#reservation-search button").click();
  await expect(page.locator("#reservation-error")).toHaveAttribute(
    "data-attempt",
    "1",
  );
});
test("ads wait, pause for typing and dialogs, keep focus and do not change case evidence", async ({
  page,
}) => {
  await timed(page);
  await expect(page.locator("iframe,audio,video")).toHaveCount(0);
  await page.locator("#job-keyword").focus();
  await page.clock.runFor(180000);
  await expect(page.locator("[data-active-ad]")).toHaveCount(0);
  expect((await adSession(page)).remaining).toBe(45000);
  await page.locator("footer [data-ad-action=folder]").click();
  await page.clock.runFor(180000);
  await expect(page.locator("[data-active-ad]")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.clock.runFor(48000);
  await expect(page.locator("[data-active-ad]")).toHaveCount(0);
  await page.clock.runFor(2000);
  await expect(page.locator("[data-active-ad=pet]")).toBeVisible();
  await expect(page.locator("footer [data-ad-action=folder]")).toBeFocused();
  expect(
    await page.evaluate(() => localStorage.getItem("stillwater-case:v2")),
  ).toBeNull();
});
test("forum has no early floating ad, fixed banner is separate and the session cap requires navigation", async ({
  page,
}) => {
  await timed(page, "");
  await expect(page.locator(".ad-inline")).toBeVisible();
  await page.clock.runFor(35000);
  await expect(page.locator("[data-active-ad]")).toHaveCount(0);
  await page.locator(".forum-recruit-link").click();
  await page.clock.runFor(51000);
  await expect(page.locator("[data-active-ad=pet]")).toBeVisible();
  await page.locator("#ad-host [data-ad-action=close]").click();
  await page.clock.runFor(200000);
  await expect(page.locator("[data-active-ad]")).toHaveCount(0);
  await page.locator("[data-case-action=sample]").click();
  await link(page, "history", "footer");
  await page.clock.runFor(6000);
  await expect(page.locator("[data-active-ad=cinema]")).toBeVisible();
  await page.locator("#ad-host [data-ad-action=close]").click();
  await page.reload();
  await page.clock.runFor(8000);
  await expect(page.locator("[data-active-ad]")).toHaveCount(0);
  await page.clock.runFor(100000);
  await expect(page.locator("[data-active-ad]")).toHaveCount(0);
  await page.locator('nav a[href="#hotel"]').click();
  await page.clock.runFor(6000);
  await expect(page.locator("[data-active-ad=repair]")).toBeVisible();
  await page.locator("#ad-host [data-ad-action=close]").click();
  await page.locator('nav a[href="#rooms"]').click();
  await page.clock.runFor(300000);
  await expect(page.locator("[data-active-ad]")).toHaveCount(0);
  const s = await adSession(page);
  expect(s.shownThisSession).toEqual(["pet", "cinema", "repair"]);
  expect(s.dismissedThisSession).toEqual(["pet", "cinema", "repair"]);
});
test("ads pause while hidden and do not catch up in a burst on return", async ({
  page,
}) => {
  await timed(page);
  await page.evaluate(() => {
    window.__testHidden = true;
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get() {
        return window.__testHidden;
      },
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(300000);
  await expect(page.locator("[data-active-ad]")).toHaveCount(0);
  await page.evaluate(() => {
    window.__testHidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(5000);
  await expect(page.locator("[data-active-ad]")).toHaveCount(0);
  await page.clock.runFor(45000);
  await expect(page.locator("[data-active-ad]")).toHaveCount(1);
});
test("keep, fold, reload, reopen, remove and Escape work; main reset leaves the folder intact", async ({
  page,
}) => {
  await timed(page);
  await page.clock.runFor(45000);
  await page.locator("#ad-host [data-ad-action=pin]").click();
  await page.locator("#ad-host [data-ad-action=collapse]").click();
  expect((await savedAds(page)).pinnedIds).toEqual(["pet"]);
  expect((await savedAds(page)).collapsedPinnedIds).toEqual(["pet"]);
  await page.reload();
  await expect(page.locator(".ad-saved-tab")).toBeVisible();
  await page.locator("footer [data-ad-action=folder]").click();
  await page.locator("#ad-dialog [data-ad-action=detail]").first().click();
  await expect(page.locator("#ad-dialog")).toContainText(
    "我们不负责教狗狗坐下",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator("footer [data-ad-action=folder]")).toBeFocused();
  await page.locator("[data-case-action=sample]").click();
  await page.locator("[data-case-action=settings]").click();
  await page.locator("#case-settings details summary").click();
  await page.locator("[data-comfort=reset-prompt]").click();
  await page.locator("[data-comfort=reset-confirm]").click();
  expect((await savedAds(page)).pinnedIds).toEqual(["pet"]);
  await page.locator("footer [data-ad-action=folder]").click();
  await page.locator("#ad-dialog [data-ad-action=reopen]").first().click();
  await expect(page.locator("[data-active-ad=pet]")).toBeVisible();
  await page.locator("#ad-host [data-ad-action=close]").click();
  await page.locator("footer [data-ad-action=folder]").click();
  await page.locator("#ad-dialog [data-ad-action=remove]").click();
  expect((await savedAds(page)).pinnedIds).toEqual([]);
});
test("all seven internal shops have content and no remote navigation, media or collection fields", async ({
  page,
}) => {
  const external = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1:3110/")) external.push(r.url());
  });
  await page.goto("/index-zh.html");
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
    await expect(page.locator(".ad-shop-item")).not.toHaveCount(0);
    await expect(page.locator(".ad-fineprint")).not.toBeEmpty();
    await page.locator("#ad-dialog [data-ad-action=folder]").click();
    await page.locator(".ad-directory > summary").click();
  }
  await expect(
    page.locator(
      "#ad-dialog input,#ad-dialog iframe,#ad-dialog video,#ad-dialog audio",
    ),
  ).toHaveCount(0);
  expect(external).toEqual([]);
  expect((await adSession(page)).shownThisSession).toEqual([]);
});
test("the investigation stays free of active ads and all advertising stops after Mara", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await toAudit(page);
  await page.clock.install({ time: new Date("2026-11-02T15:20:00Z") });
  await page.clock.pauseAt(new Date("2026-11-02T15:20:01Z"));
  const before = await state(page);
  await page.clock.runFor(180000);
  await expect(
    page.locator("[data-active-ad],.ad-saved-tab,.ad-inline"),
  ).toHaveCount(0);
  expect((await state(page)).evidence).toEqual(before.evidence);
  await toRevisions(page);
  await toReview(page);
  await link(page, "forum", "footer");
  await page.clock.runFor(180000);
  await expect(
    page.locator(".ad-inline,[data-active-ad],.ad-saved-tab"),
  ).toHaveCount(0);
});
for (const width of [375, 768, 1440])
  test(`forum and floating card fit ${width}px with reserved content space and reduced motion`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await timed(page, "");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator(".forum-recruit-link").click();
    await page.clock.runFor(51000);
    await expect(page.locator("[data-active-ad]")).toBeVisible();
    expect(
      await page
        .locator(".ad-card")
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
    const rects = await page.evaluate(() => {
      const shell = document
          .querySelector("#case-shell")
          .getBoundingClientRect(),
        ad = document.querySelector(".ad-card").getBoundingClientRect();
      return {
        shellBottom: shell.bottom,
        adTop: ad.top,
        adLeft: ad.left,
        contentRight: document.querySelector("main").getBoundingClientRect()
          .right,
        height: ad.height,
        w: document.documentElement.scrollWidth,
      };
    });
    expect(rects.w).toBe(width);
    if (width < 1200) {
      expect(rects.shellBottom).toBeLessThanOrEqual(rects.adTop + 1);
      expect(rects.height).toBeLessThanOrEqual(900 * 0.28 + 1);
    } else expect(rects.contentRight).toBeLessThanOrEqual(rects.adLeft);
  });
test("blocked local and session storage leave forum, shops and the main case usable", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    for (const key of ["localStorage", "sessionStorage"])
      Object.defineProperty(window, key, {
        get() {
          throw new DOMException("blocked", "SecurityError");
        },
      });
  });
  await timed(page, "");
  await page.locator(".ad-inline [data-ad-action=detail]").click();
  await page.locator("#ad-dialog [data-ad-action=pin]").click();
  await page.keyboard.press("Escape");
  await page.locator(".forum-recruit-link").click();
  await page.locator("[data-case-action=sample]").click();
  await page.locator("#reservation-reference").fill("R-4829");
  await page.locator("#reservation-search button").click();
  await expect(page.locator("#reservation-result")).toBeVisible();
  expect(errors).toEqual([]);
});
