/* Read-only community pages. Thread browsing never changes investigation progress. */
globalThis.StillwaterForum = ({t,esc,getState,posts=globalThis.StillwaterForumData,base='#forum',postExtras=()=>''}) => {
 const photos=globalThis.StillwaterForumAvatars||[];
 const photoByUser=new Map(photos.map(photo=>[photo.id,photo]));
 const boards={chat:['闲聊','Chat'],work:['工作信息','Work notices'],web:['老网站','Old websites'],help:['求助','Help']};
 const descriptions={chat:['聊什么都行，别刷屏','Talk about anything. Don’t flood the page.'],work:["交流找工作的事，招聘信息请自己核实","Talk about looking for work. Check any listing before you trust it."],web:["还能打开的老网页，发来看看","Found an old site that still opens? Post it here."],help:["哪里出问题了、试过什么，尽量说清楚","Say what went wrong and what you’ve tried."]};
 const threadLink=p=>`${base}?topic=${p.id}`;
 const cleanName=name=>name.replace('（楼主）','').replace(' (OP)','');
 function avatar(user,initial='') {
  const name=cleanName(user[0]),photo=photoByUser.get(cleanName(user[1]));
  const fallback=esc(initial||name.slice(0,1));
  const art=photo?`<span class="bbs-avatar-fallback">${fallback}</span><img class="bbs-avatar-image" src="${esc(photo.file)}" style="object-position:${esc(photo.position)}" width="29" height="29" alt="" loading="lazy" decoding="async">`:fallback;
  const color=[...name].reduce((sum,c)=>sum+c.codePointAt(0),0)%5;
  return `<span class="bbs-avatar bbs-avatar-${photo?'photo':'letter'} bbs-avatar-tone-${color}" aria-hidden="true">${art}</span><strong>${esc(t(...user))}</strong>`;
 }
 function avatarCredits() {
  if(!photos.length)return '';
  return `<details class="bbs-avatar-credits"><summary>${t('头像来源','Avatar credits')}</summary><p>${t('图片仅作虚构网友头像，与照片中的人物及作者无关。','These images represent fictional accounts. The pictured people and artists aren’t connected with the posts.')}</p><ul>${photos.map(photo=>`<li>${esc(t(photo.name,photo.id))} · <a href="${esc(photo.source)}" target="_blank" rel="noopener noreferrer">${esc(photo.title)}</a> · ${esc(photo.author)} · <a href="${esc(photo.license_url)}" target="_blank" rel="noopener noreferrer">${esc(photo.license)}</a></li>`).join('')}</ul><a href="assets/forum-avatars/credits.json" target="_blank" rel="noopener">${t('全部头像素材记录','Full avatar asset record')}</a></details>`;
 }
 const isUpdate=p=>p.id==='job'&&getState().endings.length>0;
 const count=p=>p.replies.length+(isUpdate(p)?1:0);
 function replyTime(p,index) {
  return new Date(Date.parse(p.at.replace(' ','T')+'Z')+(index+1)*8*60000).toISOString().slice(0,16).replace('T',' ');
 }
 function row(p) {
  const last=isUpdate(p)?p.user:(p.replies.at(-1)?.[0]||p.user),time=isUpdate(p)?t('后续更新','Later update'):p.replies.length?replyTime(p,p.replies.length-1):p.at;
  return `<tr class="${p.id==='job'||p.pinned?'bbs-pinned-row':''}" data-forum-topic="${p.id}"><td><span class="bbs-topic-icon" aria-hidden="true">${p.id==='job'?'▤':p.pinned?'☾':'▱'}</span><a class="bbs-topic-link" href="${threadLink(p)}">${esc(t(...p.title))}</a>${p.pinned?` <span class="bbs-pin-label">${t('置顶','PINNED')}</span>`:''}<span class="bbs-mobile-meta">${esc(t(...p.user))} · ${p.at}<br>${t('最后回复','Last reply')}: ${esc(t(...last))} · ${time}</span></td><td>${p.sections.map(id=>`<a class="bbs-section-tag" href="${base}?section=${id}">${t(...boards[id])}</a>`).join(' ')}</td><td><div class="bbs-index-author">${avatar(p.user,p.avatar)}</div><time>${p.at}</time></td><td>${esc(t(...last))}<time>${time}</time></td><td class="bbs-thread-count"><b>${count(p)}</b><span>${p.views} ${t('浏览','views')}</span></td></tr>`;
 }
 function sidebar(post) {
  const related=posts.filter(p=>p.id!==post?.id).sort((a,b)=>b.views-a.views).slice(0,6);
  return `<aside class="bbs-sidebar"><section><h2>${post?t('相关讨论','More discussions'):t('今日热门','Popular today')}</h2><ul>${related.map(p=>`<li><a href="${threadLink(p)}">${esc(t(...p.title))}</a></li>`).join('')}</ul><a class="bbs-directory-link" href="${base}?view=topics">${t('查看全部主题','All topics')} →</a></section><section class="bbs-night-clock"><h2>☾ ${t('夜猫时间','Night owl hours')}</h2><p>${t("白天忙，晚上才有空刷会儿帖子。","A few threads to catch up on after a busy day.")}</p><a href="${base}?topic=welcome-rules">${t('新来的看一下','New here? Read this')}</a></section><section class="bbs-about"><h2>${t('关于这里','Around here')}</h2><p>${t("找工作、折腾电脑，或者随便聊两句。看帖不用登录。","Jobs, computer trouble, or just a chat. You don’t need to sign in to read.")}</p><p>${t("目前只能看帖，回复暂时关了。","You can read the threads, but replies are closed for now.")}</p></section></aside>`;
 }
 function illustration(post) {
  if(post.extraIllustration==='monitor')return `<figure class="bbs-attachment"><div class="bbs-monitor-diagram" role="img" aria-label="${t('黑色显示器右下角有一片明显漏光','A dark monitor with a bright patch in the lower-right corner')}"><div></div></div><figcaption>${t('楼主补的示意图','The OP’s diagram')}</figcaption></figure>`;
  if(post.extraIllustration==='brochure')return `<figure class="bbs-attachment"><div class="bbs-brochure-diagram" role="img" aria-label="${t('一份普通的三折旅行小册子示意图','An illustrated three-panel travel leaflet')}"><span>LAKESIDE<br>WEEKEND<small>ROOMS · WALKS · BREAKFAST</small></span><span aria-hidden="true">⌂<i></i></span><span>HOW TO<br>FIND US<small>→ → →</small></span></div><figcaption>${t('按楼主描述画的示意图','Illustration based on the OP’s description')}</figcaption></figure>`;
  if(post.illustration)return `<figure class="bbs-dinner"><svg viewBox="0 0 240 125" role="img" aria-label="${t('楼主补画的煎蛋盖饭','A community drawing of egg over rice')}"><ellipse cx="120" cy="80" rx="90" ry="32" fill="#cbd9df"/><ellipse cx="120" cy="72" rx="76" ry="29" fill="#fff9e6"/><path d="M65 67Q75 33 100 52Q125 30 145 47Q183 44 176 75Q145 100 106 86Q60 90 65 67" fill="#fff"/><ellipse cx="121" cy="64" rx="21" ry="17" fill="#e5b849"/></svg><figcaption>${t('图片：楼主的手绘补图。饭已经吃完了。','Illustration added by the OP. Dinner has already been eaten.')}</figcaption></figure>`;
  return '';
 }
 function renderPage() {
  const params=new URLSearchParams(location.hash.split('?')[1]||''),section=params.get('section'),id=params.get('topic');
  const list=(section?posts.filter(p=>p.sections.includes(section)):posts).slice().sort((a,b)=>(b.id==='job'?2:b.pinned?1:0)-(a.id==='job'?2:a.pinned?1:0)||b.at.localeCompare(a.at));
  const post=posts.find(p=>p.id===id);
  if(!id)return `<div class="bbs-breadcrumb">${t('夜猫论坛','Night Owl BBS')} / ${section&&boards[section]?t(...boards[section]):t('主题目录','Topic index')}</div><div class="bbs-layout"><article class="bbs-post bbs-directory"><header><p class="bbs-tag">NIGHT OWL BBS · ${t('只读社区','READ-ONLY COMMUNITY')}</p><h1>${section&&boards[section]?t(...boards[section]):t('所有话题','All topics')}</h1><p class="bbs-section-description">${section&&descriptions[section]?t(...descriptions[section]):t("聊工作，聊电脑，也聊今天碰上的小事。","Work, computers, and whatever happened today.")}</p><div class="bbs-directory-tools"><span>${list.length} ${t('个主题','topics')}</span><a href="${base}?topic=welcome-rules">${t('置顶：论坛小规矩','Pinned: Forum rules')}</a></div></header><div class="bbs-topic-scroll"><table class="bbs-topic-table"><thead><tr><th>${t('主题','Topic')}</th><th>${t('分区','Board')}</th><th>${t('发帖人 / 时间','Author / posted')}</th><th>${t('最后回复','Last reply')}</th><th>${t('回复 / 浏览','Replies / views')}</th></tr></thead><tbody>${list.map(row).join('')}</tbody></table>${!list.length?`<p class="bbs-empty">${t("这个分区还没有帖子。","No threads in this board yet.")} <a href="${base}?view=topics">${t('查看全部','View all')}</a></p>`:''}</div></article>${sidebar()}</div>`;
  if(!post)return `<article class="bbs-post"><h1>${t("这篇帖子找不到了","This thread couldn’t be found")}</h1><p><a href="${base}?view=topics">${t('返回主题目录','Back to all topics')}</a></p></article>`;
  const replies=post.replies.map(([user,text],i)=>`<article class="bbs-reply" data-reply-number="${i+1}"><header>${avatar(user)}<span>${i+1}${t(' 楼',' / reply')}</span><time>${replyTime(post,i)}</time></header><p>${esc(t(...text))}</p></article>`).join('');
  return `<div class="bbs-breadcrumb"><a href="${base}?view=topics">${t('夜猫论坛','Night Owl BBS')}</a> / ${post.sections.map(board=>`<a href="${base}?section=${board}">${t(...boards[board])}</a>`).join(' / ')}</div><div class="bbs-layout"><div><article class="bbs-post" data-thread="${post.id}"><header><p class="bbs-tag">${post.pinned?t('置顶 / 公告','PINNED / NOTICE'):t('网友发帖','Community post')}</p><h1>${esc(t(...post.title))}</h1><div class="bbs-author">${avatar(post.user,post.avatar)}<time datetime="${post.at.replace(' ','T')}">${post.at}</time><span>${post.views} ${t('次浏览','views')}</span></div></header><div class="bbs-post-text">${post.paragraphs.map(text=>`<p>${esc(t(...text))}</p>`).join('')}${illustration(post)}${postExtras(post)}${post.id==='job'?`<p class="bbs-entry-label">${t('贴一下入口：','Here’s the link:')}</p><section class="bbs-link-preview"><span class="bbs-preview-monogram" aria-hidden="true">SH</span><div><h2>Stillwater Heritage Records</h2><p>${t('预订档案整理员 / 远程 / 合同制','Reservation records assistant / remote / contract')}</p><a class="forum-recruit-link" href="#careers">${t('查看招聘页面','View the job listing')} →</a></div></section>`:''}</div></article><section class="bbs-replies" aria-label="${t('帖子回复','Replies')}"><h2>${post.closed?t('本帖关闭回复','Replies are closed'):t('回复','Replies')+' · '+count(post)}</h2>${replies}${isUpdate(post)?`<article class="bbs-reply bbs-update"><header>${avatar(post.user,post.avatar)}<span>${t('楼主更新','OP update')}</span></header><p>${t('更新：没搜到这家公司别的消息。你们有谁做完样本了？','Update: I couldn’t find anything else about that company. Has anyone finished the sample?')}</p></article>`:''}</section><p class="bbs-back-link"><a href="${base}?view=topics">← ${t('返回主题目录','Back to all topics')}</a></p></div>${sidebar(post)}</div>`;
 }
 return {render:()=>renderPage()+avatarCredits()};
};
