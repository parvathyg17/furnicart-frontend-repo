import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { User, Mail, Lock, Eye, EyeOff, Hash } from "lucide-react";

import {
  signupUser,
  googleLogin,
  loadUser,
} from "../../features/auth/authSlice";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  formatProductApiError,
  mapPayloadToFormErrors,
} from "../../utils/productApiErrors.js";
import {
  getStoredReferralPayload,
  setStoredReferralCode,
  captureReferralFromSearch,
  clearStoredReferral,
} from "../../features/referral/referralAPI";

const BLOCKED_USERNAMES = [
  "admin",
  "administrator",
  "root",
  "superuser",
  "staff",
  "support",
  "owner",
  "furnicart",
];

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function validateSignupFields(form) {
  const errors = {};
  const username = normalizeUsername(form.username);

  if (!username) {
    errors.username = "Username is required";
  } else if (username.length < 3) {
    errors.username = "Username must be at least 3 characters";
  } else if (username.length > 20) {
    errors.username = "Username cannot exceed 20 characters";
  } else if (!/^[A-Za-z0-9 ]+$/.test(username)) {
    errors.username = "Username can contain only letters, numbers and spaces";
  } else if (username.replace(/ /g, "").match(/^\d+$/)) {
    errors.username = "Username cannot contain only numbers";
  } else if (BLOCKED_USERNAMES.includes(username.toLowerCase())) {
    errors.username = "This username is not allowed";
  }

  const email = normalizeEmail(form.email);

  if (!email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }

  const password = String(form.password || "");

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Password must contain at least one uppercase letter";
  } else if (!/[a-z]/.test(password)) {
    errors.password = "Password must contain at least one lowercase letter";
  } else if (!/[0-9]/.test(password)) {
    errors.password = "Password must contain at least one number";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [backendError, setBackendError] = useState("");
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });

  useEffect(() => {
    captureReferralFromSearch(location.search);
    const stored = sessionStorage.getItem("referral_code");
    if (stored) {
      setForm((prev) => ({
        ...prev,
        referralCode: stored,
      }));
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setBackendError("");

    const errors = validateSignupFields(form);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoadingLocal(true);
      setStoredReferralCode(form.referralCode);
      const result = await dispatch(
        signupUser({
          username: normalizeUsername(form.username),
          email: normalizeEmail(form.email),
          password: form.password,
        }),
      ).unwrap();
      setSuccessMessage(result);
    } catch (err) {
      const mapped = mapPayloadToFormErrors(err);
      const general = mapped._general;
      delete mapped._general;

      if (
        err?.status === "already_verified" &&
        typeof err?.message === "string"
      ) {
        mapped.email = err.message;
      } else if (
        general &&
        !mapped.email &&
        general.toLowerCase().includes("email")
      ) {
        mapped.email = general;
      }

      if (Object.keys(mapped).length > 0) {
        setFieldErrors(mapped);
        setBackendError("");
      } else {
        setBackendError(
          general || err?.message || err?.error || formatProductApiError(err),
        );
      }
    } finally {
      setLoadingLocal(false);
    }
  };

  useEffect(() => {
    if (!successMessage) return;
    const status = successMessage?.status;

    if (status === "otp_sent" || status === "otp_resent") {
      toast.success(successMessage.message);
      const resendUntil = Date.now() + 60000;
      localStorage.setItem("otp_resend_until", resendUntil);
      sessionStorage.setItem("otp_email", successMessage.email);
      sessionStorage.setItem("otp_purpose", "signup");
      navigate("/verify-otp", {
        state: { email: successMessage.email, purpose: "signup" },
      });
    }

    if (status === "already_verified") {
      toast.error(successMessage.message);
      navigate("/login");
    }
  }, [successMessage, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoadingLocal(true);
      const token = credentialResponse.credential;
      await dispatch(
        googleLogin({
          token,
          ...getStoredReferralPayload(),
        }),
      ).unwrap();
      clearStoredReferral();
      await dispatch(loadUser()).unwrap();
      toast.success("Google signup successful");
      navigate("/");
    } catch (err) {
      toast.error(err?.error || "Google login failed");
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">
          Start your journey into intentional design.
        </p>

        {/* USERNAME */}
        <div className="auth-group">
          <label>Username</label>
          <div className="auth-input-wrapper">
            <User size={18} className="auth-input-icon" />
            <input
              type="text"
              placeholder="julian99"
              value={form.username}
              onChange={(e) => {
                setForm({ ...form, username: e.target.value });
                setFieldErrors({ ...fieldErrors, username: "" });
              }}
            />
          </div>
          {fieldErrors.username && (
            <p className="error-text">{fieldErrors.username}</p>
          )}
        </div>

        {/* EMAIL */}
        <div className="auth-group">
          <label>Email Address</label>
          <div className="auth-input-wrapper">
            <Mail size={18} className="auth-input-icon" />
            <input
              type="email"
              placeholder="julian@example.com"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setFieldErrors({ ...fieldErrors, email: "" });
              }}
            />
          </div>
          {fieldErrors.email && (
            <p className="error-text">{fieldErrors.email}</p>
          )}
        </div>

        {/* PASSWORD ROW */}
        <div className="auth-row">
          <div className="auth-group">
            <label>Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setFieldErrors({ ...fieldErrors, password: "" });
                }}
              />
              {/* <button
                type="button"
                className="auth-input-action"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button> */}
            </div>
            {fieldErrors.password && (
              <p className="error-text">{fieldErrors.password}</p>
            )}
          </div>

          <div className="auth-group">
            <label>Confirm</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm({ ...form, confirmPassword: e.target.value });
                  setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                }}
              />
              {/* <button
                type="button"
                className="auth-input-action"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button> */}
            </div>
            {fieldErrors.confirmPassword && (
              <p className="error-text">{fieldErrors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="auth-group">
          <label>Referral code (optional)</label>
          <div className="auth-input-wrapper">
            <Hash size={18} className="auth-input-icon" />
            <input
              type="text"
              placeholder="Enter a friend's code"
              value={form.referralCode}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, referralCode: value });
                setStoredReferralCode(value);
              }}
            />
          </div>
        </div>

        {backendError && <div className="error-message">{backendError}</div>}

        <button className="auth-btn" type="submit" disabled={loadingLocal}>
          {loadingLocal ? "Loading..." : "CREATE YOUR ACCOUNT"}
        </button>

        <div className="auth-divider">OR CONTINUE WITH</div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              toast.error("Google login failed");
            }}
          />
        </div>

        <div className="auth-bottom-text">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
