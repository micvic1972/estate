import { useState, useContext } from "react";
import "./navbar.scss";
import { Link, useNavigate } from "react-router-dom"; // 🚀 Added useNavigate for handling the logout action button
import { AuthContext } from "../../context/AuthContext";
import apiReguest from "../../lib/apiRequest"; // Custom global axios configuration setup

function Navbar() {
    const { currentUser, updateUser } = useContext(AuthContext);
    const [open, setopen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await apiReguest.post("/auth/logout");
            updateUser(null); // Automatically wipes global context state and client storage caches
            setopen(false); // Closes mobile menu drawer overlay
            navigate("/");
        } catch (err) {
            console.error("[NAVBAR LOGOUT ERROR]", err);
        }
    };
    
    return (
        <nav>
            <div className="left">
                <Link to="/" className="logo">
                    <img src="/logo.png" alt="Del-Info Logo" />
                    <span>Del-Info</span>
                </Link>
                {/* 🚀 FIXED: Switched standard anchors to link route targets cleanly */}
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
            </div>
          
            <div className="right">
                {currentUser ? (
                    <div className="user" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <Link to="/profile">
                            {/* 🚀 FIXED: Safe user image loading with built-in default image layout backup parameters */}
                            <img src={currentUser.avatar || "/noavatar.png"} alt="Profile" />
                        </Link>
                        {/* 🚀 FIXED: Set mapping to read the backend response payload '.name' parameter */}
                        <span className="username">{currentUser.name || currentUser.username}</span>
                        
                        <Link to="/profile" className="profile">
                          <div className="notification">3</div>
                          <span>Profile</span>
                        </Link>
                        
                        {/* Inline desktop logout feature support */}
                        
                    </div>
                ) : (
                    <>
                      <Link to="/login">Sign In</Link>
                      <Link to="/register" className="register">Sign Up</Link>
                    </>
                )}
                
                <div className="menuicon">
                    <img 
                        src="/menu.png" 
                        alt="Mobile Toggle Menu Trigger Icon"
                        onClick={() => setopen((prev) => !prev)} 
                    />
                </div> 
           
                {/* 📱 Mobile Responsive Sliding Navigation Tray View */}
                <div className={open ? "menu active" : "menu"}>
                    <Link to="/" onClick={() => setopen(false)}>Home</Link>
                    <Link to="/about" onClick={() => setopen(false)}>About</Link>
                    <Link to="/contact" onClick={() => setopen(false)}>Contact</Link>
                    
                    {currentUser ? (
                        <>
                            <Link to="/profile" onClick={() => setopen(false)}>Profile</Link>
                            <span onClick={handleLogout} style={{ cursor: "pointer", color: "red" }}>Logout</span>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setopen(false)}>Sign In</Link>
                            <Link to="/register" onClick={() => setopen(false)}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

