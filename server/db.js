import "dotenv/config";
import pg from "pg";
import { PRODUCTS } from "./data/products.js";

const url = process.env.DATABASE_URL || "";
const local = /localhost|127\.0\.0\.1/.test(url);

export const pool = new pg.Pool({
  connectionString: url,
  ssl: local ? false : { rejectUnauthorized: false },
  max: 5
});

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  rating DOUBLE PRECISION NOT NULL DEFAULT 0,
  emoji TEXT NOT NULL DEFAULT '📦',
  bg TEXT NOT NULL DEFAULT '#eeeeee',
  description TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  shipping JSONB NOT NULL,
  payment TEXT NOT NULL DEFAULT 'Cash on delivery',
  subtotal INTEGER NOT NULL,
  shipping_fee INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'placed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id);
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0)
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);
`;

export async function insertProducts(client = pool) {
  for (const p of PRODUCTS) {
    await client.query(
      `INSERT INTO products (name, category, price, rating, emoji, bg, description, stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [p.name, p.category, p.price, p.rating, p.emoji, p.bg, p.description, p.stock]
    );
  }
}

export async function initDb() {
  await pool.query(SCHEMA);
  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM products");
  if (rows[0].n === 0) {
    await insertProducts();
    console.log(`Seeded ${PRODUCTS.length} products`);
  }
}
