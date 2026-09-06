import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/mailer.js";

// pool is imported lazily to avoid circular dependency with index.js
let _pool;
const getPool = async () => {
  if (!_pool) {
    const mod = await import("../index.js");
    _pool = mod.pool;
  }
  return _pool;
};

/* ─────────────────────────────────────────────
   In-memory OTP store  { email → { otp, expiresAt, userData } }
   For production use Redis, but this is fine for dev.
───────────────────────────────────────────── */
const otpStore = new Map();

/* ── helper: generate 6-digit OTP ── */
const makeOTP = () => String(Math.floor(100000 + Math.random() * 900000));

/* ══════════════════════════════════════════
   STEP 1 — Send OTP (called on signup form submit)
   POST /api/auth/send-otp
   Body: { name, email, password, role }
══════════════════════════════════════════ */
export const sendOtp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    if (!["student", "organizer"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    // Check if email already registered
    const existing = await (await getPool()).query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ msg: "This email is already registered. Please log in." });
    }

    const otp = makeOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP + user data temporarily
    otpStore.set(email, { otp, expiresAt, userData: { name, email, password, role } });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ msg: "OTP sent successfully" });
  } catch (err) {
    console.error("sendOtp error:", err);
    // Give a clear message based on the error type
    if (err.message?.includes("Invalid login") || err.message?.includes("Username and Password")) {
      return res.status(500).json({ msg: "Email credentials are wrong. Set EMAIL_USER and EMAIL_PASS (App Password) in .env" });
    }
    if (err.message?.includes("ECONNREFUSED") || err.message?.includes("ETIMEDOUT")) {
      return res.status(500).json({ msg: "Cannot connect to email server. Check your internet connection." });
    }
    res.status(500).json({ msg: "Failed to send OTP: " + err.message });
  }
};

/* ══════════════════════════════════════════
   STEP 2 — Verify OTP + Create Account
   POST /api/auth/verify-otp
   Body: { email, otp }
══════════════════════════════════════════ */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({ msg: "No OTP found for this email. Please start over." });
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ msg: "OTP has expired. Please request a new one." });
    }
    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({ msg: "Incorrect OTP. Please try again." });
    }

    // OTP correct — create the account
    const { name, password, role } = record.userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    await (await getPool()).query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
      [name, email, hashedPassword, role]
    );

    otpStore.delete(email); // clean up

    res.json({ msg: "Account created successfully! Please log in." });
  } catch (err) {
    console.error("verifyOtp error:", err);
    res.status(500).json({ msg: "Server error during verification." });
  }
};

/* ══════════════════════════════════════════
   RESEND OTP
   POST /api/auth/resend-otp
   Body: { email }
══════════════════════════════════════════ */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({ msg: "Session expired. Please fill the signup form again." });
    }

    const otp = makeOTP();
    record.otp = otp;
    record.expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(email, record);

    await sendOTPEmail(email, otp);
    res.json({ msg: "New OTP sent!" });
  } catch (err) {
    console.error("resendOtp error:", err);
    res.status(500).json({ msg: "Failed to resend OTP." });
  }
};

/* ══════════════════════════════════════════
   LOGIN
   POST /api/auth/login
   Body: { email, password }
══════════════════════════════════════════ */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await (await getPool()).query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ msg: "No account found with this email." });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ══════════════════════════════════════════
   REGISTER (kept for compatibility, but
   the main flow is sendOtp + verifyOtp)
══════════════════════════════════════════ */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!["student", "organizer"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }
    const existing = await (await getPool()).query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ msg: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await (await getPool()).query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
      [name, email, hashedPassword, role]
    );
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/* ══════════════════════════════════════════
   FORGOT PASSWORD — Send reset link
   POST /api/auth/forgot-password
   Body: { email }
══════════════════════════════════════════ */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await (await getPool()).query("SELECT id FROM users WHERE email = $1", [email]);
    // Always respond with success (don't reveal if email exists)
    if (result.rows.length === 0) {
      return res.json({ msg: "If this email is registered, a reset link has been sent." });
    }

    const userId = result.rows[0].id;

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Store in DB (add reset_token + reset_token_expires columns)
    await (await getPool()).query(
      "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3",
      [resetToken, expiresAt, userId]
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail(email, resetUrl);

    res.json({ msg: "If this email is registered, a reset link has been sent." });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ══════════════════════════════════════════
   RESET PASSWORD — Set new password
   POST /api/auth/reset-password
   Body: { email, token, newPassword }
══════════════════════════════════════════ */
export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ msg: "All fields are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters." });
    }

    const result = await (await getPool()).query(
      "SELECT id, reset_token, reset_token_expires FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ msg: "Invalid request." });
    }

    const user = result.rows[0];

    if (user.reset_token !== token) {
      return res.status(400).json({ msg: "Invalid or expired reset link." });
    }
    if (new Date() > new Date(user.reset_token_expires)) {
      return res.status(400).json({ msg: "Reset link has expired. Please request a new one." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await (await getPool()).query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );

    res.json({ msg: "Password reset successfully! You can now log in." });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

