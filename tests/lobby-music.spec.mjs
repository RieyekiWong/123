import { test, expect } from "@playwright/test";
async function prepare(page, extra = {}) {
  await page.addInitScript((value) => {
    localStorage.setItem("stillwater-instructions:v1", "read");
    localStorage.setItem(
      "stillwater-career:v1",
      JSON.stringify({ entered: true }),
    );
    if (!localStorage.getItem("stillwater-hotel:v2"))
      localStorage.setItem("stillwater-hotel:v2", JSON.stringify(value));
    window.__ytPlayers = [];
    window.YT = {
      Player: class {
        constructor(host, options) {
          this.options = options;
          this.video = options.videoId;
          this.volumes = [];
          this.paused = true;
          this.destroyed = false;
          this.frame = document.createElement("iframe");
          this.frame.title = "YouTube test player";
          host.replaceWith(this.frame);
          window.__ytPlayers.push(this);
          queueMicrotask(() => options.events.onReady({ target: this }));
        }
        setVolume(value) {
          this.volumes.push(value);
        }
        playVideo() {
          if (window.__blockYT) {
            this.options.events.onAutoplayBlocked();
            return;
          }
          this.paused = false;
          this.options.events.onStateChange({ target: this, data: 1 });
        }
        pauseVideo() {
          this.paused = true;
          this.options.events.onStateChange({ target: this, data: 2 });
        }
        destroy() {
          this.destroyed = true;
          this.paused = true;
          this.frame.remove();
        }
      },
    };
  }, extra);
  await page.clock.install({ time: new Date("2026-10-29T02:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-29T02:00:01Z"));
}
async function enter(page, entry = "index-zh.html") {
  await page.goto("/" + entry);
}
async function begin(page) {
  await page.clock.runFor(10000);
  await expect(page.locator(".lobby-record-status")).toContainText(
    "等着你回来",
  );
}
async function ask(page, key) {
  await page.locator(`[data-support-keyword="${key}"]`).click();
  await page.locator(".support-send").click();
}
for (const entry of ["index.html", "index-zh.html"])
  test(`${entry}: waits ten seconds, fades in and plays the three supplied YouTube videos once in order`, async ({
    page,
  }) => {
    await prepare(page);
    await enter(page, entry);
    await page.clock.runFor(9999);
    expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(0);
    await page.clock.runFor(1);
    await expect(page.locator(".lobby-record-status")).toContainText(
      "等着你回来",
    );
    await page.clock.runFor(3000);
    const volume = await page.evaluate(() =>
      window.__ytPlayers[0].volumes.at(-1),
    );
    expect(volume).toBeGreaterThan(0);
    expect(volume).toBeLessThan(24);
    await page.clock.runFor(3000);
    expect(
      await page.evaluate(() => window.__ytPlayers[0].volumes.at(-1)),
    ).toBe(24);
    for (const name of ["期待", "今晚且流连"]) {
      await page.evaluate(() => {
        const p = window.__ytPlayers.at(-1);
        p.options.events.onStateChange({ target: p, data: 0 });
      });
      await expect(page.locator(".lobby-record-status")).toContainText(name);
      await expect(page.locator(".lobby-youtube-mount iframe")).toHaveCount(1);
    }
    expect(
      await page.evaluate(() => window.__ytPlayers.map((p) => p.video)),
    ).toEqual(["LYDTJtV7vCE", "Wno9SKAxmcg", "TPj2Z6WLCQ8"]);
    await page.evaluate(() => {
      const p = window.__ytPlayers.at(-1);
      p.options.events.onStateChange({ target: p, data: 0 });
    });
    await expect(page.locator(".lobby-youtube-mount iframe")).toHaveCount(0);
    await page.clock.runFor(60000);
    expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(3);
  });
for (const mode of ["supervisor", "concierge", "impostor"])
  test(`${mode}: destroys the playing iframe immediately and never resumes after the anomaly or reload`, async ({
    page,
  }) => {
    await prepare(page);
    await enter(page);
    await begin(page);
    await page
      .locator(
        mode === "concierge"
          ? 'footer [data-action="inquiry"]'
          : 'main [data-action="contact-supervisor"]',
      )
      .click();
    for (const key of mode === "concierge"
      ? ["registration", "room", "supervisor"]
      : mode === "impostor"
        ? ["schedule", "startdate", "reporttime"]
        : ["duties", "pay", "schedule"])
      await ask(page, key);
    await expect(page.locator("#support-interruption")).toBeVisible();
    await expect(page.locator(".lobby-youtube-mount iframe")).toHaveCount(0);
    expect(await page.evaluate(() => window.__ytPlayers[0].destroyed)).toBe(
      true,
    );
    expect(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("stillwater-hotel:v2"))
            .musicInterrupted,
      ),
    ).toBe(true);
    if (mode === "impostor")
      await page.locator("[data-support-dismiss]").click();
    else await page.clock.runFor(15000);
    await page.locator("#dialog-close").click();
    await page.clock.runFor(60000);
    expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(1);
    await page.reload();
    await page.clock.runFor(20000);
    expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(0);
  });
