import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    emoji: { type: String, default: "📦" },
    bg: { type: String, default: "#eeeeee" },
    description: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
