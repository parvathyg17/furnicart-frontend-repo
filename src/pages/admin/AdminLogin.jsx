// ==========================================
// src/pages/admin/AdminLogin.jsx
// ==========================================

import "../../styles/adminlogin.css";

import logofc from "../../assets/images/logofc.png";

import img1 from "../../assets/images/img1.png";

import {
  useState,
  useEffect,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  adminLogin,
  adminMe,
} from "../../features/admin/adminSlice";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  Mail,
  Lock,
} from "lucide-react";


export default function AdminLogin() {

  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const {
    isAuthenticated,
  } = useSelector(
    (state) => state.admin
  );


  // ==========================================
  // LOCAL STATES
  // ==========================================

  const [
    loadingLocal,
    setLoadingLocal,
  ] = useState(false);

  const [
    errorLocal,
    setErrorLocal,
  ] = useState("");

  const [form, setForm] =
    useState({
      email: "",
      password: "",
    });


  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setErrorLocal("");

      // EMAIL REQUIRED
      if (!form.email.trim()) {

        setErrorLocal(
          "Email is required"
        );

        return;
      }

      // PASSWORD REQUIRED
      if (!form.password.trim()) {

        setErrorLocal(
          "Password is required"
        );

        return;
      }

      try {

        setLoadingLocal(true);

        await dispatch(
          adminLogin(form)
        ).unwrap();

        await dispatch(
          adminMe()
        ).unwrap();

        navigate(
          "/admin/dashboard"
        );

      } catch (err) {

        setErrorLocal(

          err?.error ||

          err?.detail ||

          "Login failed"

        );

      } finally {

        setLoadingLocal(false);

      }
    };


  // ==========================================
  // REDIRECT
  // ==========================================

  useEffect(() => {

    if (isAuthenticated) {

      navigate(
        "/admin/dashboard"
      );

    }

  }, [
    isAuthenticated,
    navigate,
  ]);


  return (

    <div className="admin-login-page">

      {/* LEFT */}
      <div className="admin-login-left">

        <div className="admin-overlay"></div>

        <img
          src={img1}
          alt="furniture"
        />

        <div className="admin-left-content">

          <Link
            to="/"
            className="admin-brand"
          >

            <img
              src={logofc}
              alt="logo"
              className="admin-brand-logo"
            />

            <div>

              <h1>
                FURNICART
              </h1>

              <p>
                Excellence in every
                fiber.
              </p>

            </div>

          </Link>

          <div className="admin-quote">

            <h3>
              "Quality is not an act,
              it is a habit."
            </h3>

            <span>
              MASTER SERIES
            </span>

          </div>

        </div>

      </div>


      {/* RIGHT */}
      <div className="admin-login-right">

        <div className="admin-login-card">

          <div className="admin-badge">
            ADMIN PORTAL
          </div>

          <h2>
            Administrator
            <br />
            Login
          </h2>

          <p className="admin-desc">

            Enter your credentials
            to access the management
            dashboard.

          </p>

          {/* ERROR */}
          {errorLocal && (

            <div className="admin-error">
              {errorLocal}
            </div>

          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="admin-form"
          >

            {/* EMAIL */}
            <div className="admin-field">

              <label>
                ADMIN EMAIL
              </label>

              <div className="admin-input-wrapper">

                <Mail size={20} />

                <input
                  type="email"
                  placeholder="admin@gmail.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      email:
                        e.target
                          .value,
                    })
                  }
                />

              </div>

            </div>


            {/* PASSWORD */}
            <div className="admin-field">

              <div className="admin-label-row">

                <label>
                  SECURE PASSWORD
                </label>

              </div>

              <div className="admin-input-wrapper">

                <Lock size={20} />

                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={
                    form.password
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,

                      password:
                        e.target
                          .value,
                    })
                  }
                />

              </div>

            </div>


            {/* BUTTON */}
            <button
              type="submit"
              className="admin-login-btn"
              disabled={
                loadingLocal
              }
            >

              {loadingLocal

                ? "Signing In..."

                : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight size={20} />
                  </>
                )}

            </button>

          </form>

          <div className="admin-footer">

            © 2026 Furnicart.
            SECURE ADMIN ACCESS
            ONLY.

          </div>

        </div>

      </div>

    </div>
  );
}