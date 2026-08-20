import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  try {
    const rows = db.prepare('SELECT key, value, alt FROM landing_images ORDER BY key').all();
    res.json(Object.fromEntries(rows.map((row) => [row.key, { value: row.value, alt: row.alt || '' }])));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:key', (req, res) => {
  const key = String(req.params.key || '').trim();
  const value = String(req.body?.value || '').trim();
  const alt = String(req.body?.alt || '').trim().slice(0, 180);
  if (!key || !value) return res.status(400).json({ error: 'Image value is required' });
  if (!/^https?:\/\//i.test(value) && !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(value)) {
    return res.status(400).json({ error: 'Use an image URL or uploaded image' });
  }
  if (value.length > 8_000_000) return res.status(413).json({ error: 'Image is too large. Please use a smaller image.' });
  try {
    db.prepare(`INSERT INTO landing_images (key, value, alt) VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value, alt=excluded.alt`).run(key, value, alt);
    res.json({ key, value, alt });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
