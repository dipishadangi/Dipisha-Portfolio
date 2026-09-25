/**
 * Moves anything still on local disk into Supabase Storage.
 *
 *   npm run migrate:storage
 *
 * Uploads every file under server/uploads that a database row still points at,
 * then rewrites those rows — media, the profile photo and CV, project covers
 * and galleries — to the new public URLs. Safe to run more than once: rows
 * already pointing at Supabase are skipped.
 *
 * Nothing is deleted from disk. Check the site looks right, then remove
 * server/uploads by hand.
 */
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pool, query, queryOne } from '../db.js';
import { putObject, storageIsConfigured, BUCKET } from '../storage.js';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
};

const isLocal = (url) => typeof url === 'string' && url.startsWith('/uploads/');

/** Uploads one local path, remembering results so a file is only sent once. */
const cache = new Map();

async function migrateUrl(url) {
  if (!isLocal(url)) return url;
  if (cache.has(url)) return cache.get(url);

  const relative = url.replace(/^\/uploads\//, '');
  const onDisk = path.join(UPLOAD_DIR, relative);

  let body;
  try {
    body = await fs.readFile(onDisk);
  } catch {
    console.log(`  ! missing on disk, leaving as-is: ${url}`);
    cache.set(url, url);
    return url;
  }

  const contentType = MIME[path.extname(onDisk).toLowerCase()] ?? 'application/octet-stream';
  const newUrl = await putObject({ key: relative, body, contentType });

  cache.set(url, newUrl);
  console.log(`  ✓ ${relative}  (${(body.length / 1024).toFixed(0)} KB)`);
  return newUrl;
}

async function run() {
  if (!storageIsConfigured) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in server/.env first.',
    );
  }

  console.log(`\nMoving local uploads into the "${BUCKET}" bucket\n`);

  /* ------------------------------------------------------------- media rows */
  const media = await query('select * from media where url like $1', ['/uploads/%']);
  console.log(`media rows to move: ${media.length}`);

  for (const row of media) {
    const relative = row.url.replace(/^\/uploads\//, '');
    const newUrl = await migrateUrl(row.url);
    if (newUrl !== row.url) {
      await query('update media set url = $1, storage_key = $2 where id = $3', [
        newUrl,
        relative,
        row.id,
      ]);
    }
  }

  /* ----------------------------------------------------------------- profile */
  const profile = await queryOne('select avatar_url, resume_url from profile where id = 1');
  if (profile) {
    const avatar = await migrateUrl(profile.avatar_url);
    const resume = await migrateUrl(profile.resume_url);
    if (avatar !== profile.avatar_url || resume !== profile.resume_url) {
      await query('update profile set avatar_url = $1, resume_url = $2 where id = 1', [
        avatar,
        resume,
      ]);
      console.log('  ✓ profile photo / CV repointed');
    }
  }

  /* ---------------------------------------------------------------- projects */
  const projects = await query('select id, cover_url, gallery from projects');
  for (const project of projects) {
    const cover = await migrateUrl(project.cover_url);
    const gallery = Array.isArray(project.gallery) ? project.gallery : [];
    const movedGallery = [];
    for (const item of gallery) movedGallery.push(await migrateUrl(item));

    const galleryChanged =
      JSON.stringify(gallery) !== JSON.stringify(movedGallery);

    if (cover !== project.cover_url || galleryChanged) {
      await query('update projects set cover_url = $1, gallery = $2 where id = $3', [
        cover,
        JSON.stringify(movedGallery),
        project.id,
      ]);
      console.log(`  ✓ project ${project.id} repointed`);
    }
  }

  /* ------------------------------------------------------------------ check */
  const leftOver = await query(
    `select 'media' as source, url from media where url like '/uploads/%'
     union all
     select 'profile', avatar_url from profile where avatar_url like '/uploads/%'
     union all
     select 'profile', resume_url from profile where resume_url like '/uploads/%'
     union all
     select 'project', cover_url from projects where cover_url like '/uploads/%'`,
  );

  console.log(
    leftOver.length === 0
      ? '\n✓ Nothing points at local disk any more.'
      : `\n! Still local: ${JSON.stringify(leftOver)}`,
  );
  console.log('  server/uploads is untouched — delete it once the site looks right.\n');
}

run()
  .catch((error) => {
    console.error('\n✗', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
