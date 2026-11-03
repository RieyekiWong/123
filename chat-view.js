/* Local desktop-messenger opening. No input is sent over the network. */
globalThis.StillwaterChat = {
  create({t,esc,getRoute}) {
    const D=globalThis.StillwaterChatData,M=globalThis.StillwaterChatModel;
    let state=M.fresh(),root=null,lastTick=Date.now(),lastInput=0,lastFlush=0,saveTimer=null,unread=0;
    try {state=M.hydrate(JSON.parse(localStorage.getItem(M.KEY)));} catch {}
    const localized=value=>Array.isArray(value)?t(...value):value;
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
        if(status)status.textContent=t('消息仅保存在本机','Messages stay on this device');
      } catch {
        const status=root?.querySelector('[data-chat-storage]');
        if(status)status.textContent=t('无法保存聊天记录，当前页面仍可聊天','Chat cannot be saved; you can still chat in this tab');
      }
      lastFlush=Date.now();
    }
    function rememberScroll() {
      const area=root?.querySelector('.chat-messages');
      if(!area)return;
      state.ui.scroll[state.ui.conversation]={top:Math.round(area.scrollTop),bottom:area.scrollHeight-area.clientHeight-area.scrollTop<64};
    }
    function deferSave() {clearTimeout(saveTimer);saveTimer=setTimeout(persist,180);}
    function resolved(message) {
      if(message.kind==='user')return {person:'me',text:[message.text,message.text]};
      return message.kind==='script'?D.script.find(m=>m.id===message.key):D.bank[message.key];
    }
    function shareCard() {
      const post=globalThis.StillwaterForumData.find(p=>p.id==='job');
      return `<a class="chat-share-card" data-chat-forum href="#forum?topic=job"><strong>${esc(localized(post.title))}</strong><span class="chat-share-summary">${esc(localized(post.paragraphs[0]))}</span><span class="chat-share-meta">${esc(localized(post.user))} · ${esc(post.at)}</span><span class="chat-share-source"><span aria-hidden="true">BBS</span>${t('夜猫论坛 / NIGHT OWL BBS','Night Owl BBS')}</span></a>`;
    }
    function messagesFor(id) {
      if(id==='group')return state.messages.filter(m=>m.conversation==='group'||m.kind!=='user');
      return [...D.sideChats[id].messages.map((m,index)=>({id:id+index,kind:'side',entry:m,at:M.base-600000+index*20000})),...state.messages.filter(m=>m.kind==='user'&&m.conversation===id)];
    }
    function messageHTML(message) {
      const entry=message.entry||resolved(message);
      if(!entry)return '';
      const self=entry.person==='me';
      return `<div class="chat-message ${self?'chat-message-self':''}" data-chat-message="${esc(message.id)}">${avatar(entry.person)}<div class="chat-message-content">${self?'':`<span class="chat-speaker">${esc(D.members[entry.person].name)}</span>`}${entry.kind==='card'?shareCard():`<div class="chat-bubble">${esc(localized(entry.text))}</div>`}</div></div>`;
    }
    function renderMessages(newMessages=false) {
      const area=root?.querySelector('.chat-messages');
      if(!area)return;
      const id=state.ui.conversation,scroll=state.ui.scroll[id]||{top:0,bottom:true};
      let stamp='';
      area.innerHTML=messagesFor(id).map(message=>{
        const time=new Date(message.at).toISOString().slice(11,16),divider=time!==stamp?`<p class="chat-time"><time datetime="${new Date(message.at).toISOString()}">${time}</time></p>`:'';
        stamp=time;return divider+messageHTML(message);
      }).join('');
      area.scrollTop=scroll.bottom?area.scrollHeight:scroll.top;
      if(newMessages&&!scroll.bottom)unread++;
      const jump=root.querySelector('[data-chat-action=latest]');
      jump.hidden=!unread||scroll.bottom;
      jump.textContent=t('有新消息 · 回到底部','New messages · Jump to latest');
      if(scroll.bottom)unread=0;
    }
    function renderContacts() {
      const list=root?.querySelector('.chat-contact-list');
      if(!list)return;
      const query=root.querySelector('#chat-search').value.trim().toLowerCase();
      list.innerHTML=['group',...Object.keys(D.sideChats)].filter(id=>conversationName(id).toLowerCase().includes(query)).map(id=>{
        const last=messagesFor(id).at(-1),entry=last?.entry||(last&&resolved(last));
        const preview=entry?.kind==='card'?t('[链接] 夜猫论坛','[Link] Night Owl BBS'):entry?localized(entry.text):'';
        const time=last?new Date(last.at).toISOString().slice(11,16):'';
        return `<button class="chat-contact ${state.ui.conversation===id?'is-current':''}" data-chat-room="${id}" aria-pressed="${state.ui.conversation===id}">${id==='group'?`<span class="chat-group-avatar" aria-hidden="true">${avatar('gg')}${avatar('zhang')}${avatar('lin')}${avatar('me')}</span>`:id==='notes'?`<span class="chat-file-avatar">${icon('folder')}</span>`:avatar(D.sideChats[id].avatar)}<span class="chat-contact-copy"><span class="chat-contact-heading"><strong>${esc(conversationName(id))}</strong><time>${time}</time></span><small>${esc(preview)}</small></span></button>`;
      }).join('')||`<p class="chat-search-empty">${t('没有找到会话','No conversations found')}</p>`;
    }
    function renderConversation() {
      if(!root)return;
      root.querySelector('#chat-title').textContent=conversationName(state.ui.conversation);
      root.querySelector('.chat-app').dataset.chatList=state.ui.list;
      const input=root.querySelector('#chat-input');
      input.value=state.ui.drafts[state.ui.conversation]||'';
      root.querySelector('.chat-member-list').hidden=state.ui.conversation!=='group';
      root.querySelector('.chat-members').hidden=true;
      unread=0;renderContacts();renderMessages();resizeInput();
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
      state.ui.scroll[state.ui.conversation]={top:0,bottom:true};
      lastInput=Date.now();input.value='';renderMessages();renderContacts();resizeInput();persist();input.focus({preventScroll:true});
    }
    function click(event) {
      if(event.target.closest('[data-chat-forum]')) {state.openedForum=true;rememberScroll();persist();return;}
      const room=event.target.closest('[data-chat-room]');
      if(room) {rememberScroll();state.ui.conversation=room.dataset.chatRoom;state.ui.list=false;renderConversation();persist();return;}
      const action=event.target.closest('[data-chat-action]')?.dataset.chatAction;
      if(action==='list') {rememberScroll();state.ui.list=!state.ui.list;root.querySelector('.chat-app').dataset.chatList=state.ui.list;persist();}
      if(action==='members'||action==='people')root.querySelector('.chat-members').hidden=!root.querySelector('.chat-members').hidden;
      if(action==='notes'){rememberScroll();state.ui.conversation='notes';state.ui.list=false;renderConversation();persist();}
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
    function scroll() {rememberScroll();deferSave();}
    function submit(event) {if(event.target.matches('.chat-composer')) {event.preventDefault();send();}}
    function leave() {
      if(!root)return;
      rememberScroll();persist();
      root.removeEventListener('click',click);root.removeEventListener('input',input);root.removeEventListener('keydown',keydown);root.removeEventListener('submit',submit);
      root.querySelector('.chat-messages')?.removeEventListener('scroll',scroll);
      root.style.removeProperty('--chat-view-height');
      root=null;
    }
    function mount(container,{focus=false}={}) {
      if(root===container&&container.querySelector('.chat-app'))return;
      leave();root=container;lastTick=Date.now();
      const english=document.documentElement.lang!=='zh-CN';
      root.innerHTML=`<div class="chat-app" data-chat-list="${state.ui.list}">
        <nav class="chat-rail" aria-label="${t('聊天工具','Chat tools')}"><div class="chat-window-lights" aria-hidden="true"><i></i><i></i><i></i></div><span class="chat-own-avatar" title="Rieyeki">${avatar('me')}</span><button class="chat-rail-current" data-chat-action="list" aria-label="${t('会话列表','Conversations')}" title="${t('会话列表','Conversations')}">${icon('chat')}</button><button data-chat-action="people" aria-label="${t('查看群成员','View group members')}" title="${t('查看群成员','View group members')}">${icon('people')}</button><button data-chat-action="notes" aria-label="${t('已存消息','Saved messages')}" title="${t('已存消息','Saved messages')}">${icon('folder')}</button><button data-case-action="instructions" aria-label="${t('游玩说明','How to play')}" title="${t('游玩说明','How to play')}">${icon('info')}</button><button class="chat-rail-settings" data-case-action="save-settings" aria-label="${t('存档与重置','Saves & reset')}" title="${t('存档与重置','Saves & reset')}">${icon('settings')}</button></nav>
        <aside class="chat-contact-pane" aria-label="${t('会话列表','Conversations')}"><div class="chat-search"><label class="chat-sr-only" for="chat-search">${t('搜索会话','Search conversations')}</label><input id="chat-search" type="search" placeholder="${t('搜索','Search')}" autocomplete="off"><span aria-hidden="true">${icon('search')}</span></div><div class="chat-contact-list"></div><p class="chat-local-label">${t('聊天记录','Chats')}</p></aside>
        <main class="chat-conversation" id="content" tabindex="-1"><header class="chat-heading"><button class="chat-mobile-back" data-chat-action="list" aria-label="${t('返回会话列表','Back to conversations')}">‹</button><h1 id="chat-title">${esc(groupName())}</h1><a data-case-language href="${english?'index-zh.html':'index.html'}${esc(location.search)}#chat">${t('English','简体中文')}</a><button data-chat-action="members" aria-label="${t('群聊信息','Group information')}">···</button></header>
        <aside class="chat-members" hidden><div class="chat-member-list"><h2>${t('群成员','Group members')}（4）</h2>${Object.entries(D.members).map(([id,member])=>`<div>${avatar(id)}<span>${esc(member.name)}</span></div>`).join('')}</div><div class="chat-menu-actions"><button data-chat-action="instructions">${t('游玩说明','How to play')}</button><button data-chat-action="settings">${t('存档与重置','Saves & reset')}</button></div><details class="chat-avatar-credits"><summary>${t('头像来源','Avatar credits')}</summary>${globalThis.StillwaterChatPhotos.map(photo=>`<p>${esc(D.members[photo.id].name)} · <a href="${esc(photo.source)}" target="_blank" rel="noopener noreferrer">${esc(photo.author)}</a> · <a href="${esc(photo.license_url)}" target="_blank" rel="noopener noreferrer">${esc(photo.license)}</a></p>`).join('')}</details><p>${t('这是本地模拟聊天，不连接微信账号。','A local fictional chat. No messaging account is connected.')}</p></aside>
        <div class="chat-messages" role="log" aria-label="${t('聊天记录','Chat history')}" aria-live="off" tabindex="0"></div><button class="chat-new-messages" data-chat-action="latest" hidden></button><p class="chat-typing" role="status" aria-live="polite"></p>
        <form class="chat-composer"><div class="chat-compose-tools"><button type="button" data-chat-action="emoji" aria-label="${t('表情','Emoji')}">${icon('smile')}</button><button type="button" data-chat-action="notes" aria-label="${t('已存消息','Saved messages')}" title="${t('已存消息','Saved messages')}">${icon('folder')}</button><button type="button" data-chat-action="history" aria-label="${t('查看较早消息','Earlier messages')}" title="${t('查看较早消息','Earlier messages')}">${icon('history')}</button><span data-chat-storage>${t('消息仅保存在本机','Messages stay on this device')}</span></div><div class="chat-emoji-panel" hidden>${['🙂','😂','👍','🙃','🍜','☕','👀','晚点看'].map(emoji=>`<button type="button" data-chat-emoji="${emoji==='晚点看'?t('晚点看','Will look later'):emoji}">${emoji==='晚点看'?t('晚点看','Later'):emoji}</button>`).join('')}</div><label class="chat-sr-only" for="chat-input">${t('发送消息','Message')}</label><textarea id="chat-input" maxlength="600" rows="2" spellcheck="false" aria-describedby="chat-send-help"></textarea><div class="chat-send-row"><span id="chat-send-help">${t('Enter 发送，Shift + Enter 换行','Enter to send · Shift + Enter for a new line')}</span><button type="submit">${t('发送','Send')}</button></div></form></main></div>`;
      root.addEventListener('click',click);root.addEventListener('input',input);root.addEventListener('keydown',keydown);root.addEventListener('submit',submit);
      renderConversation();fitViewport();root.querySelector('.chat-messages').addEventListener('scroll',scroll);persist();
      if(focus)root.querySelector('#content').focus({preventScroll:true});
    }
    setInterval(()=>{
      const now=Date.now(),elapsed=Math.max(0,Math.min(2000,now-lastTick));lastTick=now;
      if(!root||getRoute()!=='chat'||document.hidden||document.querySelector('dialog[open]'))return;
      const listHidden=state.ui.list&&matchMedia('(max-width:720px)').matches;
      const changed=M.advance(state,elapsed,{story:state.ui.conversation==='group'&&!listHidden&&now-lastInput>2100});
      if(changed) {rememberScroll();renderMessages(true);renderContacts();persist();}
      else if(now-lastFlush>5000)persist();
      const pending=state.pending[0],typing=root.querySelector('.chat-typing');
      typing.textContent=pending&&state.ui.conversation==='group'?t(D.members[D.bank[pending.key].person].name+' 正在输入…',D.members[D.bank[pending.key].person].name+' is typing…'):'';
    },500);
    document.addEventListener('visibilitychange',()=>{lastTick=Date.now();if(root){rememberScroll();persist();}});
    window.addEventListener('pagehide',()=>{if(root){rememberScroll();persist();}});
    window.addEventListener('resize',fitViewport);
    window.visualViewport?.addEventListener('resize',fitViewport);
    return {mount,leave,reset(){leave();state=M.fresh();try {localStorage.removeItem(M.KEY);}catch {}},hasVisitedForum:()=>state.openedForum};
  },
};
