import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../db.js';

const here = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const sql = await fs.readFile(path.join(here, '..', 'seed.sql'), 'utf8');
  await pool.query(sql);
  console.log('✓ Starter content loaded.');
  console.log('  All of it is placeholder — replace it from /admin.');
}

run()
  .catch((error) => {
    console.error('✗ Seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
