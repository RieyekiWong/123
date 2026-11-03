import { readFile, readdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { inventory } from "./copy-inventory.mjs";
const baseline = "752665237cfec7d78033de0775f6341712671419";
const names = (await readdir(".")).filter(
  (f) =>
    /^(case-|forum|ad-|index(?:-zh)?\.html$|site-media\.js$|retro-media\.js$|cctv-scenes\.js$)/.test(
      f,
    ) && /\.(js|html)$/.test(f),
);
const current = Object.fromEntries(
  await Promise.all(names.map(async (f) => [f, await readFile(f, "utf8")])),
);
const old = {};
for (const f of names) {
  try {
    old[f] = execFileSync("git", ["show", baseline + ":" + f], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {}
}
const before = inventory(old),
  after = inventory(current),
  edits = JSON.parse(await readFile("docs/v2.4/copy-changes.json", "utf8"));
const voice = (f) =>
  f === "case-welcome.js" ? "游玩声明／偏好设置" : f.startsWith("forum")
    ? "论坛网友／社区界面"
    : f.startsWith("ad-")
      ? "虚构商家／广告夹"
      : f === "case-space.js" || f === "case-events.js"
        ? "现场观察／设备状态"
        : f === "case-night.js"
          ? "监控与配线设备"
          : f === "case-comfort.js"
            ? "浏览设置"
            : f === "case-app.js"
              ? "招聘／导航／系统提示"
              : f === "case-pages.js"
                ? "酒店前台／员工档案／Mara"
                : f === "case-data.js"
                  ? "原始记录／核对选项"
                  : f === "locale-zh.js"
                    ? "原版中文译文，保留专用解谜措辞"
                    : f === "support-chat.js"
                      ? "前台／主管／迪伦／冒充者"
                      : f === "branches.js"
                        ? "原版支线人物／巡检系统"
                        : f === "afterword.js"
                          ? "管理团队／迪伦录音与警告"
                          : f === "career.js"
                            ? "原版招聘平台"
                            : f === "instructions.js"
                              ? "可选游戏说明"
                              : f === "site-media.js"
                                ? "实拍图片说明"
                                : "原版档案／网站控件";
const rows = after.map((r, i) => {
  const edit = edits.find((e) => e.file === r.file && r.text.includes(e.after));
  const retained = before.some((b) => b.file === r.file && b.text === r.text);
  return {
    id: i + 1,
    ...r,
    voice: voice(r.file),
    status: edit ? "改写" : retained ? "保留" : "新增／结构调整",
    before: edit?.before || (retained ? r.text : ""),
    reason:
      edit?.reason ||
      (retained
        ? "保留现有用语；未以润色为由改动角色陈述、编号、时间或解谜指令。"
        : "本轮新增交互或改为分层显示；简短描述眼前状态及能操作的设备，不增加密码答案。"),
  };
});
await writeFile(
  "docs/v2.4/copy-inventory.json",
  JSON.stringify(
    {
      baseline,
      candidates: rows.length,
      files: new Set(rows.map((r) => r.file)).size,
      rows,
    },
    null,
    2,
  ) + "\n",
);
const esc = (s) =>
  String(s)
    .replaceAll("|", "&#124;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\n", "<br>");
let report = `# V2.4 中文复查与修改对照\n\n基线：\`${baseline}\`。保留 [V2.3 全量审查](COPY-AUDIT.zh-CN.md) 与已有 144 项修改，按用户最后要求，本轮仅复查新版运行时文本；旧版源代码与此前审查报告保留，不再继续扩展。\n\n本轮重点：去掉招聘页“工作样本样本”的重复；让前台、员工字段和现场观察各用各的语气；门锁电源与录像信号分开说明；减少“保留、转存、归属”等抽象用语；旧版谜题需要逐字识别的文本、英文答案、编号与时间不改。论坛和七家广告的自然闲聊与笑话保留，不为制造修改数量而重写。\n\n## 本轮实际替换\n\n| 文件 | 修改前 | 修改后 | 原因 |\n|---|---|---|---|\n`;
for (const e of edits)
  report += `| ${e.file} | ${esc(e.before)} | ${esc(e.after)} | ${e.reason} |\n`;
report += `\n## 新增段落的口吻\n\n- 当前目录与留言只显示被改写的结果；历史副本继续保留原话。异常发生后才出现设备入口。\n- 通道观察只说看到了什么，如“推车挡在维修柜前”“灯变绿了”，不用长段剧情解释。\n- 设备错误分别指出推车挡门、柜门未开、门锁缺电、录像未连通、回写未隔离、模式不对；不替玩家旋转接头或填答案。\n- 4.4.1 前置声明明确告知鬼脸默认开启、音效默认关闭，两者可自行选择，跳过不影响剧情；这段是用户要求的偏好选择，不是任务教程。\n- Mara、迪伦、里德与原版冒充者的身份及故事不改。\n\n## 全量现行文本清单\n\n以下 ${rows.length} 项来自 ${new Set(rows.map((r) => r.file)).size} 个运行时源文件，以 Acorn 提取中文字符串与模板片段，并列出 HTML 文本和属性。它是源代码候选片段清单，含动态片段和重复出现项，不冒称同等数量的独立页面或浏览器可见句子。完整机器记录在 [copy-inventory.json](docs/v2.4/copy-inventory.json)。代码差异可用上面的基线逐项复核；纯结构变化不虚构逐句对应。\n\n| 文件:行 | 角色 | 处理 | 基线原文（有对应时） | 当前中文 | 依据 |\n|---|---|---|---|---|---|\n`;
for (const r of rows)
  report += `| ${r.file}:${r.line} | ${r.voice} | ${r.status} | ${esc(r.before)} | ${esc(r.text)} | ${r.reason} |\n`;
await writeFile("COPY-AUDIT-V2_4.zh-CN.md", report);
console.log(
  JSON.stringify({
    candidates: rows.length,
    files: new Set(rows.map((r) => r.file)).size,
    actualEdits: edits.length,
  }),
);
