import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {parse} from 'acorn';
import {V2_FILES} from '../site-files.mjs';
const records=[];
for(const file of V2_FILES.filter(file=>file.endsWith('.js'))) {
  const ast=parse(readFileSync(file,'utf8'),{ecmaVersion:'latest',locations:true});
  function walk(node) {
    if(!node||typeof node!=='object')return;
    const text=node.type==='Literal'&&typeof node.value==='string'?node.value:node.type==='TemplateElement'?node.value.cooked:null;
    if(text&&/[\u3400-\u9fff]/.test(text))records.push({file,line:node.loc.start.line,text});
    for(const [key,value] of Object.entries(node)) {
      if(['loc','start','end'].includes(key)||(key==='value'&&['Literal','TemplateElement'].includes(node.type)))continue;
      if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);
    }
  }
  walk(ast);
}
mkdirSync('docs/v2.5',{recursive:true});
writeFileSync('docs/v2.5/copy-inventory.json',JSON.stringify(records,null,2)+'\n');
const files=[...new Set(records.map(record=>record.file))].map(file=>({file,candidates:records.filter(record=>record.file===file).length}));
console.log(JSON.stringify({candidates:records.length,files}));
