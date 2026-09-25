import { app, origins } from './app.js';

/**
 * Runs the API as a long-lived process: local development, Render, a VPS.
 * Vercel does not use this file — it imports the app from `/api/index.js`.
 */
const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
  console.log(`[api] allowing origins: ${origins.join(', ')}`);
});
