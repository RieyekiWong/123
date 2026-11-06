import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { items, counts, sources } from './catalog.js';
import { reuseById } from './ready-icons.js';

test('all 69 previous drawing jobs have one explicit status', async () => {
  const brief = await readFile(new URL('../handoff/ART-BRIEF.zh-CN.md', import.meta.url), 'utf8');
  const listed = [...new Set([...brief.matchAll(/`([^`\n]+)\.png`/g)].map(match => match[1]))];
  assert.equal(listed.length, 69);
  assert.equal(new Set(items.map(i => i.id)).size, 69);
  assert.deepEqual([...items.map(i=>i.id)].sort(), listed.sort());
  assert.deepEqual(counts, { ready: 28, components: 19, existing: 1, original: 21 });
});
test('every adopted icon remains the licensed unmodified source file', async () => {
  const source = JSON.parse(await readFile(new URL('pixelarticons/source-files.json', import.meta.url)));
  for (const item of source.files) {
    const bytes = await readFile(new URL(item.file, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256);
  }
  const license = await readFile(new URL('pixelarticons/LICENSE', import.meta.url), 'utf8');
  assert.match(license, /MIT License/); assert.match(license, /Gerrit Halfmann/);
});
test('one icon family and local image files, with no embedded active or remote content', async () => {
  assert.equal(Object.keys(reuseById).length, 28);
  for (const item of items.filter(i=>i.status==='ready')) {
    assert.equal(item.source, 'pixelarticons');
    assert.equal(reuseById[item.id].file, item.file);
    const svg = await readFile(new URL(item.file, import.meta.url), 'utf8');
    assert.match(svg, /viewBox="0 0 24 24"/);
    assert.doesNotMatch(svg, /<script|<foreignObject|\bon\w+\s*=|(?:href|src)=/i);
  }
});
test('sprite examples fit the original PNG sheets and keep license records', async () => {
  for (const item of items.filter(i=>i.status==='components')) for (const example of item.examples) {
    const source = sources.find(s=>s.id===example.source);
    assert.ok(source?.licenseFile);
    if (example.kind !== 'sprite') continue;
    const bytes = await readFile(new URL(example.file, import.meta.url));
    assert.equal(bytes.subarray(1,4).toString(), 'PNG');
    assert.equal(bytes.readUInt32BE(16), example.columns * example.tile);
    assert.equal(bytes.readUInt32BE(20), example.rows * example.tile);
    assert.ok(example.index >= 0 && example.index < example.columns * example.rows);
  }
  const integrity = JSON.parse(await readFile(new URL('source-integrity.json', import.meta.url)));
  for (const item of integrity.files) {
    const bytes=await readFile(new URL(item.file,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
  }
});
test('story people, exact architecture and evidence are never replaced with unrelated stock', () => {
  for (const id of ['person-wcr-old','person-wcr-new','person-nora','portrait-june','photo-anniversary','photo-back','scene-hotel-west-original','scene-wcr-west-2023','scene-cctv-west']) {
    assert.equal(items.find(i=>i.id===id).status,'original');
    assert.equal(reuseById[id],undefined);
  }
  assert.equal(items.find(i=>i.id==='anomaly-null').status,'existing');
  assert.ok(!Object.values(reuseById).some(i=>/apparition|story-v1/.test(i.file)));
});
