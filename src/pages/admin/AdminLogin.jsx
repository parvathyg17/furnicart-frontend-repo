import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowRight, AtSign, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";

import { adminLogin, adminMe } from "../../features/admin/adminSlice";
import "../../styles/adminlogin.css";

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.admin);

  const [loadingLocal, setLoadingLocal] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stayAuthenticated, setStayAuthenticated] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal("");

    if (!form.email.trim()) {
      setErrorLocal("Email is required");
      return;
    }

    if (!form.password.trim()) {
      setErrorLocal("Password is required");
      return;
    }

    try {
      setLoadingLocal(true);
      await dispatch(adminLogin(form)).unwrap();
      await dispatch(adminMe()).unwrap();
    } catch (err) {
      setErrorLocal(err?.error || err?.detail || "Login failed");
    } finally {
      setLoadingLocal(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="admin-login-wrapper">
      <main className="admin-login-main">
        
        {/* LEFT PANEL */}
        <div className="admin-login-left">
          <span className="admin-left-eyebrow">Master Series</span>
          <h1 className="admin-left-title">
            Excellence in every<br />fiber.
          </h1>
          <div className="admin-left-separator"></div>
          
          <div className="admin-left-quote">
            "Quality is not an act, it is a habit."
          </div>
          <div className="admin-left-quote-author">
            - Aristotelian Philosophy
          </div>

          <img
            src="https://images.unsplash.com/photo-1550226891-ef816aed4a98?q=80&w=1200&auto=format&fit=crop"
            alt="Interior design"
            className="admin-left-image"
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="admin-login-right">
          <div className="admin-login-card">
            
            <div className="admin-card-icon">
              <ShieldCheck size={24} />
            </div>

            <div className="admin-card-eyebrow">Admin Portal</div>
            <h2 className="admin-card-title">Administrator Login</h2>
            <p className="admin-card-desc">
              Enter your credentials to access the management dashboard.
            </p>

            {errorLocal && (
              <div className="admin-error-box">
                {errorLocal}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              <div className="admin-form-group">
                <label className="admin-form-label">Admin Email</label>
                <div className="admin-input-wrapper">
                  {/* <AtSign size={18} className="admin-input-icon-left" /> */}
                  <input
                    type="email"
                     placeholder="admin@gmail.com"
                    className="admin-input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Secure Password</label>
                <div className="admin-input-wrapper">
                  {/* <Lock size={18} className="admin-input-icon-left" /> */}
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="admin-input"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="admin-input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

             

              <button
                type="submit"
                className="admin-submit-btn"
                disabled={loadingLocal}
              >
                {loadingLocal ? "Authenticating..." : "Sign in to Dashboard"}
                <ArrowRight size={18} />
              </button>

            </form>

            <div className="admin-card-footer">
              <ShieldCheck size={14} />
              <span>Multi-factor Authentication Required</span>
            </div>

          </div>
        </div>

      </main>

      <footer className="admin-footer-bar">
        <div className="admin-footer-copy">
          © 2026 Furnicart. Secure admin access only.
        </div>
        <div className="admin-footer-links">
          <a href="#" className="admin-footer-link">Security Protocol</a>
          <a href="#" className="admin-footer-link">Internal Privacy</a>
          <div className="admin-server-badge">
            <div className="admin-server-dot"></div>
            Server: North-Alpha-1
          </div>
        </div>
      </footer>

    </div>
  );
}