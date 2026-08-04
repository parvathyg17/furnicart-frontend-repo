import toast from "react-hot-toast";

import { useEffect, useState } from "react";

import { useDispatch } from "react-redux";

import { verifyOTP, resendOTP } from "../../features/auth/authSlice";

import {
  getStoredReferralPayload,
  clearStoredReferral,
} from "../../features/referral/referralAPI";

import { useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";

export default function OtpVerify() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const email = location.state?.email || sessionStorage.getItem("otp_email");

  const purpose =
    location.state?.purpose || sessionStorage.getItem("otp_purpose");

  // ==========================================
  // LOCAL STATES
  // ==========================================

  const [otp, setOtp] = useState("");

  const [loadingLocal, setLoadingLocal] = useState(false);

  const [resendLoadingLocal, setResendLoadingLocal] = useState(false);

  // ==========================================
  // INITIAL TIMER
  // ==========================================

  const getInitialTimer = () => {
    let storedTime = localStorage.getItem("otp_resend_until");

    // FIRST TIME OPENING OTP PAGE
    if (!storedTime) {
      storedTime = Date.now() + 60000;

      localStorage.setItem("otp_resend_until", storedTime);
    }

    const remaining = Math.floor((Number(storedTime) - Date.now()) / 1000);

    return remaining > 0 ? remaining : 0;
  };

  const [timer, setTimer] = useState(getInitialTimer);

  // ==========================================
  // INVALID ACCESS
  // ==========================================

  useEffect(() => {
    if (!email || !purpose) {
      navigate("/forgot-password");
    }
  }, [email, purpose, navigate]);

  // ==========================================
  // TIMER
  // ==========================================

  useEffect(() => {
    if (timer <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("otp_resend_until");

          clearInterval(interval);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerify = async (e) => {
    e.preventDefault();

    // OTP REQUIRED
    if (!otp.trim()) {
      toast.error("Please enter OTP");

      return;
    }

    // OTP LENGTH
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");

      return;
    }

    try {
      setLoadingLocal(true);

      const result = await dispatch(
        verifyOTP({
          email,
          otp,
          purpose,
          ...getStoredReferralPayload(),
        }),
      ).unwrap();

      toast.success(result.message);

      // CLEAR TIMER STORAGE
      localStorage.removeItem("otp_resend_until");

      // ==========================================
      // SIGNUP FLOW
      // ==========================================

      if (purpose === "signup") {
        clearStoredReferral();

        navigate("/login");
      }

      // ==========================================
      // FORGOT PASSWORD FLOW
      // ==========================================
      else {
        sessionStorage.setItem("reset_email", email);

        sessionStorage.setItem("reset_otp", otp);

        navigate("/reset-password", {
          state: {
            email,
            otp,
          },
        });
      }
    } catch (err) {
      toast.error(err?.error || err?.otp?.[0] || "OTP verification failed");
    } finally {
      setLoadingLocal(false);
    }
  };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResend = async () => {
    try {
      setResendLoadingLocal(true);

      const result = await dispatch(
        resendOTP({
          email,
          purpose,
        }),
      ).unwrap();

      toast.success(result.message || "OTP resent successfully");

      // RESET TIMER
      const resendUntil = Date.now() + 60000;

      localStorage.setItem("otp_resend_until", resendUntil);

      setTimer(60);
    } catch (err) {
      toast.error(err?.error || "Failed to resend OTP");
    } finally {
      setResendLoadingLocal(false);
    }
  };

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleVerify}>
        <h1 className="auth-title">Verify OTP</h1>

        <p className="auth-subtitle">Enter the OTP sent to your email.</p>

        {/* OTP INPUT */}
        <div className="auth-group">
          <label>OTP</label>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        {/* VERIFY BUTTON */}
        <button className="auth-btn" type="submit" disabled={loadingLocal}>
          {loadingLocal ? "Verifying..." : "Verify OTP"}
        </button>

        {/* TIMER */}
        {timer > 0 ? (
          <p className="timer-text">Resend OTP in {timer}s</p>
        ) : (
          <button
            type="button"
            className="resend-btn"
            onClick={handleResend}
            disabled={resendLoadingLocal}
          >
            {resendLoadingLocal ? "Sending..." : "Resend OTP"}
          </button>
        )}
      </form>
    </AuthLayout>
  );
}
