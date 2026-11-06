import { chromium, expect } from '../../../node_modules/@playwright/test/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const folder=fileURLToPath(new URL('.',import.meta.url));
const base=process.env.REUSE_BASE_URL||'http://127.0.0.1:3135/xueli-21-chapter-01/reuse/';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const report={testedAt:new Date().toISOString(),base,errors:[],apiRequests:[],runs:[]};
await mkdir(folder+'screens',{recursive:true});
try {
  for(const width of [1440,390,320]) {
    const page=await browser.newPage({viewport:{width,height:1000}});
    page.on('pageerror',e=>report.errors.push(e.message));
    await page.route('**/api/**',route=>{report.apiRequests.push(route.request().url());return route.abort();});
    await page.goto(base);await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(()=>{localStorage.setItem('stillwater-case:v2','untouched-case');localStorage.setItem('stillwater-chat:v1','untouched-chat');localStorage.setItem('stillwater-xueli-sample:v1','untouched-sample');});
    await expect(page.locator('.reuse-item')).toHaveCount(28);
    await expect(page.locator('.reuse-item img')).toHaveCount(28);
    await expect.poll(()=>page.locator('.reuse-item img').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0&&img.getBoundingClientRect().width===48&&img.getBoundingClientRect().height===48))).toBe(true);
    if(width!==320)await page.screenshot({path:folder+`screens/gallery-${width}.png`,fullPage:false});
    await page.locator('[data-filter="components"]').click();
    await expect(page.locator('.reuse-item')).toHaveCount(19);
    await expect(page.locator('.reuse-status').first()).toContainText('尚非整图');
    await expect.poll(()=>page.locator('img').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth))).toBe(true);
    await expect(page.locator('.reuse-sprite').first()).toHaveCSS('width','48px');
    if(width===1440)await page.screenshot({path:folder+'screens/components-1440.png',fullPage:false});
    await page.locator('[data-filter="original"]').click();
    await expect(page.locator('.reuse-item')).toHaveCount(21);
    await expect(page.locator('.reuse-placeholder')).toHaveCount(21);
    await page.locator('[data-filter="existing"]').click();
    await expect(page.locator('.reuse-item')).toHaveCount(1);
    await expect(page.locator('.reuse-item img')).toHaveCount(0);
    await page.locator('[data-filter="all"]').focus();await page.keyboard.press('Enter');
    await expect(page.locator('.reuse-item')).toHaveCount(69);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    expect(overflow).toBe(false);
    expect(await page.evaluate(()=>['stillwater-case:v2','stillwater-chat:v1','stillwater-xueli-sample:v1'].map(key=>localStorage.getItem(key)))).toEqual(['untouched-case','untouched-chat','untouched-sample']);
    report.runs.push({width,ready:28,components:19,original:21,existing:1,all:69,iconImagesLoaded:true,keyboardFilter:true,storageUntouched:true,overflow});
    await page.close();
  }
  expect(report.errors).toEqual([]);expect(report.apiRequests).toEqual([]);report.passed=true;
}catch(error){report.passed=false;report.failure=String(error.stack||error);throw error;}
finally{await writeFile(folder+'browser-checks.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser.close();}
