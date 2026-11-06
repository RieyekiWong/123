/* Separate prototype records. No legacy case flags are read or manufactured. */
globalThis.Stillwater2Progress = (() => {
  const D=globalThis.Stillwater2Data;
  const KEY='stillwater-story:2.0:prototype:v1', CHAT_KEY='stillwater-chat:2.0:prototype:v1';
  const ids=Object.keys(D.puzzles), normalRooms=['group','gg','zhang','lin','mom','dad','milk','zhe','lunch','notes'];
  const fresh=()=>({schema:1,edition:'2.0',prototype:true,chapter:0,route:'chat',viewed:[],results:{},drafts:{},hints:{},events:{pending:[],delivered:[]},projectRead:false,friendRequest:'none',reading:null,transition:null,endings:[],lastEnding:'',preferences:{sound:false,volume:.2,popupAds:true,reduceMotion:false,skipScares:false}});
  const solved=(s,id)=>s.results[id]?.prototype===true;
  function available(s,id){const i=ids.indexOf(id);return i>=0&&ids.slice(0,i).every(key=>solved(s,key))&&(i<2||s.projectRead)&&(i<4||['accepted','ignored'].includes(s.friendRequest));}
  function goal(s){
    if(s.transition)return s.transition.from;
    if(s.lastEnding)return 'ending';
    if(solved(s,'P2')&&!s.projectRead)return 'hotel/archive-project';
    if(solved(s,'P4')&&!['accepted','ignored'].includes(s.friendRequest))return 'chat';
    return D.puzzles[ids.find(id=>!solved(s,id))||'P8'].route;
  }
  function canOpen(s,route){
    if(['chat','forum','notes'].includes(route))return true;
    if(route==='hotel')return solved(s,'P1');
    if(route==='hotel/archive-project'||Object.hasOwn(D.phasePages,route))return solved(s,'P2');
    if(route==='ending')return !!s.lastEnding;
    const id=ids.find(key=>D.puzzles[key].route===route);return !!id&&available(s,id);
  }
  const canRead=(s,id)=>!!D.sources[id]&&ids.some(key=>available(s,key)&&D.puzzles[key].sources.includes(id));
  function chapter(s,route){
    if(route==='chat')return !solved(s,'P1')?0:solved(s,'P4')&&!['accepted','ignored'].includes(s.friendRequest)?4:chapter(s,goal(s)==='chat'?'phase/research':goal(s));
    if(route==='notes')return chapter(s,goal(s));
    if(route==='ending')return 7;
    if(route==='hotel/archive-project')return 2;
    if(Object.hasOwn(D.phasePages,route))return route==='phase/research'&&available(s,'P4')?4:3;
    return Object.values(D.puzzles).find(p=>p.route===route)?.chapter||0;
  }
  function queue(s,id){if(!s.events.pending.includes(id)&&!s.events.delivered.includes(id))s.events.pending.push(id);}
  function action(s,type,x={}){
    const fail=error=>({ok:false,error});
    if(type==='view'){
      if(!canRead(s,x.id))return fail('source');
      if(!s.viewed.includes(x.id))s.viewed.push(x.id);s.reading=x.id;
    }else if(type==='close-source')s.reading=null;
    else if(type==='draft'){
      if(!available(s,x.puzzle)||x.field!=='note')return fail('not-ready');
      (s.drafts[x.puzzle]||={}).note=String(x.value||'').slice(0,2400);
    }else if(type==='hint'){
      if(!available(s,x.puzzle))return fail('not-ready');s.hints[x.puzzle]=Math.min(3,(s.hints[x.puzzle]||0)+1);
    }else if(type==='checkpoint'){
      const p=D.puzzles[x.puzzle];
      if(!p||x.puzzle==='P8'||!available(s,x.puzzle))return fail('not-ready');
      if(s.transition)return fail('reading');
      if(p.sources.some(id=>!s.viewed.includes(id)))return fail('sources');
      if(solved(s,x.puzzle))return {ok:true};
      s.results[x.puzzle]={prototype:true,sources:[...p.sources]};
      const next={P1:'hotel',P2:'hotel/archive-project',P3:'phase/research',P4:'chat',P5:'heritage/cctv',P6:'heritage/b3',P7:'heritage/final-trace'}[x.puzzle];
      s.transition={id:x.puzzle,from:p.route,to:next};s.reading=null;
      if(x.puzzle==='P4')s.friendRequest='pending';
      if(['P2','P5','P7'].includes(x.puzzle))queue(s,'sw2.'+x.puzzle);
    }else if(type==='continue'){
      if(!s.transition)return fail('not-ready');s.route=s.transition.to;s.transition=null;
    }else if(type==='project'){
      if(!solved(s,'P2'))return fail('not-ready');s.projectRead=true;s.route='phase/archive';
    }else if(type==='request'){
      if(!solved(s,'P4')||!['accepted','ignored'].includes(x.choice))return fail('not-ready');
      if(['accepted','ignored'].includes(s.friendRequest))return {ok:true};
      s.friendRequest=x.choice;
      if(x.choice==='accepted'){queue(s,'sw2.accepted');s.route='chat';}else s.route='heritage/photos';
    }else if(type==='ending'){
      if(!available(s,'P8')||s.transition||!D.endings.includes(x.id))return fail('not-ready');
      if(D.puzzles.P8.sources.some(id=>!s.viewed.includes(id)))return fail('sources');
      s.results.P8={prototype:true,sources:[...D.puzzles.P8.sources]};
      if(!s.endings.includes(x.id))s.endings.push(x.id);s.lastEnding=x.id;s.route='ending';queue(s,'sw2.end-'+x.id);
    }else if(type==='delivered'){
      if(!s.events.pending.includes(x.id))return fail('not-ready');
      s.events.pending=s.events.pending.filter(id=>id!==x.id);if(!s.events.delivered.includes(x.id))s.events.delivered.push(x.id);
    }else return fail('action');
    return {ok:true};
  }
  function hydrate(raw){
    if(!raw||raw.schema!==1||raw.edition!=='2.0'||raw.prototype!==true)return null;
    const s=fresh(),strings=(v,p)=>[...new Set((Array.isArray(v)?v:[]).filter(x=>typeof x==='string'&&p(x)))];
    s.projectRead=raw.projectRead===true;s.friendRequest=['none','pending','ignored','accepted'].includes(raw.friendRequest)?raw.friendRequest:'none';
    s.viewed=strings(raw.viewed,id=>!!D.sources[id]);
    for(const id of ids){
      const p=D.puzzles[id],r=raw.results?.[id];
      if(available(s,id)&&r?.prototype===true&&Array.isArray(r.sources)&&r.sources.length===p.sources.length&&p.sources.every(key=>r.sources.includes(key)&&s.viewed.includes(key)))s.results[id]={prototype:true,sources:[...p.sources]};
      if(typeof raw.drafts?.[id]?.note==='string')s.drafts[id]={note:raw.drafts[id].note.slice(0,2400)};
      s.hints[id]=Number.isInteger(raw.hints?.[id])?Math.max(0,Math.min(3,raw.hints[id])):0;
    }
    if(!solved(s,'P2'))s.projectRead=false;
    if(!solved(s,'P4'))s.friendRequest='none';
    s.viewed=s.viewed.filter(id=>canRead(s,id));
    const eventAllowed=id=>['sw2.P2','sw2.P5','sw2.P7'].some(key=>id===key&&solved(s,key.slice(4)))||id==='sw2.accepted'&&s.friendRequest==='accepted'||id.startsWith('sw2.end-')&&D.endings.includes(id.slice(8))&&solved(s,'P8');
    s.events.delivered=strings(raw.events?.delivered,eventAllowed);s.events.pending=strings(raw.events?.pending,id=>eventAllowed(id)&&!s.events.delivered.includes(id));
    if(solved(s,'P8')){s.endings=strings(raw.endings,id=>D.endings.includes(id));s.lastEnding=s.endings.includes(raw.lastEnding)?raw.lastEnding:s.endings.at(-1)||'';}
    const tr=raw.transition,p=tr&&D.puzzles[tr.id];
    const destinations={P1:'hotel',P2:'hotel/archive-project',P3:'phase/research',P4:'chat',P5:'heritage/cctv',P6:'heritage/b3',P7:'heritage/final-trace'};
    if(p&&solved(s,tr.id)&&tr.from===p.route&&tr.to===destinations[tr.id])s.transition={id:tr.id,from:p.route,to:tr.to};
    if(typeof raw.reading==='string'&&canRead(s,raw.reading))s.reading=raw.reading;
    s.route=D.routes.includes(raw.route)&&canOpen(s,raw.route)?raw.route:goal(s);
    s.chapter=chapter(s,s.route);
    const pref=raw.preferences||{};
    s.preferences={sound:false,volume:Number.isFinite(pref.volume)?Math.max(0,Math.min(.5,pref.volume)):.2,popupAds:pref.popupAds!==false,reduceMotion:pref.reduceMotion===true,skipScares:pref.skipScares===true};
    return s;
  }
  function importPreferences(raw){const s=fresh();s.preferences=hydrate({...s,preferences:raw?.preferences||{}}).preferences;s.preferences.skipScares=raw?.preferences?.skipScares===true&&(raw.preferences.scareChoiceMade===true||raw.night?.comfortAcknowledged===true);return s.preferences;}
  function importChat(raw){
    const M=globalThis.StillwaterChatModel,s=M.fresh();
    if(raw?.schema!==1)return s;
    const safe=M.hydrate({...raw,pending:[],story:{request:'none',delivered:[]}});
    const messages=safe.messages.filter(m=>['user','social'].includes(m.kind)&&normalRooms.includes(m.conversation));
    for(const m of messages)s.messages.push({...m,id:'m'+(++s.counter)});
    for(const room of normalRooms){
      if(safe.ui.drafts[room])s.ui.drafts[room]=safe.ui.drafts[room];
      if(safe.ui.scroll[room])s.ui.scroll[room]={...safe.ui.scroll[room]};
      if(safe.ui.unread[room])s.ui.unread[room]=safe.ui.unread[room];
      if(safe.ui.visited[room])s.ui.visited[room]=true;
      const recent=messages.filter(m=>m.conversation===room&&m.kind==='user').slice(-5).map(m=>m.text);
      if(recent.length)s.memories[room]={turn:recent.length,language:globalThis.StillwaterChatProtocol.language(recent.at(-1)),topic:'',awaiting:'',payUnknown:false,recent};
    }
    if(normalRooms.includes(safe.ui.conversation))s.ui.conversation=safe.ui.conversation;
    s.story.importedDailyChat=true;return s;
  }
  function scene(s,route){
    const horror=solved(s,'P4')||['phase/research','heritage/photos','heritage/cctv','heritage/b3','heritage/final-trace','ending'].includes(route);
    const reading=!!s.reading||!!s.transition;
    const dark=horror&&(!Object.hasOwn(D.phasePages,route)||route==='phase/research');
    return {ads:!horror&&!reading&&['chat','forum','hotel'].includes(route),notices:!horror&&!reading&&['forum','hotel','hotel/archive-project',...Object.keys(D.phasePages)].includes(route),horror,dark,reading};
  }
  return Object.freeze({KEY,CHAT_KEY,fresh,hydrate,solved,available,canRead,canOpen,goal,chapter,action,scene,importChat,importPreferences});
})();
