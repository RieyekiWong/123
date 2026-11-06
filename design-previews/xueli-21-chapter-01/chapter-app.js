import { ASSETS, OPENING, ENDING, BY_ID, HINTS } from './chapter-data.js';
import { SAVE_KEY, fresh, hydrate, unlockedApps, openDocument, search, submit, objective, FEEDBACK } from './chapter-model.js';

const root = document.querySelector('#root');
const announcement = document.querySelector('#announcement');
const t = (zh, en) => state.lang === 'en' ? en : zh;
const local = value => value?.[state.lang] ?? '';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let state = fresh();
let errors = [];
let storageWarning = '';
let saveBlocked = false;
try {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.schema !== 1) throw new Error('Unsupported sample save');
    state = hydrate(parsed);
  }
} catch {
  saveBlocked = true;
  storageWarning = 'restore';
}

function persist() {
  if (saveBlocked) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
  catch { storageWarning = 'write'; saveBlocked = true; }
}
function rememberScroll() {
  const pane = root.querySelector('.window-content');
  if (pane && state.doc && ['browser', 'files'].includes(state.app)) state.scroll[state.doc] = pane.scrollTop;
}
function announce(message) { announcement.textContent = message; }
function art(id, sizeClass = '') {
  const [cols, rows] = ASSETS[id]?.tiles || [1, 1];
  return `<span class="art art-${cols}x${rows} ${sizeClass}" data-asset="${escape(id)}" role="img" aria-label="${escape(t('需要画：', 'To draw: ') + local(ASSETS[id]))}"><strong>需要画</strong><small>${64 * cols} × ${64 * rows}</small></span>`;
}
const APP_NAMES = { chat: ['微信', 'WeChat'], files: ['文件', 'Files'], browser: ['浏览器', 'Browser'], casebook: ['调查笔记', 'Casebook'] };
const appName = app => APP_NAMES[app]?.[state.lang === 'en' ? 1 : 0] ?? '';
const sourceName = doc => local(doc.origin);

