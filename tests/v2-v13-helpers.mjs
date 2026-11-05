import assert from 'node:assert/strict';
for(const file of ['case-data.js','case-void-model.js','case-night-model.js','case-story-data.js','case-story-model.js','case-story-v13-text.js','case-story-v13-data.js','case-story-v13-model.js','case-state.js'])await import('../'+file);
export const M=globalThis.StillwaterCaseState,V=globalThis.StillwaterStoryV13,D=globalThis.StillwaterStoryV13Data;
export const move=(s,a,x={})=>{const r=M.transition(s,a,x);assert.equal(r.ok,true,a+': '+r.error);return r;};
export const answers={index:{use:'service',stay:'unverified'},diary:{purpose:'project',journal:'missing',draft:'mixed'},echo:{photo:'reused',identity:'unverified'},cause:{attendance:'worked',departure:'unsupported',people:'separate'},ROOM:{finding:'unsupported'},GUEST:{finding:'unverified'},EMPLOYEE:{finding:'unverified'}};
export function proof(s,key){
  for(const id of V.spec(key).sources){move(s,'story-open',{id});move(s,'story-draft',{key,source:id,checked:true});}
  if(key==='index')for(const id of ['booking','inventory'])move(s,'story-compare',{id});
  for(const [field,value] of Object.entries(answers[key]))move(s,'story-draft',{key,field,value});
  return move(s,'story-submit',{key});
}
export function start(){const s=M.fresh();move(s,'sample');move(s,'story-v13-begin');move(s,'story-query',{text:'王楚人'});return s;}
export function toCameras(){let s=start();for(const key of ['index','diary','echo','cause']){proof(s,key);s=M.hydrate(JSON.parse(JSON.stringify(s)));}move(s,'story-rewrite-shown');return s;}
export function equipment(){
  const s=toCameras();
  for(const [cam,pan] of [[0,2],[1,0]])move(s,'night-pan',{cam,pan});move(s,'night-link',{link:0});
  for(const [cam,pan] of [[1,2],[2,0]])move(s,'night-pan',{cam,pan});move(s,'night-link',{link:1});move(s,'night-pan',{cam:2,pan:2});move(s,'night-door');
  move(s,'night-walk',{position:'west'});for(const target of ['cart','cabinet','power'])move(s,'night-inspect',{target});move(s,'night-walk',{position:'service'});move(s,'night-inspect',{target:'enter'});move(s,'night-frame');
  for(const [node,target] of [[0,2],[1,1],[2,2],[3,0],[4,3],[5,0]])for(let i=0;i<4&&s.night.orientations[node]!==target;i++)move(s,'night-rotate',{node});
  move(s,'night-isolate');move(s,'night-manual');move(s,'night-save');move(s,'promo-source',{version:'original'});move(s,'promo-mark',{target:'middle'});move(s,'story-recover');return s;
}
export function classify(){
  const s=equipment();move(s,'void',{action:'enter',now:1000});for(const direction of ['left','right','left','right'])move(s,'void',{action:'walk',direction});
  for(const [id,dx,dy] of [[0,-3,2],[1,3,-3],[2,-3,-1]])move(s,'void',{action:'move',id,dx,dy});move(s,'void',{action:'review'});return s;
}
