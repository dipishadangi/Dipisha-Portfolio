/**
 * End-to-end check of the API against the real database.
 *
 *   npm run smoke
 *
 * Creates a throwaway admin account, exercises every route, then removes
 * everything it made. Nothing it writes is left behind.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { pool, query, queryOne } from '../db.js';

const BASE = process.env.SMOKE_URL ?? 'http://127.0.0.1:4000';
const EMAIL = `smoke-${randomUUID().slice(0, 8)}@example.test`;
const PASSWORD = randomUUID();

let passed = 0;
let failed = 0;

function check(name, ok, detail = '') {
  if (ok) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function call(path, { method = 'GET', body, token, raw } = {}) {
  const headers = {};
  if (body && !raw) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: raw ? body : body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    /* some responses have no body */
  }
  return { status: response.status, body: payload };
}

async function run() {
  console.log(`\nSmoke test against ${BASE}\n`);

  /* ---------------------------------------------------------------- setup */
  const hash = await bcrypt.hash(PASSWORD, 10);
  await query(
    'insert into admin_users (email, password_hash, name) values ($1, $2, $3)',
    [EMAIL, hash, 'Smoke Test'],
  );

  /* ------------------------------------------------------------ public API */
  console.log('Public endpoints');
  const health = await call('/health');
  check('health reports a database connection', health.body?.database === 'connected');

  const content = await call('/content');
  check('content returns a profile', Boolean(content.body?.profile?.full_name));
  check('content returns projects', Array.isArray(content.body?.projects));
  check(
    'content hides project bodies from the list',
    content.body?.projects?.[0] !== undefined &&
      !Object.hasOwn(content.body.projects[0], 'body'),
  );

  const slug = content.body?.projects?.[0]?.slug;
  const project = await call(`/projects/${slug}`);
  check('a single project loads by slug', project.body?.slug === slug);
  check(
    'a single project includes the write-up',
    typeof project.body?.body === 'string',
  );

  const missing = await call('/projects/definitely-not-a-real-slug');
  check('an unknown slug gives 404', missing.status === 404);

  /* ----------------------------------------------------------------- auth */
  console.log('\nAuthentication');
  const badLogin = await call('/auth/login', {
    method: 'POST',
    body: { email: EMAIL, password: 'wrong-password' },
  });
  check('a wrong password is rejected', badLogin.status === 401);

  const login = await call('/auth/login', {
    method: 'POST',
    body: { email: EMAIL, password: PASSWORD },
  });
  check('a correct password returns a token', Boolean(login.body?.token));
  const token = login.body?.token;

  const noToken = await call('/admin/skills');
  check('admin routes reject anonymous callers', noToken.status === 401);

  const badToken = await call('/admin/skills', { token: 'not-a-real-token' });
  check('admin routes reject a forged token', badToken.status === 401);

  const me = await call('/auth/me', { token });
  check('the token identifies the user', me.body?.user?.email === EMAIL);

  /* ------------------------------------------------------------ admin CRUD */
  console.log('\nContent editing');
  const created = await call('/admin/skills', {
    method: 'POST',
    token,
    body: { name: 'Smoke Test Skill', category: 'Testing', level: 4, sort_order: 999 },
  });
  check('a skill can be created', created.status === 201 && Boolean(created.body?.id));
  const skillId = created.body?.id;

  const updated = await call(`/admin/skills/${skillId}`, {
    method: 'PATCH',
    token,
    body: { level: 2, visible: false },
  });
  check('a skill can be updated', updated.body?.level === 2 && updated.body?.visible === false);

  const afterHide = await call('/content');
  check(
    'a hidden skill disappears from the public site',
    !afterHide.body?.skills?.some((s) => s.id === skillId),
  );

  const arrays = await call('/admin/services', {
    method: 'POST',
    token,
    body: {
      title: 'Smoke Test Service',
      description: 'temporary',
      icon: 'sparkle',
      tags: ['one', 'two'],
      sort_order: 999,
    },
  });
  check(
    'text[] columns round-trip',
    Array.isArray(arrays.body?.tags) && arrays.body.tags.length === 2,
  );

  const jsonRow = await call('/admin/projects', {
    method: 'POST',
    token,
    body: {
      title: 'Smoke Test Project',
      slug: `smoke-${randomUUID().slice(0, 6)}`,
      gallery: ['/uploads/a.png', '/uploads/b.png'],
      tech: ['React'],
      sort_order: 999,
    },
  });
  check(
    'jsonb columns round-trip',
    Array.isArray(jsonRow.body?.gallery) && jsonRow.body.gallery.length === 2,
  );

  const badTable = await call('/admin/admin_users', { token });
  check('tables outside the whitelist are refused', badTable.status === 404);

  const profileSave = await call('/admin/profile', {
    method: 'PUT',
    token,
    body: { headline: 'Smoke Test Headline', socials: [{ label: 'X', url: 'https://x.com', icon: 'x' }] },
  });
  check('the profile saves', profileSave.body?.headline === 'Smoke Test Headline');
  check(
    'profile jsonb saves',
    Array.isArray(profileSave.body?.socials) && profileSave.body.socials.length === 1,
  );

  const sectionSave = await call('/admin/sections/about', {
    method: 'PATCH',
    token,
    body: { eyebrow: 'smoke' },
  });
  check('a section heading saves', sectionSave.body?.eyebrow === 'smoke');

  /* ---------------------------------------------------------------- upload */
  console.log('\nUploads');
  // A one-pixel PNG.
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
  const form = new FormData();
  form.append('files', new Blob([png], { type: 'image/png' }), 'smoke.png');
  form.append('folder', 'uploads');

  const upload = await call('/media', { method: 'POST', token, body: form, raw: true });

  // 503 means SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set yet. That
  // is a setup step, not a broken API, so say so rather than failing.
  const storageReady = upload.status !== 503;
  let mediaId = null;

  if (!storageReady) {
    console.log('  - storage not configured, skipping upload checks');
    console.log(`    (${upload.body?.error})`);
  } else {
    check('an image uploads', upload.status === 201 && Boolean(upload.body?.[0]?.url));
    mediaId = upload.body?.[0]?.id;
    const mediaUrl = upload.body?.[0]?.url;

    check(
      'the file is stored in Supabase, not on this server',
      typeof mediaUrl === 'string' &&
        mediaUrl.includes('/storage/v1/object/public/'),
    );

    if (mediaUrl) {
      const served = await fetch(mediaUrl);
      check('the uploaded file is publicly readable', served.ok);
      check(
        'it comes back as an image',
        (served.headers.get('content-type') ?? '').startsWith('image/'),
      );
    }
  }

  const badUpload = new FormData();
  badUpload.append(
    'files',
    new Blob([Buffer.from('#!/bin/sh')], { type: 'application/x-sh' }),
    'evil.sh',
  );
  const rejected = await call('/media', {
    method: 'POST',
    token,
    body: badUpload,
    raw: true,
  });
  // The type check happens before storage is touched, so this holds either way.
  check('a disallowed file type is refused', rejected.status === 400);

  /* --------------------------------------------------------------- contact */
  console.log('\nContact form');
  const subject = `Smoke ${randomUUID().slice(0, 6)}`;
  const sent = await call('/messages', {
    method: 'POST',
    body: {
      name: 'Smoke Tester',
      email: 'tester@example.test',
      subject,
      body: 'Just checking the wiring.',
    },
  });
  check('a message can be sent without signing in', sent.status === 201);

  const invalid = await call('/messages', {
    method: 'POST',
    body: { name: 'No Email', email: 'not-an-email', body: 'hi' },
  });
  check('a bad email address is rejected', invalid.status === 400);

  const honeypot = await call('/messages', {
    method: 'POST',
    body: { name: 'Bot', email: 'bot@example.test', body: 'spam', company: 'ACME' },
  });
  const inbox = await call('/admin/inbox/messages', { token });
  check('the honeypot silently drops bots', honeypot.status === 201);
  check(
    'the honeypot message never reaches the inbox',
    !inbox.body?.some((m) => m.name === 'Bot'),
  );
  check(
    'a real message reaches the inbox',
    inbox.body?.some((m) => m.subject === subject),
  );

  const inboxAnon = await call('/admin/inbox/messages');
  check('the inbox is private', inboxAnon.status === 401);

  /* --------------------------------------------------------------- cleanup */
  console.log('\nCleaning up');
  if (skillId) await call(`/admin/skills/${skillId}`, { method: 'DELETE', token });
  if (arrays.body?.id) await call(`/admin/services/${arrays.body.id}`, { method: 'DELETE', token });
  if (jsonRow.body?.id) await call(`/admin/projects/${jsonRow.body.id}`, { method: 'DELETE', token });
  if (mediaId) await call(`/media/${mediaId}`, { method: 'DELETE', token });

  const message = inbox.body?.find((m) => m.subject === subject);
  if (message) await call(`/admin/inbox/messages/${message.id}`, { method: 'DELETE', token });
  const botMessage = await queryOne(
    "select id from messages where email = 'bot@example.test'",
  );
  if (botMessage) await query('delete from messages where id = $1', [botMessage.id]);

  // Put the two edited rows back the way the seed had them.
  await query('update profile set headline = $1 where id = 1', [
    'Frontend Developer & Visual Designer',
  ]);
  await query('update profile set socials = $1 where id = 1', [
    JSON.stringify([
      { label: 'GitHub', url: 'https://github.com/', icon: 'github' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/', icon: 'linkedin' },
      { label: 'Instagram', url: 'https://instagram.com/', icon: 'instagram' },
      { label: 'Email', url: 'mailto:hello@example.com', icon: 'mail' },
    ]),
  ]);
  await query("update sections set eyebrow = 'the short version' where key = 'about'");
  await query('delete from admin_users where email = $1', [EMAIL]);

  const leftOver = await queryOne('select id from admin_users where email = $1', [EMAIL]);
  check('the throwaway account is gone', !leftOver);

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exitCode = 1;
}

run()
  .catch((error) => {
    console.error('\n✗ Smoke test crashed:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
