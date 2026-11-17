/* Authored opening for the isolated chapter. Uses the existing messenger model;
   neither the production chat save nor the investigation answers are imported. */
(() => {
  const D = globalThis.StillwaterChatData;
  const messages = {}, batches = {};
  const lines = (id, room, copy) => {
    const keys = copy.map(([zh, en], i) => {
      const key = `${id}.${i}`;
      messages[key] = { person: room, room, text: [zh, en] };
      return key;
    });
    batches[id] = { room, keys };
    return keys;
  };
  const opening = lines('xueli.opening', 'gg', [
    ['在吗？', 'You there?'],
    ['那台电脑你收到了吧？', 'You received that computer, right?'],
    ['里面的东西你看过没有？', 'Have you looked through it?'],
    ['我昨天试着看了一下，王楚人这家伙到底往里面存了多少东西啊。', 'I tried yesterday. How much stuff did Wang Churen save on that thing?'],
    ['你要是发现了什么记得告诉我。', 'Tell me if you find anything.'],
  ]);
  lines('xueli.accepted', 'wcr_new', [
    ['你好。', 'Hello.'],
    ['你应该已经收到那台电脑了吧？', 'You should have received that computer by now.'],
    ['我知道你一直在找你的那位“好朋友”。', 'I know you have been looking for that “good friend” of yours.'],
    ['电脑里有些东西，或许能帮你找到他。', 'Some things on that computer might help you find him.'],
    ['不过，在告诉你更多事情之前，我得先确认一件事。', 'Before I tell you more, I need to establish something.'],
    ['你到底有没有能力查清这些东西。', 'Whether you can actually investigate these things.'],
    ['先打开那台电脑，找到「调查笔记」。', 'Open that computer and find “Investigation notes”.'],
    ['完成里面的第一道问题。', 'Complete the first question.'],
    ['如果你能找到正确答案，我会再给你一些线索。', 'If you find the right answer, I will give you more leads.'],
    ['还有一件事。', 'One more thing.'],
    ['不要把我们的对话告诉任何人。', 'Do not tell anyone about this conversation.'],
    ['尤其不要让别人知道我的存在。', 'Especially do not let anyone know I exist.'],
    ['去吧。我会知道你什么时候完成的。', 'Go. I will know when you finish.'],
  ]);
  lines('xueli.chapter-01', 'wcr_new', [
    ['看来你确实找到了一点东西。', 'You did find something after all.'],
    ['楚人约好了去青鸟照相馆看那张员工合影。但这还不能证明他真的去过。', 'Churen arranged to see the staff photograph at Bluebird Photo. That does not prove he actually went.'],
    ['电脑里还留着一份合影背面的扫描。', 'There is also a saved scan of the back of that photograph on the computer.'],
    ['看一下这份留存的扫描。留意背面的字。', 'Look at the saved scan. Pay attention to the writing on the back.'],
  ]);
  // Registered for the real Annie review event only. The photograph task is
  // deliberately not treated as Annie question 01.
  lines('xueli.annie-01', 'wcr_new', [
    ['看来你确实找到了一点东西。', 'You did find something after all.'],
    ['不过这只是开始。', 'But this is only the beginning.'],
    ['你看到的那些新闻，可能比你想象中更有用。', 'Those reports may be more useful than you think.'],
    ['接下来，我建议你去看看1996年的招聘广告。', 'Next, look at the recruitment advert from 1996.'],
    ['还有2007年发生在河湾社区中心的那件事。', 'And what happened at Riverbend Community Centre in 2007.'],
    ['找出它们之间的联系。', 'Find the connection.'],
  ]);
  D.people.wcr_new = { name: ['？？？', '？？？'] };
  D.sideChats.wcr_new = { name: ['？？？', '？？？'], avatar: 'wcr_new', messages: [], kind: 'scripted' };
  globalThis.StillwaterChatPeople.order.unshift('wcr_new');
  globalThis.StillwaterChatPhotos.push({ id: 'wcr_new', file: 'assets/emblem.svg', source: 'assets/emblem.svg', author: '404 Studio', license: 'Existing project artwork', license_url: 'assets/emblem.svg' });
  globalThis.StillwaterStoryData = { messages, batches };
  globalThis.StillwaterChatStory = { entry: key => messages[key] || null, reply: () => null };
  globalThis.StillwaterChatOpeningView = { visible: () => true, invitation: () => {}, profile: () => '' };
  globalThis.StillwaterChatOpening = {
    active: () => true,
    initialize(s) {
      s.messages = [{ id: 'm1', kind: 'story', key: opening[0], conversation: 'gg', at: s.messages[0].at }];
      s.ui.conversation = 'gg';
      s.story.opening = { edition: 'xueli-pc', elapsed: 0, queue: [], remaining: 650 };
      return s;
    },
    hydrate(s, raw) {
      const elapsed = raw.story?.opening?.elapsed;
      const rawQueue = raw.story?.opening?.queue;
      const queue = [...new Set((Array.isArray(rawQueue) ? rawQueue : []).filter(id => batches[id]?.room === 'wcr_new' && !s.story.delivered.includes(id)))];
      if (s.story.request === 'accepted' && !s.story.delivered.includes('xueli.accepted') && !queue.includes('xueli.accepted')) queue.unshift('xueli.accepted');
      const remaining = raw.story?.opening?.remaining;
      s.story.opening = { edition: 'xueli-pc', elapsed: Number.isFinite(elapsed) ? Math.max(0, Math.min(elapsed, 86400000)) : 0,
        queue, remaining: Number.isFinite(remaining) ? Math.max(0, Math.min(remaining, 3500)) : 650 };
    },
    queueBatch(s, id, batch) {
      if (batch.room !== 'wcr_new') return false;
      const o = s.story.opening;
      if (s.story.request === 'accepted' && !o.queue.includes(id)) {
        if (!o.queue.length) o.remaining = 650;
        o.queue.push(id);
      }
      return true;
    },
    advance(s, dt, { chatActive }, append) {
      const o = s.story.opening;
      let changed = false;
      // Deliver at most one line per tick, including while the old computer is
      // visible. Progress comes from retained message keys, never wall-clock
      // catch-up, so refreshing cannot replay a line or flood the conversation.
      if (s.story.request === 'accepted' && o.queue.length) {
        const id = o.queue[0], batch = batches[id];
        const key = batch.keys.find(key => !s.messages.some(m => m.key === key));
        o.remaining = Math.max(0, o.remaining - dt);
        if (!key) {
          if (!s.story.delivered.includes(id)) s.story.delivered.push(id);
          o.queue.shift(); o.remaining = 1800; changed = true;
        } else if (o.remaining === 0) {
          append(s, { kind: 'story', key, conversation: batch.room }); changed = true;
          o.remaining = Math.min(3500, 1400 + messages[key].text[0].length * 40);
          if (key === batch.keys.at(-1)) {
            s.story.delivered.push(id); o.queue.shift();
          }
        }
      }
      if (!chatActive) return changed;
      o.elapsed += dt;
      opening.forEach((key, i) => {
        if (s.story.opening.elapsed >= i * 1500 && !s.messages.some(m => m.key === key)) {
          append(s, { kind: 'story', key, conversation: 'gg' }); changed = true;
        }
      });
      if (s.story.opening.elapsed >= 8000 && s.story.request === 'none') { s.story.request = 'pending'; changed = true; }
      return changed;
    },
    batchId: (_s, id) => id,
    sideMessages: (_s, room) => D.sideChats[room]?.messages || [],
  };
})();
