import axios from "axios";


export const forceLogout =
  async () => {

    try {

      await axios.post(

        "http://localhost:8000/api/users/logout/",

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

    window.location.href =
      "/login";
};