import {test} from 'node:test';import assert from 'node:assert/strict';
import {handle,ChatBudget,responseBody,validateInput} from '../workers/chat/src/worker.mjs';
import {personas,instructions} from '../workers/chat/src/personas.mjs';
class Storage {
 data=new Map();queue=Promise.resolve();
 async get(k){return structuredClone(this.data.get(k));}async put(k,v){this.data.set(k,structuredClone(v));}
 async setAlarm(){}async deleteAll(){this.data.clear();}
 transaction(fn){const next=this.queue.then(()=>fn(this));this.queue=next.catch(()=>{});return next;}
}
function fixture(extra={}){
 const storage=new Storage(),env={CHAT_MODE:'mock',SESSION_SECRET:'test-only-secret-of-more-than-thirty-two-characters',ALLOWED_ORIGINS:'https://rieyekiwong.github.io',...extra};
 const budget=new ChatBudget({storage},env);env.CHAT_BUDGET={idFromName:x=>x,get:()=>({fetch:(url,opts)=>budget.fetch(new Request(url,opts))})};return {env,storage};
}
const input=(room='mom',requestId='q1')=>({version:1,requestId,room,language:'zh',messages:[{person:'me',text:'今天好累，赶作业赶了一晚上'}],visibleGroup:[]});
function req(path,body,token='',ip='1.2.3.4',extra={}){return new Request('https://chat.example'+path,{method:'POST',headers:{Origin:'https://rieyekiwong.github.io','Content-Type':'application/json','X-Stillwater-Chat':'1','CF-Connecting-IP':ip,...(token?{Authorization:'Bearer '+token}:{}),...extra},body:JSON.stringify(body)});}
async function session(env,options,ip){const response=await handle(req('/api/session',{consent:true,turnstileToken:'test-only-token'},'',ip),env,options);assert.equal(response.status,200,await response.clone().text());return (await response.json()).token;}
const completed=messages=>Response.json({status:'completed',output:[{type:'message',role:'assistant',content:[{type:'output_text',text:JSON.stringify({messages})}]}]});

