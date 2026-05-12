import toast from "react-hot-toast";

import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  verifyOTP,
  resendOTP,
  clearMessages,
} from "../../features/auth/authSlice";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";

export default function OtpVerify() {

  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const email =
    location.state?.email;

  const purpose =
    location.state?.purpose;

  const {
    loading,
    resendLoading,
    error,
    success,
    resendSuccess,
  } = useSelector(
    (state) => state.auth
  );

  const [otp, setOtp] =
    useState("");

  const [timer, setTimer] =
    useState(60);

  // =========================
  // INVALID ACCESS
  // =========================

  useEffect(() => {

    if (
      !email ||
      !purpose
    ) {

      navigate(
        "/forgot-password"
      );
    }

  }, [
    email,
    purpose,
    navigate,
  ]);

  // =========================
  // TIMER
  // =========================

  useEffect(() => {

    const interval =
      setInterval(() => {

        setTimer((prev) => {

          if (prev <= 1) {

            clearInterval(
              interval
            );

            return 0;
          }

          return prev - 1;
        });

      }, 1000);

    return () =>
      clearInterval(
        interval
      );

  }, []);

  // =========================
  // VERIFY SUCCESS
  // =========================

  useEffect(() => {

  if (
    success === "OTP verified successfully" ||
    success === "Email verified successfully"
  ) {

    toast.success(success);

    // SIGNUP FLOW
    if (purpose === "signup") {

      navigate("/login");

    }

    // FORGOT PASSWORD FLOW
    else {

      navigate(
        "/reset-password",
        {
          state: {
            email,
            otp,
          },
        }
      );

    }

    dispatch(clearMessages());
  }

}, [
  success,
  navigate,
  dispatch,
  email,
  otp,
  purpose,
]);

  // =========================
  // RESEND SUCCESS
  // =========================

  useEffect(() => {

    if (
      resendSuccess
    ) {

      toast.success(
        resendSuccess
      );

      setTimer(60);

      dispatch(
        clearMessages()
      );
    }

  }, [
    resendSuccess,
    dispatch,
  ]);

  // =========================
  // ERROR
  // =========================

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

  }, [
    error,
    dispatch,
  ]);

  // =========================
  // VERIFY OTP
  // =========================

  const handleVerify = (
    e
  ) => {

    e.preventDefault();

    if (
      !otp.trim()
    ) {

      toast.error(
        "Please enter OTP"
      );

      return;
    }

    if (
      otp.length !== 6
    ) {

      toast.error(
        "OTP must be 6 digits"
      );

      return;
    }

    dispatch(
      verifyOTP({
        email,
        otp,
        purpose,
      })
    );
  };

  // =========================
  // RESEND OTP
  // =========================

  const handleResend =
    () => {

      if (
        resendLoading
      ) return;

      dispatch(
        resendOTP({
          email,
          purpose,
        })
      );
    };

  return (
    <AuthLayout>

      <form
        className="auth-form"
        onSubmit={
          handleVerify
        }
      >

        <h1 className="auth-title">
          Verify OTP
        </h1>

        <p className="auth-subtitle">
          Enter the OTP
          sent to your
          email.
        </p>

        <div className="auth-group">

          <label>
            OTP
          </label>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            maxLength={6}
            onChange={(e) =>
              setOtp(
                e.target.value.replace(
                  /\D/g,
                  ""
                )
              )
            }
          />

        </div>

        <button
          className="auth-btn"
          type="submit"
          disabled={
            loading
          }
        >

          {loading
            ? "Verifying..."
            : "Verify OTP"}

        </button>

        {timer > 0 ? (

          <p className="timer-text">
            Resend OTP
            in {timer}s
          </p>

        ) : (

          <button
            type="button"
            className="resend-btn"
            onClick={
              handleResend
            }
            disabled={
              resendLoading
            }
          >

            {resendLoading
              ? "Sending..."
              : "Resend OTP"}

          </button>

        )}

      </form>

    </AuthLayout>
  );
}