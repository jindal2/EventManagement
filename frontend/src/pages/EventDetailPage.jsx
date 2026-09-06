import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";
import NotificationBell from "../components/NotificationBell";

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [event, setEvent] = useState(null);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [activeChat, setActiveChat] = useState(null);

  const organizerId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch event");
      setEvent(data.event);
      setRegisteredStudents(data.registeredStudents || []);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!window.confirm("Are you sure? This will permanently delete the event.")) return;
    setLoadingDelete(true);
    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: deleteReason?.trim() || null }),
      });
      const data = await res.json();
      setLoadingDelete(false);
      if (!res.ok) throw new Error(data.msg || "Failed to delete");
      setShowDeleteModal(false);
      navigate("/organizer");
    } catch (err) {
      setLoadingDelete(false);
      alert("Error: " + err.message);
    }
  };

  if (!event) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f1117", color: "#64748b", fontFamily: "'Inter',sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <p>Loading event...</p>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", height: "100vh", background: "#0f1117", fontFamily: "'Inter',sans-serif", color: "#f1f5f9" }}>

        {/* Sidebar */}
        <div style={{
          width: 240, background: "#161b27",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "24px 16px",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎪</div>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>EventHub</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <NotificationBell />
              <button onClick={() => navigate("/organizer")} style={navBtn(false)}>🏠 Dashboard</button>
              <button onClick={() => navigate("/organizer/create-event")} style={navBtn(false)}>➕ Create Event</button>
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate("/"); }} style={{ padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", color: "#ef4444", fontSize: 14, fontWeight: 500, cursor: "pointer", textAlign: "left" }}>
            🚪 Logout
          </button>
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          {/* Back button */}
          <button
            onClick={() => navigate("/organizer")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent", color: "#94a3b8", fontSize: 13, fontWeight: 500,
              cursor: "pointer", marginBottom: 24, transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f1f5f9"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            ← Back to Dashboard
          </button>

          {/* Event Card */}
          <div style={{ background: "#1e2535", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 24 }}>
            {event.image && (
              <img src={event.image} alt={event.title} style={{ width: "100%", height: 300, objectFit: "cover" }} />
            )}
            <div style={{ padding: "28px 32px" }}>
              <h1 style={{ margin: "0 0 10px", fontSize: 32, fontWeight: 800, color: "#f1f5f9" }}>{event.title}</h1>
              <p style={{ margin: "0 0 24px", fontSize: 15, color: "#94a3b8", lineHeight: 1.7 }}>{event.description}</p>

              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 28 }}>
                {[
                  { icon: "📍", label: "Venue", value: event.venue || "Not specified" },
                  { icon: "📅", label: "Date", value: event.event_date ? new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Not specified" },
                  { icon: "⏰", label: "Time", value: event.event_time || "Not specified" },
                ].map(item => (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 16px", minWidth: 140 }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{item.icon} {item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Registered count */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 10, padding: "10px 16px", marginBottom: 24,
              }}>
                <span style={{ fontSize: 22 }}>👥</span>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#a5b4fc" }}>{registeredStudents.length}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Students Registered</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    padding: "10px 20px", border: "none", borderRadius: 10,
                    background: "rgba(239,68,68,0.1)", color: "#f87171",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    border: "1px solid rgba(239,68,68,0.2)", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                >
                  🗑 Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Registered Students */}
        <div style={{
          width: 320, background: "#161b27",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          padding: "28px 20px", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>
              Registered Students
            </h2>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.1)", borderRadius: 6, padding: "3px 10px", fontSize: 12, color: "#a5b4fc", fontWeight: 700 }}>
              {registeredStudents.length} registered
            </div>
          </div>

          {registeredStudents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#334155" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>👤</div>
              <p style={{ fontSize: 13, margin: 0 }}>No registrations yet</p>
              <p style={{ fontSize: 12, color: "#1e293b", margin: "4px 0 0" }}>Students will appear here once they register</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {registeredStudents.map(s => (
                <div key={s.id} style={{
                  background: "#1e2535", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.05)",
                  padding: "14px", display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%",
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0,
                    }}>
                      {s.name ? s.name[0].toUpperCase() : "?"}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveChat({ eventId: event.id, otherUserId: s.id, otherName: s.name })}
                    style={{
                      padding: "6px 10px", border: "none", borderRadius: 8,
                      background: "rgba(99,102,241,0.15)", color: "#a5b4fc",
                      fontSize: 13, cursor: "pointer", flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                    title={`Chat with ${s.name}`}
                  >
                    💬
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="fade-in" style={{ background: "#1e2535", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", padding: "32px", width: "100%", maxWidth: 440 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Delete Event</h3>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "#64748b" }}>This action cannot be undone. All registrations will be lost.</p>
            <textarea
              value={deleteReason}
              onChange={e => setDeleteReason(e.target.value)}
              placeholder="Optional: Reason for deleting..."
              style={{
                width: "100%", padding: "12px", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, background: "rgba(255,255,255,0.04)", color: "#f1f5f9",
                fontSize: 14, resize: "none", fontFamily: "'Inter',sans-serif",
                boxSizing: "border-box", marginBottom: 20,
              }}
              rows={3}
            />
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: "10px 20px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, background: "transparent", color: "#94a3b8", fontSize: 14, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loadingDelete}
                style={{ padding: "10px 20px", border: "none", borderRadius: 10, background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                {loadingDelete ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {activeChat && (
        <div style={{ position: "fixed", inset: 0, backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
          <div style={{ background: "#1e2535", width: 450, height: 600, borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", padding: 16 }}>
            <ChatWindow
              eventId={activeChat.eventId}
              otherUserId={activeChat.otherUserId}
              otherName={activeChat.otherName}
              currentUserId={Number(organizerId)}
              onClose={() => setActiveChat(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}

const navBtn = (active) => ({
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px", borderRadius: 8, border: "none",
  background: active ? "rgba(99,102,241,0.15)" : "transparent",
  color: active ? "#a5b4fc" : "#64748b",
  fontSize: 14, fontWeight: 500, cursor: "pointer",
  width: "100%", textAlign: "left", transition: "all 0.2s",
});

export default EventDetailPage;