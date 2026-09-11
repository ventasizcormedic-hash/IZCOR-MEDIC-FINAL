import { db, initDatabase } from '../src/db/index.ts';
import { products, categories, brands, productImages } from '../src/db/schema.ts';
import { sql } from 'drizzle-orm';

async function test() {
  await initDatabase();
  const [prodCount] = await db.select({ count: sql<number>`count(*)::int` }).from(products);
  const [catCount] = await db.select({ count: sql<number>`count(*)::int` }).from(categories);
  const [brandCount] = await db.select({ count: sql<number>`count(*)::int` }).from(brands);
  const [imgCount] = await db.select({ count: sql<number>`count(*)::int` }).from(productImages);

  console.log('--- ESTADO DE LA BASE DE DATOS ---');
  console.log(`Total Productos: ${prodCount.count}`);
  console.log(`Total Categorías: ${catCount.count}`);
  console.log(`Total Marcas: ${brandCount.count}`);
  console.log(`Total Imágenes Registradas: ${imgCount.count}`);

  const sample = await db.select().from(products).limit(3);
  console.log('\nMuestra de productos:');
  sample.forEach(p => console.log(`  * #${p.id} | ${p.name} | ${p.model} | Status: ${p.publicationStatus} | Score: ${p.validationScore}`));
  process.exit(0);
}

test().catch(console.error);
