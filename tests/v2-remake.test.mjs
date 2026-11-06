import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

function model(chat=false){
  const context=vm.createContext({URLSearchParams});
  const files=chat?['site-media.js','chat-data.js','chat-personas.js','chat-protocol.js','chat-fallback.js','chat-model.js','chat-photos.js','sw2-data.js','sw2-progress.js','sw2-chat-story.js']:['sw2-data.js','sw2-progress.js'];
  for(const file of files)vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),context);
  return {M:context.Stillwater2Progress,D:context.Stillwater2Data,context};
}
function complete(M,D,s,id){
  for(const source of D.puzzles[id].sources)assert.equal(M.action(s,'view',{id:source}).ok,true);
  assert.equal(M.action(s,'checkpoint',{puzzle:id}).ok,true);
}
function through(M,D,s,last='P7'){
  for(const id of Object.keys(D.puzzles)){
    if(id==='P8')break;
    if(id==='P3')assert.equal(M.action(s,'project').ok,true);
    if(id==='P5')assert.equal(M.action(s,'request',{choice:'ignored'}).ok,true);
    complete(M,D,s,id);assert.equal(M.action(s,'continue').ok,true);
    if(id===last)break;
  }
}

test('prototype uses distinct storage and rejects legacy/future saves without rewriting them',()=>{
  const {M}=model();
  assert.notEqual(M.KEY,'stillwater-case:v2');assert.notEqual(M.CHAT_KEY,'stillwater-chat:v1');
  for(const raw of [null,{schema:2,evidence:['C9']},{schema:1,edition:'2.0',prototype:false},{schema:9,edition:'2.0',prototype:true}])assert.equal(M.hydrate(raw),null);
  const s=M.fresh();assert.equal(s.edition,'2.0');assert.equal(s.prototype,true);
  assert.equal(M.canOpen(s,'heritage/b3'),false);assert.equal(M.canOpen(s,'phase'),false);assert.equal(M.canRead(s,'testimony'),false);
  assert.equal(M.importPreferences({preferences:{skipScares:true}}).skipScares,false);
  assert.equal(M.importPreferences({preferences:{skipScares:true,scareChoiceMade:true,popupAds:false}}).skipScares,true);
});

test('checkpoint progress needs its own available sources; draft, hints and reading boundary survive hydration',()=>{
  const {M,D}=model(),s=M.fresh();
  assert.equal(M.action(s,'checkpoint',{puzzle:'P1'}).error,'sources');
  assert.equal(M.action(s,'view',{id:'testimony'}).ok,false);
  assert.equal(M.action(s,'checkpoint',{puzzle:'P7'}).ok,false);
  M.action(s,'draft',{puzzle:'P1',field:'note',value:'这不是订房 / not a booking'});
  for(let i=0;i<5;i++)M.action(s,'hint',{puzzle:'P1'});
  complete(M,D,s,'P1');
  const restored=M.hydrate(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.drafts.P1.note,'这不是订房 / not a booking');assert.equal(restored.hints.P1,3);
  assert.equal(restored.transition.to,'hotel');assert.equal(M.goal(restored),'forum');
  assert.equal(M.action(restored,'continue').ok,true);assert.equal(restored.route,'hotel');
  assert.equal(M.action(restored,'checkpoint',{puzzle:'P1'}).ok,true);assert.equal(restored.transition,null);
});

test('both friend request choices advance; fixed messages are queued once and cannot unlock a puzzle',()=>{
  for(const choice of ['accepted','ignored']){
    const {M,D}=model(),s=M.fresh();through(M,D,s,'P4');
    assert.equal(M.canOpen(s,'heritage/photos'),false);assert.equal(M.goal(s),'chat');
    assert.equal(M.action(s,'request',{choice}).ok,true);assert.equal(M.canOpen(s,'heritage/photos'),true);
    const events=JSON.stringify(s.events);M.action(s,'request',{choice});assert.equal(JSON.stringify(s.events),events);
    assert.equal(M.solved(s,'P5'),false);
    if(choice==='accepted'){M.action(s,'delivered',{id:'sw2.accepted'});assert.equal(s.events.pending.includes('sw2.accepted'),false);assert.equal(s.events.delivered.filter(id=>id==='sw2.accepted').length,1);}
  }
});

test('all eight chapter routes and all three prototype endings round-trip without old classifications',()=>{
  for(const ending of ['auto-close','unverified','released']){
    const {M,D}=model();let s=M.fresh();through(M,D,s);
    assert.equal(M.chapter(s,'heritage/final-trace'),7);
    assert.equal(M.action(s,'ending',{id:ending}).error,'sources');
    for(const id of D.puzzles.P8.sources)M.action(s,'view',{id});
    assert.equal(M.action(s,'ending',{id:ending}).ok,true);
    s=M.hydrate(JSON.parse(JSON.stringify(s)));assert.equal(s.lastEnding,ending);assert.equal(s.endings.length,1);
    assert.equal(Object.hasOwn(s,'evidence'),false);assert.equal(Object.hasOwn(s,'night'),false);
    assert.equal(M.scene(s,'chat').ads,false);assert.equal(M.scene(s,'heritage/b3').notices,false);
    assert.equal(M.scene(s,'phase').dark,false);assert.equal(M.scene(s,'heritage/final-trace').dark,true);
  }
});

