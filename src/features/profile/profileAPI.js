import api from "../../services/api";


export const getProfileAPI = async () => {
  const res = await api.get("profile/");
  return res.data;
};


export const updateProfileAPI = async (data) => {
  const res = await api.put("profile/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};


export const emailRequestAPI = (data) =>
  api.post("profile/email-change/request/", data).then(res => res.data);


export const emailVerifyAPI = (data) =>
  api.post("profile/email-change/verify/", data).then(res => res.data);

