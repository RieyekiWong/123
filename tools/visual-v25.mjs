import {chromium} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createServer} from '../server.mjs';
import {toAudit,toRevisions,toReview,validateFindings,toNight,wireNight,link} from '../tests/v2-helpers.mjs';

const dir='docs/v2.5';await mkdir(dir,{recursive:true});
const chatOnly=process.argv.includes('--chat-only');
const retained=chatOnly?JSON.parse(await readFile(`${dir}/visual-results.json`,'utf8')):{records:[],errors:[]};
const server=createServer();await new Promise(resolve=>server.listen(3275,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const records=retained.records,errors=retained.errors;
async function capture(page,name) {
  await page.locator('img:not([loading=lazy])').evaluateAll(images=>Promise.all(images.map(image=>image.decode().catch(()=>{}))));
  await page.screenshot({path:`${dir}/${name}.jpg`,type:'jpeg',quality:82,animations:'disabled'});
  const result=await page.evaluate(()=>({route:location.hash,width:innerWidth,
    overflow:document.documentElement.scrollWidth>innerWidth+1,
    chat:document.body.dataset.site==='chat',ads:document.querySelectorAll('[data-active-ad]').length,
    legacyLinks:document.querySelectorAll('a[href*=classic],a[href*=legacy]').length,
    cameraDates:[...document.querySelectorAll('.cctv-osd.bottom')].map(el=>el.textContent)}));
  const index=records.findIndex(record=>record.name===name);
  if(index>=0)records[index]={name,...result};else records.push({name,...result});
}
try {
  for(const entry of ['index-zh.html','index.html'])for(const width of [1440,375]) {
    const context=await browser.newContext({baseURL:'http://127.0.0.1:3275',viewport:{width,height:900}});
    const page=await context.newPage(),prefix=`${entry.includes('zh')?'zh':'en'}-${width}`;
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
    await page.addInitScript(()=>{Math.random=()=>0;});
    await page.clock.install({time:new Date('2026-11-03T12:00:00Z')});
    await page.clock.pauseAt(new Date('2026-11-03T12:00:01Z'));
    await page.goto('/'+entry);await capture(page,prefix+'-preface');
    await page.locator('[data-welcome=enter]').click();await capture(page,prefix+'-chat-start');
    await page.locator('#chat-input').fill(entry.includes('zh')?'刚起，作业还没弄完':'Just woke up. Still have homework to finish.');
    await page.locator('#chat-input').press('Enter');await page.clock.runFor(124000);
    await capture(page,prefix+'-chat-middle');
    await page.locator('#chat-input').fill(entry.includes('zh')?'发链接我看看':'Send me the link');
    await page.locator('#chat-input').press('Enter');await page.clock.runFor(4000);
    await capture(page,prefix+'-chat-share');
    if(chatOnly){await context.close();continue;}
    await page.locator('.chat-share-card').click();await capture(page,prefix+'-forum');
    await page.clock.runFor(45000);await capture(page,prefix+'-forum-popups');
    while(await page.locator('[data-active-ad]').count())await page.locator('#ad-host [data-ad-action=close]').first().click();
    await page.locator('.forum-recruit-link').click();await capture(page,prefix+'-careers');
    await page.locator('[data-case-action=sample]').click();await page.locator('.hotel-nav a[href="#hotel"]').click();
    await capture(page,prefix+'-hotel');
    await page.clock.resume();
    await toAudit(page,entry+'#forum');await toRevisions(page);await capture(page,prefix+'-archive');
    await toReview(page);await validateFindings(page);await capture(page,prefix+'-review');
    await toNight(page,stage=>capture(page,prefix+'-'+stage));
    await wireNight(page);await capture(page,prefix+'-terminal-wired');
    for(const ending of ['auto-close','unverified']) {
      await page.locator(`[data-ending=${ending}]`).click();await capture(page,prefix+'-'+ending);
      if(ending==='auto-close') {await page.locator('.ending-staff-card').scrollIntoViewIfNeeded();await capture(page,prefix+'-auto-close-staff');}
      await link(page,'terminal');
    }
    await page.locator('[data-night-action=lock]').click();await page.locator('[data-ending=released]').click();
    await page.locator('[data-ending-complete=released]').waitFor({state:'visible'});
    await capture(page,prefix+'-game-over');
    await context.close();
  }
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
await writeFile(`${dir}/visual-results.json`,JSON.stringify({records,errors},null,2)+'\n');
const overflow=records.filter(r=>r.overflow),invalidDates=records.filter(r=>r.cameraDates.some(date=>!date.includes('2006-10-17')));
console.log(JSON.stringify({screenshots:records.length,overflow,invalidDates,legacyLinks:records.filter(r=>r.legacyLinks),errors}));
if(overflow.length||invalidDates.length||errors.length)process.exitCode=1;
