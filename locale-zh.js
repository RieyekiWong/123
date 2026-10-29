/* Offline Chinese edition. User content and puzzle identifiers are preserved. */
(() => {
  "use strict";
  const dictionary = {
    "The Stillwater Hotel — A familiar place, every time":
      "静水旅馆 — 安心入住，舒适相伴",
    "Skip to content": "跳至正文",
    "ESTABLISHED 1987 · STILLWATER, NORTH AMERICA":
      "始于 1987 年 · 北美，静水镇",
    "WELCOME TO YOUR HOME AWAY FROM HOME": "欢迎入住静水旅馆",
    S: "S",
    "The Stillwater Hotel": "静水旅馆",
    "A FAMILIAR PLACE, EVERY TIME": "安心入住，舒适相伴",
    "Quiet rooms. Thoughtful service.": "安静的客房，周到的服务。",
    "Memories worth keeping.": "让旅途多一份舒适。",
    Home: "首页",
    "Rooms & Suites": "客房与套房",
    "Our History": "旅馆往事",
    Guestbook: "住客留言",
    Reservations: "预订与入住",
    "Hotel Guide": "旅馆指南",
    "PUBLIC SITE COMPROMISED · RETURN TO LOWER REGISTER":
      "页面异常 · 返回地下前台",
    "A tradition of hospitality since 1987": "静水旅馆 · 始于 1987 年",
    "Your room is": "安静舒适，",
    "waiting.": "自在入住。",
    "Discover a quieter pace at Stillwater Hotel, where every stay feels pleasantly familiar.":
      "位于静水镇老路旁，提供安静客房、每日早餐和 24 小时前台服务。",
    "Explore the rooms": "查看客房",
    "Our historic main lobby": "旅馆大堂",
    "Our invitation": "酒店介绍",
    "Comfort in every corner.": "在静水镇，住得舒心。",
    "Nestled far from the crowds, the Stillwater has welcomed travelers for generations. Our familiar corridors, handpicked furnishings, and attentive service make every visit one to remember.":
      "静水旅馆在进镇的老路边，由一家人经营。楼梯和大部分家具还是以前的。晚到的客人请按前台铃，会有人下来接待。",
    "Whether you are staying for a night or looking for somewhere to begin again, a place has already been prepared for you.":
      "短住或长住均可安排。如需额外毯子或安静房间，请联系前台。",
    "Notice to our guests · Updated 10/03": "住客公告 · 更新于 10 月 3 日",
    "Third-floor maintenance": "三层维护通知",
    "Some areas of the third floor remain temporarily unavailable. We appreciate your understanding as we preserve the character of our historic property.":
      "三层西端正在维修。请按房卡上的标记通行，不要自行进入施工区域。",
    "Learn about our hotel →": "了解旅馆 →",
    "01 / Rooms": "01 / 客房",
    "Time to unwind": "舒适客房",
    "Classic interiors and quiet spaces for the perfect night's rest.":
      "经典陈设，齐全设施，为旅途留一晚好眠。",
    "View rooms →": "查看客房 →",
    "02 / Memories": "02 / 回忆",
    "Stories from our guests": "住客评价",
    "Read messages from people who have stayed with us over the years.":
      "看看住客们分享的入住感受。",
    "Guestbook →": "查看住客留言 →",
    "03 / Since 1987": "03 / 始于 1987",
    "A history of belonging": "我们的故事",
    "A family-run destination with a story behind every door.":
      "从 1987 年开始，一家人用心经营的旅馆。",
    "Our history →": "了解旅馆历史 →",
    "Come as a guest.": "用心接待每一位住客。",
    "Leave with a story worth remembering.": "期待与您再次相见。",
    Explore: "了解更多",
    "Hotel resources": "旅馆服务",
    "Make an Inquiry": "咨询前台",
    "Employee Access": "员工入口",
    "Site Information": "网站说明",
    "© 1987–2026 THE STILLWATER HOTEL · A FICTIONAL INTERACTIVE HORROR MYSTERY. No real hotel, booking, or account exists. All imagery and characters are fictional.":
      "© 1987–2026 静水旅馆 · 虚构互动恐怖谜案。不存在真实旅馆、预订或账号；所有画面与人物均为虚构。",
    "Guest notebook": "住客笔记",
    "THE STILLWATER HOTEL": "静水旅馆",
    "THE STILLWATER HOTEL · EST. 1987": "静水旅馆 · 始于 1987 年",
    "GUEST COPY": "入住记录",
    "The Stillwater Hotel home": "静水旅馆首页",
    "Main navigation": "主导航",
    "The empty historic lobby, with dark wood reception desks and warmly lit balconies":
      "空荡的历史大堂，深色木质前台与亮着暖灯的回廊",
    "Discover the hotel": "了解旅馆",
    "Open guest notebook": "打开住客笔记",
    "Close window": "关闭窗口",
    "TEST_GUEST · ROOM 307": "TEST_GUEST · 307 号房",
    "The Stillwater Hotel — Rooms & Suites": "静水旅馆 — 客房与套房",
    "Rooms & suites": "客房与套房",
    "A place already prepared for you.": "选一间合适的客房。",
    "Considered comforts, familiar furnishings, and no reason to rush. Every room has its own character. We will find the one that remembers you.":
      "大床房、双床房和长住客房均可申请。房间陆续翻修过，能留下的老家具，我们尽量保留了。",
    "A classic welcome": "经典房型",
    "Guest accommodation": "客房介绍",
    "Classic Double": "经典大床房",
    "A well-made bed, a reading lamp, and the quiet reassurance of a room that feels like your own. Our original rooms overlook the sheltered courtyard.":
      "一张双人床、床头灯和一张小书桌。客房位于老楼，离前台不远。",
    "One double bed · Private bath · Writing desk":
      "一张双人床 · 独立卫浴 · 书桌",
    "View room details →": "查看客房详情 →",
    "A little more room": "双床房型",
    "Heritage Twin": "怀旧双床房",
    "Traditional furnishings and space to settle in together. Soft lighting, crisp linens, and a sitting corner for conversations that last a little longer.":
      "两张独立单人床，配有床头柜、休息区和茶饮用品，适合朋友或家人同行。",
    "Two single beds · Sitting area · Tea service":
      "两张单人床 · 休息区 · 茶饮服务",
    "For a longer stay": "长住之选",
    "Third floor / Limited availability": "三层 / 余房有限",
    "The Residence": "长住套间",
    "For guests who prefer not to hurry. Located at the quieter end of the third floor, with a private vestibule and all the time you need.":
      "位于三层走廊尽头，空间较大，有独立门厅和放行李的位置。长住安排可向前台咨询。",
    "Third floor · Extended stays · Turn-down service":
      "位于三层 · 适合长住 · 夜间整理",
    "Included in every stay": "客房设施与服务",
    "Nothing overlooked.": "所需设施，一应俱全。",
    "Daily housekeeping": "每日客房清洁",
    "Fresh linens & towels": "床品与毛巾",
    "In-room tea service": "客房茶饮服务",
    "24-hour front desk": "24 小时前台",
    "Private bathroom": "独立卫浴",
    "Complimentary wake-up calls": "免费叫醒服务",
    "Breakfast is served in the ground-floor dining room from 7:00 to 9:00. Please leave your key at reception before taking a walk. We are always pleased to see you return.":
      "早餐于每日 7:00–9:00 在一层餐厅供应。外出时请将钥匙交至前台，返回后再领取。",
    "Request a room →": "预订客房 →",
    "For your comfort": "入住提示",
    "A few house traditions": "入住须知",
    "Quiet hours begin at 10:00 p.m. Our third-floor restoration is ongoing. Before settling in, please take a moment to read the card left on your bedside table.":
      "晚间 22:00 后请保持安静。三层部分区域正在维修，入住后请先阅读床头的须知卡片。",
    "Read the guest guidelines →": "阅读住客须知 →",
    "A note about our floor plan": "楼层信息",
    "Three floors. A familiar way home.": "客房分布与楼层导览",
    "If your key does not match a room on our plan, please consult reception before proceeding.":
      "如钥匙上的房号未在导览中列出，请向前台核实。",
    "Consult the floor directory →": "查看楼层导览 →",
    "A warmly lit vintage bedroom with a walnut bed and a writing desk":
      "暖灯下的怀旧卧室，摆着胡桃木床与书桌",
    "The warm furnishings of a heritage guest room": "怀旧客房内温暖的陈设",
    "A quiet corridor leading to the Residence rooms": "通往长住套间的安静走廊",
    "The Stillwater Hotel — Our History": "静水旅馆 — 旅馆往事",
    "Our history": "旅馆往事",
    "Some places stay with you.": "从开业那天说起。",
    "Built on a simple promise: a warm welcome, a comfortable room, and a place to return to. The Stillwater has been keeping that promise since 1987.":
      "静水旅馆于 1987 年开业。我们保留了老楼的经典陈设，也持续改善客房设施，希望每一位到访的客人都能住得舒适。",
    "03 October 1987": "1987 年 10 月 3 日",
    "Our doors open.": "正式开业",
    "Walter and Eleanor Vale welcome their first guests to a small family hotel on the old Stillwater road. Eleanor writes each name in a leather-bound register. The original book remains in our care.":
      "沃尔特与埃莉诺·维尔在静水镇旧路边的一间家族旅馆，迎来了最初的住客。埃莉诺将每个人的姓名写入皮面登记簿。那本原簿，至今仍由我们保管。",
    "More room to belong.": "东翼扩建",
    "The east wing brings additional guest rooms and a covered courtyard. The family insists that every corridor should feel just like the first. Some guests still find it difficult to tell them apart.":
      "东翼扩建后增加了客房和带顶的庭院，两边用了同样的地毯和门饰。走廊很像，请以钥匙上的房号为准。",
    "A gift of time.": "前台时钟修复。",
    "A returning guest donates the brass clock above the reception desk. It is the only original fixture that has never needed winding. Its maintenance records are held by the night porter.":
      "前台的黄铜时钟从开业时就挂在那里。2003 年修复过外壳和表盘，维修收据及旧日志由夜班前台保管。",
    "Preserving what matters.": "三层修缮",
    "A careful restoration begins on the third floor. Work continues today. We thank our long-stay residents for their extraordinary patience.":
      "三层修缮工程于 2016 年启动，部分区域目前仍在施工。感谢各位住客的理解与配合。",
    Today: "如今",
    "The same welcome, every time.": "老朋友，新相聚",
    "Our family may have changed, but our promise has not. Many of our earliest guests are still with us in spirit. A few have simply never found the right time to leave.":
      "有些客人来过许多次，几本留言簿里都能找到他们的名字。旧簿子放在前台，想看可以借阅。",
    "“A hotel is not its rooms. It is the people it remembers.”":
      "“开酒店，最重要的是照顾好来住的人。”",
    "— Eleanor Vale, opening-night address": "—— 埃莉诺·维尔，开业之夜致辞",
    "From the hotel collection": "历史档案",
    "The opening-night register": "开业当晚的登记簿",
    "Seven entries. Seven brass keys. A page written on the first evening that our doors opened. Reproduced here by permission of the family.":
      "这页登记簿记下了开业当晚七位住客的信息，对应七把铜钥匙。经维尔家族同意，现将记录公开展示。",
    "Examine the original page →": "查看原始记录 →",
    "Restoration bulletin / 10.03": "修缮公告 / 10 月 3 日",
    "A temporary inconvenience": "施工期间通行提示",
    "Third-floor access is restricted after quiet hours. Please disregard floor numbers not listed on your guest map.":
      "安静时段后，三层通行受到限制。请忽略住客地图中没有列出的楼层编号。",
    "Read the full bulletin →": "阅读全文 →",
    "The historic lobby, shown with an aged photographic finish":
      "带有老照片质感的历史大堂",
    "The Stillwater Hotel — Guestbook": "静水旅馆 — 住客留言",
    "The guestbook": "住客留言簿",
    "A few words from familiar faces.": "听听住客怎么说。",
    "For almost four decades, guests have left a little of themselves between these pages. We keep every message. Some seem to find their way back.":
      "留言簿从开业时就开始用了，旧的几本也没有扔。翻到后面，偶尔会遇见前面出现过的姓名。",
    "Margaret H. · Room 108": "玛格丽特 H. · 108 号房",
    "14 June 2026": "2026 年 6 月 14 日",
    "“I came for a quiet weekend and ended up staying a little longer. The staff remembered exactly how I take my tea. I do not recall telling them.”":
      "“订了两晚。早餐时服务员直接端来一杯不加奶的茶，正合我的口味。挺周到的，不过我记得没人问过我喝什么。”",
    "A very thoughtful place.": "服务挺周到。",
    "David & Ruth · Room 214": "戴维与露丝 · 214 号房",
    "22 August 2026": "2026 年 8 月 22 日",
    "“The same wallpaper, the same armchair, the same gentleman at reception. Our first visit was in 1987. It is wonderful how little things change here.”":
      "“1987 年蜜月时住过这里。壁纸没换，前台那个人也没换。露丝先认出了他，我还以为自己记错了。”",
    "We will be back. Apparently, we always are.":
      "本来只想住一晚，结果又续住了。",
    "Anonymous · Long-stay guest": "匿名 · 长住客人",
    "Date not recorded": "日期未记录",
    "“The view outside my window has not changed in six days. The bird on the railing has not moved. Housekeeping says the weather is holding.”":
      "“栏杆上总停着同一只鸟，位置和朝向都没变，连续六个早上了。我问保洁是不是她喂的，她忽然就不铺床了。”",
    "E. Rowan · Room 307": "E. 罗温 · 307 号房",
    "A loose page, folded twice": "一张对折了两次的散页",
    "“If you are reading this, do not let them turn another page. The red EXIT is the way out. The white door only brings you back to the desk. I have signed that book so many times I no longer recognize my own handwriting.”":
      "“如果你正在读这段话，别让他们再翻一页。红色 EXIT 标识才是出口。白门只会把你带回前台。我在那本簿子上签过太多次名，已经认不出自己的笔迹。”",
    "There is a small red ribbon pressed into the paper.":
      "纸页间压着一小段红色缎带。",
    "Recorded in your notebook ✓": "已记在笔记里 ✓",
    "Leave a little of yourself": "住客留言",
    "Your page in our story.": "也写几句话吧。",
    "A memory, a thought, a message for the next person who finds this book.":
      "住得怎么样？或者，有什么想提醒下一位住客的话？",
    "Your name or initials": "姓名或昵称",
    "Your message": "留言内容",
    "Leave a note →": "提交留言 →",
    "This is a fictional guestbook. Notes are kept only in your browser, never published or sent. The five most recent notes are retained.":
      "这是虚构的留言簿。留言只保存在您的浏览器中，不会发布或发送；仅保留最近五条。",
    "Looking for someone?": "在找某个人吗？",
    "We keep our records.": "我们一直保留着记录。",
    "If a name seems familiar, our opening-night register may help you remember why.":
      "如果某个名字令您感到熟悉，开业之夜的登记簿也许能帮您想起原因。",
    "Visit the hotel collection →": "查看历史档案 →",
    "Guest messages": "住客留言",
    "Something worth remembering…": "写下您的入住感受…",
    "The Stillwater Hotel — Reservations": "静水旅馆 — 预订入住",
    "We have been expecting you.": "办理入住",
    "A night away. A fresh beginning. A familiar place to rest. Tell us what to call you, and we will take care of the rest.":
      "请填写入住信息并阅读入住须知。前台将为您安排房间，具体房号以登记结果为准。",
    "Your registration is complete": "您的入住登记已完成",
    "Welcome back, TEST_GUEST.": "欢迎回来，TEST_GUEST。",
    "We have taken care of your room preference. As always, the key waiting at reception is yours.":
      "您的房型偏好已记下。今晚西翼只开放 307 号房，钥匙已放在前台。",
    "Your room is ready": "您的房间已准备好",
    "Third floor · The end of the west corridor": "三层 · 西侧走廊尽头",
    Guest: "住客",
    TEST_GUEST: "TEST_GUEST",
    Arrival: "入住日期",
    "Requested stay": "入住晚数",
    "1 night": "1 晚",
    Departure: "离店日期",
    "To be confirmed": "待确认",
    "Go to my room →": "前往我的房间 →",
    "Amend registration": "修改入住登记",
    "A fictional registration, saved only on this device.":
      "虚构的入住登记，仅保存在本设备中。",
    "The small details": "入住信息",
    "Make yourself at home.": "为您的入住做好准备。",
    "Reception is staffed day and night. There is no need to hurry your arrival; a lamp will be left on until you are settled.":
      "前台提供 24 小时接待服务。如需晚到或有其他需求，请在办理入住时告知。",
    "Check-in": "办理入住",
    "From 3:00 p.m.": "下午 3:00 起",
    "Quiet hours": "安静时段",
    "10:00 p.m. – 7:00 a.m.": "晚间 10:00 至早上 7:00",
    Breakfast: "早餐",
    "7:00 – 9:00 a.m.": "早上 7:00 至 9:00",
    "Front desk": "前台",
    "Always here": "24 小时服务",
    "Before you settle in": "入住前请阅读",
    "A familiar routine.": "入住须知",
    "Please read the guest guidelines, keep your room key with you, and do not follow voices into an unlit corridor. A member of staff will find you if you need us.":
      "请阅读住客须知，随身保管钥匙，不要跟随声音走进未亮灯的走廊。如果您需要帮助，员工会找到您。",
    "Already have a room number? →": "已有房号？ →",
    "The Stillwater Hotel — Employee Access": "静水旅馆 — 员工入口",
    "Internal hotel resources": "旅馆内部资料",
    "The night desk archive": "夜班前台档案室",
    "Please return every file to the drawer in which you found it. Do not amend a guest’s departure date without their consent.":
      "请将每份档案放回原来的抽屉。未经住客同意，不得修改其离店日期。",
    "ACCESS GRANTED · NIGHT PORTER / SESSION STORED LOCALLY":
      "已登录 · 夜班前台 / 登录状态仅保存在本机",
    "Lock archive": "锁定档案室",
    "Security monitors →": "查看安全监控 →",
    "Third-floor directory →": "三层楼层导览 →",
    "File 01 / Facilities": "档案 01 / 设施",
    "Maintenance log": "维修日志",
    "Repeated clock failures, a service stair not shown on public plans, and an electrical disconnect that must never be touched.":
      "反复停摆的时钟、公开图纸上不存在的员工楼梯，以及绝不能触碰的断路装置。",
    "Read the log →": "阅读日志 →",
    "File 02 / Undelivered mail": "档案 02 / 未投递邮件",
    "Returned correspondence": "退回的信件",
    "A letter addressed to the next occupant of Room 307. It has been opened, resealed, and returned for thirty-nine years.":
      "一封写给 307 号房下一位住客的信。三十九年来，它被反复拆开、封好、退回。",
    "Open the letter →": "打开信件 →",
    "File 03 / Guest records": "档案 03 / 住客记录",
    "The original register": "登记簿原件",
    "Opening-night guest names. All seven entries share the same unresolved departure field.":
      "开业当晚的七条入住记录，退房日期至今都没有填写。",
    "Examine the register →": "查看登记簿 →",
    "File 04 / Personnel": "档案 04 / 员工",
    "Instructions for the relief porter": "代班前台工作须知",
    "The face behind the desk may change. The instructions do not. Please do not read the final paragraph aloud.":
      "供夜班交接使用。最后一段请默读，不要念出声。",
    "Read shift instructions →": "阅读交班须知 →",
    "File 05 / Incident review": "档案 05 / 事件复核",
    "The first three days": "最初的三天",
    "Opening, interruption, and the first returned guest. The clocks say these events happened together. The report disagrees.":
      "开业、时钟停摆、第一位离店住客返回。监控上的时间相同，报告里却记录了三个不同的日期。",
    "Read the retained chronology →": "阅读留存的时间记录 →",
    "File 06 / Night audit": "档案 06 / 夜间审计",
    "Two sets of books": "两套账簿",
    "An unsigned audit explains why an apparently successful group checkout may only be a reconstruction.":
      "这份未签字的报告解释了：为什么办完退房后，所有人仍会回到酒店。",
    "Compare the accounts →": "核对账目 →",
    "The Stillwater Hotel — Hotel Guide": "静水旅馆 — 旅馆指南",
    "Around the hotel": "设施与服务",
    "A little more to discover.": "让入住更方便。",
    "The most familiar places often reward a second look. Our staff have gathered a few notes to help you settle into the rhythm of the Stillwater.":
      "这里有用餐时间、设施说明和前台通知。若要去老楼走走，建议先看一眼服务说明。",
    "There is no need to leave the property to find something interesting. Read a chapter in the east wing, take a walk before dinner, or join the long-stay residents for a conversation they may remember having before.":
      "阅览室在东翼，庭院入口在大堂那盆蕨类旁边。这里也收了几份旧通知，停电时经常有客人来找。",
    "A note from reception": "前台提示",
    "Please keep these cards.": "请保留这些卡片。",
    "Facility information is not changed during a supply interruption. The printed instructions remain valid even if the building looks unfamiliar.":
      "供电中断期间，设施说明不会变更。即使建筑看起来陌生，纸上印着的流程依然有效。",
    "01 / Dining": "01 / 用餐",
    "A table set for you": "餐饮服务",
    "Breakfast radio, the original five-course dinner, and a few customs retained by our kitchen.":
      "早餐广播、最初的五道晚餐，以及厨房沿袭至今的一些惯例。",
    "Read the guest information →": "阅读住客资料 →",
    "02 / Reading room": "02 / 阅览室",
    "Something worth keeping": "阅览室",
    "Local histories, donated books, and a visitor’s desk facing a wall that sounds like another room.":
      "地方史、住客捐赠的书，还有一张面对墙壁的阅览桌——墙后却传来另一个房间的声音。",
    "03 / Courtyard": "03 / 庭院",
    "A little fresh air": "出去透透气",
    "A loop around the fountain, the northern bench, and the route recommended after dusk.":
      "绕过喷泉的步道、北侧长椅，以及黄昏后建议使用的路线。",
    "04 / Hotel facilities": "04 / 旅馆设施",
    "A familiar order": "供电操作说明",
    "The original restoration sheet for our four service circuits. Useful when the lights behave unexpectedly.":
      "四组服务回路最初的恢复供电说明。灯光出现异常时，也许用得上。",
    "05 / Residents": "05 / 长住客人",
    "A community of regulars": "长住客人通知",
    "Meeting notes, room assignments, and a request concerning the guest in 311.":
      "会议记录、房间分配，以及一项关于 311 号房住客的请求。",
    "06 / Reception": "06 / 前台",
    "Things left behind": "那些被留下的东西",
    "Our lost-property collection includes keys, a coat, a photograph, and an item without an obvious owner.":
      "失物中有钥匙、外套、照片，还有一件似乎不该有失主的东西。",
    "The hotel collection": "旅馆藏品",
    "The faces behind the welcome.": "开业合影与人物标注",
    "Our original photograph identifies the founders and the first relief porter. Names matter here; we take care not to misplace them.":
      "照片背面留有两位创办人和代班前台的姓名、房号。原照片部分损坏，标注记录仍可查阅。",
    "View contact sheet 001-B →": "查看照片标注 001-B →",
    "The Stillwater Hotel — The Lower Register": "静水旅馆 — 地下前台",
    "UNINDEXED FLOOR / YOUR DEPARTURE WAS NOT ACCEPTED":
      "未标注楼层 / 退房失败",
    "IT IS STILL": "你又回到",
    "KEEPING YOU.": "了前台。",
    "CAM 00 / DO NOT ANSWER": "监控 00 / 不要回应",
    "The checkout you remember was a rehearsal. The hotel wrote the last page before you reached it. There is another register underneath the desk. This one has room for the name it erased.":
      "您又站在前台。退房单重新变成空白，簿子上的 311 被人划掉了。柜台下卡着另一本登记簿，最后一行一直没填。",
    "PUBLIC RECORDS": "已收集资料",
    "LOWER STATIONS": "调查进度",
    DEPARTURE: "离店",
    DENIED: "已拒绝",
    "Work through the stations in order. Each restored record unlocks the next. The guest information above is still accessible; it was never only decoration.":
      "按顺序调查下方六个环节。完成后，下一项会解锁。需要核对线索时，仍可返回旅馆指南查看资料。",
    "Recover the hotel guide ↑": "取回旅馆指南 ↑",
    "Open your notebook": "打开住客笔记",
    "Visual & audio settings": "画面与声音设置",
    "01 / RESTORE": "01 / 恢复",
    "The second switchboard": "第二块配电盘",
    "Four circuits. A printed service order. Something else is touching the wires.":
      "配电盘上有四组线路。按照维修说明恢复供电，别碰柜子后伸出的那根“电线”。",
    "RECORD VERIFIED ✓ / REVIEW": "已完成 ✓ / 查看记录",
    "02 / RECEIVE": "02 / 接收",
    "The voice at breakfast": "早餐时的声音",
    "Find the station the guests were listening to when the day stopped.":
      "找到时间停下时，住客们正在收听的那个频道。",
    "03 / EXTRACT": "03 / 提取",
    "The sealed census": "封存的名册",
    "A five-letter cabinet lock. The kitchen has kept its instructions in plain sight.":
      "五个字母的柜锁。厨房一直把说明放在最显眼的地方。",
    "04 / IDENTIFY": "04 / 辨认",
    "The name in 311": "311 号房的姓名",
    "One entry was erased. Compare the original photograph with the residents’ account.":
      "311 号房的姓名被划掉了。对照照片背面的标注和住客通知，找出这个人。",
    "05 / REVERSE": "05 / 反读",
    "The observation glass": "观察室的玻璃",
    "The person on the other side moves a little before you do. Read what they are holding.":
      "玻璃另一侧的人，动作总比您快一点。读出对方举着的那张卡片。",
    "06 / RECONSTRUCT": "06 / 重建",
    "Separate the hotel’s version of events from the sequence that actually happened.":
      "把旅馆编造的经过，与真正发生的先后顺序分开。",
    "NO FURTHER DOORS WILL BE OFFERED": "这次，选对离开的路",
    "The final discharge": "办理退房",
    "The lower record is complete. Choose what leaves with you, what stays, and which way you go.":
      "资料齐了。带对登记簿，别碰错钥匙，再选离开的路。",
    "Approach the desk →": "前往退房 →",
    "A figure behind the reception glass": "前台玻璃后的人影",
    "GUEST SERVICES / BEDSIDE CARD 01": "住客服务 / 床头卡片 01",
    "The Stillwater Hotel · Est. 1987": "静水旅馆 · 始于 1987 年",
    "A copy of this card is placed in every guest room. Following these small courtesies helps everyone enjoy a peaceful stay.":
      "请在入住后阅读以下须知，并妥善保留这张卡片。",
    "The Stillwater has three floors. Should the lift announce a fourth, close your eyes until the bell has stopped.":
      "静水旅馆只有三层。如果电梯报出第四层，请闭上眼睛，直到铃声停止。",
    "Keep your assigned key. Do not accept a replacement from a person who resembles you.":
      "请保管好自己的钥匙。若有人长得和您一样，并提出替您换钥匙，请不要接受。",
    After: "在",
    "04:04 a.m.": "凌晨 04:04",
    ", please remain in your room. A stopped clock is not a fault that requires your attention.":
      "之后，请留在房间内。时钟停摆不属于需要您处理的故障。",
    "We do not accommodate children in the west wing. If you hear laughter, turn your television down and do not investigate.":
      "西翼不接待儿童。如果听到笑声，请调低电视音量，不要前去查看。",
    "Before opening your door at night, check for a shadow beneath it. If there is no shadow, do not open the door.":
      "夜间开门前，请先确认门缝下有没有影子。如果没有，不要开门。",
    "For departure, follow the": "离店时，请跟随",
    "red EXIT": "红色 EXIT 出口",
    "signs. We have never installed a white exit door.":
      "标识。我们从未安装过白色出口门。",
    "If you discover a second guest register, do not sign it. The original belongs behind the reception desk.":
      "如果发现第二本住客登记簿，请勿签名。原簿应当放在前台后方。",
    "Printed on the reverse:": "背面印着：",
    "“The unlisted door keeps the time we lost. Four digits. Leave out the colon.”":
      "“走廊尽头的门锁，密码就是停钟的时间。四位数字，不加冒号。”",
    "Return to registration →": "返回入住登记 →",
    "HOTEL NOTICE / CONSERVATION OFFICE": "旅馆公告 / 建筑维护办公室",
    "Restoration bulletin · Updated 10/03": "修缮公告 · 更新于 10 月 3 日",
    "As part of our continuing conservation work, the west end of the third floor is temporarily unavailable after quiet hours. Guests are asked to use only the rooms marked on their printed map.":
      "因持续进行的建筑维护，安静时段后，三层西端暂不开放。请只使用印刷平面图中标出的客房。",
    "The elevator may occasionally display an incorrect floor number. Please remain inside until it returns to a listed floor. Do not use the service stair without a member of staff.":
      "电梯偶尔可能显示错误楼层。请留在轿厢内，等待它返回已列出的楼层。没有员工陪同，请勿使用员工楼梯。",
    "Typewritten addendum:": "打字补充说明：",
    "“There is no fourth floor. Any reference to a fourth floor in earlier bulletins was an administrative error.”":
      "“本旅馆没有四层。此前公告中凡是提及四层，均属行政失误。”",
    "We appreciate your patience.": "感谢您的耐心。",
    "The Management": "旅馆管理处",
    "View the approved floor plan →": "查看核准的楼层图 →",
    "Read the guest guidelines": "阅读住客须知",
    "FLOOR DIRECTORY / LEVEL THREE": "楼层导览 / 三层",
    "The third-floor directory": "三层楼层导览",
    "The lift opens onto a long, quiet corridor. According to the framed plan beside the door, there are five rooms on this floor.":
      "电梯通向一条安静的长廊。门旁装框的平面图显示，这一层应当只有五间客房。",
    "Do not disturb": "请勿打扰",
    "A light under the door": "门下透出一线光",
    "Your room": "您的房间",
    "Awaiting service": "待清洁",
    Housekeeping: "客房清洁中",
    "Not on the plan": "平面图中不存在",
    "You count the doors twice. There are six.": "您数了两遍。这里有六扇门。",
    "The last one was not there when you stepped out of the lift.":
      "您回头看了眼平面图，上面还是只有五间。",
    "Consult the corridor recording →": "查看走廊录像 →",
    "THE STILLWATER HOTEL / GUEST SERVICES": "静水旅馆 / 住客服务",
    "Find your room": "查找您的房间",
    "Please enter the number stamped on your key. If you have not collected one, reception will be happy to help.":
      "请输入钥匙上刻着的房号。如果尚未领到钥匙，前台很乐意为您处理。",
    "Room number": "客房号码",
    "Find my room →": "查找我的房间 →",
    "Return to reception": "返回前台",
    "For example, 307": "例如：307",
    "HOTEL COLLECTION / REGISTER NO. 001": "旅馆藏品 / 登记簿第 001 号",
    "Original guest ledger / 03 October 1987":
      "住客登记簿原件 / 1987 年 10 月 3 日",
    "The page is stained with tea. The ink on the names is faded, but the departure column looks freshly written.":
      "纸页一角被茶水浸透了，大多数姓名都已褪色。只有 307 旁边的“等候中”，墨迹还没干。",
    ROOM: "房号",
    GUEST: "住客",
    "Margaret H.": "玛格丽特 H.",
    Pending: "待定",
    "David & Ruth": "戴维与露丝",
    "Arthur Bell": "阿瑟·贝尔",
    "E. Rowan": "E. 罗温",
    "Eleanor Vale": "埃莉诺·维尔",
    Waiting: "等候中",
    "The relief porter": "代班前台",
    "Name removed": "姓名已删除",
    "In the margin: “Night desk keypad: opening day, month first. Nothing here should be difficult to remember.”":
      "页边注明：“员工入口通行码取开业日期，先填月份，再填日期，共四位。”",
    "Below the final line, in smaller handwriting: “Every name on this page is still checked in. Do not leave them behind.”":
      "最后一行下面，用更小的字写着：“这一页上的每个人，都还没有退房。不要把他们留下。”",
    "Find the night desk archive →": "寻找夜班档案室 →",
    "SECURITY OFFICE / RETAINED RECORDING": "安保办公室 / 留存录像",
    "Public-area security": "公共区域安全监控",
    "Archived footage is available for guest safety. The date and time shown by older cameras may not reflect current conditions.":
      "留存画面仅供住客安全使用。老式摄像机显示的日期与时间，可能不代表当前状况。",
    "● REC CAM 01": "● 录像中 监控 01",
    "MAIN LOBBY / 03.10.1987": "主大堂 / 1987.10.03",
    "CAM 01": "监控 01",
    "CAM 02": "监控 02",
    "CAM 03": "监控 03",
    "The desk is unattended. The register is open to a clean page. A lamp has been left on for the next guest.":
      "大堂画面是白天的录像。走廊监控还在运行，右上角的时间却一直没变。",
    "Select another camera to review the other public areas.":
      "切换摄像头，查看其他公共区域。",
    "STAFF ARCHIVE / MAINTENANCE FILE 01": "员工档案 / 维修文件 01",
    "Facilities / Retained by the night porter": "设施记录 / 夜班前台留存",
    "03 October 1987, 04:04.": "1987 年 10 月 4 日，04:04。",
    "All guest-room clocks stopped simultaneously. The west corridor now measures six doors longer than the building. Main supply remains energized despite isolation at the street.":
      "客房时钟全部停在 04:04。西侧走廊比外墙长。已切断街道进线，走廊灯仍亮着。",
    "04 October, same time.": "10 月 5 日，同一时刻。",
    "Found a second supply behind the reception clock. Brass lever, marked STILLWATER. It feeds the hotel, not the lights. Pulling it briefly revealed a stairwell where the wall should be.":
      "在前台时钟后找到另一根电缆，黄铜扳杆上标着 STILLWATER。拉下后，柜台旁露出一道门；松手，门就不见了。",
    "Date no longer advancing.": "日期一直没有变化。",
    "The hotel will offer two exits. Both belong to it. The service stair does not.":
      "红门和白门都通回旅馆。员工楼梯是唯一没出现在原图纸上的通路。",
    "Take the original register. Cut the supply at the brass disconnect. Only then use the service stair. Do not let the book close before the last guest has crossed.":
      "带上登记簿原件。切断黄铜开关处的电源，然后使用员工楼梯。最后一位住客通过前，不要让簿子合上。",
    "STAFF ARCHIVE / UNDELIVERED ITEM 0307": "员工档案 / 未投递物品 0307",
    "A letter to the next guest": "致下一位住客的一封信",
    "Returned correspondence / Room 307": "退回的信件 / 307 号房",
    "The envelope has your room number on it. Beneath the stamps, someone has written “PLEASE TRY AGAIN.”":
      "信封上写着您的房号。邮票下方，有人写了一句“请再试一次”。",
    "Dear whoever finally finds this,": "致终于找到这封信的人：",
    "My name is Eleanor Vale. We built a place where nobody would have to feel alone. I asked it to keep our guests safe. I did not understand what it meant to keep them.":
      "我是埃莉诺·维尔，这间旅馆是我和沃尔特一起开的。最早有人失踪时，我一直没动他们的房间，想着人也许会回来。后来他们真的回来了，可谁也出不去了。",
    "The register is the promise. The clock is the lock. The doors are only distractions.":
      "别在他们递来的新簿子上签字。门锁用的是停钟的时间，前台那两个出口也不可靠。",
    "I have signed a group checkout slip and left it inside the original book. A living guest must complete the record: the stopped time, the extra door, Rowan’s warning, the opening page, the disconnect, and this letter. Six things the hotel would rather you forget.":
      "我把签好的集体退房单夹在登记簿原件里。还缺六份资料，需要你来找齐：停钟的时间、多出的门、罗温的警告、开业当晚的记录、电闸的位置，以及这封信。别让他们把这些东西收走。",
    "Carry the book to the service stair after cutting the supply. Do not sign a new page. Let the last guest leave before you do.":
      "切断电源后，把簿子带到员工楼梯。不要再签新的一页。等最后一位住客离开，你再走。",
    "With all the apologies a lifetime can hold,": "对不起，我能做的只有这些。",
    Eleanor: "埃莉诺",
    "STAFF ARCHIVE / NIGHT SHIFT HANDOVER": "员工档案 / 夜班交接",
    "Please familiarize yourself with the following before beginning your first shift.":
      "开始第一班工作前，请熟悉以下事项。",
    "Keep a lamp lit at reception. A guest arriving after midnight may not remember making a reservation. This is normal.":
      "前台必须留一盏灯。午夜后到达的住客，可能不记得自己预订过。这是正常现象。",
    "Offer Room 307. Regardless of the requested room type, offer Room 307.":
      "向客人提供 307 号房。无论客人要求何种房型，都提供 307。",
    "If a guest asks to leave, indicate the red sign. Do not mention the white door.":
      "如果客人询问如何离开，请指向红色标识，不要提及白门。",
    "Do not open returned mail. Mrs. Vale’s correspondence concerns the original booking only.":
      "不要拆阅退回的邮件。维尔夫人的信件，只与最初那次预订有关。",
    "If the ventilation hum stops, do not restart it. Take your personal belongings and wait by the service stair.":
      "如果通风的嗡鸣停止，不要重新启动。带上私人物品，在员工楼梯旁等候。",
    "At the bottom, written in a different hand:": "最下方，另一种笔迹写着：",
    "“You are not the porter. You were a guest. Check the ledger.”":
      "“你不是这里的员工。你也登记在住客那一栏，自己去看。”",
    "Reopen the original register →": "重新打开登记簿原件 →",
    "PERSONAL EFFECTS / ROOM 307": "私人物品 / 307 号房",
    "The notebook under the pillow": "枕头下的笔记本",
    "The cover has softened with age. On the first page, someone has written your room number over and over.":
      "笔记本塞在枕套里，大部分纸页被撕掉了。剩下的每一页开头都写着“307”。",
    "First night.": "第一个夜晚。",
    "It was raining. I came inside to ask for directions. The porter said my room had been ready for years.":
      "外面下着雨。我进来问路，前台值班员却说，我的房间已经准备好多年了。",
    "Third night.": "第三个夜晚。",
    At: "到了",
    ", a door appears at the end of the corridor. Its lock accepts four digits. I wrote the time on my palm. When I woke, it was in someone else’s handwriting.":
      "，走廊尽头会出现一扇门。锁上需要四位数字。我把时间写在手心里，醒来时，却变成了别人的字迹。",
    "A later night.": "后来，我不再数住了几晚。",
    "I found a loose page in the guestbook. Rowan knows about the exits. Eleanor knows about the hotel. I think leaving and ending this are two different things.":
      "我在留言簿里发现了一张散页。罗温知道出口的事，埃莉诺知道旅馆的事。我想，离开这里和结束这一切，是两回事。",
    "“If you can, do not leave alone.”": "“如果可以，不要独自离开。”",
    "Find Rowan’s page →": "寻找罗温那一页 →",
    "Find Eleanor’s history →": "寻找埃莉诺的往事 →",
    "PERSONAL EFFECTS / GUEST NOTEBOOK": "私人物品 / 住客笔记",
    "Your guest notebook": "您的住客笔记",
    "TEST_GUEST · Room 307": "TEST_GUEST · 307 号房",
    "12 of 12 records recovered. The public record was only the first layer.":
      "已找回 12 / 12 条记录。公开记录，只是第一层。",
    "The stopped clock": "停下的时钟",
    "Every clock stops at 04:04. The lock on the unlisted door accepts four numbers, without a colon.":
      "房里的时钟停在 04:04。走廊尽头那扇门用四位数字开锁，输入时间时不要加冒号。",
    "A sixth door": "第六扇门",
    "The third-floor plan has five rooms. The recording shows a sixth door: 404. It appears when the clock stops.":
      "三层平面图只有五间客房，录像却显示了第六扇门：404。时钟停下时，它就会出现。",
    "Rowan’s warning": "罗温的警告",
    "Follow the red EXIT sign. The welcoming white door brings you back to reception, not home.":
      "罗温说要走红色 EXIT 出口。白门虽然亮着暖光，却只会把人带回前台。",
    "The hotel opened on 03 October 1987. Eleanor Vale in Room 307 never checked out. The printed instruction says: the staff keypad uses opening day, month first.":
      "酒店于 1987 年 10 月 3 日开业。307 号房的埃莉诺·维尔一直没有退房。员工通行码取开业日期，先月后日。",
    "The service disconnect": "时钟后面的电闸",
    "Behind the lobby clock is a brass disconnect marked STILLWATER. Take the original register, cut the power, then use the service stair instead of either exit door.":
      "大堂时钟后方，有一枚标着 STILLWATER（静水）的黄铜断路开关。带上登记簿原件，切断电源，再走员工楼梯，不要选择那两个出口。",
    "A letter never delivered": "从未寄出的信",
    "Eleanor left a signed group checkout slip inside the original register. With every record accounted for, one living guest can release everyone. Bring all six pieces of evidence.":
      "埃莉诺把集体退房单夹在登记簿原件里，并签好了字。信中说，还需要一位新来的住客补齐六份资料，才能带所有人离开。",
    "The backfeed circuit": "地下供电顺序",
    "Reception, kitchen, linen, night desk: circuits 3–1–4–2. The hotel is powered from below. Cutting the lobby lever only woke its other supply.":
      "前台、厨房、布草、夜班前台：回路 3–1–4–2。旅馆由地下供电，切断大堂扳杆，只是唤醒了另一条电源。",
    "The breakfast transmission": "早餐广播",
    "WSTL broadcasts on 88.7 FM. Rowan says the menu cabinet uses the first letter of every dinner course. The voice behind his voice is reading your arrival date.":
      "WSTL 的频率为 FM 88.7。罗温说，菜单柜密码取自每道晚餐英文菜名的首字母。他声音背后的另一个声音，正在念您的抵达日期。",
    "The original census": "盒子里的原始名册",
    "The five courses spell STILL. The uncropped staff photograph identifies the missing resident: Walter Vale, the founder. His key is 311, not the porter’s 309.":
      "五道菜的首字母组成 STILL。未裁切的员工照片标出了那位失踪住客：创办人沃尔特·维尔。他的钥匙是 311，不是前台值班员的 309。",
    "The guest the hotel removed": "311 的住客",
    "Walter Vale is the occupant of 311. The hotel removed his name to make the register impossible to complete. Restoring it opens the observation room.":
      "311 号房住着沃尔特·维尔。旅馆抹去了他的姓名，让登记簿永远无法补齐。恢复姓名后，观察室会打开。",
    "The instruction behind the glass": "镜子里那张纸条",
    "DO NOT TURN THE KEY. The first checkout was a rehearsal written by the hotel. Carry the ORIGINAL register, leave the brass key untouched, and take the SERVICE STAIR.":
      "镜中纸条写着“不要转动钥匙”。之前的退房没有成功，这次要带上登记簿原件，把黄铜钥匙留在桌上，走员工楼梯。",
    "Three days, in their proper order": "最初三天的顺序",
    "03 October: doors open. 04 October: clocks stop. 05 October: the first returned guest. The hotel must admit that a departure comes after an arrival. The final discharge can now be signed.":
      "10 月 3 日开业；4 日时钟停摆；5 日第一位离开的住客返回。旅馆必须承认，抵达之后可以有离开。现在可以签署最后一次退房。",
    "Departures remembered": "已发现的结局",
    "The road home · A familiar place · The last checkout — rejected · The new night porter · For the first time, morning":
      "回家的路 · 再回前台 · 退房失败 · 留下值夜班 · 走出酒店",
    "Lower stations verified: 6/6. The first checkout was not the end. Continue in the lower register.":
      "地下设备已核验：6/6。第一次退房不是终点，请继续调查地下前台。",
    "Return below →": "返回地下 →",
    "Find the unlisted door →": "寻找未列出的那扇门 →",
    "Visit the night desk": "前往夜班前台",
    "Notes are saved on this device. All story clues can be found on this website; no outside investigation is required.":
      "笔记保存在本设备中。所有剧情线索均在本站内，无需进行站外调查。",
    "At your service": "随时为您服务",
    "Our front desk is open at every hour, in every season. Whether you are looking for a room or someone you remember, we are pleased to help.":
      "无论什么时刻、什么季节，前台始终有人值守。不论您想找一间房，还是寻找记忆中的某个人，我们都乐意帮忙。",
    "Before you arrive": "抵达之前",
    "Rooms may be requested through our reservations page. The guest guidelines explain our quiet hours and a few hotel traditions. Our public history includes the dates and details most visitors need.":
      "您可通过预订页面申请客房。住客须知介绍了安静时段与旅馆惯例，公开的旅馆往事中，则保留着多数访客需要的日期和细节。",
    "If you are already here": "如果您已经在这里",
    "Keep your key with you. Consult the third-floor directory if a room number seems unfamiliar. Messages for past guests are kept in the guestbook.":
      "请随身保管钥匙。如果发现陌生的房号，可查阅三层导览。留给昔日住客的话，保存在留言簿中。",
    "Visit reception →": "前往前台 →",
    "Find my room": "查找我的房间",
    "This hotel and its contact details are fictional. No inquiry is sent, and no real reservation is made.":
      "旅馆及其联络方式均属虚构。不会发送咨询，也不会生成真实预订。",
    "HOTEL RESOURCES / SITE INFORMATION": "旅馆服务 / 网站说明",
    "About your stay": "游戏说明",
    "is an original, fictional, Backrooms-inspired interactive mystery. Its comfortable public website conceals an ongoing story told through guest records, security footage, and staff correspondence.":
      "是一部原创、虚构的后室风格互动谜案。舒适的酒店官网背后，住客记录、监控录像与员工信件，正在讲述一个尚未结束的故事。",
    "How to explore": "玩法说明",
    "Register under a nickname, collect your key, and read carefully. Save discoveries to your notebook. Two doors offer two endings; a complete public record reveals what lies below. The apparent third ending is the beginning of a second, more demanding chapter. Use the Hotel Guide to cross-check menus, service orders, and incident reports. All clues are inside this site. You never need to contact anyone or visit a real place.":
      "使用昵称登记、领取钥匙，并仔细阅读。将发现记入笔记。两扇门通往两个结局；完整的公开记录，则会揭开地下的秘密。看似第三个结局，其实是更深入的第二章起点。用旅馆指南交叉核对菜单、服务顺序和事件报告。所有线索都在本站内，无需联系任何人，也不必前往现实地点。",
    "Comfort & accessibility": "声音与画面设置",
    "Contains unsettling figures, sudden visual interruptions, and a second horror chapter after the apparent ending. Sudden effects can be disabled below without losing any puzzles. There is no rapid flashing. Ambient sound remains off until you choose; reduced-motion preferences are respected. Press Escape to close a document.":
      "包含令人不安的人影、短暂的突发画面，以及假结局后的第二段恐怖章节。可在下方关闭突发效果，不影响解谜。没有快速频闪。环境音只有手动开启后才会播放；系统的减少动态效果设置会被尊重。按 Esc 可关闭档案。",
    "Ambient sound: off": "环境音：关闭",
    "Sudden visual effects: on": "突发惊吓画面：开启",
    "Your information": "您的资料",
    "Your nickname, registration, notes, and progress stay in this browser. They are not sent to a server. Clearing site data erases them. The employee keypad is a fictional puzzle, not real security. Images are generated; characters, hotel, and bookings are fictional.":
      "昵称、登记、留言与进度只保存在此浏览器中，不会发送到服务器。清除网站数据会删除它们。员工键盘是虚构谜题，不是真实的身份验证。酒店图片为生成素材，人物、旅馆与预订均属虚构。",
    "Source files can be opened locally after extracting the ZIP, or served using the included Node.js development server.":
      "完整解压 ZIP 后，可直接打开源文件试玩，也可使用附带的 Node.js 开发服务器。",
    "Start over / clear this device’s story progress":
      "重新开始 / 清除本设备的剧情进度",
    "Begin a new stay?": "确定重新开始吗？",
    "This clears both chapters, registration, notebook, local messages, solved stations, archive access, and discovered endings. The hotel will remember you as a first-time visitor. Your visual-effects preference is retained; audio will be switched off.":
      "这会清除两个章节的登记、笔记、本地留言、已解锁环节、档案权限与结局。旅馆会将您视为首次到访者。突发画面偏好会保留，声音将被关闭。",
    "Clear progress & begin again": "清除进度并重新开始",
    "Keep my records": "保留我的记录",
    "GUEST FACILITIES / DINING CARD 02": "住客设施 / 用餐卡片 02",
    "The dining room": "餐厅",
    "Guest information / Ground floor / Issued by the kitchen":
      "住客资料 / 一层 / 厨房签发",
    "Breakfast is served between seven and nine. The dining room has twelve tables. During busy periods, a member of staff may direct you to a thirteenth. Please ask for a different table. There is no thirteenth table on the fire plan.":
      "早餐在七点至九点供应。餐厅共有十二张桌子。繁忙时，员工可能会引导您到第十三张桌旁。请要求换桌。消防平面图上，没有第十三张桌子。",
    "The breakfast radio is tuned to": "早餐广播固定收听",
    "WSTL, 88.7 FM": "WSTL，FM 88.7",
    ". Our longest-staying guests find the familiar weather reports reassuring. The announcer has not changed since opening week. If a report mentions your name, leave the radio on and notify the night desk.":
      "。熟悉的天气预报让许多长住客人感到安心。播音员自开业那周起，从未更换。如果广播提到您的名字，请保持收音机开启，并通知夜班前台。",
    "Our five-course dinner": "我们的五道晚餐",
    "Served in the order printed. The chef asks that the first letter of every course remain visible when the menu is folded; it is also the old kitchen cabinet word.":
      "依印刷顺序上菜。主厨要求，折叠菜单时仍应露出每道英文菜名的首字母；它们也是老厨房柜锁的密码。为保留谜题，下列菜名附带英文原文。",
    "moked tomato consommé": "moked tomato consommé · 烟熏番茄清汤",
    T: "T",
    "hyme-roasted squash": "hyme-roasted squash · 百里香烤南瓜",
    I: "I",
    "ced cucumber salad": "ced cucumber salad · 冰黄瓜沙拉",
    L: "L",
    "emon-butter sole": "emon-butter sole · 柠檬黄油鳎鱼",
    "avender shortbread": "avender shortbread · 薰衣草酥饼",
    "Dietary requests can be left at reception. We have a record of your preferences, even if this is your first visit. Do not eat from a place setting that was already warm when you sat down.":
      "饮食要求可留在前台。即使您第一次来，我们也有您的偏好记录。若您落座前，某个位置的餐具已经温热，请不要使用它。",
    "Kitchen circulation notice: the menu cabinet and the lower census archive were fitted with identical five-letter locks in 1987. The engineer did not record a second word.":
      "厨房传阅通知：1987 年，菜单柜与地下名册柜安装了相同的五字母锁。工程师没有记录第二套密码。",
    "Read the breakfast radio card": "阅读早餐广播卡片",
    "Back to the hotel guide": "返回旅馆指南",
    "DINING ROOM / BROADCAST SCHEDULE": "餐厅 / 广播时刻表",
    "The breakfast programme": "早餐广播节目",
    "WSTL / 88.7 FM / Programme card retained by the dining staff":
      "WSTL / FM 88.7 / 餐厅员工留存的节目卡",
    "07:00 — The road report.": "07:00 —— 道路播报。",
    "No delays on the Stillwater road. No departures recorded.":
      "静水旧路无拥堵，未记录任何离店者。",
    "07:15 — Local weather.": "07:15 —— 本地天气。",
    "Still overcast. Wind from the north. The bird on the courtyard rail has moved to the left. If you remember it moving to the right, remain indoors.":
      "持续阴天，北风。庭院栏杆上的鸟向左挪了一点。如果您记得它向右移动，请留在室内。",
    "07:30 — Messages for travelers.": "07:30 —— 旅人留言。",
    "Names are read in the order in which their owners arrived. Never answer a name spoken twice.":
      "姓名按各自抵达的先后顺序播报。同一个名字若被念了两次，绝不要回应。",
    "07:45 — A familiar melody.": "07:45 —— 熟悉的旋律。",
    "The piano arrangement ends one note early. Please do not provide the last note yourself.":
      "钢琴曲总少最后一个音符。请不要自行补上。",
    "08:00 — Reception handover.": "08:00 —— 前台交接。",
    "During a power failure, the lower receiver may be tuned to the same frequency. A transcript is available for staff who cannot hear the transmission.":
      "停电期间，地下接收机可以调到相同频率。无法收听的员工，可查阅文字转录。",
    "The card is dated 05 October 1987. Every replacement ordered since then has arrived with the same date. The print shop denies having our account.":
      "卡片日期为 1987 年 10 月 5 日。此后每次订购的替换卡，都印着同一日期。印刷店否认我们有过账户。",
    "View the dinner menu": "查看晚餐菜单",
    "FACILITIES / SWITCHBOARD PROCEDURE": "设施 / 配电操作规程",
    "Service restoration order": "恢复供电顺序",
    "Facilities sheet SW-14 / Keep beside both switchboards":
      "设施说明 SW-14 / 两块配电盘旁均需留存",
    "Following a supply interruption, do not energize the hotel in numerical order. The original wiring crosses the west-wing extension. The numbered circuits are listed below.":
      "供电中断后，请勿按数字顺序恢复旅馆供电。原线路与西翼扩建线路交错，回路编号如下。",
    CIRCUIT: "回路",
    DEPARTMENT: "部门",
    "WHY IT MUST ANSWER": "为何必须接通",
    "Kitchen heat": "厨房供热",
    "Keep the boiler steady": "保持锅炉稳定",
    "Night desk": "夜班前台",
    "Record the restored guests": "记录恢复供电后的住客",
    "Reception bell": "前台铃",
    "Ask whether anyone is waiting": "询问是否有人等候",
    "Linen service": "布草间",
    "Prepare the occupied rooms": "准备有人入住的客房",
    "Restoration procedure:": "恢复流程：",
    "first ring reception. Then supply the kitchen. Bring the linen service online next. The night desk must be last; it may only begin counting after the rooms have been prepared.":
      "先呼叫前台，再接通厨房，随后恢复布草间。夜班前台必须放在最后——客房备妥之后，它才能开始计数。",
    "Once all four circuits are acknowledged, the radio receiver will resume. A circuit energized twice returns the board to its initial state. If a hand appears in an unused socket, stop working and count your own fingers before continuing.":
      "四组回路全部确认后，收音接收机会恢复。一组回路重复通电，会使配电盘回到初始状态。如果一只手从未使用的插口中伸出，请停止操作，先数清自己的手指，再继续。",
    "The lobby lever is an isolator, not a main disconnect. A supply still exists beneath the building. Cutting the visible power makes the lower equipment accessible.":
      "大堂扳杆是隔离开关，而非总电闸。建筑地下仍有电源。切断看得见的供电，只会让下层设备变得可以接近。",
    "Return to hotel facilities": "返回旅馆设施",
    "RESIDENCE COMMITTEE / CIRCULAR 07": "长住客委员会 / 通知 07",
    "A circular for long-stay residents": "致长住客人的一份通知",
    "Residence committee / Seven copies circulated / Eighth copy destroyed":
      "长住客委员会 / 已分发七份 / 第八份已销毁",
    "Margaret asks that the teapot be returned to the dining room after the evening service. Arthur has offered to mend the lining of any coat that still remembers rain. David and Ruth would like their anniversary removed from the public calendar; it has occurred three times this week.":
      "玛格丽特的茶壶请送回餐厅。阿瑟会补外套内衬，需要的话送到 301。戴维和露丝让我们别再把他们的纪念日写上公告栏——这周已经通知三次了。",
    "Rowan reports that the room numbers change when photographed. Refer to the original ledger, not the labels on the doors. The man wearing the porter’s uniform is assigned 309. This does not mean he is the porter.":
      "罗温说，门上的房号会在拍照时改变。请以登记簿原件为准，不要相信门牌。穿着前台值班员制服的那个人住在 309，但这不意味着他就是前台值班员。",
    "Eleanor requests that nobody ask the person in 311 to speak. He has been repeating the last sentence he said before the clocks stopped. The sentence is not an instruction, even when it uses your voice.":
      "埃莉诺请求，谁也不要让 311 号房的人开口。他一直在重复时钟停下前说的最后一句话。那句话不是指令，即使它用的是您的声音。",
    "Meeting notes": "会议记录",
    "The founder pictured with the brass key in the opening photograph is":
      "开业合影中，佩戴黄铜钥匙的创办人名叫",
    "Walter Vale": "沃尔特·维尔（Walter Vale）",
    ". His room was": "。他住在",
    ". The public copy of the photograph crops out his identification card. No vote was taken to erase his ledger entry.":
      "。公开版本裁掉了他的身份卡。没有人投票同意抹去他的登记记录。",
    "A resident is not the same thing as a guest. The hotel can imitate a guest. It cannot invent an arrival before its doors opened.":
      "核对姓名请用开业之夜的记录。门牌换过几轮，最早那本登记簿没有改过。",
    "Examine the staff photograph →": "查看员工照片 →",
    "HOTEL COLLECTION / PHOTOGRAPH 001-B": "旅馆藏品 / 照片 001-B",
    "The uncropped opening photograph": "未经裁切的开业合影",
    "Hotel collection / Contact sheet 001-B": "旅馆藏品 / 原版照片 001-B",
    "CONTACT SHEET 001-B · ORIGINAL IDENTIFICATION RETAINED":
      "原版照片 001-B · 保留原始身份标注",
    "Two founders stand on either side of the reception desk. The faces have faded out of the print. The typewritten captions remain intact.":
      "两位创办人分别站在前台两侧。脸部影像已从照片上褪去，打字标注却保存完整。",
    LEFT: "左侧",
    "ELEANOR VALE": "埃莉诺·维尔",
    "HOST / 307": "迎宾 / 307",
    RIGHT: "右侧",
    "WALTER VALE": "沃尔特·维尔（Walter Vale）",
    "PROPRIETOR / 311": "业主 / 311",
    BACKGROUND: "背景",
    "RELIEF PORTER": "代班前台",
    "STAFF QUARTERS / 309": "员工宿舍 / 309",
    "A strip of the original ledger is visible at the bottom of the frame. The final name begins with W. On every public reproduction, that strip has been painted over.":
      "画面底部能看到登记簿原件的一小条。最后那个姓名以 W 开头。每份公开复制品，都把那一条涂掉了。",
    "The dark shape reflected in the reception glass does not correspond to any of the three people. The photographer’s report calls it a processing fault. The fault appears in the negative too.":
      "摄影师在记录中提到，前台玻璃里还有第四个人。三名员工都不认识他，底片上也能看见同样的轮廓。",
    "Read the residents’ circular": "阅读长住客人通知",
    "The lobby from the hotel collection": "旅馆藏品中的大堂照片",
    "GUEST FACILITIES / READING ROOM": "住客设施 / 阅览室",
    "The reading room": "阅览室",
    "East wing / Open until the last guest has finished":
      "东翼 / 开放至最后一位客人读完",
    "The library contains local histories, travel writing, and a shelf of books left by previous guests. Nothing is loaned outside the building. Each time a book leaves, a room becomes more difficult to find.":
      "藏书包括地方史、游记，以及一架前任住客留下的书。书籍不得借出建筑。每离开一本书，就有一间房变得更难找到。",
    "Arthur Bell spent his first evening repairing the atlas. He found the Stillwater road on page 41, leading into a town that had not existed for eighty years. On his second evening, the page showed the hotel. On the third, it showed his own room from above.":
      "阿瑟·贝尔在第一晚修补地图册。他在第 41 页找到了静水旧路，通向一个八十年前就消失的小镇。第二晚，那一页画着旅馆；第三晚，画的是俯视他自己房间的景象。",
    "Catalogue corrections": "目录更正",
    "Books bearing a white label are ordinary donations. Red labels indicate material belonging to the original hotel collection. A book with no label may contain a page from the guest register. Return that page to its original binding; loose names are easily misplaced.":
      "白色标签是普通捐赠书，红色标签属于旅馆原始藏品。没有标签的书，可能夹着住客登记簿的一页。请将那一页放回原来的装订册，散落的姓名很容易弄丢。",
    "At the back of the room is a visitor’s desk with a mirror instead of a window. The porter insists that the glass faces the outside wall. You can hear pages turning on the other side.":
      "阅览室后方有张访客桌，本应是窗的位置却装着镜子。前台值班员坚称，玻璃朝向的是外墙。您能听见另一侧翻书的声音。",
    "Conservation note: reflected writing must be read in reverse. Do not turn the physical object to face the glass. The reversal belongs to the message, not to your hands.":
      "藏品维护说明：镜中的字需要倒着读。不要把实物转向玻璃。需要反转的是信息，不是您的手。",
    "Consult lost property →": "查阅失物记录 →",
    "GUEST FACILITIES / COURTYARD GUIDE": "住客设施 / 庭院指南",
    "The courtyard walk": "庭院散步",
    "A short walk for residents / Revised route": "住客短程步道 / 修订路线",
    "From reception, take the door beside the fern. The courtyard is paved in a loop around a dry fountain. There are seven lamps, eight benches, and one gate. The gate is decorative. If it is standing open, your walk has not yet begun.":
      "从前台旁的蕨类盆栽边出去，铺石小路绕着干涸的喷泉走一圈。那里有七盏灯、八张长椅和一道门。门只是装饰。如果它正敞开着，说明您的散步还没有开始。",
    "The northern bench bears a plaque: FOR THOSE WHO WILL RETURN. It was ordered before the hotel opened. The supplier has no record of the inscription, but their ledger shows that Walter collected it himself.":
      "北侧长椅的铭牌上写着：“献给那些将会归来的人。”旅馆开业前就订好了这块牌。供货商没有铭文记录，但账本显示，是沃尔特亲自取走了它。",
    "Guests sometimes report seeing their own room through a ground-floor window. Do not wave. A person standing behind that glass may assume you are inviting them outside.":
      "有住客说，能透过一层窗户看见自己的房间。请不要挥手。站在那片玻璃后的人，可能会认为您在邀请他出来。",
    "After dusk": "黄昏之后",
    "If the lamps go out in a clockwise sequence, return by the route you remember. If they go out all at once, remain still until you can see your own shadow. A second shadow is not evidence of another guest.":
      "如果路灯按顺时针依次熄灭，请沿记忆中的路线返回。如果它们同时熄灭，请站在原地，直到看见自己的影子。第二道影子并不能证明附近有另一位住客。",
    "Groundskeeper’s report, 05 October: the first guest to leave came back through the courtyard gate wearing the same wet coat. He said the road ended at reception. Walter ordered a new page in the register.":
      "园丁报告，10 月 5 日：第一位离开的客人穿着同一件湿外套，从庭院门口回来了。他说，道路的尽头就是前台。沃尔特要求在登记簿上另开新页。",
    "RECEPTION / LOST PROPERTY REGISTER": "前台 / 失物登记簿",
    "Lost property, awaiting collection": "失物招领，等待认领",
    "Reception inventory / Items held indefinitely": "前台清单 / 无限期保管",
    ITEM: "物品",
    FOUND: "发现地点",
    STATUS: "状态",
    "Red ribbon": "红色缎带",
    "Returned to Rowan": "已归还罗温",
    "Brass key, 307": "黄铜钥匙，307",
    "Departure stair": "离店楼梯",
    "Do not turn": "不要转动",
    "Black coat": "黑色外套",
    "Courtyard gate": "庭院门口",
    "Still wet": "仍未干燥",
    "Photograph 001-B": "照片 001-B",
    "Kitchen cabinet": "厨房柜",
    "Original retained": "原件留存",
    "A guest’s voice": "没有标签的录音带",
    "Room 311": "311 号房",
    "Claimant unknown": "认领人不明",
    "Keys are held for their owners, not issued as replacements. A key recovered from the departure stair must remain in its found position. There is no lock on the stair itself; an invitation to use a key there is a request to complete the circuit.":
      "钥匙为原主保留，不作为替换品发放。从离店楼梯找回的钥匙，必须保持被发现时的姿态。楼梯本身没有锁；有人邀请您在那里用钥匙，是在请求您闭合回路。",
    "Clothing that remains wet after laundering is stored away from the reception desk. Do not identify its owner by reading the lining aloud. The item may answer.":
      "黑外套在烘干室放了三天还是湿的。内衬缝着姓名，请不要念出来。上次有人念了，311 里传来了应答。",
    "If you believe an entry refers to something that cannot be lost, ask a long-stay resident. They are better acquainted with the collection than our current staff.":
      "录音带是在 311 门外找到的。不管谁拿着播放器，放出来的都像那个人自己的声音，换人时并没有换磁带。",
    "STAFF ARCHIVE / INCIDENT REVIEW 03": "员工档案 / 事件复核 03",
    "Incident review / The dates have not been corrected to match the hotel clock":
      "事件复核 / 日期未经旅馆时钟校正",
    "03 October 1987 — OPENING.": "1987 年 10 月 3 日 —— 开业。",
    "The doors open. Seven entries are made in the register. Walter retains 311 and asks the porter not to allocate it.":
      "旅馆开门迎客，登记簿写入七条记录。沃尔特保留 311，并要求前台值班员不要将它分配出去。",
    "04 October 1987 — INTERRUPTION.": "1987 年 10 月 4 日 —— 时钟停摆。",
    "At 04:04, the clocks stop. The town telephone exchange can no longer locate our address. The reception bell continues to ring with nobody at the desk.":
      "04:04，时钟停止。镇上的电话交换台再也找不到我们的地址。前台无人，铃声却持续响着。",
    "05 October 1987 — FIRST RETURN.": "1987 年 10 月 5 日 —— 首次返回。",
    "Arthur leaves in a black coat. At breakfast he returns through the courtyard, wet from rain nobody else remembers. A second entry appears under his first.":
      "阿瑟穿着黑色外套离开。早餐时，他从庭院回来，浑身被一场其他人都不记得的雨打湿。他第一次登记的下面，出现了第二条记录。",
    "The order matters. The opening came first, the interruption second, the return third. Any version in which a guest returns before arriving is the hotel’s reconstruction, not our record.":
      "顺序很重要。先开业，再中断，最后才是返回。任何“住客先返回、后抵达”的版本，都是旅馆重构的故事，不是我们的记录。",
    "Use this chronology to restore the date order in the lower register. Do not use the times stamped on the surveillance tapes; they all show the same minute.":
      "使用这份时间线，还原地下前台的日期顺序。不要使用监控录像上的时间戳，它们全停在同一分钟。",
    "Read the audit comparison": "查看核查报告",
    "NIGHT DESK / UNRESOLVED AUDIT": "夜班前台 / 未结审计",
    "Night audit: two sets of books": "夜间核查：两本不同的登记簿",
    "Accounting exception / Prepared but never filed": "异常记录 / 尚未归档",
    "There are two registers. The original records arrival and departure as separate events. The duplicate copies whichever event will keep a room occupied. A guest who leaves through the red door is marked “expected.” A guest who chooses the white door is marked “arrived.” Neither entry closes an account.":
      "共有两本登记簿。原簿将抵达与离店记作不同的事件，副本却只复制能使客房保持有人入住的那一项。走红门离开的住客被标为“预计到达”；选择白门的住客被标为“已抵达”。两者都不会结清账户。",
    "We previously believed a signed group checkout would empty the building. The attempt did stop the visible clock. It did not silence the second supply. The service stair returned the guests to a lower version of reception.":
      "我们曾相信，签好集体退房单就能清空建筑。那次尝试确实停住了看得见的时钟，却没有让第二路电源安静下来。员工楼梯把住客送回了另一个位于更深处的前台。",
    "Discharge requirements": "退房前需要确认的事项",
    "Restore the lower circuits in the printed order. Identify the name erased from 311. Recover the instruction reflected in the observation glass. Put the first three days in order. At the final desk, present the":
      "按印刷顺序恢复地下回路，找回 311 被抹去的姓名，读出观察室玻璃中的指令，还原最初三天的先后顺序。在最终前台，出示",
    original: "原始",
    "register,": "登记簿，",
    "leave the brass key untouched": "不要碰黄铜钥匙",
    ", and choose the": "，并选择",
    "service stair": "员工楼梯",
    "A staff appointment is not a discharge. If the desk offers you a uniform, you have not escaped. You have been made responsible for the next arrival.":
      "如果你想离开，就别接下制服。穿上它只意味着接替夜班，还得继续留在这里接待下一位住客。",
    "The porter says this audit has already been completed. The signature at the bottom is yours. You have not signed it yet.":
      "前台值班员说这份报告早就核对过了。报告底下确实有你的签名。可你明明还没签过字。",
    "SECOND SUPPLY / MANUAL RESTORATION": "第二路电源 / 手动恢复",
    "01 / The second switchboard": "01 / 第二块配电盘",
    "The copper contacts are warm. There are four circuits, but the instructions say not to restore them in numerical order.":
      "铜触点是温热的。共有四组回路，但说明要求，不要按数字顺序恢复。",
    "A label reads: “Use the printed service restoration procedure. Each department must answer once.” You can hear the reception bell from inside the panel.":
      "标签写着：“请按供电说明操作，各条线路依次接通一次。”配电盘里面隐约传来前台铃声。",
    "KITCHEN HEAT": "厨房供热",
    "NIGHT DESK": "夜班前台",
    "RECEPTION BELL": "前台铃",
    "LINEN SERVICE": "布草间",
    "NO CIRCUITS SELECTED": "尚未选择回路",
    "Energize selected sequence →": "按所选顺序通电 →",
    "Clear sequence": "清空选择",
    "Read the retained service sheet →": "查看供电说明 →",
    "Return to the lower register": "返回地下前台",
    "LOWER RECEIVER / NO SIGNAL": "地下接收机 / 无信号",
    "02 / The voice at breakfast": "02 / 早餐时的声音",
    "The receiver has power. Between stations, the static sounds like people trying to say the same word at different speeds.":
      "接收机已经通电。频道之间的杂音，像是有人以不同速度，试着说同一个词。",
    "The dining staff kept a programme card. Tune to the station played at breakfast. Audio is not required; a decoded transcript appears when the carrier locks.":
      "餐厅有一张早餐广播节目单。找到上面的频率，调好后确认接收，即可查看广播文字。不开声音也能完成。",
    "Receiver frequency / FM": "接收频率 / FM 调频",
    "86.0 MHz": "86.0 MHz",
    "Lock carrier & decode transcript →": "确认频率，接收广播 →",
    "Consult the programme card →": "查看广播节目单 →",
    "CENSUS ARCHIVE / LETTER LOCK": "名册档案 / 字母锁",
    "03 / The sealed census": "03 / 封存的名册",
    "The radio transcript mentions the old kitchen lock. The same five-letter mechanism is fitted to a steel box below the reception desk.":
      "广播转录提到了老厨房的锁。前台下方的钢盒，也装着同样的五字母锁。",
    "“Begin each course,” the label says. There are five courses, served in a fixed order. Read their beginnings, not their ingredients.":
      "标签写着：“从每道菜的开头开始。”五道菜按固定顺序供应。读出英文菜名的开头，不是它们的食材。",
    "Five-letter cabinet word": "柜锁的五字母密码",
    "Open the census box →": "打开名册盒 →",
    "Recover the dinner menu →": "找回晚餐菜单 →",
    "Five letters": "五个英文字母",
    "ORIGINAL CENSUS / ENTRY 311": "原始名册 / 311 条目",
    "04 / The name in 311": "04 / 311 号房的姓名",
    "Inside the cabinet is contact sheet 001-B. Unlike the public print, it includes the identification cards and the final line of the opening register.":
      "柜子里放着照片 001-B 的完整标注，保留了每个人的姓名、身份和房号。旁边还有开业登记簿最后一行的复印件。",
    "The hotel replaced one name with “NAME REMOVED.” Restore the resident’s full name. The person in the porter’s uniform belongs to 309; the missing resident does not.":
      "登记簿中有一位住客的姓名被划掉了。请根据照片标注补齐他的全名。注意，309 号房的代班前台不是要找的人。",
    "Full name of the original occupant of Room 311": "311 号房最初住客的全名",
    "Restore the missing name →": "恢复被抹去的姓名 →",
    "Compare the uncropped photograph →": "核对照片背面的完整标注 →",
    "First and last name": "中文姓名或英文全名",
    "OBSERVATION ROOM / SUBJECT NOT ALONE": "观察室 / 被观察者并非独处",
    "05 / The observation glass": "05 / 观察室的玻璃",
    "Walter’s restored name unlocks the observation room. Behind the glass, a person wearing your clothes is holding up a printed card. They are not quite still.":
      "沃尔特的姓名恢复后，观察室打开了。玻璃后方，一个穿着您衣服的人正举着印刷卡片。对方并不完全静止。",
    "YEK EHT NRUT TON OD": "YEK EHT NRUT TON OD",
    "OBSERVATION CAMERA / REVERSE SIDE OF CARD": "观察摄像机 / 卡片背面原文",
    "The writing was printed on the back of the card. Read the characters in reverse order. Enter the instruction in ordinary English. Punctuation and spaces do not matter.":
      "字印在卡片背面，请从右向左读取。可输入还原后的英文指令，也可输入对应的中文意思。标点与空格不影响答案。",
    "Decoded instruction": "纸条上的提示",
    "Record the instruction →": "记下纸条内容 →",
    "Consult the brass-key inventory →": "查阅黄铜钥匙清单 →",
    "Read the reflected line": "读出镜像中的那一行",
    "DEPARTURE DESK / CHRONOLOGY EXCEPTION": "离店前台 / 时间顺序异常",
    "06 / The first three days": "06 / 最初的三天",
    "The lower register has three incident cards arranged in the wrong order. Its date stamps cannot be trusted. Use the incident review, not the frozen clock.":
      "桌上有三张顺序打乱的事件卡。请根据事件报告里的日期重新排列，监控上停住的时间不能作为依据。",
    "Select all three events in the order they happened: earliest first. Each card can be used once.":
      "按发生顺序选择全部三个事件，最早的先选。每张卡只能使用一次。",
    "The first guest returned": "第一位住客返回",
    "All clocks stopped": "所有时钟停止",
    "The hotel doors opened": "旅馆开门迎客",
    "NO EVENTS SELECTED": "尚未选择事件",
    "Commit the corrected sequence →": "提交更正后的顺序 →",
    "Read the incident review →": "阅读事件复核 →",
    "FINAL DISCHARGE / NO COPIES ACCEPTED": "办理退房 / 需出示登记簿原件",
    "Twelve records recovered. One living signature required. Behind the desk, the empty uniform turns toward you.":
      "十二份资料都齐了，只差最后一个签名。柜台后那件没有人穿的制服，慢慢朝你转了过来。",
    "The hotel offers a key and a clean book. It calls both gifts. You know what the first gift did.":
      "柜台上又多了一本新簿子和一把钥匙。旁边的退房表，已经填好了您的姓名。",
    "Which register will you present?": "带哪一本登记簿？",
    "Choose the record": "选择记录",
    "The new, clean duplicate": "前台新拿出的登记簿副本",
    "The original opening-night register": "开业当晚的登记簿原件",
    "What will you do with the brass key?": "如何处理黄铜钥匙？",
    "Choose what happens to the key": "选择钥匙的处置方式",
    "Turn it in the offered lock": "插入锁孔并转动",
    "Leave it untouched": "留在桌上，不动它",
    "Which departure will you record?": "从哪里离开？",
    "Choose the way out": "选择出路",
    "The welcoming white doorway": "透着暖光的白门",
    "The service stair": "员工楼梯",
    "The red EXIT door": "红色 EXIT 出口门",
    "Sign as TEST_GUEST & close the accounts →":
      "以 TEST_GUEST 的姓名签字并结清账户 →",
    "Review the discharge requirements": "核对退房要求",
    "Accept the porter’s uniform instead": "不走了，留下值夜班",
    "NIGHT DESK / APPOINTMENT CONFIRMED": "夜班前台 / 已接班",
    "The new night porter": "留下值夜班",
    "ENDING 04 / THE POSITION IS NOW FILLED": "结局 04 / 留下值夜班",
    "The sleeves fit. You do not remember putting your arms into them. The register closes and opens to a fresh page.":
      "再回过神，制服已经穿在身上。面前的登记簿摊着，有人在按前台铃。",
    "Beyond the glass doors, someone is sheltering from rain. You reach for the key to 307 before they can ask for a room.":
      "玻璃门外，有人正在躲雨。对方还没开口问房间，您的手已经伸向 307 的钥匙。",
    "You have not been released. You have been employed.":
      "退房单上盖了一个“夜班员工”的章。您的房间钥匙，已经挂在身后的钥匙板上。",
    "Refuse the appointment & try again →": "不接这份工作，重新选择 →",
    "SECURITY EXCEPTION / FRAME 0000": "安全监控异常 / 画面 0000",
    "There is someone at the desk": "前台后面，有个人",
    "THAT IS NOT": "那不是",
    "THE PORTER.": "前台值班员。",
    "THE FRAME WAS EMPTY WHEN YOU OPENED IT.": "您打开它时，这一帧明明是空的。",
    "Its reflection is looking directly into the lens. The camera is behind it.":
      "玻璃里的脸正对着镜头。可摄像机本该在它身后。",
    "Return to the ordinary recording": "返回普通监控录像",
    "A tall figure with an indistinct face behind the glass":
      "玻璃后方一名面孔模糊的高大身影",
    "THE STILLWATER HOTEL / DEPARTURE RECORD": "静水旅馆 / 离店记录",
    "The road home": "回家的路",
    "01 / THE ROAD HOME": "01 / 回家的路",
    "You push the red door open.": "您推开红色的门。",
    "Morning air touches your face. You are standing on an ordinary road, beside an ordinary, empty field.":
      "清晨的空气拂过脸颊。您站在一条普通的路上，旁边是一片普通、空旷的田地。",
    "There is no hotel behind you.": "您转过身，旅馆原来的位置只剩下一片空地。",
    "In your palm, the brass key is still warm. On its reverse, a new line has appeared:":
      "您摊开手，钥匙还在。翻到背面，看见原来没有的一行字：",
    "“We look forward to your next visit.”": "“期待您的下次光临。”",
    "Keep the story in my notebook": "将这段经历记入笔记",
    "Revisit the last door": "重访最后那扇门",
    "5 of 5 departure records remembered. Your progress remains saved. The service-stair checkout conceals another chapter; you can keep exploring without starting over.":
      "已记住 5 / 5 条离店记录。进度仍已保存；员工楼梯的退房结局后藏着另一个章节，您可以继续探索，无需重来。",
    "A familiar place": "熟悉的地方",
    "02 / A FAMILIAR PLACE": "02 / 熟悉的地方",
    "The light is warm. You close your eyes for just a moment.":
      "您走进光里。有那么一瞬间，闻到了家里浴室香皂的味道。",
    "When you open them, you are at reception. The porter smiles as though you have only stepped outside for a little air.":
      "睁眼时，您站在前台。前台值班员对您微笑，仿佛您刚才只是出去透了口气。",
    "“Your room is waiting,” he says, turning the register toward you.":
      "“您的房间一直在等您。”他说着，将登记簿转向您。",
    "This time, your name is already on the page.":
      "这一次，您的姓名已经写在那一页上。",
    "● REC CAM 02": "● 录像中 监控 02",
    "WEST CORRIDOR / LEVEL 03 / 03.10.1987": "西侧走廊 / 三层 / 1987.10.03",
    "There should be five doors. A sixth stands at the end of the hall. The brass plate reads 404. The clock above it is not moving.":
      "这里本该只有五扇门，走廊尽头却立着第六扇。铜牌上写着 404，上面的时钟一动不动。",
    "● REC CAM 03": "● 录像中 监控 03",
    "SERVICE LIFT / 03.10.1987": "服务电梯 / 1987.10.03",
    "The lift opens onto another copy of the same corridor. Someone has taped a note over the fourth-floor button: “DO NOT COMPLETE THE CIRCUIT.”":
      "电梯门打开，外面还是西侧走廊。四层按钮被胶带封住，上面写着“不要闭合回路”。",
    "Inspect the unoccupied reception frame": "检查本应空无一人的前台画面",
    "Room 301 — do not disturb": "301 号房 —— 请勿打扰",
    "Slow footsteps stop just behind the door. The handle moves. You decide not to disturb the occupant.":
      "缓慢的脚步声停在门后。把手动了一下，您决定不再打扰屋里的人。",
    "← Return to the corridor": "← 返回走廊",
    "Room 303 — do not disturb": "303 号房 —— 请勿打扰",
    "The strip of light beneath the door goes dark. A voice says, very gently, “Your room is farther down.”":
      "门下的一线光熄灭了。一个声音温柔地说：“您的房间还在前面。”",
    "GUEST ACCOMMODATION / ROOM 307": "住客客房 / 307 号房",
    "Room 307 — your room": "307 号房 —— 您的房间",
    "Your key turns twice. The door opens onto a room that smells faintly of cedar and old rain.":
      "第一次没拧动，第二次门才开了。床头灯已经亮着。",
    "A single lamp is lit. Your slippers are beside the bed, in your size. The clock reads":
      "一盏灯亮着。床边摆着合您尺码的拖鞋，时钟显示",
    ". Through a gap in the curtains you see another corridor, exactly like the one outside.":
      "。从窗帘缝隙看出去，是另一条走廊，与门外那条一模一样。",
    "There is a worn notebook under the pillow. Its cover has your room number on it.":
      "枕头下有一本磨损的笔记本，封面上写着您的房号。",
    "Read the notebook →": "阅读笔记本 →",
    "Return to the corridor": "返回走廊",
    "Your quiet, warmly lit hotel room": "您那间安静、亮着暖灯的客房",
    "Room 309 — do not disturb": "309 号房 —— 请勿打扰",
    "A housekeeping card hangs from the handle. Its service date is tomorrow. The ink is still wet.":
      "门把上挂着清洁卡，日期是明天，墨迹却还没干。",
    "Room 311 — do not disturb": "311 号房 —— 请勿打扰",
    "Someone is mopping behind the door. You remember that every floor in this wing is carpeted.":
      "屋里传来拖地的声音。您记得，这一翼所有房间铺的都是地毯。",
    "UNLISTED ACCOMMODATION / 404": "未列出的客房 / 404",
    "Room 404": "404 号房",
    "The brass plate is cold. This room is not listed in any hotel brochure. There is no keyhole, only four tarnished number wheels.":
      "铜牌冰凉。这间房不在任何旅馆手册中。门上没有钥匙孔，只有四个失去光泽的数字转盘。",
    "The corridor has become very quiet. Behind the door, a clock ticks once.":
      "走廊变得格外安静。门后，时钟轻轻走了一下。",
    "Four-digit door code": "四位数字门锁密码",
    "Turn the lock →": "转动门锁 →",
    "Consult my notebook": "查阅我的笔记",
    "Recall the bedside card": "回想床头卡片",
    "— — — —": "— — — —",
    "Read the final departure record": "阅读最终离店记录",
    "DEPARTURE RECORD / ALL ACCOUNTS CLOSED": "结局 05 / 所有人已退房",
    "For the first time,": "走出酒店，",
    "morning.": "天已经亮了。",
    "The hotel no longer remembers you.": "所有人的退房手续都办好了。",
    "You carry the original book to the stair. The key remains on the desk. Behind you, the offered lock closes around nothing.":
      "你带着登记簿原件走向楼梯，没有拿桌上的钥匙。身后传来一声锁响。你没有回头。",
    "The guests cross quietly. David counts Ruth’s steps. Margaret leaves her empty cup on the last landing. Arthur folds the coat that has finally dried. Rowan unties the ribbon. Eleanor pauses for the name that has been missing from every version of this morning.":
      "大家沿着楼梯往外走。戴维扶着露丝，玛格丽特把空茶杯放在最后一级台阶上。阿瑟抱着终于晾干的外套，罗温解下手上的红缎带。埃莉诺站在门边，等着最后一个人。",
    "Walter comes down last. Without the uniform’s reflection, he looks old, exhausted, and entirely human. He signs beside his wife. The final departure field accepts its date.":
      "沃尔特最后走下来。他看上去很累，衬衫的领口已经磨破。他在妻子的名字旁签了字，补上最后一条退房日期。",
    "You step onto a road that continues in both directions. Behind you is an unoccupied building with a printed sign that someone has turned face down. There is no bell. No light remains at reception.":
      "走出门，外面是条普通的公路。回头望去，旅馆的灯已经全熄了，招牌倒扣在地上。你等了一会儿，再也没有听见前台的铃声。",
    "YOUR ACCOUNT: CLOSED": "退房手续：已完成",
    "ROOMS AWAITING RETURN: 0": "未退房住客：0",
    "NEXT GUEST: NONE": "后续预订：无",
    "A place can keep your memory without keeping you.": "这一次，您没有回头。",
    "Read the completed records": "阅读完整记录",
    "Return to the public hotel archive": "返回旅馆公开档案",
    "Settings & start a new stay": "设置与重新入住",
    "True ending remembered. Your records remain saved. To replay the lower chapter, start a new stay in Site Information. Earlier “release” endings now lead into this chapter when revisited.":
      "完整结局已保存，收集的资料仍可查看。想从头重玩，可在“网站说明”中清除进度；也可以只重看求职开场，不影响酒店存档。",
    "Guest registration": "住客登记",
    "Let us keep a room for you.": "为您留一间房。",
    "Please use a nickname. This is part of the story, not a real reservation.":
      "请使用昵称。这是故事的一部分，不是真实预订。",
    "Guest name": "住客姓名",
    "Arrival date": "抵达日期",
    "Length of stay": "入住晚数",
    "2 nights": "2 晚",
    "3 nights": "3 晚",
    "4 nights": "4 晚",
    "5 nights": "5 晚",
    "6 nights": "6 晚",
    "7 nights": "7 晚",
    "Room preference": "偏好房型",
    "I have read the": "我已阅读",
    "guest guidelines": "住客须知",
    "and agree to remain on the floors listed on my map.":
      "并同意只在住客地图列出的楼层活动。",
    "Collect my room key": "领取我的房间钥匙",
    "No payment, email, or personal identification is needed. Your registration stays on this device.":
      "无需付款、邮箱或身份证明。您的登记只保存在此设备中。",
    "The name on your invitation": "邀请函上的称呼",
    "Employee access": "员工入口",
    "For current Stillwater staff and the night porter. Guest services can be reached through reception.":
      "本入口供酒店员工使用。如需办理入住或咨询服务，请前往前台。",
    "Internal records / Authorized staff": "内部记录 / 已授权员工",
    "Night desk sign-in": "夜班前台登录",
    "Enter the four-digit access code from your induction card.":
      "请输入入职资料上的四位通行码。",
    "Staff access code": "员工通行码",
    "Open staff records →": "打开员工档案 →",
    "Forgotten the code? Mr. Vale’s old instruction still applies: “Opening day. Month first.” The date is preserved in our public history.":
      "通行码提示：取酒店开业日期，按月份、日期排列。开业日期可在“旅馆往事”中查到。",
    "This is a story puzzle, not a real account or authentication system.":
      "这是剧情谜题，不是真实账号或身份验证系统。",
    "Consult the hotel history →": "查阅旅馆往事 →",
    "Four digits": "四位数字",
    "This floor is not listed.": "这一层，不在目录里。",
    "The directory does not show a way down. The story must reach the service stair before the lower register can answer.":
      "目前还不能进入地下。请先收集六份资料，再从 404 号房走到员工楼梯。",
    "Return to your records →": "返回您的记录 →",
    "An unregistered guest": "尚未登记",
    "0 of 6 records recovered. Take your time. The small details are usually the ones worth keeping.":
      "已找回 0 / 6 条记录。慢慢来，越是不起眼的细节，越值得留心。",
    "A missing piece": "还没找到这份资料",
    "Read the guest guidelines or the diary in Room 307.":
      "阅读住客须知，或 307 号房里的日记。",
    "Look carefully at Camera 02 in the security office.":
      "仔细检查安保办公室的 02 号监控。",
    "Read the loose page in the guestbook.": "阅读留言簿中的散页。",
    "Examine the opening-night ledger in Our History.":
      "在旅馆往事中查看开业之夜的登记簿。",
    "Find the maintenance log in the employee archive.":
      "在员工档案中寻找维修日志。",
    "Open Returned Correspondence in the employee archive.":
      "打开员工档案中的退回信件。",
    "Storage is unavailable. You can still explore in this tab.":
      "浏览器无法保存数据。您仍可在此标签页继续探索。",
    "Keep this in my notebook": "记入我的笔记",
    "A familiar place, every time": "安心入住，舒适相伴",
    "Copy the reverse-side note": "记下背面的提示",
    "Copy the opening-night record": "抄录开业之夜的记录",
    "Record the service-stair procedure": "记录员工楼梯操作流程",
    "Keep Eleanor’s letter": "保存埃莉诺的信",
    "Record the time in the notebook": "记下笔记中的时间",
    "The last checkout — rejected": "退房失败",
    "For the first time, morning": "走出酒店",
    "The public record was only the first layer.":
      "上面的资料之外，地下还有另一套记录。",
    "The public record is complete. The service stair is ready.":
      "六份资料已经收集齐，可以前往员工楼梯。",
    "Take your time. The small details are usually the ones worth keeping.":
      "有些线索藏在日常通知里，没头绪时可以回去翻翻。",
    "A fresh page. Welcome to your first stay.":
      "崭新的一页。欢迎您第一次来到这里。",
    "The archive is locked.": "档案室已锁定。",
    "A living, registered guest must complete all six records first.":
      "请先完成入住登记，并收集齐六份资料。",
    "Ambient sound is not supported here. You can continue without it.":
      "此浏览器暂不支持环境音，您仍可继续探索。",
    "WEST CORRIDOR / LEVEL 03": "西侧走廊 / 三层",
    "Save the anomalous frame": "保存异常画面",
    "The Residence is on our original third floor. Guests are asked to keep the bedside card and their room key close at hand. The view is particularly consistent.":
      "长住套间位于旅馆最初的三层。请将床头卡与钥匙放在触手可及之处。这里的窗外景色，格外稳定。",
    "Our team will prepare your room before you arrive. Please note that final room assignments are made at reception.":
      "我们会在您抵达前准备好客房。具体房号，由前台最终安排。",
    "A key is waiting for you": "有一把钥匙，正在等您",
    "This accommodation is currently unavailable.": "该客房暂不开放。",
    "A choice of departures": "几种离开的方式",
    "The record is complete. You recognize the brass disconnect behind the clock. The original register lies open beside it, Eleanor’s signed checkout slip between its pages. There is still time to bring the others.":
      "记录已补齐。您认出了时钟后方的黄铜断路开关。原簿在旁边摊开，埃莉诺签好的退房单夹在书页之间。现在，带上其他人还来得及。",
    "Behind the reception clock, a seam in the wallpaper catches your eye. Something here is unfinished. Recover all six records and register as a guest to understand it.":
      "前台时钟后方，壁纸上的一道缝隙吸引了您的目光。还有事情没有完成。找回六条记录，并登记入住，才能理解它。",
    "GROUND FLOOR / AFTER QUIET HOURS": "一层 / 安静时段之后",
    "Please leave a name for the register.": "请在登记簿上留下一个名字。",
    "Your key is ready. Welcome to Room 307.":
      "登记成功，请领取 307 号房钥匙。",
    "Please leave both a name and a message.": "请同时填写姓名与留言。",
    "Your note is saved on this device. Nothing was sent or published.":
      "留言已保存在本设备。没有发送或发布任何内容。",
    "That number is not in our records. Please check your key or return to reception.":
      "我们的记录里没有这个房号。请核对钥匙，或返回前台。",
    "The lock does not move. What time did the bedside card ask you to remember?":
      "门锁没有转动。想想床头卡片让您记住了哪个时间？",
    "Night desk access granted. Please return every file.":
      "夜班前台访问已获准。请将每份档案放回原处。",
    "Code not recognized. Opening day, month first: consult Our History.":
      "通行码不正确。请查阅“旅馆往事”，将开业日期按月、日排列。",
    "Restore the lower switchboard after the failed checkout.":
      "退房失败后，恢复地下配电盘。",
    "Restore power, then find the breakfast radio station.":
      "恢复供电，再寻找早餐时的电台。",
    "Decode the dinner menu and open the sealed archive.":
      "解读晚餐菜单，打开封存的档案。",
    "Reconcile the staff photograph, roster, and missing ledger entry.":
      "核对员工照片、住客名册，以及被抹去的登记条目。",
    "Read the reversed message in the observation room.":
      "读出观察室里的镜面文字。",
    "Reconstruct the incident timeline at the lower checkout desk.":
      "在地下离店前台，还原事件的先后顺序。",
    "The line is not ready. Complete the preceding station first.":
      "请先完成上一项调查。",
    "LOWER REGISTER / VERIFIED RECORD": "地下前台 / 调查记录",
    "A second set of hands moves beneath yours. Try again.":
      "柜子里响了一声。您停下来，听见背后还有人呼吸。",
    "Finish the six hotel records and collect a room key first.":
      "请先补齐六条旅馆记录，并领取客房钥匙。",
    "A distorted silhouette watching from the dark reception desk":
      "从黑暗前台后注视着您的扭曲人影",
    "UNAUTHORIZED DEPARTURE / HOTEL RESPONSE": "未经批准的离店 / 旅馆回应",
    "WAITING FOR PREVIOUS STATION": "完成前一项后解锁",
    "Six stations must be restored before the final desk will accept a living signature.":
      "完成下方六项调查后，即可办理退房。",
    "Sudden visual effects enabled. Audio is controlled separately.":
      "突发画面已开启。声音仍由单独的开关控制。",
    "Sudden visual effects disabled. All puzzles remain playable.":
      "突发画面已关闭，所有谜题仍可正常游玩。",
    "Restore the missing name": "恢复被抹去的姓名",
    "Record the instruction": "记下纸条内容",
    "Restore all six lower stations before approaching the final desk.":
      "请恢复全部六个地下设备，再走向最终前台。",
    "The desk needs all twelve records and a registered living guest.":
      "请先完成入住登记，并收集全部十二份资料。",
    "All accounts closed. There are no guests waiting.":
      "退房完成。前台铃不再响了。",
    "The duplicate, the key, or the offered doors keep the circuit closed. Re-read the night audit and the reflected instruction.":
      "这套选择仍会让你回到酒店。请重新核对夜间报告和镜中纸条：该带哪本登记簿，要不要动钥匙，从哪里离开？",
    "The second supply answers": "地下设备恢复供电",
    "The bell rings once. Kitchen heat steadies, linen service answers, and the night desk begins counting. The receiver lights up. Under the switchboard, a hand withdraws into a socket too small to hold it.":
      "前台铃响了一下，四盏指示灯依次亮起，收音机也通了电。您松开开关时，柜子后面有东西缩了回去。",
    "The board rejects the sequence. Reception first, night desk last. The facilities card gives the full order.":
      "通电顺序不正确。先接通前台铃，最后接通夜班前台；中间两项请核对供电说明。",
    "A voice beneath the weather": "广播里传来另一个声音",
    "TRANSCRIPT / WSTL 88.7 FM: “Still overcast. Do not return to the desk. This is Rowan. The census box uses the kitchen cabinet word. Read the FIRST LETTER of each dinner course, in serving order. The hotel has removed a name, not a room.” A second voice begins reading your arrival date before the carrier drops.":
      "转录 / WSTL FM 88.7：“持续阴天。别回前台，我是罗温。名册盒使用厨房柜的密码。按上菜顺序，读出每道英文菜名的首字母。旅馆删除的是一个姓名，不是一间房。”载波断开前，另一个声音开始念您的抵达日期。",
    "Only static. Check the breakfast programme card in the hotel guide; the old receiver uses the same FM station.":
      "只有杂音。查看旅馆指南里的早餐节目卡，老接收机使用同一个 FM 频道。",
    "The five letters align. Inside is the uncropped photograph and a residents’ circular. One founder wears a 311 key. The relief porter is clearly marked 309. Restore the missing name, not the uniformed one.":
      "锁开了。盒子里放着照片原始标注和住客通知。创办人拿着 311 的钥匙，前台值班员的房号则是 309。要补的是那位创办人的姓名。",
    "The five beginnings do not align. Read the FIRST LETTER of each printed dinner course.":
      "密码不正确。请按上菜顺序，取每道英文菜名的首字母。",
    "WALTER VALE appears in the erased field. Something knocks from the inside of the ledger. You do not answer. A door beside the observation glass opens, and the figure beyond it lowers its head.":
      "被划掉的地方，出现了沃尔特·维尔的姓名。墙里传来两下敲击声，随后观察室的门开了。玻璃后面站着的人，正慢慢低下头。",
    "That name belongs to another entry. Compare the uncropped identification cards: PROPRIETOR / 311.":
      "姓名不匹配。请核对照片标注中“业主 / 311”对应的人，输入全名。",
    "DO NOT TURN THE KEY. The reflected card is a warning, not an invitation. The brass key has no place in the final discharge. You will need the original register and the service stair.":
      "DO NOT TURN THE KEY：不要转动钥匙。退房时要把钥匙留在桌上，带着登记簿原件，从员工楼梯离开。",
    "Read all characters from right to left. The instruction has five ordinary English words.":
      "从右向左读出全部字符。英文指令由五个常见单词组成，也可输入对应的中文指令。",
    "The days are put back in order": "日期顺序恢复了",
    "03 October: the doors opened. 04 October: the clocks stopped. 05 October: the first returned guest. The ledger accepts that a departure can follow an arrival. The desk is ready for an original signature.":
      "10 月 3 日开业，4 日时钟停摆，5 日首位住客返回。登记簿终于不再改动日期，前台打印出了一张退房表。",
    "The arrival must precede the interruption, and the first return comes last. The incident review preserves all three dates.":
      "顺序不对。先是酒店开业，接着时钟停摆，最后才有住客返回。可在事件报告中核对日期。",
    "The final discharge is complete.": "退房手续已完成。",
    "The first checkout was not the end. Continue in the lower register.":
      "刚才没能离开，还得去地下前台查清楚。",
    "One double bed": "一张双人床",
    "Private bath": "独立卫浴",
    "Writing desk": "书桌",
    "24-hour reception": "24 小时前台",
    "Request this room →": "预订此房型 →",
    "Guest guidelines": "住客须知",
    "Two single beds": "两张单人床",
    "Sitting area": "休息区",
    "Tea service": "茶饮服务",
    "Third floor": "三层",
    "Extended stays": "适合长住",
    "Turn-down service": "夜间整理",
    "The lock clicks. Beyond the door is a small lift with no buttons. It descends for a long time. When it opens, you are back in the lobby. This time, nobody is behind the desk.":
      "门锁轻响。门后是一座没有按钮的小电梯。它下行了很久，再打开时，您又站在大堂里。这一次，前台后面没有人。",
    "The red EXIT": "红色 EXIT 出口",
    "A rusted iron door. Cold air moves beneath it, carrying the smell of rain on a road you almost remember.":
      "一扇生锈的铁门。冰凉空气从门下流过，带着一条您几乎记得的道路上，雨水的气味。",
    "Follow the red sign →": "跟随红色标识 →",
    "The white door": "白色的门",
    "Warm light. A voice you have missed. “Your room is waiting,” it says. “You do not have to go anywhere.”":
      "温暖的光，以及您一直想念的声音。“您的房间一直在等您。”它说，“您不必去任何地方。”",
    "Step into the white light →": "走进白色的光 →",
    "Take the register & cut the supply →": "带上登记簿，切断电源 →",
    "Review what you remember →": "回想您记住的线索 →",
    "LINE OPEN →": "线路已接通 →",
    "CHECKOUT REJECTED": "退房失败",
    "DEPARTURE RECORD: FALSE": "离店记录：无效",
    "YOU LEFT": "您还",
    "ONE NAME": "留下了",
    "BEHIND.": "一个姓名。",
    "IT WAS NOT ELEANOR WHO FOLLOWED YOU.": "跟着您的那个人，不是埃莉诺。",
    "The stair ends where it began. The seven names in your register rearrange themselves. Behind the desk, the porter raises a hand. You count too many fingers.":
      "走完最后一级台阶，您又回到了前台。前台值班员抬手示意您过来。那只手搭在柜台上，手指数目不对。",
    "The polite website is gone. Something underneath it has noticed you.":
      "屏幕黑了一下。再亮起来时，欢迎词被这几行字替换了。",
    "PUBLIC SITE .......... OFFLINE": "酒店官网 .......... 离线",
    "SECOND SUPPLY ........ ACTIVE": "第二路电源 ........ 活动中",
    "YOUR CHECKOUT ........ REVOKED": "您的离店 .......... 已撤销",
    "LOWER REGISTER ....... LISTENING": "地下前台 ........ 等待接待",
    "Continue below →": "继续向下 →",
    "Disable sudden visual effects": "关闭突发惊吓画面",
    "This is the second chapter, not a real browser or system error. Sound remains off unless you enabled it.":
      "这是第二章剧情，不是真实浏览器或系统故障。除非您已手动开启，否则声音仍保持关闭。",
    "LOWER REGISTER / RECORD VERIFIED": "地下前台 / 调查完成",
    "Progress saved. This station will remain open when you return.":
      "进度已保存。之后可以随时查看本次记录，或重新操作。",
    "Continue to the next station →": "继续调查下一项 →",
    "Return to lower register": "返回地下前台",
    "The census box opens": "名册盒打开了",
    "Entry 311 restored": "311 号房的姓名已补齐",
    "The key stays still": "记住了钥匙的警告",
    "Prepare the final discharge →": "前往办理退房 →",
    "Ambient sound: on": "环境音：开启",
    "Sudden visual effects: off": "突发惊吓画面：关闭",
    English: "English",
    中文: "中文",
    "A third possibility": "第三种可能",
    "Collect your room key": "领取客房钥匙",
    "A key is waiting": "钥匙正在等您",
    "Read the true ending": "阅读真实结局",
    "Enable sudden visual effects": "开启突发惊吓画面",
    "CLOCK FAILURE": "时钟停摆",
    OPENING: "开业",
    "FIRST RETURN": "首次返回",
    "· A note from this visit": " · 本次到访的留言",
    "A note from this visit": "本次到访的留言",
    "Saved on this device": "保存在本设备中",
    "The door will not open without your key. A small paper tag on the handle says: “Please collect at reception. Your room has already been prepared.”":
      "没有钥匙，门打不开。把手上挂着一张纸签：“请到前台领取。您的房间已经准备好。”",
    "Stay a little outside town, with quiet rooms, a late-night desk, and breakfast downstairs.":
      "位于静水镇老路旁，提供安静客房、每日早餐和 24 小时前台服务。",
    "Settle in for the night.": "今晚，就在这里歇歇脚。",
    "Stillwater is a small, family-run hotel on the old road into town. We have kept the original staircase and most of the furniture. If you arrive late, ring the bell at reception; someone will come down.":
      "静水旅馆在进镇的老路边，由一家人经营。楼梯和大部分家具还是以前的。晚到的客人请按前台铃，会有人下来接待。",
    "We welcome overnight visitors and longer stays. Let reception know if you need an extra blanket or a quiet room.":
      "短住或长住均可安排。如需额外毯子或安静房间，请联系前台。",
    "Choose a double, a twin, or a room for a longer stay. The rooms have been updated over the years, but we have kept their original furniture where we can.":
      "大床房、双床房和长住客房均可申请。房间陆续翻修过，能留下的老家具，我们尽量保留了。",
    "Find a room that suits your stay.": "选一间合适的客房。",
    "A double bed, bedside lamps, and a small desk. These rooms are in the original building, a short walk from reception.":
      "一张双人床、床头灯和一张小书桌。客房位于老楼，离前台不远。",
    "Two separate beds with a shared bedside table, a sitting area, and tea-making facilities. Suitable for friends or family traveling together.":
      "两张独立单人床，配有床头柜、休息区和茶饮用品，适合朋友或家人同行。",
    "A larger room at the quiet end of the third floor, with a separate entrance area and space for luggage. Ask reception about longer stays.":
      "位于三层走廊尽头，空间较大，有独立门厅和放行李的位置。长住安排可向前台咨询。",
    "We have noted your room preference. Only Room 307 is available in the west wing tonight; its key is ready at reception.":
      "您的房型偏好已记下。今晚西翼只开放 307 号房，钥匙已放在前台。",
    "Some families have stayed with us for years. Their names appear in several volumes of the guestbook. We keep the older books at reception for anyone who would like to look through them.":
      "有些客人来过许多次，几本留言簿里都能找到他们的名字。旧簿子放在前台，想看可以借阅。",
    "The east wing adds guest rooms and a covered courtyard. The same carpet and door fittings are used throughout. Please check the number on your key; the two corridors look very similar.":
      "东翼扩建后增加了客房和带顶的庭院，两边用了同样的地毯和门饰。走廊很像，请以钥匙上的房号为准。",
    "Restoring the reception clock.": "前台时钟修复。",
    "The brass clock has hung above reception since opening. In 2003 its case and dial were restored. The night porter keeps the repair invoices and the older maintenance book.":
      "前台的黄铜时钟从开业时就挂在那里。2003 年修复过外壳和表盘，维修收据及旧日志由夜班前台保管。",
    "“I booked for two nights. At breakfast the waiter brought my tea without milk, just how I like it. Nice touch, though I am fairly sure nobody asked.”":
      "“订了两晚。早餐时服务员直接端来一杯不加奶的茶，正合我的口味。挺周到的，不过我记得没人问过我喝什么。”",
    "“We stayed here on our honeymoon in 1987. The wallpaper is still the same. So is the man at reception, which Ruth noticed before I did.”":
      "“1987 年蜜月时住过这里。壁纸没换，前台那个人也没换。露丝先认出了他，我还以为自己记错了。”",
    "“I keep seeing the same bird on the railing. Same place, same way round. Six mornings now. I asked the cleaner and she stopped making the bed.”":
      "“栏杆上总停着同一只鸟，位置和朝向都没变，连续六个早上了。我问保洁是不是她喂的，她忽然就不铺床了。”",
    "The reading room is in the east wing. The courtyard opens from the lobby, beside the fern. We have also kept a few old notices here; some guests ask for them when the lights go out.":
      "阅览室在东翼，庭院入口在大堂那盆蕨类旁边。这里也收了几份旧通知，停电时经常有客人来找。",
    "Meal times, room facilities, and a few notices from reception. Keep the service sheets nearby if you plan to explore the older part of the building.":
      "这里有用餐时间、设施说明和前台通知。若要去老楼走走，建议先看一眼服务说明。",
    "The west end of the third floor is closed for repairs. Please use the rooms marked on your key card and ask reception before entering the work area.":
      "三层西端正在维修。请按房卡上的标记通行，不要自行进入施工区域。",
    "Do not sign the clean book they offer you. The door lock uses the time on the stopped clock. Neither exit at the desk is as simple as it looks.":
      "别在他们递来的新簿子上签字。门锁用的是停钟的时间，前台那两个出口也不可靠。",
    "Tea has soaked through one corner of the page. Most of the names have faded. The word “Waiting” beside Room 307 is still wet.":
      "纸页一角被茶水浸透了，大多数姓名都已褪色。只有 307 旁边的“等候中”，墨迹还没干。",
    "04 October 1987, 04:04.": "1987 年 10 月 4 日，04:04。",
    "05 October, same time.": "10 月 5 日，同一时刻。",
    "All room clocks stopped at 04:04. The west corridor appears longer than the exterior wall. We isolated the street supply, but the corridor lights stayed on.":
      "客房时钟全部停在 04:04。西侧走廊比外墙长。已切断街道进线，走廊灯仍亮着。",
    "Found another cable behind the reception clock. A brass lever is marked STILLWATER. When I pulled it, a doorway appeared beside the desk. It disappeared as soon as I let go.":
      "在前台时钟后找到另一根电缆，黄铜扳杆上标着 STILLWATER。拉下后，柜台旁露出一道门；松手，门就不见了。",
    "The red door and the white door both lead back inside. The service stair was the only route that did not appear on the original plan.":
      "红门和白门都通回旅馆。员工楼梯是唯一没出现在原图纸上的通路。",
    "My name is Eleanor Vale. Walter and I opened this hotel together. When the first guests went missing, I kept their rooms ready. I thought they might come back. They did, but none of them could leave again.":
      "我是埃莉诺·维尔，这间旅馆是我和沃尔特一起开的。最早有人失踪时，我一直没动他们的房间，想着人也许会回来。后来他们真的回来了，可谁也出不去了。",
    "The notebook is tucked inside the pillowcase. Almost every page has been torn out. The ones left all begin with “Room 307.”":
      "笔记本塞在枕套里，大部分纸页都被撕掉了。剩下的每页开头，都写着“307”。",
    "I stopped counting the nights.": "后来，我不再数住了几晚。",
    "The lobby recording is from earlier in the day. The corridor feed is still running, but its time stamp has not changed.":
      "大堂画面是白天的录像。走廊监控还在运行，右上角的时间却一直没变。",
    "The lift doors open onto the west corridor again. Tape covers the fourth-floor button. Someone has written “DO NOT COMPLETE THE CIRCUIT.” on it.":
      "电梯门打开，外面还是西侧走廊。四层按钮被胶带封住，上面写着“不要闭合回路”。",
    "Margaret would like her teapot returned to the dining room. Arthur can mend coat linings; leave them at 301. David and Ruth have asked us to stop putting their anniversary on the noticeboard. We have announced it three times this week.":
      "玛格丽特的茶壶请送回餐厅。阿瑟会补外套内衬，需要的话送到 301。戴维和露丝让我们别再把他们的纪念日写上公告栏——这周已经通知三次了。",
    "Use the opening-night records to check names. The room labels have changed several times, but the first register has not.":
      "核对姓名请用开业之夜的记录。门牌换过几轮，最早那本登记簿没有改过。",
    "Unlabelled cassette": "没有标签的录音带",
    "The black coat is still wet after three days in the drying room. There is a name sewn into the lining. Please do not read it aloud; the last person who did heard an answer from 311.":
      "黑外套在烘干室放了三天还是湿的。内衬缝着姓名，请不要念出来。上次有人念了，311 里传来了应答。",
    "The cassette was found outside 311. The voice on it sounds like the person holding the recorder, even when the tape has not been changed.":
      "录音带是在 311 门外找到的。不管谁拿着播放器，放出来的都像那个人自己的声音，换人时并没有换磁带。",
    "The photographer noted a fourth person in the reception glass. None of the three staff members could identify them. The negative has the same outline.":
      "摄影师在记录中提到，前台玻璃里还有第四个人。三名员工都不认识他，底片上也能看见同样的轮廓。",
    "The screen goes black. When it comes back, the welcome message has been replaced by these lines.":
      "屏幕黑了一下。再亮起来时，欢迎词被这几行字替换了。",
    "You are back at the desk. The checkout slip is blank again, and somebody has crossed out Room 311 in the book. A second register is wedged under the counter. Its last line has never been filled in.":
      "您又站在前台。退房单重新变成空白，簿子上的 311 被人划掉了。柜台下卡着另一本登记簿，最后一行一直没填。",
    "All six stations are working. Bring the correct book to the desk, follow the warning about the key, and choose your route out.":
      "六项调查已经完成。带上登记簿原件，记住镜中关于钥匙的警告，再决定从哪里离开。",
    "A clean register and a brass key have been placed on the desk. Beside them is a checkout form. The name field has already been filled in with your name.":
      "桌上放着一本干净的登记簿和一把黄铜钥匙，旁边是一张退房表。姓名栏已经替您填好了。",
    "The dates are back in order": "日期顺序恢复了",
    "03 October: opening. 04 October: clock failure. 05 October: first return. The register stops changing the dates. A checkout form prints behind the desk.":
      "10 月 3 日开业，4 日时钟停摆，5 日首位住客返回。登记簿终于不再改动日期，前台打印出了一张退房表。",
    "This time, you do not look back.": "这一次，你沿着公路走了下去。",
    "You reach for the uniform. The next thing you notice is a tight collar against your neck. The register is open in front of you. Someone is ringing the bell.":
      "您伸手去拿制服。再回过神，领口已经紧贴着脖子。面前的登记簿摊着，有人在按铃。",
    "Your checkout slip has been stamped “NIGHT STAFF.” Your room key is now hanging on the board behind you.":
      "退房单上盖了一个“夜班员工”的章。您的房间钥匙，已经挂在身后的钥匙板上。",
    "You step into the light. For a moment you can smell the soap from your bathroom at home.":
      "您走进光里。有那么一瞬间，闻到了家里浴室香皂的味道。",
    "The key sticks on the first turn. On the second, the door opens. The bedside lamp is already on.":
      "第一次没拧动，第二次门才开了。床头灯已经亮着。",
    "You look back at the plan. It still shows five.":
      "您回头看了眼平面图，上面还是只有五间。",
    "You turn around. There is a field where the hotel should be.":
      "您转过身，旅馆原来的位置只剩下一片空地。",
    "The face in the glass is looking straight at the lens. The camera is supposed to be behind it.":
      "玻璃里的脸正对着镜头。可摄像机本该在它身后。",
    "Your account: closed": "退房手续：已完成",
    "The record is complete. You can now find another way out.":
      "资料已经齐了，去看看走廊尽头那扇门。",
    "Original photograph captions": "开业照片背面的标注",
    "This station is complete. Your record is saved.":
      "这项调查已完成，相关资料已保存。",
    "Try this puzzle again →": "重新操作这一关 →",
    "Previous document": "返回上一份资料",
    "← Back": "← 返回",
    "Hotel photographs and artwork": "照片与美术素材",
    "Photo credits": "图片来源",
    "View photograph sources and licenses →": "查看照片来源与授权 →",
    "Real hotel photographs are used as fictional scenery. The hotels and photographers are not connected with this story. The horror portraits are generated creature illustrations.":
      "酒店场景使用真实照片，拍摄地点及摄影师与本故事无关。惊吓中的怪物为生成插图，不是真实酒店员工或住客。",
    "The original photograph is damaged. These captions were copied from its mount before the right-hand strip was removed.":
      "原照片已经损坏。以下文字抄自照片背面的标注，右侧那一条当时还没被剪掉。",
    "CAPTION COPY / ORIGINAL NEGATIVE DAMAGED": "背面标注抄件 / 原底片已损坏",
    Photographer: "摄影师",
    Source: "来源",
    License: "授权",
    "An old hotel lobby with a wooden staircase and chandeliers":
      "有木质楼梯与吊灯的老酒店大堂",
    "A real hotel double room with dark wooden furniture":
      "实拍大床房，配有深色木质家具",
    "A real hotel twin room with two single beds":
      "实拍双床房，摆有两张独立单人床",
    "A real hotel room with a double bed and a sitting area":
      "实拍长住客房，配有双人床与休息区",
    "Hotel photographs are real; the characters, story, and bookings are fictional.":
      "酒店照片为实拍，人物、剧情和预订都是虚构的。",
    "Your nickname, registration, notes, and progress stay in this browser. They are not sent to a server. Clearing site data erases them. The employee keypad is a fictional puzzle, not real security. Hotel photographs are real; the characters, story, and bookings are fictional.":
      "昵称、登记、留言和进度只保存在这个浏览器里。清除网站数据会删除进度。员工入口只是剧情谜题，不是真实账号。酒店照片为实拍，人物、剧情和预订都是虚构的。",
    "PHOTO CREDITS / SOURCES & LICENSES": "图片来源 / 摄影与授权",
    "Source ↗": "原始页面 ↗",
    "Public domain": "公有领域",
    "Lobby Stanley Lodge Estes Park Colorado 2024.jpg":
      "Lobby Stanley Lodge Estes Park Colorado 2024.jpg",
    "Corridor Stanley Hotel Estes Park Colorado 2024.jpg":
      "Corridor Stanley Hotel Estes Park Colorado 2024.jpg",
    "Room Stanley Hotel Estes Park Colorado 2024.jpg":
      "Room Stanley Hotel Estes Park Colorado 2024.jpg",
    "Deluxe Room - Twin beds.jpg": "Deluxe Room - Twin beds.jpg",
    "Hotel Room Chicago Hilton2.jpg": "Hotel Room Chicago Hilton2.jpg",
    "A gaunt night porter with a distorted face": "面部变形、瘦削的夜班前台",
    "A veiled figure with a dark open mouth behind the glass":
      "玻璃后蒙着面纱、张着黑洞般嘴巴的人影",
    "An unfamiliar face and long fingers pressed against observation glass":
      "贴在观察室玻璃上的陌生面孔与细长手指",
    "The woman on the landing": "电梯口的女人",
    "The wrong reflection": "镜子里不是您",
    "The figure wears the same jacket as the night porter. When it turns, its mouth keeps moving after the rest of its face has stopped.":
      "那件外套和夜班前台的一样。它转过头来，脸已经不动了，嘴却还在慢慢张开。",
    "A woman stands between the lift doors. Her veil catches on something outside the frame. The doors close, but her face stays on the screen.":
      "一个女人站在电梯门中间，面纱像被画面外的什么东西勾住了。门合上了，她的脸却还留在屏幕上。",
    "You move the pointer. The hand in the glass moves first. You take your hand off the mouse. The other hand keeps going.":
      "您刚想移动鼠标，玻璃里的手已经先动了。您把手拿开，它却没有停。",
    "Review the next anomalous frame →": "检查下一帧异常画面 →",
    "DO NOT": "不要",
    "LET HER IN.": "让她进来。",
    "IT MOVES": "它比您",
    "BEFORE YOU DO.": "先动了一步。",
    "CAM 03 / THE LIFT HAS NOT MOVED": "监控 03 / 电梯没有移动",
    "OBSERVATION FEED / DO NOT TOUCH THE GLASS": "观察室画面 / 不要碰玻璃",
    "Second supply / manual restoration": "地下电源 / 手动恢复",
    "Stay and take the night shift": "不走了，留下值夜班",
    "Replay the job search": "重看求职开场",
    "Replay the job search without clearing progress":
      "重看求职开场（保留当前进度）",
    "Night receptionist / Applicant information": "夜班前台招聘 / 应聘须知",
    "Before your first shift": "请先到前台报到",
    "Room and board are included. Report to reception, register under your name, and collect the temporary key to Room 307. Please read the guest guidelines before starting work. Your staff access code will be issued after induction.":
      "本岗位提供食宿。请先到前台登记，领取 307 号房的临时住宿钥匙，并阅读入住须知。员工通行码将在入职说明中提供。",
    "Report to reception →": "到前台报到 →",
    "Here for the night receptionist vacancy? Please register at reception first. Room 307 is reserved for your temporary accommodation; this is not a staff contract.":
      "应聘夜班前台的人员，请先登记报到。旅馆提供 307 号房作为临时住宿；本次登记不代表已办理入职。",
    "Your arrival for the night receptionist interview has been noted. Room 307 is your temporary accommodation. Read the bedside card and look through the hotel information before your shift.":
      "报到信息已登记。307 号房为您的临时住宿，请先阅读床头卡片，熟悉楼层及旅馆资料，等候夜班交接。",
    "Outside, it is morning.": "走出酒店时，天已经亮了。",
    "Need a hint?": "需要一点提示？",
    "Open one hint at a time. Later hints reveal more of the answer.":
      "建议先看第一条。后面的提示会逐步说明解法，第三条会直接给出答案。",
    "Hint 1 / Where to look": "提示一：去哪找线索",
    "Hint 2 / How to read it": "提示二：怎么解读",
    "Hint 3 / Show the answer": "提示三：查看答案",
    "Selected circuits": "已选线路",
    "Selected events": "已选事件",
    "Undo last selection": "撤回上一步",
    "Or enter a frequency / MHz": "也可直接输入频率 / MHz",
    "Use the facilities sheet in the hotel guide. Match departments to circuit numbers.":
      "查看旅馆指南中的供电说明，将部门名称对应到线路编号。",
    "The bell comes first, followed by the kitchen and linen service. The night desk is last.":
      "先接通前台铃，再接通厨房和布草间，最后接通夜班前台。",
    "Select circuits 3, 1, 4, 2, then energize the sequence.":
      "依次选择 3、1、4、2，再点击“按所选顺序通电”。",
    "The dining room kept a card for the station played at breakfast.":
      "餐厅保留着一张早餐广播节目单。",
    "Read the frequency printed beside WSTL on the programme card.":
      "找到节目单上的 WSTL，旁边印着广播频率。",
    "Tune the receiver to 88.7 MHz. Sound is not needed.":
      "把频率调到 88.7 MHz，再确认接收。不开声音也能完成。",
    "The radio tells you which part of the menu matters.":
      "广播的文字记录提到了菜单里要看的位置。",
    "Read the first English letter of each course, from top to bottom.":
      "按上菜顺序，从上往下取每道英文菜名的首字母。",
    "The five initials are S, T, I, L, L.":
      "五个字母依次为 S、T、I、L、L，合起来是 STILL。",
    "Compare the original photograph captions with the opening-night register.":
      "把开业照片背面的标注，与开业当晚的登记簿对照。",
    "You need the founder assigned to Room 311, rather than the porter in Room 309.":
      "要找的是住在 311 的创办人，不是住在 309 的代班前台。",
    "Enter Walter Vale, or 沃尔特·维尔 in the Chinese edition.":
      "输入“沃尔特·维尔”或 Walter Vale。",
    "The card is reflected. Its letters are in reverse order.":
      "这是一张镜像纸条，字母的顺序是反的。",
    "Read from the right-hand end and separate the result into ordinary words.":
      "从最右边开始往左读，再把连续字母分成几个单词。",
    "The warning is DO NOT TURN THE KEY. Chinese answers are also accepted.":
      "纸条写的是 DO NOT TURN THE KEY，输入“不要转动钥匙”也可以。",
    "Use the dates in the incident report; the camera timestamps are frozen.":
      "查看事件报告中的日期。监控时间一直没变，不能用来排序。",
    "Opening day is October 3. The clock failure is the following day.":
      "10 月 3 日开业，第二天时钟停摆，再往后才是住客返回。",
    "Choose opening, clock failure, then the first guest’s return.":
      "依次选择“酒店开业”“所有时钟停摆”“第一位住客返回”。",
    "Compare the night audit with the warning from the mirror.":
      "把夜间核查报告与镜中纸条的警告放在一起看。",
    "A new register would start the cycle again. Keep the original, and remember what the warning says about the key.":
      "新登记簿会让一切重新开始。带上原件，并记住纸条让你如何处理钥匙。",
    "Present the original register, leave the key untouched, and use the service stair.":
      "带上登记簿原件，不动钥匙，走员工楼梯。",
    "Night audit": "夜间核查",
    "Walter’s restored name unlocks the observation room. Behind the glass, someone wearing your clothes holds up a printed card. They are not perfectly still.":
      "补上沃尔特的名字后，观察室的门开了。玻璃后有人穿着和你一样的衣服，举着一张纸条。你停住时，对方还在动。",
    "The Residence is on our original third floor. Guests are asked to keep the bedside card and key within easy reach. The view from these windows is remarkably consistent.":
      "长住套间位于三层。请妥善保管钥匙，并阅读床头卡片。窗外景色一直没变；如有疑问，请联系前台。",
    "The hotel, people, correspondence, keypad, bookings, apparent site compromise, and error messages are fictional.":
      "酒店、招聘岗位、人物、预订及页面异常均为虚构剧情。",
    "Night surveillance shift": "夜班监控值班",
    "Read Dylan’s message →": "阅读迪伦的求助留言 →",
    "Attend the night interview →": "与夜班主管交谈 →",
    "The unanswered message": "未能送达的求助",
    "The last shift": "最后一班",
    "Real hotel photographs are used as fictional scenery. The hotels and photographers are not connected with this story. The horror portraits and Dylan’s sealed-room scene are generated fictional illustrations.":
      "酒店实拍照片用于虚构场景，现实酒店与摄影师均与剧情无关。惊吓角色及迪伦房间的画面为原创生成插图。",
    "This clears the Dylan and surveillance side stories, their notes and patrol logs, both original chapters, registration, local messages, archive access and discovered endings. Your visual-effects preference is retained; audio will be switched off.":
      "这会清除迪伦与监控室支线的纸条、对话、巡检，以及原有两章的登记、线索、留言、档案权限和结局。突发惊吓设置会保留，声音将关闭。",
    "Attend the night handover →": "前往夜班交接 →",
    "Contact support": "联系客服",
    "Read the note beside the door →": "查看门边的便条 →",
  };
  Object.assign(dictionary, {
    "Record unavailable.": "暂时无法调阅此记录。",
    "This retained record is not associated with your current stay. Reception can help you find the correct registration.": "这份留存记录尚未关联到本次入住。您可以返回前台核对登记。",
    "The original register is open. A living guest’s signature is required. Behind the desk, the empty uniform turns toward you.": "登记簿原件已经翻开，需要一位仍活着的住客签名。柜台后，那套空制服转向了你。",
    "Open equipment record →": "查看设备记录 →",
    "Open the powered receiver": "查看已通电的接收机",
    "Open the kitchen cabinet file": "查看厨房柜锁资料",
    "Read entry 311": "查看 311 号登记",
    "Open the observation room": "打开观察室",
    "Review the dated incident file": "核对事件原件",

    "View source record →": "查看原始资料 →",
    "Please use a nickname. This local registration is a simulation; no real booking is made.": "请使用昵称。本登记仅在本设备模拟，不会产生真实预订。",
    "Contact support →": "联系客服 →",
    "Contact supervisor →": "联系主管 →",
    "Meet our management team →": "了解管理团队 →",
    "Surveillance room": "监控室",
    "Surveillance →": "监控室 →",
    "About the hotel": "关于静水旅馆",
    "6 September 2026": "2026 年 9 月 6 日",
    "24 m² · Up to 2 guests": "24 平方米 · 可住 2 人",
    "28 m² · Up to 2 guests": "28 平方米 · 可住 2 人",
    "38 m² · Up to 2 guests": "38 平方米 · 可住 2 人",
    "Double bed · Sitting area · Tea service": "双人床 · 休息区 · 茶饮设施",
    "Rooms for a comfortable stay.": "选择适合您的客房。",
    "Double rooms, twin rooms and spacious accommodation for longer stays. Choose the space that suits your visit.": "从双人房、双床房到长住套间，按您的出行需要选择。",
    "Everything you need to settle in.": "入住设施与服务",
    "Complimentary Wi-Fi": "免费 Wi-Fi",
    "Breakfast is served daily from 7:00 to 9:00 in the ground-floor dining room. Please let reception know if you need extra bedding or assistance with a longer stay.": "早餐供应时间为每日 7:00—9:00，地点在一层餐厅。如需加配床品或安排长住，请联系前台。",
    "View all facilities & services →": "查看全部设施与服务 →",
    "Ready to plan your stay?": "安排您的入住",
    "Choose your preferred room type and arrival date. Reception will confirm your room assignment.": "请选择意向房型和到店日期，具体房间由前台为您安排。",
    "Already checked in?": "已办理入住？",
    "View the floor directory →": "查看楼层指引 →",
    "A family hotel since 1987.": "始于 1987 年的家庭旅馆。",
    "The east wing adds more guest rooms and a covered courtyard, with furnishings chosen to complement the original building.": "东翼新增客房和带顶庭院，延续主楼的家具与装饰风格。",
    "A phased refurbishment begins on the third floor, preserving the original woodwork while updating guest facilities.": "三层开始分区翻新，在保留原有木作的同时更新客房设施。",
    "We continue to welcome short breaks, family visits and longer stays. Read a few recent guest reviews, or ask reception about our hotel collection.": "无论短途小住、家庭出行，还是长住休憩，我们都期待您的到来。您可以看看住客评价，也可以向前台了解旅馆的旧藏资料。",
    "Read guest reviews →": "查看住客评价 →",
    "A page from the first evening of business, reproduced from the family collection.": "经创办人家属许可，展示开业当晚的登记簿复印页。",
    "Sections of the third floor are being refurbished. Reception can advise on current access and help with room requests.": "三层部分区域正在维护。如需了解通行安排或调整客房，请联系前台。",
    "Stillwater is a small, family-run hotel on the old road into town. We have kept the original staircase and much of the furniture. Short visits and longer stays are both welcome.": "静水旅馆坐落在进镇的老路旁，由一家人经营至今。旅馆保留了原有楼梯和许多家具，短住、长住均可安排。",
    "Browse the hotel collection": "查看旅馆旧藏",
    "Selected service records, residents’ notices and photographs from the hotel collection.": "历年的设备资料、长住客通知和旅馆照片。",
    "Service circuit sheet →": "设备线路表 →",
    "Residents’ notices →": "长住客通知 →",
    "View contact sheet 001-B →": "查看照片底稿 001-B →",
    "“A comfortable room and a good breakfast. The team helped with our late arrival, and we slept well.”": "“房间住着很舒服，早餐也不错。我们到得晚，前台提前安排好了入住，晚上休息得很好。”",
    "“We enjoyed the courtyard and the old furniture in the lobby. An easy place to spend a quiet weekend.”": "“喜欢庭院和大堂里的老家具。在这里过了一个安静、轻松的周末。”",
    "L. Chen · Twin room": "L. Chen · 双床房",
    "“The twin room had enough space for our bags. Reception arranged an extra blanket when we asked.”": "“双床房放行李也不拥挤，向前台要了条毯子，很快就送来了。”",
    "Earlier guestbook entries": "往期留言",
    "Pages retained from the reception guestbook. Some entries include a separate handwritten note.": "前台保存的旧留言页，部分附有手写便条。",
    "Guest reviews": "住客评价",
    "Read about recent stays, or leave a note about your visit.": "看看住客分享的入住感受，也欢迎留下您的意见。",
    "Share your experience": "分享入住体验",
    "How was your stay?": "您的入住体验如何？",
    "Your comments help us improve our rooms and service.": "欢迎对客房和服务提出意见。",
    "Tell us about your stay…": "说说您的入住感受……",
    "About Stillwater": "了解静水旅馆",
    "Our story": "我们的故事",
    "Meet the family behind the hotel and browse photographs and records from our early years.": "认识旅馆的创办人，翻看早年的照片和旧藏资料。",
    "and understand the check-in arrangements.": "并已了解入住安排。",
    "Plan your stay.": "预订与入住",
    "Select your arrival date and preferred room type. Our front desk is staffed 24 hours a day.": "请选择到店日期和意向房型，前台全天为您服务。",
    "Check-in begins at 15:00. Please keep your room key with you, and contact reception if you need assistance during your stay.": "入住时间为 15:00 起。请妥善保管房间钥匙，入住期间如需帮助，请联系前台。",
    "Check-in information": "入住须知",
    "The Residence offers a separate entrance area and additional storage for longer stays. Please contact reception to discuss availability.": "长住套间设有独立入户区域和更多储物空间。长住安排及房态请咨询前台。",
    "Join our team": "加入我们",
    "Working at Stillwater": "在静水旅馆工作",
    "We are recruiting for an overnight hotel role. Speak to our night supervisor about the duties, shift hours and accommodation.": "旅馆现招聘夜班工作人员。岗位职责、班次和住宿安排，可向夜班主管咨询。",
    "Hotel operations · Night shift": "酒店运营 · 夜班",
    "Night-shift attendant": "夜班值班员",
    "Hours": "工作时间",
    "Accommodation": "住宿安排",
    "Temporary staff accommodation available": "提供临时员工住宿",
    "Department": "所属部门",
    "Night operations": "夜间运营",
    "Please confirm your duties and arrival arrangements with Reed before accepting the shift. Reception will help with your room registration.": "确认入职前，请先向里德主管了解工作内容和报到安排。住宿登记由前台协助办理。",
    "Contact supervisor": "联系主管",
    "Before you arrive": "报到前",
    "Learn about the people who look after the hotel, or contact reception with questions about your stay.": "您可以先了解旅馆的管理团队。如有住宿方面的问题，请联系前台。",
    "Meet our management team": "了解管理团队",
    "Contact support": "联系客服",
    "Go to registration →": "前往入住登记 →",
    "Dining": "餐饮服务",
    "Breakfast & dining": "早餐与用餐",
    "Breakfast is served in the ground-floor dining room, daily from 7:00 to 9:00. View meal information and our sample dinner menu.": "早餐供应时间为每日 7:00—9:00，地点在一层餐厅。可查看用餐说明及晚餐参考菜单。",
    "Reading room": "阅览室",
    "A quiet place to read": "安静的阅读空间",
    "Books, local histories and a writing desk in the east wing. Browse the reading-room information and lending records.": "东翼阅览室备有图书、地方志和书桌。可查看使用说明及借阅记录。",
    "Courtyard": "庭院",
    "Take a seat outside": "庭院小坐",
    "The courtyard is reached from the lobby, with seating beside the fountain. Read our garden and access information.": "从大堂可通往庭院，喷泉旁设有座椅。可查看庭院介绍及通行说明。",
    "Reception services": "前台服务",
    "Lost property": "失物招领",
    "Left something behind? Reception keeps a record of items handed in by guests and housekeeping.": "如有遗失物品，请联系前台。我们保存住客及客房部交来的物品记录。",
    "Facilities & services": "设施与服务",
    "During your stay": "入住期间",
    "Breakfast, shared spaces and practical information for your visit. Our reception team is available around the clock.": "了解早餐、公共空间及入住安排。前台全天为您提供帮助。",
    "Front desk": "前台服务",
    "24 hours": "24 小时",
    "Breakfast": "早餐",
    "Complimentary in guest rooms": "客房免费使用",
    "View information →": "查看详情 →",
    "How can we help?": "需要帮助？",
    "For extra bedding, arrival arrangements or questions about the hotel, contact our front desk.": "如需加配床品、咨询到店安排或其他酒店服务，请联系前台。",
    "Guest information & notices": "入住须知与公告",
    "Quiet hours are 22:00–07:00. Some third-floor areas are being refurbished; please ask reception about access.": "安静时段为 22:00—次日 7:00。三层部分区域正在维护，通行安排请咨询前台。",
    "Read the guest guidelines →": "阅读入住须知 →",
    "Read the full bulletin →": "查看完整通知 →",
    "Room and board are included. Register at reception before contacting the night supervisor for your handover.": "本岗位提供食宿。请先到前台登记住宿，再联系夜班主管办理交接。",
    "Facilities & Services": "设施与服务",
    "About the Hotel": "关于旅馆",
    "Careers": "加入我们",
    "My notes": "我的笔记",
    "Site information": "网站信息",
    "24-hour reception": "24 小时前台"
});
  const normalize = (value) => String(value).replace(/\s+/g, " ").trim();
  const translatedValues = new Set(Object.values(dictionary).map(normalize));
  function translateText(value) {
    const raw = String(value);
    const key = normalize(raw);
    if (!key || !/[A-Za-z]/.test(key) || translatedValues.has(key)) return raw;
    let translated = dictionary[key];
    if (translated === undefined) {
      let match;
      if ((match = key.match(/^Welcome back, (.+)\.$/)))
        translated = `欢迎回来，${match[1]}。`;
      else if ((match = key.match(/^(.+) · (?:ROOM|Room) (\d+)$/)))
        translated = `${match[1]} · ${match[2]} 号房`;
      else if ((match = key.match(/^Sign as (.+) & close the accounts →$/)))
        translated = `确认退房并签名：${match[1]} →`;
      else if ((match = key.match(/^(\d+) nights?$/)))
        translated = `${match[1]} 晚`;
      else if (
        (match = key.match(/^Added to notebook: (.+) \((\d+)\/(\d+)\)$/))
      )
        translated = `已记入笔记：${normalize(translateText(match[1]))}（${match[2]}/${match[3]}）`;
      else if ((match = key.match(/^(\d+) of (\d+) records recovered\. (.+)$/)))
        translated = `已找回 ${match[1]} / ${match[2]} 条记录。${normalize(translateText(match[3]))}`;
      else if (
        (match = key.match(/^(\d+) of 5 departure records remembered\. (.+)$/))
      )
        translated = `已发现 ${match[1]} / 5 个结局。${normalize(translateText(match[2]))}`;
      else if (
        (match = key.match(/^Lower stations verified: (\d+)\/6\. (.+)$/))
      )
        translated = `调查进度：${match[1]}/6。${normalize(translateText(match[2]))}`;
      else if ((match = key.match(/^(.*) [＋+]$/)))
        translated = `${normalize(translateText(match[1]))} ＋`;
      else if ((match = key.match(/^The Stillwater Hotel — (.+)$/)))
        translated = `静水旅馆 — ${normalize(translateText(match[1]))}`;
      else if (key.includes(" · ") && !/[\u3400-\u9fff]/.test(key)) {
        const parts = key.split(" · ");
        const result = parts.map(translateText);
        if (result.some((part, index) => part !== parts[index]))
          translated = result.join(" · ");
      } else if (key.includes(" → ")) {
        const parts = key.split(" → ");
        if (parts.every((part) => Object.hasOwn(dictionary, part)))
          translated = parts.map((part) => dictionary[part]).join(" → ");
      }
    }
    if (translated === undefined || translated === key) return raw;
    return (
      (raw.match(/^\s*/)?.[0] || "") +
      translated +
      (raw.match(/\s*$/)?.[0] || "")
    );
  }
  const ignored = (element) =>
    !element ||
    !!element.closest("script,style,[data-user-text],[data-puzzle-original]");
  function translate(root = document.documentElement) {
    if (root.nodeType === Node.TEXT_NODE) {
      if (!ignored(root.parentElement)) {
        const replacement = translateText(root.nodeValue);
        if (replacement !== root.nodeValue) root.nodeValue = replacement;
      }
      return;
    }
    if (
      root.nodeType !== Node.ELEMENT_NODE &&
      root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE
    )
      return;
    if (root.nodeType === Node.ELEMENT_NODE && ignored(root)) return;
    const elements =
      root.nodeType === Node.ELEMENT_NODE
        ? [root, ...root.querySelectorAll("*")]
        : [...root.querySelectorAll("*")];
    for (const element of elements) {
      if (ignored(element)) continue;
      for (const attribute of ["alt", "title", "aria-label", "placeholder"]) {
        if (!element.hasAttribute(attribute)) continue;
        const original = element.getAttribute(attribute);
        const replacement = translateText(original);
        if (original !== replacement)
          element.setAttribute(attribute, replacement);
      }
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (ignored(node.parentElement)) continue;
      const replacement = translateText(node.nodeValue);
      if (replacement !== node.nodeValue) node.nodeValue = replacement;
    }
  }
  window.StillwaterLocale = {
    language: "zh-CN",
    text: translateText,
    translate,
  };
  translate();
  const observer = new MutationObserver((records) => {
    const roots = new Set();
    for (const record of records) {
      if (record.type === "childList")
        record.addedNodes.forEach((node) => roots.add(node));
      else roots.add(record.target);
    }
    for (const node of roots) if (node.isConnected) translate(node);
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["alt", "title", "aria-label", "placeholder"],
  });
})();