test('mock Worker can authenticate and return structured messages for all contacts without any OpenAI key',async()=>{
 for(const room of ['group','gg','zhang','lin','mom','dad','milk','zhe']){
  const {env,storage}=fixture();const token=await session(env,{fetcher:()=>{throw new Error('no upstream allowed');}});
  const response=await handle(req('/api/chat',input(room),token),env,{fetcher:()=>{throw new Error('no upstream allowed');}});
  assert.equal(response.status,200);const body=await response.json();assert.equal(body.mode,'mock');assert.ok(StillwaterChatProtocol.allowed(room).includes(body.messages[0].person));
  assert.doesNotMatch(JSON.stringify(await storage.get('quota')),/作业|1\.2\.3\.4|今天好累/);
  assert.deepEqual((await storage.get('quota')).leases,{});
 }
});
test('live Responses path uses every role prompt, recent context, JSON schema, store:false and server-only secret',async()=>{
 for(const room of Object.keys(personas)) {
  const {env}=fixture({CHAT_MODE:'live',OPENAI_API_KEY:'fake-key-for-tests-only',TURNSTILE_SECRET:'fake-turnstile-secret'});const calls=[];
  const fetcher=async(url,options)=>{
   calls.push({url,options});if(url.includes('siteverify'))return Response.json({success:true,hostname:'rieyekiwong.github.io',action:'stillwater-chat'});
   assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(options.headers.Authorization,'Bearer fake-key-for-tests-only');
   const body=JSON.parse(options.body);assert.equal(body.model,'gpt-6-luna');assert.equal(body.store,false);assert.equal(body.background,false);assert.deepEqual(body.tools,[]);assert.equal(body.reasoning.effort,'none');assert.equal(body.text.format.type,'json_schema');assert.equal(body.text.format.strict,true);
   assert.match(body.instructions,/Rieyeki/);assert.ok(body.instructions.includes(personas[room]));
   assert.doesNotMatch(body.instructions,/317|Mara|Continuity|R-4829/);
   assert.deepEqual(JSON.parse(body.input[0].content[0].text).conversation,input(room).messages);
   return completed([{person:room,text:'怎么了，是作业还没交上去吗？'}]);
  };
  const token=await session(env,{fetcher}),response=await handle(req('/api/chat',input(room),token),env,{fetcher});
  assert.equal(response.status,200);const text=await response.text();assert.match(text,/'?ai'?/);assert.doesNotMatch(text,/fake-key|instructions|turnstile-secret/);assert.equal(calls.length,2);
 }
});
test('unconfigured live mode fails closed before calling any third party',async()=>{
 const {env}=fixture({CHAT_MODE:'live'});let calls=0;
 assert.equal((await handle(req('/api/session',{consent:true}),env,{fetcher:()=>{calls++;}})).status,503);assert.equal(calls,0);
});
test('Origin alone, forged sessions and missing consent cannot reach paid inference',async()=>{
 const {env}=fixture();let calls=0;const options={fetcher:()=>{calls++;throw new Error('not allowed');}};
 assert.equal((await handle(req('/api/chat',input()),env,options)).status,401);
 assert.equal((await handle(req('/api/chat',input(),'forged.fake'),env,options)).status,401);
 assert.equal((await handle(req('/api/session',{consent:false}),env,options)).status,400);
 assert.equal((await handle(req('/api/session',{consent:true},'','1.2.3.4',{Origin:'https://evil.example'}),env,options)).status,403);
 const token=await session(env,options);assert.equal((await handle(req('/api/chat',input(),token,'9.9.9.9'),env,options)).status,401);assert.equal(calls,0);
});
test('Turnstile is checked on the server against the expected hostname and action',async()=>{
 const {env}=fixture({CHAT_MODE:'live',OPENAI_API_KEY:'fake',TURNSTILE_SECRET:'fake'});
 for(const data of [{success:false},{success:true,hostname:'evil.example',action:'stillwater-chat'},{success:true,hostname:'rieyekiwong.github.io',action:'other'}]){
  const response=await handle(req('/api/session',{consent:true,turnstileToken:'test'}),env,{fetcher:async()=>Response.json(data)});assert.equal(response.status,403);
 }
});
test('server rejects excess input, cross-private/group context, unknown properties and unapproved speakers',async()=>{
 const {env}=fixture(),token=await session(env);
 const bad=[{...input(),caseSave:{}},{...input(),room:'me'},{...input(),messages:[{person:'dad',text:'private'}]},{...input(),visibleGroup:[{person:'gg',text:'job'}]},
  {...input(),messages:[{person:'me',text:'x'.repeat(2401)}]},{...input(),messages:Array.from({length:21},()=>({person:'me',text:'hi'}))}];
 for(const value of bad)assert.equal((await handle(req('/api/chat',value,token),env)).status,400);
 assert.equal((await handle(req('/api/chat',{...input(),messages:[{person:'me',text:'x'.repeat(49000)}]},token),env)).status,413);
 assert.ok(validateInput(input()));
});
test('wrong characters, invented links, spoilers and malformed AI output never become role messages',async()=>{
 const {env}=fixture({CHAT_MODE:'live',OPENAI_API_KEY:'fake',TURNSTILE_SECRET:'fake'});
 const verification={fetcher:async()=>Response.json({success:true,hostname:'rieyekiwong.github.io',action:'stillwater-chat'})};const token=await session(env,verification);
 for(const messages of [[{person:'me',text:'I decided to solve it'}],[{person:'gg',text:'hi'}],[{person:'mom',text:'Mara is in 317'}],[{person:'mom',text:'３１７号房间'}],[{person:'mom',text:'https://evil.com'}]]){
  const response=await handle(req('/api/chat',input(),token),env,{fetcher:async()=>completed(messages)});assert.equal(response.status,502);assert.deepEqual(await response.json(),{error:'invalid_reply'});
 }
});
test('durable quota caps paid attempts globally across sessions and IPs; failures also consume reservations',async()=>{
 const {env,storage}=fixture({GLOBAL_REQUESTS_PER_DAY:'2'});
 for(let i=0;i<3;i++){
  const ip='10.0.0.'+i,token=await session(env,undefined,ip),response=await handle(req('/api/chat',input(),token,ip),env);assert.equal(response.status,i<2?200:429);
 }
 assert.equal((await storage.get('quota')).requests,2);assert.ok((await storage.get('quota')).tokens>0);
 const small=fixture({GLOBAL_RESERVED_TOKENS_PER_DAY:'1'}),token=await session(small.env);assert.equal((await handle(req('/api/chat',input(),token),small.env)).status,429);
});
test('rate and concurrency admission are atomic; leases release after upstream failures',async()=>{
 const {env,storage}=fixture({CHAT_MODE:'live',OPENAI_API_KEY:'fake',TURNSTILE_SECRET:'fake'});
 const token=await session(env,{fetcher:async()=>Response.json({success:true,hostname:'rieyekiwong.github.io',action:'stillwater-chat'})});
 let release;const first=handle(req('/api/chat',input(),token),env,{fetcher:()=>new Promise(resolve=>{release=resolve;})});
 while(!release)await new Promise(r=>setImmediate(r));
 assert.equal((await handle(req('/api/chat',input('mom','q2'),token),env,{fetcher:()=>{throw new Error('should be denied');}})).status,429);
 release(new Response('',{status:429}));assert.equal((await first).status,503);assert.deepEqual((await storage.get('quota')).leases,{});
 assert.equal((await handle(req('/api/chat',input('mom','q3'),token),env,{fetcher:async()=>{throw new Error('timeout');}})).status,504);assert.deepEqual((await storage.get('quota')).leases,{});
});
test('bad methods, bodies and CORS preflight never expose credentials or internal errors',async()=>{
 const {env}=fixture();const preflight=await handle(new Request('https://chat.example/api/chat',{method:'OPTIONS',headers:{Origin:'https://rieyekiwong.github.io'}}),env);
 assert.equal(preflight.status,204);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),'https://rieyekiwong.github.io');assert.equal(preflight.headers.get('Access-Control-Allow-Credentials'),null);
 assert.equal((await handle(new Request('https://chat.example/api/chat',{headers:{Origin:'https://rieyekiwong.github.io'}}),env)).status,405);
 assert.equal(responseBody(input(),env).max_output_tokens,640);assert.doesNotMatch(instructions('mom'),/ROLE gg|ROLE zhang|ROLE lin/);
});
