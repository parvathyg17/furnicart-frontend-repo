// import {
//   useSelector,
// } from "react-redux";

// import {
//   Navigate,
// } from "react-router-dom";

// export default function AdminPublicRoute({
//   children,
// }) {

//   const {
//     isAuthenticated,
//     checkingAuth,
//   } = useSelector(
//     (state) => state.admin
//   );

//   // ==========================================
//   // LOADING
//   // ==========================================

//   if (checkingAuth) {

//     return (
//       <div>
//         Loading...
//       </div>
//     );
//   }

//   // ==========================================
//   // ALREADY LOGGED IN
//   // ==========================================

//   if (isAuthenticated) {

//     return (
//       <Navigate
//         to="/admin/dashboard"
//         replace
//       />
//     );
//   }

//   // ==========================================
//   // ALLOW ACCESS
//   // ==========================================

//   return children;
// }

import {
  useSelector,
} from "react-redux";

import {
  Navigate,
} from "react-router-dom";

export default function AdminPublicRoute({
  children,
}) {

  const {
    isAuthenticated,
    checkingAuth,
  } = useSelector(
    (state) => state.admin
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (checkingAuth) {

    return (
      <div>
        Loading...
      </div>
    );
  }

  // ==========================================
  // ALREADY LOGGED IN
  // ==========================================

  if (isAuthenticated) {

    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }

  // ==========================================
  // ALLOW ACCESS
  // ==========================================

  return children;
}