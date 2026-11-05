# 01 · 当前仓库与新旧系统对照

状态：只读审查结论。下面的“改造”均是后续实施计划。

## 1. 基线、发布和命名

| 项目 | 实际情况 |
|---|---|
| 仓库 | `RieyekiWong/123`；审查起点分支 `work` |
| 本机 / GitHub main | `51c80cb13b34f4a07d197e73c265d26fb868e412`，核对一致 |
| 包版本 | `package.json`：4.19.0 |
| 当前故事 | `case-story-v13-*`，内部 `story.schema=2`、`edition='v13'` |
| 页面入口 | `index-zh.html` / `index.html`，同一套 hash 路由 |
| 发布白名单 | 根目录 `site-files.mjs` 中的 `V2_FILES`；`build.mjs` 复制白名单及 assets 到 dist |
| 缓存 | 两个 HTML 以 `?v=` 引用文件。现有引用包含 4.15–4.19，不是所有文件都在 4.19 改动；没有发现应用注册 Service Worker 的代码 |
| 自动发布 | 当前工作树没有 `.github/workflows`，不能声称新增分支会经仓库 CI 自动发布 |
| 线上实际发布来源 | GitHub Pages API：`build_type: legacy`、`source.branch: main`、`source.path: /`；线上直接发布 main 根目录，**不是本地 dist** |
| 依赖和产物 | `node_modules/`、Worker 的 node_modules、`dist/`、test-results 均被忽略；本轮未纳入文档提交 |
| 冻结版 | `AGENTS.md` 指定 classic 与其旧运行时冻结，不进入当前 dist |

后续新故事内部统一称 `edition:'2.0'`，新模块前缀 `sw2-`。保留旧 `v2-*` 文件名和存档含义，不做全仓重命名。

发布差异需要在 Stage 7 解决：本地 server/dist 测试中的白名单，不会自动约束 Pages 根目录发布。正式 2.0 应采用从白名单构建 dist 后上传 Pages artifact 的方式，URL 和 GitHub Pages 前端保持不变；原版恢复文件也纳入明确清单，冻结 classic 和开发答案不进入产物。不能只通过 build 就宣称线上已排除这些文件。本次规划分支不是 Pages 源分支，不触发线上改版。

## 2. 当前实际路线

入口和恢复由 `case-app.js:1` 加载旧 case 存档；`case-app.js:91` 附近读取 prologue。全新玩家进入微信，已有存档和明确深链接保留目的地。

当前 V1.3 的主路径是：

```text
#chat：普通群聊、王楚人旧聊天、GG 私聊固定发现
 → #forum?topic=job
 → #careers：读取工作样本，获得 C1 并激活 V1.3
 → #hotel → #guest-index：查王楚人
 → #source-review?proof=index：2006 姓名索引与旧预订/区域核对
 → #source-review?proof=diary：课程资料、日记及旧聊天
 → #chat?request=1：接受或忽略新账号
 → #source-trace：头像、旧消息与合成出处
 → #rewrite-review：Nora 的夜班被改写
 → #mirror：Helen 邮件与系统变化
 → #cameras：机位地标关联
 → #service-passage：推车、柜体、电源、配线室
 → #terminal：恢复录像、六接头、隔离、MANUAL、保存、W3-02 来源
 → #void：门、碎片、ROOM/GUEST/EMPLOYEE 三次来源核对
 → #ending：auto-close / unverified / released
```

`case-story-v13-model.js` 包装旧 `StillwaterStoryModel`，`case-state.js:685` 的 `canOpen()` 先查 V1.3，再退回旧条件。因此旧页面、旧调查线和 V1.3 并存，不能只改导航文字便认为旧条件已经退出。

### 仍需兼容的早期 C1–C9 路线

| 节点 | 获得条件 / 用途 | 2.0 处理 |
|---|---|---|
| C1 | careers 工作样本 → 预订编号 R-4829 | 不再是入口条件 |
| C2 | 用 C1 查询原预订单，原房号 318 | 退出必经主线 |
| C3、C4 | C2 后可分别查客房目录、02:40 留言 | 旧存档继续；新故事不重复做 |
| C5 | 三楼图与服务区域登记 | 空间方法可供新 P5 参考，旧题退出 |
| C6 | 空间核对通过后看维修记录 | 新故事不借这个标记解锁 B-3 |
| C7 | 夜审排序及性质核对通过后，勾出原稿/修订差异 | 不保留为新故事前置题 |
| C8 | 原始员工与修订身份核对后查看停业资料 | 2007 停业事实转为新 P1 公开资料 |
| C9 | Mara 草稿、最终证据 → 旧夜班 | 不再担任新恐怖章节开关 |

