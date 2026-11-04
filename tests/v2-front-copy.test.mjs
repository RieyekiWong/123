import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import '../forum-data.js';
const original=globalThis.StillwaterForumData;
await import('../forum-extra-data.js');
await import('../careers.js');
await import('../hotel-extras.js');
const brief=readFileSync(new URL('../docs/briefs/FRONT-SITES-2026-11-03.zh-CN.md',import.meta.url),'utf8');
test('the supplied eight complete Chinese threads and 44 replies are preserved verbatim, alongside all original topics',()=>{
 const all=globalThis.StillwaterForumData;assert.equal(all.length,15);assert.deepEqual(all.slice(0,6),original);
 let replies=0;
 for(let n=1;n<=8;n++){
  const block=brief.match(new RegExp('### F0'+n+' ·[\\s\\S]*?(?=\\n### |\\n## 04)'))[0];
  const id=block.match(/ID：`([^`]+)`/)[1],post=all.find(p=>p.id===id);
  assert.equal(post.title[0],block.match(/- 标题：\*\*「(.*?)」\*\*/)[1]);
  assert.equal(post.user[0],block.match(/作者：`([^`]+)`/)[1]);assert.equal(post.at,block.match(/时间：`([^`]+)`/)[1]);
  assert.deepEqual(post.paragraphs.map(p=>p[0]),[...block.matchAll(/^  > (.+)$/gm)].map(m=>m[1]));
  const floors=[...block.matchAll(/^  \d+\. `([^`]+)`：\*\*「(.*?)」\*\*/gm)];
  assert.deepEqual(post.replies.map(([user,text])=>[user[0],text[0]]),floors.map(m=>[m[1],m[2]]));
  for(const text of [post.title,...post.paragraphs,...post.replies.map(reply=>reply[1])])assert.ok(text[1]?.trim());
  assert.doesNotMatch(JSON.stringify(post),/317|R-4829|E-014|Continuity|Mara/);replies+=post.replies.length;
 }
 assert.equal(replies,44);assert.equal(all.find(p=>p.id==='welcome-rules').replies.length,0);
});
test('edited recruitment copy retains the supplied roles and bilingual content; ordinary guest entries stay verbatim',()=>{
 const {company,jobs,updates,faq}=StillwaterCareers.data;
 assert.equal(jobs.length,4);assert.deepEqual(jobs.map(j=>j.work),['remote','onsite','remote','remote']);
 assert.deepEqual(jobs.map(j=>j.id),['archive-job','scan-assistant','photo-proofreader','catalog-tester']);
 assert.deepEqual(jobs.map(j=>j.date),[null,'2026-10-28','2026-10-22','2026-10-09']);
 for(const job of jobs)assert.ok(brief.includes(job.title[0]));
 assert.ok(company[0][0].includes('Stillwater Heritage Records'));
 for(const copy of [...company,...jobs.flatMap(j=>[j.title,j.summary,...j.paragraphs]),...updates.map(u=>u[1]),...faq.flat()]){assert.ok(copy[0]?.trim());assert.ok(copy[1]?.trim());}
 assert.equal(StillwaterHotelExtras.guests.length,4);
 for(const guest of StillwaterHotelExtras.guests){assert.ok(brief.includes(guest.name+'｜'+guest.at));assert.ok(brief.includes(guest.text[0]));assert.ok(guest.at<'2006-10-17');assert.ok(guest.text[1]);}
});
