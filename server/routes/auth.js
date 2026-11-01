import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

router.post("/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: "Please enter a valid email" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id, name, email",
      [name, email, hash]
    );
    res.status(201).json({ token: sign(rows[0].id), user: publicUser(rows[0]) });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ message: "Email already registered" });
    res.status(500).json({ message: "Could not register" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Wrong email or password" });
    }
    res.json({ token: sign(user.id), user: publicUser(user) });
  } catch {
    res.status(500).json({ message: "Could not log in" });
  }
});

router.get("/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
