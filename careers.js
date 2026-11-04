/* Company copy and list filtering only. The sample still uses the existing case event. */
globalThis.StillwaterCareers = (()=>{
 const company=[
 ["Stillwater Heritage Records 为小型机构整理旧档案。我们负责扫描纸质文件、校对编号、编制检索目录，并核查不同版本的改动。","Stillwater Heritage Records organises old files for small organisations. We scan paper documents, check reference numbers, prepare indexes and review changes between versions."],
 ["有的项目只做扫描，有的还要查清一处改动是什么时候加上的。交付时，我们会留下原件出处和核查记录，方便下一位接手。","Some projects only need scans; others need us to establish when a change was added. We leave source references and checking notes for the next person who takes over."],
 ["目前以短期项目和合同岗位为主。是否远程、具体做什么，请看各岗位说明。","Most roles are short-term or contract-based. Each listing explains the work and whether it can be done remotely."],
 ];
 const jobs=[
 {id:'archive-job',title:['预订档案整理员','Reservation Records Assistant'],kind:['合同制','Contract'],work:'remote',date:null,summary:["核对旧旅馆预订单上的房号、日期及后续改动。","Check room numbers, dates and later changes on old hotel bookings."],paragraphs:[
 ["使用电脑查看扫描件和表格，逐项核对预订编号、房号、登记时间及后续修改。无法确认的内容请保留原样，加注说明，不要猜填。","Read scans and spreadsheets on a computer, checking booking references, room numbers, registration times and later edits. Leave uncertain entries as they are and add a note. Do not guess."],
 ["可以先查看工作样本，了解具体要核对什么。无需注册，也不收取简历或个人资料。","Look through the sample to see what the checking involves. No registration, CV or personal details are needed."]],way:['远程；按项目安排','Remote; arranged per project']},
 {id:'scan-assistant',title:['纸质档案扫描助理','Document Scanning Assistant'],kind:['短期','Short-term'],work:'onsite',date:'2026-10-28',summary:['负责旧文件扫描、页码检查和基本图像整理。','Scan old documents, check page numbers and prepare the resulting images.'],paragraphs:[
 ['工作主要是检查纸张顺序、逐页扫描，并确认有没有漏页、歪斜或者无法辨认的部分。扫描完成后按既定规则命名文件，不需要修改原始内容。','Check the order of the papers, scan each page and look for missing, crooked or unreadable sections. Name the files using the agreed convention; do not change their contents.'],
 ["需要细心，能耐心完成逐页检查。地点和时间以项目通知为准。","You’ll need patience and attention to detail for page-by-page checks. The project notice gives the location and schedule."]]},
 {id:'photo-proofreader',title:['照片与说明文字校对员','Photo Caption Proofreader'],kind:['兼职','Part-time'],work:'remote',date:'2026-10-22',summary:['核对历史照片的文件名、日期和图片说明。','Check filenames, dates and captions for historical photographs.'],paragraphs:[
 ['对照照片背面、文件夹备注及已有索引，检查说明文字是否能对应上照片。遇到看不清的日期或名字，标记为待确认，不需要凭印象补写。','Compare captions with the backs of photographs, folder notes and existing indexes. Mark unclear dates or names for checking rather than adding them from memory.'],
 ["会使用常见表格工具，能按要求保留原文件名及校对记录。","You should be able to use a spreadsheet and keep original filenames and checking notes as instructed."]]},
 {id:'catalog-tester',title:['目录录入与检索测试助理','Archive Index Testing Assistant'],kind:['项目制','Project-based'],work:'remote',date:'2026-10-09',summary:['检查一批电子档案是否能按编号、日期和关键词正确检索。','Check that electronic records can be found by reference, date and keyword.'],paragraphs:[
 ['工作内容包括输入现成的档案目录、核对字段名称，以及根据测试清单检查搜索结果。发现重复条目或链接失效时，记录具体编号并提交给项目负责人。','Enter existing archive indexes, check field names and work through a search test checklist. Record the references for duplicate entries or broken links and pass them to the project lead.'],
 ["此岗位已结束招募，职位说明留作查阅。","Applications are closed. The description is kept here for reference."]]},
 ];
 const updates=[
 ['2026-11-01',["旧预订资料整理项目开始招募。工作样本已开放，可先查看。","Recruitment is open for the old booking-records project. The sample is now available to view."]],
 ['2026-10-28',["纸质档案扫描项目已招满，不再接受申请。","The document scanning project is fully staffed. Applications are closed."]],
 ['2026-10-22',["照片说明校对项目招募结束，职位说明仍可查看。","Recruitment for photo caption proofreading has ended. The description is still available."]],
 ];
 const faq=[
 [['需要先上传简历吗？','Do I need to upload a CV first?'],["不用。直接打开样本就能查看，不需要注册或上传简历。","No. You can open the sample without registering or uploading a CV."]],
 [['所有岗位都能远程完成吗？','Can every role be done remotely?'],["不是。扫描等需要接触原件的工作通常要到现场，请看岗位里的工作方式。","No. Scanning and other work with physical originals usually require you to be on site. Check the work arrangement in the listing."]],
 [['整理档案时遇到看不清的信息怎么办？','What if something in a record is unreadable?'],["原样保留，把看不清的地方标出来，不要猜着补上。","Leave it as it is and mark the part you can’t read. Don’t fill it in from a guess."]],
 [['为什么有些岗位还在列表里，却不能申请？','Why are closed roles still listed?'],["项目结束后，职位说明会留档，方便查阅当时的工作要求。","We keep descriptions after a project closes so its requirements can still be checked."]],
 ];
 function render({t,esc,state,facts:F}) {
  const withdrawn=state.lastEnding==='released',place=work=>work==='remote'?t('远程','Remote'):t('现场','On site');
  const cards=jobs.map((job,index)=>{
   const status=index===0?(withdrawn?t('岗位已撤下','Vacancy withdrawn'):t('招募中','Open')):t('招募已结束','Recruitment closed');
   const searchable=[...job.title,...job.kind,...job.summary,...job.paragraphs.flat(),...(job.way||[]),index===0?F.reservation:''].join(' ').normalize('NFKC').toLowerCase();
   return `<article class="job-card" id="${job.id}" data-job-work="${job.work}" data-job-search="${esc(searchable)}" data-job-status="${index===0&&!withdrawn?'open':'closed'}"><header><p class="kicker">${esc(t(...job.kind))} · ${place(job.work)} · <span class="job-status ${index===0&&!withdrawn?'job-status-open':''}">${status}</span></p><h2>${esc(t(...job.title))}</h2><p>${esc(t(...job.summary))}</p></header>${index===0?`<p class="job-method">${t('工作方式','Arrangement')}：${esc(t(...job.way))} · ${esc(F.recruitment)}</p>${withdrawn?`<p class="job-withdrawn">${t("该岗位已撤下，工作样本也已关闭。","This vacancy has been withdrawn and the sample is closed.")} <a href="#forum?topic=job">${t('返回论坛讨论','Return to the forum thread')}</a></p>`:`<p>${t('样本档案','Sample case')}: <span class="reference">${F.reservation}</span></p><button class="primary" data-case-action="sample">${t('查看工作样本','Review sample record')} →</button>`}`:`<p class="job-archived-date">${t('归档日期','Archived')}: <time>${job.date}</time></p>`}<details><summary>${index===0?t('工作内容','Role details & company information'):t('查看岗位说明','View role description')}</summary>${job.paragraphs.map(text=>`<p>${esc(t(...text))}</p>`).join('')}${index>0?`<p class="job-closed-note">${t('此岗位已结束招募','Recruitment for this role has ended.')}</p>`:''}</details></article>`;
  }).join('');
  return `<section class="career-company"><div><p class="kicker">STILLWATER HERITAGE RECORDS</p><h1>${t("把旧资料整理清楚","Old records, put in order")}</h1><p>${esc(t(...company[0]))}</p><details class="career-company-about"><summary>${t("我们做什么","What we do")}</summary>${company.slice(1).map(text=>`<p>${esc(t(...text))}</p>`).join('')}</details></div><div class="career-scanner-art" role="img" aria-label="${t('纸质档案和扫描仪的线条插画','A line illustration of paper files and a scanner')}"><span class="scanner-page"><i></i><i></i><i></i></span><span class="scanner-machine"></span><span class="scanner-box">SH / RECORDS</span></div></section><section class="career-workflow" aria-label="${t('资料整理流程','Our process')}">${[[['接收资料','Receive'],["核对文件清单，确认来源和交付格式。",'Confirm the file list, sources and delivery format.']],[['整理与校对','Organise & check'],["扫描、命名，再对照原件检查；发现问题就做备注。",'Scan, name and compare with originals. Note any issues.']],[['交付归档','Deliver & archive'],["交付整理后的文件，同时保留版本和核查记录。",'Retain versions and checking records for future reference.']]].map(([title,copy],i)=>`<article><span aria-hidden="true">0${i+1}</span><h2>${t(...title)}</h2><p>${t(...copy)}</p></article>`).join('')}</section><section class="career-list-heading"><h2>${t('岗位信息','Opportunities')}</h2><p>${t("正在招募和已经结束的岗位都列在这里。","Open and closed project roles are listed below.")}</p></section><form id="job-search" class="job-search"><label for="job-keyword">${t('搜索岗位','Search roles')}</label><div><input id="job-keyword" name="keyword" type="search" placeholder="${t('职位名称或工作内容','Role or area of work')}"><select name="work" aria-label="${t('工作方式','Work arrangement')}"><option value="all">${t('全部工作方式','All arrangements')}</option><option value="remote">${t('远程','Remote')}</option><option value="onsite">${t('现场','On site')}</option></select><button type="submit">${t('搜索','Search')}</button><button type="button" class="career-reset" data-job-reset>${t('清除筛选','Clear filters')}</button></div></form><p id="job-result" role="status">${t('找到 4 个岗位。','4 opportunities found.')}</p><div class="career-content-layout"><div class="career-job-list">${cards}</div><aside class="career-news"><h2>${t('招聘信息更新','Recruitment updates')}</h2>${updates.map(([date,text])=>`<article><time>${date}</time><p>${esc(t(...text))}</p></article>`).join('')}</aside></div><section class="career-faq"><h2>${t('常见问题','Frequently asked questions')}</h2>${faq.map(([question,answer])=>`<details><summary>${esc(t(...question))}</summary><p>${esc(t(...answer))}</p></details>`).join('')}</section>`;
 }
 function filter(form) {
  const zh=document.documentElement.lang==='zh-CN',words=form.elements.keyword.value.trim().normalize('NFKC').toLowerCase().split(/\s+/).filter(Boolean),work=form.elements.work.value;
  let count=0;for(const card of document.querySelectorAll('.career-job-list [data-job-work]')){
   const match=(work==='all'||card.dataset.jobWork===work)&&words.every(word=>card.dataset.jobSearch.includes(word));card.hidden=!match;if(match)count++;
  }
  document.querySelector('#job-result').textContent=count?(zh?`找到 ${count} 个岗位。`:`${count} ${count===1?'opportunity':'opportunities'} found.`):(zh?"没有找到符合条件的岗位，换个关键词试试。":'No matching roles. Adjust the search.');
 }
 globalThis.document?.addEventListener('change',event=>{if(event.target.matches('#job-search [name=work]'))filter(event.target.form);});
 globalThis.document?.addEventListener('click',event=>{const button=event.target.closest('[data-job-reset]');if(button){button.form.reset();filter(button.form);}});
 return {render,filter,data:{company,jobs,updates,faq}};
})();
