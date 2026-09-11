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

function classifyProduct(name: string) {
  const n = name.toLowerCase();

  if (
    n.includes('alcohol') ||
    n.includes('agua oxigenada') ||
    n.includes('tintura') ||
    n.includes('yodado') ||
    n.includes('yodo') ||
    n.includes('alkoyodo') ||
    n.includes('genciana') ||
    n.includes('timol') ||
    n.includes('vinagre') ||
    n.includes('agua destilada') ||
    n.includes('ácido bórico') || n.includes('acido borico') ||
    n.includes('bencina') ||
    n.includes('formol') ||
    n.includes('óxido de zinc') || n.includes('oxido de zinc') ||
    n.includes('vaselina') ||
    n.includes('jabón líquido') || n.includes('jabon liquido') ||
    n.includes('cloruro de sodio') ||
    n.includes('agua estéril') || n.includes('agua esteril') ||
    n.includes('aceite') ||
    n.includes('bicarbonato') ||
    n.includes('elixir') ||
    n.includes('glicerina') ||
    n.includes('nitrato de plata') ||
    n.includes('azufre') ||
    n.includes('tilo en flores') ||
    n.includes('agua de kananga') ||
    n.includes('agua de azahar') ||
    n.includes('quita esmalte') ||
    n.includes('paños desinfectantes') || n.includes('panos desinfectantes') ||
    n.includes('dispensador de pared')
  ) {
    return 'Esterilización y Desinfección';
  }

  if (n.includes('ultra - gel') || n.includes('ultra-gel') || n.includes('ultragel')) {
    return 'Equipos de Diagnóstico por Imágenes';
  }

  if (
    n.includes('canula') || n.includes('cánula') ||
    n.includes('mascara de oxigeno') || n.includes('máscara de oxigeno') ||
    n.includes('mascara nebulizadora') || n.includes('máscara nebulizadora') ||
    n.includes('venturi') ||
    n.includes('espirometria') || n.includes('espirometría') ||
    n.includes('insuflacion') || n.includes('insuflación') ||
    n.includes('filtro hme')
  ) {
    return 'Equipamiento y Suministro Clínico';
  }

  return 'Material e Insumos Hospitalarios';
}

const catCounts: Record<string, number> = {};
for (const p of productsList) {
  const cat = classifyProduct(p.prod);
  catCounts[cat] = (catCounts[cat] || 0) + 1;
}

console.log('Category distribution for 256 products:');
console.log(catCounts);

process.exit(0);
