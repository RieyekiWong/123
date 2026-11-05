import {test,expect} from '@playwright/test';
import {solveVoid} from './v2-void-helpers.mjs';
import {solvePromo} from './v2-promo-helpers.mjs';
async function trace(page) {
 await page.addInitScript(()=>{
  window.audioTrace={contexts:[],starts:[],gains:[]};
  const Audio=window.AudioContext||window.webkitAudioContext;
  window.AudioContext=class extends Audio{
   constructor(...args){super(...args);audioTrace.contexts.push(this);}
   createGain(){const node=super.createGain();audioTrace.gains.push(node);return node;}
   record(node){let record;const start=node.start.bind(node),stop=node.stop.bind(node);node.stop=(...args)=>{if(record)record.stopped=true;return stop(...args);};node.start=(...args)=>{record={role:node.stillwaterRole,track:node.stillwaterTrack||'',ended:false};audioTrace.starts.push(record);node.addEventListener('ended',()=>{record.ended=true;},{once:true});return start(...args);};return node;}
   createBufferSource(){return this.record(super.createBufferSource());}
   createOscillator(){return this.record(super.createOscillator());}
  };
 });
}
const active=page=>page.evaluate(()=>audioTrace.starts.filter(s=>s.role==='bgm'&&!s.ended&&!s.stopped).map(s=>s.track));
async function go(page,route){await page.evaluate(route=>{location.hash=route;},route);await expect(page).toHaveURL(new RegExp('#'+route+'$'));}
async function enter(page,route='hotel',sound=true,entry='index-zh.html'){
 await page.goto('/'+entry+'#'+route);
 await expect(page.locator('#case-welcome')).toBeVisible();
 if(sound)await page.locator('#case-welcome [name=sound]').check();
 await page.locator('[data-welcome=enter]').click();
 await expect(page.locator('#case-welcome')).toHaveCount(0);
}
async function deepSave(page){
 await page.addInitScript(()=>localStorage.setItem('stillwater-case:v2',JSON.stringify({schema:2,evidence:['C1','C2','C3','C4','C5','C6','C7','C8','C9'],completed:{audit:true,finalEvidence:true},night:{started:true,links:[0,1],door:true,frame:true,orientations:[2,1,2,0,3,0],isolated:true,manual:true,saved:true,operations:6,void:{schema:1}},preferences:{skipScares:true,scareChoiceMade:true}})));
}
test('all sound is opt-in; home starts silent, investigation fades in, and ordinary sites stop it',async({page})=>{
 await trace(page);const requests=[];page.on('request',r=>{if(/audio-v28\/.*\.(mp3|ogg)/.test(r.url()))requests.push(r.url());});
 await page.goto('/index-zh.html#hotel');expect(await page.evaluate(()=>audioTrace.contexts.length)).toBe(0);expect(requests).toEqual([]);
 await page.locator('[name=sound]').check();await page.locator('[data-welcome=enter]').click();
 expect(await page.evaluate(()=>audioTrace.contexts.length)).toBe(1);expect(await active(page)).toEqual([]);expect(requests).toEqual([]);
 await go(page,'rooms');await expect.poll(()=>active(page)).toEqual(['investigation']);expect(requests).toHaveLength(1);
 await go(page,'history');await expect.poll(()=>active(page)).toEqual(['investigation']);expect(requests).toHaveLength(1);
 for(const route of ['forum','careers','chat']){await go(page,route);await expect.poll(()=>active(page)).toEqual([]);}
 await go(page,'staff');await expect(page.locator('main')).toContainText('文件暂时打不开');await expect.poll(()=>active(page)).toEqual([]);
 expect(requests).toHaveLength(1);
});
test('chat has softer send/receive feedback, merges bursts and never loads BGM or replays historical notifications',async({page})=>{
 await trace(page);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
 await enter(page,'chat');await page.locator('#chat-input').fill('发链接我看看');await page.locator('#chat-input').press('Enter');
 await page.clock.runFor(100000);
 for(const close of await page.locator('[data-active-ad] [data-ad-action=close]').all())await close.click();
 await page.locator('[data-chat-open-private=gg]').click();await expect(page.locator('.chat-share-card')).toHaveCount(1);
 const roles=await page.evaluate(()=>audioTrace.starts.map(s=>s.role));expect(roles).toContain('chat-send');expect(roles).toContain('chat-receive');expect(roles).not.toContain('bgm');
 const count=roles.filter(r=>r==='chat-receive').length;
 for(const close of await page.locator('[data-active-ad] [data-ad-action=close]').all())await close.click();
 await page.locator('[data-chat-room=lunch]').click();await page.locator('[data-chat-room=group]').click();
 expect(await page.evaluate(()=>audioTrace.starts.filter(s=>s.role==='chat-receive').length)).toBe(count);
 await page.locator('[data-chat-action=members]').click();await page.locator('.chat-menu-actions [data-case-action=settings]').click();
 await page.locator('[data-comfort=sound]').click();await page.keyboard.press('Escape');
 const before=await page.evaluate(()=>audioTrace.starts.length);
 await page.locator('#chat-input').fill('好');await page.locator('#chat-input').press('Enter');await page.clock.runFor(4000);
 expect(await page.evaluate(()=>audioTrace.starts.length)).toBe(before);
 await page.reload();expect(await page.evaluate(()=>audioTrace.contexts.length)).toBe(0);
});
for(const width of [375,1440])test(`${width}px: music and SFX volume are independent; instructions, refresh and backgrounding keep audio under control`,async({page})=>{
 await page.setViewportSize({width,height:900});await trace(page);await enter(page,'rooms');await expect.poll(()=>active(page)).toEqual(['investigation']);
 await page.locator('[data-case-action=settings]').click();
 await page.locator('[name=music-volume]').fill('0');await page.locator('[name=sfx-volume]').fill('25');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-audio:v1')))).toEqual({schema:1,music:0,effects:.25});
 await expect(page.locator('#music-volume-value')).toHaveText('0%');await expect(page.locator('#sfx-volume-value')).toHaveText('25%');
 await expect.poll(()=>page.evaluate(()=>audioTrace.gains[1].gain.value)).toBeLessThan(.01);
 await expect.poll(()=>page.evaluate(()=>audioTrace.gains[2].gain.value)).toBeGreaterThan(.2);
 await page.keyboard.press('Escape');await page.locator('[data-case-action=instructions]').click();
 await expect.poll(()=>active(page)).toEqual([]);await page.locator('[data-welcome=enter]').click();
 await expect.poll(()=>active(page)).toEqual(['investigation']);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect.poll(()=>page.evaluate(()=>audioTrace.contexts.every(c=>c.state==='suspended'))).toBe(true);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 expect(await active(page)).toEqual([]);
 await page.reload();expect(await page.evaluate(()=>audioTrace.contexts.length)).toBe(0);
 await page.locator('[data-case-action=settings]').click();await expect(page.locator('[name=music-volume]')).toHaveValue('0');await expect(page.locator('[name=sfx-volume]')).toHaveValue('25');await expect(page.locator('[data-comfort=sound]')).toHaveAttribute('aria-pressed','false');
});
test('CCTV, B-3, black-space entry, deeper space and a released ending use distinct local tracks',async({page})=>{
 test.setTimeout(60000);await trace(page);await deepSave(page);await enter(page,'cameras');await expect.poll(()=>active(page)).toEqual(['cctv']);
 expect(await page.evaluate(()=>audioTrace.starts.some(s=>s.role==='cctv-static'))).toBe(true);
 await go(page,'staff');await expect.poll(()=>active(page)).toEqual(['archive']);
 await go(page,'mirror');await expect.poll(()=>active(page)).toEqual(['rewrite']);
 await go(page,'terminal');await expect.poll(()=>active(page)).toEqual(['passage']);
 await solvePromo(page);
 await page.locator('[data-unlisted-entry]').click();await expect.poll(()=>active(page)).toEqual(['unlisted']);
 await solveVoid(page,{visit:async stage=>{if(stage==='void-fragments')await expect.poll(()=>active(page)).toEqual(['deep']);}});
 await expect.poll(()=>active(page)).toEqual(['passage']);
 await page.locator('[data-night-action=lock]').click();await page.locator('[data-ending=released]').click();
 await expect(page.getByRole('heading',{name:'GAME OVER',exact:true})).toBeVisible();await expect.poll(()=>active(page)).toEqual(['safe']);
 await go(page,'forum');await expect.poll(()=>active(page)).toEqual([]);
});
test('a cancelled slow download cannot start music after returning to the forum; unsupported MP3 falls back to OGG',async({page})=>{
 await trace(page);let release;const held=new Promise(resolve=>{release=resolve;});
 await page.route('**/audio-v28/investigation.mp3',async route=>{await held;await route.abort().catch(()=>{});});
 await enter(page);const request=page.waitForRequest('**/audio-v28/investigation.mp3');await go(page,'rooms');await request;await go(page,'forum');release();
 await expect.poll(()=>active(page)).toEqual([]);
 await page.unroute('**/audio-v28/investigation.mp3');
 await page.route('**/audio-v28/investigation.mp3',route=>route.fulfill({status:200,contentType:'audio/mpeg',body:'invalid audio'}));
 const fallback=page.waitForResponse('**/audio-v28/investigation.ogg');await go(page,'rooms');await fallback;await expect.poll(()=>active(page)).toEqual(['investigation']);
 await go(page,'careers');await expect.poll(()=>active(page)).toEqual([]);
});
