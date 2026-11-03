import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {createServer} from '../server.mjs';
const directory='docs/v2.7';await mkdir(directory,{recursive:true});
const server=createServer();await new Promise(resolve=>server.listen(3277,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const ids=['pet','cinema','repair','secondhand','print','cats','weather'],records=[],errors=[];
try {
  for(const entry of ['index-zh.html','index.html'])for(const width of [375,1440]) {
    const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
    await page.addInitScript(ids=>{
      localStorage.setItem('stillwater-case-intro:v1','{"schema":1,"read":true}');
      localStorage.setItem('stillwater-ads:v1',JSON.stringify({schema:1,pinnedIds:ids,collapsedPinnedIds:[]}));
      Math.random=()=>.3;
    },ids);
    await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
    await page.goto(`http://127.0.0.1:3277/${entry}#forum`);
    const before=await page.locator('#case-shell').boundingBox();const layouts=[];
    for(const id of ids) {
      await page.locator('footer [data-ad-action=folder]').click();
      await page.locator(`#ad-dialog [data-ad-action=reopen][data-ad-id=${id}]`).click();
      await page.evaluate(()=>window.scrollTo(0,0));
      const popup=page.locator(`[data-active-ad=${id}]`);
      await expect(popup).toBeVisible();
      await popup.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
      const data=await popup.evaluate(el=>{
        const r=el.getBoundingClientRect();return {layout:el.dataset.layout,slot:el.dataset.slot,width:innerWidth,box:{x:r.x,y:r.y,width:r.width,height:r.height},overflow:document.documentElement.scrollWidth>innerWidth};
      });layouts.push(data.layout);records.push({entry,id,...data});
      expect(data.overflow).toBe(false);expect(data.box.x).toBeGreaterThanOrEqual(0);
      expect(data.box.x+data.box.width).toBeLessThanOrEqual(width+1);
      expect(await page.locator('#case-shell').boundingBox()).toEqual(before);
      const prefix=`${entry.includes('zh')?'zh':'en'}-${width}-${id}`;
      await popup.screenshot({path:`${directory}/${prefix}.png`,animations:'disabled'});
      if(['cats','secondhand'].includes(id))await page.screenshot({path:`${directory}/${prefix}-page.jpg`,type:'jpeg',quality:82,animations:'disabled'});
      await popup.locator('[data-ad-action=detail]').click();
      await expect(page.locator('.ad-mini-site')).toBeVisible();
      await expect(page.locator('.ad-mini-site input,.ad-mini-site iframe,.ad-mini-site audio')).toHaveCount(0);
      await page.keyboard.press('Escape');await popup.locator('[data-ad-action=close]').click();
    }
    expect(new Set(layouts).size).toBe(7);await context.close();
  }
  for(const entry of ['index-zh.html','index.html'])for(const width of [375,1440]) {
    const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(()=>{localStorage.setItem('stillwater-case-intro:v1','{"schema":1,"read":true}');Math.random=()=>0;});
    await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
    await page.goto(`http://127.0.0.1:3277/${entry}#forum`);
    if(width===1440) {await page.clock.runFor(7000);await page.evaluate(()=>{Math.random=()=>.3;});await page.clock.runFor(10000);}
    else {await page.evaluate(()=>{Math.random=()=>.3;});await page.clock.runFor(17000);}
    const windows=await page.locator('[data-active-ad]').evaluateAll(els=>els.map(el=>({id:el.dataset.activeAd,layout:el.dataset.layout,slot:el.dataset.slot})));
    expect(windows.some(window=>window.slot==='bottom-right')).toBe(true);
    if(width===1440){expect(windows.some(window=>window.layout==='classic')).toBe(true);expect(windows.some(window=>window.layout!=='classic')).toBe(true);}
    await page.screenshot({path:`${directory}/${entry.includes('zh')?'zh':'en'}-${width}-automatic.jpg`,type:'jpeg',quality:86,animations:'disabled'});
    records.push({entry,width,id:'automatic',windows});await context.close();
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
await writeFile(`${directory}/visual-results.json`,JSON.stringify({records,errors},null,2)+'\n');
expect(errors).toEqual([]);console.log(JSON.stringify({campaignViews:records.filter(record=>record.id!=='automatic').length,mixedViews:records.filter(record=>record.id==='automatic').length,errors}));
