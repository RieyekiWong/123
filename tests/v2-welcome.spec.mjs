import { test, expect } from "@playwright/test";
const KEY = "stillwater-case:v2";
for (const entry of ["index-zh.html", "index.html"]) {
  test(`${entry}: first visit declares fiction and choices, enables audio only on Enter, and saves manual skip`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const Audio = window.AudioContext;
      window.openedAudio = 0;
      window.AudioContext = class extends Audio {
        constructor(...a) {
          super(...a);
          window.openedAudio++;
        }
      };
    });
    const requests = [];
    page.on("request", (r) => requests.push(r.url()));
    await page.goto("/" + entry);
    await expect(page.locator("#case-welcome")).toBeVisible();
    await expect(page.locator("#case-welcome")).not.toContainText("R-4829");
    await expect(page.locator("[name=faces]")).toBeChecked();
    await expect(page.locator("[name=sound]")).not.toBeChecked();
    await page.keyboard.press("Escape");
    await expect(page.locator("#case-welcome")).toBeVisible();
    await page.locator("[name=sound]").check();
    expect(await page.evaluate(() => window.openedAudio)).toBe(0);
    await page.locator("[data-welcome=enter]").click();
    await expect(page.locator("#case-welcome")).toHaveCount(0);
    await expect(page.locator(".chat-app")).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("stillwater-case:v2")).preferences
            .sound,
      ),
    ).toBe(true);
    expect(await page.evaluate(() => window.openedAudio)).toBeGreaterThan(0);
    expect(requests.some((v) => /scare-|night-mask|haunt-v442|youtube/.test(v))).toBe(
      false,
    );
    await page.reload();
    await expect(page.locator("#case-welcome")).toHaveCount(0);
    expect(
      await page.evaluate(
        () =>
          StillwaterCaseState.hydrate(
            JSON.parse(localStorage.getItem("stillwater-case:v2")),
          ).preferences.sound,
      ),
    ).toBe(false);
    await page.locator("[data-case-action=instructions]").click();
    await page.locator("[name=faces]").uncheck();
    await page.locator("[data-welcome=enter]").click();
    await page.reload();
    expect(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("stillwater-case:v2")).preferences
            .skipScares,
      ),
    ).toBe(true);
  });
}
test("language switch keeps pending preface choices without starting audio or losing a deep save", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("guide-seed")) return;
    sessionStorage.setItem("guide-seed", "1");
    localStorage.setItem(
      "stillwater-case:v2",
      JSON.stringify({
        schema: 2,
        evidence: ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"],
        completed: { audit: true, finalEvidence: true },
        night: {
          started: true,
          door: true,
          links: [0, 1],
          orientations: [2, 1, 2, 0, 3, 0],
        },
        endings: ["unverified"],
        lastEnding: "unverified",
      }),
    );
  });
  await page.goto("/index-zh.html#terminal");
  await page.locator("[name=faces]").uncheck();
  await page.locator("[name=sound]").check();
  await page.locator("[data-welcome-language]").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("[name=faces]")).not.toBeChecked();
  await expect(page.locator("[name=sound]")).toBeChecked();
  await page.locator("[data-welcome=enter]").click();
  await expect(page).toHaveURL(/#terminal$/);
  const s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("stillwater-case:v2")),
  );
  expect(s.evidence).toHaveLength(9);
  expect(s.endings).toEqual(["unverified"]);
  expect(s.night.orientations).toEqual([2, 1, 2, 0, 3, 0]);
});
test("blocked storage still lets the player read and enter", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  });
  await page.goto("/index-zh.html");
  await expect(page.locator("#case-welcome")).toBeVisible();
  await page.locator("[data-welcome=enter]").click();
  await page.goto("/index-zh.html#forum");
  await page.locator(".forum-recruit-link").click();
  await expect(page.locator(".job-card")).toBeVisible();
  expect(errors).toEqual([]);
});
async function readyEnding(page, { skip = false, reduced = false } = {}) {
  if (reduced) await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(
    ({ skip }) => {
      if (sessionStorage.getItem("escape-seed")) return;
      sessionStorage.setItem("escape-seed", "1");
      localStorage.setItem(
        "stillwater-case:v2",
        JSON.stringify({
          schema: 2,
          evidence: ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9"],
          completed: { audit: true, finalEvidence: true },
          night: {
            started: true,
            links: [0, 1],
            door: true,
            frame: true,
            events: ["last-frame"],
            orientations: [2, 1, 2, 0, 3, 0],
            isolated: true,
            manual: true,
            saved: true,
            locked: true,
            operations: 9,
          },
          preferences: { skipScares: skip, scareChoiceMade: true },
        }),
      );
    },
    { skip },
  );
  await page.goto("/index-zh.html#terminal");
  await page.locator("[data-welcome=enter]").click();
  await page.clock.install({ time: new Date("2026-11-03T02:00:00Z") });
  await page.clock.pauseAt(new Date("2026-11-03T02:00:01Z"));
}
test("true escape shows one large distinct face after the ending, then preserves the win across reload and revisits", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await readyEnding(page);
  await page.locator("[data-ending=released]").click();
  await expect(page.locator("[data-ending-record=released]")).toBeVisible();
  await page.clock.runFor(1799);
  await expect(page.locator(".escape-scare")).toHaveCount(0);
  await page.clock.runFor(1);
  await expect(page.locator(".escape-scare")).toBeVisible();
  await expect(page.locator(".escape-scare")).toBeInViewport({ ratio: 0.95 });
  await expect(page.locator(".escape-scare img")).toHaveAttribute(
    "src",
    "assets/haunt-v442/escape.jpg",
  );
  await page.clock.runFor(1100);
  await expect(page.locator(".escape-scare")).toHaveCount(0);
  await page.reload();
  await page.clock.runFor(4000);
  await expect(page.locator(".escape-scare")).toHaveCount(0);
  await page.locator('footer a[href="#notes"]').click();
  await page.goto("/index-zh.html#ending");
  await page.clock.runFor(4000);
  await expect(page.locator(".escape-scare")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("stillwater-case:v2")).endings,
    ),
  ).toContain("released");
});
for (const mode of ["skip", "reduced"])
  test(`final scare respects ${mode} without changing the true ending`, async ({
    page,
  }) => {
    const requests = [];
    page.on("request", (r) => requests.push(r.url()));
    await readyEnding(page, {
      skip: mode === "skip",
      reduced: mode === "reduced",
    });
    await page.locator("[data-ending=released]").click();
    await page.clock.runFor(5000);
    await expect(page.locator(".escape-scare")).toHaveCount(0);
    await expect(page.locator("[data-ending-record=released]")).toBeVisible();
    expect(requests.some((v) => v.includes("haunt-v442/escape"))).toBe(false);
  });
