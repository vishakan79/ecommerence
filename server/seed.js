import "dotenv/config";
import { pool, initDb, insertProducts } from "./db.js";

await initDb();
await pool.query("TRUNCATE products RESTART IDENTITY CASCADE");
await insertProducts();
console.log("Re-seeded products (orders were cleared too)");
await pool.end();
