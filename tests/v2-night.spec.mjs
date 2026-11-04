import { test, expect } from "./v2-fixture.mjs";
import {
  toAudit,
  toRevisions,
  toReview,
  validateFindings,
  toNight,
  wireNight,
  state,
  link,
} from "./v2-helpers.mjs";
async function oldSave(page, extra = {}) {
  await page.goto("/index-zh.html#hotel");
  const old = await page.evaluate((extra) => {
    const s = StillwaterCaseState.fresh();
    delete s.desk; // This fixture represents a save made before the evidence desk existed.
    s.evidence = Object.keys(StillwaterCaseData.clues);
    s.completed = { audit: true, finalEvidence: true, serviceInspected: true };
    delete s.night;
    s.endings = ["auto-close", "unverified"];
    s.lastEnding = "unverified";
    // These equipment/migration tests inspect static story state. Test visual
    // default-on behavior separately in v2-events.spec.mjs.
    s.preferences.skipScares=true;
    s.preferences.scareChoiceMade=true;
    return Object.assign(s, extra);
  }, extra);
  // Seed before the new document runs. The old ad instance saves on pagehide.
  await page.addInitScript((old) => {
    if (sessionStorage.getItem("v23-test-migration-seeded")) return;
    sessionStorage.setItem("v23-test-migration-seeded", "yes");
    localStorage.setItem("stillwater-case:v2", JSON.stringify(old));
    localStorage.setItem(
      "stillwater-ads:v1",
      JSON.stringify({ schema: 1, pinnedIds: ["pet"], collapsedPinnedIds: [] }),
    );
    localStorage.setItem(
      "stillwater-hotel:v2",
      '{"name":"Old guest","checkedIn":true}',
    );
  }, old);
  await page.goto("/index-zh.html?old-save=1#review");
}
test("full unseeded Chinese true ending uses spatial relay, real wiring and explicit lock", async ({
  page,
}) => {
  test.setTimeout(100000);
  await toAudit(page);
  await toRevisions(page);
  await toReview(page);
  await validateFindings(page);
  await toNight(page);
  await page.locator("[data-night-action=save]").click();
  await expect(page.locator("#night-feedback")).not.toBeEmpty();
  await wireNight(page);
  await page.reload();
  expect((await state(page)).night.saved).toBe(true);
  await page.locator("[data-case-language]").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect((await state(page)).night.saved).toBe(true);
  await page.locator("[data-night-action=lock]").click();
  await page.locator("[data-ending=released]").click();
  await expect(page.locator("[data-ending-record=released]")).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute(
    "data-anomaly",
    "resolved",
  );
  await page.reload();
  await expect(page.locator("[data-ending-record=released]")).toBeVisible();
  await expect(page.getByRole('heading',{name:'GAME OVER',exact:true})).toBeVisible();
  await link(page, "careers", "footer");
  await expect(page.locator("main")).toContainText("withdrawn");
});
test("old saves keep both dispositions and original copies; false room has a return path", async ({
  page,
}) => {
  await oldSave(page);
  expect((await state(page)).endings).toEqual(["auto-close", "unverified"]);
  await toNight(page);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("stillwater-ads:v1")).pinnedIds,
    ),
  ).toEqual(["pet"]);
  await expect(page.locator("[data-active-ad],.ad-saved-tab")).toHaveCount(0);
  await page.goto("/index-zh.html#rooms");
  await expect(page.locator(".room-inventory a")).toHaveText("317");
  await link(page, "rooms?copy=original");
  await expect(page.locator(".room-inventory")).not.toContainText("317");
  await page.goto("/index-zh.html#guestbook");
  await expect(page.locator(".case-message")).toContainText("已正常入住");
  await link(page, "guestbook?copy=original");
  await expect(page.locator(".case-message")).toContainText("钥匙套");
  await page.goto("/index-zh.html#mirror?room=317");
  await expect(page.locator(".mirror-wait")).toBeVisible();
  await link(page, "mirror");
  await expect(page.locator(".mirror-wait")).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("stillwater-hotel:v2")),
  ).toContain("Old guest");
});
test("mouse ripple is local, leaves on pointer exit, and respects reduced motion", async ({
  page,
}) => {
  await oldSave(page);
  await toNight(page);
  const frame = page.locator(".cctv-frame");
  await frame.hover();
  await expect(frame).toHaveClass(/ripple-active/);
  await expect(page.locator(".cctv-ripple")).toHaveCount(1);
  await page.locator("h1").hover();
  await expect(frame).not.toHaveClass(/ripple-active/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await frame.hover();
  await expect(frame).not.toHaveClass(/ripple-active/);
});
test("explicit frame scare happens once and is filtered, skip mode retains the same information", async ({
  page,
}) => {
  await oldSave(page);
  await toNight(page);
  await expect(page.locator(".frame-face")).toHaveCount(0);
  await expect(page.locator(".last-frame")).toContainText("E-014");
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("stillwater-case:v2"));
    s.night.frame = false;
    s.night.events=s.night.events.filter(id=>id!=="last-frame");
    s.night.lastFaceStep=-100;
    s.preferences.skipScares = false;
    s.preferences.reduceMotion = false;
    localStorage.setItem("stillwater-case:v2", JSON.stringify(s));
  });
  await page.reload();
  await page.locator("[data-night-action=frame]").click();
  await expect(page.locator(".frame-face")).toBeVisible();
  await expect(page.locator(".frame-face")).toHaveCount(0, { timeout: 3000 });
  await page.reload();
  await expect(page.locator("[data-night-action=frame]")).toBeDisabled();
  await expect(page.locator(".last-frame")).toContainText("E-014");
});
for (const width of [375, 768, 1440])
  test(`equipment at ${width}px fits and retains 4:3 screens`, async ({
    page,
  }) => {
    // This includes the entire camera/passage route, wiring, and a full-page capture.
    test.setTimeout(60000);
    await page.setViewportSize({ width, height: 900 });
    await oldSave(page);
    await toNight(page);
    await wireNight(page);
    const sizes = await page
      .locator(".cctv-frame")
      .evaluateAll((els) =>
        els.map((el) => ({ w: el.clientWidth, h: el.clientHeight })),
      );
    for (const r of sizes)
      expect(Math.abs(r.w / r.h - 4 / 3)).toBeLessThan(0.03);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `docs/v2.4.3/terminal-${width}.png`,
      fullPage: true,
    });
  });
