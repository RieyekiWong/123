import { test, expect } from "./hotel-fixture.mjs";
import {
  completeDylan,
  collectDylanNotes,
  acceptShift,
  patrol,
  sideAction,
  openDylan,
  prepareHire,
} from "./sidequest-helpers.mjs";
async function seed(page, extra = {}) {
  await page.addInitScript(
    (value) => {
      if (!localStorage.getItem("stillwater-hotel:v2"))
        localStorage.setItem("stillwater-hotel:v2", JSON.stringify(value));
    },
    { name: "Avery", checkedIn: true, scares: false, ...extra },
  );
}
const readState = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("stillwater-hotel:v2")));
for (const entry of ["index.html", "index-zh.html"]) {
  test(`${entry}: Dylan's full trail identifies the room, validates the lock and saves the first ending`, async ({
    page,
  }) => {
    await seed(page);
    await page.goto("/" + entry);
    await openDylan(page);
    await expect(page.locator("#dylan-order")).toContainText(
      entry.includes("zh")
        ? "先走廊，再前台，最后客房"
        : "corridor first, reception second, guest room last",
    );
    await collectDylanNotes(page);
    await sideAction(page, "dylan-door");
    await page.locator("#dylan-room").fill("215");
    await page.locator("#dylan-code").fill("0614");
    await page.locator('#dylan-room-form [type="submit"]').click();
    await expect(page.locator("#dylan-error")).toContainText(
      entry.includes("zh") ? "房号不符" : "Wrong room",
    );
    await page.locator("#dylan-room").fill("216");
    await page.locator("#dylan-code").fill("1003");
    await page.locator('#dylan-room-form [type="submit"]').click();
    await expect(page.locator("#dylan-error")).toContainText(
      entry.includes("zh") ? "首次夜班" : "first shift",
    );
    expect((await readState(page)).endings).not.toContain("departure");
    await page.locator("#dylan-code").fill("0614");
    await page.locator('#dylan-room-form [type="submit"]').click();
    await expect(page.locator(".dylan-discovery")).toContainText(
      entry.includes("zh") ? "已自杀身亡" : "died by suicide",
    );
    await expect(page.locator(".dylan-room-photo img")).toBeVisible();
    expect(
      await page.locator(".dylan-room-photo img").evaluate(async (img) => {
        if (!img.complete)
          await new Promise((r) => {
            img.onload = r;
            img.onerror = r;
          });
        return img.naturalWidth;
      }),
    ).toBeGreaterThan(0);
    await sideAction(page, "dylan-finish");
    await page.reload();
    expect((await readState(page)).endings).toContain("departure");
    await openDylan(page);
    await sideAction(page, "dylan-trail");
    await sideAction(page, "dylan-finish");
    expect(
      (await readState(page)).endings.filter((x) => x === "departure"),
    ).toHaveLength(1);
    expect((await readState(page)).chapter).toBe(1);
  });
  test(`${entry}: employment dialogue leads through nine camera checks to the second ending`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await seed(page);
    await page.goto("/" + entry);
    await page.locator('footer [data-action="job-resume"]').click();
    await expect(page.locator('[data-action="job-accept"]')).toBeDisabled();
    await acceptShift(page);
    await page.locator("#monitor-code").fill("472");
    await page.locator('#monitor-escape-form [type="submit"]').click();
    await expect(page.locator("#monitor-error")).toContainText(
      entry.includes("zh") ? "三轮巡检" : "all three rounds",
    );
    await patrol(page);
    await page.locator("#monitor-code").fill("742");
    await page.locator('#monitor-escape-form [type="submit"]').click();
    await expect(page.locator("#monitor-error")).toContainText(
      entry.includes("zh") ? "顺序不正确" : "Wrong order",
    );
    await page.locator('[data-action="monitor-order-note"]').click();
    await sideAction(page, "dylan-message");
    await expect(page.locator("#dylan-order")).toBeVisible();
    await page.locator("#dialog-close").click();
    await expect(page.locator("#monitor-code")).toHaveValue("742");
    await page.locator("#monitor-code").fill("472");
    await page.locator('#monitor-escape-form [type="submit"]').click();
    await expect(page.locator(".monitor-ending")).toBeVisible();
    const saved = await readState(page);
    expect(saved.endings).toContain("return");
    expect(saved.sideQuests.job.reviewed).toHaveLength(9);
    expect(saved.staff).toBe(false);
    expect(saved.clues).toEqual([]);
    expect(saved.chapter).toBe(1);
    await page.reload();
    await expect(page.locator(".monitor-ending")).toBeVisible();
  });
}

