import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiReguest from "../../lib/apiRequest";
import "./forgetpassword.scss";

const isStrongPassword = (password) =>
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[@$!%*?&]/.test(password);

function Forgetpassword() {
    // 🚀 RESTORE INITIAL ENGINES FROM STORAGE: Protects your typed strings from F5 reloads!
    const [step, setStep] = useState(() => {
        return parseInt(sessionStorage.getItem("forgot_step"), 10) || 1;
    });
    const [email, setEmail] = useState(() => {
        return sessionStorage.getItem("forgot_email") || "";
    });
    const [otpInput, setOtpInput] = useState(() => {
        return sessionStorage.getItem("forgot_otp") || "";
    });
    
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ error: "", success: "" });
    
    // 🚀 TIMER MEMORY BUFFER: Keeps countdown progress intact across tab refreshes
    const [countdown, setCountdown] = useState(() => {
        const savedTime = sessionStorage.getItem("forgot_countdown");
        return savedTime ? parseInt(savedTime, 10) : 900;
    });

    const navigate = useNavigate();

    // 🚀 BACKUP TASK PIPELINEEFFECT: Saves inputs on the fly as the user types
    useEffect(() => {
        sessionStorage.setItem("forgot_step", step);
        sessionStorage.setItem("forgot_email", email);
        sessionStorage.setItem("forgot_otp", otpInput);
    }, [step, email, otpInput]);

    // Dynamic timer tick loop runner
    useEffect(() => {
        let interval = null;
        if (step === 2 && countdown > 0) {
            interval = setInterval(() => {
                setCountdown((prev) => {
                    const nextTime = prev - 1;
                    sessionStorage.setItem("forgot_countdown", nextTime); // Continual background cache updates
                    return nextTime;
                });
            }, 1000);
        } else if (countdown === 0) {
            setStatusMessage({ error: "Session expired. Please request a new code.", success: "" });
        }
        return () => clearInterval(interval);
    }, [step, countdown]);

    const formatTimer = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setStatusMessage({ error: "", success: "" });
        setIsLoading(true);

        try {
            await apiReguest.post("/auth/request-otp", { email: email.trim().toLowerCase(), purpose: "FORGOT_PASSWORD" });
            setStatusMessage({ success: "If this email is registered, a code has been sent.", error: "" });
            setCountdown(900);
            sessionStorage.setItem("forgot_countdown", 900);
            setStep(2);
        } catch (err) {
            setStatusMessage({ error: err.response?.data?.message || "Something went wrong. Please try again.", success: "" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalResetSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage({ error: "", success: "" });

        if (newPassword !== confirmPassword) {
            setStatusMessage({ error: "Passwords do not match.", success: "" });
            return;
        }
        if (!isStrongPassword(newPassword)) {
            setStatusMessage({ error: "Password must be 8+ characters with an uppercase letter, a number, and a symbol.", success: "" });
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiReguest.post("/auth/reset-password", {
                email,
                otpCode: otpInput,
                newPassword,
            });

            if (res.data.success) {
                setStatusMessage({ success: "Password updated! Redirecting to login...", error: "" });
                
                // 🚀 TASK SUCCESS CLEANUP: Clear memory out entirely when done
                sessionStorage.clear();
                setEmail("");
                setOtpInput("");
                setNewPassword("");
                setConfirmPassword("");
                
                setTimeout(() => navigate("/login"), 2000);
            }
        } catch (err) {
            setStatusMessage({ error: err.response?.data?.message || "Verification failed.", success: "" });
        } finally {
            setIsLoading(false);
        }
    };

    // Resets state back to step 1 cleanly if user hits the change information link
    const handleResetSession = () => {
        sessionStorage.clear();
        setStep(1);
        setOtpInput("");
        setStatusMessage({ error: "", success: "" });
    };

    return (
        <div className="forgot-password">
            <div className="auth-box-container">
                {step === 1 ? (
                    <form onSubmit={handleRequestReset}>
                        <h2>Password Recovery</h2>
                        <p className="subtitle">Enter your registered email address.</p>
                        
                        <input required type="email" value={email} placeholder="Registered Email Address" onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                        
                        <button type="submit" disabled={isLoading} className="submit-action-btn">
                            {isLoading ? "Sending..." : "Send Recovery Code"}
                        </button>
                        
                        <div className="navigation-footer-links">
                            <Link to="/login">Back to Login</Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleFinalResetSubmit}>
                        <h2>Reset Password</h2>
                        <p className="subtitle">We sent a code to <b>{email}</b>, if that account exists.</p>

                        {/* 🚀 FIXED: Custom numeric uppercase XXXXXX formatting class added below */}
                        <input required type="text" maxLength={6} value={otpInput} placeholder="XXXXXX" className="otp-digit-field" onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))} disabled={isLoading || countdown === 0} />

                        <div className="password-field-wrapper">
                            <input required type={showPass ? "text" : "password"} value={newPassword} placeholder="New Password" onChange={(e) => setNewPassword(e.target.value)} disabled={isLoading || countdown === 0} />
                            <span className="toggle-visibility" onClick={() => setShowPass(!showPass)}>{showPass ? "Hide" : "Show"}</span>
                        </div>

                        <div className="password-field-wrapper">
                            <input required type={showConfirmPass ? "text" : "password"} value={confirmPassword} placeholder="Confirm New Password" onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading || countdown === 0} />
                            <span className="toggle-visibility" onClick={() => setShowConfirmPass(!showConfirmPass)}>{showConfirmPass ? "Hide" : "Show"}</span>
                        </div>

                        <div className="timer-zone">
                            {countdown > 0 ? (
                                <span>Code expires in: <b style={{ color: "orange" }}>{formatTimer(countdown)}</b></span>
                            ) : (
                                <b style={{ color: "red" }}>Code Expired!</b>
                            )}
                        </div>

                        <button type="submit" disabled={isLoading || countdown === 0} className="submit-action-btn">
                            {isLoading ? "Saving..." : "Save New Password"}
                        </button>

                        <span onClick={handleResetSession} className="change-info-link">
                            Change Recovery Email Info
                        </span>
                    </form>
                )}
                {statusMessage.error && <div className="status-error-notice">{statusMessage.error}</div>}
                {statusMessage.success && <div className="status-success-notice">{statusMessage.success}</div>}
            </div>
        </div>
    );
}

export default Forgetpassword;
