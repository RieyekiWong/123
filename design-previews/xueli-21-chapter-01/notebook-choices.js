/* First-chapter options drawn from the existing public cast, places and files.
   Do not include the names first disclosed by the locked photograph scan. */
import { ANSWER_ALIASES } from './chapter-data.js';
const option = (id, zh, en, aliases = []) => ({ id, label: { zh, en }, aliases: [zh, en, ...aliases] });
export const CHOICE_OPTIONS = {
  surname: [option('baker', '贝克', 'Baker'), option('reed', '里德', 'Reed'), option('walsh', '沃尔什', 'Walsh'), option('ward', '沃德', 'Ward'), option('wang', '王', 'Wang')],
  given: [option('ada', '艾达', 'Ada'), option('annie', '安妮', 'Annie'), option('churen', '楚人', 'Churen'), option('june', '朱恩', 'June'), option('robert', '罗伯特', 'Robert')],
  place: [option('hotel', '静水旅馆', 'Stillwater Hotel'), option('bluebird', '青鸟照相馆', 'Bluebird Photo', ANSWER_ALIASES.place), option('library', '雪梨镇图书馆', 'Xueli Town Library'), option('diner', 'Maggie’s Diner', "Maggie's Diner")],
  purpose: [option('course', '旧招牌课程文件', 'Shop-sign coursework'), option('group-photo', '员工合影原件或底片', 'Original staff photograph or negative', [...ANSWER_ALIASES.purpose, '员工合影原件']), option('report', '周刊报道', 'Weekly report'), option('map', '旧湖区地图', 'Old lake-district map'), option('hours', '商户营业时间', 'Business opening hours')],
};
const fields = Object.keys(CHOICE_OPTIONS);
const normalize = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');
export const freshChoices = () => Object.fromEntries(fields.map(field => [field, '']));
export function sanitizeChoices(raw) {
  return Object.fromEntries(fields.map(field => [field, CHOICE_OPTIONS[field].some(o => o.id === raw?.[field]) ? raw[field] : '']));
}
const find = (field, id) => CHOICE_OPTIONS[field].find(o => o.id === id);
const match = (field, text) => CHOICE_OPTIONS[field].find(o => o.aliases.some(alias => normalize(alias) === normalize(text)))?.id || '';
export function choicesFromDraft(draft = {}) {
  const choices = freshChoices();
  const names = [
    ['ward', 'june', ANSWER_ALIASES.person],
    ['reed', 'ada', ['艾达·里德', 'Ada Reed']],
    ['walsh', 'robert', ['罗伯特·沃尔什', 'Robert Walsh']],
    ['baker', 'annie', ['安妮·贝克', 'Annie Baker']],
    ['wang', 'churen', ['王楚人', 'Wang Churen']],
  ];
  const person = names.find(([, , aliases]) => aliases.some(alias => normalize(alias) === normalize(draft.person)));
  if (person) [choices.surname, choices.given] = person;
  choices.place = match('place', draft.place);
  choices.purpose = match('purpose', draft.purpose);
  return choices;
}
export function draftFromChoices(raw) {
  const choices = sanitizeChoices(raw);
  const surname = find('surname', choices.surname), given = find('given', choices.given);
  return {
    person: surname && given ? `${given.label.en} ${surname.label.en}` : '',
    place: find('place', choices.place)?.label.en || '',
    purpose: find('purpose', choices.purpose)?.label.en || '',
  };
}
export function unmappedDraft(draft) {
  const migrated = choicesFromDraft(draft);
  return Object.entries(draft).filter(([key, value]) => value &&
    (key === 'person' ? !migrated.surname || !migrated.given : !migrated[key]));
}
export function isSelectedName(draft) {
  // The old free-text validator accepts a given-name alias. A selection must
  // additionally match the complete pair so June + Reed cannot pass as June.
  return ANSWER_ALIASES.person.some(alias => normalize(alias) === normalize(draft.person));
}
