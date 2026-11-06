// Original fictional writing for the isolated chapter sample. No production imports.
const both = (zh, en) => ({ zh, en });
export const ASSETS = {
  'app-chat': both('微信', 'WeChat'), 'app-files': both('文件夹', 'Files'),
  'app-browser': both('浏览器', 'Browser'), 'app-casebook': both('调查笔记', 'Casebook'),
  'avatar-gg': both('GGbond 头像', 'GGbond avatar'), 'prop-pc': { ...both('2008 年旧电脑', '2008 computer'), tiles: [2, 1] },
  'photo-anniversary': { ...both('旅馆周年合影', 'Anniversary photo'), tiles: [2, 1] },
  'portrait-june': { ...both('朱恩的工作照', 'June at work'), tiles: [1, 2] },
  'prop-camera-bag': { ...both('楚人的相机包', 'Churen’s camera bag'), tiles: [1, 2] },
  'photo-back': { ...both('合影的背面', 'Back of the print'), tiles: [2, 1] }
};
// Accepted wording belongs to the case facts, never to an online AI judge.
export const ANSWER_ALIASES = {
  person: ['朱恩·沃德', '朱恩沃德', '朱恩', 'June Ward', 'J. Ward', 'June'],
  place: ['青鸟照相馆', '青鸟摄影店', '青鸟', 'Bluebird Photo', 'Bluebird Photo Studio', 'Bluebird'],
  purpose: ['员工合影', '旅馆合照', '周年合影', '合影底片', '照片原件', '原底片', '合影', '合照', '底片', '旧照片', 'staff photo', 'hotel group photograph', 'anniversary picture', 'original group photo', 'photo negative']
};
export const OPENING = [
  both('我在闲虾买的那台老电脑到了。雪梨镇寄来的，卖家连昵称都注销了。', 'That old PC from Xianxia arrived. Shipped from Xueli Town. The seller’s account is gone now.'),
  both('2008 年的机器，开机够我泡完一碗面。不过硬盘后来换过，里面还有 2023 年的文件。', 'It’s a 2008 machine. Boots about as fast as instant noodles. Someone replaced the drive later, though. There are files from 2023.'),
  both('翻到这个拍照备忘，末尾写着 W.C.。那句欠咖啡有点像楚人。找他三年了，我怕自己看什么都觉得像。你帮我看看。', 'Found this photo note, signed W.C. The coffee bit sounds like Churen. Three years looking for him, though. I might just be seeing what I want to see. Can you check?')
];
export const ENDING = [
  both('那先记成他打算去找她，别当成已经去过。我们还差到店之后的消息。', 'Let’s keep it as a plan to meet her. We still don’t know if he got there.'),
  both('我刚把卖家一起寄来的外接盘接上了。还有一张照片背面的扫描，发你。', 'Just plugged in the external drive the seller packed with it. There’s a scan of the back of a photo. Sending it over.'),
  both('上面这个 Nora Bell，是谁啊？', 'Who’s this Nora Bell on the back?')
];

