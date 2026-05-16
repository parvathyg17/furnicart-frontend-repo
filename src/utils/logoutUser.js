import axios from "axios";

let isLoggingOut = false;

export const forceLogout =
  async () => {

    if (isLoggingOut) return;

    isLoggingOut = true;

    try {

      await axios.post(

        `${import.meta.env.VITE_API_URL}/api/users/logout/`,

        {},

        {
          withCredentials: true,
        }
      );

    } catch (err) {

      // ignore logout errors
    }

    localStorage.clear();

    sessionStorage.clear();

    if (
      window.location.pathname.startsWith("/admin")
    ) {

      window.location.href =
        "/admin/login";

    } else {

      window.location.href =
        "/login";
    }
};