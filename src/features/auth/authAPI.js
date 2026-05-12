import api from "../../services/api";



export const signupAPI = async (data) => {
  const response = await api.post("users/signup/", data);
  return response.data;
};


// 🔐 Verify OTP
export const verifyOTPAPI = async (data) => {
  const response = await api.post("users/verify-otp/", data);
  return response.data;
};


// 🔁 Resend OTP
export const resendOTPAPI = async (data) => {
  const response = await api.post("users/resend-otp/", data);
  return response.data;
};


// 🔐 Login
export const loginUserAPI = async (data) => {
  const response = await api.post("users/login/", data);
  return response.data;
};


// 🔥 Load Current User
export const getMeAPI = async () => {
  const response = await api.get("users/me/");
  return response.data;
};


// 🔑 Forgot Password
export const forgotPasswordAPI = async (data) => {
  const response = await api.post("users/forgot-password/", data);
  return response.data;
};


// 🔒 Reset Password
export const resetPasswordAPI = async (data) => {
  const response = await api.post("users/reset-password/", data);
  return response.data;
};


// 🚪 Logout
export const logoutAPI = async () => {
  const response = await api.post("users/logout/");
  return response.data;
};

// 🔥 GOOGLE LOGIN
export const googleLoginAPI = async (token) => {

  const response = await api.post(
    "users/google-login/",
    {
      token,
    }
  );

  return response.data;
};


// 🔐 CHANGE PASSWORD
export const changePasswordAPI = async (data) => {

  const response = await api.post(
    "users/change-password/",
    data
  );

  return response.data;
};