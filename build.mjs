import { mkdir, cp, rm } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const path of [
  "index.html",
  "index-zh.html",
  "locale-zh.js",
  "career.js",
  "career.css",
  "branches.js",
  "branches.css",
  "support-chat.js",
  "support-chat.css",
  "afterword.js",
  "afterword.css",
  "instructions.js",
  "instructions.css",
  "lobby-music.js",
  "lobby-music.css",
  "heritage.css",
  "style.css",
  "app.js",
  "exploration.js",
  "story-expansion.js",
  "assets",
])
  await cp(path, `dist/${path}`, { recursive: true });
console.log("Static site built in dist/ — ready for GitHub Pages.");
