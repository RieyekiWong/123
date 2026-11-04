# V2.10 验证记录

2026-11-04。当前公网后端部署文件已发布到 main，提交 `0a4650f`。用户已完成网页手动部署，已取得四次真实 OpenAI 回复，微信前端进入发布和公网验收。

- 构建：`npm run build` 通过。
- 单元：87 项通过，包括七个人物、六种输入表达、上下文隔离、父母不获得群聊知识、旧聊天记录迁移、错误/过期/越权回复拒绝、撤销授权、被浏览器禁止存储的情况。
- Chromium 当前版本全量回归：160 项；首轮 158 项通过，发现两项禁止存储场景，修复 getter 在 try 外求值的问题后两项分别复测通过。没有更改论坛、招聘、酒店、监控、纯黑第三阶段、谜题和结局源码。
- 微信专项浏览器：中英文、桌面/手机共 19 项通过。包含：真实联系人本地备援、独立草稿/未读/滚动、同意前零请求、结构化网络返回、连续消息合并、跨会话迟到回复、错误角色拒绝、API 失败、撤销启用、文件助手零请求、论坛卡片不受在线服务影响。
- 真实 Cloudflare 本地运行时：2 项端到端通过，分别为 Durable Object 后端，以及用户要复制的**单文件 + D1** 后端。包括 CORS、会话签名、持久配额、中文/英文请求、原会话投递、刷新恢复。
- 上述本地端到端使用明确标记的 mock 模式。Responses API 的请求格式、安全选项、所有角色 Prompt、store:false 和错误处理使用受控上游测试；**没有冒称真实语言模型质量已测**。
- 单文件 Worker 在实际 SQLite 中验证原子配额 SQL；同时并发准入、全站/IP/会话额度、输入限制、Secret 缺失拒绝调用、已知秘密和网址拒绝、D1 清理均通过。
- 单文件没有外部 import，也不导出 Durable Object 类，不需要 npm 或迁移。公开 GitHub 文件的 SHA-256 与本地测试文件逐一一致（worker.js、schema.sql、README）。
- `wrangler deploy --dry-run` 通过。没有直接登录用户 Cloudflare 账号或读取其 OpenAI Secret。
- 历史部署前公网复查：`https://damp-rain-a5a6.ywang254.workers.dev/api/health` HTTP 200，正文仍是 `Hello World!`，没有 CORS header。该历史状态已由下方真实后端验收取代。

## 用户手动部署后要做的验收

1. health 为 `mode:ai`、`storage:d1`、`configured:true`。
2. 公网 CORS OPTIONS 必须允许 `https://rieyekiwong.github.io` 和必要的 POST/header。
3. 使用普通虚构句子真实调用 Responses API：妈妈两轮中文、阿哲英文、群聊中英混合；检查返回 `mode:ai`，每条发送人合法，无假网址和提前剧情。
4. 独立私聊不传其他私聊、父母无群聊已知信息；测试关键词探问不会泄露。
5. 然后发布已验证的新前端；再在 GitHub Pages 实际启用 AI 聊天，检查网页真实收到上述公网结果、刷新/切换和接口失败备援。
6. 若公网未部署、无余额、无模型权限、缺少 Secret 或数据库绑定，不应称为 AI 已连接。

## 用户手动部署后的真实后端验收

公网 health 为 ai/d1/configured:true，CORS OPTIONS 通过。真实 Responses API 四次成功：妈妈中文问候、熬夜赶报告后的上下文接话、阿哲英文游戏闲聊、GGbond 中英混合群聊。结果和耗时见 `live-backend.json`，不是 mock；未保存会话 token 或任何 Secret。
