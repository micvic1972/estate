// middleware/verifyMiddleware.js
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
const SECRET = process.env.JWT_SECRET_KEY;

/**
 * Verifies the JWT cookie AND checks it against the user's current
 * tokenVersion. Without the tokenVersion check, a stolen or leaked
 * cookie keeps working even after the user changes their password —
 * defeating the whole point of a password reset.
 *
 * This makes the middleware async (one DB lookup per request). That's
 * a deliberate tradeoff: correctness over shaving a few ms.
 */
export const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  let payload;
  try {
    payload = jwt.verify(token, SECRET);
  } catch (err) {
    console.error("[JWT VERIFY ERROR]:", err.message);
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    // Covers two cases: the account was deleted, or the password was
    // reset since this token was issued (tokenVersion no longer matches).
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ success: false, message: "Session expired, please log in again." });
    }

    req.userId = user.id;
    req.userIsAdmin = user.isAdmin || false;

    next();
  } catch (error) {
    console.error("[VERIFY TOKEN DB ERROR]:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};