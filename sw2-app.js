/* Opt-in remake preview. Production case and AI transport remain separate. */
(() => {
  'use strict';
  const D=globalThis.Stillwater2Data,M=globalThis.Stillwater2Progress;
  const t=(zh,en)=>document.documentElement.lang==='zh-CN'?zh:en;
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function read(key){try{const raw=localStorage.getItem(key);return {raw,value:raw?JSON.parse(raw):null};}catch{return {raw:null,value:null,error:true};}}
  const prior=read(M.KEY),chatPrior=read(M.CHAT_KEY),legacy=read('stillwater-case:v2');
  let state=M.hydrate(prior.value)||M.fresh();
  if(!prior.raw&&!prior.error)state.preferences=M.importPreferences(legacy.value);
  let stateFault=prior.error||!!prior.raw&&!M.hydrate(prior.value),chatFault=chatPrior.error||!!chatPrior.raw&&chatPrior.value?.schema!==1,saveFailed=false;
  let messenger=null,ads=null,story=null,sourceDialog=null,feedbackDialog=null,lastRenderedRoute=null,lastRenderedHash=null;
  const host=document.querySelector('#case-shell');
  const current=()=>D.parse(location.hash)?.route||'chat';
  const policy=()=>{
    const scene=M.scene(state,current());
    if(current()==='hotel'&&D.parse(location.hash)?.params.get('record')==='churen')return {...scene,ads:false,notices:false,reading:true};
    return scene;
  };
  const reduced=()=>state.preferences.reduceMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const chrome=document.createElement('div');chrome.id='sw2-chrome';host.before(chrome);
  const alert=document.createElement('p');alert.id='sw2-storage-alert';alert.role='status';alert.hidden=true;chrome.after(alert);
  function storageNotice(){
    alert.hidden=!(stateFault||chatFault||saveFailed);
    alert.textContent=t('预览存档暂时无法保存或读取。原记录保留，当前页面仍可继续；可在设置中确认重走预览。','The prototype record cannot be saved or read. The original is preserved; you can continue in this tab or confirm a prototype restart in settings.');
  }
  function save(){
    if(stateFault){storageNotice();return false;}
    state.chapter=M.chapter(state,state.route);
    try{localStorage.setItem(M.KEY,JSON.stringify(state));saveFailed=false;storageNotice();return true;}
    catch{saveFailed=true;storageNotice();return false;}
  }
  const audio=globalThis.StillwaterCaseAudio.create({
    getState:()=>state,getRoute:current,canOpen:route=>M.canOpen(state,route),isDeep:()=>false,
    getPresentation:()=>({blocked:!!document.querySelector('dialog[open]')}),
    getScene:({route})=>route==='chat'||route==='forum'?null:route==='ending'?state.lastEnding==='released'?'safe':null:route==='heritage/final-trace'?'deep':route==='heritage/b3'?'passage':route==='heritage/cctv'?'cctv':route.startsWith('phase')?'archive':'investigation',
  });
  const imported=chatPrior.raw||chatPrior.error?undefined:M.importChat(read('stillwater-chat:v1').value);
  const chat=globalThis.StillwaterChat.create({
    t,esc,getRoute:current,audio,storageKey:M.CHAT_KEY,initialState:imported,canPersist:()=>!chatFault,formatRoute:D.hash,
    onIncoming:messages=>{messenger?.incoming(messages);updateChrome();},
    renderShareCard:()=>`<a class="chat-share-card" data-chat-forum href="${D.hash('forum?topic=hotel-return')}"><strong>${esc(t(...globalThis.Stillwater2FrontData.mainPost.title))}</strong><span class="chat-share-summary">${t('有人把旧湖区酒店的网站恢复了，楼主留了两份附件。','Someone restored the old lake-district hotel website. The OP kept two attachments.')}</span><span class="chat-share-source">NIGHT OWL BBS</span></a>`,
  });
  messenger=globalThis.StillwaterMessengerBridge.create({
    chat,getState:()=>state,getRoute:current,canOpen:route=>M.canOpen(state,route),t,esc,audio,reduced,
    storageNamespace:'2.0:prototype',parseHash:D.parse,formatHash:D.hash,scenePolicy:policy,blocked:()=>!!document.querySelector('dialog[open]'),
  });
  ads=globalThis.StillwaterAds.create({t,esc,getState:()=>state,getRoute:current,canShow:()=>policy().ads&&!document.activeElement?.matches('[data-sw2-note]'),sessionKey:'stillwater-ads-session:2.0:prototype:v1'});
  const pages=globalThis.Stillwater2Pages({t,esc,getState:()=>state,stored:()=>!stateFault&&!saveFailed});
  function navigate(route){const hash=D.hash(route);if(location.hash===hash)render();else location.hash=hash;}
  story=globalThis.Stillwater2Story.create({getState:()=>state,save,chat,navigate});
  function updateChrome(){
    const route=current(),goal=M.goal(state),p=Object.values(D.puzzles).find(p=>p.route===goal);
    const awaiting=route==='chat'&&!chat.storyState().shared&&!M.solved(state,'P1');
    const label=awaiting?t('查看 GG 的消息','Read GG’s messages'):goal==='chat'?t('查看好友申请','View friend request'):p?t(...p.goal):goal==='ending'?t('查看本次结局','View this ending'):t('查看修复项目署名','Check the restoration project');
    const next=awaiting?`<button data-sw2-action="open-gg">${label}</button>`:`<a class="sw2-next" href="${D.hash(M.destination(state))}">${esc(label)}</a>`;
    const english=document.documentElement.lang!=='zh-CN';
    const html=`<p><strong>2.0 · ${t('开发预览 / Stage 2','Development preview / Stage 2')}</strong> · ${state.chapter+1}/8 · ${t('开场、论坛与酒店已接入；后续仍为路线预览。','Opening, forum and hotel integrated; later chapters remain route prototypes.')}</p><nav>${next}<button data-case-action="settings">${t('设置','Settings')}</button><a href="${english?'index-zh.html':'index.html'}${esc(location.search+location.hash)}">${t('English','简体中文')}</a><a href="${english?'index.html':'index-zh.html'}?edition=choose">${t('版本','Edition')}</a></nav>`;
    if(chrome.innerHTML!==html)chrome.innerHTML=html;
    document.documentElement.style.setProperty('--sw2-chrome-height',chrome.getBoundingClientRect().height+'px');
    const composer=host.querySelector('.chat-composer');
    if(composer)document.documentElement.style.setProperty('--sw2-composer-height',composer.getBoundingClientRect().height+'px');
  }
  function feedback(message){const target=host.querySelector('[data-sw2-feedback]')||document.querySelector('#case-status');target.textContent=message;}
  function suspendDialog(dialog){if(!dialog)return;dialog.dataset.suspended='true';dialog.close();dialog.remove();}
  function showSource(){
    if(!state.reading||sourceDialog?.open)return;
    const id=state.reading;if(!M.canRead(state,id))return;
    const returnTo=document.activeElement,dialog=document.createElement('dialog');dialog.id='sw2-source';dialog.setAttribute('aria-label',t(...D.sources[id].title));dialog.innerHTML=pages.source(id);sourceDialog=dialog;document.body.append(dialog);
    dialog.addEventListener('close',()=>{sourceDialog=null;dialog.remove();if(dialog.dataset.suspended)return;M.action(state,'close-source');save();render();const button=host.querySelector(`[data-source="${id}"]`);(button||returnTo?.isConnected&&returnTo)?.focus({preventScroll:true});});
    dialog.showModal();ads.navigate();audio.pause();
  }
  function showTransition(){
    const transition=state.transition;if(!transition||transition.from!==current()||feedbackDialog?.open)return;
    const dialog=document.createElement('dialog');dialog.id='sw2-transition';dialog.setAttribute('aria-labelledby','sw2-transition-title');
    const p=D.puzzles[transition.id],formal=['P1','P2'].includes(transition.id);
    dialog.innerHTML=`<p>${transition.id} / ${formal?t('核对记录已保存','Review retained'):t('预览反馈','Prototype feedback')}</p><h2 id="sw2-transition-title">${t(...p.title)}</h2>${transition.id==='P1'?`<div class="sw2-date-pair"><div>${t('酒店停业','Hotel closure')}<p>2007</p></div><div>${t('网站恢复','Website restoration')}<p>2026</p></div></div>`:''}${t(...p.feedback).split('\n\n').map(copy=>`<p>${esc(copy)}</p>`).join('')}${transition.id==='P2'?`<div class="sw2-sync-status" role="status"><p data-sync-prior>${t('审核通过','REVIEW ACCEPTED')}</p><p data-sync-current hidden>${t('身份关联待补全','IDENTITY ASSOCIATION INCOMPLETE')}</p></div>`:''}<button class="sw2-primary" data-sw2-action="close-transition">${formal?transition.id==='P1'?t('读完，打开酒店网站 →','Finished; open the hotel site →'):t('读完，查看修复项目 →','Finished; view the restoration project →'):t('读完，关闭这一页','Finished reading; close this page')}</button>`;
    const syncTimer=transition.id==='P2'?setTimeout(()=>{const prior=dialog.querySelector('[data-sync-prior]'),next=dialog.querySelector('[data-sync-current]');if(prior&&next){prior.classList.add('is-replaced');next.hidden=false;}},1200):null;
    feedbackDialog=dialog;document.body.append(dialog);
    dialog.addEventListener('close',()=>{clearTimeout(syncTimer);feedbackDialog=null;dialog.remove();if(!dialog.dataset.suspended)story.continueReading();});
    dialog.showModal();ads.navigate();audio.pause();
  }
  function render(){
    if(!D.parse(location.hash)){navigate(M.destination(state));return;}
    let route=current();
    if(!M.canOpen(state,route)){navigate(M.destination(state));return;}
    if(sourceDialog?.open&&state.route!==route)suspendDialog(sourceDialog);
    if(feedbackDialog?.open&&state.transition?.from!==route)suspendDialog(feedbackDialog);
    messenger.beforeRender();
    if(route==='hotel'&&D.parse(location.hash)?.params.get('record')==='churen')M.action(state,'entry-open');
    state.route=route;save();
    document.body.dataset.site=route==='chat'?'chat':route==='forum'?'forum':'sw2';document.body.dataset.sw2Tone=policy().dark?'horror':'quiet';
    document.body.classList.toggle('reduced-motion',reduced());
    updateChrome();story.sync();
    if(route==='chat'){
      chat.mount(host,{room:D.parse(location.hash)?.params.get('room')});
      document.title=t('微信 · 第二个自己预览','Messages · The Second Self prototype');
    }else{
      chat.leave();
      if(!messenger.restoreDOM())host.innerHTML=pages.render(route);
      document.title=t('Stillwater 2.0 · 路线预览','Stillwater 2.0 · Route prototype');
    }
    messenger.afterRender();ads.navigate();updateChrome();void audio.sync();
    if(lastRenderedRoute&&lastRenderedHash!==location.hash&&lastRenderedRoute!=='chat'&&route!=='chat'){window.scrollTo(0,0);host.querySelector('#content')?.focus({preventScroll:true});}
    lastRenderedRoute=route;lastRenderedHash=location.hash;
    showTransition();if(!state.transition)showSource();
  }
  function settings(){
    const dialog=document.querySelector('#case-settings');if(dialog.open)return;
    const p=state.preferences;
    dialog.innerHTML=`<h2>${t('预览设置','Prototype settings')}</h2><p>${t('与原调查存档分开。线上 AI 继续使用聊天窗口里的独立启用选项。','Separate from your original investigation. Online AI still uses the chat window’s own opt-in.')}</p><form id="sw2-settings-form">${[['sound',t('开启声音','Enable sound'),p.sound],['popupAds',t('接收普通弹窗广告','Show ordinary popup ads'),p.popupAds],['reduceMotion',t('减少动态效果','Reduce motion'),p.reduceMotion],['faces',t('显示鬼脸（本阶段尚未加入演出）','Show faces (scenes not yet included)'),!p.skipScares]].map(([id,label,checked])=>`<p><label><input type="checkbox" name="${id}" ${checked?'checked':''}> ${esc(label)}</label></p>`).join('')}<p>${t('广告只在平静的浏览场景弹出。收藏不受关闭推送影响。','Ads appear only during calm browsing. Turning them off keeps your saved ads.')}</p><button type="submit">${t('保存设置','Save settings')}</button> <button type="button" data-sw2-action="close-settings">${t('关闭','Close')}</button></form><hr><button data-sw2-action="restart">${t('重走预览（保留日常聊天）','Restart prototype (keep everyday chats)')}</button>`;
    dialog.querySelector('form').addEventListener('submit',async event=>{
      event.preventDefault();const f=event.currentTarget.elements;
      p.popupAds=f.popupAds.checked;p.reduceMotion=f.reduceMotion.checked;p.skipScares=!f.faces.checked;
      if(f.sound.checked){try{await audio.unlock();p.sound=true;}catch{p.sound=false;}}else p.sound=false;
      save();dialog.close();ads.navigate();document.body.classList.toggle('reduced-motion',reduced());void audio.sync();
    });
    dialog.showModal();audio.pause();
    dialog.addEventListener('close',()=>{void audio.sync();},{once:true});
  }
  async function restart(){
    if(!window.confirm(t('重走 2.0 预览路线？日常聊天、原版进度和广告收藏保留。','Restart the 2.0 prototype? Everyday chats, the original investigation and saved ads will remain.')))return;
    const daily=M.importChat(read(M.CHAT_KEY).value),preferences={...state.preferences,sound:false};
    state=M.fresh();state.preferences=preferences;stateFault=false;chatFault=false;
    try{chat.reset({keepAI:true,initialState:daily});if(!save())return;messenger.reset();location.href=location.pathname+location.search+D.hash('chat');location.reload();}catch{saveFailed=true;storageNotice();}
  }
  document.addEventListener('input',event=>{const id=event.target.dataset.sw2Note;if(id){M.action(state,'draft',{puzzle:id,field:'note',value:event.target.value});save();}if(event.target.id==='chat-input')updateChrome();});
  document.addEventListener('change',event=>{
    if(event.target.name==='stay-reason'){M.action(state,'stay-reason',{id:event.target.value,checked:event.target.checked});save();}
  });
  document.addEventListener('submit',event=>{
    if(event.target.id!=='sw2-stay-form')return;
    event.preventDefault();const result=M.action(state,'check-stay');
    if(!result.ok){const copy={
      'sources':t('还缺少原件。请查看停业报道和这份条目旁的原始提交。','An original is missing. Check the closure report and the submission beside this entry.'),
      'two-reasons':t('请保留两条能由原件支持的理由；当前选择已保留。','Keep two reasons supported by the originals. Your choices have been retained.'),
      'unsupported-reasons':t('当前记录可以证明某个页面在 2026 年这么写，却不能证明 2023 年酒店还在接待客人。姓名或照片清晰度不能作为办理入住的凭据。','This record establishes what a page said in 2026, not that the hotel accepted guests in 2023. A name or photograph quality is not evidence of booking.'),
    };feedback(copy[result.error]||t('核对暂未完成，已保留当前选择。','The review is incomplete. Your choices are retained.'));return;}
    save();story.sync();render();
  });
  document.addEventListener('focusin',event=>{if(event.target.matches('[data-sw2-note]'))ads.navigate();});
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-sw2-action]');
    if(!target){
      if(event.target.closest('[data-chat-photo]')){M.action(state,'friend-context');save();}
      if(event.target.closest('[data-case-action]')){event.preventDefault();settings();}
      const request=event.target.closest('[data-story-action=request]');
      if(request){event.preventDefault();const r=M.action(state,'request',{choice:request.dataset.choice});if(r.ok){save();story.sync();if(state.friendRequest==='accepted'){chat.openRoom('wcr_new');navigate('chat?room=wcr_new');}else navigate(state.route);updateChrome();}}
      return;
    }
    event.preventDefault();const a=target.dataset.sw2Action;
    if(a==='close-source'){sourceDialog?.close();return;}
    if(a==='close-transition'){feedbackDialog?.close();return;}
    if(a==='close-settings'){document.querySelector('#case-settings').close();return;}
    if(a==='restart'){void restart();return;}
    if(a==='open-gg'){chat.openRoom('gg');navigate('chat?room=gg');return;}
    if(a==='old-last'){
      M.action(state,'friend-context');save();[...host.querySelectorAll('.chat-messages [data-chat-message]')].at(-1)?.scrollIntoView({block:'center',behavior:'instant'});return;
    }
    const result=M.action(state,a,{id:a==='ending'?target.dataset.ending:target.dataset.source,puzzle:target.dataset.puzzle});
    if(!result.ok){feedback(result.error==='sources'?t('还有来源没有查看。先打开本幕列表里的原件，关闭后再试。','Some sources have not been viewed. Open the originals in this chapter, then try again.'):t('当前步骤还不能提交，已保存的内容没有丢。','This step is not ready. Your retained work is unchanged.'));return;}
    save();story.sync();
    if(a==='project'||a==='ending')navigate(state.route);
    else if(a==='view'){ads.navigate();showSource();}
    else render();
  });
  window.addEventListener('hashchange',render);window.addEventListener('resize',updateChrome);
  document.querySelector('.skip')?.addEventListener('click',event=>{event.preventDefault();host.querySelector('#content')?.focus();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});window.addEventListener('pagehide',save);
  if(!D.parse(location.hash))history.replaceState(null,'',location.pathname+location.search+D.hash(state.route));
  render();storageNotice();
})();
