# 微信 AI 聊天 · V2.10

这次只更新新版微信开场与其独立后端。论坛、招聘、酒店、监控、黑色第三阶段、结局、原有 schema-two 游戏存档均保留。

## 当前部署状态

- 前端生产地址已指定为 `https://damp-rain-a5a6.ywang254.workers.dev/api/chat`。
- 2026-11-04 实测此 Worker 仍返回 `Hello World!`；当前开发环境的 `wrangler whoami` 显示尚未登录 Cloudflare。**本地联调成功不等于此公网 Worker 已部署，也不等于已收到真实 OpenAI 回复。**
- 本仓库的 Worker 源码、部署配置和真实 API 验收脚本已提供。生产联通需要下面的部署步骤；无需把 OpenAI Key 发给开发助手。

## 推荐：Cloudflare 网页 Edit code 部署

用户已选择不登录开发环境、直接手动部署。请按 **[完整网页部署步骤](../workers/chat/dashboard/README.zh-CN.md)** 操作：复制 `workers/chat/dashboard/worker.js` 整个文件，在 D1 执行 `schema.sql`，绑定 `CHAT_DB`，保留现有 `OPENAI_API_KEY`，再添加 `SESSION_SECRET` 与两项普通变量。这个单文件不需要 npm、外部 import 或 Durable Object 迁移。

以下保留 CLI 方案作为开发者可选途径，网页部署不需要执行它。

## 可选：用 CLI 部署到已有 damp-rain-a5a6（保留现有 OPENAI_API_KEY）

在自己电脑安装 Node.js 22.12+（推荐当前 LTS）和 Git。在终端逐行执行：

```bash
git clone https://github.com/RieyekiWong/123.git
cd 123/workers/chat
npm ci
npx wrangler login
npm run secret:session
npm run deploy
node smoke.mjs
```

如果已经下载过仓库，先在仓库根目录执行 `git pull --ff-only`，然后 `cd workers/chat`；不必重复 clone。`wrangler login` 会打开 Cloudflare 授权页面，登录拥有 `damp-rain-a5a6` 的账号。

`secret:session` 在本机生成 48 字节随机值，直接通过标准输入上传为 Cloudflare Secret **SESSION_SECRET**，不会在终端输出或写入文件。它不需要你填 OpenAI Key。`npm run deploy` 的目标名称已是 **damp-rain-a5a6**，会替换其 Hello World 代码、建立 `ChatBudget` Durable Object 及迁移，并保留已存在的 **OPENAI_API_KEY** Secret。

如账号下有多个 Cloudflare Account，Wrangler 提示时选择包含该 Worker 的账号。不要把 Secret 写进 `wrangler.jsonc` 的 `vars`。不要使用临时预览账号替代自己的账号，否则不会更新已有地址。

部署成功后，打开：

<https://damp-rain-a5a6.ywang254.workers.dev/api/health>

应看到 `service: "stillwater-chat"`、`mode: "ai"`、`configured: true`。这只说明后端配置齐全。接着运行 `node smoke.mjs`：它会真实请求 OpenAI 四次（使用虚构测试句子，产生少量 API 用量），检查中文、英文、中英混合、妈妈的两轮上下文与 CORS。最后应出现 `PASS: live Responses API...`。如果没有 PASS，不能当成上线成功。

回到 GitHub Pages 的微信页面，点右上角「AI 聊天」→阅读说明→「同意并启用 AI 聊天」。发送普通消息，应显示在线 AI 回复；打开开发者工具 Network，可看到 `/api/chat` 返回 `mode: "ai"`。仅出现绿色玩家气泡、或显示「本地回复」，都不是在线 AI 已接通。

## 配置在哪里

