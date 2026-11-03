import { test, expect } from './v2-fixture.mjs';

async function start(page,entry='index-zh.html') {
  await page.addInitScript(()=>{Math.random=()=>0;});
  await page.clock.install({time:new Date('2026-11-03T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-11-03T12:00:01Z'));
  await page.goto('/'+entry+'#forum');
}
const card=(page,id)=>page.locator(`[data-active-ad="${id}"]`);
const pageLayout=page=>page.evaluate(()=>{
  const body=getComputedStyle(document.body);
  return {
    boxes:['#case-shell','#content'].map(selector=>document.querySelector(selector).getBoundingClientRect().toJSON()),
    pageHeight:document.documentElement.scrollHeight,
    scrollY, shellScroll:document.querySelector('#case-shell').scrollTop,
    padding:[body.paddingTop,body.paddingRight,body.paddingBottom,body.paddingLeft],
    overflow:body.overflow,
  };
});
async function fits(page,before) {
  const geometry=await page.evaluate(()=>{
    const shell=document.querySelector('#case-shell').getBoundingClientRect();
    return {width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,
      shell:{left:shell.left,right:shell.right,top:shell.top,bottom:shell.bottom},
      windows:[...document.querySelectorAll('[data-active-ad]')].map(el=>{
        const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};
      })};
  });
  expect(geometry.overflow).toBe(false);
  for(const r of geometry.windows) {
    expect(r.left).toBeGreaterThanOrEqual(-1);
    expect(r.top).toBeGreaterThanOrEqual(-1);
    expect(r.right).toBeLessThanOrEqual(geometry.width+1);
    expect(r.bottom).toBeLessThanOrEqual(geometry.height+1);
    const s=geometry.shell;
    expect(s.left<r.right&&s.right>r.left&&s.top<r.bottom&&s.bottom>r.top).toBe(true);
  }
  if(before)expect(await pageLayout(page)).toEqual(before);
}

for(const entry of ['index-zh.html','index.html']) {
  test(`${entry}: two independent retro windows appear around the page, with no manual carousel`,async({page})=>{
    await page.setViewportSize({width:1440,height:900});
    await start(page,entry);
    const before=await pageLayout(page);
    await expect(page.locator('.ad-inline,[data-ad-action=next-inline]')).toHaveCount(0);
    await page.clock.runFor(8000);
    await expect(page.locator('[data-active-ad]')).toHaveCount(0);
    await page.clock.runFor(32000);
    await expect(page.locator('[data-active-ad]')).toHaveCount(2);
    await expect(card(page,'pet')).toHaveAttribute('data-slot','top-left');
    await expect(card(page,'cinema')).toHaveAttribute('data-slot','bottom-right');
    await fits(page,before);
    const coversPost=await card(page,'pet').evaluate(el=>{
      const a=el.getBoundingClientRect(),p=document.querySelector('.bbs-post').getBoundingClientRect();
      const left=Math.max(a.left,p.left),right=Math.min(a.right,p.right);
      const top=Math.max(a.top,p.top),bottom=Math.min(a.bottom,p.bottom);
      if(right<=left||bottom<=top)return false;
      const x=(left+right)/2,y=(top+bottom)/2;
      const front=el.contains(document.elementFromPoint(x,y));
      el.style.visibility='hidden';
      const behind=document.elementFromPoint(x,y)?.closest('.bbs-post');
      el.style.visibility='';
      return front&&!!behind;
    });
    expect(coversPost).toBe(true);
    await card(page,'cinema').locator('[data-ad-action=detail]').click();
    await expect(page.locator('#ad-dialog-title')).toHaveText(entry.includes('zh')?'红沙发电影屋':'Red Sofa Picture House');
    await page.keyboard.press('Escape');
    await card(page,'pet').locator('[data-ad-action=collapse]').click();
    await expect(card(page,'pet')).toHaveAttribute('data-folded','true');
    await expect(card(page,'pet').locator('.ad-card-body')).toHaveCount(0);
    await expect(card(page,'cinema').locator('.ad-card-body')).toBeVisible();
    expect(await pageLayout(page)).toEqual(before);
    await card(page,'pet').locator('[data-ad-action=collapse]').click();
    await expect(card(page,'pet').locator('.ad-card-body')).toBeVisible();
    await card(page,'pet').locator('[data-ad-action=close]').click();
    await expect(card(page,'pet')).toHaveCount(0);
    await expect(card(page,'cinema')).toBeVisible();
    expect(await pageLayout(page)).toEqual(before);
    expect(await page.evaluate(()=>localStorage.getItem('stillwater-case:v2'))).toBeNull();
  });
}

test('selective blinking and border lights follow reduced-motion settings',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await start(page);
  await page.clock.runFor(40000);
  expect(await card(page,'cinema').locator('.ad-teaser').evaluate(el=>getComputedStyle(el).animationName)).toBe('ad-letter-blink');
  await card(page,'pet').locator('[data-ad-action=close]').click();
  await page.clock.runFor(24000);
  await expect(card(page,'repair')).toBeVisible();
  expect(await card(page,'repair').evaluate(el=>getComputedStyle(el).animationName)).toContain('ad-border-lights');
  await page.emulateMedia({reducedMotion:'reduce'});
  expect(await card(page,'cinema').locator('.ad-teaser').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  expect(await card(page,'repair').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});

for(const width of [320,390,768]) {
  test(`${width}px: top and bottom windows overlay the page without changing its layout or scroll position`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await start(page);
    await page.evaluate(()=>window.scrollTo(0,320));
    const before=await pageLayout(page);
    await page.clock.runFor(40000);
    await expect(page.locator('[data-active-ad]')).toHaveCount(1);
    await fits(page,before);
    for(const button of await card(page,'pet').locator('header button').all()) {
      expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
    }
    await page.evaluate(()=>{Math.random=()=>.3;});
    await card(page,'pet').locator('[data-ad-action=close]').click();
    await page.clock.runFor(24000);
    await expect(page.locator('[data-active-ad]')).toHaveCount(1);
    await expect(page.locator('[data-active-ad]')).toHaveAttribute('data-slot',/^bottom/);
    await fits(page,before);
    await page.locator('#ad-host [data-ad-action=close]').click();
    expect(await pageLayout(page)).toEqual(before);
  });
}

test('shrinking two windows to a phone keeps one and preserves both saved ads',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await start(page);
  await page.clock.runFor(40000);
  for(const id of ['pet','cinema']) await card(page,id).locator('[data-ad-action=pin]').click();
  await page.setViewportSize({width:390,height:900});
  await expect(page.locator('[data-active-ad]')).toHaveCount(1);
  await fits(page);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-ads:v1')).pinnedIds)).toEqual(['pet','cinema']);
});

test('an existing three-ad session resumes the new campaign without losing history or saved shops',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('stillwater-ads:v1',JSON.stringify({schema:1,pinnedIds:['cats'],collapsedPinnedIds:[]}));
    sessionStorage.setItem('stillwater-ads-session:v1',JSON.stringify({schema:1,shownThisSession:['pet','cinema','repair'],dismissedThisSession:['pet'],remaining:150000,navigatedSinceShow:false,lastRoute:'forum',forumReadMs:35000}));
  });
  await start(page);
  await page.clock.runFor(45000);
  await expect(card(page,'secondhand')).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('stillwater-ads-session:v1')).shownThisSession)).toEqual(['pet','cinema','repair','secondhand']);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-ads:v1')).pinnedIds)).toEqual(['cats']);
});
