import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, money } from "../api.js";

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/orders/mine").then(setOrders).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error center">{error}</p>;
  if (!orders) return <p className="center muted">Loading orders…</p>;

  if (orders.length === 0) {
    return (
      <div className="container page center">
        <h2>No orders yet</h2>
        <Link to="/" className="btn btn-primary">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <h2>My orders</h2>
      {orders.map((o) => (
        <div className="order" key={o._id}>
          <div className="row">
            <strong>#{o._id.slice(-7).toUpperCase()}</strong>
            <span className="badge">{o.status}</span>
          </div>
          <div className="muted small">{new Date(o.createdAt).toLocaleString("en-IN")} · {o.payment}</div>
          {o.items.map((i, idx) => (
            <div className="row small" key={idx}><span>{i.emoji} {i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></div>
          ))}
          <div className="row total"><span>Total</span><strong>{money(o.total)}</strong></div>
        </div>
      ))}
    </div>
  );
}
