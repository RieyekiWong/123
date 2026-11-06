/* Authored prototype beats. The existing seven AI roles and transport are untouched. */
(() => {
  const D=globalThis.StillwaterChatData, P=globalThis.StillwaterChatPeople;
  const messages={},batches={};
  globalThis.StillwaterStoryData={messages,batches};
  const line=(room,key,zh,en,extra={})=>{messages[key]={room,person:room,text:[zh,en],...extra};return key;};
  function batch(id,room,lines){batches[id]={room,keys:lines.map(([zh,en],i)=>line(room,id+'.'+i,zh,en))};}
  const group=[
    line('group','sw2.open.0','我这个作业又要通宵了','This assignment is going to take all night again.',{person:'gg'}),
    line('group','sw2.open.1','你先别改群名了 改了也不睡','Don’t rename the group again. It doesn’t make you sleep.',{person:'zhang'}),
    line('group','sw2.open.2','先导一份备份吧 上次白做一晚上','Export a backup first. Last time you lost a whole night.',{person:'lin'}),
  ];
  const discovery=[
    line('gg','sw2.discovery.0','在不在 我找到楚人以前查的那个酒店了','You there? I found that hotel Churen was looking into.'),
    line('gg','sw2.discovery.1','三年了 那个网址一直打不开 今天居然能开','Three years of a dead address. Today it actually opens.'),
    line('gg','sw2.discovery.2','我在夜猫论坛看到的 说是恢复旧网页 不是酒店重新营业','Found it on Night Owl. They’re restoring the old site, not reopening the hotel.'),
    line('gg','sw2.discovery.card','[夜猫论坛]','[Night Owl]',{kind:'card'}),
  ];
  batch('sw2.P2','gg',[
    ['看到了 他问的是照片 怎么给办成入住了','Saw it. He asked about photographs. How did that become a stay?'],
    ['修复项目有署名 先看看谁在整理','The restoration has a project credit. Let’s see who’s doing it.'],
  ]);
  batch('sw2.P5','gg',[['你发来的两份说明我留着了 先别把修过的图当原片','Kept the two source descriptions you sent. Let’s keep the edited copy separate.']]);
  batch('sw2.P7','gg',[['楚人最后那张照片 也许还有没保留下来的边缘','Maybe there’s more at the edge of Churen’s last photo.']]);
  batch('sw2.accepted','wcr_new',[
    ['在吗','You there?'],['酒店一直开着 对你来说是关了','The hotel never closed. It closed for you.'],
  ]);
  batch('sw2.end-auto-close','gg',[['页面写找到他了 可这不是他回来 你再看一眼','The page says he’s found. But this isn’t him coming back. Look again.']]);
  batch('sw2.end-unverified','gg',[['没事 我们继续找 不替他把这件事认了','We’ll keep looking. We don’t have to confirm this for him.']]);
  batch('sw2.end-released','gg',[['北岸旧渡口 这次总算是他自己留下的线索','The old north ferry. At least this lead is something he left himself.']]);
  line('wcr_new','sw2.synthetic.reply','我记得那些话。但你留的原件，比我现在说的可靠。','I remember those words. The originals you kept are more reliable than what I’m saying now.');
  D.people.wcr_old={name:['王楚人','Wang Churen']};D.people.wcr_new={name:['王楚人','Wang Churen']};
  const old=[
    {person:'wcr_old',text:['到芝加哥了 昨天一觉睡到下午','Made it to Chicago. Slept through most of yesterday.'],displayTime:'2021-09-18 19:34'},
    {person:'wcr_old',text:['GG 又把地图拿反了 他坚持说北就画在下面','GG held the map upside down again. Insists north is at the bottom.'],displayTime:'2022-05-14 15:42'},
    {person:'wcr_old',text:['妈又说那件蓝衣服穿三年了 最多两年半','Mum says I’ve worn that blue hoodie for three years. Two and a half, tops.'],displayTime:'2023-09-22 21:16'},
    {person:'wcr_old',text:['周末去银松镇 对一下作业里的老照片 只拍公开的地方','Going to Silverpine this weekend to check the old photos for class. Just the public places.'],displayTime:'2023-10-12 20:18'},
    {person:'wcr_old',text:['等我回来找你们吃饭 不吃上次那家','Food when I’m back. Anywhere but that place from last time.'],displayTime:'2023-10-12 20:20'},
    {person:'wcr_old',text:['我好像找到那个地方了 我再看一下','I think I found the place. I’ll take another look.'],displayTime:'2023-10-17 18:10'},
    {person:'wcr_old',text:['等我回去跟你们说','I’ll tell you when I get back.'],displayTime:'2023-10-17 18:12'},
  ];
  for(const message of old)message.at=Date.parse(message.displayTime.replace(' ','T')+':00-05:00');
  D.sideChats.wcr_old={name:['王楚人 · 旧会话','Wang Churen · older chat'],avatar:'wcr_old',messages:old,kind:'archive',historyAt:Date.parse('2023-10-17T18:00:00Z')};
  D.sideChats.wcr_new={name:['王楚人 · 新账号','Wang Churen · new account'],avatar:'wcr_new',messages:[],kind:'scripted'};
  P.order.splice(2,0,'wcr_old','wcr_new');
  for(const [id,file] of [['wcr_old','assets/story-v12/wcr-01-avatar-old.png'],['wcr_new','assets/story-v13/wcr-campus-new.png']])globalThis.StillwaterChatPhotos.push({id,file,source:'#sw2/notes',author:'404 Studio',license:'Original fictional character / existing artwork',license_url:'#sw2/notes'});
  const active=s=>s.story?.opening?.edition==='2.0-prototype';
  function initialize(s){s.story.opening={edition:'2.0-prototype',elapsed:0,discoveryStarted:false};s.messages=[{id:'m1',kind:'story',key:group[0],conversation:'group',at:s.messages[0].at}];return s;}
  function hydrate(s,raw){
    s.story.opening={edition:'2.0-prototype',elapsed:Number.isFinite(raw.story?.opening?.elapsed)?Math.max(0,Math.min(86400000,raw.story.opening.elapsed)):0,discoveryStarted:s.messages.some(m=>discovery.includes(m.key))};
    s.shared=s.messages.some(m=>m.key==='sw2.discovery.card');
  }
  function advance(s,dt,{chatActive},append){
    if(!chatActive)return false;
    const o=s.story.opening;o.elapsed+=dt;let changed=false;
    const post=key=>{if(s.messages.some(m=>m.key===key))return;append(s,{kind:'story',key,conversation:messages[key].room});changed=true;};
    group.forEach((key,i)=>{if(o.elapsed>=i*2000)post(key);});
    discovery.forEach((key,i)=>{if(o.elapsed>=6500+i*2200){o.discoveryStarted=true;post(key);if(key==='sw2.discovery.card')s.shared=true;}});
    return changed;
  }
  globalThis.StillwaterChatStory={entry:key=>messages[key]||null,reply:(_text,s)=>s.story.delivered.some(id=>id.startsWith('sw2.end-'))?null:'sw2.synthetic.reply'};
  globalThis.StillwaterChatOpening={active,initialize,hydrate,advance,batchId:(_s,id)=>id,sideMessages:(_s,room)=>D.sideChats[room]?.messages||[]};
  globalThis.StillwaterChatOpeningView={
    visible:()=>true,
    profile:(s,{t})=>s.ui.conversation==='wcr_old'?`<p class="chat-friend-profile">${t('苏州人，2021 年到芝加哥读设计。爱旧网页、摄影和奇怪的路牌。最后可靠消息：2023-10-17。','From Suzhou; moved to Chicago to study design in 2021. Liked old websites, photography and odd street signs. Last reliable message: 17 October 2023.')}</p>`:'',
    invitation(root,s,{t,esc}){
      root.querySelector('.chat-opening-invite')?.remove();
      if(!s.ui.unread.gg||s.ui.conversation==='gg'||!s.messages.some(m=>discovery.includes(m.key)))return;
      const button=document.createElement('button');button.className='chat-opening-invite';button.dataset.chatOpenPrivate='gg';button.innerHTML=`<strong>GGbond</strong><span>${esc(t('找到楚人以前看的酒店了','Found the hotel Churen was looking at'))}</span><small>${t('查看私聊','Open chat')} ›</small>`;root.querySelector('.chat-heading')?.after(button);
    },
  };
})();
