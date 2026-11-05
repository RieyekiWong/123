# 03 · 核心谜题、答案、提示与转场

**开发报告，含完整答案，不发布到玩家网页。** 关卡验证完全在本地完成，AI 不参与判题。以下路由均为 2.0 拟定值。

## 1. 全程一致的操作规则

屏幕只突出一个目标、一个主要操作和已保存的简短事实记录。主操作带明确动词，例如“保留对照”“保存分离副本”，不用只有箭头的角落链接。每一项新增事实附来源和年份；系统猜测不写进“已证实”。

成功后顺序固定：

```text
提交真实操作
 → 验证当前可访问来源和操作结果
 → 保存 puzzle 结果、来源引用、下一事件（同一次状态写入）
 → 显示简短成功反馈
 → 等待重要阅读关闭 / 关键对话已读
 → 固定 StoryBeat
 → 保存目标路由，再切下一屏并设置标题焦点
```

没有长文时可以直接进入下一屏；有长文时关闭阅读面板即推进，不另藏一个“下一步”。在微信输入、AI 设置或可选文件里时，下一处显示为醒目的“返回调查 · [目标]”，不把玩家打断回浏览器。

每关有“查看提示 / Hint”，逐次请求才显示下一级；错误不会清空答案草稿、来源、接线或读过的文件。没有真实倒计时、等待数分钟或靠停留时间通关。

## 2. 可执行关卡规格

### P0 · 认识王楚人——不阻断主线

- 目标：看看 GG 找到了什么 / See what GG found.
- 来源：可回看的旧会话、2022 头像、2023 最后消息、五类生活片段。
- 操作：打开旧头像或最后消息就记 `oldFriendContextViewed`；该值不决定论坛是否可进入。
- 后果：固定 GG 私聊分享新论坛主帖。无论玩家回复、沉默、使用英文或先聊父母，都能收到卡片；提供“查看 GG 的消息”，不强切聊天窗口。
- 验证：卡片来自固定事件 `sw2.p0.forum-share`，不是 AI 生成的 URL。任意重复渲染只出现一份。
- 回看：旧会话和照片一直可开；当前玩家消息只由玩家自己发送。

### P1 · 两个日期，两个不同的“开放”

- 目标：确认酒店是否仍营业，以及网站为何今年出现 / Find out what closed, and what reopened.
- 来源：`closure-2007` 停业报道；`restoration-2026` 网页恢复公告。两份都从论坛附件可达。
- 操作：分别打开阅读抽屉；来源标题和日期填入两栏，不输入密码、不背完整日期、不做复杂排序。这一关兼作阅读/回看教学，不伪装成高难推理题。
- 完成条件：两份来源确实打开，恢复范围的正文已展示；关闭阅读抽屉后显示“2007 酒店停业 / 2026 历史网页恢复”。不把网页恢复记为酒店营业。
- 误解反馈：“恢复的是历史网站，不是客房营业。请再看公告标题。” / “The notice reopens the archive website, not the hotel.” 旧页面的订房入口在本版本指向资料说明，不出现真实订房提交。
- 事件：GG 根据他自己找到的同一公开网址发“对，就是这个站”；浏览器进入酒店 Home。

### P2 · 这份入住记录从哪里来？

- 目标：核对楚人的入住条目 / Check the source of Churen’s stay record.
- 来源：P1 停业报道、`enquiry-2023` 原咨询、`stay-2026` 当前重建记录。酒店 Guestbook 和对照面板都能重新打开。
- 操作：三份内容在一个面板；选择两条客观理由，然后“保留对照并分享给 GG”。卡片只是分享公开资料，不替玩家发一段预设台词。
- **完整答案**：① 2007 已停业；② 2023 原件是课程影像咨询而非订房。2026 的 STILL ON PROPERTY 是后来系统的断言，不能证明实际入住。
- 验证：三份来源已打开；所选理由集合必须恰为 `closedBeforeVisit`、`enquiryNotBooking`；不能靠“照片旧”“名字像中国人”等无关项通过。
- 失败反馈：“这能证明页面现在这样显示，不能证明 2023 年酒店还在接待住客。” / “It tells us what the restored page says, not whether the hotel received guests in 2023.” 保留已选项。
- 事件：公开条目先显示审核反馈，再变“身份关联待补全”；原件仍在。GG 收到已分享卡后问“谁在给他办入住啊？”；进入 Archive Project，资助方入口是本页唯一主操作。

