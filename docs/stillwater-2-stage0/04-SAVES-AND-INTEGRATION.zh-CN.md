# 04 · 存档隔离与现有系统接入方案

本文是后续代码的接口规格，不是已经部署的实现。目标是让新故事完全替换调查逻辑，同时保住已能正常使用的微信和旧版进度。

## 1. 版本选择与启动次序

当前入口会先执行一批全局脚本，再由 `case-app.js` 启动；其中 V1.3 和 chat-opening 都会注册包装器。**不能把 2.0 文件简单追加到这些脚本后面**，否则两个故事可能同时推进。

拟新增 `edition-bootstrap.js`：

1. 读取明确 URL 的版本前缀与本机版本选择；显式深链接优先。
2. 有 1.x 进度而尚未选择时，显示“继续原来的调查 / Continue your investigation”与“开始《第二个自己》 / Start The Second Self”。说明新故事有独立进度，原进度保留。
3. 先加载共享聊天、协议、基础媒体和样式，再加载**仅一个版本**的剧情数据/提供者/控制器。
4. 原版按现有顺序加载原全局运行时；新版本不运行旧 CaseApp、V1.3 包装器和旧 C1–C9 转场。
5. 新版的固定消息、联系人和开场提供者在 ChatModel hydrate 前准备好。随后创建 chat、messenger、音频和广告，最后挂载路由。

两个 HTML 的清单顺序一致，页面语言只决定展示，不决定剧情版本。显式 `#terminal` 继续走原版；`#sw2/...` 走新故事。没有 hash 时才参考版本选择与最近地点。冻结 classic 不加入口。

Stage 1 的文字骨架属于开发预览；用 `edition=2.0` 标识故事，但保存到 prototype 专用 key，发布版不能把占位按钮走完的状态当作正式解谜结果。

## 2. 存储命名与兼容

| 用途 | 原 key 保持不变 | 2.0 拟定 key |
|---|---|---|
| 当前选择 | 无 | `stillwater-edition:v1`，只记录 edition，不保存剧情 |
| 故事与谜题 | `stillwater-case:v2` | `stillwater-story:2.0:v1` |
| 文字预览 | 无 | `stillwater-story:2.0:prototype:v1`，与正式进度隔离 |
| 聊天 journal | `stillwater-chat:v1` | `stillwater-chat:2.0:v1` |
| 浏览器恢复 | `stillwater-browser:v1` | `stillwater-browser:2.0:v1` |
| 通知调度 | `stillwater-messenger:v1` | `stillwater-messenger:2.0:v1` |
| 进入和最近页 | `stillwater-prologue:v1` | `stillwater-prologue:2.0:v1` |
| 开场说明 | `stillwater-case-intro:v1` | 新故事说明记录到新状态，不重置旧说明 |
| 转场 | `stillwater-transition:v1` | 新故事事件队列，不复用旧 until 计时 |
| 收藏广告 | `stillwater-ads:v1` | **继续共享此 key** |
| 广告会话 | `stillwater-ads-session:v1` | `stillwater-ads-session:2.0:v1` |
| W3-02 | `stillwater-hotel-promo:v1` | 新 P5 自己记录来源；不覆盖旧 key |
| AI 显式同意 / 临时会话 | `stillwater-chat-ai:v1` / `stillwater-chat-session:v1` | 仍走原 transport，原 endpoint 与同意检查；不迁出 token |

用户未明确重置时，不调用原版 `chat.reset()`、`messenger.reset()` 或 `localStorage.clear()`。重开 2.0 只清该版本的剧情和明确确认的新版聊天记录；广告夹与原版存档不受影响。

## 3. 新故事状态草案

下面是字段说明用的伪结构。所有完成条件仍需验证，不直接相信存档里的 `solved:true`。

```json
{
  "schema": 1,
  "edition": "2.0",
  "contentVersion": "2.0.0",
  "chapter": 0,
  "route": {"current": "chat", "browserReturn": null},
  "puzzles": {
    "P1": {"status": "available", "draft": {}, "result": null},
    "P2": {"status": "locked", "draft": {}, "result": null}
  },
  "sources": {"discovered": [], "viewed": [], "retained": {}},
  "facts": [],
  "events": {"pending": [], "delivered": [], "read": [], "effectsSeen": []},
  "knowledge": {"gg": {"sharedSources": []}},
  "friendRequest": "none",
  "b3": {
    "orientations": [0, 0, 0, 2, 2, 2],
    "isolated": false, "manual": false,
    "savedConfig": null, "undo": [], "originalsRecovered": false
  },
  "hints": {},
  "reading": {"document": null, "returnTo": null},
  "transition": null,
  "preferences": {},
  "endings": [],
  "lastEnding": ""
}
```

正式实现为 P1–P8 各建记录，P0 用非阻塞阅读标记。`facts` 只记原件事实和已经保存的玩家结论，分别标注 `kind:'source'` / `kind:'finding'`；“系统声称持续入住”不能存成“实际入住已证实”。

