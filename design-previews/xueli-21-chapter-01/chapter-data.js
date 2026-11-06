// Director’s Cut P0 player copy, imported from the author’s bilingual revision.
// Development notes and unresolved world rules are not runtime content.
export const CONTENT_REVISION = "directors-cut-p0-20261106";

export const ASSETS = {
  "app-chat": {
    "zh": "微信",
    "en": "WeChat"
  },
  "app-files": {
    "zh": "文件夹",
    "en": "Files"
  },
  "app-browser": {
    "zh": "浏览器",
    "en": "Browser"
  },
  "app-casebook": {
    "zh": "调查笔记",
    "en": "Casebook"
  },
  "avatar-gg": {
    "zh": "GGbond 头像",
    "en": "GGbond avatar"
  },
  "prop-pc": {
    "zh": "2008 年旧电脑",
    "en": "2008 computer",
    "tiles": [
      2,
      1
    ]
  },
  "photo-anniversary": {
    "zh": "旅馆周年合影",
    "en": "Anniversary photo",
    "tiles": [
      2,
      1
    ]
  },
  "portrait-june": {
    "zh": "朱恩的工作照",
    "en": "June at work",
    "tiles": [
      1,
      2
    ]
  },
  "prop-camera-bag": {
    "zh": "日记里的相机包",
    "en": "The camera bag in the diary",
    "tiles": [
      1,
      2
    ]
  },
  "photo-back": {
    "zh": "合影背面的扫描",
    "en": "Scan of the back of the print",
    "tiles": [
      2,
      1
    ]
  }
};

export const ANSWER_ALIASES = {
  "person": [
    "朱恩·沃德",
    "朱恩沃德",
    "朱恩",
    "June Ward",
    "J. Ward",
    "June"
  ],
  "place": [
    "青鸟照相馆",
    "青鸟摄影店",
    "青鸟",
    "Bluebird Photo",
    "Bluebird Photo Studio",
    "Bluebird"
  ],
  "purpose": [
    "员工合影",
    "员工合照",
    "旅馆合照",
    "旅馆合影",
    "周年合影",
    "合影底片",
    "照片原件",
    "原底片",
    "合影",
    "合照",
    "底片",
    "staff photo",
    "hotel group photograph",
    "anniversary picture",
    "original group photo",
    "old hotel staff photo",
    "original group picture",
    "photo negative"
  ]
};

export const UI_COPY = {
  "chapter": {
    "zh": "还没有寄出的照片",
    "en": "The Names on the Back"
  },
  "shared": {
    "zh": "GG 分享的旧盘副本 / 只读",
    "en": "GG's old-drive copy / Read-only"
  },
  "start": {
    "zh": "GG 发了个文件，先看看。",
    "en": "GG sent a file. Maybe start there."
  },
  "afterNote": {
    "zh": "那张合影是谁拍的？",
    "en": "Who took that photograph?"
  },
  "afterProfile": {
    "zh": "楚人后来联系了谁？",
    "en": "Who did Churen contact?"
  },
  "afterEmail": {
    "zh": "写下他原本的计划。",
    "en": "Write down what he planned to do."
  },
  "prompt": {
    "zh": "那天下午，他打算……",
    "en": "That afternoon, he was planning to..."
  },
  "person": {
    "zh": "约见谁？",
    "en": "Meet whom?"
  },
  "place": {
    "zh": "在哪里见？",
    "en": "Where?"
  },
  "purpose": {
    "zh": "想看什么？",
    "en": "See what?"
  },
  "submit": {
    "zh": "记下来",
    "en": "Write it down"
  },
  "empty": {
    "zh": "先把你找到的写进去，短一点也没关系。",
    "en": "Write what you think. A short answer is fine."
  },
  "noResults": {
    "zh": "没搜到。换个词，或者试试英文？",
    "en": "Nothing there. Try another word, or the other language?"
  },
  "success": {
    "zh": "记下来了：这只是约见计划，还不知道他有没有去。",
    "en": "Saved as a planned meeting. We still don't know if he went."
  },
  "newMessage": {
    "zh": "GGbond 又发来东西了。",
    "en": "GGbond sent something else."
  },
  "optional": {
    "zh": "雪梨镇的其他事情",
    "en": "Other things happening in Xueli Town"
  },
  "pendingArt": {
    "zh": "图片还在准备中，说明文字可以先看。",
    "en": "Illustration pending. The text is still available."
  }
};

