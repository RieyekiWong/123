import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { parse } from 'acorn';
import { fileURLToPath } from 'node:url';
const repo=fileURLToPath(new URL('../../', import.meta.url));
const base=path.join(repo,'design-previews/xueli-21-chapter-01');
const out=path.resolve(process.argv[2] || path.join(repo, 'design-previews/xueli-pc-playtest/index.html'));
const read=f=>fs.readFileSync(f,'utf8');
const types={'.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf'};
const embedded=new Map();
function data(file){file=path.resolve(file);if(!embedded.has(file)){const bytes=fs.readFileSync(file);embedded.set(file,`data:${types[path.extname(file)]||'application/octet-stream'};base64,${bytes.toString('base64')}`);}return embedded.get(file);}
const context=vm.createContext({});
for(const name of ['site-media.js','chat-data.js','chat-personas.js','chat-photos.js'])vm.runInContext(read(path.join(repo,name)),context);
const assetPaths=new Set(['assets/emblem.svg']);
for(const photo of context.StillwaterChatPhotos)assetPaths.add(photo.file);
for(const photo of context.StillwaterMedia.photos)assetPaths.add('assets/'+photo.file);
const iconModule=await import(path.join(base,'reuse/ready-icons.js'));
for(const value of Object.values(iconModule.reuseById))if(fs.existsSync(path.join(base,'reuse',value.file)))assetPaths.add('reuse/'+value.file);
const assetMap={};
for(const file of assetPaths){const full=file.startsWith('reuse/')?path.join(base,file):path.join(repo,file);assetMap[file]=data(full);}
let css=['chapter.css','../../chat-style.css','desktop-shell.css'].map(name=>{
  const file=path.join(base,name);
  return read(file).replace(/url\(['"]?([^'")]+)['"]?\)/g,(_m,url)=>`url("${data(path.resolve(path.dirname(file),url))}")`);
}).join('\n');
const sources=[...read(path.join(base,'index.html')).matchAll(/<script defer src="([^"]+)"/g)].map(m=>m[1]);
let scripts=sources.map(name=>{
 let source=read(path.join(base,name));
 if(name.endsWith('chat-view.js')){
  source=source.replace('esc(assetBase+photo.file)','esc(globalThis.XueliAssets[photo.file]||assetBase+photo.file)');
  source=source.replace('src="${esc(assetBase)}assets/${esc(globalThis.StillwaterMedia.find(entry.image).file)}"','src="${esc(globalThis.XueliAssets["assets/"+globalThis.StillwaterMedia.find(entry.image).file])}"');
 }
 return source;
}).join('\n');
const modules=new Map(),blocks=[];
function bundle(file){
 file=path.resolve(file);if(modules.has(file))return modules.get(file);
 const name='xueliModule'+modules.size;modules.set(file,name);
 let source=read(file);const ast=parse(source,{sourceType:'module',ecmaVersion:'latest'}),replacements=[],exports=[];
 for(const node of ast.body){
  if(node.type==='ImportDeclaration'){
   const dependency=bundle(path.resolve(path.dirname(file),node.source.value));
   const imports=node.specifiers.map(s=>s.imported.name+(s.local.name!==s.imported.name?':'+s.local.name:''));
   replacements.push([node.start,node.end,`const {${imports.join(',')}}=${dependency};`]);
  } else if(node.type==='ExportNamedDeclaration'){
   const declaration=node.declaration;
   if(!declaration)throw new Error('Unexpected re-export');
   if(declaration.type==='VariableDeclaration')exports.push(...declaration.declarations.map(d=>d.id.name));else exports.push(declaration.id.name);
   replacements.push([node.start,declaration.start,'']);
  }
 }
 for(const [start,end,text]of replacements.sort((a,b)=>b[0]-a[0]))source=source.slice(0,start)+text+source.slice(end);
 if(file.endsWith('/chapter-app.js'))source=source.replace('src="reuse/${escape(ready.file)}"','src="${escape(globalThis.XueliAssets["reuse/"+ready.file])}"');
 blocks.push(`const ${name}=(()=>{\n${source}\nreturn {${exports.join(',')}};\n})();`);
 return name;
}
bundle(path.join(base,'chapter-app.js'));
let js='"use strict";\nglobalThis.XueliAssets='+JSON.stringify(assetMap)+';\n'+scripts+'\n(()=>{\n'+blocks.join('\n')+'\n})();';
// These are HTML parser escapes only, not story changes.
js=js.replace(/<\/script/gi,'<\\/script');
const hash=string=>crypto.createHash('sha256').update(string).digest('base64');
let html=read(path.join(base,'index.html'));
html=html.replace(/  <link rel="stylesheet"[^>]+>\n/g,'').replace(/  <script[^>]*src="[^"]+"[^>]*><\/script>\n/g,'');
html=html.replace(/<meta http-equiv="Content-Security-Policy" content="[^"]+">/,`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${hash(js)}'; style-src 'sha256-${hash(css)}' 'unsafe-hashes'; font-src data:; img-src data:; connect-src https://damp-rain-a5a6.ywang254.workers.dev; object-src 'none'; base-uri 'none'; form-action 'none'">`);
html=html.replace('</head>',`<link rel="icon" href="data:,">\n<style>${css}</style>\n</head>`);
html=html.replace('</body>',`<script>${js}</script>\n</body>`);
fs.mkdirSync(path.dirname(out), {recursive:true});
fs.writeFileSync(out,html);
console.log(JSON.stringify({file:out,bytes:Buffer.byteLength(html),resources:embedded.size,sourceFilesChanged:false}));
