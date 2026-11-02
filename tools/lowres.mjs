import { chromium } from "@playwright/test";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
const files = [
  "lobby.jpg",
  "hallway.jpg",
  "guestroom.jpg",
  "twin.jpg",
  "suite.jpg",
  "night-mask.jpg",
  "scare-porter.png",
  "scare-veil.png",
  "scare-reflection.png",
  "dylan-room.png",
  ...(await readdir("assets/web"))
    .filter((n) => n.endsWith(".jpg"))
    .map((n) => "web/" + n),
];
await mkdir("assets/lowres", { recursive: true });
const manifest = [];
for (const file of files) {
  const input = await readFile("assets/" + file);
  const result = await page.evaluate(
    async (src) => {
      const im = new Image();
      im.src = src;
      await im.decode();
      const c = document.createElement("canvas");
      c.width = Math.min(480, im.naturalWidth);
      c.height = Math.round((c.width * im.naturalHeight) / im.naturalWidth);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      return {
        url: c.toDataURL("image/jpeg", 0.46),
        width: c.width,
        height: c.height,
      };
    },
    "data:image/" +
      (file.endsWith(".png") ? "png" : "jpeg") +
      ";base64," +
      input.toString("base64"),
  );
  const output =
    "lowres/" + file.replaceAll("/", "-").replace(/\.png$/, ".jpg");
  const data = Buffer.from(result.url.split(",")[1], "base64");
  await writeFile("assets/" + output, data);
  manifest.push({
    original: file,
    display: output,
    width: result.width,
    height: result.height,
    sha256: createHash("sha256").update(data).digest("hex"),
    changes:
      "Downsampled to at most 480px wide and JPEG quality 0.46. Original retained. Same author and license as original; see photo ledgers.",
  });
}
await writeFile(
  "assets/lowres-manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
const map = Object.fromEntries(
  manifest.map((x) => ["assets/" + x.original, "assets/" + x.display]),
);
await writeFile(
  "retro-media.js",
  `/* Local low-resolution display copies; originals and their licenses remain available. */
(()=>{
 const map=${JSON.stringify(map)};
 function element(el){
  if(el.tagName==='IMG'){
   const key=el.getAttribute('src');
   if(map[key] && el.getAttribute('srcset')!==map[key]+' 1x')el.setAttribute('srcset',map[key]+' 1x');
   else if(!map[key] && el.getAttribute('srcset')?.startsWith('assets/lowres/'))el.removeAttribute('srcset');
  }
  const old=el.getAttribute?.('style');
  if(old?.includes('assets/')){let next=old;for(const [from,to]of Object.entries(map))next=next.replaceAll(from,to);if(next!==old)el.setAttribute('style',next);}
 }
 function subtree(root){if(root.nodeType===1)element(root);root.querySelectorAll?.('img[src],[style]').forEach(element);}
 new MutationObserver(records=>{for(const r of records){if(r.type==='attributes')element(r.target);else for(const node of r.addedNodes)subtree(node);}}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','style']});
 subtree(document);
})();
`,
);
await browser.close();
console.log(
  "Created " + manifest.length + " low-resolution copies; originals unchanged.",
);
