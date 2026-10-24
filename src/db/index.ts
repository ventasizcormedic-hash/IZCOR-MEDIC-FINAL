import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite, type PgliteDatabase } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const projectRoot = (() => {
  try {
    return path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
  } catch {
    return process.cwd();
  }
})();

declare global {
  var _postgresPool: Pool | undefined;
  var _pgliteClient: PGlite | undefined;
  var _activeDb: any | undefined;
  var _dbEngineType: 'postgres' | 'pglite' | undefined;
}

export const createPool = (): Pool => {
  if (!global._postgresPool) {
    if (process.env.DATABASE_URL) {
      global._postgresPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        connectionTimeoutMillis: 3000,
      });
    } else {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST || 'localhost',
        port: parseInt(process.env.SQL_PORT || '5432', 10),
        user: process.env.SQL_USER || process.env.SQL_ADMIN_USER || 'postgres',
        password: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD || 'postgres',
        database: process.env.SQL_DB_NAME || 'izcor_medic',
        max: 10,
        connectionTimeoutMillis: 3000,
      });
    }

    global._postgresPool.on('error', (err) => {
      console.warn('PostgreSQL Pool idle client warning:', err.message);
    });
  }
  return global._postgresPool;
};

export const getPgliteClient = (): PGlite => {
  if (!global._pgliteClient) {
    const dataDir = path.resolve(projectRoot, '.data', 'pglite_db');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    global._pgliteClient = new PGlite(dataDir);
  }
  return global._pgliteClient;
};

// Default initial engine: PGlite for resilient zero-config execution
const defaultPglite = getPgliteClient();
global._activeDb = drizzlePglite(defaultPglite, { schema });
global._dbEngineType = 'pglite';

// Export a proxy so any external references to `db` always resolve to the active engine
export const db = new Proxy({}, {
  get(target, prop, receiver) {
    const current = global._activeDb || drizzlePglite(getPgliteClient(), { schema });
    const val = Reflect.get(current, prop, receiver);
    if (typeof val === 'function') {
      return val.bind(current);
    }
    return val;
  }
}) as unknown as PgliteDatabase<typeof schema>;

// Database initialization, schema bootstrap & auto-seeding
// Applies the SQL files in drizzle/ in order. Statements that already ran
// ("already exists" / "duplicate") are skipped, so it is safe on every boot.
async function runMigrations(exec: (stmt: string) => Promise<unknown>) {
  const migrationsDir = path.join(projectRoot, 'drizzle');
  if (!fs.existsSync(migrationsDir)) {
    console.warn('Nota: carpeta drizzle/ no encontrada; no se aplicaron migraciones.');
    return;
  }
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const statements = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      .split('--> statement-breakpoint')
      .map(st => st.trim())
      .filter(st => st.length > 0);
    for (const stmt of statements) {
      try {
        await exec(stmt);
      } catch (e: any) {
        const msg = String(e?.message || '');
        if (!msg.includes('already exists') && !msg.includes('duplicate')) {
          console.warn(`Aviso de migración (${file}): ${msg}`);
        }
      }
    }
  }
}

export async function initDatabase(): Promise<{ engine: 'postgres' | 'pglite'; seeded: boolean }> {
  let seeded = false;
  let usePostgres = false;

  const isProduction = process.env.NODE_ENV === 'production';
  const postgresConfigured = Boolean(process.env.DATABASE_URL || (process.env.SQL_HOST && process.env.SQL_HOST !== 'localhost'));

  // 1. Attempt PostgreSQL connection if configured
  if (postgresConfigured) {
    try {
      const pool = createPool();
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      usePostgres = true;
      global._activeDb = drizzlePg(pool, { schema });
      global._dbEngineType = 'postgres';
      console.log('✅ [Database] Conectado exitosamente a PostgreSQL externo.');
      await runMigrations((stmt) => pool.query(stmt));
    } catch (err: any) {
      if (isProduction) {
        // Never fall back to the local engine in production: its data would be lost on restart.
        throw new Error(`No se pudo conectar a PostgreSQL en producción: ${err?.message || err}`);
      }
      console.warn(`⚠️ [Database] No se pudo conectar a PostgreSQL (${err?.message || err}). Activando motor local PGlite.`);
      usePostgres = false;
    }
  }

  if (!usePostgres) {
    const pglite = getPgliteClient();
    global._activeDb = drizzlePglite(pglite, { schema });
    global._dbEngineType = 'pglite';
    console.log('⚡ [Database] Motor PGlite PostgreSQL embebido activo (.data/pglite_db).');
    if (isProduction) {
      console.warn('⚠️ [Database] PRODUCCIÓN SIN DATABASE_URL: los datos se guardan en .data/ dentro del contenedor y se perderán al reiniciarlo. Configure DATABASE_URL con un PostgreSQL gestionado.');
    }
    await runMigrations((stmt) => pglite.exec(stmt));
  }

  // 2. Check if database is empty and auto-seed
  try {
    const catCheck = await global._activeDb.select().from(schema.categories).limit(1);
    if (catCheck.length === 0) {
      console.log('📦 [Database] Base de datos vacía detectada. Ejecutando siembra canónica...');
      const { runSeed } = await import('./seed.ts');
      await runSeed(global._activeDb);
      seeded = true;
    } else {
      console.log('✨ [Database] Catálogo existente verificado.');
    }
  } catch (err: any) {
    console.warn('Aviso al verificar siembra:', err?.message || err);
  }

  return { engine: global._dbEngineType || 'pglite', seeded };
}
