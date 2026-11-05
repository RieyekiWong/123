/* The pre-V1.2 group opening is deliberately retained for saved visitors.
   Its regression suite uses this real old-save shape; new visitors are exercised
   separately in v2-opening.spec.mjs with no injected chat state. */
export async function seedLegacyChat(page){
  await page.addInitScript(()=>{
    if(localStorage.getItem('stillwater-chat:v1'))return;
    localStorage.setItem('stillwater-chat:v1',JSON.stringify({schema:1,pacing:2,cursor:1,remaining:2600,elapsed:0,counter:1,messages:[{id:'m1',kind:'script',key:'s1',at:Date.parse('2026-11-03T09:40:00Z')}],story:{request:'none',delivered:[]},ui:{conversation:'group',visited:{group:true}}}));
  });
}