旧 `evidence-desk` 的三栏桌、来源查看与返回能力仍属于原版；2.0 不要求玩家反复完成通用资料分类。

## 3. 模块保留、删减和重写表

| 现有文件 / 模块 | 保留什么 | 2.0 的改造边界 |
|---|---|---|
| `chat-view.js`、`chat-style.css` | 微信界面、气泡、输入、未读、草稿、滚动、手机布局 | 增加可选存储 key 和剧情提供者适配；不重做界面 |
| `chat-model.js` | 近期上下文、异步队列、连发合并、房间隔离、本地备用 | 2.0 固定开场和稳定消息 ID 在 hydrate 前注册；避免旧 s31 分享故事复活 |
| `chat-data.js`、`chat-personas.js`、`chat-fallback.js` | 七位日常联系人、群成员性格和独立聊天 | 不给爸爸妈妈或普通朋友灌入教会秘密；固定剧情与普通聊天分开 |
| `chat-protocol.js`、`chat-transport.js`、`chat-config.js` | 现有协议、同意、Worker 地址、错误备用、取消过期请求 | 不修改接口和 Secrets，不增加 AI 决定关卡的权限 |
| `chat-opening.js`、`chat-story*.js` | 老友生活感、已有固定事件接口和联系人的区分 | 新开场数据使用独立 2.0 提供者；原版内容保持可恢复 |
| `messenger-bridge.js` / intrusion | 通知开正确联系人、浏览器 DOM 缓存、刷新恢复、返回栏 | 注入版本存储、路由解析和场景策略，替换 C9/night 判断 |
| `forum-data.js`、`forum-extra-data.js`、`forum.js` | 论坛外壳、头像、分区、回复结构、闲逛能力 | 重写主帖、证据回复和时代信息，移除必走招聘的跳板；日常帖逐篇审查，不一键清空 |
| `careers.js` | 可作为世界中的普通旧资料 | 退出 2.0 主线，不再要求整理预订才能找朋友 |
| `hotel-extras.js`、酒店页面 | 房型、餐饮、员工生活、温和旧网站质感 | 改成“2007 停业、2026 数字资料馆”，撤下正常营业/订房暗示 |
| `case-data/state/pages/app.js` | 作为完整 1.x 恢复引擎 | 新故事不用 C1–C9 和 finalEvidence 做进度，不继续叠 if 分支 |
| `case-story-v13-*`、`case-story-*` | 当前故事和原版存档的完整备份 | 2.0 不加载其剧情改写钩子；历史事实逐条决定是否引用 |
| `hotel-promo*.js` | 原版 W3-02 和独立保存记录 | 2.0 不加载旧来源核对门槛；P5 可以沿用 W3-02 名称和“原照片”的概念 |
| `ad-data.js`、campaigns、ad 样式 | **25 组全部保留**，包括宠物、电影、维修、刮券等 | 只替换投放许可，不把广告改成教会提示器 |
| `ad-system.js` | 独立广告夹、关闭/收起/收藏、叠层和频率 | 新场景策略收起已有弹窗、暂停计时；微信固定右下；恐怖段不弹 |
| `case-night-model.js` | 六接头、每次 90°、双向端口、连通规则 | 只调用纯接线规则；旧 fresh/hydrate 的走廊、void 前置不进入新状态 |
| `case-night.js`、`cctv-scenes.js`、滤镜 | 机位操作与已有视觉能力 | 新 A/B/C 信号含义与点击观察；时间不是唯一答案 |
| `case-void-*`、`case-final-terminal.js` | 原版纯黑体验和原版存档 | 新终章保留黑暗感，退出三次分类考核；不再重复提交十几份文件 |
| `case-void-signal.js`、events | 已获认可的错帧与静电风格、设置行为 | 新 H1/H2/H3 由剧情事件驱动，旧定时和旧事件 ID 不自动复用 |
| `case-audio*`、comfort/welcome | 声音总开关、音量、减少动态、跳过鬼脸 | 增加新场景映射与独立字幕；不改玩家已明确选择的设置 |
| `case-ending.js` | GAME OVER、结束展示不能授予进度 | 三个旧 ID 保留，新条件和情感尾声由新模型决定 |
| `site-files.mjs`、两个 HTML | GitHub Pages、双语入口、白名单构建 | 新旧启动互斥，新增文件明确纳入发布，版本号同步更新 |

