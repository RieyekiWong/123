import '../../../chat-protocol.js';
import {instructions} from './personas.mjs';
import {d1Gate} from './d1-budget.mjs';
const P=globalThis.StillwaterChatProtocol;
const encoder=new TextEncoder(),decoder=new TextDecoder();
let mockSecret;
const settings=(env,key,fallback,min=1,max=10000000)=>Math.max(min,Math.min(max,Number.parseInt(env[key],10)||fallback));
const originList=env=>String(env.ALLOWED_ORIGINS||'http://127.0.0.1:3110,http://localhost:3110').split(',').map(s=>s.trim()).filter(Boolean);
const live=env=>env.CHAT_MODE==='live';
const json=(body,status=200,origin='')=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin',...(origin?{'Access-Control-Allow-Origin':origin}:{})}});
const error=(code,status,origin)=>json({error:code},status,origin);
const b64=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64=value=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
async function key(env) {
 if(!env.SESSION_SECRET)mockSecret||=crypto.randomUUID()+crypto.randomUUID();
 return crypto.subtle.importKey('raw',encoder.encode(env.SESSION_SECRET||mockSecret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
}
async function sign(env,value) {return new Uint8Array(await crypto.subtle.sign('HMAC',await key(env),encoder.encode(value)));}
async function fingerprint(env,request) {
 const ip=request.headers.get('CF-Connecting-IP')||'local';
 return b64(await sign(env,new Date().toISOString().slice(0,10)+':'+ip));
}
async function mint(env,ip) {
 const payload=b64(encoder.encode(JSON.stringify({sid:crypto.randomUUID(),ip,expires:Date.now()+1800000})));
 return payload+'.'+b64(await sign(env,payload));
}
async function verify(env,token,ip) {
 try {
  if(!token||token.length>800)return null;
  const [payload,sig,...extra]=token.split('.');if(extra.length||!payload||!sig)return null;
  if(!await crypto.subtle.verify('HMAC',await key(env),unb64(sig),encoder.encode(payload)))return null;
  const data=JSON.parse(decoder.decode(unb64(payload)));
  return /^[a-f0-9-]{36}$/.test(data.sid)&&data.ip===ip&&data.expires>Date.now()&&data.expires<=Date.now()+1801000?data:null;
 }catch{return null;}
}
async function readJSON(request) {
 if(request.headers.get('Content-Type')?.split(';')[0]!=='application/json')throw new Error('type');
 const declared=Number(request.headers.get('Content-Length'));if(declared>P.limits.bodyBytes)throw new Error('size');
 const reader=request.body?.getReader();if(!reader)throw new Error('body');let bytes=0,parts=[];
 try {for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>P.limits.bodyBytes){await reader.cancel();throw new Error('size');}parts.push(value);}}
 finally{reader.releaseLock();}
 const all=new Uint8Array(bytes);let pos=0;for(const p of parts){all.set(p,pos);pos+=p.length;}
 return JSON.parse(decoder.decode(all));
}
export function validateInput(input) {
 if(!input||Object.keys(input).some(k=>!['version','requestId','room','language','messages','visibleGroup'].includes(k)))return null;
 const {room,language,requestId}=input;
 if(input.version!==1||!P.rooms.includes(room)||!['zh','en','mixed'].includes(language)||!/^q\d{1,9}$/.test(requestId))return null;
 const validMessages=(messages,allowed,max,maxText)=>Array.isArray(messages)&&messages.length<=max&&messages.every(m=>m&&Object.keys(m).every(k=>['person','text'].includes(k))&&allowed.includes(m.person)&&typeof m.text==='string'&&m.text.trim().length&&m.text.length<=maxText);
 if(!validMessages(input.messages,['me',...P.allowed(room)],20,P.limits.input)||!input.messages.length||input.messages.at(-1).person!=='me')return null;
 const group=input.visibleGroup||[];
 if(!validMessages(group,['me',...P.members],6,400)||(!P.members.includes(room)&&group.length))return null;
 if(input.messages.reduce((n,m)=>n+m.text.length,0)>P.limits.historyChars)return null;
 return {version:1,requestId,room,language,messages:input.messages.map(m=>({person:m.person,text:m.text})),visibleGroup:group.map(m=>({person:m.person,text:m.text}))};
}
async function gate(env,body) {
 if(env.CHAT_DB?.prepare)return d1Gate(env,body);
 if(!env.CHAT_BUDGET)throw new Error('missing budget binding');
 return env.CHAT_BUDGET.get(env.CHAT_BUDGET.idFromName('global-v1')).fetch('https://budget.internal/',{method:'POST',body:JSON.stringify(body)});
}
export function responseBody(input,env) {
 return {
  model:env.OPENAI_MODEL||'gpt-6-luna',
  instructions:instructions(input.room),
  input:[{role:'user',content:[{type:'input_text',text:JSON.stringify({languagePreference:input.language,conversation:input.messages,visibleGroup:input.visibleGroup})}]}],
  store:false,background:false,tools:[],max_output_tokens:640,
  reasoning:{effort:env.REASONING_EFFORT||'none'},
  text:{format:{type:'json_schema',name:'stillwater_chat_reply',strict:true,schema:{type:'object',additionalProperties:false,properties:{messages:{type:'array',minItems:1,maxItems:input.room==='group'?3:2,items:{type:'object',additionalProperties:false,properties:{person:{type:'string',enum:P.allowed(input.room)},text:{type:'string'}},required:['person','text']}}},required:['messages']}}},
 };
}
function mockReply(input) {
 const person=P.allowed(input.room)[0],en=input.language==='en';
 return {messages:[{person,text:en?'[Local API test] Got your message. The connection works; this is not an AI-generated reply.':'【本地接口测试】收到消息了。连接正常，这条是模拟回复，并非 AI 生成。'}]};
}
export async function handle(request,env,{fetcher=fetch}={}) {
 const origin=request.headers.get('Origin')||'',path=new URL(request.url).pathname;
 if(request.method==='GET'&&['/','/api/health'].includes(path))return json({service:'stillwater-chat',version:'4.10.0',protocol:1,mode:live(env)?'ai':'mock',storage:env.CHAT_DB?.prepare?'d1':env.CHAT_BUDGET?'durable-object':'missing',configured:!!(env.CHAT_DB?.prepare||env.CHAT_BUDGET)&&(!live(env)||!!(env.OPENAI_API_KEY&&env.SESSION_SECRET&&env.SESSION_SECRET.length>=32&&(!(env.REQUIRE_TURNSTILE==='true'||env.TURNSTILE_SECRET)||env.TURNSTILE_SECRET)))},200,originList(env).includes(origin)?origin:'');
 if(!originList(env).includes(origin))return error('origin_not_allowed',403,'');
 if(!['/api/chat','/api/session'].includes(path))return error('not_found',404,origin);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization, X-Stillwater-Chat','Access-Control-Max-Age':'600','Vary':'Origin'}});
 if(request.method!=='POST')return error('method_not_allowed',405,origin);
 if(request.headers.get('X-Stillwater-Chat')!=='1')return error('bad_request',400,origin);
 const turnstileRequired=env.REQUIRE_TURNSTILE==='true'||!!env.TURNSTILE_SECRET;
 if(live(env)&&(!env.OPENAI_API_KEY||!env.SESSION_SECRET||env.SESSION_SECRET.length<32||(turnstileRequired&&!env.TURNSTILE_SECRET)))return error('not_configured',503,origin);
 let input;try{input=await readJSON(request);}catch(e){return error(e.message==='size'?'input_too_large':'invalid_json',e.message==='size'?413:400,origin);}
 const ip=await fingerprint(env,request);
 if(path==='/api/session') {
  if(!input||Object.keys(input).some(k=>!['consent','turnstileToken'].includes(k))||input.consent!==true)return error('consent_required',400,origin);
  const limit=await gate(env,{kind:'session',ip});if(!limit.ok)return error('rate_limited',429,origin);
  if(live(env)&&turnstileRequired) {
   if(typeof input.turnstileToken!=='string'||input.turnstileToken.length>2048)return error('verification_required',403,origin);
   let challenge;
   try {
    const form=new FormData();form.set('secret',env.TURNSTILE_SECRET);form.set('response',input.turnstileToken);
    const result=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:form,signal:AbortSignal.timeout(6000)});challenge=await result.json();
   }catch{return error('verification_unavailable',503,origin);}
   const expected=new URL(origin).hostname;
   if(!challenge.success||challenge.hostname!==expected||challenge.action!=='stillwater-chat')return error('verification_failed',403,origin);
  }
  return json({token:await mint(env,ip),expiresIn:1800,mode:live(env)?'ai':'mock'},200,origin);
 }
 const session=await verify(env,request.headers.get('Authorization')?.replace(/^Bearer /,''),ip);
 if(!session)return error('session_expired',401,origin);
 const clean=validateInput(input);if(!clean)return error('invalid_chat',400,origin);
 const body=responseBody(clean,env);
 // UTF-8 bytes conservatively reserve the input allowance before ANY paid request.
 const reserved=encoder.encode(JSON.stringify(body)).length+640+512;
 const leaseId=crypto.randomUUID();
 const admission=await gate(env,{kind:'chat',ip,sid:session.sid,reserved,leaseId});
 if(!admission.ok)return error('rate_limited',429,origin);
 try {
  let result;
  if(!live(env))result=mockReply(clean);
  else {
   let response;
   try {response=await fetcher('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});}
   catch{return error('upstream_timeout',504,origin);}
   if(!response.ok)return error(response.status===429?'upstream_limited':'upstream_unavailable',503,origin);
   try {
    const data=await response.json();
    if(data.status&&data.status!=='completed')return error('invalid_reply',502,origin);
    const text=(data.output||[]).filter(o=>o.type==='message'&&o.role==='assistant').flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text).join('');
    result=JSON.parse(text);
    if(!result||Object.keys(result).some(k=>k!=='messages'))return error('invalid_reply',502,origin);
   }catch{return error('invalid_reply',502,origin);}
  }
  const reply=P.output({version:1,requestId:clean.requestId,mode:live(env)?'ai':'mock',messages:result.messages},clean.room,clean.requestId);
  return reply?json(reply,200,origin):error('invalid_reply',502,origin);
 }finally{await gate(env,{kind:'release',leaseId});}
}
export default {
 async fetch(request,env) {try{return await handle(request,env);}catch{return error('service_unavailable',503,originList(env).includes(request.headers.get('Origin'))?request.headers.get('Origin'):'');}},
 async scheduled(_event,env) {if(env.CHAT_DB)await env.CHAT_DB.prepare('DELETE FROM chat_quota WHERE at < ?').bind(Date.now()-86400000).run();},
};