test("opening the guide during the escape delay cancels the scare", async ({
  page,
}) => {
  await readyEnding(page);
  await page.locator("[data-ending=released]").click();
  await page.locator("[data-case-action=instructions]").click();
  await page.clock.runFor(5000);
  await expect(page.locator(".escape-scare")).toHaveCount(0);
  await page.locator("[data-welcome=enter]").click();
  await expect(page.locator("[data-ending-record=released]")).toBeVisible();
});

test("a fresh player can accept the preface, solve the complete case and escape into the final scare", async ({
  page,
}) => {
  test.setTimeout(100000);
  const {
    toAudit,
    toRevisions,
    toReview,
    validateFindings,
    toNight,
    wireNight,
  } = await import("./v2-helpers.mjs");
  await toAudit(page);
  await toRevisions(page);
  await toReview(page);
  await validateFindings(page);
  await toNight(page);
  await wireNight(page);
  await page.locator("[data-night-action=lock]").click();
  await page.locator("[data-ending=released]").click();
  await expect(page.locator("[data-ending-record=released]")).toBeVisible();
  await expect(page.locator(".escape-scare")).toBeVisible();
  await expect(page.locator(".escape-scare")).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'GAME OVER',exact:true})).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("stillwater-case:v2")).evidence.length,
    ),
  ).toBe(9);
});
