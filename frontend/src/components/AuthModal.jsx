import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AuthModal({ isOpen, setIsOpen }) {
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  if (!isOpen) return null;

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setSuccess("");
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const url = isSignup
      ? "http://localhost:5000/api/auth/register"
      : "http://localhost:5000/api/auth/login";

    try {
      const payload = isSignup
        ? formData
        : { email: formData.email, password: formData.password };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Something went wrong");

      if (!isSignup) {
        if (data.token) localStorage.setItem("token", data.token);
        const role = data.role || formData.role;
        localStorage.setItem("role", role);
        setIsOpen(false);
        if (role === "student") navigate("/student");
        else if (role === "organizer") navigate("/organizer");
      } else {
        setSuccess("Account created! Please log in.");
        setIsSignup(false);
        setFormData({ ...formData, password: "", name: "" });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      {/* Card */}
      <div
        className="fade-in relative w-full max-w-md mx-4 rounded-2xl p-8 shadow-2xl"
        style={{
          background: "linear-gradient(145deg, #1e2535, #161b27)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Close */}
        <button
          onClick={() => setIsOpen(false)}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.07)",
            border: "none", color: "#94a3b8",
            width: 32, height: 32, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, padding: 0,
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
        >
          ✕
        </button>

        {/* Logo accent */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            fontSize: 22, marginBottom: 12,
          }}>🎪</div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#f1f5f9" }}>
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>
            {isSignup ? "Join the campus event community" : "Sign in to your account"}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: "flex", background: "rgba(255,255,255,0.04)",
          borderRadius: 10, padding: 4, marginBottom: 24,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          {["Sign Up", "Log In"].map((tab, i) => {
            const active = (i === 0 && isSignup) || (i === 1 && !isSignup);
            return (
              <button
                key={tab}
                onClick={() => { setIsSignup(i === 0); setError(""); setSuccess(""); }}
                style={{
                  flex: 1, padding: "8px 0", border: "none",
                  borderRadius: 8, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.2s",
                  background: active ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                  color: active ? "#fff" : "#64748b",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8, padding: "10px 14px", marginBottom: 16,
            color: "#f87171", fontSize: 14,
          }}>⚠️ {error}</div>
        )}
        {success && (
          <div style={{
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: 8, padding: "10px 14px", marginBottom: 16,
            color: "#34d399", fontSize: 14,
          }}>✅ {success}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isSignup && (
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94a3b8", marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          )}

          {isSignup && (
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94a3b8", marginBottom: 6 }}>
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="student">🎓 Student</option>
                <option value="organizer">🎪 Organizer</option>
              </select>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94a3b8", marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94a3b8", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4, padding: "12px 0", border: "none", borderRadius: 10,
              background: loading ? "#334155" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s", letterSpacing: 0.3,
            }}
          >
            {loading ? "Please wait..." : (isSignup ? "Create Account →" : "Sign In →")}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8, background: "rgba(255,255,255,0.04)", color: "#f1f5f9",
  fontSize: 14, outline: "none", transition: "border-color 0.2s",
  fontFamily: "Inter, sans-serif", boxSizing: "border-box",
};

export default AuthModal;
