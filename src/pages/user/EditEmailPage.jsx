// ==========================================
// src/pages/user/EditEmailPage.jsx
// ==========================================

import "../../styles/account.css";

import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  getProfile,
  sendEmailOTP,
  verifyEmailOTP,
} from "../../features/profile/profileSlice";

import {
  loadUser,
} from "../../features/auth/authSlice";

import AccountLayout from "../../components/user/AccountLayout";

import {
  ArrowLeft,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";


export default function EditEmailPage() {

  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const { profile } =
    useSelector(
      (state) => state.profile
    );


  // ==========================================
  // LOCAL STATES
  // ==========================================

  const [loadingLocal, setLoadingLocal] =
    useState(false);

  const [
    verifyLoadingLocal,
    setVerifyLoadingLocal,
  ] = useState(false);

  const [otpSent, setOtpSent] =
    useState(false);

  const [timer, setTimer] =
    useState(0);

  const [email, setEmail] =
    useState({
      new_email: "",
      otp: "",
    });


  // ==========================================
  // FETCH PROFILE
  // ==========================================

  useEffect(() => {

    if (!profile) {

      dispatch(
        getProfile()
      );

    }

  }, [
    dispatch,
    profile,
  ]);


  // ==========================================
  // TIMER
  // ==========================================

  useEffect(() => {

    let interval;

    if (timer > 0) {

      interval =
        setInterval(() => {

          setTimer(
            (prev) =>
              prev - 1
          );

        }, 1000);

    }

    return () =>
      clearInterval(
        interval
      );

  }, [timer]);


  // ==========================================
  // SEND OTP
  // ==========================================

  const sendOTP =
    async () => {

      // EMAIL REQUIRED
      if (
        !email.new_email.trim()
      ) {

        toast.error(
          "Please enter email address"
        );

        return;
      }

      // EMAIL VALIDATION
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          email.new_email
        )
      ) {

        toast.error(
          "Please enter a valid email"
        );

        return;
      }

      // SAME EMAIL
      if (
        email.new_email ===
        profile?.email
      ) {

        toast.error(
          "This is already your current email"
        );

        return;
      }

      try {

        setLoadingLocal(true);

        await dispatch(
          sendEmailOTP({
            new_email:
              email.new_email,
          })
        ).unwrap();

        toast.success(
          "OTP sent successfully"
        );

        setOtpSent(true);

        setTimer(60);

      } catch (err) {

        toast.error(

          err?.error ||
          "Failed to send OTP"

        );

      } finally {

        setLoadingLocal(false);

      }
    };


  // ==========================================
  // VERIFY OTP
  // ==========================================

  const verifyOTP =
    async () => {

      // OTP REQUIRED
      if (
        !email.otp.trim()
      ) {

        toast.error(
          "Please enter OTP"
        );

        return;
      }

      // OTP LENGTH
      if (
        email.otp.length !== 6
      ) {

        toast.error(
          "OTP must be 6 digits"
        );

        return;
      }

      try {

        setVerifyLoadingLocal(
          true
        );

        await dispatch(
  verifyEmailOTP({
    new_email:
      email.new_email,

    otp:
      email.otp,
  })
).unwrap();

await dispatch(
  loadUser()
).unwrap();

toast.success(
  "Email updated successfully"
);

navigate("/profile");

      } catch (err) {

        toast.error(

          err?.error ||
          "OTP verification failed"

        );

      } finally {

        setVerifyLoadingLocal(
          false
        );

      }
    };


  return (

    <AccountLayout>

      <div
        className="back-btn"
        onClick={() =>
          navigate("/profile")
        }
      >

        <ArrowLeft size={18} />

        Back To Profile

      </div>

      <div className="settings-card">

        <div className="settings-title">
          Change Email
        </div>

        {/* EMAIL */}
        <div className="settings-field">

          <label>
            New Email
          </label>

          <input
            type="email"
            className="settings-input"
            value={
              email.new_email
            }
            placeholder="Enter new email"
            onChange={(e) =>
              setEmail({
                ...email,

                new_email:
                  e.target.value,
              })
            }
          />

        </div>

        {/* SEND OTP */}
        <button
          className="primary-btn"
          onClick={sendOTP}
          disabled={
            timer > 0 ||
            loadingLocal
          }
        >

          {loadingLocal
            ? "Sending..."

            : timer > 0

            ? `Resend OTP ${timer}s`

            : "Send OTP"}

        </button>

        {/* OTP SECTION */}
        {otpSent && (

          <div className="otp-wrapper">

            <input
              type="text"
              className="settings-input"
              placeholder="Enter OTP"
              value={email.otp}
              onChange={(e) =>
                setEmail({
                  ...email,

                  otp:
                    e.target.value,
                })
              }
            />

            <button
              className="primary-btn"
              onClick={
                verifyOTP
              }
              disabled={
                verifyLoadingLocal
              }
            >

              {verifyLoadingLocal
                ? "Verifying..."
                : "Verify OTP"}

            </button>

          </div>

        )}

      </div>

    </AccountLayout>
  );
}