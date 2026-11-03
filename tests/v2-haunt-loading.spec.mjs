import { test, expect } from './v2-fixture.mjs';

async function seed(page,route='service-passage') {
  await page.addInitScript(()=>{
    localStorage.setItem('stillwater-case:v2',JSON.stringify({
      schema:2,evidence:['C1','C2','C3','C4','C5','C6','C7','C8','C9'],
      completed:{audit:true,finalEvidence:true},
      night:{started:true,links:[0,1],door:true,pans:[2,1,2]},
      preferences:{skipScares:false,scareChoiceMade:true}
    }));
  });
  await page.goto('/index-zh.html#'+route);
  await page.clock.install({time:new Date('2026-11-03T05:00:00Z')});
  await page.clock.pauseAt(new Date('2026-11-03T05:00:01Z'));
}

test('a slow scene image gets its whole visible duration after decode, rather than a blank timed overlay',async({page})=>{
  let release,requested;
  const gate=new Promise(resolve=>release=resolve);
  const requestSeen=new Promise(resolve=>requested=resolve);
  await page.route('**/assets/haunt-v442/corridor.jpg',async route=>{
    requested();
    await gate;
    await route.continue();
  });
  await seed(page);
  await page.locator('.space-actions [data-target=photo]').click();
  await requestSeen;
  await page.clock.runFor(5000);
  await expect(page.locator('.frame-face')).toHaveCount(0);
  release();
  await expect(page.locator('.frame-face')).toBeVisible();
  expect(await page.locator('.frame-face img').evaluate(im=>im.naturalWidth)).toBe(320);
  await page.clock.runFor(2399);
  await expect(page.locator('.frame-face')).toBeVisible();
  await page.clock.runFor(1);
  await expect(page.locator('.frame-face')).toHaveCount(0);
});

test('a failed recovered-frame image clears the signal dimming and retains its story information',async({page})=>{
  await page.route('**/assets/haunt-v442/last-frame.jpg',route=>route.abort('failed'));
  await seed(page,'terminal');
  await page.locator('[data-night-action=frame]').click();
  await page.clock.runFor(1700);
  await expect(page.locator('body')).not.toHaveClass(/event-signal-drop/);
  await expect(page.locator('.frame-face')).toHaveCount(0);
  await expect(page.locator('.last-frame')).toContainText('E-014');
  await expect(page.locator('[data-night-action=rotate]')).toHaveCount(6);
});
