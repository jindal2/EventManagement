import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import ChatWindow from "../components/ChatWindow";

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

function StudentDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allEvents, setAllEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
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
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events/registered", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch registered events");
      setRegisteredEvents(data.events || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentInfo = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch profile");
      setStudent(data.user);
    } catch (err) {
      console.error(err);
    }
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
            Student
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <NotificationBell />
            <button style={S.navBtn(activeTab === "home")} onClick={() => setActiveTab("home")}>🏠 Home</button>
            <button style={S.navBtn(activeTab === "profile")} onClick={() => setActiveTab("profile")}>👤 Profile</button>
          </div>
        </div>
        <button style={S.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {activeTab === "home" && (
          <>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0f1117" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Discover Events</h1>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Find and register for amazing events</p>
              </div>
              <input type="text" placeholder="🔍 Search events..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#f1f5f9", fontSize: 14, outline: "none", width: 260, fontFamily: "'Inter',sans-serif" }} />
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              {eventsToDisplay.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#334155" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎭</div>
                  <p style={{ fontSize: 16, fontWeight: 500 }}>No events found</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
                  {eventsToDisplay.map(event => {
                    const isRegistered = registeredEvents.some(e => Number(e.id) === Number(event.id));
                    return (
                      <div key={event.id} style={{ background: "#1e2535", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", transition: "transform 0.2s", display: "flex", flexDirection: "column" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                        {event.image ? (
                          <img src={event.image} alt={event.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: 140, background: "linear-gradient(135deg,#1e2535,#252d42)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🎭</div>
                        )}
                        <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                          <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: "#f1f5f9" }}>{event.title}</h3>
                          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b", lineHeight: 1.5, flex: 1 }}>{event.description}</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
                            <span>📍 {event.venue || "TBA"}</span>
                            <span>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}</span>
                            <span>⏰ {event.event_time || "TBA"}</span>
                          </div>
                          <button
                            onClick={() => handleRegister(event.id)}
                            disabled={isRegistered}
                            style={{
                              padding: "10px", border: "none", borderRadius: 10, width: "100%",
                              background: isRegistered ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                              color: isRegistered ? "#64748b" : "#fff", fontSize: 14, fontWeight: 600,
                              cursor: isRegistered ? "default" : "pointer", transition: "all 0.2s"
                            }}
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
          </>
        )}

        {activeTab === "profile" && student && (
          <div style={{ flex: 1, overflowY: "auto", padding: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 48, background: "#1e2535", padding: "32px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700, color: "#fff" }}>
                {student.name[0].toUpperCase()}
              </div>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: 32, fontWeight: 800, color: "#f1f5f9" }}>{student.name}</h2>
                <p style={{ margin: 0, fontSize: 16, color: "#94a3b8" }}>{student.email}</p>
                <div style={{ marginTop: 12, display: "inline-flex", background: "rgba(99,102,241,0.15)", color: "#a5b4fc", padding: "4px 12px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>Student Account</div>
              </div>
            </div>

            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>My Registrations</h3>
            {registeredEvents.length === 0 ? (
              <p style={{ color: "#64748b" }}>You haven't registered for any events yet.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 24 }}>
                {registeredEvents.map(event => (
                  <div key={event.id} style={{ background: "#1e2535", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", padding: "20px" }}>
                    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                      {event.image ? (
                        <img src={event.image} alt={event.title} style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: 80, height: 80, borderRadius: 12, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🎭</div>
                      )}
                      <div>
                        <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600 }}>{event.title}</h4>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString() : "TBA"}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>📍 {event.venue || "TBA"}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button onClick={() => downloadTicket(event.id)} style={{ padding: "8px", background: "rgba(99,102,241,0.1)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(99,102,241,0.2)"} onMouseLeave={e => e.currentTarget.style.background="rgba(99,102,241,0.1)"}>
                        🎫 Download Ticket
                      </button>
                      <a href={getGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button style={{ width: "100%", padding: "8px", background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(245,158,11,0.2)"} onMouseLeave={e => e.currentTarget.style.background="rgba(245,158,11,0.1)"}>
                          📅 Add to Calendar
                        </button>
                      </a>
                      <button onClick={() => setActiveChat({ eventId: event.id, otherUserId: event.organizer_id, otherName: event.organizer_name })} style={{ padding: "8px", background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(16,185,129,0.2)"} onMouseLeave={e => e.currentTarget.style.background="rgba(16,185,129,0.1)"}>
                        💬 Chat with Organizer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Panel - Quick Access (only on home tab) */}
      {activeTab === "home" && (
        <div style={{ width: 300, background: "#161b27", borderLeft: "1px solid rgba(255,255,255,0.06)", padding: "24px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>My Upcoming Events</h2>
          {registeredEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#334155" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
              <p style={{ fontSize: 13 }}>Not registered yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {registeredEvents.slice(0, 5).map(event => (
                <div key={event.id} style={{ background: "#252d42", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", padding: "14px" }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{event.title}</h4>
                  <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", flexDirection: "column", gap: 4 }}>
                    <span>📅 {event.event_date ? new Date(event.event_date).toLocaleDateString() : "TBA"}</span>
                    <span>📍 {event.venue || "TBA"}</span>
                  </div>
                  <button onClick={() => downloadTicket(event.id)} style={{ marginTop: 10, padding: "4px 10px", background: "rgba(99,102,241,0.1)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", width: "100%" }}>
                    🎫 Download Ticket
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat Modal */}
      {activeChat && (
        <div style={{ position: "fixed", inset: 0, backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
          <div style={{ background: "#1e2535", width: 450, height: 600, borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", padding: 16 }}>
            <ChatWindow eventId={activeChat.eventId} otherUserId={activeChat.otherUserId} otherName={activeChat.otherName} currentUserId={Number(student?.id)} onClose={() => setActiveChat(null)} />
          </div>
        </div>
      )}

    </div>
  );
}

export default StudentDashboard;
