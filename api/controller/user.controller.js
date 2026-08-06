import Prisma from "../lib/prisma.js"; 
import bcrypt from "bcrypt"; // 🚀 FIXED: Added missing security dependency import

// Helper utility to strip sensitive data arrays before transmitting to the client side
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

// ─── Get All Users ───────────────────────────────────────
export const getusers = async (req, res) => {
    try {
        const users = await Prisma.user.findMany();
        
        // 🚀 FIXED SECURITY SHIELD: Sanitize every user in the array to prevent password leakage!
        const safeUsers = users.map(user => sanitizeUser(user));
        
        return res.status(200).json({ success: true, users: safeUsers }); 
    } catch(err) {
        console.error("[GET USERS ERROR]", err);
        return res.status(500).json({ success: false, message: "Failed to get users!" });
    }
};

// ─── Get Single User ──────────────────────────────────────
export const getuser = async (req, res) => {
    const { id } = req.params; 
    
    try {
        const user = await Prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User profile not found" });
        }

        return res.status(200).json({ // Changed status code from 201 (Created) to standard 200 (OK)
         success: true,
         user: sanitizeUser(user),
        });
    } catch(err) {
        console.error("[GET USER ERROR]", err);
        return res.status(500).json({ success: false, message: "Failed to get user!" });
    }
};

// ─── Update User Details ──────────────────────────────────
export const updateuser = async (req, res) => {
    const { id } = req.params; // 🚀 FIXED: Extracted cleanly from parameters wrapper object
    const tokenuserid = req.userId; // Provided by your secure verifyToken middleware guard
    
    const { password, avatar, ...inputs } = req.body; 

    // 🔒 THE SHIELD: Prevent malicious traffic blocks from editing other people's data spaces
    if (id !== tokenuserid){
        return res.status(403).json({ success: false, message: "Not Authorized to modify this profile." });
    }

    try {
        let hashedNewPassword = null;
        if (password) {
            // 🚀 FIXED: Properly declared variable block constructor to prevent runtime crashes
            hashedNewPassword = await bcrypt.hash(password, 12); 
        }

        // Commit transaction data changes directly to MongoDB collection
        const updateduser = await Prisma.user.update({
            where : { id },
            data: {
                ...inputs,
                ...(password && { password: hashedNewPassword }), // Conditionally write new password string
                ...(avatar && { avatar }),                     // Conditionally update avatar text string path
            }
        });

        return res.status(200).json({ 
            success: true, 
            message: "User profile updated successfully!",
            user: sanitizeUser(updateduser) // Returns the fresh updated user dataset back to your AuthContext!
        });
    } catch(err) {
        console.error("[UPDATE USER CONTROLLER CRASH]", err);
        return res.status(500).json({ success: false, message: "Failed to update user!" });
    }
};

// ─── Delete User Profile ──────────────────────────────────
export const deleteuser = async (req, res) => {
    const { id } = req.params;
    const tokenuserid = req.userId;

    if (id !== tokenuserid) {
        return res.status(403).json({ success: false, message: "Not Authorized to delete this account." });
    }

    try {
        await Prisma.user.delete({
            where: { id }
        });
        
        return res.status(200).json({ success: true, message: "Account deleted permanently from our records." });
    } catch(err) {
        console.error("[DELETE USER ERROR]", err);
        return res.status(500).json({ success: false, message: "Failed to delete user!" });
    }
};
