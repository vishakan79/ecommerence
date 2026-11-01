import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { money } from "../api.js";

export default function Cart() {
  const { items, subtotal, shipping, total, setQty, remove, clear } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container page center">
        <h2>Your cart is empty</h2>
        <p className="muted">Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="container page two-col">
      <section>
        <h2>Your cart</h2>
        {items.map(({ product: p, qty }) => (
          <div className="cart-row" key={p._id}>
            <div className="cart-thumb" style={{ background: p.bg }}>{p.emoji}</div>
            <div>
              <div className="cart-name">{p.name}</div>
              <div className="muted small">{money(p.price)} each</div>
              <div className="qty">
                <button onClick={() => setQty(p._id, qty - 1)} aria-label="Decrease quantity">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(p._id, qty + 1)} aria-label="Increase quantity">+</button>
              </div>
            </div>
            <div className="right">
              <strong>{money(p.price * qty)}</strong><br />
              <button className="link-btn" onClick={() => remove(p._id)}>Remove</button>
            </div>
          </div>
        ))}
      </section>

      <aside className="summary">
        <h3>Order summary</h3>
        <div className="row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
        <div className="row muted"><span>Shipping</span><span>{shipping === 0 ? "Free" : money(shipping)}</span></div>
        <div className="row total"><span>Total</span><strong>{money(total)}</strong></div>
        <button className="btn btn-primary full" onClick={() => navigate("/checkout")}>Proceed to checkout</button>
        <button className="btn btn-ghost full" onClick={clear}>Clear cart</button>
      </aside>
    </div>
  );
}
