import { useEffect } from "react";

import { useDispatch } from "react-redux";

import { loadUser } from "./features/auth/authSlice";

import { adminMe } from "./features/admin/adminSlice";

import AppRoutes from "./routes/AppRoute";

function App() {

  const dispatch = useDispatch();

  useEffect(() => {

    dispatch(loadUser());

    dispatch(adminMe());

  }, [dispatch]);

  return <AppRoutes />;
}

export default App;