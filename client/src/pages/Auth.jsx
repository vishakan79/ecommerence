import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Auth({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container page narrow">
      <form onSubmit={submit}>
        <h2>{isRegister ? "Create account" : "Welcome back"}</h2>
        {isRegister && <label>Name <input value={form.name} onChange={set("name")} required /></label>}
        <label>Email <input type="email" value={form.email} onChange={set("email")} required /></label>
        <label>Password <input type="password" minLength={6} value={form.password} onChange={set("password")} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary full" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Sign up" : "Log in"}</button>
        <p className="muted small center">
          {isRegister ? <>Already have an account? <Link to="/login" state={location.state}>Log in</Link></> : <>New here? <Link to="/register" state={location.state}>Create an account</Link></>}
        </p>
      </form>
    </div>
  );
}
