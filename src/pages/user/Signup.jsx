// ==========================================
// src/pages/auth/Signup.jsx
// ==========================================

import toast from "react-hot-toast";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import { GoogleLogin } from "@react-oauth/google";

import {
  signupUser,
  googleLogin,
  loadUser,
} from "../../features/auth/authSlice";

import AuthLayout from "../../components/auth/AuthLayout";


export default function Signup() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // ==========================================
  // LOCAL STATES
  // ==========================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [formError, setFormError] =
    useState("");

  const [backendError, setBackendError] =
    useState("");

  const [loadingLocal, setLoadingLocal] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });


  // ==========================================
  // SUBMIT HANDLER
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setFormError("");
    setBackendError("");

    // VALIDATION
    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {

      return setFormError(
        "All fields are required"
      );
    }

    // PASSWORD MATCH
    if (
      form.password !==
      form.confirmPassword
    ) {

      return setFormError(
        "Passwords do not match"
      );
    }

    // PASSWORD LENGTH
    if (
      form.password.length < 8
    ) {

      return setFormError(
        "Password must be at least 8 characters"
      );
    }

    try {

      setLoadingLocal(true);

      const result = await dispatch(
        signupUser({
          username: form.username,
          email: form.email,
          password: form.password,
        })
      ).unwrap();

      setSuccessMessage(result);

    } catch (err) {

      setBackendError(

        err.username?.[0] ||
        err.email?.[0] ||
        err.password?.[0] ||
        err.error ||
        "Something went wrong"

      );

    } finally {

      setLoadingLocal(false);

    }
  };


  // ==========================================
  // SIGNUP SUCCESS FLOW
  // ==========================================

  useEffect(() => {

    if (!successMessage) return;

    const status =
      successMessage?.status;

    // OTP SENT
    if (
      status === "otp_sent" ||
      status === "otp_resent"
    ) {

      toast.success(
        successMessage.message
      );

      navigate("/verify-otp", {
        state: {
          email: successMessage.email,
          purpose: "signup",
        },
      });
    }

    // ALREADY VERIFIED
    if (
      status === "already_verified"
    ) {

      toast.error(
        successMessage.message
      );

      navigate("/login");
    }

  }, [
    successMessage,
    navigate,
  ]);


  // ==========================================
  // AUTO LOGIN REDIRECT
  // ==========================================

  useEffect(() => {

    if (isAuthenticated) {

      navigate("/");

    }

  }, [
    isAuthenticated,
    navigate,
  ]);


  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const handleGoogleSuccess =
    async (credentialResponse) => {

      try {

        setLoadingLocal(true);

        const token =
          credentialResponse.credential;

        await dispatch(
          googleLogin(token)
        ).unwrap();

        await dispatch(
          loadUser()
        ).unwrap();

        toast.success(
          "Google signup successful"
        );

        navigate("/");

      } catch (err) {

        toast.error(
          err?.error ||
          "Google login failed"
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
          Create Account
        </h1>

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
              setForm({
                ...form,
                username: e.target.value,
              })
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
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

        </div>

        {/* PASSWORD ROW */}
        <div className="auth-row">

          <div className="auth-group">

            <label>Password</label>

            <div className="password-box">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />

            </div>

          </div>

          <div className="auth-group">

            <label>Confirm</label>

            <div className="password-box">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="••••••••"
                value={
                  form.confirmPassword
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmPassword:
                      e.target.value,
                  })
                }
              />

            </div>

          </div>

        </div>

        {/* FORM ERROR */}
        {formError && (
          <p className="error-text">
            {formError}
          </p>
        )}

        {/* BACKEND ERROR */}
        {backendError && (
          <p className="error-text">
            {backendError}
          </p>
        )}

        {/* SUBMIT BUTTON */}
        <button
          className="auth-btn"
          type="submit"
        >

          {loadingLocal
            ? "Loading..."
            : "CREATE YOUR ACCOUNT"}

        </button>

        {/* DIVIDER */}
        <div className="auth-divider">
          OR CONTINUE WITH
        </div>

        {/* GOOGLE LOGIN */}
        <div className="google-login-wrapper">

          <GoogleLogin
            onSuccess={
              handleGoogleSuccess
            }
            onError={() => {

              toast.error(
                "Google login failed"
              );

            }}
          />

        </div>

        {/* LOGIN LINK */}
        <div className="auth-bottom-text">

          Already have an account?{" "}

          <Link to="/login">
            Log in
          </Link>

        </div>

      </form>

    </AuthLayout>
  );
}