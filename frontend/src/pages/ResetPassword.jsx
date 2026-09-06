import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

export default function ResetPassword() {
  const navigate = useNavigate();
  const [token,    setToken]    = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [invalid,  setInvalid]  = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    const e = params.get("email");
    if (!t || !e) { setInvalid(true); return; }
    setToken(t); setEmail(e);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    setBusy(true);
    try {
      const res  = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2500);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const inp = (focused) => ({
    width: "100%", padding: "11px 14px",
    border: `1px solid ${focused ? "rgba(99,102,241,0.55)" : "rgba(255,255,255,0.08)"}`,
    borderRadius: 10,
    background: focused ? "rgba(99,102,241,0.05)" : "rgba(255,255,255,0.04)",
    color: "#f1f5f9", fontSize: 14, outline: "none",
    fontFamily: "'Inter',sans-serif", boxSizing: "border-box", transition: "all 0.2s",
  });
  const [f1, setF1] = useState(false);
  const [f2, setF2] = useState(false);

  return (
    <div style={{
      minHeight: "100vh", background: "#0f1117",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter',sans-serif", padding: 16,
    }}>
      <div style={{
        width: "100%", maxWidth: 420,
        background: "linear-gradient(160deg,#1a2035,#161b27)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24,
        padding: "36px 36px 32px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 15, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: 24, marginBottom: 14, boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}>🎪</div>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            {success ? "Password Updated!" : invalid ? "Invalid Link" : "Set New Password"}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            {success ? "Redirecting you to login…"
             : invalid ? "This reset link is invalid or has expired."
             : `Resetting password for ${email}`}
          </p>
        </div>

        {invalid && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
              Please request a new password reset link from the login page.
            </p>
            <button onClick={() => navigate("/")} style={{ padding: "12px 28px", border: "none", borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
              Go to Login
            </button>
          </div>
        )}

        {success && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "2px solid rgba(16,185,129,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 24px" }}>✅</div>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7 }}>Your password has been reset successfully.<br />Taking you to login…</p>
          </div>
        )}

        {!invalid && !success && (
          <>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: "#fca5a5", fontSize: 13, display: "flex", gap: 8 }}>
                <span>⚠️</span><span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                    value={password} onChange={e => setPassword(e.target.value)} required
                    style={{ ...inp(f1), paddingRight: 42 }}
                    onFocus={() => setF1(true)} onBlur={() => setF1(false)} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", display: "flex", padding: 0 }}>
                    <EyeIcon open={showPass} />
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showConf ? "text" : "password"} placeholder="Repeat password"
                    value={confirm} onChange={e => setConfirm(e.target.value)} required
                    style={{ ...inp(f2), paddingRight: 42 }}
                    onFocus={() => setF2(true)} onBlur={() => setF2(false)} />
                  <button type="button" onClick={() => setShowConf(p => !p)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", display: "flex", padding: 0 }}>
                    <EyeIcon open={showConf} />
                  </button>
                </div>
                {/* match indicator */}
                {confirm.length > 0 && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: password === confirm ? "#34d399" : "#f87171" }}>
                    {password === confirm ? "✓ Passwords match" : "✗ Passwords don't match"}
                  </p>
                )}
              </div>

              <button type="submit" disabled={busy} style={{
                padding: "13px 0", border: "none", borderRadius: 11, width: "100%",
                background: busy ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer",
                fontFamily: "'Inter',sans-serif",
                boxShadow: busy ? "none" : "0 4px 16px rgba(99,102,241,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { if (!busy) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.5)"; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
                {busy
                  ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Updating…</>
                  : "Update Password →"
                }
              </button>
            </form>
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
