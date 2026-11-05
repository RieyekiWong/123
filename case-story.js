/* Authored event queue, archive controls and scene bridges. No AI progression. */
globalThis.StillwaterStory = {
  create({getState,getRoute,save,render,chat,signal,t,esc,blocked=()=>false,phaseTransition}){
    const M=globalThis.StillwaterStoryModel,D=globalThis.StillwaterStoryData;
    const views=globalThis.StillwaterStoryPages({getState,t,esc}),P=()=>getState().story;
    const current=()=>globalThis.StillwaterStoryV13?.active(getState());
    const flow=globalThis.StillwaterStoryV13Runtime?.create({getState,getRoute,save,render,chat,signal,t,esc,blocked,phaseTransition});
    let drag=null,busy=false;
    function persistStory(){if(getState().evidence.length||P().events.length||P().viewed.length||P().restored)save();}
    const tr=v=>t(...v),apply=(action,payload={})=>{const r=M.action(getState(),action,payload);persistStory();return r;};
    function sync(){
      if(!P())return;
      const before=JSON.stringify(P());if(!P().legacy&&!P().active)M.action(getState(),'activate');
      if(!M.on(getState()))return;
      if(chat.storyState().oldVisited&&!P().viewed.includes('oldchat'))M.action(getState(),'open',{id:'oldchat'});
      M.sync(getState(),{shared:chat.storyState().shared,route:getRoute()});
      chat.setStoryRequest(P().request);
      for(const id of [...P().pending])if(chat.deliverStory(id))M.action(getState(),'ack',{id});
      if(before!==JSON.stringify(P()))persistStory();
    }
    function prepare(route,params){
      sync();if(!M.on(getState()))return;
      if(current()){flow.prepare(route,params);return;}
      const key=params.get('proof');if(key&&D.proofs[key])apply('tab',{key});
      if(route==='source-trace')apply('tab',{key:'echo'});
      if(route==='rewrite-review')apply('tab',{key:'cause'});
      const id=params.get('source');if(id&&M.allowed(getState(),id))apply('open',{id});
      if(route==='chat'&&params.get('room')==='wcr_old')apply('open',{id:'oldchat'});
    }
    function feedback(result){
      const panel=document.querySelector('[data-story-feedback]');if(!panel)return;
      const copy={
        compare:['请将姓名索引与服务区域登记卡加入对照，再保存判断。','Compare the name index with the position card before retaining the finding.'],
        'echo-compare':['请将字段更新与新账号消息加入对照，检查上游来源。','Compare the field update with the new-account messages to check their upstream source.'],
        'cause-source':['这段连接还缺一份对应原件：','This connection still needs its matching source: '],
        unread:['这份资料还没打开过。点对应的“查看”可以重看原件：','This source has not been opened. Use its Open button to inspect the original: '],
        source:['还缺一份可核对的原件：','A retained original is still missing: '],unrelated:['引用中有一份资料不能支持当前判断。检查这次实际核对的是哪个字段。','One cited source does not support this finding. Check which field is being reviewed.'],
        marks:['请先打开姓名索引，点选你检查过的姓名、日期、用途与修订字段。','Open the name index and mark the name, date, position and revision fields you checked.'],
        person:['这条入住记录没有得到原件支持，不等于已经证明王楚人不存在。','An unsupported stay does not establish that Wang Churen never existed.'],
        index:['钥匙套和系统编号不能独立证明入住。核对原始预订单中的姓名和区域登记用途。','A key sleeve or system identifier does not establish occupancy. Check the original guest name and registered position use.'],
        diary:['至少一项归类还缺来源支持。相似的句子不一定来自同一作者；计划也不等于到访。','At least one classification lacks support. Similar wording need not mean the same author; a plan is not a recorded visit.'],
        echo:['这些消息里有可以从旧资料取得的内容。请检查字段更新与复述之间的来源路径。','Some messages repeat material already available. Check the path from the field update to the repeated claim.'],
        footage:['姓名关联不能代替录像中的身份依据。也不能从缺少记录推出从未有人进入。','A linked name does not establish an identity in footage. Missing records also do not prove that nobody entered.'],
        cause:['这段连接的性质与原件不符。系统做了修改，不等于有人实际入住。','This connection does not match its sources. A system revision does not establish an actual stay.'],
        align:['两个固定地标还没对齐。检查门框上角与灯座，用移动和缩放微调。','The fixed landmarks do not align yet. Check the frame corner and lamp base; adjust pan and scale.'],
        plaque:['两张照片已对齐。再检查哪一部分的内容发生了变化。','The photographs align. Check which part has different content.'],
        snapshot:['当前版本没有保留旧附件。可以切换到更早的快照查看。','This version does not retain the earlier attachment. Try an older snapshot.'],
        name:['这个名字没有匹配结果。可用中文姓名或完整拼音查找。','No matching entry. Try the Chinese name or full pinyin.'],
        'not-ready':['这一项还需要相关原件。请查看当前调查中的入口，之前保存的操作都还在。','This review needs its related originals. Use the current investigation links; your saved work is retained.'],
      };
      panel.textContent=result.ok?t('核对已保存。','Review retained.'):tr(copy[result.error]||copy['not-ready'])+(result.document?views.name(result.document):'');
      panel.dataset.error=String(!result.ok);if(!result.ok)panel.focus({preventScroll:true});
    }
    function controls(action,payload){if(action==='open'){const params=new URLSearchParams(location.hash.split('?')[1]||'');if(params.has('source')){params.set('source',payload.id);history.replaceState(null,'',location.pathname+location.search+'#'+getRoute()+'?'+params);}}const result=apply(action,payload);sync();if(result.ok)render();if(current()){flow.feedback(result,action);if(result.ok&&action==='open')flow.openSource(payload.id);void flow.resume();}else feedback(result);return result;}
    function updatePhoto(){const o=P().overlay,img=document.querySelector('[data-story-overlay-photo]');if(img){img.style.transform=`translate(${o.x}%,${o.y}%) scale(${o.zoom/100})`;img.style.opacity=o.opacity/100;}const out=document.querySelector('[data-story-overlay-output]');if(out)out.textContent=`X ${o.x} / Y ${o.y} / ${o.zoom}%`;}
    document.addEventListener('click',event=>{
      const el=event.target.closest('[data-story-action]');if(!el)return;
      const action=el.dataset.storyAction,id=el.dataset.id,key=el.dataset.key;
      if(action==='open'){controls('open',{id});return;}
      if(action==='nudge'){apply('overlay',{[key]:P().overlay[key]+Number(el.dataset.delta)});updatePhoto();return;}
      if(action==='anchor'){controls('overlay',{anchor:id});return;}
      if(action==='photo-mark'){controls('overlay',{mark:id});return;}
      const payload={id,key,version:el.dataset.version,choice:el.dataset.choice};
      controls(action,payload);
    });
    document.addEventListener('change',event=>{
      const el=event.target;
      if(el.matches('[data-story-boundary-cite]')){const id=el.dataset.storyBoundaryCite;apply('open',{id});apply('draft',{key:'footage',source:id,checked:el.checked});}
      if(el.matches('[data-story-link-source]'))apply('draft',{key:el.dataset.key,linkField:el.dataset.storyLinkSource,linkSource:el.value});
      if(el.matches('[data-story-field]'))apply('draft',{key:el.dataset.key,field:el.dataset.storyField,value:el.value});
      if(el.matches('[data-story-cite]'))apply('draft',{key:el.dataset.key,source:el.dataset.storyCite,checked:el.checked});
    });
    document.addEventListener('input',event=>{if(event.target.matches('[data-story-opacity]')){apply('overlay',{opacity:Number(event.target.value)});updatePhoto();}});
    document.addEventListener('submit',event=>{
      const form=event.target.closest('[data-story-form]');if(!form)return;event.preventDefault();
      const key=form.dataset.storyForm;controls(key==='search'?'query':'submit',key==='search'?{text:form.elements.name.value}:{key});
    });
    document.addEventListener('keydown',event=>{
      if(!event.target.matches('.story-overlay-stage'))return;
      const delta={ArrowLeft:['x',-1],ArrowRight:['x',1],ArrowUp:['y',-1],ArrowDown:['y',1]}[event.key];
      if(delta){event.preventDefault();apply('overlay',{[delta[0]]:P().overlay[delta[0]]+delta[1]});updatePhoto();}
    });
    document.addEventListener('pointerdown',event=>{
      const stage=event.target.closest('.story-overlay-stage');if(!stage)return;
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,ox:P().overlay.x,oy:P().overlay.y,rect:stage.getBoundingClientRect()};stage.setPointerCapture(event.pointerId);
    });
    document.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;M.action(getState(),'overlay',{x:Math.round(drag.ox+(event.clientX-drag.x)/drag.rect.width*100),y:Math.round(drag.oy+(event.clientY-drag.y)/drag.rect.height*100)});updatePhoto();});
    const release=()=>{if(drag){drag=null;save();}};document.addEventListener('pointerup',release);document.addEventListener('pointercancel',release);
    async function effects(){
      if(busy||blocked()||signal.occupied?.()||document.hidden||document.querySelector('dialog[open]'))return;
      const route=getRoute(),targetById={'GF-01':route==='history-cache'?'.story-cache-image':null,'GF-02':route==='rewrite-review'?'.story-signoff':null,'GF-03':route==='terminal'?'.cctv-frame':null};
      const id=P().effects.find(id=>!P().played.includes(id)&&targetById[id]);if(!id)return;
      const target=document.querySelector(targetById[id]);if(!target)return;
      busy=true;apply('played',{id});
      try{await signal.burst?.({id,form:id==='GF-01'?'half':id==='GF-02'?'assembled':'close',target});}finally{busy=false;}
    }
    function goal(){const o=M.objective(getState());if(o){const base=globalThis.StillwaterCaseState.objective(getState());o.links=[...new Map([o.links[0],...base.directions,...o.links.slice(1)].map(x=>[x[0],x])).values()].slice(0,3);}return o?`<section class="investigation-focus story-focus" aria-label="${t('当前调查','Current investigation')}"><p class="desk-label">${t('当前调查','CURRENT REVIEW')}</p><p>${esc(tr(o.label))}</p><div class="investigation-directions">${o.links.slice(0,3).map(([r,label])=>`<a href="#${r}">${esc(tr(label))} →</a>`).join('')}</div></section>`:'';}
    function afterRender(){
      sync();if(!M.on(getState()))return;
      if(current()){flow.afterRender();return;}
      const route=getRoute(),params=new URLSearchParams(location.hash.split('?')[1]||''),main=document.querySelector('#content');
      if(!main||route==='chat'||!globalThis.StillwaterCaseState.canOpen(getState(),route))return;
      for(const [id,file]of Object.entries(globalThis.StillwaterCaseData.documents)){if(file.route.split('?')[0]!==route||!M.allowed(getState(),id)||P().viewed.includes(id))continue;if(['rooms','guestbook'].includes(route)&&params.get('copy')!=='original')continue;M.action(getState(),'open',{id});}
      if(!M.routes.includes(route)&&!['forum','careers','ending','void'].includes(route))P().returnTo=location.hash.slice(1);
      const nav=document.querySelector('.staff-nav');if(nav&&!nav.querySelector('[data-story-nav]'))nav.insertAdjacentHTML('beforeend',`<a href="#source-review" data-story-nav>${t('来源核对','Source review')}</a>`);
      const hotelNav=document.querySelector('.hotel-nav');if(hotelNav&&getState().evidence.includes('C2')&&!hotelNav.querySelector('[data-story-nav]'))hotelNav.insertAdjacentHTML('beforeend',`<a href="#guest-index" data-story-nav>${t('姓名索引','Name index')}</a>`);
      if(route==='void'){
        const disposition=main.querySelector('.void-disposition');if(disposition){disposition.hidden=!P().findings.footage;if(!main.querySelector('.story-void-boundary'))disposition.insertAdjacentHTML('beforebegin',views.boundary());}
        if(!main.querySelector('.story-void-layers'))main.insertAdjacentHTML('beforeend',`<details class="story-void-layers"><summary>2006 / 2023 / 2026</summary><p>${t('2006 · 318 原预订，317 服务暂存。','2006 · Booking 318; 317 service holding.')}</p><p>${t('2023 · 旧湖区现场笔记。','2023 · Old Lake field notebook.')}</p><p>${t('2026 · 姓名索引将两层记录关联。','2026 · Name index links the two layers.')}</p><blockquote>${tr(D.nullLines[5])}</blockquote></details>`);
        return;
      }
      const newGoal=goal();
      if(newGoal){const existing=main.querySelector('.investigation-focus');if(existing)existing.outerHTML=newGoal;else if(!['forum','careers','ending'].includes(route))main.insertAdjacentHTML('afterbegin',newGoal);}
      if(['notes','evidence-desk'].includes(route)&&!main.querySelector('.story-case-register'))main.insertAdjacentHTML('beforeend',`<section class="story-case-register"><h2>${t('关联来源 / 王楚人','Linked sources / Wang Churen')}</h2><p><a href="#guest-index">${t('姓名索引','Name index')}</a> · <a href="#source-review">${t('打开来源核对台','Open source review')}</a></p><dl>${Object.entries(D.proofs).map(([k,v])=>`<div><dt>${esc(tr(v.title))}</dt><dd>${P().findings[k]?t('已核对','Retained'):M.available(getState(),k)?t('正在调查','In review'):t('尚缺来源','Awaiting sources')}</dd></div>`).join('')}</dl></section>`);
      if(route==='review'&&!M.ready(getState())&&!main.querySelector('.story-review-hold'))main.insertAdjacentHTML('afterbegin',`<aside class="story-review-hold"><p>${t('姓名关联还有来源冲突，当前回执不能提交同步。','The name association still has source conflicts. This receipt cannot be synchronized yet.')}</p><a href="#${P().findings.echo?'rewrite-review':'source-review'}">${t('查看尚未完成的核对','Open pending source review')} →</a></aside>`);
      if(route==='rooms'&&P().findings.index&&!getState().night.started&&params.get('copy')!=='original'&&!main.querySelector('.story-sync-note'))main.insertAdjacentHTML('afterbegin',`<aside class="story-sync-note"><p>317 / GUEST ROOM / SYNCHRONIZED</p><a href="#source-review?source=sync">${t('查看本次字段更新','View field update')} →</a> · <a href="#rooms?copy=original">${t('原始目录','Original directory')}</a></aside>`);
      if(['history-cache','wcr-sources','source-trace','rewrite-review','source-review'].includes(route)&&!main.querySelector('.story-return'))main.insertAdjacentHTML('beforeend',`<p class="story-return"><a href="#${esc(P().returnTo)}">${t('返回上一处调查页面','Return to previous investigation page')} →</a> · <a href="#notes">${t('工作笔记','Case notes')}</a>${P().effects.length?' · <a href="#null-archive">'+t('错帧留存','Retained mismatched frames')+'</a>':''}</p>`);
      if(route==='terminal'&&!main.querySelector('.story-b3-state')){
        const n=getState().night,c=globalThis.StillwaterNightModel.circuit(n),pressure=c.valid&&n.saved?'AUTO-WRITE ISOLATED':c.readable?'SOURCE CONFLICT':'AUTO CLOSE PENDING';
        main.insertAdjacentHTML('beforeend',`<aside class="story-b3-state"><p class="story-file-id">${pressure}</p><p>2006 / B-3 / 03:17 — 2023 / WC-NOTE-04 — 2026 / WC-317</p><p>${t('原始录像没有王楚人的身份索引。合成姓名不等于录像里的人。','The original footage has no Wang Churen identity index. A merged name does not identify a person in the recording.')}</p><blockquote>${tr(D.nullLines[4])}</blockquote><a href="#source-review?source=notebook">${t('重看 2023 来源','Reopen 2023 source')}</a> · <a href="#chat?room=gg">${t('查看 GGbond 的消息','Read GGbond’s messages')}</a></aside>`);
      }
      if(route==='credits'&&!main.querySelector('.story-art-credits'))main.insertAdjacentHTML('beforeend',`<section class="story-art-credits"><h2>${t('王楚人 / NULL 素材','Wang Churen / NULL artwork')}</h2><p>${t('西侧通道与北岸渡口为本作生成的虚构场景。NULL 沿用 4.15 已确认的原始鬼脸，以程序裁切与噪波叠加呈现；参考图中的人脸未替换进游戏。','The west passage and north ferry are generated fictional scenes. NULL uses the approved 4.15 apparition with runtime cropping and signal noise; the attached concept face does not replace it.')}</p></section>`);
      if(route==='ending'&&!main.querySelector('.story-epilogue')){const view=params.get('view'),id=getState().endings.includes(view)?view:getState().lastEnding;main.insertAdjacentHTML('beforeend',views.epilogue(id));}
      persistStory();void effects();
    }
    setInterval(()=>{sync();if(current())void flow.resume();else if(M.on(getState()))void effects();},1000);
    return {prepare,afterRender,views,sync,goal};
  }
};
