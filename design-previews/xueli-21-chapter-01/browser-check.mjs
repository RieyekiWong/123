// Local sample only. The route guard fails if anything tries to call a service.
import { chromium, expect } from '../../node_modules/@playwright/test/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { BY_ID, UI_COPY, OPENING, ENDING } from './chapter-data.js';
const folder = fileURLToPath(new URL('.', import.meta.url));
const base = process.env.CHAPTER_BASE_URL || 'http://127.0.0.1:3135/xueli-21-chapter-01/';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const report = { testedAt: new Date().toISOString(), base, runs: [], errors: [], serviceRequests: [], screenshots: [], scope: 'Isolated chapter sample, not a production-game playthrough' };
await mkdir(`${folder}screens`, { recursive: true });
const saveShot = async (page, name) => { await page.screenshot({ path: `${folder}screens/${name}.png`, fullPage: true }); report.screenshots.push(`screens/${name}.png`); };
const chatKey = 'stillwater-chat:v1', caseKey = 'stillwater-case:v2';

async function run(lang, width, height, alternate = false) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.route('**/api/**', route => { report.serviceRequests.push(route.request().url()); return route.abort(); });
  await page.addInitScript(() => {
    window.sampleStorageReads = [];
    const read = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) { window.sampleStorageReads.push(key); return read.call(this, key); };
  });
  await page.goto(base); await page.evaluate(() => document.fonts.ready);
  await page.evaluate(({ chatKey, caseKey }) => { localStorage.setItem(chatKey, 'preserve-chat-fixture'); localStorage.setItem(caseKey, 'preserve-case-fixture'); }, { chatKey, caseKey });
  if (lang === 'en') await page.locator('[data-action="language"]').click();
  const en = lang === 'en';
  const layouts = [];
  async function checkLayout(stage) {
    const layout = await page.evaluate(() => {
      const pane = document.querySelector('.window-content');
      return { pageOverflow: document.documentElement.scrollWidth > innerWidth + 1,
        readerOverflow: pane.scrollWidth > pane.clientWidth + 1 };
    });
    expect(layout.pageOverflow, `${stage}: page width`).toBe(false);
    expect(layout.readerOverflow, `${stage}: content width`).toBe(false);
    layouts.push({ stage, ...layout });
  }
  await checkLayout('opening');
  await expect(page.locator('.desktop-icon')).toHaveCount(2);
  await expect(page.locator('.chat-bubble')).toHaveCount(OPENING.length);
  await expect(page.locator('.chat-main')).toContainText(OPENING[4][lang]);
  await expect(page.locator('.desk-sub')).toContainText(UI_COPY.shared[lang]);
  if (width === 1440 && !en) await saveShot(page, '01-desktop-opening');
  await page.locator('.attachment[data-open="note"]').click();
  await checkLayout('note');
  await expect(page.locator('.desktop-icon')).toHaveCount(3);
  await page.locator('[data-open="weekly"]').click();
  await expect(page.locator('[data-document="weekly"]')).toBeVisible();
  await expect(page.locator('.article-body p')).toHaveCount(BY_ID.weekly.paragraphs[lang].length);
  await expect(page.locator('.article-body')).toContainText(en ? 'Bluebird Photo' : '青鸟照相馆');
  await expect(page.locator('.article-caption')).toContainText('J.W.');
  await checkLayout('weekly');
  const wideRatio = await page.locator('[data-asset="photo-anniversary"]').evaluate(el => { const rect = el.getBoundingClientRect(); return rect.width / rect.height; });
  expect(wideRatio).toBeCloseTo(2, 1);
  await page.locator('[data-size="2"]').click();
  await expect(page.locator('.article-body')).toHaveCSS('font-size', '22px');
  await page.locator('[data-size="-2"]').click();
  if (!en) await saveShot(page, width === 1440 ? '02-desktop-weekly' : '05-mobile-weekly');
  const pane = page.locator('.window-content');
  await pane.evaluate(el => { el.scrollTop = 520; });
  const scroll = await pane.evaluate(el => el.scrollTop);
  await page.locator('.taskbar [data-app="chat"]').click();
  await page.locator('.taskbar [data-app="browser"]').click();
  expect(await pane.evaluate(el => el.scrollTop)).toBeGreaterThanOrEqual(scroll - 2);
  await page.reload(); await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-document="weekly"]')).toBeVisible();
  expect(await page.locator('.window-content').evaluate(el => el.scrollTop)).toBeGreaterThanOrEqual(scroll - 2);
  if (!en && width === 390) await saveShot(page, '06-mobile-reading');
  // Optional reading is accessible but grants no deduction progress.
  await page.locator('[data-open="letter"]').click();
  await expect(page.locator('[data-document="letter"]')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('stillwater-xueli-sample:v1')).completed)).toBe(false);
  async function query(value) {
    await page.locator('#query').fill(value);
    if (en) await page.locator('#query').press('Enter');
    else await page.locator('#search-form button').click();
  }
  await query(en ? 'an unknown made-up query' : '根本不存在的资料');
  await expect(page.locator('.empty-result')).toBeVisible();
  await expect(page.locator('.empty-result')).toContainText(UI_COPY.noResults[lang]);
  await query(alternate ? en ? 'Bluebird Photo' : '青鸟照相馆' : 'J.W.');
  if (alternate) await expect(page.locator('.search-result [data-open="reply"]')).toHaveCount(0);
  if (!en && width === 1440) await saveShot(page, '03-desktop-search');
  await page.locator(`.search-result [data-open="${alternate ? 'directory' : 'profile'}"]`).click();
  if (!alternate) {
    const tallRatio = await page.locator('[data-asset="portrait-june"]').evaluate(el => { const rect = el.getBoundingClientRect(); return rect.height / rect.width; });
    expect(tallRatio).toBeCloseTo(2, 1);
  }
  await expect(page.locator('.desktop-icon')).toHaveCount(4);
  await checkLayout(alternate ? 'directory' : 'profile');
  await page.locator('#query').fill(en ? 'June Ward' : '朱恩沃德');
  await page.reload();
  await expect(page.locator('#query')).toHaveValue(en ? 'June Ward' : '朱恩沃德');
  await query(en ? 'j. ward' : '朱恩沃德');
  if (en) await expect(page.locator('.search-result [data-open="diary"]')).toHaveCount(0);
  await page.locator('.search-result [data-open="reply"]').click();
  await expect(page.locator('.mail-headers')).toContainText('2023-10-15 17:26');
  await expect(page.locator('.mail-status')).toContainText(en ? 'no October 16 check-in' : '没有 10 月 16 日的到访确认');
  await expect(page.locator('.article-body')).not.toContainText(en ? 'no October 16 check-in' : '没有 10 月 16 日的到访确认');
  await expect(page.locator('.article-body')).toContainText(en ? 'three in the afternoon' : '下午三点');
  await checkLayout('mail');
  await page.locator('.taskbar [data-app="casebook"]').click();
  await checkLayout('notebook');
  await page.locator('#person').fill(en ? 'GGbond' : 'GGbond');
  await page.locator('#place').fill(en ? 'Xueli Town' : '雪梨镇');
  await page.locator('#purpose').fill(en ? 'A booking record' : '入住记录');
  await page.locator('#case-form button[type="submit"]').click();
  await expect(page.locator('#feedback')).toBeVisible();
  await expect(page.locator('#person')).toHaveValue('GGbond');
  await expect(page.locator('.chat-main')).toHaveCount(0);
  // The same positive aliases inside a denial must not trigger the story.
  const correct = { person: en ? 'June' : '朱恩', place: en ? 'Bluebird' : '青鸟', purpose: en ? 'staff photo' : '员工合照' };
  const denied = { person: en ? 'not June Ward' : '不是朱恩', place: en ? 'not Bluebird Photo' : '不是青鸟', purpose: en ? 'not the hotel staff photo' : '我想看一张照片但不是酒店员工合照' };
  for (const field of ['person', 'place', 'purpose']) {
    for (const [name, value] of Object.entries(correct)) await page.locator(`#${name}`).fill(name === field ? denied[field] : value);
    await page.locator('#case-form button[type="submit"]').click();
    await expect(page.locator(`#${field}`)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#feedback')).toBeVisible();
    await expect(page.locator(`#${field}`)).toHaveValue(denied[field]);
    await expect(page.locator('.attachment[data-open="back"]')).toHaveCount(0);
  }
  await page.locator('[data-action="hint"]').click();
  await page.locator('[data-action="hint"]').click();
  await page.locator('[data-action="hint"]').click();
  await expect(page.locator('.help-area p')).toHaveCount(3);
  await page.locator('#person').fill(en ? 'j. ward' : '朱恩沃德');
  await page.locator('#place').fill(en ? 'Bluebird Photo, 6 Birch Street' : '青鸟照相馆，桦树街 6 号');
  await page.locator('#purpose').fill(en ? 'staff photo' : '员工合影');
  await expect(page.locator('input[type="checkbox"]')).toHaveCount(0);
  await page.reload(); await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#person')).toHaveValue(en ? 'j. ward' : '朱恩沃德');
  await expect(page.locator('.help-area p')).toHaveCount(3);
  await page.locator('[data-action="language"]').click();
  await expect(page.locator('#person')).toHaveValue(en ? 'j. ward' : '朱恩沃德');
  await page.locator('[data-action="language"]').click();
  if (!en && width === 1440) { await page.locator('.window-content').evaluate(el => { el.scrollTop = 0; }); await saveShot(page, '04-desktop-notebook'); }
  await page.locator('#case-form button[type="submit"]').click();
  await expect(page.locator('.chat-bubble')).toHaveCount(OPENING.length + ENDING.length);
  await expect(page.locator('.complete-note')).toContainText(UI_COPY.success[lang]);
  await expect(page.locator('.attachment[data-open="back"]')).toBeVisible();
  await checkLayout('new-story');
  await page.reload();
  await expect(page.locator('.chat-bubble')).toHaveCount(OPENING.length + ENDING.length);
  await expect(page.locator('.attachment[data-open="back"]')).toHaveCount(1);
  await page.locator('.attachment[data-open="back"]').click();
  await expect(page.locator('.article-body')).toContainText('Nora Bell — night shift');
  await expect(page.locator('.byline')).toContainText(en ? 'Scan date and subsequent history: unknown' : '扫描日期与流转经过：未知');
  await expect(page.locator('.article-end')).toContainText(en ? 'Who is she?' : '她是谁？');
  await checkLayout('scan');
  // Returning to a source after completion never replaces it with a new version.
  await page.locator('.saved-readings summary').click();
  await page.locator('.saved-readings [data-open="weekly"]').click();
  await expect(page.locator('.article-body')).toContainText(BY_ID.weekly.paragraphs[lang][0]);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('stillwater-xueli-sample:v1')).completed)).toBe(true);
  const runtimeReadKeys = await page.evaluate(() => window.sampleStorageReads);
  expect(runtimeReadKeys.every(key => key === 'stillwater-xueli-sample:v1')).toBe(true);
  const productionSaves = await page.evaluate(({ chatKey, caseKey }) => [localStorage.getItem(chatKey), localStorage.getItem(caseKey)], { chatKey, caseKey });
  expect(productionSaves).toEqual(['preserve-chat-fixture', 'preserve-case-fixture']);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  const footerClear = await page.evaluate(() => document.querySelector('.window-status').getBoundingClientRect().bottom <= document.querySelector('.taskbar').getBoundingClientRect().top + 2);
  expect(footerClear).toBe(true);
  // Native buttons and form controls keep keyboard activation. Reset requires confirmation.
  await page.locator('[data-action="reset"]').focus(); await page.keyboard.press('Enter');
  await expect(page.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).not.toBeVisible();
  const fonts = await page.evaluate(() => ({ fusion: document.fonts.check('20px Fusion'), silkscreen: document.fonts.check('20px Silkscreen') }));
  expect(fonts.fusion && fonts.silkscreen).toBe(true);
  report.runs.push({ lang, width, height, shopInfoViaDirectory: alternate, completed: true, readingPositionRestored: true, draftRestored: true, unfinishedQueryRestored: true, mailStatusSeparateFromAuthor: true, scanHasUnknownProvenance: true, originalRevisitedAfterCompletion: true, noCitationControls: true, shortAliasesAccepted: true, denialsRejected: true, wrongAnswersRejected: true, storyOnceAfterRefresh: true, fonts, overflow, layouts, taskbarDoesNotCoverFooter: footerClear, productionSavesPreserved: true, reducedMotion: true });
  await context.close();
}
try {
  await run('zh', 1920, 1080);
  await run('en', 1920, 1080, true);
  await run('zh', 1440, 1050);
  await run('en', 1440, 1050, true);
  await run('zh', 390, 1000);
  await run('en', 390, 1000, true);
  await run('zh', 320, 900, true);
  await run('en', 320, 900, true);
  // A corrupt sample record is retained; no production key is cleared.
  const corruptContext = await browser.newContext({ storageState: { cookies: [], origins: [{ origin: new URL(base).origin, localStorage: [
    { name: 'stillwater-xueli-sample:v1', value: '{broken' }, { name: chatKey, value: 'old-chat' }, { name: caseKey, value: 'old-case' }
  ] }] } });
  const page = await corruptContext.newPage();
  await page.goto(base);
  await expect(page.locator('.storage-warning')).toBeVisible();
  await page.locator('.attachment[data-open="note"]').click();
  expect(await page.evaluate(() => localStorage.getItem('stillwater-xueli-sample:v1'))).toBe('{broken');
  await page.locator('[data-action="reset"]').click();
  await page.locator('[data-action="confirm-reset"]').click();
  await expect(page.locator('.desktop-icon')).toHaveCount(2);
  expect(await page.evaluate(({ chatKey, caseKey }) => [localStorage.getItem(chatKey), localStorage.getItem(caseKey)], { chatKey, caseKey })).toEqual(['old-chat', 'old-case']);
  report.corruptSavePreservedUntilConfirmedReset = true;
  const temporary = await browser.newContext();
  await temporary.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked in test', 'SecurityError'); } }); });
  const temporaryPage = await temporary.newPage();
  await temporaryPage.goto(base);
  await expect(temporaryPage.locator('.storage-warning')).toBeVisible();
  await temporaryPage.locator('.attachment[data-open="note"]').click();
  await temporaryPage.locator('[data-open="weekly"]').click();
  await expect(temporaryPage.locator('[data-document="weekly"]')).toBeVisible();
  await temporaryPage.locator('#query').fill('<script>window.sampleInjected=true</script>');
  await temporaryPage.locator('#query').press('Enter');
  await expect(temporaryPage.locator('.empty-result')).toBeVisible();
  expect(await temporaryPage.evaluate(() => window.sampleInjected)).toBeUndefined();
  report.blockedStorageAllowsTemporaryReading = true;
  report.searchTextSafelyRendered = true;
  const legacyDraft = { schema: 1, lang: 'zh', app: 'casebook', read: ['note', 'weekly', 'profile'],
    draft: { person: '朱恩沃德', place: '青鸟', purpose: '合影' }, citations: ['weekly', 'profile'],
    completed: false, hint: 1, scroll: { weekly: 260 } };
  const resumed = await browser.newContext({ storageState: { cookies: [], origins: [{ origin: new URL(base).origin, localStorage: [
    { name: 'stillwater-xueli-sample:v1', value: JSON.stringify(legacyDraft) }
  ] }] } });
  const resumedPage = await resumed.newPage();
  await resumedPage.goto(base);
  await expect(resumedPage.locator('#person')).toHaveValue('朱恩沃德');
  await expect(resumedPage.locator('input[type="checkbox"]')).toHaveCount(0);
  await resumedPage.locator('#case-form button[type="submit"]').click();
  await expect(resumedPage.locator('.attachment[data-open="back"]')).toBeVisible();
  report.legacyBlockedDraftResumedWithoutCitations = true;
  const oldCompleted = { ...legacyDraft, completed: true, storyDelivered: true, app: 'browser', doc: 'back',
    read: ['note', 'profile', 'back'], draft: { person: 'June', place: 'Bluebird', purpose: 'an old photo' } };
  // Seed before page load: modifying storage in a live page and then reloading
  // would let that page's legitimate pagehide handler overwrite the fixture.
  const completedContext = await browser.newContext({ storageState: { cookies: [], origins: [{ origin: new URL(base).origin, localStorage: [
    { name: 'stillwater-xueli-sample:v1', value: JSON.stringify(oldCompleted) }
  ] }] } });
  const completedPage = await completedContext.newPage();
  await completedPage.goto(base);
  await expect(completedPage.locator('[data-document="back"]')).toBeVisible();
  await completedPage.locator('.taskbar [data-app="chat"]').click();
  await expect(completedPage.locator('.attachment[data-open="back"]')).toHaveCount(1);
  await completedPage.reload();
  await expect(completedPage.locator('.attachment[data-open="back"]')).toHaveCount(1);
  expect(await completedPage.evaluate(() => JSON.parse(localStorage.getItem('stillwater-xueli-sample:v1')).legacyCompletion)).toBe(true);
  report.legacyCompletedSamplePreservedWithCompatibilityMarker = true;
  expect(report.errors).toEqual([]); expect(report.serviceRequests).toEqual([]);
  report.passed = true;
} catch (error) { report.passed = false; report.failure = String(error.stack || error); throw error; }
finally { await writeFile(`${folder}browser-checks.json`, JSON.stringify(report, null, 2) + '\n'); await browser.close(); console.log(JSON.stringify(report, null, 2)); }
