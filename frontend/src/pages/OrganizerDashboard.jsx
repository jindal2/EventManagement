import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";

const S = {
  sidebar: {
    width: 240, background: "#161b27",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    padding: "24px 16px", fontFamily: "'Inter',sans-serif",
  },
  logo: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 32,
  },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
  },
  logoText: { fontSize: 16, fontWeight: 700, color: "#f1f5f9" },
  navBtn: (active) => ({
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px", borderRadius: 8, border: "none",
    background: active ? "rgba(99,102,241,0.15)" : "transparent",
    color: active ? "#a5b4fc" : "#64748b",
    fontSize: 14, fontWeight: 500, cursor: "pointer",
    width: "100%", textAlign: "left", transition: "all 0.2s",
  }),
  logoutBtn: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px", borderRadius: 8, border: "none",
    background: "transparent", color: "#ef4444",
    fontSize: 14, fontWeight: 500, cursor: "pointer",
    width: "100%", textAlign: "left", transition: "all 0.2s",
  },
};

function OrganizerDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [createdEvents, setCreatedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCreatedEvents();
    fetchAllEvents();
  }, []);

  const fetchCreatedEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events/created", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setCreatedEvents(data.events || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setAllEvents(data.events || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  const eventsToDisplay = search.trim() === ""
    ? allEvents
    : allEvents.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f1117", fontFamily: "'Inter',sans-serif", color: "#f1f5f9" }}>

      {/* Sidebar */}
      <div style={S.sidebar}>
        <div>
          <div style={S.logo}>
            <div style={S.logoIcon}>🎪</div>
            <span style={S.logoText}>EventHub</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#334155", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, paddingLeft: 12 }}>
            Organizer
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <NotificationBell />
            <button style={S.navBtn(true)} onClick={() => navigate("/organizer")}>🏠 Dashboard</button>
            <button style={S.navBtn(false)} onClick={() => navigate("/organizer/create-event")}>➕ Create Event</button>
          </div>

          {/* My Events in sidebar */}
          {createdEvents.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#334155", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, paddingLeft: 12 }}>
                My Events ({createdEvents.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {createdEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => navigate(`/organizer/event/${event.id}`)}
                    style={{
                      padding: "8px 12px", borderRadius: 8, border: "none",
                      background: "transparent", color: "#94a3b8",
                      fontSize: 13, cursor: "pointer", textAlign: "left",
                      transition: "all 0.2s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#f1f5f9"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                  >
                    🎯 {event.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button style={S.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{
          padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#0f1117",
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Browse Events</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Events from other organizers</p>
          </div>
          <input
            type="text"
            placeholder="🔍 Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: "9px 16px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)", color: "#f1f5f9",
              fontSize: 14, outline: "none", width: 260,
              fontFamily: "'Inter',sans-serif",
            }}
          />
        </div>

        {/* Event Feed */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {eventsToDisplay.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#334155" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎭</div>
              <p style={{ fontSize: 16, fontWeight: 500 }}>No events found</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Try a different search term</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
              {eventsToDisplay.map(event => (
                <div
                  key={event.id}
                  style={{
                    background: "#1e2535", borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.06)",
                    overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {event.image ? (
                    <img src={event.image} alt={event.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: 140, background: "linear-gradient(135deg,#1e2535,#252d42)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🎭</div>
                  )}
                  <div style={{ padding: "16px" }}>
                    <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: "#f1f5f9" }}>{event.title}</h3>
                    <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {event.description}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#94a3b8" }}>
                      <span>📍 {event.venue || "TBA"}</span>
                      <span>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}</span>
                      <span>⏰ {event.event_time || "TBA"}</span>
                      <span>👤 {event.organizer_name || "Unknown"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel — My Created Events */}
      <div style={{
        width: 280, background: "#161b27",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 16px", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>My Created Events</h2>
          <button
            onClick={() => navigate("/organizer/create-event")}
            style={{
              padding: "5px 10px", border: "none", borderRadius: 7,
              background: "rgba(99,102,241,0.15)", color: "#a5b4fc",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >+ New</button>
        </div>

        {createdEvents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#334155" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            <p style={{ fontSize: 13 }}>No events yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {createdEvents.map(event => (
              <div
                key={event.id}
                onClick={() => navigate(`/organizer/event/${event.id}`)}
                style={{
                  background: "#252d42", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.05)",
                  padding: "12px", cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#2d3654"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#252d42"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}
              >
                <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{event.title}</h4>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  📅 {event.event_date ? new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}
                </div>
                <div style={{
                  marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4,
                  background: "rgba(99,102,241,0.1)", borderRadius: 6,
                  padding: "3px 8px", fontSize: 11, color: "#a5b4fc", fontWeight: 600,
                }}>
                  👁 View Details →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizerDashboard;
