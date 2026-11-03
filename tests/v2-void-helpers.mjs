import {expect} from '@playwright/test';
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
 for(const type of ['ROOM','GUEST','EMPLOYEE'])await page.locator(`[data-void-action=classify][data-type=${type}]`).click();
 await visit('void-classification');
 await page.locator('[data-void-action=classify][data-type=UNVERIFIED]').click();
 if(lookback)await page.locator('[data-void-action=lookback]').click();
 await visit('void-return');
 await page.locator('[data-void-action=leave]').click();
 await expect(page).toHaveURL(/#terminal$/);
}
