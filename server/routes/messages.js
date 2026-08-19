import { Router } from 'express';
import db from '../db.js';

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
      if (!phone) {
        sent.push({ customerId: id, name: customer.name, success: false, error: 'No phone number on file' });
        continue;
      }

      const result = sendSms({ phone, body: message.trim(), customerName: customer.name });
      const status = result.success ? 'sent' : 'failed';
      const { lastInsertRowid } = insert.run(id, message.trim(), phone, 'admin', status);
      sent.push({ customerId: id, name: customer.name, phone, messageId: lastInsertRowid, success: result.success });
    }

    if (sent.every((s) => !s.success))
      return res.status(400).json({ error: 'Could not send — no valid phone numbers', results: sent });

    res.status(201).json({ results: sent });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
