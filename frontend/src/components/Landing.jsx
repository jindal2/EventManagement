import { useState } from "react";
import AuthModal from "../components/AuthModal";

function Landing() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "linear-gradient(135deg, #0f1117 0%, #161b27 50%, #0f1117 100%)",
      color: "#f1f5f9", position: "relative", overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Background glow orbs */}
      <div style={{
        position: "absolute", top: "20%", left: "10%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "40%", right: "5%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px", borderBottom: "1px solid rgba(255,255,255,0.05)",
        position: "relative", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>🎪</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>EventHub</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "80px 48px", gap: 48, position: "relative", zIndex: 10,
        maxWidth: 1200, margin: "0 auto",
      }}>
        {/* Left */}
        <div style={{ flex: 1, maxWidth: 560 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 999, padding: "6px 14px", fontSize: 13, color: "#a5b4fc",
            marginBottom: 24, fontWeight: 500,
          }}>
            ✨ Your college event platform
          </div>
          <h1 style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800, lineHeight: 1.1,
            margin: "0 0 20px", letterSpacing: "-0.03em",
          }}>
            Discover &amp; Register<br />
            <span style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              College Events
            </span>
          </h1>
          <p style={{
            fontSize: 18, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 36px",
          }}>
            Cultural fests, hackathons, workshops, speaker sessions — discover and register for everything happening on campus, all in one place.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                padding: "14px 32px", border: "none", borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(99,102,241,0.35)"; }}
            >
              Get Started →
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 32, marginTop: 48 }}>
            {[
              { label: "Active Events", value: "50+" },
              { label: "Students", value: "2K+" },
              { label: "Organizers", value: "100+" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — image */}
        <div style={{ flex: 1, maxWidth: 500, position: "relative" }}>
          <div style={{
            borderRadius: 24, overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            <img
              src="https://i.pinimg.com/originals/cd/48/19/cd4819ed5c27a25ef7023d643de3e393.jpg"
              alt="College event"
              style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }}
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{
        padding: "60px 48px", maxWidth: 1200, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20,
      }}>
        {[
          { icon: "🎪", title: "Discover Events", desc: "Browse cultural fests, hackathons, workshops and more" },
          { icon: "🎫", title: "Easy Registration", desc: "Register with one click and get a downloadable ticket" },
          { icon: "💬", title: "Chat with Organizers", desc: "Directly message event organizers for queries" },
        ].map(f => (
          <div key={f.title} style={{
            background: "rgba(30,37,53,0.6)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: "28px 24px",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>{f.title}</h3>
            <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {isModalOpen && <AuthModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />}
    </div>
  );
}

export default Landing;
