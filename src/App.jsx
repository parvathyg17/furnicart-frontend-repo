import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import AppRoutes from "./routes/AppRoute";

import api from "./services/api";

import { loadUser } from "./features/auth/authSlice";

import { loadCartCount } from "./features/cart/cartSlice";
import { loadWishlistCount } from "./features/wishlist/wishlistSlice";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const initApp = async () => {
      try {
        await api.get("users/csrf/");
        await dispatch(loadUser());
      } catch (err) {
        console.log("App initialization failed");
      }
    };

    initApp();
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadCartCount());
      dispatch(loadWishlistCount());
    }
  }, [isAuthenticated, dispatch]);

  return <AppRoutes />;
}

export default App;
