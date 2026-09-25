import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../db.js';

const here = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const sql = await fs.readFile(path.join(here, '..', 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('✓ Tables created (or already there).');
  console.log('  Next: npm run db:seed, then npm run create:admin');
}

run()
  .catch((error) => {
    console.error('✗ Setup failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
