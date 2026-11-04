/* Generate locally and pipe directly to Wrangler. Never echo or write the secret. */
import {randomBytes} from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const binary=fileURLToPath(new URL('./node_modules/wrangler/bin/wrangler.js',import.meta.url));
const child=spawn(process.execPath,[binary,'secret','put','SESSION_SECRET'],{cwd:fileURLToPath(new URL('./',import.meta.url)),stdio:['pipe','inherit','inherit']});
child.stdin.end(randomBytes(48).toString('base64url')+'\n');
child.on('error',()=>{console.error('Could not run Wrangler. Run npm ci in workers/chat first.');process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code||0;});
