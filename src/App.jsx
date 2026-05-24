// import {
//   useEffect,
// } from "react";

// import {
//   useDispatch,
// } from "react-redux";

// import AppRoutes from "./routes/AppRoute";

// import api from "./services/api";

// import {
//   loadUser,
// } from "./features/auth/authSlice";

// function App() {

//   const dispatch =
//     useDispatch();

//   // ==========================================
//   // APP INITIALIZATION
//   // ==========================================

//   useEffect(() => {

//     const initApp =
//       async () => {

//         try {

//           // ==========================================
//           // GET CSRF TOKEN
//           // ==========================================

//           await api.get(
//             "users/csrf/"
//           );

//           // ==========================================
//           // RESTORE USER SESSION
//           // ==========================================

//           dispatch(
//             loadUser()
//           );

//         } catch (err) {

//           console.log(
//             "App initialization failed"
//           );

//         }
//       };

//     initApp();

//   }, [dispatch]);

//   return <AppRoutes />;
// }

// export default App;




// src/App.jsx

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

  // ==========================================
  // APP INITIALIZATION
  // ==========================================

  useEffect(() => {

    const initApp =
      async () => {

        try {

          // ==========================================
          // GET CSRF TOKEN
          // ==========================================

          await api.get(
            "users/csrf/"
          );

          // ==========================================
          // RESTORE USER SESSION
          // ==========================================

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