export const DOCUMENTS = [
  {
    id: 'note', kind: 'file', date: '2023-10-15', author: both('W.C.', 'W.C.'),
    title: both('拍照备忘.txt', 'photo-notes.txt'), origin: both('本机文件 / 待整理', 'Local files / To sort'),
    file: 'photo-notes.txt', keywords: ['拍照', '备忘', 'W.C.', 'photo notes', '王楚人', 'Wang Churen'],
    paragraphs: both([
      '作业那组照片还缺一张旧合影。不是再拍一张，要找原来的那张。课上讲“照片怎么替一个地方留下记忆”，我答得太大，老师让我先把一个人的名字认对。行吧，很合理。',
      '雪梨镇周刊那篇旅馆周年新闻有图，网页压得太糊，放大了像在看外卖袋。背面据说写了名字。先查照片是谁拍的，别对着一排脸瞎猜。书签存好了。',
      '周一如果顺利，回芝加哥前给 GG 带咖啡。上次把他的喝了半杯还嘴硬说拿错，欠着。相机电池充上，别再带一块空的出门。',
      'W.C. / 10 月 15 日'
    ], [
      'Still missing an old group photo for the assignment. Not a new picture of the same place: the actual old print. I got carried away talking about how photographs remember a town. The tutor said I could start by getting one person’s name right. Fair enough.',
      'The hotel anniversary story in the Xueli Weekly has a picture, but the web copy is compressed to bits. Apparently there are names on the back. Find out who took it before guessing at the faces. Saved the bookmark.',
      'If Monday works out, get GG a coffee before heading back to Chicago. Still owe him for drinking half of his and claiming I picked up the wrong cup. Charge the camera battery. An empty spare is not a spare.',
      'W.C. / October 15'
    ]),
    link: 'weekly', linkLabel: both('书签：旅馆十九周年', 'Bookmark: the hotel’s nineteenth anniversary')
  },
  {
    id: 'weekly', kind: 'weekly', date: '2006-09-24', author: both('艾达·里德', 'Ada Reed'),
    title: both('旅馆十九周年：蛋糕先吃，合影稍后', 'Nineteen years at the hotel: cake first, photograph later'),
    origin: both('雪梨镇周刊 / 镇上这周', 'Xueli Weekly / Around town'), file: 'weekly-2006-09-24.html',
    keywords: ['Stillwater', '静水', '酒店', '旅馆', '十九周年', 'anniversary', 'hotel', '青鸟', 'Bluebird', '合影'],
    deck: both('一场差点被雨挪进餐厅的周年聚会，和一张迟到了二十分钟的照片。', 'Rain nearly moved the party into the dining room. The cake was on time; the photograph was not.'),
    figure: 'photo-anniversary', caption: both('Stillwater Hotel 十九周年员工合影，2006 年 9 月。摄影：青鸟照相馆，署名 J.W.。网页刊用缩印件；原底片由照相馆留存，纸质照片背面有在场者的手写姓名。', 'Stillwater Hotel staff, nineteenth anniversary, September 2006. Photograph: Bluebird Photo, signed J.W. This web reproduction is reduced from the print. The shop retains the negative; those present wrote their names on the back of the paper copy.'),
    paragraphs: both([
      '星期六下午四点，静水旅馆的十九周年聚会已经吃掉了半个奶油蛋糕，合影却还没拍成。先是有人去找少了一只的耳环，接着厨房又端出一盘热司康，原本站好的队伍立刻散了。餐厅领班露丝拿着茶巾站在台阶上说：“我们平时收拾早餐都没这么难。”说完自己也拿了一块。',
      '旅馆从 1987 年开门，门厅那张靠湖的长沙发换过三次布，登记台上凹了一角的铜铃倒一直没换。老住客科林先生说，他第一次带女儿来时，她还够不到铃；现在女儿正带着自己的孩子，在院子里追一只不肯入镜的狗。',
      '青鸟照相馆的摄影师把三排椅子往左挪了一点，避开晾着的桌布。有人提议让铜铃也进照片，她说铃不会长高，明年再拍也行，今天先照顾站在后排的人。她的相机带上系着一小段黄色绳子，每次弯腰摆椅子，都有人怕她把相机撞在扶手上。',
      '等云散开，大家终于站定。最前排有人忍着笑，因为厨房的面粉还留在同事袖口上。快门响过，后排一个人问能不能再拍一张，理由是“刚才可能正在想晚饭”。摄影师答应了，不过要求这次不要人人都替别人整理头发。',
      '旅馆说会把纸质照片放在餐厅，背面请大家自己写名字，免得几年后只记得“总把钥匙放冰箱的那位”。摄影师也留了一份原底片。镇上的照片就是这样，正面看谁来了，背面才知道他们怎么称呼彼此。',
      '聚会结束时还剩两个装蛋糕的纸盒，露丝把它们分别塞给了要回家接孩子的人。周日晚餐照常供应，菜单上没有周年特餐，只有厨师临时多烤的一盘苹果。等下次你去吃早餐，若看到有人盯着墙上的合影发笑，不妨问问：那天到底是谁把司康先吃完了。'
    ], [
      'By four on Saturday, half the cream cake was gone and Stillwater Hotel’s nineteenth-anniversary photograph still hadn’t happened. First someone went looking for an earring. Then a tray of warm scones arrived and the carefully arranged group dissolved. Ruth, the dining-room supervisor, stood on the steps holding a tea towel. “Breakfast service is easier than this,” she said, before taking a scone herself.',
      'The hotel opened in 1987. The lakeside sofa has been re-covered three times, but the dented brass bell on reception is the same one. Colin, a regular visitor, remembered when his daughter couldn’t reach it. This weekend she was outside with a child of her own, chasing a dog that refused to be photographed.',
      'The photographer from Bluebird Photo shifted three rows of chairs to hide a washing line. Someone suggested including the brass bell. She said the bell wouldn’t get any taller before next year; the people at the back needed her attention first. A piece of yellow cord hung from her camera strap. Every time she bent to move a chair, someone worried the camera would hit an armrest.',
      'The clouds cleared and everyone finally stayed put. A woman in the front row was trying not to laugh at the flour on her colleague’s sleeve. After the shutter clicked, someone at the back requested another shot because he might have been thinking about dinner. The photographer agreed, provided everyone stopped fixing everyone else’s hair.',
      'The hotel plans to hang a paper print in the dining room, with the staff writing their own names on the back. Otherwise, in a few years, somebody is bound to become “the one who kept putting the keys in the fridge.” The photographer kept the original negative, too. A town photograph tells you who turned up; the back tells you what they called each other.',
      'At the end, Ruth handed the two remaining cake boxes to people leaving to collect their children. Sunday dinner will go ahead as usual. There is no special anniversary menu, just an extra tray of baked apples. If you catch someone laughing at the picture over breakfast, ask them who finished the scones.'
    ])
  },
  {
    id: 'profile', kind: 'weekly', date: '2019-04-13', author: both('艾达·里德', 'Ada Reed'),
    title: both('给照片背面写名字的人', 'The names on the back'), origin: both('雪梨镇周刊 / 一间小店', 'Xueli Weekly / One small shop'),
    file: 'june-ward-bluebird.html', keywords: ['青鸟', '照相馆', '朱恩', '沃德', 'June Ward', 'Bluebird', 'J.W.'],
    deck: both('青鸟照相馆没有换招牌。朱恩说，新招牌的钱够她修两次暖气。', 'Bluebird Photo still has its old sign. June says a new one would cost two boiler repairs.'),
    figure: 'portrait-june', caption: both('朱恩·沃德在柜台后整理客人的取件袋。她在老照片上惯用 J.W. 署名。照片待绘，姓名与署名关系见正文。', 'June Ward sorting collection envelopes. She signs her older prints J.W. The illustration is pending; the name and signature are documented in the article.'),
    paragraphs: both([
      '青鸟照相馆最忙的地方不是柜台，而是门口那块只能放两把伞的地毯。采访那天下雨，第三位客人只好把伞插进空花瓶里。店主朱恩·沃德看了一眼，说那原本就不是她买来插花的，大家尽管用。',
      '朱恩在桦树街冲洗照片已经三十多年。她不太喜欢人家叫她“保存小镇记忆的人”。“我先得保证别把三岁生日和退休聚餐装进同一个袋子。”她说。柜台后排着装底片的旧饼干盒，每只盒子都有年份，里面没有饼干。她承认这让第一次来帮忙的外甥很失望。',
      '以前给报社交照片，她通常只签 J.W.。有读者以为那是一家图片社，她懒得解释，直到有次一封感谢信写着“致 J.W. 全体员工”。她回了信，告诉对方全体员工当时只有她和一台经常卡纸的打印机。',
      '镇上不少婚礼、校队和旅馆的旧合影，都有一份底片留在这里。翻到静水旅馆十九周年那一袋时，她还记得那天的司康。“你问我用了哪卷胶片，我得查。问谁先去吃东西，我倒记得。”照片背面的姓名是人们自己写的，她坚持不照后来的网页替换掉原来的字。有人搬走，有人改姓，旧照片不必跟着改。',
      '她用一个缺了口的黄杯装铅笔，杯把却还完好。“坏的位置刚好，所以还能用。”换成数码相机以后，她也没把旧放大机卖掉。有时学生拿着糊掉的网页图片来问原件，她让他们先坐下，把电脑亮度调低一点，再说清楚想看哪一张。',
      '下个月，朱恩会在图书馆教一次简单的家庭照片整理。不需要会摄影，带一张愿意给别人看的照片就行。她说最好顺便问问家里长辈，背面那个字究竟是人名，还是当年叫外卖时随手记的地址。'
    ], [
      'The busiest part of Bluebird Photo is the doormat, which has room for exactly two wet umbrellas. On the rainy morning of our visit, a third customer put hers in an empty vase. June Ward, the owner, said she had never intended to put flowers in it anyway.',
      'June has developed photographs on Birch Street for over thirty years. She is wary of being called the keeper of the town’s memories. “First I have to avoid putting a third birthday in the retirement-party envelope.” Behind her counter, old biscuit tins hold negatives, each labelled by year. There are no biscuits. Her nephew found this deeply disappointing on his first day helping out.',
      'She used to sign pictures for the paper with J.W. One reader thought it was a picture agency. June let that pass until a thank-you letter arrived addressed to the entire staff of J.W. She wrote back explaining that the staff consisted of herself and a printer that frequently jammed.',
      'There are negatives here from weddings, school teams and hotel parties. She still remembers the scones at Stillwater’s nineteenth anniversary. “Ask what film I used and I’ll have to look it up. Ask who went for the food first, I remember.” People wrote their own names on the backs of the prints. She won’t replace those names to match a later web page. People move away and change their names; the old photograph can stay as it was.',
      'A chipped yellow mug holds her pencils. The handle is fine. “Broken in the right place. Still useful.” Going digital didn’t persuade her to sell the old enlarger. When students arrive with blurry web pictures, she asks them to sit down, turn their laptop brightness down a little, and tell her which original they want to see.',
      'Next month June will run a family-photo sorting session at the library. No photography experience required; bring a picture you’re happy to share. If possible, ask an older relative whether the writing on the back is someone’s name or an address scribbled down while ordering dinner.'
    ])
  },
  {
    id: 'directory', kind: 'directory', date: '2023-10-01', author: both('商户自行核对', 'Checked by the businesses'),
    title: both('桦树街小店电话簿 · 秋季', 'Birch Street shop directory · Autumn'),
    origin: both('雪梨镇商户通讯 / 公开留存页', 'Xueli Traders / Public archive'), file: 'birch-street-autumn-2023.html',
    keywords: ['青鸟', '朱恩', '沃德', 'Bluebird', 'June Ward', '桦树街', 'Birch', 'Maggie', '餐馆'],
    paragraphs: both([
      '青鸟照相馆 / Bluebird Photo｜朱恩·沃德（June Ward）｜桦树街 6 号。周一至周六 13:00–18:00。冲印、旧照片翻拍、相机电池。找老底片请先联系店主；不要把整本家庭相册塞进门上的信箱。',
      'Maggie’s Diner｜桦树街 2 号。早餐从 7:00 开始，周三休息。南瓜派只是秋季供应，问为什么夏天没有，Maggie 还是会告诉你南瓜没上班。',
      '阿尔的自行车修理｜桦树街 11 号后院。补胎请从侧门进。院里的白猫叫扳手，但真的扳手在工具架上。不要拿零食换修车，店主说这条主要写给邻居家的小孩。',
      '营业时间由各店在 9 月底确认。临时休息通常会贴在门上；本通讯不是预约凭证。'
    ], [
      'Bluebird Photo | June Ward | 6 Birch Street. Monday–Saturday, 1–6 p.m. Film processing, copying old photographs and camera batteries. Contact June before coming to look for old negatives. Please do not push an entire family album through the letterbox.',
      'Maggie’s Diner | 2 Birch Street. Breakfast from 7 a.m.; closed Wednesdays. Pumpkin pie is an autumn item. Ask why there isn’t any in summer and Maggie will tell you the pumpkins are off work.',
      'Al’s Bicycle Repairs | Yard behind 11 Birch Street. Use the side gate for puncture repairs. The white cat is named Spanner. Actual spanners are on the rack. Snacks are not accepted as payment; Al says that rule is mainly for the children next door.',
      'Opening times were checked with the businesses in late September. Temporary closures are normally posted on the door. This directory is not a booking confirmation.'
    ])
  },
  {
    id: 'reply', kind: 'mail', date: '2023-10-15', author: both('J. Ward → W. Churen', 'J. Ward → W. Churen'),
    title: both('Re: 关于那张旧照片', 'Re: the old photograph'), origin: both('本机留存邮件 / 收件副本', 'Local mail archive / Received copy'),
    file: 'June_Ward_reply_2023-10-15.eml',
    // Private mail is found by its filename/sender index, never by an invented public search result.
    keywords: ['June Ward', 'J Ward', '朱恩沃德', '朱恩·沃德', '朱恩', '沃德'],
    paragraphs: both([
      '发件人：J. Ward\n收件人：W. Churen\n时间：2023 年 10 月 15 日，星期日，17:26\n主题：Re: 关于那张旧照片',
      '楚人，你好：',
      '你说的那张我找到了，背面写着名字的纸质照片和原底片都还在。带着网页上的缩图来就好，不用打印，省点墨。',
      '我们约明天，也就是 10 月 16 日，下午三点，在青鸟照相馆见。地址是桦树街 6 号，蓝门旁边有一个总也转不正的 OPEN 牌子。店里没什么地方放大包，你把相机带上就够了。',
      '我可以让你看原件，也可以谈谈那天拍照的事。不过先别按网页的颜色猜位置。扫描和重印会变色，这和照片里的人站在哪里不是一回事。',
      '周一见。\nJune',
      '留存说明：这是一封约见邮件。本文件夹没有到店签收、后续回信或当天下午的照片。'
    ], [
      'From: J. Ward\nTo: W. Churen\nSent: Sunday, October 15, 2023, 17:26\nSubject: Re: the old photograph',
      'Hi Churen,',
      'Found the one you mean. I still have the paper print with the names on the back, and the original negative. Bring the thumbnail on your screen. No need to print it and waste the ink.',
      'Let’s meet tomorrow, Monday October 16, at three, at Bluebird Photo, 6 Birch Street. Look for the blue door and the OPEN sign that never hangs straight. There isn’t much space for a big bag, so just bring your camera.',
      'You can look at the original and I can tell you a bit about taking it. Don’t try to place people using the colours on the website, though. Scanning and reprinting can change those. They don’t tell you where anyone was standing.',
      'See you Monday.\nJune',
      'Archive note: this email arranges a meeting. The folder contains no visit receipt, later reply or photographs from that afternoon.'
    ])
  },
  {
    id: 'letter', kind: 'weekly', date: '2023-09-08', author: both('安妮·贝克，河湾路居民', 'Annie Baker, Riverbend Road'),
    title: both('来信：请把河边那张长椅留在原处', 'Letter: leave the riverside bench where it is'), origin: both('雪梨镇周刊 / 镇民来信', 'Xueli Weekly / Letters'),
    file: 'letters-riverside-bench.html', keywords: ['河边', '长椅', '来信', 'bench', 'river', 'letter', 'Annie', '安妮'],
    paragraphs: both([
      '编辑您好，看到镇议会想把河边长椅挪到停车场旁，我想替每天坐在上面等一会儿的人说几句。那张椅子看着普通，右边第二块木板还会夹外套，可它的位置并不是随便放的。',
      '早上七点半，太阳刚好从柳树间照过来。送完孩子上校车的家长在这里喝掉半杯咖啡，钓鱼的人在这里换湿袜子。周四，邮递员会坐下把鞋带重新系紧。他不知道我家窗户能看见，每次都把邮袋放在同一边。',
      '有人说停车场那里走路方便。没错，可坐在停车场旁边，唯一能看的东西就是大家倒车。我的丈夫倒车已经够难看了，我不想散步还看别人的。况且原来这边可以看到河对岸的狗，一到下午，它就试着把水里的树枝全捞回来。',
      '如果椅子需要修，我愿意和邻居一起刷漆。请别用那种亮得像新垃圾桶的绿色。原来的棕色就很好，坐上去裤子脏了也看不出。还有，那块夹外套的木板确实该换。我已经把这句又写了一遍，免得你们只记得我在反对搬椅子。'
    ], [
      'Dear editor, I read that the council wants to move the riverside bench beside the car park. May I speak for those of us who sit there for a few minutes each day? It is an ordinary bench. The second board on the right catches your coat. But its position isn’t an accident.',
      'At half past seven the sun comes through the willows. Parents finish half a coffee after the school bus leaves. Anglers change wet socks. On Thursdays the postman stops to retie his shoes. He doesn’t know I can see him from my window. The bag always goes on the same side.',
      'I’m told the car park would be more convenient. Certainly, but the only view would be people reversing. My husband is bad enough at that; I don’t need to watch strangers on my walk. From the current bench you can watch the dog across the river attempting to retrieve every stick in the water.',
      'If it needs repairing, my neighbours and I will help paint it. Please avoid that green that looks like a new rubbish bin. The old brown is fine and doesn’t show the mud on your trousers. Do replace the board that catches coats. I’ve said that twice so it won’t get lost among my objections to moving it.'
    ])
  },
  {
    id: 'diary', kind: 'file', date: '2023-10-03', author: both('王楚人', 'Wang Churen'),
    title: both('周二，相机包又淋湿了', 'Tuesday. Wet camera bag, again.'), origin: both('本机文件 / 随手记', 'Local files / Notes'),
    file: '2023-10-03-tuesday.txt', keywords: ['王楚人', 'Wang Churen', '日记', '相机', 'camera', 'diary', '作业', 'course'],
    figure: 'prop-camera-bag', caption: both('相机包拉链上挂着一只纸板小狗，角被雨泡软了。', 'A cardboard dog on the camera-bag zip. Rain has softened one corner.'),
    paragraphs: both([
      '早课差点迟到。出门前还检查了相机电池，就是没看天气。到教室时包里面没事，外面湿得像从湖里捞出来的。老师以为我特意来演示防水面料，我说这部分属于反面教材。',
      '今天讲旧照片的说明文字。同一张图，写“毕业聚会”和写“最后一次见面”，大家看的地方真的会不一样。作业是选一个地方做小型影像档案。别做成大展览，先把人、照片和说明对上。这个要求听着简单，整理起来能把下午整个吃掉。',
      'GG 问我周末能不能吃火锅。我说可以，但不接受他那种把所有丸子同时倒下去的做法。他回了一张锅里什么都看不清的照片，说这叫有包容性。看完更饿了。',
      '妹妹寄来的纸板小狗还挂在包上。她说画的是我，不是狗，我已经假装没看见这句。雨把一只耳朵泡软了，晚上拿书压一下。给家里回了电话，妈正在剥橘子，我听她讲了十分钟哪家摊位今年比较甜。',
      '晚饭在冰箱里找到半盒炒饭，热完才想起是我自己昨天留的。挺好，至少昨天的我还记得今天的我会懒。明天去打印店，今晚不修图了。'
    ], [
      'Nearly late for the early class. Checked the camera battery before leaving, forgot to check the weather. Everything inside the bag was dry. The outside looked as if I’d fished it out of the lake. The tutor thought I was demonstrating waterproof fabric. I said it was a cautionary example.',
      'We talked about captions today. Put “graduation party” under a picture, then “the last time we met,” and everyone looks at different things. The assignment is a small photographic archive of one place. Not a grand exhibition. Match the people, photographs and captions first. Sounds simple. Eats an entire afternoon.',
      'GG asked about hotpot at the weekend. I said yes, provided he didn’t dump every fish ball in at once. He sent a picture of a pot in which you couldn’t identify a single ingredient. Called it inclusive cooking. Now I’m hungry.',
      'The cardboard dog my sister made is still on the bag. She says it’s a portrait of me, not a dog. Ignoring that part. One ear got soggy; I’ll press it in a book tonight. Called home. Mum was peeling an orange and spent ten minutes telling me which stall had the sweeter ones this year.',
      'Found half a box of fried rice in the fridge. Only remembered after heating it that I’d left it there yesterday. Good to know yesterday’s me accounted for today’s laziness. Print shop tomorrow. No editing tonight.'
    ])
  },
  {
    id: 'back', kind: 'attachment', date: '2026-11-06', author: both('GGbond 发来的扫描件', 'Scan sent by GGbond'),
    title: both('合影背面 · 局部扫描', 'Back of the group photo · detail'), origin: both('外接盘 / GGbond 新发来的附件', 'External drive / New attachment from GGbond'), file: 'photo-back-detail.png', keywords: [],
    figure: 'photo-back', caption: both('待绘：旧相纸背面，几个人用不同的笔写下名字。能读清的一行：Nora Bell。此处同时保留文字转录，解谜不依赖尚未绘制的图片。', 'To draw: the back of an old print, names in several different hands. One legible line reads Nora Bell. A text transcript remains available; the pending artwork is not required to solve the chapter.'),
    paragraphs: both([
      '纸张右下角有一条折痕，几行字被裁掉了。留下的名字中，有一个可以辨认：Nora Bell。',
      '这只是照片上的姓名。她的工作、她与楚人的关系，以及楚人有没有见到原件，目前都还不知道。'
    ], [
      'A crease crosses the lower-right corner. Several lines are cut off. One name is legible: Nora Bell.',
      'For now it is just a name on a photograph. Her job, her connection to Churen, and whether he ever saw the original are still unknown.'
    ])
  }
];
export const BY_ID = Object.fromEntries(DOCUMENTS.map(doc => [doc.id, doc]));
export const SOURCE_ORDER = ['weekly', 'profile', 'directory', 'reply', 'note', 'diary', 'letter'];
export const HINTS = both([
  '网页上的小图不一定保留全部信息。先看看照片说明里有没有提到来源。',
  '店名和人名可能在不同文章里出现。把照片来源拿去检索，再核对店主的全名。',
  '检索器也收录了本机邮件的发件人和文件名。用查到的人名再搜一次；照片的具体内容仍要回到最早那篇报道核对。'
], [
  'A small web image may leave things out. Check whether its caption identifies a source.',
  'A shop name and a person’s name may appear in different articles. Search the photo credit and check who runs the shop.',
  'The index includes local mail senders and filenames. Search the name you found, then return to the original article to identify the photograph.'
]);
