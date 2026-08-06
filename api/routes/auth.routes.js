import express from "express"
const routes = express.Router();
import { verifyToken } from "../middleware/verifyToken.js";
import {login,logout, requestOtp, verifyAndRegister, resetPassword, getCurrentUser } from "../controller/auth.controller.js";

// ── Public routes — no token exists yet, so no verifyToken here ──
routes.post("/request-otp", requestOtp);
routes.post("/verify-register", verifyAndRegister);
routes.post("/login", login);
routes.post("/reset-password", resetPassword);

// ── Protected routes — require a valid, current session ──
// logout needs verifyToken too: if there's no valid cookie, there's
// nothing to log out of, and this keeps the pattern consistent.
routes.post("/logout", verifyToken, logout);
routes.get("/me", verifyToken, getCurrentUser);

export default routes; 
