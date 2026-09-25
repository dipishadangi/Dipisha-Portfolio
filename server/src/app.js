import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { authRouter } from './routes/auth.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
import { uploadRouter, MAX_UPLOAD_BYTES } from './routes/upload.js';
import { storageIsConfigured, BUCKET } from './storage.js';
import { pool } from './db.js';

/**
 * The Express application, with no opinion about how it is run.
 *
 * `index.js` puts it behind a listening port for Render and local use;
 * `/api/index.js` at the repo root hands it to Vercel as a serverless
 * function. Keeping the two apart means there is only ever one copy of the
 * routing and middleware.
 */
export const app = express();

/**
 * In development the client runs on its own port, so it needs to be allowed
 * through CORS. In production the same deployment serves both, so requests are
 * same-origin and never reach this.
 */
export const origins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

/**
 * Entries may contain a single `*` wildcard, so that Vercel's preview deploys
 * — which get a fresh subdomain every push — can be allowed in one go with
 * `https://*.vercel.app`. The wildcard matches one label only, never a dot,
 * so it cannot be widened into a different domain.
 */
function originAllowed(requestOrigin) {
  // No Origin header: same-origin navigation, curl, or a server-to-server
  // call. There is nothing to protect against here — CORS only restrains
  // browsers acting on behalf of another site.
  if (!requestOrigin) return true;

  return origins.some((allowed) => {
    if (!allowed.includes('*')) return allowed === requestOrigin;

    const pattern = allowed
      .split('*')
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('[^.]+');

    return new RegExp(`^${pattern}$`).test(requestOrigin);
  });
}

app.use(
  cors({
    origin: (requestOrigin, callback) =>
      callback(null, originAllowed(requestOrigin)),
    credentials: false,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.set('trust proxy', 1);

/* New uploads go straight to Supabase Storage — nothing is ever written to
   this server's disk, so a deploy with a fresh filesystem loses nothing.

   This route only reads files that were uploaded before that change, so the
   site keeps working until `npm run migrate:storage` has moved them. Once the
   migration reports nothing left on disk, delete server/uploads and these few
   lines. */
const LEGACY_UPLOADS = path.resolve(process.cwd(), 'uploads');

if (fs.existsSync(LEGACY_UPLOADS)) {
  app.use(
    '/uploads',
    express.static(LEGACY_UPLOADS, {
      maxAge: '7d',
      setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
    }),
  );
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('select 1');
    res.json({
      ok: true,
      database: 'connected',
      storage: storageIsConfigured ? `bucket "${BUCKET}"` : 'not configured',
    });
  } catch (error) {
    res.status(503).json({ ok: false, error: error.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api', publicRouter);
app.use('/api/admin', adminRouter);
app.use('/api/media', uploadRouter);

/* ---------------------------------------------------------------------------
   Serve the built React app and let its router handle deep links.

   Only used where this process also serves the site — Render, or `npm start`
   locally. On Vercel the static files are served from the CDN and never reach
   here, so the directory simply does not exist next to the function.
   --------------------------------------------------------------------------- */
const CLIENT_DIST = path.resolve(process.cwd(), '../client/dist');

if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: 'No such endpoint.' });
});

// eslint-disable-next-line no-unused-vars -- Express needs all four arguments
app.use((error, _req, res, _next) => {
  const isMulter = error?.name === 'MulterError';
  const status = isMulter ? 400 : (error.status ?? 500);

  // multer's own wording for an oversized file is 'File too large', which
  // does not say what the limit is.
  if (error?.code === 'LIMIT_FILE_SIZE') {
    const mb = Math.round(MAX_UPLOAD_BYTES / 1024 / 1024);
    return res
      .status(400)
      .json({ error: `That file is too big. The limit here is ${mb}MB.` });
  }

  if (status >= 500) console.error('[api]', error);

  // 503 is raised deliberately for "this is not set up yet", so its message is
  // written to be read. Every other 5xx is unexpected and could leak internals,
  // so it stays generic.
  const showMessage = status < 500 || status === 503;

  res.status(status).json({
    error: showMessage
      ? (error.message ?? 'That request could not be handled.')
      : 'Something went wrong on the server.',
  });
});

export default app;
