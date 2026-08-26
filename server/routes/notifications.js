import { Router }    from 'express';
import { all, get, run } from '../db.js';

const router = Router();

/* ── GET /api/notifications ── */
router.get('/', async (_req, res) => {
  try {
    const notifications = await all(`
      SELECT * FROM admin_notifications
      ORDER BY created_at DESC
      LIMIT 50
    `);
    const unread = await get('SELECT COUNT(*) AS v FROM admin_notifications WHERE read = false');
    res.json({ notifications, unreadCount: Number(unread.v) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── PATCH /api/notifications/read-all ── */
router.patch('/read-all', async (_req, res) => {
  try {
    await run('UPDATE admin_notifications SET read = true WHERE read = false');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── PATCH /api/notifications/:id/read ── */
router.patch('/:id/read', async (req, res) => {
  try {
    await run('UPDATE admin_notifications SET read = true WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
