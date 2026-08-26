import { Router }        from 'express';
import { all, get, run } from '../db.js';
import { createNotification } from '../lib/notifications.js';

const router = Router();

function sendSms({ phone, body, customerName }) {
  // Simulated SMS — swap for Twilio / Africa's Talking in production
  console.log(`\n📱 SMS → ${customerName} (${phone})\n   ${body}\n`);
  return { success: true, provider: 'simulated' };
}

/* ── GET /api/messages?customerId= ── */
router.get('/', async (req, res) => {
  const { customerId } = req.query;
  try {
    const rows = customerId
      ? await all(
          `SELECT m.*, c.name AS customer_name, c.email AS customer_email
           FROM customer_messages m
           JOIN customers c ON c.id = m.customer_id
           WHERE m.customer_id = $1
           ORDER BY m.created_at DESC`,
          [customerId],
        )
      : await all(
          `SELECT m.*, c.name AS customer_name, c.email AS customer_email
           FROM customer_messages m
           JOIN customers c ON c.id = m.customer_id
           ORDER BY m.created_at DESC
           LIMIT 100`,
        );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── POST /api/messages ── */
router.post('/', async (req, res) => {
  const { customerIds, customerId, message, phone: overridePhone } = req.body ?? {};

  // Single customer message (inbound / customer reply)
  if (customerId && message?.trim()) {
    try {
      const customer = await get('SELECT id, phone FROM customers WHERE id = $1', [customerId]);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });

      const { lastInsertRowid } = await run(
        'INSERT INTO customer_messages (customer_id, body, phone, sender, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [customer.id, message.trim(), customer.phone ?? '', 'customer', 'sent'],
      );

      const full = await get('SELECT name, email FROM customers WHERE id = $1', [customer.id]);
      await createNotification({
        type:  'new_message',
        title: `New message from ${full?.name || 'customer'}`,
        body:  message.trim().slice(0, 140),
        link:  `/admin/customers?message=${customer.id}`,
      });

      return res.status(201).json(
        await get('SELECT * FROM customer_messages WHERE id = $1', [lastInsertRowid]),
      );
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Bulk admin broadcast
  if (!Array.isArray(customerIds) || customerIds.length === 0)
    return res.status(400).json({ error: 'customerIds required' });
  if (!message?.trim())
    return res.status(400).json({ error: 'message required' });

  try {
    const sent = [];
    for (const id of customerIds) {
      const customer = await get('SELECT id, name, email, phone FROM customers WHERE id = $1', [id]);
      if (!customer) continue;

      const phone  = (overridePhone || customer.phone || '').trim();
      const result = phone
        ? sendSms({ phone, body: message.trim(), customerName: customer.name })
        : { success: true, provider: 'in-app' };

      const { lastInsertRowid } = await run(
        'INSERT INTO customer_messages (customer_id, body, phone, sender, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [id, message.trim(), phone, 'admin', 'sent'],
      );

      sent.push({ customerId: id, name: customer.name, phone, messageId: lastInsertRowid, success: true, provider: result.provider });
    }

    if (!sent.length) return res.status(400).json({ error: 'No matching customers found' });

    const first      = sent.find((s) => s.success);
    const messageRow = first
      ? await get('SELECT * FROM customer_messages WHERE id = $1', [first.messageId])
      : null;

    res.status(201).json({ results: sent, message: messageRow });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
