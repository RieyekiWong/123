import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, hydrate, submitChoices } from './chapter-model.js';
import { CHAPTER_MAIL, announceChapter } from './chapter-mail.js';
const solved = () => submitChoices({ ...fresh(), choices: { surname:'ward', given:'june', place:'bluebird', purpose:'group-photo' } }).state;
test('chapter reminders require actual verification and cannot manufacture future chapters', () => {
  const state = fresh();
  assert.equal(announceChapter(state, 'chapter-01'), false);
  assert.equal(announceChapter(solved(), 'chapter-02'), false);
  assert.deepEqual(state.chapterMail, {});
  assert.equal(state.completed, false);
});
test('each chapter announcement occurs once and preserves read status on repeat submissions', () => {
  const state = solved();
  assert.equal(announceChapter(state, 'chapter-01'), true);
  assert.deepEqual(state.chapterMail['chapter-01'], { announced:true, read:false });
  assert.equal(announceChapter(state, 'chapter-01'), false);
  state.chapterMail['chapter-01'].read = true;
  assert.equal(announceChapter(state, 'chapter-01'), false);
  const restored = hydrate(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored.chapterMail, state.chapterMail);
  assert.equal(CHAPTER_MAIL['chapter-01'].batch, 'xueli.chapter-01');
});
test('unread reminders survive refresh while unverified or unknown records grant nothing', () => {
  const state = solved(); announceChapter(state, 'chapter-01');
  assert.equal(hydrate(JSON.parse(JSON.stringify(state))).chapterMail['chapter-01'].read, false);
  const spoofed = { ...fresh(), chapterMail: state.chapterMail };
  assert.deepEqual(hydrate(spoofed).chapterMail, {});
  assert.deepEqual(hydrate({ ...state, chapterMail: { ghost: { announced:true, read:false } } }).chapterMail, {});
});
