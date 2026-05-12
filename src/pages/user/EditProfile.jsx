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
  updateProfile,
} from "../../features/profile/profileSlice";

import AccountLayout from "../../components/user/AccountLayout";

import {
  ArrowLeft,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

export default function EditProfilePage() {

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

  const [form, setForm] =
    useState({
      phone: "",
      date_of_birth: "",
      profile_image: null,
    });

  useEffect(() => {

    dispatch(
      getProfile()
    );

  }, [dispatch]);

  useEffect(() => {

    if (profile) {

      setForm({
        phone:
          profile.phone || "",
        date_of_birth:
          profile.date_of_birth || "",
        profile_image: null,
      });

    }

  }, [profile]);

  const handleChange =
    (e) => {

      setForm({
        ...form,
        [e.target.name]:
          e.target.value,
      });

    };

  const handleFile =
    (e) => {

      const file =
        e.target.files[0];

      if (file) {

        if (
          !file.type.startsWith(
            "image/"
          )
        ) {

          toast.error(
            "Only image files are allowed"
          );

          return;
        }

        if (
          file.size >
          5 * 1024 * 1024
        ) {

          toast.error(
            "Image size must be less than 5MB"
          );

          return;
        }

      }

      setForm({
        ...form,
        profile_image: file,
      });

    };

  const saveProfile =
    async () => {

      if (
        form.phone &&
        !/^[0-9]{10}$/.test(
          form.phone
        )
      ) {

        toast.error(
          "Phone number must be 10 digits"
        );

        return;
      }

      if (
        form.date_of_birth
      ) {

        const today =
          new Date();

        const dob =
          new Date(
            form.date_of_birth
          );

        if (dob > today) {

          toast.error(
            "Date of birth cannot be in the future"
          );

          return;
        }

      }

      const fd =
        new FormData();

      fd.append(
        "phone",
        form.phone
      );

      fd.append(
        "date_of_birth",
        form.date_of_birth
      );

      if (
        form.profile_image
      ) {

        fd.append(
          "profile_image",
          form.profile_image
        );

      }

      const res =
        await dispatch(
          updateProfile(fd)
        );

      if (res.error) {

        const backendError =

          res.payload?.phone?.[0] ||

          res.payload?.date_of_birth?.[0] ||

          res.payload?.profile_image?.[0] ||

          res.payload?.error ||

          res.payload?.detail ||

          "Failed to update profile";

        toast.error(
          backendError
        );

        return;
      }

      toast.success(
        "Profile updated successfully"
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
          Edit Profile
        </div>

        <div className="settings-grid">

          <div className="settings-field">

            <label>
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={
                handleChange
              }
              className="settings-input"
              placeholder="Enter phone number"
            />

          </div>

          <div className="settings-field">

            <label>
              Date Of Birth
            </label>

            <input
              type="date"
              name="date_of_birth"
              value={
                form.date_of_birth
              }
              onChange={
                handleChange
              }
              className="settings-input"
            />

          </div>

          <div className="settings-field full-width">

            <label>
              Profile Image
            </label>

            <input
              type="file"
              onChange={
                handleFile
              }
              className="settings-input"
            />

          </div>

        </div>

        <button
          className="primary-btn"
          onClick={
            saveProfile
          }
        >

          {loading
            ? "Saving..."
            : "Save Changes"}

        </button>

      </div>

    </AccountLayout>
  );
}