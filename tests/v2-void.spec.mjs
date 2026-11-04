import {test,expect} from './v2-fixture.mjs';
import {solveVoid} from './v2-void-helpers.mjs';
import {solvePromo} from './v2-promo-helpers.mjs';
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-case:v2')));
async function setup(page,{entry='index-zh.html',skip=true,legacy=false}={}) {
 await page.addInitScript(({skip,legacy})=>{
  if(sessionStorage.getItem('void-fixture'))return;sessionStorage.setItem('void-fixture','1');
  localStorage.setItem('stillwater-case:v2',JSON.stringify({schema:2,evidence:['C1','C2','C3','C4','C5','C6','C7','C8','C9'],completed:{audit:true,finalEvidence:true},night:{started:true,links:[0,1],door:true,frame:true,orientations:[2,1,2,0,3,0],isolated:true,manual:true,saved:true,operations:6,...(legacy?{locked:true,released:true}:{void:{schema:1}})},...(legacy?{endings:['released'],lastEnding:'released'}:{}),preferences:{skipScares:skip,scareChoiceMade:true}}));
 },{skip,legacy});
 await page.goto('/'+entry+'#terminal');
 if(!legacy)await solvePromo(page);
}
for(const entry of ['index-zh.html','index.html']) {
 test(`${entry}: B-3 opens three real puzzles, returns to the original archive and preserves all endings`,async({page})=>{
  test.setTimeout(60000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await setup(page,{entry});await expect(page.locator('[data-night-action=lock]')).toHaveCount(0);
  await page.locator('[data-unlisted-entry]').click();
  await solveVoid(page);
  const result=await saved(page);expect(result.night.void.complete).toBe(true);expect(result.evidence).toHaveLength(9);expect(result.endings).toEqual([]);
  await page.locator('[data-night-action=lock]').click();await page.locator('[data-ending=released]').click();
  await expect(page.getByRole('heading',{name:'GAME OVER',exact:true})).toBeVisible();expect(errors).toEqual([]);
 });
}
test('unknown deep links cannot skip the case or equipment prerequisites',async({page})=>{
 await page.goto('/index-zh.html#void');await expect(page.locator('.void-world')).toHaveCount(0);await expect(page.locator('main a[href="#careers"]')).toBeVisible();
});
test('wrong doors have a repeatable rule and the second entrance visit changes the environment once',async({page})=>{
 await setup(page);await page.locator('[data-unlisted-entry]').click();
 const canvas=page.locator('.void-canvas'),box=await canvas.boundingBox();
 await canvas.click({position:{x:box.width*.1,y:box.height*.55}});
 await expect(page.locator('.void-observation')).toContainText('刚经过的门');
 await canvas.click({position:{x:box.width*.68,y:box.height*.45}});
 await expect(page.locator('.void-observation')).toContainText('右侧的门');
 await page.locator('[data-void-action=walk][data-direction=right]').click();
 expect((await saved(page)).night.void.shadow).toBe(true);
 await page.locator('[data-void-action=observe][data-target=shadow]').click();
 await page.locator('[data-void-action=walk][data-direction=right]').click();
 expect((await saved(page)).night.void.shadow).toBe(false);
 expect((await saved(page)).night.void.events.filter(id=>id==='entry-shadow')).toHaveLength(1);
});
test('fragments support actual pointer dragging and keyboard movement, survive refresh and language changes',async({page})=>{
 await setup(page);await page.locator('[data-unlisted-entry]').click();
 for(const direction of ['left','right','left','right'])await page.locator(`[data-void-action=walk][data-direction=${direction}]`).click();
 const canvas=page.locator('.void-canvas'),box=await canvas.boundingBox();
 const x=350,y=270;
 await page.mouse.move(box.x+x*box.width/480,box.y+y*box.height/360);await page.mouse.down();
 await page.mouse.move(box.x+(x-24)*box.width/480,box.y+(y-8)*box.height/360,{steps:4});await page.mouse.up();
 expect((await saved(page)).night.void.positions[2]).toEqual([0,0]);
 await page.locator('[data-void-action=select][data-id="0"]').click();await canvas.focus();await page.keyboard.press('ArrowLeft');
 const before=(await saved(page)).night.void.positions;expect(before[0]).toEqual([2,-2]);
 await page.reload();expect((await saved(page)).night.void.positions).toEqual(before);
 await page.locator('[data-case-language]').click();await expect(page).toHaveURL(/index.html#void$/);expect((await saved(page)).night.void.positions).toEqual(before);
 await page.locator('[data-void-action=review]').click();await expect(page.locator('#void-feedback')).not.toBeEmpty();
});
test('two distinct new faces are action-triggered once, with the same source information after skipping',async({page})=>{
 await setup(page,{skip:false});await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
 await page.locator('[data-unlisted-entry]').click();const sources=[];
 await solveVoid(page,{visit:async stage=>{
  if(stage==='void-reviewed') {
   await expect(page.locator('[data-event=void-fragment-face]')).toBeVisible();sources.push(await page.locator('[data-event=void-fragment-face] img').getAttribute('src'));await page.clock.runFor(750);
   await expect(page.locator('.void-missing-source')).toBeVisible();
  }
  if(stage==='void-return') {await expect(page.locator('[data-event=void-lookback]')).toBeVisible();sources.push(await page.locator('[data-event=void-lookback] img').getAttribute('src'));await page.clock.runFor(750);}
 }});
 expect(new Set(sources).size).toBe(2);
 await page.locator('[data-unlisted-entry]').click();await page.locator('[data-void-action=lookback]').click();await expect(page.locator('.frame-face')).toHaveCount(0);
 expect((await saved(page)).night.void.complete).toBe(true);
});
for(const reduced of [false,true])test(`375px: silent ${reduced?'reduced-motion':'skip-scared'} play retains every puzzle and final result`,async({page})=>{
 test.setTimeout(60000);await page.setViewportSize({width:375,height:850});if(reduced)await page.emulateMedia({reducedMotion:'reduce'});
 await setup(page,{skip:!reduced});await page.locator('[data-unlisted-entry]').click();
 await solveVoid(page,{visit:async()=>{expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('.frame-face')).toHaveCount(0);}});
 expect((await saved(page)).night.void.complete).toBe(true);expect((await saved(page)).preferences.sound).toBe(false);
});
test('old completed saves keep their ending and can open the unlisted pictures voluntarily',async({page})=>{
 await setup(page,{legacy:true});expect(await page.evaluate(()=>StillwaterCaseState.hydrate(JSON.parse(localStorage.getItem('stillwater-case:v2'))).night.void.legacy)).toBe(true);
 await expect(page.locator('[data-ending=released]')).toBeVisible();await page.locator('[data-unlisted-entry]').click();await expect(page.locator('.void-world')).toBeVisible();
 expect((await saved(page)).endings).toEqual(['released']);
});

test('the black chapter keeps audio opt-in, adds distant breath deeper in and stops immediately on mute',async({page})=>{
 await page.addInitScript(()=>{
  window.voidAudio={contexts:[],buffers:0};const Audio=window.AudioContext;
  window.AudioContext=class extends Audio {
   constructor(...args){super(...args);voidAudio.contexts.push(this);}
   createBufferSource(){const source=super.createBufferSource(),start=source.start.bind(source);source.start=(...args)=>{if(source.stillwaterRole==='breath')voidAudio.buffers++;return start(...args);};return source;}
  };
 });
 await setup(page);await page.locator('[data-unlisted-entry]').click();
 expect(await page.evaluate(()=>voidAudio.contexts.length)).toBe(0);
 await page.locator('.void-footer [data-case-action=toggle-sound]').click();
 await expect.poll(()=>page.evaluate(()=>voidAudio.contexts.some(c=>c.state==='running'))).toBe(true);
 expect(await page.evaluate(()=>voidAudio.buffers)).toBe(0);
 for(const direction of ['left','right','left','right'])await page.locator(`[data-void-action=walk][data-direction=${direction}]`).click();
 await expect.poll(()=>page.evaluate(()=>voidAudio.buffers)).toBeGreaterThan(0);
 await page.locator('.void-footer [data-case-action=toggle-sound]').click();
 await expect.poll(()=>page.evaluate(()=>voidAudio.contexts.every(c=>c.state==='suspended'))).toBe(true);
 await page.reload();expect(await page.evaluate(()=>voidAudio.contexts.length)).toBe(0);
 expect((await saved(page)).preferences.sound).toBe(false);
});
