import dotenv from "dotenv";
dotenv.config();

import express from "express";
import pkg from "pg";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import jwt from "jsonwebtoken";

import {
  register,
  login,
  sendOtp,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
} from "./controllers/authController.js";
import { verifyToken } from "./middleware/authMiddleware.js";
import {
  createEvent,
  getCreatedEvents,
  getAllEvents,
  registerForEvent,
  getEventDetails,
  deleteEvent,
  getRegisteredEvents,
} from "./controllers/eventController.js";
import { getMyProfile } from "./controllers/userController.js";
import { getNotifications, markAsRead } from "./controllers/notificationController.js";
import { downloadTicket } from "./controllers/ticketController.js";
import { getChats, getMessages } from "./controllers/chatController.js";
import { generateEventDescription } from "./controllers/aiController.js";

const { Pool } = pkg;
const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.connect()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch(err => console.error("❌ DB error:", err));

/* ══════════════════════════════════════
   AUTH ROUTES
══════════════════════════════════════ */
app.post("/api/auth/register",        register);
app.post("/api/auth/login",           login);
app.post("/api/auth/send-otp",        sendOtp);
app.post("/api/auth/verify-otp",      verifyOtp);
app.post("/api/auth/resend-otp",      resendOtp);
app.post("/api/auth/forgot-password", forgotPassword);
app.post("/api/auth/reset-password",  resetPassword);

/* ══════════════════════════════════════
   PUBLIC EVENTS (no auth — landing page)
══════════════════════════════════════ */
app.get("/api/events/public", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.title, e.description, e.image, e.venue,
              to_char(e.event_date, 'YYYY-MM-DD') AS event_date,
              to_char(e.event_time, 'HH24:MI')    AS event_time,
              u.name AS organizer_name
       FROM events e
       JOIN users u ON u.id = e.organizer_id
       ORDER BY e.event_date ASC
       LIMIT 6`
    );
    res.json({ events: result.rows });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/* ══════════════════════════════════════
   PROTECTED ROUTES
══════════════════════════════════════ */
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ msg: `Hello ${req.user.role}, you are authorized!` });
});

app.post("/api/ai/event-description", verifyToken, generateEventDescription);

app.post("/api/events/create",    verifyToken, createEvent);
app.get("/api/events/created",    verifyToken, getCreatedEvents);
app.get("/api/events/all",        verifyToken, getAllEvents);
app.post("/api/events/register",  verifyToken, registerForEvent);
app.get("/api/events/registered", verifyToken, getRegisteredEvents);
app.get("/api/events/:id",        verifyToken, getEventDetails);
app.get("/api/events/:eventId/ticket", verifyToken, downloadTicket);
app.delete("/api/events/:id",     verifyToken, deleteEvent);

app.get("/api/users/me",                    verifyToken, getMyProfile);
app.get("/api/notifications",               verifyToken, getNotifications);
app.put("/api/notifications/read/:id",      verifyToken, markAsRead);

/* ══════════════════════════════════════
   SOCKET.IO
══════════════════════════════════════ */
const server = http.createServer(app);

const io = new IOServer(server, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    const raw = token.startsWith("Bearer ") ? token.slice(7) : token;
    const payload = jwt.verify(raw, process.env.JWT_SECRET);
    socket.user = { id: payload.id, role: payload.role };
    return next();
  } catch {
    return next(new Error("Authentication error"));
  }
});

const isUserParticipant = async (userId, eventId) => {
  try {
    const orgRes = await pool.query(
      `SELECT 1 FROM events WHERE id = $1 AND organizer_id = $2 LIMIT 1`,
      [eventId, userId]
    );
    if (orgRes.rowCount > 0) return true;
    const regRes = await pool.query(
      `SELECT 1 FROM registrations WHERE event_id = $1 AND user_id = $2 LIMIT 1`,
      [eventId, userId]
    );
    return regRes.rowCount > 0;
  } catch (err) {
    console.error("membership check error", err);
    return false;
  }
};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.user?.id);

  socket.on("join_room", async ({ eventId }) => {
    try {
      if (!eventId) return socket.emit("error_message", { msg: "Missing eventId" });
      const allowed = await isUserParticipant(socket.user.id, eventId);
      if (!allowed) return socket.emit("error_message", { msg: "Not authorized for this event" });
      const room = `event_chat_${eventId}`;
      socket.join(room);
      const resp = await pool.query(
        `SELECT m.*, u.name as sender_name
         FROM messages m JOIN users u ON u.id = m.sender_id
         WHERE m.event_id = $1 ORDER BY m.created_at DESC LIMIT 50`,
        [eventId]
      );
      socket.emit("room_history", resp.rows.reverse());
    } catch (err) {
      console.error("join_room error", err);
      socket.emit("error_message", { msg: "Could not join room" });
    }
  });

  socket.on("send_message", async ({ eventId, message, receiverId }) => {
    try {
      if (!message || !eventId || !receiverId)
        return socket.emit("error_message", { msg: "Invalid payload" });
      const allowed = await isUserParticipant(socket.user.id, eventId);
      if (!allowed) return socket.emit("error_message", { msg: "Not authorized" });
      const otherAllowed = await isUserParticipant(receiverId, eventId);
      if (!otherAllowed) return socket.emit("error_message", { msg: "Receiver not participant" });
      const insert = await pool.query(
        `INSERT INTO messages (event_id, sender_id, receiver_id, message)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [eventId, socket.user.id, receiverId, message]
      );
      io.to(`event_chat_${eventId}`).emit("new_message", insert.rows[0]);
    } catch (err) {
      console.error("send_message error", err);
      socket.emit("error_message", { msg: "Message send failed" });
    }
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export { pool };
