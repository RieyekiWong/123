import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../case-story-data.js';
import '../case-story-model.js';
import {M,fullCase,booking,toAudit,solveProof,move} from './v2-evidence-model-helpers.mjs';
import '../site-media.js';
import '../chat-data.js';
import '../chat-personas.js';
import '../chat-protocol.js';
import '../chat-fallback.js';
import '../chat-photos.js';
import '../chat-story.js';
import '../chat-model.js';
const S=globalThis.StillwaterStoryModel,D=globalThis.StillwaterStoryData,C=globalThis.StillwaterChatModel;
function open(c,...ids){for(const id of ids)assert.equal(S.action(c,'open',{id}).ok,true,id);}
function submit(c,key){const spec=D.proofs[key];open(c,...spec.sources);if(key==='index')c.story.compare=['index','position'];if(key==='echo')c.story.compare=['sync','echo'];c.story.drafts[key]={links:Object.fromEntries(spec.fields.filter(f=>f.source).map(f=>[f.id,f.source])),sources:[...spec.sources],values:Object.fromEntries(spec.fields.map(f=>[f.id,f.answer]))};return S.action(c,'submit',{key});}
export function storyCase(){const c=fullCase();S.action(c,'activate');S.action(c,'query',{text:'Wang Churen'});for(const id of D.proofs.index.marks)S.action(c,'mark',{id});assert.equal(submit(c,'index').ok,true);S.action(c,'snapshot',{version:'2023'});S.action(c,'restore');assert.equal(submit(c,'diary').ok,true);assert.equal(submit(c,'echo').ok,true);S.action(c,'overlay',{x:0,y:0,zoom:100,anchor:'frame',mark:'plaque'});S.action(c,'overlay',{anchor:'lamp'});assert.equal(S.action(c,'overlay-submit').ok,true);assert.equal(submit(c,'cause').ok,true);S.action(c,'preview',{choice:'declined'});return c;}
test('new expansion is opt-in at runtime; schema-two legacy saves retain C1–C9, B-3 and endings',()=>{
 const raw=fullCase();delete raw.story;raw.night.started=true;const c=M.hydrate(raw);
 assert.equal(c.story.legacy,true);assert.equal(S.ready(c),true);assert.deepEqual(c.evidence,raw.evidence);assert.equal(c.night.started,true);
 const newPlayer=booking();S.action(newPlayer,'activate');assert.equal(S.ready(newPlayer),false);assert.equal(M.canOpen(newPlayer,'guest-index'),true);assert.equal(M.canOpen(newPlayer,'history-cache'),false);
});
test('fixed story batches deliver once, survive reload and never unlock case progress',()=>{
 const chat=C.fresh(),c=booking();S.action(c,'activate');S.sync(c,{shared:true});assert.deepEqual(c.story.pending,['discovery']);
 assert.equal(C.deliver(chat,'discovery').length,15);assert.equal(C.deliver(chat,'discovery').length,0);
 const loaded=C.hydrate(JSON.parse(JSON.stringify(chat)));assert.equal(C.deliver(loaded,'discovery').length,0);assert.equal(loaded.messages.filter(m=>m.kind==='story').length,15);assert.equal(loaded.messages.filter(m=>m.key==='discovery:11').length,1);assert.equal(c.evidence.includes('C3'),false);
 assert.equal(C.send(loaded,'hi','wcr_old'),false);assert.equal(C.send(loaded,'hi','wcr_new'),false);
});
test('new account stays separate; authored replies retain 317 on reload without calling an unsupported AI role',()=>{
 const c=C.fresh();c.story.request='accepted';C.send(c,'你在哪儿','wcr_new');for(let i=0;i<5;i++)C.advance(c,250,{story:false,chatActive:false});
 const loaded=C.hydrate(JSON.parse(JSON.stringify(c)));assert.match(C.history(loaded,'wcr_new').at(-1).text,/317/);assert.equal(C.history(loaded,'mom').some(m=>/317/.test(m.text)),false);assert.equal(globalThis.StillwaterChatProtocol.rooms.includes('wcr_new'),false);
 assert.equal(globalThis.StillwaterChatStory.old.length,8);assert.equal(globalThis.StillwaterChatData.sideChats.wcr_old.historyAt<Date.parse('2024-01-01'),true);
});
test('P2 needs actual original sources, field marks and a supported assessment, not denial of a person',()=>{
 const c=toAudit();S.action(c,'activate');S.action(c,'query',{text:'王楚人'});
 assert.equal(submit(c,'index').error,'marks');for(const id of D.proofs.index.marks)S.action(c,'mark',{id});
 c.story.compare=['index','position'];c.story.drafts.index.values.stay='disproved';assert.equal(S.action(c,'submit',{key:'index'}).error,'person');c.story.drafts.index.values.stay='insufficient';assert.equal(S.action(c,'submit',{key:'index'}).ok,true);
 assert.equal(globalThis.StillwaterCaseData.documents.booking.rows.find(r=>r.id==='guest').value[0],'E. Vale');assert.equal(c.story.findings.index.sources.length,4);
});
test('cache, independent diary evidence, echo and causal chain persist; no API or button-count validation',()=>{
 let c=storyCase();assert.equal(S.ready(c),true);assert.deepEqual(c.story.effects,['GF-01','GF-02']);assert.equal(c.story.restored,true);
 c=M.hydrate(JSON.parse(JSON.stringify(c)));assert.equal(S.ready(c),true);for(const key of ['index','diary','echo','cause'])assert.ok(c.story.findings[key]);assert.equal(c.story.overlay.verified,true);
 delete c.story.findings.diary;assert.equal(S.ready(c),false);
});
test('wrong sources, unsupported diary claims and unaligned photos fail without clearing prior progress',()=>{
 const c=storyCase(),old=structuredClone(c.story.findings.index);c.story.drafts.echo.sources=['echo'];assert.equal(S.action(c,'submit',{key:'echo'}).error,'source');assert.deepEqual(c.story.findings.index,old);
 c.story.drafts.diary.values.tomorrow='2023';assert.equal(S.action(c,'submit',{key:'diary'}).error,'diary');
 S.action(c,'overlay',{x:5});assert.equal(S.action(c,'overlay-submit').error,'align');
});
test('ignored request has the same inspectable evidence and does not gate the source trace',()=>{
 const c=storyCase();S.action(c,'request',{choice:'ignored'});assert.equal(c.story.request,'ignored');assert.equal(S.allowed(c,'echo'),true);assert.equal(S.ready(c),true);
 const raw=JSON.parse(JSON.stringify(c));for(const end of ['auto-close','unverified','released']){const copy=M.hydrate(raw);copy.lastEnding=end;S.sync(copy);assert.ok(copy.story.pending.includes('end-'+end));}
});
test('three NULL events are once-only, and source text is available independently of effects',()=>{
 const c=storyCase();S.action(c,'played',{id:'GF-01'});const copy=M.hydrate(JSON.parse(JSON.stringify(c)));S.sync(copy);assert.equal(copy.story.played.filter(x=>x==='GF-01').length,1);assert.equal(D.nullLines.length,6);assert.equal(copy.story.restored,true);
});
test('free scripted replies remain bounded without trimming the fixed story, and cannot migrate into another contact',()=>{
 const c=C.fresh();c.story.request='accepted';C.deliver(c,'discovery');for(let i=0;i<450;i++){C.send(c,'hello '+i,'wcr_new');C.advance(c,1000,{story:false,chatActive:false});}
 assert.ok(c.messages.length<=400);assert.ok(c.messages.some(m=>m.key==='discovery:11'));
 const raw=structuredClone(c);raw.messages.push({id:'m9000',kind:'story',key:'wcr-where',conversation:'mom',at:C.base});const safe=C.hydrate(raw);assert.equal(safe.messages.some(m=>m.id==='m9000'),false);
});
test('retained photo observation survives later view adjustments and refresh',()=>{
 const c=storyCase();S.action(c,'overlay',{x:15,zoom:110});const loaded=M.hydrate(JSON.parse(JSON.stringify(c)));assert.equal(loaded.story.overlay.verified,true);assert.equal(loaded.story.overlay.x,15);assert.equal(S.ready(loaded),true);
});
test('malformed new metadata cannot erase a valid original case or crash schema-two hydration',()=>{
 const raw=storyCase();raw.story.findings.index.sources={};raw.story.overlay.retained={anchors:{},x:0,y:0,zoom:100};const loaded=M.hydrate(JSON.parse(JSON.stringify(raw)));assert.deepEqual(loaded.evidence,raw.evidence);assert.equal(loaded.completed.finalEvidence,true);assert.equal(loaded.story.findings.index,undefined);assert.equal(loaded.story.overlay.verified,false);
});