test('malformed routes, sources and injected completion do not manufacture a finale',()=>{
  const {M}=model(),raw=M.fresh();raw.viewed=['testimony','made-up'];raw.results.P8={prototype:true,sources:['testimony','fieldphoto','synthetic']};raw.route='heritage/final-trace';raw.endings=['released'];raw.lastEnding='released';
  const s=M.hydrate(raw);assert.equal(s.lastEnding,'');assert.equal(M.canOpen(s,'ending'),false);assert.equal(s.viewed.length,0);
  assert.equal(M.action(s,'view',{id:'__proto__'}).ok,false);
});

test('daily-chat import preserves room drafts and user text but excludes authored future events and pending API work',()=>{
  const {M,context}=model(true),C=context.StillwaterChatModel;
  const raw={schema:1,counter:7,messages:[{id:'m2',kind:'user',text:'蓝莓作业 / blueberry report',conversation:'mom',at:C.base+1000},{id:'m3',kind:'social',person:'mom',text:'先歇一下，怎么了？',conversation:'mom',at:C.base+2000},{id:'m4',kind:'user',text:'以前的假账号',conversation:'wcr_new',at:C.base+2500},{id:'m5',kind:'script',key:'s31',at:C.base}],pending:[{kind:'social',id:'q7',conversation:'mom',messages:[{person:'mom',text:'未送达'}]}],memories:{mom:{topic:'hidden-future',recent:['future secret']}},story:{request:'accepted',delivered:['v13.end-released']},ui:{conversation:'mom',drafts:{mom:'没发出去的草稿',gg:'GG 草稿'},scroll:{mom:{top:72,bottom:false}},unread:{gg:2}}};
  const before=JSON.stringify(raw),s=M.importChat(raw);assert.equal(JSON.stringify(raw),before);
  assert.equal(s.ui.drafts.mom,'没发出去的草稿');assert.equal(s.ui.drafts.gg,'GG 草稿');assert.equal(s.ui.scroll.mom.top,72);
  assert.equal(s.pending.length,0);assert.equal(s.story.request,'none');assert.equal(s.messages.some(m=>m.conversation==='wcr_new'||m.key==='s31'),false);
  assert.equal(s.memories.mom.topic,'');assert.equal(s.memories.mom.recent[0],'蓝莓作业 / blueberry report');
  C.send(s,'hey what are you doing','gg',()=>0);const request=C.request(s,s.pending[0]);assert.equal(JSON.stringify(request).includes('blueberry'),false);
  assert.equal(C.KEY,'stillwater-chat:v1');
});

test('ordinary ads stop during source reading and horror, without relying on legacy clue fields',()=>{
  const {M,D}=model(),s=M.fresh();assert.equal(M.scene(s,'chat').ads,true);
  M.action(s,'view',{id:'closure'});assert.equal(M.scene(s,'forum').ads,false);M.action(s,'close-source');
  assert.equal(M.scene(s,'forum').ads,true);complete(M,D,s,'P1');assert.equal(M.scene(s,'forum').ads,false);
  assert.equal(M.scene(s,'heritage/b3').ads,false);
});

test('the shared B-3 graph retains the audited 16,384-state fingerprint',()=>{
  const {context}=model();vm.runInContext(fs.readFileSync(new URL('../case-night-model.js',import.meta.url),'utf8'),context);
  const N=context.StillwaterNightModel,rows=[];let valid=0;
  for(let mask=0;mask<4096;mask++){let k=mask,a=[];for(let i=0;i<6;i++){a.push(k%4);k=Math.floor(k/4);}for(const isolated of [false,true])for(const manual of [false,true]){const result=N.circuit({orientations:a,isolated,manual});rows.push([a,isolated,manual,result]);if(result.valid)valid++;}}
  assert.equal(valid,1);assert.equal(crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex'),'50b1d6c6788b11fef6eebf2b1ac5424ecde68e8908ad0e60ad474fae6a84be44');
});

test('every source renders in both languages, and the dark finale has one heading without an extra worksheet',()=>{
  const {M,D,context}=model(),s=M.fresh();
  for(const name of ['case-ending.js','sw2-pages.js'])vm.runInContext(fs.readFileSync(new URL('../'+name,import.meta.url),'utf8'),context);
  const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  for(const language of [0,1]){
    const pages=context.Stillwater2Pages({t:(zh,en)=>language?en:zh,esc:escape,getState:()=>s});
    for(const [id,source]of Object.entries(D.sources)){
      const html=pages.source(id);assert.ok(html.includes(escape(source.title[language])));assert.equal(html.includes('undefined'),false);
    }
    const html=pages.render('heritage/final-trace');assert.equal((html.match(/<h1>/g)||[]).length,1);assert.equal(html.includes('<textarea'),false);
  }
});
