import { test, expect } from "./v2-fixture.mjs";
import { resolve } from "node:path";
import { createServer } from "../server.mjs";
import {
  toAudit,
  toRevisions,
  toReview,
  validateFindings,
  toNight,
  state,
  link,
} from "./v2-helpers.mjs";

test("role filters, restrained hotel home and reopenable non-modal notice", async ({
  page,
}) => {
  await page.goto("/index-zh.html#careers");
  await expect(page.locator(".job-card")).toHaveCount(4);
  await page.locator("[name=work]").selectOption("onsite");
  await page.locator("#job-search button[type=submit]").click();
  await expect(page.locator("#archive-job")).toBeHidden();
  await expect(page.locator("#scan-assistant")).toBeVisible();
  await page.locator("[name=work]").selectOption("remote");
  await page.locator("#job-keyword").fill("不存在的职位");
  await page.locator("#job-search button[type=submit]").click();
  await expect(page.locator("#archive-job")).toBeHidden();
  await page.locator("#job-keyword").fill("预订");
  await page.locator("#job-search button[type=submit]").click();
  await expect(page.locator("#archive-job")).toBeVisible();
  await page.locator("[data-case-action=sample]").click();
  await page.locator('nav a[href="#hotel"]').click();
  await expect(page.locator(".hotel-nav a")).toHaveCount(4);
  await expect(page.locator(".hotel-hero > img")).toHaveCount(1);
  await expect(page.locator(".hotel-photo-strip img")).toHaveCount(3);
  await expect(page.locator("main")).not.toContainText("317");
  await link(page, "rooms", "nav");
  await expect(page.locator(".room-list article")).toHaveCount(3);
  await expect(page.locator(".notice-window")).toBeVisible();
  await expect(page.locator("[role=dialog][open]")).toHaveCount(0);
  await page.locator("[data-case-action=dismiss-notice]").click();
  await page.reload();
  await expect(page.locator(".notice-window")).toHaveCount(0);
  await link(page, "notices", "footer");
  await page.locator("[data-case-action=reopen-notice]").click();
  await expect(page.locator(".notice-window")).toBeVisible();
  expect((await state(page)).evidence).toEqual(["C1"]);
});

test("unavailable deep links return to a usable source; skip link keeps the route", async ({
  page,
}) => {
  await page.goto("/index-zh.html#review");
  await expect(page.locator("main .source-link a")).toHaveAttribute(
    "href",
    "#careers",
  );
  await page.locator("main .source-link a").click();
  await expect(page.locator("#archive-job")).toBeVisible();
  await page.keyboard.press("Tab");
  // Explicit focus also checks the skip control after the route changed.
  await page.locator("a.skip").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await expect(page).toHaveURL(/#careers$/);
  await page.goto("/index-zh.html#unknown-record");
  await expect(page.locator("main .source-link a")).toHaveAttribute(
    "href",
    "#careers",
  );
});

test("query errors do not masquerade as old results and Case Notes reopen originals", async ({
  page,
}) => {
  await toAudit(page);
  for (const [route, input, form, result, bad, record] of [
    [
      "reservations",
      "reservation-reference",
      "reservation-search",
      "reservation-result",
      "R-wrong",
      "R-4829",
    ],
    [
      "maintenance",
      "maintenance-reference",
      "maintenance-search",
      "maintenance-result",
      "A-wrong",
      "A-06-17",
    ],
  ]) {
    await page.goto("/index-zh.html#" + route);
    await page.locator("#" + input).fill(bad);
    await page.locator("#" + form + " button").click();
    await expect(page.locator("#" + result)).toBeHidden();
    await page.reload();
    await expect(page.locator("#" + input)).toHaveValue(bad);
    await expect(page.locator("#" + result)).toHaveCount(0);
    await link(page, "notes", "footer");
    await page.locator(`main a[href="#${route}?record=${record}"]`).click();
    await expect(page.locator("#" + input)).toHaveValue(record);
    await expect(page.locator("#" + result)).toBeVisible();
  }
  await expect(page.locator(".handover-excerpt")).toContainText("02:50");
  await expect(page.locator(".handover-excerpt")).toContainText("318");
  expect((await state(page)).evidence).toHaveLength(6);
});

test("audit drafts and keyboard ordering persist across originals and language switches", async ({
  page,
}) => {
  await toAudit(page);
  const first = page.locator('[data-log=draft] [data-direction="1"]');
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(first).toBeFocused();
  const saved = (await state(page)).drafts;
  await page.locator("[data-log=housekeeping] a").click();
  await expect(page.locator(".handover-excerpt")).toBeVisible();
  await link(page, "night-audit");
  await page.reload();
  expect((await state(page)).drafts.auditOrder).toEqual(saved.auditOrder);
  await page.locator("[data-case-language]").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveURL(/index\.html#night-audit$/);
  expect((await state(page)).drafts.auditOrder).toEqual(saved.auditOrder);
});

test("source findings persist independently of final sign-off; historical endings remain read-only", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const outgoing = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") outgoing.push(r.url());
  });
  await toAudit(page);
  await toRevisions(page);
  await toReview(page);
  const findings=(await state(page)).desk.results;
  expect(findings.space).toBeTruthy();expect(findings.timeline).toBeTruthy();expect(findings.identity).toBeTruthy();
  await validateFindings(page);
  await toNight(page);
  await page.locator("[data-ending=unverified]").click();
  await page.goto("/index-zh.html#review");
  await page.locator("[data-case-action=edit-evidence]").click();
  await page.reload();
  await expect(page.locator("#final-evidence-form")).toBeVisible();
  expect((await state(page)).desk.results).toEqual(findings);
  await link(page, "notes", "footer");
  await page.locator('.past-dispositions a[href="#ending?view=unverified"]').click();
  await expect(page.locator("[data-ending-record=unverified]")).toBeVisible();
  await page.goto("/index-zh.html#review");
  await expect(page.locator("[data-ending]")).toHaveCount(0);
  expect(outgoing).toEqual([]);
  await expect(
    page.locator(
      "input[type=email],input[type=tel],input[type=password],input[type=file]",
    ),
  ).toHaveCount(0);
});

