import "../../styles/account.css";

import { useEffect } from "react";

import {
  Mail,
  Phone,
  Calendar,
  User,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import { getProfile }
from "../../features/profile/profileSlice";

import { useNavigate }
from "react-router-dom";

import AccountLayout
from "../../components/user/AccountLayout";

export default function ProfilePage() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { profile } = useSelector(
    (state) => state.profile
  );

  const IMAGE_URL = "http://127.0.0.1:8000";

  useEffect(() => {

  if (!profile) {

    dispatch(getProfile());

  }

}, [
  dispatch,
  profile,
]);

  if (!profile) {
    return (
      <div className="profile-loading">
        Loading...
      </div>
    );
  }

  return (
    <AccountLayout>

      <div className="profile-wrapper">

        <div className="profile-banner"></div>

        <div className="profile-header">

          <div className="profile-left">

            <div className="profile-avatar">

              {profile.profile_image ? (
                <img
                  src={`${IMAGE_URL}${profile.profile_image}`}
                  alt=""
                />
              ) : (
                <div className="avatar-placeholder">
                  {profile.username?.charAt(0)}
                </div>
              )}

            </div>

            <div>

              <h1>
                {profile.username}
              </h1>

              <p>
                Welcome to your account
              </p>

            </div>

          </div>

          <button
            className="primary-btn"
            onClick={() =>
              navigate("/profile/edit")
            }
          >
            Edit Profile
          </button>

        </div>

        <div className="section-divider"></div>

        <div className="section-title">
          Personal Information
        </div>

        <div className="info-grid">

          <div className="info-card">

            <div className="info-label">
              <User size={18} />
              Username
            </div>

            <div className="info-value">
              {profile.username}
            </div>

          </div>

          <div className="info-card">

            <div className="info-label">
              <Mail size={18} />
              Email Address
            </div>

            <div className="info-value-row">

              <div className="info-value">
                {profile.email}
              </div>

              <span
                className="edit-link"
                onClick={() =>
                  navigate("/profile/email/edit")
                }
              >
                Edit
              </span>

            </div>

          </div>

          <div className="info-card">

            <div className="info-label">
              <Phone size={18} />
              Phone Number
            </div>

            <div className="info-value">
              {profile.phone || "Not Added"}
            </div>

          </div>

          <div className="info-card">

            <div className="info-label">
              <Calendar size={18} />
              Date Of Birth
            </div>

            <div className="info-value">
              {profile.date_of_birth ||
                "Not Added"}
            </div>

          </div>

        </div>

      </div>

    </AccountLayout>
  );
}