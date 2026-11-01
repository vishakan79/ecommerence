export const money = (n) => "₹" + Number(n).toLocaleString("en-IN");

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

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const err = new Error((data && data.message) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}
