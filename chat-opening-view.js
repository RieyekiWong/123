/* Read-only life photos and profile; no chat or case progression. */
globalThis.StillwaterChatOpeningView = (() => {
  const O=globalThis.StillwaterChatOpening;
  const localized=(value,t)=>Array.isArray(value)?t(...value):value;
  function photo(key,{t,esc}) {
    const p=O.photos[key];if(!p)return '';
    return `<button type="button" class="chat-memory-photo" data-chat-photo="${esc(key)}" aria-label="${esc(localized(p.title,t))}"><img src="${esc(p.file)}" alt="${esc(localized(p.title,t))}" loading="lazy" width="320" height="240"><span>${esc(p.date)} · ${t('查看照片','Open photo')}</span></button>`;
  }
  function profile(state,{t,esc}) {
    if(!O.active(state)||state.ui.conversation!=='wcr_old')return '';
    return `<div class="chat-friend-profile"><button type="button" data-chat-photo="old">${t('照片与旧事','Photos & memories')}</button><span>${t('最后可靠消息：2023-10-17 18:12','Last reliable message: 2023-10-17 18:12')}</span><details><summary>${t('关于楚人','About Churen')}</summary><p>${esc(localized(O.profile.about,t))}</p><p>${esc(localized(O.profile.family,t))}</p><p>${esc(localized(O.profile.missing,t))}</p></details>${O.profileExtras?.(state,{t,esc})||''}</div>`;
  }
  function visible(state,id) {
    if(O.contactVisible)return O.contactVisible(state,id);
    if(id!=='wcr_old'||!O.active(state))return true;
    return state.ui.visited.wcr_old===true||state.messages.some(m=>m.key==='v12.group.7'||m.key==='v12.group.11')||state.story.opening.discoveryStarted;
  }
  function openPhoto(root,key,{t,esc}) {
    if(!O.photos[key])return;
    root.querySelector('.chat-photo-dialog')?.remove();
    const returnFocus=document.activeElement,dialog=document.createElement('dialog');
    dialog.className='chat-photo-dialog';dialog.setAttribute('aria-labelledby','chat-photo-title');
    function show(id) {
      const p=O.photos[id];
      dialog.innerHTML=`<header><div><p>${t('王楚人 · 旧相册','Wang Churen · Older photos')}</p><h2 id="chat-photo-title">${esc(localized(p.title,t))}</h2></div><button type="button" data-chat-photo-close>${t('关闭','Close')}</button></header><figure><img src="${esc(p.file)}" alt="${esc(localized(p.title,t))}"><figcaption><time>${esc(p.date)}</time><p>${esc(localized(p.caption,t))}</p></figcaption></figure><nav aria-label="${t('其他照片','Other photos')}">${Object.entries(O.photos).map(([name,item])=>`<button type="button" data-chat-photo-select="${esc(name)}" aria-pressed="${name===id}"><img src="${esc(item.file)}" alt=""><span>${esc(localized(item.title,t))}</span></button>`).join('')}</nav>`;
    }
    show(key);root.append(dialog);
    dialog.addEventListener('click',event=>{
      if(event.target.closest('[data-chat-photo-close]'))dialog.close();
      const selected=event.target.closest('[data-chat-photo-select]')?.dataset.chatPhotoSelect;
      if(selected&&O.photos[selected]){show(selected);dialog.querySelector(`[data-chat-photo-select="${selected}"]`)?.focus();}
    });
    dialog.addEventListener('close',()=>{dialog.remove();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
    dialog.showModal();
  }
  function invitation(root,state,{t,esc}) {
    root.querySelector('.chat-opening-invite')?.remove();
    if(!O.active(state)||!state.story.opening.discoveryStarted||state.ui.conversation==='gg'||!state.ui.unread.gg)return;
    const button=document.createElement('button');button.type='button';button.className='chat-opening-invite';button.dataset.chatOpenPrivate='gg';
    const latest=[...state.messages].reverse().find(m=>O.discovery?.includes(m.key));
    const entry=latest&&O.entries[latest.key];
    button.innerHTML=`<strong>GGbond</strong><span>${esc(entry?.kind==='card'?t('发来一个夜猫论坛帖子','Shared a Night Owl post'):entry?localized(entry.text,t):t('发来一条私聊','Sent you a private message'))}</span><small>${t('查看私聊','Open chat')} ›</small>`;
    root.querySelector('.chat-heading')?.after(button);
  }
  return {photo,profile,visible,openPhoto,invitation};
})();
