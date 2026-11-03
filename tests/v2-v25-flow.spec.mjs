import {test,expect} from '@playwright/test';
import {toAudit,toRevisions,toReview,validateFindings,toNight,wireNight,state,link} from './v2-helpers.mjs';
test('first-time player: preface and friends lead through the real sources, spatial chapters, all dispositions and GAME OVER',async({page})=>{
  test.setTimeout(120000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // No case, chat or clue save is seeded. The shared helper uses the actual chat card.
  await toAudit(page);
  expect((await state(page)).evidence).toEqual(['C1','C2','C3','C4','C5','C6']);
  await toRevisions(page);await toReview(page);await validateFindings(page);await toNight(page);
  for(const ending of ['auto-close','unverified']) {
    await page.locator(`[data-ending=${ending}]`).click();
    await expect(page.locator(`[data-ending-complete=${ending}]`)).toBeVisible();
    if(ending==='auto-close') {
      await expect(page.locator('.ending-staff-card')).toContainText('Rieyeki');
      await expect(page.locator('.ending-staff-card img')).toHaveCount(1);
    }
    await link(page,'terminal');
  }
  await wireNight(page);await page.locator('[data-night-action=lock]').click();
  await page.locator('[data-ending=released]').click();
  await expect(page.locator('.escape-scare')).toBeVisible();
  await expect(page.getByRole('heading',{name:'GAME OVER',exact:true})).toBeVisible();
  const result=await state(page);expect(result.schema).toBe(2);expect(result.endings).toHaveLength(3);expect(result.night.released).toBe(true);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-chat:v1')).openedForum)).toBe(true);
  await page.reload();await expect(page.getByRole('heading',{name:'GAME OVER',exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});
