import {test,expect} from './v2-fixture.mjs';
const stored=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-chat:v1')));
async function open(page,entry='index-zh.html',width=1440){
  await page.setViewportSize({width,height:900});
  await page.clock.install({time:new Date('2026-11-05T14:00:00Z')});
  await page.clock.pauseAt(new Date('2026-11-05T14:00:01Z'));
  await page.goto('/'+entry);
}
async function closeAds(page){for(const button of await page.locator('[data-active-ad] [data-ad-action=close]').all())await button.click();}
async function room(page,id){if(await page.locator('.chat-mobile-back').isVisible())await page.locator('.chat-mobile-back').click();await page.locator('.chat-contact-list [data-chat-room='+id+']').click();}
for(const entry of ['index-zh.html','index.html'])for(const width of [375,1440]){
  test(`V1.2 opening: a real memory, GG private discovery, then the existing post / ${entry} / ${width}`,async({page})=>{
    const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:3110/'))external.push(r.url());});
    await open(page,entry,width);
    await expect(page).toHaveURL(/#chat$/);await expect(page.locator('.chat-message-self')).toHaveCount(0);
    await expect(page.locator('.chat-contact-list [data-chat-room=wcr_old]')).toHaveCount(0);
    await page.clock.runFor(35000);await closeAds(page);
    await expect(page.locator('[data-chat-photo=friends]')).toBeVisible();
    await expect.poll(()=>page.locator('[data-chat-photo=friends] img').evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
    await page.clock.runFor(10000);await closeAds(page);
    await expect(page.locator('.chat-opening-invite')).toBeVisible();
    await page.locator('[data-chat-open-private=gg]').click();await expect(page.locator('#chat-title')).toHaveText('GGbond');
    await page.clock.runFor(50000);await closeAds(page);
    await expect(page.locator('.chat-share-card')).toHaveCount(1);await expect(page.locator('.chat-share-card')).toHaveAttribute('href','#forum?topic=job');
    await expect(page.locator('.chat-messages')).toContainText('2023');
    await expect(page.locator('.chat-messages')).toContainText(entry.includes('zh')?'银松镇':'Silverpine');
    const s=await stored(page);expect(s.messages.filter(m=>m.key==='v12.discovery.card').map(m=>m.conversation)).toEqual(['gg']);expect(s.messages.some(m=>m.key==='s31')).toBe(false);
    await page.locator('.chat-share-card').click();await expect(page).toHaveURL(/#forum\?topic=job$/);await expect(page.locator('.bbs-post h1')).toBeVisible();
    expect(errors).toEqual([]);expect(external).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
for(const width of [375,1440])test(`historical messages and life photos remain readable without resurrecting the old account / ${width}`,async({page})=>{
  await open(page,'index-zh.html',width);await page.clock.runFor(25000);await closeAds(page);await room(page,'wcr_old');
  await expect(page.locator('#chat-input')).toBeDisabled();await expect(page.locator('.chat-messages')).toContainText('2021-09-18');
  await expect(page.locator('.chat-messages')).toContainText('2022-05-14');await expect(page.locator('.chat-messages')).toContainText('2023-10-17 18:12');
  await expect(page.locator('.chat-messages')).not.toContainText('18:26');await expect(page.locator('.chat-messages')).not.toContainText('2023-10-21');
  await page.locator('.chat-friend-profile [data-chat-photo=old]').click();await expect(page.locator('.chat-photo-dialog')).toBeVisible();
  await expect(page.locator('.chat-photo-dialog nav button')).toHaveCount(5);
  await page.locator('[data-chat-photo-select=family]').click();await expect(page.locator('.chat-photo-dialog figcaption')).toContainText('苏州');
  await expect.poll(()=>page.locator('.chat-photo-dialog figure>img').evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
  expect(await page.locator('.chat-photo-dialog figure>img').getAttribute('src')).toContain('wcr-04-family-dinner');
  await page.keyboard.press('Escape');await expect(page.locator('.chat-photo-dialog')).toHaveCount(0);await expect(page.locator('.chat-friend-profile [data-chat-photo=old]')).toBeFocused();
  const before=(await stored(page)).messages;await page.reload();expect((await stored(page)).messages).toEqual(before);await expect(page.locator('#chat-input')).toBeDisabled();
  await expect(page.locator('.chat-messages')).not.toContainText('317');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('private delivery resumes exactly once across refresh and English switch without replacing drafts',async({page})=>{
  await open(page);await page.clock.runFor(45000);await closeAds(page);await page.locator('[data-chat-open-private=gg]').click();
  await page.locator('#chat-input').fill('先别发 我要想一下');await page.clock.runFor(250);
  const before=await stored(page);expect(before.story.opening.privateCursor).toBeGreaterThan(0);expect(before.shared).toBe(false);
  await page.reload();await expect(page.locator('#chat-title')).toHaveText('GGbond');await expect(page.locator('#chat-input')).toHaveValue('先别发 我要想一下');
  expect((await stored(page)).messages).toEqual(before.messages);
  await page.locator('[data-case-language]').click();await expect(page.locator('#chat-input')).toHaveValue('先别发 我要想一下');
  await page.clock.runFor(60000);await closeAds(page);await expect(page.locator('.chat-share-card')).toHaveCount(1);
  const s=await stored(page);for(const key of await page.evaluate(()=>StillwaterChatOpening.discovery))expect(s.messages.filter(m=>m.key===key)).toHaveLength(1);
  expect(s.messages.some(m=>m.kind==='script'||m.key?.startsWith('discovery:'))).toBe(false);
});
test('a pre-V1.2 saved chat is never restarted or silently replaced with new story lines',async({page})=>{
  await page.addInitScript(()=>{
    if(localStorage.getItem('stillwater-chat:v1'))return;
    localStorage.setItem('stillwater-chat:v1',JSON.stringify({schema:1,pacing:2,cursor:54,shared:true,messages:[{id:'m1',kind:'script',key:'s31',at:1793698800000},{id:'m2',kind:'user',conversation:'mom',text:'以前保存的话',at:1793698801000}],story:{request:'none',delivered:[]},ui:{conversation:'mom',drafts:{mom:'旧草稿'}}}));
  });
  await open(page);await expect(page.locator('#chat-input')).toHaveValue('旧草稿');await expect(page.locator('.chat-messages')).toContainText('以前保存的话');
  expect((await stored(page)).story.opening.edition).toBe('legacy');await page.clock.runFor(120000);await closeAds(page);
  expect((await stored(page)).messages.some(m=>m.key?.startsWith('v12.'))).toBe(false);
  await room(page,'group');await expect(page.locator('.chat-share-card')).toHaveCount(1);
});
test('the new opening preserves consented AI transport, language, independent memory and offline fallback',async({page})=>{
  const requests=[];let unavailable=false;
  const headers={'Access-Control-Allow-Origin':'http://127.0.0.1:3110','Access-Control-Allow-Headers':'content-type,authorization,x-stillwater-chat','Access-Control-Allow-Methods':'POST, OPTIONS'};
  await page.route('http://127.0.0.1:8787/api/**',async route=>{
    if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers});
    if(route.request().url().endsWith('/api/session'))return route.fulfill({json:{token:'opening-test-session',mode:'ai',expiresIn:1800},headers});
    const body=route.request().postDataJSON();requests.push(body);
    return unavailable?route.fulfill({status:503,json:{error:'upstream_unavailable'},headers}):route.fulfill({json:{version:1,requestId:body.requestId,mode:'ai',messages:[{person:body.room,text:body.language==='en'?'Did the export finish?':'今天怎么这么累？'}]},headers});
  });
  await open(page);await room(page,'mom');await page.locator('#chat-input').fill('今天很累 在写蓝莓报告');await page.locator('#chat-input').press('Enter');await page.clock.runFor(7000);expect(requests).toEqual([]);
  await page.locator('[data-chat-action=ai]').click();await page.locator('[data-chat-ai=enable]').click();await expect(page.locator('.chat-ai-dialog-state')).toContainText('已启用');await page.locator('[data-chat-ai=close]').click();
  await page.locator('#chat-input').fill('还在赶那个报告');await page.locator('#chat-input').press('Enter');await page.clock.runFor(1000);await expect.poll(()=>requests.length).toBe(1);
  await page.clock.runFor(6000);await expect(page.locator('.chat-bubble').last()).toHaveText('今天怎么这么累？');
  expect(JSON.stringify(requests[0])).toContain('蓝莓报告');expect(requests[0].visibleGroup).toEqual([]);
  await room(page,'lin');await page.locator('#chat-input').fill('My file is still exporting.');await page.locator('#chat-input').press('Enter');await page.clock.runFor(1000);await expect.poll(()=>requests.length).toBe(2);await page.clock.runFor(7000);
  await expect(page.locator('.chat-bubble').last()).toHaveText('Did the export finish?');expect(requests[1].language).toBe('en');expect(JSON.stringify(requests[1])).not.toContain('蓝莓报告');
  unavailable=true;await page.locator('#chat-input').fill('软件又崩了');await page.locator('#chat-input').press('Enter');await page.clock.runFor(1000);await expect.poll(()=>requests.length).toBe(3);await page.clock.runFor(7000);
  await expect(page.locator('[data-chat-ai-status]')).toContainText('本地回复');await expect(page.locator('.chat-messages')).not.toContainText('upstream_unavailable');
  await page.clock.runFor(100000);await closeAds(page);expect((await stored(page)).shared).toBe(true);await room(page,'gg');await expect(page.locator('.chat-share-card')).toHaveCount(1);
});
