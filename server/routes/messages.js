import { Router } from 'express';
import db from '../db.js';
import { createNotification } from '../lib/notifications.js';

const router = Router();

function sendSms({ phone, body, customerName }) {
  // Simulated SMS delivery — swap for Twilio/Africa's Talking in production
  console.log(`\n📱 SMS → ${customerName} (${phone})\n   ${body}\n`);
  return { success: true, provider: 'simulated' };
}

/* ── GET /api/messages?customerId= ── */
router.get('/', (req, res) => {
  const { customerId } = req.query;
  try {
    const rows = customerId
      ? db.prepare(`
          SELECT m.*, c.name AS customer_name, c.email AS customer_email
          FROM customer_messages m
          JOIN customers c ON c.id = m.customer_id
          WHERE m.customer_id = ?
          ORDER BY m.created_at DESC
        `).all(customerId)
      : db.prepare(`
          SELECT m.*, c.name AS customer_name, c.email AS customer_email
          FROM customer_messages m
          JOIN customers c ON c.id = m.customer_id
          ORDER BY m.created_at DESC
          LIMIT 100
        `).all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── POST /api/messages ── */
router.post('/', (req, res) => {
  const { customerIds, customerId, message, phone: overridePhone } = req.body ?? {};
  if (customerId && message?.trim()) {
    try {
      const customer = db.prepare('SELECT id, phone FROM customers WHERE id = ?').get(customerId);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      const { lastInsertRowid } = db.prepare('INSERT INTO customer_messages (customer_id, body, phone, sender, status) VALUES (?, ?, ?, ?, ?)').run(customer.id, message.trim(), customer.phone ?? '', 'customer', 'sent');
      const fullCustomer = db.prepare('SELECT name, email FROM customers WHERE id = ?').get(customer.id);
      createNotification({
        type: 'new_message',
        title: `New message from ${fullCustomer?.name || 'customer'}`,
        body: message.trim().slice(0, 140),
        link: `/admin/customers?message=${customer.id}`,
      });
      return res.status(201).json(db.prepare('SELECT * FROM customer_messages WHERE id = ?').get(lastInsertRowid));
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
  if (!Array.isArray(customerIds) || customerIds.length === 0)
    return res.status(400).json({ error: 'customerIds required' });
  if (!message?.trim())
    return res.status(400).json({ error: 'message required' });

  const getCustomer = db.prepare('SELECT id, name, email, phone FROM customers WHERE id = ?');
  const insert = db.prepare(`
    INSERT INTO customer_messages (customer_id, body, phone, sender, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  try {
    const sent = [];

    for (const id of customerIds) {
      const customer = getCustomer.get(id);
      if (!customer) continue;

      const phone = (overridePhone || customer.phone || '').trim();
      const result = phone ? sendSms({ phone, body: message.trim(), customerName: customer.name }) : { success: true, provider: 'in-app' };
      const { lastInsertRowid } = insert.run(id, message.trim(), phone, 'admin', 'sent');
      sent.push({ customerId: id, name: customer.name, phone, messageId: lastInsertRowid, success: true, provider: result.provider });
    }

    if (!sent.length) return res.status(400).json({ error: 'No matching customers found' });

    const first = sent.find((item) => item.success);
    const messageRow = first ? db.prepare('SELECT * FROM customer_messages WHERE id = ?').get(first.messageId) : null;
    res.status(201).json({ results: sent, message: messageRow });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
