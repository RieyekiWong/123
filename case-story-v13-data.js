/* V1.3 sources: a person's life, retained originals, then the system's claims. */
globalThis.StillwaterStoryV13Data=(()=>{
  const t=(zh,en)=>[zh,en],o=(id,zh,en)=>({id,label:t(zh,en)}),field=(id,label,options,answer)=>({id,label,options,answer});
  const file=(title,reference,date,origin,body,extra={})=>({title,reference,date,origin,body,...extra});
  const diaries=globalThis.StillwaterStoryV13Diaries;
  const documents={
    index:file(t('历史住客姓名索引','Historical guest-name index'),'WC-317 / CURRENT INDEX','2006-10-17','CONTINUITY / REBUILT 2026',[
      t('WANG CHUREN / 王楚人 · 317 · CHECKED IN','WANG CHUREN · 317 · CHECKED IN'),
      t('这是网站当前汇总的姓名条目。关联的纸质预订单仍可单独查看。','This is the website’s current name entry. The linked paper booking is available separately.')],{rows:[['name',t('姓名','Name'),t('王楚人 / WANG CHUREN','WANG CHUREN / 王楚人')],['arrival',t('显示入住日期','Displayed arrival'),t('2006-10-17','2006-10-17')],['revision',t('索引生成时间','Index created'),t('2026-11-03','2026-11-03')]]}),
    oldchat:file(t('王楚人旧消息','Churen’s older messages'),'WX / 2021—2023','2021—2023','OLDER PRIVATE CHAT',[
      t('2022-05-14：GG 把地图拿反了。你真的很难沟通。','14 May 2022: GG held the map upside down. You are impossible.'),
      t('2023-10-12：我可能周末去银松镇，把作业那几张照片对一下。主要拍公开的地方，没打算进封起来的楼。','12 October 2023: Might go to Silverpine this weekend to check the project photos. Just the public places. Not going inside anything closed off.'),
      t('2023-10-17 18:12：等我回去跟你们说。此后没有可靠的新消息。','17 October 2023, 18:12: I’ll tell you when I get back. No reliable later message is retained.')],{route:'chat?room=wcr_old'}),
    notebook:file(t('2023 年课程笔记与日记','2023 project notes and diaries'),'WC / LOCAL NOTES','2023-09—2023-10-16','RETAINED PERSONAL FILES',[
      t('这些文字保存在楚人的课程资料里。他查的是旧网站和旧地图，打算拍公开区域的照片。','Retained with Churen’s course files. He was comparing old websites and maps and planned to photograph public places.')],{diaries:true}),
    school:file(t('课程提交记录','Course submission record'),'ARCH-310 / PROJECT OUTLINE','2023-09-11','NORTHLAKE / COURSE ARCHIVE',[
      t('Churen Wang · Northlake School of Design & Media，芝加哥。项目：银松镇旧湖区的网站、地图与照片。','Churen Wang · Northlake School of Design & Media, Chicago. Project: websites, maps and photographs of Silverpine’s old lake district.'),
      t('教师批注：缩小范围；区分来源日期。提交的是地方影像课题，不是入住申请。','Tutor’s note: narrow the scope; distinguish source dates. A local-image project submission, not a hotel booking.')]),
    guestlog:file(t('网站显示的入住日记','Journal displayed by the hotel'),'GUEST JOURNAL / WC-317','2006-10-17','HOTEL / GENERATED 2026',[
      t('我已于 2006 年 10 月 17 日办理入住。','I checked in on 17 October 2006.'),t('前台确认房间为 317。','Reception confirmed room 317.'),t('房间状况正常。工作人员完成登记。入住信息与当日记录一致。','Room condition normal. Registration completed by staff. Occupancy matches the day’s records.'),t('我同意将本次住宿状态标记为已确认。','I agree to mark this stay as confirmed.'),t('预计在规定时间办理退房。','Check-out will be completed at the scheduled time.')]),
    draft:file(t('2026 年合并文本','2026 combined text'),'WC-317 / MERGED COPY','2026-11-03','CONTINUITY / MERGE',[
      t('今天看到蓝色栏杆了。那里还是很旧。','Saw the blue rail today. Still looks old.'),t('我已经到达旅馆三楼。房号是 317。','I have reached the hotel’s third floor. Room 317.'),t('GG 老把我发的地图看反。','GG always reads my maps upside down.'),t('入住信息与原始资料一致。','Occupancy matches the original sources.'),t('我先别乱说，回头再查。','Let me check before I say anything.'),t('现在可以确认了，不需要继续核对。','Confirmation is now possible. No further review is needed.')]),
    'avatar-old':file(t('旧会话头像','Older-chat avatar'),'PHOTO / 2022','2022','OLDER PRIVATE CHAT',[t('朋友在咖啡店拍的照片，后来被用作头像。','A friend took it at a café. Churen later used it as his avatar.')],{image:'assets/story-v12/wcr-01-avatar-old.png'}),
    'avatar-new':file(t('新账号头像','New-account avatar'),'NEW ACCOUNT / PROFILE IMAGE','2026 / CAPTURE UNKNOWN','NEW ACCOUNT',[t('好友申请附带的头像。文件没有保留拍摄日期。GG 找出了那张校园照，可以放在旁边看。','The image attached to the friend request. No capture date is retained. GG found the campus photo; it is available for comparison.')],{image:'assets/story-v13/wcr-campus-new.png'}),
    echo:file(t('新账号的留存消息','Retained new-account messages'),'WX / NEW ACCOUNT','2026-11-03','NEW ACCOUNT / RETAINED COPY',[
      t('你还记不记得那次 GG 把地图拿反了。你们笑了好久。','Remember when GG held the map upside down? You laughed for ages.'),t('我看到了你打开的那个页面。现在是 317 / GUEST ROOM。','I saw the page you opened. It says 317 / GUEST ROOM now.'),t('你只需要确认这个名字属于 317。确认完我就能出来。','Just confirm this name belongs to 317. Once you confirm it, I can get out.')]),
    sync:file(t('网站字段更新','Website field update'),'WC-317 / DISPLAY COPY','2026-11-03','CONTINUITY / INDEX REBUILD',[
      t('来源核对已收到。当前显示：317 / GUEST ROOM。原始区域登记卡未更改。','Source review received. Current display: 317 / GUEST ROOM. Original service-position card unchanged.')]),
    fieldphoto:file(t('蓝栏杆与旧标识','Blue railing and old sign'),'WC / RETAINED PHOTO','2023-10-15','2023 CAMERA BACKUP',[t('从公开步道拍摄。标牌被雨渍遮住，不能从原图读出完整文字。','Taken from the public path. Rain obscures the sign; the original does not provide complete lettering.')],{image:'assets/story-v12/wcr-11-blue-sign.png'}),
    lastphoto:file(t('最后可靠的相机文件','Last reliable camera file'),'WC / LOCAL ORIGINAL','2023-10-17 18:26','LOCAL CAMERA BACKUP / RECOVERED 2026',[t('无编号的旧门、蓝色栏杆、失焦雨渍。画面靠右被显示副本裁去了。它不是 2006 年的酒店录像。','An unnumbered door, blue railing and blurred rain. The display copy crops the right edge. This is not hotel footage from 2006.')],{image:'assets/story-v13/exhibit-original.png'}),
    unsent:file(t('未发出的本地便签','Unsent local note'),'WC / LOCAL DRAFT','2023-10-17 / RECOVERED 2026','LOCAL BACKUP / NOT A SENT MESSAGE',[diaries[5].text]),
    contact:file(t('展示亭设备日志','Exhibit-kiosk device log'),'PUBLIC ARCHIVE EXHIBIT / LOCAL SESSION','2023-10-17 / RECOVERED 2026','SEPARATED LOCAL DEVICE BACKUP',[
      t('相机文件与这次本地会话对应。文件写入之后还有现场操作记录，说明他在 18:26 之后仍在展示区域停留过。日志没有给出他后来的去向。','The camera file matches this local session. On-site input continues after the file was saved: he remained at the exhibit after 18:26. The log does not establish where he went next.'),t('这次恢复的是早先被覆盖的边缘和日志，不是系统替照片补画出的文字。','The recovered edge and log were covered by the later copy. They are not lettering invented to fill the photograph.')]),
  };
  documents['avatar-old']=file(t('2022 年校园原照','Original 2022 campus photo'),'PHOTO / NORTHLAKE / 2022','2022','OLDER COURSE PHOTO',[
    t('楚人低头看着印坏的作业，背景海报贴歪了。照片是朋友拍的，旧资料里已经有这一构图。','Churen looks down at a bad print, laughing. The poster behind him is crooked. A friend took it; the framing already exists in the older files.')],{image:'assets/story-v13/wcr-campus-original.png'});
  documents.ruth=file(t('露丝的归档说明','Ruth’s archive note'),'LOCAL COLLECTION / RUTH KEANE','2023-10','SILVERPINE / PUBLIC READING ROOM',[
    t('楚人来找的不是鬼故事。他问同一扇门在两张照片里为什么有两个名字。我给他看了旧照片和工资核对清单。','Churen wasn’t looking for a ghost story. He wanted to know why the same door had two names in two photographs. I showed him the old photos and payroll checklist.'),
    t('那张员工照里拿饼干的是 Nora Bell。资料袋原来由 Mara 留在这里，和酒店后来提供的副本分开存放。','Nora Bell is the one holding a biscuit in the staff photo. Mara left the envelope here. It is kept separately from copies the hotel supplied later.')]);
  documents['nora-shift']=file(t('Nora 的原排班与工时','Nora’s original shift and time card'),'NORA BELL / NIGHT SHIFT','2006-10-16—2006-10-17','MARA / RETAINED ORIGINAL',[
    t('Nora Bell，27 岁。夜班前台、资料整理。本班已到岗，最后一班工时没有出现在后来的结算单里。','Nora Bell, 27. Night reception and records. Attendance recorded for this shift; its hours are missing from the later final pay statement.'),
    t('交班便条：今晚 318 那个客人，钥匙又发错了。我去把服务门检查一下。玛拉，帮我把那张工时卡留着，老板老说我们没干够。','Handover note: The guest in 318 has the wrong key sleeve again. Going to check the service door. Mara, keep my time card. The boss always says we haven’t done enough hours.'),
    t('背面是“弟弟生日”和“买饼干”。不是另一组档案编号。','On the back: “brother’s birthday” and “buy biscuits”. They are not another set of record codes.')]);
  documents['nora-life']=file(t('休息室里的人','The person in the break room'),'STAFF PHOTO / NORA BELL','2006','LOCAL COLLECTION / RETAINED PHOTO',[
    t('她想攒够钱，第二年去念护理学校。母亲给便当盒贴了姓名条，她嫌丢脸，却一直没有撕掉。','She was saving for nursing school the next year. Her mother labelled her lunch box. Nora found it embarrassing, but never took the label off.'),
    t('那天她只想做完夜班，回去给弟弟拍生日照片。照片里她举着一块饼干，正跟 Mara 说话。','She wanted to finish her night shift and go home to take birthday photos of her brother. Here she is holding a biscuit and talking to Mara.')],{image:'assets/story-v13/nora-breakroom.png'});
  documents.ethan=file(t('Ethan 的询问信','Ethan’s letter'),'ETHAN BELL / RETAINED LETTER','2007','LOCAL COLLECTION / FAMILY LETTER',[
    t('姐姐最后一次工资呢？你们为什么说她自己离职？她那天还答应给我拍照。','Where is my sister’s last pay? Why are you saying she left voluntarily? She promised to take photos of me that day.'),
    t('信附着姐姐留在家里的排班表。没有酒店发来的最后一班工时结算。','Attached is the roster she left at home. No final-shift pay calculation from the hotel is retained.')]);
  documents['nora-revision']=file(t('Helen 签署的工时变更','Time-record change signed by Helen'),'NORA BELL / SIGNED CHANGE','2007-01-08','HELEN MERCER / HOTEL COPY',[
    t('缺勤待调查 → 自愿结束雇佣关系。签署：Helen Mercer。变更单没有附 Nora 本人的辞职申请。','Absence pending investigation → voluntary end of employment. Signed: Helen Mercer. No resignation from Nora is attached.'),
    t('同批记录把 317 从服务暂存区改为客房，把未核实改成已完成。Mara 没有同意签署。','The same batch changes 317 from service holding to a guest room and unverified to closed. Mara did not agree to sign.')]);
  documents.helen=file(t('Helen 的邮件','Helen’s email'),'HERITAGE CAREERS / RETAINED MAIL','2026-11','HELEN MERCER / AUTHORED MESSAGE',[
    t('不要把 2007 年的修订当成原始记录。','Do not treat the 2007 revisions as the originals.'),
    t('父亲让我把未处理项目清掉。我以为只是账面上的事情。我想过，等酒店卖出去，再回来查她。但后来我每年都觉得已经太晚了。','My father told me to clear the unresolved items. I thought it was just paperwork. I meant to come back to it once the hotel sold. Then every year it felt too late.'),
    t('我开放了原始存储的部分权限。别信同步后的预览。要看就看原始录制。','I’ve opened part of the original storage. Don’t trust the synchronized preview. Look at the original recording.')]);
  documents['course-2023']=file(t('楚人的课程素材表','Churen’s course material sheet'),'ARCH-310 / W3-02','2023-10-16','NORTHLAKE / RETAINED PROJECT',[
    t('W3-02 / 2006 年 9 月 / 拍摄与手写标注：Nora Bell；中间为员工通道。','W3-02 / September 2006 / photograph and handwritten note: Nora Bell; the middle door is a staff passage.'),
    t('他在资料室的工资清单中找到这个名字，才认出背面的 N.B.。这不是他的入住申请。','He matched the name on the reading-room payroll list to N.B. on the back. This is not a booking made by him.')]);
  documents.publicity=file(t('N.B. 留下的照片背注','N.B.’s note on the photograph'),'W3-02 / ORIGINAL BACK NOTE','2006-09','LOCAL COLLECTION / ORIGINAL PRINT',[
    t('西侧走廊。周五拍的。中间这门不是客房，别给新来的弄错。—— N.B.','West corridor. Taken Friday. Middle door is not a guest room. Don’t let the new staff get it wrong. — N.B.')],{image:'assets/hotel-promo-v2/original.png'});
  documents.mara={...globalThis.StillwaterCaseData.documents.mara,body:[
    t('Mara 是当班夜审处理人，编号 E-014。她记下 Nora 上周少算的一小时，也保留了这一晚的原始磁带。','Mara was the night auditor, E-014. She corrected the hour missing from Nora’s previous time card and kept this night’s original tape.'),
    t('她没有同意把不知道的事写成已完成。2007 年的副本把她放进了住客栏，她拒绝签字。','She did not agree to mark the unknown as resolved. A 2007 copy put her in the guest field. She refused to sign.') ]};
  documents['nora-revision'].body.push(t('Arthur Mercer 要求把未处理项目整理成可归档状态，Helen 签署了这批变更。附注：未附 Nora 本人的辞职申请，原工时由 Mara 单独留存。','Arthur Mercer requested the unresolved items be made ready for filing. Helen signed the changes. Note: no resignation from Nora attached; Mara retained the original time card separately.'));
  documents.ruth.body.push(t('我桌上那袋盐饼干是新买的，别也拿去当旧物拍。至于闹鬼的事，我没见过。你要找照片上的字，我们就先找那张照片。','The crackers on my desk are new. Don’t photograph those as another historic object. As for ghosts, I haven’t seen one. You want the writing on a photo, so let’s find the photo first.'));
  const finding=[o('verified','可以确认','Established'),o('unverified','目前证据不足','Not established by these sources')];
  const proofs={
    index:{title:t('查清这条入住记录的来历','Check where the stay entry came from'),intro:t('左侧打开文件，用“放在一起看”选两份对照。最后附上支持判断的三份原件。索引是要检查的对象，不是证明自己的原件。','Open a file on the left and choose two to compare. Attach the three originals supporting your finding. The index is the claim being checked, not its own supporting evidence.'),sources:['booking','inventory','position'],compare:true,fields:[field('use',t('原资料里，317 是什么地方？','What was 317 in the original files?'),[o('room','可预订的客房','A bookable guest room'),o('service','服务暂存区域','A service holding area'),o('occupied','已经确认入住的房间','A room with confirmed occupancy')],'service'),field('stay',t('这些原件能确认王楚人在 2006 年入住吗？','Do the originals establish Churen’s stay in 2006?'),finding,'unverified')]},
    diary:{title:t('哪些话有原来的出处？','Which words have an earlier source?'),intro:t('先读他的日记，再看学校留存和旧消息。当前网站的入住日记与合并文本也在这里；相似的语气，不能代替原来的出处。','Read his diary alongside the school archive and older messages. The hotel journal and combined copy are here too. Familiar wording is not a substitute for an earlier source.'),sources:['notebook','school','oldchat','guestlog','draft'],fields:[field('purpose',t('学校记录与旧消息共同支持哪种行程？','What purpose do the school record and older messages support?'),[o('project','为课程拍照、核对资料','A photography and source-comparison project'),o('stay','去 317 办理入住','Checking into 317')],'project'),field('journal',t('网站入住日记有本人当年写下的原件吗？','Does the hotel journal have an original written by him then?'),[o('yes','有，显示年份就能证明','Yes; the displayed year proves it'),o('missing','没有找到这样的原件','No such original has been found')],'missing'),field('draft',t('合并文本里的内容来自哪里？','Where does the combined text come from?'),[o('single','全是同一篇本人日记','One complete personal diary'),o('mixed','旧话与后来补写的登记句混在一起','Older words mixed with later registration claims')],'mixed')]},
    echo:{title:t('熟悉的话能证明他是谁吗？','Do familiar words prove who is speaking?'),intro:t('把两张头像并排看。旧消息和网站更新也留着；查一查新账号说的话，在它出现之前是否已经存在。暂时不接受申请也能核对。','Compare the two avatars and check the older messages and website update. Was the new account’s material already available? Accepting the request is optional.'),sources:['avatar-old','avatar-new','oldchat','sync','echo'],fields:[field('photo',t('新头像是否是独立的新拍照片？','Is the new avatar an independent new photograph?'),[o('new','可以据此确认是新拍的','Its arrival proves a new photo'),o('reused','沿用了旧照片的构图和人物','It reuses the older image')],'reused'),field('identity',t('旧事与网站字段足以确认账号身份吗？','Do old memories and website fields establish the account’s identity?'),finding,'unverified')]},
    cause:{title:t('Nora 那一班为什么被改成了离职？','Why was Nora’s shift changed to a resignation?'),intro:t('楚人的课程表把 W3-02 连到 Nora 的名字。读原排班、家属来信和 Helen 的变更单，看看被改掉的是哪一件事。','Churen linked W3-02 to Nora’s name. Compare her original shift, her brother’s letter and Helen’s change order. What did that change erase?'),sources:['nora-shift','ethan','nora-revision','mara'],fields:[field('attendance',t('原始资料能确认什么？','What do the originals establish?'),[o('worked','Nora 确实上了那一班','Nora worked that night shift'),o('never','Nora 从来不是员工','Nora was never an employee')],'worked'),field('departure',t('“自愿离职”有本人原件支持吗？','Is voluntary resignation supported by Nora’s own original?'),[o('supported','签改单本身就足够证明','The change order alone proves it'),o('unsupported','没有，签改单不能代替她的辞职记录','No; the change cannot replace a resignation record')],'unsupported'),field('people',t('Nora、Mara、E. Vale 能合并成一个人吗？','Can Nora, Mara and E. Vale be merged into one person?'),[o('same','可以，都是同一笔异常','Yes; they belong to the same anomaly'),o('separate','不行，工作、审核和预订各有原件','No; work, review and booking have separate sources')],'separate')]},
  };
  proofs.diary.extras=['fieldphoto'];
  proofs.cause.extras=['ruth','course-2023','nora-life','publicity','transfer','personnel','revision','closure'];
  const categories={
    ROOM:{title:t('ROOM / 位置','ROOM / position'),intro:t('原目录、区域卡和恢复的画面，支持把这里登记成客房吗？','Do the directory, position card and recovered picture support registering this as a guest room?'),sources:['inventory','position','footage'],fields:[field('finding',t('位置判断','Position finding'),[o('supported','登记成客房','Register as a guest room'),o('unsupported','资料不支持这项登记','The sources do not support that registration')],'unsupported')],record:'ROOM / NOT SUPPORTED'},
    GUEST:{title:t('GUEST / 入住','GUEST / stay'),intro:t('原预订、钥匙套、巡查、移交与跨年代资料，能证明是同一个人的入住吗？','Do the booking, key sleeve, round, transfer and records from different years establish the same person’s stay?'),sources:['booking','key','housekeeping','transfer','notebook','index'],fields:[field('finding',t('入住判断','Occupancy finding'),[o('verified','确认入住','Confirm the stay'),o('unverified','不能据此确认','These sources do not establish it')],'unverified')],record:'GUEST / NOT VERIFIED'},
    EMPLOYEE:{title:t('EMPLOYEE / 人员','EMPLOYEE / personnel'),intro:t('Nora 是夜班员工，Mara 是审核人。但这条混合记录，能归给其中一个人吗？','Nora worked the night shift; Mara reviewed the records. Does that make this mixed record either person’s identity?'),sources:['nora-shift','personnel','nora-revision','mara'],fields:[field('finding',t('人员判断','Personnel finding'),[o('verified','用一个员工姓名覆盖整条混合记录','Put one employee’s name on the entire mixed record'),o('unverified','保留各自记录，不替混合身份确认','Retain their separate records; leave the mixed identity unverified')],'unverified')],record:'EMPLOYEE / MERGED IDENTITY NOT VERIFIED'},
  };
  const hints={
    index:[t('先分清姓名索引和它引用的旧文件。','Distinguish the name index from its older sources.'),t('预订单看住客，目录看客房，区域卡看用途。','Check the guest on the booking, the directory’s scope and the position’s use.'),t('打开三份原件，选两份对照，再附上原件保存判断。','Open the three originals, compare two, then attach sources and retain your finding.')],
    diary:[t('熟悉的语气不一定有原始出处。','Familiar phrasing need not have an original source.'),t('学校记录与旧聊天独立于酒店现在的文字。','The school record and older chat are separate from the hotel’s current copy.'),t('对比行程目的、入住句的出处，以及合并文本是否来自同一篇原文。','Compare the trip’s purpose, the source of the occupancy claim and whether the combined text has one original author.')],
    echo:[t('收到一张照片的时间，不一定是拍照时间。','Receiving an image does not date its capture.'),t('查看旧头像背景、衣领，再查那次地图玩笑和网站字段。','Check the older avatar’s background and collar, then the map joke and website field.'),t('附上两张头像、旧聊、更新与留存消息，核对它们是不是独立来源。','Attach both avatars, the older chat, update and retained messages; assess their independence.')],
    cause:[t('先看她那天有没有上班，再看后来是谁改了记录。','Check her attendance first, then who changed the record.'),t('原工时、Ethan 的信和 Helen 的签字不是同一种来源。','The original time card, Ethan’s letter and Helen’s signature are different sources.'),t('附上四份原件，核对到岗事实、离职依据和三个人各自的身份。','Cite the four originals and review attendance, the basis for resignation and the three separate people.')],
  };
  for(const key of Object.keys(categories))hints[key]=[t('先查看留下的原件。','Start with the retained originals.'),t('系统的归类和原件能证明的事，要分开看。','Separate a system classification from what its sources establish.'),t('打开本栏的每份来源，再附上支持判断的资料；不需要寻找新密码。','Open this category’s sources and cite the ones supporting your finding. No new password is needed.')];
  const messages=globalThis.StillwaterStoryData.messages,batches=globalThis.StillwaterStoryData.batches;
  function batch(id,room,lines){const key='v13.'+id;batches[key]={room,keys:lines.map(([zh,en],i)=>{const k=key+'.'+i;messages[k]={room,person:room,text:t(zh,en)};return k;})};}
  batch('index','gg',[t('2006？？','2006??'),t('那会儿他才四岁 先看这个条目从哪来的','He was four then. Check where that entry came from.'),t('别只看它现在显示的名字','Not just the name it displays now.')]);
  batch('checked','gg',[t('你刚保存的核对我看到了','Saw the review you just saved.'),t('怎么页面又给改回去了','Why has the page changed it back?'),t('原件先留着 我翻到他以前那几篇日记了','Keep the originals. Found his old diary files.')]);
  batch('diary','gg',[t('他自己也说没打算去住店','He said himself he wasn’t going there for a stay.'),t('那会儿他妈给他寄了外套 他还在嫌那件旧的能穿','His mum had posted him a coat. He kept saying the old one was fine.')]);
  batch('accepted','wcr_new',[t('在吗','You there?'),t('你先别在群里说','Don’t tell the group yet.'),t('我看见你们一直在找我','I saw you were still looking for me.'),t('你是不是打开那个酒店网页了','Did you open the hotel website?')]);
  batch('request','gg',[t('你说他加你了？','He added you?'),t('等一下 我这边没有','Wait. Nothing on my end.'),t('头像是不是 2022 年学校里那张 他在看印坏的作业','Is that the 2022 campus photo? He was looking at the bad print.'),t('我不是说一定是假的 先把旧图留着','Not saying it must be fake. Keep the old image.')]);
  batch('request-ignored','gg',[t('没加就先不加','No need to accept it yet.'),t('我留了它发过的那些话 还有学校那张原照','I kept the messages it posted and the original campus photo.'),t('先看出处 别替它填入住','Check the sources first. Don’t confirm a stay for it.')]);
  batch('account-memory','wcr_new',[t('你们还在找我吗','Are you still looking for me?'),t('又一那个小狗还是画得像土豆','Youyi’s dog still looks like a potato.'),t('我以前不是总把文件叫 final_final_2 吗','Didn’t I always call my files final_final_2?')]);
  batch('account-pressure','wcr_new',[t('你不要问 GG','Don’t ask GG.'),t('他会把我留在这里','He’ll leave me here.'),t('你只需要确认这个名字属于 317','Just confirm this name belongs to 317.')]);
  batch('b3-account','wcr_new',[t('就差你一个确认','All that’s missing is your confirmation.'),t('你签了我就出来','Sign it and I can get out.')]);
  const replies={
    where:t('我后来到了 317 至少这里是这样写的','I got to 317 afterwards. That’s what it says here.'),
    who:t('你们以前不都叫我楚人吗 GG 那次地图拿反了 你也在','You used to call me Churen. When GG held the map upside down, you were there too.'),
    day:t('那天的事情我说不清 你先帮我确认那条记录','I can’t explain that day. Help me confirm the record first.'),
    food:t('你们还去以前那家吃饭吗 我记得你不喜欢','Do you still eat at that place? I remember you didn’t like it.'),
    work:t('你先把作业做完吧 我还在这边','Finish your assignment first. I’m still here.'),
    'ordinary-0':t('嗯 我看到了 你继续说','Yeah, I saw it. Go on.'),
    'ordinary-1':t('你最近还跟 GG 一起出去吗','Have you been out with GG lately?'),
    'ordinary-2':t('有些事我记得 可现在说出来总觉得哪里不对','I remember things. They just don’t sound quite right when I say them now.'),
  };
  for(const [id,line]of Object.entries(replies))messages['wcr-v13-'+id]={person:'wcr_new',text:line};
  documents.oldchat.body.push(t('2023-08-23：别又叫 final_final_2 了，我自己都找不到。用 poster_export_02 起码知道是哪份。','23 August 2023: Please stop calling it final_final_2. Even I can’t find it. At least poster_export_02 tells me which file it is.'));
  batch('merge','gg',[t('先别替他确认','Don’t confirm it for him yet.'),t('我也想找到他 可不能把没查到的事直接填上','I want him back too. We can’t fill in something we haven’t established.')]);
  batch('b3','gg',[t('先把原来的那份留下','Keep the original first.'),t('他以前就这样 看不清的字不肯补','He was always like that. Wouldn’t fill in letters he couldn’t read.')]);
  batch('end-released','gg',[t('这句像他','That sounds like him.'),t('我们先把这些保存好','Let’s save all of this first.')]);
  batch('end-unverified','gg',[t('我也希望是他','I want it to be him too.'),t('可不能为了这个替他填一份假的','But we can’t make up a record for him.')]);
  batch('end-auto-close','wcr_new',[t('现在你找到我了','Now you found me.')]);
  return {text:t,documents,proofs,categories,hints,diaries};
})();
