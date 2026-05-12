import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true,
});


// ==========================
// AUTO REFRESH TOKEN LOGIC
// ==========================

api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    // access token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;

      try {

        // refresh access token
        await axios.post(
          "http://localhost:8000/api/users/token/refresh/",
          {},
          {
            withCredentials: true,
          }
        );

        // retry original request
        return api(originalRequest);

      } catch (refreshError) {

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;