# Stillwater 2.1 第一章《照片背面》

已接入 2026-11-06 的中文、英文新稿，按地方新闻、专访、商户目录、来信、日记与私人邮件各自的写作场景替换。仅更新独立第一章，未开发第二章。

[打开新试玩](https://raw.githack.com/RieyekiWong/123/preview/xueli-21-news-copy-p0/design-previews/xueli-21-chapter-01/index.html) · [修改前后对照](COPY-CHANGELOG.zh-CN.md) · [中文全文](CHAPTER-TEXT.zh-CN.md) · [English copy](CHAPTER-TEXT.en.md)

托管站第一次可能显示 External Content Notice，点击 **Open the page**。已有旧试玩进度会继续保留；想从头看新文，可以在底部选择“重开样本”，只重开这一章。

## 仍然怎样玩

GG 发备忘 → 点周刊书签 → 从摄影署名找店名 → 手动检索专访或商户目录 → 用姓名查本机邮件 → 填人、店、所找资料 → 自动收到 GG 的扫描。日记和来信可跳过，不勾选引用，不要求读完所有文章。

八份资料保持原 ID、文件名与日期，开场五条、结尾三条固定消息同步双语替换。邮件说明的是约见，不证明实际到访。扫描只带出 Nora 的名字，不解释她的遭遇。

两篇可选扩充 `market` 和 `umbrella` 按交接说明留到第二小批次，本次未增加页面或软件。图像仍待作者绘制，查看 [待绘表](handoff/REMAINING-ART.zh-CN.md)；没有生成美术素材、换字体或重做像素视觉。

## 实测与范围

32 项本地规则及原稿核对通过；中英文在 1920、1440、390、320 宽度各完成一遍，共八条完整浏览器流程。检查检索、别名、否定句、错误保留、刷新、语言切换、阅读位置、旧完成记录和自动消息不重复。详细结果见 [验证记录](verification.json)、[浏览器结果](browser-checks.json)。

修复了 `J. Ward` 被拆成单字母后误中日记的问题；补上 Ms Ward、沃德女士与已建立对应后的 J.W.。明确修正如“不是 Nora，而是朱恩”按最后选择判断，单纯否定不能通过。

独立键 `stillwater-xueli-sample:v1`、schema 和字段保持原样，不清除旧进度。正式微信 AI、Worker、通知、人物记忆、正式存档、B-3 和 main 未变。生产构建、156 项测试及两项正式浏览器回归通过；AI 使用测试替身，无付费调用。

本地启动：

```sh
python3 -m http.server 3135 --bind 127.0.0.1 --directory design-previews
node design-previews/xueli-21-chapter-01/chapter.test.mjs
node design-previews/xueli-21-chapter-01/browser-check.mjs
```

公开试玩仅包含玩家文案、运行代码和测试结果，不包含完整作者交接或世界规则。
