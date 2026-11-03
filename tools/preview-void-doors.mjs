import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {createServer} from '../server.mjs';
import {solveVoid} from '../tests/v2-void-helpers.mjs';

const directory='docs/v2.6.2-preview';
await mkdir(directory,{recursive:true});
const server=createServer();
await new Promise(resolve=>server.listen(3276,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const errors=[],records=[];
try {
  for(const width of [1440,375]) {
    const context=await browser.newContext({baseURL:'http://127.0.0.1:3276',viewport:{width,height:1000}});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{
      localStorage.setItem('stillwater-case-intro:v1',JSON.stringify({schema:1,read:true}));
      localStorage.setItem('stillwater-case:v2',JSON.stringify({schema:2,evidence:['C1','C2','C3','C4','C5','C6','C7','C8','C9'],completed:{audit:true,finalEvidence:true},night:{started:true,links:[0,1],door:true,frame:true,orientations:[2,1,2,0,3,0],isolated:true,manual:true,saved:true,operations:6,void:{schema:1}},preferences:{skipScares:true,scareChoiceMade:true}}));
    });
    await page.goto('/index-zh.html#terminal');
    await expect(page.locator('.maintenance-label')).toContainText('员工记录同步');
    await expect(page.locator('.maintenance-label')).toContainText('AUTO-WRITE 是酒店原有的自动写入线路。只要线路保持连接，系统就会继续更新夜班员工名单。');
    await page.locator('.maintenance-label').screenshot({path:`${directory}/${width}-wiring-label.png`,animations:'disabled'});
    await page.locator('[data-unlisted-entry]').click();
    const capture=async name=>{
      await page.locator('.void-frame').screenshot({path:`${directory}/${width}-${name}.png`,animations:'disabled'});
      records.push({width,name,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)});
    };
    await page.locator('[data-void-action=observe][data-target=left]').click();await capture('corridor');
    await page.locator('[data-void-action=observe][data-target=reference]').click();await capture('reference');
    await solveVoid(page,{lookback:false,visit:async stage=>{
      if(['void-fragments','void-reviewed','void-return'].includes(stage))await capture(stage);
    }});
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-case:v2')).night.void.complete)).toBe(true);
    await context.close();
  }
  for(const entry of ['index-zh.html','index.html']) {
    const context=await browser.newContext({baseURL:'http://127.0.0.1:3276',viewport:{width:1280,height:900}}),page=await context.newPage();
    await page.goto('/'+entry);
    await expect(page.locator('#case-welcome')).not.toContainText('从朋友的群聊开始');
    await expect(page.locator('#case-welcome')).not.toContainText('Every necessary clue is inside the game');
    await page.locator('#case-welcome').screenshot({path:`${directory}/${entry.includes('zh')?'zh':'en'}-welcome.png`,animations:'disabled'});
    await context.close();
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
await writeFile(`${directory}/results.json`,JSON.stringify({records,errors,captureMode:'local-preview'},null,2)+'\n');
expect(errors).toEqual([]);expect(records.every(record=>!record.overflow)).toBe(true);
console.log(JSON.stringify({frames:records.length,errors,captureMode:'local-preview'}));
