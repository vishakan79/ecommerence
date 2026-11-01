import { Routes, Route, Link, NavLink, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Auth from "./pages/Auth.jsx";
import Orders from "./pages/Orders.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useCart } from "./context/CartContext.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="center muted">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

export default function App() {
  const { user, logout } = useAuth();
  const { count, toast } = useCart();

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">Kadai<span>.</span></Link>
          <nav className="nav">
            <NavLink to="/" end>Shop</NavLink>
            {user && <NavLink to="/orders">My orders</NavLink>}
          </nav>
          <div className="header-right">
            {user ? (
              <>
                <span className="muted hide-sm">Hi, {user.name.split(" ")[0]}</span>
                <button className="btn btn-ghost sm" onClick={logout}>Logout</button>
              </>
            ) : (
              <Link className="btn btn-ghost sm" to="/login">Login</Link>
            )}
            <Link to="/cart" className="cart-btn" aria-label="Open cart">
              🛒 <span className="cart-count">{count}</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
          <Route path="/orders" element={<Protected><Orders /></Protected>} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="*" element={<p className="center muted">Page not found. <Link to="/">Go home</Link></p>} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="container">© {new Date().getFullYear()} Kadai · MERN demo store, no real payments.</div>
      </footer>

      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
