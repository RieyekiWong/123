import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../server.mjs";
import { resolve } from "node:path";
import { V2_FILES } from "../site-files.mjs";
import { existsSync } from "node:fs";

for (const target of [".", "dist"]) {
  test(`${target}: serves application and protects project metadata`, async (t) => {
    const server = createServer(resolve(target));
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    t.after(() => new Promise((r) => server.close(r)));
    const url = `http://127.0.0.1:${server.address().port}`;
    const index = await fetch(url);
    assert.equal(index.status, 200);
    assert.match(await index.text(), /Stillwater/);
    for (const path of [...V2_FILES.map(file=>"/"+file),
      "/assets/haunt-v442/corridor.jpg", "/assets/haunt-v442/cabinet.jpg",
      "/assets/haunt-v442/last-frame.jpg", "/assets/haunt-v442/escape.jpg",
      "/assets/lobby.jpg", "/assets/hallway.jpg", "/assets/photo-credits.json",
      "/assets/web-photo-credits.json", "/assets/web/ad-dog.jpg",
    ]) {
      const result = await fetch(url + path);
      assert.equal(result.status, 200, path);
      assert.equal(result.headers.get("x-content-type-options"), "nosniff");
      assert.ok((await result.arrayBuffer()).byteLength > 0);
    }
    for (const path of [
      "/.git/config",
      "/package.json",
      "/server.mjs",
      "/not-found",
      "/classic.html", "/classic-zh.html", "/classic-bridge.js",
      "/app.js", "/branches.js", "/career.js", "/story-expansion.js",
      "/assets/%2e%2e%2fpackage.json",
      "/%E0%A4%A",
    ]) {
      assert.equal((await fetch(url + path)).status, 404, path);
    }
  });
}

test("the new distribution excludes archived pages and runtimes",()=>{
  for (const file of ['classic.html','classic-zh.html','classic-bridge.js','app.js','style.css','career.js','branches.js','locale-zh.js','story-expansion.js','support-chat.js','lobby-music.js'])
    assert.equal(existsSync(resolve('dist',file)),false,file);
});
