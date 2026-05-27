// ==========================================
// src/pages/auth/ResetPassword.jsx
// ==========================================

import {
  useState,
} from "react";

import {
  useDispatch,
} from "react-redux";

import {
  resetPassword,
} from "../../features/auth/authSlice";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import AuthLayout from "../../components/auth/AuthLayout";


export default function ResetPassword() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const email =
    location.state?.email ||
    sessionStorage.getItem(
      "reset_email"
    );

  const otp =
    location.state?.otp ||
    sessionStorage.getItem(
      "reset_otp"
    );


  // ==========================================
  // LOCAL STATES
  // ==========================================

  const [loadingLocal, setLoadingLocal] =
    useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [form, setForm] =
    useState({
      new_password: "",
      confirm_password: "",
    });


  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    // PASSWORD REQUIRED
    if (
      !form.new_password.trim()
    ) {

      toast.error(
        "Please enter new password"
      );

      return;
    }

    // PASSWORD LENGTH
    if (
      form.new_password.length < 6
    ) {

      toast.error(
        "Password must be at least 6 characters"
      );

      return;
    }

    // PASSWORD MATCH
    if (
      form.new_password !==
      form.confirm_password
    ) {

      toast.error(
        "Passwords do not match"
      );

      return;
    }

    try {

      setLoadingLocal(true);

      const result = await dispatch(
        resetPassword({
          email,
          otp,
          new_password:
            form.new_password,
        })
      ).unwrap();

      toast.success(
        result.message ||
        "Password reset successful"
      );

      navigate("/login");

    } catch (err) {

      toast.error(

        err?.error ||
        err?.new_password?.[0] ||
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
        onSubmit={
          handleSubmit
        }
      >

        <h1 className="auth-title">
          Reset Password
        </h1>

        <p className="auth-subtitle">
          Create your
          new password.
        </p>

        {/* NEW PASSWORD */}
        <div className="auth-group">

          <label>
            New Password
          </label>

          <div className="password-box">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="New Password"
              value={
                form.new_password
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  new_password:
                    e.target.value,
                })
              }
            />

            <span
              className="toggle-password"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >

              {showPassword
                ? "Hide"
                : "Show"}

            </span>

          </div>

        </div>

        {/* CONFIRM PASSWORD */}
        <div className="auth-group">

          <label>
            Confirm Password
          </label>

          <div className="password-box">

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="Confirm Password"
              value={
                form.confirm_password
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  confirm_password:
                    e.target.value,
                })
              }
            />

            <span
              className="toggle-password"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >

              {showConfirmPassword
                ? "Hide"
                : "Show"}

            </span>

          </div>

        </div>

        {/* SUBMIT BUTTON */}
        <button
          className="auth-btn"
          type="submit"
          disabled={
            loadingLocal
          }
        >

          {loadingLocal
            ? "Resetting..."
            : "Reset Password"}

        </button>

      </form>

    </AuthLayout>
  );
}