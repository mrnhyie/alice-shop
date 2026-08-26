import { Router }        from 'express';
import { all, get, run, transaction } from '../db.js';

const router = Router();

/* ── GET /api/orders/stats  (must be before /:id) ── */
router.get('/stats', async (req, res) => {
  try {
    const rev  = await get("SELECT COALESCE(SUM(total),0) AS v FROM orders WHERE status != 'cancelled'");
    const tot  = await get('SELECT COUNT(*) AS v FROM orders');
    const pend = await get("SELECT COUNT(*) AS v FROM orders WHERE status='pending'");
    const delv = await get("SELECT COUNT(*) AS v FROM orders WHERE status='delivered'");

    const monthly = await all(`
      SELECT TO_CHAR(created_at, 'MM') AS month,
             SUM(total)   AS revenue,
             COUNT(*)     AS orders
      FROM orders GROUP BY month ORDER BY month
    `);

    res.json({
      totalRevenue:    Number(rev.v),
      totalOrders:     Number(tot.v),
      pendingOrders:   Number(pend.v),
      deliveredOrders: Number(delv.v),
      monthly,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/orders ── */
router.get('/', async (req, res) => {
  try {
    const orders = await all(`
      SELECT o.*,
             (SELECT COUNT(*) FROM order_items WHERE order_id=o.id) AS item_count
      FROM orders o ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── POST /api/orders ── */
router.post('/', async (req, res) => {
  const { contact, shippingMethod, paymentMethod, cartItems, subtotal, shippingCost, total } = req.body;
  const orderRef = `ORD-${Date.now()}`;

  try {
    // Insert order and return the new id
    const { lastInsertRowid: orderId } = await run(
      `INSERT INTO orders
         (order_ref,customer_name,customer_email,customer_phone,
          shipping_address,shipping_city,shipping_region,shipping_country,
          shipping_method,payment_method,subtotal,shipping_cost,total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [
        orderRef,
        `${contact.firstName} ${contact.lastName}`,
        contact.email, contact.phone ?? '',
        contact.address, contact.city,
        contact.region ?? '', contact.country ?? 'Ghana',
        shippingMethod, paymentMethod,
        subtotal, shippingCost, total,
      ],
    );

    // Insert each item
    const itemStmts = cartItems.map((item) => ({
      sql: `INSERT INTO order_items
              (order_id,product_id,product_name,product_image,size,color,quantity,unit_price)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      args: [
        orderId,
        item.product.id ?? null,
        item.product.name, item.product.image ?? '',
        item.size ?? '', item.color ?? '',
        item.quantity, item.product.price,
      ],
    }));

    if (itemStmts.length) await transaction(itemStmts);

    res.status(201).json({ orderId, orderRef });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/orders/:id ── */
router.get('/:id', async (req, res) => {
  try {
    const order = await get('SELECT * FROM orders WHERE id=$1', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Not found' });
    const items = await all('SELECT * FROM order_items WHERE order_id=$1', [req.params.id]);
    res.json({ ...order, items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── PATCH /api/orders/:id/status ── */
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'processing', 'shipped', 'delivered'];
  if (!valid.includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  try {
    await run('UPDATE orders SET status=$1 WHERE id=$2', [status, req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
