import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const KEY = "kadai-cart-v2";
export const FREE_SHIP_OVER = 999;
export const SHIPPING_FEE = 79;

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(raw) ? raw.filter((i) => i && i.product && i.qty > 0) : [];
  } catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const value = useMemo(() => {
    const add = (product) => {
      setItems((cur) => {
        const found = cur.find((i) => i.product._id === product._id);
        if (found) return cur.map((i) => (i === found ? { ...i, qty: Math.min(i.qty + 1, 99) } : i));
        return [...cur, { product, qty: 1 }];
      });
      setToast(`${product.name} added to cart`);
    };
    const setQty = (id, qty) =>
      setItems((cur) => cur.flatMap((i) => (i.product._id !== id ? [i] : qty <= 0 ? [] : [{ ...i, qty: Math.min(qty, 99) }])));
    const remove = (id) => setItems((cur) => cur.filter((i) => i.product._id !== id));
    const clear = () => setItems([]);

    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.product.price, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIP_OVER ? 0 : SHIPPING_FEE;
    return { items, count, subtotal, shipping, total: subtotal + shipping, add, setQty, remove, clear, toast };
  }, [items, toast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
