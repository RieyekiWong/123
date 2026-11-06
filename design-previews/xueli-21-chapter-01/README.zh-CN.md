# Stillwater 2.1：还没有寄出的照片

本章已换上作者提供的 **Director’s Cut P0 完整中英文正文**。这是一段可以实际完成的独立调查，不是正式游戏的更新。

[打开第一章试玩](https://raw.githack.com/RieyekiWong/123/preview/xueli-21-directors-cut-p0/design-previews/xueli-21-chapter-01/index.html)。托管站第一次可能显示 External Content Notice，点击 **Open the page** 进入。

[开发报告与答案](DESIGN.zh-CN.md) · [中文完整阅读稿](CHAPTER-TEXT.zh-CN.md) · [English reading copy](CHAPTER-TEXT.en.md) · [当前待绘清单](handoff/REMAINING-ART.zh-CN.md)

## 怎么开始

GGbond 收到了一台 2008 年的旧电脑。他把读出的文件留了份副本，发来一篇署名 W.C. 的备忘。谁写的还不能确定，欠咖啡的事却让他想起失踪的朋友。

从附件里的书签开始，读周刊、自己找词搜索，再把人、店和邮件联系起来。最后填三个框即可，不用引用原文，也不用把所有文章都读完。填对后自动收到 GG 的新消息和扫描附件；长文章不会被定时跳转打断。

电脑、硬盘里的文件和现在的聊天分别属于不同年代。邮件确认的是约见计划，不能证明楚人实际到店。扫描上的名字，也没有替那个人的遭遇下结论。

## 这一批包含什么

八份完整资料：备忘、周年报道、小店采访、商户目录、邮件、长椅来信、日记和背面扫描转录。新标题、正文、图注和固定消息均来自新稿，不再使用旧临时文案。生活文章不参与判题。

闲虾交易留存卡、图书馆雨伞杂闻按交接说明留到第二小批次，本次没有新增页面。作者原稿和完整世界规则保留在本地审阅资料，不随公开试玩发布。

像素配色、现有免费字体和已核实授权的通用图标保留。没有生成图片；关键插图继续写“需要画”。目前优先画周年员工合影、June 工作照、合影背面三张，尺寸可按多个 64 像素格横竖组合。修订后的扫描和相机包要求已同步进待绘单。

## 进度与边界

搜索词、未提交的填写、文章位置、字号和提示级别自动保存在独立键 `stillwater-xueli-sample:v1`。刷新、切换语言和程序后可以接着调查。旧样本的草稿与已完成进度保留，损坏存档不被静默覆盖。

正式微信 UI、AI / Cloudflare、人物记忆、通知、正式存档和 B-3 均未修改。这个独立章节只演示固定剧情衔接，不请求在线 AI。正式入口与 main 分支不变。

## 实测

25 项可公开复跑的规则测试通过；另两项与作者原稿的核对已在本地完成，完整稿件不公开。中英文各在 1920、1440、390、320 宽度实际走完，共八次完整流程，另检查旧存档、损坏存档和禁用存储。包括否定句拦截、短别名、可选提示、刷新与语言切换、无图转录、自动新消息只出现一份。详见 [浏览器结果](browser-checks.json) 和 [验证记录](verification.json)。

本地运行：

```sh
python3 -m http.server 3135 --bind 127.0.0.1 --directory design-previews
```

打开 `http://127.0.0.1:3135/xueli-21-chapter-01/`。

```sh
node design-previews/xueli-21-chapter-01/chapter.test.mjs
node design-previews/xueli-21-chapter-01/browser-check.mjs
```
