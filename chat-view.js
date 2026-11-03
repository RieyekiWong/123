/* Local desktop-messenger opening. No input is sent over the network. */
globalThis.StillwaterChat = {
  create({t,esc,getRoute}) {
    const D=globalThis.StillwaterChatData,M=globalThis.StillwaterChatModel;
    let state=M.fresh(),root=null,lastTick=Date.now(),lastInput=0,lastFlush=0,saveTimer=null,unread=0;
    try {state=M.hydrate(JSON.parse(localStorage.getItem(M.KEY)));} catch {}
    const localized=value=>Array.isArray(value)?t(...value):value;
    const shapes={
      gg:'<rect width="44" height="44" rx="5" fill="#edc276"/><path d="M9 18 9 7 19 15M35 18 35 7 25 15" fill="#d98373"/><ellipse cx="22" cy="25" rx="16" ry="14" fill="#efa9a0"/><ellipse cx="22" cy="29" rx="9" ry="6" fill="#d47a79"/><path d="m13 20 5 1m8 0 5-1M18 29v1m8-1v1" stroke="#563a43" stroke-width="2.6" stroke-linecap="round"/>',
      zhang:'<rect width="44" height="44" rx="5" fill="#bac3ed"/><path d="M8 43q1-17 14-17t14 17" fill="#414b81"/><ellipse cx="22" cy="20" rx="12" ry="13" fill="#f4d8bd"/><path d="M9 18q-1-15 13-15 16 0 13 17l-8-9-7 6-2-5Z" fill="#3d364e"/><path d="m15 21 4-1m6 0 4 1M19 27q3 3 7 0" stroke="#634858" stroke-width="2" fill="none"/>',
      lin:'<rect width="44" height="44" rx="5" fill="#b9cfbc"/><path d="M5 38q4-18 17-21 15-3 15 15v9H5Z" fill="#f0f0d9"/><path d="M17 25q-4-14 6-17 11-3 13 9l6 4-8 3" fill="#d6ded6"/><path d="m18 27-8 9 15-3" fill="#93a9a3"/><circle cx="28" cy="15" r="1.8" fill="#33463e"/><path d="m35 18 7 3-8 2" fill="#b9946d"/>',
      me:'<rect width="44" height="44" rx="5" fill="#b9d6d7"/><path d="M12 20Q5 0 14 3l7 16M24 19Q25-1 33 4l-3 19" fill="#f4f0db"/><ellipse cx="22" cy="29" rx="16" ry="13" fill="#f4f0db"/><path d="M16 27v2m12-2v2m-8 4q2 3 4 0" stroke="#566669" stroke-width="2" fill="none"/><path d="M9 32h5m16 0h5" stroke="#d4a9a4" stroke-width="3"/>',
    };
    const avatar=person=>`<svg class="chat-avatar" viewBox="0 0 44 44" aria-hidden="true" focusable="false">${shapes[person]||shapes.me}</svg>`;
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
      return `<a class="chat-share-card" data-chat-forum href="#forum?topic=job"><strong>${esc(localized(post.title))}</strong><span class="chat-share-summary">${esc(localized(post.paragraphs[0]))}</span><span class="chat-share-meta">${esc(localized(post.user))} · ${esc(post.at)}</span><span class="chat-share-source"><span aria-hidden="true">BBS</span>${t('夜猫论坛','Night Owl BBS')} / NIGHT OWL BBS</span></a>`;
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
        return `<button class="chat-contact ${state.ui.conversation===id?'is-current':''}" data-chat-room="${id}" aria-pressed="${state.ui.conversation===id}">${id==='group'?`<span class="chat-group-avatar" aria-hidden="true">${avatar('gg')}${avatar('zhang')}${avatar('lin')}${avatar('me')}</span>`:avatar(D.sideChats[id].avatar)}<span><strong>${esc(conversationName(id))}</strong><small>${esc(preview)}</small></span></button>`;
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
      if(input){input.style.height='auto';input.style.height=Math.min(112,Math.max(68,input.scrollHeight))+'px';}
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
      if(action==='members')root.querySelector('.chat-members').hidden=!root.querySelector('.chat-members').hidden;
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
        <nav class="chat-rail" aria-label="${t('聊天工具','Chat tools')}">${avatar('me')}<span class="chat-account">R</span><button data-chat-action="list" aria-label="${t('会话列表','Conversations')}" title="${t('会话列表','Conversations')}">▤</button><button data-case-action="instructions" aria-label="${t('游玩说明','How to play')}" title="${t('游玩说明','How to play')}">ⓘ</button><button class="chat-rail-settings" data-case-action="save-settings" aria-label="${t('存档与重置','Saves & reset')}" title="${t('存档与重置','Saves & reset')}">⚙</button></nav>
        <aside class="chat-contact-pane" aria-label="${t('会话列表','Conversations')}"><div class="chat-search"><label class="chat-sr-only" for="chat-search">${t('搜索会话','Search conversations')}</label><input id="chat-search" type="search" placeholder="${t('搜索','Search')}" autocomplete="off"><span aria-hidden="true">⌕</span></div><div class="chat-contact-list"></div><p class="chat-local-label">${t('聊天记录','Chats')}</p></aside>
        <main class="chat-conversation" id="content" tabindex="-1"><header class="chat-heading"><button class="chat-mobile-back" data-chat-action="list" aria-label="${t('返回会话列表','Back to conversations')}">‹</button><h1 id="chat-title">${esc(groupName())}</h1><a data-case-language href="${english?'index-zh.html':'index.html'}${esc(location.search)}#chat">${t('English','简体中文')}</a><button data-chat-action="members" aria-label="${t('群聊信息','Group information')}">···</button></header>
        <aside class="chat-members" hidden><div class="chat-member-list"><h2>${t('群成员','Group members')}（4）</h2>${Object.entries(D.members).map(([id,member])=>`<div>${avatar(id)}<span>${esc(member.name)}</span></div>`).join('')}</div><div class="chat-menu-actions"><button data-chat-action="instructions">${t('游玩说明','How to play')}</button><button data-chat-action="settings">${t('存档与重置','Saves & reset')}</button></div><p>${t('这是本地模拟聊天，不连接微信账号。','A local fictional chat. No messaging account is connected.')}</p></aside>
        <div class="chat-messages" role="log" aria-label="${t('聊天记录','Chat history')}" aria-live="off" tabindex="0"></div><button class="chat-new-messages" data-chat-action="latest" hidden></button><p class="chat-typing" role="status" aria-live="polite"></p>
        <form class="chat-composer"><div class="chat-compose-tools"><button type="button" data-chat-action="emoji" aria-label="${t('表情','Emoji')}">☺</button><button type="button" data-chat-action="history" aria-label="${t('查看较早消息','Earlier messages')}" title="${t('查看较早消息','Earlier messages')}">◷</button><span data-chat-storage>${t('消息仅保存在本机','Messages stay on this device')}</span></div><div class="chat-emoji-panel" hidden>${['🙂','😂','👍','🙃','🍜','☕','👀','晚点看'].map(emoji=>`<button type="button" data-chat-emoji="${emoji==='晚点看'?t('晚点看','Will look later'):emoji}">${emoji==='晚点看'?t('晚点看','Later'):emoji}</button>`).join('')}</div><label class="chat-sr-only" for="chat-input">${t('发送消息','Message')}</label><textarea id="chat-input" maxlength="600" rows="2" spellcheck="false" aria-describedby="chat-send-help"></textarea><div class="chat-send-row"><span id="chat-send-help">${t('Enter 发送，Shift + Enter 换行','Enter to send · Shift + Enter for a new line')}</span><button type="submit">${t('发送','Send')}</button></div></form></main></div>`;
      root.addEventListener('click',click);root.addEventListener('input',input);root.addEventListener('keydown',keydown);root.addEventListener('submit',submit);
      renderConversation();fitViewport();root.querySelector('.chat-messages').addEventListener('scroll',scroll);persist();
      if(focus)root.querySelector('#content').focus({preventScroll:true});
    }
    setInterval(()=>{
      const now=Date.now(),elapsed=Math.max(0,Math.min(2000,now-lastTick));lastTick=now;
      if(!root||getRoute()!=='chat'||document.hidden||document.querySelector('dialog[open]'))return;
      const area=root.querySelector('.chat-messages'),bottom=area.scrollHeight-area.clientHeight-area.scrollTop<64;
      const listHidden=state.ui.list&&matchMedia('(max-width:720px)').matches;
      const changed=M.advance(state,elapsed,{story:state.ui.conversation==='group'&&bottom&&!listHidden&&now-lastInput>3500});
      if(changed) {rememberScroll();renderMessages(true);renderContacts();persist();}
      else if(now-lastFlush>5000)persist();
      const pending=state.pending[0],typing=root.querySelector('.chat-typing');
      typing.textContent=pending&&state.ui.conversation==='group'?t(D.members[D.bank[pending.key].person].name+' 正在输入…',D.members[D.bank[pending.key].person].name+' is typing…'):'';
    },1000);
    document.addEventListener('visibilitychange',()=>{lastTick=Date.now();if(root){rememberScroll();persist();}});
    window.addEventListener('pagehide',()=>{if(root){rememberScroll();persist();}});
    window.addEventListener('resize',fitViewport);
    window.visualViewport?.addEventListener('resize',fitViewport);
    return {mount,leave,reset(){leave();state=M.fresh();try {localStorage.removeItem(M.KEY);}catch {}},hasVisitedForum:()=>state.openedForum};
  },
};
