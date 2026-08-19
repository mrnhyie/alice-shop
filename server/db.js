import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'alice.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    category    TEXT    NOT NULL,
    price       REAL    NOT NULL CHECK(price >= 0),
    in_stock    INTEGER NOT NULL DEFAULT 1,
    rating      REAL    NOT NULL DEFAULT 0,
    reviews     INTEGER NOT NULL DEFAULT 0,
    artisan     TEXT    DEFAULT '',
    region      TEXT    DEFAULT '',
    image       TEXT    DEFAULT '',
    images      TEXT    DEFAULT '[]',
    badge       TEXT    DEFAULT NULL,
    description TEXT    DEFAULT '',
    sizes       TEXT    DEFAULT '[]',
    colors      TEXT    DEFAULT '[]',
    created_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    order_ref        TEXT    NOT NULL UNIQUE,
    customer_name    TEXT    NOT NULL,
    customer_email   TEXT    NOT NULL,
    customer_phone   TEXT    DEFAULT '',
    shipping_address TEXT    NOT NULL,
    shipping_city    TEXT    NOT NULL,
    shipping_region  TEXT    DEFAULT '',
    shipping_country TEXT    DEFAULT 'Ghana',
    shipping_method  TEXT    DEFAULT 'standard',
    payment_method   TEXT    DEFAULT 'card',
    subtotal         REAL    NOT NULL,
    shipping_cost    REAL    NOT NULL DEFAULT 30,
    total            REAL    NOT NULL,
    status           TEXT    NOT NULL DEFAULT 'pending',
    created_at       TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS customers (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    email        TEXT    NOT NULL UNIQUE,
    password     TEXT,
    google_id    TEXT,
    avatar       TEXT    DEFAULT '',
    created_at   TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id    INTEGER,
    product_name  TEXT    NOT NULL,
    product_image TEXT    DEFAULT '',
    size          TEXT    DEFAULT '',
    color         TEXT    DEFAULT '',
    quantity      INTEGER NOT NULL DEFAULT 1,
    unit_price    REAL    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_notifications (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    type       TEXT    NOT NULL,
    title      TEXT    NOT NULL,
    body       TEXT    NOT NULL,
    link       TEXT,
    read       INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS customer_messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    body        TEXT    NOT NULL,
    phone       TEXT    NOT NULL,
    sender      TEXT    NOT NULL DEFAULT 'admin',
    status      TEXT    NOT NULL DEFAULT 'sent',
    created_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    text       TEXT    NOT NULL,
    created_at TEXT    DEFAULT (datetime('now'))
  );
`);

// Migrations for existing databases
try { db.exec(`ALTER TABLE customers ADD COLUMN phone TEXT DEFAULT ''`); } catch (_) { /* already exists */ }
try { db.exec(`ALTER TABLE products ADD COLUMN images TEXT DEFAULT '[]'`); } catch (_) { /* already exists */ }
try { db.exec(`ALTER TABLE customer_messages ADD COLUMN sender TEXT NOT NULL DEFAULT 'admin'`); } catch (_) { /* already exists */ }

export default db;
