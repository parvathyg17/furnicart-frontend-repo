// import { useEffect } from "react";

// import {
//   useDispatch,
//   useSelector,
// } from "react-redux";

// import {
//   Navigate,
// } from "react-router-dom";

// import {
//   adminMe,
// } from "../../features/admin/adminSlice";

// export default function AdminPrivateRoute({
//   children,
// }) {

//   const dispatch = useDispatch();

//   const {
//     admin,
//     isAuthenticated,
//     checkingAuth,
//   } = useSelector(
//     (state) => state.admin
//   );

//   useEffect(() => {

//     if (!admin && !isAuthenticated) {

//       dispatch(adminMe());

//     }

//   }, [dispatch, admin, isAuthenticated]);

//   if (checkingAuth) {

//     return <div>Loading...</div>;

//   }

//   if (!isAuthenticated) {

//     return (
//       <Navigate
//         to="/admin/login"
//         replace
//       />
//     );
//   }

//   return children;
// }

import {
  useEffect,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Navigate,
} from "react-router-dom";

import {
  adminMe,
} from "../../features/admin/adminSlice";

export default function AdminPrivateRoute({
  children,
}) {

  const dispatch =
    useDispatch();

  const {
    admin,
    isAuthenticated,
    checkingAuth,
  } = useSelector(
    (state) => state.admin
  );

  // ==========================================
  // RESTORE ADMIN SESSION
  // ==========================================

  useEffect(() => {

    if (
      !admin &&
      !isAuthenticated
    ) {

      dispatch(
        adminMe()
      );
    }

  }, [
    dispatch,
    admin,
    isAuthenticated,
  ]);

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
  // NOT AUTHORIZED
  // ==========================================

  if (!isAuthenticated) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  // ==========================================
  // ALLOW ACCESS
  // ==========================================

  return children;
}