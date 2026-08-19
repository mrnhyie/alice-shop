import { Router } from 'express';
import db from '../db.js';

const router = Router();

const listQuery = (where = '') => `
  SELECT
    c.id,
    c.name,
    c.email,
    c.phone,
    c.avatar,
    c.created_at,
    COUNT(DISTINCT o.id) AS orders,
    COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total ELSE 0 END), 0) AS total_spent,
    (
      SELECT shipping_city || ', ' || shipping_country
      FROM orders
      WHERE customer_email = c.email
      ORDER BY created_at DESC
      LIMIT 1
    ) AS location
  FROM customers c
  LEFT JOIN orders o ON o.customer_email = c.email
  ${where}
  GROUP BY c.id
  ORDER BY c.created_at DESC
`;

function enrich(row) {
  const orders = row.orders ?? 0;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    avatar: row.avatar ?? '',
    orders,
    totalSpent: row.total_spent ?? 0,
    location: row.location ?? '—',
    status: orders > 0 ? 'active' : 'inactive',
    joined: row.created_at,
  };
}

/* ── GET /api/customers/stats ── */
router.get('/stats', (_req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) AS v FROM customers').get().v;
    const active = db.prepare(`
      SELECT COUNT(DISTINCT c.id) AS v
      FROM customers c
      INNER JOIN orders o ON o.customer_email = c.email
    `).get().v;
    const newThisMonth = db.prepare(`
      SELECT COUNT(*) AS v FROM customers
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).get().v;

    res.json({ total, active, newThisMonth });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/customers ── */
router.get('/', (_req, res) => {
  try {
    const rows = db.prepare(listQuery()).all();
    res.json(rows.map(enrich));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/customers/:id ── */
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare(listQuery('WHERE c.id = ?')).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Customer not found' });
    res.json(enrich(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
