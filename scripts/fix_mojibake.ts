import { db, initDatabase } from '../src/db/index.ts';
import { products } from '../src/db/schema.ts';
import { sql, eq } from 'drizzle-orm';
import fs from 'fs';

function fixMojibake(str: string | null | undefined): string {
  if (!str) return '';
  try {
    // If it contains typical mojibake patterns
    if (/[\u00C2\u00C3]/.test(str)) {
      return Buffer.from(str, 'latin1').toString('utf8');
    }
  } catch {
    // ignore
  }
  return str;
}

async function run() {
  await initDatabase();

  console.log('Testing fixMojibake("ESPAÃ‘A") ->', fixMojibake('ESPAÃ‘A'));

  // 1. Fix in DB
  const allProds = await db.select({
    id: products.id,
    name: products.name,
    manufacturer: products.manufacturer,
    technicalSpecs: products.technicalSpecs,
    presentation: products.presentation,
    description: products.description,
  }).from(products);

  let updatedCount = 0;

  for (const prod of allProds) {
    let changed = false;
    const newName = fixMojibake(prod.name);
    const newMfg = fixMojibake(prod.manufacturer);
    const newSpecs = fixMojibake(prod.technicalSpecs);
    const newPres = fixMojibake(prod.presentation);
    const newDesc = fixMojibake(prod.description);

    if (
      newName !== prod.name ||
      newMfg !== prod.manufacturer ||
      newSpecs !== prod.technicalSpecs ||
      newPres !== prod.presentation ||
      newDesc !== prod.description
    ) {
      await db.update(products).set({
        name: newName,
        manufacturer: newMfg,
        technicalSpecs: newSpecs,
        presentation: newPres,
        description: newDesc,
      }).where(eq(products.id, prod.id));
      changed = true;
      updatedCount++;
    }
  }

  console.log(`✅ Fixed mojibake in DB: ${updatedCount} products updated.`);

  // 2. Fix in products.json
  const rawJson = fs.readFileSync('./src/data/products.json', 'utf8');
  const jsonArr = JSON.parse(rawJson);
  let jsonFixed = 0;
  for (const p of jsonArr) {
    const orig = JSON.stringify(p);
    p.nombre = fixMojibake(p.nombre);
    p.marca = fixMojibake(p.marca);
    p.procedencia = fixMojibake(p.procedencia);
    p.unidad = fixMojibake(p.unidad);
    p.categoria = fixMojibake(p.categoria);
    p.subcategoria = fixMojibake(p.subcategoria);
    p.descripcion = fixMojibake(p.descripcion);
    p.presentacion = fixMojibake(p.presentacion);
    if (JSON.stringify(p) !== orig) {
      jsonFixed++;
    }
  }
  fs.writeFileSync('./src/data/products.json', JSON.stringify(jsonArr, null, 2), 'utf8');
  console.log(`✅ Fixed mojibake in products.json: ${jsonFixed} products updated.`);

  process.exit(0);
}

run().catch(console.error);
