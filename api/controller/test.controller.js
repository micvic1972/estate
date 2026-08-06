// ── Check Standard Authenticated User ───────────────────────
export const shouldBeLoggedIn = async (req, res) => {
    //  It can read 'req.userId' directly because verifyToken prepared it earlier!
    return res.status(200).json({ 
        success: true, 
        message: "You are Authenticated", 
        userId: req.userId 
    });
};

// ── Check Admin Privileges Only ─────────────────────────────
export const shouldBeAdmin = async (req, res) => {
    // Read admin rank directly from the request object populated by verifyToken
    if (!req.userIsAdmin) {
        return res.status(403).json({ success: false, message: "UnAuthorized " });
    }

    return res.status(200).json({ 
        success: true, 
        message: "Welcome Admin! Access granted.",
        userId: req.userId
    });
};
