/* Fictional contacts and authored history. No case data or hidden records are read. */
globalThis.StillwaterChatPeople = (()=>{
 const text=(person,zh,en,extra={})=>({person,text:[zh,en],...extra});
 const contacts={
  gg:{name:['GGbond','GGbond'],person:'gg',groupMember:true,description:['随意、嘴贫，没查清楚的事会直说不知道。','Quick, casual and a little cheeky. Admits what he hasn’t checked.'],pace:{min:550,max:1250,burst:0,followup:0},history:[
   text('gg','便利店那个新口味薯片你吃过没','Tried those new crisps at the corner shop?'),text('me','哪个口味','Which ones?'),text('gg','名字挺长 我只记住最后有个烧烤','Long name. All I remember is the barbecue bit.'),text('me','好吃吗','Any good?'),text('gg','我已经吃半包了 还没想明白','Halfway through the bag. Still deciding.'),text('gg','这个表情比较接近','This is about how I feel.',{image:'ad-cat-tabby'}),text('me','等我下课再说','Let me get out of class first.'),text('gg','行 我尽量给你留两片','Okay. I’ll try to leave you two.')],
   proactive:[text('gg','刚想给你看个图，翻半天没找着。算了我再找找','Was going to show you a picture. Can’t find it now. Give me a minute.')]
  },
  zhang:{name:['张靓颖666','张靓颖666'],person:'zhang',groupMember:true,description:['吐槽直接，偶尔连发和表情，不负责解释剧情。','Dry, direct and occasionally sends a little burst of messages.'],pace:{min:800,max:1650,burst:.4,followup:0},history:[
   text('zhang','我今天差点带着充电线出门，没带手机','Nearly left with my charger and no phone.'),text('me','你后来怎么发现的','How did you notice?'),text('zhang','准备出门查手机在哪','Went to check where my phone was before leaving.'),text('zhang','非常有逻辑','Excellent system.'),text('me','至少还没下楼','At least you hadn’t gone downstairs.'),text('zhang','我今天大概长这样','This is roughly me today.',{image:'ad-cat'}),text('me','哈哈哈哈','Hahaha'),text('zhang','别笑 我已经回去拿了','Don’t laugh. I went back for it.')],
   proactive:[text('zhang','刚翻到昨天那张猫图，还是觉得好好笑','Found that cat picture again. Still funny.',{image:'ad-cat-snow'})]
  },
  lin:{name:['小林鸽子','小林鸽子'],person:'lin',groupMember:true,description:['稳一点，聊文件和作业会具体，但不会装作什么都查过。','Practical about files and coursework, without pretending to know everything.'],pace:{min:1250,max:2600,burst:0,followup:0},history:[
   text('lin','导出之前记得看看颜色设置','Check the colour settings before exporting.'),text('me','我刚才导出来比预览暗','Mine came out darker than the preview.'),text('lin','你先留着原文件，别在导出的那份上改','Keep the original. Don’t edit over the export.'),text('me','好，我再导一份看看','Okay, I’ll try another export.'),text('lin','先拿一页试就行，不用每次全导','Test one page first. No need to export the whole thing every time.'),text('me','确实，刚才等了好久','Fair. That took ages.'),text('lin','我也等过，进度条挺会骗人','Been there. Progress bars are very convincing liars.'),text('lin','弄好了再说，我先去接点水','Let me know how it goes. Getting some water.')],
   proactive:[text('lin','桌面上又多了两个“最终版”，我先去整理一下','Two more “final” versions on my desktop. Going to sort those out.')]
  },
  mom:{name:['妈妈','Mom'],person:'mom',avatarMedia:'ad-clouds',groupMember:false,description:['温和，会听玩家说完，也有做饭、花草和散步这些自己的生活。','Warm and attentive, with her own meals, plants and walks to talk about.'],pace:{min:1500,max:3200,burst:0,followup:.22},history:[
   text('mom','阳台那盆花终于冒新叶子了','The plant on the balcony finally has a new leaf.'),text('me','之前不是快蔫了吗','Wasn’t it looking a bit sad?'),text('mom','是呀，我还以为养不回来了','It was. I thought that was it.'),text('mom','换了个地方，没想到还真有用','Moved it to another spot. Apparently that helped.'),text('me','那挺好','That’s good.'),text('mom','下午我和朋友去河边走走，顺便买点菜','Going for a walk by the river with a friend, then picking up some groceries.'),text('me','我这会儿还有点事','I’ve got a few things to finish.'),text('mom','你先忙，晚点有空再聊','Go on then. We can catch up later.')],
   proactive:[text('mom','我刚从外面回来，今天风还挺大。你那边天气怎么样？','Just got back from a walk. Quite windy here. How’s the weather where you are?')]
  },
  dad:{name:['爸爸','Dad'],person:'dad',avatarMedia:'ad-dog',groupMember:false,description:['回复慢一些，务实但愿意聊近况，不做长篇说教。','Often replies later. Practical, interested in how things are going, not a lecturer.'],pace:{min:16000,max:28000,burst:0,followup:0},history:[
   text('dad','项目文件拷出来没有？','Have you made a copy of the project files?'),text('me','还在电脑上，等会儿拷','Still on the computer. I’ll copy them in a bit.'),text('dad','别只有一份就行','Just make sure it isn’t the only copy.'),text('me','知道了','Will do.'),text('dad','我这边的旧鼠标又好了，换了块电池','Old mouse is working again. Changed the battery.'),text('me','你不是说它坏了吗','Thought you said it was broken.'),text('dad','所以先检查简单的地方','That’s why you check the simple things first.'),text('dad','我去忙一会儿，晚点看手机','Got a few things to do. I’ll check my phone later.')],
   proactive:[text('dad','刚忙完。你最近的课和项目还顺利？','Just finished up here. How are classes and the project going?')]
  },
  milk:{name:['奶茶不要冰','No Ice'],person:'milk',avatarMedia:'ad-cat-snow',groupMember:false,description:['活泼，喜欢吃饭、逛街和分享小事，不过度热情。','Lively about food, wandering round the shops and little everyday things.'],pace:{min:750,max:1900,burst:.2,followup:0},history:[
   text('milk','今天那家店排队好长','Such a long queue at that place today.'),text('me','你还排吗','Are you staying?'),text('milk','本来准备走的，刚好轮到我了','Was about to leave. Then it was my turn.'),text('milk','来都来了嘛','Well, I was already there.'),text('me','最后买了什么','What did you get?'),text('milk','还是平时那个，我真没出息','The usual. Adventurous as ever.'),text('milk','等奶茶的时候看到这个，像不像我','Saw this while waiting. Is this me or what?',{image:'ad-cat-tabby'}),text('me','有点像','A little.')],
   proactive:[text('milk','我又在纠结中午吃什么了，你今天有没有特别想吃的？','Doing the lunch decision thing again. Anything you’re craving today?')]
  },
  zhe:{name:['阿哲','Zhe'],person:'zhe',avatarMedia:'ad-computer',groupMember:false,description:['随意聊游戏、电脑、课程和周末安排，不知道酒店的事。','Easygoing about games, computers, classes and weekend plans.'],pace:{min:900,max:2300,burst:.12,followup:0},history:[
   text('zhe','周末有空不','Free this weekend?'),text('me','可能有，怎么了','Maybe. What’s up?'),text('zhe','想找人一起玩，不想再排路人了','Need someone to play with. Had enough random teammates.'),text('me','到时候说','Let’s see nearer the time.'),text('zhe','行 我先把更新下好','Sure. I’ll get the update downloaded.'),text('zhe','每次想玩才发现要更新','Always needs an update right when I want to play.'),text('me','这次提前一点','Start it early this time.'),text('zhe','已经在下了 这次真提前了','Already downloading. Actually planned ahead for once.')],
   proactive:[text('zhe','刚把更新下完了，等有空再玩。你今天忙啥？','Update finally finished. I’ll play later. What are you up to today?')]
  },
 };
 const D=globalThis.StillwaterChatData;
 D.people={...D.members,...Object.fromEntries(Object.entries(contacts).map(([id,c])=>[id,{name:c.name}]))};
 D.sideChats={...D.sideChats,...Object.fromEntries(Object.entries(contacts).map(([id,c])=>[id,{name:c.name,avatar:id,messages:c.history,kind:'private',person:id}]))};
 D.sideChats.lunch.kind='group';D.sideChats.lunch.members=['lin','zhang'];D.sideChats.notes.kind='notes';
 D.sideChats.notes.name=['文件传输助手','File Transfer Assistant'];
 D.maxText=2400;
 const order=['group','gg','mom','zhang','lin','dad','milk','zhe','lunch','notes'];
 return {contacts,order,history:room=>D.sideChats[room]?.messages||[],profile:person=>contacts[person]?.pace||{min:1000,max:2300,burst:0,followup:0}};
})();
