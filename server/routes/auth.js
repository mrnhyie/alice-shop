import { Router }  from 'express';
import bcrypt      from 'bcryptjs';
import jwt         from 'jsonwebtoken';
import db          from '../db.js';
import { notifyNewCustomer } from '../lib/notifications.js';

const router  = Router();
const SECRET  = process.env.JWT_SECRET || 'alice-secret-2025';

const safe = (row) => row ? { id: row.id, name: row.name, email: row.email, avatar: row.avatar } : null;

/* ── POST /api/auth/register ── */
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body ?? {};
  if (!name?.trim() || !email?.trim() || !password)
    return res.status(400).json({ error: 'name, email and password are required' });

  try {
    const exists = db.prepare('SELECT id FROM customers WHERE email = ?').get(email.trim().toLowerCase());
    if (exists) return res.status(409).json({ error: 'An account with that email already exists' });

    const hash    = await bcrypt.hash(password, 10);
    const { lastInsertRowid } = db.prepare(
      'INSERT INTO customers (name, email, password, phone) VALUES (?, ?, ?, ?)'
    ).run(name.trim(), email.trim().toLowerCase(), hash, (phone ?? '').trim());

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(lastInsertRowid);
    notifyNewCustomer(customer);
    const token    = jwt.sign({ id: customer.id, email: customer.email }, SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, customer: safe(customer) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── POST /api/auth/login ── */
router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password)
    return res.status(400).json({ error: 'email and password are required' });

  try {
    const row = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.trim().toLowerCase());
    if (!row || !row.password)
      return res.status(401).json({ error: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, row.password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: row.id, email: row.email }, SECRET, { expiresIn: '30d' });
    res.json({ token, customer: safe(row) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── POST /api/auth/google ── disabled for now ── */
router.post('/google', (_req, res) => {
  res.status(503).json({ error: 'Google Sign-In is not enabled' });
});

export default router;
