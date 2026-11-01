import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import { PRODUCTS } from "./data/products.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
await Product.deleteMany({});
await Product.insertMany(PRODUCTS);
console.log(`Seeded ${PRODUCTS.length} products`);
await mongoose.disconnect();
