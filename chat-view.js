/* Desktop messenger: fixed story + opt-in Worker AI + offline fallback. */
globalThis.StillwaterChat = {
  create({t,esc,getRoute,audio,onIncoming=()=>{}}) {
    const D=globalThis.StillwaterChatData,M=globalThis.StillwaterChatModel;
    let state=M.fresh(),root=null,lastTick=Date.now(),lastInput=0,lastFlush=0,saveTimer=null,aiNotice='',connectGeneration=0;
    try {state=M.hydrate(JSON.parse(localStorage.getItem(M.KEY)));} catch {}
    const localized=value=>Array.isArray(value)?t(...value):value;
    const personName=id=>localized((D.people||D.members)[id]?.name||id);
    const transport=globalThis.StillwaterChatTransport.create({onStatus:code=>{aiNotice=code;renderStatus();}});
    const messagesFor=id=>[
      ...M.sideMessages(state,id).map((m,index)=>({id:id+index,kind:'side',entry:m,at:m.at||(D.sideChats[id]?.historyAt||M.base-600000)+index*20000,displayTime:m.displayTime})),
      ...state.messages.filter(m=>M.roomOf(m)===id)
    ];
    const icons={
      chat:'<path d="M21 11a9 8 0 0 1-9 8H8l-5 3 1-6a7 7 0 0 1-1-5 9 8 0 0 1 18 0Z"/>',
      people:'<circle cx="10" cy="8" r="4"/><path d="M3 21v-3c0-4 14-4 14 0v3Zm15-14h5m-5 5h5m-5 5h5"/>',
      folder:'<path d="M3 7V4h7l3 3h8v14H3Zm0 3h18"/>',
      info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v7m0-11v1"/>',
      settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>',
      smile:'<circle cx="12" cy="12" r="9"/><path d="M7 13q5 7 10 0M8 8v1m8-1v1"/>',
      history:'<circle cx="12" cy="12" r="9"/><path d="M12 6v7h5"/>',
      search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    };
    const icon=id=>`<svg class="chat-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${icons[id]||icons.chat}</svg>`;
    const avatar=person=>{const photo=globalThis.StillwaterChatPhotos.find(p=>p.id===person);return `<img class="chat-avatar" src="${esc(photo.file)}" width="44" height="44" alt="" aria-hidden="true" decoding="async">`;};
    const groupName=()=>localized(D.group)+'（4）';
    const conversationName=id=>id==='group'?groupName():localized(D.sideChats[id].name);
    function persist() {
      clearTimeout(saveTimer);
      try {
        localStorage.setItem(M.KEY,JSON.stringify(state));
        const status=root?.querySelector('[data-chat-storage]');
        if(status)status.textContent=transport.eligible()?t('在线 AI 已启用 · 记录保存在本机','Online AI enabled · History saved here'):t('本地聊天 · 记录保存在本机','Local chat · History saved here');
      } catch {
        const status=root?.querySelector('[data-chat-storage]');
        if(status)status.textContent=t('无法保存聊天记录，当前页面仍可聊天','Chat cannot be saved; you can still chat in this tab');return false;
      }
      lastFlush=Date.now();return true;
    }
    function rememberScroll() {
      const area=root?.querySelector('.chat-messages');
      if(!area)return;
      state.ui.scroll[state.ui.conversation]={top:Math.round(area.scrollTop),bottom:area.scrollHeight-area.clientHeight-area.scrollTop<64};
    }
    function deferSave() {clearTimeout(saveTimer);saveTimer=setTimeout(persist,180);}
    function renderStatus() {
      if(!root)return;
      const room=state.ui.conversation,pending=state.pending.find(p=>(p.conversation||'group')===room);
      const person=pending?.messages?.[0]?.person||(pending?.key&&D.bank[pending.key]?.person);
      const typing=root.querySelector('.chat-typing');
      if(typing)typing.textContent=pending&&person?
        pending.remaining>5500?t('消息已送达，对方稍后回复','Delivered · They’ll reply in a bit'):
        (pending.waiting||pending.remaining<2200)?t(personName(person)+' 正在输入…',personName(person)+' is typing…'):'' : '';
      const label=root.querySelector('[data-chat-ai-status]');
      if(!label)return;
      const code=aiNotice||transport.status();
      const notices={
        ai:['在线 AI 聊天','Online AI chat'],
        mock:['接口模拟测试 · 当前回复不是 AI 生成','API simulation · Replies are not AI-generated'],
        local:['本地聊天 · 可在右上角启用 AI','Local chat · Enable AI in the top right'],
        unconfigured:['本地聊天 · 在线 AI 暂未配置','Local chat · Online AI is not configured yet'],
        reconnect:['在线会话已到期，暂用本地回复；可在「AI 聊天」重新连接','Online session expired. Using local replies; reconnect in AI chat.'],
        limited:['在线聊天暂时达到用量限制，已改用本地回复','Online chat has reached its limit. Using local replies.'],
        fallback:['在线聊天暂时连不上，已改用本地回复','Online chat is unavailable. Using local replies.'],
      };
      label.textContent=room==='wcr_old'?globalThis.StillwaterChatOpening?.active(state)?t('旧会话 · 2021—2023 · 时间按原记录显示','Older conversation · 2021–2023 · Original message times'):t('旧会话 · 2023 年留存','Older conversation · Retained in 2023'):room==='wcr_new'?t('新账号 · 剧情对话与本地回复','New account · Authored dialogue and local replies'):t(...(notices[code]||notices.fallback));
    }
    function openAISettings() {
      root.querySelector('.chat-ai-dialog')?.remove();
      const dialog=document.createElement('dialog');dialog.className='chat-ai-dialog';dialog.setAttribute('aria-labelledby','chat-ai-title');
      dialog.innerHTML=`<h2 id="chat-ai-title">${t('AI 聊天','AI chat')}</h2><p>${t('这些联系人都是虚构的 AI 角色，不是真人，也不连接微信账号。','These are fictional AI characters, not real people. No WeChat account is connected.')}</p><p>${t('启用后，当前会话最近最多 20 条消息会通过 Cloudflare 发送给 OpenAI 生成回复。不会发送其他私聊或酒店存档；不要输入真实姓名、联系方式或其他敏感信息。','If enabled, up to 20 recent messages in this conversation are sent through Cloudflare to OpenAI to generate a reply. Other private chats and your hotel save are not sent. Please leave out real names, contact details and other sensitive information.')}</p><p>${t('本网站不保存服务器端聊天记录。OpenAI 请求关闭响应存储；服务商仍可能为安全审查保留内容，通常最长 30 天。你可以随时关闭在线聊天，继续使用本地回复。','This site keeps no server-side chat transcripts. OpenAI response storage is disabled; providers may still retain content for safety review, normally for up to 30 days. You can switch back to local replies at any time.')}</p><p class="chat-ai-dialog-state" role="status">${transport.configured()?transport.eligible()?t('在线聊天已启用。','Online chat is enabled.'):t('默认使用本地回复。只有点击同意后才会连接外部服务。','Local replies are the default. External services are contacted only after you agree.'):t('在线聊天尚未配置，可以先使用本地聊天。','Online chat is not configured yet. Local chat is available.')}</p><div class="chat-verification"></div><div class="chat-ai-dialog-actions"><button data-chat-ai="local">${t('使用本地聊天','Use local chat')}</button><button data-chat-ai="enable" ${!transport.configured()||transport.eligible()?'disabled':''}>${t('同意并启用 AI 聊天','Agree and enable AI chat')}</button><button data-chat-ai="close">${t('返回聊天','Back to chat')}</button></div>`;
      root.append(dialog);dialog.showModal();
      let widget=null;const generation=++connectGeneration;
      const status=dialog.querySelector('.chat-ai-dialog-state');
      const finish=async(token='')=>{
        try {
          const mode=await transport.enable(token);aiNotice=mode==='mock'?'mock':'ai';
          if(generation===connectGeneration&&dialog.open){status.textContent=mode==='mock'?t('已连接本地模拟接口，尚未调用 OpenAI。','Connected to the mock endpoint. No OpenAI request has been made.'):t('已启用，下一条消息将使用在线 AI。','Enabled. Your next message will use online AI.');dialog.querySelector('[data-chat-ai=enable]').disabled=true;}
        }catch{
          if(generation===connectGeneration&&dialog.open){status.textContent=t('暂时无法连接。可以继续本地聊天，稍后再试。','Couldn’t connect. You can keep chatting locally and try later.');dialog.querySelector('[data-chat-ai=enable]').disabled=false;}
        }
        renderStatus();persist();
      };
      dialog.addEventListener('click',async event=>{
        const action=event.target.closest('[data-chat-ai]')?.dataset.chatAi;
        if(action==='close')dialog.close();
        if(action==='local') {transport.disable();for(const pending of state.pending)M.fallback(state,pending.id);aiNotice='local';renderStatus();persist();dialog.close();}
        if(action!=='enable')return;
        event.target.disabled=true;status.textContent=t('正在连接…','Connecting…');
        if(!transport.siteKey()){await finish();return;}
        try {
          // Turnstile is loaded ONLY after this explicit consent click.
          if(!globalThis.turnstile)await new Promise((resolve,reject)=>{
            let script=document.querySelector('[data-chat-turnstile]');
            if(!script){script=document.createElement('script');script.dataset.chatTurnstile='';script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';document.head.append(script);}
            const timer=setTimeout(()=>reject(new Error('timeout')),8000);script.addEventListener('load',()=>{clearTimeout(timer);resolve();},{once:true});script.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('failed'));},{once:true});
          });
          if(generation!==connectGeneration||!dialog.open)return;
          widget=globalThis.turnstile.render(dialog.querySelector('.chat-verification'),{sitekey:transport.siteKey(),action:'stillwater-chat',callback:finish,'error-callback':()=>{status.textContent=t('验证没能完成，可以继续本地聊天。','Verification failed. Local chat is still available.');event.target.disabled=false;}});
        }catch{status.textContent=t('验证服务暂时连不上，可以继续本地聊天。','Verification is unavailable. Local chat still works.');event.target.disabled=false;}
      });
      dialog.addEventListener('close',()=>{connectGeneration++;if(widget!==null)globalThis.turnstile?.remove(widget);dialog.remove();lastTick=Date.now();});
    }
    function resolved(message) {
      if(message.kind==='story'){const e=globalThis.StillwaterChatStory?.entry(message.key);return e&&message.language?{...e,text:e.text[message.language==='en'?1:0]}:e;}
      if(message.kind==='user')return {person:'me',text:[message.text,message.text]};
      if(message.kind==='social')return {person:message.person,text:message.text,image:message.image};
      return message.kind==='script'?D.script.find(m=>m.id===message.key):D.bank[message.key];
    }
    function shareCard() {
      const post=globalThis.StillwaterForumData.find(p=>p.id==='job');
      return `<a class="chat-share-card" data-chat-forum href="#forum?topic=job"><strong>${esc(localized(post.title))}</strong><span class="chat-share-summary">${esc(localized(post.paragraphs[0]))}</span><span class="chat-share-meta">${esc(localized(post.user))} · ${esc(post.at)}</span><span class="chat-share-source"><span aria-hidden="true">BBS</span>${t('夜猫论坛 / NIGHT OWL BBS','Night Owl BBS')}</span></a>`;
    }
    function messageHTML(message) {
      const entry=message.entry||resolved(message);
      if(!entry)return '';
      const self=entry.person==='me';
      return `<div class="chat-message ${self?'chat-message-self':''}" data-chat-message="${esc(message.id)}">${avatar(entry.person)}<div class="chat-message-content">${self?'':`<span class="chat-speaker">${esc(personName(entry.person))}</span>`}${entry.kind==='card'?shareCard():`<div class="chat-bubble">${entry.forwarded?`<span class="chat-forwarded-label">${t('转发自旧群聊','Forwarded from the older group chat')}</span>`:''}${esc(localized(entry.text))}${entry.photo?globalThis.StillwaterChatOpeningView?.photo(entry.photo,{t,esc})||'':''}${entry.contact==='wcr_old'?`<button class="chat-old-conversation-link" type="button" data-chat-room="wcr_old">${t('查看楚人的旧聊天','Open Churen’s older chat')}</button>`:''}${entry.storyImage?`<span class="chat-story-photo"><img src="${esc(entry.storyImage)}" alt="${t('旧湖区照片，2023 年留存','Old Lake photograph retained in 2023')}"><i aria-hidden="true"></i></span>`:''}${entry.image&&globalThis.StillwaterMedia.find(entry.image)?`<img class="chat-shared-photo" src="assets/${esc(globalThis.StillwaterMedia.find(entry.image).file)}" alt="${esc(localized(globalThis.StillwaterMedia.find(entry.image).alt))}" loading="lazy">`:''}</div>`}</div></div>`;
    }
    function renderMessages(newMessages=false) {
      const area=root?.querySelector('.chat-messages');
      if(!area)return;
      const id=state.ui.conversation,scroll=state.ui.scroll[id]||{top:0,bottom:true};
      let stamp='';
      area.innerHTML=messagesFor(id).map(message=>{
        const time=message.displayTime||new Date(message.at).toISOString().slice(message.at<M.base-86400000?0:11,16).replace('T',' '),divider=time!==stamp?`<p class="chat-time"><time datetime="${new Date(message.at).toISOString()}">${esc(time)}</time></p>`:'';
        stamp=time;return divider+messageHTML(message);
      }).join('');
      area.scrollTop=scroll.bottom?area.scrollHeight:scroll.top;
      const unread=state.ui.unread[id]||0;
      const jump=root.querySelector('[data-chat-action=latest]');
      jump.hidden=!unread||scroll.bottom;
      jump.textContent=t('有新消息 · 回到底部','New messages · Jump to latest');
      if(scroll.bottom&&!(state.ui.list&&matchMedia('(max-width:720px)').matches))M.markRead(state,id);
    }
    function renderContacts() {
      const list=root?.querySelector('.chat-contact-list');
      if(!list)return;
      const query=root.querySelector('#chat-search').value.trim().toLowerCase();
      list.innerHTML=globalThis.StillwaterChatPeople.order.filter(id=>id!=='wcr_new'||state.story.request==='accepted').filter(id=>globalThis.StillwaterChatOpeningView?.visible(state,id)!==false).filter(id=>conversationName(id).toLowerCase().includes(query)).map(id=>{
        const last=messagesFor(id).at(-1),entry=last?.entry||(last&&resolved(last));
        const preview=entry?.kind==='card'?t('[链接] 夜猫论坛','[Link] Night Owl BBS'):entry?localized(entry.text):'';
        const time=last?new Date(last.at).toISOString().slice(11,16):'';
        return `<button class="chat-contact ${state.ui.conversation===id?'is-current':''}" data-chat-room="${id}" aria-pressed="${state.ui.conversation===id}">${id==='group'?`<span class="chat-group-avatar" aria-hidden="true">${avatar('gg')}${avatar('zhang')}${avatar('lin')}${avatar('me')}</span>`:id==='notes'?`<span class="chat-file-avatar">${icon('folder')}</span>`:avatar(D.sideChats[id].avatar)}<span class="chat-contact-copy"><span class="chat-contact-heading"><strong>${esc(conversationName(id))}${state.ui.unread[id]?`<span class="chat-unread" aria-label="${t('新消息','Unread')}">${state.ui.unread[id]}</span>`:''}</strong><time>${time}</time></span><small>${esc(preview)}</small></span></button>`;
      }).join('')||`<p class="chat-search-empty">${t('没有找到会话','No conversations found')}</p>`;
      globalThis.StillwaterChatOpeningView?.invitation(root,state,{t,esc});
    }
    function renderConversation() {
      if(!root)return;
      root.querySelector('#chat-title').textContent=conversationName(state.ui.conversation);
      root.querySelector('.chat-app').dataset.chatList=state.ui.list;
      const input=root.querySelector('#chat-input');
      input.value=state.ui.drafts[state.ui.conversation]||'';
      const archived=state.ui.conversation==='wcr_old';input.disabled=archived;root.querySelector('.chat-send-row button').disabled=archived;
      root.querySelector('.chat-story-profile')?.remove();
      const profile=document.createElement('aside');profile.className='chat-story-profile';
      profile.innerHTML=(['pending','ignored'].includes(state.story.request)?`<span>${t('新的朋友：王楚人 · 新账号','New friend: Wang Churen · new account')}</span><small>${t('是我。先别在群里说。','It’s me. Don’t tell the group yet.')}</small><button data-story-action="request" data-choice="accepted">${t('接受','Accept')}</button><button data-story-action="request" data-choice="ignored">${t('暂时忽略','Not now')}</button>`:'')+(archived?`<p>${t('2023 年会话留存。此处不能发送新消息。','Retained 2023 conversation. New messages cannot be sent here.')}</p>`:state.ui.conversation==='wcr_new'?`<p>${t('新账号 · 与旧会话分开保存。','New account · Saved separately from the older conversation.')}</p>`:'');
      root.querySelector('.chat-heading').after(profile);
      profile.insertAdjacentHTML('beforeend',globalThis.StillwaterChatOpeningView?.profile(state,{t,esc})||'');
      root.querySelector('.chat-member-list').hidden=state.ui.conversation!=='group';
      root.querySelector('.chat-members').hidden=true;
      state.ui.visited[state.ui.conversation]=true;renderMessages();renderContacts();resizeInput();renderStatus();
    }
    function resizeInput() {
      const input=root?.querySelector('#chat-input');
      if(input){input.style.height='auto';input.style.height=Math.min(140,Math.max(parseFloat(getComputedStyle(input).minHeight)||68,input.scrollHeight))+'px';}
    }
    function fitViewport() {
      if(!root)return;
      if(matchMedia('(max-width:1000px)').matches)
        root.style.setProperty('--chat-view-height',Math.floor(window.visualViewport?.height||innerHeight)+'px');
      else root.style.removeProperty('--chat-view-height');
      if(state.ui.scroll[state.ui.conversation]?.bottom!==false) {
        const area=root.querySelector('.chat-messages');if(area)area.scrollTop=area.scrollHeight;
      }
    }
    function send() {
      const input=root.querySelector('#chat-input');
      if(!M.send(state,input.value,state.ui.conversation))return;
      transport.cancel(state.ui.conversation);aiNotice='';
      audio.effect('chat-send');
      state.ui.scroll[state.ui.conversation]={top:0,bottom:true};
      lastInput=Date.now();input.value='';renderMessages();renderContacts();resizeInput();persist();input.focus({preventScroll:true});
    }
    function click(event) {
      if(event.target.closest('[data-chat-forum]')) {state.openedForum=true;rememberScroll();persist();return;}
      const photo=event.target.closest('[data-chat-photo]');
      if(photo){globalThis.StillwaterChatOpeningView?.openPhoto(root,photo.dataset.chatPhoto,{t,esc});return;}
      if(event.target.closest('[data-chat-open-private]')){openRoom('gg');return;}
      const room=event.target.closest('[data-chat-room]');
      if(room) {openRoom(room.dataset.chatRoom);return;}
      const action=event.target.closest('[data-chat-action]')?.dataset.chatAction;
      if(action==='list') {rememberScroll();state.ui.list=!state.ui.list;root.querySelector('.chat-app').dataset.chatList=state.ui.list;persist();}
      if(action==='ai')openAISettings();
      if(action==='members'||action==='people')root.querySelector('.chat-members').hidden=!root.querySelector('.chat-members').hidden;
      if(action==='notes')openRoom('notes');
      if(action==='instructions')root.querySelector('[data-case-action=instructions]').click();
      if(action==='settings')root.querySelector('[data-case-action=save-settings]').click();
      if(action==='latest') {state.ui.scroll[state.ui.conversation]={top:0,bottom:true};renderMessages();persist();}
      if(action==='emoji')root.querySelector('.chat-emoji-panel').hidden=!root.querySelector('.chat-emoji-panel').hidden;
      if(event.target.closest('[data-chat-emoji]')) {
        const input=root.querySelector('#chat-input');input.value=(input.value+event.target.closest('[data-chat-emoji]').dataset.chatEmoji).slice(0,D.maxText);
        state.ui.drafts[state.ui.conversation]=input.value;root.querySelector('.chat-emoji-panel').hidden=true;resizeInput();input.focus();deferSave();
      }
      if(action==='history') {const area=root.querySelector('.chat-messages');area.scrollTop=0;rememberScroll();persist();}
    }
    function input(event) {
      if(event.target.id==='chat-search') {renderContacts();return;}
      if(event.target.id==='chat-input') {lastInput=Date.now();state.ui.drafts[state.ui.conversation]=event.target.value.slice(0,D.maxText);resizeInput();deferSave();}
    }
    function keydown(event) {
      if(event.target.id==='chat-input'&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&event.keyCode!==229) {event.preventDefault();send();}
    }
    function scroll() {rememberScroll();if(state.ui.scroll[state.ui.conversation]?.bottom){M.markRead(state,state.ui.conversation);const jump=root?.querySelector('[data-chat-action=latest]');if(jump)jump.hidden=true;renderContacts();}deferSave();}
    function submit(event) {if(event.target.matches('.chat-composer')) {event.preventDefault();send();}}
    function leave() {
      if(!root)return;
      root.querySelector('.chat-photo-dialog')?.close();
      rememberScroll();persist();
      root.removeEventListener('click',click);root.removeEventListener('input',input);root.removeEventListener('keydown',keydown);root.removeEventListener('submit',submit);
      root.querySelector('.chat-messages')?.removeEventListener('scroll',scroll);
      root.style.removeProperty('--chat-view-height');
      root=null;
    }
    function openRoom(room) {
      if(!M.validRoom(room)||(room==='wcr_new'&&state.story.request!=='accepted'))return false;
      rememberScroll();state.ui.conversation=room;state.ui.list=false;
      const parameters=new URLSearchParams(location.hash.split('?')[1]||'');
      if(getRoute()==='chat'&&parameters.has('room')){parameters.set('room',room);history.replaceState(null,'',location.pathname+location.search+'#chat?'+parameters.toString());}
      if(root)renderConversation();persist();return true;
    }
    function notification(message) {
      const entry=resolved(message);return entry?{room:M.roomOf(message),name:personName(entry.person),avatar:avatar(entry.person),text:localized(entry.text)||t('[链接]','[Link]')}:null;
    }
    function mount(container,{focus=false,room=null}={}) {
      if(room&&room!==state.ui.conversation)openRoom(room);
      if(root===container&&container.querySelector('.chat-app'))return;
      leave();root=container;lastTick=Date.now();
      const english=document.documentElement.lang!=='zh-CN';
      root.innerHTML=`<div class="chat-app" data-chat-list="${state.ui.list}">
        <nav class="chat-rail" aria-label="${t('聊天工具','Chat tools')}"><div class="chat-window-lights" aria-hidden="true"><i></i><i></i><i></i></div><span class="chat-own-avatar" title="Rieyeki">${avatar('me')}</span><button class="chat-rail-current" data-chat-action="list" aria-label="${t('会话列表','Conversations')}" title="${t('会话列表','Conversations')}">${icon('chat')}</button><button data-chat-action="people" aria-label="${t('查看群成员','View group members')}" title="${t('查看群成员','View group members')}">${icon('people')}</button><button data-chat-action="notes" aria-label="${t('已存消息','Saved messages')}" title="${t('已存消息','Saved messages')}">${icon('folder')}</button><button data-case-action="instructions" aria-label="${t('游玩说明','How to play')}" title="${t('游玩说明','How to play')}">${icon('info')}</button><button class="chat-rail-settings" data-case-action="save-settings" aria-label="${t('存档与重置','Saves & reset')}" title="${t('存档与重置','Saves & reset')}">${icon('settings')}</button></nav>
        <aside class="chat-contact-pane" aria-label="${t('会话列表','Conversations')}"><div class="chat-search"><label class="chat-sr-only" for="chat-search">${t('搜索会话','Search conversations')}</label><input id="chat-search" type="search" placeholder="${t('搜索','Search')}" autocomplete="off"><span aria-hidden="true">${icon('search')}</span></div><div class="chat-contact-list"></div><p class="chat-local-label">${t('聊天记录','Chats')}</p></aside>
        <main class="chat-conversation" id="content" tabindex="-1"><header class="chat-heading"><button class="chat-mobile-back" data-chat-action="list" aria-label="${t('返回会话列表','Back to conversations')}">‹</button><h1 id="chat-title">${esc(groupName())}</h1><a data-case-language href="${english?'index-zh.html':'index.html'}${esc(location.search)}#chat">${t('English','简体中文')}</a><button class="chat-ai-open" data-chat-action="ai">${t('AI 聊天','AI chat')}</button><button data-chat-action="members" aria-label="${t('群聊信息','Group information')}">···</button></header>
        <aside class="chat-members" hidden><div class="chat-member-list"><h2>${t('群成员','Group members')}（4）</h2>${Object.entries(D.members).map(([id,member])=>`<div>${avatar(id)}<span>${esc(member.name)}</span></div>`).join('')}</div><div class="chat-menu-actions"><button data-chat-action="instructions">${t('游玩说明','How to play')}</button><button data-case-action="settings">${t('声音与设置','Sound & settings')}</button><button data-chat-action="settings">${t('存档与重置','Saves & reset')}</button><button data-ad-action="folder">${t('我的广告夹','My ad folder')}</button></div><details class="chat-avatar-credits"><summary>${t('头像来源','Avatar credits')}</summary>${globalThis.StillwaterChatPhotos.map(photo=>`<p>${esc(personName(photo.id))} · <a href="${esc(photo.source)}" target="_blank" rel="noopener noreferrer">${esc(photo.author)}</a> · <a href="${esc(photo.license_url)}" target="_blank" rel="noopener noreferrer">${esc(photo.license)}</a></p>`).join('')}</details><p>${t('虚构聊天，不连接微信账号。在线 AI 需要另行启用。','Fictional chat, with no messaging account connected. Online AI is optional.')}</p></aside>
        <p class="chat-ai-status" data-chat-ai-status role="status"></p><div class="chat-messages" role="log" aria-label="${t('聊天记录','Chat history')}" aria-live="off" tabindex="0"></div><button class="chat-new-messages" data-chat-action="latest" hidden></button><p class="chat-typing" role="status" aria-live="polite"></p>
        <form class="chat-composer"><div class="chat-compose-tools"><button type="button" data-chat-action="emoji" aria-label="${t('表情','Emoji')}">${icon('smile')}</button><button type="button" data-chat-action="notes" aria-label="${t('已存消息','Saved messages')}" title="${t('已存消息','Saved messages')}">${icon('folder')}</button><button type="button" data-chat-action="history" aria-label="${t('查看较早消息','Earlier messages')}" title="${t('查看较早消息','Earlier messages')}">${icon('history')}</button><span data-chat-storage>${t('消息仅保存在本机','Messages stay on this device')}</span></div><div class="chat-emoji-panel" hidden>${['🙂','😂','👍','🙃','🍜','☕','👀','晚点看'].map(emoji=>`<button type="button" data-chat-emoji="${emoji==='晚点看'?t('晚点看','Will look later'):emoji}">${emoji==='晚点看'?t('晚点看','Later'):emoji}</button>`).join('')}</div><label class="chat-sr-only" for="chat-input">${t('发送消息','Message')}</label><textarea id="chat-input" maxlength="${D.maxText}" rows="2" spellcheck="false" aria-describedby="chat-send-help"></textarea><div class="chat-send-row"><span id="chat-send-help">${t('Enter 发送，Shift + Enter 换行','Enter to send · Shift + Enter for a new line')}</span><button type="submit">${t('发送','Send')}</button></div></form></main></div>`;
      root.addEventListener('click',click);root.addEventListener('input',input);root.addEventListener('keydown',keydown);root.addEventListener('submit',submit);
      renderConversation();fitViewport();root.querySelector('.chat-messages').addEventListener('scroll',scroll);persist();
      if(focus)root.querySelector('#content').focus({preventScroll:true});
    }
    setInterval(()=>{
      const now=Date.now(),elapsed=Math.max(0,Math.min(2000,now-lastTick));lastTick=now;
      if(document.hidden||document.querySelector('dialog[open]'))return;
      const active=!!root&&getRoute()==='chat';
      for(const pending of state.pending) {
        if(pending.kind!=='social'||pending.started||pending.debounce>elapsed)continue;
        pending.started=true;
        if(!transport.eligible()||!active)continue;
        pending.waiting=true;
        const id=pending.id,payload=M.request(state,pending);
        transport.request(payload,{isCurrent:()=>state.pending.some(p=>p.id===id)}).then(value=>{
          if(transport.enabled())M.accept(state,id,value);else M.fallback(state,id);persist();renderStatus();
        }).catch(error=>{
          M.fallback(state,id);
          if(error.message!=='cancelled')aiNotice=error.message==='limited'?'limited':error.message==='reconnect'?'reconnect':'fallback';
          persist();renderStatus();
        });
      }
      const listHidden=active&&state.ui.list&&matchMedia('(max-width:720px)').matches;
      const before=new Set(state.messages.map(m=>m.id));
      const changed=M.advance(state,elapsed,{story:active&&!listHidden&&(state.ui.conversation!=='group'||now-lastInput>2100),chatActive:active,proactive:active});
      if(changed) {
        const incoming=state.messages.filter(m=>!before.has(m.id)&&m.kind!=='user');
        if(active) {
          if(incoming.length)audio.effect('chat-receive');
          if(incoming.some(m=>M.roomOf(m)===state.ui.conversation)){rememberScroll();renderMessages(true);}
          renderContacts();
        }
        persist();
        if(incoming.length)onIncoming(incoming.map(notification).filter(Boolean));
      }else if(active&&now-lastFlush>5000)persist();
      if(active)renderStatus();
    },250);
    document.addEventListener('visibilitychange',()=>{lastTick=Date.now();if(root){rememberScroll();persist();}});
    window.addEventListener('pagehide',()=>{if(root){rememberScroll();persist();}});
    window.addEventListener('resize',fitViewport);
    window.visualViewport?.addEventListener('resize',fitViewport);
    return {mount,leave,openRoom,storyState:()=>({shared:state.shared,request:state.story.request,oldVisited:state.ui.visited.wcr_old===true,openingEdition:state.story.opening?.edition||'legacy'}),setStoryRequest(value){if(state.story.request!==value){state.story.request=value;persist();if(root)renderConversation();}},deliverStory(id){const incoming=M.deliver(state,id);const saved=persist();if(incoming.length){if(root){rememberScroll();renderMessages(true);renderContacts();audio.effect('chat-receive');}onIncoming(incoming.slice(-1).map(notification).filter(Boolean));}return saved;},contact:room=>({name:personName(room),avatar:avatar(room)}),unread:()=>Object.values(state.ui.unread).reduce((a,b)=>a+b,0),checkIn(room,options){const message=M.checkIn(state,room,document.documentElement.lang==='zh-CN'?'zh':'en',options);if(!message)return null;persist();return notification(message);},reset(){leave();transport.reset();state=M.fresh();try {localStorage.removeItem(M.KEY);}catch {}},hasVisitedForum:()=>state.openedForum};
  },
};
