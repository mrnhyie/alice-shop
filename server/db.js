import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Add it to your .env file.');
}

const sql = neon(process.env.DATABASE_URL);

// ── Bootstrap schema ─────────────────────────────────────────────────────────
await sql`
  CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    name        TEXT    NOT NULL,
    category    TEXT    NOT NULL,
    price       REAL    NOT NULL CHECK(price >= 0),
    in_stock    BOOLEAN NOT NULL DEFAULT true,
    rating      REAL    NOT NULL DEFAULT 0,
    reviews     INTEGER NOT NULL DEFAULT 0,
    artisan     TEXT    DEFAULT '',
    region      TEXT    DEFAULT '',
    image       TEXT    DEFAULT '',
    images      JSONB   DEFAULT '[]',
    badge       TEXT    DEFAULT NULL,
    description TEXT    DEFAULT '',
    sizes       JSONB   DEFAULT '[]',
    colors      JSONB   DEFAULT '[]',
    created_at  TIMESTAMPTZ DEFAULT NOW()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS orders (
    id               SERIAL PRIMARY KEY,
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
    created_at       TIMESTAMPTZ DEFAULT NOW()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS customers (
    id           SERIAL PRIMARY KEY,
    name         TEXT    NOT NULL,
    email        TEXT    NOT NULL UNIQUE,
    password     TEXT,
    google_id    TEXT,
    avatar       TEXT    DEFAULT '',
    phone        TEXT    DEFAULT '',
    created_at   TIMESTAMPTZ DEFAULT NOW()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS order_items (
    id            SERIAL PRIMARY KEY,
    order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id    INTEGER,
    product_name  TEXT    NOT NULL,
    product_image TEXT    DEFAULT '',
    size          TEXT    DEFAULT '',
    color         TEXT    DEFAULT '',
    quantity      INTEGER NOT NULL DEFAULT 1,
    unit_price    REAL    NOT NULL
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS admin_notifications (
    id         SERIAL PRIMARY KEY,
    type       TEXT    NOT NULL,
    title      TEXT    NOT NULL,
    body       TEXT    NOT NULL,
    link       TEXT,
    read       BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS customer_messages (
    id          SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    body        TEXT    NOT NULL,
    phone       TEXT    NOT NULL,
    sender      TEXT    NOT NULL DEFAULT 'admin',
    status      TEXT    NOT NULL DEFAULT 'sent',
    created_at  TIMESTAMPTZ DEFAULT NOW()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS landing_images (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    alt   TEXT DEFAULT ''
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS announcements (
    id         SERIAL PRIMARY KEY,
    text       TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

// ── Query helpers ─────────────────────────────────────────────────────────────
// neon() returns a tagged-template function. For dynamic parameterised queries
// (runtime SQL strings with $1…$N placeholders) we use sql.query(str, params)
// which is the supported escape hatch for non-literal queries.

/**
 * Run a SELECT and return all rows as plain objects.
 */
export async function all(sqlStr, params = []) {
  return sql.query(sqlStr, params);
}

/**
 * Run a SELECT and return the first row, or null.
 */
export async function get(sqlStr, params = []) {
  const rows = await sql.query(sqlStr, params);
  return rows.length ? rows[0] : null;
}

/**
 * Run an INSERT / UPDATE / DELETE.
 * Returns { lastInsertRowid, changes } to preserve the existing route interface.
 * Queries that need the new row id should include RETURNING id.
 */
export async function run(sqlStr, params = []) {
  const result = await sql.query(sqlStr, params, { fullResults: true });
  const lastInsertRowid = result.rows?.[0]?.id ?? null;
  const changes = result.rowCount ?? 0;
  return { lastInsertRowid, changes };
}

/**
 * Run raw DDL SQL (single statement; top-level await handles schema bootstrap).
 */
export async function exec(sqlStr) {
  await sql.query(sqlStr, []);
}

/**
 * Execute a list of { sql, args } statements inside a Neon HTTP transaction.
 * Uses sql.transaction() with the function form so queries are built lazily
 * and sent as a single atomic HTTP request.
 */
export async function transaction(stmts) {
  return sql.transaction((txn) => stmts.map((s) => txn.query(s.sql, s.args ?? [])));
}

export default sql;
