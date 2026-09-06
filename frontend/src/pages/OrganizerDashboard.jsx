import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";

function OrganizerDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [createdEvents, setCreatedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("browse"); // "browse" | "myevents"
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

  /* ── shared style tokens ── */
  const navBtnActive = {
    display: "flex", alignItems: "center", gap: 7,
    padding: "7px 16px", borderRadius: 8, border: "none",
    background: "rgba(99,102,241,0.18)", color: "#a5b4fc",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "'Inter',sans-serif", transition: "all 0.2s",
  };
  const navBtnIdle = {
    ...navBtnActive,
    background: "transparent", color: "#64748b",
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: "#0f1117", fontFamily: "'Inter',sans-serif", color: "#f1f5f9",
    }}>

      {/* ═══ TOP NAVBAR ═══ */}
      <nav style={{
        height: 60, background: "#161b27",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px", flexShrink: 0,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {/* Left: Logo + nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, marginRight: 8, flexShrink: 0,
          }}>🎪</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginRight: 20 }}>
            EventHub
          </span>

          {/* Nav tabs */}
          <button
            style={activeTab === "browse" ? navBtnActive : navBtnIdle}
            onClick={() => setActiveTab("browse")}
            onMouseEnter={e => { if (activeTab !== "browse") e.currentTarget.style.color = "#94a3b8"; }}
            onMouseLeave={e => { if (activeTab !== "browse") e.currentTarget.style.color = "#64748b"; }}
          >
            🏠 Browse Events
          </button>
          <button
            style={activeTab === "myevents" ? navBtnActive : navBtnIdle}
            onClick={() => setActiveTab("myevents")}
            onMouseEnter={e => { if (activeTab !== "myevents") e.currentTarget.style.color = "#94a3b8"; }}
            onMouseLeave={e => { if (activeTab !== "myevents") e.currentTarget.style.color = "#64748b"; }}
          >
            📋 My Events
            {createdEvents.length > 0 && (
              <span style={{
                background: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 700,
                borderRadius: 999, padding: "1px 6px", marginLeft: 2,
              }}>{createdEvents.length}</span>
            )}
          </button>
        </div>

        {/* Right: Search + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {activeTab === "browse" && (
            <input
              type="text"
              placeholder="🔍 Search events…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: "7px 14px", borderRadius: 9,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)", color: "#f1f5f9",
                fontSize: 13, outline: "none", width: 220,
                fontFamily: "'Inter',sans-serif",
              }}
            />
          )}

          <NotificationBell />

          <button
            onClick={() => navigate("/organizer/create-event")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Inter',sans-serif",
              boxShadow: "0 2px 12px rgba(99,102,241,0.3)", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(99,102,241,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(99,102,241,0.3)"; }}
          >
            ➕ New Event
          </button>

          {/* Logout — always visible */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8,
              border: "1px solid rgba(239,68,68,0.25)",
              background: "rgba(239,68,68,0.08)", color: "#f87171",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Inter',sans-serif", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.18)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; }}
          >
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* ═══ CONTENT AREA ═══ */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* ── BROWSE TAB ── */}
        {activeTab === "browse" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "32px 32px" }}>
            {/* Section header */}
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>
                Browse Events
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                Discover events from all organizers on the platform
              </p>
            </div>

            {eventsToDisplay.length === 0 ? (
              <div style={{ textAlign: "center", padding: "100px 0", color: "#334155" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🎭</div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#475569" }}>No events found</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Try a different search term</p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                gap: 20,
              }}>
                {eventsToDisplay.map(event => (
                  <div
                    key={event.id}
                    style={{
                      background: "#1e2535", borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.06)",
                      overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.45)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    {event.image
                      ? <img src={event.image} alt={event.title} style={{ width: "100%", height: 176, objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: 130, background: "linear-gradient(135deg,#1e2535,#252d42)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46 }}>🎭</div>
                    }
                    <div style={{ padding: "16px" }}>
                      <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{event.title}</h3>
                      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {event.description}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12, color: "#94a3b8" }}>
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
        )}

        {/* ── MY EVENTS TAB ── */}
        {activeTab === "myevents" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "32px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <div>
                <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>My Created Events</h1>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Manage and view your events</p>
              </div>
              <button
                onClick={() => navigate("/organizer/create-event")}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 18px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: "#fff", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'Inter',sans-serif",
                  boxShadow: "0 2px 12px rgba(99,102,241,0.3)", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                ➕ Create New Event
              </button>
            </div>

            {createdEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "100px 0", color: "#334155" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#475569" }}>No events yet</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Create your first event to get started</p>
                <button
                  onClick={() => navigate("/organizer/create-event")}
                  style={{
                    marginTop: 20, padding: "10px 24px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color: "#fff", fontSize: 14, fontWeight: 600,
                    cursor: "pointer", fontFamily: "'Inter',sans-serif",
                  }}
                >
                  ➕ Create Event
                </button>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                gap: 20,
              }}>
                {createdEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={() => navigate(`/organizer/event/${event.id}`)}
                    style={{
                      background: "#1e2535", borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.06)",
                      overflow: "hidden", cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.45)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                  >
                    {event.image
                      ? <img src={event.image} alt={event.title} style={{ width: "100%", height: 176, objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: 130, background: "linear-gradient(135deg,#252d42,#2d3654)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46 }}>🎯</div>
                    }
                    <div style={{ padding: "16px" }}>
                      <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{event.title}</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
                        <span>📍 {event.venue || "TBA"}</span>
                        <span>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}</span>
                        <span>⏰ {event.event_time || "TBA"}</span>
                      </div>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        background: "rgba(99,102,241,0.12)", borderRadius: 8,
                        padding: "4px 10px", fontSize: 11, color: "#a5b4fc", fontWeight: 600,
                      }}>
                        👁 View Details →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizerDashboard;
