/* Local, deterministic provenance rules. AI and visual effects cannot grant findings. */
globalThis.StillwaterStoryModel = (() => {
  const D=globalThis.StillwaterStoryData;
  const routes=['guest-index','wcr-sources','history-cache','source-review','source-trace','photo-overlay','rewrite-review','null-archive'];
  const fresh=()=>({schema:1,active:false,legacy:false,viewed:[],marks:[],findings:{},drafts:{},hints:{},events:[],pending:[],delivered:[],effects:[],played:[],request:'none',query:'',snapshot:'2026-revised',restored:false,preview:'pending',overlay:{x:8,y:-6,zoom:92,opacity:55,anchors:[],marked:'',verified:false,retained:null},tab:'index',activeSource:'index',compare:[],returnTo:'reservations?record=R-4829'});
  const s=c=>c.story||(c.story=fresh()), has=(c,id)=>c.evidence.includes(id), on=c=>s(c).active&&!s(c).legacy;
  function allowed(c,id){
    const p=s(c);
    if(globalThis.StillwaterCaseData.documents[id])return c.desk.discovered.includes(id);
    return !!D.sources[id]&&({oldchat:true,index:has(c,'C2'),sync:!!p.findings.index,notebook:!!p.findings.index,guestlog:!!p.findings.index,draft:!!p.findings.index,forum2023:p.restored,fieldphoto:!!p.findings.diary,publicity:!!p.findings.index,echo:!!p.findings.diary,contact:c.night.locked&&p.overlay.verified})[id]===true;
  }
  function canOpen(c,route){
    return ({'guest-index':has(c,'C2'),'wcr-sources':!!s(c).findings.index,'history-cache':!!s(c).findings.index,'source-review':has(c,'C2'),'source-trace':!!s(c).findings.diary,'photo-overlay':!!s(c).findings.diary,'rewrite-review':has(c,'C9')&&!!s(c).findings.echo,'null-archive':s(c).effects.length>0})[route]===true;
  }
  function queue(c,id){const p=s(c);if(!D.batches[id]||p.events.includes(id))return;p.events.push(id);p.pending.push(id);}
  function effect(c,id){const p=s(c);if(!p.effects.includes(id))p.effects.push(id);}
  function sync(c,{shared=false,route=''}={}){
    const p=s(c);if(!on(c))return;
    if(shared)queue(c,'discovery');
    if(shared&&(p.viewed.includes('oldchat')||p.viewed.includes('index')))queue(c,'context');
    if(p.viewed.includes('index'))queue(c,'index');
    if(p.viewed.includes('notebook'))queue(c,'diaries');
    if(p.findings.diary&&p.request==='none')p.request='pending';
    if(p.request==='accepted'){queue(c,'accepted');if(p.viewed.includes('draft'))queue(c,'comparison');if(p.viewed.includes('sync'))queue(c,'echo');}
    if(['accepted','ignored'].includes(p.request))queue(c,'request');
    if(c.night.door){queue(c,'b3gg');if(p.request==='accepted')queue(c,'b3wcr');}
    if(c.night.frame&&globalThis.StillwaterNightModel.circuit(c.night).readable)effect(c,'GF-03');
    if(c.lastEnding){
      queue(c,'end-'+c.lastEnding);
      if(c.lastEnding==='auto-close')queue(c,'wrong-memory');
      if(c.lastEnding==='unverified'&&p.request==='accepted')queue(c,'quiet');
    }
  }
  const available=(c,key)=>({index:has(c,'C5')&&!!c.desk.results.space,diary:!!s(c).findings.index&&s(c).restored,echo:!!s(c).findings.diary,cause:has(c,'C9')&&!!s(c).findings.echo&&s(c).overlay.verified,footage:c.night.void.reviewed&&!!c.desk.footage})[key]===true;
  function check(c,key,input){
    const spec=D.proofs[key],p=s(c);
    if(!spec||!available(c,key))return {ok:false,error:'not-ready'};
    if(!Array.isArray(input?.sources))return {ok:false,error:'source',document:spec.sources[0]};
    const missing=spec.sources.find(id=>!input?.sources?.includes(id)||!allowed(c,id));
    if(missing)return {ok:false,error:'source',document:missing};
    const unread=spec.sources.find(id=>!p.viewed.includes(id));if(unread)return {ok:false,error:'unread',document:unread};
    if(input.sources.some(id=>!spec.sources.includes(id)))return {ok:false,error:'unrelated'};
    if(spec.marks?.some(id=>!p.marks.includes(id)))return {ok:false,error:'marks'};
    if(key==='index'&&(!p.compare.includes('index')||!p.compare.includes('position')))return {ok:false,error:'compare'};
    if(key==='echo'&&(!p.compare.includes('sync')||!p.compare.includes('echo')))return {ok:false,error:'echo-compare'};
    if(key==='cause'){const edge=spec.fields.find(f=>input.links?.[f.id]!==f.source);if(edge)return {ok:false,error:'cause-source',document:edge.source};}
    const field=spec.fields.find(f=>input.values?.[f.id]!==f.answer);
    if(field)return {ok:false,error:key==='index'&&input.values?.stay==='disproved'?'person':key,field:field.id};
    return {ok:true};
  }
  function action(c,a,payload={}){
    const p=s(c),ok=()=>({ok:true});
    if(a==='activate'){if(!p.legacy)p.active=true;return ok();}
    if(a==='ack'){if(!p.pending.includes(payload.id))return {ok:false,error:'event'};p.pending=p.pending.filter(x=>x!==payload.id);if(!p.delivered.includes(payload.id))p.delivered.push(payload.id);return ok();}
    if(a==='played'){if(!p.effects.includes(payload.id))return {ok:false,error:'event'};if(!p.played.includes(payload.id))p.played.push(payload.id);return ok();}
    if(a==='query'){
      if(!has(c,'C2'))return {ok:false,error:'not-ready'};
      p.query=String(payload.text||'').slice(0,80);
      if(!/(?:王\s*)?楚\s*人|王\s*楚|wang(?:\s*chu(?:\s*ren)?)?|churen/i.test(p.query))return {ok:false,error:'name'};
      if(!p.viewed.includes('index'))p.viewed.push('index');sync(c);return ok();
    }
    if(a==='open'){
      if(!allowed(c,payload.id))return {ok:false,error:'source',document:payload.id};
      p.activeSource=payload.id;if(!p.viewed.includes(payload.id))p.viewed.push(payload.id);sync(c);return ok();
    }
    if(a==='compare'){
      if(!allowed(c,payload.id))return {ok:false,error:'source',document:payload.id};
      if(p.compare.includes(payload.id))p.compare=p.compare.filter(x=>x!==payload.id);else p.compare=[...p.compare.slice(-1),payload.id];return ok();
    }
    if(a==='mark'){
      if(!p.viewed.includes('index')||!['name','year','position','revision'].includes(payload.id))return {ok:false,error:'marks'};
      p.marks=p.marks.includes(payload.id)?p.marks.filter(x=>x!==payload.id):[...p.marks,payload.id];return ok();
    }
    if(a==='tab'){if(!D.proofs[payload.key])return {ok:false,error:'not-ready'};p.tab=payload.key;return ok();}
    if(a==='draft'){
      const spec=Object.hasOwn(D.proofs,payload.key)?D.proofs[payload.key]:null;if(!spec)return {ok:false,error:'not-ready'};
      const d=p.drafts[payload.key]||={sources:[],values:{}};
      if(payload.source&&allowed(c,payload.source))d.sources=payload.checked?[...new Set([...d.sources,payload.source])]:d.sources.filter(x=>x!==payload.source);
      if(spec.fields.some(f=>f.id===payload.linkField)&&spec.sources.includes(payload.linkSource)){d.links||={};d.links[payload.linkField]=payload.linkSource;}
      if(spec.fields.some(f=>f.id===payload.field&&f.options.some(o=>o.id===payload.value)))d.values[payload.field]=payload.value;
      return ok();
    }
    if(a==='submit'){
      const input=p.drafts[payload.key],result=check(c,payload.key,input);if(!result.ok)return result;
      p.findings[payload.key]={sources:[...input.sources],values:{...input.values},...(input.links?{links:{...input.links}}:{})};
      if(payload.key==='index')p.activeSource='sync';
      if(payload.key==='cause')effect(c,'GF-02');sync(c);return ok();
    }
    if(a==='snapshot'){
      if(!p.findings.index||!['2023','2026-initial','2026-revised'].includes(payload.version))return {ok:false,error:'not-ready'};
      p.snapshot=payload.version;return ok();
    }
    if(a==='restore'){
      if(!p.findings.index||p.snapshot!=='2023')return {ok:false,error:'snapshot'};
      p.restored=true;effect(c,'GF-01');return ok();
    }
    if(a==='request'){
      if(!['pending','ignored','accepted'].includes(p.request)||!['ignored','accepted'].includes(payload.choice))return {ok:false,error:'not-ready'};
      p.request=payload.choice;sync(c);return ok();
    }
    if(a==='preview'){
      if(!p.findings.cause||!['declined','deferred','accepted'].includes(payload.choice))return {ok:false,error:'not-ready'};
      p.preview=payload.choice;return ok();
    }
    if(a==='overlay'){
      if(!p.findings.diary)return {ok:false,error:'not-ready'};
      const o=p.overlay;
      if(payload.anchor&&['frame','lamp'].includes(payload.anchor))o.anchors=o.anchors.includes(payload.anchor)?o.anchors.filter(x=>x!==payload.anchor):[...o.anchors,payload.anchor];
      for(const [key,min,max] of [['x',-20,20],['y',-20,20],['zoom',80,120],['opacity',0,100]])if(Number.isFinite(payload[key]))o[key]=Math.max(min,Math.min(max,payload[key]));
      if(['plaque','lamp','guest-door'].includes(payload.mark))o.marked=payload.mark;
      return ok();
    }
    if(a==='overlay-submit'){
      if(!p.findings.diary)return {ok:false,error:'not-ready'};
      const o=p.overlay;
      if(o.anchors.length!==2||Math.abs(o.x)>1||Math.abs(o.y)>1||Math.abs(o.zoom-100)>1)return {ok:false,error:'align'};
      if(o.marked!=='plaque')return {ok:false,error:'plaque'};
      o.verified=true;o.retained={x:o.x,y:o.y,zoom:o.zoom,anchors:[...o.anchors],marked:o.marked};return ok();
    }
    if(a==='hint'){
      if(!D.hints[payload.key])return {ok:false,error:'not-ready'};
      p.hints[payload.key]=Math.min(3,(p.hints[payload.key]||0)+1);return ok();
    }
    return {ok:false,error:'event'};
  }
  function hydrate(raw,c){
    const p=fresh();c.story=p;
    if(!raw||raw.schema!==1){p.legacy=true;return p;}
    p.active=raw.active===true;p.legacy=raw.legacy===true;
    const strings=(v,valid)=>[...new Set(Array.isArray(v)?v.filter(x=>typeof x==='string'&&valid(x)):[])];
    p.restored=raw.restored===true;p.request=['none','pending','accepted','ignored'].includes(raw.request)?raw.request:'none';
    p.preview=['pending','declined','deferred','accepted'].includes(raw.preview)?raw.preview:'pending';
    p.query=String(raw.query||'').slice(0,80);p.snapshot=['2023','2026-initial','2026-revised'].includes(raw.snapshot)?raw.snapshot:'2026-revised';
    p.marks=strings(raw.marks,x=>['name','year','position','revision'].includes(x));
    p.events=strings(raw.events,x=>!!D.batches[x]);p.pending=strings(raw.pending,x=>p.events.includes(x));p.delivered=strings(raw.delivered,x=>p.events.includes(x));
    p.effects=strings(raw.effects,x=>['GF-01','GF-02','GF-03'].includes(x));p.played=strings(raw.played,x=>p.effects.includes(x));
    for(const key of Object.keys(D.proofs)){
      const spec=D.proofs[key],d=raw.drafts?.[key];
      if(d)p.drafts[key]={links:Object.fromEntries(spec.fields.filter(f=>f.source).map(f=>[f.id,spec.sources.includes(d.links?.[f.id])?d.links[f.id]:''])),sources:strings(d.sources,x=>!!D.sources[x]||!!globalThis.StillwaterCaseData.documents[x]),values:Object.fromEntries(spec.fields.map(f=>[f.id,f.options.some(o=>o.id===d.values?.[f.id])?d.values[f.id]:'']))};
      p.hints[key]=Number.isInteger(raw.hints?.[key])?Math.max(0,Math.min(3,raw.hints[key])):0;
      // Preserve independently validated results, including their original citations.
      const finding=raw.findings?.[key];
      if(finding&&Array.isArray(finding.sources)&&spec.sources.every(id=>finding.sources?.includes(id))&&finding.sources.length===spec.sources.length&&spec.fields.every(f=>finding.values?.[f.id]===f.answer&&(!f.source||finding.links?.[f.id]===f.source)))p.findings[key]={sources:[...spec.sources],values:Object.fromEntries(spec.fields.map(f=>[f.id,f.answer])),...(key==='cause'?{links:Object.fromEntries(spec.fields.map(f=>[f.id,f.source]))}:{})};
    }
    const o=raw.overlay||{};
    for(const [key,min,max]of [['x',-20,20],['y',-20,20],['zoom',80,120],['opacity',0,100]])if(Number.isFinite(o[key]))p.overlay[key]=Math.max(min,Math.min(max,o[key]));
    p.overlay.anchors=strings(o.anchors,x=>['frame','lamp'].includes(x));p.overlay.marked=['plaque','lamp','guest-door'].includes(o.marked)?o.marked:'';
    const retained=o.retained||o;p.overlay.verified=o.verified===true&&!!p.findings.diary&&Array.isArray(retained.anchors)&&retained.anchors.includes('frame')&&retained.anchors?.includes('lamp')&&Number.isFinite(retained.x)&&Number.isFinite(retained.y)&&Number.isFinite(retained.zoom)&&Math.abs(retained.x)<=1&&Math.abs(retained.y)<=1&&Math.abs(retained.zoom-100)<=1&&retained.marked==='plaque';
    if(p.overlay.verified)p.overlay.retained={x:retained.x,y:retained.y,zoom:retained.zoom,anchors:['frame','lamp'],marked:'plaque'};
    p.hints.overlay=Number.isInteger(raw.hints?.overlay)?Math.max(0,Math.min(3,raw.hints.overlay)):0;
    p.viewed=strings(raw.viewed,x=>allowed(c,x));p.compare=strings(raw.compare,x=>allowed(c,x)).slice(-2);
    p.activeSource=allowed(c,raw.activeSource)?raw.activeSource:'index';p.tab=D.proofs[raw.tab]?raw.tab:'index';
    if(typeof raw.returnTo==='string'&&/^[a-z-]+(?:\?[a-zA-Z0-9=&-]+)?$/.test(raw.returnTo)&&!routes.includes(raw.returnTo.split('?')[0]))p.returnTo=raw.returnTo.slice(0,140);
    return p;
  }
  function ready(c){return !on(c)||(['index','diary','echo','cause'].every(k=>!!s(c).findings[k])&&s(c).overlay.verified&&s(c).preview!=='pending');}
  function objective(c){
    const p=s(c),goal=(key,label,links)=>({key,label,links});
    if(!on(c)||!has(c,'C2')||c.night.started)return null;
    if(!c.desk.results.intake)return null;
    if(!p.viewed.includes('index'))return goal('index',D.proofs.index.title,[['guest-index',text('姓名索引','Name index')],['chat?room=wcr_old',text('旧会话 · 2023','Older conversation · 2023')]]);
    if(!p.findings.index){if(!c.desk.results.space)return null;return goal('index',D.proofs.index.title,[['source-review?proof=index',text('核对姓名索引','Review the index')],['source-review?source=position',text('服务区登记卡','Position card')]]);}
    if(!p.restored)return goal('cache',text('找回日志关联的早期版本','Recover the earlier linked source'),[['history-cache',text('失效附件 / 历史版本','Unavailable attachment / history')],['wcr-sources',text('日志与现场笔记','Log and field notebook')]]);
    if(!p.findings.diary)return goal('diary',D.proofs.diary.title,[['source-review?proof=diary',text('核对三份文字','Review the three texts')],['wcr-sources',text('来源目录','Sources')]]);
    if(!p.findings.echo)return goal('echo',D.proofs.echo.title,[['source-trace',text('消息来源路径','Message source trace')],['chat?room=gg',text('GGbond 私聊','GGbond’s chat')]]);
    if(!p.overlay.verified)return goal('overlay',text('核对现场照与旧宣传照','Compare the site and publicity photos'),[['photo-overlay',text('照片叠片台','Photo overlay')],['wcr-sources',text('现场笔记','Field notebook')]]);
    if(!has(c,'C9'))return null;
    if(!p.findings.cause||p.preview==='pending')return goal('cause',D.proofs.cause.title,[['rewrite-review',text('修订链与签字预览','Revision chain and sign-off preview')],['mara',text('Mara 原备注','Mara’s original note')]]);
    return null;
  }
  function text(a,b){return [a,b];}
  return {fresh,hydrate,routes,on,allowed,canOpen,sync,action,check,available,ready,objective};
})();
