import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

function model(chat=false){
  const context=vm.createContext({URLSearchParams});
  const files=chat?['site-media.js','chat-data.js','chat-personas.js','chat-protocol.js','chat-fallback.js','chat-model.js','chat-photos.js','sw2-front-data.js','sw2-data.js','sw2-progress.js','sw2-opening-data.js','sw2-chat-story.js']:['sw2-front-data.js','sw2-data.js','sw2-progress.js'];
  for(const file of files)vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),context);
  return {M:context.Stillwater2Progress,D:context.Stillwater2Data,context};
}
function complete(M,D,s,id){
  for(const source of D.puzzles[id].sources){assert.equal(M.action(s,'view',{id:source}).ok,true);assert.equal(M.action(s,'close-source').ok,true);}
  if(id==='P1')assert.equal(M.solved(s,id),true);
  else if(id==='P2'){
    M.action(s,'entry-open');
    for(const key of ['closedBeforeVisit','enquiryNotBooking'])M.action(s,'stay-reason',{id:key,checked:true});
    assert.equal(M.action(s,'check-stay').ok,true);
  }else assert.equal(M.action(s,'checkpoint',{puzzle:id}).ok,true);
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
  for(const raw of [null,{schema:2,evidence:['C9']},{schema:1,edition:'2.0',prototype:false},{schema:9,edition:'2.0',prototype:true},{schema:1,storyRevision:3,edition:'2.0',prototype:true}])assert.equal(M.hydrate(raw),null);
  const s=M.fresh();assert.equal(s.edition,'2.0');assert.equal(s.prototype,true);
  assert.equal(M.canOpen(s,'heritage/b3'),false);assert.equal(M.canOpen(s,'phase'),false);assert.equal(M.canRead(s,'testimony'),false);
  assert.equal(M.importPreferences({preferences:{skipScares:true}}).skipScares,false);
  assert.equal(M.importPreferences({preferences:{skipScares:true,scareChoiceMade:true,popupAds:false}}).skipScares,true);
});