| 位置 | 内容 | 公开？ |
|---|---|---|
| Cloudflare Worker Secret `OPENAI_API_KEY` | 你已经添加的 OpenAI 项目 API Key | 否 |
| Cloudflare Worker Secret `SESSION_SECRET` | `npm run secret:session` 自动生成，用于签名半小时会话 | 否 |
| Worker `wrangler.jsonc` 的 `vars.OPENAI_MODEL` | 默认 `gpt-6-luna`，以后可在后端修改 | 是 |
| Worker `vars.CHAT_MODE` | 生产 `live`；本地 dev 命令覆盖为 `mock` | 是 |
| Worker `vars.ALLOWED_ORIGINS` | 已包含 `https://rieyekiwong.github.io`，不包含 `/123` 路径 | 是 |
| 前端 `chat-config.js` | Worker HTTPS `/api/chat` 地址；可选 Turnstile **site key** | 是，不可放 Secret |

`chat-config.js` 只负责路由，不能配置模型、API Key、服务端额度或游戏进度。GitHub Pages 不需要也不应该接收 OpenAI Secret。

现有 Worker 如果通过 Cloudflare 控制台「编辑代码」只粘贴一个片段，不会自动建立这里的 Durable Object 命名空间与迁移。请使用上面的 Wrangler 部署完整目录，避免出现「有代码、没有配额绑定」的半成品。

## 可选：Turnstile 防滥用

未启用 Turnstile 时，后端仍有真实的全站、IP、会话、并发和令牌预算限制，并非只靠 CORS。公开匿名接口仍可能被人耗尽当天额度；需要更强保护时建议加 Turnstile：

1. Cloudflare 控制台创建 Turnstile 小组件，允许 hostname `rieyekiwong.github.io`。
2. `npx wrangler secret put TURNSTILE_SECRET`：只在本机交互输入小组件 **secret key**。
3. `wrangler.jsonc` 设置 `REQUIRE_TURNSTILE: "true"`；前端 `chat-config.js` 填小组件公开的 `turnstileSiteKey`。
4. 重新部署 Worker 和前端。验证脚本需要新鲜 `CHAT_TURNSTILE_TOKEN`；正常玩家由启用对话框里的小组件完成验证。

小组件脚本只在玩家点击同意以后才加载。服务端检查 `success`、hostname、action，并只发放短时签名会话。禁止把 Turnstile secret key 填进前端。

## 人物、存档与上下文

- 保留 54 条主群脚本与唯一论坛卡片；AI 不获得 case 存档或操作接口，不能改变谜题、结局、线索或路由。
- 七个私聊：GGbond、张靓颖666、小林鸽子、妈妈、爸爸、奶茶不要冰、阿哲。各有八条中英文普通历史消息、不同头像、独立说话设定和回复节奏。午饭群与文件传输助手保留。
- 每次请求最多最近 20 条当前聊天（总 9,000 字符、单条输入 2,400 字符）。较早长消息适当截断；不发送完整历史、草稿、滚动位置、未读数或酒店存档。
- 家人与普通朋友永远不接收主群上下文。三个群成员在私聊中、且玩家提及群聊相关话题时，才附带最多六条已显示的群聊消息；没有未来脚本。
- 当前实现采用有界近期历史，不额外生成或上传长期人物摘要。聊天本地记录保留最多 400 条动态消息（固定脚本受保护、各房间公平裁剪），每人八条初始历史独立保留。
- 同房间连续输入在 650ms 窗口内合并，旧请求取消、过期结果丢弃；不同房间不混用上下文。私聊等待不阻塞主群自动分享，切站后已开始的回复安静写回原会话。
- GGbond 通常约 0.55–1.25 秒起；张靓颖666 有短连发；小林通常一条；妈妈第二条可能延后；爸爸通常延迟 16–28 秒，先显示已送达。AI 耗时可能延长等待；约 11 秒网络超时会改用本地回复。玩家无需等待私聊才能继续游戏。
- 消息、草稿、未读、滚动位置、人物近期记忆仍在独立的 `stillwater-chat:v1` schema-one 中；兼容旧存档，刷新和语言切换不清除。刷新不会自动重放尚未完成的付费请求。只有确认重开清聊天记录。
- 在线同意独立保存在 `stillwater-chat-ai:v1`，绑定配置的 Worker 地址；会话令牌只在 sessionStorage。可随时撤销，进行中的请求立即取消。

