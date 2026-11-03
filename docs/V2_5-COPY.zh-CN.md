# V2.5 中英文文案复查

本轮按新版发行清单审查了玩家界面、聊天、论坛、招聘、酒店、员工文件、设备、设置、广告与结局。没有把旧版脚本混入新版。以 AST 提取包含中文的字符串候选，再按页面和角色通读对应中英文；共 963 个候选，分布于 18 个运行文件。候选包括模板片段、编号说明和输入匹配词，不等于 963 条独立可见文案。数字、字段、时戳和 C1–C9 的正确答案保持原样。

## 按站点的检查结果

- **聊天**：54 条分段消息和回复库按人物口吻处理。GGbond 多短句，张靓颖666 接话吐槽，小林鸽子少说但具体。Rieyeki 不自动发言。改掉草稿中书面化的英文玩笑，以及“工资已写明”与现有岗位页面不符的说法；问后期名字时，朋友不知道答案。
- **论坛**：保留普通帖和回复，不插入游戏旁白。微信卡片与原帖共用标题、作者、日期和摘要，避免两个版本的楼主或背景。
- **招聘**：中文版本身简短具体，保留；英文去掉抽象营销标题和“reconciliation”式职位包装，改成预订记录整理的工作说明。
- **酒店**：首页服务、房型、设施、照片和普通留言维持正常官网语气。没有为了“恐怖”加新句子或把所有房间都改成怪谈。
- **员工资料 / Continuity**：保留原表格证据，缩短英文段落，清楚标出当前待办。停业通知改成行政说明，不由旁白直接宣布系统真相。
- **Mara**：保留现有简短草稿；她已经直接说明查过什么、没有签什么，无需改成总结剧情的独白。
- **监控 / 317 / B-3**：通读方向、地标、柜门、门锁供电和录像接线文案。保留区分门锁电源与录像信号、A 到 F 的原操作说明，以及错误后可继续操作的反馈。没有增加另一轮编号题。
- **广告**：七家店铺的生活化文案和笑话保留。只改变弹窗叠放方式，不将广告变成线索或让其进入聊天、终章。
- **设置 / 结局**：重置说明不再说“从论坛开始”，而是说明聊天也会重置。普通结局只描述本次未提交退出交接，避免在玩家已锁定设备的情况下错误宣称“原件未锁定”。真结局仍明确故事结束、可以关闭网页。
- **素材与提示**：照片署名、来源、静音与跳过选项、无法保存提示继续保留。未把技术实现细节加进普通住客服务文案。

## 实际替换对照

下列 34 项是本轮实际替换的字符串，包含中英文及新增聊天草稿的自查。它们没有全部在上一公开版出现；新增草稿已明确标记。新增的聊天全文不重复列成“旧文案”，可直接查阅 `chat-data.js`。

