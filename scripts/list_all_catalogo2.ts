import fs from 'fs';
import path from 'path';

const basePath = path.join(process.cwd(), '.data', 'catalogo2_extracted', 'xl');
const ssXml = fs.readFileSync(path.join(basePath, 'sharedStrings.xml'), 'utf8');
const strings: string[] = [];
const siRegex = /<si>([\s\S]*?)<\/si>/g;
let m;
while ((m = siRegex.exec(ssXml)) !== null) {
  const tMatches = m[1].match(/<t(?:\s[^>]*)?>([^<]*)<\/t>/g);
  strings.push(tMatches ? tMatches.map((t: string) => t.replace(/<t(?:\s[^>]*)?>([^<]*)<\/t>/, '$1')).join('') : '');
}

const sheet1Xml = fs.readFileSync(path.join(basePath, 'worksheets', 'sheet1.xml'), 'utf8');
const rowRegex = /<row\s+r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
const productsList: any[] = [];

while ((m = rowRegex.exec(sheet1Xml)) !== null) {
  const rowNum = m[1];
  if (rowNum === '1') continue;
  const rowContent = m[2];
  const cellRegex = /<c\s+([^>]*?)>(?:<v>([^<]*)<\/v>)?<\/c>/g;
  let cm;
  let cod = '', marca = '', prod = '', proc = '', und = '';
  while ((cm = cellRegex.exec(rowContent)) !== null) {
    const attrs = cm[1];
    const rawVal = cm[2] || '';
    const colMatch = attrs.match(/r="([A-Z]+)\d+"/);
    if (!colMatch) continue;
    const col = colMatch[1];
    const typeMatch = attrs.match(/t="([a-z]+)"/);
    const type = typeMatch ? typeMatch[1] : '';
    let val = rawVal;
    if (type === 's') val = strings[parseInt(val, 10)] || '';
    val = val.trim();
    if (col === 'A') cod = val;
    if (col === 'B') marca = val;
    if (col === 'C') prod = val;
    if (col === 'D') proc = val;
    if (col === 'E') und = val;
  }
  if (prod) {
    productsList.push({ row: rowNum, cod, marca, prod, proc, und });
  }
}

console.log(`Total parsed products: ${productsList.length}`);
for (let i = 0; i < Math.min(117, productsList.length); i++) {
  const p = productsList[i];
  console.log(`${i + 1}. [${p.proc}] [${p.und}] ${p.prod}`);
}

process.exit(0);
