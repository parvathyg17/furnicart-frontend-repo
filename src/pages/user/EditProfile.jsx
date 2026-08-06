import "../../styles/account.css";

import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import { useDispatch, useSelector } from "react-redux";

import { getProfile, updateProfile } from "../../features/profile/profileSlice";

import { loadUser } from "../../features/auth/authSlice";

import AccountLayout from "../../components/user/AccountLayout";

import { ArrowLeft } from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function EditProfilePage() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { profile } = useSelector((state) => state.profile);

  // ==========================================
  // LOCAL STATES
  // ==========================================

  const [loadingLocal, setLoadingLocal] = useState(false);

  const [form, setForm] = useState({
    phone: "",
    date_of_birth: "",
    profile_image: null,
  });

  // ==========================================
  // FETCH PROFILE
  // ==========================================

  useEffect(() => {
    if (!profile) {
      dispatch(getProfile());
    }
  }, [dispatch, profile]);

  // ==========================================
  // SET FORM DATA
  // ==========================================

  useEffect(() => {
    if (profile) {
      setForm({
        phone: profile.phone || "",

        date_of_birth: profile.date_of_birth || "",

        profile_image: null,
      });
    }
  }, [profile]);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    setForm({
      ...form,

      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // FILE CHANGE
  // ==========================================

  const handleFile = (e) => {
    const file = e.target.files[0];

    if (file) {
      // IMAGE ONLY
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");

        return;
      }

      // MAX 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");

        return;
      }
    }

    setForm({
      ...form,
      profile_image: file,
    });
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const saveProfile = async () => {
    // PHONE VALIDATION
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) {
      toast.error("Phone number must be 10 digits");

      return;
    }

    try {
      setLoadingLocal(true);

      const fd = new FormData();

      fd.append("phone", form.phone);

      fd.append("date_of_birth", form.date_of_birth);

      if (form.profile_image) {
        fd.append("profile_image", form.profile_image);
      }

      await dispatch(updateProfile(fd)).unwrap();

      await dispatch(getProfile()).unwrap();

      await dispatch(
        loadUser({
          silent: true,
        }),
      ).unwrap();

      toast.success("Profile updated successfully");

      navigate("/profile");
    } catch (err) {
      toast.error(
        err?.phone?.[0] ||
          err?.date_of_birth?.[0] ||
          err?.profile_image?.[0] ||
          err?.error ||
          err?.detail ||
          "Failed to update profile",
      );
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <AccountLayout>
      <div className="back-btn" onClick={() => navigate("/profile")}>
        <ArrowLeft size={18} />
        Back To Profile
      </div>

      <div className="settings-card">
        <div className="settings-title">Edit Profile</div>

        <div className="settings-grid">
          {/* PHONE */}
          <div className="settings-field">
            <label>Phone</label>

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="settings-input"
              placeholder="Enter phone number"
            />
          </div>

         
          <div className="settings-field">
            <label>Date Of Birth</label>

            <input
              type="date"
              name="date_of_birth"
              value={form.date_of_birth}
              onChange={handleChange}
              className="settings-input"
            />
          </div>

         
          <div className="settings-field full-width">
            <label>Profile Image</label>

            <input
              type="file"
              onChange={handleFile}
              className="settings-input"
              accept="image/*"
            />
          </div>
        </div>

        
        <button className="primary-btn" onClick={saveProfile}>
          {loadingLocal ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </AccountLayout>
  );
}
