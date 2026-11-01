import { useEffect, useState } from "react";
import { api, money } from "../api.js";
import { useCart } from "../context/CartContext.jsx";

export default function Home() {
  const { add } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/products/categories").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const params = new URLSearchParams({ category, sort });
      if (q.trim()) params.set("q", q.trim());
      api(`/products?${params}`)
        .then((d) => { setProducts(d); setError(""); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, category, sort]);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Everyday things,<br />made well.</h1>
          <p>Fresh picks for your home, desk and wardrobe. Free shipping over ₹999.</p>
        </div>
      </section>

      <div className="container">
        <div className="toolbar">
          <h2>Products</h2>
          <div className="controls">
            <input type="search" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              <option value="featured">Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </div>

        {error && <p className="error center">{error}</p>}
        {loading && !products.length && <p className="center muted">Loading products…</p>}
        {!loading && !error && products.length === 0 && <p className="center muted">No products found.</p>}

        <div className="grid">
          {products.map((p) => (
            <article className="card" key={p._id}>
              <div className="card-img" style={{ background: p.bg }} aria-hidden="true">{p.emoji}</div>
              <div className="card-body">
                <span className="card-cat">{p.category}</span>
                <h3 className="card-title">{p.name}</h3>
                <p className="desc">{p.description}</p>
                <span className="rating">★ {p.rating.toFixed(1)}</span>
                <div className="card-foot">
                  <span className="price">{money(p.price)}</span>
                  {p.stock > 0
                    ? <button className="add-btn" onClick={() => add(p)}>Add to cart</button>
                    : <span className="muted">Out of stock</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
