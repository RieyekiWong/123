import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import '../case-void-model.js';
import '../case-night-model.js';
import '../case-data.js';
import '../case-state.js';
import '../case-audio-policy.js';
import '../case-audio-tracks.js';
const P=globalThis.StillwaterAudioPolicy,M=globalThis.StillwaterCaseState;
test('sound routing respects ordinary silent sites, first arrival, actual investigation and record gates',()=>{
 const state=M.fresh(),snapshot=JSON.stringify(state);
 for(const route of ['chat','forum','careers'])assert.equal(P.scene({route,state,engaged:true}),null);
 assert.equal(P.scene({route:'hotel',state}),null);
 assert.equal(P.scene({route:'hotel',state,engaged:true}),'investigation');
 assert.equal(P.scene({route:'staff',state,allowed:false}),null);
 assert.equal(P.scene({route:'rooms',state,engaged:true,blocked:true}),null);
 assert.equal(JSON.stringify(state),snapshot,'sound policy must not advance or persist case progress');
 state.evidence.push('C2');assert.equal(P.scene({route:'hotel',state}),'investigation');
});
test('live scenes, the black chapter and final reveal select one appropriate track without changing endings',()=>{
 const state=M.fresh();state.night.started=true;
 for(const route of ['rooms','guestbook','mirror'])assert.equal(P.scene({route,state}),'rewrite');
 assert.equal(P.scene({route:'review',state,transition:true}),'rewrite');
 assert.equal(P.scene({route:'mara',state}),'archive');
 assert.equal(P.scene({route:'cameras',state}),'cctv');
 for(const route of ['service-passage','terminal'])assert.equal(P.scene({route,state}),'passage');
 assert.equal(P.scene({route:'void',state}),'unlisted');state.night.void.stage='fragments';
 assert.equal(P.scene({route:'void',state}),'deep');
 for(const ending of ['auto-close','unverified'])assert.equal(P.scene({route:'ending',state,ending}),null);
 assert.equal(P.scene({route:'ending',state,ending:'released',endingPending:true}),null);
 assert.equal(P.scene({route:'ending',state,ending:'released',endingPending:false}),'safe');
 assert.equal(state.lastEnding,'');assert.deepEqual(state.endings,[]);
});
test('distant breathing waits for the opened cabinet and deeper black space',()=>{
 const s=M.fresh();s.night.door=true;s.night.passageRequired=true;
 assert.equal(P.deep('service-passage',s),false);s.night.passage.cabinetOpen=true;
 assert.equal(P.deep('service-passage',s),true);assert.equal(P.deep('void',s),false);
 s.night.void.stage='fragments';assert.equal(P.deep('void',s),true);
 assert.equal(P.deep('forum',s),false);
});
test('eight local CC0 loops have verified compressed files and full author/source records',()=>{
 const ledger=JSON.parse(readFileSync(new URL('../assets/audio-v28/credits.json',import.meta.url)));
 assert.equal(ledger.length,8);assert.deepEqual(ledger.map(t=>t.id),StillwaterAudioTracks.map(t=>t.id));
 let total=0;for(const track of ledger){
  assert.ok(track.title&&track.author&&track.source_sha256);assert.equal(track.license,'CC0-1.0');
  assert.match(track.source,/^https:\/\/opengameart.org\/content\//);
  for(const ext of ['mp3','ogg']){const item=track.files[ext],bytes=readFileSync(new URL('../'+item.file,import.meta.url));assert.equal(bytes.length,item.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);assert.ok(item.bytes<650000);total+=bytes.length;}
 }
 assert.ok(total<6*1024*1024,'both formats stay small enough to lazy-load');
});
