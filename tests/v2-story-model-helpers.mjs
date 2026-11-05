import '../case-story-data.js';
import '../case-story-model.js';
import {fullCase} from './v2-evidence-model-helpers.mjs';
export function storyReady(){
 const s=fullCase(),M=globalThis.StillwaterStoryModel,D=globalThis.StillwaterStoryData;
 M.action(s,'activate');M.action(s,'query',{text:'王楚人'});for(const id of ['name','year','position','revision'])M.action(s,'mark',{id});
 const solve=key=>{const spec=D.proofs[key];for(const id of spec.sources)M.action(s,'open',{id});if(key==='index')s.story.compare=['index','position'];if(key==='echo')s.story.compare=['sync','echo'];s.story.drafts[key]={sources:[...spec.sources],values:Object.fromEntries(spec.fields.map(f=>[f.id,f.answer])),links:Object.fromEntries(spec.fields.filter(f=>f.source).map(f=>[f.id,f.source]))};const result=M.action(s,'submit',{key});if(!result.ok)throw Error(key+': '+result.error);};
 solve('index');M.action(s,'snapshot',{version:'2023'});M.action(s,'restore');solve('diary');solve('echo');M.action(s,'overlay',{x:0,y:0,zoom:100,anchor:'frame',mark:'plaque'});M.action(s,'overlay',{anchor:'lamp'});M.action(s,'overlay-submit');solve('cause');M.action(s,'preview',{choice:'declined'});s.preferences.popupAds=false;return s;
}
