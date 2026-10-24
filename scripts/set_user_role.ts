/**
 * Assigns a role to an existing user (one who has signed in to /admin at least once).
 * Usage: npm run set-role -- <email> <ROLE>
 * Example (first administrator): npm run set-role -- ventas@empresa.com SUPER_ADMIN
 */
import { db, initDatabase } from '../src/db/index.ts';
import { users } from '../src/db/schema.ts';
import { sql } from 'drizzle-orm';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER', 'QUALITY_ANALYST', 'USER'];

async function main() {
  const [email, roleArg] = process.argv.slice(2);
  const role = (roleArg || '').toUpperCase();
  if (!email || !ROLES.includes(role)) {
    console.error(`Uso: npm run set-role -- <email> <${ROLES.join('|')}>`);
    process.exit(1);
  }

  await initDatabase();
  const updated = await db
    .update(users)
    .set({ role })
    .where(sql`lower(${users.email}) = ${email.trim().toLowerCase()}`)
    .returning();

  if (updated.length === 0) {
    console.error(`No existe un usuario con el correo ${email}. Inicie sesión una vez en /admin con esa cuenta y vuelva a ejecutar el comando.`);
    process.exit(1);
  }
  console.log(`Rol ${role} asignado a ${email}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
