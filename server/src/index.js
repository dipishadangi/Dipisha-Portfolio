import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { authRouter } from './routes/auth.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
import { uploadRouter } from './routes/upload.js';
import { storageIsConfigured, BUCKET } from './storage.js';
import { pool } from './db.js';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

/**
 * In development the client runs on its own port, so it needs to be allowed
 * through CORS. In production the client is built into static files and served
 * by this same server, so no cross-origin requests happen at all.
 */
const origins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: origins, credentials: false }));
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
   Production: serve the built React app and let the router handle deep links.
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

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
  console.log(`[api] allowing origins: ${origins.join(', ')}`);
});
