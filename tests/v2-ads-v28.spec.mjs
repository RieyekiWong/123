import {test,expect} from './v2-fixture.mjs';
const ids=['arcade','travel','broadband','snacks','teahouse','vinyl','fortune','ringtone','courses','sleep'];
for(const entry of ['index-zh.html','index.html'])for(const width of [375,1440])test(`${entry} ${width}px: chat has one bottom-right overlay, preserves drafts and restores typing after close`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.addInitScript(()=>{Math.random=()=>0;});
 await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));await page.goto('/'+entry+'#chat');
 await page.locator('#chat-input').fill('先放着，等会儿发');const before=await page.locator('.chat-app').boundingBox();
 // An idle focused composer must not prevent ads for the entire conversation.
 await page.clock.runFor(12000);await expect(page.locator('[data-active-ad]')).toHaveCount(1);
 await expect(page.locator('[data-active-ad]')).toHaveAttribute('data-slot','bottom-right');
 expect(await page.locator('.chat-app').boundingBox()).toEqual(before);await expect(page.locator('#chat-input')).toHaveValue('先放着，等会儿发');
 const geometry=await page.locator('[data-active-ad]').evaluate(el=>{const b=el.getBoundingClientRect();return {right:innerWidth-b.right,bottom:innerHeight-b.bottom,top:b.top};});
 expect(geometry.right).toBeLessThan(16);expect(geometry.bottom).toBeLessThan(16);expect(geometry.top).toBeGreaterThanOrEqual(0);
 await page.locator('[data-active-ad] [data-ad-action=close]').click();await expect(page.locator('#chat-input')).toBeFocused();
 await page.clock.runFor(12000);await expect(page.locator('[data-active-ad]')).toHaveCount(1);await expect(page.locator('[data-active-ad]')).toHaveAttribute('data-slot','bottom-right');
 await page.locator('[data-active-ad] [data-ad-action=close]').click();
 await page.evaluate(()=>{location.hash='forum';});await page.clock.runFor(12000);
 await expect(page.locator('[data-active-ad]').first()).toHaveAttribute('data-slot','top-left');
 await page.evaluate(()=>{location.hash='chat';});await expect(page.locator('[data-active-ad]')).toHaveCount(1);await expect(page.locator('[data-active-ad]')).toHaveAttribute('data-slot','bottom-right');
 await expect(page.locator('#chat-input')).toHaveValue('先放着，等会儿发');expect(await page.evaluate(()=>localStorage.getItem('stillwater-case:v2'))).toBeNull();
});
for(const width of [320,1440])test(`${width}px: ten additional local shops have distinct layouts, readable buttons, credited pictures and no data collection`,async({page})=>{
 test.setTimeout(60000);await page.setViewportSize({width,height:900});
 await page.addInitScript(ids=>{localStorage.setItem('stillwater-ads:v1',JSON.stringify({schema:1,pinnedIds:ids,collapsedPinnedIds:[]}));Math.random=()=>.3;},ids);
 await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));await page.goto('/index-zh.html#forum');
 const before=await page.locator('#case-shell').boundingBox(),layouts=[];
 for(const id of ids){
  await page.locator('footer [data-ad-action=folder]').click();await page.locator(`#ad-dialog [data-ad-action=reopen][data-ad-id=${id}]`).click();
  await page.evaluate(()=>window.scrollTo(0,0));
  const popup=page.locator(`[data-active-ad=${id}]`);await expect(popup).toBeVisible();layouts.push(await popup.getAttribute('data-layout'));
  expect(await page.locator('#case-shell').boundingBox()).toEqual(before);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const box=await popup.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);
  expect((await popup.locator('[data-ad-action=close]').boundingBox()).height).toBeGreaterThanOrEqual(44);
  await popup.locator('[data-ad-action=detail]').click();await expect(page.locator('.ad-shop-item')).toHaveCount(2);await expect(page.locator('.ad-photo-credit a').first()).toHaveAttribute('href',/^https:\/\/commons.wikimedia.org/);
  await expect(page.locator('.ad-mini-site input,.ad-mini-site iframe,.ad-mini-site audio')).toHaveCount(0);
  await page.keyboard.press('Escape');await popup.locator('[data-ad-action=close]').click();
 }
 expect(new Set(layouts).size).toBe(10);expect(layouts).not.toContain('classic');expect(await page.evaluate(()=>localStorage.getItem('stillwater-case:v2'))).toBeNull();
});
