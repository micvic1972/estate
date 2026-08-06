import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import apiReguest from "../../lib/apiRequest";
import "./navbar.scss";

function Navbar() {
    const { currentUser, updateUser } = useContext(AuthContext);
    const [open, setopen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await apiReguest.post("/auth/logout");
            updateUser(null); 
            setopen(false); 
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
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
            </div>
          
            <div className="right">
                {currentUser ? (
                    <div className="user">
                        <Link to="/profile" className="avatar-link">
                           <span className="username">
                            {currentUser.name || currentUser.username}
                        </span>
                        
                        </Link>
                      
                        <Link to="/profile" className="avatar-link">
                            <img src={currentUser.avatar || "/noavatar.png"} alt="Profile" />
                        </Link>
                        
                        <Link to="/profile" className="profile">
                          <div className="notification">3</div>
                          <span>Profile</span>
                        </Link>
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
           
                <div className={open ? "menu active" : "menu"}>
                    <Link to="/" onClick={() => setopen(false)}>Home</Link>
                    <Link to="/about" onClick={() => setopen(false)}>About</Link>
                    <Link to="/contact" onClick={() => setopen(false)}>Contact</Link>
                    
                    {currentUser ? (
                        <>
                            <Link to="/profile" onClick={() => setopen(false)}>Profile</Link>
                            <Link to="/list" onClick={() => setopen(false)}>My List</Link>
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
