import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../chat-data.js';
import '../chat-model.js';
const D=globalThis.StillwaterChatData,M=globalThis.StillwaterChatModel;
const run=(s,ms,options)=>{for(let time=0;time<ms;time+=1000)M.advance(s,1000,options);};
test('54 fictional group messages include one real forum card and never speak for Rieyeki or reveal the case',()=>{
  assert.equal(D.script.length,54);assert.equal(new Set(D.script.map(m=>m.id)).size,54);
  assert.equal(D.script.filter(m=>m.kind==='card').length,1);assert.equal(D.script[30].post,'job');
  assert.ok(D.script.every(m=>m.person!=='me'));
  assert.doesNotMatch(JSON.stringify(D.script),/317|Mara|Continuity|TEMP-015|R-4829|2007|关闭酒店/i);
});
test('an unattended visible conversation shares automatically and finishes in roughly three minutes',()=>{
  const s=M.fresh();let finishedAt=0;
  for(let i=0;i<360;i++){M.advance(s,1000);if(s.cursor===54){finishedAt=s.elapsed;break;}}
  assert.equal(s.shared,true);assert.equal(s.messages.length,54);
  assert.ok(finishedAt>=150000&&finishedAt<=240000,finishedAt);
  run(s,60000);assert.equal(s.messages.length,54);assert.ok(s.messages.every(m=>m.kind==='script'));
});
test('free replies respect the current subject and asking for a link publishes it early exactly once',()=>{
  const s=M.fresh();M.send(s,'刚起，我也没睡好','group',()=>0);run(s,3000);
  assert.equal(s.shared,false);assert.ok(s.cursor<15);
  M.send(s,'什么工作，多少钱？','group',()=>0);run(s,3000);assert.equal(M.phase(s),'job');
  M.send(s,'发链接我看看','group',()=>0);run(s,4000);assert.equal(s.shared,true);
  const scripts=s.messages.filter(m=>m.key==='s31');assert.equal(scripts.length,1);
  M.send(s,'在哪看','group',()=>0);run(s,4000);assert.equal(s.messages.filter(m=>m.key==='s31').length,1);
  assert.ok(s.messages.some(m=>m.kind==='user'&&m.text==='刚起，我也没睡好'));
});
test('spoiler probes, refusal, laughs and unknown topics receive conversational replies without case knowledge',()=>{
  const s=M.fresh();
  for(const text of ['317 Mara Continuity TEMP-015','我不看了','哈哈哈哈','蓝莓蛋糕','我没看懂','今天下雨了吗']){
    M.send(s,text,'group',()=>0);run(s,2500,{story:false});
    const last=s.messages.at(-1);assert.equal(last.kind,'reply');
    assert.doesNotMatch(JSON.stringify(D.bank[last.key].text),/317|Mara|Continuity|TEMP-015|系统无法识别|未识别指令/i);
  }
  assert.equal(s.shared,false);
});
test('lengths, pending replies and history are bounded while a published card remains available',()=>{
  const s=M.fresh();assert.equal(M.send(s,'   '),false);
  M.send(s,'link','group',()=>0);run(s,3000);
  for(let i=0;i<600;i++)M.send(s,'<img onerror=alert(1)>'.repeat(50),'group',()=>0);
  assert.ok(s.messages.length<=400);assert.ok(s.pending.length<=6);
  assert.ok(s.messages.filter(m=>m.kind==='user').every(m=>m.text.length<=600));
  assert.equal(s.messages.filter(m=>m.key==='s31').length,1);
});
test('refresh and language-independent hydration retain chat, pending replies, draft and reading position',()=>{
  const s=M.fresh();run(s,21000);M.send(s,'这个靠谱么','group',()=>0);
  s.ui.scroll.group={top:121,bottom:false};s.ui.drafts.group='还没写完';s.openedForum=true;
  const restored=M.hydrate(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(restored.messages,s.messages);assert.deepEqual(restored.pending,s.pending);
  assert.equal(restored.cursor,s.cursor);assert.equal(restored.elapsed,s.elapsed);
  assert.deepEqual(restored.ui,s.ui);assert.equal(restored.openedForum,true);
});
test('reading older messages pauses the scripted conversation while pending answers can still arrive',()=>{
  const s=M.fresh();run(s,15000,{story:false});assert.equal(s.cursor,1);
  M.send(s,'早啊','group',()=>0);run(s,4000,{story:false});
  assert.equal(s.cursor,1);assert.equal(s.messages.at(-1).kind,'reply');
});
test('unknown replies rotate and malformed storage cannot invent speakers or message types',()=>{
  const s=M.fresh(),keys=[];
  for(let i=0;i<3;i++){M.send(s,'咕咕咕','group',()=>.6);run(s,3000,{story:false});keys.push(s.messages.at(-1).key);}
  assert.equal(new Set(keys).size,3);
  const bad=M.hydrate({schema:1,cursor:-100,messages:[{kind:'evil',text:'no'},{kind:'reply',key:'constructor'},{kind:'script',key:'s1',at:M.base}],pending:[{key:'missing'}],ui:{conversation:'evil'}});
  assert.equal(bad.messages.length,1);assert.equal(bad.ui.conversation,'group');assert.deepEqual(bad.pending,[]);
});
test('English homework stays in everyday chat instead of matching the word work inside it',()=>{
  const s=M.fresh();assert.equal(M.topic('Still have homework to finish.'),'homework');
  assert.equal(M.topic('Any part-time work?'),'work');assert.equal(M.topic('How much does it pay?'),'pay');
  M.send(s,'Still have homework to finish.','group',()=>0);run(s,4000);
  assert.equal(M.phase(s),'early');assert.equal(s.shared,false);
});
test('job and pay replies belong to GGbond, and the conversation does not ask the same question again',()=>{
 const s=M.fresh();M.send(s,'什么工作','group',()=>0);run(s,2000,{story:false});
 assert.equal(D.bank[s.messages.at(-1).key].person,'gg');assert.equal(s.cursor,25);
 M.send(s,'工资多少','group',()=>0);run(s,2000,{story:false});assert.equal(D.bank[s.messages.at(-1).key].person,'gg');assert.equal(s.cursor,27);
 M.send(s,'发链接','group',()=>0);run(s,2000,{story:false});M.send(s,'我去看看','group',()=>0);run(s,180000);
 assert.ok(s.shared);assert.equal(s.context.reading,true);
 assert.ok(!s.messages.some(m=>m.kind==='script'&&['s43','s44','s45','s46','s49','s50'].includes(m.key)));
});
test('the forum arrives without keywords even when player input keeps delaying the ordinary script',()=>{
 const s=M.fresh();for(let i=0;i<121;i++){if(i%4===0)M.send(s,'嗯嗯','group',()=>0);M.advance(s,1000,{story:false});}
 assert.equal(s.shared,true);assert.equal(s.messages.filter(m=>m.key==='s31').length,1);
});
test('old pacing migrates once while messages, drafts and reading position stay intact',()=>{
 const raw=M.fresh();delete raw.pacing;raw.remaining=6000;raw.ui.drafts.group='还没发';raw.ui.scroll.group={top:80,bottom:false};
 const migrated=M.hydrate(raw);assert.equal(migrated.remaining,3900);assert.equal(migrated.ui.drafts.group,'还没发');assert.equal(migrated.ui.scroll.group.top,80);
 assert.equal(M.hydrate(migrated).remaining,3900);
});
