/* A scene browser, not a game controller. No storage, requests, AI or puzzle validation. */
(() => {
  const D=globalThis.XueliOverviewData;
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const art=(id,label,size='')=>`<figure class="art-wrap ${size}"><div class="art" data-asset="${id}">需要画</div><figcaption>${label}</figcaption></figure>`;
  const badge=(text,kind='')=>`<span class="badge ${kind}">${text}</span>`;
  const paragraph=text=>`<p>${text}</p>`;
  const state={mode:'stages',stage:0,item:0,site:'xianxia',ending:0};
  const appName=id=>D.apps.find(a=>a.id===id)?.name||'调查结果';
  function wechat(stage){
    const falseFriend=stage>=4;
    return `<div class="wechat-shell"><aside class="contacts"><p>微信 / 联系人</p>${['这周一定早睡（4）','GGbond','王楚人 · 旧会话','张靓颖666','小林鸽子','妈妈','爸爸','奶茶不要冰','阿哲','文件传输助手',...(falseFriend?['王楚人 · 新账号']:[])].map((name,i)=>`<div class="contact ${i===(falseFriend?10:1)?'selected':''}">${name}</div>`).join('')}</aside><section class="chat-preview"><header>${falseFriend?'王楚人 · 新账号':'GGbond'} ${badge('聊天皮肤示意')}</header><div class="chat-line">${art(falseFriend?'person-wcr-new':'person-gg',falseFriend?'新账号头像':'GGbond','avatar')}<div class="bubble">${falseFriend?'你还在查那些旧东西？我记得你们。':'我在闲虾收了台旧电脑，雪梨镇寄来的。'}</div></div><div class="chat-line"><div class="bubble">${falseFriend?'先照我说的做。那份记录我比你熟。':'里面有楚人以前存过的东西。交易页和书签都还在。'}</div></div>${falseFriend?`<div class="system-note warning">旧会话仍单独保留。新账号的说法不自动成为证据。</div>`:`<div class="shared-file"><strong>闲虾交易页 / 雪梨镇旧主机</strong><p>点开后会在浏览器里看；这里仅展示分享卡片位置。</p></div>`}<div class="chat-compose"><span>输入消息…（此样机不发送）</span><button disabled>发送</button></div></section></div>`;
  }
  function finder(){
    const results=[['论坛 / 缓存','旧电脑的维修记录','有人提到旧湖区、相机和一批留下的硬盘。'],['周刊 / 索引','雪梨镇公开活动目录','同一地点和一个人名出现在不同年份。'],['图书馆 / 档案','旧湖区地图与照片说明','先打开来源，不自动把搜索结果写成结论。']];
    return `<div class="tool-heading"><h3>跨来源检索</h3><p>新名字、新地点，会成为下一次检索的词。</p></div><div class="search-row"><input aria-label="检索词示意" value="雪梨镇  旧湖区" readonly><button disabled>检索</button></div><div class="finder-results">${results.map(([type,title,text])=>`<article><p class="muted">${type}</p><h4>${title}</h4><p>${text}</p>${badge('查看来源的入口位置')}</article>`).join('')}</div>`;
  }
  function photos(stage){
    return `<div class="tool-heading"><h3>${stage>=4?'原始留存 / 重建版本':'旧照片查看器'}</h3><p>放大与对照放在同一个窗口里，日期、来源在图外显示。</p></div><div class="photo-pair">${art('document-wcr-photo','楚人现场照片 · 2023','large')}${art(stage>=4?'anomaly-photo-rewrite':'document-hotel-group',stage>=4?'系统重建副本 · 2026':'酒店员工合影 · 2006','large')}</div><div class="source-strip">${badge('原始副本保留')}${badge('来源待核对',stage>=4?'warn':'')}<span>〈 上一张　　下一张 〉</span></div>${stage>=4?`<p class="system-note warning">同一张图的说明变了。玩家先比较，再决定调查笔记里该保留哪种说法。</p>`:''}`;
  }
  function weekly(){
    return `<div class="newspaper"><header>${art('site-weekly','刊头')}<div><h3>雪梨镇周刊</h3><p>THE XUELI WEEKLY / 地方资料留存</p></div><time>旧刊扫描</time></header><div class="newspaper-columns"><article><p class="muted">本地 / 活动与生活</p><h4>旧湖区的照片，要去哪里找？</h4>${paragraph('图书馆整理了部分年鉴、报纸索引和居民提供的照片。不同年份的说明会分别保留。')}${art('document-weekly-photo','周刊配图','medium')}${paragraph('这里也会有学校、商户和节庆消息，不是每段报道都藏着线索。')}</article><aside><h4>本期小广告</h4>${art('ad-diner','Maggie’s Diner')}<p>热咖啡 / 午间套餐</p><hr>${art('ad-lantern','旧灯节活动')}<p>图书馆义卖与社区活动</p></aside></div><div class="page-navigation">〈 上一期　　放大阅读　　下一期 〉</div></div>`;
  }
  function casebook(stage){
    const rows=stage>=6?[['王楚人的原始课程','2023 / 项目页','来源保留'],['最后联系对象','旧会话与通信记录','待核对'],['新账号身份','2026 / 新会话','证据不足'],['系统补全的身份','非玩家填写','来源冲突']]:[['最后在调查什么','交易页 / 书签','正在调查'],['最后出现地点','尚未附来源','待填写'],['最后联系人','尚未附来源','待填写']];
    return `<div class="casebook"><header><p class="english">WANG CHUREN / CASEBOOK</p><h3>王楚人失踪调查笔记</h3></header><div class="notebook-tabs"><span>人物</span><span>地点</span><span>时间</span><span>来源</span></div><table><thead><tr><th>需要确认的内容</th><th>依据从哪里来</th><th>状态</th></tr></thead><tbody>${rows.map(([a,b,c])=>`<tr><td>${a}</td><td>${b}</td><td>${badge(c,c==='来源冲突'?'warn':'')}</td></tr>`).join('')}</tbody></table><div class="notebook-fields"><label>组织归属 <input value="待核对" readonly></label><label>事件顺序 <input value="按原件时间整理" readonly></label></div><p class="system-note ${stage>=4?'warning':''}">${stage>=4?'系统填入的内容会单独标记，不能算作玩家已经确认。':'每项判断要附上来源。打开一个文件，不等于理解了它。'}</p>${stage>=6?`<div class="identity-note">${art('person-wcr-new','新账号头像','avatar')}<p>“它知道一些往事”是一条观察，<br>还不是“它就是楚人”的证明。</p></div>`:''}</div>`;
  }
  function files(){
    return `<div class="file-location">本机 / 旧用户目录 / 保留文件</div><div class="files-layout"><aside><p>桌面</p><p>书签</p><p>网页缓存</p><p>课程资料</p><p>待恢复</p></aside><table><thead><tr><th>名称</th><th>类型</th><th>留存时间</th></tr></thead><tbody><tr><td>bookmarks.html</td><td>网页书签</td><td>2023</td></tr><tr><td>旧湖区_现场</td><td>照片文件夹</td><td>2023</td></tr><tr><td>周刊_索引</td><td>资料目录</td><td>多个年份</td></tr><tr><td>缓存_未恢复</td><td>损坏文件</td><td>未知</td></tr></tbody></table></div><div class="file-preview">${art('item-folder','文件夹图标')}<p>2008 是主机年代，<br>不代表这里的资料都来自 2008 年。</p></div>`;
  }
  function system(){return `<div class="tool-heading"><h3>声音与显示</h3><p>统一放在旧电脑的系统设置中。此处不保存配置。</p></div><div class="settings-preview">${[['声音','环境音与消息提示音分别控制'],['普通广告','只在平静的浏览时段出现'],['动态效果','减少动态效果 / 静态替代'],['异常图像','保留可选择的显示设置'],['聊天与存档','正式版本沿用原系统，此样机不连接']].map(([a,b])=>`<div><span class="fake-checkbox" aria-hidden="true"></span><strong>${a}</strong><span>${b}</span></div>`).join('')}</div>`;}
  function cctv(){return `<div class="tool-heading"><h3>监控播放器</h3><p>后期解锁；机位、录制年份与恢复年份分开显示。</p></div><div class="camera-layout"><div class="camera-view">${art('scene-cctv-west','西翼监控场景','large')}<span class="camera-label">CAM 01 / SOURCE NOT VERIFIED</span></div><aside><p>机位 01　西翼</p><p>机位 02　服务区域</p><p>机位 03　设备端</p><hr><p>录像来源<br>待核对</p><p>恢复输出<br>2026</p></aside></div><p class="system-note">恢复画面后，仍须把录像与旧资料对照。画面标签不等于人物身份。</p>`;}
  function audio(){return `<div class="tool-heading"><h3>录音解码器</h3><p>同一段输出里有不同声源。这里仅画轨道，不播放声音。</p></div><div class="audio-tracks">${['原轨 01','原轨 02','混合输出'].map((name,i)=>`<div><label>${name}</label><div class="waveform waveform-${i}" aria-hidden="true">${Array.from({length:30},(_,j)=>`<i class="bar-${(j*7+i*3)%6}"></i>`).join('')}</div><span>未确认</span></div>`).join('')}</div><div class="file-preview">${art('item-recorder','录音资料图标')}<p>分开查看一条声源，<br>再决定能否把它归给某个人。</p></div>`;}
  function b3(){
    return `<div class="signal-panel"><header><h3>B-3 / SIGNAL PANEL</h3><p>六接头结构示意 · 这张样机不能通关</p></header><div class="signal-flow"><span>原始输入 →</span><span>→ 只读备份</span></div><div class="connector-grid">${['A','B','C','D','E','F'].map((id,i)=>`<div class="connector"><strong>${id}</strong><span class="elbow turn-${i<3?0:2}" aria-hidden="true"></span><small>90°</small></div>`).join('')}</div><div class="panel-switches"><span>AUTO-WRITE　□ 隔离</span><span>AUTO / MANUAL</span><span>保存配置</span></div><div class="signal-output">${art('item-signal-panel','配线设备素材')}<p>接线完成后短暂分离原始信号，<br>再由录像、声源与来源日期继续调查。</p></div></div>`;
  }
  function ending(mood=0){
    const options=[['线索保留下来','你保住了一份可追踪的原件，但还没有找到真正的楚人。'],['保留未核实','资料没有足够依据，玩家拒绝让系统替自己作出确定判断。'],['替代已经完成','系统留下了一个足够完整的“王楚人”，真正的痕迹仍然缺失。']];
    return `<div class="ending-preview"><p class="english">END OF INVESTIGATION / DIRECTION STUDY</p><h3>${options[mood][0]}</h3>${paragraph(options[mood][1])}<div class="ending-object">${art('document-final-trace','结局原件 / 最后照片','medium')}</div><strong class="game-over">GAME OVER</strong><div class="ending-options">${options.map(([name],i)=>`<button data-ending-mood="${i}" aria-pressed="${i===mood}">${name}</button>`).join('')}</div><p class="muted">仅示意三种结局方向，名称与达成规则未定稿。</p></div>`;
  }
  function site(id){
    if(id==='weekly')return weekly();
    if(id==='xianxia')return `<div class="site-page site-market"><header>${art('site-xianxia','网站标识')}<div><h3>闲虾二手软件</h3><p>雪梨镇 / 二手电脑 / 已成交缓存</p></div></header><div class="listing"><div>${art('item-old-computer','2008 年旧主机','large')}</div><article><h4>旧电脑一台，能开机</h4><p>卖家：雪梨镇匿名用户</p><p>附带原硬盘，未做格式化。</p>${badge('GGbond 的购买记录')}<div class="old-listing">卖家主页 / 物品评价 / 其他旧物<br>失效 listing 的缓存入口</div></article></div></div>`;
    if(id==='forum')return `<div class="site-page site-forum"><header>${art('site-forum','论坛标识')}<div><h3>雪梨镇论坛</h3><p>闲聊 / 买卖 / 维修 / 地方消息</p></div></header><div class="forum-directory">${[['今天中午谁家外卖还开着','闲聊','12'],['这台旧主机一直读盘，谁会修','维修','8'],['旧湖区那批照片在哪里查','求助','6'],['今年旧灯节还收旧物吗','地方消息','19'],['出一个相机包，拉链好的','买卖','3']].map(([a,b,c])=>`<div><span>${a}</span><small>${b}</small><small>${c} 回复</small></div>`).join('')}</div><p class="system-note">普通帖子保留生活感，少量与调查有关；不是每一篇都指向酒店。</p></div>`;
    if(id==='library')return `<div class="site-page site-library"><header>${art('site-library','图书馆标识')}<div><h3>雪梨镇图书馆 · 数字档案</h3><p>年鉴 / 地图 / 活动目录 / 报纸索引</p></div></header><div class="search-row"><input aria-label="档案关键词示意" value="旧湖区  活动  照片" readonly><button disabled>查找</button></div><div class="library-columns">${art('document-town-map','旧湖区地图','medium')}<article><h4>目录与来源</h4><p>旧湖区地图 / 地图留存</p><p>酒店活动目录 / 2006</p><p>公开讲座索引 / 多个年份</p><p>居民照片说明 / 原始署名保留</p>${badge('按来源回看')}</article></div></div>`;
    if(id==='hotel')return `<div class="site-page site-hotel"><header>${art('site-hotel','酒店标识')}<div><h3>STILLWATER HOTEL</h3><p>历史网页快照 / 已停止营业</p></div></header><nav>客房　婚礼与活动　员工　住客留言</nav><div class="hotel-story">${art('document-hotel-group','员工合影','medium')}<article><h4>当年的员工与活动</h4><p>Nora 的工作介绍、活动照片与住客留言留在不同页面。</p><p>玩家要比较这些记录，而不是只收集一个个编号。</p><p class="muted">原始快照　2006<br>当前恢复　2026</p></article></div><p class="hotel-note">旧广告、宣传册与失效页面也能重新查看。</p></div>`;
    if(id==='phase')return `<div class="site-page site-phase"><header>${art('site-phase','位体教标识')}<div><h3>PHASE SELF INSTITUTE</h3><p>位体教 / 技术、记忆与个人身份</p></div></header><nav>组织介绍　公开活动　数字遗产　档案项目</nav><h4 class="phase-headline">人的经历，可以怎样被保存？</h4><p>公开页面先像一个正常的科技文化组织。研究、展览和项目说明说清楚，不先抛出恐怖符号。</p><div class="phase-columns"><div>${art('person-dylan','Stephen Dylan')}<p>创始人公开资料</p></div><article><h4>两个主要内容方向</h4><p>研究与公开展览</p><p>数字遗产与档案项目</p><p class="muted">位铁、本我与位我的词语在资料里逐步解释，不让玩家先背术语。</p></article></div></div>`;
    if(id==='course')return `<div class="site-page site-course"><header>${art('person-wcr-old','楚人的旧头像')}<div><h3>W. CHUREN / COURSE PROJECT</h3><p>2023 / 旧网页与建筑影像</p></div></header><h4>同一个地方，为什么照片不一样？</h4><p>这里有课程要求、拍摄笔记、老师反馈、同学评论和项目致谢。大部分是普通学生的生活，不是密码。</p><div class="course-photos">${art('document-course-photo','课程照片')}${art('document-wcr-photo','现场记录')}${art('item-camera','二手相机')}</div><blockquote>老师反馈：先把照片的来源和日期分开写，暂时不用急着解释差异。</blockquote></div>`;
    return `<div class="site-page site-shops"><h3>雪梨镇 · 本地商户与小广告</h3><p>大多数普通广告只负责让这个地方像有人生活。</p><div class="ad-sampler">${[['diner','Maggie’s Diner','热咖啡 / 今日午餐'],['repair','电脑维修','旧机清灰 / 硬盘检测'],['fishing','钓鱼用品','周末去湖边'],['camera','二手相机回收','旧相机也收'],['pizza','披萨优惠','带走第二份优惠'],['library','图书馆义卖','书、旧刊与社区活动'],['lantern','旧灯节活动','街区公开活动'],['tires','冬季轮胎','入冬前检查']].map(([id,name,text],i)=>`<article class="sample-ad ad-layout-${i%4}">${art('ad-'+id,'')}<div><h4>${name}</h4><p>${text}</p></div></article>`).join('')}</div><p class="system-note">异常广告少而准：日期、旧号码或多出的一行字。示意页不自动弹窗。</p></div>`;
  }
  function browser(id){return `<div class="browser-tools"><span>←　→　↻</span><div>cache://xueli/${id} / ${id==='hotel'?'2006 → 2026':'留存网页'}</div></div><div class="browser-sites" aria-label="网站预览">${D.sites.map(s=>`<button data-site="${s.id}" aria-pressed="${s.id===id}">${s.name}</button>`).join('')}</div>${site(id)}`;}
  function program(id,stage,siteId,endingId=0){return id==='wechat'?wechat(stage):id==='finder'?finder():id==='photos'?photos(stage):id==='weekly'?weekly():id==='casebook'?casebook(stage):id==='files'?files():id==='system'?system():id==='cctv'?cctv():id==='audio'?audio():id==='b3'?b3():id==='ending'?ending(endingId):browser(siteId);}
  function desktop(index,app,siteId,compact=false){
    const stage=D.stages[index];
    return `<div class="desktop tone-${stage.tone} ${compact?'compact':''}" data-scene="${index}" ${compact?'inert':''}><div class="desktop-top"><span>XUELI / 旧电脑资料留存</span><span>2008 年机型</span></div><div class="desktop-body"><aside class="desktop-icons" aria-label="程序预览">${D.apps.map(a=>`<button data-app="${a.id}" class="desktop-icon ${a.id===app?'active':''}" title="${a.name}${a.stage>=5?'（后期开放）':''}"><span class="icon-placeholder" data-asset="app-${a.id}">需要画</span><span>${a.name}</span></button>`).join('')}</aside><div class="computer-window"><header class="window-title"><strong>${appName(app)}${index>=4?' / 来源需要核对':''}</strong><span aria-hidden="true">_　□　×</span></header><div class="window-menu">文件　查看　来源　帮助 <span>画面示意</span></div><div class="window-content">${program(app,index,siteId,state.ending)}</div><div class="window-status"><span>只预览画面，不写入调查进度</span><span>${index>=4?'来源校验：待核对':'资料可回看'}</span></div></div></div><div class="taskbar"><strong>开始</strong><span class="task-active">${appName(app)}</span><span>微信</span><span class="task-clock">2026 / 18:12</span></div></div>`;
  }
  function select(mode,item){
    state.mode=mode;state.item=item;
    if(mode==='stages'){state.stage=Number(item);state.site=D.stages[state.stage].site;}
    else if(mode==='apps'){const a=D.apps.find(a=>a.id===item);state.stage=a.stage;state.site=D.stages[a.stage].site;}
    else {const s=D.sites.find(s=>s.id===item);state.stage=s.stage;state.site=item;}
    render();
  }
  function render(){
    const stage=D.stages[state.stage],items=state.mode==='stages'?D.stages:state.mode==='apps'?D.apps:D.sites;
    $('#choices').innerHTML=items.map((item,i)=>{const id=state.mode==='stages'?i:item.id;return `<button data-select="${id}" aria-pressed="${String(id)===String(state.item)}"><span class="choice-number">${String(i+1).padStart(2,'0')}</span><span>${item.title||item.name}</span></button>`;}).join('');
    document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode)));
    const selected=state.mode==='stages'?stage:items.find(x=>x.id===state.item),app=state.mode==='stages'?stage.app:state.mode==='apps'?selected.id:'browser';
    $('#view-number').textContent=state.mode==='stages'?`CHAPTER ${state.stage+1} / 08`:'WINDOW STUDY / 独立窗口预览';
    $('#view-title').textContent=selected.title||selected.name;
    $('#screen').innerHTML=desktop(state.stage,app,state.site);
    $('#explanation').innerHTML=state.mode==='stages'?`<div><h3>这幕要查什么</h3><p>${esc(stage.question)}</p></div><div><h3>主要操作</h3><p>${esc(stage.action)}</p></div><div><h3>如何接到下一幕</h3><p>${esc(stage.next)}</p></div><p class="mood-note">${esc(stage.mood)}</p>`:`<div class="program-note"><h3>这个窗口负责什么</h3><p>${esc(selected.note)}</p></div><div><h3>正式流程位置</h3><p>第 ${state.stage+1} 章：${esc(stage.title)}</p></div>`;
    document.querySelectorAll('[data-step]').forEach(b=>{b.disabled=state.mode!=='stages'||state.stage+Number(b.dataset.step)<0||state.stage+Number(b.dataset.step)>=8;});
  }
  function renderAll(){
    const part=new URLSearchParams(location.search).get('part');
    $('.review-layout').hidden=true;$('.review-tabs').hidden=true;$('#all-scenes').hidden=false;
    $('#scene-grid').innerHTML=D.stages.map((s,i)=>({s,i})).filter(({i})=>part==='early'?i<4:part==='late'?i>=4:true).map(({s,i})=>`<article class="scene-card"><header><span class="english">${String(i+1).padStart(2,'0')} / 08</span><h3>${s.title}</h3></header>${desktop(i,s.app,s.site,true)}<div class="scene-caption"><strong>${s.question}</strong><p>${s.action}</p><p>→ ${s.next}</p><a href="index.html?stage=${i}">单看这一幕 →</a></div></article>`).join('');
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('button');if(!target)return;
    if(target.dataset.mode)select(target.dataset.mode,target.dataset.mode==='stages'?0:target.dataset.mode==='apps'?'wechat':'xianxia');
    else if(target.dataset.select!==undefined)select(state.mode,target.dataset.select);
    else if(target.dataset.step)select('stages',state.stage+Number(target.dataset.step));
    else if(target.dataset.app)select('apps',target.dataset.app);
    else if(target.dataset.site)select('sites',target.dataset.site);
    else if(target.dataset.endingMood!==undefined){state.ending=Number(target.dataset.endingMood);render();}
  });
  const params=new URLSearchParams(location.search);
  if(params.get('view')==='all')renderAll();
  else {const stage=Number(params.get('stage'));select('stages',Number.isInteger(stage)&&stage>=0&&stage<8?stage:0);}
})();
