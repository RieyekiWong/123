import { test, expect } from "./v2-fixture.mjs";
import {
  D,
  M,
  move,
  booking,
  toAudit,
  fullCase,
} from "./v2-evidence-model-helpers.mjs";
import { intake, citeAndSubmit, sources } from "./v2-evidence-ui-helpers.mjs";
const saved = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("stillwater-case:v2")));
async function seed(page, state, route, entry = "index-zh.html") {
  await page.addInitScript((state) => {
    if (sessionStorage.getItem("evidence-fixture")) return;
    sessionStorage.setItem("evidence-fixture", "1");
    localStorage.setItem("stillwater-case:v2", JSON.stringify(state));
  }, state);
  await page.goto("/" + entry + "#" + route);
}
function sourceStart() {
  const s = M.fresh();
  move(s, "sample");
  move(s, "reservation", { reference: "R-4829" });
  return s;
}
function nightReady() {
  const s = fullCase();
  Object.assign(s.night, {
    started: true,
    links: [0, 1],
    spreadRequired: false,
    door: true,
    frame: true,
    orientations: [2, 1, 2, 0, 3, 0],
    isolated: true,
    manual: true,
    saved: true,
    operations: 6,
  });
  s.preferences.skipScares = true;
  s.preferences.scareChoiceMade = true;
  move(s, "promo-source", { version: "original" });
  move(s, "promo-mark", { target: "middle" });
  return s;
}
function finalReady() {
  const s = nightReady(),
    V = globalThis.StillwaterVoidModel;
  move(s, "desk-footage");
  move(s, "void", { action: "enter" });
  for (let i = 0; i < 4; i++)
    move(s, "void", { action: "walk", direction: V.correct(i) });
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
for (const entry of ["index-zh.html", "index.html"])
  for (const first of ["guestbook", "rooms"])
    test(`${entry}: ${first} first uses real parallel sources, proof and saved comparison`, async ({
      page,
    }) => {
      test.setTimeout(45000);
      await page.setViewportSize({
        width: first === "guestbook" ? 390 : 1440,
        height: 950,
      });
      await seed(page, sourceStart(), "reservations?record=R-4829", entry);
      await intake(page);
      for (const route of [first, first === "rooms" ? "guestbook" : "rooms"]) {
        await page.evaluate((route) => (location.hash = route), route);
        if (route === "guestbook")
          await page.locator("[data-case-action=read-key]").click();
        else {
          await page.locator("#inventory-room").selectOption("318");
          await page.locator("#inventory-check button").click();
        }
      }
      await page.locator('a[href="#floor-plan"]').first().click();
      await page.locator(".service-space").click();
      expect((await saved(page)).evidence).toContain("C5");
      expect((await saved(page)).desk.results.space).toBeUndefined();
      await page.locator('a[href="#evidence-desk?proof=space"]').click();
      for (const id of ["sample", "booking"])
        await page
          .locator(`.desk-pair [data-desk-op=drop][data-document=${id}]`)
          .click();
      for (const id of ["inventory", "position"]) {
        await page
          .locator(`.desk-files [data-desk-op=open][data-document=${id}]`)
          .click();
        await page
          .locator(".desk-viewer>.desk-source [data-desk-op=compare]")
          .click();
      }
      await page
        .locator(
          ".desk-viewer>.desk-source [data-desk-op=mark][data-field=type]",
        )
        .click();
      await citeAndSubmit(page, "space", {
        wrong: true,
        override: { use: "occupied" },
      });
      await expect(page.locator("#desk-feedback")).not.toBeEmpty();
      expect((await saved(page)).desk.hints.space || 0).toBe(0);
      await page.reload();
      await expect(
        page.locator("[data-desk-input=choice][value=occupied]"),
      ).toBeChecked();
      expect((await saved(page)).desk.compare).toEqual([
        "inventory",
        "position",
      ]);
      await citeAndSubmit(page, "space");
      await expect(page.locator(".investigation-focus")).toContainText(
        entry.includes("zh")
          ? "查阅相关维修移交"
          : "Find the maintenance handover",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await page.locator("[data-case-language]").click();
      expect((await saved(page)).desk.results.space.record).toContain(
        "SERVICE HOLDING",
      );
    });
test("first workstation has only two sources, a short practice task and explicitly requested hint levels", async ({
  page,
}) => {
  await seed(page, sourceStart(), "evidence-desk?proof=intake");
  await expect(page.locator(".desk-files [data-desk-op=open]")).toHaveCount(2);
  await expect(page.locator("main")).not.toContainText("Mara");
  await expect(page.locator(".desk-files")).not.toContainText("317");
  for (let i = 0; i < 4; i++)
    await page.locator("[data-desk-form=intake] button[type=submit]").click();
  expect((await saved(page)).desk.hints.intake || 0).toBe(0);
  await expect(page.locator("#desk-feedback")).toContainText("岗位工作样本");
  await page.locator("[data-desk-op=hint][data-key=intake]").click();
  await expect(page.locator(".desk-hints li")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".desk-hints li")).toHaveCount(1);
  for (let i = 0; i < 2; i++)
    await page.locator("[data-desk-op=hint][data-key=intake]").click();
  await expect(page.locator(".desk-hints li")).toHaveCount(3);
  await expect(page.locator("[data-desk-op=hint]")).toHaveCount(0);
  await page.locator('a[href="#notes"]').first().click();
  await expect(page.locator(".desk-progress")).toContainText("尚未开放");
  await expect(page.locator(".desk-progress")).not.toContainText("Mara");
  await expect(page.locator(".investigation-directions a")).toHaveCount(1);
});
test("record-type errors and unsupported certainty preserve the ordered timestamps and choice drafts across languages", async ({
  page,
}) => {
  const s = toAudit();
  s.completed.audit = false;
  delete s.desk.results.timeline;
  delete s.desk.drafts.timeline;
  await seed(page, s, "night-audit");
  const panel = page.locator("[data-desk-proof=timeline]");
  await citeAndSubmit(page, "timeline", {
    wrong: true,
    override: { assessment: "never" },
  });
  await expect(page.locator("#desk-feedback")).toContainText("不等于");
  await panel
    .locator("[data-desk-input=type][data-field=housekeeping]")
    .selectOption("system");
  await panel.locator("[data-desk-input=choice][value=insufficient]").check();
  await panel.locator("button[type=submit]").click();
  await expect(page.locator("#desk-feedback")).toContainText("记录性质");
  await page.reload();
  expect((await saved(page)).desk.orderConfirmed).toBe(true);
  await expect(panel.locator("[data-field=housekeeping]")).toHaveValue(
    "system",
  );
  await page.locator("[data-case-language]").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await citeAndSubmit(page, "timeline");
  expect((await saved(page)).completed.audit).toBe(true);
  await expect(
    page.locator(".order-controls button:not(:disabled)"),
  ).toHaveCount(0);
});
test("personnel review requires the actual queue and attendance index, with role-specific feedback", async ({
  page,
}) => {
  const s = toAudit();
  move(s, "revisions", { selection: ["owner", "location", "status"] });
  await seed(page, s, "staff");
  await page.locator("[data-case-action=refresh-queue]").click();
  await expect(page.locator(".attendance-index")).toContainText("TEMP-015");
  await page.locator('a[href="#evidence-desk?proof=identity"]').first().click();
  await citeAndSubmit(page, "identity", {
    wrong: true,
    override: { role: "guest" },
  });
  await expect(page.locator("#desk-feedback")).toContainText("原始员工编号");
  await citeAndSubmit(page, "identity", {
    wrong: true,
    override: { attendance: "confirmed" },
  });
  await expect(page.locator("#desk-feedback")).toContainText("到岗记录");
  expect((await saved(page)).desk.results.identity).toBeUndefined();
  await citeAndSubmit(page, "identity");
  await page.locator('a[href="#closure"]').first().click();
  await expect(page.locator("main h1")).toHaveText("停业通知");
});
test("a recording becomes a retained visual source only after restoration; rewiring does not edit the saved picture", async ({
  page,
}) => {
  const s = nightReady();
  s.night.frame = false;
  s.night.orientations[0] = 0;
  await seed(page, s, "terminal");
  const originalCamera = (
    await page.locator(".terminal-layout .cctv-osd span").first().innerText()
  ).split(" · ")[0];
  await expect(page.locator("[data-desk-op=footage]")).toHaveCount(0);
  await page.locator("[data-night-action=frame]").click();
  await expect(page.locator("[data-desk-op=footage]")).toHaveCount(0);
  for (let i = 0; i < 2; i++)
    await page.locator('[data-night-action=rotate][data-node="0"]').click();
  await page.locator("[data-desk-op=footage]").click();
  const snapshot = (await saved(page)).desk.footage;
  await page.locator('[data-night-action=rotate][data-node="0"]').click();
  await page.evaluate(() => (location.hash = "evidence-desk"));
  await page.locator(".desk-files [data-document=footage]").click();
  await expect(page.locator("[data-desk-footage]")).toHaveCount(1);
  await expect(page.locator(".desk-footage p")).toContainText(originalCamera);
  await expect
    .poll(() => page.locator("[data-desk-footage]").getAttribute("width"))
    .toBe("320");
  expect((await saved(page)).desk.footage).toEqual(snapshot);
  await page.reload();
  expect((await saved(page)).desk.footage).toEqual(snapshot);
  await expect(page.locator(".desk-viewer > .desk-source")).toContainText(
    "2006-10-17 03:17",
  );
});
for (const [mode, entry, width] of [
  ["retain", "index-zh.html", 375],
  ["auto", "index.html", 1440],
  ["force", "index-zh.html", 1440],
])
  test(`${mode}: final category clicks do not count, source reviews persist and connect to the original endings`, async ({
    page,
  }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width, height: 950 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await seed(page, finalReady(), "void", entry);
    for (const type of ["ROOM", "GUEST", "EMPLOYEE"])
      await page
        .locator(`[data-void-action=classify][data-type=${type}]`)
        .click();
    expect((await saved(page)).night.void.attempts).toEqual([]);
    await expect(page.locator(".void-disposition")).toHaveCount(0);
    await page.locator("[data-desk-op=close-final]").click();
    for (const type of ["ROOM", "GUEST", "EMPLOYEE"]) {
      await page
        .locator(`[data-void-action=classify][data-type=${type}]`)
        .click();
      if (type === "ROOM") {
        const contrast = await page
          .locator("#desk-proof-title")
          .evaluate((el) => {
            const rgb = (text) =>
              text
                .match(/[\d.]+/g)
                .slice(0, 3)
                .map(Number);
            const luminance = (c) =>
              c
                .map((x) => x / 255)
                .map((x) =>
                  x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4,
                )
                .reduce((s, x, i) => s + x * [0.2126, 0.7152, 0.0722][i], 0);
            const a = luminance(rgb(getComputedStyle(el).color)),
              b = luminance(
                rgb(
                  getComputedStyle(el.closest(".desk-proof")).backgroundColor,
                ),
              );
            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          });
        expect(contrast).toBeGreaterThanOrEqual(4.5);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);

        await page
          .locator(
            "[data-desk-form=ROOM] [data-desk-input=choice][value=unsupported]",
          )
          .check();
        await page.locator("[data-desk-form=ROOM] button[type=submit]").click();
        await expect(page.locator("#desk-feedback")).not.toBeEmpty();
        expect((await saved(page)).night.void.attempts).toEqual([]);
      }
      await citeAndSubmit(page, type);
      await page.reload();
      expect((await saved(page)).night.void.attempts).toContain(type);
    }
    await expect(page.locator(".void-disposition")).toContainText(
      "NO VERIFIED CATEGORY",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    if (mode === "force")
      await page.locator("#force-category").selectOption("GUEST");
    await page
      .locator(`[data-void-action=disposition][data-mode=${mode}]`)
      .click();
    if (mode === "retain") {
      await page.locator("[data-void-action=leave]").click();
      await page.locator("[data-night-action=lock]").click();
      await page.locator("[data-ending=released]").click();
      await expect(
        page.getByRole("heading", { name: "GAME OVER", exact: true }),
      ).toBeVisible();
    } else {
      await expect(
        page.locator("[data-ending-record=auto-close]"),
      ).toBeVisible();
      if (mode === "force")
        expect((await saved(page)).night.void.forcedType).toBe("GUEST");
    }
    expect((await saved(page)).night.void.disposition).toBe(mode);
    expect(errors).toEqual([]);
  });
test("keyboard access supports compare, field marking, citations and submission without dragging", async ({
  page,
}) => {
  await seed(page, sourceStart(), "evidence-desk?proof=intake");
  for (const id of ["sample", "booking"]) {
    const open = page.locator(
      `.desk-files [data-desk-op=open][data-document=${id}]`,
    );
    await open.focus();
    await page.keyboard.press("Enter");
    const compare = page.locator(
      ".desk-viewer>.desk-source [data-desk-op=compare]",
    );
    await compare.focus();
    await page.keyboard.press("Enter");
  }
  const mark = page.locator(".desk-viewer>.desk-source [data-field=reference]");
  await mark.focus();
  await page.keyboard.press("Enter");
  await expect(mark).toHaveAttribute("aria-pressed", "true");
  for (const id of sources.intake) {
    const box = page.locator(
      `[data-desk-form=intake] [data-document=${id}][type=checkbox]`,
    );
    await box.focus();
    await page.keyboard.press("Space");
  }
  const choice = page.locator("[data-desk-form=intake] [value=same]");
  await choice.focus();
  await page.keyboard.press("Space");
  await page.locator("[data-desk-form=intake] button[type=submit]").focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(async () => !!(await saved(page)).desk.results.intake)
    .toBe(true);
});

test("390px native source picker exposes every retained file and preserves the selected original", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await seed(page, fullCase(), "evidence-desk?proof=space");
  const picker = page.locator(".desk-mobile-source select");
  await expect(picker).toBeVisible();
  await expect(picker.locator("option[value=footage]")).toHaveCount(0);
  await picker.selectOption("revision");
  await expect(page.locator(".desk-viewer>.desk-source")).toHaveAttribute(
    "data-desk-document",
    "revision",
  );
  await picker.selectOption("position");
  await expect(page.locator(".desk-viewer>.desk-source")).toContainText(
    "服务区域登记卡",
  );
  await page.reload();
  await expect(picker).toHaveValue("position");
  expect((await saved(page)).desk.active).toBe("position");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});

test("a player who explores before intake sees a working practice tab and keeps all discovered files", async ({
  page,
}) => {
  const s = sourceStart();
  move(s, "inventory", { room: "318" });
  move(s, "inspect-service");
  await seed(page, s, "evidence-desk?proof=space");
  await expect(page.locator(".desk-review-nav button")).toHaveCount(1);
  await expect(page.locator("[data-desk-proof=intake]")).toBeVisible();
  await intake(page);
  await expect(page.locator(".desk-review-nav [data-key=space]")).toBeVisible();
  await page.locator(".desk-review-nav [data-key=space]").click();
  await expect(page.locator("[data-desk-proof=space]")).toBeVisible();
  expect((await saved(page)).evidence).toContain("C5");
});
