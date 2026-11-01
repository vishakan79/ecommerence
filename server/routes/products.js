import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const router = Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get("/", async (req, res) => {
  try {
    const { q, category, sort } = req.query;
    const filter = {};
    if (category && category !== "all") filter.category = String(category);
    if (q) filter.name = { $regex: escapeRegex(String(q)), $options: "i" };

    const sorts = { low: { price: 1 }, high: { price: -1 }, rating: { rating: -1 } };
    const products = await Product.find(filter).sort(sorts[sort] || { createdAt: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Could not load products", detail: err.message });
  }
});

router.get("/categories", async (_req, res) => {
  try {
    res.json((await Product.distinct("category")).sort());
  } catch (err) {
    res.status(500).json({ message: "Could not load categories", detail: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Product not found" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Could not load product", detail: err.message });
  }
});

export default router;
