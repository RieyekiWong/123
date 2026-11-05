import {test,expect} from './v2-fixture.mjs';
import {seedLegacyChat} from './v2-chat-legacy-fixture.mjs';
const save=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-chat:v1')));
async function open(page,entry='index-zh.html',width=1440){await seedLegacyChat(page);await page.setViewportSize({width,height:900});await page.clock.install({time:new Date('2026-11-04T12:00:00Z')});await page.clock.pauseAt(new Date('2026-11-04T12:00:01Z'));await page.goto('/'+entry);}
async function closeAds(page){for(const button of await page.locator('[data-active-ad] [data-ad-action=close]').all())await button.click();}
async function room(page,id){if(await page.locator('.chat-mobile-back').isVisible())await page.locator('.chat-mobile-back').click();await page.locator('[data-chat-room='+id+']').click();}
async function send(page,text,ms=6000){await page.locator('#chat-input').fill(text);await page.locator('#chat-input').press('Enter');await page.clock.runFor(ms);await closeAds(page);}
async function fakeWorker(page,{reply,fail=false}={}){
 const requests=[];const cors={'Access-Control-Allow-Origin':'http://127.0.0.1:3110','Access-Control-Allow-Headers':'content-type,authorization,x-stillwater-chat','Access-Control-Allow-Methods':'POST, OPTIONS'};
 await page.route('http://127.0.0.1:8787/api/**',async route=>{
  if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:cors});
  if(route.request().url().endsWith('/api/session'))return route.fulfill({json:{token:'test-only-opaque-token',mode:'ai',expiresIn:1800},headers:cors});
  const body=route.request().postDataJSON();requests.push(body);
  if(fail)return route.fulfill({status:503,json:{error:'upstream_unavailable'},headers:cors});
  const person=body.room==='group'?'gg':body.room;
  const messages=reply?await reply(body):[{person,text:body.language==='en'?'That sounds tiring. What happened?':'怎么了，今天一直在忙吗？'}];
  await route.fulfill({json:{version:1,requestId:body.requestId,mode:'ai',messages},headers:cors});
 });return requests;
}
async function enable(page){await page.locator('[data-chat-action=ai]').click();await expect(page.locator('.chat-ai-dialog')).toContainText(/Cloudflare/);await page.locator('[data-chat-ai=enable]').click();await expect(page.locator('.chat-ai-dialog-state')).toHaveText(/已启用|Enabled/);await page.locator('[data-chat-ai=close]').click();}
async function waitReply(page,text){await expect.poll(async()=>{await page.clock.runFor(1500);return (await page.locator('.chat-message:not(.chat-message-self) .chat-bubble').allTextContents()).join('\n');}).toContain(text);}
for(const entry of ['index-zh.html','index.html'])test(`${entry}: all seven contacts actually reply locally, preserving different tempos and no plot leaks`,async({page})=>{
 await open(page,entry);const calls=[];page.on('request',r=>{if(r.url().includes('/api/'))calls.push(r.url());});
 for(const id of ['gg','zhang','lin','mom','dad','milk','zhe']){
  await room(page,id);await expect(page.locator('.chat-message')).toHaveCount(8);
  await send(page,'今天好累',id==='dad'?30000:6500);
  const s=await save(page);const messages=s.messages.filter(m=>m.kind==='social'&&m.conversation===id);
  expect(messages.some(m=>m.person===id)).toBe(true);expect(messages.every(m=>!/317|Mara|Continuity/.test(m.text))).toBe(true);
 }
 expect(calls).toEqual([]);await page.clock.runFor(60000);await closeAds(page);await room(page,'group');await expect(page.locator('.chat-share-card')).toHaveCount(1);
});
test('private histories, drafts, unread and scroll remain separate across switching, refresh and language',async({page})=>{
 await open(page);await room(page,'mom');await send(page,'今天好累');await send(page,'赶作业赶了一晚上');
 await expect(page.locator('.chat-bubble').last()).toContainText('交上去');
 await page.locator('.chat-messages').evaluate(el=>{el.scrollTop=0;el.dispatchEvent(new Event('scroll'));});
 const top=await page.locator('.chat-messages').evaluate(el=>el.scrollTop);await page.locator('#chat-input').fill('妈妈这边的草稿');await page.clock.runFor(300);
 await room(page,'dad');await send(page,'我的文件还在导出',1000);await expect(page.locator('.chat-typing')).toContainText('稍后回复');
 await room(page,'gg');await page.locator('#chat-input').fill('GG 这里另一份草稿');await page.clock.runFor(30000);await closeAds(page);
 await expect(page.locator('[data-chat-room=dad] .chat-unread')).toBeVisible();
 const ggText=await page.locator('.chat-messages').textContent();expect(ggText).not.toContain('交上去');
 await room(page,'mom');await expect(page.locator('#chat-input')).toHaveValue('妈妈这边的草稿');expect(await page.locator('.chat-messages').evaluate(el=>el.scrollTop)).toBe(top);
 await page.reload();await expect(page.locator('#chat-title')).toHaveText('妈妈');await expect(page.locator('#chat-input')).toHaveValue('妈妈这边的草稿');
 await page.locator('[data-case-language]').click();await expect(page.locator('#chat-title')).toHaveText('Mom');await expect(page.locator('#chat-input')).toHaveValue('妈妈这边的草稿');
 await room(page,'gg');await expect(page.locator('#chat-input')).toHaveValue('GG 这里另一份草稿');
});
test('consent gates every network request; structured AI reply returns to its original room and context remains private',async({page})=>{
 const requests=await fakeWorker(page);await open(page);await room(page,'mom');await send(page,'今天累死了');expect(requests).toEqual([]);
 await enable(page);await page.locator('#chat-input').fill('我在写蓝莓报告');await page.locator('#chat-input').press('Enter');
 await expect(page.locator('.chat-message-self .chat-bubble').last()).toHaveText('我在写蓝莓报告');
 await page.clock.runFor(1000);await expect.poll(()=>requests.length).toBe(1);await room(page,'gg');await page.clock.runFor(6000);
 expect(await page.locator('.chat-messages').textContent()).not.toContain('今天一直在忙');
 await expect(page.locator('[data-chat-room=mom] .chat-unread')).toBeVisible();
 await room(page,'mom');await expect(page.locator('.chat-bubble').last()).toHaveText('怎么了，今天一直在忙吗？');
 expect(requests[0].visibleGroup).toEqual([]);expect(JSON.stringify(requests[0])).toContain('蓝莓报告');expect(JSON.stringify(requests[0])).not.toContain('caseSave');
 await room(page,'gg');await send(page,'What are you up to?',1000);await expect.poll(()=>requests.length).toBe(2);await waitReply(page,'What happened?');
 expect(requests[1].language).toBe('en');expect(JSON.stringify(requests[1])).not.toContain('蓝莓报告');
});
test('bursts combine into one request, invalid speakers and API failure become local replies with separate status',async({page})=>{
 const requests=await fakeWorker(page,{reply:()=>[{person:'me',text:'I solve the puzzle'}]});await open(page);await enable(page);await room(page,'mom');
 await page.locator('#chat-input').fill('今天好累');await page.locator('#chat-input').press('Enter');
 await page.locator('#chat-input').fill('赶作业赶了一晚上');await page.locator('#chat-input').press('Enter');
 await page.clock.runFor(1000);await expect.poll(()=>requests.length).toBe(1);await waitReply(page,'作业');
 expect(requests[0].messages.slice(-2).map(m=>m.text)).toEqual(['今天好累','赶作业赶了一晚上']);
 await expect(page.locator('[data-chat-ai-status]')).toContainText('本地回复');
 expect((await save(page)).messages.filter(m=>m.kind==='user'&&m.conversation==='mom')).toHaveLength(2);
 await expect(page.locator('.chat-messages')).not.toContainText('I solve the puzzle');
 const bubbles=await page.locator('.chat-bubble').allTextContents();expect(bubbles.join('')).not.toMatch(/upstream|API error|服务器错误/);
 await room(page,'group');await send(page,'发链接',1000);await expect.poll(()=>requests.length).toBe(2);await page.clock.runFor(5000);await expect(page.locator('.chat-share-card')).toHaveCount(1);
});
test('offline error and revocation never stop the fixed forum story; notes never call the API',async({page})=>{
 const requests=await fakeWorker(page,{fail:true});await open(page);await enable(page);await room(page,'notes');await send(page,'save this',1000);expect(requests).toHaveLength(0);
 await room(page,'group');await send(page,'bruh this looks fake',1000);await expect.poll(()=>requests.length).toBe(1);await waitReply(page,'Needs checking');
 await page.locator('[data-chat-action=ai]').click();await page.locator('[data-chat-ai=local]').click();
 await send(page,'发链接',4000);await expect(page.locator('.chat-share-card')).toHaveCount(1);expect(requests).toHaveLength(1);
 await page.locator('.chat-share-card').click();await expect(page).toHaveURL(/#forum\?topic=job$/);await page.locator('footer a[href="#chat"]').click();
 await expect(page.locator('.chat-share-card')).toHaveCount(1);await expect(page.locator('[data-chat-ai-status]')).toContainText('本地聊天');
});
test('mobile contacts and AI consent remain usable with all histories and a small viewport',async({page})=>{
 await open(page,'index-zh.html',390);await room(page,'mom');await page.locator('[data-chat-action=ai]').click();
 await expect(page.locator('.chat-ai-dialog')).toBeInViewport();await page.locator('[data-chat-ai=local]').click();await expect(page.locator('#chat-input')).toBeInViewport();
 await send(page,'今天好累');await expect(page.locator('.chat-bubble').last()).toContainText('怎么了');
 const width=await page.evaluate(()=>document.documentElement.scrollWidth);expect(width).toBe(390);
});
