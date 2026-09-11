import fs from 'fs';
import path from 'path';

const basePath = path.join(process.cwd(), '.data', 'catalogo2_extracted', 'xl');

console.log('=== INSPECTING CATALOGO 2 ===');

// 1. Check workbook sheets
const workbookXml = fs.readFileSync(path.join(basePath, 'workbook.xml'), 'utf8');
console.log('Workbook XML:');
const sheetMatches = workbookXml.match(/<sheet\s+[^>]*\/>/g) || [];
for (const s of sheetMatches) {
  console.log(' -', s);
}

// 2. Check shared strings
const ssXml = fs.readFileSync(path.join(basePath, 'sharedStrings.xml'), 'utf8');
const strings: string[] = [];
const siRegex = /<si>([\s\S]*?)<\/si>/g;
let m;
while ((m = siRegex.exec(ssXml)) !== null) {
  const tMatches = m[1].match(/<t(?:\s[^>]*)?>([^<]*)<\/t>/g);
  if (tMatches) {
    const text = tMatches.map((t: string) => t.replace(/<t(?:\s[^>]*)?>([^<]*)<\/t>/, '$1')).join('');
    strings.push(text);
  } else {
    strings.push('');
  }
}
console.log(`Loaded ${strings.length} shared strings.`);
console.log('First 20 strings:', strings.slice(0, 20));

// 3. Check sheet1.xml
const sheet1Xml = fs.readFileSync(path.join(basePath, 'worksheets', 'sheet1.xml'), 'utf8');
const rowRegex = /<row\s+r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
const rowsData: any[] = [];
let totalDataRows = 0;

while ((m = rowRegex.exec(sheet1Xml)) !== null) {
  const rowNum = m[1];
  const rowContent = m[2];
  if (rowNum === '1') continue; // Header: CODIGO, MARCA, PRODUCTO, PROCEDENCIA, UNIDAD

  const cellRegex = /<c\s+([^>]*?)>(?:<v>([^<]*)<\/v>)?<\/c>/g;
  let cm;
  const rowData: Record<string, string> = { row: rowNum, A: '', B: '', C: '', D: '', E: '' };

  while ((cm = cellRegex.exec(rowContent)) !== null) {
    const attrs = cm[1];
    const rawVal = cm[2] || '';

    const colMatch = attrs.match(/r="([A-Z]+)\d+"/);
    if (!colMatch) continue;
    const col = colMatch[1];

    const typeMatch = attrs.match(/t="([a-z]+)"/);
    const type = typeMatch ? typeMatch[1] : '';

    let val = rawVal;
    if (type === 's') {
      const idx = parseInt(rawVal, 10);
      val = strings[idx] || '';
    }
    rowData[col] = val.trim();
  }

  if (rowData.C) { // Must have product name
    rowsData.push(rowData);
    totalDataRows++;
  }
}

const nonDashCodes: any[] = [];
const brandsSet = new Set<string>();
const procSet = new Set<string>();
const unitSet = new Set<string>();

for (const r of rowsData) {
  if (r.A && r.A !== '-') nonDashCodes.push({ row: r.row, cod: r.A, prod: r.C });
  if (r.B) brandsSet.add(r.B);
  if (r.D) procSet.add(r.D);
  if (r.E) unitSet.add(r.E);
}

console.log('\n--- COLUMN ANALYSIS ---');
console.log(`Total non-dash codes: ${nonDashCodes.length}`);
if (nonDashCodes.length > 0) {
  console.log('Sample non-dash codes:', nonDashCodes.slice(0, 10));
}
console.log(`Unique Brands (${brandsSet.size}):`, Array.from(brandsSet));
console.log(`Unique Procedencias (${procSet.size}):`, Array.from(procSet));
console.log(`Unique Units (${unitSet.size}):`, Array.from(unitSet).slice(0, 15));

process.exit(0);
