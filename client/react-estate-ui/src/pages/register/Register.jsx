import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiReguest from "../../lib/apiRequest";
import "./register.scss";

const isStrongPassword = (password) =>
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[@$!%*?&]/.test(password);

function Register() {
    // 🚀 INITIALIZE STATES FROM SESSION STORAGE: Keeps baseline data intact after F5 refreshes!
    const [formData, setFormData] = useState(() => {
        const savedUsername = sessionStorage.getItem("reg_username") || "";
        const savedEmail = sessionStorage.getItem("reg_email") || "";
        return { username: savedUsername, email: savedEmail, password: "", confirmPassword: "" };
    });

    const [statusMessage, setStatusMessage] = useState({ error: "", success: "" });
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // 🚀 AUTOMATED DATA BACKUP EFFECT: Captures input strings instantly as they change
    useEffect(() => {
        sessionStorage.setItem("reg_username", formData.username);
        sessionStorage.setItem("reg_email", formData.email);
    }, [formData.username, formData.email]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setStatusMessage({ error: "", success: "" });

        if (formData.password !== formData.confirmPassword) {
            setStatusMessage({ error: "Passwords do not match.", success: "" });
            return;
        }
        if (!isStrongPassword(formData.password)) {
            setStatusMessage({ error: "Password must be 8+ characters with an uppercase letter, a number, and a symbol.", success: "" });
            return;
        }

        setIsLoading(true);
        try {
            await apiReguest.post("/auth/request-otp", { email: formData.email, purpose: "REGISTER" });
            
            // 🚀 PIPELINE TRANSITION CLEANUP: Flush the storage cache fields right before moving forward
            sessionStorage.removeItem("reg_username");
            sessionStorage.removeItem("reg_email");
            
            navigate("/verify-otp", {
                state: { username: formData.username, email: formData.email },
            });
        } catch (err) {
            setStatusMessage({ error: err.response?.data?.message || "Failed to send verification code.", success: "" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register">
            <div className="auth-box-container">
                <form onSubmit={handleSendOtp}>
                    <h2>Create Account</h2>
                    <input
                        required
                        type="text"
                        value={formData.username}
                        placeholder="Username"
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        disabled={isLoading}
                    />
                    <input
                        required
                        type="email"
                        value={formData.email}
                        placeholder="Email Address"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={isLoading}
                    />

                    {/* Password Field 1 Wrapper */}
                    <div className="password-field-wrapper">
                        <input
                            required
                            type={showPass ? "text" : "password"}
                            value={formData.password}
                            placeholder="Password"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            disabled={isLoading}
                        />
                        <button type="button" className="toggle-visibility" onClick={() => setShowPass(!showPass)}>
                            {showPass ? "Hide" : "Show"}
                        </button>
                    </div>

                    {/* Password Field 2 Wrapper */}
                    <div className="password-field-wrapper">
                        <input
                            required
                            type={showConfirmPass ? "text" : "password"}
                            value={formData.confirmPassword}
                            placeholder="Confirm Password"
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            disabled={isLoading}
                        />
                        <button type="button" className="toggle-visibility" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                            {showConfirmPass ? "Hide" : "Show"}
                        </button>
                    </div>

                    {statusMessage.error && <div className="status-error-notice">{statusMessage.error}</div>}
                    {statusMessage.success && <div className="status-success-notice">{statusMessage.success}</div>}

                    <button type="submit" disabled={isLoading} className="submit-action-btn">
                        {isLoading ? "Sending code..." : "Continue"}
                    </button>
                    
                    {/* 🚀 FIXED: Isolated layout footer container to align typography cleanly */}
                    <div className="navigation-footer-links">
                        <Link to="/login">Already have an account?</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
