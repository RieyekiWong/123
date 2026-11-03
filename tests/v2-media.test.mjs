import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import "../site-media.js";
import "../case-data.js";
import "../ad-data.js";
const ledger = JSON.parse(
  readFileSync(new URL("../assets/web-photo-credits.json", import.meta.url)),
);
test("the four new scare scenes retain different source art and small, verifiable 4:3 display copies", () => {
  const scenes=JSON.parse(readFileSync(new URL('../assets/haunt-v442/manifest.json',import.meta.url)));
  assert.deepEqual(scenes.map(scene=>scene.id),['corridor','cabinet','last-frame','escape']);
  assert.equal(new Set(scenes.map(scene=>scene.sourceSha256)).size,4);
  assert.equal(new Set(scenes.map(scene=>scene.pose)).size,4);
  for (const scene of scenes) {
    const original=readFileSync(new URL('../assets/'+scene.original,import.meta.url));
    const display=readFileSync(new URL('../assets/'+scene.display,import.meta.url));
    assert.equal(createHash('sha256').update(original).digest('hex'),scene.sourceSha256);
    assert.equal(createHash('sha256').update(display).digest('hex'),scene.sha256);
    assert.equal(display.length,scene.bytes);
    assert.ok(scene.width<=480 && scene.width/scene.height===4/3);
    assert.ok(display.length<50000);
  }
});
test("all fifteen sourced photographs retain author, license, original source and exact downloaded bytes", () => {
  assert.equal(ledger.length, 15);
  assert.deepEqual(globalThis.StillwaterMedia.photos, ledger);
  for (const photo of ledger) {
    assert.ok(photo.author && photo.title);
    assert.match(
      photo.source,
      /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/,
    );
    assert.match(photo.license, /^(CC0|CC BY(?:-SA)? [234]\.0)$/);
    assert.match(
      photo.license_url,
      /^https:\/\/(creativecommons\.org|commons\.wikimedia\.org)\//,
    );
    const bytes = readFileSync(
      new URL("../assets/" + photo.file, import.meta.url),
    );
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      photo.sha256,
      photo.id,
    );
    assert.equal(bytes.length, photo.bytes);
    assert.equal(bytes.readUInt16BE(0), 0xffd8);
    assert.ok(photo.width > 0 && photo.height > 0);
  }
});
test("every ad photo and cat portfolio resolves to a credited local photograph", () => {
  for (const ad of globalThis.StillwaterAdData) {
    for (const id of [ad.imageId, ...(ad.galleryIds || [])]) {
      const photo = globalThis.StillwaterMedia.find(id);
      assert.equal(photo.group, "ad");
      assert.match(photo.file, /^web\/ad-[a-z-]+\.jpg$/);
    }
  }
  assert.equal(ledger.filter((p) => p.group === "hotel").length, 6);
});
test("the original five photographs and classic credit manifest remain unchanged", () => {
  const original = JSON.parse(
    readFileSync(new URL("../assets/photo-credits.json", import.meta.url)),
  );
  assert.equal(original.length, 5);
  assert.deepEqual(globalThis.StillwaterCaseData.photographs, original);
  for (const photo of original)
    assert.equal(
      createHash("sha256")
        .update(
          readFileSync(new URL("../assets/" + photo.file, import.meta.url)),
        )
        .digest("hex"),
      photo.sha256,
      photo.file,
    );
});

test('every raster illustration has a local low-resolution derivative and the real mask has an attributable reusable source',()=>{
 const copies=JSON.parse(readFileSync(new URL('../assets/lowres-manifest.json',import.meta.url)));
 assert.equal(copies.length,25);
 for(const copy of copies){assert.ok(copy.width<=480);const bytes=readFileSync(new URL('../assets/'+copy.display,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),copy.sha256);assert.ok(readFileSync(new URL('../assets/'+copy.original,import.meta.url)).length);}
 const mask=JSON.parse(readFileSync(new URL('../assets/night-mask-credit.json',import.meta.url)));
 assert.equal(mask.license,'CC0');assert.equal(mask.author,'Wilfredor');assert.match(mask.source,/commons.wikimedia.org\/wiki\/File:/);assert.equal(createHash('sha256').update(readFileSync(new URL('../assets/'+mask.file,import.meta.url))).digest('hex'),mask.sha256);
});
