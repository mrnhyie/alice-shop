import { Router } from 'express';
import { all, get, run } from '../db.js';

const router = Router();

/* ── Normalize a DB row → JS object ── */
// With JSONB columns, Neon returns already-parsed arrays — guard for safety.
const ensureArr = (v) =>
  Array.isArray(v) ? v : (typeof v === 'string' ? JSON.parse(v) : []);

const parse = (row) => row ? {
  ...row,
  inStock: Boolean(row.in_stock),
  sizes:   ensureArr(row.sizes),
  colors:  ensureArr(row.colors),
  images:  ensureArr(row.images),
} : null;

/* ── GET /api/products ── */
router.get('/', async (req, res) => {
  const { category, search, badge } = req.query;
  const conditions = [];
  const params = [];
  let   idx = 1;

  if (category) { conditions.push(`LOWER(category) = LOWER($${idx++})`); params.push(category); }
  if (badge)    { conditions.push(`badge = $${idx++}`);                   params.push(badge);    }
  if (search) {
    const like = `%${search}%`;
    conditions.push(
      `(name ILIKE $${idx} OR artisan ILIKE $${idx+1} OR region ILIKE $${idx+2} OR description ILIKE $${idx+3})`,
    );
    idx += 4;
    params.push(like, like, like, like);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  const sql   = `SELECT * FROM products${where} ORDER BY id DESC`;

  try {
    const rows = await all(sql, params);
    res.json(rows.map(parse));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── DELETE /api/products/bulk  (must come before /:id) ── */
router.delete('/bulk', async (req, res) => {
  const { ids } = req.body ?? {};
  if (!Array.isArray(ids) || !ids.length)
    return res.status(400).json({ error: 'ids[] required' });

  try {
    const ph = ids.map((_, i) => `$${i + 1}`).join(',');
    const { changes } = await run(`DELETE FROM products WHERE id IN (${ph})`, ids);
    res.json({ deleted: changes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/products/:id ── */
router.get('/:id', async (req, res) => {
  try {
    const row = await get('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(parse(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── POST /api/products ── */
router.post('/', async (req, res) => {
  const {
    name, category, price, inStock = true,
    artisan = '', region = '', image = '', images = [],
    badge = null, description = '', sizes = [], colors = [],
    rating = 0, reviews = 0,
  } = req.body;

  if (!name?.trim() || !category || price == null)
    return res.status(400).json({ error: 'name, category and price are required' });

  try {
    const { lastInsertRowid } = await run(
      `INSERT INTO products
        (name,category,price,in_stock,artisan,region,image,images,badge,description,sizes,colors,rating,reviews)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id`,
      [
        name.trim(), category, Number(price), inStock,
        artisan, region, image, JSON.stringify(images),
        badge || null, description,
        JSON.stringify(sizes), JSON.stringify(colors),
        Number(rating), Number(reviews),
      ],
    );
    const created = await get('SELECT * FROM products WHERE id = $1', [lastInsertRowid]);
    res.status(201).json(parse(created));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── PUT /api/products/:id ── */
router.put('/:id', async (req, res) => {
  const {
    name, category, price, inStock, artisan, region,
    image, images, badge, description, sizes, colors, rating, reviews,
  } = req.body;

  try {
    const exists = await get('SELECT id FROM products WHERE id = $1', [req.params.id]);
    if (!exists) return res.status(404).json({ error: 'Not found' });

    await run(
      `UPDATE products SET
        name=$1,category=$2,price=$3,in_stock=$4,artisan=$5,region=$6,
        image=$7,images=$8,badge=$9,description=$10,sizes=$11,colors=$12,rating=$13,reviews=$14
       WHERE id=$15`,
      [
        name, category, Number(price), inStock,
        artisan ?? '', region ?? '', image ?? '', JSON.stringify(images ?? []),
        badge || null, description ?? '',
        JSON.stringify(sizes ?? []), JSON.stringify(colors ?? []),
        Number(rating ?? 0), Number(reviews ?? 0),
        req.params.id,
      ],
    );

    res.json(parse(await get('SELECT * FROM products WHERE id = $1', [req.params.id])));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── DELETE /api/products/:id ── */
router.delete('/:id', async (req, res) => {
  try {
    const { changes } = await run('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (!changes) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