test("an anomaly during the countdown cancels the future playback before any player is created", async ({
  page,
}) => {
  await prepare(page);
  await enter(page);
  await page.locator('main [data-action="contact-supervisor"]').click();
  for (const key of ["duties", "pay", "schedule"]) await ask(page, key);
  await page.clock.runFor(60000);
  expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(0);
});
test("entering chapter two silences the record before the corrupted site appears", async ({
  page,
}) => {
  await prepare(page, {
    name: "Avery",
    checkedIn: true,
    clues: ["clock", "door", "ribbon", "register", "switch", "letter"],
  });
  await enter(page);
  await begin(page);
  await page.locator("#journal-button").click();
  await page.locator('dialog [data-room="404"]').click();
  await page.locator("#unlock-form input").fill("0404");
  await page.locator('#unlock-form [type="submit"]').click();
  await page.locator('[data-action="ending-release"]').click();
  await expect(page.locator("body")).toHaveClass(/breached/);
  await expect(page.locator(".lobby-youtube-mount iframe")).toHaveCount(0);
  expect(await page.evaluate(() => window.__ytPlayers[0].destroyed)).toBe(true);
  await page.clock.runFor(60000);
  expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(1);
});
for (const chapter of [2, 3])
  test(`chapter ${chapter} saves never start hotel music`, async ({ page }) => {
    await prepare(page, { chapter });
    await enter(page);
    await page.clock.runFor(60000);
    expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(0);
  });
test("the guide and recruitment do not start music; entering the hotel starts a fresh countdown", async ({
  page,
}) => {
  await prepare(page);
  await page.addInitScript(() => {
    localStorage.removeItem("stillwater-instructions:v1");
    localStorage.removeItem("stillwater-career:v1");
  });
  await enter(page);
  await page.clock.runFor(20000);
  expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(0);
  await page.locator('[data-instructions="enter"]').click();
  for (const id of ["harbor", "park", "cedar", "lake", "union", "elm"]) {
    await page.locator(`[data-job-card="${id}"] [data-career-apply]`).click();
    await page.clock.runFor(500);
  }
  await page.clock.runFor(20000);
  expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(0);
  await page.locator('[data-career="enter"]').click();
  await page.clock.runFor(9999);
  expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(0);
  await page.clock.runFor(1);
  await expect(page.locator(".lobby-record-status")).toContainText(
    "等着你回来",
  );
});
test("browser autoplay blocking exposes a play button, and manual mute stops the record", async ({
  page,
}) => {
  await prepare(page);
  await enter(page);
  await page.evaluate(() => (window.__blockYT = true));
  await page.clock.runFor(10000);
  await expect(page.locator('[data-lobby-action="toggle"]')).toHaveText(
    "点击播放",
  );
  await page.evaluate(() => (window.__blockYT = false));
  await page.locator('[data-lobby-action="toggle"]').click();
  await expect(page.locator(".lobby-record-status")).toContainText(
    "等着你回来",
  );
  await page.locator('[data-lobby-action="toggle"]').click();
  expect(await page.evaluate(() => window.__ytPlayers.at(-1).paused)).toBe(
    true,
  );
  await page.reload();
  await page.clock.runFor(20000);
  expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(0);
});

test("an interruption while the YouTube API is still loading prevents the late player from appearing", async ({
  page,
}) => {
  await prepare(page);
  await enter(page);
  await page.route("https://www.youtube.com/iframe_api", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.evaluate(() => {
    window.__savedYT = window.YT;
    delete window.YT;
  });
  await page.clock.runFor(10000);
  await page.locator('main [data-action="contact-supervisor"]').click();
  for (const key of ["duties", "pay", "schedule"]) await ask(page, key);
  await page.evaluate(() => {
    window.YT = window.__savedYT;
    window.onYouTubeIframeAPIReady();
  });
  await page.clock.runFor(60000);
  expect(await page.evaluate(() => window.__ytPlayers.length)).toBe(0);
  await expect(page.locator(".lobby-youtube-mount iframe")).toHaveCount(0);
});

test("the mobile player stays visible without covering the notebook, and can be closed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await prepare(page);
  await enter(page);
  await begin(page);
  const frame = await page.locator(".lobby-youtube-mount iframe").boundingBox();
  expect(frame.width).toBeGreaterThanOrEqual(200);
  expect(frame.height).toBeGreaterThanOrEqual(200);
  expect(frame.x).toBeGreaterThanOrEqual(0);
  expect(frame.x + frame.width).toBeLessThanOrEqual(320);
  await page.locator("#journal-button").click();
  await expect(page.locator("#story-dialog")).toBeVisible();
  await page.locator("#dialog-close").click();
  await page.locator(".lobby-record-close").click();
  expect(await page.evaluate(() => window.__ytPlayers.at(-1).paused)).toBe(
    true,
  );
});
test("the first optional horror frame also cuts the music, even when sudden faces are disabled", async ({
  page,
}) => {
  await prepare(page, { scares: false });
  await enter(page);
  await begin(page);
  await page.locator('nav [data-nav="rooms"]').click();
  await page.locator('main [data-action="explore"]').click();
  await page.locator('dialog [data-action="monitor"]').click();
  await page.locator('[data-camera="3"]').click();
  await page.locator('[data-action="inspect-shadow"]').click();
  await expect(page.locator(".intrusion-frame")).toBeVisible();
  await expect(page.locator(".lobby-youtube-mount iframe")).toHaveCount(0);
  expect(await page.evaluate(() => window.__ytPlayers[0].destroyed)).toBe(true);
});
