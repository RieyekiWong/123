/* Stage 2 authored public records. These are documents, not puzzle verdicts. */
globalThis.Stillwater2FrontData = (() => {
  const pair=(zh,en)=>[zh,en];
  const sources={
    closure:{title:pair('2007 年停业报道','2007 closure report'),date:'2007',origin:'SILVERPINE / LOCAL NEWS COPY',body:pair(
      '旧湖区的 Stillwater Hotel 已停止营业。旅馆不再接受住宿预订，原前台电话也将停用。业主尚未公布建筑今后的用途。\n\n镇上的资料室留存了部分宣传册和客房目录，供地方历史研究查阅。此前已订房的旅客需联系原预订代理办理退款。\n\n本页为当年报道的文字留存，照片附件未能恢复。',
      'Stillwater Hotel in the old lake district has closed. The hotel is no longer accepting accommodation bookings, and its reception telephone will be disconnected. The owner has not announced a future use for the building.\n\nThe town archive holds a small collection of brochures and room listings for local-history research. Guests with outstanding reservations should contact their original booking agent about refunds.\n\nText retained from the original report. Its photographic attachment could not be recovered.')},
    restoration:{title:pair('2026 年网站恢复公告','2026 website restoration notice'),date:'2026-11-02',origin:'STILLWATER / DIGITAL HERITAGE PROJECT',body:pair(
      'Stillwater Hotel 历史网页现已重新开放。此次整理包括旧站页面、宣传照片、客房目录和员工资料。损坏或缺页的部分会在页面上注明，后续仍会补充。\n\n酒店仍保持停业状态。恢复的是网站和资料访问，不涉及客房营业、预订或现场参观。\n\n资料负责人：Sylvia Morgan\n支持单位：Phase Self Historical Preservation Initiative\n旧站咨询及附件正分批迁入新档案，显示日期以原始文件为准。',
      'The Stillwater Hotel historical website is available again. The restoration includes surviving web pages, publicity photographs, room listings and staff material. Damaged or missing sections will be noted as work continues.\n\nThe hotel remains closed. This project restores access to its website and records; it does not reopen accommodation, reservations or visits to the building.\n\nArchive lead: Sylvia Morgan\nSupported by the Phase Self Historical Preservation Initiative\nOlder enquiries and attachments are being migrated in batches. Original file dates are retained where available.')},
    enquiry:{title:pair('楚人的原始课程咨询','Churen’s original project enquiry'),date:'2023-10-17',origin:'OLD SITE / ENQUIRIES / RETAINED SUBMISSION',body:pair(
      '发件人：W. Churen / Chicago student\n主题：西翼照片的位置\n\n您好，我在做一个关于旧网页和建筑影像的课程项目。宣传页上的西翼走廊，和地图里那张照片看起来不太一样。我今天从公开区域拍了几张，想问问能不能确认一下原来拍摄的位置。\n\n附件里有课程说明、两张现场照片，还有几张聊天截屏，是之前和朋友讨论照片方向时留的。我把朋友的联系方式裁掉了。要是找不到原片，告诉我大概是哪一边也可以。谢谢。\n\n附件目录：project-notes.pdf / west-01.jpg / west-02.jpg / photo-discussion-01.png / photo-discussion-02.png\n提交入口：历史资料咨询',
      'From: W. Churen / Chicago student\nSubject: Location of the west-wing photographs\n\nHello, I’m working on a class project about old websites and architectural images. The west-wing corridor on your publicity page looks different from the photograph on the map. I took a few pictures from the public area today. Could anyone help me place the original shot?\n\nI’ve attached my project notes, two field photographs and a couple of screenshots from a conversation about the pictures’ orientation. I cropped out my friends’ contact details. If the original photograph is missing, even knowing which side it shows would help. Thank you.\n\nAttachments: project-notes.pdf / west-01.jpg / west-02.jpg / photo-discussion-01.png / photo-discussion-02.png\nSubmitted through: Historical material enquiries')},
    stay:{title:pair('恢复后的人物关联条目','Restored person-linked entry'),date:'2026 / REBUILT',origin:'CONTINUITY / RESTORED INDEX',body:pair(
      'WANG CHUREN\nArrived: 2023-10-17\nRoom: WEST SERVICE\nStatus: STILL ON PROPERTY\n\nSource batch: ENQUIRIES / 2023\nRecord rebuilt: 2026\nAssociation: PERSON → STAY\nOriginal booking form: —\n\n此页由历史索引重建。关联状态：已同步。',
      'WANG CHUREN\nArrived: 2023-10-17\nRoom: WEST SERVICE\nStatus: STILL ON PROPERTY\n\nSource batch: ENQUIRIES / 2023\nRecord rebuilt: 2026\nAssociation: PERSON → STAY\nOriginal booking form: —\n\nReconstructed from the historical index. Association status: synchronized.')},
  };
  const reasons=[
    {id:'closedBeforeVisit',text:pair('酒店在 2007 年已停业，早于条目里的 2023 年。','The hotel closed in 2007, before the entry’s arrival date in 2023.')},
    {id:'sameName',text:pair('条目里使用了楚人的全名。','The entry uses Churen’s full name.')},
    {id:'enquiryNotBooking',text:pair('原始提交在询问照片位置，没有申请住宿。','The original submission asks about photographs, rather than requesting accommodation.')},
    {id:'oldPhotos',text:pair('网站使用了低分辨率的旧照片。','The website uses low-resolution photographs.')},
  ];
  const mainPost={id:'hotel-return',sections:['web','help'],pinned:true,avatar:'纸',user:pair('纸夹四号','paperclip_04'),at:'2026-11-02 20:18',views:482,title:pair('有人记得银松镇那家 Stillwater Hotel 吗？官网怎么又活了','Anyone remember Stillwater Hotel in Silverpine? Why is its website back?'),paragraphs:[
    pair('整理收藏夹的时候点到的。以前一直打不开，我都准备删了，今天居然进去了。不是新做的订房网站，看着像有人把旧站搬了回来。','Clicked it while sorting my bookmarks. The address hadn’t worked for years and I was about to delete it. Today it opens. It isn’t a new booking site; it looks like someone moved the old pages back online.'),
    pair('我只记得这家在旧湖区，关门挺久了。有住过的没？首页说在做历史资料整理，旧留言也留着。我把停业报道和这次恢复公告一起存了，省得过两天又打不开。','I remember it being in the old lake district, closed for ages. Did anyone stay there? The home page says it’s a historical archive, with the older enquiries still there. Saved the closure report and restoration notice in case the address dies again.'),
    pair('下面两份附件都能看。官网入口也放在附件底下了。','Both attachments are below, along with the website link.'),
  ],replies:[
    [pair('桥边便利店','bridge_shop'),pair('镇上的人。是停业了，2007 年那会儿关的，不是最近几年。楼还在。','I’m local. It closed in 2007, not just a couple of years ago. The building is still there.')],
    [pair('少放点盐','less_salt'),pair('以前跟家里人住过一晚，早饭有那种很硬的小面包。看见餐厅照片才想起来。','Stayed one night with my family. Breakfast had those really hard little rolls. The dining-room picture brought it back.')],
    [pair('缓存未命中','cache_miss'),pair('06 年的站就经常坏，图能开字打不开。别拿一张没日期的截图当现在还营业的证明。','The site was flaky even in 2006. Pictures would load but the text wouldn’t. An undated screenshot doesn’t tell you whether it’s open now.')],
    [pair('周二下午','tuesday_pm'),pair('公告下面有资助单位，Phase Self 的历史保存项目。我们图书馆也有这种整理旧网页的活。','There’s a credit under the notice: a Phase Self historical preservation project. Our library does old-website archiving too.')],
    [pair('后台还开着','tab_still_open'),pair('我先点进来的广告是修电脑，以为酒店改行了。','First thing I got was a computer-repair ad. Thought the hotel had changed careers.')],
    [pair('纸夹四号（楼主）','paperclip_04 (OP)'),pair('修电脑那个是论坛的广告哈哈。我点过客房页了，没有订房按钮，应该真是资料站。','That’s the forum ad, haha. Checked the rooms page; no booking button. Seems to be an archive.')],
  ]};
  const menus=[['hotel','首页','Home'],['hotel/rooms','客房','Rooms'],['hotel/dining','餐饮','Dining'],['hotel/history','旅馆往事','History'],['hotel/guestbook','旧站留言','Guestbook'],['hotel/archive-project','修复计划','Restoration'],['hotel/contact','联系资料组','Contact']];
  return Object.freeze({sources,reasons,mainPost,menus});
})();
