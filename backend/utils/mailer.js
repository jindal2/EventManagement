import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ── OTP Signup Verification ── */
export const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"EventHub" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your EventHub Signup OTP",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:480px;margin:40px auto;background:#1e2535;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
          <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em;">🎪 EventHub</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Email Verification</p>
          </div>
          <div style="padding:32px;">
            <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.6;">
              Hey there! Use the OTP below to verify your email and complete your signup.
            </p>
            <div style="background:#0f1117;border:1px solid rgba(99,102,241,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:12px;color:#64748b;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">Your OTP</p>
              <h2 style="margin:0;font-size:42px;font-weight:900;color:#a5b4fc;letter-spacing:0.15em;">${otp}</h2>
            </div>
            <p style="color:#64748b;font-size:13px;margin:0;line-height:1.6;">
              ⏱️ This OTP expires in <strong style="color:#f1f5f9;">10 minutes</strong>.<br/>
              If you didn't request this, ignore this email.
            </p>
          </div>
          <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:12px;color:#334155;text-align:center;">© 2026 EventHub · Built for campus communities</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

/* ── Forgot Password Reset Link ── */
export const sendPasswordResetEmail = async (to, resetUrl) => {
  await transporter.sendMail({
    from: `"EventHub" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your EventHub password",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:480px;margin:40px auto;background:#1e2535;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
          <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em;">🎪 EventHub</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Password Reset Request</p>
          </div>
          <div style="padding:32px;">
            <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.6;">
              We received a request to reset your password. Click the button below to set a new one.
            </p>
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.01em;">
                Reset My Password
              </a>
            </div>
            <p style="color:#64748b;font-size:13px;margin:0 0 8px;line-height:1.6;">
              ⏱️ This link expires in <strong style="color:#f1f5f9;">30 minutes</strong>.
            </p>
            <p style="color:#64748b;font-size:13px;margin:0;line-height:1.6;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
          <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:12px;color:#334155;text-align:center;">© 2026 EventHub · Built for campus communities</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};
