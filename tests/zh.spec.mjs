import { test, expect } from "./hotel-fixture.mjs";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
const close = (page) =>
  page.getByRole("button", { name: "关闭窗口", exact: true }).click();
const action = (page, id) =>
  page.locator(`dialog [data-action="${id}"]`).click();
const record = (page, id) => page.locator(`[data-clue="${id}"]`).click();
const navigate = (page, id) => page.locator(`nav [data-nav="${id}"]`).click();

// Exercise the real Chinese route and every second-chapter station without seeding progress.
test("Chinese edition completes both chapters using Chinese puzzle answers and shares hosted progress", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/index-zh.html");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page).toHaveTitle(/静水旅馆/);
  await navigate(page, "reservations");
  await page.getByLabel("住客姓名", { exact: true }).fill("旅人");
  await page.locator("#agree-guidelines").check();
  await page.getByRole("button", { name: "领取我的房间钥匙" }).click();
  await expect(
    page.getByRole("heading", { name: "欢迎回来，旅人。" }),
  ).toBeVisible();
  await page.locator('main [data-action="explore"]').click();
  await page.locator('dialog [data-room="307"]').click();
  await action(page, "diary");
  await record(page, "clock");
  await close(page);
  await page.locator('main [data-action="explore"]').click();
  await action(page, "monitor");
  await page.locator('[data-camera="2"]').click();
  await record(page, "door");
  await close(page);
  await navigate(page, "guestbook");
  await record(page, "ribbon");
  await navigate(page, "history");
  await page.locator('[data-action="ledger"]').click();
  await record(page, "register");
  await page.locator('dialog [data-page="employees"]').click();
  await page.getByLabel("员工通行码").fill("1003");
  await page.getByRole("button", { name: "打开员工档案" }).click();
  await page.locator('[data-action="maintenance"]').click();
  await record(page, "switch");
  await close(page);
  await page.locator('[data-action="letter"]').click();
  await record(page, "letter");
  await close(page);
  await page.locator("#journal-button").click();
  await expect(page.locator("dialog")).toContainText("已找回 6 / 6 条记录");
  await page.locator('dialog [data-room="404"]').click();
  await page.getByLabel("四位数字门锁密码").fill("1234");
  await page.getByRole("button", { name: "转动门锁" }).click();
  await expect(page.locator("#unlock-error")).toContainText("门锁没有转动");
  await page.getByLabel("四位数字门锁密码").fill("0404");
  await page.getByRole("button", { name: "转动门锁" }).click();
  await action(page, "ending-release");
  await expect(page.getByRole("heading", { name: "退房失败" })).toBeVisible();
  await action(page, "continue-below");
  await page.locator('main [data-action="puzzle-power"]').click();
  await expect(page.locator('[data-circuit="3"]')).toContainText("前台铃");
  for (const id of [3, 1, 4, 2])
    await page.locator(`[data-circuit="${id}"]`).click();
  await page.getByRole("button", { name: "按所选顺序通电" }).click();
  await expect(
    page.getByRole("heading", { name: "地下设备恢复供电" }),
  ).toBeVisible();
  await action(page, "puzzle-radio");
  await page.getByLabel("接收频率 / FM 调频").evaluate((input) => {
    input.value = "887";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.getByRole("button", { name: "确认频率，接收广播" }).click();
  await expect(page.locator("dialog")).toContainText("英文菜名的首字母");
  await action(page, "puzzle-archive");
  await action(page, "dining");
  await expect(page.locator(".printed-menu")).toContainText(
    "Smoked tomato consommé",
  );
  await expect(page.locator(".printed-menu")).toContainText("烟熏番茄清汤");
  await close(page);
  await page.locator('main [data-action="puzzle-archive"]').click();
  await page.getByLabel("柜锁的五字母密码").fill("STILL");
  await page.getByRole("button", { name: "打开名册盒" }).click();
  await action(page, "puzzle-identity");
  await page.getByLabel("311 号房最初住客的全名").fill("埃莉诺·维尔");
  await page.getByRole("button", { name: "恢复被抹去的姓名" }).click();
  await expect(page.locator("#puzzle-error")).toContainText("姓名不匹配");
  await page.getByLabel("311 号房最初住客的全名").fill("沃尔特·维尔");
  await page.getByRole("button", { name: "恢复被抹去的姓名" }).click();
  await action(page, "puzzle-mirror");
  await expect(page.locator(".mirror-record")).toContainText(
    "YEK EHT NRUT TON OD",
  );
  await page.getByLabel("纸条上的提示").fill("转动钥匙");
  await page.getByRole("button", { name: "记下纸条内容" }).click();
  await expect(page.locator("#puzzle-error")).toContainText("从右向左");
  await page.getByLabel("纸条上的提示").fill("不要转动钥匙。");
  await page.getByRole("button", { name: "记下纸条内容" }).click();
  await action(page, "puzzle-chronology");
  for (const id of ["open", "stop", "return"])
    await page.locator(`[data-date="${id}"]`).click();
  await expect(page.locator("#dates-readout")).toHaveText(
    "开业 → 时钟停摆 → 首次返回",
  );
  await page.getByRole("button", { name: "提交更正后的顺序" }).click();
  await expect(page.locator("#clue-count")).toHaveText("12 / 12");
  await action(page, "final-discharge");
  await page.getByLabel("带哪一本登记簿？").selectOption("original");
  await page.getByLabel("如何处理黄铜钥匙？").selectOption("leave");
  await page.getByLabel("从哪里离开？").selectOption("stair");
  await page.getByRole("button", { name: "确认退房并签名：旅人" }).click();
  await expect(
    page.getByRole("heading", { name: "走出酒店时，天已经亮了。" }),
  ).toBeVisible();
  await expect(page.locator(".epilogue")).toContainText(
    "所有人的退房手续都办好了。",
  );
  await page.reload();
  await expect(page.locator("#clue-count")).toHaveText("12 / 12");
  await page.locator("[data-language-link]").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", { name: "Outside, it is morning." }),
  ).toBeVisible();
  await expect(page.locator("#clue-count")).toHaveText("12 / 12");
  await page.locator("[data-language-link]").click();
  await expect(
    page.getByRole("heading", { name: "走出酒店时，天已经亮了。" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("Chinese localization never rewrites user names, notes, HTML escapes or field values", async ({
  page,
}) => {
  await page.goto("/index-zh.html#guestbook");
  await page.getByLabel("姓名或昵称").fill("Guest");
  await page.getByLabel("留言内容", { exact: true }).fill("Home");
  await page.getByRole("button", { name: "提交留言" }).click();
  await expect(
    page.locator(".local-guest-entry [data-user-text]").first(),
  ).toHaveText("Guest");
  await expect(page.locator(".local-guest-entry blockquote")).toHaveText(
    "Home",
  );
  await expect(page.locator(".local-guest-entry")).toContainText(
    "保存在本设备中",
  );
  await expect(page.locator(".local-guest-entry")).toContainText(
    "本次到访的留言",
  );
  await navigate(page, "reservations");
  await page.getByLabel("住客姓名", { exact: true }).fill("<img src=x>");
  await page.locator("#agree-guidelines").check();
  await page.getByRole("button", { name: "领取我的房间钥匙" }).click();
  await expect(
    page.getByRole("heading", { name: "欢迎回来，<img src=x>。" }),
  ).toBeVisible();
  expect(await page.locator('main img[src="x"]').count()).toBe(0);
  await page.locator('[data-action="edit-reservation"]').click();
  await expect(page.locator("#guest-name")).toHaveValue("<img src=x>");
  await expect(page.locator("#room-preference")).toHaveValue("classic");
});

test("bilingual clue translation is idempotent and all guide documents are localized", async ({
  page,
}) => {
  await page.goto("/index-zh.html#guide");
  const result = await page.evaluate(() => {
    const t = window.StillwaterLocale.text;
    return [
      "moked tomato consommé",
      "Added to notebook: The backfeed circuit (7/12)",
      "Welcome back, 小林.",
      "Lower stations verified: 3/6. The first checkout was not the end. Continue in the lower register.",
    ].every((value) => t(t(value)) === t(value));
  });
  expect(result).toBe(true);
  const source = await readFile("locale-zh.js", "utf8");
  const context = {};
  vm.runInNewContext(
    source.slice(0, source.indexOf("  const normalize")) +
      "\n globalThis.catalogKeys=Object.keys(dictionary);})();",
    context,
  );
  const unstable = await page.evaluate((keys) => {
    const t = window.StillwaterLocale.text;
    return keys.filter((key) => t(t(key)) !== t(key));
  }, Array.from(context.catalogKeys));
  expect(unstable).toEqual([]);
  for (const id of [
    "dining",
    "readingroom",
    "garden",
    "switchboard",
    "residents",
    "inventory",
  ]) {
    await page.locator(`main [data-action="${id}"]`).click();
    await expect(page.locator("dialog #dialog-title")).toContainText(
      /[\u3400-\u9fff]/,
    );
    await expect(page.locator("dialog .document-intro")).toContainText(
      /[\u3400-\u9fff]/,
    );
    await close(page);
  }
});

for (const width of [320, 390, 768, 1320]) {
  test(`Chinese public and lower layouts fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/index-zh.html");
    await expect(page.locator("[data-language-link]")).toBeVisible();
    for (const route of [
      "home",
      "rooms",
      "history",
      "guestbook",
      "reservations",
      "guide",
    ]) {
      await navigate(page, route);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      await expect(page.locator("main h1")).toContainText(/[\u3400-\u9fff]/);
    }
    await page.evaluate(() =>
      localStorage.setItem(
        "stillwater-hotel:v2",
        JSON.stringify({
          name: "林",
          checkedIn: true,
          chapter: 2,
          clues: ["clock", "door", "ribbon", "register", "switch", "letter"],
          puzzles: [],
        }),
      ),
    );
    await page.goto("/index-zh.html#below");
    await page.reload();
    await expect(page.locator("main h1")).toHaveText("你又回到了前台。");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await page.locator('main [data-action="puzzle-power"]').click();
    const rect = await page.locator("dialog").boundingBox();
    expect(rect.x + rect.width).toBeLessThanOrEqual(width);
    await action(page, "switchboard");
    const sizes = await page
      .locator("dialog")
      .evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.client + 1);
  });
}
