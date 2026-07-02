import axios from "axios";

import { getCookie } from "../utils/getCookie";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const csrfToken = getCookie("csrftoken");
  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

const PUBLIC_ROUTES = [
  "users/login/",
  "users/signup/",
  "users/verify-otp/",
  "users/resend-otp/",
  "users/forgot-password/",
  "users/reset-password/",
  "users/token/refresh/",
  "users/csrf/",
  "users/google-login/",
  "users/logout/",
];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";

    const isPublicRoute = PUBLIC_ROUTES.some((route) => url.includes(route));
    if (isPublicRoute) {
      return Promise.reject(error);
    }

    const detail = error.response?.data?.detail;
    const errMsg = error.response?.data?.error;
    const isBlocked =
      detail === "Your account is blocked" ||
      errMsg === "Your account is blocked";

    if (isBlocked) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !url.includes("users/token/refresh/")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/users/token/refresh/`,
          {},
          { withCredentials: true },
        );
        processQueue();
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
