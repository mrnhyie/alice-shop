import express from 'express';
import cors    from 'cors';
import productsRouter      from './routes/products.js';
import ordersRouter        from './routes/orders.js';
import authRouter          from './routes/auth.js';
import customersRouter     from './routes/customers.js';
import notificationsRouter from './routes/notifications.js';
import messagesRouter      from './routes/messages.js';
import announcementsRouter from './routes/announcements.js';

const app  = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));  // allow base64 image uploads

app.use('/api/products',      productsRouter);
app.use('/api/orders',        ordersRouter);
app.use('/api/auth',          authRouter);
app.use('/api/customers',     customersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/messages',      messagesRouter);
app.use('/api/announcements', announcementsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`\n🛍  Alice API  →  http://localhost:${PORT}/api\n`);
});
