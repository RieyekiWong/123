import { test, expect } from "./v2-fixture.mjs";
import { fullCase, move } from "./v2-evidence-model-helpers.mjs";
import { citeAndSubmit } from "./v2-evidence-ui-helpers.mjs";
function ready(prefs = {}) {
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
  Object.assign(
    s.preferences,
    { skipScares: false, scareChoiceMade: true },
    prefs,
  );
  move(s, "promo-source", { version: "original" });
  move(s, "promo-mark", { target: "middle" });
  move(s, "desk-footage");
  move(s, "void", { action: "enter" });
  for (let i = 0; i < 4; i++)
    move(s, "void", {
      action: "walk",
      direction: StillwaterVoidModel.correct(i),
    });
  for (let i = 0; i < 3; i++)
    move(s, "void", {
      action: "move",
      id: i,
      dx: -s.night.void.positions[i][0],
      dy: -s.night.void.positions[i][1],
    });
  move(s, "void", { action: "review" });
  move(s, "void", { action: "terminal" });
  return s;
}
async function seed(page, s = ready()) {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.addInitScript((s) => {
    Math.random = () => 0.25;
    window.signalSeen = [];
    new MutationObserver((rs) =>
      rs.forEach((r) =>
        r.addedNodes.forEach((n) => {
          if (n.nodeType === 1 && n.classList.contains("void-signal-burst"))
            signalSeen.push({ face: n.dataset.face, at: Date.now() });
        }),
      ),
    ).observe(document, { subtree: true, childList: true });
    if (sessionStorage.getItem("signal-seed")) return;
    sessionStorage.setItem("signal-seed", "1");
    localStorage.setItem("stillwater-case:v2", JSON.stringify(s));
  }, s);
  await page.goto("/index-zh.html#void");
  await page.evaluate(async () => {
    const im = new Image();
    im.src = "assets/previews/v415-signal/apparition.png";
    await im.decode().catch(() => {});
  });
}
const progress = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("stillwater-case:v2")));
test("spaced, paired signals put a face in one of two bursts without advancing the case or taking keyboard focus", async ({
  page,
}) => {
  await seed(page);
  await page.locator("[data-void-action=classify][data-type=ROOM]").click();
  const choice = page.locator("[data-desk-form=ROOM] [value=unsupported]");
  await choice.focus();
  const before = await progress(page);
  await page.clock.runFor(13000);
  await expect(page.locator(".void-signal-burst")).toHaveCount(0);
  await page.clock.runFor(560);
  await expect(page.locator(".void-signal-burst")).toHaveAttribute(
    "data-face",
    "false",
  );
  await expect(choice).toBeFocused();
  expect(await progress(page)).toEqual(before);
  // A real source can still be selected through the visual overlay.
  await page.locator("[data-desk-form=ROOM] [data-document=booking]").check();
  await expect(
    page.locator("[data-desk-form=ROOM] [data-document=booking]"),
  ).toBeChecked();
  const selected = await progress(page);
  await page.clock.runFor(1000);
  await expect(page.locator(".void-signal-burst")).toHaveCount(0);
  await page.clock.runFor(20400);
  await expect(page.locator(".void-signal-burst")).toHaveAttribute(
    "data-face",
    "true",
  );
  await page.clock.runFor(350);
  expect(await page.evaluate(() => signalSeen.map((s) => s.face))).toEqual([
    "false",
    "true",
  ]);
  expect(await progress(page)).toEqual(selected);
  await page.clock.runFor(700);
  await expect(page.locator(".void-signal-burst")).toHaveCount(0);
});
for (const mode of ["skip", "reduce", "device"])
  test(`${mode}: no signal canvas or interference sound, with the same terminal available`, async ({
    page,
  }) => {
    if (mode === "device") await page.emulateMedia({ reducedMotion: "reduce" });
    await seed(
      page,
      ready(
        mode === "skip"
          ? { skipScares: true }
          : mode === "reduce"
            ? { reduceMotion: true }
            : {},
      ),
    );
    await page.clock.runFor(60000);
    expect(await page.evaluate(() => signalSeen)).toEqual([]);
    await expect(page.locator(".void-signal-burst")).toHaveCount(0);
    await page.locator("[data-void-action=classify][data-type=ROOM]").click();
    await expect(page.locator("[data-desk-form=ROOM]")).toBeVisible();
  });
