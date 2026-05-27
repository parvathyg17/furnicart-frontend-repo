import {
  useEffect,
} from "react";

import {
  useDispatch,
} from "react-redux";

import AppRoutes
from "./routes/AppRoute";

import api
from "./services/api";

import {
  loadUser,
} from "./features/auth/authSlice";

function App() {

  const dispatch =
    useDispatch();

  

  useEffect(() => {

    const initApp =
      async () => {

        try {

          
          await api.get(
            "users/csrf/"
          );

        

          await dispatch(
            loadUser()
          );

        } catch (err) {

          console.log(
            "App initialization failed"
          );
        }
      };

    initApp();

  }, [dispatch]);

  return <AppRoutes />;
}

export default App;