test("physical terminals match their live ports, rotate with the wires, and indicators follow actual equipment state", async ({page}) => {
  test.setTimeout(60000);
  await oldSave(page);
  await toNight(page);
  await expect(page.locator(".junction-hardware")).toHaveCount(6);
  await expect(page.locator(".mount-screw")).toHaveCount(24);
  await expect(page.locator(".terminal-contact")).toHaveCount(24);
  async function verifyPorts() {
    const mismatches = await page.locator(".circuit-node").evaluateAll(nodes => nodes.filter(node => {
      const index=Number(node.dataset.node),s=JSON.parse(localStorage.getItem("stillwater-case:v2"));
      const ports=StillwaterNightModel.ports(s.night.orientations[index]);
      const used=[...node.querySelectorAll('[data-connected=true]')].map(el=>Number(el.dataset.port));
      return ports.slice().sort().join()!==used.sort().join();
    }).length);
    expect(mismatches).toBe(0);
  }
  await verifyPorts();
  await page.locator('[data-night-action=rotate][data-node="2"]').click();
  await verifyPorts();
  await expect(page.locator('[data-feed=write]')).toHaveAttribute('data-on','true');
  await expect(page.locator('[data-feed=mode]')).toHaveAttribute('data-on','false');
  await wireNight(page);
  await verifyPorts();
  await expect(page.locator('[data-feed=reel]')).toHaveAttribute('data-on','true');
  await expect(page.locator('[data-feed=write]')).toHaveAttribute('data-on','false');
  await expect(page.locator('[data-feed=mode]')).toHaveAttribute('data-on','true');
  await page.reload();
  await verifyPorts();
  await expect(page.locator('[data-feed=reel]')).toHaveAttribute('data-on','true');
});
test("all added terminal deep links remain gated for a fresh browser", async ({
  page,
}) => {
  for (const route of [
    "mirror",
    "cameras",
    "terminal",
    "ending?view=released",
  ]) {
    await page.goto("/index-zh.html#" + route);
    await expect(page.locator("[data-night-action]")).toHaveCount(0);
    await expect(page.locator("main .source-link a")).toHaveAttribute(
      "href",
      "#careers",
    );
  }
});

