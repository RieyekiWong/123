import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, hydrate, canRead, submitChoices } from './chapter-model.js';
import { CHOICE_OPTIONS, unmappedDraft } from './notebook-choices.js';
const correct = { surname: 'ward', given: 'june', place: 'bluebird', purpose: 'group-photo' };
test('correct choices remain unverified across refresh until an explicit submission', () => {
  const state = fresh(); state.choices = { ...correct }; state.workspace = 'computer';
  const restored = hydrate(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored.choices, correct);
  assert.equal(restored.completed, false);
  assert.equal(canRead(restored, 'back'), false);
  assert.equal(restored.storyDelivered, false);
  const result = submitChoices(restored);
  assert.equal(result.ok, true); assert.equal(result.state.completed, true);
  assert.equal(result.state.workspace, 'computer');
  assert.equal(restored.completed, false);
});
test('the surname and given name must form the correct pair, and mismatches keep every choice', () => {
  const state = { ...fresh(), choices: { ...correct, surname: 'reed' } };
  const result = submitChoices(state);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.field === 'person'));
  assert.equal(result.state, state);
  assert.deepEqual(state.choices, { ...correct, surname: 'reed' });
});
test('only the complete evidence-backed combination passes the first chapter review', () => {
  let passed = 0;
  for (const surname of CHOICE_OPTIONS.surname) for (const given of CHOICE_OPTIONS.given) {
    for (const place of CHOICE_OPTIONS.place) for (const purpose of CHOICE_OPTIONS.purpose) {
      const choices = { surname: surname.id, given: given.id, place: place.id, purpose: purpose.id };
      if (submitChoices({ ...fresh(), choices }).ok) { assert.deepEqual(choices, correct); passed++; }
    }
  }
  assert.equal(passed, 1);
});
test('existing completed text answers migrate without losing text, sources, scroll or mute preferences', () => {
  const old = { ...fresh(), draft: { person: 'June', place: '青鸟', purpose: '员工合影原件' }, completed: true, read: ['note', 'weekly', 'back'], scroll: { weekly: 480 }, clickSound: false };
  delete old.choices;
  const restored = hydrate(JSON.parse(JSON.stringify(old)));
  assert.deepEqual(restored.choices, correct);
  assert.deepEqual(restored.draft, old.draft);
  assert.deepEqual(restored.read, old.read);
  assert.deepEqual(restored.scroll, old.scroll);
  assert.equal(restored.completed, true); assert.equal(restored.clickSound, false);
});
test('unmapped older writing is preserved and not silently turned into an answer', () => {
  const old = { ...fresh(), draft: { person: '还没有确定是谁', place: '准备再看看报道', purpose: '纸背上的字' } };
  delete old.choices;
  const restored = hydrate(old);
  assert.deepEqual(restored.draft, old.draft);
  assert.equal(unmappedDraft(restored.draft).length, 3);
  assert.equal(submitChoices(restored).ok, false);
  assert.equal(restored.completed, false);
});
test('unknown option IDs are discarded without injecting labels or later identities', () => {
  const restored = hydrate({ ...fresh(), choices: { ...correct, given: '<img onerror=bad()>' } });
  assert.equal(restored.choices.given, '');
  assert.equal(submitChoices(restored).ok, false);
  assert.doesNotMatch(JSON.stringify(CHOICE_OPTIONS), /Nora|Bell|NULL|诺拉/);
});
