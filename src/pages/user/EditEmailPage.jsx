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

  const {
    profile,
    loading,
  } = useSelector(
    (state) => state.profile
  );

  const [otpSent, setOtpSent] =
    useState(false);

  const [timer, setTimer] =
    useState(0);

  const [email, setEmail] =
    useState({
      new_email: "",
      otp: "",
    });

  useEffect(() => {

    dispatch(
      getProfile()
    );

  }, [dispatch]);

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

  const sendOTP =
    async () => {

      if (
        !email.new_email.trim()
      ) {

        toast.error(
          "Please enter email address"
        );

        return;
      }

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

      if (
        email.new_email ===
        profile?.email
      ) {

        toast.error(
          "This is already your current email"
        );

        return;
      }

      const res =
        await dispatch(
          sendEmailOTP({
            new_email:
              email.new_email,
          })
        );

      if (res.error) {

        toast.error(
          res.payload?.error ||
          "Failed to send OTP"
        );

        return;
      }

      toast.success(
        "OTP sent successfully"
      );

      setOtpSent(true);

      setTimer(60);

    };

  const verifyOTP =
    async () => {

      if (
        !email.otp.trim()
      ) {

        toast.error(
          "Please enter OTP"
        );

        return;
      }

      if (
        email.otp.length !== 6
      ) {

        toast.error(
          "OTP must be 6 digits"
        );

        return;
      }

      const res =
        await dispatch(
          verifyEmailOTP({
            new_email:
              email.new_email,
            otp: email.otp,
          })
        );

      if (res.error) {

        toast.error(
          res.payload?.error ||
          "OTP verification failed"
        );

        return;
      }

      toast.success(
        "Email updated successfully"
      );

      navigate("/profile");

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

        <button
          className="primary-btn"
          onClick={sendOTP}
          disabled={timer > 0}
        >

          {timer > 0
            ? `Resend OTP ${timer}s`
            : "Send OTP"}

        </button>

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
            >
              Verify OTP
            </button>

          </div>

        )}

      </div>

    </AccountLayout>
  );
}