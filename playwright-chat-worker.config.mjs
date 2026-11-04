import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',testMatch:'chat-worker-browser.spec.mjs',workers:1,reporter:'list',outputDir:'test-results-worker',
 use:{baseURL:'http://127.0.0.1:3110',browserName:'chromium',launchOptions:{executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']},trace:'retain-on-failure'},
 webServer:[
  {command:'node server.mjs --port 3110',url:'http://127.0.0.1:3110',reuseExistingServer:true},
  {command:'npm run chat:dev',url:'http://127.0.0.1:8787',reuseExistingServer:true},
  {command:'npm exec --prefix workers/chat -- wrangler dev --local --config workers/chat/wrangler.dashboard-test.jsonc',url:'http://127.0.0.1:8788',reuseExistingServer:true},
 ],
});
