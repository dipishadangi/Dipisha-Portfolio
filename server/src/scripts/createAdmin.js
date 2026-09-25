import 'dotenv/config';
import bcrypt from 'bcryptjs';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { pool, queryOne } from '../db.js';

/**
 * Creates (or updates) the account that signs in to /admin.
 *
 *   npm run create:admin
 *   npm run create:admin -- her@email.com "a good password" "Dipisha"
 *
 * Passing the password as an argument puts it in your shell history, so the
 * interactive prompt is the better option.
 */
async function run() {
  let [email, password, name] = process.argv.slice(2);

  if (!email || !password) {
    const rl = readline.createInterface({ input: stdin, output: stdout });
    try {
      email ||= await rl.question('Email: ');
      password ||= await rl.question('Password (at least 10 characters): ');
      name ||= await rl.question('Name (optional): ');
    } finally {
      rl.close();
    }
  }

  email = String(email ?? '')
    .trim()
    .toLowerCase();
  password = String(password ?? '');
  name = String(name ?? '').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('That does not look like an email address.');
  }
  if (password.length < 10) {
    throw new Error('Use a password of at least 10 characters.');
  }

  const hash = await bcrypt.hash(password, 12);

  const user = await queryOne(
    `insert into admin_users (email, password_hash, name)
     values ($1, $2, $3)
     on conflict (email) do update
       set password_hash = excluded.password_hash,
           name = case when excluded.name = '' then admin_users.name else excluded.name end
     returning id, email, name`,
    [email, hash, name],
  );

  console.log(`✓ Admin account ready: ${user.email}`);
  console.log('  Sign in at http://localhost:5173/admin');
}

run()
  .catch((error) => {
    console.error('✗', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
