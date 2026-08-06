// Login.jsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import apiReguest from "../../lib/apiRequest";
import "./login.scss";

function Login() {
    const [emailInput, setEmailInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { updateUser } = useContext(AuthContext);

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!isValidEmail(emailInput)) {
            setError("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiReguest.post("/auth/login", {
                email: emailInput.trim().toLowerCase(),
                password: passwordInput,
            });

            // Trust the payload, not the transport status — axios only
            // resolves on 2xx anyway, so checking res.status === 200
            // here was redundant and could mask a false-success payload.
            if (res.data.success) {
                setSuccess("Login successful! Welcome back.");
                if (res.data.user) {
                    updateUser(res.data.user);
                }
                setEmailInput("");
                setPasswordInput("");
                setTimeout(() => navigate("/profile"), 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials or server connection lost.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login">
            <div className="auth-box-container">
                <form onSubmit={handleSubmit}>
                    <h2>Welcome Back</h2>
                    <input
                        required
                        type="email"
                        placeholder="Email Address"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <div className="password-field-wrapper">
                        <input
                            required
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    {error && <div className="status-error-notice">{error}</div>}
                    {success && <div className="status-success-notice">{success}</div>}

                    <button type="submit" disabled={isLoading} className="submit-action-btn">
                        {isLoading ? "Verifying..." : "Login"}
                    </button>

                    <div className="navigation-footer-links">
                        <Link to="/register">Don't have an account?</Link>
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;