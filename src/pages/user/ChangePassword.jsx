// ==========================================
// src/pages/user/ChangePasswordPage.jsx
// ==========================================

import "../../styles/account.css";

import {
  useState,
} from "react";

import {
  useDispatch,
} from "react-redux";

import toast from "react-hot-toast";

import {
  changePassword,
} from "../../features/auth/authSlice";

import AccountLayout
from "../../components/user/AccountLayout";


export default function ChangePasswordPage() {

  const dispatch = useDispatch();

  // ==========================================
  // LOCAL STATES
  // ==========================================

  const [loadingLocal, setLoadingLocal] =
    useState(false);

  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });


  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async () => {

    // OLD PASSWORD REQUIRED
    if (
      !form.old_password.trim()
    ) {

      toast.error(
        "Current password is required"
      );

      return;
    }

    // NEW PASSWORD REQUIRED
    if (
      !form.new_password.trim()
    ) {

      toast.error(
        "New password is required"
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
        changePassword({
          old_password:
            form.old_password,

          new_password:
            form.new_password,
        })
      ).unwrap();

      toast.success(
        result.message ||
        "Password updated successfully"
      );

      // CLEAR FORM
      setForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });

    } catch (err) {

      toast.error(

        err?.error ||
        err?.old_password?.[0] ||
        err?.new_password?.[0] ||
        "Password change failed"

      );

    } finally {

      setLoadingLocal(false);

    }
  };


  return (

    <AccountLayout>

      <div className="settings-card">

        <div className="settings-title">
          Security Settings
        </div>

        <div className="settings-desc">
          Update your password
          to ensure your account
          remains secure.
        </div>

        {/* CURRENT PASSWORD */}
        <div className="settings-field">

          <label>
            Current Password
          </label>

          <input
            type="password"
            className="settings-input"
            value={form.old_password}
            onChange={(e) =>
              setForm({
                ...form,
                old_password:
                  e.target.value,
              })
            }
          />

        </div>

        {/* NEW PASSWORD */}
        <div className="settings-field">

          <label>
            New Password
          </label>

          <input
            type="password"
            className="settings-input"
            value={form.new_password}
            onChange={(e) =>
              setForm({
                ...form,
                new_password:
                  e.target.value,
              })
            }
          />

        </div>

        {/* CONFIRM PASSWORD */}
        <div className="settings-field">

          <label>
            Confirm Password
          </label>

          <input
            type="password"
            className="settings-input"
            value={form.confirm_password}
            onChange={(e) =>
              setForm({
                ...form,
                confirm_password:
                  e.target.value,
              })
            }
          />

        </div>

        {/* BUTTON */}
        <button
          className="primary-btn"
          onClick={handleSubmit}
        >

          {loadingLocal
            ? "Updating..."
            : "Update Password"}

        </button>

      </div>

    </AccountLayout>
  );
}