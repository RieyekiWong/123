import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',
 testMatch:['**/v2-audio.spec.mjs','**/v2-ads-v28.spec.mjs'],
 workers:1,
 reporter:'list',
 use:{browserName:'webkit',baseURL:'http://127.0.0.1:3112',launchOptions:{executablePath:process.env.WEBKIT_PATH||undefined},trace:'retain-on-failure'},
 outputDir:'test-results-webkit',
 webServer:{command:'node server.mjs --port 3112',url:'http://127.0.0.1:3112',reuseExistingServer:!process.env.CI},
});
