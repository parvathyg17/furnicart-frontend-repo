// ==========================================
// src/pages/auth/ForgotPassword.jsx
// ==========================================

import toast from "react-hot-toast";

import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
} from "react-redux";

import {
  forgotPassword,
} from "../../features/auth/authSlice";

import AuthLayout from "../../components/auth/AuthLayout";


export default function ForgotPassword() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  // ==========================================
  // LOCAL STATES
  // ==========================================

  const [email, setEmail] =
    useState("");

  const [loadingLocal, setLoadingLocal] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    // EMAIL VALIDATION
    if (!email.trim()) {

      setError(
        "Email is required"
      );

      return;
    }

    try {

      setLoadingLocal(true);

      const result = await dispatch(
        forgotPassword({ email })
      ).unwrap();

      toast.success(
        result.message ||
        "OTP sent successfully"
      );

      // STORE TEMP OTP FLOW DATA
      sessionStorage.setItem(
        "otp_email",
        email
      );

      sessionStorage.setItem(
        "otp_purpose",
        "forgot_password"
      );

      navigate("/verify-otp", {
        state: {
          email,
          purpose: "forgot_password",
        },
      });

    } catch (err) {

      setError(

        err?.error ||
        err?.email?.[0] ||
        "Something went wrong"

      );

    } finally {

      setLoadingLocal(false);

    }
  };


  return (

    <AuthLayout>

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

        <h1 className="auth-title">
          Forgot Password
        </h1>

        <p className="auth-subtitle">
          We'll send you a verification code
          to reset your password.
        </p>

        {/* EMAIL */}
        <div className="auth-group">

          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

        </div>

        {/* ERROR */}
        {error && (
          <p className="error-text">
            {error}
          </p>
        )}

        {/* SUBMIT */}
        <button
          className="auth-btn"
          type="submit"
        >

          {loadingLocal
            ? "Loading..."
            : "Send OTP"}

        </button>

        {/* LOGIN LINK */}
        <div className="auth-bottom-text">

          <Link to="/login">
            Back to Login
          </Link>

        </div>

      </form>

    </AuthLayout>
  );
}