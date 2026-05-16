import {
  useEffect,
} from "react";

import {
  useDispatch,
} from "react-redux";

import AppRoutes from "./routes/AppRoute";

import api from "./services/api";

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

          dispatch(
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





// import {
//   useSelector,
//   useDispatch,
// } from "react-redux";

// import {
//   useEffect,
// } from "react";

// import AppRoutes from "./routes/AppRoute";

// import api from "./services/api";

// import {
//   loadUser,
// } from "./features/auth/authSlice";


// function App() {

//   const dispatch =
//     useDispatch();

//   const {
//     checkingAuth,
//   } = useSelector(
//     (state) => state.auth
//   );


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
//           // CHECK IF REFRESH TOKEN EXISTS
//           // ==========================================

//           const hasRefreshToken =
//             document.cookie.includes(
//               "refresh_token"
//             );

//           // ==========================================
//           // RESTORE USER SESSION
//           // ==========================================

//           if (hasRefreshToken) {

//             await dispatch(
//               loadUser()
//             );
//           }

//         } catch (err) {

//           console.log(
//             "App initialization failed"
//           );

//         }
//       };

//     initApp();

//   }, [dispatch]);


//   // ==========================================
//   // LOADING SCREEN
//   // ==========================================

//   if (checkingAuth) {

//     return (

//       <div className="app-loading">

//         Loading...

//       </div>
//     );
//   }


//   return <AppRoutes />;
// }

// export default App;