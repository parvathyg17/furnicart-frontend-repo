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
  loginUser,
  loadUser,
  clearMessages,
  googleLogin,
} from "../../features/auth/authSlice";

import AuthLayout from "../../components/auth/AuthLayout";

export default function Login() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { loading, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [showPassword, setShowPassword] =
    useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // FIELD ERRORS
  const [fieldErrors, setFieldErrors] =
    useState({});

  // Clear old redux messages on page load
  useEffect(() => {

    dispatch(clearMessages());

  }, [dispatch]);

  const handleSubmit = async (e) => {

    e.preventDefault();

    setFieldErrors({});

    const errors = {};

    // EMAIL VALIDATION
    if (!form.email.trim()) {
      errors.email = "Email is required";
    }

    // PASSWORD VALIDATION
    if (!form.password.trim()) {
      errors.password = "Password is required";
    }

    // STOP IF ERRORS
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {

      await dispatch(
        loginUser(form)
      ).unwrap();

      await dispatch(
        loadUser()
      ).unwrap();

      navigate("/");

    } catch (err) {

      console.log(
        "Login failed:",
        err
      );

      setFieldErrors({
        password:
          err?.error ||
          "Invalid credentials",
      });
    }
  };

  // AUTO REDIRECT
  useEffect(() => {

    if (
      isAuthenticated &&
      !loading
    ) {
      navigate("/");
    }

  }, [
    isAuthenticated,
    loading,
    navigate,
  ]);

  const handleGoogleSuccess =
    async (credentialResponse) => {

      try {

        await dispatch(
          googleLogin(
            credentialResponse.credential
          )
        ).unwrap();

        await dispatch(
          loadUser()
        ).unwrap();

        navigate("/");

      } catch (err) {

        console.log(
          "Google login failed:",
          err
        );
      }
    };

  return (

    <AuthLayout>

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

        <h1 className="auth-title">
          Welcome Back
        </h1>

        <p className="auth-subtitle">
          Continue curating your timeless
          interior experience.
        </p>

        {/* EMAIL */}
        <div className="auth-group">

          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          {fieldErrors.email && (
            <p className="error-text">
              {fieldErrors.email}
            </p>
          )}

        </div>

        {/* PASSWORD */}
        <div className="auth-group">

          <label>Password</label>

          <div className="password-box">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />

          </div>

          {fieldErrors.password && (
            <p className="error-text">
              {fieldErrors.password}
            </p>
          )}

        </div>

        <div className="auth-options">

  <Link
    to="/forgot-password"
    onClick={() => {

      // Clear old redux messages
      dispatch(clearMessages());

      // Clear local form errors
      setFieldErrors({});

    }}
  >
    Forgot Password?
  </Link>

</div>

        <button
          className="auth-btn"
          type="submit"
        >

          {loading
            ? "Loading..."
            : "Login"}

        </button>

        <div className="auth-divider">
          Or login with
        </div>

        <div className="google-login-wrapper">

          <GoogleLogin
            onSuccess={
              handleGoogleSuccess
            }
            onError={() => {
              console.log(
                "Google Login Failed"
              );
            }}
          />

        </div>

        <div className="auth-bottom-text">

          Don't have an account?{" "}

          <Link to="/signup">
            Signup
          </Link>

        </div>

      </form>

    </AuthLayout>
  );
}