

import { useSelector } from "react-redux";

import { Navigate } from "react-router-dom";

export default function AdminPublicRoute({
  children,
}) {

  const {
    isAuthenticated,
    checkingAuth,
  } = useSelector(
    (state) => state.admin
  );

  

  if (checkingAuth) {
    return <div>Loading...</div>;
  }

  

  if (isAuthenticated) {
    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }

  return children;
}