## 4. 关键耦合：不能靠换文案解决

### 微信

`chat-model.js:145` 的 hydrate 只保留当前提供者认识的 story ID；新事件若注册太晚，刷新会丢消息。`send()` 对 `wcr_new` 使用固定故事本地回复，不调用 AI。新故事继续使用这一安全边界。

`chat-view.js:3` 当前把 `M.KEY` 写死为聊天存储；新存档须增加可选参数，默认行为保持不变。AI 的同意和会话另存，不需要新密钥。

`chat-opening.js` 负责新鲜聊天的 V1.2 开场；旧 s31 群分享仍是兼容路径。2.0 启动时必须先选定剧情提供者，否则会出现 GG 同时分享兼职和恢复网站两套故事。

### 网页切换

`messenger-bridge.js:24` 只接受 `#[a-z][a-z-]*`。拟定的 `#sw2/...` 路由会被它拒绝；Stage 1 必须增加注入的解析器，不能声称现有返回功能天然支持新路由。

浏览器正常运行时暂存真正 DOM；刷新后恢复字段、滚动和焦点。新叠片参数、声轨选择等非表单状态还须写入新 puzzle draft，DOM 缓存不能代替进度存档。

### B-3

核心读取规则见 `case-night-model.js` 的 `ports()`、`trace()`、`circuit()`。六点在 3×2 网格，相邻端口方向必须互为反向。A 左侧接入原件，F 右侧输出；另一路写入可隔离。**有效 = 原件可读 AND 已隔离 AND 手动模式 AND 没有通往写入端的污染。**

当前初始朝向 `[0,0,0,2,2,2]`。穷举核查的有效朝向为 `[2,1,2,0,3,0]`，且 isolated/manual 都为 true；这是开发答案，不显示在玩家网页。

需要纠正的接入假设：`fresh()/hydrate()` 还处理旧镜头、旧通道和旧 void；`case-state.js:1211` 保存依赖 passageReady，锁原件还依赖旧 void 完成。这些是旧剧情门槛，并非接线算法。2.0 用独立门槛和上述纯函数，保留旋转/撤销/保存的体验。

### 广告

`ad-system.js:131` 的 allowed 使用旧 C9 和旧 released。新故事不能靠伪装成“已 RELEASED”恢复广告。投放决策改由场景元数据，明确区分普通网页、关键阅读和恐怖演出。

当前普通广告首次合适时机为 3–5 秒，后续 4–7 秒，已有容量/交互/阅读保护；本轮不调频。未来许可场景沿用频率，恐怖场景暂停且不积压连弹。详见 03 的投放表。

## 5. 存档与外部服务盘点

| 当前 key / 位置 | 数据 | 2.0 原则 |
|---|---|---|
| `stillwater-case:v2` | schema 2；evidence、completed、story、night、promo、desk、偏好、三个 ending ID | 原封保留；新剧情另 key |
| `story` 内部 | 早版 schema 1 / 当前 schema 2 edition v13 | 不将旧 findings 映射为新 P1–P8 已解 |
| `night.void` | schema 1；门、碎片、分类等 | 仅原版解释；新终章不迁入这些完成标记 |
| `stillwater-chat:v1` | schema 1；消息、pending、人物记忆、草稿、未读、滚动、旧脚本进度 | 不覆盖；按明确规则复制日常记录到新 journal |
| `stillwater-chat-ai:v1` | 对特定 endpoint 的显式启用 | 保持；不自动启用新服务 |
| `stillwater-chat-session:v1` | sessionStorage：临时 token 与过期时间 | 不导出到进度文件，不纳入版本迁移 |
| `stillwater-browser:v1` | 原网页完整 hash/query、表单和位置 | 2.0 使用独立 key 和解析器 |
| `stillwater-messenger:v1` | 通知剩余等待、联系人轮换、异常演出状态 | 2.0 独立调度；不继承旧异常已播放标记 |
| `stillwater-prologue:v1` | 是否离开聊天及最近 route | 2.0 独立 |
| `stillwater-case-intro:v1` | 开场说明已读、声音草稿 | 尊重原选择；新版本须说明新增内容时不能重开声音 |
| `stillwater-transition:v1` | 旧阶段变色/转场暂存 | 不用于新八幕事件 |
| `stillwater-ads:v1` | 广告夹收藏/收起 | 继续共享，不清空 |
| `stillwater-ads-session:v1` | 广告轮换、等待、短期去重 | 2.0 独立会话 key，沿用投放算法 |
| `stillwater-hotel-promo:v1` | W3-02 查看和来源辅助记录 | 原版保留；新 P5 另记，不冒充已核对 |