### P3 · 员工何时变成了自愿者？

- 目标：比较 Nora 的工作记录与公开说法 / Compare Nora’s work record with the public account.
- 来源：`nora-staff-2006` 酒店员工卡/工时记录；`nora-history-2026` 现行年表；`newsletter-2006` 旧会员通讯。正常公共页面均有入口，对照页也能回开。
- 操作：原始/现行两页签，读完整段落，标记姓名与“夜班受雇 / 自愿参加”的说法，点击“保留差异”。不展示一长串文件复选框。
- **完整答案**：Nora 的受雇与夜班有原件支持；教会把她写为自愿参加者，但没有她本人同意的原始依据。不能反推“她从未接触教会”。
- 验证：三份来源已看；对照对象是原始员工记录和现行年表；标记同一个 Nora 以及两种参与性质；保存的是缺乏同意依据，不是断言已证明所有经过。
- 失败反馈：“这两处说的都是 Nora，但一个是工作班次，一个是自愿参加。请保留参与性质的差异。” / “Both refer to Nora. One records a work shift; the other claims voluntary participation. Keep that difference.”
- 事件：无声出现 `No original consent available`；关闭结果即进入 Research 的正式旧录音入口。文件随时回看。

### P4 · 同一段录音里的冲突

- 目标：分清求助声与连接指令 / Separate the plea for help from the connection command.
- 来源：25–40 秒虚构展览录音，三条文本/音频轨：讲解者、Nora、教义。完整字幕与声音在同一位置切换。
- 操作：三个明显开关，隔离/独听或读各轨完整字幕；选取 Nora 求助句与教义连接句，保存三轨副本。无须精调频率、混响或靠耳朵辨认不可读细音。
- **完整答案**：Nora 表示这里不是客房，听见下层有人求助；教义广播要求继续接入。它们不是同一个人的一致指令。
- 验证：通过开关/字幕至少查看 Nora 与教义两个独立来源，保留对应的两段完整摘录，且三轨副本未被替换为单一人名。音频是否开、播放是否结束均不作为正确条件。
- 失败反馈：“讲解声下面还有一句完整的话。先单独打开 Nora 的字幕，再与广播对照。” / “There is another complete sentence under the narration. Open Nora’s transcript on its own, then compare it with the broadcast.”
- 事件：H1 短错帧后停在静止画面；关闭即可保存副本并显示新账号好友申请。接受/忽略两条分支都进入 P5；接受者可以先读固定消息，忽略者能在来源面板看留存的公开合成发言。
- 新账号可引用的往事只来自 `uploaded-materials-2023` 清单。新账号不是新的 OpenAI 角色，不拥有玩家妈妈/爸爸的私聊记忆。

### P5 · 两张照片中的同一处结构

- 目标：找出楚人最后照片与旧西翼相同的位置 / Locate the shared structure in Churen’s photo and the old west wing.
- 来源：`west-photo-2006`（可称 W3-02）、`field-photo-2023`。后期必定能重新取到两张原件，是否点过早期广告不影响谜题。
- 操作：移动、缩放、镜像、透明度；先标记门框上角和旧灯座，再指出改变的标牌。手机与键盘提供大步/小步按钮和重置，不只允许精确拖拽。
- **完整答案**：公开区域的维修门与旧西翼服务结构有关；标牌后来改变。它不证明楚人在 2006 入住，也不能证明他此后从未进过别处。
- 验证：变换与两对地标在同一个坐标系；两个独立地标均达到容差，再标记牌面。不能只把透明度拉到某数字、连点两处任意坐标便通过。
- 后续素材校准建议：使用归一化坐标，地标误差不大于显示图短边 3.5%；允许镜像、缩放 0.5–2 倍及按钮平移。**最终基准变换要等原创图片完成再测定**，现在没有对应成品，不伪造已验证坐标。
- 失败反馈：“先对灯座和门框。门牌容易被改，不能单靠它认位置。” / “Line up the lamp base and frame first. A plaque can be changed.”
- 事件：保存对齐图并分享后，GG 才回应右侧灯；显出员工牌边缘和维修通道来源，进入 CCTV。不额外索要新密码。

### P6 · 三机位，三种来源