function chatLine(message, index, ending = false) {
  return `<div class="chat-line">${index === 0 ? art('avatar-gg') : '<span class="art-spacer" aria-hidden="true"></span>'}<div>${index === 0 ? '<p class="chat-sender">GGbond</p>' : ''}<div class="chat-bubble"><p>${escape(local(message))}</p></div></div></div>`;
}
function chatView() {
  return `<div class="chat-layout"><aside class="chat-sidebar"><div class="contact">${art('avatar-gg')}<div><p>GGbond</p><small>${t('私聊 · 旧电脑这件事', 'Private chat · The old PC')}</small></div></div><p>${t('这段样本只展示固定剧情。原游戏的联系人和 AI 聊天保持原样。', 'This sample contains scripted story messages. The original contacts and AI chat remain unchanged.')}</p></aside><section class="chat-main" aria-label="${t('GGbond 的消息', 'Messages from GGbond')}"><p class="chat-date">2026 / 11 / 06 · ${t('今天', 'Today')}</p>${OPENING.map((message, index) => chatLine(message, index)).join('')}<button class="attachment" data-open="note">${t('附件 · 拍照备忘.txt', 'Attachment · photo-notes.txt')}<small>${t('W.C. / 2023.10.15 · 点击阅读', 'W.C. / 2023.10.15 · Open to read')}</small></button>${state.completed ? `<div class="complete-note">${t('笔记已保存。只确认约见计划，是否到店仍待调查。', 'Note saved. A meeting was planned; the visit is still unconfirmed.')}</div>${ENDING.map((message, index) => chatLine(message, index, true)).join('')}<button class="attachment" data-open="back">${t('新附件 · 合影背面', 'New attachment · Back of the photograph')}<small>${t('来自外接盘 · 打开扫描与转录', 'From the external drive · View scan and transcript')}</small></button>` : ''}<p class="chat-foot">${state.completed ? t('这一小章到这里。可以打开新附件，也可以回头重读资料。后面的故事尚未在样本中展开。', 'This is the end of the sample chapter. Open the new attachment or revisit the sources. The next chapter is not implemented here.') : t('先看看附件。切换程序不会丢掉正在读的文章。', 'Start with the attachment. Switching apps keeps your place in an article.')}</p></section></div>`;
}
function filesView() {
  if (state.doc && BY_ID[state.doc]?.kind === 'file') return readerView(BY_ID[state.doc]);
  const available = ['note', 'diary', ...(state.read.includes('reply') ? ['reply'] : []), ...(state.completed ? ['back'] : [])];
  return `<header class="files-header"><h1>${t('待整理', 'To sort')}</h1><p>${t('硬盘后来换过。文件年份是内容的日期，不是这台电脑的出厂年份。', 'The drive was replaced later. File dates describe the contents, not the year this computer was made.')}</p></header><div class="file-list">${available.map(id => `<div class="file-row"><div><h2>${escape(local(BY_ID[id].title))}</h2><p>${escape(BY_ID[id].date)} · ${escape(local(BY_ID[id].author))}${state.read.includes(id) ? ' · ' + t('已读', 'Read') : ''}</p></div><button data-open="${id}">${t('打开', 'Open')}</button></div>`).join('')}</div>`;
}
function searchToolbar() {
  return `<div class="browser-toolbar"><form id="search-form" class="search-form" role="search"><label class="sr-only" for="query">${t('检索词', 'Search terms')}</label><input id="query" name="query" type="search" value="${escape(state.query)}" placeholder="${t('输入人名、店名或文章里的词…', 'A name, a shop, a phrase from an article…')}" maxlength="120" autocomplete="off"><button type="submit">${t('检索', 'Search')}</button></form><p class="search-note">${t('网页缓存 + 本机文件索引 · 不连接真实互联网', 'Cached web pages + local file index · No live internet connection')}</p></div>`;
}
function searchHome() {
  return `<section class="search-home"><p class="pixel">XUELI / LOCAL INDEX</p><h1>${t('从文章里的一个名字开始。', 'Start with a name in an article.')}</h1><p>${t('这里收录了旧网页，也能按文件名与发件人查找本机邮件。搜索不会替你把词填进笔记。', 'This index holds old web pages and can find local mail by filename or sender. Searching does not fill in your notebook.')}</p><button class="text-button" data-open="weekly">${t('打开楚人留下的书签', 'Open Churen’s bookmark')}</button><p class="search-rule">${t('还没想到要搜什么，可以先回文章看看。人名、店名都可以试；不必照抄标点。', 'Not sure what to search? Revisit the article. Names and shop names work; punctuation does not need to match.')}</p></section>`;
}
function resultsView() {
  const results = search(state, state.query);
  return `<section class="search-results"><p class="article-kicker">LOCAL INDEX</p><h1>${t('检索：', 'Search: ')}${escape(state.query)}</h1><p class="muted">${results.length} ${t('份资料', 'sources')}</p>${state.searches.length > 1 ? `<div class="search-history">${state.searches.slice(-4).filter(q => q !== state.query).map(q => `<button class="text-button" data-search="${escape(q)}">${escape(q)}</button>`).join('')}</div>` : ''}${results.length ? results.map(doc => `<article class="search-result"><p class="result-meta">${escape(sourceName(doc))} · ${escape(doc.date)}${state.read.includes(doc.id) ? ' · ' + t('已读', 'Read') : ''}</p><h2><button class="text-button" data-open="${doc.id}">${escape(local(doc.title))}</button></h2><p>${escape(doc.kind === 'mail' ? t('本机邮件。按发件人与文件名找到这份留存副本。', 'Local mail. Found through the sender and filename index.') : (local(doc.deck) || local(doc.paragraphs)[0]).slice(0, state.lang === 'en' ? 180 : 80))}${doc.kind === 'mail' ? '' : '…'}</p><p class="result-meta">${escape(doc.file)}</p></article>`).join('') : `<p class="empty-result">${t('没有找到。试试文章里的另一种叫法，或先只搜名字、店名的一部分。输入不会被清空。', 'No matches. Try another name used in the article, or part of a person’s or shop’s name. Your query is kept.')}</p>`}</section>`;
}
function readerView(doc) {
  const isWeekly = doc.kind === 'weekly';
  return `<nav class="browser-nav" aria-label="${t('阅读工具', 'Reading tools')}"><button class="text-button" data-action="back-to-index">${state.app === 'files' ? t('← 文件夹', '← Files') : t('← 返回检索', '← Search')}</button><div class="reading-controls"><span>${t('字号', 'Text')}</span><button data-size="-2" aria-label="${t('缩小正文', 'Smaller text')}" ${state.readerSize === 18 ? 'disabled' : ''}>A−</button><button data-size="2" aria-label="${t('放大正文', 'Larger text')}" ${state.readerSize === 24 ? 'disabled' : ''}>A+</button></div></nav><article class="reader" data-document="${doc.id}">${isWeekly ? `<div class="masthead"><strong>${t('雪梨镇周刊', 'Xueli Weekly')}</strong><small>${t('周末慢一点，镇上也一样。', 'A little time for the town.')}<br>${escape(doc.date)}</small></div>` : ''}<header class="article-header"><p class="article-kicker">${escape(sourceName(doc))}</p><div class="article-heading">${doc.figure ? art(doc.figure) : ''}<div><h1 tabindex="-1">${escape(local(doc.title))}</h1>${doc.deck ? `<p class="deck">${escape(local(doc.deck))}</p>` : ''}<p class="byline">${escape(local(doc.author))} · ${escape(doc.date)}</p></div></div>${doc.caption ? `<p class="article-caption">${escape(local(doc.caption))}</p>` : ''}</header><div class="article-body">${local(doc.paragraphs).map(p => `<p>${escape(p)}</p>`).join('')}</div><footer class="article-end"><p>${escape(doc.file)} · ${t('原文留存，不自动提取结论。', 'Source retained. Conclusions are yours to make.')}</p>${doc.link ? `<button class="primary" data-open="${doc.link}">${escape(local(doc.linkLabel))} →</button>` : ''}${doc.id === 'weekly' ? `<div class="related-reading"><p>${t('同一份周刊里，也有人只关心一张长椅。', 'Elsewhere in the weekly: a reader has a bench to defend.')}</p><button class="text-button" data-open="letter">${escape(local(BY_ID.letter.title))}</button></div>` : ''}${doc.id === 'back' ? `<div class="complete-note">${t('样本结束 · 下一章将从这个名字开始。本次没有继续制作酒店、位体教或后期关卡。', 'Sample complete. The next chapter begins with this name. The hotel, Phase Self and later chapters have not been rebuilt here.')}</div>` : ''}</footer></article>`;
}
function savedReadings() {
  const read = state.read.filter(id => id !== 'back' || state.completed);
  if (!read.length) return '';
  return `<details class="saved-readings"><summary>${t('读过的资料', 'Reading history')} · ${read.length}</summary><ul>${read.map(id => `<li><button class="text-button" data-open="${id}">${escape(local(BY_ID[id].title))}</button></li>`).join('')}</ul></details>`;
}
function browserView() {
  return `${searchToolbar()}${state.doc ? readerView(BY_ID[state.doc]) : state.searchShown ? resultsView() : searchHome()}${savedReadings()}`;
}
function casebookView() {
  const fieldError = field => errors.some(error => error.field === field);
  return `<section class="casebook"><p class="chapter-no pixel">NOTE 01 / A PHOTOGRAPH</p><h1 tabindex="-1">${t('楚人当时打算去找谁、看什么？', 'Who did Churen plan to meet, and what was he looking for?')}</h1><p class="tutorial">${t('把查到的信息写下来就好。简称、英文和不带标点的写法都可以，不用勾选文章。', 'Write what you found. Short names, English and different punctuation are fine. No source checkboxes needed.')}</p><span class="plan-tag">${t('这页只核对计划，不代表人已经到场。', 'This page checks a plan, not proof of arrival.')}</span><form id="case-form" novalidate><div class="answer-fields"><div><label for="person">${t('他打算找的人', 'The person he planned to meet')}</label><input id="person" name="person" value="${escape(state.draft.person)}" maxlength="160" aria-invalid="${fieldError('person')}" ${fieldError('person') ? 'aria-describedby="feedback"' : ''} autocomplete="off"></div><div><label for="place">${t('约在哪里', 'Where they arranged to meet')}</label><input id="place" name="place" value="${escape(state.draft.place)}" maxlength="160" aria-invalid="${fieldError('place')}" ${fieldError('place') ? 'aria-describedby="feedback"' : ''} autocomplete="off"></div><div class="wide"><label for="purpose">${t('他想看什么', 'What he wanted to see')}</label><textarea id="purpose" name="purpose" maxlength="500" aria-invalid="${fieldError('purpose')}" ${fieldError('purpose') ? 'aria-describedby="feedback"' : ''}>${escape(state.draft.purpose)}</textarea></div></div><div class="submit-row"><button class="primary" type="submit">${state.completed ? t('重新核对', 'Check again') : t('核对并告诉 GGbond', 'Check and tell GGbond')}</button><p>${t('核对后会把这条计划告诉 GGbond。没对上的地方可以接着查，不会清空输入。', 'Once checked, this plan is shared with GGbond. A mismatch keeps your writing so you can investigate further.')}</p></div>${errors.length ? `<div id="feedback" class="feedback" role="alert"><ul>${[...new Set(errors.map(e => e.code))].map(code => `<li>${escape(FEEDBACK[code][state.lang === 'en' ? 1 : 0])}</li>`).join('')}</ul></div>` : ''}</form>${state.completed ? `<div class="complete-note">${t('已确认约见计划。GGbond 发来的新附件保存在微信里。', 'The meeting plan is verified. GGbond’s new attachment is in WeChat.')} <button class="text-button" data-app="chat">${t('查看消息', 'Read messages')}</button></div>` : ''}<div class="help-area"><button class="text-button" data-action="hint">${state.hint ? state.hint < 3 ? t('再给一点提示', 'Another hint') : t('已展开全部提示', 'All hints shown') : t('卡住了？查看提示', 'Stuck? Show a hint')}${state.hint ? ` · ${state.hint}/3` : ''}</button>${local(HINTS).slice(0, state.hint).map((hint, i) => `<p>${i + 1}. ${escape(hint)}</p>`).join('')}</div><div class="bottom-links"><button class="text-button" data-app="browser">${t('← 回资料里继续看', '← Back to the sources')}</button><span>${t('本页自动保存', 'This page saves automatically')}</span></div></section>`;
}
function render({ focus = false, restore = true } = {}) {
  const unlocked = unlockedApps(state);
  const names = { chat: chatView, files: filesView, browser: browserView, casebook: casebookView };
  document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-Hans';
  document.body.className = state.lang === 'en' ? 'en' : '';
  document.title = t('一张合影的背面 · 雪梨镇 2.1 样本', 'The back of a photograph · Xueli 2.1 sample');
  root.innerHTML = `<header class="sample-strip"><p>${t('STILLWATER 2.1 · 独立章节样本', 'STILLWATER 2.1 · CHAPTER SAMPLE')}<span class="sample-detail"> · ${t('正式游戏未改，插图等待绘制', 'Production unchanged. Illustrations pending.')}</span></p><div><button data-action="language">${t('English', '中文')}</button></div></header>${storageWarning ? `<div class="storage-warning" role="status">${storageWarning === 'restore' ? t('样本存档暂时无法读取，原始内容已保留。现在可以临时试玩；如需重新保存，请用底部的“重开样本”确认。正式游戏存档未动。', 'The sample save could not be read and has been kept intact. You can play without saving, or confirm “Restart sample” to start a new sample save. Production saves are untouched.') : t('浏览器未能保存这个样本。可以继续试玩，但刷新后可能回到之前的进度。', 'The browser could not save this sample. You can continue, but a refresh may return to earlier progress.')}</div>` : ''}<div class="desktop"><header class="desk-header"><div><p class="desk-brand pixel">XUELI / 2008</p><p class="desk-sub">${t('一张合影的背面 · 旧电脑里的第一段调查', 'The back of a photograph · The first lead on an old PC')}</p></div><p class="objective"><small>${t('正在想的事', 'THE QUESTION')}</small>${escape(objective(state)[state.lang === 'en' ? 1 : 0])}</p></header><div class="desktop-layout"><nav class="desktop-icons" aria-label="${t('已发现的程序', 'Available apps')}">${unlocked.map(app => `<button class="desktop-icon" data-app="${app}" aria-label="${escape(t('打开', 'Open ') + appName(app))}">${art(`app-${app}`)}<span class="icon-label">${escape(appName(app))}</span></button>`).join('')}</nav>${state.app === 'desktop' ? `<main class="desktop-rest">${art('prop-pc')}<h1>${t('机器很旧，里面的日子倒不只一年。', 'An old machine, with more than one year inside it.')}</h1><p>${t('打开左边的程序。刚才读到哪里、写了什么，都还在。', 'Open an app on the left. Your reading position and writing are still there.')}</p></main>` : `<main class="window"><header class="window-title" data-app="${state.app}"><p>${appName(state.app)} / ${state.app === 'chat' ? 'GGbond' : state.app === 'browser' ? 'LOCAL INDEX' : state.app === 'files' ? 'W.C. / NOTES' : 'WANG CHUREN'}</p><div class="title-controls"><button data-action="minimize" aria-label="${t('最小化窗口', 'Minimize window')}">—</button></div></header><div class="window-content" tabindex="-1">${names[state.app]?.() || chatView()}</div><footer class="window-status"><span>${t('只保存到本机 · 无在线请求', 'Saved on this device · No online requests')}</span><span class="secondary-status">${t('每份原文都可以回看', 'All sources can be revisited')}</span></footer></main>`}</div></div><nav class="taskbar" aria-label="${t('程序切换', 'Switch apps')}"><span class="task-label pixel">X /</span>${unlocked.map(app => `<button data-app="${app}" aria-pressed="${state.app === app}">${escape(appName(app))}</button>`).join('')}<span class="clock">${t('周五 16:08', 'FRI 16:08')}</span><button class="text-button" data-action="reset">${t('重开样本', 'Restart sample')}</button></nav><dialog class="reset-dialog"><h2>${t('从这段调查的开头重来？', 'Restart this sample?')}</h2><p>${t('只清除本章节的试玩进度，不会清除正式游戏或微信聊天记录。', 'This clears only the sample chapter. It does not clear the game or its WeChat history.')}</p><button data-action="cancel-reset">${t('继续当前调查', 'Keep investigating')}</button><button class="primary" data-action="confirm-reset">${t('重开这个样本', 'Restart this sample')}</button></dialog>`;
  const reader = root.querySelector('.reader');
  if (reader) reader.style.setProperty('--reading-size', `${state.readerSize}px`);
  const pane = root.querySelector('.window-content');
  if (pane && state.doc && restore) pane.scrollTop = state.scroll[state.doc] || 0;
  if (focus) {
    const target = pane?.querySelector('h1') || pane;
    target?.focus({ preventScroll: true });
  }
}
function switchApp(app) {
  if (!unlockedApps(state).includes(app)) return;
  rememberScroll();
  state.app = app;
  persist(); render({ focus: true });
}
function goDocument(id) {
  rememberScroll();
  state = openDocument(state, id);
  persist(); render({ focus: true });
  announce(t('已打开：', 'Opened: ') + local(BY_ID[id]?.title));
}
function doSearch(query) {
  rememberScroll();
  state.query = String(query).trim().slice(0, 120);
  state.searches = [...state.searches.filter(s => s !== state.query), state.query].filter(Boolean).slice(-20);
  state.searchShown = true; state.doc = null; state.app = 'browser';
  persist(); render({ focus: true, restore: false });
  announce(`${search(state, state.query).length} ${t('份检索结果', 'search results')}`);
}

