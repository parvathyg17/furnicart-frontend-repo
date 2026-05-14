// App.jsx

import { useEffect } from "react";

import AppRoutes from "./routes/AppRoute";

import api from "./services/api";

function App() {

  useEffect(() => {

    const initApp = async () => {

      try {

        await api.get("users/csrf/");

      } catch (err) {

        console.log("CSRF failed");

      }
    };

    initApp();

  }, []);

  return <AppRoutes />;
}

export default App;