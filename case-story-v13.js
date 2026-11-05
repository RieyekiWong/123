/* Stable-point scene transitions. Durable completion is saved before presentation. */
globalThis.StillwaterStoryV13Runtime={
 create({getState,getRoute,save,render,chat,signal,t,esc,blocked=()=>false,phaseTransition}){
  const V=globalThis.StillwaterStoryV13,D=globalThis.StillwaterStoryV13Data,P=()=>getState().story;
  const views=globalThis.StillwaterStoryV13Pages({getState,t,esc});let busy=false,timer=null;
  const tr=a=>Array.isArray(a)?t(...a):a;
  function prepare(route,params){
    const key=route==='source-trace'?'echo':route==='rewrite-review'?'cause':params.get('proof');
    if(key&&D.proofs[key]&&V.available(getState(),key)){
      P().tab=key;
      if(![...D.proofs[key].sources,...(D.proofs[key].extras||[])].includes(P().activeSource))V.open(getState(),D.proofs[key].sources[0]);
    }
    const id=params.get('source');if(id&&V.readable(getState(),id))V.open(getState(),id);
    const associated={'floor-plan':['position'],maintenance:['housekeeping','transfer'],'night-audit':['key','housekeeping','transfer','mara'],staff:['personnel','nora-shift','nora-life','nora-revision'],revisions:['revision','nora-revision'],closure:['closure'],mara:['mara','nora-shift'],'photo-overlay':['fieldphoto','notebook']};
    for(const id of associated[route]||[])if(V.readable(getState(),id))V.open(getState(),id);
    if(route==='source-trace')for(const id of ['avatar-old','avatar-new'])V.open(getState(),id);
    if(P().transition?.to===location.hash.slice(1)){P().transition.consumed=true;save();}
  }
  function feedback(result,action=''){
    const el=document.querySelector('[data-story-feedback]');if(!el)return;
    const copy={
      source:t('先打开并附上这份原件：','Open and attach this original first: '),
      compare:t('先选两份原件，点“放在一起看”。','Choose two originals with “Compare side by side”.'),
      unrelated:t('有一份引用不支持这次判断。检查本次核对的是哪条记录。','One citation does not support this finding. Check which record you are reviewing.'),
      index:t('原预订单的住客是 E. Vale。区域编号本身不能证明入住，检查目录与服务卡。','The booking names E. Vale. A position number alone does not establish occupancy; check the directory and service card.'),
      diary:t('核对学校提交、旧消息和现在的文本。相同措辞不等于同一份原文。','Compare the school submission, older messages and current text. Matching wording is not the same original.'),
      echo:t('这段旧事和照片在新号出现前已经存在。它们不能单独证明账号身份。','That memory and image existed before the new account. They cannot independently establish its identity.'),
      cause:t('原工时支持 Nora 上过夜班。“已离职”的签改单没有附她本人的辞职记录。','The time card supports Nora’s attendance. The resignation change has no resignation from her attached.'),
      ROOM:t('请检查原目录、服务用途与恢复的画面。','Check the original directory, service use and recovered picture.'),
      GUEST:t('把原预订、系统移交和不同年代的来源分开看。','Separate the original booking, system transfer and sources from different years.'),
      EMPLOYEE:t('Nora 与 Mara 的工作都有记录，但不能用她们的身份覆盖整条混合记录。','Nora and Mara have work records. Neither identity can stand in for the entire merged record.'),
      name:t('没有匹配结果。可用王楚人、Wang Churen 或 Churen Wang。','No match. Try 王楚人, Wang Churen or Churen Wang.'),
    };
    el.textContent=result.ok?(action==='submit'?t('核对已保存。','Review retained.'):''):(copy[result.error]||t('相关来源还没有齐，刚才的操作已保留。','Related sources are still missing. Your work is retained.'))+(result.document?views.name(result.document):'');
    if(!result.ok)el.focus({preventScroll:true});
  }
  function openSource(id){
    if(getRoute()!=='void'||!V.readable(getState(),id))return;
    const dialog=document.createElement('dialog');dialog.className='v13-source-dialog';
    dialog.setAttribute('aria-label',views.name(id));
    dialog.innerHTML=`<button type="button" class="v13-source-close">${t('读完，返回核对','Done reading; return to review')}</button>${views.source(id)}`;
    dialog.querySelector('.v13-source-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{dialog.remove();document.querySelector(`.v13-final [data-story-action="open"][data-id="${CSS.escape(id)}"]`)?.focus({preventScroll:true});},{once:true});
    document.body.append(dialog);dialog.showModal();dialog.querySelector('.v13-source-close').focus();
  }
  async function resume(){
    const transition=P().transition;
    if(!transition||transition.consumed||busy||blocked()||signal.occupied?.()||document.hidden||document.querySelector('dialog[open],[data-v13-reading-open],.messenger-intrusion'))return;
    if(location.hash.slice(1)===transition.to){transition.consumed=true;save();return;}
    busy=true;
    try{
      const target=document.querySelector('.v13-proof,.v13-mail,.cctv-frame')||document.querySelector('#content');
      if(transition.effect&&!P().played.includes(transition.effect)){
        if(target&&!target.querySelector('[data-v13-null-line]')){
          const line=document.createElement('blockquote');line.className='null-line';line.dataset.v13NullLine='';
          line.textContent=transition.effect==='GF-01'?t('我先别乱说。入住状态：已确认。','Let me check first. Occupancy: confirmed.'):transition.effect==='GF-02'?t('我那天确实上班了。你不能把我写成他。可是我用他的名字，门才肯开。','I was working that night. You cannot write me down as him. But the door only opens for his name.'):t('我那天在上班。GG，你又把地图拿反了。','I was working that night. GG, you held the map upside down again.');target.append(line);
        }
        P().played.push(transition.effect);save();
        await signal.burst?.({id:transition.effect,form:transition.effect==='GF-01'?'half':transition.effect==='GF-02'?'assembled':'close',target});
      }
      if(transition.id==='T5'&&phaseTransition){phaseTransition.begin();return;}
      await new Promise(resolve=>{timer=setTimeout(resolve,getState().preferences.reduceMotion?150:700);});
      if(P().transition===transition&&!document.hidden&&!document.querySelector('dialog[open]'))location.hash=transition.to;
    }finally{busy=false;}
  }
  function goal(){const o=V.objective(getState());return o?`<section class="investigation-focus v13-focus"><p class="desk-label">${t('当前调查','CURRENT INVESTIGATION')}</p><p>${esc(tr(o.label))}</p><div class="investigation-directions">${o.links.map(([hash,label])=>`<a href="#${esc(hash)}">${esc(tr(label))} →</a>`).join('')}</div></section>`:'';}
  function afterRender(){
    const route=getRoute(),main=document.querySelector('#content');if(!main)return;
    if(route==='chat'){
      if(['accepted','ignored'].includes(P().request)&&!P().findings.echo&&!document.querySelector('.v13-chat-return')){
        const a=document.createElement('a');a.href='#source-trace';a.className='v13-chat-return';a.textContent=t('返回浏览器 · 核对头像和消息来源','Back to browser · Check the avatar and message sources');document.querySelector('.chat-story-profile')?.append(a);
      }
      void resume();return;
    }
    if(route==='notes')main.innerHTML=`<h1>${t('调查笔记','Investigation notes')}</h1>${goal()}<dl class="v13-progress">${Object.entries(D.proofs).map(([key,spec])=>`<div><dt>${esc(tr(spec.title))}</dt><dd>${P().findings[key]?t('已保存判断','Finding retained'):V.available(getState(),key)?t('正在调查','In progress'):t('尚未开放','Not open yet')}</dd></div>`).join('')}</dl><p><a href="#wcr-sources">${t('重看已留存的原件','Reopen retained originals')} →</a></p>`;
    if(!['notes','ending','void','mirror','forum','careers','credits'].includes(route)){
      const old=main.querySelector('.investigation-focus');if(old&&!old.classList.contains('v13-focus'))old.outerHTML=goal();else if(!old)main.insertAdjacentHTML('afterbegin',goal());
    }
    if(route==='hotel'&&!main.querySelector('.v13-hotel-search'))main.insertAdjacentHTML('afterbegin',`<p class="v13-hotel-search"><a href="#guest-index">${t('历史住客查询','Historical guest search')} →</a></p>`);
    if(route==='source-review'&&!main.querySelector('.v13-return-files'))main.insertAdjacentHTML('beforeend',`<p class="v13-return-files"><a href="#evidence-desk">${t('返回当前核对','Return to the current review')}</a> · <a href="#wcr-sources">${t('留存资料','Retained sources')}</a></p>`);
    if(route==='terminal'){
      for(const el of main.querySelectorAll('[data-ending],[data-unlisted-entry]'))el.hidden=true;
      const readable=globalThis.StillwaterNightModel.circuit(getState().night).readable&&getState().night.frame;
      if(readable&&!main.querySelector('.v13-recording-sources'))main.insertAdjacentHTML('beforeend',`<section class="v13-recording-sources"><h2>${t('同一条索引里的不同来源','Different sources under one index')}</h2><p class="story-file-id">2006 ORIGINAL / 2026 SYNCHRONIZED PREVIEW</p><p>${t('原始五秒里，Nora 经过员工门。Mara 留存的录音辨认稿：“这里是员工通道，先别把它登记成房间。”','In the original five seconds, Nora passes the staff door. Mara’s retained transcription: “This is the staff passage. Don’t register it as a room yet.”')}</p><p>${t('同步预览的边缘混入蓝栏杆与一句普通话：“等一下，我还没写完。”它们不属于 2006 年原始录制。','The synchronized preview contains a blue railing and a Mandarin line: “Wait, I haven’t finished.” These do not belong to the original 2006 recording.')}</p><p>${t('先按原规则接通只读线路、隔离 AUTO-WRITE、切到 MANUAL 并保存，再核对宣传照原件。','Restore the read-only circuit, isolate AUTO-WRITE, select MANUAL and save, then verify the publicity original.')}</p></section>`);
      if(readable&&!main.querySelector('.v13-film-tabs')){
        const panel=main.querySelector('.v13-recording-sources'),synced=P().filmMode==='synced';
        const frame=globalThis.StillwaterNightViews({t,getState}).camera(2,true).replace('data-silhouette="false"','data-silhouette="true"');
        panel.insertAdjacentHTML('afterbegin',`<nav class="v13-film-tabs"><button data-story-action="film" data-choice="original" aria-pressed="${!synced}">${t('2006 原始来源','2006 original')}</button><button data-story-action="film" data-choice="synced" aria-pressed="${synced}">${t('2026 同步预览','2026 synchronized preview')}</button></nav><div class="v13-reel-preview">${frame}${synced?`<div class="v13-mixed-edge"><img src="assets/story-v12/wcr-11-blue-sign.png" alt="${t('混入的 2023 蓝栏杆来源','Mixed-in 2023 blue-railing source')}"><span>2023 SOURCE / MERGED 2026</span></div>`:''}</div>`);
        if(synced)panel.querySelector('.cctv-osd.bottom span').textContent='2026 / SYNCHRONIZED PREVIEW';
      }
      if(!P().b3Recovered&&getState().promo.verified&&globalThis.StillwaterVoidModel.ready(getState().night)){V.action(getState(),'recover');save();}
    }
    if(route==='ending'&&!main.querySelector('.v13-epilogue'))main.insertAdjacentHTML('beforeend',views.epilogue(getState().lastEnding));
    if(route==='credits'&&!main.querySelector('.v13-art-credits'))main.insertAdjacentHTML('beforeend',`<section class="v13-art-credits"><h2>${t('原创虚构人物素材','Original fictional character artwork')}</h2><p>${t('王楚人、Nora 与同伴的新增照片为本作生成的虚构美术。NULL 继续使用此前确认的错帧原脸。未制作的肖像和生活照片没有用真人图片代替。','New images of Churen, Nora and their companions are generated fictional artwork for this game. NULL retains the previously approved apparition. Unmade portraits have not been replaced with real people’s photos.')}</p></section>`);
    void resume();
  }
  return {prepare,afterRender,feedback,resume,goal,views,openSource};
 }
};
