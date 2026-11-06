# Stillwater Hotel 2.0 · Stage 2 开发记录

日期：2026-11-06（UTC）。版本：4.21.0。以用户上传的《Stillwater 2.0 Master Blueprint》为依据；[Stage 0 的新旧对照、全程路线与参考核查](https://github.com/RieyekiWong/123/tree/plan/stillwater-2-stage0/docs/stillwater-2-stage0)仍保留。

这次完成 P0、P1、P2 和前半段的普通浏览内容。位体教、声音分轨、照片叠片、CCTV、B-3 新剧情与结局演出仍按后续阶段制作。不能把能走通的占位路线当作完整重制已完成。

## 玩家实际会经历什么

1. 微信保留当前框架与七位日常联系人。楚人的旧会话一开始就能打开，包含 31 条跨年份聊天、五张已有生活照片、人物介绍和最后一条可靠消息。阅读这些内容不影响主线开放。
2. GG 私聊依次发送蓝图里的六句话，再发论坛卡片。约 34 秒可见聊天时间后送达；输入、查看其他联系人或不理会旧照片都不会卡住入口。离开微信后不补播日常开场。
3. 新论坛主帖讨论旧酒店网站为什么恢复。另有原来 14 篇日常帖子，标题、正文和回复不改，四个分区、头像、主题目录与侧栏都能使用。旧兼职主帖不再是 2.0 的入口，原版仍保留它。
4. 玩家阅读停业报道和网站恢复公告。两栏分别保留年份；关闭第二份资料后保存核对，显示简短结果。读完关闭结果便进入酒店，不需要再找页面底部的继续按钮。
5. 酒店有首页、客房、餐饮、往事、旧站留言、修复计划、联系资料组七页。先看到正常资料馆，再从 2023 年咨询中的 `W. Churen / Chicago student` 打开原文和重建条目。
6. 玩家选择两条有原件支持的理由。核对保存后，固定消息把公开记录分享给 GG；他问“谁在给他办入住啊？”。系统状态从“审核通过”变为“身份关联待补全”，原件仍可回看。读完关闭结果，直接进入 Sylvia 的修复项目与 Phase Self 署名。

酒店首页使用蓝图给定的中英文正文。其余文字分别按社区发帖、普通咨询、酒店目录、项目介绍来写，避免让所有人都说档案术语。2007 年停业、2023 年咨询与失联、2026 年重建保持清楚，不恢复旧 R-4829 支线作为独立任务。

## 本阶段验证规则（开发说明）

| 项目 | 正确规则 | 不会触发完成的操作 |
|---|---|---|
| P0 | 打开生活照片或最后消息，保存 `oldFriendContextViewed`；无通关门槛 | 没看旧资料不会阻止 GG 发卡 |
| P1 | 两份可读附件均已打开，且第二份阅读抽屉已关闭；记录酒店 2007 停业、网站 2026 恢复 | 只读一份、只点官网入口、调用旧占位 checkpoint |
| P2 | 已实际打开人物关联页；三份来源可访问；恰好选择“酒店在 2007 已停业”和“2023 原提交是照片咨询” | 姓名相同、照片分辨率低、少选、多选、单纯打开资料或点击占位 checkpoint |

P2 的结论是“重建条目不足以证明正常办理入住”。它不声称楚人从未到过酒店，也不把证据不足写成确定的否定。错误理由有具体反馈，选择、笔记和已查看来源保留，不重置章节。

每题都有三级手动提示。前两题已移除“验证这一幕的转场”占位按钮；后续 P3–P7 仍明确标注占位。

## 文件与责任

| 文件 | 修改内容 |
|---|---|
| `sw2-front-data.js`（新增） | 四份双语原始资料、论坛主帖与六层回复、理由卡、酒店菜单 |
| `sw2-front.js`（新增） | 论坛附件教学、七页酒店、原始/重建并排对照、理由提交、三级提示、素材来源 |
| `sw2-front.css`（新增） | 温和浅色的旧酒店页面、论坛附件区与手机单列；只作用于 2.0 |
| `sw2-opening-data.js`（新增） | 31 条普通历史消息、五张已有原创生活图的图注、人物背景 |
| `sw2-chat-story.js` | 六条 GG 私聊、正常群聊、固定 P1/P2 反馈；继续使用现有聊天模型 |
| `sw2-data.js` | 引用真实前半资料，增加酒店路由和 P2 反馈；后半来源明确保留占位 |
| `sw2-progress.js` | 两题实际验证、理由草稿、朋友背景标记、精确任务入口和旧预览迁移 |
| `sw2-pages.js` | 接入新网站；工作笔记区分“已核对”“旧预览保留”和后半路线检查 |
| `sw2-app.js` | 原始条目打开、保存理由、分享固定消息、状态变更、关闭阅读后推进与无效路由恢复 |
| `forum.js` | 增加可选帖子集、路由前缀和附件插槽；默认调用仍保持原版帖子与链接 |
| `chat-opening-view.js` | 增加可选可见性、人物说明插槽，邀请预览从当前剧情的消息列表取值；原版默认不变 |
| `edition-bootstrap.js`、两个 HTML、`site-files.mjs`、package 文件 | 更新版本和正确加载顺序，把新增文件加入部署白名单；无新依赖 |
| 两份 `v2-remake` 测试 | 新验证、错误组合、兼容迁移、普通浏览、照片、双语、精确返回与三种预览结局 |

## 存档和已有玩法

继续使用独立的 `stillwater-story:2.0:prototype:v1`，增加 `storyRevision: 2`，不重置原 `stillwater-case:v2` 或 `stillwater-chat:v1`。

- Stage 1 没有新增字段的记录可以迁移。已经到监控、B-3 或结局的玩家仍可继续；三个结局 ID 保留。
- 旧 P2 只做过转场检查，迁移后明确记为 `compat: stage1-route-check`。保留其解锁，不伪造新增理由已验证。
- 新存档必须保存真实方法和两条理由。缺失验证信息不能凭结果字段解锁后半。
- 损坏或未知未来版本保留原文，不静默覆盖。原版 schema-two 的证据、B-3 与结局逻辑完全未改。
- 原微信 AI/Cloudflare、协议、人物 Prompt、独立记忆与本地备用未修改，也没有新增 Worker 角色或 Secret。
- B-3 六接头与 90° 旋转算法未修改，16,384 组合的原审计指纹仍通过。新剧情中的正式接线界面仍待 Stage 5 接入。
- 原 W3-02 系统和全部 25 组普通广告内容未改。2.0 前半普通浏览可弹广告；核对条目、阅读抽屉、关键反馈及恐怖链暂停广告和闲聊通知。微信仍只在右下弹广告，收藏与关闭推送保留。

## 素材范围

没有制作新剧情图片、视频或音频；页面核查截图只保存在临时目录，不作为游戏素材。复用并逐张查看了现有原创虚构楚人相册：咖啡店、朋友街头合照、家庭餐桌、二手相机、校园打印室。没有用现实人物扮演失踪朋友。

酒店复用现有授权照片，并提供具体作者、许可和来源；说明它们是虚构场景的视觉素材，不把 2018/2024 年现实酒店照片伪称为 2006 年证据。Nora 的 2006 员工大合照尚未制作，本阶段用普通员工便条引入她，不把单人图冒充合照。后续证据叠片和合照仍须按素材计划制作。

## 参考如何落实

以下沿用 Stage 0 已核查的公开参考，说明本次的实际用途；不是对参考游戏完整玩法的评测。

| 模块 | 4–5 个参考与借鉴点 | 使用边界 |
|---|---|---|
| 朋友旧事 P0 | [OXENFREE][ox]：先有朋友关系；[Hypnospace][hyp]：普通生活内容可独立阅读；[Apple Feedback][apple]：邀请轻量可忽略；[W3C 状态消息][status]：未读和推进分开；[MDN dialog][dialog]：相册可关闭、有焦点返回 | 不复制人物、对白、截图或品牌动画，不让日常消息代替主线触发 |
| 论坛与 P1 | [Hypnospace][hyp]：不同日常话题；[Cameron’s World][cameron]：旧网密度；[OldWeb][oldweb]：年代按钮；[Wayback 帮助][wayback]：来源与恢复时间分开；[NN/g 分层展示][nng]：先两份易读附件 | 原日常帖逐字保留，不搬参考作品的站点、素材，不伪造真实归档认证 |
| 酒店资料馆与 P2 | [Historic Hotels][historic]：设施、餐饮与历史分栏；[Stanley About][stanley]：普通酒店语气；[OldWeb][oldweb]：浅色旧导航；[Wayback 帮助][wayback]：2023 原件与 2026 重建分开；[Her Story][herstory]：从两份资料提出自己的问题 | 真实酒店不作为失踪案原型；许可图片有来源，不复制酒店故事或参考游戏案件 |
| 引导与回看 | [NN/g][nng]：按需逐级提示；[MDN dialog][dialog]：关闭阅读后推进；[MDN History][history]：具体 query 仍是页面位置；[MDN Storage][storage]：版本隔离和失败保护；[W3C Focus][focus]：手机和键盘操作可达 | 不强制倒计时，不自动给答案，不把玩家送回默认首页，不将过关写入旧存档 |

## 测试结果

- `npm run build` 通过。
- `npm test`：156 项通过。
- 第一轮最终共享回归：64 项浏览器测试通过（原微信、通知、前端站点、原开场及新版）。
- 最终新版补验：16 项通过；两轮合计覆盖 65 个不同浏览器用例，重复部分不重复计数。
- 三条实际 UI 路线：中文 1440px / RELEASED、英文 1440px / UNVERIFIED、中文 390px / AUTO CLOSE。未通过注入过关状态代替游玩。
- 错误理由全部组合、本地迁移、P0 不阻塞、两种附件顺序、关闭与刷新、记录页的理由/草稿/语言切换、全部普通帖子与酒店菜单、键盘操作通过。
- 浏览器在线 AI 验证使用受控结构化接口与失败响应，确认消息回到原联系人及本地备用；没有为测试调用付费 OpenAI，也没有修改线上 Worker。

这不代表后半正式谜题、完整新结局演出、全部其他浏览器或真人试玩已经验收。下一阶段是位体教八页正式内容、Nora 来源冲突与展品，再逐步接回声音、监控和原有 B-3 操作。

[ox]: https://nightschoolstudio.com/oxenfree/
[hyp]: https://store.steampowered.com/app/844590/Hypnospace_Outlaw/
[apple]: https://developer.apple.com/design/human-interface-guidelines/feedback
[status]: https://www.w3.org/WAI/WCAG21/Understanding/status-messages
[dialog]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
[cameron]: https://www.cameronsworld.net/
[oldweb]: https://oldweb.today/
[wayback]: https://archivesupport.zendesk.com/hc/en-us/articles/360004651732-Using-The-Wayback-Machine
[nng]: https://www.nngroup.com/articles/progressive-disclosure/
[historic]: https://www.historichotels.org/us
[stanley]: https://www.stanleyhotel.com/about/
[herstory]: https://www.herstorygame.com/about/
[history]: https://developer.mozilla.org/en-US/docs/Web/API/History_API
[storage]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
[focus]: https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum
