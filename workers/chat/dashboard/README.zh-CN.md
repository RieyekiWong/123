# damp-rain-a5a6 · Cloudflare 网页手动部署

这是你这次要用的部署方式。**不需要安装 Node、npm、Wrangler，也不需要把任何 Secret 发给别人。**

你需要两份文件：

1. **[worker.js](worker.js)**：完整后端，已经合并角色 Prompt、OpenAI Responses API、JSON 验证、CORS、签名会话与持久配额逻辑。复制这个文件的**全部内容**，替换 Hello World。不要复制 `entry.mjs` 或 `src/worker.mjs`：它们是开发源文件，单独复制不能运行。
2. **[schema.sql](schema.sql)**：创建配额数据库表。在 D1 的 Console 执行，只需初始化一次。不会保存聊天正文，也不会删除已有配额。

`worker.js` 没有外部 import、npm 依赖或 Durable Object 迁移要求。它需要一个 **D1 数据库绑定** `CHAT_DB`、现有 **OPENAI_API_KEY**、新 **SESSION_SECRET** 和下方两项普通变量。不要省略数据库绑定，否则公开 AI 接口会拒绝工作。

## 1. 创建配额数据库

1. 登录 Cloudflare 控制台，进入 **Storage & databases（存储与数据库）→ D1 SQL Database**。
2. 点 **Create database**，名字填 `stillwater-chat-quota`，位置保持默认，完成创建。
3. 打开这个数据库，进入 **Console（控制台）**。
4. 打开本目录 `schema.sql`，复制全部 SQL 并执行。如果界面一次只接受一条，按分号把四条 SQL 分别执行。
5. 运行以下查询，应能看到 `chat_quota`：

```sql
SELECT name FROM sqlite_master WHERE type = 'table';
```

数据库只保存随机会话、当日 IP 的加盐摘要、次数和保守预留令牌数。**它不保存聊天内容、原始 IP、API Key 或玩家真实身份。**

## 2. 绑定到你的现有 Worker

1. 进入 **Workers & Pages → damp-rain-a5a6**。
2. 打开 **Bindings（绑定）**，点 **Add binding（添加绑定）**。
3. 选 **D1 database**。
4. Variable name（变量名）必须是 **`CHAT_DB`**，注意大小写。
5. Database 选择刚创建的 `stillwater-chat-quota`，保存/部署绑定。

这里选 D1；不需要创建 Durable Object，也不需要复制 Wrangler 配置。

## 3. 保留 API Key，添加会话 Secret 与普通变量

打开 **Settings → Variables and Secrets（变量与密钥）**。

- **保留**你已经配置的 `OPENAI_API_KEY`。不改、不重新复制、不发到聊天。
- 添加 **Secret**，名称 **`SESSION_SECRET`**，值用下面方法在你自己的电脑安全生成。
- 添加普通 **Text** 变量 **`CHAT_MODE`**，值 **`live`**。
- 添加普通 **Text** 变量 **`ALLOWED_ORIGINS`**，值 **`https://rieyekiwong.github.io`**。不要加 `/123` 路径，也不要加末尾 `/`。

其他非敏感配置可不填，后端会使用默认值。如果要手动选模型，可添加普通 Text 变量 `OPENAI_MODEL`，当前默认 `gpt-6-luna`。

### 安全生成 SESSION_SECRET

**Windows：**在自己电脑的 PowerShell 执行下面整段。它生成 48 字节随机值，直接放进剪贴板，不会输出密钥或保存文件：

```powershell
$chatSecretBytes = New-Object byte[] 48
$chatSecretRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$chatSecretRng.GetBytes($chatSecretBytes)
[Convert]::ToBase64String($chatSecretBytes) | Set-Clipboard
$chatSecretRng.Dispose()
```

随后直接在 Cloudflare 的 `SESSION_SECRET` 值框粘贴，类型选择 **Secret**，保存。保存后清掉剪贴板：

```powershell
Set-Clipboard -Value ''
```

**Mac：**在自己电脑终端执行 `openssl rand -base64 48 | pbcopy`，粘贴到 Cloudflare Secret 后执行 `pbcopy </dev/null` 清掉剪贴板。

不要把这个值写入 `worker.js`、GitHub 或聊天窗口。生成后要长期保留同一个 Secret；每次重新生成会使现有在线聊天会话失效。

## 4. 替换 Hello World

1. 回到 **damp-rain-a5a6**，点 **Edit code（编辑代码）**。
2. 选左侧的 **worker.js**（当前包含 Hello World 的主文件）。
3. 全选原代码并删除。
4. 打开本目录 **[worker.js](worker.js)**，在 GitHub 可点 **Raw**，全选并复制**整个文件**。不要复制页面上的行号、Markdown 代码围栏或 README。
5. 粘贴进 Cloudflare 主文件，点 **Deploy（部署）**。如果界面先要求 Save，再点 Deploy。
6. 不要删除或替换刚设置的 Secret 与 D1 绑定。

## 5. 确认后台确实换好了

打开：

**<https://damp-rain-a5a6.ywang254.workers.dev/api/health>**

正确状态类似：

```json
{"service":"stillwater-chat","version":"4.10.0","protocol":1,"mode":"ai","storage":"d1","configured":true}
```

- 仍是 Hello World：没有部署到这个 Worker，或没有替换主文件。
- `mode: "mock"`：`CHAT_MODE` 没设为 `live`。
- `storage: "missing"`：D1 绑定没有成功，或名称不是 `CHAT_DB`。
- `configured: false`：检查绑定、两个 Secret，`SESSION_SECRET` 至少 32 个字符。
- `configured: true` **不代表 OpenAI 余额和模型权限已验证**。必须继续发消息取得真实回复。

## 6. 再测试前端

前端目标已经设为你的 Worker；新版前端发布后使用：

<https://rieyekiwong.github.io/123/index-zh.html?v=4.10.0#chat>

1. 点右上角 **AI 聊天**，阅读外部服务说明，点 **同意并启用 AI 聊天**。
2. 若正在测试旧缓存，先刷新；看到「接口模拟测试」则仍是 mock，不能算接通。
3. 给妈妈发「今天好累」，再接「赶作业赶了一晚上」；她应根据前文回复。
4. 切到阿哲发 `I played a game yesterday.`，看是否自然用英文接话。
5. 回妈妈聊天，她的上下文、草稿和滚动位置应该保留，阿哲不应知道妈妈那边的事。
6. 浏览器开发者工具 **Network** 中 `/api/chat` 应返回 HTTP 200、`mode: "ai"` 和合法 `messages`；如果回到「本地回复」，不能当成在线 AI 成功。

**完成第 5 步后告诉我「已部署，health 正常」。我会从公网核对 CORS、实际 OpenAI 回复与 GitHub Pages 前端，而不拿本地模拟结果当上线验证。无需发任何 Secret。**

## 公开接口的保护已经写入

这些保护都在后端执行：

- D1 用单条原子条件 INSERT 做配额准入，无并发读写漏洞，也不靠 Worker 内存计数。
- 每 IP 默认每分钟 6 次、每天 60 次；每会话相同限制；最多全站 6 个、每会话 1 个并发请求。
- 全站默认每天最多 **300 次请求、300,000 保守预留令牌**，先达到的限制生效。换 IP、重建会话也绕不过全站额度。
- 每次调用 OpenAI 前预留 UTF-8 输入字节数+640 输出预算+余量，失败不退预算，超时释放并发占用。单次输入 2,400 字符、最近最多 20 条，最多 640 输出令牌。
- 只有玩家同意后才发放 30 分钟签名会话；签名绑定当日匿名 IP 摘要。伪造会话、直接带 Origin 调用不会通过。
- CORS 精确允许 GitHub Pages origin；它不是唯一保护。这个是匿名公开站，别人仍可能耗尽当天额度，但不会无限请求 OpenAI。
- 默认不需要 Turnstile。如以后增加，Secret 仍只放后端，公开 site key 才放前端；详见上级完整文档。
- 没有 D1 表/绑定、Secret 或配置时拒绝调用 OpenAI，前端仍能使用本地备援、主线仍会发论坛卡片。

D1 仅保留配额事件，收到新请求时清理 24 小时以前的记录。如果希望无人访问时也定期清理，可在 Worker **Settings → Trigger Events → Cron Triggers** 添加 `0 0 * * *`（每天 UTC 00:00）。单文件已包含对应 scheduled 清理函数。

如请求达到配额，等待一分钟/次日再试，不要为排错反复删数据库绕过预算。503 时检查 OpenAI 项目余额、模型权限、数据库表和 Secret；不要把 API Key 粘贴进前端调试。
