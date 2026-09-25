/**
 * Checks that deleting an admin account really does end its sessions.
 *
 *   npm run check:revoke
 *
 * Signs in as a throwaway account, confirms the token works, deletes the
 * account out from under it, then confirms the same token is refused.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { pool, query } from '../db.js';

const BASE = process.env.SMOKE_URL ?? 'http://127.0.0.1:4000';
const EMAIL = `revoke-${randomUUID().slice(0, 8)}@example.test`;
const PASSWORD = randomUUID();

async function run() {
  const hash = await bcrypt.hash(PASSWORD, 10);
  await query('insert into admin_users (email, password_hash) values ($1, $2)', [
    EMAIL,
    hash,
  ]);

  const login = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  }).then((r) => r.json());

  const auth = { Authorization: `Bearer ${login.token}` };

  const before = await fetch(`${BASE}/api/admin/skills`, { headers: auth });
  console.log(
    before.ok
      ? '  ✓ the token works while the account exists'
      : `  ✗ the token should have worked (${before.status})`,
  );

  await query('delete from admin_users where email = $1', [EMAIL]);

  const after = await fetch(`${BASE}/api/admin/skills`, { headers: auth });
  const body = await after.json().catch(() => ({}));

  if (after.status === 401) {
    console.log('  ✓ the same token is refused once the account is deleted');
    console.log(`    server said: "${body.error}"`);
  } else {
    console.log(
      `  ✗ the token still works after deletion (status ${after.status}) — sessions are not being revoked`,
    );
    process.exitCode = 1;
  }
}

run()
  .catch((error) => {
    console.error('✗', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
