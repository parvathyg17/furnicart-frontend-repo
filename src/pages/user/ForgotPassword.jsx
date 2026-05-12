import toast from "react-hot-toast";

import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  forgotPassword,
  clearMessages,
} from "../../features/auth/authSlice";

import AuthLayout from "../../components/auth/AuthLayout";

export default function ForgotPassword() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { loading, error, success } = useSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");

  // Prevent duplicate toasts
  const successShown = useRef(false);
  const errorShown = useRef(false);

  // // Clear old redux messages when page opens
  // useEffect(() => {

  //   dispatch(clearMessages());

  // }, [dispatch]);

  const handleSubmit = (e) => {

    e.preventDefault();

    // Reset refs before new request
    successShown.current = false;
    errorShown.current = false;

    dispatch(
      forgotPassword({ email })
    );
  };

  // SUCCESS
  useEffect(() => {

    if (
      success &&
      !successShown.current
    ) {

      successShown.current = true;

      toast.success(
        "OTP sent successfully"
      );

      dispatch(clearMessages());

      navigate("/verify-otp", {
        state: {
          email,
          purpose: "forgot_password",
        },
      });
    }

  }, [
    success,
    email,
    navigate,
    dispatch,
  ]);

  // ERROR
  useEffect(() => {

    if (
      error &&
      !errorShown.current
    ) {

      errorShown.current = true;

      toast.error(
        error.error ||
        "Something went wrong"
      );

      dispatch(clearMessages());
    }

  }, [
    error,
    dispatch,
  ]);

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

        <div className="auth-group">

          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

        </div>

        <button
          className="auth-btn"
          type="submit"
        >

          {loading
            ? "Loading..."
            : "Send OTP"}

        </button>

        <div className="auth-bottom-text">

          <Link to="/login">
            Back to Login
          </Link>

        </div>

      </form>

    </AuthLayout>
  );
}