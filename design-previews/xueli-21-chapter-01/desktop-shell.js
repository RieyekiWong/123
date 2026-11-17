import { ENDING } from './chapter-data.js';
export const CHAT_KEY = 'stillwater-xueli-chat:v1';

export function createWorkspace({ getState, persist, render, rememberScroll, openSource }) {
  const host = document.querySelector('#wechat-host');
  const root = document.querySelector('#root');
  const tabs = document.querySelector('#workspace-tabs');
  const t = (zh, en) => getState().lang === 'en' ? en : zh;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  let mounted = false, badge = '', lastLang = '', lastDirectory = null;
  let chatWritable = true;
  try { const raw = localStorage.getItem(CHAT_KEY); if (raw && JSON.parse(raw)?.schema !== 1) chatWritable = false; } catch { chatWritable = false; }
  const story = globalThis.StillwaterStoryData;
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
  function updateBadge() {
    const pending = chat.storyState().request === 'pending';
    const count = chat.unread() + (pending ? 1 : 0);
    const value = count ? String(count) : '';
    if (value !== badge) { tabs.querySelector('[data-wechat-unread]').textContent = value; badge = value; }
    const people = host.querySelector('[data-chat-action="people"]');
    if (people) {
      people.setAttribute('aria-label', t('通讯录', 'Contacts') + (pending ? t(' · 新的朋友 1', ' · 1 new friend') : ''));
      people.title = t('通讯录', 'Contacts');
      people.classList.toggle('has-request', pending);
    }
    const panel = host.querySelector('.friends-directory');
    if (panel && panel.dataset.request !== chat.storyState().request) directory();
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
    root.hidden = active; host.hidden = !active;
    document.body.dataset.site = active ? 'chat' : 'xueli';
    tabs.querySelectorAll('[data-workspace]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.workspace === state.workspace)));
    tabs.querySelector('[data-workspace="chat"]').firstChild.textContent = t('微信 ', 'WeChat ');
    tabs.querySelector('[data-workspace="computer"]').textContent = t('旧电脑', 'Old computer');
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
      if (state.completed) {
        const scan = document.createElement('button'); scan.dataset.sampleFile = 'back'; scan.className = 'sample-files-link';
        scan.textContent = t('GGbond 的附件 · 合影背面扫描', 'GGbond’s attachment · Photograph back');
        files.after(scan);
      }
      directory(); lastDirectory = state.directory;
    } else if (active && lastDirectory !== state.directory) { directory(); lastDirectory = state.directory; }
    lastLang = state.lang; updateBadge();
  }
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
      getState().directory = false; chat.openRoom('wcr_new'); persist(); sync(); return;
    }
    if (target.hasAttribute('data-mystery-chat')) { getState().directory = false; chat.openRoom('wcr_new'); persist(); sync(); return; }
    if (target.hasAttribute('data-open-old-pc')) { switchTo('computer'); return; }
    if (target.dataset.sampleFile) { switchTo('computer'); openSource(target.dataset.sampleFile); return; }
    if (target.hasAttribute('data-case-language')) {
      event.preventDefault(); getState().lang = getState().lang === 'zh' ? 'en' : 'zh'; persist(); render(); return;
    }
    if (target.hasAttribute('data-case-action') || ['instructions', 'settings'].includes(action) || target.hasAttribute('data-ad-action')) {
      event.preventDefault(); event.stopImmediatePropagation();
      const dialog = document.createElement('dialog'); dialog.className = 'workspace-help';
      dialog.innerHTML = `<h2>${t('雪梨镇 · 本机记录', 'Xueli · Local record')}</h2><p>${t('通过顶部按钮切换微信与旧电脑。调查笔记在填写时自动保存，提交时才核对。聊天与调查分别保存在当前浏览器；本试玩不清除正式游戏记录。', 'Switch with the tabs above. Notes save while typing and are checked only on submission. Chat and investigation records are stored separately in this browser. Production saves are retained.')}</p><button>${t('关闭', 'Close')}</button>`;
      dialog.querySelector('button').onclick = () => dialog.close(); dialog.onclose = () => dialog.remove(); document.body.append(dialog); dialog.showModal();
    }
  }, true);
  const timer = setInterval(updateBadge, 300);
  window.addEventListener('pagehide', () => { rememberChat(); persist(); clearInterval(timer); });
  return {
    sync,
    completeSample() { chat.deliverStory('xueli.photo-complete'); },
    // Integration point: only the missing Annie validator may emit this event.
    // No photograph result, draft change, or arbitrary chapter change calls it.
    verifiedMilestone(result) {
      if (result?.id !== 'annie-01' || result?.verified !== true || result?.source !== 'NEWS-018' || chat.storyState().request !== 'accepted') return false;
      chat.deliverStory('xueli.annie-01'); updateBadge(); return true;
    },
    reset() { chatWritable = true; chat.reset(); mounted = false; lastDirectory = null; },
  };
}
