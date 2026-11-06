import test from 'node:test';
import assert from 'node:assert/strict';
import { ANSWER_ALIASES, ASSETS, DOCUMENTS, OPENING, ENDING, UI_COPY, CONTENT_REVISION } from './chapter-data.js';
import { fresh, hydrate, search, validate, submit, openDocument, unlockedApps, canRead, objective, FEEDBACK } from './chapter-model.js';

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
  for (const query of ['OPEN 牌子', 'October 16', 'collection envelope', '周一见', 'whole coursework folder']) assert.ok(!search(state, query).some(doc => doc.id === 'reply'), query);
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
  for (const purpose of ['员工合照', '酒店合影', '合照原件', '旧合照', '原底片', 'staff pictures', 'the original photo', 'hotel group photograph', '想看那张合影', '底片', 'old hotel staff photo']) {
    assert.equal(validate({ ...ready(), draft: { ...ready().draft, purpose } }).ok, true, purpose);
  }
  for (const purpose of ['', '东西', '照片', '入住记录', 'work schedule', '一张普通照片', 'an old photo', '旧照片']) {
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

test('denials and uncertainty cannot pass just because an alias is present', () => {
  const denied = {
    person: ['不是朱恩', '我没见过朱恩', '并非 June Ward', 'not June', 'not June Ward', "I don't know June", '不是朱恩而是Nora', 'June? no, somebody else', '不能确认是朱恩', '未必是朱恩', 'June cannot be the person', "It won't be June", 'notJuneWard', 'someone except June', 'JuneWardrobe', 'myjwardname', '王楚人', 'Ward', 'Junebug', 'Stephen Dylan'],
    place: ['不是青鸟', '不在青鸟照相馆', '没找到 Bluebird', 'not Bluebird Photo', 'Bluebird is not the place', '青鸟以外的地方', 'BluebirdPhotobomb', 'Birch Street', '桦树街6号', 'Stillwater Hotel'],
    purpose: ['不是员工合照', '我想看一张照片但不是酒店员工合照', '不是合影，是一张普通自拍', "not the hotel staff photo", "I don't want the original photo", 'some other photo instead of the hotel group picture', '普通旧照片', 'a picture', '一个文件', '咖啡']
  };
  for (const [field, inputs] of Object.entries(denied)) for (const input of inputs) {
    const state = { ...ready(), draft: { ...ready().draft, [field]: input } };
    const result = submit(state);
    assert.equal(result.ok, false, `${field}: ${input}`);
    assert.ok(result.errors.some(error => error.field === field));
    assert.deepEqual(result.state, state);
  }
});

test('the short photo-credit initials require their visible mapping, not an extra citation control', () => {
  const draft = { ...ready().draft, person: 'J.W.' };
  for (const read of [[], ['note'], ['note', 'weekly'], ['note', 'weekly', 'directory']]) {
    assert.equal(validate({ ...fresh(), read, draft }).ok, false);
  }
  for (const read of [['note', 'profile'], ['note', 'reply']]) {
    for (const person of ['J.W.', 'j w', 'Ｊ．Ｗ．']) {
      assert.equal(validate({ ...fresh(), read, draft: { ...draft, person } }).ok, true);
    }
  }
  for (const person of ['沃德女士', 'Ms Ward', 'Ｍｓ． Ｗａｒｄ']) {
    assert.equal(validate({ ...ready(), draft: { ...draft, person } }).ok, true);
  }
});

test('explicit corrections validate the final choice and retain the whole draft', () => {
  const correct = {
    person: ['不是 Nora，而是朱恩', 'not Nora, but June Ward'],
    place: ['不是酒店，是青鸟照相馆', 'not the hotel, but Bluebird Photo'],
    purpose: ['不是普通照片，而是酒店员工合影', 'not a selfie, but the original staff photograph']
  };
  for (const [field, phrases] of Object.entries(correct)) for (const phrase of phrases) {
    const state = { ...ready(), draft: { ...ready().draft, [field]: phrase } };
    const result = submit(state);
    assert.equal(result.ok, true, phrase);
    assert.equal(result.state.draft[field], phrase);
  }
  for (const [field, phrase] of [['person', 'not June, but Nora'], ['place', '不是青鸟，而是酒店'], ['purpose', 'not the hotel photo, but a selfie']]) {
    assert.equal(validate({ ...ready(), draft: { ...ready().draft, [field]: phrase } }).ok, false, phrase);
  }
});

test('new bilingual search terms return the same relevant sources in either interface language', () => {
  const state = openDocument(fresh(), 'note');
  for (const [zh, en, expected] of [
    ['青鸟照相馆', 'Bluebird Photo', ['weekly', 'profile', 'directory']],
    ['朱恩', 'June Ward', ['profile', 'directory', 'reply']],
    ['朱恩沃德', 'June Ward', ['profile', 'directory', 'reply']]
  ]) {
    for (const lang of ['zh', 'en']) {
      const found = query => search({ ...state, lang }, query).map(doc => doc.id).sort();
      for (const query of [zh, en]) for (const id of expected) assert.ok(found(query).includes(id), `${lang}: ${query} -> ${id}`);
      assert.deepEqual(found(zh), found(en));
    }
  }
  for (const lang of ['zh', 'en']) for (const query of ['J. Ward', 'j ward', 'Ｊ． Ｗａｒｄ']) {
    assert.deepEqual(search({ ...state, lang }, query).map(doc => doc.id), ['reply']);
  }
  for (const lang of ['zh', 'en']) for (const query of ['原底片也还在', 'three in the afternoon', '歪', 'collection order']) {
    assert.ok(!search({ ...state, lang }, query).some(doc => doc.id === 'reply'));
  }
});

test('calendar dates, shop details and the limited scan provenance survive the prose replacement', () => {
  for (const [date, weekday] of [['2006-09-23',6],['2006-09-24',0],['2019-04-13',6],['2023-10-03',2],['2023-10-15',0],['2023-10-16',1]]) {
    assert.equal(new Date(date + 'T12:00:00Z').getUTCDay(), weekday, date);
  }
  const doc = id => DOCUMENTS.find(item => item.id === id);
  for (const lang of ['zh', 'en']) {
    assert.match(doc('directory').paragraphs[lang].join(' '), /June Ward/);
    assert.match(doc('directory').paragraphs[lang].join(' '), /6 Birch Street/);
    assert.match(doc('directory').paragraphs[lang].join(' '), /13:00–18:00|1:00–6:00 p\.m\./);
    assert.match(doc('back').caption[lang], /扫描时间不详|scan date unknown/);
    assert.doesNotMatch(doc('profile').caption[lang], /照片待画|portrait is pending/);
  }
  assert.equal(doc('weekly').date, '2006-09-24');
  assert.equal(doc('profile').date, '2019-04-13');
  assert.match(doc('weekly').paragraphs.en.join(' '), /Robert Walsh/);
  assert.ok(!ANSWER_ALIASES.person.some(value => /Robert|罗伯特/.test(value)));
});

test('previous chapter revision keeps its completed and partial saves without new schema fields', () => {
  const partial = { ...ready(), contentRevision: 'directors-cut-p0-20261106', app: 'casebook', hint: 2, scroll: { weekly: 486 } };
  assert.deepEqual(hydrate(partial).draft, partial.draft);
  assert.deepEqual(hydrate(partial).scroll, partial.scroll);
  assert.equal(hydrate(partial).completed, false);
  const completed = { ...partial, completed: true, storyDelivered: true, app: 'browser', doc: 'back', read: [...partial.read, 'back'], draft: { person: '未必是朱恩', place: '青鸟', purpose: '合影' } };
  const restored = hydrate(completed);
  assert.equal(restored.completed, true);
  assert.equal(restored.legacyCompletion, true);
  assert.equal(restored.doc, 'back');
  assert.equal(hydrate(restored).completed, true);
  assert.equal(hydrate(restored).schema, 1);
  assert.deepEqual(Object.keys(fresh()).sort(), Object.keys(hydrate(restored)).sort());
});

test('empty answers receive the authored empty-field feedback', () => {
  const result = validate(fresh());
  assert.equal(result.errors.length, 3);
  assert.ok(result.errors.every(error => error.code === 'empty'));
  assert.equal(FEEDBACK.empty[0], UI_COPY.empty.zh);
});

test('old completed samples survive stricter validation without certifying their wording', () => {
  const old = { ...ready(), completed: true, storyDelivered: true, draft: { person: 'June', place: 'Bluebird', purpose: 'an old photo' }, read: ['note', 'profile', 'back'] };
  delete old.contentRevision;
  const state = hydrate(old);
  assert.equal(validate(state).ok, false);
  assert.equal(state.completed, true);
  assert.equal(state.legacyCompletion, true);
  assert.equal(state.contentRevision, CONTENT_REVISION);
  assert.equal(canRead(state, 'back'), true);
  assert.equal(hydrate(JSON.parse(JSON.stringify(state))).completed, true);
  assert.equal(hydrate({ ...old, contentRevision: CONTENT_REVISION }).completed, false);
  assert.equal(hydrate({ ...fresh(), completed: true, legacyCompletion: true }).completed, false);
});

test('different reading orders and optional life documents do not become completion gates', () => {
  for (const order of [['note', 'weekly', 'directory', 'reply'], ['note', 'diary', 'weekly', 'profile', 'letter', 'reply']]) {
    let state = fresh();
    for (const id of order) state = openDocument(state, id);
    assert.equal(state.completed, false);
    assert.equal(submit({ ...state, draft: ready().draft }).ok, true);
  }
});

test('visible documents provide all search steps, without exposing future material', () => {
  const doc = id => DOCUMENTS.find(item => item.id === id);
  for (const lang of ['zh', 'en']) {
    const weekly = `${doc('weekly').paragraphs[lang].join(' ')} ${doc('weekly').caption[lang]}`;
    assert.match(weekly, /Bluebird/);
    assert.match(weekly, /J\.W\./);
    assert.match(doc('profile').paragraphs[lang].join(' '), /June Ward|朱恩/);
    assert.equal(doc('diary').author[lang], 'W.C.');
    assert.match(doc('reply').paragraphs[lang].join(' '), /下午三点|three in the afternoon/);
    assert.doesNotMatch(doc('reply').paragraphs[lang].join(' '), /没有 10 月 16 日的到访确认|no October 16 check-in/);
    assert.match(doc('reply').status[lang], /没有|no October 16/);
    assert.match(doc('back').paragraphs[lang].join(' '), /Nora Bell — night shift/);
  }
  assert.deepEqual(doc('reply').mail, { from: 'J. Ward', to: 'W. Churen', sent: '2023-10-15 17:26' });
  const state = openDocument(fresh(), 'note');
  for (const query of ['J.W.', 'j w', '青鸟', 'BLUEBIRD']) assert.ok(search(state, query).some(item => item.id === 'profile'));
  for (const query of ['June', 'June Ward', 'Ｊ． Ｗａｒｄ', '朱恩']) assert.ok(search(state, query).some(item => item.id === 'reply'));
  for (const query of ['Nora Bell', 'NULL', '位体教']) assert.equal(search(state, query).length, 0);
  assert.ok(!doc('note').keywords.includes('王楚人'));
});

test('objectives follow the authored question without answering it for the player', () => {
  assert.deepEqual(objective(fresh()), [UI_COPY.start.zh, UI_COPY.start.en]);
  const note = openDocument(fresh(), 'note');
  assert.deepEqual(objective(note), [UI_COPY.afterNote.zh, UI_COPY.afterNote.en]);
  const profile = openDocument(note, 'profile');
  assert.deepEqual(objective(profile), [UI_COPY.afterProfile.zh, UI_COPY.afterProfile.en]);
  const reply = openDocument(profile, 'reply');
  assert.deepEqual(objective(reply), [UI_COPY.afterEmail.zh, UI_COPY.afterEmail.en]);
});

test('developer directions and unapproved optional pages are absent from runtime copy', () => {
  const runtime = JSON.stringify([DOCUMENTS, OPENING, ENDING]);
  assert.doesNotMatch(runtime, /开发备注|导演备注|配图由用户绘制|artis[t’']|Developer note|Production note|Director's note|Image to be drawn/);
  assert.equal(DOCUMENTS.length, 8);
  assert.ok(!DOCUMENTS.some(doc => ['market', 'umbrella'].includes(doc.id)));
});
