import {chromium}from '@playwright/test';
import {mkdir,writeFile}from 'node:fs/promises';
import {createServer}from '../server.mjs';
const dir='docs/v2.4.1';await mkdir(dir,{recursive:true});
const server=createServer();await new Promise(r=>server.listen(3268,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const records=[],errors=[];
try{
 for(const lang of ['zh','en'])for(const width of [375,390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:3268/${lang==='zh'?'index-zh.html':'index.html'}`);
  const welcome=page.locator('#case-welcome');await welcome.waitFor();
  await page.screenshot({path:`${dir}/${lang}-${width}-welcome.jpg`,type:'jpeg',quality:82});
  records.push({lang,width,route:'welcome',overflow:await welcome.evaluate(el=>el.scrollWidth>el.clientWidth+1),facesChecked:await page.locator('[name=faces]').isChecked(),soundChecked:await page.locator('[name=sound]').isChecked()});
  await page.locator('[data-welcome=enter]').click();
  await page.screenshot({path:`${dir}/${lang}-${width}-forum.jpg`,type:'jpeg',quality:78,fullPage:true});
  records.push({lang,width,route:'forum',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)});
  await context.close();
 }
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900}});
  await context.addInitScript(()=>{
   localStorage.setItem('stillwater-case-intro:v1',JSON.stringify({schema:1,read:true}));
   localStorage.setItem('stillwater-case:v2',JSON.stringify({schema:2,evidence:['C1','C2','C3','C4','C5','C6','C7','C8','C9'],completed:{audit:true,finalEvidence:true},night:{started:true,links:[0,1],door:true,frame:true,events:['last-frame'],orientations:[2,1,2,0,3,0],isolated:true,manual:true,saved:true,locked:true,operations:9}}));
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3268/index-zh.html#terminal');
  await page.clock.install({time:new Date('2026-11-03T04:00:00Z')});await page.clock.pauseAt(new Date('2026-11-03T04:00:01Z'));
  await page.locator('[data-ending=released]').click();await page.locator('[data-ending-record=released]').waitFor();
  await page.clock.runFor(1800);await page.locator('.escape-scare').waitFor();
  await page.screenshot({path:`${dir}/zh-${width}-escape.jpg`,type:'jpeg',quality:82});
  records.push({lang:'zh',width,route:'escape',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)});
  await context.close();
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}
await writeFile(`${dir}/visual-results.json`,JSON.stringify({records,errors},null,2)+'\n');
console.log(JSON.stringify({screenshots:records.length,overflows:records.filter(r=>r.overflow),errors}));
if(errors.length||records.some(r=>r.overflow))process.exitCode=1;
