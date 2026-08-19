import { Router } from 'express';
import db from '../db.js';

const router = Router();

/* ─── Normalize a DB row → JS object ─── */
const parse = (row) => row ? {
  ...row,
  inStock: Boolean(row.in_stock),
  sizes:  JSON.parse(row.sizes  ?? '[]'),
  colors: JSON.parse(row.colors ?? '[]'),
  images: JSON.parse(row.images ?? '[]'),
} : null;

/* ── GET /api/products  (list, with optional filters) ── */
router.get('/', (req, res) => {
  const { category, search, badge } = req.query;
  const conditions = [];
  const params = [];

  if (category) { conditions.push('LOWER(category) = LOWER(?)'); params.push(category); }
  if (badge)    { conditions.push('badge = ?');                  params.push(badge);    }
  if (search) {
    conditions.push('(name LIKE ? OR artisan LIKE ? OR region LIKE ? OR description LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }

  const where  = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  const sql    = `SELECT * FROM products${where} ORDER BY id DESC`;

  try {
    res.json(db.prepare(sql).all(...params).map(parse));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── DELETE /api/products/bulk  (must come before /:id) ── */
router.delete('/bulk', (req, res) => {
  const { ids } = req.body ?? {};
  if (!Array.isArray(ids) || !ids.length)
    return res.status(400).json({ error: 'ids[] required' });

  try {
    const ph  = ids.map(() => '?').join(',');
    const { changes } = db.prepare(`DELETE FROM products WHERE id IN (${ph})`).run(...ids);
    res.json({ deleted: changes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/products/:id ── */
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(parse(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── POST /api/products ── */
router.post('/', (req, res) => {
  const { name, category, price, inStock = true, artisan = '', region = '',
          image = '', images = [], badge = null, description = '',
          sizes = [], colors = [], rating = 0, reviews = 0 } = req.body;

  if (!name?.trim() || !category || price == null)
    return res.status(400).json({ error: 'name, category and price are required' });

  try {
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO products
        (name,category,price,in_stock,artisan,region,image,images,badge,description,sizes,colors,rating,reviews)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      name.trim(), category, Number(price), inStock ? 1 : 0,
      artisan, region, image, JSON.stringify(images), badge || null, description,
      JSON.stringify(sizes), JSON.stringify(colors),
      Number(rating), Number(reviews)
    );
    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(lastInsertRowid);
    res.status(201).json(parse(created));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── PUT /api/products/:id ── */
router.put('/:id', (req, res) => {
  const { name, category, price, inStock, artisan, region,
          image, images, badge, description, sizes, colors, rating, reviews } = req.body;

  try {
    const exists = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!exists) return res.status(404).json({ error: 'Not found' });

    db.prepare(`
      UPDATE products SET
        name=?,category=?,price=?,in_stock=?,artisan=?,region=?,
        image=?,images=?,badge=?,description=?,sizes=?,colors=?,rating=?,reviews=?
      WHERE id=?
    `).run(
      name, category, Number(price), inStock ? 1 : 0,
      artisan ?? '', region ?? '', image ?? '', JSON.stringify(images ?? []),
      badge || null, description ?? '',
      JSON.stringify(sizes ?? []), JSON.stringify(colors ?? []),
      Number(rating ?? 0), Number(reviews ?? 0),
      req.params.id
    );

    res.json(parse(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── DELETE /api/products/:id ── */
router.delete('/:id', (req, res) => {
  try {
    const { changes } = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    if (!changes) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
