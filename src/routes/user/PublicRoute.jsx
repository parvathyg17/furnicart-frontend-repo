// routes/PublicRoute.jsx

import {
  useSelector,
} from "react-redux";

import {
  Navigate,
} from "react-router-dom";

export default function PublicRoute({
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

  if (isAuthenticated) {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}