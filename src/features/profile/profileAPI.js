import api from "../../services/api";

// GET PROFILE
export const getProfileAPI = async () => {
  const res = await api.get("profile/");
  return res.data;
};

// UPDATE PROFILE
export const updateProfileAPI = async (data) => {
  const res = await api.put("profile/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// EMAIL OTP REQUEST
export const emailRequestAPI = (data) =>
  api.post("profile/email-change/request/", data).then(res => res.data);

// EMAIL VERIFY
export const emailVerifyAPI = (data) =>
  api.post("profile/email-change/verify/", data).then(res => res.data);