test("corrupt and unavailable storage keep navigation usable without false save promises", async ({
  browser,
}) => {
  for (const blocked of [false, true]) {
    const context = await browser.newContext();
    await context.addInitScript((block) => {
      if (block)
        Object.defineProperty(window, "localStorage", {
          get() {
            throw new DOMException("blocked", "SecurityError");
          },
        });
      else localStorage.setItem("stillwater-case:v2", "{broken");
    }, blocked);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:3110/index-zh.html#staff");
    if(await page.locator("#case-welcome[open]").count())await page.locator("[data-welcome=enter]").click();
    await page.locator("main .source-link a").click();
    await page.locator("[data-case-action=sample]").click();
    await expect(page.locator("#reservation-search")).toBeVisible();
    await page.locator("#reservation-reference").fill("R-4829");
    await page.locator("#reservation-search button").click();
    await expect(page.locator("#reservation-result")).toBeVisible();
    if (blocked)
      await expect(page.locator("footer")).toContainText("无法保存进度");
    expect(errors).toEqual([]);
    await context.close();
  }
});

test("both languages remain readable at phone, tablet and desktop widths", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await toAudit(page);
  await toRevisions(page);
  await toReview(page);
  for (const width of [320, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    for (const entry of ["index-zh.html", "index.html"]) {
      for (const route of [
        "careers",
        "hotel",
        "rooms",
        "floor-plan",
        "night-audit",
        "revisions",
        "review",
        "credits",
      ]) {
        await page.goto("/" + entry + "#" + route);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `${entry} ${route} ${width}`,
        ).toBe(true);
        await expect(page.locator("main h1")).toBeVisible();
      }
    }
  }
});

test("the built static V2 distribution loads the case with bundled resources", async ({
  page,
}) => {
  const server = createServer(resolve("dist"));
  await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/index-zh.html`);
    await expect(page.locator(".chat-app")).toBeVisible();
    await page.locator("#chat-input").fill("发链接我看看");
    await page.locator(".chat-composer button[type=submit]").click();
    await page.locator(".chat-share-card").click();
    await page.locator(".forum-recruit-link").click();
    await expect(page.locator("#archive-job")).toBeVisible();
    await page.locator("[data-case-action=sample]").click();
    await page.locator('nav a[href="#hotel"]').click();
    await expect(page.locator(".hotel-hero img")).toBeVisible();
    expect(
      await page
        .locator(".hotel-hero img")
        .evaluate((img) => img.complete && img.naturalWidth > 0),
    ).toBe(true);
    await page.locator('nav a[href="#reservations"]').click();
    await expect(page.locator("#reservation-search")).toBeVisible();
    await page.locator("#reservation-reference").fill("R-4829");
    await page.locator("#reservation-search button").click();
    await expect(page.locator("#reservation-result")).toContainText("318");
    expect(errors).toEqual([]);
  } finally {
    await new Promise((done) => server.close(done));
  }
});
