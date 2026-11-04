import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {DatabaseSync} from 'node:sqlite';import {parse} from 'acorn';
import worker from '../workers/chat/dashboard/worker.js';import {d1Gate} from '../workers/chat/src/d1-budget.mjs';
const schema=await readFile(new URL('../workers/chat/dashboard/schema.sql',import.meta.url),'utf8');
function database() {
 const db=new DatabaseSync(':memory:');db.exec(schema);
 const binding={prepare(sql) {
   return {bind(...args) {
     return {async run() {
       const result=db.prepare(sql).run(...args);
       return {meta:{changes:Number(result.changes)}};
     }};
   }};
 }};
 return {db,binding};
}
function fixture(extra={}){const {db,binding}=database();return {db,env:{CHAT_DB:binding,CHAT_MODE:'mock',ALLOWED_ORIGINS:'https://rieyekiwong.github.io',SESSION_SECRET:'a-test-only-session-secret-with-at-least-32-characters',...extra}};}
const req=(path,body,token='')=>new Request('https://damp-rain-a5a6.ywang254.workers.dev'+path,{method:'POST',headers:{Origin:'https://rieyekiwong.github.io','Content-Type':'application/json','X-Stillwater-Chat':'1','CF-Connecting-IP':'1.2.3.4',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});
const payload={version:1,requestId:'q1',room:'mom',language:'zh',messages:[{person:'me',text:'今天好累'}],visibleGroup:[]};
async function token(env){const response=await worker.fetch(req('/api/session',{consent:true}),env);assert.equal(response.status,200,await response.clone().text());return (await response.json()).token;}

test('Edit code bundle is a standalone ES module with only a default handler and no external dependencies',async()=>{
 const source=await readFile(new URL('../workers/chat/dashboard/worker.js',import.meta.url),'utf8'),ast=parse(source,{ecmaVersion:'latest',sourceType:'module'});
 assert.ok(!ast.body.some(n=>n.type==='ImportDeclaration'));assert.ok(ast.body.filter(n=>n.type.startsWith('Export')).every(n=>n.specifiers?.every(s=>s.exported.name==='default')));
 assert.doesNotMatch(source,/class ChatBudget|from ["']|require\(|sk-[A-Za-z0-9]{12}/);assert.equal(typeof worker.fetch,'function');assert.equal(typeof worker.scheduled,'function');
});
test('copied single-file Worker runs session, persistent D1 admission and structured response with actual SQLite',async()=>{
 const {env,db}=fixture();const t=await token(env),response=await worker.fetch(req('/api/chat',payload,t),env);
 assert.equal(response.status,200,await response.clone().text());assert.equal((await response.json()).mode,'mock');
 const rows=db.prepare('SELECT * FROM chat_quota ORDER BY at').all();assert.equal(rows.length,2);assert.equal(rows.find(r=>r.kind==='chat').lease_until,0);
 assert.doesNotMatch(JSON.stringify(rows),/今天|1\.2\.3\.4|API_KEY|message|好累/);db.close();
});
test('D1 global quota and reserved token caps hold across different IPs and simultaneous admissions',async()=>{
 const {env,db}=fixture({GLOBAL_REQUESTS_PER_DAY:'3',MAX_CONCURRENT:'10'}),now=Date.now();
 const results=await Promise.all(Array.from({length:20},(_,i)=>d1Gate(env,{kind:'chat',ip:'a'.repeat(40)+i,sid:'s'+i,leaseId:'l'+i,reserved:1000},now)));
 assert.equal(results.filter(r=>r.ok).length,3);assert.equal(db.prepare("SELECT COUNT(*) AS n FROM chat_quota WHERE kind='chat'").get().n,3);db.close();
 const small=fixture({GLOBAL_RESERVED_TOKENS_PER_DAY:'999'});assert.equal((await d1Gate(small.env,{kind:'chat',ip:'x'.repeat(40),sid:'s',leaseId:'l',reserved:1000})).status,429);small.db.close();
});
test('D1 enforces per-IP minute limit, per-session concurrency and global concurrency before inference',async()=>{
 const {env,db}=fixture(),ip='q'.repeat(40),now=Date.now();
 for(let i=0;i<6;i++){
  assert.equal((await d1Gate(env,{kind:'chat',ip,sid:'sid',leaseId:'l'+i,reserved:100},now+i)).status,204);
  assert.equal((await d1Gate(env,{kind:'chat',ip,sid:'sid',leaseId:'blocked',reserved:100},now+i)).status,429);
  await d1Gate(env,{kind:'release',leaseId:'l'+i},now+i);
 }
 assert.equal((await d1Gate(env,{kind:'chat',ip,sid:'new-session',leaseId:'over-minute',reserved:100},now+100)).status,429);
 assert.equal((await d1Gate(env,{kind:'chat',ip,sid:'sid',leaseId:'after-minute',reserved:100},now+61000)).status,204);db.close();
});
test('missing D1 table fails closed without requesting OpenAI; health distinguishes bindings from real inference',async t=>{
 const {env,db}=fixture({CHAT_MODE:'live',OPENAI_API_KEY:'fake-test-key'});db.exec('DROP TABLE chat_quota');let calls=0;
 t.mock.method(globalThis,'fetch',async()=>{calls++;throw new Error('must not call upstream');});
 const result=await worker.fetch(req('/api/session',{consent:true}),env);assert.equal(result.status,503);assert.equal(calls,0);db.close();
 const health=await worker.fetch(new Request('https://example.test/api/health'),{CHAT_MODE:'live'});assert.equal((await health.json()).configured,false);
});
test('standalone production path calls actual Responses endpoint with safe options (mocked upstream only)',async t=>{
 const {env,db}=fixture({CHAT_MODE:'live',OPENAI_API_KEY:'test-key-not-real'});let calls=0;
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  calls++;assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(options.body);assert.equal(body.store,false);assert.equal(body.text.format.strict,true);assert.match(body.instructions,/fictional mother/);
  return Response.json({status:'completed',output:[{type:'message',role:'assistant',content:[{type:'output_text',text:JSON.stringify({messages:[{person:'mom',text:'今天怎么了，是事情特别多吗？'}]})}]}]});
 });
 const session=await token(env),result=await worker.fetch(req('/api/chat',payload,session),env);assert.equal(result.status,200);assert.equal((await result.json()).mode,'ai');assert.equal(calls,1);db.close();
});
test('D1 scheduled retention removes old quota metadata without resetting current-day budget',async()=>{
 const {env,db}=fixture(),now=Date.now();db.prepare('INSERT INTO chat_quota VALUES (?,?,?,?,?,?,?)').run('old','chat','x','s',now-90000000,10,0);
 db.prepare('INSERT INTO chat_quota VALUES (?,?,?,?,?,?,?)').run('new','chat','x','s',now,10,0);
 await worker.scheduled({},env);assert.deepEqual(db.prepare('SELECT id FROM chat_quota').all().map(r=>r.id),['new']);db.close();
});
