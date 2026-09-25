import jwt from 'jsonwebtoken';
import { queryOne } from '../db.js';

const FALLBACK_SECRET = 'dev-only-insecure-secret-change-me';

export function jwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET must be set in production. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"',
    );
  }
  return FALLBACK_SECRET;
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    jwtSecret(),
    { expiresIn: '7d' },
  );
}

/**
 * Rejects the request unless it carries a valid admin token AND that admin
 * still exists.
 *
 * A signed token stays valid for seven days on its own, so checking the
 * signature alone would mean deleting an account did not end its sessions.
 * The extra lookup is a primary-key hit on a table with one or two rows, on
 * routes only the owner ever calls.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'You need to sign in first.' });
  }

  let claims;
  try {
    claims = jwt.verify(token, jwtSecret());
  } catch {
    return res
      .status(401)
      .json({ error: 'Your session has expired. Sign in again.' });
  }

  try {
    const user = await queryOne(
      'select id, email, name from admin_users where id = $1',
      [claims.sub],
    );

    if (!user) {
      return res
        .status(401)
        .json({ error: 'That account no longer exists. Sign in again.' });
    }

    req.user = { sub: user.id, email: user.email, name: user.name };
    return next();
  } catch (error) {
    return next(error);
  }
}
