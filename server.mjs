import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

export function createServer(
  root = fileURLToPath(new URL("./", import.meta.url)),
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
  };
  return http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      const file = resolve(
        base,
        "." + (pathname === "/" ? "/index.html" : pathname),
      );
      const allowed =
        file === resolve(base, "index.html") ||
        file === resolve(base, "style.css") ||
        file === resolve(base, "app.js") ||
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
  createServer().listen(port, "0.0.0.0", () =>
    console.log(`The Stillwater Hotel · http://localhost:${port}`),
  );
}
