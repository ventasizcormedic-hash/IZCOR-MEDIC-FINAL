import fs from 'fs';
import path from 'path';

const sharedStringsPath = path.join(process.cwd(), '.data', 'excel_extracted', 'xl', 'sharedStrings.xml');
const sheet1Path = path.join(process.cwd(), '.data', 'excel_extracted', 'xl', 'worksheets', 'sheet1.xml');

const ssRaw = fs.readFileSync(sharedStringsPath, 'utf-8');
const strings: string[] = [];
const siRegex = /<si>([\s\S]*?)<\/si>/g;
let siMatch;
while ((siMatch = siRegex.exec(ssRaw)) !== null) {
  const siContent = siMatch[1];
  const tMatches = siContent.match(/<t(?:\s[^>]*)?>([^<]*)<\/t>/g);
  if (tMatches) {
    const text = tMatches.map(t => t.replace(/<t(?:\s[^>]*)?>([^<]*)<\/t>/, '$1')).join('');
    strings.push(text);
  } else {
    strings.push('');
  }
}

const sheetRaw = fs.readFileSync(sheet1Path, 'utf-8');
const rowRegex = /<row\s+r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
let rowMatch;

let emptyCount = 0;
let nonEmptyCount = 0;
const seenCodes = new Set<string>();
const duplicateCodes: string[] = [];

while ((rowMatch = rowRegex.exec(sheetRaw)) !== null) {
  const rowNumber = rowMatch[1];
  if (rowNumber === '1') continue;

  const rowContent = rowMatch[2];
  const cellRegex = /<c\s+r="([A-Z]+)\d+"(?:[^>]*?t="([^"]*)")?[^>]*>(?:<v>([^<]*)<\/v>)?<\/c>/g;
  let cellMatch;
  const cols: Record<string, string> = {};

  while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
    const colLetter = cellMatch[1];
    const isString = cellMatch[2] === 's';
    const val = cellMatch[3];
    if (val !== undefined) {
      if (isString) {
        const idx = parseInt(val, 10);
        cols[colLetter] = (strings[idx] || '').trim().replace(/\u00A0/g, ' ').trim();
      } else {
        cols[colLetter] = val.trim().replace(/\u00A0/g, ' ').trim();
      }
    }
  }

  const code = cols['A'] || '';
  const brand = cols['B'] || '';
  const name = cols['C'] || '';

  if (!code && !name && !brand) {
    emptyCount++;
  } else {
    nonEmptyCount++;
    if (code) {
      if (seenCodes.has(code)) {
        duplicateCodes.push(`Row ${rowNumber}: ${code} - ${name}`);
      } else {
        seenCodes.add(code);
      }
    }
  }
}

console.log(`Non-empty rows: ${nonEmptyCount}`);
console.log(`Empty rows: ${emptyCount}`);
console.log(`Unique codes: ${seenCodes.size}`);
console.log(`Duplicate code occurrences: ${duplicateCodes.length}`);
if (duplicateCodes.length > 0) {
  console.log('First 5 duplicates:', duplicateCodes.slice(0, 5));
}
