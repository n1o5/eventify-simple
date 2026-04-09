import { useState } from "react";
import { api } from "../api/api";

export function LoginPage({ onLogin, navigate }) {
  const [mode, setMode]         = useState("login");
  const [email, setEmail]       = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    setError(null); setLoading(true);
    try {
      const data = mode === "login"
        ? await api.login(email, password)
        : await api.register(username, email, password);
      onLogin(data);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="login-wrap">
      <div className="login-logo">
        <span className="login-logo-mark">🎟</span>
        <div className="login-logo-text">Eventify</div>
        <div className="login-logo-sub">{mode === "login" ? "Welcome back" : "Join thousands of event-goers"}</div>
      </div>

      <div className="card">
        <div className="tab-group">
          <button className={"tab-btn" + (mode === "login" ? " active" : "")} onClick={() => setMode("login")}>Sign In</button>
          <button className={"tab-btn" + (mode === "register" ? " active" : "")} onClick={() => setMode("register")}>Create Account</button>
        </div>

        {error && <div className="alert alert-error" style={{marginBottom:"16px"}}>{error}</div>}

        <div className="form-gap">
          {mode === "register" && (
            <div className="input-group">
              <label className="input-label">Username</label>
              <input className="input" placeholder="e.g. john_doe" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
          )}
          <div className="input-group">
            <label className="input-label">Email address</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={submit} disabled={loading} style={{marginTop:"4px"}}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>

      <p style={{textAlign:"center",marginTop:"20px",fontSize:"13px",color:"var(--text3)"}}>
        By continuing you agree to our Terms of Service.
      </p>
    </div>
  );
}
