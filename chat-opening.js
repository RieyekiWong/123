/* V1.2 authored opening. No network, case access, generated dialogue or route mutation.
   Old script IDs remain in chat-data.js; only genuinely fresh chats use this edition. */
globalThis.StillwaterChatOpening = (() => {
  const D = globalThis.StillwaterChatData, S = globalThis.StillwaterStoryData;
  const text = (zh, en) => [zh, en];
  const folder = 'assets/story-v12/';
  const photos = {
    old: {file:folder+'wcr-01-avatar-old.png', date:'2022', title:text('咖啡店那张','The café photo'), caption:text('2022。你拍的。他说像招生照，后来还是拿来当了头像。','2022. You took this. He said it looked like a college brochure, then used it as his avatar anyway.')},
    friends: {file:folder+'wcr-02-three-friends.png', date:'2022-05-14', title:text('吃完饭，准备回去','After lunch'), caption:text('2022 年 5 月。楚人又站到后面去了。那天 GG 把地图拿反，走了半天才肯承认。','May 2022. Churen stood too far back again. GG held the map upside down and took a while to admit it.')},
    family: {file:folder+'wcr-04-family-dinner.png', date:'2021-08', title:text('出国前的家里','At home, before Chicago'), caption:text('2021 年夏天，苏州。楚人和爸爸、妈妈、妹妹又一。桌边那袋东西是他妈让他带走的。','Summer 2021, Suzhou. Churen with his dad, mum and younger sister, Youyi. His mum wanted him to take the bag by the table.')},
    camera: {file:folder+'wcr-06-old-camera.png', date:'2022', title:text('GG 拍的试机照','GG’s camera test'), caption:text('2022。二手相机刚到手，他让 GG 拍了好几张。镜头盖后来一直挂在手腕上。','2022. He had just bought the used camera and made GG take a few shots. He kept the lens cap on the wrist strap after that.')},
    campus: {file:'assets/story-v13/wcr-campus-original.png',date:'2022',title:text('颜色又往旁边跑了','The colours went sideways again'),caption:text('2022，学校打印室。楚人在看印坏的样张，背后的海报也贴歪了。GG 后来看到丑照片就说“颜色又往旁边跑了”。','2022, the college print room. Churen is looking at a bad print; even the poster behind him is crooked. GG called every bad photo “the colours going sideways” after that.')},
  };
  const entries = {};
  function entry(key, room, person, zh, en, extra = {}) {
    entries[key] = {room, person, text:text(zh,en), ...extra};
    return key;
  }
  const group = [
    ['gg','我这个作业根本做不完','This assignment is never getting done.'],
    ['zhang','你上周不是说这周一定早睡吗','Weren’t you going to bed early this week?'],
    ['gg','我说过的事情很多','I say a lot of things.'],
    ['lin','你这个名字已经没有信誉了','The group name has lost all credibility.'],
    ['gg','好好好','All right, all right.'],
    ['zhang','谁还有上次那个照片','Does anyone still have that photo?'],
    ['gg','哪张','Which one?'],
    ['zhang','楚人拍的那张 路牌歪的','The one Churen took. The crooked street sign.'],
    ['gg','哦','Oh.'],
    ['gg','我找一下','Let me look.'],
    ['lin','我可能存着 等我翻翻','I might have it. Give me a sec.'],
    ['gg','先翻到这张了 他又站最后面','Found this one first. He’s hiding at the back again.',{photo:'friends'}],
    ['zhang','这张我记得 你们是不是又走错路了','I remember this. Had you got lost again?'],
    ['gg','没有 那地图北就画在下面','No. North was at the bottom of that map.'],
    ['lin','行 你继续坚持','Sure. Keep telling yourself that.'],
    ['gg','楚人以前那段聊天还在 我去翻翻','I still have Churen’s old messages. Going to look.',{contact:'wcr_old'}],
  ].map(([person,zh,en,extra],i)=>entry('v12.group.'+i,'group',person,zh,en,extra));
  const discovery = [
    ['在吗','You there?'],
    ['我刚刚真的找到一个东西','I think I’ve actually found something.'],
    ['等会 我先别乱说','Hang on. Let me check before I get ahead of myself.'],
    ['你还记不记得楚人之前一直看的那个酒店','Remember that hotel Churen kept looking up?'],
    ['银松镇旧湖区那个','The one in Silverpine’s old lake district.'],
    ['他 2023 年去那边以后就没消息了 那会儿才 21','He was only 21 when we lost contact after that trip in 2023.'],
    ['我这三年不知道搜过多少次','I’ve lost count of how many times I’ve searched in the last three years.'],
    ['以前那个网址一直打不开','The old address never worked.'],
    ['现在突然能打开了','Now it opens.'],
    ['我是在夜猫论坛看到的','Found it on Night Owl.'],
    ['论坛里还有一条整理旧预订单的兼职','There’s a post about a job sorting old bookings.'],
    ['不是喊你去打工','I’m not trying to get you a job.'],
    ['我就是觉得那东西出现得太巧了','It’s just odd that it’s turned up now.'],
    ['你看下这个帖子','Have a look at this post.'],
  ].map(([zh,en],i)=>entry('v12.discovery.'+i,'gg','gg',zh,en));
  discovery.push(entry('v12.discovery.card','gg','gg','[夜猫论坛]','[Night Owl BBS]',{kind:'card',post:'job'}));
  discovery.push(entry('v12.discovery.after','gg','gg','先看公开的页面 别填私人资料','Just the public pages for now. Don’t put any personal details in.'));
  const old = [];
  const historical = (date, time, person, zh, en, extra={}) => old.push({person,text:text(zh,en),at:Date.parse(date+'T'+time+':00'+(date<'2023-10-14'?'-05:00':'-04:00')),displayTime:date+' '+time,...extra});
  historical('2021-09-18','19:34','wcr_old','到芝加哥了 昨天一觉睡到下午','Made it to Chicago. Slept through most of yesterday.');
  historical('2021-09-18','19:35','wcr_old','Northlake 这边课表排得好满 还没开始上就想放假','Northlake has packed the timetable. Already need a break and classes haven’t started.');
  historical('2021-09-18','19:36','wcr_old','出门前我妈拍的 我妹说她那天没睡醒','Mum took this before I left. My sister says she was half asleep.',{photo:'family'});
  historical('2021-11-06','18:21','wcr_old','GG 来之前先点 不然我们吃到明天','Let’s order before GG gets here or we’ll be eating tomorrow.');
  historical('2021-11-06','18:22','me','他说马上到','He says he’s nearly here.');
  historical('2021-11-06','18:22','wcr_old','他说的马上跟我的不是一个单位','His “nearly” uses a different unit of time.');
  historical('2022-04-19','16:08','wcr_old','今天 20 了 我妈问我想吃什么 我说你又寄不过来','Turned 20 today. Mum asked what I wanted to eat. I said she can’t exactly post it.');
  historical('2022-04-19','16:09','wcr_old','结果她还真寄了一盒点心 你们来拿 自己留几块就行','Turns out she did send some pastries. Come get some. I only need a few.');
  historical('2022-05-14','15:42','wcr_old','GG 把地图拿反了','GG held the map upside down.');
  historical('2022-05-14','15:42','gg','没有 我那个图就是北在下边','No. That map had north at the bottom.',{forwarded:true});
  historical('2022-05-14','15:43','wcr_old','你真的很难沟通','You are impossible.');
  historical('2022-05-14','15:43','me','哈哈哈哈','Hahaha');
  historical('2022-05-14','15:44','wcr_old','别笑 你一会儿也跟错','Keep laughing. You’ll follow him the wrong way too.');
  historical('2022-05-14','18:06','wcr_old','你拍这张我像路人 下次喊我往前站','I look like a passerby in this. Tell me to stand closer next time.',{photo:'friends'});
  historical('2022-10-08','14:21','wcr_old','GG 给我拍的试机照 镜头盖还挂着呢','GG took this to test the camera. Lens cap’s still hanging there.',{photo:'camera'});
  historical('2022-10-08','14:22','wcr_old','不是买来装复古 我真觉得这个颜色挺好','Didn’t get it just to look retro. I actually like the colours.');
  historical('2022-11-09','17:42','wcr_old','你们别发群里 我那天印出来颜色整个往旁边跑','Don’t send this to the group. The colours went completely sideways on that print.',{photo:'campus'});
  historical('2023-08-23','17:03','wcr_old','我那个网页做好了 你俩有空帮我点一下','My website’s ready. Can you two try it when you have a minute?');
  historical('2023-08-23','17:04','wcr_old','主要试一下能不能顺着走完','Mostly checking whether you can get through it without getting lost.');
  historical('2023-08-23','17:04','wcr_old','别又叫 final_final_2 了 我自己都找不到 用 poster_export_02 起码知道是哪份','Please stop calling it final_final_2. Even I can’t find it. At least poster_export_02 tells me which file it is.');
  historical('2023-08-23','17:04','me','可以 等我回去','Sure. When I get back.');
  historical('2023-08-23','17:05','wcr_old','OK 我先去吃饭','OK. Getting food first.');
  historical('2023-09-22','21:16','wcr_old','妈又说我那件蓝衣服穿三年了 最多两年半吧','Mum says I’ve worn that blue hoodie for three years. Two and a half, tops.');
  historical('2023-09-22','21:17','wcr_old','又一说我画的小狗像土豆 我就改名叫 potato-dog 了','Youyi says the dog I drew looks like a potato. Renamed it potato-dog.');
  historical('2023-10-12','20:18','wcr_old','我可能周末去银松镇 把作业那几张照片对一下','Might go to Silverpine this weekend. Need to check those photos for the project.');
  historical('2023-10-12','20:19','wcr_old','主要拍公开的地方 没打算进封起来的楼','Just the public places. Not going inside anything closed off.');
  historical('2023-10-12','20:20','wcr_old','等我回来找你们吃饭 不吃上次那家了','Food when I get back. Anywhere but that place from last time.');
  historical('2023-10-17','18:10','wcr_old','我好像找到那个地方了','I think I found the place.');
  historical('2023-10-17','18:10','wcr_old','但这里没有酒店啊','But there’s no hotel here.');
  historical('2023-10-17','18:11','wcr_old','地图上那个照片是不是放错了','Is that photo on the map in the wrong place?');
  historical('2023-10-17','18:11','wcr_old','我再看一下','I’ll take another look.');
  historical('2023-10-17','18:12','wcr_old','等我回去跟你们说','I’ll tell you when I get back.');
  const profile = {
    name:text('王楚人','Wang Churen'), born:'2002-04-19', hometown:text('苏州','Suzhou'), school:'Northlake School of Design & Media', city:text('芝加哥','Chicago'),
    lastContact:'2023-10-17 18:12', lastContactAt:'2023-10-17T18:12:00-04:00', lastKnownPlace:'Silverpine',
    about:text('2021 年到芝加哥读设计。爱拍旧招牌，买过一台二手相机。GG 的耳机被坐断那次，他念了好久。','Came to Chicago to study design in 2021. Took photos of old signs and bought a used camera. Never let GG forget the headphones he sat on.'),
    family:text('家在苏州，有爸爸妈妈和妹妹又一。以前发过一张家里吃饭的照片，还跟我们分过家里寄来的点心。','His parents and younger sister, Youyi, live in Suzhou. He sent a photo of dinner at home and shared the pastries his family posted him.'),
    missing:text('2023 年 10 月去银松镇拍课程作业的照片，之后失去联系。家人、学校和朋友一直没有停止找他。','He went to Silverpine to take photos for a class project in October 2023, then went out of contact. His family, school and friends have kept looking.'),
  };
  // These new keys do not replace saved 4.17 dialogue keys.
  const context = ['他 2023 年 10 月 17 号说等回来讲 后来就联系不上了','那会儿才 21 刚上大三','他妈以前还问过我有没有收到他的消息','我只确定这次链接能打开 别的还没查'];
  const contextEn = ['On 17 October 2023 he said he’d tell us when he got back. We couldn’t reach him after that.','He was 21. Just started his third year.','His mum used to ask if I’d heard from him.','All I know is the link opens this time. I haven’t checked the rest.'];
  const contextKeys = context.map((zh,i)=>entry('v12.context.'+i,'gg','gg',zh,contextEn[i]));
  Object.assign(S.messages, entries);
  S.batches['v12.context']={room:'gg',keys:contextKeys};
  for(const [id,file] of [['wcr_old','wcr-01-avatar-old.png'],['wcr_new','wcr-14-avatar-new.png']]){
    const photo=globalThis.StillwaterChatPhotos.find(p=>p.id===id);
    if(photo)Object.assign(photo,{file:id==='wcr_new'?'assets/story-v13/wcr-campus-new.png':folder+file,source:'#credits',author:'404 Studio',license:'Original fictional character / generated artwork',license_url:'#credits'});
  }
  const active = s => s.story?.opening?.edition === 'v12';
  const initial = () => ({edition:'v12',cursor:1,remaining:2600,elapsed:0,privateCursor:0,privateRemaining:1200,discoveryStarted:false});
  function initialize(s) {
    s.story.opening=initial();
    s.messages=[{id:'m1',kind:'story',key:group[0],conversation:'group',at:s.messages[0].at}];
    return s;
  }
  function hydrate(s, raw) {
    const prior=raw.story?.opening;
    if(prior?.edition!=='v12'){s.story.opening={edition:'legacy'};return;}
    const n=(v,max,otherwise=0)=>Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):otherwise;
    const received=key=>s.messages.some(m=>m.kind==='story'&&m.key===key);
    const nextIndex=keys=>{let i=0;while(i<keys.length&&received(keys[i]))i++;return i;};
    s.story.opening={edition:'v12',cursor:nextIndex(group),remaining:n(prior.remaining,7000,2600),elapsed:n(prior.elapsed,86400000),privateCursor:nextIndex(discovery),privateRemaining:n(prior.privateRemaining,7000,1200),discoveryStarted:prior.discoveryStarted===true||nextIndex(discovery)>0};
    s.shared=received('v12.discovery.card');
  }
  function advance(s,dt,{story,chatActive},append) {
    if(!active(s)||!chatActive)return false;
    const o=s.story.opening;o.elapsed=Math.min(86400000,o.elapsed+dt);let changed=false;
    const post=key=>{if(s.messages.some(m=>m.kind==='story'&&m.key===key))return;const e=entries[key];append(s,{kind:'story',key,conversation:e.room});changed=true;if(key==='v12.discovery.card')s.shared=true;};
    if(o.cursor<group.length&&(story&&!s.hold||o.elapsed>=60000)){
      o.remaining=Math.max(0,o.remaining-dt);
      if(!o.remaining){post(group[o.cursor++]);o.remaining=o.cursor===9?3600:2200;}
    }
    // Free chatting, reading history or opening another contact never strands the entrance.
    if(!o.discoveryStarted&&(o.cursor>=group.length||o.elapsed>=105000)){
      if(!s.messages.some(m=>m.key==='v12.group.11'))post('v12.group.11');
      o.discoveryStarted=true;
    }
    if(o.discoveryStarted&&o.privateCursor<discovery.length){
      o.privateRemaining=Math.max(0,o.privateRemaining-dt);
      if(!o.privateRemaining){post(discovery[o.privateCursor++]);o.privateRemaining=o.privateCursor<4?1300:1800;}
    }
    return changed;
  }
  function batchId(s,id){if(!active(s))return id;if(id==='discovery')return null;return id==='context'?'v12.context':id;}
  const sideMessages=(s,room)=>room==='wcr_old'&&active(s)?old:D.sideChats[room]?.messages||[];
  return {active,initialize,hydrate,advance,batchId,entries,photos,profile,old,group,discovery,sideMessages};
})();
