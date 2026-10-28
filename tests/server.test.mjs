import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../server.mjs";
import { resolve } from "node:path";

for (const target of [".", "dist"]) {
  test(`${target}: serves application and protects project metadata`, async (t) => {
    const server = createServer(resolve(target));
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    t.after(() => new Promise((r) => server.close(r)));
    const url = `http://127.0.0.1:${server.address().port}`;
    const index = await fetch(url);
    assert.equal(index.status, 200);
    assert.match(await index.text(), /The Stillwater Hotel/);
    for (const path of [
      "/style.css",
      "/app.js",
      "/locale-zh.js",
      "/career.js",
      "/career.css",
      "/branches.js",
      "/branches.css",
      "/assets/dylan-room.png",
      "/index-zh.html",
      "/story-expansion.js",
      "/assets/scare-porter.png",
      "/assets/scare-veil.png",
      "/assets/scare-reflection.png",
      "/assets/twin.jpg",
      "/assets/suite.jpg",
      "/assets/photo-credits.json",
      "/assets/hallway.jpg",
      "/assets/lobby.jpg",
      "/assets/guestroom.jpg",
      "/assets/emblem.svg",
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
      "/assets/%2e%2e%2fpackage.json",
      "/%E0%A4%A",
    ]) {
      assert.equal((await fetch(url + path)).status, 404, path);
    }
  });
}
