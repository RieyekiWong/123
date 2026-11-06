# Stage 1 线上核查

客户端日期：2026-11-05（America/Chicago）。用户明确选择“允许更新 main 并部署预览”后，发布提交 `7cd0876aab6f838ffff94724dfe0034b975fc5de`。GitHub Pages 构建状态为 built。

预览入口：<https://rieyekiwong.github.io/123/index-zh.html?edition=2.0&v=4.20.0>。

真实公开站验证通过：

- 中文、1440px、接受新账号、RELEASED。
- 英文、1440px、忽略新账号、UNVERIFIED。
- 中文、390px 手机、忽略新账号、AUTO CLOSE。
- 默认入口运行原 CaseState，未加载 2.0 预览引擎。

三条预览均从微信卡片进入论坛，打开实际来源、关闭反馈后推进，最后显示 GAME OVER；没有注入过关存档。新上下文中的原 case/chat key 始终不存在，未被预览创建。没有横向溢出、JavaScript 页面错误或 API 请求。

核查拦截了全部 `/api/` 请求以避免测试费用；实际捕获次数为零。这不是重新验收付费 OpenAI 回复。未生成截图、音频或图片，Worker 未修改。
