// routes/PrivateRoute.jsx

import { useEffect } from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import { Navigate } from "react-router-dom";

import { loadUser } from "../../features/auth/authSlice";

export default function PrivateRoute({
  children,
}) {

  const dispatch = useDispatch();

  const {
    user,
    isAuthenticated,
    checkingAuth,
  } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {

    if (!user && !isAuthenticated) {

      dispatch(loadUser());

    }

  }, [dispatch, user, isAuthenticated]);

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