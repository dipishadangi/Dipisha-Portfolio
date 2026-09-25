import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error(
    '\n[db] DATABASE_URL is missing.\n' +
      '     Copy server/.env.example to server/.env and paste your Postgres\n' +
      '     connection string into it. See the README.\n',
  );
}

/**
 * Supabase and most managed Postgres hosts require TLS but present a
 * certificate the default Node trust store rejects, so verification is
 * relaxed for remote hosts only. A local database needs no TLS at all.
 */
const connectionString = process.env.DATABASE_URL ?? '';
const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);

/**
 * A long-running server keeps a handful of connections open and reuses them.
 * On Vercel each request may land on its own short-lived instance, so a large
 * pool per instance would exhaust the database's connection limit under any
 * real traffic — one connection each, closed quickly, is the right shape.
 *
 * For serverless, point DATABASE_URL at Supabase's *transaction* pooler on
 * port 6543 rather than the session pooler on 5432.
 */
const isServerless = Boolean(process.env.VERCEL);

export const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: isServerless ? 1 : 10,
  idleTimeoutMillis: isServerless ? 5_000 : 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (error) => {
  console.error('[db] idle client error:', error.message);
});

/** Run a query and get the rows back. */
export async function query(text, params) {
  const result = await pool.query(text, params);
  return result.rows;
}

/** Run a query that should return exactly one row, or null. */
export async function queryOne(text, params) {
  const rows = await query(text, params);
  return rows[0] ?? null;
}
