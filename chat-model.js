/* Conversation/save model. Fixed story messages and ordinary replies have separate paths.
   This module never reads the case save, awards clues, or changes a game route. */
globalThis.StillwaterChatModel = (() => {
  const D=globalThis.StillwaterChatData,P=globalThis.StillwaterChatProtocol,F=globalThis.StillwaterChatFallback;
  const KEY='stillwater-chat:v1',base=Date.parse('2026-11-03T09:40:00Z');
  const pace=ms=>Math.max(900,Math.round(ms*.65));
  const bounded=(n,max,otherwise=0)=>Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):otherwise;
  const validRoom=id=>id==='group'||Object.hasOwn(D.sideChats,id);
  const roomOf=m=>validRoom(m.conversation)?m.conversation:'group';
  const phase=s=>s.shared?'shared':s.cursor>=15?'job':'early';
  const topic=text=>({job:'work',fatigue:'sleep','unknown-person':'spoiler',other:'other'})[F.intent(text)]||F.intent(text);
  function fresh() {
    return {schema:1,pacing:2,social:1,cursor:1,remaining:2600,elapsed:0,wallElapsed:0,hold:0,counter:1,requestCounter:0,shared:false,openedForum:false,
      context:{reading:false,declined:false},messages:[{id:'m1',kind:'script',key:'s1',at:base}],pending:[],turns:{},memories:{},
      proactive:{remaining:95000,index:0},ui:{conversation:'group',list:false,scroll:{},drafts:{},unread:{},visited:{group:true}}};
  }
  function append(s,message) {
    const next={id:'m'+(++s.counter),at:base+Math.max(s.elapsed,s.wallElapsed||0),...message};s.messages.push(next);
    if(next.kind!=='user') {const room=roomOf(next);s.ui.unread[room]=Math.min(99,(s.ui.unread[room]||0)+1);}
    while(s.messages.length>400) {
      // Keep every story message and favour the busiest room when trimming free chat.
      const counts={};for(const m of s.messages)if(m.kind!=='script')counts[roomOf(m)]=(counts[roomOf(m)]||0)+1;
      const busiest=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];
      const index=s.messages.findIndex(m=>m.kind!=='script'&&roomOf(m)===busiest);
      if(index<0)break;s.messages.splice(index,1);
    }
    return next;
  }
  function resolved(m,language='zh') {
    if(m.kind==='user')return {person:'me',text:m.text};
    if(m.kind==='social')return {person:m.person,text:m.text};
    const entry=m.kind==='script'?D.script.find(e=>e.id===m.key):D.bank[m.key];
    return entry?{person:entry.person,text:entry.kind==='card'?'[Shared a forum post]':entry.text[language==='en'?1:0]}:null;
  }
  function history(s,room,language='zh') {
    const past=(D.sideChats[room]?.messages||[]).map(m=>({person:m.person,text:m.text[language==='en'?1:0]}));
    return [...past,...s.messages.filter(m=>roomOf(m)===room).map(m=>resolved(m,language)).filter(Boolean)];
  }
  function share(s) {
    if(s.shared)return;
    if(!s.messages.some(m=>m.kind==='script'&&m.key==='s31'))append(s,{kind:'script',key:'s31'});
    s.shared=true;s.cursor=Math.max(s.cursor,31);s.remaining=4400;
  }
  function send(s,value,conversation='group',rng=Math.random) {
    if(!validRoom(conversation))return false;
    const text=String(value).trim().slice(0,D.maxText);if(!text)return false;
    const message=append(s,{kind:'user',text,conversation});s.ui.drafts[conversation]='';s.ui.visited[conversation]=true;
    if(conversation==='notes')return true;
    const plan=F.plan(s,conversation,text,rng),profile=globalThis.StillwaterChatPeople.profile(plan.messages[0].person);
    // A new burst supersedes an undelivered answer in this room only.
    s.pending=s.pending.filter(p=>p.conversation!==conversation);
    const shareRequested=conversation==='group'&&plan.topic==='links'&&!s.shared;
    s.pending.push({kind:'social',id:'q'+(++s.requestCounter),conversation,anchor:message.id,language:plan.language,
      remaining:Math.round(profile.min+rng()*(profile.max-profile.min)),debounce:650,waiting:false,started:false,timeout:13000,
      messages:plan.messages,source:'local',share:shareRequested});
    if(conversation==='group') {
      if(plan.topic==='decline')s.context.declined=true;
      if(/我去看|我看看|点开了|打开了|i.ll.*look|opened it|clicked it/i.test(text)&&s.shared)s.context.reading=true;
      s.hold=2100;
    }
    return true;
  }
  function request(s,pending) {
    const language=pending.language,room=pending.conversation;
    let messages=history(s,room,language).slice(-P.limits.history).map((m,i,a)=>({...m,text:m.text.slice(0,i===a.length-1?D.maxText:1000)}));
    while(messages.length>1&&messages.reduce((n,m)=>n+m.text.length,0)>P.limits.historyChars)messages.shift();
    const last=messages.at(-1)?.text||'';
    const includeGroup=room!=='group'&&P.members.includes(room)&&/群|兼职|酒店|论坛|group|job|hotel|forum/i.test(last);
    const visibleGroup=includeGroup?history(s,'group',language).slice(-6).map(m=>({...m,text:m.text.slice(0,400)})):[];
    return {version:1,requestId:pending.id,room,language,messages,visibleGroup};
  }
  function accept(s,id,value) {
    const pending=s.pending.find(p=>p.id===id);if(!pending)return false;
    const validated=P.output(value,pending.conversation,id);if(!validated)return false;
    pending.messages=validated.messages.map((m,index)=>({...m,...(index&&m.person==='mom'?{afterthought:true}:{})}));pending.source=validated.mode;pending.waiting=false;
    // At most one extra pause; the actor's own delay has already elapsed during generation.
    pending.remaining=Math.max(300,pending.remaining);return true;
  }
  function fallback(s,id) {const p=s.pending.find(p=>p.id===id);if(p)p.waiting=false;}
  function markRead(s,room) {s.ui.unread[room]=0;s.ui.visited[room]=true;}
  function checkIn(s,room,language='zh') {
    const contact=globalThis.StillwaterChatPeople.contacts[room];
    if(!contact||s.memories[room]?.checkedIn||s.pending.some(p=>p.conversation===room))return null;
    const entry=contact.proactive[0],lang=s.memories[room]?.language||language;
    const message=append(s,{kind:'social',person:room,text:entry.text[lang==='en'?1:0],conversation:room,source:'local',...(entry.image?{image:entry.image}:{})});
    s.memories[room]||={turn:0,language:lang,topic:'',awaiting:'',payUnknown:false,recent:[]};s.memories[room].checkedIn=true;return message;
  }
  function advance(s,ms,{story=true,chatActive=true,proactive=false}={}) {
    const dt=bounded(ms,2000);s.wallElapsed=bounded((s.wallElapsed||0)+dt,86400000);if(chatActive)s.elapsed+=dt;
    s.hold=Math.max(0,s.hold-dt);let changed=false;
    const keep=[];
    for(const p of s.pending) {
      p.remaining-=dt;
      if(p.kind==='social') {
        p.debounce=Math.max(0,p.debounce-dt);
        if(p.waiting){p.timeout-=dt;if(p.timeout>0){keep.push(p);continue;}p.waiting=false;}
      }
      if(p.remaining>0){keep.push(p);continue;}
      if(p.kind==='social') {
        const entry=p.messages.shift();
        if(entry)append(s,{kind:'social',person:entry.person,text:entry.text,conversation:p.conversation,source:p.source});
        if(p.messages.length){p.remaining=p.messages[0].afterthought?6500:650+Math.min(900,p.messages[0].text.length*12);keep.push(p);}
        else if(p.share)share(s);
      } else {append(s,{kind:'reply',key:p.key});if(p.share)share(s);}
      changed=true;if(roomOf(p)==='group')s.hold=1400;
    }
    s.pending=keep;
    // Only chat-visible time counts towards the guaranteed scripted share.
    if(chatActive&&!s.shared&&s.elapsed>=120000) {
      if(s.cursor<25)append(s,{kind:'reply',key:'share_bridge:any:0'});
      append(s,{kind:'reply',key:'share_bridge:any:1'});share(s);changed=true;s.hold=1400;
    }
    if(chatActive&&proactive) {
      s.proactive.remaining-=dt;
      if(s.proactive.remaining<=0) {
        const candidates=['mom','zhang','gg','dad','milk','zhe','lin'].filter(id=>s.ui.visited[id]&&!s.pending.some(p=>p.conversation===id));
        const id=candidates[s.proactive.index%candidates.length];
        if(id&&checkIn(s,id))changed=true;
        s.proactive.index++;s.proactive.remaining=120000;
      }
    }
    if(!chatActive||!story||s.hold||s.cursor>=D.script.length)return changed;
    s.remaining=Math.max(0,s.remaining-dt);
    if(s.remaining===0) {
      while(s.cursor<D.script.length&&(s.openedForum||s.context.reading||s.context.declined)&&[43,44,45,46,49,50].includes(s.cursor+1))s.cursor++;
      if(s.cursor>=D.script.length)return changed;
      const next=D.script[s.cursor++];
      if(next.kind==='card')share(s);
      else if(!s.messages.some(m=>m.kind==='script'&&m.key===next.id))append(s,{kind:'script',key:next.id});
      if(next.id==='s30')share(s);
      s.remaining=pace(next.wait);changed=true;
    }
    return changed;
  }
  function hydrate(raw) {
    if(!raw||raw.schema!==1)return fresh();
    const s=fresh(),scriptIds=new Set(D.script.map(m=>m.id)),ids=new Set();
    const goodText=x=>typeof x==='string'&&x.trim().length;
    const messages=Array.isArray(raw.messages)?raw.messages.slice(-400).filter(m=>m&&
      ((m.kind==='script'&&scriptIds.has(m.key))||(m.kind==='reply'&&Object.hasOwn(D.bank,m.key))||(m.kind==='user'&&goodText(m.text))||
       (m.kind==='social'&&P.allowed(m.conversation).includes(m.person)&&goodText(m.text)&&!P.hidden.test(m.text)))):[];
    if(messages.length)s.messages=messages.map((m,index)=>{
      const id=/^m[1-9]\d{0,8}$/.test(m.id)&&!ids.has(m.id)?m.id:'m'+(index+1);ids.add(id);
      return {id,kind:m.kind,at:base+bounded(m.at-base,86400000),
        ...(m.kind==='user'?{text:m.text.slice(0,D.maxText),conversation:validRoom(m.conversation)?m.conversation:'group'}:
        m.kind==='social'?{person:m.person,text:m.text.slice(0,P.limits.reply),conversation:m.conversation,source:['ai','mock'].includes(m.source)?m.source:'local',...(globalThis.StillwaterMedia?.find(m.image)?{image:m.image}:{})}:{key:m.key})};
    });
    s.counter=Math.max(bounded(raw.counter,100000000),...s.messages.map(m=>Number(m.id.slice(1))));s.requestCounter=bounded(raw.requestCounter,100000000);
    s.cursor=Math.max(1,bounded(raw.cursor,D.script.length,1));s.elapsed=bounded(raw.elapsed,86400000);s.wallElapsed=Math.max(s.elapsed,bounded(raw.wallElapsed,86400000),...s.messages.map(m=>Math.max(0,m.at-base)));s.remaining=bounded(raw.remaining,10000,2600);s.hold=bounded(raw.hold,4200);
    if(raw.pacing!==2){s.remaining=Math.round(s.remaining*.65);s.hold=Math.round(s.hold*.65);}
    s.context={reading:raw.context?.reading===true,declined:raw.context?.declined===true};
    s.shared=s.messages.some(m=>m.kind==='script'&&m.key==='s31');s.openedForum=raw.openedForum===true;if(s.shared)s.cursor=Math.max(31,s.cursor);
    if(Array.isArray(raw.pending))for(const p of raw.pending.slice(-12)) {
      if(p&&Object.hasOwn(D.bank,p.key))s.pending.push({key:p.key,remaining:Math.round(bounded(p.remaining,15000)*(raw.pacing===2?1:.65)),share:p.share===true&&!s.shared});
      else if(p?.kind==='social'&&P.rooms.includes(p.conversation)&&/^q\d{1,9}$/.test(p.id)&&!s.pending.some(x=>x.id===p.id)) {
        const messages=Array.isArray(p.messages)?p.messages.slice(0,3).filter(e=>e&&P.allowed(p.conversation).includes(e.person)&&goodText(e.text)&&!P.hidden.test(e.text)).map(e=>({person:e.person,text:e.text.slice(0,P.limits.reply),...(e.afterthought?{afterthought:true}:{})})):[];
        if(messages.length)s.pending.push({kind:'social',id:p.id,conversation:p.conversation,anchor:String(p.anchor).slice(0,12),language:['zh','en','mixed'].includes(p.language)?p.language:'zh',remaining:bounded(p.remaining,30000,1200),debounce:0,waiting:false,started:true,timeout:0,messages,source:['ai','mock'].includes(p.source)?p.source:'local',share:p.share===true&&!s.shared&&p.conversation==='group'});
        s.requestCounter=Math.max(s.requestCounter,Number(p.id.slice(1)));
      }
    }
    if(raw.turns&&typeof raw.turns==='object')for(const [key,value]of Object.entries(raw.turns))if(/^[a-z_]+:(early|job|shared|any)$/.test(key))s.turns[key]=bounded(value,100000);
    for(const room of ['group',...Object.keys(D.sideChats)]) {
      const mem=raw.memories?.[room];
      if(mem)s.memories[room]={turn:bounded(mem.turn,100000),language:['zh','en','mixed'].includes(mem.language)?mem.language:'zh',topic:String(mem.topic||'').slice(0,30),awaiting:String(mem.awaiting||'').slice(0,30),payUnknown:mem.payUnknown===true,recent:Array.isArray(mem.recent)?mem.recent.filter(x=>typeof x==='string').slice(-5).map(x=>x.slice(0,600)):[],...(mem.checkedIn?{checkedIn:true}:{})};
      const ui=raw.ui||{};
      if(typeof ui.drafts?.[room]==='string')s.ui.drafts[room]=ui.drafts[room].slice(0,D.maxText);
      if(ui.scroll?.[room])s.ui.scroll[room]={top:bounded(ui.scroll[room].top,1000000),bottom:ui.scroll[room].bottom!==false};
      if(ui.unread?.[room])s.ui.unread[room]=bounded(ui.unread[room],99);
      if(ui.visited?.[room])s.ui.visited[room]=true;
    }
    s.ui.conversation=validRoom(raw.ui?.conversation)?raw.ui.conversation:'group';s.ui.list=raw.ui?.list===true;
    s.proactive={remaining:bounded(raw.proactive?.remaining,180000,95000),index:bounded(raw.proactive?.index,1000)};
    return s;
  }
  return {KEY,base,fresh,hydrate,phase,topic,send,advance,roomOf,resolved,history,request,accept,fallback,markRead,checkIn,validRoom};
})();
