// lib/emailService.js
import nodemailer from "nodemailer";

const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS } = process.env;

// Fail at boot, not on the first OTP request, if config is missing.
if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
  throw new Error("Missing required EMAIL_HOST / EMAIL_USER / EMAIL_PASS env vars.");
}

// Default to 465 only if EMAIL_PORT isn't set — never silently fall
// back to NaN, which produces a confusing connection error instead of
// a clear config error.
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT, 10) || 465;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  // Derive `secure` from the port instead of hardcoding true — hardcoding
  // breaks silently if EMAIL_PORT is ever changed to 587 (STARTTLS),
  // which requires secure: false.
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Only these two purposes should ever reach the email template.
// Rejecting anything else here stops unvalidated input from the
// controller layer landing directly in the email HTML.
const ALLOWED_PURPOSES = new Set(["REGISTER", "FORGOT_PASSWORD"]);

const PURPOSE_LABELS = {
  REGISTER: "account registration",
  FORGOT_PASSWORD: "password reset",
};

/**
 * Sends the OTP email. Throws on failure — the caller (requestOtp)
 * must catch this. Do not swallow the error here: if sending silently
 * fails, the API would tell the user "code sent" when it wasn't.
 */
export const sendOtpEmail = async (email, otpCode, purpose) => {
  if (!ALLOWED_PURPOSES.has(purpose)) {
    throw new Error(`Invalid OTP purpose: ${purpose}`);
  }

  const purposeLabel = PURPOSE_LABELS[purpose];

  const mailOptions = {
    from: `"Del-Info Security" <${EMAIL_USER}>`,
    to: email,
    subject: `[Del-Info] Secure Verification Code: ${otpCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4caf50; text-align: center;">Del-Info Verification Checkpoint</h2>
        <p>Hello,</p>
        <p>You requested a verification code for <strong>${purposeLabel}</strong>.</p>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <span style="font-size: 2rem; font-weight: bold; letter-spacing: 5px; color: #333;">${otpCode}</span>
        </div>
        <p style="color: #666; font-size: 0.85rem;">This code is valid for <strong>15 minutes</strong>. If you did not request this, please secure your account immediately.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};