import { useState } from "react";
import { Link } from "react-router-dom";
import { api, money } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, shipping, total, clear } = useCart();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: "", address: "", payment: "Cash on delivery" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (order) {
    return (
      <div className="container page center">
        <h2>🎉 Order placed!</h2>
        <p className="muted">Thanks {order.shipping.name}. Your order <strong>#{order._id.slice(-7).toUpperCase()}</strong> for {money(order.total)} is confirmed. This is a demo, nothing was charged.</p>
        <Link to="/orders" className="btn btn-primary">View my orders</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container page center">
        <h2>Nothing to check out</h2>
        <Link to="/" className="btn btn-primary">Browse products</Link>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.address.trim()) return setError("Please fill in your name and address.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Please enter a valid email.");
    if (!/^[0-9+\- ]{8,15}$/.test(form.phone)) return setError("Please enter a valid phone number.");

    setBusy(true);
    try {
      const created = await api("/orders", {
        method: "POST",
        body: {
          items: items.map((i) => ({ productId: i.product._id, qty: i.qty })),
          shipping: { name: form.name, email: form.email, phone: form.phone, address: form.address },
          payment: form.payment
        }
      });
      clear();
      setOrder(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container page two-col">
      <form onSubmit={submit} noValidate>
        <h2>Checkout</h2>
        <label>Full name <input value={form.name} onChange={set("name")} required /></label>
        <label>Email <input type="email" value={form.email} onChange={set("email")} required /></label>
        <label>Phone <input type="tel" value={form.phone} onChange={set("phone")} required /></label>
        <label>Address <textarea rows="3" value={form.address} onChange={set("address")} required /></label>
        <label>Payment
          <select value={form.payment} onChange={set("payment")}>
            <option>Cash on delivery</option>
            <option>UPI (demo)</option>
            <option>Card (demo)</option>
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary full" disabled={busy}>{busy ? "Placing order…" : `Place order · ${money(total)}`}</button>
      </form>

      <aside className="summary">
        <h3>Items</h3>
        {items.map(({ product: p, qty }) => (
          <div className="row small" key={p._id}><span>{p.emoji} {p.name} × {qty}</span><span>{money(p.price * qty)}</span></div>
        ))}
        <div className="row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
        <div className="row muted"><span>Shipping</span><span>{shipping === 0 ? "Free" : money(shipping)}</span></div>
        <div className="row total"><span>Total</span><strong>{money(total)}</strong></div>
      </aside>
    </div>
  );
}
