import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM announcements ORDER BY id DESC').all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  const text = req.body?.text?.trim();
  if (!text) return res.status(400).json({ error: 'Announcement text is required' });
  if (text.length > 180) return res.status(400).json({ error: 'Announcements must be 180 characters or less' });

  try {
    const { lastInsertRowid } = db.prepare('INSERT INTO announcements (text) VALUES (?)').run(text);
    res.status(201).json(db.prepare('SELECT * FROM announcements WHERE id = ?').get(lastInsertRowid));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { changes } = db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
    if (!changes) return res.status(404).json({ error: 'Announcement not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