- 目标：辨认原片与后期混合信号 / Tell the source footage from the later mixed signal.
- 来源：A 西翼门；B 原始 2006 员工活动片段；C 后期重建混合画面。保留机位切换和视角能力，去掉旧“推车→告示→门”的额外必做迷宫。
- 操作：每机位一个明确观察点，点击固定标志或人物/年代物件，记录 1/3、2/3、3/3。可从照片面板回看先前稳定地标。
- **完整答案**：A 给出位置关联；B 与 Nora 的 2006 原始来源及当班物件相符；C 混入 2026 修复标识/王楚人的后期图像，来自 B-3 重建输出，不是实际入住录像。
- 验证：三个机位分别保留对应观察，B 有可回查的原始来源，C 标出后期混合的可见依据；只点时间戳不通过。无需玩家一直盯着等待变化。
- 失败反馈：“时间戳只是这一份输出给出的信息。再看画面里的标牌，以及它来自哪一份原片。” / “The timestamp belongs to this output. Check the sign in the image and the source reel.”
- 事件：C 的来源指向 `B-3 Maintenance Controller`，触发 H2；随后出现全屏内醒目的单一“打开 B-3 / Open B-3”面板。这是蓝图明确保留的一步，不藏回网页目录。
- B 片段不提前授予 `originalsRecovered`；完整声源、未裁剪边缘与写保护属于 P7/P8。

### P7 · B-3——同样的六个旋转接头

- 目标：保留原始声音，隔离继续写入的信号 / Retain the original voice and isolate the writing signal.
- 操作保持：A–F，3×2；每次顺时针 90°；邻接端口相对才通；撤销；隔离；MANUAL；保存。没有新增第七个接头，没有改成点亮连线便自动通过。
- 标签解释：A 原信号为 ORIGINAL，F 原片读取端为 ARCHIVE；另一逻辑支路为 OVERLAY→WRITE。当前算法只有一个 F 物理输出，ARCHIVE/WRITE 是两条逻辑用途的指示，**不在图上伪造一个算法不存在的新端口**。
- **完整答案**：开发基准朝向 `[2,1,2,0,3,0]`；原件从 A 左到 F 右可读；隔离 overlay；MANUAL；保存当前有效配置。玩家看的是连线，不显示答案数组。
- 验证直接复用 `StillwaterNightModel.circuit()` 的结果：`readable && isolated && manual && !register`。本轮穷举指纹见 baseline.json。保存后旋转/切模式要使“已保存”失效，保留当前线路和撤销栈。
- 接上 WRITE 的反馈：“这条线路会继续写入身份记录。原片还在，可以隔离后重试。” / “This path keeps writing identity records. The original is still available; isolate the path and try again.” 不删除原片、不永久坏档。
- 事件：有效保存后先短 H3，随后静止、显示独立 Nora 声源与完整字幕。至少包括：她的名字；那晚不止一个人；他们称之为另一个自己；有人想出去，有人要开机器；楚人不是他们的一员；他留照片想帮忙送出资料。简短关键句保留：“我们那天不是自愿进去的。不要再把他的名字加进来。”
- 长证词不自动跳走。播放器可暂停，字幕可读，关闭“原始声音已恢复”面板后进入 Final Trace。GG 只谈自己已获的来源或已分享照片，不能远程看见每次旋转。

### P8 · 最后的身份决定

- 目标：决定是否让系统借用楚人的名字 / Decide whether the system may use Churen’s name.
- 画面：纯黑、冷色少量字、单一问题。三份人类证据按需展开：Nora 2006 声源、楚人 2023 原照片、新账号 2026 合成发言。不重做 ROOM/GUEST/EMPLOYEE 表格，不加四十个复选框。
- 问题：“是否允许系统使用 WANG CHUREN 作为当前缺失身份的替代值？” / “Allow the system to use WANG CHUREN as the replacement for this missing identity?”

| 动作 | 本地条件 | 明确告诉玩家的后果 | 保存结果 |
|---|---|---|---|
| A 接受替代 / Accept the replacement | 已达 P8；明确确认这次处理 | 官网会写“已找到”，但未证明新账号就是他 | `auto-close`；记录这次人为接受，不将其列为事实证明 |
| B 拒绝替代，保留只读 / Refuse; keep read-only | 已达 P8；不要求故意破坏正确接线 | 不新增身份确认，证据和调查仍保存 | `unverified`；可回看全部已发现来源 |
| C 保存分离原件，断开写入 / Save separated originals; disconnect writing | P4 原始轨已留存、P5 叠片已验证、P6 来源核对已完成、P7 当前有效且已保存、原件可读 | Nora 与其他记录分开保留，停止自动错误写入，恢复楚人的未裁剪线索 | `released`；封存原件与最终配置；恢复北岸渡口边缘 |