test("dialogs, hidden tabs, leaving the black chapter and device motion changes cancel the signal and do not replay overdue bursts", async ({
  page,
}) => {
  await seed(page);
  await page.clock.runFor(13560);
  await expect(page.locator(".void-signal-burst")).toBeVisible();
  await page.locator(".void-footer [data-case-action=settings]").click();
  await expect(page.locator(".void-signal-burst")).toHaveCount(0);
  await page.clock.runFor(40000);
  expect(await page.evaluate(() => signalSeen.length)).toBe(1);
  await page.keyboard.press("Escape");
  await page.clock.runFor(1000);
  await expect(page.locator(".void-signal-burst")).toHaveCount(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(40000);
  expect(await page.evaluate(() => signalSeen.length)).toBe(1);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(13560);
  await expect(page.locator(".void-signal-burst")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".void-signal-burst")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => (location.hash = "terminal"));
  await page.clock.runFor(40000);
  await expect(page.locator(".void-signal-burst")).toHaveCount(0);
});
test("the hiss uses the existing gesture-enabled effects bus; muting cancels it and cannot create another context", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const Audio = AudioContext;
    window.hissNodes = [];
    window.contextCount = 0;
    window.AudioContext = class extends Audio {
      constructor(...a) {
        super(...a);
        contextCount++;
      }
      createBufferSource() {
        const s = super.createBufferSource(),
          start = s.start.bind(s),
          disconnect = s.disconnect.bind(s);
        s.start = (...a) => {
          if (s.stillwaterRole === "void-signal-hiss") hissNodes.push(s);
          return start(...a);
        };
        s.disconnect = (...a) => {
          s.wasDisconnected = true;
          return disconnect(...a);
        };
        return s;
      }
    };
  });
  await seed(page);
  expect(await page.evaluate(() => contextCount)).toBe(0);
  await page.locator(".void-footer [data-case-action=toggle-sound]").click();
  await page.clock.runFor(13560);
  await expect(page.locator(".void-signal-burst")).toBeVisible();
  expect(await page.evaluate(() => hissNodes.length)).toBe(1);
  expect(await page.evaluate(() => contextCount)).toBe(1);
  await page.locator(".void-footer [data-case-action=toggle-sound]").click();
  await expect(page.locator(".void-signal-burst")).toHaveCount(0);
  expect(
    await page.evaluate(() => hissNodes.every((n) => n.wasDisconnected)),
  ).toBe(true);
});
test("a failed apparition download falls back to interference and never blocks the source review", async ({
  page,
}) => {
  await page.route("**/assets/previews/v415-signal/apparition.png", (r) =>
    r.abort(),
  );
  await seed(page);
  await page.clock.runFor(13560);
  await expect(page.locator(".void-signal-burst")).toHaveAttribute(
    "data-face",
    "false",
  );
  await page.clock.runFor(1000);
  await page.clock.runFor(20400);
  await expect(page.locator(".void-signal-burst")).toHaveAttribute(
    "data-face",
    "false",
  );
  await page.locator("[data-void-action=classify][data-type=ROOM]").click();
  await citeAndSubmit(page, "ROOM");
  expect((await progress(page)).night.void.attempts).toContain("ROOM");
});
test("the small terminal folds originals away, can reopen them and lets an old draft remove an unrelated source", async ({
  page,
}) => {
  const s = ready({ skipScares: true });
  s.desk.drafts.ROOM = { sources: ["sample"], values: {} };
  await seed(page, s);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.locator("[data-void-action=classify][data-type=ROOM]").click();
  await expect(page.locator(".void-terminal-review table")).toHaveCount(0);
  await expect(page.locator(".final-sources label")).toHaveCount(5);
  await page.locator("[data-desk-form=ROOM] [data-document=sample]").uncheck();
  await page.locator("#desk-viewer>summary").click();
  await page
    .locator("#desk-viewer [data-desk-op=open][data-document=position]")
    .click();
  await expect(page.locator("#desk-viewer")).toHaveAttribute("open", "");
  await expect(page.locator("[data-desk-document=position]")).toContainText(
    "317",
  );
  await citeAndSubmit(page, "ROOM");
  await page.reload();
  expect((await progress(page)).night.void.attempts).toContain("ROOM");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
