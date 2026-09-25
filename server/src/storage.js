import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

/**
 * Uploaded images and PDFs live in Supabase Storage, not on this server's
 * disk. That matters the moment the site is deployed: most hosts give a
 * container a fresh filesystem on every deploy, so anything written locally
 * would quietly disappear.
 *
 * The service-role key is used here and must never reach the browser — it
 * bypasses every row-level security rule. It stays on the server, and the
 * public site only ever sees the resulting public URLs.
 */

export const BUCKET = process.env.SUPABASE_BUCKET?.trim() || 'DIPISHA';

const URL = process.env.SUPABASE_URL?.trim() ?? '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';

export const storageIsConfigured = Boolean(URL && SERVICE_KEY);

let client = null;

function supabase() {
  if (!storageIsConfigured) {
    const error = new Error(
      'Image storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env — see the README.',
    );
    error.status = 503;
    throw error;
  }
  if (!client) {
    client = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

const EXTENSIONS = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
};

/** A key that is safe in a URL and cannot collide or escape its folder. */
export function safeKey(originalName, mimetype, folder) {
  const parsed = path.parse(originalName || 'file');
  const stem =
    parsed.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'file';
  const ext = EXTENSIONS[mimetype] ?? 'bin';
  return `${folder}/${stem}-${randomUUID().slice(0, 8)}.${ext}`;
}

/** Uploads a buffer and returns its public URL. */
export async function putObject({ key, body, contentType }) {
  const { error } = await supabase()
    .storage.from(BUCKET)
    .upload(key, body, {
      contentType,
      cacheControl: '604800', // a week; the key changes whenever the file does
      upsert: false,
    });

  if (error) {
    const wrapped = new Error(`Upload failed: ${error.message}`);
    wrapped.status = 502;
    throw wrapped;
  }

  return publicUrl(key);
}

export function publicUrl(key) {
  const { data } = supabase().storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

export async function removeObject(key) {
  const { error } = await supabase().storage.from(BUCKET).remove([key]);
  if (error) throw new Error(`Could not delete that file: ${error.message}`);
}

/**
 * The storage key for a URL this server produced, or null for anything else —
 * a pasted link to an image hosted elsewhere, for instance, which we must not
 * try to delete.
 */
export function keyFromUrl(url) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const at = String(url ?? '').indexOf(marker);
  return at === -1 ? null : decodeURIComponent(url.slice(at + marker.length));
}