这不是一题只有 C 才能“通过”的考试，而是有明确代价的结局决定。正常完成前序关卡时 C 应可用，不追加藏在别处的原件锁按钮。若恢复了不完整/损坏的新版本状态，界面列出缺少的具体步骤并提供直接返回，不授予伪进度。

P7 的临时隔离不等于终局停机。C 关闭的是自动身份写入与重连；不删除受困者，不切断全部读取。A 是玩家授权错误身份处理，并不要求把物理原片线路故意接错。B 在有效接线下也始终可选。

## 3. 关卡转场总表

| 完成事件 | 立即保存/反馈 | 阅读屏障 | 下一真实路由 | 固定消息的知情依据 |
|---|---|---|---|---|
| P0 分享 | `sw2.p0.forum-share` 卡片 | 玩家选择打开 | `#sw2/forum?topic=hotel-return` | GG 自己找到公开帖子 |
| P1 | 两个来源和日期对照 | 关闭当前阅读抽屉 | `#sw2/hotel` | GG 与玩家在看同一公开网址 |
| P2 | 两个理由、原咨询、同步变化 | 看完结果面板 | `#sw2/hotel/archive-project` | “保存并分享”已附公开资料卡 |
| 项目来源 | 资助方和修复负责人已展示 | 主操作“查看项目来源” | `#sw2/phase/archive` | 公开的项目署名；没有新谜题 |
| P3 | 两版本身份差异、副本 | 关闭结果 | `#sw2/phase/research?exhibit=mechanical` | 记录本身给出旧录音来源 |
| P4 | 三轨副本、冲突摘录、H1 标记、申请 | 关闭播放器，选择接受/忽略；接受者可读固定聊天后点唯一返回栏 | `#sw2/heritage/photos` | 上传清单限定合成账号记忆；GG 不自动知道是否接受 |
| P5 | 对齐参数、两地标、改牌标记、分享卡 | 关闭结果，无强制等消息计时 | `#sw2/heritage/cctv` | GG 收到实际分享的对齐图 |
| P6 | 3 个来源观察、B-3 来源、H2 标记 | 看完单一 B-3 面板 | `#sw2/heritage/b3` | 设备来源字段，不由 AI 导航 |
| P7 | 有效配置、原始副本、H3、证词 | 读完/关闭证词 | `#sw2/heritage/final-trace` | GG 基于已留存/共享的原照片回应 |
| P8 A/B/C | 处理决定、结局、尾声消息待送 | 尾声可读、可回看 | `#sw2/ending?view=...` | GG 看公开结案页或玩家分享的原件；新账号是固定剧情 |

“系统已自动进入下一处”不等于“强迫玩家离开所有正在看的东西”。待推进队列在菜单显示一条主要目标；浏览可选档案不消耗它，回到调查后继续。事件和路由先保存，刷新后恢复同一待阅读场景。

## 4. 每关三级提示

按钮两种语言固定为“查看提示 / Hint”“再给一点提示 / Another hint”“操作提示 / Show the controls”。以下是目标信息，不把答案数组直接印在第三层。

| 关卡 | 1：观察方向（中 / 英） | 2：具体来源（中 / 英） | 3：如何操作（中 / 英） |
|---|---|---|---|
| P1 | “开放”的对象可能不同。 / Check what is reopening. | 对照停业报道和修复公告。 / Compare the closure report with the restoration notice. | 打开两份附件，关闭后看两栏来源。 / Open both attachments, then close them to see the two source columns. |
| P2 | 页面写了什么，与实际发生什么要分开。 / A page’s claim is not the event itself. | 看停业年、2023 咨询目的和条目生成时间。 / Check the closure year, the enquiry’s purpose and when the entry was rebuilt. | 把三份来源放在一起，保留两条能直接核实的理由。 / Keep the three sources open and select two reasons their text directly supports. |
| P3 | 留意她是以什么身份出现在文件里。 / Look at the role assigned to her. | 对照员工卡、现行年表和旧通讯。 / Compare the staff record, current timeline and newsletter. | 在原始/现行页签标记姓名与参与性质，再保留差异。 / Mark the name and participation claim in the two tabs, then retain the difference. |
| P4 | 混在一起的句子可能并非一个意思。 / The overlapping sentences may disagree. | 单独读 Nora 与教义的字幕。 / Read Nora and the doctrine track separately. | 用三开关独听，或打开对应全文，保留两段冲突摘录。 / Solo the tracks or open their transcripts, then retain the conflicting excerpts. |
| P5 | 先找不容易更换的建筑部分。 / Start with lasting parts of the building. | 看门框上角和旧灯座。 / Check the frame corner and old lamp base. | 用镜像、平移、缩放对齐两地标，再看牌面。 / Mirror, move and scale to align both landmarks; then inspect the plaque. |
| P6 | 时间数字不是唯一来源。 / The time display is not the only source. | 比较建筑标志、当班物件与修复标牌。 / Compare the structure, shift objects and restoration sign. | 每机位保存一个可见依据，再核对输出来源。 / Save one visible observation per camera, then check the output source. |
| P7 | 读取与继续写入是两件事。 / Reading and writing are different operations. | 看 ORIGINAL、ARCHIVE 和另一写入支路。 / Follow ORIGINAL, ARCHIVE and the writing branch. | 转动相邻端口，隔离写入，切 MANUAL 后保存；可撤销。 / Align the ports, isolate writing, switch to MANUAL and save. Undo is available. |
| P8 | 熟悉的说话方式不等于本人回来。 / Familiar speech does not establish a person’s return. | 回看 Nora 原声、2023 照片与合成发言。 / Revisit Nora’s voice, the 2023 photo and the synthetic messages. | 按需要展开三份证据，读清三个处理后果后决定。 / Open any of the three sources and read each disposition’s consequences before choosing. |

P0 不设解谜提示，只把“旧会话”和“GG 私聊”做清楚。每关第三级只显示操作，不把所有后续秘密提前塞给玩家。

## 5. 广告和微信通知的场景规则

直接执行用户最新补充：**广告保留，恐怖时收起。** “没有恐怖效果”只是必要条件，只有明确列为普通浏览的页面才允许投放，不靠页面背景颜色判断。

| 场景 | 普通广告 | 普通微信通知 | 说明 |
|---|---|---|---|
| 开场普通微信、普通联系人日常聊天 | 开；固定右下一个 | 微信内未读，不另盖同一通知 | 保留原广告池；输入、AI 同意框和关键剧情卡不被遮挡 |
| 论坛列表、日常帖和主帖普通阅读 | 开；桌面两侧最多两个，手机一个 | 开 | 普通网页自由逛，广告真实叠层，不挤版 |
| 早期酒店 Home/Rooms/Dining 的普通浏览 | 开 | 开 | P2 的对照面板/表单操作时暂停 |
| 关键日记、照片、Nora 原件、来源抽屉 | 暂停并收起 | 静默保留未读 | 不在重要阅读上盖广告或强切聊天 |
| 酒店同步异常及待完成的关键演出 | 关，现有弹窗立即移除 | 普通消息延后提示 | 不是等弹窗寿命到期；收藏状态保留 |
| 位体教公共官网 | 不主动投放 | 前半段允许、阅读时静默 | 正规机构页面保留自己的质感；广告夹仍从统一菜单可开 |
| P4 起的信号、合成账号、照片深查、CCTV、B-3、Final Trace | 关 | 普通问候不弹，仍记未读 | 回微信也不突然重播广告；剧情消息走专用事件 |
| H1/H2/H3、字幕证词、结局/GAME OVER | 关 | 只展示该节点固定消息 | 不在脸谱或证词上叠搞笑弹窗 |
| 玩家主动回看结局后的普通资料 | 默认不自动恢复投放 | 不再推日常调度 | 玩家若回到明确的普通浏览模式，再按设置恢复，不积压爆发 |

保留 25 组原广告的不同布局、小互动、收藏、关闭、减少动态和“取消广告推送”。不因关闭广告而少任何 P5 原件。广告投放不提交谜题答案，也不触发关卡。

许可场景沿用现有节奏与去重，暂停期间不扣倒计时。恢复平静浏览后有短暂宽限，最多按容量恢复，不补发恐怖期间“错过”的广告。减少动态时关闭广告闪烁；键盘焦点、当前输入和唯一主操作不得被弹窗遮住。

普通通知沿用首条 30–40 秒、以后 60–120 秒的合适浏览时机；这些是日常调度，不是剧情定时器。进入恐怖链后暂停普通问候。原来的六秒警告风暴不直接由旧 C9 带入新故事；保留表现能力，若以后选用，必须作为有来源、无历史污染的固定节点，不让所有家人突然知道教会秘密。
