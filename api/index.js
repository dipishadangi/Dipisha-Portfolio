/**
 * Vercel entry point.
 *
 * Vercel turns every file under /api into a serverless function, and
 * `vercel.json` rewrites /api/anything here, so this one function serves the
 * whole API. An Express app is already a `(req, res)` handler, so it can be
 * exported directly — there is no adapter and no second copy of the routing.
 *
 * Nothing else lives in this file on purpose: the app itself is in
 * server/src/app.js, shared with the long-running server used by Render.
 */
export { default } from '../server/src/app.js';
