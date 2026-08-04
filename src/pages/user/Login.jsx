import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import {
  loginUser,
  loadUser,
  googleLogin,
} from "../../features/auth/authSlice";
import AuthLayout from "../../components/auth/AuthLayout";
import { getStoredReferralPayload } from "../../features/referral/referralAPI";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const errors = {};
    if (!form.email.trim()) {
      errors.email = "Email is required";
    }
    if (!form.password.trim()) {
      errors.password = "Password is required";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoadingLocal(true);
      await dispatch(loginUser(form)).unwrap();
      await dispatch(loadUser()).unwrap();
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      setFieldErrors({
        password: err?.error || "Invalid credentials",
      });
    } finally {
      setLoadingLocal(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoadingLocal(true);
      await dispatch(
        googleLogin({
          token: credentialResponse.credential,
          ...getStoredReferralPayload(),
        }),
      ).unwrap();
      await dispatch(loadUser()).unwrap();
      toast.success("Google login successful");
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
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">
          Continue curating your timeless interior experience.
        </p>

        {/* EMAIL */}
        <div className="auth-group">
          <label>Email Address</label>
          <div className="auth-input-wrapper">
            <Mail size={18} className="auth-input-icon" />
            <input
              type="email"
              placeholder="julian@example.com"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />
          </div>
          {fieldErrors.email && (
            <p className="error-text">{fieldErrors.email}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="auth-group">
          <label>Password</label>
          <div className="auth-input-wrapper">
            <Lock size={18} className="auth-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
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

        <div className="auth-options">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        <button className="auth-btn" type="submit" disabled={loadingLocal}>
          {loadingLocal ? "Loading..." : "Login"}
        </button>

        <div className="auth-divider">Or login with</div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              toast.error("Google Login Failed");
            }}
          />
        </div>

        <div className="auth-bottom-text">
          Don't have an account? <Link to="/signup">Signup</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
