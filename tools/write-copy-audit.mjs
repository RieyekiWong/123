import { parse } from "acorn";
import { execFileSync } from "node:child_process";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { inventory } from "./copy-inventory.mjs";
const baseline = "5cb4f4e6f81243238f39a6fc6048bd0d9ae9a177";
const files = execFileSync("git", ["ls-tree", "--name-only", baseline], {
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter((f) => /\.(js|html)$/.test(f));
const old = Object.fromEntries(
  files.map((f) => [
    f,
    execFileSync("git", ["show", baseline + ":" + f], { encoding: "utf8" }),
  ]),
);
const currentFiles = (await readdir(".")).filter((f) => /\.(js|html)$/.test(f));
const current = Object.fromEntries(
  await Promise.all(
    currentFiles.map(async (f) => [f, await readFile(f, "utf8")]),
  ),
);
const before = inventory(old),
  after = inventory(current),
  changes = JSON.parse(await readFile("docs/v2.3/copy-changes.json", "utf8"));
const review = JSON.parse(
  await readFile("docs/v2.3/browser-copy-review.json", "utf8"),
);
const normalize = (s) => s.replace(/\s+/g, "").replace(/[“”「」]/g, "");
const seen = review.snapshots.map((s) =>
  normalize(s.text + " " + s.attributes.join(" ")),
);
const covered = (text) => {
  const v = normalize(text);
  return v.length > 1 && seen.some((s) => s.includes(v));
};
const esc = (s) =>
  String(s)
    .replaceAll("|", "&#124;")
    .replaceAll("\n", "<br>")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const voices = {
  "case-app.js": ["新版各页/招聘/系统提示", "网站系统或招聘方"],
  "case-pages.js": ["酒店/档案/结局/图片来源", "前台、档案系统、Mara"],
  "case-data.js": ["线索标题/当晚记录/修改表/最终判断", "档案原件"],
  "case-feedback.js": ["各表单错误与帮助", "系统帮助"],
  "case-comfort.js": ["设置/声音/重开", "网站设置"],
  "forum-data.js": ["论坛各帖与回复", "各发帖网友"],
  "forum.js": ["论坛索引/主题/更新", "论坛界面或楼主"],
  "ad-data.js": ["七家广告与内页", "虚构商家"],
  "ad-system.js": ["广告控件/收藏/署名", "广告界面"],
  "locale-zh.js": ["原版各页/各档案/地下/结局/提示", "原版翻译，按页面角色"],
  "branches.js": ["原版迪伦/监控巡检/两条支线", "迪伦、里德或巡检系统"],
  "story-expansion.js": [
    "原版地下设备/提示/档案/异常回放",
    "设备标签、旧档案或场景描写",
  ],
  "support-chat.js": ["原版客服/主管/异常聊天", "前台、里德、迪伦或冒充者"],
  "exploration.js": ["原版公开页面/历史附页/引用", "前台或档案目录"],
  "afterword.js": ["原版团队/求救/警告邮件", "酒店介绍或迪伦"],
  "career.js": ["原版求职网站", "招聘平台或招聘方"],
  "instructions.js": ["原版游戏说明/素材/控制", "游戏说明"],
  "lobby-music.js": ["原版酒店页脚播放器", "播放器状态"],
  "app.js": ["原版笔记/网站说明", "网站说明"],
  "site-media.js": ["照片 alt/图注", "图片说明"],
};
function issue(row, replacement, file) {
  const edit = changes.find(c=>c.file===file && row.includes(c.before));
  if(edit?.reason) return edit.reason;
  if (row === replacement) return "无需修改：用语与角色、操作或字段相符";
  if (/服务缓冲位|位置属性|引用|关联|归档|留存|责任时间/.test(row))
    return "内部术语或翻译腔，难以直接理解";
  if (/供电|频率|玻璃|对照/.test(row)) return "指向原资料的表述绕或不具体";
  if (/明天|时间|身份/.test(row))
    return "角色对白过度抽象，改成具体的排班或会话用语";
  return "口吻、重复、过度解释或不自然搭配，按当前说话者缩短";
}
let changed = 0,
  visible = 0;
const rows = [];
for (const r of before) {
  let replacement = r.text;
  for (const c of changes.filter((c) => c.file === r.file))
    replacement = replacement.replaceAll(c.before, c.after);
  let structural = false;
  if (!after.some((n) => n.file === r.file && n.text === replacement)) {
    const any = after.find((n) => n.text === replacement);
    if (!any) {
      structural = true;
      if (
        r.file === "case-pages.js" &&
        ["直接结案", "标记为待核实", "所选处理方式将写入系统。"].includes(
          r.text,
        )
      )
        replacement =
          "移至夜班终端：同意自动结案 / 拒绝签字，离开终端；原历史结果保留";
      else if (r.file === "case-pages.js" && r.text.includes("选三条"))
        replacement = "请选择三项有原始记录支持的说法，核对后同步资料。";
      else if (r.file === "case-comfort.js" && r.text === "提示音量")
        replacement = "音量";
      else if (r.file === "case-comfort.js" && r.text.includes("跳过短暂"))
        replacement = "跳过监控突脸与短暂故障";
      else if (r.file === "case-comfort.js" && r.text.includes("声音默认"))
        replacement = "声音默认关闭。可调整音量、动态效果和监控惊吓。";
    }
  }
  const changedRow = replacement !== r.text;
  if (changedRow) changed++;
  const match = after
    .filter((n) => n.file === r.file && n.text === replacement)
    .sort((a, b) => Math.abs(a.line - r.line) - Math.abs(b.line - r.line))[0];
  const inputAlias = r.file === "story-expansion.js" && r.line >= 600;
  const isCovered = !inputAlias && covered(replacement);
  if (isCovered) visible++;
  const [route, voice] = voices[r.file] || [
    r.file.includes("classic") ? "原版 HTML 外壳" : "新版 HTML 外壳",
    "页面界面",
  ];
  const runtime = inputAlias
    ? "输入接受别名，不是显示文案；原样保留"
    : isCovered
      ? "运行采样命中；" +
        (match ? "当前源码 " + match.line + " 行" : "动态模板")
      : structural
        ? "结构已移动/拆分，相关页面另有回归；不可按片段逐字比对"
        : "源码逐条审阅；本次运行采样未逐字命中（含折叠、条件或旧覆盖项）";
  rows.push(
    `| ${esc(route)} | ${r.file}:${r.line}（基线）${match ? " → " + match.line : ""} | ${esc(r.text)} | ${inputAlias ? "仅为输入兼容别名，不修改答案" : changedRow ? issue(r.text, replacement, r.file) : "无需修改：保留角色口吻或正式字段；重复覆盖项一并登记"} | ${esc(replacement)} | ${voice} | ${inputAlias ? "谜题接受答案不变" : /C[1-9]|317|318|04:04|03:17|房号|钥匙|登记|回路|维修|记录|原件|顺序|菜单/.test(r.text) ? "涉及资料或操作措辞；编号、时间、答案、解锁条件不变" : "不改线索意义"} | ${runtime} |`,
  );
}
const newRows = after.filter(
  (r) =>
    !before.some((b) => b.file === r.file && b.text === r.text) &&
    !changes.some((c) => c.file === r.file && r.text === c.after),
);
const summary = `# 全站中文文案审查与修改对照（V2.3）\n\n基线：\`${baseline}\`。本轮按源码清点、逐条阅读、按说话者修改、实际页面采样与回归四步执行；没有只替换附件中的例句。\n\n基线共 ${before.length} 处含中文片段，分布于 ${new Set(before.map((r) => r.file)).size} 个实际入口加载的源文件。此计数按出现位置计算，包含重复翻译、模板分段、alt/aria/占位文字、HTML 及兼容输入别名，**不是独立句子数**。应用 ${changes.length} 组文字替换，原始片段中 ${changed} 处对应到改文。新章节和设置的中文另列于文末。\n\n${review.snapshots.length} 次实际运行采样；原始清点行中 ${visible} 行的当前文本在采样正文/属性中逐字命中。未命中行明确标记为源码审阅，**不冒充逐字运行验证**。完整画面与属性记录见 [browser-copy-review.json](docs/v2.3/browser-copy-review.json)。页面回归结果见 [验证报告](docs/V2_3-VERIFICATION.zh-CN.md)。\n\n## 独立发现的问题\n\n- 后台错误写成口头解谜导师，改为短状态信息；进一步说明仍通过原有相关资料链接提供。\n- “预订引用”“原责任时间”“位置属性”“服务缓冲位”等词不便理解，统一为预订编号、移交时间、区域用途、服务暂存区；英文原字段 SERVICE HOLDING 与真相不变。\n- 论坛迟到借口和广告的“灯罩有自己的想法”“找不到的附赠轮子”等泛化拟人表达，改成具体生活细节，保留各商家的幽默。\n- 主管威胁中的抽象时间隐喻改为具体加班与通知家属的威胁；保留玩家要求的伪人语气和原触发条件。\n- 旧版帮助绕着“同一套名称/原件出处”说话，改为说明页面上实际能找到的资料。\n- 旧版翻译词典仍有“酒店图片为生成素材”旧覆盖项，改正为实拍；同时补充低清副本的处理说明。\n- 最后确认页的结案按钮移至夜班终端，新阶段不以核对文件、输入密码替代实际操作。\n\n## 说话者与保留原则\n\n酒店宣传与前台公告保持温和简短；系统字段仍正式，不把所有按钮口语化；论坛和广告可有不同语气；Mara 的疲惫短句大部分已合适，保留而不强行润色。所有谜题接受的中文别名、英文原词和关键编号不因文案修改改变。旧词典的重复覆盖项列入清点；未见于实际界面的旧项不宣称已显示验证。\n\n## 全部原始中文逐项审阅\n\n下表位置以基线源文件为准，“→”表示当前文件定位行；模板按可见中文片段拆开，动态数值仍由原字段插入。\n\n| 路由/页面 | 实际代码位置 | 原文 | 具体问题/保留理由 | 新文案 | 说话者 | 线索影响 | 运行验证状态 |\n|---|---|---|---|---|---|---|---|\n`;
let out =
  summary +
  rows.join("\n") +
  "\n\n## 新增或结构调整后的中文\n\n| 页面 | 位置 | 当前文字 | 说话者 | 验证状态 |\n|---|---|---|---|---|\n";
for (const r of newRows) {
  const [route, voice] = voices[r.file] || [
    "第二阶段监控/配线板/结局",
    "设备系统或维修标签",
  ];
  out += `| ${route} | ${r.file}:${r.line} | ${esc(r.text)} | ${voice} | ${covered(r.text) ? "运行采样命中" : "源码审阅；条件状态另由交互测试覆盖"} |\n`;
}
await writeFile("COPY-AUDIT.zh-CN.md", out);
console.log(
  JSON.stringify({
    before: before.length,
    changed,
    groups: changes.length,
    visible,
    snapshots: review.snapshots.length,
    newRows: newRows.length,
  }),
);
