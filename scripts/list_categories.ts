import { db, initDatabase } from '../src/db/index.ts';
import { categories } from '../src/db/schema.ts';

async function run() {
  await initDatabase();
  const all = await db.select().from(categories);
  console.log('Categories count:', all.length);
  for (const c of all) {
    console.log(` - ID: ${c.id} | parentId: ${c.parentId} | Name: "${c.name}" | Slug: "${c.slug}"`);
  }
  process.exit(0);
}

run().catch(console.error);
