import {test,expect} from './v2-fixture.mjs';
for(const backend of [{name:'Durable Object',port:8787},{name:'Edit code single file + D1',port:8788}])test(`real local Cloudflare ${backend.name}: consent -> session -> persistent quota -> structured mock API -> original room`,async({page})=>{
 await page.route('**/chat-config.js*',route=>route.fulfill({contentType:'text/javascript',body:`globalThis.StillwaterChatConfig={endpoint:'http://127.0.0.1:${backend.port}/api/chat',turnstileSiteKey:''};`}));
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes(':'+backend.port+'/api/'))requests.push(r.url());});
 await page.goto('/index-zh.html');await page.locator('[data-chat-room=mom]').click();
 await expect(page.locator('.chat-message')).toHaveCount(8);expect(requests).toHaveLength(0);
 await page.locator('[data-chat-action=ai]').click();await page.locator('[data-chat-ai=enable]').click();
 await expect(page.locator('.chat-ai-dialog-state')).toContainText('模拟接口');await page.locator('[data-chat-ai=close]').click();
 await page.locator('#chat-input').fill('今天赶了一整晚作业，好累。');await page.locator('#chat-input').press('Enter');
 await expect(page.locator('.chat-message-self .chat-bubble').last()).toHaveText('今天赶了一整晚作业，好累。');
 await expect(page.locator('.chat-bubble').last()).toContainText('本地接口测试',{timeout:15000});
 await expect(page.locator('[data-chat-ai-status]')).toContainText('不是 AI');
 await page.locator('[data-chat-room=gg]').click();await expect(page.locator('.chat-messages')).not.toContainText('本地接口测试');
 await page.locator('#chat-input').fill('Hey, any games this weekend?');await page.locator('#chat-input').press('Enter');
 await expect(page.locator('.chat-bubble').last()).toContainText('Local API test',{timeout:15000});
 await page.reload();await expect(page.locator('#chat-title')).toHaveText('GGbond');await expect(page.locator('.chat-bubble').last()).toContainText('Local API test');
 await page.locator('[data-chat-room=mom]').click();await expect(page.locator('.chat-bubble').last()).toContainText('本地接口测试');
 expect(requests.filter(u=>u.endsWith('/api/session'))).toHaveLength(1);expect(requests.filter(u=>u.endsWith('/api/chat'))).toHaveLength(2);expect(errors).toEqual([]);
});
