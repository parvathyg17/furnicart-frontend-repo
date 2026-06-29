import api from "../../services/api";



export const signupAPI = async (data) => {
  const response = await api.post("users/signup/", data);
  return response.data;
};



export const verifyOTPAPI = async (data) => {
  const response = await api.post("users/verify-otp/", data);
  return response.data;
};


export const resendOTPAPI = async (data) => {
  const response = await api.post("users/resend-otp/", data);
  return response.data;
};



export const loginUserAPI = async (data) => {
  const response = await api.post("users/login/", data);
  return response.data;
};



export const getMeAPI = async () => {
  const response = await api.get("users/me/");
  return response.data;
};



export const forgotPasswordAPI = async (data) => {
  const response = await api.post("users/forgot-password/", data);
  return response.data;
};



export const resetPasswordAPI = async (data) => {
  const response = await api.post("users/reset-password/", data);
  return response.data;
};



export const logoutAPI = async () => {
  const response = await api.post("users/logout/");
  return response.data;
};


export const googleLoginAPI = async (payload) => {

  const body =
    typeof payload === "string"
      ? { token: payload }
      : payload;

  const response = await api.post(
    "users/google-login/",
    body,
  );

  return response.data;
};



export const changePasswordAPI = async (data) => {
  console.log("CHANGE PASSWORD API CALLED");

  const response = await api.post(
    "users/change-password/",
    data
  );

  return response.data;
};