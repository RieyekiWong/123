import {test,expect} from './v2-fixture.mjs';
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-chat:v1')));
async function open(page,entry='index-zh.html',width=1440) {
  await page.setViewportSize({width,height:900});
  await page.clock.install({time:new Date('2026-11-03T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-11-03T12:00:01Z'));
  await page.goto('/'+entry);
}
async function send(page,text) {
  await page.locator('#chat-input').fill(text);
  await page.locator('#chat-input').press('Enter');
  await page.clock.runFor(4000);
  for(const close of await page.locator('[data-active-ad] [data-ad-action=close]').all())await close.click();
}
for(const entry of ['index-zh.html','index.html']) {
  test(`${entry}: fresh chat accepts free input and its canonical share opens the existing forum`,async({page})=>{
    const external=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:3110/'))external.push(r.url());});
    await open(page,entry);
    await expect(page).toHaveURL(/#chat$/);await expect(page.locator('.chat-message-self')).toHaveCount(0);
    await expect(page.locator('.hotel-nav,footer,[data-active-ad]')).toHaveCount(0);
    await send(page,entry.includes('zh')?'刚起，我也没睡好':'Just woke up, barely slept');
    await expect(page.locator('.chat-message-self .chat-bubble')).toHaveText(entry.includes('zh')?'刚起，我也没睡好':'Just woke up, barely slept');
    await send(page,entry.includes('zh')?'作业还没弄完':'Still have homework to finish.');
    expect((await saved(page)).cursor).toBeLessThan(15);
    await send(page,'317 Mara Continuity TEMP-015');
    expect(await page.locator('.chat-message:not(.chat-message-self) .chat-bubble').allTextContents()).not.toEqual(expect.arrayContaining([expect.stringMatching(/317|Mara|Continuity|TEMP-015/)]));
    await send(page,entry.includes('zh')?'什么工作':'What job is it?');
    await send(page,entry.includes('zh')?'发链接我看看':'Send me the link');
    const card=page.locator('.chat-share-card');
    const metadata=await page.evaluate(()=>StillwaterForumData.find(p=>p.id==='job'));
    await expect(card).toHaveAttribute('href','#forum?topic=job');
    await expect(card.locator('strong')).toHaveText(metadata.title[entry.includes('zh')?0:1]);
    await expect(card).toContainText(metadata.user[0]);await expect(card).toContainText(metadata.at);
    await card.click();await expect(page).toHaveURL(/#forum\?topic=job$/);
    await expect(page.locator('.bbs-post h1')).toHaveText(metadata.title[entry.includes('zh')?0:1]);
    expect((await saved(page)).openedForum).toBe(true);
    await page.locator('.forum-recruit-link').click();await expect(page.locator('#archive-job')).toContainText('R-4829');
    await page.locator('[data-case-action=sample]').click();await expect(page.locator('#reservation-search')).toBeVisible();
    expect(external).toEqual([]);
  });
}
test('a silent player receives the forum card before the conversation ends and messages do not repeat',async({page})=>{
  await open(page);await page.clock.runFor(115000);
  await expect(page.locator('.chat-share-card')).toHaveCount(1);
  const mid=await saved(page);expect(mid.cursor).toBeLessThan(54);
  await page.clock.runFor(125000);
  const complete=await saved(page);expect(complete.cursor).toBe(54);expect(complete.messages).toHaveLength(54);
  await page.clock.runFor(120000);expect((await saved(page)).messages).toHaveLength(54);
  await expect(page.locator('.chat-message-self')).toHaveCount(0);
  expect(complete.messages.every(m=>m.kind==='script')).toBe(true);
});
test('Enter, Shift+Enter, IME, literal HTML and local drafts work without sending data to a service',async({page})=>{
  await open(page);const input=page.locator('#chat-input');
  await input.fill('第一行');await input.press('Shift+Enter');await input.press('a');
  await expect(input).toHaveValue('第一行\na');
  await input.dispatchEvent('keydown',{key:'Enter',isComposing:true});await expect(page.locator('.chat-message-self')).toHaveCount(0);
  await input.press('Enter');await expect(page.locator('.chat-message-self .chat-bubble')).toHaveText('第一行\na');
  const literal='<img src=x onerror="window.chatInjected=true">';await send(page,literal);
  await expect(page.locator('.chat-message-self .chat-bubble').last()).toHaveText(literal);
  await expect(page.locator('.chat-bubble img')).toHaveCount(0);expect(await page.evaluate(()=>window.chatInjected)).toBeUndefined();
  await input.fill('草稿还没发');await page.clock.runFor(200);await page.reload();await expect(input).toHaveValue('草稿还没发');
  await input.fill('x'.repeat(700));expect((await input.inputValue()).length).toBe(600);
});
test('returning, reloading and switching languages preserve chat and never restart the conversation',async({page})=>{
  await open(page);await send(page,'哈哈哈哈');await send(page,'发链接');
  const before=await saved(page);await page.locator('.chat-share-card').click();
  await page.locator('footer a[href="#chat"]').click();
  await expect(page.locator('.chat-share-card')).toHaveCount(1);expect((await saved(page)).messages).toEqual(before.messages);
  await page.locator('#chat-input').fill('想一下再发');await page.clock.runFor(200);
  await page.locator('[data-case-language]').click();await expect(page).toHaveURL(/index.html#chat$/);
  await expect(page.locator('#chat-input')).toHaveValue('想一下再发');
  expect((await saved(page)).cursor).toBe(before.cursor);
  await page.goto('/index.html');await expect(page).toHaveURL(/#chat$/);
  await expect(page.locator('.chat-share-card')).toHaveCount(1);
});
test('reading older messages still receives the forum card; hidden tabs, dialogs and other routes pause time',async({page})=>{
  await open(page);await page.clock.runFor(30000);
  await page.locator('.chat-messages').evaluate(el=>{el.scrollTop=0;el.dispatchEvent(new Event('scroll'));});
  const top=await page.locator('.chat-messages').evaluate(el=>el.scrollTop);
  await page.clock.runFor(100000);expect((await saved(page)).shared).toBe(true);
  expect(await page.locator('.chat-messages').evaluate(el=>el.scrollTop)).toBe(top);
  await expect(page.locator('[data-chat-action=latest]')).toBeVisible();
  const cursor=(await saved(page)).cursor;
  await page.locator('[data-case-action=instructions]').click();await page.clock.runFor(30000);
  expect((await saved(page)).cursor).toBe(cursor);await page.locator('[data-welcome=enter]').click();
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await page.clock.runFor(30000);expect((await saved(page)).cursor).toBe(cursor);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await page.goto('/index-zh.html#hotel');await page.clock.runFor(30000);expect((await saved(page)).cursor).toBe(cursor);
});
for(const entry of ['index-zh.html','index.html']) {
  test(`${entry}: 375px messenger has a single-pane list, usable composer and mobile settings`,async({page})=>{
    await open(page,entry,375);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(page.locator('.chat-contact-pane')).toBeHidden();
    await expect(page.locator('#chat-input')).toBeInViewport();
    await page.locator('.chat-mobile-back').click();await expect(page.locator('.chat-contact-pane')).toBeVisible();
    await page.locator('[data-chat-room=lunch]').click();await expect(page.locator('#chat-title')).not.toHaveText(/这周|Early nights/);
    await page.locator('.chat-mobile-back').click();await page.locator('[data-chat-room=group]').click();
    await send(page,entry.includes('zh')?'发链接':'Send the link');await expect(page.locator('.chat-share-card')).toBeVisible();
    await page.locator('[data-chat-action=members]').click();await page.locator('.chat-menu-actions [data-chat-action=instructions]').click();
    await expect(page.locator('#case-welcome')).toBeVisible();await page.locator('[data-welcome=enter]').click();
    await expect(page.locator('#chat-input')).toBeInViewport();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
test('existing no-hash case progress and explicit deep links are not replaced by the new opening',async({page})=>{
  await page.addInitScript(()=>{
    if(sessionStorage.getItem('old-chat-case'))return;sessionStorage.setItem('old-chat-case','1');
    localStorage.setItem('stillwater-case:v2',JSON.stringify({schema:2,evidence:['C1','C2','C3'],drafts:{reservation:'R-4829'}}));
    localStorage.setItem('stillwater-prologue:v1',JSON.stringify({schema:1,entered:true,lastRoute:'rooms'}));
  });
  await page.goto('/index-zh.html');await expect(page).toHaveURL(/#rooms$/);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-case:v2')).evidence)).toEqual(['C1','C2','C3']);
  for(const route of ['careers','hotel','review','forum']){await page.goto('/index-zh.html#'+route);await expect(page).toHaveURL(new RegExp('#'+route+'$'));}
});
test('the mobile composer follows the visible viewport when a software keyboard reduces it',async({page})=>{
  await open(page,'index-zh.html',375);
  await page.evaluate(()=>{Object.defineProperty(window.visualViewport,'height',{configurable:true,value:480});window.visualViewport.dispatchEvent(new Event('resize'));});
  const composer=await page.locator('.chat-composer').boundingBox();
  expect(composer.y+composer.height).toBeLessThanOrEqual(480);
  await expect(page.locator('#chat-input')).toBeVisible();
  await send(page,'发链接');await expect(page.locator('.chat-share-card')).toHaveCount(1);
  await page.evaluate(()=>{delete window.visualViewport.height;window.visualViewport.dispatchEvent(new Event('resize'));});
  expect((await page.locator('.chat-app').boundingBox()).height).toBe(900);
});
test('confirmed restart clears chat together with the new case, preserving ad and archived saves',async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem('stillwater-hotel:v2','old visitor');localStorage.setItem('stillwater-ads:v1',JSON.stringify({schema:1,pinnedIds:['pet'],collapsedPinnedIds:[]}));});
  await open(page);await send(page,'发链接');
  await page.locator('[data-case-action=save-settings]').click();await page.locator('[data-comfort=reset-prompt]').click();
  await page.locator('[data-comfort=reset-cancel]').click();expect((await saved(page)).shared).toBe(true);
  await page.locator('[data-comfort=reset-prompt]').click();await page.locator('[data-comfort=reset-confirm]').click();
  await expect(page).toHaveURL(/#chat$/);await expect(page.locator('#case-welcome')).toBeVisible();
  expect((await saved(page)).messages).toHaveLength(1);expect((await saved(page)).shared).toBe(false);
  expect(await page.evaluate(()=>localStorage.getItem('stillwater-hotel:v2'))).toBe('old visitor');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-ads:v1')).pinnedIds)).toEqual(['pet']);
});
test('four sourced offline photo avatars stay with the same speakers and expose author and license credits',async({page})=>{
 await open(page);
 const photos=await page.evaluate(()=>StillwaterChatPhotos);
 expect(photos).toHaveLength(4);
 for(const photo of photos) {
  const image=page.locator(`.chat-avatar[src="${photo.file}"]`).first();
  await expect.poll(()=>image.evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
  expect(photo.source).toMatch(/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
 }
 await page.locator('.chat-heading [data-chat-action=members]').click();
 await page.locator('.chat-avatar-credits summary').click();
 await expect(page.locator('.chat-avatar-credits p')).toHaveCount(4);
 await expect(page.locator('.chat-avatar-credits')).toContainText('CC BY');
});