export const OPENING = [
  {
    "zh": "我买的那台破电脑到了。",
    "en": "That ancient PC finally turned up."
  },
  {
    "zh": "闲虾上看到的，雪梨镇寄出来。卖家连头像都没有，我当时想这人要么不想卖东西，要么是真的懒。",
    "en": "Found it on Xianxia. Shipped from Xueli Town. Seller didn't even have a profile picture. Either they didn't want to sell it or they couldn't be bothered."
  },
  {
    "zh": "08 年的机子，开机声音像拖拉机。不过硬盘后来被人换过，里面有 2023 年的文件。这个年份就有点怪了。",
    "en": "It's from 2008 and starts up sounding like a tractor. Someone replaced the drive later, though. There are files dated 2023. That's the weird part."
  },
  {
    "zh": "我把能读出来的文件留了份副本给你看，原盘先不动。里面有个拍照备忘，落款写 W.C.，还欠我一杯咖啡。",
    "en": "I made you a copy of everything I could read. Leaving the original drive alone for now. Found a photography note signed W.C. And a bit about owing me a coffee."
  },
  {
    "zh": "我不敢说就是楚人。找了三年，有时候看见一个字母都觉得像他。你先看，别急着高兴。",
    "en": "I'm not saying it's Churen. We've been looking for three years. Sometimes I see a couple of initials and want them to mean something. Just take a look first, okay?"
  }
];

export const ENDING = [
  {
    "zh": "所以楚人约了十六号三点去青鸟看合影。约了，不等于真去了……至少我们知道那天下午他打算干嘛。",
    "en": "So he planned to see June at Bluebird at three on the sixteenth. Planned, not definitely went. Still, at least we know what he meant to do that afternoon."
  },
  {
    "zh": "你在翻文章的时候，我把那台机器带来的小外接盘也接上了。刚才一直显示有问题，换了接口才读出来一部分。",
    "en": "While you were reading I plugged in that little external drive from the same box. It was acting up for a while, but I can read some of it now."
  },
  {
    "zh": "上面有张照片背面的扫描。你先别猜，我把能看到的都发你。",
    "en": "There's a scan of the back of a photograph. Don't try to guess it yet. Sending you everything I can make out."
  }
];