`draft` 保存日期对照、标记字段、声轨与字幕展开、叠片参数、机位观察、最终选择草稿。滚动和焦点另外属于视图恢复，不算解谜完成。

`result` 保存依据的固定 source ID、原始/修复版本、实际操作结果和验证规则版本。过关、章节开放和可用路由从有效结果派生，而不是从访问了后面的 URL 推回去授予进度。

## 4. 不破坏聊天历史的导入

保留独立新版 journal 的原因：原记录含有 `v12.*`、`v13.*`、旧 s31、已接受的新账号和结局消息。直接共享会让新玩家在开场看到未来剧情；直接覆盖又会丢掉用户的妈妈/朋友聊天。

拟定导入流程：

1. **只读**原 `stillwater-chat:v1`，保留原字符串；新版建立新 journal。
2. 迁入真实的日常 `user/social` 消息、合法人物、各私聊草稿/未读/滚动，限定现有普通联系人及日常群。已保存的用户文字不凭关键词删改。
3. 旧 `script/story`、假王楚人账号、旧 request/delivered、旧开场游标及旧 pending 不复制到新故事；它们仍完整留在原版本。新固定历史由 2.0 提供者供给。
4. 人物记忆按房间从迁入的近期普通对话重建；不复制旧剧情 topic、脚本阶段、未来事件或跨房间摘要。玩家自己曾向联系人提过的内容可以保留为“玩家说过”，不能升级为客观设定。
5. 不带入正在请求中的 AI 队列和旧 requestId。正在返回的原版本回复不写到新 journal；已显示的日常回复可以正常复制。
6. 在版本选择说明“日常聊天记录会保留，旧剧情仍可在原版继续”。如玩家选择全新聊天，明确确认后也只初始化新版 key，原版记录不删除。
7. 对存储失败使用先验证、写新 key、读回校验、最后切换版本的顺序。任何一步失败都保留原记录，不将失败当作成功迁移。

`chat-view.js` 需要增加可选 `storageKey`，默认 `M.KEY`，以及按版本初始化的 story/opening 提供者。M.KEY、原版 hydrate 行为和 transport 协议不改名。新消息 ID 在 hydrate 前注册，避免刷新时被过滤。

以上是迁移规格，需 Stage 1 用真实结构夹具测试，不声称现在已经执行过玩家存档导入。

## 5. 固定剧情与 AI 的边界

| 固定剧情负责 | AI 仍可负责 | AI 永远不负责 |
|---|---|---|
| GG 主帖卡、已发现资料的关键反应、新账号申请、H1–H3、Nora 证词、结局 | 七位日常联系人、正常群聊、用户自由输入、最近对话的自然接话 | 决定谜题成功、打开内部设备、改 ending、编造主线链接、知道未出现的剧情 |

`wcr_old` 仍是旧会话，`wcr_new` 仍由固定/本地故事机制回复，不新增 Worker role。使用 `sw2.*` 稳定 batch ID，不复用 `v13.accepted` 当新剧情开关。

与服务器的数据保持 version 1：当前 room、语言、必要近聊、实际允许的群内上下文。不发送整个新状态、已隐藏来源、终局答案、父母的另一窗口对话或 token 存档。继续使用原先的中文/英文/混合检测、消息结构验证和本地失败备用。

唯一已发现的后端兼容文案是 GG 的“默认知道兼职”和“卡片在群里”假设。计划把它们收敛成版本无关表述：只知道已出现的聊天，固定剧情决定卡片出现在哪里。两版都能使用，不新增请求字段、不重写 API，也不把新秘密加入角色 Prompt。这个小补丁需在后续正式联调时核对用户已部署的单文件版本；没有账户权限就提供同一套可手动部署物，不要求用户交出 Secret。本轮没有进行这项修改。

GG 只能知道真正共享给他的来源。`knowledge.gg.sharedSources` 是固定事件校验用途；只有对应分享卡真实进入该聊天，才触发“我看了你那张图”类台词。它不授权 AI 查看所有档案。

## 6. 路由和返回浏览器

路由注册表保存 `{id, hash, site, chapter, primaryGoal, scenePolicy}`。例如逻辑 `id:'chat'` 映射 `#sw2/chat`，`id:'b3'` 映射 `#sw2/heritage/b3`。对复用 ChatView 的 `getRoute()` 仍返回逻辑 `chat`，避免其现有激活判断失效。

Messenger 增加可选 `storageNamespace`、`parseRoute/formatRoute` 与 `getScenePolicy`；默认继续接受原版 hash。新解析器只接受注册表中有效的站内路径/有限 query，不接受外部 URL。

切入微信：先保存新版 puzzle draft 与精确浏览器 hash，再由现有 bridge 缓存实际 DOM。通知的 room 参数交给 `chat.openRoom()`；不能默认回群。

返回：桌面沿用“返回浏览器 · 原页面标题”的标签栏；手机沿用顶部“返回 Stillwater Hotel”。按以下顺序恢复：

