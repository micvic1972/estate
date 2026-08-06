import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { sendOtpEmail } from '../lib/emailService.js';

/**
 * ⚠️ SCHEMA CHANGES REQUIRED before this file works:
 *
 * model User {
 *   ...
 *   tokenVersion  Int  @default(0)   // bump on password change → invalidates old JWTs
 * }
 *
 * model Otp {
 *   ...
 *   lastRequestAt DateTime @default(now())  // real timestamp for the 60s throttle,
 *                                            // instead of reverse-engineering it from expiresAt
 * }
 */

// ─── Config ──────────────────────────────────────────────
// Fail loudly at boot if the secret is missing — never fall back to a
// hardcoded string in production. A silent fallback here means anyone
// who reads this file knows how to forge a valid token.
const SECRET = process.env.JWT_SECRET_KEY;
if (!SECRET) {
  throw new Error("JWT_SECRET_KEY is not set. Refusing to start server.");
}

const OTP_TTL_MS = 1000 * 60 * 15;        // 15 minutes
const OTP_RESEND_COOLDOWN_MS = 1000 * 60; // 60 seconds between requests
const OTP_WINDOW_MS = 1000 * 60 * 60 * 2; // 2-hour rolling window
const OTP_MAX_PER_WINDOW = 5;
const JWT_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const COOKIE_AGE_MS = JWT_AGE_SECONDS * 1000;

// ─── Validation helpers ──────────────────────────────────

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password) =>
  typeof password === 'string' &&
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[@$!%*?&]/.test(password);

// Never leak the password hash back to the client.
const sanitizeUser = (user) => {
  const { password, tokenVersion, ...safeUser } = user;
  return safeUser;
};

// Cryptographically secure 6-digit code — Math.random() is not
// safe for anything security-relevant, even short-lived OTPs.
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

// ─── Shared OTP verification ────────────────────────────
// Both registration and password reset need "find latest OTP for this
// email+purpose, check expiry, compare hash" — this used to be copy-pasted
// in two places. Now it's one function, so any future fix (e.g. attempt
// limiting) only has to happen once.
async function verifyOtp(email, purpose, submittedCode) {
  const record = await prisma.otp.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return { ok: false, status: 400, message: 'Verification session expired or invalid. Request a new code.' };
  }

  if (new Date() > record.expiresAt) {
    await prisma.otp.delete({ where: { id: record.id } });
    return { ok: false, status: 400, message: 'Verification window expired. Request a new code.' };
  }

  const matches = await bcrypt.compare(submittedCode, record.code);
  if (!matches) {
    return { ok: false, status: 400, message: 'Incorrect 6-digit verification code.' };
  }

  return { ok: true, record };
}

