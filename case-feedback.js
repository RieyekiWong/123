/* Presentation-only help. Validation and case progression remain in case-state. */
globalThis.StillwaterCaseFeedback = ({t}) => {
  const attempts=new Map();
  const groups={reservation:'reservations',sample:'careers',booking:'reservations',inventory:'reservations','inventory-first':'rooms','message-first':'guestbook','inspect-first':'floor-plan',classification:'floor-plan','service-first':'floor-plan',maintenance:'notices','maintenance-first':'maintenance','audit-order':'night-audit','audit-assessment':'maintenance','audit-first':'night-audit','revision-unchanged':'revisions','revision-missing':'revisions','revisions-first':'revisions','closure-first':'closure','evidence-incomplete':'notes','evidence-occupancy':'guestbook','evidence-operating':'closure','evidence-consent':'mara','evidence-missing':'notes'};
  const fields={
    reservation:['编号要和招聘页的样本一致，包括前面的字母。','Match the sample’s reference, including its letter prefix.'],
    inventory:['看预订单的“登记房号”一栏。','Look at the booking’s assigned-room field.'],
    classification:['位置登记卡中有一栏写着“登记用途”。','The position card has a registered-use field.'],
    maintenance:['完整公告和位置登记卡上都有维修单编号。','The full notice and position card both carry the docket reference.'],
    'audit-order':['按每张卡的完整日期和时间，从早到晚排列。','Use the full dates and times, earliest first.'],
    'audit-assessment':['客房部查的是房间；再看看有没有记录写明客人去了哪里。','Housekeeping checked a room. Look for a record that establishes where the guest went.'],
    'revision-unchanged':['每一行左右各读一次；内容相同的不用勾。','Compare each row across both columns; leave identical rows unchecked.'],
    'revision-missing':['检查人员栏、位置栏和状态栏，别漏看换行的内容。','Check the people, position and status fields, including wrapped text.'],
    'evidence-occupancy':['区分“钥匙上写了什么”和“人实际去了哪里”。','Distinguish what a key says from where a person actually went.'],
    'evidence-operating':['把通知日期和招聘日期放在一起看。','Compare the date of the notice with the job advert.'],
    'evidence-consent':['草稿的最后一句说了能不能代签。','The last sentence of the draft addresses signing on someone’s behalf.'],
    'evidence-missing':['每一项都要在已经看过的文件里找到对应的话。','Find a supporting entry for each selected finding.']
  };
  function reset(action){attempts.delete(action);}
  function show(id,result,base,action){
    const el=document.getElementById(id);if(!el)return;
    const count=(attempts.get(action)||0)+1;attempts.set(action,count);
    el.replaceChildren(document.createTextNode(base));
    const route=groups[result.error]||'notes';
    const direction=fields[result.error]||['看一下相关文件的编号、日期和备注。','Check the reference, date and notes in the related file.'];
    const help=document.createElement('details');help.className='record-help';
    const summary=document.createElement('summary');summary.textContent=t('查找帮助','Help finding the record');
    const link=document.createElement('a');link.href='#'+route;link.textContent=t('回到相关文件','Reopen the related file');
    const text=document.createElement('p');text.textContent=t(...direction);
    help.append(summary,link,text);el.append(help);
    if(count>=2){const p=document.createElement('p');p.append(document.createTextNode(t('再看看这里：','Check this page: ')),link.cloneNode(true));el.insertBefore(p,help);}
    if(count>=3){const p=document.createElement('p');p.textContent=t(...direction);el.insertBefore(p,help);}
    el.dataset.attempt=String(Math.min(count,3));el.focus({preventScroll:true});
  }
  return {show,reset};
};
