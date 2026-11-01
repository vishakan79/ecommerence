export const money = (n) => "₹" + Number(n).toLocaleString("en-IN");

// In production (Vercel) set VITE_API_URL to the Render backend URL, e.g. https://kadai-api.onrender.com
const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export function getToken() {
  try { return localStorage.getItem("kadai-token"); } catch { return null; }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem("kadai-token", token);
    else localStorage.removeItem("kadai-token");
  } catch {}
}

export async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error("Cannot reach the server. If it was idle, wait ~30s and try again.");
  }

  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const err = new Error((data && data.message) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}
