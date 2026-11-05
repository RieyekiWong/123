import {test,expect} from './v2-fixture.mjs';
import {start,move,proof,classify} from './v2-v13-helpers.mjs';
import {mkdirSync} from 'node:fs';

const stateOf=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-case:v2')));
async function seed(page,state,hash,entry='index-zh.html',width=1440,remaining=1000){
 if(state.preferences.skipScares)state.preferences.scareChoiceMade=true;
 await page.setViewportSize({width,height:900});
 await page.clock.install({time:new Date('2026-11-05T15:00:00Z')});await page.clock.pauseAt(new Date('2026-11-05T15:00:01Z'));
 await page.addInitScript(({state,remaining})=>{
  if(sessionStorage.getItem('v13-recovery-seed'))return;
  sessionStorage.setItem('v13-recovery-seed','1');Math.random=()=>.25;
  localStorage.setItem('stillwater-case:v2',JSON.stringify(state));
  localStorage.setItem('stillwater-messenger:v1',JSON.stringify({schema:1,remaining,intrusionSeen:false}));
 },{state,remaining});
 await page.goto('/'+entry+'#'+hash);
}
async function settle(page){await page.clock.runFor(4000);}

for(const [entry,width] of [['index-zh.html',375],['index.html',1440]])test(`V1.3 partial findings, comparison and hints survive a notified chat, refresh and language switch / ${entry}`,async({page})=>{
 const state=start();state.story.transition.consumed=true;await seed(page,state,'source-review?proof=index',entry,width);
 const section=page.locator('[data-v13-proof=index]');
 for(const id of ['booking','inventory']){
  await section.locator(`[data-story-action=open][data-id=${id}]`).click();
  await page.locator('.v13-workspace .v13-source footer [data-story-action=compare]').click();
 }
 await section.locator('[data-story-cite=booking]').check();await section.locator('[data-story-field=use]').selectOption('service');
 await section.locator('.v13-hints summary').click();await section.locator('[data-story-action=hint]').click();await section.locator('[data-story-action=hint]').click();
 const before=await stateOf(page);expect(before.story.hints.index).toBe(2);expect(before.story.findings.index).toBeUndefined();
 await page.clock.runFor(1100);const room=await page.locator('.messenger-notice-open').getAttribute('data-room');await page.locator('.messenger-notice-open').click();await expect(page).toHaveURL(new RegExp('#chat\\?room='+room+'$'));
 await page.locator('#chat-input').fill('a private draft that stays with this contact');await page.reload();
 await page.locator('[data-messenger-action=return]').click();await expect(page).toHaveURL(/#source-review\?proof=index$/);
 await expect(section.locator('[data-story-field=use]')).toHaveValue('service');await expect(section.locator('[data-story-cite=booking]')).toBeChecked();
 expect((await stateOf(page)).story.compare).toEqual(['booking','inventory']);expect((await stateOf(page)).story.hints.index).toBe(2);
 await page.locator('[data-case-language]').click();await expect(section.locator('[data-story-field=use]')).toHaveValue('service');
 expect((await stateOf(page)).story.findings.index).toBeUndefined();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('V1.3 saved completion resumes its next scene once and cache versions survive refresh',async({page})=>{
 const state=start();proof(state,'index');state.preferences.reduceMotion=true;state.preferences.skipScares=true;
 await seed(page,state,'source-review?proof=index');await settle(page);await expect(page).toHaveURL(/#source-review\?proof=diary$/);
 await page.reload();await settle(page);await expect(page).toHaveURL(/#source-review\?proof=diary$/);expect((await stateOf(page)).story.transition.consumed).toBe(true);
 await page.locator('a[href="#history-cache"]').click();await page.locator('[data-story-action=snapshot][data-version="2023"]').click();await page.reload();
 await expect(page.locator('.v13-cache [data-v13-source=notebook]')).toBeVisible();await expect(page.locator('.v13-cache')).not.toContainText('18:26');
 await page.locator('.v13-cache .v13-next a').click();await expect(page.locator('[data-v13-proof=diary]')).toBeVisible();
});

test('V1.3 long Helen email is not skipped by reload or elapsed time; reduced motion and skipping scares keep the next scene usable',async({page})=>{
 const mail=start();for(const key of ['index','diary','echo','cause'])proof(mail,key);mail.preferences.reduceMotion=true;mail.preferences.skipScares=true;
 await seed(page,mail,'rewrite-review');
 await settle(page);await expect(page).toHaveURL(/#mirror$/);await expect(page.locator('.v13-mail')).toContainText('Helen');await page.reload();await page.clock.runFor(60000);
 await expect(page).toHaveURL(/#mirror$/);await expect(page.locator('.v13-mail')).toBeVisible();
 await page.locator('a[href="#hotel"]').first().click();await page.locator('.v13-focus a[href="#mirror"]').click();await expect(page.locator('.v13-mail')).toBeVisible();
 await page.locator('[data-story-action=rewrite-shown]').focus();await page.keyboard.press('Enter');await settle(page);await expect(page).toHaveURL(/#cameras$/);await expect(page.locator('.void-signal')).toHaveCount(0);
});

test('V1.3 dark terminal retains its recovered camera copy, unread choices and reduced/scare preferences',async({page})=>{
 const state=classify();state.story.transition.consumed=true;state.preferences.reduceMotion=true;state.preferences.skipScares=true;
 await seed(page,state,'void','index-zh.html',1440);
 await page.locator('.v13-final-memory>summary').click();await expect(page.locator('[data-v13-source=unsent]')).toContainText('明天回去');
 await expect(page.locator('[data-v13-source=lastphoto] figure')).toHaveClass('v13-photo-window');
 await page.locator('.v13-final-memory>summary').click();await page.locator('[data-story-action=category][data-id=EMPLOYEE]').click();await page.locator('[data-v13-proof=EMPLOYEE] [data-story-action=open][data-id=nora-shift]').click();
 await expect(page.locator('.v13-source-dialog')).toBeVisible();await expect(page.locator('.v13-source-dialog')).toContainText('Nora Bell');await page.keyboard.press('Escape');await expect(page.locator('[data-v13-proof=EMPLOYEE] [data-story-action=open][data-id=nora-shift]')).toBeFocused();
 await expect(page.locator('[data-v13-proof=EMPLOYEE] [data-story-feedback]')).toBeEmpty();
 expect((await stateOf(page)).night.void.attempts).toEqual([]);await expect(page.locator('.void-disposition')).toHaveCount(0);
 const background=await page.locator('.v13-final-window').evaluate(el=>getComputedStyle(el).backgroundColor);expect(background).toBe('rgb(8, 12, 10)');
 mkdirSync('docs/v1.3-preview',{recursive:true});await page.locator('.v13-final').screenshot({path:'docs/v1.3-preview/dark-terminal.png'});
 await page.reload();expect((await stateOf(page)).preferences.skipScares).toBe(true);expect((await stateOf(page)).preferences.reduceMotion).toBe(true);expect((await stateOf(page)).night.void.attempts).toEqual([]);
});

test('V1.3 six-second warning follows the Nora originals and never enters real chat history',async({page})=>{
 const state=start();for(const key of ['index','diary','echo'])proof(state,key);state.story.transition.consumed=true;
 await seed(page,state,'rewrite-review','index-zh.html',1440,120000);
 const messages=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-chat:v1')).messages);
 const before=await messages();await page.locator('[data-v13-proof=cause] [data-story-action=open][data-id=mara]').click();
 await expect(page.locator('.messenger-intrusion')).toBeVisible();await page.clock.runFor(5800);await expect(page.locator('.messenger-intrusion')).toBeVisible();
 expect(await messages()).toEqual(before);await page.clock.runFor(400);await expect(page.locator('.messenger-intrusion')).toHaveCount(0);expect(await messages()).toEqual(before);
 expect((await stateOf(page)).story.findings.cause).toBeUndefined();await page.locator('.v13-workspace aside [data-story-action=open][data-id=nora-life]').click();
 await page.locator('[data-v13-source=nora-life] img').scrollIntoViewIfNeeded();await page.clock.runFor(100);await expect.poll(()=>page.locator('[data-v13-source=nora-life] img').evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
 mkdirSync('docs/v1.3-preview',{recursive:true});await page.locator('.v13-workspace').screenshot({path:'docs/v1.3-preview/nora-sources.png'});
 await page.reload();await page.clock.runFor(1000);await expect(page.locator('.messenger-intrusion')).toHaveCount(0);await expect(page.locator('[data-v13-source=nora-life]')).toBeVisible();
 await page.locator('.v13-workspace aside [data-story-action=open][data-id=ruth]').click();await expect(page.locator('[data-v13-source=ruth]')).toContainText('盐饼干');
});
