import { BY_ID, DOCUMENTS } from './chapter-data.js';

export const SAVE_KEY = 'stillwater-xueli-sample:v1';
export const APPS = ['chat', 'files', 'browser', 'casebook'];
export const normalize = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');
const limited = (value, size = 500) => typeof value === 'string' ? value.slice(0, size) : '';
const ids = value => Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && BY_ID[id]))] : [];
export function fresh() {
  return { schema: 1, lang: 'zh', app: 'chat', read: [], doc: null, previousDoc: null,
    query: '', searches: [], searchShown: false, draft: { person: '', place: '', purpose: '' },
    citations: [], hint: 0, completed: false, storyDelivered: false, scroll: {}, trail: [], readerSize: 20 };
}

export function unlockedApps(state) {
  const list = ['chat', 'files'];
  if (state.read.includes('note')) list.push('browser');
  if (state.read.some(id => ['profile', 'directory', 'reply'].includes(id))) list.push('casebook');
  return list;
}
export function canRead(state, id) {
  if (!BY_ID[id]) return false;
  if (id === 'back') return state.completed;
  if (id === 'note' || id === 'diary') return true;
  return state.read.includes('note');
}
export function openDocument(state, id) {
  if (!canRead(state, id)) return state;
  const next = { ...state, app: 'browser', previousDoc: state.doc, doc: id,
    read: [...new Set([...state.read, id])], trail: [...state.trail, state.doc].filter(Boolean).slice(-20) };
  // Local files do not accidentally unlock the browser before the note is read.
  if ((id === 'diary' || id === 'note') && !state.read.includes('note') && id !== 'note') next.app = 'files';
  return next;
}

export function search(state, rawQuery) {
  const query = normalize(limited(rawQuery, 120));
  if (!query || !unlockedApps(state).includes('browser')) return [];
  const terms = String(rawQuery).trim().toLowerCase().split(/\s+/).filter(Boolean);
  return DOCUMENTS.filter(doc => doc.id !== 'back').map(doc => {
    const title = normalize(`${doc.title.zh} ${doc.title.en} ${doc.file}`);
    const meta = normalize(doc.keywords.join(' '));
    // Public pages have full-text indexing. Local mail deliberately has only a
    // sender/filename index: it is not a magically public, searchable inbox.
    const content = doc.kind === 'mail' ? '' : normalize(`${doc.paragraphs.zh.join(' ')} ${doc.paragraphs.en.join(' ')} ${doc.caption?.zh || ''} ${doc.caption?.en || ''}`);
    const haystack = `${title}${meta}${content}`;
    const matches = haystack.includes(query) || (terms.length > 1 && terms.every(term => haystack.includes(normalize(term))));
    const score = matches ? (title.includes(query) ? 5 : meta.includes(query) ? 4 : 1) : 0;
    return { doc, score };
  }).filter(item => item.score).sort((a, b) => b.score - a.score || a.doc.date.localeCompare(b.doc.date)).map(item => item.doc);
}

export const FEEDBACK = {
  person: ['姓名还没对上。照片的摄影署名可以和店主介绍互相核对。', 'The name does not match the sources yet. Compare the photo credit with the shopkeeper’s introduction.'],
  place: ['请写约见的地点。镇名或街名还不足以区分具体是哪家店。', 'Name the meeting place. A town or street alone does not identify the shop.'],
  purpose: ['还不清楚他想看哪种资料。请区分网页缩图、普通照片和他要找的原件。', 'Which material did he want to see? Distinguish the web thumbnail, an unspecified picture and the original he was looking for.'],
  sources: ['还缺少原始出处：需要能认出照片的报道、能确认店主的资料，以及那封约见邮件。', 'The sources are incomplete: include the article identifying the photograph, a source identifying the shopkeeper, and the meeting email.'],
  unrelated: ['附上的资料里有一份不能支持这项判断。日常日记或镇民来信不能代替摄影来源与约见记录。', 'One of the attached sources does not support this conclusion. Everyday notes or a reader’s letter cannot replace the photo source and meeting record.'],
  unread: ['有一份引用资料还没有打开。先读原文，再把它作为依据。', 'One cited source has not been opened. Read it before using it as evidence.'],
  success: ['已保存：这是一次约见计划，尚不能确认楚人实际到店。', 'Saved as a planned meeting. This does not confirm that Churen arrived.']
};

