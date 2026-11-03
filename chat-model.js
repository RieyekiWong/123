/* Pure local conversation model. It never reads or grants case progress. */
globalThis.StillwaterChatModel = (() => {
  const D=globalThis.StillwaterChatData;
  const KEY='stillwater-chat:v1';
  const base=Date.parse('2026-11-03T09:40:00Z');
  const pace=ms=>Math.max(900,Math.round(ms*.65));
  const bounded=(n,max,otherwise=0)=>Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):otherwise;
  const phase=s=>s.shared?'shared':s.cursor>=15?'job':'early';
  function fresh() {
    return {schema:1,pacing:2,cursor:1,remaining:2600,elapsed:0,hold:0,counter:1,shared:false,openedForum:false,context:{reading:false,declined:false},
      messages:[{id:'m1',kind:'script',key:'s1',at:base}],pending:[],turns:{},
      ui:{conversation:'group',list:false,scroll:{},drafts:{}}};
  }
  function append(s,message) {
    s.messages.push({id:'m'+(++s.counter),at:base+s.elapsed,...message});
    while(s.messages.length>400) {
      const index=s.messages.findIndex(m=>m.kind==='user'||m.kind==='reply');
      if(index<0)break;
      s.messages.splice(index,1);
    }
  }
  function share(s) {
    if(s.shared)return;
    if(!s.messages.some(m=>m.kind==='script'&&m.key==='s31'))append(s,{kind:'script',key:'s31'});
    s.shared=true;s.cursor=Math.max(s.cursor,31);s.remaining=4400;
  }
  function topic(text) {
    const value=text.toLowerCase();
    if(/317|mara|continuity|temp[\s-]*015|r[\s-]*4829/.test(value))return 'spoiler';
    if(/不想看|不看了|先不点|不点|没空|先忙|not interested|don.t want|not now|busy|won.t look/.test(value))return 'decline';
    if(/链接|发来|发我|发一下|论坛|在哪|地址|link|send it|send me|forum|where can/.test(value))return 'links';
    if(/靠谱|假的|诈骗|骗人|可信|safe|scam|legit|fake|trust/.test(value))return 'skeptical';
    if(/工资|多少钱|薪水|薪酬|\b(?:pay|money|wages?|salary)\b|\bhow much\b/.test(value))return 'pay';
    if(/兼职|工作|工资|多少钱|薪水|薪酬|\b(?:job|work|pay|money|wages?|salary)\b|part[ -]?time|\bhow much\b/.test(value))return 'work';
    if(/作业|文件|导出|上课|老师|homework|assignment|export|class/.test(value))return 'homework';
    if(/吃|饭|饿|早餐|包子|面条|food|breakfast|lunch|hungry|eat/.test(value))return 'food';
    if(/睡|刚起|熬夜|没醒|起床|sleep|awake|woke|tired/.test(value))return 'sleep';
    if(/好老|古早|十年前|旧网页|老网页|ancient|old.?school|dated|so old/.test(value))return 'old';
    if(/酒店|房间|预订|hotel|room|booking/.test(value))return 'hotel';
    if(/我去看|我看看|点开了|我点了|打开了|试试看|i.ll.*look|i.m.*looking|opened it|clicked it|i.ll try/.test(value))return 'moving';
    if(/哈哈|笑死|离谱|lol|lmao|haha|😂|🤣/.test(value))return 'laugh';
    if(/啥|什么情况|你说什么|what|huh|\?/.test(value))return 'confused';
    if(/早|嗨|你好|在吗|^(hi|hey|hello|morning)\b/.test(value))return 'greeting';
    return 'other';
  }
  function send(s,value,conversation='group',rng=Math.random) {
    const text=String(value).trim().slice(0,D.maxText);
    if(!text)return false;
    append(s,{kind:'user',text,conversation});
    s.ui.drafts[conversation]='';
    if(conversation!=='group')return true;
    const intent=topic(text);
    const kind=({work:'job_details',pay:'pay_details',laugh:'casual_laugh',other:'clarify'})[intent]||intent;
    if(intent==='work'&&s.cursor<25){s.cursor=25;s.remaining=3000;}
    if(intent==='pay'&&s.cursor<27){s.cursor=27;s.remaining=3000;}
    if(intent==='moving'&&s.shared)s.context.reading=true;
    if(intent==='decline')s.context.declined=true;
    const p=phase(s), bucket=D.replies[kind];
    const group=bucket[p]?p:'any',entries=bucket[group];
    const turnKey=kind+':'+group,turn=s.turns[turnKey];
    let index=Number.isInteger(turn)?turn%entries.length:Math.min(entries.length-1,Math.floor(rng()*entries.length));
    // These two old alternatives answer another friend's line, not the player.
    if(kind==='food'&&index===1)index=0;
    if(kind==='sleep'&&/没睡|熬夜|didn.t sleep|barely slept|no sleep/.test(text.toLowerCase()))index=2;
    s.turns[turnKey]=index+1;
    if(s.pending.length<6)s.pending.push({key:`${kind}:${group}:${index}`,remaining:800+Math.round(rng()*600)+s.pending.length*1200,share:kind==='links'&&!s.shared});
    s.hold=2800;
    return true;
  }
  function advance(s,ms,{story=true}={}) {
    const dt=bounded(ms,2000);
    s.elapsed+=dt;s.hold=Math.max(0,s.hold-dt);
    let changed=false;
    for(const pending of s.pending)pending.remaining-=dt;
    const due=s.pending.filter(p=>p.remaining<=0);
    s.pending=s.pending.filter(p=>p.remaining>0);
    for(const pending of due) {
      append(s,{kind:'reply',key:pending.key});
      if(pending.share)share(s);
      changed=true;s.hold=1600;
    }
    // Sharing is a normal incoming message, never a keyword puzzle. Even a
    // reader who keeps typing or scrolling receives it in the group.
    if(!s.shared&&s.elapsed>=120000) {
      if(s.cursor<25)append(s,{kind:'reply',key:'share_bridge:any:0'});
      append(s,{kind:'reply',key:'share_bridge:any:1'});share(s);changed=true;s.hold=1600;
    }
    if(!story||s.hold||s.cursor>=D.script.length)return changed;
    s.remaining=Math.max(0,s.remaining-dt);
    if(s.remaining===0) {
      // Don't ask again who will open the post after the player has volunteered.
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
    const s=fresh(),scriptIds=new Set(D.script.map(m=>m.id));
    const messages=Array.isArray(raw.messages)?raw.messages.slice(-400).filter(m=>m&&
      ((m.kind==='script'&&scriptIds.has(m.key))||(m.kind==='reply'&&Object.hasOwn(D.bank,m.key))||(m.kind==='user'&&typeof m.text==='string'))):[];
    if(messages.length)s.messages=messages.map((m,index)=>({id:'m'+(index+1),kind:m.kind,
      at:base+bounded(m.at-base,86400000),
      ...(m.kind==='user'?{text:m.text.slice(0,D.maxText),conversation:Object.hasOwn(D.sideChats,m.conversation)?m.conversation:'group'}:{key:m.key})}));
    s.counter=s.messages.length;s.cursor=Math.max(1,bounded(raw.cursor,D.script.length,1));
    s.elapsed=bounded(raw.elapsed,86400000);s.remaining=bounded(raw.remaining,10000,2600);s.hold=bounded(raw.hold,4200);
    if(raw.pacing!==2){s.remaining=Math.round(s.remaining*.65);s.hold=Math.round(s.hold*.65);}
    s.context={reading:raw.context?.reading===true,declined:raw.context?.declined===true};
    s.shared=s.messages.some(m=>m.kind==='script'&&m.key==='s31');
    s.openedForum=raw.openedForum===true;
    if(s.shared)s.cursor=Math.max(31,s.cursor);
    if(Array.isArray(raw.pending))s.pending=raw.pending.slice(0,6).filter(p=>p&&Object.hasOwn(D.bank,p.key))
      .map(p=>({key:p.key,remaining:Math.round(bounded(p.remaining,15000)*(raw.pacing===2?1:.65)),share:p.share===true&&!s.shared}));
    if(raw.turns&&typeof raw.turns==='object')for(const [key,value] of Object.entries(raw.turns))
      if(/^[a-z_]+:(early|job|shared|any)$/.test(key))s.turns[key]=bounded(value,100000);
    const ui=raw.ui||{};
    s.ui.conversation=Object.hasOwn(D.sideChats,ui.conversation)?ui.conversation:'group';
    s.ui.list=ui.list===true;
    for(const id of ['group',...Object.keys(D.sideChats)]) {
      if(typeof ui.drafts?.[id]==='string')s.ui.drafts[id]=ui.drafts[id].slice(0,D.maxText);
      if(ui.scroll?.[id])s.ui.scroll[id]={top:bounded(ui.scroll[id].top,1000000),bottom:ui.scroll[id].bottom!==false};
    }
    return s;
  }
  return {KEY,base,fresh,hydrate,phase,topic,send,advance};
})();
