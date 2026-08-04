import { useEffect } from "react";

import { useDispatch } from "react-redux";

import AppRoutes from "./routes/AppRoute";

import api from "./services/api";

import { loadUser } from "./features/auth/authSlice";

import { loadCartCount } from "./features/cart/cartSlice";
import { loadWishlistCount } from "./features/wishlist/wishlistSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initApp = async () => {
      try {
        await api.get("users/csrf/");

        const authResult = await dispatch(loadUser());

        if (loadUser.fulfilled.match(authResult) && authResult.payload) {
          await dispatch(loadCartCount());
          await dispatch(loadWishlistCount());
        }
      } catch (err) {
        console.log("App initialization failed");
      }
    };

    initApp();
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;
