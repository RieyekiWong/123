/* Package already-generated artwork; only resize/compress display copies. */
import {chromium}from '@playwright/test';
import {mkdir,readFile,writeFile}from 'node:fs/promises';
import {createHash}from 'node:crypto';
const root='assets/haunt-v442';await mkdir(root+'/sources',{recursive:true});
const poses={corridor:'Full-body figure facing the wall, looking back over one shoulder.',cabinet:'Crouched adult crawling out of a floor-level service cabinet, palms on the floor.','last-frame':'Standing adult at reception with both hands pressed against glass.',escape:'Inverted adult leaning down from a ceiling beam, hanging hair and braced hands.'};
const inputs=[['corridor',320],['cabinet',480],['last-frame',480],['escape',480]].map(([id,width],i)=>[id,process.argv[i+2]||`${root}/sources/${id}.png`,width]);
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage(),manifest=[];
try{for(const [id,path,width]of inputs){
 const original=await readFile(path);await writeFile(`${root}/sources/${id}.png`,original);
 const result=await page.evaluate(async({src,width})=>{
  const im=new Image();im.src=src;await im.decode();
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=Math.round(width*im.naturalHeight/im.naturalWidth);
  canvas.getContext('2d').drawImage(im,0,0,canvas.width,canvas.height);
  return {url:canvas.toDataURL('image/jpeg',.58),width:canvas.width,height:canvas.height};
 },{src:'data:image/png;base64,'+original.toString('base64'),width});
 const display=Buffer.from(result.url.split(',')[1],'base64');await writeFile(`${root}/${id}.jpg`,display);
 manifest.push({id,pose:poses[id],original:`haunt-v442/sources/${id}.png`,display:`haunt-v442/${id}.jpg`,width:result.width,height:result.height,bytes:display.length,sha256:createHash('sha256').update(display).digest('hex'),sourceSha256:createHash('sha256').update(original).digest('hex'),provenance:'Generated fictional artwork, using the user-supplied green uncanny-human reference for atmosphere. Distinct actions and silhouettes, similar-sized vacant eyes, low-poly textures and authored static distortion. Not a photograph of a real person or incident. Originals retained; display copy resized and JPEG-compressed at 0.58.'});
}}finally{await browser.close();}
await writeFile(`${root}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest.map(({id,width,height,bytes})=>({id,width,height,bytes}))));
