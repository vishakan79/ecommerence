import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// "_id" keeps the response shape the React client already uses.
const COLS = `id AS "_id", name, category, price, rating, emoji, bg, description, stock`;
const ORDER = { low: "price ASC, id ASC", high: "price DESC, id ASC", rating: "rating DESC, id ASC" };

router.get("/", async (req, res) => {
  try {
    const { q, category, sort } = req.query;
    const where = [];
    const params = [];
    if (category && category !== "all") {
      params.push(String(category));
      where.push(`category = $${params.length}`);
    }
    if (q) {
      params.push(`%${String(q).replace(/[\\%_]/g, "\\$&")}%`);
      where.push(`name ILIKE $${params.length}`);
    }
    const sql = `SELECT ${COLS} FROM products ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY ${ORDER[sort] || "id ASC"}`;
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Could not load products" });
  }
});

router.get("/categories", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT DISTINCT category FROM products ORDER BY category");
    res.json(rows.map((r) => r.category));
  } catch {
    res.status(500).json({ message: "Could not load categories" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ message: "Product not found" });
    const { rows } = await pool.query(`SELECT ${COLS} FROM products WHERE id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ message: "Could not load product" });
  }
});

export default router;
