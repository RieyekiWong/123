import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { V2_FILES } from "./site-files.mjs";

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
    ".ogg": "audio/ogg",
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
      const files = options.legacy ? [
        "classic.html", "classic-zh.html", "classic-bridge.js",
        "locale-zh.js", "career.js", "career.css", "branches.js", "branches.css",
        "support-chat.js", "support-chat.css", "afterword.js", "afterword.css",
        "instructions.js", "instructions.css", "lobby-music.js", "lobby-music.css",
        "heritage.css", "style.css", "app.js", "exploration.js", "story-expansion.js",
        "cctv-filter.css", "retro-media.js",
      ] : V2_FILES;
      const allowed = files.some(name => file === resolve(base, name)) ||
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
