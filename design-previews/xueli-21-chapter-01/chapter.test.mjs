import test from 'node:test';
import assert from 'node:assert/strict';
import { ANSWER_ALIASES, ASSETS, DOCUMENTS } from './chapter-data.js';
import { fresh, hydrate, search, validate, submit, openDocument, unlockedApps, canRead } from './chapter-model.js';

const ready = () => ({ ...fresh(), read: ['note', 'weekly', 'profile', 'directory', 'reply', 'diary', 'letter'],
  draft: { person: '朱恩·沃德', place: '青鸟照相馆，桦树街 6 号', purpose: '查看旅馆十九周年员工合影的原底片' } });

test('the opening has only two apps and cannot open the next chapter', () => {
  const state = fresh();
  assert.deepEqual(unlockedApps(state), ['chat', 'files']);
  assert.equal(canRead(state, 'back'), false);
  assert.equal(canRead(state, 'reply'), false);
  assert.deepEqual(search(state, 'Nora'), []);
});
test('optional diary does not unlock everything; the note unlocks the index', () => {
  const diary = openDocument(fresh(), 'diary');
  assert.deepEqual(unlockedApps(diary), ['chat', 'files']);
  const note = openDocument(diary, 'note');
  assert.deepEqual(unlockedApps(note), ['chat', 'files', 'browser']);
  assert.equal(canRead(note, 'back'), false);
});
test('Chinese and English queries follow the source chain', () => {
  const state = openDocument(fresh(), 'note');
  for (const query of ['青鸟照相馆', 'BLUEBIRD PHOTO', 'bluebird']) {
    assert.ok(search(state, query).some(doc => doc.id === 'profile'));
    assert.ok(search(state, query).some(doc => doc.id === 'directory'));
    assert.ok(!search(state, query).some(doc => doc.id === 'reply'));
  }
  for (const query of ['朱恩·沃德', 'June Ward', 'juneward', 'j. ward']) assert.ok(search(state, query).some(doc => doc.id === 'reply'));
  assert.equal(search(state, '不存在的关键词').length, 0);
  assert.equal(search(state, 'Nora Bell').length, 0);
});
test('local mail body cannot be searched as if it were a public web article', () => {
  const state = openDocument(fresh(), 'note');
  for (const query of ['OPEN 牌子', 'October 16', 'letterbox', '合影', '周一见']) assert.ok(!search(state, query).some(doc => doc.id === 'reply'));
});
test('opening sources never grants a correct deduction', () => {
  const state = { ...ready(), draft: fresh().draft };
  assert.equal(validate(state).ok, false);
  assert.equal(submit(state).state.completed, false);
});
test('correct Chinese free text passes without source citations', () => {
  assert.equal(validate(ready()).ok, true);
  const result = submit(ready());
  assert.equal(result.state.app, 'chat');
  assert.equal(result.state.completed, true);
  assert.equal(canRead(result.state, 'back'), true);
});
test('English prose, aliases and mixed language are accepted', () => {
  const answers = [
    { person: 'June Ward', place: 'Bluebird Photo, 6 Birch Street', purpose: 'The original staff photograph from the hotel anniversary' },
    { person: 'J. Ward', place: 'Bluebird', purpose: 'the original hotel group photo' },
    { person: 'June Ward', place: 'Bluebird Photo', purpose: 'An original photograph of the hotel staff' },
    { person: '朱恩', place: 'Bluebird Photo 青鸟照相馆', purpose: '旅馆员工的旧照片底片' },
    { person: 'June', place: '青鸟', purpose: '酒店周年合照原件' }
  ];
  for (const draft of answers) assert.equal(validate({ ...ready(), draft }).ok, true, JSON.stringify(draft));
});
test('missing or obsolete citations never block correct fields', () => {
  for (const citations of [undefined, [], ['weekly'], ['letter'], 'malformed old metadata']) {
    assert.equal(validate({ ...ready(), read: [], citations }).ok, true);
  }
});
test('every documented answer alias passes without punctuation-sensitive matching', () => {
  for (const field of ['person', 'place', 'purpose']) {
    for (const answer of ANSWER_ALIASES[field]) {
      assert.equal(validate({ ...ready(), draft: { ...ready().draft, [field]: answer } }).ok, true, `${field}: ${answer}`);
    }
  }
});
test('missing punctuation, mixed case and full-width letters are equivalent', () => {
  for (const person of ['朱恩沃德', '朱恩．沃德', '  June  Ward ', 'Ｊｕｎｅ　Ｗａｒｄ', 'J.Ward', 'j ward', '那个叫朱恩的摄影师', 'I think it was June']) {
    assert.equal(validate({ ...ready(), draft: { person, place: 'BLUEBIRD PHOTO!', purpose: '员工合影' } }).ok, true, person);
  }
});
test('short natural descriptions do not require the exact original sentence', () => {
  for (const purpose of ['员工合照', '酒店合影', '合照原件', '旧合照', '原底片', 'staff pictures', 'the original photo', 'hotel group photograph', '想看那张合影', '那张老照片', 'an old photo']) {
    assert.equal(validate({ ...ready(), draft: { ...ready().draft, purpose } }).ok, true, purpose);
  }
  for (const purpose of ['', '东西', '照片', '入住记录', 'work schedule']) {
    assert.equal(validate({ ...ready(), draft: { ...ready().draft, purpose } }).ok, false, purpose);
  }
});
test('artwork supports horizontal and vertical 64px tile groups', () => {
  assert.deepEqual(ASSETS['photo-anniversary'].tiles, [2, 1]);
  assert.deepEqual(ASSETS['portrait-june'].tiles, [1, 2]);
});
test('wrong answers have meaningful field errors and retain every input', () => {
  const state = { ...ready(), draft: { person: 'GGbond', place: '雪梨镇', purpose: '查看入住记录' } };
  const before = structuredClone(state);
  const result = submit(state);
  assert.deepEqual(result.errors.map(e => e.field), ['person', 'place', 'purpose']);
  assert.deepEqual(result.state, before);
});
test('refresh preserves drafts, reading positions and hints', () => {
  const state = { ...ready(), app: 'casebook', doc: 'profile', scroll: { profile: 443 }, hint: 2, query: '朱恩' };
  const restored = hydrate(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored.draft, state.draft);
  assert.equal('citations' in restored, false);
  assert.equal(restored.scroll.profile, 443);
  assert.equal(restored.hint, 2);
  assert.equal(restored.query, '朱恩');
});
test('completion survives refresh with correct fields but not an empty completed flag', () => {
  const finished = submit(ready()).state;
  assert.equal(hydrate(finished).completed, true);
  assert.equal(hydrate({ ...fresh(), completed: true, read: ['back'] }).completed, false);
  assert.ok(!hydrate({ ...fresh(), completed: true, read: ['back'] }).read.includes('back'));
});
test('old blocked and completed saves keep their text and reading history', () => {
  const legacy = { ...ready(), app: 'casebook', citations: ['weekly'], scroll: { reply: 231 } };
  const restored = hydrate(legacy);
  assert.deepEqual(restored.draft, legacy.draft);
  assert.deepEqual(restored.read, legacy.read);
  assert.equal(restored.scroll.reply, 231);
  assert.equal(restored.completed, false);
  assert.equal(submit(restored).ok, true);
  assert.equal(hydrate({ ...legacy, completed: true }).completed, true);
});
test('defensive hydration does not crash on malformed fields', () => {
  const state = hydrate({ schema: 1, read: ['missing', null, 'note'], draft: { person: {} }, scroll: { note: -3 }, hint: Infinity, citations: ['missing'], trail: [null, 'reply'] });
  assert.deepEqual(state.read, ['note']);
  assert.equal(state.draft.person, '');
  assert.equal(state.scroll.note, undefined);
  assert.equal(state.hint, 3);
  assert.equal(hydrate({ schema: 77 }).app, 'chat');
  assert.equal(hydrate({ schema: 1, app: 'desktop' }).app, 'desktop');
});
test('main articles are full original bilingual texts, not short clue cards', () => {
  for (const id of ['weekly', 'profile', 'letter', 'diary']) {
    const doc = DOCUMENTS.find(d => d.id === id);
    const zh = doc.paragraphs.zh.join('').match(/[\p{Script=Han}]/gu).length;
    const en = doc.paragraphs.en.join(' ').split(/\s+/).length;
    assert.ok(zh >= 300, `${id}: ${zh} Chinese characters`);
    assert.ok(en >= 200, `${id}: ${en} English words`);
    assert.equal(doc.paragraphs.zh.length, doc.paragraphs.en.length);
  }
});
