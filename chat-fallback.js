/* Offline fallback, deliberately separate from the real Responses API path. */
globalThis.StillwaterChatFallback = (() => {
 const D=globalThis.StillwaterChatData,P=globalThis.StillwaterChatProtocol;
 const say=(zh,en,lang)=>lang==='en'?en:zh;
 function intent(text,memory={}) {
  const x=text.toLowerCase();
  if(P.hidden.test(x))return 'unknown-person';
  if(memory.payUnknown&&/怎么敢|还敢|凭什么|那你|why.*(?:share|send|recommend)|how.*(?:share|send|dare)|then why/.test(x))return 'challenge';
  if(memory.awaiting==='game'&&text.length<100&&!/作业|吃饭|homework|dinner/.test(x))return 'game-name';
  if(memory.topic==='fatigue'&&/作业|赶|熬|整晚|all night|assignment|deadline|homework/.test(x))return 'fatigue-cause';
  if(memory.awaiting==='submitted'&&/交了|做完|搞定|完了|submitted|finished|done|sent it/.test(x))return 'submitted';
  if(/链接|发来|发我|发一下|论坛|地址|\blink\b|send (?:me )?(?:it|the post)|\bforum\b/.test(x))return 'links';
  if(/诈骗|假的|骗人|靠谱|真假|可信|\b(?:scam|fake|legit|sus)\b|trust|genuine|authentic/.test(x))return 'skeptical';
  if(/工资|多少钱|薪水|薪酬|\b(?:pay|wages?|salary)\b|how much/.test(x))return 'pay';
  if(/兼职|找工作|岗位|\bjob\b|part[ -]?time|\bwork\b/.test(x))return 'job';
  if(/作业|论文|老师|课程|上课|homework|assignment|essay|deadline|\bclass/.test(x))return 'homework';
  if(/导出|软件|文件|电脑|崩了|export|software|files?|computer|crash|backup/.test(x))return 'software';
  if(/好累|累了|累死|很累|困|没睡|熬夜|tired|exhaust|no sleep|barely slept|all night/.test(x))return 'fatigue';
  if(/游戏|打游戏|玩了|game|gaming|played|steam|minecraft|stardew/.test(x))return 'games';
  if(/猫|狗|宠物|小鸟|\b(?:cat|dog|pet|kitten|puppy)\b/.test(x))return 'pets';
  if(/吃|饭|饿|早餐|奶茶|面条|\b(?:food|lunch|hungry|eat|dinner|breakfast|tea)\b/.test(x))return 'food';
  if(/天气|下雨|刮风|好冷|好热|weather|rain|windy|sunny|cold/.test(x))return 'weather';
  if(/周末|逛街|出去|散步|weekend|shopping|walk|hang out/.test(x))return 'plans';
  if(/开心|好消息|过了|成功|好耶|happy|great news|passed|got it working/.test(x))return 'happy';
  if(/烦|难受|焦虑|心情不好|annoyed|upset|frustrat|anxious/.test(x))return 'upset';
  if(/不看|没空|先忙|not now|not interested|busy/.test(x))return 'decline';
  if(/谢谢|感谢|thanks|thank you/.test(x))return 'thanks';
  if(/哈哈|笑死|绷不住|lol|lmao|haha|😂|🤣/.test(x))return 'laugh';
  if(/^(?:在吗|你好|嗨|早|hi\b|hey\b|hello\b|morning\b)/.test(x))return 'greeting';
  if(/晚安|拜拜|先走|睡了|bye|goodnight|gotta go/.test(x))return 'bye';
  if(/奇怪.*网站|酒店|hotel|strange.*(?:site|website)/.test(x))return 'website';
  return 'other';
 }
 const lines={
  mom:{
   fatigue:[['怎么了，今天事情很多吗？','Rough day? What’s been keeping you busy?'],['是忙了一天，还是没睡好？','Long day, or didn’t sleep well?']],
   'fatigue-cause':[['原来是赶作业呀。现在交上去了，还是还差一点？','Ah, the assignment. Have you handed it in, or is there still a bit left?']],
   submitted:[['那就先放下吧，终于能松口气了。','Then you can put it down for a bit. That must be a relief.']],
   homework:[['最近作业多吗？你是在赶这一份，还是还有别的？','Much coursework at the moment? Is this the last one, or are there more?']],
   food:[['我刚买了点菜，还没想好做什么。你想吃点什么？','Just got some groceries. Haven’t decided what to cook. What do you fancy?']],
   happy:[['听着就开心！跟我说说，怎么回事？','Oh, that’s lovely! Tell me what happened.']],
   upset:[['发生什么了？你想说就说，我在听。','What happened? I’m here if you feel like talking.']],
   pets:[['上次散步碰到一只很亲人的小狗，一路跟着我们走。你说的是谁家的？','Met a very friendly dog on my walk. Kept walking along with us. Whose pet is this?']],
   weather:[['我今天出去风挺大的。你那边呢？','Quite windy on my walk today. What’s it like there?']],
   plans:[['我打算去河边走走，你呢，有安排了？','Might go for a walk by the river. Have you got plans?']],
   software:[['具体是哪里不顺利？别急着把原来的文件删了。','What part’s giving you trouble? Keep the original files for now.']],
   website:[['哪里让你觉得不对劲？不放心就先别填自己的资料。','What seems odd about it? Leave your personal details out if you’re unsure.']],
   other:[['你接着说，我刚坐下来。','Go on. I’ve just sat down.'],['这个我还不太了解，怎么回事？','I don’t know much about that. What happened?'],['嗯？你说的是哪件事呀？','Which thing do you mean?']],
   followup:[['对了，下午我那盆花又冒新叶子了，回头拍给你看。','Oh, the plant has another new leaf. I’ll take a picture later.']],
  },
  dad:{
   fatigue:[['忙什么忙到这么累？今天还有事要做？','What’s been wearing you out? Still got things to do today?']],
   'fatigue-cause':[['赶了一晚上啊。交上去了没有？','All night on it? Have you handed it in?']],
   submitted:[['交了就好。文件也留一份，后面可能还用得到。','Good. Keep a copy of the files in case you need them later.']],
   homework:[['进展怎么样？是时间紧，还是卡在哪儿了？','How’s it going? Short on time, or stuck on something?']],
   software:[['具体什么问题？什么时候开始的？','What’s the problem exactly? When did it start?']],
   games:[['你在玩什么？我最近只在手机上玩了会儿牌。','What are you playing? I’ve only played a bit of cards on my phone lately.']],
   happy:[['不错啊，之前忙的就是这个？','Good to hear. Is this what you’ve been working on?']],
   website:[['你看到什么了？要是要交钱或者要证件，先别填。','What did you see? Hold off if it asks for money or ID.']],
   food:[['我刚吃过。你那边准备吃什么？','Just ate here. What are you having?']],
   other:[['你具体说说，我刚看到。','Just saw this. Tell me a bit more.'],['是之前说的那个，还是新的事情？','Is this the thing from before, or something new?'],['这方面我不太熟，你现在弄到哪一步了？','I’m less familiar with that. Where have you got to?']],
  },
  zhe:{
   games:[['你玩的哪个？我最近还在清更新','Which game? I’m still working through updates.']],
   'game-name':[['哦那个，你是刚开始玩还是已经玩挺久了？','Oh, that one. Just started, or been playing a while?']],
   software:[['是卡住了还是直接闪退？我之前也折腾过半天','Freezing or crashing outright? Spent ages on that once.']],
   homework:[['你还差多少？我这边也没弄完','How much have you got left? Mine isn’t done either.']],
   plans:[['我还没定，要不晚点看有没有空一起玩','Nothing fixed. Could see if we’re both free to play later.']],
   fatigue:[['怎么累成这样，昨晚又干啥了','What happened? What were you doing last night?']],
   other:[['等会儿，前面那段我没跟上，你接着说','Wait, missed a bit there. Go on.'],['怎么回事？展开讲讲','What happened? Tell me more.'],['你说哪个来着','Which one do you mean?']],
  },
  milk:{
   food:[['别说 我也还没决定吃什么，你有想法没','Honestly, I haven’t decided either. Any ideas?']],
   pets:[['有照片吗 想看！','Got a picture? I want to see!']],
   plans:[['我想出去逛逛，但还没想好去哪，你呢','Fancy going out, no idea where yet. You?']],
   happy:[['好耶！什么好事，快说说','Yesss. What happened? Tell me!']],
   fatigue:[['今天怎么了，忙到现在吗','What happened today? Been busy this whole time?']],
   other:[['啊你说说，我刚好有空','Tell me. Got a bit of time now.'],['等下我没反应过来，你说的是哪件事','Wait, which thing are we talking about?'],['然后呢？','And then?']],
  },
  gg:{
   pay:[['工资还没问清楚，我也没申请呢','Haven’t checked the pay. Haven’t applied either.'],['具体多少不知道，帖子说先看样本','No number yet. The post says to try the sample first.']],
   challenge:[['我就是发出来一起看看，又没替他担保。工资没问清楚是真的','I shared it so we could look. Wasn’t vouching for them. And yeah, I should’ve checked the pay.']],
   job:[['整理旧酒店的预订单，看着像远程。别的我还没问','Sorting old hotel bookings. Looks remote. Haven’t asked much beyond that.']],
   skeptical:[['我也没申请，就看了那个帖子。先别急着给人转钱','Haven’t applied. Only read the post. Definitely don’t send anyone money.']],
   games:[['哪个游戏，我最近下了一堆还没打开','Which game? Downloaded loads. Opened none.']],
   'game-name':[['那你觉得咋样？值不值得我也下一个','How was it? Worth me downloading it too?']],
   food:[['我也饿，醒了之后就一直在想吃啥','Same. Been thinking about food since I woke up.']],
   homework:[['我还指望今天作业能自己交呢，你还差多少','Still hoping mine will submit itself. How much have you got left?']],
   other:[['啊？哪个，刚没跟上','Huh? Which one? Lost you for a second.'],['然后呢 你接着说','And then? Go on.'],['这个我真不熟，咋回事','Don’t know much about that one. What happened?']],
  },
  zhang:{
   fatigue:[['怎么又没睡好，昨晚干啥了','Another rough night? What were you doing?']],
   homework:[['我那份也还开着，假装看不见中','Mine’s still open too. Pretending not to see it.']],
   food:[['现在聊这个我真的会饿，你准备吃什么','This will actually make me hungry. What are you getting?']],
   games:[['你玩的哪个？先说好，我手残别拉我冲分','Which game? Fair warning, don’t ask me to carry ranked.']],
   pets:[['发张图看看，不许只说不给看','Picture please. Can’t just say that and not show me.']],
   skeptical:[['我也觉得得先看看。他上次也说很正常','Needs checking, yeah. He said the last one was normal too.']],
   other:[['等下，你说的是哪件事','Wait, which thing do you mean?'],['哈哈你接着说，我在看','Haha, go on. I’m reading.'],['怎么还有这事，前面呢','How did that happen? What led up to it?']],
  },
  lin:{
   homework:[['我也还在弄。你是内容没做完，还是最后导出卡住了？','Still working on mine. Is it the assignment itself, or the export that’s stuck?']],
   software:[['你先留一份原文件。具体是在哪一步出问题？','Keep a copy of the original. Which step is going wrong?']],
   skeptical:[['我只看到了帖子上的说法，没法替他确认。先别填个人资料。','Only know what the post says. Can’t verify it. Leave personal details out for now.']],
   fatigue:[['是作业赶太晚，还是别的事？','Was it a late assignment, or something else?']],
   games:[['哪个游戏？我最近还没顾上玩。','Which game? Haven’t had much time to play lately.']],
   other:[['你说的是哪一部分？我刚切回来。','Which part do you mean? Just switched back.'],['这个我没碰过，你现在具体遇到什么问题？','Haven’t run into that. What’s happening exactly?'],['我在，你接着说。','I’m here. Go on.']],
  },
 };
 function plan(s,room,text,rng=Math.random) {
  const mem=s.memories[room]||={turn:0,language:'zh',topic:'',awaiting:'',payUnknown:false,recent:[]};
  const lang=P.language(text,mem.language),topic=intent(text,mem),allowed=P.allowed(room);
  let person=allowed[0];
  if(room==='group'||room==='lunch') {
   const named=allowed.find(id=>text.includes(D.members[id]?.name));
   person=named||(['pay','job','challenge','links'].includes(topic)&&room==='group'?'gg':
    ['homework','software'].includes(topic)?'lin':['laugh','skeptical'].includes(topic)?'zhang':allowed[mem.turn%allowed.length]);
  }
  const knownMember=P.members.includes(person);
  let pair;
  if(topic==='unknown-person')pair=['这个我不知道，你是在哪儿看到的？','I don’t know about that. Where did you see it?'];
  else if(['pay','job','links','skeptical','website'].includes(topic)&&!knownMember)pair=lines[person].website?.[0]||['你说的是什么事？我还不知道呢','What’s this about? I haven’t heard about it.'];
  else if(topic==='links')pair=s.shared?['就在群里那张论坛卡片上，往上翻一下','It’s the forum card in the group. Scroll up a bit.']:['等下，我找到帖子就发群里','Hang on, I’ll drop the post in the group when I find it.'];
  else if(topic==='laugh')pair=person==='mom'?['什么事这么好笑，也跟我说说','What’s so funny? Tell me too.']:['哈哈哈哈','Hahaha'];
  else if(topic==='thanks')pair=person==='mom'||person==='dad'?['没事，有空再聊。','No problem. We can chat when you’ve got time.']:['小事，不用谢','No worries.'];
  else if(topic==='greeting')pair=person==='mom'?['在呢，今天怎么样？','I’m here. How’s your day going?']:person==='dad'?['刚看到，怎么了？','Just saw this. What’s up?']:['在啊，咋了','Hey, what’s up?'];
  else if(topic==='bye'||topic==='decline')pair=['行，你先忙，晚点聊','All right, catch you later.'];
  else {const bank=lines[person]?.[topic]||lines[person]?.other||lines.gg.other;pair=bank[mem.turn%bank.length];}
  let reply=say(...pair,lang);
  if(mem.recent.includes(reply)) {
   const choices=lines[person]?.[topic]||lines[person]?.other||lines.gg.other;
   const alternate=choices.find(p=>!mem.recent.includes(say(...p,lang)));if(alternate)reply=say(...alternate,lang);
  }
  mem.turn++;mem.language=lang;mem.topic=topic;mem.awaiting=topic==='games'?'game':['fatigue-cause','homework'].includes(topic)?'submitted':'';
  if(topic==='pay')mem.payUnknown=true;
  if(!['pay','challenge','laugh','thanks','other'].includes(topic))mem.payUnknown=false;
  mem.recent=[...mem.recent,reply].slice(-5);
  const messages=[{person,text:reply}];
  if(person==='zhang'&&topic==='other'&&rng()<.35)messages.push({person,text:say('我刚在看别的，慢了半拍','Was looking at something else. A bit behind.',lang)});
  if(person==='mom'&&topic==='happy'&&rng()<.22)messages.push({person,text:say('等会儿我把那盆花拍给你看，今天长得可好了。','I’ll send you a picture of the plant later. It’s doing so well today.',lang),afterthought:true});
  return {language:lang,messages,topic};
 }
 return {intent,plan};
})();
