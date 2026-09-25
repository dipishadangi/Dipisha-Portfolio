import { Router } from 'express';
import { query, queryOne } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import {
  COLLECTIONS,
  PROFILE_COLUMNS,
  PROFILE_JSON,
  SECTION_COLUMNS,
  pickColumns,
} from '../tables.js';

export const adminRouter = Router();

adminRouter.use(requireAuth);

/* ----------------------------------------------------------------- profile */

adminRouter.get('/profile', async (_req, res, next) => {
  try {
    res.json(await queryOne('select * from profile where id = 1'));
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/profile', async (req, res, next) => {
  try {
    const data = pickColumns(req.body ?? {}, PROFILE_COLUMNS, {
      json: PROFILE_JSON,
    });
    const columns = Object.keys(data);

    if (columns.length === 0) {
      return res.status(400).json({ error: 'Nothing to save.' });
    }

    const assignments = columns
      .map((column, i) => `${column} = $${i + 1}`)
      .join(', ');

    const row = await queryOne(
      `update profile
          set ${assignments}, updated_at = now()
        where id = 1
        returning *`,
      Object.values(data),
    );

    return res.json(row);
  } catch (error) {
    return next(error);
  }
});

/* ---------------------------------------------------------------- sections */

adminRouter.get('/sections', async (_req, res, next) => {
  try {
    res.json(await query('select * from sections order by sort_order asc'));
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/sections/:key', async (req, res, next) => {
  try {
    const data = pickColumns(req.body ?? {}, SECTION_COLUMNS);
    const columns = Object.keys(data);

    if (columns.length === 0) {
      return res.status(400).json({ error: 'Nothing to save.' });
    }

    const assignments = columns
      .map((column, i) => `${column} = $${i + 1}`)
      .join(', ');

    const row = await queryOne(
      `update sections set ${assignments}
        where key = $${columns.length + 1}
        returning *`,
      [...Object.values(data), req.params.key],
    );

    if (!row) return res.status(404).json({ error: 'No such section.' });
    return res.json(row);
  } catch (error) {
    return next(error);
  }
});

/* ------------------------------------------------------------------- inbox */
/* Registered before the generic /:table routes below, which would otherwise
   match "/inbox/messages" as table "inbox". */

adminRouter.get('/inbox/messages', async (_req, res, next) => {
  try {
    res.json(await query('select * from messages order by created_at desc'));
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/inbox/messages/:id', async (req, res, next) => {
  try {
    const row = await queryOne(
      'update messages set read = $1 where id = $2 returning *',
      [Boolean(req.body?.read), req.params.id],
    );
    if (!row) return res.status(404).json({ error: 'That message is gone.' });
    return res.json(row);
  } catch (error) {
    return next(error);
  }
});

adminRouter.delete('/inbox/messages/:id', async (req, res, next) => {
  try {
    await query('delete from messages where id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------- collections */

/** Guards :table against anything not in the whitelist. */
function collection(req, res, next) {
  const config = COLLECTIONS[req.params.table];
  if (!config) {
    return res.status(404).json({ error: 'No such content type.' });
  }
  req.collection = { name: req.params.table, ...config };
  return next();
}

adminRouter.get('/:table', collection, async (req, res, next) => {
  try {
    res.json(
      await query(
        `select * from ${req.collection.name} order by sort_order asc, created_at asc`,
      ),
    );
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/:table', collection, async (req, res, next) => {
  try {
    const { name, columns: allowed, arrays, json } = req.collection;
    const data = pickColumns(req.body ?? {}, allowed, { arrays, json });
    const columns = Object.keys(data);

    if (columns.length === 0) {
      return res.status(400).json({ error: 'Nothing to create.' });
    }

    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    const row = await queryOne(
      `insert into ${name} (${columns.join(', ')})
       values (${placeholders})
       returning *`,
      Object.values(data),
    );

    return res.status(201).json(row);
  } catch (error) {
    return next(error);
  }
});

adminRouter.patch('/:table/:id', collection, async (req, res, next) => {
  try {
    const { name, columns: allowed, arrays, json } = req.collection;
    const data = pickColumns(req.body ?? {}, allowed, { arrays, json });
    const columns = Object.keys(data);

    if (columns.length === 0) {
      return res.status(400).json({ error: 'Nothing to save.' });
    }

    const assignments = columns
      .map((column, i) => `${column} = $${i + 1}`)
      .join(', ');

    const row = await queryOne(
      `update ${name} set ${assignments}
        where id = $${columns.length + 1}
        returning *`,
      [...Object.values(data), req.params.id],
    );

    if (!row) return res.status(404).json({ error: 'That item is gone.' });
    return res.json(row);
  } catch (error) {
    return next(error);
  }
});

adminRouter.delete('/:table/:id', collection, async (req, res, next) => {
  try {
    const row = await queryOne(
      `delete from ${req.collection.name} where id = $1 returning id`,
      [req.params.id],
    );
    if (!row) return res.status(404).json({ error: 'That item is gone.' });
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});
