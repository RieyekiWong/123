import {expect} from '@playwright/test';
export const link=(page,route,scope='main')=>page.locator(`${scope} a[href="#${route}"]`).first().click();
export const state=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-case:v2')));
export async function toAudit(page,entry='index-zh.html'){
  await page.goto('/'+entry);
  const reference=await page.locator('.job-card .reference').innerText();
  await page.locator('[data-case-action=sample]').click();
  await link(page,'reservations');
  await page.locator('#reservation-reference').fill('R-wrong');
  await page.locator('#reservation-search button').click();
  await expect(page.locator('#reservation-error')).not.toBeEmpty();
  await page.locator('#reservation-reference').fill(reference);
  await page.locator('#reservation-search button').click();
  const assigned=await page.locator('#reservation-result table tr').nth(2).locator('td').innerText();
  await link(page,'rooms');
  await expect(page.locator('.notice-window')).toBeVisible();
  await page.locator('[data-case-action=dismiss-notice]').click();
  await page.locator('#inventory-room').selectOption(assigned);
  await page.locator('#inventory-check button').click();
  await link(page,'guestbook');
  await page.locator('[data-case-action=read-key]').click();
  await link(page,'floor-plan');
  await page.locator('.service-space').click();
  const docket=await page.locator('.document table tr').nth(2).locator('td').innerText();
  await page.locator('[name=classification][value=guest]').check();
  await page.locator('#service-classification button').click();
  await expect(page.locator('#service-error')).not.toBeEmpty();
  await page.locator('[name=classification][value=service]').check();
  await page.locator('#service-classification button').click();
  await link(page,'maintenance');
  await page.locator('#maintenance-reference').fill(docket);
  await page.locator('#maintenance-search button').click();
  await expect(page.locator('.document')).toContainText('E-014');
  await link(page,'night-audit');
}
export async function toRevisions(page){
  await page.locator('[name=assessment][value=insufficient]').check();
  await page.locator('#night-audit-form > button').click();
  await expect(page.locator('#audit-error')).not.toBeEmpty();
  const rows=await page.locator('.audit-cards li').evaluateAll(els=>els.map(el=>({id:el.dataset.log,at:el.querySelector('time').dateTime})).sort((a,b)=>a.at.localeCompare(b.at)));
  for(let index=0;index<rows.length;index++){
    while(await page.locator('.audit-cards li').evaluateAll((els,id)=>els.findIndex(el=>el.dataset.log===id),rows[index].id)>index)
      await page.locator(`[data-log="${rows[index].id}"] [data-direction="-1"]`).click();
  }
  await page.locator('[name=assessment][value=confirmed]').check();
  await page.locator('#night-audit-form > button').click();
  await expect(page.locator('#audit-error')).not.toBeEmpty();
  await page.locator('[name=assessment][value=insufficient]').check();
  await page.locator('#night-audit-form > button').click();
  await link(page,'staff');
  await expect(page.locator('main')).toContainText('Mara Ellis');
  await link(page,'revisions');
}
export async function toReview(page){
  const changed=await page.locator('.revision-table tbody tr').evaluateAll(rows=>rows.filter(row=>row.cells[2].textContent!==row.cells[3].textContent).map(row=>row.querySelector('input').value));
  await page.locator('[name=difference][value=reference]').check();
  await page.locator('#revision-form > button').click();
  await expect(page.locator('#revision-error')).not.toBeEmpty();
  await page.locator('[name=difference][value=reference]').uncheck();
  for(const field of changed)await page.locator(`[name=difference][value="${field}"]`).check();
  await page.locator('#revision-form > button').click();
  await link(page,'closure');
  await expect(page.locator('main')).toContainText('2007-01-08');
  await link(page,'mara');
  await link(page,'review');
}
export async function validateFindings(page){
  await page.locator('[name=claim][value=occupancy]').check();
  await page.locator('#final-evidence-form > button').click();
  await expect(page.locator('#evidence-error')).not.toBeEmpty();
  await page.locator('[name=claim][value=occupancy]').uncheck();
  for(const id of ['service','reviewer','revision'])await page.locator(`[name=claim][value="${id}"]`).check();
  await page.locator('#final-evidence-form > button').click();
  await expect(page.locator('.verification-receipt')).toBeVisible();
}
