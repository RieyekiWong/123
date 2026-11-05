import {test,expect} from './v2-fixture.mjs';
import {toAudit,toRevisions,toReview,validateFindings,toNight,wireNight,state} from './v2-helpers.mjs';
import {navigate,storyEarly,storyFinish} from './v2-story-ui-helpers.mjs';
for(const [language,request,ending]of [['zh','accepted','released'],['en','ignored','unverified'],['zh','ignored','auto-close']]){
 test(`Wang Churen full authored route / ${language} / ${request} / ${ending}`,async({page})=>{
  test.setTimeout(150000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('stillwater-case-intro:v1',JSON.stringify({schema:1,read:true}));});
  await toAudit(page,language==='zh'?'index-zh.html':'index.html');
  await storyEarly(page,{request});
  if(request==='accepted'){
   await navigate(page,'chat?room=wcr_new');await expect(page.locator('#chat-title')).toContainText(language==='zh'?'新账号':'new account');
   await page.locator('#chat-input').fill(language==='zh'?'你在哪儿':'Where are you?');await page.locator('.chat-composer button[type=submit]').click();await expect(page.locator('.chat-messages')).toContainText('317');
   await page.reload();await expect(page.locator('.chat-messages')).toContainText('317');
  }else{await navigate(page,'chat');await expect(page.locator('[data-chat-room=wcr_new]')).toHaveCount(0);}
  await navigate(page,'night-audit');await toRevisions(page);await toReview(page);await storyFinish(page);await navigate(page,'review');await validateFindings(page);await toNight(page);await wireNight(page);
  await expect(page.locator('.story-b3-state')).toContainText('AUTO-WRITE ISOLATED');
  if(ending==='released')await page.locator('[data-night-action=lock]').click();
  await page.locator(`[data-ending=${ending}]`).click();await expect(page).toHaveURL(/#ending$/);await expect.poll(async()=>(await state(page)).lastEnding).toBe(ending);
  await expect(page.locator('.story-epilogue')).toBeVisible();if(ending==='released')await expect(page.locator('.story-epilogue')).toContainText('CABINET 12');
  const saved=await state(page);expect(saved.story.findings).toHaveProperty('cause');expect(saved.story.overlay.verified).toBe(true);expect(saved.story.effects).toEqual(['GF-01','GF-02','GF-03']);
  await page.reload();expect((await state(page)).lastEnding).toBe(ending);expect(errors).toEqual([]);
 });
}
async function seedStory(page,data,route){await page.addInitScript(data=>{if(sessionStorage.getItem('story-fixture'))return;sessionStorage.setItem('story-fixture','1');localStorage.setItem('stillwater-case:v2',JSON.stringify(data));},data);await page.goto('/index-zh.html#'+route);}
for(const width of [375,1440])test(`source desk, independent drafts and keyboard photo controls / ${width}px`,async({page})=>{
 const {storyReady}=await import('./v2-story-model-helpers.mjs');const data=storyReady();await page.setViewportSize({width,height:950});await seedStory(page,data,'photo-overlay');
 await page.locator('.story-overlay-stage').focus();await page.keyboard.press('ArrowLeft');await expect(page.locator('[data-story-overlay-output]')).toContainText('X -1');
 await page.locator('[data-story-opacity]').fill('35');await page.reload();await expect(page.locator('[data-story-overlay-output]')).toContainText('X -1');expect((await state(page)).story.overlay.verified).toBe(true);
 await navigate(page,'source-review?source=notebook');await expect(page.locator('[data-story-source=notebook]').first()).toContainText('柜');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await navigate(page,'source-trace');await page.locator('[data-story-action=request][data-choice=accepted]').click();await navigate(page,'chat?room=wcr_new');await page.locator('#chat-input').fill('Where are you?');await page.locator('.chat-composer button[type=submit]').click();await expect(page.locator('.chat-messages')).toContainText('Everything here says 317.');
 await navigate(page,'chat?room=mom');await expect(page.locator('.chat-messages')).not.toContainText('317');await page.locator('#chat-input').fill('给妈妈的草稿');await navigate(page,'chat?room=wcr_new');await expect(page.locator('#chat-input')).toHaveValue('');await navigate(page,'chat?room=mom');await expect(page.locator('#chat-input')).toHaveValue('给妈妈的草稿');
});
for(const preference of ['skipScares','reduceMotion'])test(`NULL source events retain text without effects / ${preference}`,async({page})=>{
 const {storyReady}=await import('./v2-story-model-helpers.mjs');const data=storyReady();data.preferences[preference]=true;data.preferences.scareChoiceMade=true;await seedStory(page,data,'history-cache');await expect(page.locator('.null-line')).toContainText('最新的那个');await expect(page.locator('.void-signal-burst')).toHaveCount(0);await page.reload();await expect(page.locator('.null-line')).toBeVisible();expect((await state(page)).story.restored).toBe(true);
});
test('NULL burst uses the approved apparition, remains once-only and never captures focus or creates an audio context',async({page})=>{
 const {storyReady}=await import('./v2-story-model-helpers.mjs');const data=storyReady(),requested=[];page.on('request',r=>requested.push(r.url()));await page.addInitScript(()=>{window.storyAudioContexts=0;const A=window.AudioContext;if(A)window.AudioContext=class extends A{constructor(...a){super(...a);window.storyAudioContexts++;}};});await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));await seedStory(page,data,'history-cache');
 await expect(page.locator('canvas[data-null-event="GF-01"]')).toBeVisible();await expect.poll(async()=>(await state(page)).story.played.includes('GF-01')).toBe(true);const focus=page.locator('[data-story-action=snapshot]').first();await focus.focus();await page.clock.runFor(1100);await expect(focus).toBeFocused();expect(await page.evaluate(()=>window.storyAudioContexts)).toBe(0);expect(requested.some(url=>url.includes('/v415-signal/apparition.png'))).toBe(true);await expect(page.locator('.void-signal-burst')).toHaveCount(0);await page.reload();await expect(page.locator('.void-signal-burst')).toHaveCount(0);await expect(page.locator('.story-cache-copy')).toBeVisible();
});
test('future chapter URLs expose no Wang Churen sources before their real gates',async({page})=>{
 await page.goto('/index-zh.html#void');for(const route of ['void','history-cache','source-trace','photo-overlay','null-archive']){await navigate(page,route);await expect(page.locator('.story-source,.story-void-layers,.story-void-boundary,.story-null-still')).toHaveCount(0);await expect(page.locator('#content')).not.toContainText('2023');}
});
