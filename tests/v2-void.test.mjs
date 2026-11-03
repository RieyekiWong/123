import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../case-data.js';
import '../case-void-model.js';
import '../case-night-model.js';
import '../case-state.js';
const V=globalThis.StillwaterVoidModel,M=globalThis.StillwaterCaseState,D=globalThis.StillwaterCaseData;
const act=(v,action,p={})=>V.transition(v,action,p);
const enter=()=>{const v=V.fresh();act(v,'enter',{now:1000});return v;};
function corridor(v){for(let step=0;step<4;step++)assert.ok(act(v,'walk',{direction:V.correct(step)}).ok);}
function align(v){for(let id=0;id<3;id++)act(v,'move',{id,dx:-v.positions[id][0],dy:-v.positions[id][1]});}
function finish(v){corridor(v);align(v);act(v,'review');act(v,'terminal');for(const type of ['ROOM','GUEST','EMPLOYEE'])act(v,'classify',{type});act(v,'classify',{type:'UNVERIFIED'});act(v,'leave');}
function ready(){const s=M.fresh();s.evidence=Object.keys(D.clues);s.completed={serviceInspected:true,audit:true,finalEvidence:true};Object.assign(s.night,{started:true,links:[0,1],door:true,frame:true,orientations:[2,1,2,0,3,0],isolated:true,manual:true,saved:true,operations:6});return s;}
test('corridor routes depend on all three visible anchors and wrong doors retain the case while changing the entrance',()=>{
 const v=enter();assert.equal(act(v,'walk',{direction:'right'}).ok,true);assert.equal(v.step,0);assert.equal(v.visits,2);assert.equal(v.shadow,true);
 act(v,'observe',{target:'shadow'});assert.equal(v.shadow,false);act(v,'walk',{direction:'right'});assert.equal(v.shadow,false);
 assert.equal(v.events.filter(id=>id==='entry-shadow').length,1);corridor(v);assert.equal(v.stage,'fragments');
 assert.ok(V.scenes.some(scene=>scene.left[0]===scene.right[0]));
});
test('fragments really move, clamp and require continuous edges before review, with a local reset',()=>{
 const v=enter();corridor(v);assert.equal(act(v,'review').ok,false);
 act(v,'move',{id:0,dx:100,dy:-100});assert.deepEqual(v.positions[0],[6,-6]);act(v,'reset-fragments');assert.deepEqual(v.positions,V.initial);
 align(v);assert.deepEqual(V.aligned(v),[0,1,2]);assert.equal(act(v,'review').event,'void-fragment-face');
 assert.equal(act(v,'review').event,undefined);assert.equal(v.reviewed,true);assert.equal(act(v,'move',{id:0,dx:1,dy:0}).ok,false);
});
test('the classification terminal rejects an early unverified result and never manufactures an ending',()=>{
 const v=enter();assert.equal(act(v,'terminal').ok,false);corridor(v);align(v);act(v,'review');act(v,'terminal');
 assert.equal(act(v,'classify',{type:'UNVERIFIED'}).ok,false);
 for(const type of ['EMPLOYEE','ROOM','GUEST'])assert.ok(act(v,'classify',{type}).ok);
 assert.ok(v.events.includes('terminal-shape'));assert.ok(act(v,'classify',{type:'UNVERIFIED'}).ok);assert.equal(v.complete,false);
 assert.equal(act(v,'lookback').event,'void-lookback');assert.equal(act(v,'lookback').event,undefined);
 assert.equal(act(v,'leave').route,'terminal');assert.equal(v.complete,true);
});
test('partial and completed void progress survive hydration, while malformed additions cannot erase original case facts',()=>{
 const s=ready();M.transition(s,'void',{action:'enter',now:1000});corridor(s.night.void);act(s.night.void,'move',{id:1,dx:2,dy:-1});
 const restored=M.hydrate(JSON.parse(JSON.stringify(s)));assert.deepEqual(restored.night.void.positions,s.night.void.positions);assert.equal(restored.night.void.stage,'fragments');assert.deepEqual(restored.evidence,s.evidence);
 s.night.void={schema:1,step:'bad',positions:[null],events:'bad'};const safe=M.hydrate(s);assert.equal(safe.evidence.length,9);assert.equal(safe.night.void.complete,false);
});
test('void deep links and actions require the actual restored frame, saved valid circuit and prior case',()=>{
 const s=M.fresh();assert.equal(M.canOpen(s,'void'),false);assert.equal(M.transition(s,'void',{action:'enter'}).ok,false);
 const r=ready();r.night.saved=false;assert.equal(M.canOpen(r,'void'),false);r.night.saved=true;r.night.frame=false;assert.equal(M.canOpen(r,'void'),false);
 r.night.frame=true;assert.equal(M.canOpen(r,'void'),true);assert.ok(M.transition(r,'void',{action:'enter'}).ok);
 r.night.saved=false;assert.equal(M.canOpen(r,'void'),true); // Already admitted: safe to resume.
});
test('fresh true endings need the new chapter; the two original early decisions remain available',()=>{
 const s=ready();assert.equal(M.transition(s,'night-lock').error,'void-first');
 assert.ok(M.transition(s,'ending',{ending:'auto-close'}).ok);assert.ok(M.transition(s,'ending',{ending:'unverified'}).ok);
 M.transition(s,'void',{action:'enter',now:1000});finish(s.night.void);
 assert.ok(M.transition(s,'night-lock').ok);assert.ok(M.transition(s,'ending',{ending:'released'}).ok);assert.equal(s.endings.length,3);
});
test('already completed old saves stay complete and may explore the new chapter voluntarily',()=>{
 const old=ready();delete old.night.void;old.night.locked=true;old.night.released=true;old.endings=['released'];old.lastEnding='released';
 const restored=M.hydrate(old);assert.equal(restored.night.void.legacy,true);assert.equal(restored.night.void.complete,false);assert.deepEqual(restored.endings,['released']);
 assert.ok(M.canOpen(restored,'void'));assert.ok(M.transition(restored,'ending',{ending:'released'}).ok);
});
