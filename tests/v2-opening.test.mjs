import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import '../case-story-data.js';
import '../site-media.js';
import '../chat-data.js';
import '../chat-personas.js';
import '../chat-protocol.js';
import '../chat-fallback.js';
import '../chat-photos.js';
import '../chat-story.js';
import '../chat-opening.js';
import '../chat-model.js';
const M=globalThis.StillwaterChatModel,O=globalThis.StillwaterChatOpening;
const run=(s,ms,options)=>{for(let t=0;t<ms;t+=250)M.advance(s,250,options);};
const count=(s,key)=>s.messages.filter(m=>m.key===key).length;

test('a fresh visitor meets a friend through ordinary memories, then gets the only forum card privately',()=>{
  const s=M.fresh();assert.equal(O.active(s),true);
  run(s,100000);
  assert.equal(s.shared,true);assert.equal(count(s,'v12.discovery.card'),1);
  assert.equal(s.messages.find(m=>m.key==='v12.discovery.card').conversation,'gg');
  assert.ok(s.messages.findIndex(m=>m.key==='v12.group.11')<s.messages.findIndex(m=>m.key==='v12.discovery.0'));
  assert.equal(s.messages.some(m=>m.kind==='script'||m.kind==='user'),false);
  assert.equal(M.history(s,'group').some(m=>/兼职|part.time|317|Mara|Continuity/.test(m.text)),false);
  assert.ok(M.history(s,'gg').some(m=>m.text.includes('2023')));
  const before=s.messages.length;run(s,100000);assert.equal(s.messages.length,before);
  assert.deepEqual(M.deliver(s,'discovery'),[]);assert.equal(count(s,'v12.discovery.card'),1);
});
test('long free conversation, other contacts and ignored messages cannot strand the fixed entrance',()=>{
  let s=M.fresh();
  for(let t=0;t<180000;t+=1000){if(t%3000===0)M.send(s,t%2?'send the link':'作业还没完呢','group',()=>0);M.advance(s,1000,{story:false});if(t%7000===0)s=M.hydrate(JSON.parse(JSON.stringify(s)));}
  assert.equal(s.shared,true);assert.equal(count(s,'v12.discovery.card'),1);
  assert.equal(s.messages.some(m=>m.key==='s31'),false);
  const other=M.fresh();other.ui.conversation='mom';run(other,100000);assert.equal(other.shared,true);assert.ok(other.ui.unread.gg>0);
});
test('refresh halfway through private delivery preserves exact messages, drafts, unread and independent scroll',()=>{
  let s=M.fresh();run(s,45000);assert.ok(s.story.opening.privateCursor>0);assert.equal(s.shared,false);
  s.ui.drafts.mom='还没发给妈妈';s.ui.drafts.gg='Are you sure?';s.ui.scroll.group={top:117,bottom:false};
  const before=structuredClone(s.messages),ui=structuredClone(s.ui);s=M.hydrate(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(s.messages,before);assert.deepEqual(s.ui,ui);run(s,60000);
  for(const key of O.discovery)assert.equal(count(s,key),1,key);
  assert.equal(s.ui.drafts.gg,'Are you sure?');assert.equal(s.shared,true);
});
test('a genuine pre-V1.2 save keeps its legacy script, card, story text keys and private drafts',()=>{
  const raw={schema:1,pacing:2,cursor:32,shared:true,elapsed:100000,counter:8,messages:[{id:'m1',kind:'script',key:'s1',at:M.base},{id:'m2',kind:'script',key:'s31',at:M.base+60000},{id:'m3',kind:'story',key:'discovery:0',conversation:'gg',at:M.base+61000},{id:'m4',kind:'user',conversation:'mom',text:'今天好累',at:M.base+62000}],story:{request:'accepted',delivered:['discovery']},ui:{conversation:'mom',drafts:{mom:'别改这句话'},scroll:{mom:{top:70,bottom:false}},unread:{gg:3}}};
  const s=M.hydrate(raw);assert.equal(O.active(s),false);assert.deepEqual(s.messages,raw.messages);
  assert.equal(s.shared,true);assert.equal(s.story.request,'accepted');assert.equal(s.ui.drafts.mom,'别改这句话');assert.equal(s.ui.scroll.mom.top,70);
  run(s,120000);assert.equal(s.messages.some(m=>m.key?.startsWith('v12.')),false);
  assert.equal(M.sideMessages(s,'wcr_old').length,8);
});
test('the historical chat spans real life before the disappearance and never receives the 18:26 local file',()=>{
  const old=M.sideMessages(M.fresh(),'wcr_old');
  for(const year of ['2021','2022','2023'])assert.ok(old.some(m=>m.displayTime.startsWith(year)));
  assert.equal(old.at(-1).displayTime,'2023-10-17 18:12');
  assert.equal(new Date(old.at(-1).at).toISOString(),'2023-10-17T22:12:00.000Z');
  assert.equal(old.some(m=>m.at>old.at(-1).at),false);
  for(const lang of [0,1])assert.doesNotMatch(old.map(m=>m.text[lang]).join('\n'),/317|Mara|Continuity|TEMP-015|18:26|10-21/);
  assert.equal(old.some(m=>m.photo==='family'),true);assert.equal(old.some(m=>m.photo==='camera'),true);
  assert.equal(M.send(M.fresh(),'在吗','wcr_old'),false);
});
test('personality, API consent transport and room boundaries still use the original social path',()=>{
  const s=M.fresh();M.send(s,'今天好累','mom',()=>0);const pending=s.pending[0],payload=M.request(s,pending);
  assert.equal(payload.room,'mom');assert.equal(payload.visibleGroup.length,0);
  assert.doesNotMatch(JSON.stringify(payload),/Silverpine|王楚人|Wang Churen|Northlake|caseSave/);
  assert.equal(M.accept(s,pending.id,{version:1,requestId:pending.id,mode:'ai',messages:[{person:'mom',text:'怎么了，今天忙什么呢？'}]}),true);
  run(s,7000,{story:false});assert.equal(M.history(s,'mom').at(-1).text,'怎么了，今天忙什么呢？');
  assert.equal(M.history(s,'gg').some(m=>m.text.includes('今天忙什么')),false);
  assert.equal(globalThis.StillwaterChatProtocol.rooms.includes('wcr_new'),false);
});
test('new authored keys are language-independent and cannot be loaded into another private room',()=>{
  const s=M.fresh();run(s,100000);const loaded=M.hydrate(JSON.parse(JSON.stringify(s)));
  assert.equal(M.history(loaded,'gg','en').some(m=>m.text.includes('Silverpine')),true);
  assert.equal(M.history(loaded,'gg','zh').some(m=>m.text.includes('银松镇')),true);
  const forged=structuredClone(loaded);forged.messages.push({id:'m99999',kind:'story',key:'v12.discovery.3',conversation:'mom',at:M.base});
  assert.equal(M.hydrate(forged).messages.some(m=>m.id==='m99999'),false);
});
test('a hidden chat does not consume the new opening and completed assets are local image files',()=>{
  const s=M.fresh(),before=structuredClone(s.story.opening);run(s,120000,{chatActive:false});assert.deepEqual(s.story.opening,before);assert.equal(s.shared,false);
  for(const photo of Object.values(O.photos))assert.equal(readFileSync(new URL('../'+photo.file,import.meta.url)).subarray(1,4).toString(),'PNG');
  assert.notEqual(globalThis.StillwaterChatPhotos.find(p=>p.id==='wcr_old').file,globalThis.StillwaterChatPhotos.find(p=>p.id==='wcr_new').file);
});
