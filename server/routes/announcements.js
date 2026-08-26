import { Router }        from 'express';
import { all, get, run } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    res.json(await all('SELECT * FROM announcements ORDER BY id DESC'));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  const text = req.body?.text?.trim();
  if (!text)
    return res.status(400).json({ error: 'Announcement text is required' });
  if (text.length > 180)
    return res.status(400).json({ error: 'Announcements must be 180 characters or less' });

  try {
    const { lastInsertRowid } = await run(
      'INSERT INTO announcements (text) VALUES ($1) RETURNING id',
      [text],
    );
    res.status(201).json(await get('SELECT * FROM announcements WHERE id = $1', [lastInsertRowid]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { changes } = await run('DELETE FROM announcements WHERE id = $1', [req.params.id]);
    if (!changes) return res.status(404).json({ error: 'Announcement not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