## 安全、隐私与费用边界

- 仅 Worker 调用 `https://api.openai.com/v1/responses`。`store: false`、`background: false`、无 tools、无 previous_response_id、无 OpenAI Conversations 持久化。输入作为不可信聊天记录，不作为系统指令。
- 角色 Prompt 在后端，各人独立。结构化 JSON 严格 schema；前后端均检查允许发言者、消息数、长度、禁止链接和常见隐藏剧情名词；文本经过转义显示。无法保证任何语言模型永不胡说，但它没有可调用的游戏权限，错误回复也不能推进剧情。
- Worker 不记录聊天正文或真实身份；持久化配额只含当日加盐 HMAC 的 IP 摘要、随机会话计数、时间和用量，不存原 IP 或聊天内容。24 小时无活动后清除，UTC 换日重置。Cloudflare 自身网络元数据按其政策处理。
- OpenAI 默认不使用 API 数据训练（除非组织主动选择分享）；**store:false 不等于零保留**。默认滥用监测日志可能保存最多 30 天；ZDR 需要另行获批。首次启用对话框明确说明第三方处理，玩家可以拒绝并继续本地聊天。
- Durable Object 以事务做全局强一致配额：默认全站 300 次/UTC 日、300,000 保守预留令牌/日，每 IP 60 次/日和 6 次/分钟；会话同样限 60/日、6/分钟，并发全站 6、每会话 1。模型请求前预留 UTF-8 输入字节数+输出预算+余量，失败也不退回，宁可少用额度。
- 更换 IP 或新建会话不能突破全站上限。无有效签名会话无法请求模型；CORS 只是浏览器来源约束，**不是身份认证**。未配置配额绑定、签名 Secret 或 API Key 时生产接口关闭，不能绕过限额调用。
- 默认模型 `gpt-6-luna`、`reasoning.effort: none`、最多 640 输出令牌。2026-11-04 官方标准价格：输入 $0.10/百万令牌、缓存输入 $0.01、输出 $0.50。模型和价格以后会变，以官方页面为准；在 OpenAI 项目后台也设置预算提醒/限额，并查看实际账单。Cloudflare 费用另算。
- 503、余额/限流、超时、无授权、验证失败、错误角色/泄露线索/网址等均使用本地备援。技术状态出现在聊天气泡外，不由角色念出报错。文件助手不会请求 AI。

## 本地验证

```bash
npm ci
npm run chat:install
npm run build
npm test
# 终端 1：真实 Cloudflare 本地运行时，明确是 mock，不需要任何 Key
npm run chat:dev
# 终端 2：前端
node server.mjs --port 3110
# 浏览器打开 http://127.0.0.1:3110/index-zh.html
# 同意启用后界面会标为「接口模拟测试」，不冒充真实 AI。
npx playwright test tests/v2-chat.spec.mjs tests/v2-chat-ai.spec.mjs --project=v2
npx playwright test --config=playwright-chat-worker.config.mjs
npm run chat:check
```

部署后真实验收：在 `workers/chat` 目录运行 `node smoke.mjs`，并从 GitHub Pages 点启用 AI 后实际聊天。模拟测试与 mock 上游契约测试不能证明真实模型的说话质量；最终自然度、模型可用额度和线上延迟必须在部署后确认。

## 官方资料

- [GPT-6 Luna 模型、Responses 支持和价格](https://developers.openai.com/api/docs/models/gpt-6-luna)
- [当前 API 价格](https://developers.openai.com/api/docs/pricing)
- [Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create)
- [OpenAI 数据控制与保留](https://developers.openai.com/api/docs/guides/your-data)
- [Cloudflare Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Durable Object 存储与事务](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)
- [Turnstile 服务端校验](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