export function validate(state, draft = state.draft, citations = state.citations) {
  const person = normalize(draft.person);
  const place = normalize(draft.place);
  const purpose = normalize(draft.purpose);
  const fullPerson = ['朱恩沃德', 'juneward'].some(name => person.includes(name));
  // Short names are accepted when the cited original identifies the same person.
  const shortPerson = ['朱恩', 'june', 'jward'].includes(person);
  const isPlace = /青鸟|bluebird/.test(place);
  const isGroupPhoto = /合影|合照|团体照|集体照|groupphoto|grouppicture|staffphoto|staffpicture|staffportrait|employeephoto|employeephotograph/.test(purpose) || (/员工|职工/.test(purpose) && /照|相片/.test(purpose)) || (/staff|employee/.test(purpose) && /photo|picture|portrait|print/.test(purpose));
  const isOriginal = /原件|原片|底片|底版|原版|原始|原照|纸质|原图|original|negative|paperprint/.test(purpose);
  const isRelevant = /员工|职工|周年|十九|19|staff|employee|anniversary|旅馆|酒店|hotel/.test(purpose);
  const errors = [];
  if (!fullPerson && !shortPerson) errors.push({ field: 'person', code: 'person' });
  if (!isPlace) errors.push({ field: 'place', code: 'place' });
  if (!(isGroupPhoto && isOriginal && isRelevant)) errors.push({ field: 'purpose', code: 'purpose' });
  if (citations.some(id => !state.read.includes(id))) errors.push({ field: 'citations', code: 'unread' });
  const support = new Set(citations);
  if (!(support.has('weekly') && support.has('reply') && (support.has('profile') || support.has('directory')))) errors.push({ field: 'citations', code: 'sources' });
  if (citations.some(id => !['weekly', 'reply', 'profile', 'directory', 'note'].includes(id))) errors.push({ field: 'citations', code: 'unrelated' });
  return { ok: errors.length === 0, errors };
}

export function submit(state) {
  const result = validate(state);
  if (!result.ok) return { state, ...result };
  return { state: { ...state, completed: true, storyDelivered: true, app: 'chat', doc: null }, ...result };
}

export function hydrate(value) {
  const base = fresh();
  if (!value || typeof value !== 'object' || value.schema !== 1) return base;
  const state = { ...base, lang: value.lang === 'en' ? 'en' : 'zh', read: ids(value.read),
    query: limited(value.query, 120), searches: Array.isArray(value.searches) ? value.searches.filter(s => typeof s === 'string').slice(-20).map(s => s.slice(0, 120)) : [],
    draft: Object.fromEntries(['person', 'place', 'purpose'].map(key => [key, limited(value.draft?.[key], key === 'purpose' ? 500 : 160)])),
    citations: ids(value.citations).filter(id => id !== 'back'), hint: Math.min(3, Math.max(0, Math.trunc(Number(value.hint) || 0))),
    readerSize: [18, 20, 22, 24].includes(value.readerSize) ? value.readerSize : 20, searchShown: value.searchShown === true };
  // A saved click on a category cannot stand in for the evidence rule.
  state.completed = value.completed === true && validate(state).ok;
  state.storyDelivered = state.completed;
  state.read = state.read.filter(id => id !== 'back' || state.completed);
  state.app = value.app === 'desktop' || unlockedApps(state).includes(value.app) ? value.app : 'chat';
  state.doc = canRead(state, value.doc) ? value.doc : null;
  state.previousDoc = canRead(state, value.previousDoc) ? value.previousDoc : null;
  state.trail = ids(value.trail).filter(id => canRead(state, id)).slice(-20);
  if (value.scroll && typeof value.scroll === 'object') {
    for (const id of Object.keys(BY_ID)) {
      const n = Number(value.scroll[id]);
      if (Number.isFinite(n) && n >= 0) state.scroll[id] = Math.min(100000, n);
    }
  }
  return state;
}

export function objective(state) {
  if (state.completed) return ['GGbond 又发来了一张照片。', 'GGbond has sent another photograph.'];
  if (!state.read.includes('note')) return ['看看 GGbond 发来的备忘。', 'Read the note GGbond found.'];
  if (!state.read.includes('weekly')) return ['看看楚人存下来的那篇报道。', 'Read the article Churen bookmarked.'];
  if (!unlockedApps(state).includes('casebook')) return ['照片是谁拍的？原件还在哪里？', 'Who took the photograph? Where is the original?'];
  if (!state.read.includes('reply')) return ['查清楚人和照片保管者有没有联系。', 'Find out whether Churen contacted the person who kept the photograph.'];
  return ['楚人原本打算去找谁、看什么？', 'Who did Churen plan to meet, and what did he want to see?'];
}
