import { Router } from 'express';
import db from '../db.js';

const router = Router();

/* ── GET /api/orders/stats  (must be before /:id) ── */
router.get('/stats', (req, res) => {
  try {
    const totalRevenue = db.prepare(
      "SELECT COALESCE(SUM(total),0) AS v FROM orders WHERE status != 'cancelled'"
    ).get().v;
    const totalOrders     = db.prepare('SELECT COUNT(*) AS v FROM orders').get().v;
    const pendingOrders   = db.prepare("SELECT COUNT(*) AS v FROM orders WHERE status='pending'").get().v;
    const deliveredOrders = db.prepare("SELECT COUNT(*) AS v FROM orders WHERE status='delivered'").get().v;

    const monthly = db.prepare(`
      SELECT strftime('%m',created_at) AS month,
             SUM(total)   AS revenue,
             COUNT(*)     AS orders
      FROM orders GROUP BY month ORDER BY month
    `).all();

    res.json({ totalRevenue, totalOrders, pendingOrders, deliveredOrders, monthly });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/orders ── */
router.get('/', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*,
             (SELECT COUNT(*) FROM order_items WHERE order_id=o.id) AS item_count
      FROM orders o ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── POST /api/orders ── */
router.post('/', (req, res) => {
  const { contact, shippingMethod, paymentMethod, cartItems, subtotal, shippingCost, total } = req.body;
  const orderRef = `ORD-${Date.now()}`;

  const insertOrder = db.prepare(`
    INSERT INTO orders
      (order_ref,customer_name,customer_email,customer_phone,
       shipping_address,shipping_city,shipping_region,shipping_country,
       shipping_method,payment_method,subtotal,shipping_cost,total)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO order_items
      (order_id,product_id,product_name,product_image,size,color,quantity,unit_price)
    VALUES (?,?,?,?,?,?,?,?)
  `);

  try {
    const orderId = db.transaction(() => {
      const { lastInsertRowid } = insertOrder.run(
        orderRef,
        `${contact.firstName} ${contact.lastName}`,
        contact.email, contact.phone ?? '',
        contact.address, contact.city,
        contact.region ?? '', contact.country ?? 'Ghana',
        shippingMethod, paymentMethod,
        subtotal, shippingCost, total
      );
      for (const item of cartItems) {
        insertItem.run(
          lastInsertRowid,
          item.product.id ?? null,
          item.product.name, item.product.image ?? '',
          item.size ?? '', item.color ?? '',
          item.quantity, item.product.price
        );
      }
      return lastInsertRowid;
    })();

    res.status(201).json({ orderId, orderRef });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── GET /api/orders/:id ── */
router.get('/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id=?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    const items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(req.params.id);
    res.json({ ...order, items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── PATCH /api/orders/:id/status ── */
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const valid = ['pending','processing','shipped','delivered'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    db.prepare('UPDATE orders SET status=? WHERE id=?').run(status, req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