// ─── 1. Request an OTP ───────────────────────────────────
export const requestOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'A valid email is required.' });
    }
    if (!purpose) {
      return res.status(400).json({ success: false, message: 'Purpose is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const now = new Date();

    // For password recovery, check whether the account exists — but
    // NEVER reveal the result to the caller. Responding differently for
    // "exists" vs "doesn't exist" lets anyone enumerate registered emails,
       // which defeats the purpose of a "forgot password" flow.
    let userExists = true;
    if (purpose === 'FORGOT_PASSWORD') {
      //  FIXED: Added the 'select' block below!
      // This forces Prisma to only fetch the email string, ignoring the broken 'updatedAt' column entirely.
      const user = await prisma.user.findUnique({ 
        where: { email: cleanEmail },
        select: { email: true } 
      });
      userExists = !!user;
    }

    // If there's no account, pretend everything worked and stop —
    // same response shape as the success path below.
    if (purpose === 'FORGOT_PASSWORD' && !userExists) {
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a verification code has been sent.',
      });
    }

    const activeOtp = await prisma.otp.findFirst({ where: { email: cleanEmail, purpose } });

    if (activeOtp) {
      const withinWindow = now - new Date(activeOtp.createdAt) < OTP_WINDOW_MS;

      if (withinWindow) {
        if (activeOtp.requestCount >= OTP_MAX_PER_WINDOW) {
          return res.status(429).json({
            success: false,
            message: `Too many requests. Please try again later.`,
          });
        }

        // Real stored timestamp, not reverse-engineered from expiresAt.
        const sinceLastRequest = now - new Date(activeOtp.lastRequestAt);
        if (sinceLastRequest < OTP_RESEND_COOLDOWN_MS) {
          return res.status(429).json({
            success: false,
            message: 'Please wait 60 seconds before requesting another code.',
          });
        }
      }
    }

    const rawOtp = generateOtp();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    if (activeOtp) {
      const withinWindow = now - new Date(activeOtp.createdAt) < OTP_WINDOW_MS;
      const updatedCount = withinWindow ? activeOtp.requestCount + 1 : 1;

      await prisma.otp.update({
        where: { id: activeOtp.id },
        data: {
          code: hashedOtp,
          expiresAt,
          requestCount: updatedCount,
          createdAt: updatedCount === 1 ? now : activeOtp.createdAt,
          lastRequestAt: now,
        },
      });
    } else {
      await prisma.otp.create({
        data: {
          email: cleanEmail,
          code: hashedOtp,
          purpose,
          expiresAt,
          requestCount: 1,
          lastRequestAt: now,
        },
      });
    }

    await sendOtpEmail(cleanEmail, rawOtp, purpose);

    return res.status(200).json({
      success: true,
      message: 'If an account with this email exists, a verification code has been sent.',
    });
  } catch (error) {
    console.error('[OTP GENERATION FAILURE]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── 2. Verify OTP & Complete Registration ──────────────
export const verifyAndRegister = async (req, res) => {
  try {
    const { username, email, password, otpCode } = req.body;

    if (!username || !email || !password || !otpCode) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be 8+ characters with at least one uppercase letter, one number, and one special character.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This email is already registered. Try logging in!' });
    }

    const otpCheck = await verifyOtp(cleanEmail, 'REGISTER', otpCode);
    if (!otpCheck.ok) {
      return res.status(otpCheck.status).json({ success: false, message: otpCheck.message });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: { name: username.trim(), email: cleanEmail, password: hashedPassword },
    });

    // Single-use: delete the OTP so it can't be replayed.
    await prisma.otp.delete({ where: { id: otpCheck.record.id } });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error('[REGISTRATION FAILURE]', error);

    // Race-condition safety net: two requests for the same email
    // landing at nearly the same millisecond both pass the findUnique
    // check above, but the DB's unique constraint catches the second one.
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'This email is already registered.' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── 3. Login ────────────────────────────────────────────
// NOTE: this endpoint still needs rate limiting at the route/middleware
// level (e.g. express-rate-limit keyed by IP + email) to prevent
// unlimited password-guessing. Not something this function alone can fix.
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    // Same generic message whether the email or password was wrong —
    // don't let an attacker learn which one was incorrect.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin || false,
        tokenVersion: user.tokenVersion, // checked in verifyToken; bumped on password reset
      },
      SECRET,
      { expiresIn: JWT_AGE_SECONDS }
    );

    return res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: COOKIE_AGE_MS,
      })
      .status(200)
      .json({ success: true, message: 'Login successful.', user: sanitizeUser(user) });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── 4. Logout ───────────────────────────────────────────
export const logout = (req, res) => {
  return res
    .clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .status(200)
    .json({ success: true, message: 'Logged out successfully.' });
};

// ─── 5. Verify OTP & Reset Password ─────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be 8+ characters with at least one uppercase letter, one number, and one special character.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const otpCheck = await verifyOtp(cleanEmail, 'FORGOT_PASSWORD', otpCode);
    if (!otpCheck.ok) {
      return res.status(otpCheck.status).json({ success: false, message: otpCheck.message });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // tokenVersion increments here — this is what actually invalidates
    // any JWT issued before the reset. Without this, a stolen session
    // cookie keeps working even after the password changes.
    await prisma.user.update({
      where: { email: cleanEmail },
      data: { password: hashedPassword, tokenVersion: { increment: 1 } },
    });

    await prisma.otp.delete({ where: { id: otpCheck.record.id } });

    return res.status(200).json({ success: true, message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    console.error('[PASSWORD RESET FAILURE]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


// ─── 6. Get Current Logged-In User ──────────────────────
// Called by AuthContext on every page load. verifyToken middleware
// runs first and sets req.userId from the validated cookie — this
// function just looks up and returns that user.
export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error("[GET CURRENT USER ERROR]", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};