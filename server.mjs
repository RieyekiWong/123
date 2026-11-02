import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

export function createServer(
  root = fileURLToPath(new URL("./", import.meta.url)),
  options = {},
) {
  const base = resolve(root);
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".mp3": "audio/mpeg",
  };
  return http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      let file = resolve(
        base,
        "." + (pathname === "/" ? "/index.html" : pathname),
      );
      if (options.legacy && file === resolve(base, "index.html"))
        file = resolve(base, "classic.html");
      if (options.legacy && file === resolve(base, "index-zh.html"))
        file = resolve(base, "classic-zh.html");
      const allowed =
        [
          "classic.html",
          "classic-zh.html",
          "classic-bridge.js",
          "case-data.js",
          "case-state.js",
          "case-app.js",
          "case-pages.js",
          "case-comfort.js",
          "case-feedback.js",
          "forum-data.js",
          "forum.js",
          "forum-style.css",
          "ad-data.js",
          "ad-system.js",
          "ad-style.css",
          "case-style.css",
        ].some((name) => file === resolve(base, name)) ||
        file === resolve(base, "index.html") ||
        file === resolve(base, "index-zh.html") ||
        file === resolve(base, "locale-zh.js") ||
        file === resolve(base, "career.js") ||
        file === resolve(base, "career.css") ||
        file === resolve(base, "branches.js") ||
        file === resolve(base, "branches.css") ||
        file === resolve(base, "support-chat.js") ||
        file === resolve(base, "support-chat.css") ||
        file === resolve(base, "afterword.js") ||
        file === resolve(base, "afterword.css") ||
        file === resolve(base, "instructions.js") ||
        file === resolve(base, "instructions.css") ||
        file === resolve(base, "lobby-music.js") ||
        file === resolve(base, "lobby-music.css") ||
        file === resolve(base, "heritage.css") ||
        file === resolve(base, "style.css") ||
        file === resolve(base, "app.js") ||
        file === resolve(base, "exploration.js") ||
        file === resolve(base, "story-expansion.js") ||
        file.startsWith(resolve(base, "assets") + sep);
      if (!allowed || !(await stat(file)).isFile()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(req.method === "HEAD" ? undefined : await readFile(file));
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv;
  const port =
    Number(args[args.indexOf("--port") + 1]) ||
    Number(process.env.PORT) ||
    3000;
  createServer(undefined, { legacy: args.includes("--legacy") }).listen(
    port,
    "0.0.0.0",
    () => console.log(`The Stillwater Hotel · http://localhost:${port}`),
  );
}
