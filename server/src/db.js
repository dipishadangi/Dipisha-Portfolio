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

export const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
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
