import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from '../server.mjs';

const dir='docs/v2.4.3';await mkdir(dir,{recursive:true});
const server=createServer();await new Promise(r=>server.listen(3270,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const records=[],errors=[];
try {
  for(const entry of ['index-zh.html','index.html']) for(const width of [320,390,1440]) {
    const context=await browser.newContext({viewport:{width,height:900}});
    await context.addInitScript(()=>{
      localStorage.setItem('stillwater-case-intro:v1',JSON.stringify({schema:1,read:true}));
      localStorage.setItem('stillwater-case:v2',JSON.stringify({schema:2,
        evidence:['C1','C2','C3','C4','C5','C6','C7','C8','C9'],completed:{audit:true,finalEvidence:true},
        night:{started:true,door:true,links:[0,1],frame:true,events:['last-frame'],orientations:[2,1,2,0,3,0],isolated:true,manual:true,saved:true,locked:!location.hash.startsWith('#terminal'),operations:9},
        endings:['auto-close','unverified','released'],lastEnding:location.hash.startsWith('#terminal')?'unverified':'released',preferences:{skipScares:true,scareChoiceMade:true}}));
    });
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    for(const ending of ['auto-close','unverified','released']) {
      await page.goto(`http://127.0.0.1:3270/${entry}#ending?view=${ending}`);
      const panel=page.locator(`[data-ending-complete=${ending}]`);await panel.waitFor();
      await page.screenshot({path:`${dir}/${entry.includes('zh')?'zh':'en'}-${width}-${ending}.jpg`,type:'jpeg',quality:83});
      records.push({entry,width,ending,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),
        legacyLinks:await page.locator('a[href*=classic]').count(),title:await page.title()});
    }
    await page.goto(`http://127.0.0.1:3270/${entry}#terminal`);
    await page.reload(); // Re-seed the unlocked terminal in a new document.
    await page.locator('[data-night-action=lock]').click();
    await page.locator('[data-ending=released]').waitFor();
    await page.screenshot({path:`${dir}/${entry.includes('zh')?'zh':'en'}-${width}-exit.jpg`,type:'jpeg',quality:83});
    records.push({entry,width,ending:'exit-control',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),legacyLinks:await page.locator('a[href*=classic]').count()});
    await context.close();
  }
} finally {await browser.close();await new Promise(r=>server.close(r));}
await writeFile(`${dir}/visual-results.json`,JSON.stringify({records,errors},null,2)+'\n');
console.log(JSON.stringify({screenshots:records.length,overflows:records.filter(r=>r.overflow),legacyLinks:records.filter(r=>r.legacyLinks),errors}));
if(errors.length||records.some(r=>r.overflow||r.legacyLinks))process.exitCode=1;
