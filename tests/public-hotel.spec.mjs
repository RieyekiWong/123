import { test, expect, readCopy } from './hotel-fixture.mjs';
for (const entry of ['index.html', 'index-zh.html']) {
  test(`${entry}: ordinary hotel pages lead to booking and optional archived clues`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/' + entry);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main img')).toHaveCount(1);
    await expect(page.locator('main .button')).toHaveCount(1);
    await expect(page.locator('main')).not.toContainText(/Dylan|Harker|404|迪伦|求救|档案|密码/);
    await expect(page.locator('#journal-button')).toBeHidden();
    await page.locator('main .button').click();
    await expect(page.locator('.room-size')).toHaveCount(3);
    await expect(page.locator('main')).toContainText(entry.includes('zh') ? '28 平方米' : '28 m²');
    await page.locator('[data-roomtype="twin"]').click();
    await expect(page.locator('#story-dialog')).toContainText(entry.includes('zh') ? '28 平方米' : '28 m²');
    await page.locator('[data-book="twin"]').click();
    await expect(page.locator('#room-preference')).toHaveValue('twin');
    await page.locator('footer a[href="#guestbook"]').click();
    await expect(page.locator('[data-clue="ribbon"]')).toBeHidden();
    await expect(page.locator('.dylan-public-entry')).toBeHidden();
    await page.locator('.guestbook-archive > summary').click();
    await readCopy(page, 'ribbon');
    await expect(page.locator('#journal-button')).toBeVisible();
    await page.reload();
    await expect(page.locator('.guestbook-archive')).not.toHaveAttribute('open');
    await page.locator('nav [data-nav="history"]').click();
    await expect(page.locator('[data-action="ledger"]')).toBeVisible();
    await expect(page.locator('.hotel-collection [data-action="switchboard"]')).toBeHidden();
    await page.locator('.hotel-collection > summary').click();
    await page.locator('.hotel-collection [data-action="switchboard"]').click();
    await expect(page.locator('#story-dialog')).toBeVisible();
    expect(errors).toEqual([]);
  });
  test(`${entry}: the visible surveillance entrance keeps the job gate and resumes an existing shift`, async ({ page }) => {
    await page.goto('/' + entry);
    await page.locator('footer [data-action="job-resume"]').click();
    await expect(page.locator('#support-chat')).toHaveAttribute('data-support-mode', 'supervisor');
    await expect(page.locator('[data-action="job-accept"]')).toBeDisabled();
    await expect(page.locator('.surveillance-desk')).toHaveCount(0);
    await page.locator('#dialog-close').click();
    await page.locator('footer a[href="#careers"]').click();
    await expect(page.locator('main [data-action="contact-supervisor"]')).toBeVisible();
    // An existing hired save is compatible with both the persistent footer and new navigation shortcut.
    await page.evaluate(() => {
      const key = 'stillwater-hotel:v2';
      const save = JSON.parse(localStorage.getItem(key));
      save.name = 'Avery'; save.checkedIn = true;
      save.sideQuests.job.stage = 'hired';
      localStorage.setItem(key, JSON.stringify(save));
    });
    await page.reload();
    await page.goto('/' + entry + '#surveillance');
    await expect(page.locator("#monitor-log")).toBeEnabled();
    await expect(page.locator('.monitor-shortcut')).toBeVisible();
    await page.locator('.monitor-shortcut').click();
    await expect(page.locator('.surveillance-desk')).toBeVisible();
    await expect(page).toHaveURL(/#surveillance$/);
    await page.locator('nav [data-nav="rooms"]').click();
    await page.locator('.monitor-shortcut').click();
    await expect(page.locator('.surveillance-desk')).toBeVisible();
  });
}
