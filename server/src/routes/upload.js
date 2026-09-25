import { Router } from 'express';
import multer from 'multer';
import { query, queryOne } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { keyFromUrl, putObject, removeObject, safeKey } from '../storage.js';

const FOLDERS = ['uploads', 'projects', 'profile', 'documents'];

const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
  'application/pdf',
]);

export const uploadRouter = Router();

/**
 * A Vercel serverless function rejects request bodies over 4.5MB before any
 * of this code runs, so the limit is lowered there to keep the failure
 * legible: multer's "file too large" message rather than an opaque 413 from
 * the platform. Anywhere else the bucket's own 10MB cap applies.
 */
export const MAX_UPLOAD_BYTES = process.env.VERCEL
  ? 4 * 1024 * 1024
  : 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.has(file.mimetype)) return cb(null, true);
    // Tagged as a 400 so the error handler shows this message to the user
    // instead of treating it as an unexpected server fault.
    const error = new Error(
      'Only PNG, JPG, WebP, GIF, SVG, AVIF and PDF are allowed.',
    );
    error.status = 400;
    return cb(error);
  },
});

function folderFrom(value) {
  const folder = String(value ?? 'uploads');
  return FOLDERS.includes(folder) ? folder : 'uploads';
}

uploadRouter.use(requireAuth);

uploadRouter.post('/', upload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'No file came through.' });
    }

    const folder = folderFrom(req.body?.folder);
    const saved = [];

    for (const file of req.files) {
      const key = safeKey(file.originalname, file.mimetype, folder);
      const url = await putObject({
        key,
        body: file.buffer,
        contentType: file.mimetype,
      });

      const row = await queryOne(
        `insert into media (filename, url, mime_type, size_bytes, folder, storage_key)
         values ($1, $2, $3, $4, $5, $6)
         returning *`,
        [
          key.split('/').pop(),
          url,
          file.mimetype,
          file.size,
          folder,
          key,
        ],
      );
      saved.push(row);
    }

    return res.status(201).json(saved);
  } catch (error) {
    return next(error);
  }
});

uploadRouter.get('/', async (req, res, next) => {
  try {
    const rows = req.query.folder
      ? await query(
          'select * from media where folder = $1 order by created_at desc',
          [folderFrom(req.query.folder)],
        )
      : await query('select * from media order by created_at desc');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

uploadRouter.delete('/:id', async (req, res, next) => {
  try {
    const row = await queryOne('delete from media where id = $1 returning *', [
      req.params.id,
    ]);
    if (!row) return res.status(404).json({ error: 'That file is gone.' });

    // Older rows predate storage_key, so fall back to parsing the URL. A URL
    // pointing somewhere other than our bucket yields null and is left alone.
    const key = row.storage_key ?? keyFromUrl(row.url);
    if (key) {
      try {
        await removeObject(key);
      } catch (error) {
        // The database row is already gone; losing the object is not worth
        // failing the request over, but it should be visible in the logs.
        console.error('[media] could not remove object', key, error.message);
      }
    }

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});
