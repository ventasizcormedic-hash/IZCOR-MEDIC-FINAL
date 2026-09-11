import { db, initDatabase } from '../src/db/index.ts';
import { products, categories, brands } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';
import fs from 'fs';

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/Ã\u2018/g, 'Ñ'],
  [/Ã±/g, 'ñ'],
  [/Ã‘/g, 'Ñ'],
  [/Ã¡/g, 'á'],
  [/Ã©/g, 'é'],
  [/Ã­/g, 'í'],
  [/Ã³/g, 'ó'],
  [/Ãº/g, 'ú'],
  [/Ã\u0081/g, 'Á'],
  [/Ã\u0089/g, 'É'],
  [/Ã\u008D/g, 'Í'],
  [/Ã\u0093/g, 'Ó'],
  [/Ã\u009A/g, 'Ú'],
  [/Â°/g, '°'],
  [/Â½/g, '½'],
  [/Â¼/g, '¼'],
  [/Â¾/g, '¾'],
  [/â€“/g, '–'],
  [/â€”/g, '—'],
  [/â€œ/g, '"'],
  [/â€\u009D/g, '"'],
  [/â€™/g, "'"],
  [/â€˜/g, "'"],
  [/Ã/g, 'Í'], // Fallback isolated Ã if any
  [/ESPA\s*A/g, 'ESPAÑA'],
  [/ESPA\uFFFD\s*A/g, 'ESPAÑA'],
];

function cleanString(str: string | null | undefined): string {
  if (!str) return '';
  let result = str;
  for (const [pattern, replacement] of REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

async function run() {
  await initDatabase();

  console.log('Testing "ESPAÃ\u2018A" ->', cleanString('ESPAÃ\u2018A'));

  // 1. Clean products.json
  const rawJson = fs.readFileSync('./src/data/products.json', 'utf8');
  const jsonArr = JSON.parse(rawJson);
  for (const p of jsonArr) {
    p.nombre = cleanString(p.nombre).replace(/ESPA.*?A/g, 'ESPAÑA');
    p.marca = cleanString(p.marca);
    p.procedencia = p.procedencia && p.procedencia.includes('ESPA') ? 'ESPAÑA' : cleanString(p.procedencia);
    p.unidad = cleanString(p.unidad);
    p.categoria = cleanString(p.categoria);
    p.subcategoria = cleanString(p.subcategoria);
    p.descripcion = cleanString(p.descripcion).replace(/ESPA.*?A/g, 'ESPAÑA');
    p.presentacion = cleanString(p.presentacion);
  }
  fs.writeFileSync('./src/data/products.json', JSON.stringify(jsonArr, null, 2), 'utf8');
  console.log('✅ products.json cleaned successfully.');

  // 2. Clean database products
  const prods = await db.select({
    id: products.id,
    name: products.name,
    manufacturer: products.manufacturer,
    technicalSpecs: products.technicalSpecs,
    presentation: products.presentation,
    description: products.description,
  }).from(products);

  let dbFixed = 0;
  for (const p of prods) {
    const isEspana = p.technicalSpecs && p.technicalSpecs.includes('ESPA');
    const newSpecs = isEspana ? 'Procedencia: ESPAÑA' : cleanString(p.technicalSpecs);
    const newName = cleanString(p.name).replace(/ESPA.*?A/g, 'ESPAÑA');
    const newMfg = cleanString(p.manufacturer);
    const newPres = cleanString(p.presentation);
    const newDesc = cleanString(p.description).replace(/ESPA.*?A/g, 'ESPAÑA');

    if (
      newName !== p.name ||
      newMfg !== p.manufacturer ||
      newSpecs !== p.technicalSpecs ||
      newPres !== p.presentation ||
      newDesc !== p.description
    ) {
      await db.update(products).set({
        name: newName,
        manufacturer: newMfg,
        technicalSpecs: newSpecs,
        presentation: newPres,
        description: newDesc,
      }).where(eq(products.id, p.id));
      dbFixed++;
    }
  }
  console.log(`✅ DB products cleaned: ${dbFixed} rows updated.`);

  // 3. Clean brands in DB
  const allBrands = await db.select().from(brands);
  for (const b of allBrands) {
    const newName = cleanString(b.name);
    if (newName !== b.name) {
      await db.update(brands).set({ name: newName }).where(eq(brands.id, b.id));
    }
  }
  console.log('✅ DB brands checked and cleaned.');

  // 4. Verify Procedencia aggregation
  const { sql } = await import('drizzle-orm');
  const procedenciaStats = await db.execute(sql`
    SELECT 
      TRIM(REPLACE(technical_specs, 'Procedencia: ', '')) as pais,
      count(*) as total
    FROM products
    WHERE technical_specs LIKE 'Procedencia:%'
    GROUP BY pais
    ORDER BY total DESC
    LIMIT 12
  `);

  console.log('\nTop procedencias after cleaning:');
  for (const r of procedenciaStats.rows as any[]) {
    console.log(`  - ${r.pais}: ${r.total}`);
  }

  process.exit(0);
}

run().catch(console.error);
