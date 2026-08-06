import express from "express";
import { shouldBeAdmin, shouldBeLoggedIn } from "../controller/test.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Route 1: Must be logged in
router.post("/should-be-logged-in", verifyToken, shouldBeLoggedIn);

// Route 2: Must be logged in AND pass the internal admin conditional check inside the controller
router.post("/should-be-admin", verifyToken, shouldBeAdmin);

export default router;
