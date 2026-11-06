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
  [
    ['gg','sw2.open.3','我刚吃完 外卖又忘给筷子','Just ate. No chopsticks with the takeaway again.'],
    ['zhang','sw2.open.4','你不是买了一百双吗','Didn’t you buy a hundred pairs?'],
    ['gg','sw2.open.5','全在上次那个袋子里 袋子不见了','All in that one bag. The bag’s gone.'],
    ['lin','sw2.open.6','你的文件也这么管理？','Is this how you organize files too?'],
    ['zhang','sw2.open.7','翻到去年存的照片了','Found some old photos I’d saved.'],
    ['gg','sw2.open.8','楚人那次还说下次不让我带路','Churen said I wasn’t allowed to navigate next time.',{photo:'friends',contact:'wcr_old'}],
    ['lin','sw2.open.9','原图我还有 别再存压缩版了','I still have the original. Don’t keep saving compressed copies.'],
    ['zhang','sw2.open.10','嗯 你那份留好','Yeah. Keep that copy safe.'],
  ].forEach(([person,key,zh,en,extra])=>group.push(line('group',key,zh,en,{person,...extra})));
  const discovery=[
    line('gg','sw2.discovery.0','你现在有空吗','Got a minute?'),
    line('gg','sw2.discovery.1','我不知道是不是我看错了','I don’t know if I’m reading this right.'),
    line('gg','sw2.discovery.2','楚人之前查的那家酒店，官网又出现了','That hotel Churen was looking into. The website’s back.'),
    line('gg','sw2.discovery.3','我点开看了，是那个银松镇的','Opened it. It’s the one in Silverpine.'),
    line('gg','sw2.discovery.4','我在夜猫论坛翻到的','Found it on Night Owl.'),
    line('gg','sw2.discovery.5','你先别想太多，看看再说','Let’s just have a look before we get ahead of ourselves.'),
    line('gg','sw2.discovery.card','[夜猫论坛]','[Night Owl]',{kind:'card'}),
  ];
  batch('sw2.P1','gg',[['对 就是这个站','Yeah, that’s the site.']]);
  batch('sw2.P2','gg',[
    ['谁在给他办入住啊？','Who’s checking him in?'],
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
  const {old,photos,profile}=globalThis.Stillwater2OpeningData;
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
    if(!chatActive||s.openedForum)return false;
    const o=s.story.opening;o.elapsed+=dt;let changed=false;
    const post=key=>{if(s.messages.some(m=>m.key===key))return;append(s,{kind:'story',key,conversation:messages[key].room});changed=true;};
    group.forEach((key,i)=>{if(o.elapsed>=i*3200)post(key);});
    discovery.forEach((key,i)=>{if(o.elapsed>=10000+i*4000){o.discoveryStarted=true;post(key);if(key==='sw2.discovery.card')s.shared=true;}});
    return changed;
  }
  globalThis.StillwaterChatStory={entry:key=>messages[key]||null,reply:(_text,s)=>s.story.delivered.some(id=>id.startsWith('sw2.end-'))?null:'sw2.synthetic.reply'};
  globalThis.StillwaterChatOpening={active,initialize,hydrate,advance,batchId:(_s,id)=>id,sideMessages:(_s,room)=>D.sideChats[room]?.messages||[],entries:messages,photos,profile,discovery,contactVisible:()=>true,
    profileExtras:(_s,{t})=>`<button type="button" data-sw2-action="old-last">${t('2023 年 10 月最后一条消息','Last message, October 2023')}</button>`,
  };
})();
