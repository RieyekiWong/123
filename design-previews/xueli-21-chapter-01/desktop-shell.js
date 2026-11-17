import { CHAPTER_MAIL, announceChapter, chapterVerified } from './chapter-mail.js';
import { ENDING } from './chapter-data.js';
export const CHAT_KEY = 'stillwater-xueli-chat:v1';

export function createWorkspace({ getState, persist, render, rememberScroll, openSource, notify = () => {} }) {
  const host = document.querySelector('#wechat-host');
  const root = document.querySelector('#root');
  const tabs = document.querySelector('#workspace-tabs');
  const t = (zh, en) => getState().lang === 'en' ? en : zh;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const notice = document.createElement('aside'); notice.id = 'chapter-mail-notice'; notice.hidden = true; notice.setAttribute('role', 'status'); notice.setAttribute('aria-live', 'polite'); tabs.after(notice);
  const dismissed = new Set();
  let mounted = false, badge = '', lastLang = '', lastDirectory = null;
  let chatWritable = true;
  try { const raw = localStorage.getItem(CHAT_KEY); if (raw && JSON.parse(raw)?.schema !== 1) chatWritable = false; } catch { chatWritable = false; }
  const story = globalThis.StillwaterStoryData;
  // Read-only compatibility for messages received in older saves. New chapters
  // never call this GG batch again.
  story.batches['xueli.photo-complete'] = { room: 'gg', keys: ENDING.map((line, i) => {
    const key = `xueli.photo-complete.${i}`;
    story.messages[key] = { person: 'gg', room: 'gg', text: [line.zh, line.en] };
    return key;
  }) };
  const chat = globalThis.StillwaterChat.create({ t, esc, storageKey: CHAT_KEY,
    assetBase: '../../', canPersist: () => chatWritable,
    getRoute: () => mounted ? 'chat' : 'computer', isConversationVisible: () => !getState().directory,
    audio: { effect() {} }, onIncoming: () => updateBadge(),
  });
  function completeChapter(id, audible = true) {
    const spec = CHAPTER_MAIL[id], state = getState();
    if (!spec || !chapterVerified(state, id)) return false;
    const first = announceChapter(state, id);
    // A player may solve the sample before accepting the request. Keep the
    // notice, then enqueue the guide's report only after explicit acceptance.
    if (chat.storyState().request === 'accepted') chat.deliverStory(spec.batch);
    if (first) { persist(); if (audible) notify(); }
    updateBadge();
    return first;
  }
  function guideFiles() {
    if (!mounted) return;
    const snapshot = chat.storyState();
    const show = getState().completed && snapshot.conversation === 'wcr_new' && snapshot.delivered.includes(CHAPTER_MAIL['chapter-01'].batch);
    let scan = host.querySelector('[data-sample-file=back]');
    if (!show) { scan?.remove(); return; }
    if (!scan) {
      scan = document.createElement('button'); scan.dataset.sampleFile = 'back'; scan.className = 'sample-files-link';
      host.querySelector('[data-sample-file=note]')?.after(scan);
    }
    scan.textContent = t('？？？的线索 · 合影背面扫描', '？？？’s lead · Photograph back scan');
  }
  function updateBadge() {
    const state = getState(), snapshot = chat.storyState();
    const pending = snapshot.request === 'pending';
    const guideVisible = mounted && state.workspace === 'chat' && !state.directory && snapshot.conversation === 'wcr_new';
    for (const [id, mail] of Object.entries(state.chapterMail || {})) {
      if (!mail.read && guideVisible && chat.unread('wcr_new') === 0 && snapshot.delivered.includes(CHAPTER_MAIL[id]?.batch)) {
        mail.read = true; persist();
      }
    }
    const unreadChapters = Object.entries(state.chapterMail || {}).filter(([, mail]) => !mail.read);
    const count = chat.unread() + (pending ? 1 : 0);
    const value = count ? String(count) : unreadChapters.length ? t('新', 'NEW') : '';
    if (value !== badge) { tabs.querySelector('[data-wechat-unread]').textContent = value; badge = value; }
    tabs.querySelector('[data-workspace=chat]').classList.toggle('has-chapter-mail', unreadChapters.length > 0);
    const reminder = unreadChapters.find(([id]) => !dismissed.has(id));
    notice.hidden = !reminder || state.workspace === 'chat';
    const noticeKey = `${state.lang}:${reminder?.[0]}:${snapshot.request}`;
    if (!notice.hidden && notice.dataset.key !== noticeKey) {
      notice.dataset.key = noticeKey;
      const title = CHAPTER_MAIL[reminder[0]].title[state.lang];
      notice.innerHTML = `<strong>${esc(title)}</strong><p>${snapshot.request === 'accepted' ? t('？？？发来了新的留言。回微信看看。', '？？？ has a new message. Check WeChat.') : t('微信有新的动态。回去查看。', 'There is something new in WeChat.')}</p><button data-open-chapter-mail>${t('查看微信留言 →', 'Read WeChat messages →')}</button> <button data-dismiss-chapter-mail>${t('稍后', 'Later')}</button>`;
    }
    const people = host.querySelector('[data-chat-action="people"]');
    if (people) {
      people.setAttribute('aria-label', t('通讯录', 'Contacts') + (pending ? t(' · 新的朋友 1', ' · 1 new friend') : ''));
      people.title = t('通讯录', 'Contacts');
      people.classList.toggle('has-request', pending);
    }
    const panel = host.querySelector('.friends-directory');
    if (panel && panel.dataset.request !== snapshot.request) directory();
    guideFiles();
  }
  function directory() {
    host.querySelector('.friends-directory')?.remove();
    for (const pane of host.querySelectorAll('.chat-conversation, .chat-contact-pane')) pane.inert = getState().directory;
    if (!getState().directory) return;
    const request = chat.storyState().request;
    const panel = document.createElement('section');
    panel.className = 'friends-directory'; panel.dataset.request = request;
    panel.setAttribute('aria-label', t('通讯录', 'Contacts'));
    panel.innerHTML = `<aside><h2>${t('通讯录', 'Contacts')}</h2><button data-new-friends>${t('新的朋友', 'New friends')} ${request === 'pending' ? '<b class="friend-dot">1</b>' : ''}</button>${request === 'accepted' ? '<button data-mystery-chat>？？？</button>' : ''}</aside><main><h1>${t('新的朋友', 'New friends')}</h1>${request === 'pending' ? `<article class="friend-request"><span class="unknown-avatar">？</span><div><h2>？？？</h2><p>${t('请求添加你为朋友', 'Wants to add you as a friend')}</p></div><button data-accept-friend>${t('接受', 'Accept')}</button></article>` : request === 'accepted' ? `<p>${t('已添加 ？？？', '？？？ added')}</p><button data-mystery-chat>${t('发送消息', 'Open chat')}</button>` : `<p>${t('暂无新的朋友申请', 'No new friend requests')}</p>`}</main>`;
    host.querySelector('.chat-app').append(panel);
  }
  function rememberChat() {
    const input = host.querySelector('#chat-search');
    if (input) getState().chatSearch = input.value;
  }
  function switchTo(workspace) {
    rememberScroll(); rememberChat();
    const state = getState();
    state.workspace = workspace;
    if (workspace === 'computer' && state.app === 'chat') state.app = 'desktop';
    persist(); render();
  }
  function sync() {
    const state = getState(), active = state.workspace === 'chat';
    if (state.chatLayout !== 1) {
      const saved = chat.storyState();
      if (saved.request === 'accepted' && saved.conversation === 'wcr_new' && !'？？？'.includes(state.chatSearch.trim().toLowerCase())) state.chatSearch = '';
      state.chatLayout = 1; persist();
    }
    for (const id of Object.keys(CHAPTER_MAIL)) if (chapterVerified(state, id)) completeChapter(id, false);
    root.hidden = active; host.hidden = !active;
    document.body.dataset.site = active ? 'chat' : 'xueli';
    tabs.querySelectorAll('[data-workspace]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.workspace === state.workspace)));
    tabs.querySelector('[data-workspace="chat"]').firstChild.textContent = t('微信 ', 'WeChat ');
    tabs.querySelector('[data-workspace="computer"]').textContent = t('旧电脑', 'Old computer');
    tabs.setAttribute('aria-label', t('工作区', 'Workspace'));
    tabs.querySelector(':scope > span').textContent = t('雪梨镇 · 本机调查', 'Snowley · Local investigation');
    if (!active && mounted) { rememberChat(); chat.leave(); mounted = false; }
    if (active && (!mounted || lastLang !== state.lang)) {
      if (mounted) { rememberChat(); chat.leave(); }
      chat.mount(host); mounted = true;
      host.querySelector('#chat-search').value = state.chatSearch;
      host.querySelector('#chat-search').dispatchEvent(new Event('input', { bubbles: true }));
      const oldPC = document.createElement('button'); oldPC.dataset.openOldPc = '';
      oldPC.textContent = t('旧电脑 →', 'Old computer →');
      host.querySelector('.chat-heading').append(oldPC);
      const files = document.createElement('button'); files.dataset.sampleFile = 'note'; files.className = 'sample-files-link';
      files.textContent = t('王楚人的文件 · 拍照备忘', 'Churen’s files · Photo notes');
      host.querySelector('.chat-heading').after(files);
      directory(); lastDirectory = state.directory;
    } else if (active && lastDirectory !== state.directory) { directory(); lastDirectory = state.directory; }
    lastLang = state.lang; updateBadge();
  }
  function openMystery(latest = false) {
    const state = getState();
    state.directory = false; state.chatSearch = '';
    const search = host.querySelector('#chat-search');
    if (search) { search.value = ''; search.dispatchEvent(new Event('input', {bubbles:true})); }
    chat.openRoom('wcr_new'); persist(); sync();
    host.querySelector('.chat-contact-list')?.scrollTo({top:0});
    if (latest) host.querySelector('[data-chat-action=latest]')?.click();
    updateBadge();
  }
  function openMessages() {
    switchTo('chat');
    if (chat.storyState().request === 'accepted') openMystery(true);
    else if (chat.storyState().request === 'pending') { getState().directory = true; persist(); sync(); }
  }
  notice.addEventListener('click', event => {
    if (event.target.closest('[data-dismiss-chapter-mail]')) {
      const id = Object.entries(getState().chapterMail || {}).find(([id, mail]) => !mail.read && !dismissed.has(id))?.[0];
      if (id) dismissed.add(id); updateBadge(); return;
    }
    if (event.target.closest('[data-open-chapter-mail]')) openMessages();
  });
  tabs.addEventListener('click', event => { const value = event.target.closest('[data-workspace]')?.dataset.workspace; if (value) switchTo(value); });
  host.addEventListener('input', event => { if (event.target.id === 'chat-search') { rememberChat(); persist(); } });
  host.addEventListener('click', event => {
    const target = event.target.closest('button, a'); if (!target) return;
    const action = target.dataset.chatAction;
    if (action === 'people' || action === 'list') {
      event.preventDefault(); event.stopImmediatePropagation();
      getState().directory = action === 'people'; persist(); sync(); return;
    }
    if (target.hasAttribute('data-new-friends')) return;
    if (target.hasAttribute('data-accept-friend')) {
      event.preventDefault();
      if (chat.storyState().request !== 'pending') return;
      chat.setStoryRequest('accepted'); chat.deliverStory('xueli.accepted');
      openMystery(); return;
    }
    if (target.hasAttribute('data-mystery-chat')) { openMystery(); return; }
    if (target.hasAttribute('data-open-old-pc')) { switchTo('computer'); return; }
    if (target.dataset.sampleFile) { switchTo('computer'); openSource(target.dataset.sampleFile); return; }
    if (target.hasAttribute('data-case-language')) {
      event.preventDefault(); getState().lang = getState().lang === 'zh' ? 'en' : 'zh'; persist(); render(); return;
    }
    if (target.hasAttribute('data-case-action') || ['instructions', 'settings'].includes(action) || target.hasAttribute('data-ad-action')) {
      event.preventDefault(); event.stopImmediatePropagation();
      const dialog = document.createElement('dialog'); dialog.className = 'workspace-help';
      dialog.innerHTML = `<h2>${t('雪梨镇 · 本机记录', 'Snowley · Local record')}</h2><p>${t('通过顶部按钮切换微信与旧电脑。调查笔记在填写时自动保存，提交时才核对。聊天与调查分别保存在当前浏览器；本试玩不清除正式游戏记录。', 'Switch with the tabs above. Notes save while typing and are checked only on submission. Chat and investigation records are stored separately in this browser. Production saves are retained.')}</p><button>${t('关闭', 'Close')}</button>`;
      dialog.querySelector('button').onclick = () => dialog.close(); dialog.onclose = () => dialog.remove(); document.body.append(dialog); dialog.showModal();
    }
  }, true);
  const timer = setInterval(updateBadge, 300);
  window.addEventListener('pagehide', () => { rememberChat(); persist(); clearInterval(timer); });
  return {
    sync,
    completeSample() { return completeChapter('chapter-01'); },
    completeChapter, openMessages,
    // Integration point: only the missing Annie validator may emit this event.
    // No photograph result, draft change, or arbitrary chapter change calls it.
    verifiedMilestone(result) {
      if (result?.id !== 'annie-01' || result?.verified !== true || result?.source !== 'NEWS-018' || chat.storyState().request !== 'accepted') return false;
      chat.deliverStory('xueli.annie-01'); updateBadge(); return true;
    },
    reset() { dismissed.clear(); chatWritable = true; chat.reset(); mounted = false; lastDirectory = null; },
  };
}
