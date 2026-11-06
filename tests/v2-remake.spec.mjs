import {test,expect} from './v2-fixture.mjs';

const KEY='stillwater-story:2.0:prototype:v1',CHAT='stillwater-chat:2.0:prototype:v1';
const saved=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
async function open(page,{entry='index-zh.html',width=1440,route='chat'}={}){
  await page.setViewportSize({width,height:950});
  await page.clock.install({time:new Date('2026-11-06T12:00:00Z')});await page.clock.pauseAt(new Date('2026-11-06T12:00:01Z'));
  await page.goto('/'+entry+'?edition=2.0#sw2/'+route);await expect(page.locator('#sw2-chrome')).toBeVisible();
}
async function muteAds(page){await page.locator('#sw2-chrome [data-case-action=settings]').click();await page.locator('#sw2-settings-form [name=popupAds]').uncheck();await page.locator('#sw2-settings-form button[type=submit]').click();}
async function room(page,id){if(await page.locator('.chat-mobile-back').isVisible())await page.locator('.chat-mobile-back').click();await page.locator(`[data-chat-room=${id}]`).click();}
async function sources(page,id){
  const area=page.locator(`[data-sw2-puzzle=${id}]`);await expect(area).toBeVisible();const ids=await area.locator('[data-source]').evaluateAll(nodes=>nodes.map(n=>n.dataset.source));
  for(const key of ids){await area.locator(`[data-source=${key}]`).click();await expect(page.locator('#sw2-source')).toBeVisible();await page.locator('[data-sw2-action=close-source]').click();await expect(page.locator('#sw2-source')).toHaveCount(0);}
}
async function checkpoint(page,id,next){
  await sources(page,id);await page.locator(`[data-sw2-puzzle=${id}] [data-sw2-action=checkpoint]`).click();await expect(page.locator('#sw2-transition')).toBeVisible();
  await page.locator('[data-sw2-action=close-transition]').click();await expect.poll(()=>new URL(page.url()).hash).toBe('#sw2/'+next);
}
async function toP4(page){
  await checkpoint(page,'P1','hotel');await checkpoint(page,'P2','hotel/archive-project');await page.locator('[data-sw2-action=project]').click();await checkpoint(page,'P3','phase/research');
}