test('checkpoint progress needs its own available sources; draft, hints and reading boundary survive hydration',()=>{
  const {M,D}=model(),s=M.fresh();
  assert.equal(M.action(s,'checkpoint',{puzzle:'P1'}).error,'formal-check-required');
  assert.equal(M.action(s,'view',{id:'testimony'}).ok,false);
  assert.equal(M.action(s,'checkpoint',{puzzle:'P7'}).ok,false);
  M.action(s,'draft',{puzzle:'P1',field:'note',value:'这不是订房 / not a booking'});
  for(let i=0;i<5;i++)M.action(s,'hint',{puzzle:'P1'});
  complete(M,D,s,'P1');
  const restored=M.hydrate(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.drafts.P1.note,'这不是订房 / not a booking');assert.equal(restored.hints.P1,3);
  assert.equal(restored.transition.to,'hotel');assert.equal(M.goal(restored),'forum');
  assert.equal(M.action(restored,'continue').ok,true);assert.equal(restored.route,'hotel');
  assert.equal(M.action(restored,'checkpoint',{puzzle:'P1'}).ok,false);assert.equal(restored.transition,null);
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

test('P1 reads either attachment order and only advances after the second drawer closes',()=>{
  for(const order of [['closure','restoration'],['restoration','closure']]){
    const {M}=model(),s=M.fresh();
    assert.equal(M.action(s,'checkpoint',{puzzle:'P1'}).error,'formal-check-required');
    M.action(s,'view',{id:order[0]});M.action(s,'close-source');
    assert.equal(M.solved(s,'P1'),false);assert.equal(s.transition,null);
    M.action(s,'view',{id:order[1]});assert.equal(M.solved(s,'P1'),false);
    const resumed=M.hydrate(JSON.parse(JSON.stringify(s)));
    assert.equal(resumed.reading,order[1]);M.action(resumed,'close-source');
    assert.equal(resumed.results.P1.method,'two-dates');assert.equal(resumed.transition.to,'hotel');
    assert.deepEqual([...resumed.events.pending],['sw2.P1']);
    M.action(resumed,'continue');M.action(resumed,'view',{id:order[0]});M.action(resumed,'close-source');
    assert.equal(resumed.transition,null);assert.equal(resumed.events.pending.length,1);
  }
});

test('P2 rejects every unsupported pair and opening a source or clicking a checkpoint never solves it',()=>{
  const reasons=['closedBeforeVisit','sameName','enquiryNotBooking','oldPhotos'];
  for(let i=0;i<reasons.length;i++)for(let j=i+1;j<reasons.length;j++){
    const {M,D}=model(),s=M.fresh();complete(M,D,s,'P1');M.action(s,'continue');
    assert.equal(M.action(s,'check-stay').error,'sources');
    M.action(s,'entry-open');assert.equal(M.solved(s,'P2'),false);
    assert.equal(M.action(s,'checkpoint',{puzzle:'P2'}).error,'formal-check-required');
    assert.equal(M.action(s,'check-stay').error,'two-reasons');
    for(const id of [reasons[i],reasons[j]])M.action(s,'stay-reason',{id,checked:true});
    const original=JSON.stringify(s.drafts),right=i===0&&j===2,result=M.action(s,'check-stay');
    assert.equal(result.ok,right);assert.equal(JSON.stringify(s.drafts),original);
    if(right){assert.equal(s.results.P2.method,'stay-source-check');assert.equal(s.transition.to,'hotel/archive-project');assert.ok(s.events.pending.includes('sw2.P2'));}
    else {assert.equal(result.error,'unsupported-reasons');assert.equal(s.transition,null);assert.equal(s.events.pending.includes('sw2.P2'),false);}
  }
});

test('record choices, own notes and nonblocking friend context survive refresh without bleeding into the old case',()=>{
  const {M,D}=model(),s=M.fresh();complete(M,D,s,'P1');M.action(s,'continue');
  assert.equal(M.destination(s),'hotel/guestbook');
  assert.equal(s.oldFriendContextViewed,false);assert.equal(M.canOpen(s,'hotel/rooms'),true);
  assert.equal(M.canOpen(s,'hotel/archive-project'),true);assert.equal(M.canOpen(s,'phase'),false);
  M.action(s,'entry-open');M.action(s,'stay-reason',{id:'sameName',checked:true});
  M.action(s,'draft',{puzzle:'P2',field:'note',value:'这页的年份不对'});
  let resumed=M.hydrate(JSON.parse(JSON.stringify(s)));
  assert.equal(M.destination(resumed),'hotel?record=churen');assert.equal(resumed.entryOpened,true);
  assert.equal(resumed.drafts.P2.note,'这页的年份不对');assert.deepEqual([...resumed.drafts.P2.reasons],['sameName']);
  assert.equal(M.solved(resumed,'P2'),false);
  M.action(resumed,'friend-context');resumed=M.hydrate(JSON.parse(JSON.stringify(resumed)));assert.equal(resumed.oldFriendContextViewed,true);
});

test('Stage 1 late-preview and ending saves migrate without pretending to verify the new P2 reasoning',()=>{
  const {M,D}=model();
  for(const end of ['',...D.endings]){
    const s=M.fresh();through(M,D,s);
    if(end){for(const id of D.puzzles.P8.sources)M.action(s,'view',{id});M.action(s,'ending',{id:end});}
    delete s.storyRevision;delete s.entryOpened;delete s.oldFriendContextViewed;
    for(const r of Object.values(s.results)){delete r.method;delete r.reasons;}
    const before=JSON.stringify(s),migrated=M.hydrate(s);
    assert.equal(JSON.stringify(s),before);assert.equal(migrated.storyRevision,2);
    assert.equal(migrated.results.P2.compat,'stage1-route-check');assert.equal(migrated.results.P2.method,undefined);
    assert.equal(migrated.lastEnding,end);assert.equal(M.canOpen(migrated,'heritage/b3'),true);
    const again=M.hydrate(JSON.parse(JSON.stringify(migrated)));assert.equal(again.results.P2.compat,'stage1-route-check');assert.equal(again.lastEnding,end);
  }
});

test('new preview data cannot bypass P2 by omitting its reasoning metadata',()=>{
  const {M,D}=model(),s=M.fresh();through(M,D,s,'P3');
  delete s.results.P2.method;delete s.results.P2.reasons;
  const resumed=M.hydrate(s);assert.equal(M.solved(resumed,'P1'),true);assert.equal(M.solved(resumed,'P2'),false);assert.equal(M.canOpen(resumed,'phase'),false);
});

test('the opening keeps real ordinary histories, limited uploads and the fixed entrance independent of AI and photo visits',()=>{
  const {context,M}=model(true),C=context.StillwaterChatModel,O=context.StillwaterChatOpening,s=C.fresh();
  assert.equal(O.old,undefined);const old=O.sideMessages(s,'wcr_old');
  assert.ok(old.length>=30);assert.ok(old.some(m=>m.person==='me'));assert.equal(Object.keys(O.photos).length,5);
  assert.equal(O.contactVisible(s,'wcr_old'),true);
  const posted=[],append=(state,message)=>{state.messages.push(message);posted.push(message.key);};
  O.advance(s,33000,{chatActive:true},append);assert.equal(s.shared,false);
  O.advance(s,1000,{chatActive:true},append);assert.equal(s.shared,true);assert.equal(posted.at(-1),'sw2.discovery.card');
  const modelState=M.fresh();assert.equal(modelState.oldFriendContextViewed,false);
  s.openedForum=true;const count=posted.length;O.advance(s,100000,{chatActive:true},append);assert.equal(posted.length,count);
  const text=context.Stillwater2FrontData.sources.enquiry.body.join(' ');assert.ok(text.includes('聊天截屏'));assert.ok(text.includes('cropped out'));
});

test('the real forum and seven hotel pages retain ordinary browsing and bilingual source checks without old recruitment gates',()=>{
  const {context,M,D}=model(),s=M.fresh();context.location={hash:'#sw2/forum?topic=hotel-return'};
  for(const file of ['site-media.js','forum-data.js','forum-extra-data.js','forum-avatars.js','forum.js','sw2-front.js','case-ending.js','sw2-pages.js'])vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),context);
  const originalPosts=context.StillwaterForumData,postsBefore=JSON.stringify(originalPosts);
  for(const language of [0,1]){
    const pages=context.Stillwater2Pages({t:(zh,en)=>language?en:zh,esc:String,getState:()=>s});
    context.location.hash='#sw2/forum?topic=hotel-return';let html=pages.render('forum');
    assert.ok(html.includes('data-source="closure"'));assert.equal(html.includes('data-sw2-action="checkpoint"'),false);
    assert.equal(html.includes('href="#careers'),false);assert.equal(html.includes('href="#forum'),false);
    context.location.hash='#sw2/forum';html=pages.render('forum');
    assert.ok(html.includes('data-forum-topic="dinner"'));assert.equal(html.includes('data-forum-topic="job"'),false);
    for(const [route]of context.Stillwater2FrontData.menus){context.location.hash='#sw2/'+route;html=pages.render(route);assert.ok(html.includes('sw2-hotel-header'));assert.equal(html.includes('undefined'),false);}
    context.location.hash='#sw2/hotel?record=churen';html=pages.render('hotel');
    assert.ok(html.includes('sw2-stay-form'));assert.ok(html.includes('name="stay-reason"'));assert.ok(html.includes('2023-10-17'));
  }
  assert.equal(JSON.stringify(originalPosts),postsBefore);
});
