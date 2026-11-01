import jwt from "jsonwebtoken";
import { pool } from "../db.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Please log in first" });
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [id]);
    if (!rows[0]) return res.status(401).json({ message: "User no longer exists" });
    req.user = rows[0];
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired session" });
  }
}