1. 解析并验证原页面可达，保留 query 和源文档 ID。
2. 有缓存 DOM 时恢复它；没有则按新版 draft 重建页面。
3. 按稳定 `data-field-id` 恢复输入、选择、声轨、叠片与机位，不只按元素序号猜测。
4. 下一帧恢复滚动、内部滚动区和输入选区；焦点不落到已经隐藏的按钮。
5. 缺失/非法路由只回当前主要目标，不一律回酒店首页。

刷新时不播放已经完成的 H1–H3；正在读的证词仍打开。浏览器后退到已完成关卡只显示已保存结果及主目标，不重复抢跳转。

## 7. 可靠的剧情事件队列

每个事件用稳定 ID，例如 `sw2.p4.request`，以及 `queued → presented → read → consumed` 状态。`presented` 仅表示画面显示，不等于谜题完成或台词已读。

一次谜题提交将结果与待事件写入同一个新故事记录。跨聊天 key 无法用 localStorage 做数据库事务，因此采用幂等投递：

1. 先保存故事的 pending event。
2. 调用现有 `chat.deliverStory(batchId)`；聊天按同一 batch ID 去重并持久化。
3. 确认聊天保存成功后再把故事标记 delivered。
4. 崩溃发生在 2、3 之间时重投；聊天去重，玩家不会收到两次。保存失败则不消费事件、不假装已跳下一幕。

重要阅读有显式关闭/已读边界；不因为停留了十秒就强制算读完。页面在后台、菜单打开、AI 同意框显示或玩家正在输入时，待转场不抢导航。剧情目标栏提供一处明显返回，不让玩家找藏起来的“继续”。

异步回复、媒体播放与转场带 controller generation；切版本/重开时丢弃过期回调，不能把上一版的回复写进新版。切聊天窗口时不取消正常跨房间送达，仍按原 conversation 记未读。

## 8. B-3 的最小复用方案

保留 `case-night-model.js` 纯函数 `ports/trace/circuit`。2.0 新 wiring adapter 提供 `{orientations, isolated, manual}`，不调用旧 fresh/hydrate，也不伪造 `night.door`、passageReady 或 void.finished。

新的六接头视图与撤销状态接入相同方向编号和矩阵。若后续确需把纯函数抽成共用文件，先以本轮 16,384 组合指纹做逐一等价校验，再让原版和新版同时回归；不要复制一份算法后让两个版本各自漂移。

`savedConfig` 记录实际朝向和模式。任何配置变化立即变成未保存；P7 成功只在当前配置有效并经保存后生成。P8 C 进行最终封存和断开写入，锁定原件仍是明确且可测试的操作，但不要求重新走原版纯黑分类才允许锁定。

## 9. 广告、通知、音频和设置的共享接口

场景策略示例：

```text
{ ads: false, casualNotices: false, tension: 'horror',
  reading: true, soundProfile: 'nora-testimony', canInterrupt: false }
```

广告增加可选策略函数与 session key，旧 allowed 作为原版默认。进入 `ads:false` 时移除现有弹窗、关闭未聚焦的广告展示并保留收藏，不等几秒自动过期。普通输入/弹窗焦点若正被使用，先安全释放到主内容，避免掉失键盘焦点。

通知增加独立剧情阶段策略，去掉新版对 C9/night.started 的依赖；普通问候暂停，未读消息保留。六秒伪消息若以后选用仍不写聊天/AI 历史。

音频保留原总开关、音量与微信提示音，增加新场景选择器，不为了选择曲目伪造 C1–C9。P4 三轨由同一总音量控制；静音时字幕功能完整。刷新后不擅自恢复有声播放，遵循浏览器手势要求。

偏好导入只尊重明确选择：广告关闭、减少动态、已明确跳过鬼脸不重新打开。未明确启用声音不发声。原版“旧自动跳过”兼容规则继续留在旧引擎，不用重跑其演出清理迁移新剧情。

## 10. 旧存档和回滚矩阵

| 旧进度 | 开始 2.0 后 | 返回原版后 |
|---|---|---|
| C1 或 C3/C4 | 新故事从 P0/P1 开始；日常聊天可保留 | 原 clue/provenance 仍在，不重做 |
| 到达 CCTV/B-3 | 不拿旧线路当新 P7 已解；说明新故事独立 | 旧朝向、模式、已保存配置和来源仍在 |
| 已进入纯黑空间 | 不迁入旧分类已完成标记 | 原门/碎片/分类状态继续 |
| 旧结局 | 可随时看旧结局，2.0 不冒充续章 | 三个原 ending ID 与展示正常 |
| 仅有聊天和广告收藏 | 不删聊天、不要求先完成旧游戏 | 原记录、广告夹正常 |
| JSON 损坏或未来 schema | 不覆盖旧原文；给出可恢复说明和单一当前目标 | 不因解析失败清空任何 key |
| 存储写入受限 | 当前会话可继续，提示未保存；不宣称迁移成功 | 仍能打开旧可读记录 |

代码回滚使用 `stillwater-pre-2.0-4.19.0` 与原分支，存档回滚只需重新选择 1.x。没有“先升级覆盖、再试图反推旧进度”的步骤。