| 文件 / 范围 | 修改前 | 修改后 |
|---|---|---|
| `case-comfort.js` · 既有界面文案 | 进度存在当前浏览器里。重新开始会清除本次调查、监控与结局记录，从论坛开始。收藏的广告和显示偏好会保留，声音恢复为关闭。 | 进度保存在当前浏览器。重新开始会清除聊天、本次调查、监控和结局记录，从群聊重新开始。收藏的广告和显示偏好保留，声音恢复为关闭。 |
| `case-comfort.js` · 既有界面文案 | Starting again clears this investigation, equipment chapters and endings, and returns to the forum. Saved ads and viewing preferences are kept; sound returns to off. | Starting again clears the chat, investigation, equipment chapters and endings, and returns to the group chat. Saved ads and viewing preferences are kept; sound returns to off. |
| `case-comfort.js` · 既有界面文案 | 清除新版的全部进度和结局记录？ | 清除聊天记录、本次调查进度和结局，重新开始？ |
| `case-comfort.js` · 既有界面文案 | Clear this case and its retained dispositions? | Clear the chat, investigation and ending history, and start again? |
| `case-comfort.js` · 既有界面文案 | Audio could not be enabled. All records can be reconciled silently. | Audio could not start. You can complete the game without sound. |
| `case-app.js` · 既有界面文案 | 日期顺序有误。请检查每条记录的时间。 | 时间顺序不对，请对照每条记录的日期和时间。 |
| `case-app.js` · 既有界面文案 | A careful eye for the historical record. | Part-time reservation records work |
| `case-app.js` · 既有界面文案 | Remote opportunities in archive reconciliation. | Remote work reviewing tables and scanned records. |
| `case-app.js` · 既有界面文案 | Night Archive Reconciliation Assistant | Reservation Records Assistant |
| `case-app.js` · 既有界面文案 | Review sources, reconcile timestamps, compare revisions and retain unresolved entries. No CV, account or contact information is needed for the sample. | Compare old bookings with room records and later changes. The sample needs no account or CV. |
| `case-app.js` · 既有界面文案 | This original is not yet associated with the current review. Identify its source record first. | This file is not available yet. Open it through the related record. |
| `case-app.js` · 既有界面文案 | Return to the role sample and check its original reference. | Check the reference on the job sample. |
| `case-app.js` · 既有界面文案 | A source remains unreconciled. A closing decision cannot be submitted yet. Reopen originals from Case Notes. | Some records are still missing. Reopen the sources in Case Notes before submitting. |
| `case-pages.js` · 既有界面文案 | Read-only access associated with the reconciled night audit. | The retained record for the employee on duty. |
| `case-pages.js` · 既有界面文案 | The personnel index retains her staff identity. A revision of the same transaction changes the record ownership. Both versions retain the same original booking reference. | Two copies have the same booking reference, but different entries in the reviewer field. |
| `case-pages.js` · 既有界面文案 | 当前待办 / OPEN RECORDS | Continuity / 当前待办 |
| `case-pages.js` · 既有界面文案 | Reading the file does not refresh its queue. Request the current assignment for this record. | Refresh to see who is handling this record now. |
| `case-pages.js` · 既有界面文案 | 这条记录还没有结案，需保留一名经手人。 | 记录尚未结案，必须指定处理人。 |
| `case-pages.js` · 既有界面文案 | Every unresolved record must have an owner. | A reviewer must remain assigned until the record is closed. |
| `case-pages.js` · 既有界面文案 | 酒店关门后，旧系统没有完全停下。它还在批量修改以前的记录。表格里写着“已完成”，不代表真的有人确认过。 | 停业后仅保留历史资料查询。批量处理生成的“已完成”标记未经人工复核。 |
| `chat-data.js` · 新增聊天草稿复查 | Surely sleep and deadlines can coexist. | Can’t I sleep AND get my homework done? |
| `chat-data.js` · 新增聊天草稿复查 | Sounds like a lifetime subscription to spreadsheets. | So, spreadsheets forever. |
| `chat-data.js` · 新增聊天草稿复查 | This website has seen things. | This site is ancient. |
| `case-pages.js` · 既有界面文案 | The batch-revision process continued to operate on retained data. A file marked completed does not establish renewed operation or verify its underlying events. | After closure, access is limited to historical records. Completion flags created by batch processing have not been reviewed by staff. |
| `case-pages.js` · 既有界面文案 | 原备注没有改动，这条记录仍待核实。 | 原备注已保留，记录仍待核实。退出交接：未提交。 |
| `case-pages.js` · 既有界面文案 | Mara’s original note is restored. No new guest identity is written into the service position. No successor is needed to confirm it on her behalf. | Mara’s note is retained and the record remains unverified. Exit handover: not submitted. |
| `chat-data.js` · 新增聊天草稿复查 | 有写 但得先看样本 | 说是有 得先看样本 |
| `chat-data.js` · 新增聊天草稿复查 | There’s a rate listed. You try a sample first. | It says it’s paid. You try a sample first. |
| `chat-data.js` · 新增聊天草稿复查 | 工资写在岗位里 我也还没试 | 具体工资我还没问 先看看他让干什么 |
| `chat-data.js` · 新增聊天草稿复查 | The listing mentions pay. Haven’t tried it yet. | Haven’t asked about the pay. Let’s see what the work is first. |
| `case-welcome.js` · 既有界面文案 | 从一条求职帖子开始，像平时上网一样浏览和调查。 | 从朋友的群聊开始，像平时上网一样浏览和调查。 |
| `case-welcome.js` · 既有界面文案 | Begin with a job-search thread, then browse and investigate as you would on the web. | Begin in a group chat with friends, then browse and investigate as you would on the web. |
| `case-welcome.js` · 既有界面文案 | 电脑用鼠标点击，手机直接点按。链接、留言和档案中的引用都可以继续调查； | 电脑用鼠标点击，手机直接点按。群聊可自由输入，Enter 发送，Shift + Enter 换行；朋友发的论坛卡片可以直接打开。链接、留言和档案中的引用都可以继续调查； |
| `case-welcome.js` · 既有界面文案 | Click on a computer or tap on a phone. Follow links, reviews and document references. | Click on a computer or tap on a phone. Type freely in chat: Enter sends, Shift + Enter adds a line. Your friend’s forum card opens the post. Follow links, reviews and document references. |

另外新增：游玩说明中的聊天操作、论坛页脚“回到聊天”、聊天本地存储提示，以及坏结局员工证。它们是功能配套内容，并非对旧剧情的替换。

## 全文索引与复查范围

| 文件 | 中文候选片段 |
|---|---:|
| `case-data.js` | 43 |
| `case-app.js` | 110 |
| `case-pages.js` | 227 |
| `case-comfort.js` | 19 |
| `case-feedback.js` | 16 |
| `case-ending.js` | 14 |
| `forum-data.js` | 46 |
| `forum.js` | 21 |
| `chat-data.js` | 120 |
| `chat-view.js` | 38 |
| `ad-data.js` | 85 |
| `ad-system.js` | 29 |
| `site-media.js` | 30 |
| `case-night.js` | 96 |
| `case-transition.js` | 1 |
| `case-welcome.js` | 23 |
| `case-space.js` | 39 |
| `case-events.js` | 6 |

完整 [字符串索引](v2.5/copy-inventory.json) 和 [替换记录](v2.5/copy-changes.json) 均保留。可运行 `node tools/audit-copy-v25.mjs` 重新生成当前源码索引；截图与流程回归用于检查实际页面，并不把关键词搜索冒充为全部人工验收。