前端网络边界在 `chat-transport.js`，线上 endpoint 是 `https://damp-rain-a5a6.ywang254.workers.dev/api/chat`。真实地址已配置，不代表本轮重新验证了线上付费回复。

本轮只读访问 `/api/health`：HTTP 200，`mode: ai`、`storage: d1`、`configured: true`、后端版本 `4.10.0`，CORS 返回 `https://rieyekiwong.github.io`。这核实了现有后端配置和来源许可；没有发送聊天请求，不能用 health 代替真实 OpenAI 回复验收。后端版本号与前端 4.19.0 属于不同组件，不据此宣称部署错误。

Worker 源码是 `workers/chat/src/worker.mjs` 和 personas、配额模块；Dashboard 单文件部署物是 `workers/chat/dashboard/worker.js`，配套 `schema.sql`。两种部署配置分别有 Durable Object 和 D1 路径，不能混为一套数据库绑定。本次不替换现有 Worker。

另有一个现存文案耦合：`workers/chat/src/personas.mjs:3` 预设 GG 已发现整理预订的兼职，末尾又让 AI 告诉玩家“论坛卡会在群里发”。这与当前私聊开场已有偏差，也不适合 2.0。它不影响 API 连通，但会影响人物回复的准确性。后续只将这两处改成“以当前会话已出现的资料为准，固定剧情提供卡片”，不改性格、协议、模型权限或配额；正式采用前需核对实际部署的 Dashboard 版本，不能只改仓库便宣称线上生效。本轮未更改或部署这份提示。

后端已具有签名会话、输入/上下文限制、并发与全站配额；Dashboard 默认每 IP/会话每分钟 6 次、每天 60 次，全站每天 300 次/300,000 预留令牌。密钥仍由 Cloudflare 保管，仓库不需要知道 Secret 内容。模型默认值是当前仓库的配置，**不是本轮重新核准的型号或价格承诺**。

## 6. 本轮实际测试

| 检查 | 结果 | 能证明什么 |
|---|---|---|
| `npm run build` | 通过 | 当前白名单能构建，冻结版不混入 dist |
| `npm test` | **140 / 140** | 当前状态、双语数据、音频策略、广告、聊天、Worker 本地规则、W3-02、证据、V1.3 等基线 |
| 4 份选定 Playwright specs | **34 / 34** | `v2-chat-ai`、`v2-messenger`、`v2-opening`、`v2-v13` |
| 三条完整旧主线 | 通过 | 中文桌面 RELEASED、英文桌面 UNVERIFIED、中文 375px AUTO CLOSE；均包含真实 B-3 操作 |
| 接线全状态 | 16,384 组合 | 保留算法的回归指纹和唯一有效朝向，不是新剧情通关测试 |
| 现有 Worker health | HTTP 200 / ai / d1 / configured | 配置和 Pages CORS 可达；没有调用付费回复 |
| 互联网参考 | 36 个 HTTP 200；4 个补做 JS 正文查看 | 来源存在与正文内容；没有完整试玩参考游戏 |

测试时命令输出放在 `/tmp/stillwater-2-stage0/`，没有生成截图；临时执行环境切换后日志不保证保留，实际结果、命令与源文件指纹已记入 baseline.json。第一次受限运行的服务测试未通过；允许回环测试服务器后原命令重跑，得到上述 140 项通过结果，不把第一次失败藏成通过。

尚未验证：2.0 各幕、真实新音轨、新叠片素材、位体教页面、2.0 迁移实现、2.0 三结局和真人试玩；这些尚未实施。已审查全部关键入口和门槛，但未声称逐字重新审校所有原版闲逛帖。
