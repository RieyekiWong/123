import {expect} from '@playwright/test';
export const navigate=async(page,route)=>{await page.evaluate(r=>location.hash=r,route);await expect(page).toHaveURL(u=>u.hash==='#'+route);};
const answers={index:{stay:'insufficient'},diary:{stay:'2023',map:'2023',normal:'2026',check:'2026',tomorrow:'unknown',handwritten:'insufficient',visit:'supported',occupancy:'insufficient',author:'insufficient'},echo:{map:'public',quote:'forum2023',upstream:'system',identity:'insufficient'},cause:{key:'observation',bed:'observation',transfer:'system',sign:'observation',revision:'revision',merge:'inference'}};
export async function storyProof(page,key,{wrong=false}={}){
 const route=key==='echo'?'source-trace':key==='cause'?'rewrite-review':'source-review?proof='+key;await navigate(page,route);
 const panel=page.locator(`[data-story-proof=${key}]`);await expect(panel).toBeVisible();
 for(const id of await panel.locator('[data-story-cite]').evaluateAll(els=>els.map(e=>e.dataset.storyCite))){await panel.locator(`[data-story-action=open][data-id=${id}]`).click();await panel.locator(`[data-story-cite=${id}]`).check();}
 if(['index','echo'].includes(key)){for(const id of key==='index'?['index','position']:['sync','echo']){await panel.locator(`[data-story-action=open][data-id=${id}]`).click();const compare=page.locator(`[data-story-source=${id}]`).first().locator('[data-story-action=compare]');if(await compare.getAttribute('aria-pressed')!=='true')await compare.click();}}
 if(key==='cause')for(const [field,id]of Object.entries({key:'key',bed:'housekeeping',transfer:'transfer',sign:'mara',revision:'revision',merge:'index'}))await panel.locator(`[data-story-link-source=${field}]`).selectOption(id);
 for(const [field,value]of Object.entries(answers[key]))await panel.locator(`[data-story-field=${field}]`).selectOption(value);
 if(wrong){const first=panel.locator('[data-story-field]').first(),correct=await first.inputValue(),bad=await first.locator('option').evaluateAll((els,correct)=>els.find(e=>e.value&&e.value!==correct).value,correct);await first.selectOption(bad);await panel.locator('[type=submit]').click();await expect(panel.locator('[data-story-feedback]')).toHaveAttribute('data-error','true');const [field,value]=Object.entries(answers[key])[0];await panel.locator(`[data-story-field=${field}]`).selectOption(value);}
 await panel.locator('[type=submit]').click();await expect(panel.locator('.story-retained')).toBeVisible();
}
export async function storyEarly(page,{request='ignored',wrong=true}={}){
 await navigate(page,'guest-index');await page.locator('#story-name').fill('Wang Churen');await page.locator('.story-name-search button').click();
 await expect(page.locator('[data-story-source=index]')).toContainText('2026-11-03');
 for(const id of ['name','year','position','revision'])await page.locator(`[data-story-action=mark][data-id=${id}]`).click();
 await storyProof(page,'index',{wrong});
 await navigate(page,'history-cache');await page.locator('[data-story-action=snapshot][data-version="2023"]').click();await page.locator('[data-story-action=restore]').click();await expect(page.locator('.story-cache-copy')).toBeVisible();
 await storyProof(page,'diary',{wrong});
 await navigate(page,'source-trace');await page.locator(`[data-story-action=request][data-choice=${request}]`).click();
 await storyProof(page,'echo',{wrong});
 await navigate(page,'photo-overlay');for(const anchor of ['frame','lamp'])await page.locator(`[data-story-action=anchor][data-id=${anchor}]`).click();
 await page.locator('[data-story-action=overlay-submit]').click();await expect(page.locator('[data-story-feedback]')).toHaveAttribute('data-error','true');
 for(const [key,delta,count]of [['x',-1,8],['y',1,6],['zoom',1,8]])for(let i=0;i<count;i++)await page.locator(`[data-story-action=nudge][data-key=${key}][data-delta="${delta}"]`).click();
 await page.locator('[data-story-action=photo-mark][data-id=plaque]').click();await page.locator('[data-story-action=overlay-submit]').click();await expect(page.locator('[data-story-feedback]')).toHaveAttribute('data-error','false');
}
export async function storyFinish(page){await storyProof(page,'cause',{wrong:true});await page.locator('[data-story-action=preview][data-choice=declined]').click();}
export async function completeStory(page){const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('stillwater-case:v2')));if(!data.story?.active||data.story.legacy)return;if(!data.story.findings.echo)await storyEarly(page);await storyFinish(page);await navigate(page,'review');}
