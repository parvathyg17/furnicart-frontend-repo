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
  // RESTORE SESSION
  // ==========================================

  useEffect(() => {

    // ONLY RUN ON FIRST LOAD
    if (!admin) {

      dispatch(
        adminMe()
      );

    }

  }, [dispatch, admin]);



  if (
    checkingAuth ||
    (!admin && !isAuthenticated)
  ) {

    return (
      <div>
        Loading...
      </div>
    );
  }



  if (!isAuthenticated) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  

  return children;
}