test("second-phase breathing follows the footer sound switch, stops on mute and never resumes on reload", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.audioTrace = { contexts: [], buffers: 0, stopped: 0 };
    const Audio = window.AudioContext;
    window.AudioContext = class extends Audio {
      constructor(...args) {
        super(...args);
        window.audioTrace.contexts.push(this);
      }
      createBufferSource() {
        const source = super.createBufferSource(),
          stop = source.stop.bind(source);
        window.audioTrace.buffers++;
        source.stop = (...args) => {
          window.audioTrace.stopped++;
          return stop(...args);
        };
        return source;
      }
    };
  });
  await oldSave(page);
  await toNight(page);
  expect(await page.evaluate(() => audioTrace.buffers)).toBe(0);
  await expect(
    page.locator(".terminal-layout [data-night-action=settings]"),
  ).toHaveCount(0);
  await page.locator("footer [data-case-action=toggle-sound]").click();
  await expect
    .poll(() => page.evaluate(() => audioTrace.buffers))
    .toBeGreaterThan(0);
  const stoppedBefore=await page.evaluate(()=>audioTrace.stopped);
  await page.locator('[data-night-action=rotate][data-node="0"]').click();
  expect(await page.evaluate(()=>audioTrace.stopped)).toBe(stoppedBefore);
  await page.locator("footer [data-case-action=toggle-sound]").click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        audioTrace.contexts.every((c) => c.state === "suspended"),
      ),
    )
    .toBe(true);
  const count = await page.evaluate(() => audioTrace.buffers);
  await page.keyboard.press("Escape");
  await page.reload();
  expect((await state(page)).preferences.sound).toBe(false);
  expect(await page.evaluate(() => audioTrace.buffers)).toBe(0);
  expect(count).toBeGreaterThan(0);
});

test("true ending restores saved advertisements without clearing their separate storage", async ({
  page,
}) => {
  await oldSave(page);
  await toNight(page);
  await wireNight(page);
  await page.locator("[data-night-action=lock]").click();
  await page.locator("[data-ending=released]").click();
  await link(page, "hotel", "nav");
  await page.locator("footer [data-ad-action=folder]").click();
  await expect(page.locator(".ad-folder-item")).toContainText("旺旺动物门诊");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("stillwater-ads:v1")).pinnedIds,
    ),
  ).toEqual(["pet"]);
});

test("the persistent anomaly keeps older hotel and forum panels readable", async ({
  page,
}) => {
  await oldSave(page);
  await toNight(page);
  for (const [route, selector] of [
    ["hotel", ".hotel-hero>div"],
    ["floor-plan", ".plan-room"],
    ["forum", ".bbs-post>header"],
  ]) {
    await page.goto("/index-zh.html#" + route);
    await expect(page.locator("body")).toHaveAttribute(
      "data-anomaly",
      "terminal",
    );
    const color = await page
      .locator(selector)
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const channels = color.match(/\d+/g).slice(0, 3).map(Number);
    expect(Math.max(...channels)).toBeLessThan(60);
  }
  await page.goto("/index-zh.html#floor-plan");
  await expect(page.locator(".plan-room").first()).toContainText("301");
});