export const DOCUMENTS = [
  {
    "id": "note",
    "contentId": "P0-FILE-01",
    "kind": "file",
    "date": "2023-10-15",
    "title": {
      "zh": "拍照备忘.txt",
      "en": "photo-notes.txt"
    },
    "author": {
      "zh": "W.C.",
      "en": "W.C."
    },
    "origin": {
      "zh": "GG 分享的旧盘副本 / 摄影课程文件夹",
      "en": "GG’s shared drive copy / Photography coursework"
    },
    "file": "photo-notes.txt",
    "keywords": [
      "拍照",
      "备忘",
      "W.C.",
      "photo notes"
    ],
    "paragraphs": {
      "zh": [
        "十月十五日，周日。",
        "老师让我别把作业做成“旧建筑百科全书”，先找一张照片，搞清楚照片上到底站着哪些人。道理我懂，但你让我在一张只有巴掌大的网页图里认人，也太为难我的眼睛了。",
        "静水旅馆那张十九周年合影一直找不到清晰版。放大后每个人都像面包店橱窗里的小饼干。我想找的是当年的纸质照片，最好能看到背面的名字，还有拍照时留下的底片。不是把图片扔给软件，让它替我猜出十张脸。",
        "雪梨镇周刊那篇报道我先存书签了。明天记得查摄影署名，再打听照片原件在谁手里。课程讲“记忆和图像”，我倒觉得先把照片的出处找对，比写一整页漂亮话管用。",
        "相机电池要充。读卡器别忘。别在车上睡过站。",
        "还有，回芝加哥给 GG 买杯咖啡。上次误喝他半杯，他说得跟我偷了祖传茶壶似的。",
        "W.C."
      ],
      "en": [
        "October 15. Sunday.",
        "My tutor told me to stop turning the assignment into an encyclopedia of old buildings. Find one photograph, work out who is actually in it. I get the point, but asking me to identify people from a web thumbnail the size of my palm is a little unfair.",
        "I still can't find a decent copy of that nineteenth-anniversary group photo from Stillwater Hotel. Zoom in and everyone turns into a biscuit in a bakery window. I want the old paper print if it still exists, especially the names on the back. And the original negative, ideally. Not some software guessing ten faces for me.",
        "Saved the Xueli Weekly article. Tomorrow: check the photo credit and find out who might have kept the original. The course is about 'memory and images', but getting the source right feels more useful than writing another page of elegant nonsense.",
        "Charge camera. Pack card reader. Do not fall asleep on the bus.",
        "Also buy GG a coffee when I'm back in Chicago. I drank half of his by mistake and he acts like I stole an heirloom teapot.",
        "W.C."
      ]
    },
    "link": "weekly",
    "linkLabel": {
      "zh": "雪梨镇周刊 / 静水旅馆十九周年",
      "en": "Xueli Weekly / Stillwater Hotel nineteenth anniversary"
    }
  },
  {
    "id": "weekly",
    "contentId": "P0-WEEK-01",
    "kind": "weekly",
    "date": "2006-09-24",
    "title": {
      "zh": "十九年了，前台的钟还是慢五分钟",
      "en": "Nineteen Years On, the Lobby Clock Is Still Five Minutes Slow"
    },
    "author": {
      "zh": "艾达·里德（Ada Reed）",
      "en": "Ada Reed"
    },
    "origin": {
      "zh": "雪梨镇周刊 / 社区生活",
      "en": "Xueli Weekly / Community"
    },
    "file": "weekly-2006-09-24.html",
    "keywords": [
      "Stillwater",
      "静水",
      "旅馆",
      "十九周年",
      "anniversary",
      "hotel",
      "青鸟",
      "Bluebird",
      "J.W."
    ],
    "deck": {
      "zh": "静水旅馆周六举行周年聚会，员工合影险些被一盘司康耽误",
      "en": "Stillwater Hotel’s anniversary gathering nearly lost its staff photograph to a tray of scones."
    },
    "figure": "photo-anniversary",
    "paragraphs": {
      "zh": [
        "静水旅馆昨天过十九岁生日。下午的聚会原定三点半开始，前台墙上的钟却仍然慢五分钟。经理说这次总算该修了。来参加聚会的老顾客罗伯特先生不同意：“这钟我认识十几年了，要是突然准了，我反而不习惯。”",
        "那天先下了一阵雨。工作人员把准备放在院子里的椅子搬回门廊，刚摆整齐，餐厅又端出一盘热司康。几个已经站好位置的人闻到味道，决定先吃再拍。摄影师只能看着三排椅子重新空下来。",
        "负责餐厅的露丝一边拿茶巾擦手，一边数人头。“平时最难的是让大家按时下班，今天是让大家按时站着。”她说。站在她身边的年轻服务生表示自己不是故意跑开的，只是有人告诉他厨房缺人。那个人其实在找自己的耳环。",
        "旅馆 1987 年开业，靠湖的休息室和前台铜铃在本地宣传册里出现过许多次。罗伯特太太说，她丈夫每年都要来看一眼老自动售货机：“不是为了买东西，是想知道它今年有没有修好。”机器旁边那张“暂时停用”的纸条已经贴了很久。",
        "这次合影请来了青鸟照相馆（Bluebird Photo）。摄影师的相机带上系着一截黄色绳子，来得比约定时间还早，却一直等到四点多才按下快门。有人提议把旅馆的老狗也抱进照片，摄影师问谁保证它不会乱跑。现场无人应答，狗最后在画面外面继续找吃的。",
        "照片完成后，报社收到的是缩小过的版本，摄影署名只有两个字母：J.W.。旅馆准备印一张挂到餐厅，让当天在场的员工在照片背面写上自己的姓名，以免多年以后只能用“老在前台丢钥匙的那位”来叫人。原底片由青鸟照相馆保留，需要重印时可以再联系他们。",
        "聚会一直拖到日落前。厨房留下两盒苹果蛋糕给晚班，前台的钟没人来得及修。对镇上一家开了十九年的旅馆来说，这不算大新闻。但大家至少留下了一张照片，等明年再聚时，可以看看谁又换了发型。"
      ],
      "en": [
        "Stillwater Hotel turned nineteen yesterday. The gathering was supposed to begin at half past three, although the clock above reception was still five minutes slow. The manager declared that someone ought to fix it this year. Robert, a regular guest, disagreed. 'I've known that clock for fifteen years. If it suddenly kept the right time, I'd think something was wrong.'",
        "A shower passed over in the afternoon. Staff carried the chairs from the lawn onto the veranda, lined them up neatly, then promptly abandoned them when the dining room brought out a tray of hot scones. The photographer watched three careful rows turn into an empty arrangement of furniture.",
        "Ruth, who runs the dining room, counted heads while drying her hands on a tea towel. 'Usually the hard part is getting everyone to leave work on time. Today it's getting them to stand still.' A young waiter insisted he had only gone inside because somebody said the kitchen needed help. The somebody in question had actually been looking for a missing earring.",
        "The hotel opened in 1987. Its lakeside lounge and brass reception bell have appeared in more local brochures than anyone could count. Robert’s wife says her husband still checks the old vending machine on every visit. 'Not to buy anything. Just to see if it's finally working.' Its OUT OF ORDER notice has been there rather a long time.",
        "Bluebird Photo was hired to take the staff portrait. The photographer arrived early with a little length of yellow cord tied to her camera strap, but it was after four before she could press the shutter. Someone suggested including the old hotel dog. She asked who would promise it stayed put. Nobody volunteered. The dog kept looking for food just outside the frame.",
        "The photograph that reached the Weekly is a reduced copy, signed simply J.W. The hotel plans to hang a paper print in the dining room and have staff write their names on the back. Years from now, the people in it ought to be remembered as more than 'the one who always lost the reception keys'. Bluebird Photo kept the original negative, so reprints should remain possible.",
        "The party ran almost until sunset. Two boxes of apple cake were put aside for the evening shift and nobody had time to fix the lobby clock. That isn't much of a headline for a nineteen-year-old hotel, but at least they have a picture. Next year they can compare who has changed their hair."
      ]
    },
    "caption": {
      "zh": "静水旅馆十九周年员工合影，拍摄于 2006 年 9 月 23 日。摄影：青鸟照相馆（Bluebird Photo），署名 J.W.。这是网页缩印件；原底片由摄影师保存。餐厅展示的纸质照片背面有员工留下的姓名。",
      "en": "Stillwater Hotel staff on September 23, 2006, for the nineteenth-anniversary gathering. Photograph by Bluebird Photo, signed J.W. This is a reduced web copy. The photographer kept the negative; staff wrote their names on the back of the paper print displayed in the dining room."
    }
  },
  {
    "id": "profile",
    "contentId": "P0-WEEK-02",
    "kind": "weekly",
    "date": "2019-04-13",
    "title": {
      "zh": "旧照片不需要每年换一遍名字",
      "en": "Old Photographs Don't Need New Names Every Year"
    },
    "author": {
      "zh": "艾达·里德（Ada Reed）",
      "en": "Ada Reed"
    },
    "origin": {
      "zh": "雪梨镇周刊 / 一间小店",
      "en": "Xueli Weekly / One Small Shop"
    },
    "file": "june-ward-bluebird.html",
    "keywords": [
      "青鸟",
      "朱恩",
      "沃德",
      "June Ward",
      "Bluebird",
      "J.W."
    ],
    "deck": {
      "zh": "桦树街的蓝门还在，青鸟照相馆也还在",
      "en": "The blue door on Birch Street is still there. So is Bluebird Photo."
    },
    "figure": "portrait-june",
    "paragraphs": {
      "zh": [
        "采访那天，青鸟照相馆门口有三把湿伞，地毯却只能容得下两把。第三位客人把伞插进空花瓶里，店主朱恩·沃德（June Ward）抬头看了看，说：“挺好的，那个花瓶反正从来没插过花。”",
        "店在桦树街开了三十多年。门被刷成蓝色，窗上贴着的营业时间改过许多回，偏偏一块写着 OPEN 的牌子总是有点歪。朱恩说不是她没试着扶正，只是碰一下它又歪回来。来得多的客人已经习惯了。",
        "现在拿着底片来冲洗的人不多了，拿着旧纸盒来问“这是什么时候拍的”的人却不少。朱恩把店里留下的底片按年份放进旧饼干盒，盒盖上一律贴纸条。她说没有比饼干盒更好用的东西，但以前有个帮忙的学生揭开盖子，发现里面真没有饼干，失望得不肯说话。",
        "早些年，她给报纸寄照片时常常只写 J.W.。有位读者把这当成一家图片社，专门寄来感谢信，开头写“致 J.W. 全体员工”。朱恩回信告诉对方，全体员工就她一个人，另外还有一台隔三差五卡纸的打印机。",
        "谈到以前拍过的照片，朱恩想起学校运动会、婚礼，还有静水旅馆的周年聚会。2006 年那次，她先想起的是大家排好了队又跑去吃点心。旅馆在 2007 年停业后，一位前员工把当年挂在餐厅的纸质员工合照送回了店里，请她先替大家收着。朱恩把它和她保存的原底片放在不同的套袋中，免得有人拿错。纸背上是员工当年自己写的字。",
        "“你看，这个字现在可能已经不是那个人用的名字了。”她把照片翻过来，指给记者看一行发淡的铅笔字。“人会改姓，会搬家，也会忘掉以前别人怎么叫自己。我不替他们重写。要改说明可以另贴一张纸，原来的就让它留着。”",
        "柜台后面还有一只缺口的黄色杯子，专门放铅笔。朱恩说她不扔杯子，是因为坏的位置刚好不影响用。最近也有学生来找旧照片：带来的通常是一张糊得看不清人的网页截图。她会让人先坐下来，把时间和照片来源讲清楚。“千万别上来就问，阿姨，你认不认得这一排人？这镇子不小呢。”",
        "五月份她要去图书馆教大家整理家庭相册。报名者可以带一张愿意分享的旧照片，也可以什么都不带，先来学怎么分清原件、复印件和后来重新打印的照片。她说最重要的不是买多少种昂贵的盒子，而是至少让后来的孩子知道，这个名字是谁写的。"
      ],
      "en": [
        "Three wet umbrellas stood by the door of Bluebird Photo when I arrived. The mat had room for two. The third customer had put hers in an empty vase. The owner, June Ward, looked up and said, 'Good idea. I never put flowers in that thing anyway.'",
        "The shop has been on Birch Street for more than thirty years. Its door is blue, the opening hours have been revised plenty of times, and the little OPEN sign never seems to hang straight. June says she's tried fixing it. Apparently the sign has other plans. Regular customers now use the tilt to recognise the place.",
        "Not many people bring film in for processing these days. Plenty bring old cardboard boxes and ask, 'Any idea when these were taken?' June keeps her negatives in biscuit tins labelled by year. She maintains nothing works better. A student helping in the shop once lifted the lid of one and was so disappointed by the absence of biscuits that he refused to speak for a minute.",
        "When she used to send photographs to the newspaper, June often signed them J.W. One reader thought the initials belonged to a picture agency and addressed a thank-you letter to 'the entire staff of J.W.' June wrote back to explain that the entire staff consisted of one woman and a printer that jammed every other week.",
        "Her archive includes school sports days, weddings and parties at Stillwater Hotel. What she remembers first about the hotel's 2006 anniversary is the way everyone lined up for the picture then disappeared for snacks. After the hotel closed in 2007, a former employee brought the paper photograph from the dining room back to her shop, asking her to keep it safe. June stored it apart from the original negative so neither would be mistaken for the other. The names on the back were written by the staff themselves.",
        "'And that might not even be the name this person uses now,' she says, pointing to a faded pencil line. 'People marry, move away, forget what their old colleagues used to call them. I'm not rewriting it for them. You want to update a caption, attach another piece of paper. Leave the original alone.'",
        "A chipped yellow mug behind the counter holds her pencils. June keeps it because the chip is nowhere near the handle. These days students sometimes visit with low-resolution screenshots of old photographs. She makes them sit down and explain the date and source first. 'Don't just march in and ask if I know everyone in a row. It's a town, not my family album.'",
        "In May she will run a workshop at the library on sorting family photographs. You can bring an old picture or simply come to learn how to tell an original print from a copy made later. June says the important thing isn't the price of the storage box. It's making sure someone, someday, knows who wrote the name on the back."
      ]
    },
    "caption": {
      "zh": "朱恩·沃德在店里整理取件袋。老照片上 J.W. 的署名出自她本人。",
      "en": "June Ward sorting customers' collection envelopes at Bluebird Photo. The J.W. signature on older photographs belongs to her."
    }
  },
  {
    "id": "directory",
    "contentId": "P0-SHOP-01",
    "kind": "directory",
    "date": "2023-10-01",
    "title": {
      "zh": "桦树街商户小册：2023 年秋季版",
      "en": "Birch Street Directory — Autumn 2023"
    },
    "author": {
      "zh": "雪梨镇商户通讯编辑组，各商户校订",
      "en": "Xueli Traders Bulletin, checked with listed businesses"
    },
    "origin": {
      "zh": "雪梨镇商户通讯 / 公开商户目录",
      "en": "Xueli Traders / Public directory archive"
    },
    "file": "birch-street-autumn-2023.html",
    "keywords": [
      "青鸟",
      "朱恩",
      "沃德",
      "Bluebird",
      "June Ward",
      "桦树街",
      "Birch",
      "Maggie",
      "餐馆"
    ],
    "paragraphs": {
      "zh": [
        "秋天的营业时间又到了重新核对的时候。去年有人照着三年前的旧目录去买面包，结果那家店早已改成修鞋铺。编辑组今年在九月底逐家核对过一轮；临时休假和突然卖光的馅饼，仍然请看店门口的手写牌子。",
        "青鸟照相馆 / Bluebird Photo  \n经营者：朱恩·沃德（June Ward）  \n地址：桦树街 6 号 / 6 Birch Street  \n时间：周一至周六 13:00—18:00，周日休息。旧底片翻拍、照片冲印、相机电池及小型相框。查看十多年前的底片请先与朱恩商量，她得去后面的储物间找。",
        "Maggie’s Diner  \n地址：桦树街 2 号。每天早晨七点开始供应早餐，星期三休息。蓝莓煎饼和热咖啡照旧；秋季南瓜派数量有限。Maggie 不接受提前一天预订一片派，她说那样不如来店里碰运气。",
        "阿尔自行车修理 / Al’s Bike Repair  \n地址：桦树街 11 号后院，沿蓝色围栏走进侧门。修补轮胎、调刹车、给旧车换链条。午饭时间可能听见收音机，但找不到店主，因为他通常坐在后面吃三明治。",
        "Second Turn Books  \n地址：桦树街 14 号。二手书、旧地图和已经不太流行的旅行指南。周六下午可以把书拿来交换；请先把夹在书里的购物小票和照片取走，去年有人把祖母的生日卡一起送来了。",
        "本目录仅供查询，不能当作预约或价格保证。商户如需修改资料，可联系本通讯编辑组。"
      ],
      "en": [
        "It's that time of year again: we have checked the shops' opening hours. Last autumn, somebody followed a three-year-old listing to buy bread and discovered that the bakery had turned into a shoe-repair shop. We checked with every business in late September this time. Unexpected days off, and pies selling out before lunch, will still be announced by the shops themselves.",
        "Bluebird Photo  \nOwner: June Ward  \nAddress: 6 Birch Street  \nHours: Monday–Saturday, 1:00–6:00 p.m. Closed Sundays. Film processing, reproductions of older photographs, camera batteries and small frames. Ask June before coming to look for negatives from years ago: she may need to search the storage room.",
        "Maggie's Diner  \nAddress: 2 Birch Street. Breakfast from seven every morning except Wednesday. Blueberry pancakes and hot coffee are still on the menu; pumpkin pie is seasonal. Maggie does not reserve individual slices a day in advance. She says that takes the fun out of stopping by.",
        "Al's Bike Repair  \nAddress: Rear yard, 11 Birch Street. Follow the blue fence to the side entrance. Tire patches, brakes and chains for older bicycles. You may hear a radio around lunchtime without seeing Al: he's usually at the back eating a sandwich.",
        "Second Turn Books  \nAddress: 14 Birch Street. Used books, old maps and travel guides nobody seems to publish anymore. Bring books to swap on Saturday afternoons. Please check for receipts, photographs and cards tucked between the pages. Last year someone accidentally donated a birthday card from their grandmother.",
        "This directory is for general information, not a reservation or price guarantee. Shops wishing to update an entry should contact the bulletin editors."
      ]
    }
  },
  {
    "id": "reply",
    "contentId": "P0-MAIL-01",
    "kind": "mail",
    "date": "2023-10-15",
    "title": {
      "zh": "Re: 关于那张旧合影",
      "en": "Re: the old group photograph"
    },
    "author": {
      "zh": "J. Ward → W. Churen",
      "en": "J. Ward → W. Churen"
    },
    "origin": {
      "zh": "本机留存邮件 / 收件副本，非公开网页",
      "en": "Local saved mail copy / Not a public website"
    },
    "file": "June_Ward_reply_2023-10-15.eml",
    "keywords": [
      "June Ward",
      "J Ward",
      "朱恩沃德",
      "朱恩·沃德",
      "朱恩",
      "June"
    ],
    "paragraphs": {
      "zh": [
        "楚人，你好：",
        "收到你发来的缩图了，是那张没错。纸质照片和底片我都找到了，纸背的字还在，就是有几处写得挺挤，得凑近慢慢看。我不会猜看不清的名字，这个先说好。",
        "按我们邮件里约的，明天，10 月 16 日星期一，下午三点来就行。青鸟照相馆，桦树街 6 号。蓝色店门，旁边有块挂得不太正的 OPEN 牌子。你要是先看见牌子歪了，说明没走错。",
        "带着网页那张图就行，不用为了几行字把整本作业打印出来。来了我们先看原件，再看看你要拍的建筑照片能不能和以前的角度对上。店里周一下午一般不算太忙，不过要是有人来取照，我可能得先帮他找一会儿袋子。",
        "周一见。",
        "June"
      ],
      "en": [
        "Hi Churen,",
        "Got the thumbnail you sent. Yes, that's the picture. I found the print and the negative, and the writing on the back is still there. Some of it is pretty cramped, so we'll have to take a close look. I won't guess at the bits I can't read, just so we're clear.",
        "As arranged, tomorrow, Monday October 16, at three in the afternoon is fine. Bluebird Photo, 6 Birch Street. Blue door, slightly crooked OPEN sign beside it. If you see the crooked sign, you've come to the right place.",
        "Bring the thumbnail on your screen. No need to print your entire coursework folder for a few names. We can look at the original first, then compare your building photographs with the old angles if you like. Monday afternoons are usually quiet, though I may have to find somebody's collection envelope in the back.",
        "See you Monday,",
        "June"
      ]
    },
    "mail": {
      "from": "J. Ward",
      "to": "W. Churen",
      "sent": "2023-10-15 17:26"
    },
    "status": {
      "zh": "这是一封已留存的约见邮件；副本中没有 10 月 16 日的到访确认、后来回信或现场照片。",
      "en": "This is a saved appointment email. This local copy includes no October 16 check-in, subsequent reply or photograph documenting an actual visit."
    }
  },
  {
    "id": "letter",
    "contentId": "P0-LIFE-01",
    "kind": "weekly",
    "date": "2023-09-08",
    "title": {
      "zh": "给镇议会的一封信：拜托别把河边长椅搬走",
      "en": "Letter to the Council: Please Leave the Riverside Bench Where It Is"
    },
    "author": {
      "zh": "安妮·贝克（Annie Baker），河湾路居民",
      "en": "Annie Baker, Riverbend Road"
    },
    "origin": {
      "zh": "雪梨镇周刊 / 读者来信",
      "en": "Xueli Weekly / Letters to the Editor"
    },
    "file": "riverbench-letter-2023-09-08.html",
    "keywords": [
      "长椅",
      "河边",
      "河湾",
      "Annie Baker",
      "bench",
      "riverbend"
    ],
    "paragraphs": {
      "zh": [
        "编辑您好：",
        "我昨天看见公告，说河边步道要重新整理，那张靠柳树的长椅可能会被挪到停车场旁边。我不知道这个决定是谁想出来的，但我猜那个人多半没在下午四点去那里坐过。",
        "那张椅子当然不算漂亮。左边的油漆已经掉了，木板上还有一道很像闪电的裂纹。坐上去也不能太靠右，因为右边第二块木板会勾住外套。我知道这些毛病，既然你们打算修步道，当然可以把它们修好。可这不等于非得把整张椅子搬走。",
        "学校放学以后，有两个孩子常常坐在那里等接他们的车。河湾路的老怀特先生会带报纸过来，看到熟人就把报纸折起来，先讲一遍今天的天气有多不讲道理。我和邻居从超市回来，偶尔也会在那里歇脚。我们未必认识彼此的名字，但会说一句“今天风真大”，或者“你也买不到那种面包了吗”。",
        "停车场旁边不是不能坐。问题是那里下午太阳直接照在脸上，还挨着垃圾桶。河边那张椅子的位置刚好有树荫，往前一点能看见水，往后一步就有步道。它被人用得多，不是因为大家懒得走远，而是因为那个地方就是适合坐一会儿。",
        "有人说，长椅太旧了，留着不体面。我觉得不体面的只是那颗一直没人拧紧的螺丝。要是真的有预算，请先把松动的地方修好，再把靠背刷一遍漆。镇上不缺需要重新摆放的东西，但至少这张椅子已经摆对位置了。",
        "如果可以，我愿意在周六帮忙清掉旁边的落叶。我不负责搬椅子，我的腰可没年轻到那个地步。",
        "安妮·贝克  \n河湾路"
      ],
      "en": [
        "Dear Editor,",
        "I saw yesterday's notice about improvements to the riverside path. Apparently the bench under the willow tree may be moved beside the parking lot. I have no idea who suggested this, but I suspect they have never sat on it at four in the afternoon.",
        "I'm not claiming it's a beautiful bench. The paint has worn away on one side and there's a crack in the wood shaped rather like a bolt of lightning. You can't sit too far right, either, or the second board catches your coat. I know all of that. If the council is fixing the path, it can certainly repair the bench too. That doesn't mean the whole thing needs moving.",
        "After school, two children often wait there for their ride home. Old Mr. White from Riverbend Road brings his newspaper, though he usually folds it up as soon as somebody he knows comes past and starts explaining why the weather is behaving so badly. My neighbor and I occasionally stop there on our way back from the grocery store. We don't always know the names of the people sitting nearby. We still talk about the wind, or how the shop has run out of that particular bread again.",
        "I don't object to seating near a parking lot. I object to that particular parking lot. The afternoon sun is straight in your eyes, and the proposed position is next to the garbage bins. The existing bench gets shade from the tree. It faces the river, and the path is right behind it. People use it because it's a good place to sit for five minutes, not because they're too lazy to walk any farther.",
        "I've heard somebody say an old bench doesn't make the town look very respectable. As far as I'm concerned, the only truly embarrassing thing about it is the loose screw that nobody has tightened. If there's money to spend, fix that, repair the boards and paint the backrest. There are plenty of things in Xueli that could do with moving around, but this one is already in the right place.",
        "I'm happy to help clear the leaves around it on Saturday. I will not be volunteering to carry the bench. My back is not what it was twenty years ago.",
        "Yours,  \nAnnie Baker  \nRiverbend Road"
      ]
    }
  },
  {
    "id": "diary",
    "contentId": "P0-LIFE-02",
    "kind": "file",
    "date": "2023-10-03",
    "title": {
      "zh": "10 月 3 日，星期二。相机包还没干",
      "en": "Tuesday, October 3. My Camera Bag Still Isn't Dry"
    },
    "author": {
      "zh": "W.C.",
      "en": "W.C."
    },
    "origin": {
      "zh": "旧盘副本 / 个人日记，课程资料文件夹",
      "en": "Drive copy / Personal diary, coursework folder"
    },
    "file": "wcr-diary-2023-10-03.txt",
    "keywords": [
      "日记",
      "相机包",
      "camera",
      "diary",
      "W.C.",
      "芝加哥",
      "Chicago"
    ],
    "paragraphs": {
      "zh": [
        "今天一整天都在下雨，准确地说，是我每次出门的时候都在下。早上从公寓出来还觉得没多大，结果走到教室的时候，相机包已经湿得像刚洗过。我把包放在暖气旁边晾，同学问我是不是打算给相机做桑拿。",
        "下午课上又改了题目。我原本想拍几个老建筑的招牌，后来越找资料越觉得，招牌背后的故事可能比招牌本身有意思。老师说我这个想法不是不行，但是别什么都想做。我嘴上答应，回去还是开了十几个网页。现在桌面上乱到我已经分不清哪个文件叫 final，哪个叫 final-final。",
        "中午跟 GG 聊天。他发来一张吃饭的照片，说自己终于发现学校旁边有一家不会把炸鸡炸成石头的店。我回他“重大科研突破”，他立刻问我是不是又没吃午饭。后来我们约好周末有空吃点正常的。我说请他喝咖啡，他给我回了一个非常不信任的表情。",
        "晚上我妈打了电话，说天气变冷记得穿外套。我说芝加哥的风只要刮起来，外套穿几件都像没穿。她问我最近忙不忙，我说忙，但是还没忙到吃不上饭。妹妹在旁边一直想抢手机，最后终于把她做的一只纸板小狗举到镜头前。小狗一只耳朵特别长，腿还粘反了。她很认真地问我能不能把它挂在相机包上。我说可以，等回去再拿。",
        "刚挂电话，她又发来一张照片，给纸板小狗补画了两只眼睛，一只大一只小。我把那张图存下来了。最近总想着找能拍的东西，反而觉得这种随手拍的照片看起来最舒服。",
        "明天先把相机包晒干，别再拿吹风机对着它吹。上次拉链被我吹得太热，差点打不开。还有，要把课程文件夹重新整理一下。十几个“最终版”真的不能再这样放着了。"
      ],
      "en": [
        "It rained all day. Well, more accurately, it rained every time I went outside. When I left the apartment this morning, I thought it was barely anything. By the time I got to class my camera bag looked as if I'd put it through a wash. I left it near the heater, and somebody asked whether I was trying to give my camera a sauna.",
        "We changed our project ideas again in the afternoon. At first I wanted to photograph signs on older buildings. But after looking at a few places online, I started thinking the stories behind the signs might be more interesting than the signs themselves. My instructor said the idea was fine as long as I didn't try to do everything at once. I agreed out loud and went home to open another ten browser tabs. I now have so many versions of my files called final and final-final that I can't tell which one actually is.",
        "Talked to GG at lunch. He sent a photograph of his meal, claiming he'd finally found somewhere near school that doesn't fry chicken until it turns into a rock. I called it a major scientific breakthrough. He immediately asked whether I'd skipped lunch again. We said we'd get something decent to eat at the weekend if we're both free. I offered to buy him coffee and got a sticker in reply that looked deeply suspicious.",
        "Mom called in the evening. She said it was getting colder and I should wear a coat. I told her Chicago wind goes straight through any coat, no matter how many layers you put on. She asked if I was busy, and I said yes, but not too busy to eat. My little sister was trying to grab the phone in the background. When she finally got her turn, she held up a cardboard dog she'd made. One ear was much longer than the other, and the legs were glued on the wrong way around. She asked very seriously if I could hang it from my camera bag. I said of course, when I got home to pick it up.",
        "Right after the call, she sent a second picture. She had drawn eyes on the dog, one huge and one tiny. I saved the photograph. I've been thinking so much about what would make a good photo lately that I forgot how nice it is when somebody just takes one because they feel like it.",
        "Tomorrow: dry the camera bag properly. Don't attack it with a hair dryer again. Last time I got the zipper so hot it nearly wouldn't move. Also sort out the coursework folder. There cannot be seventeen documents with final in the filename. I refuse to live like this for another week."
      ]
    },
    "figure": "prop-camera-bag"
  },
  {
    "id": "back",
    "contentId": "P0-SCAN-01",
    "kind": "scan",
    "date": "",
    "title": {
      "zh": "2006 年周年合影的背面扫描",
      "en": "Scan of the Back of the 2006 Anniversary Photograph"
    },
    "author": {
      "zh": "文件转录",
      "en": "File transcription"
    },
    "origin": {
      "zh": "GG 从外接盘读取的文件 / 扫描副本",
      "en": "GG’s external-drive file / Digital scan"
    },
    "file": "stillwater_anniversary_back_scan.png",
    "keywords": [],
    "paragraphs": {
      "zh": [
        "图片左上角有一段浅浅的折痕，纸背写着几行名字。有些笔画被旧胶带遮住，部分字已经褪色。能读出来的两行是：",
        "Ruth — dining room  \nNora Bell — night shift",
        "旁边似乎还有两个人名，但已经看不全。右下角有一行小字：",
        "第二张给厨房。别把两张弄混了。",
        "可读转录结束。"
      ],
      "en": [
        "A shallow crease crosses the upper left corner. There are several handwritten names on the reverse of the print, with a little tape covering parts of the writing. Two lines remain readable:",
        "Ruth — dining room  \nNora Bell — night shift",
        "Two other names are too damaged to read with confidence. A note in the lower right corner says:",
        "Second copy for the kitchen. Don't mix up the backs.",
        "End of accessible transcription."
      ]
    },
    "dateLabel": {
      "zh": "原始照片：2006 年 · 扫描日期与流转经过：未知",
      "en": "Original photograph: 2006 · Scan date and subsequent history: unknown"
    },
    "figure": "photo-back"
  }
];

export const HINTS = {
  "zh": [
    "周年报道的照片下面有摄影署名。",
    "把照相馆的名字拿去搜，看看是谁经营。",
    "再用那个人的姓名搜本机邮件，约见内容写在里面。"
  ],
  "en": [
    "The anniversary photo has a credit underneath.",
    "Search the photo shop. Someone ran it.",
    "Search that person's name in the local mail index. The appointment is in the reply."
  ]
};

export const BY_ID = Object.fromEntries(DOCUMENTS.map(doc => [doc.id, doc]));
