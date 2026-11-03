import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {createServer} from '../server.mjs';

const dir='docs/v2.4.4';await mkdir(dir,{recursive:true});
const server=createServer();await new Promise(r=>server.listen(3274,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const records=[],errors=[];
async function open(entry,width,rng=0) {
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.addInitScript(rng=>{Math.random=()=>rng;localStorage.setItem('stillwater-case-intro:v1','{"schema":1,"read":true}');},rng);
  await page.clock.install({time:new Date('2026-11-03T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-11-03T12:00:01Z'));
  await page.goto(`http://127.0.0.1:3274/${entry}`);
  return {context,page};
}
async function capture(page,name,card=false) {
  await page.locator('[data-active-ad] img').evaluateAll(ims=>Promise.all(ims.map(im=>im.decode())));
  const target=card?page.locator('[data-active-ad]'):page;
  await target.screenshot({path:`${dir}/${name}.jpg`,type:'jpeg',quality:82,animations:'disabled'});
  const layout=await page.evaluate(()=>{
    const s=document.querySelector('#case-shell').getBoundingClientRect();
    const small=innerWidth<1200;
    const windows=[...document.querySelectorAll('[data-active-ad]')].map(el=>{
      const r=el.getBoundingClientRect();
      return {id:el.dataset.activeAd,slot:el.dataset.slot,effect:el.dataset.popupEffect,
        overlaps:small?!(s.bottom<=r.top+1||s.top>=r.bottom-1):!(s.right<=r.left+1||s.left>=r.right-1)};
    });
    return {width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,windows};
  });
  records.push({name,...layout});
}
try {
  for(const entry of ['index-zh.html','index.html']) {
    const lang=entry.includes('zh')?'zh':'en';
    for(const width of [390,1440,1920]) {
      const {context,page}=await open(entry,width,width===1920?.78:0);
      await page.clock.runFor(70000);
      await capture(page,`${lang}-${width}-corners`);
      if(width===390) {
        await page.evaluate(()=>{Math.random=()=>.3;});
        await page.locator('#ad-host [data-ad-action=close]').click();
        await page.clock.runFor(24000);
        await capture(page,`${lang}-${width}-bottom`);
      }
      await context.close();
    }
    const {context,page}=await open(entry,1440);
    await page.clock.runFor(21000);
    for(const id of ['pet','cinema','repair','secondhand','print','cats','weather']) {
      await page.locator(`[data-active-ad=${id}]`).waitFor();
      await capture(page,`${lang}-shop-${id}`,true);
      await page.locator(`[data-active-ad=${id}] [data-ad-action=close]`).click();
      await page.clock.runFor(24000);
    }
    await context.close();
  }
} finally {await browser.close();await new Promise(r=>server.close(r));}
await writeFile(`${dir}/visual-results.json`,JSON.stringify({records,errors},null,2)+'\n');
const overflow=records.filter(r=>r.overflow),overlap=records.filter(r=>r.windows.some(w=>w.overlaps));
console.log(JSON.stringify({screenshots:records.length,overflow,overlap,errors}));
if(overflow.length||overlap.length||errors.length)process.exitCode=1;
