/* New-route rules are local and deterministic; the previous schema-one story stays intact. */
globalThis.StillwaterStoryV13=(()=>{
  const D=globalThis.StillwaterStoryV13Data,L=globalThis.StillwaterStoryModel,C=globalThis.StillwaterCaseData;
  const active=s=>s.story?.schema===2&&s.story.edition==='v13';
  const fresh=()=>({schema:2,edition:'v13',active:true,legacy:false,query:'',discovered:['sample'],viewed:['sample'],compare:[],marks:[],findings:{},drafts:{},hints:{},tab:'index',activeSource:'index',returnTo:'hotel',events:[],pending:[],delivered:[],effects:[],played:[],request:'none',restored:false,rewriteShown:false,b3Recovered:false,originalsSeparated:false,finalChoice:'',transition:null});
  const fail=(error,document)=>({ok:false,error,...(document?{document}:{})}),ok=()=>({ok:true});
  const exists=id=>Object.hasOwn(D.documents,id)||Object.hasOwn(C.documents,id);
  const spec=key=>D.proofs[key]||D.categories[key];
  function available(s,key){const p=s.story;return ({index:!!p.query,diary:!!p.findings.index,echo:!!p.findings.diary,cause:!!p.findings.echo,ROOM:s.night.void.reviewed,GUEST:s.night.void.reviewed,EMPLOYEE:s.night.void.reviewed})[key]===true;}
  function readable(s,id){
    const p=s.story;if(!exists(id))return false;
    if(['sample','oldchat'].includes(id))return true;
    if(id==='index')return !!p.query;
    if(['booking','inventory','position','key'].includes(id))return s.evidence.includes('C1');
    if(['notebook','school','guestlog','draft','sync'].includes(id))return !!p.findings.index;
    if(['avatar-old','avatar-new','echo','fieldphoto'].includes(id))return !!p.findings.diary;
    if(id==='contact')return p.originalsSeparated;
    if(['lastphoto','unsent','footage'].includes(id))return p.b3Recovered;
    if(id==='helen')return !!p.findings.cause;
    return !!p.findings.echo;
  }
  function open(s,id){
    if(!readable(s,id))return fail('source',id);
    const p=s.story;for(const list of [p.discovered,p.viewed])if(!list.includes(id))list.push(id);p.activeSource=id;
    const clue=C.documents[id]?.clue;
    if(clue&&!s.evidence.includes(clue))s.evidence.push(clue);
    return ok();
  }
  function check(s,key,input){
    const f=spec(key),p=s.story;if(!f||!available(s,key))return fail('not-ready');
    const missing=f.sources.find(id=>!Array.isArray(input?.sources)||!input.sources.includes(id)||!p.viewed.includes(id)||!readable(s,id));
    if(missing)return fail('source',missing);
    if(input.sources.length!==f.sources.length||input.sources.some(id=>!f.sources.includes(id)))return fail('unrelated');
    if(f.compare&&(p.compare.length!==2||p.compare.some(id=>!f.sources.includes(id))))return fail('compare');
    const wrong=f.fields.find(v=>input.values?.[v.id]!==v.answer);
    if(wrong)return {...fail(key),field:wrong.id};
    return ok();
  }
  const ready=s=>active(s)&&Object.keys(D.proofs).every(k=>!!s.story.findings[k]);
  function queue(s,id){const p=s.story;id='v13.'+id;if(!p.events.includes(id)){p.events.push(id);p.pending.push(id);}}
  function next(s,id,to,effect=''){const p=s.story;if(p.events.includes('scene:'+id))return;p.events.push('scene:'+id);p.transition={id,to,effect,consumed:false};if(effect&&!p.effects.includes(effect))p.effects.push(effect);}
  function begin(s){
    if(active(s))return ok();
    if(s.evidence.some(id=>id!=='C1')||s.night.started||s.endings.length)return fail('not-ready');
    s.story=fresh();next(s,'T1','hotel');return ok();
  }
  function action(s,a,x={}){
    if(a==='v13-begin')return begin(s);
    const p=s.story;
    if(a==='activate')return ok();
    if(a==='query'){
      const value=String(x.text||'').trim().slice(0,80);
      if(!/(?:王\s*)?楚\s*人|wang\s*chu\s*ren|churen\s*wang/i.test(value))return fail('name');
      p.query=value;open(s,'index');queue(s,'index');return ok();
    }
    if(a==='open')return open(s,x.id);
    if(a==='compare'){
      if(!p.viewed.includes(x.id))return fail('source',x.id);
      p.compare=p.compare.includes(x.id)?p.compare.filter(id=>id!==x.id):[...p.compare.slice(-1),x.id];return ok();
    }
    if(a==='tab'){if(!spec(x.key)||!available(s,x.key))return fail('not-ready');p.tab=x.key;return ok();}
    if(a==='draft'){
      const f=spec(x.key);if(!f||!available(s,x.key))return fail('not-ready');const d=p.drafts[x.key]||={sources:[],values:{}};
      if(x.source&&readable(s,x.source))d.sources=x.checked?[...new Set([...d.sources,x.source])]:d.sources.filter(id=>id!==x.source);
      if(f.fields.some(v=>v.id===x.field&&v.options.some(o=>o.id===x.value)))d.values[x.field]=x.value;
      return ok();
    }
    if(a==='submit'){
      const f=spec(x.key),input=p.drafts[x.key],r=check(s,x.key,input);if(!r.ok)return r;
      if(D.categories[x.key])return globalThis.StillwaterVoidModel.confirm(s.night.void,x.key,input);
      if(p.findings[x.key])return ok();
      p.findings[x.key]={sources:[...f.sources],values:{...input.values}};
      if(x.key==='index'){queue(s,'checked');next(s,'T2','source-review?proof=diary');}
      if(x.key==='diary'){p.restored=true;p.request='pending';queue(s,'diary');next(s,'T3','chat?request=1','GF-01');}
      if(x.key==='echo')next(s,'T4','rewrite-review');
      if(x.key==='cause'){
        s.completed.finalEvidence=true;
        const start=globalThis.StillwaterCaseState.transition(s,'night-start');if(!start.ok)return start;
        queue(s,'merge');next(s,'T5','mirror','GF-02');
      }
      return ok();
    }
    if(a==='request'){
      if(!['pending','ignored','accepted'].includes(p.request)||!['ignored','accepted'].includes(x.choice))return fail('not-ready');
      p.request=x.choice;queue(s,x.choice==='accepted'?'request':'request-ignored');
      if(x.choice==='accepted'){queue(s,'accepted');next(s,'request-choice','chat?room=wcr_new');}
      else next(s,'request-choice','source-trace');
      return ok();
    }
    if(a==='hint'){if(!spec(x.key)||!available(s,x.key))return fail('not-ready');p.hints[x.key]=Math.min(3,(p.hints[x.key]||0)+1);return ok();}
    if(a==='snapshot'){if(!p.findings.index||!['2023','2026'].includes(x.version))return fail('not-ready');p.snapshot=x.version;return ok();}
    if(a==='film'){if(!['original','synced'].includes(x.choice)||!s.night.frame||!globalThis.StillwaterNightModel.circuit(s.night).readable)return fail('not-ready');p.filmMode=x.choice;return ok();}
    if(a==='category'){
      if(!D.categories[x.id])return fail('not-ready');return globalThis.StillwaterVoidModel.transition(s.night.void,'classify',{type:x.id});
    }
    if(a==='close-category'){s.night.void.activeCategory='';return ok();}
    if(a==='rewrite-shown'){
      if(!ready(s)||!s.night.started)return fail('not-ready');p.rewriteShown=true;s.night.spreadRequired=false;next(s,'T5-display','cameras');return ok();
    }
    if(a==='recover'){
      if(!ready(s)||!s.promo.verified||!globalThis.StillwaterVoidModel.ready(s.night))return fail('not-ready');
      if(!p.b3Recovered){
        p.b3Recovered=true;s.night.void.sourceEdition='v13';
        globalThis.StillwaterCaseState.transition(s,'desk-footage');
        for(const id of ['footage','lastphoto','unsent'])if(!p.discovered.includes(id))p.discovered.push(id);
        queue(s,'b3');next(s,'T6','void','GF-03');
      }
      return ok();
    }
    if(a==='finish'){
      const v=s.night.void;
      if(!ready(s)||!p.b3Recovered||v.attempts.length!==3||!v.reviewed||!['auto-close','unverified','released'].includes(x.choice))return fail('not-ready');
      if(x.choice==='released'&&!globalThis.StillwaterVoidModel.ready(s.night))return fail('not-ready');
      p.finalChoice=x.choice;v.disposition=x.choice==='auto-close'?'auto':'retain';v.classified=true;v.complete=true;v.stage='return';
      if(x.choice==='released'){
        const locked=globalThis.StillwaterCaseState.transition(s,'night-lock');if(!locked.ok)return locked;
        p.originalsSeparated=true;if(!p.discovered.includes('contact'))p.discovered.push('contact');
      }
      const r=globalThis.StillwaterCaseState.transition(s,'ending',{ending:x.choice});if(!r.ok)return r;
      queue(s,'end-'+x.choice);next(s,'ending','ending');return ok();
    }
    if(a==='ack'){p.pending=p.pending.filter(id=>id!==x.id);if(!p.delivered.includes(x.id))p.delivered.push(x.id);return ok();}
    if(a==='played'){if(p.effects.includes(x.id)&&!p.played.includes(x.id))p.played.push(x.id);return ok();}
    return fail('not-ready');
  }
  function hydrate(raw,state){
    const p=fresh();state.story=p;
    const strings=(v,allowed)=>[...new Set((Array.isArray(v)?v:[]).filter(x=>typeof x==='string'&&allowed(x)))];
    p.query=typeof raw.query==='string'?raw.query.slice(0,80):'';
    p.discovered=strings(raw.discovered,exists);p.viewed=strings(raw.viewed,id=>p.discovered.includes(id));p.compare=strings(raw.compare,id=>p.viewed.includes(id)).slice(-2);
    p.activeSource=p.discovered.includes(raw.activeSource)?raw.activeSource:'index';p.tab=Object.hasOwn(D.proofs,raw.tab)?raw.tab:'index';
    p.request=['none','pending','ignored','accepted'].includes(raw.request)?raw.request:'none';p.restored=raw.restored===true;p.rewriteShown=raw.rewriteShown===true;p.b3Recovered=raw.b3Recovered===true;p.originalsSeparated=raw.originalsSeparated===true;
    for(const key of [...Object.keys(D.proofs),...Object.keys(D.categories)]){
      const f=spec(key),d=raw.drafts?.[key];
      if(d)p.drafts[key]={sources:strings(d.sources,exists),values:Object.fromEntries(f.fields.map(v=>[v.id,v.options.some(o=>o.id===d.values?.[v.id])?d.values[v.id]:'']))};
      const saved=raw.findings?.[key];
      if(D.proofs[key]&&saved&&available(state,key)&&f.sources.every(id=>saved.sources?.includes?.(id)&&p.viewed.includes(id))&&Array.isArray(saved.sources)&&saved.sources.length===f.sources.length&&f.fields.every(v=>saved.values?.[v.id]===v.answer))p.findings[key]={sources:[...f.sources],values:{...saved.values}};
      p.hints[key]=Number.isInteger(raw.hints?.[key])?Math.max(0,Math.min(3,raw.hints[key])):0;
    }
    p.events=strings(raw.events,id=>id.startsWith('scene:')||!!globalThis.StillwaterStoryData.batches[id]);
    p.pending=strings(raw.pending,id=>!!globalThis.StillwaterStoryData.batches[id]);p.delivered=strings(raw.delivered,id=>!!globalThis.StillwaterStoryData.batches[id]);
    p.effects=['GF-01','GF-02','GF-03'].filter(id=>raw.effects?.includes?.(id));p.played=strings(raw.played,id=>p.effects.includes(id));
    const validTargets=['hotel','source-review?proof=diary','chat?request=1','chat?room=wcr_new','source-trace','rewrite-review','mirror','cameras','void','ending'];
    if(raw.transition&&validTargets.includes(raw.transition.to)&&p.events.includes('scene:'+raw.transition.id))p.transition={id:raw.transition.id,to:raw.transition.to,effect:p.effects.includes(raw.transition.effect)?raw.transition.effect:'',consumed:raw.transition.consumed===true};
    p.returnTo=typeof raw.returnTo==='string'&&/^[a-z-]+(?:\?[\w=&%-]*)?$/.test(raw.returnTo)?raw.returnTo:'hotel';
    p.finalChoice=['auto-close','unverified','released'].includes(raw.finalChoice)?raw.finalChoice:'';
    p.filmMode=raw.filmMode==='synced'?'synced':'original';
    p.snapshot=raw.snapshot==='2023'?'2023':'2026';
    return p;
  }
  function canOpen(s,route){
    if(['hotel','chat','forum','careers','credits','notes','gallery','rooms','reservations','guestbook','history','contact','notices'].includes(route))return true;
    if(['guest-index','source-review','evidence-desk'].includes(route))return s.evidence.includes('C1');
    if(['wcr-sources','history-cache'].includes(route))return !!s.story.findings.index;
    if(['source-trace','photo-overlay'].includes(route))return !!s.story.findings.diary;
    if(['rewrite-review','floor-plan','maintenance','night-audit','staff','revisions','closure','mara'].includes(route))return route==='floor-plan'?!!s.story.query:!!s.story.findings.echo;
    if(route==='review')return ready(s);
    if(route==='null-archive')return s.story.effects.length>0;
    if(route==='ending')return s.endings.length>0;
    return null;
  }
  function objective(s){
    const p=s.story;let label,links;
    if(!p.query){label=D.text('在旧官网查找楚人的名字','Look for Churen’s name on the old website');links=[['guest-index',D.text('历史住客查询','Historical guest search')]];}
    else if(!p.findings.index){label=D.proofs.index.title;links=[['source-review?proof=index',D.text('打开原件与姓名索引','Open originals and the name index')]];}
    else if(!p.findings.diary){label=D.proofs.diary.title;links=[['source-review?proof=diary',D.text('日记与来源','Diaries and sources')]];}
    else if(!p.findings.echo){label=D.proofs.echo.title;links=[['source-trace',D.text('头像与消息来源','Avatars and message sources')]];}
    else if(!p.findings.cause){label=D.proofs.cause.title;links=[['rewrite-review',D.text('原记录与修订','Originals and revisions')]];}
    else if(s.lastEnding){label=D.text('处理结果已保留','Disposition retained');links=[['ending',D.text('查看结局','View ending')]];}
    else if(!p.rewriteShown){label=D.text('读完 Helen 留下的邮件','Read Helen’s retained email');links=[['mirror',D.text('返回邮件','Return to the email')]];}
    else if(!s.night.door){label=D.text('从监控地标确认员工入口','Locate the staff entrance using the cameras');links=[['cameras',D.text('监控室','Camera room')]];}
    else if(!globalThis.StillwaterNightModel.passageReady(s.night)){label=D.text('打开维修通道的配线室','Open the service-passage patch room');links=[['service-passage',D.text('三楼维修通道','Third-floor service passage')]];}
    else if(!p.b3Recovered){label=D.text('恢复只读录像，保留两个年代的来源','Restore the read-only reel and retain the two source years');links=[['terminal',D.text('B-3 配线室','B-3 patch room')]];}
    else {label=D.text('辨认残留空间，分别核对身份','Trace the remaining space and keep the identities separate');links=[['void',D.text('未归档画面','Unlisted picture')]];}
    return {label,links};
  }
  const wrapper={...L,
    action:(s,a,x)=>a==='v13-begin'||active(s)?action(s,a,x):L.action(s,a,x),
    allowed:(s,id)=>active(s)?readable(s,id):L.allowed(s,id),
    available:(s,key)=>active(s)?available(s,key):L.available(s,key),
    canOpen:(s,route)=>active(s)?canOpen(s,route)===true:L.canOpen(s,route),
    ready:s=>active(s)?ready(s):L.ready(s),
    hydrate:(raw,s)=>raw?.schema===2&&raw.edition==='v13'?hydrate(raw,s):L.hydrate(raw,s),
    sync:(s,x)=>{
      if(!active(s))return L.sync(s,x);
      if(s.story.request==='accepted'&&s.story.viewed.includes('avatar-new'))queue(s,'account-memory');
      if(s.story.request==='accepted'&&s.story.findings.echo)queue(s,'account-pressure');
      if(s.story.request==='accepted'&&s.night.door)queue(s,'b3-account');
    },
    objective:s=>active(s)?objective(s):L.objective(s),
  };
  globalThis.StillwaterStoryModel=wrapper;
  return {active,fresh,begin,readable,open,check,ready,available,action,hydrate,canOpen,objective,spec};
})();
