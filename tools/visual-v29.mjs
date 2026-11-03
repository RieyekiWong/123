import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {createServer} from '../server.mjs';
const directory='docs/v2.9';await mkdir(directory,{recursive:true});
const server=createServer();await new Promise(resolve=>server.listen(3279,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const records=[],errors=[];
try{
 for(const entry of ['index-zh.html','index.html'])for(const width of [390,768,1280,1440]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.addInitScript(()=>localStorage.setItem('stillwater-case-intro:v1','{"schema":1,"read":true}'));
  await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
  await page.goto(`http://127.0.0.1:3279/${entry}#forum`);
  const prefix=`${entry.includes('zh')?'zh':'en'}-${width}`;
  for(const route of ['forum','careers','hotel']){
   await page.evaluate(route=>{location.hash=route;},route);await expect(page.locator('body')).toHaveAttribute('data-site',route);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.screenshot({path:`${directory}/${prefix}-${route}.jpg`,type:'jpeg',quality:83,fullPage:true,animations:'disabled'});
   records.push({entry,width,route,overflow:false});
  }
  await page.locator('[data-hotel-postcard]').click();await expect(page.locator('.hotel-postcard-back')).toBeVisible();
  await page.locator('.hotel-ephemera').screenshot({path:`${directory}/${prefix}-postcard.png`,animations:'disabled'});
  await page.evaluate(()=>{location.hash='gallery';});await page.locator('[data-hotel-photo]').first().click();
  await expect(page.locator('#hotel-lightbox')).toBeVisible();await page.screenshot({path:`${directory}/${prefix}-album.jpg`,type:'jpeg',quality:83,animations:'disabled'});await page.keyboard.press('Escape');
  await page.evaluate(()=>{location.hash='careers';});await page.locator('[name=work]').selectOption('remote');await page.locator('#job-keyword').fill(entry.includes('zh')?'照片':'photo');await page.locator('#job-search button[type=submit]').click();await page.locator('#photo-proofreader summary').click();
  await expect(page.locator('.job-card:visible')).toHaveCount(1);await page.locator('.career-content-layout').screenshot({path:`${directory}/${prefix}-filtered.png`,animations:'disabled'});
  if(width===1440)for(const topic of ['used-monitor','travel-brochure','welcome-rules']){
   await page.evaluate(topic=>{location.hash='forum?topic='+topic;},topic);await expect(page.locator('[data-thread]')).toHaveAttribute('data-thread',topic);
   await page.screenshot({path:`${directory}/${prefix}-${topic}.jpg`,type:'jpeg',quality:83,fullPage:true,animations:'disabled'});
  }
  await context.close();
 }
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
  await page.addInitScript(()=>{localStorage.setItem('stillwater-case-intro:v1','{"schema":1,"read":true}');Math.random=()=>.3;});await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
  await page.goto(`http://127.0.0.1:3279/index-zh.html#chat`);await page.locator('#chat-input').fill('这条先留着，等会儿发');await page.clock.runFor(12000);
  await expect(page.locator('[data-active-ad]')).toHaveCount(1);await expect(page.locator('[data-active-ad]')).toHaveAttribute('data-slot','bottom-right');await page.screenshot({path:`${directory}/zh-${width}-chat-ad.jpg`,type:'jpeg',quality:83,animations:'disabled'});records.push({entry:'index-zh.html',width,route:'chat',ad:'bottom-right'});await context.close();
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
await writeFile(`${directory}/visual-results.json`,JSON.stringify({records,errors},null,2)+'\n');expect(errors).toEqual([]);console.log(JSON.stringify({layouts:records.length,errors}));
