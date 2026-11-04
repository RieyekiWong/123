import { test, expect } from './v2-fixture.mjs';
import { solveVoid } from './v2-void-helpers.mjs';

async function terminal(page,{entry='index-zh.html',skip=true,frame=true,locked=false}={}) {
  await page.addInitScript(({skip,frame,locked})=>{
    if (sessionStorage.getItem('ending-test-seed')) return;
    sessionStorage.setItem('ending-test-seed','1');
    localStorage.setItem('stillwater-hotel:v2','{"name":"Preserved guest","chapter":2}');
    localStorage.setItem('stillwater-case:v2',JSON.stringify({
      schema:2,evidence:['C1','C2','C3','C4','C5','C6','C7','C8','C9'],
      completed:{audit:true,finalEvidence:true},
      night:{started:true,door:true,links:[0,1],frame,events:frame?['last-frame']:[],
        orientations:[2,1,2,0,3,0],isolated:true,manual:true,saved:locked,locked,operations:9},
      preferences:{skipScares:skip,scareChoiceMade:true}
    }));
  },{skip,frame,locked});
  await page.goto('/'+entry+'#terminal');
}
async function freeze(page) {
  await page.clock.install({time:new Date('2026-11-03T10:00:00Z')});
  await page.clock.pauseAt(new Date('2026-11-03T10:00:01Z'));
}

for (const entry of ['index-zh.html','index.html']) {
  test(`${entry}: saving leads to the missing frame, then lock and the actual exit`,async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await terminal(page,{entry,frame:false});
    await page.locator('[data-night-action=save]').click();
    await expect(page.locator('[data-night-action=frame]')).toBeFocused();
    await expect(page.locator('[data-night-action=frame]')).toBeInViewport();
    await page.locator('[data-night-action=frame]').click();
    await expect(page.locator('[data-unlisted-entry]')).toBeFocused();
    await page.locator('[data-unlisted-entry]').click();
    await solveVoid(page);
    await expect(page.locator('[data-night-action=lock]')).toBeFocused();
    await page.locator('[data-night-action=lock]').click();
    await expect(page.locator('[data-ending=released]')).toBeFocused();
    await expect(page.locator('[data-ending=released]')).toBeInViewport();
    await expect(page.locator('#night-feedback')).not.toContainText(entry.includes('zh')?'还需锁定':'before ending');
    await page.locator('[data-ending=released]').click();
    await expect(page.getByRole('heading',{name:'GAME OVER',exact:true})).toBeVisible();
    await expect(page.locator('[data-ending-complete=released]')).toContainText(entry.includes('zh')?'故事到这里结束':'story ends here');
    await page.reload();
    await expect(page.getByRole('heading',{name:'GAME OVER',exact:true})).toBeVisible();
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-case:v2')).endings)).toContain('released');
  });

  test(`${entry}: all new-edition routes and obsolete hashes stay in this edition without legacy links or requests`,async({page})=>{
    test.setTimeout(60000);
    const oldRequests=[];
    page.on('request',r=>{if(/\/(?:classic(?:-zh)?\.html|classic-bridge\.js|app\.js|career\.js|branches\.js|locale-zh\.js)$/.test(new URL(r.url()).pathname))oldRequests.push(r.url());});
    await terminal(page,{entry});
    const routes=await page.evaluate(()=>Object.keys(StillwaterCaseState.routes));
    for(const route of [...routes,'below','surveillance','employees','guide']) {
      await page.goto('/'+entry+'#'+route);
      await expect(page).toHaveURL(new RegExp('/'+entry+'#'+route+'$'));
      await expect(page.locator('a[href*="classic"],a[href*="legacy"]')).toHaveCount(0);
    }
    await page.locator('[data-case-action=save-settings]').click();
    await expect(page.locator('#case-settings')).not.toContainText(entry.includes('zh')?'上一版':'Classic');
    expect(oldRequests).toEqual([]);
    expect(await page.evaluate(()=>localStorage.getItem('stillwater-hotel:v2'))).toContain('Preserved guest');
  });
}

test('GAME OVER follows the last face and remains visible after reload or read-only revisits',async({page})=>{
  await terminal(page,{skip:false,locked:true});
  await freeze(page);
  await page.locator('[data-ending=released]').click();
  const complete=page.locator('[data-ending-complete=released]');
  await expect(complete).toBeHidden();
  await page.clock.runFor(1800);
  await expect(page.locator('.escape-scare')).toBeVisible();
  await expect(complete).toBeHidden();
  await page.clock.runFor(1100);
  await expect(page.locator('.escape-scare')).toHaveCount(0);
  await expect(complete).toBeVisible();
  await expect(complete).toBeFocused();
  await expect(complete).toBeInViewport({ratio:.8});
  await page.reload();
  await expect(complete).toBeVisible();
  await page.clock.runFor(7000);
  await expect(page.locator('.escape-scare')).toHaveCount(0);
  await page.goto('/index-zh.html#notes');
  await page.goto('/index-zh.html#ending?view=released');
  await expect(complete).toBeVisible();
});

for (const mode of ['reduced','failed','stalled','escape']) {
  test(`the final completion cannot be lost to ${mode}`,async({page})=>{
    if(mode==='reduced') await page.emulateMedia({reducedMotion:'reduce'});
    let held;
    if(mode==='failed') await page.route('**/haunt-v442/escape.jpg',route=>route.abort());
    if(mode==='stalled') await page.route('**/haunt-v442/escape.jpg',route=>{held=route;});
    await terminal(page,{skip:false,locked:true});
    await freeze(page);
    await page.locator('[data-ending=released]').click();
    await expect(page.locator('[data-ending-record=released]')).toBeVisible();
    if(mode==='escape') await page.keyboard.press('Escape');
    await page.clock.runFor(6000);
    await expect(page.locator('[data-ending-complete=released]')).toBeVisible();
    await expect(page.locator('.escape-scare')).toHaveCount(0);
    if(held) await held.abort();
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-case:v2')).endings)).toContain('released');
  });
}

test('other outcomes are explicitly complete and starting again still requires confirmation',async({page})=>{
  await terminal(page,{locked:true});
  await page.locator('[data-ending=auto-close]').click();
  await expect(page.locator('[data-ending-complete=auto-close]')).toContainText('结局已达成');
  await expect(page.locator('.ending-staff-placeholder')).toHaveCount(1);
  await expect(page.locator('.ending-staff-card img')).toHaveCount(0);
  await page.locator('main a[href="#terminal"]').click();
  await page.locator('[data-ending=unverified]').click();
  await expect(page.locator('[data-ending-complete=unverified]')).toContainText('结局已达成');
  await page.locator('main a[href="#terminal"]').click();
  await page.locator('[data-ending=released]').click();
  await page.locator('.ending-actions [data-case-action=save-settings]').click();
  await expect(page.locator('.save-section')).toHaveAttribute('open','');
  await page.locator('[data-comfort=reset-prompt]').click();
  await page.locator('[data-comfort=reset-cancel]').click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-case:v2')).endings)).toHaveLength(3);
  await page.locator('[data-comfort=reset-prompt]').click();
  await page.locator('[data-comfort=reset-confirm]').click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-case:v2')).endings)).toEqual([]);
  expect(await page.evaluate(()=>localStorage.getItem('stillwater-hotel:v2'))).toContain('Preserved guest');
});
