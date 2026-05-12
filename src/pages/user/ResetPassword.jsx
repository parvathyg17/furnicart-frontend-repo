import {
  useState,
  useEffect,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  resetPassword,
  clearMessages,
} from "../../features/auth/authSlice";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import AuthLayout from "../../components/auth/AuthLayout";

export default function ResetPassword() {

  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const email =
    location.state?.email;

  const otp =
    location.state?.otp;

  const {
    loading,
    error,
    success,
  } = useSelector(
    (state) => state.auth
  );

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
      confirm_password:
        "",
    });

  // SUCCESS

  useEffect(() => {

    if (
      success ===
      "Password reset successful"
    ) {

      toast.success(
        "Password reset successful"
      );

      navigate("/login");

      dispatch(
        clearMessages()
      );

    }

  }, [success]);

  // ERROR

  useEffect(() => {

    if (error) {

      toast.error(
        error.error ||
          "Something went wrong"
      );

      dispatch(
        clearMessages()
      );

    }

  }, [error]);

  // SUBMIT

  const handleSubmit = (
    e
  ) => {

    e.preventDefault();

    if (
      !form.new_password.trim()
    ) {

      toast.error(
        "Please enter new password"
      );

      return;
    }

    if (
      form.new_password
        .length < 6
    ) {

      toast.error(
        "Password must be at least 6 characters"
      );

      return;
    }

    if (
      form.new_password !==
      form.confirm_password
    ) {

      toast.error(
        "Passwords do not match"
      );

      return;
    }

    dispatch(
      resetPassword({
        email,
        otp,
        new_password:
          form.new_password,
      })
    );

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
                    e.target
                      .value,
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
                    e.target
                      .value,
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

        <button
          className="auth-btn"
          type="submit"
          disabled={
            loading
          }
        >

          {loading
            ? "Resetting..."
            : "Reset Password"}

        </button>

      </form>

    </AuthLayout>
  );
}