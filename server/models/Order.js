import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        emoji: String,
        price: Number,
        qty: { type: Number, required: true, min: 1 }
      }
    ],
    shipping: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true }
    },
    payment: { type: String, default: "Cash on delivery" },
    subtotal: Number,
    shippingFee: Number,
    total: Number,
    status: { type: String, enum: ["placed", "shipped", "delivered", "cancelled"], default: "placed" }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
