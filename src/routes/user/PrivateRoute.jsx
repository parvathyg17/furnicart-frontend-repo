// ==========================================
// src/routes/PrivateRoute.jsx
// ==========================================

import {
  useSelector,
} from "react-redux";

import {
  Navigate,
} from "react-router-dom";


export default function PrivateRoute({
  children,
}) {

  const {
    isAuthenticated,
    checkingAuth,
  } = useSelector(
    (state) => state.auth
  );

  // ==========================================
  // WAIT FOR AUTH CHECK
  // ==========================================

  if (checkingAuth) {

    return (
      <div>
        Loading...
      </div>
    );

  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!isAuthenticated) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }

  // ==========================================
  // ALLOWED
  // ==========================================

  return children;
}