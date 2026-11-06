/* Stage 1 text prototype. Sources and route checks are local, never AI decisions. */
globalThis.Stillwater2Data = (() => {
  const text = (zh, en) => [zh, en];
  const source = (title, date, origin, zh, en) => ({title:text(...title), date, origin, body:text(zh,en)});
  const sources = {
    closure: source(['停业报道','Closure report'], '2007', 'LOCAL NEWS / RETAINED COPY',
      'Stillwater Hotel 于 2007 年停止营业。报道说的是旅馆本身，不是网站停止更新。',
      'Stillwater Hotel closed in 2007. The report concerns the hotel, not merely its website.'),
    restoration: source(['网页恢复公告','Website restoration notice'], '2026', 'DIGITAL HERITAGE PROJECT',
      '项目将重新公开酒店旧网页和历史资料。客房不恢复营业。资料负责人：Sylvia Morgan。',
      'The project reopens the hotel’s historical website and archives. Guest accommodation is not reopening. Archive lead: Sylvia Morgan.'),
    enquiry: source(['楚人的课程咨询','Churen’s project enquiry'], '2023-10-17', 'W. CHUREN / CHICAGO STUDENT',
      '我在做旧网页与建筑影像的课程项目，想确认两张西翼照片是不是同一个位置。附件里有现场照片、课程说明和几段用来解释照片的旧聊天。这不是订房申请。',
      'I’m working on a class project about old websites and architectural photographs. Are these two west-wing pictures of the same location? I attached field photos, project notes and a few older messages explaining the images. This is not a booking request.'),
    stay: source(['恢复页的入住条目','Stay entry on the restored page'], '2026 / REBUILT', 'CONTINUITY',
      'WANG CHUREN\nArrived: 2023-10-17\nRoom: WEST SERVICE\nStatus: STILL ON PROPERTY\n这是一份 2026 年生成的状态，不是 2023 年的原始入住单。',
      'WANG CHUREN\nArrived: 2023-10-17\nRoom: WEST SERVICE\nStatus: STILL ON PROPERTY\nThis status was generated in 2026. It is not an original 2023 booking.'),
    staff: source(['Nora 的工作记录','Nora’s work record'], '2006-10-17', 'HOTEL / STAFF COPY',
      'Nora Bell，夜班前台。她会替熟客留热水，也一直想离开小镇继续读书。这份工时记录显示她当晚受雇值班，不是来参加研究。',
      'Nora Bell worked the night desk. She remembered regular guests’ habits and hoped to leave town to study. This time record places her on a paid shift, not at a research event.'),
    history: source(['位体教现行年表','Current Phase Self timeline'], '2026', 'PHASE SELF INSTITUTE / HISTORY',
      '2006：Nora Bell 自愿参加档案保全项目。页面没有附她本人签署的原始同意记录。',
      '2006: Nora Bell volunteered for the archive preservation project. No original record of her consent is attached.'),
    newsletter: source(['旧会员通讯','Older members’ newsletter'], '2006', 'PHASE SELF / NEWSLETTER',
      '当期通讯把酒店夜班岗位转入项目名册。负责人替员工修改了参与性质，没有附上员工本人提出的申请。',
      'This issue moves hotel night-shift posts into the project roster. A manager changed the participation status without attaching an application from the employee.'),
    narration: source(['讲解轨','Narration track'], 'RESTORED 2026', 'EXHIBIT / TRACK A',
      '每一份记忆都值得保存。这段平静讲解覆盖了下方另外两种声音。此处是音轨全文占位，正式录音尚未制作。',
      'Every memory deserves preservation. This calm narration overlaps two other voices. This is a transcript placeholder; the final recording has not been made.'),
    nora: source(['Nora 的声轨','Nora’s track'], '2006 / SOURCE FRAGMENT', 'EXHIBIT / TRACK B',
      '这里不是客房。我听见下层有人求助。先别把他们的话当成我的话。',
      'This is not a guest room. I can hear people asking for help downstairs. Don’t take their words for mine.'),
    doctrine: source(['教义广播轨','Doctrine broadcast'], 'MIXED SOURCE', 'EXHIBIT / TRACK C',
      '请继续接入。留下也是另一种归来。它要求继续连接，与求助声的意思相反。',
      'Please continue the connection. Remaining is another form of returning. This instruction conflicts with the plea for help.'),
    oldphoto: source(['W3-02：旧西翼照片','W3-02: older west-wing photo'], '2006', 'ORIGINAL PUBLICITY PRINT',
      '照片素材待制作。正式版本会保留门框上角、旧灯座和员工通道牌；这些结构要与楚人后来拍到的地方可以对上。',
      'Image pending. The finished photograph will show the frame corner, old lamp base and staff-passage plaque. Its structure must align with Churen’s later photograph.'),
    fieldphoto: source(['楚人的现场照片','Churen’s field photograph'], '2023-10-17', 'COURSE ATTACHMENT / ORIGINAL',
      '照片素材待制作。楚人在公开区域拍到维修门。这只能证明拍摄时的位置，不能证明他后来从未进去。',
      'Image pending. Churen photographed a maintenance door from a public area. This establishes where the photograph was taken, not everywhere he went afterwards.'),
    camA: source(['A：西翼门','A: west-wing door'], 'SOURCE TO BE CHECKED', 'CCTV / CAMERA A',
      '这一机位保留门框和灯座的位置关系。正式监控画面将在后续阶段制作。',
      'This view retains the relation between the frame and lamp base. Its final camera scene is planned for a later stage.'),
    camB: source(['B：当班片段','B: shift fragment'], '2006 / LOW-RES PREVIEW', 'CCTV / CAMERA B',
      '原始片段中的员工活动与 Nora 当班资料相符。完整声源还没有恢复，不能只凭时间戳确认人物。',
      'The staff activity in this source fragment matches Nora’s shift material. The complete voice is not recovered yet. A timestamp alone does not establish identity.'),
    camC: source(['C：混合输出','C: mixed output'], 'RECONSTRUCTED 2026', 'B-3 MAINTENANCE CONTROLLER',
      '重建输出把不同时期的人物和修复标牌放进同一画面。它的来源指向 B-3，不是楚人入住的原始录像。',
      'The reconstructed output combines people and restoration signs from different years. It comes from B-3, not an original recording of Churen checking in.'),
    wiring: source(['B-3 接线规则','B-3 wiring rules'], 'A–F / 90°', 'MAINTENANCE PANEL',
      '正式版本继续使用现有六个旋转接头：邻接端口须对齐，原件接到备份端；隔离持续写入，切到 MANUAL 后保存。本幕目前只验证证词与终章的转场。',
      'The finished scene retains the six rotating ports: align neighbouring connections, route the original to the archive, isolate writing, switch to MANUAL and save. This checkpoint currently tests the testimony-to-finale transition.'),
    testimony: source(['独立证词内容预览','Independent testimony preview'], '2006 / ORIGINAL VOICE', 'NORA BELL',
      '我叫 Nora Bell。那天不止我一个人。他们把每个人都叫作另一个自己。有的人想出去，有的人只想把机器继续开着。\n\n王楚人不是我们的人。他留下照片，想帮我把东西送出去。我们那天不是自愿进去的。不要再把他的名字加进来。',
      'My name is Nora Bell. I wasn’t the only one that night. They called every person another self. Some wanted to get out; some only wanted to keep the machine running.\n\nWang Churen is not one of us. He left photographs and wanted to help get something outside. We did not go in willingly. Don’t add his name to this.'),
    synthetic: source(['新账号的合成发言','The new account’s synthetic messages'], '2026', 'RETAINED OUTPUT',
      '它知道几个旧笑话，也会说想回来。相关照片和聊天曾被上传到旧站。熟悉的说法不能单独证明它就是楚人。',
      'It knows a few old jokes and says it wants to return. Those photographs and messages had been uploaded to the old site. Familiar speech alone does not establish that it is Churen.'),
  };
  const puzzle = (chapter, route, title, goal, ids, feedback) => ({chapter,route,title:text(...title),goal:text(...goal),sources:ids,feedback:text(...feedback)});
  const puzzles = {
    P1:puzzle(1,'forum',['已经关门的酒店','The closed hotel'],['确认停业与网页恢复分别是什么时间。','Distinguish the hotel’s closure from its website restoration.'],['closure','restoration'],['2007 年停业。2026 年恢复的是旧网站。先看看 GG 找到的页面。','The hotel closed in 2007. Its website was restored in 2026. Open the page GG found.']),
    P2:puzzle(1,'hotel',['谁在给他办理入住','Who is checking him in?'],['核对楚人的课程咨询与后来生成的入住条目。','Compare Churen’s enquiry with the later stay entry.'],['closure','enquiry','stay'],['楚人提交的是课程咨询。系统却在酒店停业后给他登记了入住。资助修复的人也许知道这份记录怎么来的。','Churen sent a project enquiry. The system assigned him a stay after the hotel had closed. The restoration sponsor may explain the entry.']),
    P3:puzzle(3,'phase/archive',['有人替她同意了','Someone agreed for her'],['比较 Nora 的受雇记录与“自愿参加”的说法。','Compare Nora’s employment with the claim that she volunteered.'],['staff','history','newsletter'],['工作记录还在，但没有找到她本人同意的原件。展览里的旧声音可能留下了另一种说法。','The work record remains, but her original consent is missing. The exhibition recording may retain a different account.']),
    P4:puzzle(4,'phase/research',['不止一个人的声音','More than one voice'],['分清 Nora 的求助与继续连接的指令。','Separate Nora’s plea from the command to stay connected.'],['narration','nora','doctrine'],['两种声音在要求不同的事。三轨副本已留在预览记录里。微信收到一个使用楚人名字的新好友申请。','The voices ask for different things. The prototype retains all three transcripts. A new friend request has arrived under Churen’s name.']),
    P5:puzzle(5,'heritage/photos',['走廊背面','Behind the corridor'],['用两个年代的照片确认同一处建筑结构。','Locate the shared structure in the two photographs.'],['oldphoto','fieldphoto'],['正式叠片尚待制作；本次已验证两份来源能回看，并将调查带到监控。','The image overlay is still to be made. This preview verifies source revisiting and the transition to CCTV.']),
    P6:puzzle(5,'heritage/cctv',['三个机位的来源','Three camera sources'],['区分原始片段与 B-3 的混合输出。','Distinguish source footage from B-3’s mixed output.'],['camA','camB','camC'],['混合输出来自 B-3。配线室入口已经打开。','The mixed output comes from B-3. The maintenance panel is now accessible.']),
    P7:puzzle(6,'heritage/b3',['B-3 主机','The B-3 controller'],['保留原声，阻止继续写入新的身份。','Retain the source voice and stop further identity writing.'],['wiring'],['这段独立证词是分离信号后要交给玩家的内容。正式接线在后续阶段接入，本次先验证读完后进入终章。分开的输出里不止一个人的声音；系统把这些残留合称 NULL。Nora 只是其中的一部分，不是它的全部。\n\n我叫 Nora Bell。那晚不止我一个。有人想出去，有人只想让机器继续开着。王楚人不是我们的人。他留了照片，想帮我把东西送出去。不要再把他的名字加进来。','This is the testimony the separated signal will provide. Wiring is integrated in a later stage; this preview tests reading it before entering the finale. The separated output contains several people’s voices, grouped under the name NULL. Nora is part of it, not the whole.\n\nMy name is Nora Bell. I wasn’t the only one that night. Some wanted out; some wanted the machine running. Churen is not one of us. He left photographs to help get something outside. Don’t add his name.']),
    P8:puzzle(7,'heritage/final-trace',['第二个自己','The Second Self'],['决定是否允许系统借用楚人的名字。','Decide whether the system may use Churen’s name.'],['testimony','fieldphoto','synthetic'],['本次预览的选择已保存。','Your prototype choice has been saved.']),
  };
  const chapters=[text('普通的一天','An ordinary day'),text('已经关门的酒店','The closed hotel'),text('谁出钱恢复网站','The restoration sponsor'),text('第二个自己','The Phase Self'),text('不是一个人的声音','More than one voice'),text('走廊背面','Behind the corridor'),text('B-3 主机','The B-3 controller'),text('第二个自己','The Second Self')];
  const phasePages={
    'phase':text('首页','Home'),'phase/beliefs':text('本我与位我','Beliefs'),'phase/founder':text('Stephen Dylan','Stephen Dylan'),
    'phase/research':text('研究与展览','Research & exhibitions'),'phase/history':text('历史','History'),'phase/archive':text('数字遗产项目','Digital heritage'),
    'phase/join':text('参与','Take part'),'phase/contact':text('联系我们','Contact'),
  };
  const routes=['chat','forum','hotel','hotel/archive-project',...Object.keys(phasePages),'heritage/photos','heritage/cctv','heritage/b3','heritage/final-trace','notes','ending'];
  const endings=['auto-close','unverified','released'];
  const parse = hash => {const [route,query='']=String(hash).replace(/^#sw2\//,'').split('?');return String(hash).startsWith('#sw2/')&&routes.includes(route)?{route,params:new URLSearchParams(query)}:null;};
  const hash = route => '#sw2/'+route;
  return Object.freeze({sources,puzzles,chapters,phasePages,routes,endings,parse,hash,text});
})();
