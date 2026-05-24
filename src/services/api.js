import axios from "axios";

import { getCookie }
from "../utils/getCookie";

const api = axios.create({

  baseURL:
    `${import.meta.env.VITE_API_URL}/api/`,

  withCredentials: true,
});

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================

api.interceptors.request.use(

  (config) => {

    const csrfToken =
      getCookie(
        "csrftoken"
      );

    if (csrfToken) {

      config.headers[
        "X-CSRFToken"
      ] = csrfToken;
    }

    return config;
  }
);

// ==========================================
// REFRESH CONTROL
// ==========================================

let isRefreshing =
  false;

let failedQueue = [];

const processQueue = (
  error = null
) => {

  failedQueue.forEach(
    (promise) => {

      if (error) {

        promise.reject(
          error
        );

      } else {

        promise.resolve();
      }
    }
  );

  failedQueue = [];
};

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest =
      error.config;

    const url =
      originalRequest?.url || "";

    // ==========================================
    // PUBLIC ROUTES
    // ==========================================

    const publicRoutes = [

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

    const isPublicRoute =
      publicRoutes.some(
        (route) =>
          url.includes(route)
      );

    if (isPublicRoute) {

      return Promise.reject(error);
    }

    // ==========================================
    // ACCESS TOKEN EXPIRED
    // ==========================================

    if (

      error.response?.status ===
        401 &&

      !originalRequest._retry &&

      !url.includes(
        "users/token/refresh/"
      )

    ) {

      originalRequest._retry =
        true;

      // ==========================================
      // WAIT IF REFRESHING
      // ==========================================

      if (isRefreshing) {

        return new Promise(

          (
            resolve,
            reject
          ) => {

            failedQueue.push({

              resolve: () => {

                resolve(
                  api(
                    originalRequest
                  )
                );
              },

              reject,
            });
          }
        );
      }

      isRefreshing =
        true;

      try {

        await axios.post(

          `${import.meta.env.VITE_API_URL}/api/users/token/refresh/`,

          {},

          {
            withCredentials: true,
          }
        );

        processQueue();

        return api(
          originalRequest
        );

      } catch (refreshError) {

        processQueue(
          refreshError
        );

        // JUST REJECT
        // NO LOGOUT
        // NO REDIRECT

        return Promise.reject(
          refreshError
        );

      } finally {

        isRefreshing =
          false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;


// import axios from "axios";

// import { forceLogout }
// from "../utils/logoutUser";

// import { getCookie }
// from "../utils/getCookie";

// const api = axios.create({

//   baseURL:
//     `${import.meta.env.VITE_API_URL}/api/`,

//   withCredentials: true,
// });

// // ==========================================
// // REQUEST INTERCEPTOR
// // ==========================================

// api.interceptors.request.use(

//   (config) => {

//     const csrfToken =
//       getCookie(
//         "csrftoken"
//       );

//     if (csrfToken) {

//       config.headers[
//         "X-CSRFToken"
//       ] = csrfToken;
//     }

//     return config;
//   }
// );

// // ==========================================
// // RESPONSE INTERCEPTOR
// // ==========================================

// api.interceptors.response.use(

//   (response) => response,

//   async (error) => {

//     const originalRequest =
//       error.config;

//     const url =
//       originalRequest?.url || "";

//     // ==========================================
//     // ACCOUNT BLOCKED
//     // ==========================================

//     if (

//       error.response?.data?.detail ===
//         "Account blocked" ||

//       error.response?.data?.error ===
//         "User is blocked"

//     ) {

//       await forceLogout();

//       return Promise.reject(error);
//     }

//     // ==========================================
//     // PUBLIC ROUTES
//     // DO NOT REFRESH
//     // ==========================================

//     const publicRoutes = [

//       "users/login/",

//       "users/signup/",

//       "users/verify-otp/",

//       "users/resend-otp/",

//       "users/forgot-password/",

//       "users/reset-password/",

//       "users/token/refresh/",

//       "users/csrf/",

//       "users/me/",

//       "users/google-login/",

//       "users/logout/",
//     ];

//     const isPublicRoute =
//       publicRoutes.some(
//         (route) =>
//           url.includes(route)
//       );

//     if (isPublicRoute) {

//       return Promise.reject(error);
//     }

//     // ==========================================
//     // ADMIN ROUTES
//     // DO NOT USE USER REFRESH
//     // ==========================================

//     if (
//       url.startsWith("admin/")
//     ) {

//       return Promise.reject(error);
//     }

//     // ==========================================
//     // ACCESS TOKEN EXPIRED
//     // ==========================================

//     if (

//       error.response?.status ===
//         401 &&

//       !originalRequest._retry

//     ) {

//       originalRequest._retry =
//         true;

//       try {

//         await axios.post(

//           `${import.meta.env.VITE_API_URL}/api/users/token/refresh/`,

//           {},

//           {
//             withCredentials: true,
//           }
//         );

//         // RETRY REQUEST

//         return api(
//           originalRequest
//         );

//       } catch (refreshError) {

//         await forceLogout();

//         return Promise.reject(
//           refreshError
//         );
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;



// import axios from "axios";

// import { forceLogout }
// from "../utils/logoutUser";

// import { getCookie }
// from "../utils/getCookie";

// const api = axios.create({

//   baseURL:
//     `${import.meta.env.VITE_API_URL}/api/`,

//   withCredentials: true,
// });

// // ==========================================
// // REQUEST INTERCEPTOR
// // ==========================================

// api.interceptors.request.use(

//   (config) => {

//     const csrfToken =
//       getCookie(
//         "csrftoken"
//       );

//     if (csrfToken) {

//       config.headers[
//         "X-CSRFToken"
//       ] = csrfToken;
//     }

//     return config;
//   }
// );

// // ==========================================
// // RESPONSE INTERCEPTOR
// // ==========================================

// api.interceptors.response.use(

//   (response) => response,

//   async (error) => {

//     const originalRequest =
//       error.config;

//     const url =
//       originalRequest?.url || "";

//     // ==========================================
//     // ACCOUNT BLOCKED
//     // ==========================================

//     if (

//       error.response?.data?.detail ===
//         "Account blocked" ||

//       error.response?.data?.error ===
//         "User is blocked"

//     ) {

//       await forceLogout();

//       return Promise.reject(error);
//     }

//     // ==========================================
//     // PUBLIC ROUTES
//     // DO NOT REFRESH
//     // ==========================================

//     const publicRoutes = [

//       "users/login/",

//       "users/signup/",

//       "users/verify-otp/",

//       "users/resend-otp/",

//       "users/forgot-password/",

//       "users/reset-password/",

//       "users/token/refresh/",

//       "users/csrf/",

//       "users/me/",

//       "users/google-login/",

//       "users/logout/",
//     ];

//     const isPublicRoute =
//       publicRoutes.some(
//         (route) =>
//           url.includes(route)
//       );

//     if (isPublicRoute) {

//       return Promise.reject(error);
//     }

//     // ==========================================
//     // ADMIN ROUTES
//     // DO NOT USE USER REFRESH
//     // ==========================================

//     if (
//       url.startsWith("admin/")
//     ) {

//       return Promise.reject(error);
//     }

//     // ==========================================
//     // ACCESS TOKEN EXPIRED
//     // ==========================================

//     if (

//       error.response?.status ===
//         401 &&

//       !originalRequest._retry

//     ) {

//       originalRequest._retry =
//         true;

//       try {

//         await axios.post(

//           `${import.meta.env.VITE_API_URL}/api/users/token/refresh/`,

//           {},

//           {
//             withCredentials: true,
//           }
//         );

//         // RETRY REQUEST

//         return api(
//           originalRequest
//         );

//       } catch (refreshError) {

//         await forceLogout();

//         return Promise.reject(
//           refreshError
//         );
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;