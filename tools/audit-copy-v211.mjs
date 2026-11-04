/* Audit the current edition's copy without touching chat, authored threads or logic. */
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {parse} from 'acorn';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {V2_FILES} from '../site-files.mjs';
import {inventory} from './copy-inventory.mjs';
const base='d76d6857092e1758d3dbd605ade321854e182f21';
const old=file=>execFileSync('git',['show',base+':'+file],{encoding:'utf8'});
const excluded=file=>file.startsWith('chat-')||['forum-data.js','forum-extra-data.js','haunt-preview.html'].includes(file);
const scope=V2_FILES.filter(f=>/\.(js|html)$/.test(f)&&!excluded(f));
const before=Object.fromEntries(scope.map(file=>[file,old(file)]));
const after=Object.fromEntries(await Promise.all(scope.map(async file=>[file,await readFile(file,'utf8')])));
const skip=new Set(['loc','start','end','raw']);
function shape(node) {
 if(Array.isArray(node))return node.map(shape);
 if(!node||typeof node!=='object')return node;
 return Object.fromEntries(Object.entries(node).filter(([key])=>!skip.has(key)).map(([key,value])=>[key,
  node.type==='Literal'&&key==='value'&&typeof value==='string'?'[COPY]':node.type==='TemplateElement'&&key==='value'?'[TEMPLATE COPY]':shape(value)]));
}
function strings(ast) {
 const result=[];
 const walk=n=>{if(!n||typeof n!=='object')return;
  if(n.type==='Literal'&&typeof n.value==='string')result.push({text:n.value,line:n.loc.start.line,kind:'literal'});
  if(n.type==='TemplateElement')result.push({text:n.value.cooked||n.value.raw,line:n.loc.start.line,kind:'template'});
  for(const [key,v]of Object.entries(n)){if(skip.has(key))continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}
 };walk(ast);return result;
}
const edits=[];let checked=0;
for(const file of scope.filter(f=>f.endsWith('.js'))) {
 const a=parse(before[file],{ecmaVersion:'latest',sourceType:'script',locations:true}),b=parse(after[file],{ecmaVersion:'latest',sourceType:'script',locations:true});
 assert.deepEqual(shape(b),shape(a),file+': non-copy AST changed');checked++;
 const x=strings(a),y=strings(b);assert.equal(x.length,y.length,file);
 for(let i=0;i<x.length;i++)if(x[i].text!==y[i].text)edits.push({file,lineBefore:x[i].line,lineAfter:y[i].line,kind:x[i].kind,language:/[\u3400-\u9fff]/.test(x[i].text)?'zh':'en',before:x[i].text,after:y[i].text});
}
const baselineFiles=execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n');
const protectedFiles=baselineFiles.filter(f=>/^chat-/.test(f)||f.startsWith('workers/chat/')||['forum-data.js','forum-extra-data.js','case-data.js','case-state.js','case-night-model.js','case-void-model.js','cctv-scenes.js','site-media.js'].includes(f));
const hashes=[];
for(const file of protectedFiles){const a=execFileSync('git',['show',base+':'+file]),b=await readFile(file);assert.ok(a.equals(b),'protected file changed: '+file);hashes.push({file,sha256:createHash('sha256').update(b).digest('hex')});}
const run=(source,name)=>{const ctx={};vm.runInNewContext(source,ctx);return JSON.parse(JSON.stringify(ctx[name]));};
assert.deepEqual(run(after['hotel-extras.js'],'StillwaterHotelExtras').guests,run(before['hotel-extras.js'],'StillwaterHotelExtras').guests,'authored ordinary guest entries changed');
const oldJobs=run(before['careers.js'],'StillwaterCareers').data.jobs,newJobs=run(after['careers.js'],'StillwaterCareers').data.jobs;
const jobFacts=jobs=>jobs.map(({id,title,kind,work,date,way})=>({id,title,kind,work,date,way}));assert.deepEqual(jobFacts(newJobs),jobFacts(oldJobs),'job identities or arrangements changed');
const beforeRows=inventory(before),afterRows=inventory(after);
const voices={
 'ad-data.js':'店铺各自的口气；保留优惠、商品和虚构说明，减少硬凑段子',
 'ad-campaigns.js':'千禧年弹窗广告；保留夸张标题，按钮直接说明会打开什么',
 'ad-system.js':'收藏与来源界面；状态简短，保存位置准确',
 'forum.js':'论坛界面；目录和站务用语口语化，不改帖子和评论',
 'careers.js':'招聘方；工作对象、要求和招募状态写清楚',
 'hotel-extras.js':'前台与图片说明；简短友好，住客原稿不动',
 'case-pages.js':'酒店官网、档案与 Mara 备注；按说话者区分语气',
 'case-app.js':'状态与报错；直接说明对象和可重试操作',
 'case-feedback.js':'折叠帮助；减少抽象术语，原有线索指向不变',
 'case-comfort.js':'设置；准确交代声音、存档及重开影响',
 'case-welcome.js':'游玩说明；拆短长句，避免把酒店留言与在线聊天混淆',
 'case-night.js':'维修和控制室；明确接口、步骤与保存前提',
 'case-space.js':'走廊观察；写看得见的变化，不补剧情旁白',
 'case-void.js':'纯黑空间；保留短句，讲清点击与返回路径',
 'case-ending.js':'完成界面；明确结束，不在无法持久保存时宣称已保存',
};
const rows=beforeRows.map(row=>{
 const change=edits.find(e=>e.file===row.file&&e.language==='zh'&&e.before===row.text&&e.lineBefore===row.line);
 return {...row,after:change?.after||row.text,changed:!!change,review:change?(voices[row.file]||'按场景调整表达'):'保留：字段、编号、标签、素材事实或已自然的原文'};
});
const summary={baseline:base,reviewedChineseOccurrences:rows.length,reviewedFiles:scope.length,nonCopyASTFilesVerified:checked,changedOccurrences:edits.length,changedChineseOccurrences:edits.filter(e=>e.language==='zh').length,changedEnglishOccurrences:edits.filter(e=>e.language==='en').length,changedFiles:[...new Set(edits.map(e=>e.file))],protectedFilesVerified:protectedFiles.length,authoredHotelGuestEntriesPreserved:4,jobIdentitiesPreserved:true,forumThreadsAndRepliesPreserved:true,chatAndBackendPreserved:true};
await writeFile('docs/v2.11/copy-changes.json',JSON.stringify(edits,null,2));
await writeFile('docs/v2.11/copy-review.json',JSON.stringify(rows,null,2));
await writeFile('docs/v2.11/protected-files.json',JSON.stringify(hashes,null,2));
await writeFile('docs/v2.11/copy-summary.json',JSON.stringify(summary,null,2));
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('|','&#124;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\n','<br>');
let report=`# V2.11 中文文案逐页审查\n\n基线：${base}。本轮检查新版公开网页、广告、设置、档案、监控和终章；微信聊天及其 AI 后端、论坛帖子和评论排除在修改范围之外。\n\n按出现位置清点了 ${rows.length} 处含中文片段（包括标签、属性和重复项，不是独立句子数）。实际改动 ${edits.length} 处文本：中文 ${summary.changedChineseOccurrences} 处、英文 ${summary.changedEnglishOccurrences} 处，分布于 ${summary.changedFiles.length} 个文件。所有 ${checked} 个被审查的 JavaScript 文件均通过去除字符串后的 AST 比对：没有改动流程、条件、数字常量或事件结构。另有 ${protectedFiles.length} 个文件逐字节一致，含全部微信文件、AI 后端、帖子数据、案件事实、存档与谜题模型。\n\n招聘的四个岗位名称、编号、日期、工作方式保留；四篇已有普通住客留言也保持原稿。没有新增现实统计、品牌背书、收费承诺或剧情事实。旅行广告原先一边写“一日游”，一边写“周六去、周日回”，本轮统一为周末一日、当天往返。\n\n## 各处语气\n\n`;
for(const [file,voice]of Object.entries(voices))report+=`- ${file}：${voice}。\n`;
report+='\n## 全部中文片段\n\n此表表示源码审阅，不冒充每个隐藏状态都已逐字在浏览器命中。运行检查另见版本验证报告。\n\n| 文件及基线行号 | 原文 | 当前文字 | 处理 |\n|---|---|---|---|\n';
for(const row of rows)report+=`| ${row.file}:${row.line} | ${escape(row.text)} | ${escape(row.after)} | ${escape(row.review)} |\n`;
report+='\n## 英文配套修改\n\n| 文件及基线行号 | 原文 | 修改后 |\n|---|---|---|\n';
for(const e of edits.filter(e=>e.language==='en'))report+=`| ${e.file}:${e.lineBefore} | ${escape(e.before)} | ${escape(e.after)} |\n`;
await writeFile('docs/V2_11-COPY-REVIEW.zh-CN.md',report);
console.log(JSON.stringify(summary));
