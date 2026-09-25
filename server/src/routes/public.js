import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query, queryOne } from '../db.js';

export const publicRouter = Router();

/** Everything the site needs to render, in one request. */
publicRouter.get('/content', async (_req, res, next) => {
  try {
    const [profile, sections, skills, services, projects, timeline] =
      await Promise.all([
        queryOne('select * from profile where id = 1'),
        query('select * from sections order by sort_order asc'),
        query(
          'select * from skills where visible = true order by sort_order asc',
        ),
        query(
          'select * from services where visible = true order by sort_order asc',
        ),
        query(
          `select id, title, slug, kind, summary, cover_url, tech, live_url,
                  repo_url, year, featured, sort_order
             from projects
            where visible = true
            order by sort_order asc`,
        ),
        query(
          'select * from timeline where visible = true order by sort_order asc',
        ),
      ]);

    res.json({
      profile,
      sections: Object.fromEntries(sections.map((row) => [row.key, row])),
      skills,
      services,
      projects,
      timeline,
    });
  } catch (error) {
    next(error);
  }
});

/** One project, by its slug. */
publicRouter.get('/projects/:slug', async (req, res, next) => {
  try {
    const project = await queryOne(
      'select * from projects where slug = $1 and visible = true',
      [req.params.slug],
    );

    if (!project) {
      return res.status(404).json({ error: 'No project with that address.' });
    }
    return res.json(project);
  } catch (error) {
    return next(error);
  }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  // Five an hour from one address is plenty for a real enquiry. Raise it with
  // CONTACT_RATE_LIMIT if the site ever sits behind a shared IP.
  limit: Number(process.env.CONTACT_RATE_LIMIT ?? 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'That is a lot of messages. Try again in an hour, or email directly.',
  },
});

/** The contact form. Anyone may post; only the admin may read. */
publicRouter.post('/messages', contactLimiter, async (req, res, next) => {
  try {
    const body = req.body ?? {};

    // Honeypot: a real person never fills a field they cannot see.
    if (String(body.company ?? '').trim()) {
      return res.status(201).json({ ok: true });
    }

    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();
    const subject = String(body.subject ?? '').trim();
    const message = String(body.body ?? '').trim();

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: 'Your name, email and a message are all needed.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'That email address looks wrong.' });
    }
    if (name.length > 120 || email.length > 200 || subject.length > 200) {
      return res.status(400).json({ error: 'One of those fields is too long.' });
    }
    if (message.length > 5000) {
      return res
        .status(400)
        .json({ error: 'That message is too long — 5000 characters max.' });
    }

    await query(
      'insert into messages (name, email, subject, body) values ($1, $2, $3, $4)',
      [name, email, subject, message],
    );

    return res.status(201).json({ ok: true });
  } catch (error) {
    return next(error);
  }
});