/* One strongly consistent coordinator per deployment. No transcripts or raw IPs.
   Reservations are not refunded on failures: this deliberately errs towards less cost. */
export class ChatBudget {
 constructor(ctx,env){this.ctx=ctx;this.env=env;}
 async fetch(request) {
  const command=await request.json(),now=Date.now(),day=new Date(now).toISOString().slice(0,10),env=this.env;
  const accepted=await this.ctx.storage.transaction(async storage=>{
   let data=await storage.get('quota');
   if(!data||data.day!==day)data={day,requests:0,tokens:0,sessionRequests:0,ips:{},sessions:{},leases:{}};
   for(const [id,expiry]of Object.entries(data.leases))if(expiry<now)delete data.leases[id];
   if(command.kind==='release'){
    for(const id of Object.keys(data.leases))if(id.endsWith(':'+command.leaseId))delete data.leases[id];
    await storage.put('quota',data);return true;
   }
   const ipKey=String(command.ip||'');if(!/^[a-zA-Z0-9_-]{30,64}$/.test(ipKey))return false;
   if(!data.ips[ipKey]&&Object.keys(data.ips).length>=3000)return false;
   const ip=data.ips[ipKey]||={day:0,recent:[],sessions:[]};ip.recent=ip.recent.filter(t=>t>now-60000);ip.sessions=ip.sessions.filter(t=>t>now-3600000);
   if(command.kind==='session') {
    if(ip.sessions.length>=12||data.sessionRequests>=settings(env,'GLOBAL_SESSIONS_PER_DAY',600))return false;
    ip.sessions.push(now);data.sessionRequests++;await storage.put('quota',data);return true;
   }
   if(command.kind!=='chat'||typeof command.sid!=='string'||!Number.isInteger(command.reserved)||command.reserved<1||command.reserved>50000)return false;
   const session=data.sessions[command.sid]||={day:0,recent:[]};session.recent=session.recent.filter(t=>t>now-60000);
   if(data.requests>=settings(env,'GLOBAL_REQUESTS_PER_DAY',300)||data.tokens+command.reserved>settings(env,'GLOBAL_RESERVED_TOKENS_PER_DAY',300000)||
      ip.day>=settings(env,'IP_REQUESTS_PER_DAY',60)||ip.recent.length>=settings(env,'IP_REQUESTS_PER_MINUTE',6)||session.day>=60||session.recent.length>=6||
      Object.keys(data.leases).length>=settings(env,'MAX_CONCURRENT',6))return false;
   // One paid request in flight per browser session, across all its chat windows.
   if(Object.keys(data.leases).some(id=>id.startsWith(command.sid+':')))return false;
   data.requests++;data.tokens+=command.reserved;ip.day++;ip.recent.push(now);session.day++;session.recent.push(now);
   data.leases[command.sid+':'+command.leaseId]=now+18000;
   // The caller uses a random lease ID; release accepts only the matching suffix.
   await storage.put('quota',data);return true;
  });
  if(accepted&&command.kind!=='release')await this.ctx.storage.setAlarm(Date.now()+86400000);
  return new Response(null,{status:accepted?204:429});
 }
 async alarm(){await this.ctx.storage.deleteAll();}
}
