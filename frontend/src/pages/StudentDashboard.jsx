import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import ChatWindow from "../components/ChatWindow";

function StudentDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allEvents, setAllEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("discover"); // "discover" | "myregistrations" | "profile"
  const [student, setStudent] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAllEvents();
    fetchRegisteredEvents();
    fetchStudentInfo();
  }, []);

  const fetchAllEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch events");
      setAllEvents(data.events || []);
    } catch (err) { console.error(err); }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events/registered", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch registered events");
      setRegisteredEvents(data.events || []);
    } catch (err) { console.error(err); }
  };

  const fetchStudentInfo = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch profile");
      setStudent(data.user);
    } catch (err) { console.error(err); }
  };

  const getGoogleCalendarUrl = (event) => {
    const date = event.event_date.replace(/-/g, "");
    const time = event.event_time ? event.event_time.replace(/:/g, "").slice(0, 6) : "120000";
    const start = `${date}T${time}`;
    const hour = parseInt(time.slice(0, 2));
    const minsSecs = time.slice(2);
    const endHour = String(Math.min(hour + 1, 23)).padStart(2, "0");
    const end = `${date}T${endHour}${minsSecs}`;
    const title = encodeURIComponent(event.title);
    const location = encodeURIComponent(event.venue || "");
    const details = encodeURIComponent("Added from EventHub");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}&details=${details}`;
  };

  const handleRegister = async (eventId) => {
    try {
      const res = await fetch("http://localhost:5000/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ eventId }),
      });
      if (!res.ok) throw new Error("Failed to register");
      fetchRegisteredEvents();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const downloadTicket = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/events/${eventId}/ticket`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to download ticket");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket_event_${eventId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error downloading ticket");
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  const eventsToDisplay = search.trim() === ""
    ? allEvents
    : allEvents.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  /* ── nav button style helpers ── */
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

  const avatarInitial = student?.name?.[0]?.toUpperCase() ?? "S";

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

          <button
            style={activeTab === "discover" ? navBtnActive : navBtnIdle}
            onClick={() => setActiveTab("discover")}
            onMouseEnter={e => { if (activeTab !== "discover") e.currentTarget.style.color = "#94a3b8"; }}
            onMouseLeave={e => { if (activeTab !== "discover") e.currentTarget.style.color = "#64748b"; }}
          >
            🏠 Discover
          </button>

          <button
            style={activeTab === "myregistrations" ? navBtnActive : navBtnIdle}
            onClick={() => setActiveTab("myregistrations")}
            onMouseEnter={e => { if (activeTab !== "myregistrations") e.currentTarget.style.color = "#94a3b8"; }}
            onMouseLeave={e => { if (activeTab !== "myregistrations") e.currentTarget.style.color = "#64748b"; }}
          >
            🎫 My Events
            {registeredEvents.length > 0 && (
              <span style={{
                background: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 700,
                borderRadius: 999, padding: "1px 6px", marginLeft: 2,
              }}>{registeredEvents.length}</span>
            )}
          </button>

          <button
            style={activeTab === "profile" ? navBtnActive : navBtnIdle}
            onClick={() => setActiveTab("profile")}
            onMouseEnter={e => { if (activeTab !== "profile") e.currentTarget.style.color = "#94a3b8"; }}
            onMouseLeave={e => { if (activeTab !== "profile") e.currentTarget.style.color = "#64748b"; }}
          >
            👤 Profile
          </button>
        </div>

        {/* Right: Search (discover tab only) + notifications + avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {activeTab === "discover" && (
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

        {/* ── DISCOVER TAB ── */}
        {activeTab === "discover" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "32px 32px" }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>
                Discover Events
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                Find and register for amazing events happening around you
              </p>
            </div>

            {eventsToDisplay.length === 0 ? (
              <div style={{ textAlign: "center", padding: "100px 0" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🎭</div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#475569" }}>No events found</p>
                <p style={{ fontSize: 13, color: "#334155", marginTop: 4 }}>Try a different search term</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
                {eventsToDisplay.map(event => {
                  const isRegistered = registeredEvents.some(e => Number(e.id) === Number(event.id));
                  return (
                    <div
                      key={event.id}
                      style={{
                        background: "#1e2535", borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.06)",
                        overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s",
                        display: "flex", flexDirection: "column",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.45)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      {event.image
                        ? <img src={event.image} alt={event.title} style={{ width: "100%", height: 176, objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: 130, background: "linear-gradient(135deg,#1e2535,#252d42)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46 }}>🎭</div>
                      }
                      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{event.title}</h3>
                        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b", lineHeight: 1.5, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {event.description}
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
                          <span>📍 {event.venue || "TBA"}</span>
                          <span>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}</span>
                          <span>⏰ {event.event_time || "TBA"}</span>
                          <span>👤 {event.organizer_name || "Unknown"}</span>
                        </div>
                        <button
                          onClick={() => handleRegister(event.id)}
                          disabled={isRegistered}
                          style={{
                            padding: "10px", border: "none", borderRadius: 10, width: "100%",
                            background: isRegistered
                              ? "rgba(255,255,255,0.05)"
                              : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                            color: isRegistered ? "#64748b" : "#fff",
                            fontSize: 14, fontWeight: 600,
                            cursor: isRegistered ? "default" : "pointer",
                            transition: "all 0.2s",
                            fontFamily: "'Inter',sans-serif",
                            boxShadow: isRegistered ? "none" : "0 2px 12px rgba(99,102,241,0.25)",
                          }}
                          onMouseEnter={e => { if (!isRegistered) e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.4)"; }}
                          onMouseLeave={e => { if (!isRegistered) e.currentTarget.style.boxShadow = "0 2px 12px rgba(99,102,241,0.25)"; }}
                        >
                          {isRegistered ? "✅ Registered" : "Register Now"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MY REGISTRATIONS TAB ── */}
        {activeTab === "myregistrations" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "32px 32px" }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>My Registered Events</h1>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                {registeredEvents.length} event{registeredEvents.length !== 1 ? "s" : ""} registered
              </p>
            </div>

            {registeredEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "100px 0" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#475569" }}>No registrations yet</p>
                <p style={{ fontSize: 13, color: "#334155", marginTop: 4 }}>Head to Discover to find events</p>
                <button
                  onClick={() => setActiveTab("discover")}
                  style={{
                    marginTop: 20, padding: "10px 24px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color: "#fff", fontSize: 14, fontWeight: 600,
                    cursor: "pointer", fontFamily: "'Inter',sans-serif",
                  }}
                >
                  🏠 Browse Events
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 20 }}>
                {registeredEvents.map(event => (
                  <div
                    key={event.id}
                    style={{
                      background: "#1e2535", borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.06)",
                      overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.35)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    {/* Event banner */}
                    {event.image
                      ? <img src={event.image} alt={event.title} style={{ width: "100%", height: 140, objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: 100, background: "linear-gradient(135deg,#252d42,#2d3654)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🎫</div>
                    }
                    <div style={{ padding: "16px" }}>
                      <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{event.title}</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
                        <span>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}</span>
                        <span>📍 {event.venue || "TBA"}</span>
                        <span>⏰ {event.event_time || "TBA"}</span>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button
                          onClick={() => downloadTicket(event.id)}
                          style={{
                            padding: "9px 14px", borderRadius: 9,
                            background: "rgba(99,102,241,0.1)", color: "#a5b4fc",
                            border: "1px solid rgba(99,102,241,0.2)",
                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                            transition: "all 0.2s", fontFamily: "'Inter',sans-serif",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.2)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; }}
                        >
                          🎫 Download Ticket
                        </button>

                        <div style={{ display: "flex", gap: 8 }}>
                          <a
                            href={getGoogleCalendarUrl(event)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ flex: 1, textDecoration: "none" }}
                          >
                            <button style={{
                              width: "100%", padding: "9px 10px", borderRadius: 9,
                              background: "rgba(245,158,11,0.1)", color: "#fbbf24",
                              border: "1px solid rgba(245,158,11,0.2)",
                              fontSize: 13, fontWeight: 600, cursor: "pointer",
                              transition: "all 0.2s", fontFamily: "'Inter',sans-serif",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                            }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.2)"; e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(245,158,11,0.1)"; e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)"; }}
                            >
                              📅 Add to Calendar
                            </button>
                          </a>

                          <button
                            onClick={() => setActiveChat({
                              eventId: event.id,
                              otherUserId: event.organizer_id,
                              otherName: event.organizer_name,
                            })}
                            style={{
                              flex: 1, padding: "9px 10px", borderRadius: 9,
                              background: "rgba(16,185,129,0.1)", color: "#34d399",
                              border: "1px solid rgba(16,185,129,0.2)",
                              fontSize: 13, fontWeight: 600, cursor: "pointer",
                              transition: "all 0.2s", fontFamily: "'Inter',sans-serif",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.2)"; e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,185,129,0.1)"; e.currentTarget.style.borderColor = "rgba(16,185,129,0.2)"; }}
                          >
                            💬 Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "32px 32px" }}>
            {student ? (
              <>
                {/* Profile hero */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 28,
                  background: "#1e2535", padding: "32px 36px", borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.06)", marginBottom: 40,
                }}>
                  <div style={{
                    width: 88, height: 88, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 36, fontWeight: 800, color: "#fff",
                    boxShadow: "0 0 0 4px rgba(99,102,241,0.2)",
                  }}>
                    {student.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>
                      {student.name}
                    </h2>
                    <p style={{ margin: "0 0 12px", fontSize: 14, color: "#94a3b8" }}>{student.email}</p>
                    <span style={{
                      display: "inline-flex", alignItems: "center",
                      background: "rgba(99,102,241,0.15)", color: "#a5b4fc",
                      padding: "4px 14px", borderRadius: 999,
                      fontSize: 12, fontWeight: 600,
                    }}>
                      🎓 Student Account
                    </span>
                  </div>

                  {/* Stats */}
                  <div style={{ marginLeft: "auto", display: "flex", gap: 24 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 30, fontWeight: 800, color: "#a5b4fc" }}>
                        {registeredEvents.length}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Registered</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 30, fontWeight: 800, color: "#34d399" }}>
                        {allEvents.length}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Available</div>
                    </div>
                  </div>
                </div>

                {/* Upcoming registered events */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>
                    My Registrations
                  </h3>
                  <button
                    onClick={() => setActiveTab("myregistrations")}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "none",
                      background: "rgba(99,102,241,0.12)", color: "#a5b4fc",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      fontFamily: "'Inter',sans-serif",
                    }}
                  >View all →</button>
                </div>

                {registeredEvents.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 0" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: "#475569" }}>No registrations yet</p>
                    <button
                      onClick={() => setActiveTab("discover")}
                      style={{
                        marginTop: 16, padding: "9px 22px", borderRadius: 10, border: "none",
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        color: "#fff", fontSize: 13, fontWeight: 600,
                        cursor: "pointer", fontFamily: "'Inter',sans-serif",
                      }}
                    >🏠 Discover Events</button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
                    {registeredEvents.slice(0, 6).map(event => (
                      <div key={event.id} style={{
                        background: "#1e2535", borderRadius: 14,
                        border: "1px solid rgba(255,255,255,0.06)",
                        padding: "16px", display: "flex", gap: 14, alignItems: "flex-start",
                        transition: "border-color 0.2s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
                      >
                        {event.image
                          ? <img src={event.image} alt={event.title} style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                          : <div style={{ width: 60, height: 60, borderRadius: 10, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🎭</div>
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {event.title}
                          </h4>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString() : "TBA"}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>📍 {event.venue || "TBA"}</div>
                          <button
                            onClick={() => downloadTicket(event.id)}
                            style={{
                              marginTop: 10, padding: "4px 10px", borderRadius: 6,
                              background: "rgba(99,102,241,0.1)", color: "#a5b4fc",
                              border: "1px solid rgba(99,102,241,0.2)",
                              fontSize: 11, fontWeight: 600, cursor: "pointer",
                              fontFamily: "'Inter',sans-serif",
                            }}
                          >🎫 Download Ticket</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "100px 0", color: "#475569" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                <p>Loading profile…</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ CHAT MODAL ═══ */}
      {activeChat && (
        <div style={{
          position: "fixed", inset: 0,
          backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.45)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 300,
        }}>
          <div style={{
            background: "#1e2535", width: 460, height: 600,
            borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)",
            padding: 16, boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}>
            <ChatWindow
              eventId={activeChat.eventId}
              otherUserId={activeChat.otherUserId}
              otherName={activeChat.otherName}
              currentUserId={Number(student?.id)}
              onClose={() => setActiveChat(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
