// VerifyOtp.jsx
import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import apiReguest from "../../lib/apiRequest";

// Must match the server's OTP_TTL_MS (15 minutes) in authController.js.
// If that value ever changes, update this constant too — otherwise the
// UI tells users their code expired while the server would still accept it.
const OTP_VALID_SECONDS = 900;

function VerifyOtp() {
    const [otpCode, setOtpCode] = useState("");
    // Re-entered here instead of being carried from Register — never
    // held in router state, never left sitting in navigation history.
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(OTP_VALID_SECONDS);

    const location = useLocation();
    const navigate = useNavigate();
    const { updateUser } = useContext(AuthContext);

    // Only username + email travel through router state now.
    const registrationData = location.state;
    const username = registrationData?.username;
    const userEmail = registrationData?.email;

    // If someone lands here directly (no registration in progress),
    // send them back to start over.
    useEffect(() => {
        if (!registrationData) {
            navigate("/register");
        }
    }, [registrationData, navigate]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (otpCode.length !== 6) {
            setError("The verification code must be exactly 6 digits.");
            return;
        }
        if (!password) {
            setError("Please enter your password to complete registration.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiReguest.post("/auth/verify-register", {
                username,
                email: userEmail,
                password,
                otpCode,
            });

            if (res.data.success) {
                setSuccess("Account created! Logging you in...");
                if (res.data.user) {
                    updateUser(res.data.user);
                }
                setTimeout(() => navigate("/profile"), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired verification code.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError("");
        setSuccess("");
        try {
            await apiReguest.post("/auth/request-otp", { email: userEmail, purpose: "REGISTER" });
            setSuccess("A new code has been sent to your email.");
            setTimer(OTP_VALID_SECONDS);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to resend verification code.");
        }
    };

    return (
        <div className="verify-otp-page">
            <div className="card-container">
                <form onSubmit={handleVerifySubmit}>
                    <h1>Email Verification</h1>
                    <p className="subtitle">
                        We sent a 6-digit code to <b>{userEmail}</b>. Enter it below along with your password to complete signup.
                    </p>

                    <input
                        required
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        disabled={isLoading || timer === 0}
                    />

                    <input
                        required
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading || timer === 0}
                    />

                    <div className="timer-zone">
                        {timer > 0 ? (
                            <span>Code expires in: <b style={{ color: "orange" }}>{formatTime(timer)}</b></span>
                        ) : (
                            <span style={{ color: "red", fontWeight: "bold" }}>Code expired.</span>
                        )}
                    </div>

                    {error && <div className="status-error-box">{error}</div>}
                    {success && <div className="status-success-box">{success}</div>}

                    <button type="submit" disabled={isLoading || timer === 0}>
                        {isLoading ? "Verifying..." : "Complete Registration"}
                    </button>

                    <div className="resend-action">
                        <span>Didn't get the code? </span>
                        <button type="button" onClick={handleResendOtp} disabled={isLoading}>
                            Resend Code
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default VerifyOtp;