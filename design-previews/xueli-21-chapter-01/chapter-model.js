import { ANSWER_ALIASES, BY_ID, DOCUMENTS } from './chapter-data.js';

export const SAVE_KEY = 'stillwater-xueli-sample:v1';
export const APPS = ['chat', 'files', 'browser', 'casebook'];
export const normalize = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');
const limited = (value, size = 500) => typeof value === 'string' ? value.slice(0, size) : '';
const ids = value => Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && BY_ID[id]))] : [];
export function fresh() {
  return { schema: 1, lang: 'zh', app: 'chat', read: [], doc: null, previousDoc: null,
    query: '', searches: [], searchShown: false, draft: { person: '', place: '', purpose: '' },
    hint: 0, completed: false, storyDelivered: false, scroll: {}, trail: [], readerSize: 20 };
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
  purpose: ['再具体一点，写出他想找哪种照片或资料就行，不用照抄原句。', 'Be a little more specific about the photograph or material. You do not need the exact wording.'],
  success: ['已保存：这是一次约见计划，尚不能确认楚人实际到店。', 'Saved as a planned meeting. This does not confirm that Churen arrived.']
};

export function validate(state, draft = state.draft) {
  const person = normalize(draft.person);
  const place = normalize(draft.place);
  const purpose = normalize(draft.purpose);
  const exactAlias = (field, value) => ANSWER_ALIASES[field].some(alias => normalize(alias) === value);
  const fullPerson = ['朱恩沃德', 'juneward', 'jward'].some(name => person.includes(name));
  const isPerson = fullPerson || exactAlias('person', person);
  const isPlace = /青鸟|bluebird/.test(place) || exactAlias('place', place);
  const isPhoto = /合影|合照|照片|相片|团体照|集体照|photo|picture|portrait|print|negative/.test(purpose);
  const isSpecific = /员工|职工|周年|十九|19|旅馆|酒店|旧合|底片|原件|原片|原版|原始|背面|名字|staff|employee|anniversary|hotel|original|negative|groupphoto|grouppicture/.test(purpose);
  const isPurpose = exactAlias('purpose', purpose) || (isPhoto && isSpecific);
  const errors = [];
  if (!isPerson) errors.push({ field: 'person', code: 'person' });
  if (!isPlace) errors.push({ field: 'place', code: 'place' });
  if (!isPurpose) errors.push({ field: 'purpose', code: 'purpose' });
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
    hint: Math.min(3, Math.max(0, Math.trunc(Number(value.hint) || 0))),
    readerSize: [18, 20, 22, 24].includes(value.readerSize) ? value.readerSize : 20, searchShown: value.searchShown === true };
  // Old citation arrays are intentionally ignored. Drafts and completed answers survive.
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
