/* Register actual completed chapters here; never infer progress from a message. */
export const CHAPTER_MAIL = {
  'chapter-01': { batch: 'xueli.chapter-01', title: { zh: '第一章调查已完成', en: 'Chapter one reviewed' } },
};
export function chapterVerified(state, id) {
  return id === 'chapter-01' && state.completed === true;
}
export function announceChapter(state, id) {
  if (!CHAPTER_MAIL[id] || !chapterVerified(state, id)) return false;
  state.chapterMail ||= {};
  if (state.chapterMail[id]?.announced) return false;
  state.chapterMail[id] = { announced: true, read: false };
  return true;
}
export function restoreChapterMail(raw, state) {
  const mail = {};
  for (const id of Object.keys(CHAPTER_MAIL)) {
    if (chapterVerified(state, id) && raw?.[id]?.announced === true) mail[id] = { announced: true, read: raw[id].read === true };
  }
  return mail;
}
