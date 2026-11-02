# V2.3 验证记录

验证在现有仓库上完成；原版和新版仍分别使用自己的存档。线上发布后的提交及字节核对结果以最终交付消息为准。

## 最终通过范围

| 检查 | 结果 | 证据/范围 |
|---|---|---|
| 静态构建 | 通过 | npm run build；新增脚本、样式、低清副本和授权文件均进入 dist |
| 单元与服务器检查 | 23 项通过 | npm test：服务器白名单、原始照片哈希、广告规则、旧主线、存档迁移、空间连接、电路图、损坏的新字段、重新编辑后的恢复路线 |
| 新版浏览器检查 | 46 项通过 | 单工作线程完整复测；中英文从论坛开始的无预置存档路线、旧双结局迁移、三种新版结局、实际设备操作、刷新/语言切换、声音/突脸/减少动态、广告收藏和恢复、异常主题的旧页面可读性 |
| 原版浏览器回归 | 130 个不同用例已通过（含复测） | 全量运行通过 126 项，4 项超时；单线程对相关 5 项复测全部通过，覆盖那 4 项及另一尺寸布局。未放宽原巡检条件或改动旧剧情答案 |
| 中文运行采样 | 145 个状态，无页面脚本错误 | docs/v2.3/browser-copy-review.json，正文及 alt/aria/placeholder 实际采样 |
| 中文源码审查 | 2,473 处基线中文片段；144 组改文 | COPY-AUDIT.zh-CN.md：包含无需修改、重复覆盖、兼容答案及新增文字；标明逐字采样命中与仅源码审阅的区别 |
| 原始事实对照 | 完全一致 | 与 5cb4f4e 的 facts、原始 inventory、C1–C9 source/route/usedFor/unlockedAt 逐项 JSON 对照 |
| 图像授权 | 通过 | 20 张原照片字节保持不变；25 个低清显示副本各有尺寸和哈希；新增面具为 Wilfredor 的 CC0 实拍，另有来源表 |
| 鼠标波纹 | 通过 | 光标进入/离开、局部图层、触屏媒体条件、减少动态；被动覆盖层 pointer-events:none |
| 移动端 | 通过 | 新监控和终端 375/768/1440px；原有页面回归包含 320px，检查横向溢出和屏幕比例 |

176 个不同浏览器用例的通过范围为 46 新版 + 130 原版，**不是宣称首次全量运行全部通过**。

## 发现、修正和复测

1. 最初独立运行新版 43 项时，42 项通过；旧测试在 hash 切换前查找链接，补上等待路由完成的检查。
2. 原版首次运行 130 项，128 项通过；两项针对旧文字的断言未命中。保留具体的“供电说明”和“下班时间”用语，并对人物介绍的新表达调整对应断言；原操作逻辑不变。
3. 首次合并全量为 169/175。两个新测试将旧存档写进正在运行的页面，随后旧广告实例在 pagehide 又保存旧数据。测试改为在新文档初始化时一次性注入旧存档，未修改广告夹的原有键或清空逻辑。另四项原版测试在并发运行时超时，单线程相关 5 项在 1.1 分钟内全过；未删除断言或跳过测试。
4. 增加异常主题回看检查，发现旧楼层图、首页文字底板和论坛回复底板需要一并变色，已修正；新版最终 46 项在 2.3 分钟内通过。
5. 代码审查补充了损坏 night.links / undo 的清洗，避免新字段损坏导致旧案重置；重新编辑最终判断后，深层链接会回到可操作的复核页，而非指向自身。对应单元检查通过。
6. 低清脚本监听动态图片来源，避免原版切换肖像时 srcset 还显示上一张；原源文件及原有惊吓开关/触发机制保留。

## 可重复的命令

```sh
npm ci
npm run build
npm test
npm run test:e2e
# 分组诊断
npx playwright test --project=v2 --workers=1
npx playwright test --project=classic --workers=1
```

`tools/write-copy-audit.mjs` 从固定开工提交读取基线，用 Acorn 清点源码片段，并与本轮实际采样比对。`tools/browser-review.mjs` 需要当前站点 3251 端口和基线快照 3252 端口，主要用于复查和截图，不是游戏运行依赖。`tools/lowres.mjs` 只在开发时运行一次 canvas 缩图，不在玩家浏览时逐帧生成。

本轮完整页面检查使用 Chromium。音效功能已用真实浏览器 AudioContext 验证开启、静音和重载行为；这不等于人工听感验收或所有微信/手机浏览器的硬件测试。没有绕过浏览器自动播放限制，也没有忽略 HTTPS 证书错误来宣称线上浏览通过。

## 截图索引

| 画面 | 调整前 | 调整后 |
|---|---|---|
| 原版 CAM01 | [前](v2.3/classic-camera-1-before.png) | [后](v2.3/classic-camera-1-after.png) |
| 原版 CAM02 | [前](v2.3/classic-camera-2-before.png) | [后](v2.3/classic-camera-2-after.png) |
| 原版 CAM03 | [前](v2.3/classic-camera-3-before.png) | [后](v2.3/classic-camera-3-after.png) |
| 夜班巡检前台 | [前](v2.3/classic-shift-lobby-before.png) | [后](v2.3/classic-shift-lobby-after.png) |
| 夜班巡检走廊 | [前](v2.3/classic-shift-corridor-before.png) | [后](v2.3/classic-shift-corridor-after.png) |
| 夜班巡检客房 | [前](v2.3/classic-shift-room-before.png) | [后](v2.3/classic-shift-room-after.png) |
| 原版手机监控 | [前](v2.3/classic-mobile-before.png) | [后](v2.3/classic-mobile-after.png) |

新增画面：[空间连接](v2.3/camera-connection.png)、[维修门](v2.3/maintenance-door.png)、[局部玻璃波纹](v2.3/glass-ripple.png)、[终端电脑](v2.3/terminal-1440.png)、[终端平板](v2.3/terminal-768.png)、[终端手机](v2.3/terminal-375.png)。
