import { test, expect } from "@playwright/test";

const close = async (page) =>
  page.getByRole("button", { name: "关闭窗口" }).click();
const act = (page, name) =>
  page.locator(`dialog [data-action="${name}"]`).click();

test("complete investigation, wrong code, both endings, persistence and reset", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator('.hero [data-action="checkin"]').click();
  await page.getByLabel("住客姓名 / GUEST NAME").fill("夜行者");
  await page.locator('input[name="rules"]').check();
  await page.getByRole("button", { name: "领取 307 号房钥匙" }).click();
  await expect(
    page.getByRole("heading", { name: "欢迎回来，夜行者。" }),
  ).toBeVisible();
  await act(page, "explore");
  await page.locator('dialog [data-room="307"]').click();
  await expect(
    page.getByRole("heading", { name: "307 · 您的房间" }),
  ).toBeVisible();
  await close(page);

  await page.locator('nav [data-action="rules"]').click();
  await act(page, "clue-clock");
  await act(page, "clue-clock");
  await expect(page.locator("#clue-count")).toHaveText("01");
  await close(page);

  await page.locator('.feature-grid [data-action="monitor"]').click();
  await page.locator('[data-camera="2"]').click();
  await expect(page.locator(".camera-note")).toContainText("404");
  await act(page, "clue-tape");
  await page.locator('[data-camera="3"]').click();
  await expect(page.locator(".camera-note")).toContainText("04:04");
  await close(page);

  await page.locator('nav [data-action="guestbook"]').click();
  await act(page, "clue-name");
  await expect(page.locator("#clue-count")).toHaveText("03");
  await close(page);
  await page.reload();
  await expect(page.locator("#clue-count")).toHaveText("03");
  await expect(page.locator("#session-label")).toHaveText("夜行者 · 307");

  await page.locator("#journal-button").click();
  await expect(page.locator(".journal-list")).toContainText(
    "白色的门通向下一次入住",
  );
  await page.locator('dialog [data-room="404"]').click();
  await page.getByLabel("请输入四位数字 / ACCESS CODE").fill("1234");
  await page.getByRole("button", { name: "转动门锁" }).click();
  await expect(page.locator("#form-error")).toContainText("门没有打开");
  await page.getByLabel("请输入四位数字 / ACCESS CODE").fill("0404");
  await page.getByRole("button", { name: "转动门锁" }).click();
  await act(page, "ending-exit");
  await expect(page.getByRole("heading", { name: "天亮以后" })).toBeVisible();
  await act(page, "journal");
  await expect(page.locator("dialog")).toContainText("已记录结局：天亮以后");
  await page.locator('dialog [data-room="404"]').click();
  await page.getByLabel("请输入四位数字 / ACCESS CODE").fill("0404");
  await page.getByRole("button", { name: "转动门锁" }).click();
  await act(page, "ending-stay");
  await expect(page.getByRole("heading", { name: "另一位归客" })).toBeVisible();
  await close(page);

  await page.locator('footer [data-action="about"]').click();
  await act(page, "reset-prompt");
  await act(page, "reset-confirm");
  await expect(page.locator("#clue-count")).toHaveText("00");
  await expect(page.locator("#session-label")).toHaveText("访客模式");
  expect(errors).toEqual([]);
});

test("lookup validation, safe guest names, keyboard modal and optional audio", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-action="lookup"]').click();
  await page.getByLabel("房间号码 / ROOM NUMBER").fill("999");
  await page
    .getByRole("button", { name: "查询房间", exact: false })
    .last()
    .click();
  await expect(page.locator("#form-error")).toContainText("没有这间客房");
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await expect(page.locator('[data-action="lookup"]')).toBeFocused();
  await page.locator('.hero [data-action="checkin"]').click();
  await page.getByLabel("住客姓名 / GUEST NAME").fill("<img src=x>");
  await page.locator('input[name="rules"]').check();
  await page.getByRole("button", { name: "领取 307 号房钥匙" }).click();
  await expect(
    page.getByRole("heading", { name: "欢迎回来，<img src=x>。" }),
  ).toBeVisible();
  expect(await page.locator("dialog img").count()).toBe(0);
  await close(page);
  await expect(page.locator("#sound-button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.locator("#sound-button").click();
  await expect(page.locator("#sound-button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator("#sound-button").click();
  await expect(page.locator("#sound-button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

for (const width of [320, 390, 768, 1440]) {
  test(`layout and navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    const headline = await page
      .locator("h1")
      .evaluate((el) => ({
        height: el.clientHeight,
        line: parseFloat(getComputedStyle(el).lineHeight),
      }));
    expect(headline.height).toBeLessThanOrEqual(headline.line * 2 + 2);
    if (width <= 800) {
      await page.getByRole("button", { name: "打开导航" }).click();
      await expect(page.locator(".mobile-menu")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    }
    await page.locator('nav [data-action="archives"]').click();
    await expect(
      page.getByRole("heading", { name: "异常档案室" }),
    ).toBeVisible();
    await act(page, "notice");
    await expect(
      page.getByRole("heading", { name: "关于四层电梯临时停用的通知" }),
    ).toBeVisible();
    await close(page);
    await page.locator('.room-card[data-room="404"]').click();
    await expect(page.getByLabel("请输入四位数字 / ACCESS CODE")).toBeVisible();
    const rect = await page.locator("dialog").boundingBox();
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(width);
  });
}

test("corrupt storage does not break the story", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("no-return-hotel:v1", "{invalid"),
  );
  await page.reload();
  await page.locator('.hero [data-action="checkin"]').click();
  await expect(page.getByLabel("住客姓名 / GUEST NAME")).toBeVisible();
});