test("partial Dylan notes survive reload and the unopened room cannot be skipped", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/index-zh.html");
  await openDylan(page);
  await sideAction(page, "dylan-trail");
  await expect(page.locator('[data-action="dylan-door"]')).toBeDisabled();
  await sideAction(page, "readingroom");
  await sideAction(page, "dylan-note-library");
  await sideAction(page, "dylan-keep-library");
  await page.reload();
  await page.locator("#journal-button").click();
  await expect(page.locator(".side-notebook")).toContainText("二层");
  await sideAction(page, "dylan-trail");
  await expect(page.locator(".side-progress")).toContainText("1 / 3");
});

test("monitor progress and inspected digits survive reload and leaving the work page", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/");
  await page.locator('footer [data-action="job-resume"]').click();
  await acceptShift(page);
  for (const feed of ["lobby", "corridor", "room"]) {
    await page.locator(`[data-action="monitor-feed-${feed}"]`).click();
    await expect(page.locator("#monitor-log")).toBeEnabled();
    await page.locator("#monitor-log").click();
  }
  await page.locator('[data-action="monitor-next-round"]').click();
  await page.locator('[data-action="monitor-feed-corridor"]').click();
  await page.locator('[data-action="monitor-inspect-corridor"]').click();
  await page.reload();
  await expect(page.locator('[data-feed-evidence="corridor"]')).toHaveText("4");
  await expect(page.locator("#monitor-total")).toHaveText("3 / 9");
  await page.locator('nav [data-nav="home"]').click();
  await expect(page.locator("#surveillance-return")).toBeVisible();
  await page.locator("#surveillance-return button").click();
  await expect(page.locator('[data-feed-evidence="corridor"]')).toHaveText("4");
});

test("a direct surveillance URL requires the handover and a temporary job never unlocks the original archive", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/#surveillance");
  await expect(page.locator(".surveillance-desk")).toHaveCount(0);
  await expect(page.locator("main")).toContainText("handover is incomplete");
  await page.locator('main [data-action="job-interview"]').click();
  await acceptShift(page);
  await page.locator('footer a[href="#employees"]').click();
  await expect(page.locator("#employee-form")).toBeVisible();
});

for (const setting of ["off", "reduced", "on"])
  test(`monitor faces respect ${setting} settings`, async ({ page }) => {
    await seed(page, {
      scares: setting !== "off",
      sideQuests: {
        job: { stage: "working", round: 2, reviewed: [], feed: "lobby" },
      },
    });
    await page.addInitScript(() => (Math.random = () => 0.01));
    if (setting === "reduced")
      await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#surveillance");
    if (setting === "on") {
      const encounters = [];
      for (const feed of ["lobby", "corridor", "room"]) {
        await page.locator(`[data-action="monitor-feed-${feed}"]`).click();
        await expect(page.locator("#monitor-threat")).toBeVisible();
        encounters.push(
          await page.locator("#monitor-threat img").getAttribute("src"),
        );
        await expect(page.locator("#monitor-threat")).toBeHidden();
      }
      expect(new Set(encounters).size).toBe(3);
    } else {
      await page.waitForTimeout(900);
      await expect(page.locator("#monitor-threat")).toBeHidden();
    }
  });

for (const width of [320, 390, 768, 1320])
  test(`new story documents and monitor desk fit ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await seed(page, {
      sideQuests: {
        job: { stage: "working", round: 3, reviewed: [], feed: "corridor" },
      },
    });
    await page.goto("/index-zh.html#surveillance");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await page.locator('[data-action="monitor-inspect-corridor"]').click();
    await expect(page.locator('[data-feed-evidence="corridor"]')).toHaveText(
      "4",
    );
    await page.locator('[data-action="monitor-order-note"]').click();
    const r = await page.locator("#story-dialog").boundingBox();
    expect(r.x + r.width).toBeLessThanOrEqual(width);
    expect(
      await page
        .locator("#story-dialog")
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
  });

test("an unregistered applicant can finish registration and return directly to the saved staff conversation", async ({
  page,
}) => {
  await page.goto("/index-zh.html");
  await page.locator('footer [data-action="job-resume"]').click();
  await prepareHire(page);
  await sideAction(page, "job-accept");
  await expect(page.locator("#dialog-title")).toHaveText("先办理住宿登记");
  await page.locator('dialog [data-page="reservations"]').click();
  await page.locator("#guest-name").fill("应聘者");
  await page.locator("#agree-guidelines").check();
  await page.locator('#reservation-form [type="submit"]').click();
  await page.locator('main [data-action="job-interview"]').click();
  await expect(page.locator('[data-action="job-accept"]')).toBeEnabled();
  await sideAction(page, "job-accept");
  await sideAction(page, "job-resume");
  await expect(page.locator(".surveillance-desk")).toBeVisible();
});