root.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  if (button.dataset.app) return switchApp(button.dataset.app);
  if (button.dataset.open) return goDocument(button.dataset.open);
  if (button.dataset.search !== undefined) return doSearch(button.dataset.search);
  if (button.dataset.size) {
    rememberScroll(); state.readerSize = Math.max(18, Math.min(24, state.readerSize + Number(button.dataset.size)));
    persist(); render(); root.querySelector(`[data-size="${button.dataset.size}"]`)?.focus({ preventScroll: true }); return;
  }
  const action = button.dataset.action;
  if (action === 'language') { rememberScroll(); state.lang = state.lang === 'zh' ? 'en' : 'zh'; persist(); render(); }
  if (action === 'minimize') { rememberScroll(); state.app = 'desktop'; persist(); render(); }
  if (action === 'back-to-index') { rememberScroll(); state.doc = null; persist(); render({ focus: true, restore: false }); }
  if (action === 'hint' && state.hint < 3) {
    const scroll = root.querySelector('.window-content')?.scrollTop || 0;
    state.hint++; persist(); render();
    root.querySelector('.window-content').scrollTop = scroll;
    root.querySelector('.help-area p:last-child')?.scrollIntoView({ block: 'nearest' });
    root.querySelector('[data-action="hint"]')?.focus({ preventScroll: true });
  }
  if (action === 'reset') root.querySelector('dialog').showModal();
  if (action === 'cancel-reset') root.querySelector('dialog').close();
  if (action === 'confirm-reset') {
    const lang = state.lang;
    try { localStorage.removeItem(SAVE_KEY); saveBlocked = false; storageWarning = ''; }
    catch { saveBlocked = true; storageWarning = 'write'; }
    state = fresh(); state.lang = lang; errors = []; persist(); render();
  }
});
root.addEventListener('input', event => {
  const input = event.target;
  if (input.form?.id === 'case-form' && ['person', 'place', 'purpose'].includes(input.name)) {
    state.draft[input.name] = input.value.slice(0, input.maxLength);
    persist();
  }
  if (input.name === 'query') { state.query = input.value.slice(0, 120); persist(); }
});
root.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.id === 'search-form') return doSearch(new FormData(event.target).get('query'));
  if (event.target.id !== 'case-form') return;
  const result = submit(state);
  errors = result.errors;
  if (result.ok) {
    state = result.state; persist(); render({ focus: true, restore: false });
    root.querySelector('.complete-note')?.scrollIntoView({ block: 'start' });
    announce(t('线索已核对。GGbond 发来了新消息。', 'Lead checked. New messages from GGbond.'));
  } else {
    const scroll = root.querySelector('.window-content').scrollTop;
    render({ restore: false });
    root.querySelector('.window-content').scrollTop = scroll;
    root.querySelector('#feedback')?.scrollIntoView({ block: 'nearest' });
    root.querySelector('[aria-invalid="true"]')?.focus({ preventScroll: true });
  }
});
root.addEventListener('scroll', event => {
  if (event.target.matches('.window-content')) { rememberScroll(); persist(); }
}, true);
window.addEventListener('pagehide', () => { rememberScroll(); persist(); });
render();
