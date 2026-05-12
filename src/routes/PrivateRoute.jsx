

import { useSelector } from "react-redux";

import { Navigate } from "react-router-dom";

export default function PrivateRoute({
  children,
}) {

  const {
    isAuthenticated,
    checkingAuth,
  } = useSelector(
    (state) => state.auth
  );



  if (checkingAuth) {
    return <div>Loading...</div>;
  }

  

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}