import {expect} from '@playwright/test';
import {citeAndSubmit} from './v2-evidence-ui-helpers.mjs';
export async function solveVoid(page,{visit=async()=>{},lookback=true}={}) {
 await expect(page).toHaveURL(/#void$/);
 await visit('void-entry');
 for(let step=0;step<4;step++) {
  await page.locator('[data-void-action=observe][data-target=reference]').click();
  const reference=(await page.locator('.void-observation').innerText()).split(/[:：]/).slice(1).join(':').trim();
  let matching='';
  for(const direction of ['left','right']) {
   await page.locator(`[data-void-action=observe][data-target=${direction}]`).click();
   const actual=(await page.locator('.void-observation').innerText()).split(/[:：]/).slice(1).join(':').trim();
   if(actual===reference){matching=direction;break;}
  }
  expect(matching).not.toBe('');
  await page.locator(`[data-void-action=walk][data-direction=${matching}]`).click();
 }
 await visit('void-fragments');
 for(const [id,dx,dy] of [[0,-3,2],[1,3,-3],[2,-3,-1]]) {
  await page.locator(`[data-void-action=select][data-id="${id}"]`).click();
  for(let i=0;i<Math.abs(dx);i++)await page.locator(`[data-void-action=move][data-dx="${Math.sign(dx)}"]`).click();
  for(let i=0;i<Math.abs(dy);i++)await page.locator(`[data-void-action=move][data-dy="${Math.sign(dy)}"]`).click();
 }
 await expect(page.locator('.void-alignment')).toContainText('3/3');
 await page.locator('[data-void-action=review]').click();await visit('void-reviewed');
 await page.locator('[data-void-action=terminal]').click();
 if(!(await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-case:v2')).desk.footage))){
  await page.locator('a[href="#terminal"]').first().click();
  await page.locator('[data-desk-op=footage]:not(:disabled)').click();
  await page.locator('[data-unlisted-entry]').click();
 }
 for(const type of ['ROOM','GUEST','EMPLOYEE']){
  await page.locator(`[data-void-action=classify][data-type=${type}]`).click();
  if(await page.locator(`[data-desk-form="${type}"]`).count())await citeAndSubmit(page,type);
  else await page.locator('[data-desk-op=close-final]').click();
 }
 if(await page.locator('[data-story-form=footage]').count()){for(const id of ['footage','notebook','index'])await page.locator(`[data-story-boundary-cite=${id}]`).check();await page.locator('[data-story-field=finding][value=unverified]').check();await page.locator('[data-story-form=footage] button[type=submit]').click();}
 await visit('void-classification');
 await page.locator('[data-void-action=disposition][data-mode=retain]').click();
 if(lookback)await page.locator('[data-void-action=lookback]').click();
 await visit('void-return');
 await page.locator('[data-void-action=leave]').click();
 await expect(page).toHaveURL(/#terminal$/);
}
