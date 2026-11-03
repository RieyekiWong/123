import {test,expect} from './v2-fixture.mjs';
import {state} from './v2-helpers.mjs';
const newIds=['used-monitor','old-websites','takeaway-note','job-description','photo-filenames','vending-machine','travel-brochure','late-snack'];
async function quietClock(page){await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));}
async function route(page,hash){await page.evaluate(hash=>{location.hash=hash;},hash);await expect(page).toHaveURL(new RegExp('#'+hash.replace('?','\\?')+'$'));}
for(const entry of ['index-zh.html','index.html'])test(`${entry}: topic index, eight full threads, all reply floors and four board filters are usable without changing progress`,async({page})=>{
 test.setTimeout(60000);await quietClock(page);await page.goto('/'+entry+'#forum');
 await expect(page.locator('.bbs-topic-table tbody tr')).toHaveCount(15);
 await expect(page.locator('.bbs-topic-table tbody tr').first()).toHaveAttribute('data-forum-topic','job');
 const data=await page.evaluate(()=>StillwaterForumData),locale=entry.includes('zh')?0:1;
 for(const id of newIds){
  await page.locator(`.bbs-topic-link[href="#forum?topic=${id}"]`).click();const post=data.find(p=>p.id===id);
  await expect(page.locator('.bbs-post h1')).toHaveText(post.title[locale]);
  await expect(page.locator('.bbs-post-text>p')).toHaveText(post.paragraphs.map(p=>p[locale]));
  await expect(page.locator('.bbs-reply')).toHaveCount(post.replies.length);
  await expect(page.locator('.bbs-reply>p')).toHaveText(post.replies.map(r=>r[1][locale]));
  await expect(page.locator('.bbs-replies h2')).toContainText(String(post.replies.length));
  await page.locator('.bbs-back-link a').click();
 }
 await page.locator('.bbs-directory-tools a').click();await expect(page.locator('.bbs-replies')).toContainText(locale===0?'本帖关闭回复':'Replies are closed');await expect(page.locator('.bbs-reply')).toHaveCount(0);
 for(const board of ['chat','work','web','help']){await page.locator(`.forum-nav a[href="#forum?section=${board}"]`).click();await expect(page.locator('.bbs-topic-table tbody tr')).toHaveCount(data.filter(p=>p.sections.includes(board)).length);}
 expect(await page.evaluate(()=>localStorage.getItem('stillwater-case:v2'))).toBeNull();
});
for(const entry of ['index-zh.html','index.html'])test(`${entry}: keyword and arrangement filters search all four jobs together, preserve the sample and keep archived roles read-only`,async({page})=>{
 await quietClock(page);await page.goto('/'+entry+'#careers');await expect(page.locator('.job-card')).toHaveCount(4);
 await expect(page.locator('[data-case-action=sample]')).toHaveCount(1);await expect(page.locator('.career-workflow article')).toHaveCount(3);await expect(page.locator('.career-faq details')).toHaveCount(4);
 await page.locator('[name=work]').selectOption('onsite');await expect(page.locator('.job-card:visible')).toHaveCount(1);await expect(page.locator('#scan-assistant')).toBeVisible();
 await page.locator('#job-keyword').fill(entry.includes('zh')?'照片':'photo');await page.locator('#job-search button[type=submit]').click();await expect(page.locator('.job-card:visible')).toHaveCount(0);
 await page.locator('[name=work]').selectOption('remote');await expect(page.locator('#photo-proofreader')).toBeVisible();await expect(page.locator('.job-card:visible')).toHaveCount(1);
 await page.locator('#photo-proofreader summary').click();await expect(page.locator('#photo-proofreader details')).toContainText(entry.includes('zh')?'标记为待确认':'Mark unclear');
 await expect(page.locator('#photo-proofreader [data-case-action=sample],#scan-assistant form,#catalog-tester input')).toHaveCount(0);
 await page.locator('[data-job-reset]').click();await expect(page.locator('.job-card:visible')).toHaveCount(4);
 await page.locator('#job-keyword').fill('R-4829');await page.locator('#job-search button[type=submit]').click();await expect(page.locator('.job-card:visible')).toHaveCount(1);
 await page.locator('[data-case-action=sample]').click();await expect(page.locator('#reservation-search')).toBeVisible();expect((await state(page)).evidence).toEqual(['C1']);
});
for(const width of [390,768,1280,1440])for(const entry of ['index-zh.html','index.html'])test(`${entry} ${width}px: three identities fit, postcard and handbook work, and album zoom supports keyboard close`,async({page})=>{
 await page.setViewportSize({width,height:900});await quietClock(page);await page.goto('/'+entry+'#forum');
 for(const hash of ['forum','careers','hotel']){await route(page,hash);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await expect(page.locator('.hotel-hero h1')).toHaveText(entry.includes('zh')?'欢迎来到静水旅馆':'Welcome to Stillwater');
 await page.locator('[data-hotel-postcard]').click();await expect(page.locator('.hotel-postcard-back')).toBeVisible();await expect(page.locator('.hotel-postcard-back')).toContainText('7:00–9:00');
 await page.locator('[data-hotel-postcard]').press('Space');await expect(page.locator('.hotel-postcard-front')).toBeVisible();
 await page.locator('.hotel-guest-guide summary').click();await expect(page.locator('.hotel-guest-guide li')).toHaveCount(3);
 await page.locator('.hotel-useful-links a[href="#gallery"]').click();await expect(page.locator('.hotel-gallery-grid figure')).toHaveCount(10);
 const button=page.locator('[data-hotel-photo]').first();await button.focus();await button.press('Enter');await expect(page.locator('#hotel-lightbox')).toBeVisible();await page.keyboard.press('Escape');await expect(button).toBeFocused();
 await route(page,'guestbook');await expect(page.locator('.ordinary-guest-entry')).toHaveCount(4);await expect(page.locator('.case-message')).toHaveCount(0);
 await route(page,'rooms');expect((await page.locator('.room-inventory').innerText()).split(/\s+/)).not.toContain('317');
 expect((await state(page))?.evidence||[]).toEqual([]);
});
test('the completed sample withdraws only the main vacancy and retains all three archived positions',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('stillwater-case:v2',JSON.stringify({schema:2,evidence:['C1','C2','C3','C4','C5','C6','C7','C8','C9'],completed:{audit:true,finalEvidence:true},night:{started:true,door:true,frame:true,links:[0,1],orientations:[2,1,2,0,3,0],isolated:true,manual:true,saved:true,locked:true,released:true,operations:9},endings:['released'],lastEnding:'released'})));
 await page.goto('/index-zh.html#careers');await expect(page.locator('.job-card')).toHaveCount(4);await expect(page.locator('#archive-job')).toContainText('岗位已撤下');await expect(page.locator('[data-case-action=sample]')).toHaveCount(0);await expect(page.locator('#scan-assistant')).toContainText('招募已结束');
});
