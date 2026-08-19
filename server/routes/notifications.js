import { Router } from 'express';
import db from '../db.js';

const router = Router();

/* ── GET /api/notifications ── */
router.get('/', (_req, res) => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM admin_notifications
      ORDER BY created_at DESC
      LIMIT 50
    `).all();
    const unreadCount = db.prepare(
      'SELECT COUNT(*) AS v FROM admin_notifications WHERE read = 0'
    ).get().v;
    res.json({ notifications, unreadCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── PATCH /api/notifications/read-all ── */
router.patch('/read-all', (_req, res) => {
  try {
    db.prepare('UPDATE admin_notifications SET read = 1 WHERE read = 0').run();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── PATCH /api/notifications/:id/read ── */
router.patch('/:id/read', (req, res) => {
  try {
    db.prepare('UPDATE admin_notifications SET read = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
