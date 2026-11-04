import { test, expect } from "./v2-fixture.mjs";
import {
  booking,
  toIdentity,
  fullCase,
  move,
} from "./v2-evidence-model-helpers.mjs";
function early() {
  const s = toIdentity();
  move(s, "closure");
  s.preferences.skipScares = false;
  return s;
}
async function seed(
  page,
  {
    state = early(),
    entry = "index-zh.html",
    route = "maintenance?copy=original",
    remaining = 1000,
    meta = true,
  } = {},
) {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.addInitScript(
    ({ state, remaining, meta }) => {
      Math.random = () => 0.25;
      if (sessionStorage.getItem("messenger-seed")) return;
      sessionStorage.setItem("messenger-seed", "1");
      localStorage.setItem("stillwater-case:v2", JSON.stringify(state));
      if (meta)
        localStorage.setItem(
          "stillwater-messenger:v1",
          JSON.stringify({ schema: 1, remaining, intrusionSeen: false }),
        );
    },
    { state, remaining, meta },
  );
  await page.goto("/" + entry + "#" + route);
}
const chatState = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("stillwater-chat:v1")));
const caseState = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("stillwater-case:v2")));
for (const [entry, width] of [
  ["index-zh.html", 390],
  ["index.html", 1440],
])
  test(`${entry}: notification opens the correct person, retains the real browser DOM and returns to the exact file and scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 650 });
    const errors = [],
      api = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (/workers\.dev.*\/api\/(chat|session)/.test(r.url()))
        api.push(r.url());
    });
    await seed(page, { entry });
    await page.locator("#maintenance-reference").fill("unsubmitted-docket");
    await page.evaluate(() => {
      window.__originalField = document.querySelector("#maintenance-reference");
      scrollTo(0, 250);
    });
    const scroll = await page.evaluate(() => scrollY);
    const browserTitle = await page.title();
    const before = await caseState(page);
    await page.clock.runFor(1100);
    await expect(page.locator(".messenger-notice")).toBeVisible();
    await expect(page.locator(".messenger-notice-open")).toHaveAttribute(
      "data-room",
      "mom",
    );
    expect((await chatState(page)).ui.unread.mom).toBe(1);
    expect(await caseState(page)).toEqual(before);
    await page.locator(".messenger-notice-open").click();
    await expect(page).toHaveURL(/#chat\?room=mom$/);
    await expect(page.locator("#chat-title")).toHaveText(
      entry.includes("zh") ? "妈妈" : "Mom",
    );
    await expect(page.locator(".chat-browser-bar")).toBeVisible();
    await page.locator("#chat-input").fill("a private unsent chat draft");
    expect(
      await page.evaluate(() =>
        localStorage
          .getItem("stillwater-browser:v1")
          .includes("a private unsent chat draft"),
      ),
    ).toBe(false);
    await page.locator("[data-messenger-action=return]").click();
    await expect(page).toHaveURL(/#maintenance\?copy=original$/);
    await expect(page).toHaveTitle(browserTitle);
    await expect(page.locator("#maintenance-reference")).toHaveValue(
      "unsubmitted-docket",
    );
    expect(
      await page.evaluate(
        () =>
          document.querySelector("#maintenance-reference") ===
          window.__originalField,
      ),
    ).toBe(true);
    expect(
      await page.evaluate((value) => Math.abs(scrollY - value) < 2, scroll),
    ).toBe(true);
    expect(errors).toEqual([]);
    expect(api).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
test("an ignored banner disappears while its unread private message survives refresh and can be opened later", async ({
  page,
}) => {
  await seed(page);
  await page.clock.runFor(1100);
  await expect(page.locator(".messenger-notice")).toBeVisible();
  await page.mouse.move(0, 500);
  await page.clock.runFor(8500);
  await expect(page.locator(".messenger-notice")).toHaveCount(0);
  expect((await chatState(page)).ui.unread.mom).toBe(1);
  await page.reload();
  expect((await chatState(page)).ui.unread.mom).toBe(1);
  await page.locator("[data-messenger-action=launch]").click();
  await page.locator("[data-chat-room=mom]").click();
  await expect(page.locator("#chat-title")).toHaveText("妈妈");
  expect((await chatState(page)).ui.unread.mom).toBe(0);
});
test("refreshing in WeChat keeps the pending room selection, original query and unsubmitted browser choice without granting a clue", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 760 });
  await seed(page, {
    state: booking(),
    route: "rooms?copy=original",
    remaining: 150000,
  });
  if (await page.locator("[data-case-action=dismiss-notice]").count())
    await page.locator("[data-case-action=dismiss-notice]").click();
  await page.locator("#inventory-room").selectOption("318");
  const before = (await caseState(page)).evidence;
  await page.locator("[data-messenger-action=launch]").click();
  await page.evaluate(() => (location.hash = "chat?room=milk"));
  await expect(page.locator("#chat-title")).toHaveText("奶茶不要冰");
  await page.reload();
  await expect(page.locator("#chat-title")).toHaveText("奶茶不要冰");
  await page.locator("[data-messenger-action=return]").click();
  await expect(page).toHaveURL(/#rooms\?copy=original$/);
  await expect(page.locator("#inventory-room")).toHaveValue("318");
  expect((await caseState(page)).evidence).toEqual(before);
  expect(before).not.toContain("C3");
});
test("B-3 has no incoming notices but manual chat switching returns to the same circuit, mode and browser controls", async ({
  page,
}) => {
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
  await seed(page, { state: s, route: "terminal?view=retained" });
  const before = (await caseState(page)).night;
  await page.clock.runFor(180000);
  await expect(
    page.locator(".messenger-notice,.messenger-intrusion"),
  ).toHaveCount(0);
  await page.locator("[data-messenger-action=launch]").click();
  await expect(page.locator(".chat-browser-bar")).toBeVisible();
  await page.locator("[data-messenger-action=return]").click();
  await expect(page).toHaveURL(/#terminal\?view=retained$/);
  expect((await caseState(page)).night).toEqual(before);
  await expect(page.locator("[data-night-action=rotate]")).toHaveCount(6);
});
for (const [entry, warning] of [
  ["index-zh.html", "不要再调查"],
  ["index.html", "STOP INVESTIGATING"],
])
  test(`${entry}: the authored warning storm lasts six seconds and cannot alter chat history, AI context or browser inputs`, async ({
    page,
  }) => {
    await seed(page, { entry, route: "chat", remaining: 150000 });
    const before = (await chatState(page)).messages;
    await page.evaluate(() => (location.hash = "mara"));
    await expect(page.locator(".messenger-intrusion")).toBeVisible();
    expect(await page.locator("#case-shell").evaluate((el) => el.inert)).toBe(
      true,
    );
    await page.clock.runFor(1200);
    await expect(page.locator(".intrusion-wechat")).toBeVisible();
    await expect(page.locator(".intrusion-app > main")).toHaveCSS(
      "background-color",
      "rgb(20, 34, 26)",
    );
    await expect(page.locator(".intrusion-bubble p").first()).toHaveCSS(
      "color",
      "rgb(173, 196, 166)",
    );
    await expect(page.locator(".intrusion-bubble").first()).toContainText(
      warning,
    );
    await expect(page.locator(".intrusion-app>aside>div")).toHaveCount(7);
    expect((await chatState(page)).messages).toEqual(before);
    await page.clock.runFor(4801);
    await expect(page.locator(".messenger-intrusion")).toHaveCount(0);
    expect(await page.locator("#case-shell").evaluate((el) => el.inert)).toBe(
      false,
    );
    expect((await chatState(page)).messages).toEqual(before);
    expect(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("stillwater-messenger:v1"))
            .intrusionSeen,
      ),
    ).toBe(true);
    await page.reload();
    await page.clock.runFor(1200);
    await expect(page.locator(".messenger-intrusion")).toHaveCount(0);
    await page.evaluate(() => (location.hash = "chat"));
    await expect(page.locator(".chat-messages")).not.toContainText(warning);
  });
test("corrupt browser snapshots are ignored safely, and a confirmed restart clears the app bridge without clearing saved ads", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "stillwater-browser:v1",
      JSON.stringify({
        schema: 1,
        hash: "javascript:alert(1)",
        scrollers: [null],
        fields: [null],
        title: { toString: 3 },
      }),
    ),
  );
  await seed(page, { route: "chat", remaining: 150000 });
  await expect(page.locator(".chat-browser-bar")).toHaveCount(0);
  await page.evaluate(() => (location.hash = "maintenance"));
  await page.locator("[data-messenger-action=launch]").click();
  await expect(page.locator(".chat-browser-bar")).toBeVisible();
  await page.locator("[data-case-action=save-settings]").first().click();
  await page.locator("[data-comfort=reset-prompt]").click();
  await page.locator("[data-comfort=reset-confirm]").click();
  await expect(page).toHaveURL(/#chat$/);
  await expect(page.locator(".chat-browser-bar")).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("stillwater-browser:v1")),
  ).toBeNull();
});

test("changing contacts after a notification updates its deep link without losing either draft on refresh", async ({
  page,
}) => {
  await seed(page);
  await page.clock.runFor(1100);
  await page.locator(".messenger-notice-open").click();
  await page.locator("#chat-input").fill("mom-only draft");
  await page.locator("[data-chat-room=lin]").click();
  await expect(page).toHaveURL(/#chat\?room=lin$/);
  await page.locator("#chat-input").fill("lin-only draft");
  await page.reload();
  await expect(page.locator("#chat-title")).toHaveText("小林鸽子");
  await expect(page.locator("#chat-input")).toHaveValue("lin-only draft");
  await page.locator("[data-chat-room=mom]").click();
  await expect(page.locator("#chat-input")).toHaveValue("mom-only draft");
});

for (const preference of ["skipScares", "reduceMotion"])
  test(`${preference}: the six-second story warning remains readable without repeated animated messages or page tint`, async ({
    page,
  }) => {
    const s = early();
    s.preferences[preference] = true;
    s.preferences.scareChoiceMade = true;
    await seed(page, { state: s, route: "chat", remaining: 150000 });
    const before = (await chatState(page)).messages;
    await page.evaluate(() => (location.hash = "mara"));
    await expect(page.locator(".messenger-intrusion")).toHaveAttribute(
      "data-quiet",
      "true",
    );
    await expect(page.locator("body")).not.toHaveClass(
      /messenger-intrusion-active/,
    );
    await expect(page.locator(".intrusion-close")).toBeFocused();
    await expect(page.locator(".intrusion-bubble")).toHaveCount(7);
    await page.clock.runFor(5000);
    await expect(page.locator(".intrusion-bubble")).toHaveCount(7);
    expect((await chatState(page)).messages).toEqual(before);
    await page.clock.runFor(1001);
    await expect(page.locator(".messenger-intrusion")).toHaveCount(0);
    expect(await page.locator("#case-shell").evaluate((el) => el.inert)).toBe(
      false,
    );
  });

test("Escape and leaving the warning scene release the browser without saving fake messages", async ({
  page,
}) => {
  await seed(page, { route: "chat", remaining: 150000 });
  const before = (await chatState(page)).messages;
  await page.evaluate(() => (location.hash = "mara"));
  await page.clock.runFor(1200);
  await expect(page.locator(".intrusion-close")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".messenger-intrusion")).toHaveCount(0);
  expect(await page.locator("#case-shell").evaluate((el) => el.inert)).toBe(
    false,
  );
  expect((await chatState(page)).messages).toEqual(before);
  await page.evaluate(() => (location.hash = "chat"));
  await page.clock.runFor(10000);
  expect(
    (await chatState(page)).messages.some((m) =>
      m.text?.includes("不要再调查"),
    ),
  ).toBe(false);
  await expect(page.locator(".chat-messages")).not.toContainText("不要再调查");
});
