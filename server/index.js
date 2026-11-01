import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { pool, initDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;

for (const key of ["DATABASE_URL", "JWT_SECRET"]) {
  if (!process.env[key]) {
    console.error(`Missing ${key} environment variable`);
    process.exit(1);
  }
}

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : true }));
app.use(express.json({ limit: "100kb" }));

app.get("/", (_req, res) => res.json({ name: "Kadai API", status: "ok" }));
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch {
    res.status(503).json({ ok: false, db: "disconnected" });
  }
});
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", (_req, res) => res.status(404).json({ message: "Not found" }));

// Optional: serve a built React app if one sits next to the server (single-host setups)
const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

initDb()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => {
    console.error("Failed to start:", err.message);
    process.exit(1);
  });
