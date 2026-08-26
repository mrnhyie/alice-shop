import { Router }    from 'express';
import { all, get }  from '../db.js';

const router = Router();

const listSQL = (where = '') => `
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
    id:         row.id,
    name:       row.name,
    email:      row.email,
    phone:      row.phone      ?? '',
    avatar:     row.avatar     ?? '',
    orders,
    totalSpent: row.total_spent ?? 0,
    location:   row.location   ?? '—',
    status:     orders > 0 ? 'active' : 'inactive',
    joined:     row.created_at,
  };
}

/* ── GET /api/customers/stats ── */
router.get('/stats', async (_req, res) => {
  try {
    const total        = await get('SELECT COUNT(*) AS v FROM customers');
    const active       = await get(`
      SELECT COUNT(DISTINCT c.id) AS v
      FROM customers c
      INNER JOIN orders o ON o.customer_email = c.email
    `);
    const newThisMonth = await get(`
      SELECT COUNT(*) AS v FROM customers
      WHERE TO_CHAR(created_at, 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')
    `);

    res.json({ total: Number(total.v), active: Number(active.v), newThisMonth: Number(newThisMonth.v) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/customers ── */
router.get('/', async (_req, res) => {
  try {
    const rows = await all(listSQL());
    res.json(rows.map(enrich));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/customers/:id ── */
router.get('/:id', async (req, res) => {
  try {
    const row = await get(listSQL('WHERE c.id = $1'), [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Customer not found' });
    res.json(enrich(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
