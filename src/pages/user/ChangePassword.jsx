

import "../../styles/account.css";

import { useState } from "react";

import { useDispatch, useSelector }
from "react-redux";

import {
  changePassword,
} from "../../features/auth/authSlice";

import AccountLayout
from "../../components/user/AccountLayout";

export default function ChangePasswordPage() {

  const dispatch = useDispatch();

  const {
    loading,
    error,
    success,
  } = useSelector(
    (state) => state.auth
  );

  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleSubmit = async () => {

    if (
      form.new_password !==
      form.confirm_password
    ) {

      return alert(
        "Passwords do not match"
      );

    }

    await dispatch(
      changePassword({
        old_password:
          form.old_password,

        new_password:
          form.new_password,
      })
    );

  };

  const getErrorMessage = () => {

    if (!error) return null;

    if (typeof error === "string") {
      return error;
    }

    if (error.error) {
      return error.error;
    }

    const firstKey =
      Object.keys(error)[0];

    if (
      Array.isArray(error[firstKey])
    ) {
      return error[firstKey][0];
    }

    return error[firstKey];
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

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {error && (
          <div className="error-message">
            {getErrorMessage()}
          </div>
        )}

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

        <button
          className="primary-btn"
          onClick={handleSubmit}
        >
          {loading
            ? "Updating..."
            : "Update Password"}
        </button>

      </div>

    </AccountLayout>
  );
}

