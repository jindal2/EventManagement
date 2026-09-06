import { useState, useEffect } from "react";
import AuthModal from "../components/AuthModal";

const FEATURES = [
  { icon: "🔍", title: "Discover Events", desc: "Browse cultural fests, hackathons, workshops and speaker sessions — all in one feed.", color: "#6366f1" },
  { icon: "🎫", title: "One-Click Register", desc: "Register instantly and download a personalized PDF ticket with QR code.", color: "#8b5cf6" },
  { icon: "💬", title: "Chat with Organizers", desc: "Real-time messaging between students and organizers for instant support.", color: "#ec4899" },
  { icon: "🔔", title: "Smart Notifications", desc: "Get notified about registrations, event updates, and messages in real time.", color: "#f59e0b" },
  { icon: "📅", title: "Google Calendar Sync", desc: "Add events directly to your Google Calendar with a single tap.", color: "#10b981" },
  { icon: "✨", title: "AI Descriptions", desc: "Organizers can generate or optimize event descriptions powered by Gemini AI.", color: "#06b6d4" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma",  role: "CS Student",      avatar: "P", text: "Found TEDx through EventHub and registered in seconds. The ticket download was seamless!",         color: "#6366f1" },
  { name: "Rahul Mehta",   role: "Event Organizer", avatar: "R", text: "The AI description generator saved me hours. My event got 3× more registrations!",                color: "#8b5cf6" },
  { name: "Ananya Singh",  role: "MBA Student",     avatar: "A", text: "I love the Google Calendar sync. Never miss an event I've registered for now.",                   color: "#ec4899" },
];

const STATS = [
  { value: "50+",  label: "Active Events", icon: "🎪" },
  { value: "2K+",  label: "Students",      icon: "🎓" },
  { value: "100+", label: "Organizers",    icon: "🏆" },
  { value: "98%",  label: "Satisfaction",  icon: "⭐" },
];

const TAG_COLORS = {
  cultural:  "#ec4899",
  hackathon: "#6366f1",
  speaker:   "#f59e0b",
  sports:    "#10b981",
  workshop:  "#8b5cf6",
  tech:      "#06b6d4",
  default:   "#94a3b8",
};

function tagColor(tag = "") {
  return TAG_COLORS[tag.toLowerCase()] ?? TAG_COLORS.default;
}

function EventCard({ event, onRegister }) {
  const c = tagColor(event.tag || event.category || "");
  const dateStr = event.event_date
    ? new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "TBA";

  return (
    <div
      style={{
        background: "rgba(22,27,39,0.85)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 18, overflow: "hidden",
        display: "flex", flexDirection: "column",
        transition: "transform 0.25s, box-shadow 0.25s, border-color 0.25s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.borderColor = `${c}50`;
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.35)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top color bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${c}, ${c}55)`, flexShrink: 0 }} />

      {/* Image or placeholder */}
      {event.image
        ? <img src={event.image} alt={event.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
        : (
          <div style={{
            height: 120, background: `linear-gradient(135deg, ${c}18, ${c}08)`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48,
          }}>🎭</div>
        )
      }

      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Tag badge */}
        {(event.tag || event.category) && (
          <span style={{
            alignSelf: "flex-start", fontSize: 10, fontWeight: 700,
            padding: "3px 10px", borderRadius: 999,
            background: `${c}18`, color: c, border: `1px solid ${c}30`,
            marginBottom: 10, letterSpacing: "0.03em",
          }}>
            {(event.tag || event.category).toUpperCase()}
          </span>
        )}

        <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.3 }}>
          {event.title}
        </h3>

        {event.description && (
          <p style={{
            margin: "0 0 12px", fontSize: 13, color: "#64748b", lineHeight: 1.55,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            flex: 1,
          }}>{event.description}</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#64748b", marginBottom: 16 }}>
          <span>📅 {dateStr}</span>
          <span>📍 {event.venue || "TBA"}</span>
          {event.organizer_name && <span>👤 {event.organizer_name}</span>}
        </div>

        <button
          onClick={onRegister}
          style={{
            padding: "9px 0", border: `1px solid ${c}40`,
            borderRadius: 10, background: `${c}15`, color: c,
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Inter', sans-serif", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${c}28`; e.currentTarget.style.borderColor = `${c}70`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${c}15`; e.currentTarget.style.borderColor = `${c}40`; }}
        >Register →</button>
      </div>
    </div>
  );
}

export default function Landing() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [realEvents, setRealEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(p => (p + 1) % FEATURES.length), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/events/public")
      .then(r => r.json())
      .then(d => { setRealEvents(d.events || []); setEventsLoading(false); })
      .catch(() => setEventsLoading(false));
  }, []);

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "#0f1117", color: "#f1f5f9",
      fontFamily: "'Inter', sans-serif", position: "relative", overflowX: "hidden",
    }}>

      {/* ── grid bg ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(99,102,241,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.025) 1px,transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* ── glow orbs ── */}
      <div style={{ position:"fixed", top:"-10%", left:"15%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.14) 0%,transparent 65%)", pointerEvents:"none", zIndex:0, transform:`translateY(${scrollY*0.1}px)` }} />
      <div style={{ position:"fixed", top:"35%", right:"-5%",  width:480, height:480, borderRadius:"50%", background:"radial-gradient(circle,rgba(236,72,153,0.09) 0%,transparent 65%)",  pointerEvents:"none", zIndex:0, transform:`translateY(${scrollY*-0.07}px)` }} />

      {/* ══ NAVBAR ══ */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 48px", height:64,
        borderBottom:"1px solid rgba(255,255,255,0.05)",
        position:"sticky", top:0, zIndex:100,
        background:"rgba(15,17,23,0.85)", backdropFilter:"blur(20px)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🎪</div>
          <span style={{ fontSize:18,fontWeight:800,color:"#f1f5f9",letterSpacing:"-0.02em" }}>EventHub</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={() => setIsModalOpen(true)} style={{ padding:"8px 20px",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,background:"transparent",color:"#94a3b8",fontSize:14,fontWeight:500,cursor:"pointer",transition:"all 0.2s",fontFamily:"'Inter',sans-serif" }}
            onMouseEnter={e=>{e.currentTarget.style.color="#f1f5f9";e.currentTarget.style.borderColor="rgba(255,255,255,0.25)";}}
            onMouseLeave={e=>{e.currentTarget.style.color="#94a3b8";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}>
            Log In
          </button>
          <button onClick={() => setIsModalOpen(true)} style={{ padding:"8px 20px",border:"none",borderRadius:9,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",transition:"all 0.2s",fontFamily:"'Inter',sans-serif",boxShadow:"0 2px 12px rgba(99,102,241,0.35)" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 20px rgba(99,102,241,0.5)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 12px rgba(99,102,241,0.35)";}}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ position:"relative",zIndex:10,minHeight:"calc(100vh - 64px)",display:"flex",alignItems:"center",padding:"80px 48px",maxWidth:1280,margin:"0 auto",gap:64 }}>
        <div style={{ flex:1, maxWidth:580 }}>
          {/* badge */}
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:999,padding:"6px 16px",fontSize:13,color:"#a5b4fc",fontWeight:500,marginBottom:28 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"#6366f1",display:"inline-block",boxShadow:"0 0 8px #6366f1" }} />
            Your college event platform — now live
          </div>

          <h1 style={{ fontSize:"clamp(2.8rem,5vw,4.2rem)",fontWeight:900,lineHeight:1.05,margin:"0 0 24px",letterSpacing:"-0.04em",color:"#f1f5f9" }}>
            Campus life,<br/>
            <span style={{ background:"linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>elevated.</span>
          </h1>

          <p style={{ fontSize:18,color:"#64748b",lineHeight:1.75,margin:"0 0 40px",maxWidth:480 }}>
            Discover hackathons, cultural fests, workshops and more. Register in one click, chat with organizers, and never miss what matters on campus.
          </p>

          <div style={{ display:"flex",gap:12,flexWrap:"wrap",marginBottom:56 }}>
            <button onClick={() => setIsModalOpen(true)} style={{ padding:"14px 32px",border:"none",borderRadius:12,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 24px rgba(99,102,241,0.4)",transition:"all 0.25s",fontFamily:"'Inter',sans-serif" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 36px rgba(99,102,241,0.55)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 24px rgba(99,102,241,0.4)";}}>
              Start for free →
            </button>
            <button onClick={() => setIsModalOpen(true)} style={{ padding:"14px 28px",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,background:"rgba(255,255,255,0.04)",color:"#94a3b8",fontSize:16,fontWeight:600,cursor:"pointer",transition:"all 0.25s",fontFamily:"'Inter',sans-serif" }}
              onMouseEnter={e=>{e.currentTarget.style.color="#f1f5f9";e.currentTarget.style.borderColor="rgba(255,255,255,0.2)";e.currentTarget.style.background="rgba(255,255,255,0.07)";}}
              onMouseLeave={e=>{e.currentTarget.style.color="#94a3b8";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.background="rgba(255,255,255,0.04)";}}>
              I'm an Organizer
            </button>
          </div>

          {/* stats */}
          <div style={{ display:"flex", gap:0 }}>
            {STATS.map((s,i) => (
              <div key={s.label} style={{ paddingRight:i<STATS.length-1?28:0,marginRight:i<STATS.length-1?28:0,borderRight:i<STATS.length-1?"1px solid rgba(255,255,255,0.07)":"none" }}>
                <div style={{ fontSize:22,fontWeight:800,color:"#f1f5f9",letterSpacing:"-0.02em" }}>{s.icon} {s.value}</div>
                <div style={{ fontSize:12,color:"#475569",marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* hero right panel */}
        <div style={{ flex:1,position:"relative",height:520,display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={{ width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.18) 0%,rgba(139,92,246,0.08) 50%,transparent 70%)",position:"absolute" }} />
          <div style={{ position:"relative",zIndex:5,background:"linear-gradient(145deg,#1e2535,#252d42)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:20,padding:"22px 26px",width:240,boxShadow:"0 20px 60px rgba(0,0,0,0.5),0 0 40px rgba(99,102,241,0.1)" }}>
            <span style={{ fontSize:40 }}>💻</span>
            <h3 style={{ margin:"12px 0 4px",fontSize:16,fontWeight:700,color:"#f1f5f9" }}>HackStack 6.0</h3>
            <p style={{ margin:"0 0 12px",fontSize:12,color:"#64748b" }}>CS Block • Nov 3, 2026</p>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
              <span style={{ fontSize:11,color:"#a5b4fc",background:"rgba(99,102,241,0.15)",padding:"3px 10px",borderRadius:999,fontWeight:600 }}>Hackathon</span>
              <span style={{ fontSize:11,color:"#34d399",fontWeight:600 }}>● Open</span>
            </div>
            <button onClick={() => setIsModalOpen(true)} style={{ width:"100%",padding:"9px",border:"none",borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>Register Now</button>
          </div>
          {/* floating pill badges */}
          <div style={{ position:"absolute",top:40,left:"0%",background:"rgba(30,37,53,0.9)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 14px",boxShadow:"0 8px 28px rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#f1f5f9" }}>🎭 Cultural Fest</div>
            <div style={{ fontSize:10,color:"#64748b",marginTop:2 }}>Main Auditorium · Oct 12</div>
          </div>
          <div style={{ position:"absolute",top:30,right:"0%",background:"rgba(30,37,53,0.9)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 14px",transform:"rotate(3deg)",boxShadow:"0 8px 28px rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#f1f5f9" }}>🎤 TEDx Campus</div>
            <div style={{ fontSize:10,color:"#64748b",marginTop:2 }}>Convention Hall · Nov 18</div>
          </div>
          <div style={{ position:"absolute",bottom:60,left:"0%",background:"rgba(30,37,53,0.9)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 14px",transform:"rotate(-2deg)",boxShadow:"0 8px 28px rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#f1f5f9" }}>🏆 Sports Carnival</div>
            <div style={{ fontSize:10,color:"#64748b",marginTop:2 }}>Stadium · Dec 5</div>
          </div>
          <div style={{ position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:999,padding:"5px 14px",display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#34d399",fontWeight:600,whiteSpace:"nowrap" }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"#10b981",display:"inline-block",boxShadow:"0 0 8px #10b981" }} />
            Live registrations open
          </div>
        </div>
      </section>

      {/* ══ MARQUEE STRIP ══ */}
      <div style={{ position:"relative",zIndex:10,borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(22,27,39,0.6)",padding:"12px 0",overflow:"hidden" }}>
        <div style={{ display:"flex",gap:48,animation:"marquee 22s linear infinite",width:"max-content" }}>
          {[...FEATURES,...FEATURES].map((f,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
              <span style={{ fontSize:16 }}>{f.icon}</span>
              <span style={{ fontSize:13,fontWeight:600,color:"#64748b",whiteSpace:"nowrap" }}>{f.title}</span>
              <span style={{ width:4,height:4,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"inline-block" }} />
            </div>
          ))}
        </div>
      </div>

      {/* ══ FEATURES ══ */}
      <section style={{ position:"relative",zIndex:10,padding:"100px 48px",maxWidth:1280,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:64 }}>
          <div style={{ display:"inline-block",background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:999,padding:"5px 16px",fontSize:12,color:"#a5b4fc",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:16 }}>Everything you need</div>
          <h2 style={{ fontSize:"clamp(2rem,4vw,3rem)",fontWeight:800,margin:"0 0 16px",letterSpacing:"-0.03em",color:"#f1f5f9" }}>Built for campus life</h2>
          <p style={{ fontSize:17,color:"#64748b",maxWidth:480,margin:"0 auto",lineHeight:1.7 }}>Every feature designed around how students and organizers actually use events.</p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:24 }}>
          {FEATURES.map((f,i) => (
            <div key={f.title}
              style={{ background:activeFeature===i?"linear-gradient(145deg,rgba(30,37,53,0.95),rgba(37,45,66,0.8))":"rgba(22,27,39,0.6)",border:activeFeature===i?`1px solid ${f.color}40`:"1px solid rgba(255,255,255,0.05)",borderRadius:18,padding:"28px 26px",transition:"all 0.35s",cursor:"default",boxShadow:activeFeature===i?`0 8px 32px ${f.color}18`:"none" }}
              onMouseEnter={() => setActiveFeature(i)}
            >
              <div style={{ width:46,height:46,borderRadius:12,background:`${f.color}18`,border:`1px solid ${f.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:16 }}>{f.icon}</div>
              <h3 style={{ margin:"0 0 8px",fontSize:16,fontWeight:700,color:"#f1f5f9" }}>{f.title}</h3>
              <p style={{ margin:0,fontSize:14,color:"#64748b",lineHeight:1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ REAL EVENTS ══ */}
      <section style={{ position:"relative",zIndex:10,padding:"0 48px 100px",maxWidth:1280,margin:"0 auto" }}>
        <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:40 }}>
          <div>
            <div style={{ fontSize:12,color:"#a5b4fc",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:8 }}>Happening soon</div>
            <h2 style={{ margin:0,fontSize:"clamp(1.8rem,3vw,2.5rem)",fontWeight:800,letterSpacing:"-0.03em",color:"#f1f5f9" }}>Upcoming Events</h2>
          </div>
          <button onClick={() => setIsModalOpen(true)} style={{ padding:"10px 22px",border:"1px solid rgba(99,102,241,0.3)",borderRadius:10,background:"rgba(99,102,241,0.08)",color:"#a5b4fc",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(99,102,241,0.18)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(99,102,241,0.08)"}>
            View all →
          </button>
        </div>

        {eventsLoading ? (
          /* skeleton */
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:24 }}>
            {[...Array(6)].map((_,i) => (
              <div key={i} style={{ background:"rgba(22,27,39,0.6)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:18,height:280,animation:"pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : realEvents.length === 0 ? (
          <div style={{ textAlign:"center",padding:"80px 0",color:"#334155" }}>
            <div style={{ fontSize:52,marginBottom:16 }}>📭</div>
            <p style={{ fontSize:16,fontWeight:600,color:"#475569" }}>No events yet</p>
            <p style={{ fontSize:13,color:"#334155",marginTop:4 }}>Be the first organizer to create one!</p>
            <button onClick={() => setIsModalOpen(true)} style={{ marginTop:20,padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>
              Create Event
            </button>
          </div>
        ) : (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:24 }}>
            {realEvents.map(event => (
              <EventCard key={event.id} event={event} onRegister={() => setIsModalOpen(true)} />
            ))}
          </div>
        )}
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ position:"relative",zIndex:10,padding:"100px 48px",background:"rgba(22,27,39,0.5)",borderTop:"1px solid rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth:1280,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:56 }}>
            <div style={{ fontSize:12,color:"#a5b4fc",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:10 }}>What students say</div>
            <h2 style={{ margin:0,fontSize:"clamp(1.8rem,3vw,2.5rem)",fontWeight:800,letterSpacing:"-0.03em",color:"#f1f5f9" }}>Loved by thousands</h2>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:28 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background:"rgba(30,37,53,0.85)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:20,padding:"32px 28px" }}>
                <div style={{ display:"flex",gap:3,marginBottom:18 }}>
                  {[...Array(5)].map((_,i) => <span key={i} style={{ color:"#f59e0b",fontSize:15 }}>★</span>)}
                </div>
                <p style={{ margin:"0 0 24px",fontSize:15,color:"#94a3b8",lineHeight:1.75,fontStyle:"italic" }}>"{t.text}"</p>
                <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                  <div style={{ width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${t.color},${t.color}90)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:700,color:"#fff",flexShrink:0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize:14,fontWeight:700,color:"#f1f5f9" }}>{t.name}</div>
                    <div style={{ fontSize:12,color:"#64748b",marginTop:2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section style={{ position:"relative",zIndex:10,padding:"100px 48px",maxWidth:1280,margin:"0 auto",textAlign:"center" }}>
        <div style={{ background:"linear-gradient(145deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))",border:"1px solid rgba(99,102,241,0.2)",borderRadius:28,padding:"72px 48px",position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",top:"-40%",left:"50%",transform:"translateX(-50%)",width:600,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 60%)",pointerEvents:"none" }} />
          <div style={{ position:"relative" }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:999,padding:"6px 16px",fontSize:13,color:"#a5b4fc",fontWeight:500,marginBottom:24 }}>🚀 Free forever for students</div>
            <h2 style={{ fontSize:"clamp(2rem,4vw,3.2rem)",fontWeight:900,margin:"0 0 16px",letterSpacing:"-0.04em",color:"#f1f5f9" }}>Ready to join EventHub?</h2>
            <p style={{ fontSize:17,color:"#64748b",margin:"0 0 40px",lineHeight:1.7 }}>Sign up in 30 seconds. No credit card needed.</p>
            <button onClick={() => setIsModalOpen(true)} style={{ padding:"14px 36px",border:"none",borderRadius:12,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 24px rgba(99,102,241,0.4)",transition:"all 0.25s",fontFamily:"'Inter',sans-serif" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 36px rgba(99,102,241,0.55)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 24px rgba(99,102,241,0.4)";}}>
              Create Free Account →
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ position:"relative",zIndex:10,borderTop:"1px solid rgba(255,255,255,0.05)",padding:"28px 48px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>🎪</div>
          <span style={{ fontSize:15,fontWeight:700,color:"#f1f5f9" }}>EventHub</span>
        </div>
        <p style={{ margin:0,fontSize:13,color:"#334155" }}>© 2026 EventHub. Built for campus communities.</p>
        <div style={{ display:"flex",gap:20 }}>
          {["Privacy","Terms","Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize:13,color:"#475569",textDecoration:"none",transition:"color 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.color="#94a3b8"}
              onMouseLeave={e=>e.currentTarget.style.color="#475569"}>{l}</a>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
      `}</style>

      {isModalOpen && <AuthModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />}
    </div>
  );
}