for(const [entry,width,choice,ending] of [['index-zh.html',1440,'accepted','released'],['index.html',1440,'ignored','unverified'],['index-zh.html',390,'ignored','auto-close']]){
  test(`2.0 prototype follows the actual UI through eight chapters / ${entry} / ${width} / ${ending}`,async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));await open(page,{entry,width});await muteAds(page);
    expect(await page.evaluate(()=>typeof StillwaterCaseState)).toBe('undefined');await page.locator('#chat-input').fill(entry.includes('zh')?'我还在写作业':'Still working on my assignment.');await page.locator('#chat-input').press('Enter');
    await page.clock.runFor(17000);await room(page,'gg');await page.locator('.chat-share-card').click();await expect(page).toHaveURL(/#sw2\/forum\?topic=hotel-return$/);
    await page.locator('[data-sw2-action=checkpoint]').click();await expect(page.locator('[data-sw2-feedback]')).not.toBeEmpty();expect((await saved(page)).results.P1).toBeUndefined();
    await toP4(page);await checkpoint(page,'P4','chat?request=1');await page.locator(`.chat-story-profile [data-choice=${choice}]`).click();
    if(choice==='accepted'){await expect(page).toHaveURL(/#sw2\/chat\?room=wcr_new$/);await expect(page.locator('.chat-messages')).toContainText(entry.includes('zh')?'对你来说是关了':'It closed for you');await page.locator('#sw2-chrome .sw2-next').click();}
    await expect(page).toHaveURL(/#sw2\/heritage\/photos$/);await checkpoint(page,'P5','heritage/cctv');await checkpoint(page,'P6','heritage/b3');
    await sources(page,'P7');await page.locator('[data-sw2-action=checkpoint]').click();await expect(page.locator('#sw2-transition')).toContainText('Nora Bell');
    const before=page.url();await page.clock.runFor(60000);expect(page.url()).toBe(before);await page.reload();await expect(page.locator('#sw2-transition')).toBeVisible();await page.keyboard.press('Escape');await expect(page).toHaveURL(/#sw2\/heritage\/final-trace$/);
    await sources(page,'P8');await page.locator(`[data-ending=${ending}]`).click();await expect(page).toHaveURL(/#sw2\/ending$/);await expect(page.locator('[data-ending-complete]')).toContainText('GAME OVER');
    await page.reload();const end=await saved(page);expect(end.lastEnding).toBe(ending);expect(end.chapter).toBe(7);expect(end.prototype).toBe(true);
    expect(await page.evaluate(()=>localStorage.getItem('stillwater-story:2.0:v1'))).toBeNull();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
  });
}

test('notification opens the right room; real DOM, notes, focus and refresh return to the exact source page',async({page})=>{
  await open(page,{route:'forum?topic=hotel-return'});await muteAds(page);
  await page.locator('#sw2-note-P1').fill('不要丢掉这份未提交的想法');await page.locator('#content').evaluate(el=>el.dataset.keptDom='yes');
  await page.evaluate(()=>scrollTo(0,220));await page.clock.runFor(41000);await expect(page.locator('.messenger-notice')).toBeVisible();
  const target=await page.locator('.messenger-notice-open').getAttribute('data-room');await page.locator('.messenger-notice-open').click();await expect(page).toHaveURL(new RegExp('#sw2/chat\\?room='+target+'$'));
  await expect(page.locator('.chat-browser-bar [data-messenger-action=return]')).toBeVisible();await page.locator('[data-messenger-action=return]').click();await expect(page).toHaveURL(/#sw2\/forum\?topic=hotel-return$/);
  await expect(page.locator('#content')).toHaveAttribute('data-kept-dom','yes');await expect(page.locator('#sw2-note-P1')).toHaveValue('不要丢掉这份未提交的想法');
  await page.locator('[data-messenger-action=launch]').click();await room(page,'mom');await page.locator('#chat-input').fill('妈妈这里的草稿');await page.clock.runFor(300);await page.reload();
  await expect(page.locator('#chat-input')).toHaveValue('妈妈这里的草稿');await page.locator('[data-messenger-action=return]').click();await expect(page.locator('#sw2-note-P1')).toHaveValue('不要丢掉这份未提交的想法');
  expect((await saved(page)).results.P1).toBeUndefined();
});

test('source reading and transition persist without advancing on a timer, and re-opening a completed page does not replay',async({page})=>{
  await open(page,{route:'forum'});await muteAds(page);await page.locator('[data-source=closure]').click();await page.reload();await expect(page.locator('#sw2-source')).toContainText('2007');await page.keyboard.press('Escape');
  await sources(page,'P1');await page.locator('[data-sw2-action=checkpoint]').click();await page.clock.runFor(100000);await expect(page).toHaveURL(/#sw2\/forum$/);await page.reload();await expect(page.locator('#sw2-transition')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page).toHaveURL(/#sw2\/hotel$/);await page.goBack();await expect(page).toHaveURL(/#sw2\/forum$/);await expect(page.locator('#sw2-transition')).toHaveCount(0);
  await page.locator('[data-sw2-puzzle=P1] a').click();await expect(page).toHaveURL(/#sw2\/hotel$/);
});

test('legacy journals stay byte-for-byte intact; daily chats import without fake-account spoilers',async({page})=>{
  const oldCase=JSON.stringify({schema:2,evidence:['C1','C2','C3'],preferences:{popupAds:false,skipScares:true}}),oldChat=JSON.stringify({schema:1,counter:5,messages:[{id:'m2',kind:'user',text:'蓝莓作业一直没写完',conversation:'mom',at:1793698801000},{id:'m3',kind:'script',key:'s31',at:1793698802000}],story:{request:'accepted',delivered:['v13.end-released']},ui:{conversation:'mom',drafts:{mom:'原来留的草稿'}}});
  await page.addInitScript(({oldCase,oldChat})=>{if(!localStorage.getItem('seeded-legacy')){localStorage.setItem('stillwater-case:v2',oldCase);localStorage.setItem('stillwater-chat:v1',oldChat);localStorage.setItem('stillwater-ads:v1',JSON.stringify({schema:1,pinnedIds:['pet'],collapsedPinnedIds:[]}));localStorage.setItem('seeded-legacy','1');}},{oldCase,oldChat});
  await open(page);await expect(page.locator('#chat-title')).toHaveText('妈妈');await expect(page.locator('#chat-input')).toHaveValue('原来留的草稿');await expect(page.locator('.chat-messages')).toContainText('蓝莓作业');
  await expect(page.locator('[data-chat-room=wcr_new]')).toHaveCount(0);expect(await page.evaluate(()=>localStorage.getItem('stillwater-case:v2'))).toBe(oldCase);expect(await page.evaluate(()=>localStorage.getItem('stillwater-chat:v1'))).toBe(oldChat);
  const journal=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),CHAT);expect(journal.messages.some(m=>m.key==='s31'||m.key?.startsWith('v13.'))).toBe(false);
  await page.locator('[data-case-language]').click();await expect(page.locator('#chat-input')).toHaveValue('原来留的草稿');await expect(page).toHaveURL(/index\.html\?edition=2\.0#sw2\/chat$/);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-ads:v1')).pinnedIds)).toContain('pet');
});

test('ordinary ads overlay calm pages, settings opt-out persists, and the horror chain removes them even in WeChat',async({page})=>{
  await open(page);await page.clock.runFor(7000);await expect(page.locator('[data-active-ad]')).toHaveCount(1);await expect(page.locator('[data-active-ad]')).toHaveAttribute('data-slot','bottom-right');
  const rectangles=await page.evaluate(()=>({ad:document.querySelector('[data-active-ad]').getBoundingClientRect().bottom,composer:document.querySelector('.chat-composer').getBoundingClientRect().top}));expect(rectangles.ad).toBeLessThanOrEqual(rectangles.composer);
  await muteAds(page);await expect(page.locator('[data-active-ad]')).toHaveCount(0);await page.reload();await page.clock.runFor(20000);await expect(page.locator('[data-active-ad]')).toHaveCount(0);
  await page.locator('#sw2-chrome [data-case-action=settings]').click();await page.locator('[name=popupAds]').check();await page.locator('#sw2-settings-form button[type=submit]').click();await room(page,'gg');await page.locator('.chat-share-card').click();await toP4(page);
  await page.clock.runFor(20000);await expect(page.locator('[data-active-ad]')).toHaveCount(0);await checkpoint(page,'P4','chat?request=1');await page.clock.runFor(20000);await expect(page.locator('[data-active-ad]')).toHaveCount(0);await expect(page.locator('.messenger-notice')).toHaveCount(0);
});

test('restarting only the prototype keeps daily chats, AI consent, the original save and saved ads',async({page})=>{
  await page.addInitScript(()=>{
    if(localStorage.getItem('seeded-reset'))return;
    localStorage.setItem('seeded-reset','1');localStorage.setItem('stillwater-case:v2','{"schema":2,"evidence":[],"preferences":{"popupAds":false}}');
    localStorage.setItem('stillwater-chat-ai:v1',JSON.stringify({version:1,enabled:true,endpoint:'http://127.0.0.1:8787/api/chat'}));
    localStorage.setItem('stillwater-ads:v1',JSON.stringify({schema:1,pinnedIds:['pet'],collapsedPinnedIds:[]}));
  });
  await open(page);await room(page,'mom');await page.locator('#chat-input').fill('日常聊天别丢');await page.locator('#chat-input').press('Enter');await page.clock.runFor(17000);await room(page,'gg');await page.locator('.chat-share-card').click();await checkpoint(page,'P1','hotel');
  const legacy=await page.evaluate(()=>localStorage.getItem('stillwater-case:v2')),consent=await page.evaluate(()=>localStorage.getItem('stillwater-chat-ai:v1'));
  await page.locator('#sw2-chrome [data-case-action=settings]').click();page.once('dialog',dialog=>dialog.accept());await page.locator('[data-sw2-action=restart]').click();await expect(page).toHaveURL(/#sw2\/chat$/);await expect(page.locator('#chat-input')).toBeVisible();
  expect(Object.keys((await saved(page)).results)).toEqual([]);await room(page,'mom');await expect(page.locator('.chat-messages')).toContainText('日常聊天别丢');
  expect(await page.evaluate(()=>localStorage.getItem('stillwater-case:v2'))).toBe(legacy);expect(await page.evaluate(()=>localStorage.getItem('stillwater-chat-ai:v1'))).toBe(consent);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-ads:v1')).pinnedIds)).toContain('pet');
});

test('structured AI still replies in its own room with explicit consent, and failure leaves the forum story available',async({page})=>{
  const requests=[],headers={'Access-Control-Allow-Origin':'http://127.0.0.1:3110','Access-Control-Allow-Headers':'content-type,authorization,x-stillwater-chat','Access-Control-Allow-Methods':'POST, OPTIONS'};let fail=false;
  await page.route('http://127.0.0.1:8787/api/**',async route=>{
    if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers});
    if(route.request().url().endsWith('/api/session'))return route.fulfill({headers,json:{token:'prototype-test-token',mode:'ai',expiresIn:1800}});
    const body=route.request().postDataJSON();requests.push(body);
    if(fail)return route.fulfill({status:503,headers,json:{error:'unavailable'}});
    return route.fulfill({headers,json:{version:1,requestId:body.requestId,mode:'ai',messages:[{person:body.room,text:body.language==='en'?'Did the export finish?':'今天一直在赶那个作业吗？'}]}});
  });
  await open(page);await muteAds(page);await room(page,'mom');await page.locator('#chat-input').fill('今天好累 蓝莓作业写不完');await page.locator('#chat-input').press('Enter');await page.clock.runFor(7000);expect(requests).toHaveLength(0);
  await page.locator('[data-chat-action=ai]').click();await page.locator('[data-chat-ai=enable]').click();await expect(page.locator('.chat-ai-dialog-state')).toContainText('已启用');await page.locator('[data-chat-ai=close]').click();
  await page.locator('#chat-input').fill('还没写完');await page.locator('#chat-input').press('Enter');await page.clock.runFor(1000);await expect.poll(()=>requests.length).toBe(1);await room(page,'gg');await page.clock.runFor(7000);await room(page,'mom');await expect(page.locator('.chat-bubble').last()).toHaveText('今天一直在赶那个作业吗？');expect(JSON.stringify(requests[0])).toContain('蓝莓');
  await room(page,'lin');await page.locator('#chat-input').fill('The file is still exporting.');await page.locator('#chat-input').press('Enter');await page.clock.runFor(1000);await expect.poll(()=>requests.length).toBe(2);await page.clock.runFor(7000);expect(requests[1].language).toBe('en');expect(JSON.stringify(requests[1])).not.toContain('蓝莓');await expect(page.locator('.chat-bubble').last()).toHaveText('Did the export finish?');
  fail=true;await page.locator('#chat-input').fill('软件又崩了');await page.locator('#chat-input').press('Enter');await page.clock.runFor(1000);await expect.poll(()=>requests.length).toBe(3);await page.clock.runFor(7000);await expect(page.locator('[data-chat-ai-status]')).toContainText('本地回复');
  await room(page,'gg');await page.locator('.chat-share-card').click();await expect(page).toHaveURL(/#sw2\/forum/);expect((await saved(page)).results.P1).toBeUndefined();
});

test('corrupt prototype storage is retained, and the edition chooser runs only one app',async({page})=>{
  await page.addInitScript(key=>{localStorage.setItem(key,'{unreadable');},KEY);await open(page);await expect(page.locator('#sw2-storage-alert')).toBeVisible();expect(await page.evaluate(key=>localStorage.getItem(key),KEY)).toBe('{unreadable');
  await page.goto('/index-zh.html?edition=choose');await expect(page.locator('[data-edition=prototype]')).toBeVisible();expect(await page.evaluate(()=>typeof StillwaterChatModel)).toBe('undefined');
  await page.locator('[data-edition=current]').click();await expect(page.locator('#chat-input')).toBeVisible();expect(await page.evaluate(()=>typeof Stillwater2Progress)).toBe('undefined');expect(await page.evaluate(()=>typeof StillwaterCaseState)).toBe('object');
});

test('mobile ads leave the composer clear and keyboard skip keeps the chat route',async({page})=>{
  await open(page,{width:390});await page.clock.runFor(7000);await expect(page.locator('[data-active-ad]')).toHaveCount(1);
  const position=await page.evaluate(()=>({bottom:document.querySelector('[data-active-ad]').getBoundingClientRect().bottom,composer:document.querySelector('.chat-composer').getBoundingClientRect().top}));expect(position.bottom).toBeLessThanOrEqual(position.composer);
  await page.locator('[data-active-ad] [data-ad-action=close]').focus();await page.keyboard.press('Enter');await expect(page.locator('#chat-input')).toBeFocused();
  await page.locator('.skip').focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/#sw2\/chat$/);await expect(page.locator('#content')).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
});
