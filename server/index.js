import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';
import { existsSync }     from 'fs';
import productsRouter      from './routes/products.js';
import ordersRouter        from './routes/orders.js';
import authRouter          from './routes/auth.js';
import customersRouter     from './routes/customers.js';
import notificationsRouter from './routes/notifications.js';
import messagesRouter      from './routes/messages.js';
import announcementsRouter from './routes/announcements.js';
import landingRouter       from './routes/landing.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Body parser (10 mb to allow base64 image uploads) ────────────────────────
app.use(express.json({ limit: '10mb' }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/products',      productsRouter);
app.use('/api/orders',        ordersRouter);
app.use('/api/auth',          authRouter);
app.use('/api/customers',     customersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/messages',      messagesRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/landing',       landingRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Serve the React build (monolith mode) ─────────────────────────────────────
// The dist/ folder sits one level up from server/
const distPath = join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  // For client-side routing: send index.html for any non-API route
  app.get('/{*path}', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
} else {
  // Dev fallback: no dist yet, just tell callers the API is running
  app.get('/', (_req, res) => res.json({ message: 'API running — run `npm run build` to serve the frontend.' }));
}

// Export for Vercel (serverless) — Vercel calls the exported handler directly.
// When running locally with `node server/index.js`, we start the HTTP server.
if (process.env.VERCEL) {
  // Vercel serverless: just export the app
} else {
  app.listen(PORT, () => {
    console.log(`\n🛍  Alice Shop  →  http://localhost:${PORT}\n`);
  });
}

export default app;
