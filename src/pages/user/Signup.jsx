// ===============================
// src/pages/auth/Signup.jsx
// ===============================

import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";

import {
  signupUser,
  clearMessages,
  googleLogin,
  loadUser,
} from "../../features/auth/authSlice";

import AuthLayout from "../../components/auth/AuthLayout";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // =========================
  // SUBMIT HANDLER
  // =========================
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      return setFormError("All fields are required");
    }

    if (form.password !== form.confirmPassword) {
      return setFormError("Passwords do not match");
    }

    if (form.password.length < 8) {
      return setFormError("Password must be at least 8 characters");
    }

    dispatch(
      signupUser({
        username: form.username,
        email: form.email,
        password: form.password,
      })
    );
  };

  // =========================
  // EFFECTS
  // =========================
  useEffect(() => {
    if (!success) return;

    const status = success?.status;

    // OTP SENT OR RESENT
    if (status === "otp_sent" || status === "otp_resent") {
      toast.success(success.message);

      navigate("/verify-otp", {
        state: {
          email: success.email,
          purpose: "signup",
        },
      });
    }

    // ALREADY VERIFIED USER
    if (status === "already_verified") {
      toast.error(success.message);
      navigate("/login");
    }

    dispatch(clearMessages());
  }, [success, navigate, dispatch]);

  // AUTO LOGIN REDIRECT (optional safety)
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">
          Start your journey into intentional design.
        </p>

        {/* USERNAME */}
        <div className="auth-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Julian Thorne"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />
        </div>

        {/* EMAIL */}
        <div className="auth-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="julian@example.com"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </div>

        {/* PASSWORD ROW */}
        <div className="auth-row">
          <div className="auth-group">
            <label>Password</label>
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>
          </div>

          <div className="auth-group">
            <label>Confirm</label>
            <div className="password-box">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* FORM ERROR */}
        {formError && <p className="error-text">{formError}</p>}

        {/* BACKEND ERROR */}
        {error && (
          <p className="error-text">
            {error.username?.[0] ||
              error.email?.[0] ||
              error.password?.[0] ||
              error.error ||
              "Something went wrong"}
          </p>
        )}

        {/* SUBMIT BUTTON */}
        <button className="auth-btn" type="submit">
          {loading ? "Loading..." : "CREATE YOUR ACCOUNT"}
        </button>

        {/* DIVIDER */}
        <div className="auth-divider">OR CONTINUE WITH</div>

        {/* GOOGLE LOGIN */}
        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const token = credentialResponse.credential;

                const result = await dispatch(googleLogin(token));

                if (result.meta.requestStatus === "fulfilled") {
                  dispatch(loadUser());
                  navigate("/");
                }
              } catch (err) {
                toast.error("Google login failed");
              }
            }}
            onError={() => {
              toast.error("Google login failed");
            }}
          />
        </div>

        {/* LOGIN LINK */}
        <div className="auth-bottom-text">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}