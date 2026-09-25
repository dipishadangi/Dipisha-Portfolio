import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { queryOne } from '../db.js';
import { requireAuth, signToken } from '../middleware/auth.js';

export const authRouter = Router();

/** Slows down anyone trying passwords in bulk. */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Wait fifteen minutes and try again.' },
});

authRouter.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? '')
      .trim()
      .toLowerCase();
    const password = String(req.body?.password ?? '');

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Enter both your email and your password.' });
    }

    const user = await queryOne(
      'select id, email, name, password_hash from admin_users where email = $1',
      [email],
    );

    // Compare against a dummy hash when the user is missing, so a wrong email
    // and a wrong password take the same amount of time to answer.
    const hash =
      user?.password_hash ??
      '$2b$12$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRS';
    const ok = await bcrypt.compare(password, hash);

    if (!user || !ok) {
      return res
        .status(401)
        .json({ error: 'That email and password do not match.' });
    }

    return res.json({
      token: signToken(user),
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return next(error);
  }
});

/** Lets the front end check a stored token is still good on page load. */
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({
    user: { id: req.user.sub, email: req.user.email, name: req.user.name },
  });
});
