import {test} from 'node:test';
import assert from 'node:assert/strict';
import {M,V,D,move,proof,start,toCameras,equipment,classify} from './v2-v13-helpers.mjs';
import {fullCase} from './v2-evidence-model-helpers.mjs';
for (const file of ['site-media.js','chat-data.js','chat-personas.js','chat-protocol.js','chat-fallback.js','chat-photos.js','chat-story.js','chat-opening.js','chat-story-v13.js','chat-model.js']) await import('../'+file);
test('V1.3 follows one sourced investigation without requiring all legacy C1–C9 checks',()=>{
 const s=toCameras();assert.equal(V.ready(s),true);assert.equal(s.completed.finalEvidence,true);assert.equal(s.completed.audit,false);assert.equal(s.evidence.includes('C8'),false);assert.equal(s.desk.results.timeline,undefined);assert.equal(M.canOpen(s,'cameras'),true);assert.deepEqual(s.night.spread,{rooms:false,guestbook:false});
 for(const k of ['index','diary','echo','cause'])assert.ok(s.story.findings[k]);assert.equal(s.story.transition.to,'cameras');
 const reading=start();for(const key of ['index','diary','echo','cause'])proof(reading,key);assert.equal(V.objective(reading).links[0][0],'mirror');assert.equal(M.canOpen(reading,'mirror'),true);assert.equal(M.canOpen(reading,'cameras'),false);
});
test('a claim or missing source cannot grant progress; mistakes keep other work and hints',()=>{
 const s=start();move(s,'story-hint',{key:'index'});assert.equal(M.transition(s,'story-submit',{key:'index'}).error,'source');
 for(const id of D.proofs.index.sources)move(s,'story-open',{id});s.story.drafts.index={sources:[...D.proofs.index.sources],values:{use:'room',stay:'verified'}};move(s,'story-compare',{id:'booking'});move(s,'story-compare',{id:'inventory'});
 assert.equal(M.transition(s,'story-submit',{key:'index'}).error,'index');assert.equal(s.story.findings.index,undefined);assert.equal(s.story.hints.index,1);assert.equal(s.story.viewed.includes('booking'),true);
 s.story.drafts.index.values={use:'service',stay:'unverified'};move(s,'story-open',{id:'oldchat'});move(s,'story-compare',{id:'oldchat'});assert.equal(M.transition(s,'story-submit',{key:'index'}).error,'compare');assert.equal(s.story.findings.index,undefined);
});
test('Nora attendance is verified independently; voluntary resignation and a merged person are unsupported',()=>{
 const s=toCameras();assert.deepEqual(s.story.findings.cause.values,{attendance:'worked',departure:'unsupported',people:'separate'});
 assert.match(D.documents['nora-revision'].body[0][1],/Helen Mercer/);assert.match(D.documents['nora-shift'].body[0][1],/Attendance recorded/);
 assert.notEqual(globalThis.StillwaterCaseData.facts.reviewerName,'Nora Bell');assert.equal(globalThis.StillwaterCaseData.facts.guest,'E. Vale');
});
test('three ending IDs stay reachable through actual physical operations and separate final choices',()=>{
 for(const ending of ['auto-close','unverified','released']){
  let s=classify();for(const key of ['ROOM','GUEST','EMPLOYEE']){move(s,'story-category',{id:key});proof(s,key);s=M.hydrate(JSON.parse(JSON.stringify(s)));}
  move(s,'story-finish',{choice:ending});s=M.hydrate(JSON.parse(JSON.stringify(s)));assert.equal(s.lastEnding,ending);assert.ok(s.endings.includes(ending));assert.equal(s.night.void.complete,true);assert.equal(s.story.originalsSeparated,ending==='released');assert.equal(s.night.locked,ending==='released');
  assert.equal(V.readable(s,'contact'),ending==='released');assert.equal(s.evidence.includes('C8'),false);
 }
});
test('opening three categories is not verification and early endings cannot bypass source or equipment rules',()=>{
 const s=classify();for(const key of ['ROOM','GUEST','EMPLOYEE'])move(s,'story-category',{id:key});assert.deepEqual(s.night.void.attempts,[]);assert.equal(M.transition(s,'story-finish',{choice:'released'}).ok,false);assert.equal(M.transition(s,'ending',{ending:'auto-close'}).ok,false);
 const early=start();assert.equal(M.transition(early,'story-recover').ok,false);assert.equal(V.readable(early,'lastphoto'),false);assert.equal(V.readable(early,'contact'),false);
});
test('B-3 and W3-02 cannot be bypassed; a readable circuit alone is not a saved protected source',()=>{
 const s=equipment();assert.equal(s.night.saved,true);assert.equal(s.night.isolated,true);assert.equal(s.night.manual,true);assert.equal(s.promo.verified,true);assert.equal(s.story.b3Recovered,true);assert.equal(s.story.transition.to,'void');assert.equal(s.story.originalsSeparated,false);assert.equal(s.story.findings.footage,undefined);
 assert.equal(M.transition(s,'night-lock').error,'void-first');
 move(s,'night-rotate',{node:0});s.story.b3Recovered=false;assert.equal(M.transition(s,'story-recover').ok,false);
});
test('old early, deep and ending saves preserve their original edition and are never locked behind Nora',()=>{
 const raw=fullCase();raw.story.legacy=true;raw.endings=['auto-close','unverified'];raw.lastEnding='unverified';
 const s=M.hydrate(JSON.parse(JSON.stringify(raw)));assert.equal(V.active(s),false);assert.deepEqual(s.evidence,raw.evidence);assert.equal(s.lastEnding,'unverified');assert.equal(M.canOpen(s,'ending'),true);assert.equal(M.transition(s,'story-v13-begin').ok,false);
});
test('unverified does not mean nobody entered; 2023 local notes and device logs remain late sources',()=>{
 const s=start();assert.equal(V.readable(s,'unsent'),false);assert.equal(D.diaries[5].late,true);
 assert.ok(D.diaries[4].text.every(v=>v.includes('Nora')));assert.doesNotMatch(D.documents.contact.body[0][1],/18:27|alive|rescued/);
 assert.equal(D.categories.EMPLOYEE.fields[0].answer,'unverified');assert.equal(D.proofs.cause.fields[0].answer,'worked');
});
test('authored synthetic-account pressure follows seen sources; its free replies remain bounded and private',()=>{
 const c=globalThis.StillwaterChatModel,s=c.fresh();s.story.request='accepted';c.deliver(s,'v13.accepted');
 for(let i=0;i<500;i++){c.send(s,'hello '+i,'wcr_new');c.advance(s,1000,{story:false,chatActive:false});}
 assert.ok(s.messages.length<=400);assert.ok(s.messages.some(m=>m.key==='v13.accepted.0'));
 const loaded=c.hydrate(JSON.parse(JSON.stringify(s)));assert.equal(c.history(loaded,'mom').some(m=>m.text.includes('317')),false);assert.equal(globalThis.StillwaterChatProtocol.rooms.includes('wcr_new'),false);
 const game=start();proof(game,'index');proof(game,'diary');game.story.request='accepted';V.open(game,'avatar-new');globalThis.StillwaterStoryModel.sync(game);assert.ok(game.story.pending.includes('v13.account-memory'));assert.equal(game.story.pending.includes('v13.account-pressure'),false);
 proof(game,'echo');globalThis.StillwaterStoryModel.sync(game);assert.ok(game.story.pending.includes('v13.account-pressure'));assert.deepEqual(game.story.findings.echo.values,{photo:'reused',identity:'unverified'});
 for(const ending of ['unverified','released']){const ended=c.hydrate(JSON.parse(JSON.stringify(s)));c.deliver(ended,'v13.end-'+ending);c.send(ended,'你还在吗','wcr_new');assert.equal(ended.pending.some(p=>p.conversation==='wcr_new'),false);assert.equal(c.history(ended,'wcr_new').at(-1).text,'你还在吗');}
 const closed=c.hydrate(JSON.parse(JSON.stringify(s)));c.deliver(closed,'v13.end-auto-close');c.send(closed,'you there?','wcr_new');assert.equal(closed.pending.some(p=>p.conversation==='wcr_new'),true);
});
