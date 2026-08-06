import { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";    
import apiReguest from "../../lib/apiRequest"; 
import "./updateprofile.scss";

function UpdateProfile() {
    const { currentUser, updateUser } = useContext(AuthContext);
    
    // 🚀 RESTRICTED STATE HOOKS: Only allow modifications on Username and Avatar strings
    const [username, setUsername] = useState(currentUser?.name || currentUser?.username || "");
    const [avatar, setAvatar] = useState(currentUser?.avatar || "");
    
    // Status tracking lifecycle metrics
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // Protective route fallback guard
    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
        }
    }, [currentUser, navigate]);

    const handleUpdateProfilesubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            // 🚀 TARGET ROUTE INTERFACE: Hits your secure '/api/user/:id' endpoint
            const res = await apiReguest.put(`/user/${currentUser.id}`, {
                username: username.trim(),
                avatar: avatar.trim()
            });

            if (res.data.success || res.status === 200) {
                setSuccess("Profile metrics synced successfully!");
                
                if (res.data.user) {
                    updateUser(res.data.user); // Cast updated variables to global state context tower
                }

                setTimeout(() => {
                    navigate("/profile");
                }, 1500);
            }
        } catch (err) {
            console.error("[PROFILE LOCK PROFILE FAILURE]", err);
            setError(err.response?.data?.message || "Failed to update profile settings.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="update-profile">
            <div className="profile-dashboard-layout">
                
                {/* 📝 LEFT COLUMN: The Clean, Structured Text Settings Form */}
                <div className="form-section">
                    <form onSubmit={handleUpdateProfilesubmit}>
                        <h2>Account Settings</h2>
                        
                        <div className="input-field-group">
                            <label>Registered Email Address (Locked)</label>
                            {/* 🚀 FIXED: Disabled and locked to preserve corporate registry uniqueness */}
                            <input 
                                disabled
                                type="email" 
                                value={currentUser?.email || ""} 
                                className="locked-email-input"
                            />
                        </div>

                        <div className="input-field-group">
                            <label>Display Name / Username</label>
                            <input 
                                required
                                type="text" 
                                placeholder="Username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        {error && <div className="status-error-notice">{error}</div>}
                        {success && <div className="status-success-notice">{success}</div>}

                        <button type="submit" disabled={isLoading} className="submit-action-btn">
                            {isLoading ? "Saving changes..." : "Save Settings"}
                        </button>
                        
                        {/* 🚀 FIXED: Dedicated redirect linking straight to your OTP validation pipeline */}
                        <div className="security-recovery-link-zone">
                            <span>Need to update your system credentials?</span>
                            <Link to="/forgot-password">Modify Security Password ➔</Link>
                        </div>
                    </form>
                </div>

                {/* 📷 RIGHT COLUMN: The Executive Cloudinary Workspace Area */}
                <div className="media-upload-section">
                    <h3>Profile Visual Asset</h3>
                    <div className="avatar-preview-box">
                        <img 
                            src={avatar || "/noavatar.png"} 
                            alt="Active User Workspace Profile Avatar" 
                        />
                    </div>
                    
                    {/* 🚀 FIXED SECURE URL LINK SLOT: Ready to inject your Cloudinary Upload Widget loops next week */}
                    <div className="cloudinary-widget-box-placeholder">
                        <input 
                            type="text"
                            placeholder="Cloudinary Image URL Path String"
                            value={avatar}
                            onChange={(e) => setAvatar(e.target.value)}
                            disabled={isLoading}
                            className="cloudinary-link-input"
                        />
                        <button type="button" className="cloudinary-trigger-btn" disabled={isLoading}>
                            ☁️ Upload Via Cloudinary
                        </button>
                    </div>

                    <div className="cancellation-action-bar">
                        <span onClick={() => navigate("/profile")}>Cancel and Exit</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default UpdateProfile;
