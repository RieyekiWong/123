import { ANSWER_ALIASES, BY_ID, DOCUMENTS, UI_COPY, CONTENT_REVISION } from './chapter-data.js';

export const SAVE_KEY = 'stillwater-xueli-sample:v1';
export const APPS = ['chat', 'files', 'browser', 'casebook'];
export const normalize = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');
const limited = (value, size = 500) => typeof value === 'string' ? value.slice(0, size) : '';
const ids = value => Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && BY_ID[id]))] : [];
export function fresh() {
  return { schema: 1, contentRevision: CONTENT_REVISION, legacyCompletion: false,
    lang: 'zh', app: 'chat', read: [], doc: null, previousDoc: null,
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
  const terms = String(rawQuery).trim().toLowerCase().split(/\s+/).map(normalize).filter(Boolean);
  return DOCUMENTS.filter(doc => doc.id !== 'back').map(doc => {
    const title = normalize(`${doc.title.zh} ${doc.title.en} ${doc.file}`);
    const meta = normalize(doc.keywords.join(' '));
    // Public pages have full-text indexing. Local mail deliberately has only a
    // sender/filename index: it is not a magically public, searchable inbox.
    const content = doc.kind === 'mail' ? '' : normalize(`${doc.paragraphs.zh.join(' ')} ${doc.paragraphs.en.join(' ')} ${doc.caption?.zh || ''} ${doc.caption?.en || ''}`);
    const haystack = `${title}${meta}${content}`;
    // An initial is part of the name, not a one-letter full-text keyword.
    // Otherwise "J. Ward" also matches the j and "afterwards" in a diary.
    const separateWords = terms.length > 1 && terms.every(term => term.length > 1 && haystack.includes(term));
    const matches = haystack.includes(query) || separateWords;
    const score = matches ? (title.includes(query) ? 5 : meta.includes(query) ? 4 : 1) : 0;
    return { doc, score };
  }).filter(item => item.score).sort((a, b) => b.score - a.score || a.doc.date.localeCompare(b.doc.date)).map(item => item.doc);
}

export const FEEDBACK = {
  person: [UI_COPY.personError.zh, UI_COPY.personError.en],
  place: [UI_COPY.placeError.zh, UI_COPY.placeError.en],
  purpose: [UI_COPY.purposeError.zh, UI_COPY.purposeError.en],
  empty: [UI_COPY.empty.zh, UI_COPY.empty.en],
  success: [UI_COPY.success.zh, UI_COPY.success.en]
};

// Check the statement before looking for an alias. A name inside a denial is
// not an answer. This deliberately remains a small, deterministic local rule,
// not a claim to understand arbitrary natural-language arguments.
function answerPart(raw) {
  const text = String(raw ?? '').normalize('NFKC').trim();
  // Simple explicit corrections are useful answers too: "not X, but Y".
  // Validate only Y, never the rejected name before it. Keep the full draft.
  const correction = text.match(/(?:不是|并非)[\s\S]*?(?:而是|[，,;；]\s*(?:是|要找的是|想看的是))\s*(.+)$/u)
    || text.match(/\bnot\b[\s\S]*?\bbut\s+(.+)$/iu);
  return correction ? correction[1] : text;
}
function isAffirmative(raw) {
  const text = String(raw ?? '').normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'");
  return !/(?:不是|并非|并不是|不在|不去|不想|不看|不认识|没(?:有)?(?:见|去|看|找)|不知道|不清楚|不确定|未必|不能|不会|无法|没法|没有证据|以外|之外|其他照片|别的照片|无关照片|\b(?:not|never|no|neither|unknown|unrelated|cannot|instead of|other than|except)\b|\b(?:isn|wasn|aren|weren|don|doesn|didn|can|couldn|wouldn|shouldn|won|shan|ain|mustn)'?t\b)/iu.test(text);
}

export function validate(state, draft = state.draft) {
  const personText = answerPart(draft.person), placeText = answerPart(draft.place), purposeText = answerPart(draft.purpose);
  const person = normalize(personText);
  const place = normalize(placeText);
  const purpose = normalize(purposeText);
  const exactAlias = (field, value) => ANSWER_ALIASES[field].some(alias => normalize(alias) === value);
  const initialsMapped = state.read?.some(id => ['profile', 'reply'].includes(id));
  const isInitials = person === 'jw';
  const personAlias = exactAlias('person', person) && (!isInitials || initialsMapped);
  const fullPerson = /朱恩|沃德女士/u.test(person) || /\b(?:june(?:[\s\p{P}]*ward)?|j[\s\p{P}]*ward|ms[\s\p{P}]*ward)\b/iu.test(personText);
  const isPerson = isAffirmative(personText) && (fullPerson || personAlias);
  const isPlace = isAffirmative(placeText) && (/青鸟/.test(place) || /\bbluebird(?:[\s\p{P}]*photo(?:[\s\p{P}]*studio)?)?\b/iu.test(placeText) || exactAlias('place', place));
  const isPhoto = /合影|合照|照片|相片|团体照|集体照|photo|picture|portrait|print|negative/.test(purpose);
  const isSpecific = /合影|合照|团体照|集体照|员工|职工|周年|十九|19|旅馆|酒店|底片|原件|原片|原版|原始|背面|staff|employee|anniversary|hotel|original|negative|group/.test(purpose);
  const isPurpose = isAffirmative(purposeText) && (exactAlias('purpose', purpose) || (isPhoto && isSpecific));
  const errors = [];
  if (!isPerson) errors.push({ field: 'person', code: person ? 'person' : 'empty' });
  if (!isPlace) errors.push({ field: 'place', code: place ? 'place' : 'empty' });
  if (!isPurpose) errors.push({ field: 'purpose', code: purpose ? 'purpose' : 'empty' });
  return { ok: errors.length === 0, errors };
}

export function submit(state) {
  const result = validate(state);
  if (!result.ok) return { state, ...result };
  return { state: { ...state, contentRevision: CONTENT_REVISION, legacyCompletion: false,
    completed: true, storyDelivered: true, app: 'chat', doc: null }, ...result };
}

// Migration only: v1 once accepted generic "old photo" and even denials that
// happened to contain a name. Keep a genuinely completed old sample accessible,
// with an explicit compatibility marker, without re-certifying those answers.
function legacyValid(draft) {
  const person = normalize(draft.person), place = normalize(draft.place), purpose = normalize(draft.purpose);
  const p = /朱恩|juneward|jward/.test(person) || /(?:^|[^a-z])june(?:$|[^a-z])/i.test(draft.person);
  const l = /青鸟|bluebird/.test(place);
  const photo = /合影|合照|照片|相片|团体照|集体照|photo|picture|portrait|print|negative/.test(purpose);
  const specific = /合影|合照|团体照|集体照|员工|职工|周年|十九|19|旅馆|酒店|旧|老|底片|原件|原片|原版|原始|背面|名字|staff|employee|anniversary|hotel|original|negative|old|group/.test(purpose);
  return p && l && (purpose === '底片' || photo && specific);
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
  const currentValid = validate(state).ok;
  const priorCompletion = value.completed === true &&
    (!value.contentRevision || value.contentRevision === 'directors-cut-p0-20261106' || value.legacyCompletion === true) && legacyValid(state.draft);
  state.completed = value.completed === true && (currentValid || priorCompletion);
  state.legacyCompletion = state.completed && !currentValid && priorCompletion;
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
  const key = state.completed ? 'newMessage' : !state.read.includes('note') ? 'start' :
    state.read.includes('reply') ? 'afterEmail' : unlockedApps(state).includes('casebook') ? 'afterProfile' : 'afterNote';
  return [UI_COPY[key].zh, UI_COPY[key].en];
}
