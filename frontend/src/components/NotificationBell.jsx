import { useEffect, useState, useRef } from "react";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/read/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => markAsRead(n.id)));
  };

  useEffect(() => {
    fetchNotifications();
    // poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          position: "relative",
          width: 36, height: 36,
          borderRadius: 9,
          border: open
            ? "1px solid rgba(99,102,241,0.5)"
            : "1px solid rgba(255,255,255,0.08)",
          background: open
            ? "rgba(99,102,241,0.15)"
            : "rgba(255,255,255,0.04)",
          color: open ? "#a5b4fc" : "#94a3b8",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, transition: "all 0.2s",
          fontFamily: "'Inter', sans-serif",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "#f1f5f9";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.color = "#94a3b8";
          }
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#ef4444", color: "#fff",
            fontSize: 10, fontWeight: 700,
            borderRadius: 999, minWidth: 17, height: 17,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px", border: "2px solid #161b27",
            fontFamily: "'Inter', sans-serif",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown — anchored to the RIGHT so it never overflows */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 10px)",
          right: 0,           // ← key fix: align to right edge of bell
          width: 340,
          background: "#1e2535",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
          zIndex: 9999,
          overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{
                  background: "rgba(99,102,241,0.2)", color: "#a5b4fc",
                  fontSize: 11, fontWeight: 700,
                  borderRadius: 999, padding: "1px 7px",
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: "none", border: "none",
                  color: "#6366f1", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'Inter', sans-serif",
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: "auto", padding: "8px" }}>
            {notifications.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "36px 0",
                color: "#475569",
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔕</div>
                <p style={{ margin: 0, fontSize: 13 }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((note) => (
                <div
                  key={note.id}
                  onClick={() => markAsRead(note.id)}
                  style={{
                    padding: "12px 12px",
                    borderRadius: 10,
                    marginBottom: 4,
                    cursor: note.is_read ? "default" : "pointer",
                    background: note.is_read
                      ? "transparent"
                      : "rgba(99,102,241,0.08)",
                    border: note.is_read
                      ? "1px solid transparent"
                      : "1px solid rgba(99,102,241,0.15)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!note.is_read)
                      e.currentTarget.style.background = "rgba(99,102,241,0.14)";
                  }}
                  onMouseLeave={(e) => {
                    if (!note.is_read)
                      e.currentTarget.style.background = "rgba(99,102,241,0.08)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    {/* dot */}
                    {!note.is_read && (
                      <div style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "#6366f1", marginTop: 5, flexShrink: 0,
                      }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: "0 0 4px",
                        fontSize: 13, fontWeight: note.is_read ? 400 : 600,
                        color: note.is_read ? "#94a3b8" : "#f1f5f9",
                        lineHeight: 1.4,
                        wordBreak: "break-word",
                      }}>
                        {note.message}
                      </p>
                      {note.data?.reason && (
                        <p style={{
                          margin: "0 0 4px",
                          fontSize: 12, color: "#fca5a5",
                          fontStyle: "italic",
                        }}>
                          Reason: {note.data.reason}
                        </p>
                      )}
                      <span style={{ fontSize: 11, color: "#475569" }}>
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
