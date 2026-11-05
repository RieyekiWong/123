import {test,expect} from './v2-fixture.mjs';
import {answers} from './v2-v13-helpers.mjs';
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-case:v2')));
async function closeAds(page){for(const button of await page.locator('[data-active-ad] [data-ad-action=close]').all())await button.click();}
async function settle(page){await page.clock.runFor(1800);await closeAds(page);}
async function hash(page,pattern){await expect.poll(async()=>{await settle(page);return new URL(page.url()).hash;}).toMatch(pattern);}
async function review(page,key,{wrong=false}={}){
  const sources={index:['booking','inventory','position'],diary:['notebook','school','oldchat','guestlog','draft'],echo:['avatar-old','avatar-new','oldchat','sync','echo'],cause:['nora-shift','ethan','nora-revision','mara'],ROOM:['inventory','position','footage'],GUEST:['booking','key','housekeeping','transfer','notebook','index'],EMPLOYEE:['nora-shift','personnel','nora-revision','mara']}[key];
  for(const id of sources){
    const section=page.locator(`[data-v13-proof="${key}"]`);
    await section.locator(`button[data-story-action=open][data-id="${id}"]`).click();
    if(await page.locator('.messenger-intrusion').count())await page.clock.runFor(6200);
    if(['ROOM','GUEST','EMPLOYEE'].includes(key)){await expect(page.locator('.v13-source-dialog')).toBeVisible();await page.locator('.v13-source-close').click();}
    await section.locator(`[data-story-cite="${id}"]`).check();
  }
  if(key==='index')for(const id of ['booking','inventory']){
    await page.locator('[data-v13-proof=index] button[data-story-action=open][data-id='+id+']').click();
    await page.locator('.v13-workspace .v13-source footer [data-story-action=compare]').click();
  }
  for(const [field,value] of Object.entries(answers[key]))await page.locator(`[data-v13-proof="${key}"] [data-story-field="${field}"]`).selectOption(wrong&&key==='index'&&field==='use'?'room':value);
  await page.locator(`[data-v13-proof="${key}"] button[type=submit]`).click();
}
async function opening(page,entry,width){
 await page.setViewportSize({width,height:950});await page.clock.install({time:new Date('2026-11-05T15:00:00Z')});await page.clock.pauseAt(new Date('2026-11-05T15:00:01Z'));await page.goto('/'+entry);
 await page.locator('#chat-input').fill(entry.includes('zh')?'我还在赶作业呢':'Still doing this assignment.');await page.locator('#chat-input').press('Enter');await page.clock.runFor(100000);await closeAds(page);
 await page.locator('[data-chat-open-private=gg]').click();await page.locator('.chat-share-card').click();await expect(page).toHaveURL(/#forum\?topic=job$/);
 await page.locator('.forum-recruit-link').click();await page.locator('[data-case-action=sample]').click();await hash(page,/#hotel$/);expect((await saved(page)).story.edition).toBe('v13');
 await page.locator('.v13-hotel-search a').click();await page.locator('#story-name').fill(entry.includes('zh')?'王楚人':'Churen Wang');await page.locator('.story-name-search button').click();
 await expect(page.locator('[data-v13-source=index]')).toContainText('2006-10-17');await page.locator('.v13-next a').click();
}
async function camerasAndWires(page){
 for(const [cam,pan] of [[0,2],[1,0]])await page.locator(`[data-night-action=pan][data-cam="${cam}"][data-pan="${pan}"]`).click();await page.locator('[data-night-action=link][data-link="0"]').click();
 for(const [cam,pan] of [[1,2],[2,0]])await page.locator(`[data-night-action=pan][data-cam="${cam}"][data-pan="${pan}"]`).click();await page.locator('[data-night-action=link][data-link="1"]').click();await page.locator('[data-night-action=pan][data-cam="2"][data-pan="2"]').click();await page.locator('[data-night-action=door]').click();
 await expect(page).toHaveURL(/#service-passage$/);await page.locator('[data-night-action=walk][data-position=west]').click();
 await page.locator('.space-actions [data-target=cart]').click();await page.locator('.space-actions [data-target=cabinet]').click();await settle(page);await page.locator('.space-actions [data-target=power]').click();await page.locator('[data-night-action=walk][data-position=service]').click();await page.locator('.space-actions [data-target=enter]').click();
 await expect(page).toHaveURL(/#terminal$/);await page.locator('[data-night-action=frame]').click();
 for(const [node,target] of [[0,2],[3,0],[4,3],[1,1],[2,2],[5,0]]){
  const button=page.locator(`[data-night-action=rotate][data-node="${node}"]`);
  for(let i=0;i<4;i++){if(await button.locator('[data-circuit-wire]').getAttribute('transform')===`rotate(${target*90} 50 50)`)break;await button.click();}
 }
 await expect(page.locator('.v13-recording-sources')).toBeVisible();await page.locator('[data-story-action=film][data-choice=synced]').click();await expect(page.locator('.v13-mixed-edge')).toBeVisible();await expect(page.locator('.v13-recording-sources .cctv-osd.bottom')).toContainText('2026');await page.locator('[data-story-action=film][data-choice=original]').click();await expect(page.locator('.v13-mixed-edge')).toHaveCount(0);
 await page.locator('[data-night-action=isolate]').click();await page.locator('[data-night-action=manual]').click();await page.locator('[data-night-action=save]').click();
 const promo=page.locator('.promo-check-panel');await expect(promo).toBeVisible();await promo.locator('[data-promo-action=source][data-version=original]').click();await promo.locator('.promo-mark-controls [data-target=middle]').click();await hash(page,/#void$/);
}
async function space(page){
 for(const direction of ['left','right','left','right']){
  await page.locator('[data-void-action=observe][data-target=reference]').click();await expect(page.locator('.void-observation')).not.toBeEmpty();await page.locator('[data-void-action=observe][data-target='+direction+']').click();await page.locator('[data-void-action=walk][data-direction='+direction+']').click();
 }
 for(const [id,dx,dy] of [[0,-3,2],[1,3,-3],[2,-3,-1]]){
  await page.locator(`[data-void-action=select][data-id="${id}"]`).click();
  for(let i=0;i<Math.abs(dx);i++)await page.locator(`[data-void-action=move][data-dx="${Math.sign(dx)}"][data-dy="0"]`).click();
  for(let i=0;i<Math.abs(dy);i++)await page.locator(`[data-void-action=move][data-dx="0"][data-dy="${Math.sign(dy)}"]`).click();
 }
 await expect(page.locator('.void-alignment')).toContainText('3/3');await page.locator('[data-void-action=review]').click();await settle(page);await expect(page.locator('.v13-final')).toBeVisible();
}
for(const [entry,width,request,ending] of [['index-zh.html',1440,'accepted','released'],['index.html',1440,'ignored','unverified'],['index-zh.html',375,'ignored','auto-close']]){
 test(`V1.3 complete sourced route, no hidden continue buttons / ${entry} / ${width} / ${ending}`,async({page})=>{
  test.setTimeout(150000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await opening(page,entry,width);
  await review(page,'index',{wrong:true});await expect(page.locator('[data-story-feedback]')).not.toBeEmpty();expect((await saved(page)).story.findings.index).toBeUndefined();
  await page.locator('[data-story-field=use]').selectOption('service');await page.locator('[data-v13-proof=index] button[type=submit]').click();await hash(page,/#source-review\?proof=diary$/);
  await expect(page.locator('[data-v13-source=notebook]')).toContainText('Nora');await review(page,'diary');await hash(page,/#chat\?request=1$/);
  await page.locator(`.chat-story-profile [data-story-action=request][data-choice=${request}]`).click();
  if(request==='accepted'){await hash(page,/#chat\?room=wcr_new$/);await expect(page.locator('.chat-messages')).toContainText(entry.includes('zh')?'你先别在群里说':'Don’t tell the group');await page.locator('.v13-chat-return').click();}
  else await hash(page,/#source-trace$/);
  await review(page,'echo');await hash(page,/#rewrite-review$/);await expect(page.locator('[data-v13-source=nora-shift]')).toContainText('Nora Bell');await review(page,'cause');await hash(page,/#mirror$/);
  await expect(page.locator('.v13-mail')).toContainText('Helen');await page.clock.runFor(30000);await expect(page).toHaveURL(/#mirror$/);await page.locator('[data-story-action=rewrite-shown]').click();await hash(page,/#cameras$/);
  expect((await saved(page)).night.spread).toEqual({rooms:false,guestbook:false});expect((await saved(page)).completed.audit).toBe(false);
  await camerasAndWires(page);await space(page);
  for(const id of ['ROOM','GUEST','EMPLOYEE'])await page.locator(`[data-story-action=category][data-id=${id}]`).click();expect((await saved(page)).night.void.attempts).toEqual([]);await expect(page.locator('.void-disposition')).toHaveCount(0);
  for(const key of ['ROOM','GUEST','EMPLOYEE']){
    await page.locator(`[data-story-action=category][data-id=${key}]`).click();await review(page,key);
    if(key==='ROOM'){await page.reload();await settle(page);expect((await saved(page)).night.void.attempts).toEqual(['ROOM']);}
  }
  await page.locator(`[data-story-action=finish][data-choice="${ending}"]`).click();await hash(page,/#ending$/);await settle(page);
  const end=await saved(page);expect(end.lastEnding).toBe(ending);expect(end.story.originalsSeparated).toBe(ending==='released');expect(end.evidence.includes('C8')).toBe(false);await expect(page.locator('.v13-epilogue')).toBeVisible();
  await page.reload();expect((await saved(page)).lastEnding).toBe(ending);expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 });
}
