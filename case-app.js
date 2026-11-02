(() => {
  'use strict';
  const D=window.StillwaterCaseData, M=window.StillwaterCaseState, F=D.facts;
  const zh=document.documentElement.lang==='zh-CN', t=(a,b)=>zh?a:b;
  const KEY='stillwater-case:v2';
  let state=M.fresh();
  try {state=M.hydrate(JSON.parse(localStorage.getItem(KEY)));} catch {}
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function save(){try {localStorage.setItem(KEY,JSON.stringify(state));}catch{document.querySelector('#case-status').textContent=t('无法保存到本设备，可在当前标签页继续。','Storage is unavailable; continue in this tab.');}}
  const a=(route,label,cls='')=>`<a class="${cls}" href="#${route}">${label}</a>`;
  function careers(){return `<section class="career-heading"><p class="kicker">STILLWATER HERITAGE RECORDS</p><h1>${t('让旧档案，得到认真对待。','A careful eye for the historical record.')}</h1><p>${t('远程档案整理与复核岗位。','Remote opportunities in archive reconciliation.')}</p></section><form id="job-search" class="job-search"><label for="job-keyword">${t('搜索岗位','Search roles')}</label><div><input id="job-keyword" name="keyword" type="search" placeholder="${t('职位名称或工作内容','Role or area of work')}"><select name="work" aria-label="${t('工作方式','Work arrangement')}"><option value="remote">${t('远程','Remote')}</option><option value="onsite">${t('现场','On site')}</option></select><button type="submit">${t('搜索','Search')}</button></div></form><p id="job-result" role="status"></p><article class="job-card" id="archive-job"><p class="kicker">${t('合同制 · 远程','CONTRACT · REMOTE')}</p><h2>${t('历史档案复核员','Night Archive Reconciliation Assistant')}</h2><p>${t('整理一处已停业湖畔酒店的预订资料。','Help digitize reservation records from a closed lakeside hotel.')}</p><p>${t('先通过一份记录匹配样本了解工作。','Start with a short record-matching sample.')}</p><p>${t('样本档案','Sample case')}: <span class="reference">${F.reservation}</span></p><button class="primary" data-case-action="sample">${t('查看样本资料','Review sample record')} →</button><details><summary>${t('岗位详情与公司介绍','Role details & company information')}</summary><p>${t('工作包括核对来源、整理时间、比较历史修订和保留无法证实的项目。样本不需要简历、账号或联系方式。','Review sources, reconcile timestamps, compare revisions and retain unresolved entries. No CV, account or contact information is needed for the sample.')}</p><p>Stillwater Heritage Records · ${F.recruitment}</p></details></article>`;}
  const views=window.StillwaterCaseViews({t,esc,getState:()=>state});
  function render(){let route=location.hash.slice(1).split('?')[0]||'careers';if(route==='home')route='hotel';const old=['below','surveillance','employees','guide'];if(old.includes(route)){location.replace((zh?'classic-zh.html':'classic.html')+location.hash);return;}
    document.body.dataset.site=route==='careers'?'careers':'hotel';
    const content=({careers,...views})[route]||views.hotel;
    if(route==='rooms'&&!state.notices.shown){state.notices.shown=true;save();}
    document.querySelector('#case-shell').innerHTML=`<header class="site-header"><a class="site-brand" href="#${route==='careers'?'careers':'hotel'}">${route==='careers'?'Stillwater Heritage Careers':'The Stillwater Hotel'}</a><a data-case-language href="${zh?'index.html':'index-zh.html'}${location.hash}">${zh?'English':'简体中文'}</a></header>${route==='careers'?'<nav class="careers-nav">'+a('careers',t('工作机会','Opportunities'))+'</nav>':'<nav class="hotel-nav">'+a('hotel',t('首页','Home'))+a('rooms',t('客房','Rooms'))+a('reservations',t('预订查询','Reservations'))+a('contact',t('联系前台','Contact'))+'</nav>'}<main id="content" tabindex="-1">${content()}</main><footer><p>${t('虚构互动作品。酒店、招聘和资料均为剧情，不接收真实申请或付款。','A fictional interactive work. The hotel, role and records are part of the story. No real applications or payments are accepted.')}</p>${a('careers',t('招聘主页','Careers'))} · ${a('guestbook',t('住客留言','Guestbook'))} · ${a('history',t('历史资料','History'))} · ${a('notices',t('旧公告','Notices'))} · ${a('staff',t('员工档案','Staff archive'))} · ${a('notes','Case Notes')} · <a href="${zh?'classic-zh.html':'classic.html'}">${t('上一版与原存档','Previous edition & saved stay')}</a></footer>`;
  }
  function refresh(){render();}
  document.addEventListener('click',e=>{const action=e.target.closest('[data-case-action]')?.dataset.caseAction;
    if(action==='sample'){M.record(state,'C1');save();location.hash='hotel';}
    if(action==='read-key'){M.record(state,'C4');save();refresh();}
    if(action==='inspect-service'){state.completed.serviceInspected=true;save();refresh();document.querySelector('#service-classification')?.scrollIntoView({block:'center'});}
    if(action==='dismiss-notice'){state.notices.dismissed=true;save();refresh();}
    if(action==='reopen-notice'){state.notices.dismissed=false;save();location.hash='rooms';}
  });
  document.addEventListener('submit',e=>{
    const form=e.target;
    if(form.id==='job-search'){e.preventDefault();const keyword=form.keyword.value.trim().toLowerCase();const match=form.work.value==='remote'&&(!keyword||/档案|复核|记录|night|archive|record|reconcil/.test(keyword));document.querySelector('#archive-job').hidden=!match;document.querySelector('#job-result').textContent=match?t('找到 1 个岗位。','1 opportunity found.'):t('没有匹配岗位，请调整筛选。','No matching roles. Adjust the search.');}
    if(form.id==='reservation-search'){e.preventDefault();state.drafts.reservation=form.reference.value;save();if(form.reference.value.trim().toUpperCase()!==F.reservation){document.querySelector('#reservation-error').textContent=t('未找到该编号，请核对样本资料上的原编号。','No record found. Check the reference on the original sample.');return;}M.record(state,'C2');save();refresh();}
    if(form.id==='inventory-check'){e.preventDefault();if(form.room.value!==F.bookedRoom){document.querySelector('#inventory-error').textContent=t('这不是原预订单上的分配房号，请回看原记录。','This is not the assignment on the original booking. Check that record.');return;}M.record(state,'C3');save();refresh();}
    if(form.id==='service-classification'){e.preventDefault();if(form.classification.value!=='service'){document.querySelector('#service-error').textContent=t('请核对位置登记卡的用途，门牌或钥匙不能证明真实入住。','Compare the position card’s registered use. A door or key label does not establish occupancy.');return;}M.record(state,'C5');save();refresh();}
    if(form.id==='maintenance-search'){e.preventDefault();state.drafts.maintenance=form.reference.value;save();if(form.reference.value.trim().toUpperCase()!==F.notice){document.querySelector('#maintenance-error').textContent=t('未找到这份维修单。请核对原公告的编号。','No docket found. Check the reference on the original notice.');return;}M.record(state,'C6');save();refresh();}
  });
  window.addEventListener('hashchange',()=>{render();document.querySelector('main')?.focus();});render();
})();
