import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const FREE_SHIP_OVER = 999;
const SHIPPING_FEE = 79;

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function shape(order, items) {
  return {
    _id: String(order.id),
    items: items.map((i) => ({ product: i.product_id, name: i.name, emoji: i.emoji, price: i.price, qty: i.qty })),
    shipping: order.shipping,
    payment: order.payment,
    subtotal: order.subtotal,
    shippingFee: order.shipping_fee,
    total: order.total,
    status: order.status,
    createdAt: order.created_at
  };
}

// Prices and stock are always read from the database, never trusted from the client.
router.post("/", requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, shipping, payment } = req.body;
    if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, "Cart is empty");
    const s = shipping || {};
    if (!s.name || !s.email || !s.phone || !s.address) throw new HttpError(400, "Complete shipping details are required");

    const wanted = new Map();
    for (const it of items) {
      const id = Number(it.productId);
      const qty = Math.floor(Number(it.qty));
      if (!Number.isInteger(id) || id < 1) throw new HttpError(400, "Invalid product in cart");
      if (!(qty >= 1 && qty <= 99)) throw new HttpError(400, "Invalid quantity");
      wanted.set(id, (wanted.get(id) || 0) + qty);
    }

    await client.query("BEGIN");
    const { rows: products } = await client.query(
      "SELECT id, name, emoji, price, stock FROM products WHERE id = ANY($1::int[]) FOR UPDATE",
      [[...wanted.keys()]]
    );
    if (products.length !== wanted.size) throw new HttpError(400, "A product in your cart no longer exists");

    const lines = products.map((p) => {
      const qty = wanted.get(p.id);
      if (p.stock < qty) throw new HttpError(409, `Only ${p.stock} left of ${p.name}`);
      return { product_id: p.id, name: p.name, emoji: p.emoji, price: p.price, qty };
    });

    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const shippingFee = subtotal >= FREE_SHIP_OVER ? 0 : SHIPPING_FEE;
    const total = subtotal + shippingFee;
    const shipTo = {
      name: String(s.name).trim(),
      email: String(s.email).trim(),
      phone: String(s.phone).trim(),
      address: String(s.address).trim()
    };

    const { rows: [order] } = await client.query(
      `INSERT INTO orders (user_id, shipping, payment, subtotal, shipping_fee, total)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, shipTo, String(payment || "Cash on delivery"), subtotal, shippingFee, total]
    );
    for (const l of lines) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, name, emoji, price, qty) VALUES ($1,$2,$3,$4,$5,$6)",
        [order.id, l.product_id, l.name, l.emoji, l.price, l.qty]
      );
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [l.qty, l.product_id]);
    }
    await client.query("COMMIT");
    res.status(201).json(shape(order, lines));
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    if (err instanceof HttpError) return res.status(err.status).json({ message: err.message });
    console.error("Order failed:", err.message);
    res.status(500).json({ message: "Could not place order" });
  } finally {
    client.release();
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    const { rows: orders } = await pool.query("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]);
    if (!orders.length) return res.json([]);
    const { rows: items } = await pool.query(
      "SELECT * FROM order_items WHERE order_id = ANY($1::int[]) ORDER BY id",
      [orders.map((o) => o.id)]
    );
    res.json(orders.map((o) => shape(o, items.filter((i) => i.order_id === o.id))));
  } catch {
    res.status(500).json({ message: "Could not load orders" });
  }
});

export default router;
