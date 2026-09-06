import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateEventPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    venue: "",
    event_date: "",
    event_time: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiMode, setAiMode] = useState(null); // "generate" | "optimize"

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:5000/api/events/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to create event");
      setSuccess("Event created successfully!");
      setTimeout(() => navigate("/organizer"), 1200);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAIDescription = async (optimize = false) => {
    if (!optimize) {
      if (!formData.title || !formData.venue || !formData.event_date || !formData.event_time) {
        setError("Please fill in Title, Venue, Date and Time before generating a description.");
        return;
      }
    }
    setLoadingAI(true);
    setAiMode(optimize ? "optimize" : "generate");
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/ai/event-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          venue: formData.venue,
          event_date: formData.event_date,
          event_time: formData.event_time,
          description: optimize ? formData.description : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "AI generation failed");
      setFormData((prev) => ({ ...prev, description: data.description }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAI(false);
      setAiMode(null);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#f1f5f9",
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#94a3b8",
    marginBottom: 6,
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f1117",
      fontFamily: "'Inter', sans-serif",
      color: "#f1f5f9",
    }}>
      {/* Navbar */}
      <nav style={{
        height: 60,
        background: "#161b27",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>🎪</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>EventHub</span>
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 18, marginLeft: 4 }}>/</span>
          <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>Create Event</span>
        </div>
        <button
          onClick={() => navigate("/organizer")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent", color: "#94a3b8",
            fontSize: 13, fontWeight: 500, cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#f1f5f9"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
        >
          ← Back to Dashboard
        </button>
      </nav>

      {/* Page Body */}
      <div style={{ maxWidth: 680, margin: "48px auto", padding: "0 24px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>
            Create New Event
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
            Fill in the details below. Use AI to generate or optimize your description.
          </p>
        </div>

        {error && (
          <div style={{
            marginBottom: 20, padding: "12px 16px", borderRadius: 10,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            color: "#fca5a5", fontSize: 13, fontWeight: 500,
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            marginBottom: 20, padding: "12px 16px", borderRadius: 10,
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
            color: "#6ee7b7", fontSize: 13, fontWeight: 500,
          }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Tech Innovation Summit 2026"
              style={inputStyle}
              required
              onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>

          {/* Description + AI */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Description *</label>
              <div style={{ display: "flex", gap: 8 }}>
                {/* Generate button */}
                <button
                  type="button"
                  disabled={loadingAI}
                  onClick={() => handleAIDescription(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 8, border: "none",
                    background: loadingAI && aiMode === "generate"
                      ? "rgba(99,102,241,0.3)"
                      : "linear-gradient(135deg,#6366f1,#818cf8)",
                    color: "#fff", fontSize: 12, fontWeight: 600,
                    cursor: loadingAI ? "not-allowed" : "pointer",
                    transition: "all 0.2s", opacity: loadingAI ? 0.7 : 1,
                    boxShadow: "0 2px 12px rgba(99,102,241,0.3)",
                  }}
                  onMouseEnter={e => { if (!loadingAI) e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {loadingAI && aiMode === "generate" ? (
                    <>
                      <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⏳</span>
                      Generating…
                    </>
                  ) : (
                    <>✨ Generate with AI</>
                  )}
                </button>

                {/* Optimize button */}
                <button
                  type="button"
                  disabled={loadingAI || !formData.description}
                  onClick={() => handleAIDescription(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 8, border: "none",
                    background: loadingAI && aiMode === "optimize"
                      ? "rgba(139,92,246,0.3)"
                      : !formData.description
                      ? "rgba(255,255,255,0.05)"
                      : "linear-gradient(135deg,#8b5cf6,#a78bfa)",
                    color: !formData.description ? "#475569" : "#fff",
                    fontSize: 12, fontWeight: 600,
                    cursor: loadingAI || !formData.description ? "not-allowed" : "pointer",
                    transition: "all 0.2s", opacity: loadingAI ? 0.7 : 1,
                    boxShadow: formData.description ? "0 2px 12px rgba(139,92,246,0.3)" : "none",
                  }}
                  onMouseEnter={e => { if (!loadingAI && formData.description) e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {loadingAI && aiMode === "optimize" ? (
                    <>
                      <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⏳</span>
                      Optimizing…
                    </>
                  ) : (
                    <>🔧 Optimize</>
                  )}
                </button>
              </div>
            </div>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event… or use AI to generate one."
              style={{ ...inputStyle, resize: "vertical", minHeight: 140, lineHeight: 1.6 }}
              rows={5}
              required
              onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />

            {/* AI hint */}
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "#475569" }}>
              💡 Fill in the title, venue &amp; date first for better AI results.
            </p>
          </div>

          {/* Image URL */}
          <div>
            <label style={labelStyle}>Image URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/event-banner.jpg"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>

          {/* Venue */}
          <div>
            <label style={labelStyle}>Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g. Auditorium Block A, Main Campus"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>

          {/* Date & Time */}
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date *</label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                style={{ ...inputStyle, colorScheme: "dark" }}
                required
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Time *</label>
              <input
                type="time"
                name="event_time"
                value={formData.event_time}
                onChange={handleChange}
                style={{ ...inputStyle, colorScheme: "dark" }}
                required
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "13px",
              border: "none",
              borderRadius: 12,
              background: "linear-gradient(135deg,#10b981,#059669)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 20px rgba(16,185,129,0.25)",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(16,185,129,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(16,185,129,0.25)"; }}
          >
            🚀 Create Event
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default CreateEventPage;
