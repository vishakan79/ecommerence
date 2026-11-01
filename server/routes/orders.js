import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const FREE_SHIP_OVER = 999;
const SHIPPING_FEE = 79;

// Prices are always taken from the database, never from the client.
router.post("/", requireAuth, async (req, res) => {
  try {
    const { items, shipping, payment } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "Cart is empty" });
    if (!shipping || !shipping.name || !shipping.email || !shipping.phone || !shipping.address) {
      return res.status(400).json({ message: "Complete shipping details are required" });
    }

    const ids = items.map((i) => i.productId);
    if (!ids.every((id) => mongoose.isValidObjectId(id))) return res.status(400).json({ message: "Invalid product in cart" });

    const products = await Product.find({ _id: { $in: ids } });
    const map = new Map(products.map((p) => [String(p._id), p]));

    const lines = [];
    for (const { productId, qty } of items) {
      const p = map.get(String(productId));
      const n = Math.floor(Number(qty));
      if (!p) return res.status(400).json({ message: "A product in your cart no longer exists" });
      if (!(n >= 1 && n <= 99)) return res.status(400).json({ message: "Invalid quantity" });
      if (p.stock < n) return res.status(409).json({ message: `Only ${p.stock} left of ${p.name}` });
      lines.push({ product: p._id, name: p.name, emoji: p.emoji, price: p.price, qty: n });
    }

    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const shippingFee = subtotal >= FREE_SHIP_OVER ? 0 : SHIPPING_FEE;

    const order = await Order.create({
      user: req.user._id,
      items: lines,
      shipping: {
        name: String(shipping.name).trim(),
        email: String(shipping.email).trim(),
        phone: String(shipping.phone).trim(),
        address: String(shipping.address).trim()
      },
      payment: payment || "Cash on delivery",
      subtotal,
      shippingFee,
      total: subtotal + shippingFee
    });

    await Product.bulkWrite(lines.map((l) => ({
      updateOne: { filter: { _id: l.product }, update: { $inc: { stock: -l.qty } } }
    })));

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Could not place order", detail: err.message });
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: "Could not load orders", detail: err.message });
  }
});

export default router;
