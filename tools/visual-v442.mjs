import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from '../server.mjs';
import { wireNight } from '../tests/v2-helpers.mjs';

const dir='docs/v2.4.2';
await mkdir(dir,{recursive:true});
const server=createServer();
await new Promise(resolve=>server.listen(3269,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const records=[],errors=[];
try {
  for (const width of [390,1440]) {
    const context=await browser.newContext({viewport:{width,height:900}});
    await context.addInitScript(()=>{
      if (sessionStorage.getItem('v442-visual-seed')) return;
      sessionStorage.setItem('v442-visual-seed','yes');
      localStorage.setItem('stillwater-case-intro:v1',JSON.stringify({schema:1,read:true}));
      localStorage.setItem('stillwater-case:v2',JSON.stringify({
        schema:2,evidence:['C1','C2','C3','C4','C5','C6','C7','C8','C9'],
        completed:{audit:true,finalEvidence:true},
        night:{started:true,links:[0,1],door:true,pans:[2,1,2]},
        preferences:{skipScares:false,scareChoiceMade:true}
      }));
    });
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`);});
    await page.goto('http://127.0.0.1:3269/index-zh.html#service-passage');
    await page.clock.install({time:new Date('2026-11-03T04:00:00Z')});
    await page.clock.pauseAt(new Date('2026-11-03T04:00:01Z'));
    async function capture(name,selector) {
      if(selector) {
        await page.locator(selector).waitFor();
        await page.locator(selector+' img').evaluate(im=>im.decode());
      }
      await page.screenshot({path:`${dir}/${width}-${name}.jpg`,type:'jpeg',quality:84});
      records.push({width,name,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),
        image:selector?await page.locator(selector+' img').evaluate(im=>({src:im.getAttribute('src'),width:im.naturalWidth,height:im.naturalHeight,fit:getComputedStyle(im).objectFit})):null});
    }
    const act=target=>page.locator(`.space-actions [data-target=${target}]`).click();
    const walk=position=>page.locator(`[data-night-action=walk][data-position=${position}]`).click();
    await act('photo');
    await capture('corridor','.frame-face');
    await page.clock.runFor(2500);
    await walk('west');
    await act('cart');
    await act('cabinet');
    await capture('cabinet','.frame-face');
    await page.clock.runFor(600);
    await act('power');
    await walk('service');
    await act('enter');
    await page.locator('[data-night-action=frame]').click();
    await page.clock.runFor(1700);
    await capture('last-frame','.frame-face');
    await page.clock.runFor(900);
    await wireNight(page);
    await page.locator('.wiring-chassis').scrollIntoViewIfNeeded();
    await capture('wiring');
    await page.locator('[data-night-action=lock]').click();
    await page.locator('[data-ending=released]').click();
    await page.clock.runFor(1800);
    await capture('escape','.escape-scare');
    await page.clock.runFor(1200);
    await page.goto('http://127.0.0.1:3269/haunt-preview.html');
    await page.locator('main img').evaluateAll(ims=>Promise.all(ims.map(im=>im.decode())));
    await page.screenshot({path:`${dir}/${width}-preview.jpg`,type:'jpeg',quality:84,fullPage:true});
    records.push({width,name:'preview',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)});
    await context.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
await writeFile(`${dir}/visual-results.json`,JSON.stringify({records,errors},null,2)+'\n');
console.log(JSON.stringify({screenshots:records.length,overflows:records.filter(r=>r.overflow),errors}));
if(errors.length||records.some(r=>r.overflow)) process.exitCode=1;
