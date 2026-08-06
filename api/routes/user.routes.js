import express from "express";
import { getuser, getusers, deleteuser, updateuser } from "../controller/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { shouldBeLoggedIn } from "../controller/test.controller.js";
const router = express.Router(); // Changed to plural standard 'router'

router.get("/", getusers);
router.get("/:id", verifyToken, getuser);
router.put("/:id", verifyToken, updateuser);
router.delete("/:id", verifyToken, deleteuser);

export default router; //  Exported as router to match system expectations cleanly
