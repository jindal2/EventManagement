import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
    )}
  </svg>
);

const Spinner = ({ size = 16 }) => (
  <span style={{
    width: size, height: size, flexShrink: 0,
    border: "2px solid rgba(255,255,255,0.25)",
    borderTopColor: "#fff", borderRadius: "50%",
    display: "inline-block", animation: "spin 0.7s linear infinite",
  }} />
);

/* shared styles */
const inp = (focus) => ({
  width: "100%", padding: "11px 14px",
  border: `1px solid ${focus ? "rgba(99,102,241,0.55)" : "rgba(255,255,255,0.08)"}`,
  borderRadius: 10,
  background: focus ? "rgba(99,102,241,0.05)" : "rgba(255,255,255,0.04)",
  color: "#f1f5f9", fontSize: 14, outline: "none",
  fontFamily: "'Inter',sans-serif", boxSizing: "border-box",
  transition: "border-color 0.2s, background 0.2s",
});
const lbl = { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" };
const primaryBtn = (loading) => ({
  marginTop: 4, padding: "13px 0", border: "none", borderRadius: 11, width: "100%",
  background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
  color: "#fff", fontSize: 14, fontWeight: 700,
  cursor: loading ? "not-allowed" : "pointer",
  fontFamily: "'Inter',sans-serif",
  boxShadow: loading ? "none" : "0 4px 16px rgba(99,102,241,0.35)",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  transition: "all 0.2s",
});
const ghostBtn = {
  background: "none", border: "none", color: "#6366f1",
  fontSize: 12, fontWeight: 700, cursor: "pointer",
  fontFamily: "'Inter',sans-serif", padding: 0,
};
const Alert = ({ type, msg }) => msg ? (
  <div style={{
    background: type === "error" ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
    border: `1px solid ${type === "error" ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
    borderRadius: 10, padding: "10px 14px", marginBottom: 14,
    color: type === "error" ? "#fca5a5" : "#6ee7b7",
    fontSize: 13, display: "flex", alignItems: "flex-start", gap: 8,
  }}>
    <span style={{ flexShrink: 0 }}>{type === "error" ? "⚠️" : "✅"}</span>
    <span>{msg}</span>
  </div>
) : null;

/* ─── VIEWS ─────────────────────────────────────────
   signup | otp | success | login | forgot | resetSent
──────────────────────────────────────────────────── */

export default function AuthModal({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const [view, setView]   = useState("login"); // default to login
  const [error, setError] = useState("");
  const [info,  setInfo]  = useState("");
  const [busy,  setBusy]  = useState(false);

  /* signup form */
  const [sf, setSf] = useState({ name: "", email: "", password: "", role: "student" });
  const [showSfPass, setShowSfPass] = useState(false);
  const [sfFocus, setSfFocus] = useState({});

  /* otp */
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [otpEmail, setOtpEmail]   = useState("");   // email otp was sent to
  const [resendTimer, setResendTimer] = useState(0);

  /* login form */
  const [lf, setLf] = useState({ email: "", password: "" });
  const [showLfPass, setShowLfPass] = useState(false);
  const [lfFocus, setLfFocus] = useState({});

  /* forgot */
  const [forgotEmail, setForgotEmail] = useState("");
  const [fgFocus, setFgFocus] = useState(false);

  /* resend countdown */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const reset = () => { setError(""); setInfo(""); };

  const go = (v) => { reset(); setView(v); };

  if (!isOpen) return null;

  /* ── SEND OTP ── */
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    reset(); setBusy(true);
    try {
      const res  = await fetch(`${API}/api/auth/send-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sf),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setOtpEmail(sf.email);
      setOtpDigits(["","","","","",""]);
      setResendTimer(30);
      go("otp");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  /* ── VERIFY OTP ── */
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length < 6) { setError("Please enter the complete 6-digit OTP."); return; }
    reset(); setBusy(true);
    try {
      const res  = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      go("success");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  /* ── RESEND OTP ── */
  const handleResend = async () => {
    if (resendTimer > 0) return;
    reset(); setBusy(true);
    try {
      const res  = await fetch(`${API}/api/auth/resend-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setInfo("New OTP sent! Check your inbox.");
      setOtpDigits(["","","","","",""]);
      setResendTimer(30);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  /* ── OTP digit input handler ── */
  const handleOtpKey = (i, val, e) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[i] = val.slice(-1);
    setOtpDigits(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (e?.key === "Backspace" && !otpDigits[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  /* ── LOGIN ── */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    reset(); setBusy(true);
    try {
      const res  = await fetch(`${API}/api/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lf),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role",  data.role);
      setIsOpen(false);
      navigate(data.role === "student" ? "/student" : "/organizer");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  /* ── FORGOT PASSWORD ── */
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    reset(); setBusy(true);
    try {
      const res  = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      go("resetSent");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  /* ════════════════════════════════
     CARD SHELL
  ════════════════════════════════ */
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.72)", backdropFilter: "blur(14px)", padding: 16,
      }}
    >
      <div style={{
        position: "relative", width: "100%", maxWidth: 440,
        background: "linear-gradient(160deg,#1a2035 0%,#161b27 100%)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24,
        padding: "36px 36px 32px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.65),0 0 0 1px rgba(99,102,241,0.08)",
        fontFamily: "'Inter',sans-serif",
      }}>

        {/* Close */}
        <button onClick={() => setIsOpen(false)} style={{
          position: "absolute", top: 16, right: 16,
          width: 30, height: 30, borderRadius: "50%", border: "none",
          background: "rgba(255,255,255,0.06)", color: "#64748b",
          cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 14, transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#f1f5f9"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#64748b"; }}
        >✕</button>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 52, height: 52, borderRadius: 15,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            fontSize: 24, marginBottom: 14,
            boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
          }}>🎪</div>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            {view === "signup"    ? "Create account"
             : view === "otp"    ? "Verify your email"
             : view === "success" ? "You're in! 🎉"
             : view === "forgot" ? "Forgot password"
             : view === "resetSent" ? "Check your inbox"
             : "Welcome back"}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            {view === "signup"    ? "Fill in your details to get started"
             : view === "otp"    ? `We sent a 6-digit code to ${otpEmail}`
             : view === "success" ? "Your account is ready. Log in to continue."
             : view === "forgot" ? "Enter your email to receive a reset link"
             : view === "resetSent" ? "A password reset link has been sent"
             : "Sign in to your EventHub account"}
          </p>
        </div>

        {/* ══ SIGNUP VIEW ══ */}
        {view === "signup" && (
          <>
            <Alert type="error" msg={error} />
            <form onSubmit={handleSignupSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              <div>
                <label style={lbl}>Full Name</label>
                <input type="text" placeholder="Aarav Kumar" value={sf.name}
                  onChange={e => setSf({ ...sf, name: e.target.value })} required
                  style={inp(sfFocus.name)}
                  onFocus={() => setSfFocus(f => ({ ...f, name: true }))}
                  onBlur={() => setSfFocus(f => ({ ...f, name: false }))} />
              </div>

              <div>
                <label style={lbl}>I am a</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { value: "student",   label: "🎓 Student",  sub: "Discover & register" },
                    { value: "organizer", label: "🎪 Organizer", sub: "Create & manage" },
                  ].map(r => (
                    <button key={r.value} type="button" onClick={() => setSf({ ...sf, role: r.value })}
                      style={{
                        flex: 1, padding: "10px 12px", borderRadius: 10,
                        border: sf.role === r.value ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.07)",
                        background: sf.role === r.value ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
                        cursor: "pointer", transition: "all 0.2s",
                        fontFamily: "'Inter',sans-serif", textAlign: "left",
                      }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: sf.role === r.value ? "#a5b4fc" : "#94a3b8" }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{r.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={lbl}>Email Address</label>
                <input type="email" placeholder="you@college.edu" value={sf.email}
                  onChange={e => setSf({ ...sf, email: e.target.value })} required
                  style={inp(sfFocus.email)}
                  onFocus={() => setSfFocus(f => ({ ...f, email: true }))}
                  onBlur={() => setSfFocus(f => ({ ...f, email: false }))} />
              </div>

              <div>
                <label style={lbl}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showSfPass ? "text" : "password"} placeholder="Min. 6 characters"
                    value={sf.password} onChange={e => setSf({ ...sf, password: e.target.value })}
                    required minLength={6}
                    style={{ ...inp(sfFocus.password), paddingRight: 42 }}
                    onFocus={() => setSfFocus(f => ({ ...f, password: true }))}
                    onBlur={() => setSfFocus(f => ({ ...f, password: false }))} />
                  <button type="button" onClick={() => setShowSfPass(p => !p)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", display: "flex", padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = "#94a3b8"}
                    onMouseLeave={e => e.currentTarget.style.color = "#475569"}>
                    <EyeIcon open={showSfPass} />
                  </button>
                </div>
              </div>

              <button type="submit" disabled={busy} style={primaryBtn(busy)}
                onMouseEnter={e => { if (!busy) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.5)"; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = busy ? "none" : "0 4px 16px rgba(99,102,241,0.35)"; }}>
                {busy ? <><Spinner /> Sending OTP…</> : "Send OTP →"}
              </button>
            </form>
            <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 12, color: "#334155" }}>
              Already have an account?{" "}
              <button style={ghostBtn} onClick={() => go("login")}>Log in</button>
            </p>
          </>
        )}

        {/* ══ OTP VIEW ══ */}
        {view === "otp" && (
          <>
            <Alert type="error" msg={error} />
            <Alert type="success" msg={info} />
            <form onSubmit={handleOtpSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* 6-box OTP input */}
              <div>
                <label style={{ ...lbl, textAlign: "center", display: "block", marginBottom: 14 }}>Enter 6-digit OTP</label>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text" inputMode="numeric" maxLength={1}
                      value={d}
                      onChange={e => handleOtpKey(i, e.target.value)}
                      onKeyDown={e => e.key === "Backspace" && handleOtpKey(i, "", e)}
                      onPaste={e => {
                        e.preventDefault();
                        const pasted = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6).split("");
                        const next = [...otpDigits];
                        pasted.forEach((ch, idx) => { if (i + idx < 6) next[i + idx] = ch; });
                        setOtpDigits(next);
                        const focusIdx = Math.min(i + pasted.length, 5);
                        otpRefs.current[focusIdx]?.focus();
                      }}
                      style={{
                        width: 46, height: 54, textAlign: "center",
                        fontSize: 22, fontWeight: 800, color: "#f1f5f9",
                        background: d ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)",
                        border: d ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12, outline: "none",
                        fontFamily: "'Inter',sans-serif",
                        transition: "all 0.15s", caretColor: "#6366f1",
                      }}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" disabled={busy} style={primaryBtn(busy)}
                onMouseEnter={e => { if (!busy) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.5)"; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
                {busy ? <><Spinner /> Verifying…</> : "Verify & Create Account →"}
              </button>
            </form>

            {/* Resend */}
            <div style={{ textAlign: "center", marginTop: 16 }}>
              {resendTimer > 0 ? (
                <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>
                  Resend OTP in <strong style={{ color: "#a5b4fc" }}>{resendTimer}s</strong>
                </p>
              ) : (
                <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>
                  Didn't get the code?{" "}
                  <button style={ghostBtn} onClick={handleResend} disabled={busy}>Resend OTP</button>
                </p>
              )}
            </div>

            <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 12, color: "#334155" }}>
              <button style={{ ...ghostBtn, color: "#64748b", fontWeight: 500 }} onClick={() => go("signup")}>
                ← Change email / details
              </button>
            </p>
          </>
        )}

        {/* ══ SUCCESS VIEW ══ */}
        {view === "success" && (
          <div style={{ textAlign: "center" }}>
            {/* tick animation */}
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(16,185,129,0.12)",
              border: "2px solid rgba(16,185,129,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, margin: "0 auto 24px",
            }}>✅</div>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: "0 0 28px" }}>
              Your email has been verified and your account is ready.<br />
              Log in to start discovering events!
            </p>
            <button
              onClick={() => go("login")}
              style={{
                ...primaryBtn(false),
                marginTop: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.35)"; }}
            >
              Go to Login →
            </button>
          </div>
        )}

        {/* ══ LOGIN VIEW ══ */}
        {view === "login" && (
          <>
            <Alert type="error" msg={error} />
            <Alert type="success" msg={info} />
            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              <div>
                <label style={lbl}>Email Address</label>
                <input type="email" placeholder="you@college.edu" value={lf.email}
                  onChange={e => setLf({ ...lf, email: e.target.value })} required
                  style={inp(lfFocus.email)}
                  onFocus={() => setLfFocus(f => ({ ...f, email: true }))}
                  onBlur={() => setLfFocus(f => ({ ...f, email: false }))} />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ ...lbl, marginBottom: 0 }}>Password</label>
                  <button type="button" style={ghostBtn} onClick={() => go("forgot")}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input type={showLfPass ? "text" : "password"} placeholder="••••••••"
                    value={lf.password} onChange={e => setLf({ ...lf, password: e.target.value })}
                    required
                    style={{ ...inp(lfFocus.password), paddingRight: 42 }}
                    onFocus={() => setLfFocus(f => ({ ...f, password: true }))}
                    onBlur={() => setLfFocus(f => ({ ...f, password: false }))} />
                  <button type="button" onClick={() => setShowLfPass(p => !p)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", display: "flex", padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = "#94a3b8"}
                    onMouseLeave={e => e.currentTarget.style.color = "#475569"}>
                    <EyeIcon open={showLfPass} />
                  </button>
                </div>
              </div>

              <button type="submit" disabled={busy} style={primaryBtn(busy)}
                onMouseEnter={e => { if (!busy) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.5)"; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = busy ? "none" : "0 4px 16px rgba(99,102,241,0.35)"; }}>
                {busy ? <><Spinner /> Signing in…</> : "Sign In →"}
              </button>
            </form>
            <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 12, color: "#334155" }}>
              Don't have an account?{" "}
              <button style={ghostBtn} onClick={() => go("signup")}>Sign up free</button>
            </p>
          </>
        )}

        {/* ══ FORGOT PASSWORD VIEW ══ */}
        {view === "forgot" && (
          <>
            <Alert type="error" msg={error} />
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
              Enter the email you signed up with and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={lbl}>Email Address</label>
                <input type="email" placeholder="you@college.edu"
                  value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                  required style={inp(fgFocus)}
                  onFocus={() => setFgFocus(true)}
                  onBlur={() => setFgFocus(false)} />
              </div>
              <button type="submit" disabled={busy} style={primaryBtn(busy)}
                onMouseEnter={e => { if (!busy) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.5)"; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
                {busy ? <><Spinner /> Sending…</> : "Send Reset Link →"}
              </button>
            </form>
            <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 12, color: "#334155" }}>
              <button style={{ ...ghostBtn, color: "#64748b", fontWeight: 500 }} onClick={() => go("login")}>
                ← Back to Login
              </button>
            </p>
          </>
        )}

        {/* ══ RESET LINK SENT VIEW ══ */}
        {view === "resetSent" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(99,102,241,0.12)",
              border: "2px solid rgba(99,102,241,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, margin: "0 auto 24px",
            }}>📧</div>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: "0 0 8px" }}>
              A password reset link has been sent to
            </p>
            <p style={{ color: "#a5b4fc", fontSize: 14, fontWeight: 700, margin: "0 0 24px" }}>
              {forgotEmail}
            </p>
            <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, margin: "0 0 28px" }}>
              Click the link in the email to set a new password.<br />
              The link expires in <strong style={{ color: "#f1f5f9" }}>30 minutes</strong>.
            </p>
            <button onClick={() => go("login")}
              style={{ ...primaryBtn(false), marginTop: 0 }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.35)"; }}>
              Back to Login
            </button>
          </div>
        )}

        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
