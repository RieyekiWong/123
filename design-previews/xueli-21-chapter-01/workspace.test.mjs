import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { fresh, hydrate, openDocument, search, submit } from './chapter-model.js';
function messenger() {
  const context = vm.createContext({});
  for (const file of ['../../site-media.js','../../chat-data.js','../../chat-personas.js','../../chat-protocol.js','../../chat-fallback.js','../../chat-model.js','../../chat-photos.js','messenger-story.js']) {
    vm.runInContext(readFileSync(new URL(file, import.meta.url), 'utf8'), context);
  }
  return context;
}
test('GG finishes before the pending request; neither time nor sending can accept it', () => {
  const c = messenger(), M = c.StillwaterChatModel, s = M.fresh();
  assert.equal(s.ui.conversation, 'gg');
  for (let i = 0; i < 3; i++) M.advance(s, 2000);
  assert.equal(s.messages.filter(m => m.key?.startsWith('xueli.opening.')).length, 5);
  assert.equal(s.story.request, 'none');
  M.advance(s, 2000);
  assert.equal(s.story.request, 'pending');
  assert.equal(M.send(s, 'hello', 'wcr_new'), false);
  assert.equal(s.messages.some(m => m.conversation === 'wcr_new'), false);
  const restored = M.hydrate(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.story.request, 'pending');
  for (let i = 0; i < 5; i++) M.advance(restored, 2000);
  assert.equal(restored.messages.filter(m => m.key?.startsWith('xueli.opening.')).length, 5);
});
test('mystery lines arrive individually, survive interruption and refresh, and keep their order off-chat', () => {
  const c = messenger(), M = c.StillwaterChatModel, s = M.fresh();
  s.story.request = 'accepted';
  M.deliver(s, 'xueli.accepted'); M.deliver(s, 'xueli.accepted');
  assert.equal(s.messages.filter(m => m.conversation === 'wcr_new').length, 0);
  M.advance(s, 700);
  assert.equal(s.messages.filter(m => m.conversation === 'wcr_new').length, 1);
  assert.equal(M.send(s, '你好', 'wcr_new'), true);
  s.ui.conversation = 'wcr_new'; s.ui.drafts.wcr_new = '未发送';
  const r = M.hydrate(JSON.parse(JSON.stringify(s)));
  assert.equal(r.ui.drafts.wcr_new, '未发送');
  M.deliver(r, 'xueli.accepted');
  const expected = Array.from(c.StillwaterStoryData.batches['xueli.accepted'].keys);
  for (let i = 0; i < 40; i++) {
    const before = r.messages.filter(m => m.kind === 'story' && m.conversation === 'wcr_new').length;
    M.advance(r, 2000, { chatActive: false });
    const after = r.messages.filter(m => m.kind === 'story' && m.conversation === 'wcr_new').length;
    assert.ok(after - before <= 1);
  }
  assert.deepEqual(Array.from(r.messages.filter(m => expected.includes(m.key)).map(m => m.key)), expected);
  assert.equal(r.ui.unread.wcr_new, 13);
  assert.equal(c.StillwaterChatData.people.wcr_new.name[0], '？？？');
  assert.equal(M.deliver(r, 'xueli.accepted').length, 0);
  assert.equal(M.hydrate(JSON.parse(JSON.stringify(r))).story.opening.queue.length, 0);
});
test('searching by year or source respects the existing archive gate and never exposes the final scan', () => {
  assert.equal(search(fresh(), '2006').length, 0);
  const s = openDocument(fresh(), 'note');
  assert.ok(search(s, '2006').some(d => d.id === 'weekly'));
  assert.ok(search(s, '雪梨镇周刊').length);
  assert.equal(search(s, 'Nora').some(d => d.id === 'back'), false);
});
test('workspace, reading pane, notebook scroll, drafts and query survive one save without losing old fields', () => {
  const s = openDocument(openDocument(fresh(), 'note'), 'weekly');
  Object.assign(s, { workspace: 'computer', notebookOpen: true, notebookScroll: 280, clickSound: false, query: '青鸟', chatSearch: 'GGbond' });
  s.draft.person = '暂存'; s.scroll.weekly = 450;
  const r = hydrate(JSON.parse(JSON.stringify(s)));
  for (const key of ['workspace','clickSound','notebookOpen','notebookScroll','query','chatSearch','doc']) assert.equal(r[key], s[key]);
  assert.equal(r.draft.person, '暂存'); assert.equal(r.scroll.weekly, 450);
});
test('formal submission leaves the computer open and does not turn the photo deduction into Annie progress', () => {
  const s = { ...fresh(), workspace: 'computer', app: 'browser', doc: 'weekly', draft: { person: '朱恩', place: '青鸟', purpose: '员工合影原件' } };
  const result = submit(s);
  assert.equal(result.ok, true); assert.equal(result.state.workspace, 'computer');
  assert.equal(result.state.app, 'browser'); assert.equal(result.state.doc, 'weekly');
  assert.equal(result.state.chapter, undefined);
  assert.equal(s.completed, false);
});
